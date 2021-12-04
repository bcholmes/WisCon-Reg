<?php
// Copyright 2021 BC Holmes
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//    http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// This function provides support for the initial offering list.

require_once("config.php");
require_once("db_common_functions.php");

$ini = read_ini();

function find_offerings($conData, $db) {
    $query = <<<EOD
 SELECT 
        o.id, o.title, o.minimum_price, o.currency, o.suggested_price, o.maximum_price,
        o.description, o.is_membership, o.add_prompts, o.emphasis, o.email_required, h.highlight_text, o.address_required, 
        o.age_required, o.is_donation
   FROM 
        reg_offering o 
  LEFT OUTER JOIN reg_offering_highlight h
     ON
        o.id = h.offering_id
  WHERE 
        o.start_time <= NOW()
    AND
        o.end_time >= NOW()
    AND
        o.con_id = ?
    ORDER BY
        o.sort_order, o.id, h.sort_order;
 EOD;

    $stmt = mysqli_prepare($db, $query);
    mysqli_stmt_bind_param($stmt, "i", $conData->id);
    mysqli_set_charset($db, "utf8");
    if (mysqli_stmt_execute($stmt)) {
        $result = mysqli_stmt_get_result($stmt);

        $items = array();
        $item = null;
        $highlight_list = null;
        while ($row = mysqli_fetch_object($result)) {
            if ($item == null || $item["id"] != $row->id) {
                if ($item) {
                    array_push($items, $item);
                }
                $item = array("id" => $row->id, 
                    "title" => $row->title, 
                    "highlights" => array(),
                    "currency" => $row->currency,
                    "suggestedPrice" => $row->suggested_price == null ? null : (double) $row->suggested_price, 
                    "description" => $row->description,
                    "minimumPrice" => $row->minimum_price == null ? null : (double) $row->minimum_price, 
                    "maximumPrice" => $row->maximum_price == null ? null : (double) $row->maximum_price,
                    "emailRequired" => $row->email_required,
                    "isMembership" => ("Y" == $row->is_membership ? true : false),
                    "emphasis" => ("Y" == $row->emphasis ? true : false),
                    "addPrompts" => ("Y" == $row->add_prompts ? true : false),
                    "addressRequired" => ("Y" == $row->address_required ? true : false),
                    "ageRequired" => ("Y" == $row->age_required ? true : false),
                    "isDonation" => ("Y" == $row->is_donation ? true : false),
                );
            }
            if ($row->highlight_text) {
                $highlight_list = $item["highlights"];
                array_push($highlight_list, $row->highlight_text);
                $item["highlights"] = $highlight_list;
            }
        }
        if ($item) {
            array_push($items, $item);
        }
        mysqli_stmt_close($stmt);
        return $items;
    }
}

$db = connect_to_db($ini);
try {

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {

        $conData = find_current_con($ini);
        $now = date("Y-m-d H:i:s");

        if ($now > $conData->con_end_date) {
            header('Content-type: application/json');
            $result = array( "reg_closed" => true);
            echo json_encode($result);
        } else {
            $items = find_offerings($conData, $db);

            if ($items != false) {
                header('Content-type: application/json');
                $result = array( "reg_closed" => false, "items" => $items);
                $json_string = json_encode($result);
                echo $json_string;
            } else {
                http_response_code(500);
            }
        }

    } else if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
    } else {
        http_response_code(405);
    }
} finally {
    $db->close();
}
?>