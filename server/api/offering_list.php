<?php
// Copyright 2022 BC Holmes
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

require_once(__DIR__ . "/config.php");
require_once(__DIR__ . "/con_info.php");
require_once(__DIR__ . "/offering.php");
require_once(__DIR__ . "/db_common_functions.php");
require_once(__DIR__ . "/format_functions.php");

$ini = read_ini();
$db = connect_to_db($ini);
try {

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {

        $conData = ConInfo::findCurrentCon($db);
        $now = date("Y-m-d H:i:s");

        if ($now > $conData->regCloseTime) {
            header('Content-type: application/json');
            $result = array( "reg_closed" => true);
            echo json_encode($result);
        } else {
            $items = Offering::findAllByCon($db, $conData);

            if ($items != false && count($items) > 0) {
                header('Content-type: application/json');
                $result = array( "reg_closed" => false, "items" => Offering::asJsonList($items));
                $json_string = json_encode($result);
                echo $json_string;
            } else {
                header('Content-type: application/json');
                $result = array( "reg_closed" => true);
                echo json_encode($result);
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