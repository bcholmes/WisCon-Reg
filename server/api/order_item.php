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

require_once("config.php");
require_once("db_common_functions.php");


function count_availability($db, $conData, $offering) {
    $query = <<<EOD
    SELECT quantity_pool_id
    FROM reg_offering
    WHERE id = ?
    AND con_id = ?;
EOD;

    $stmt = mysqli_prepare($db, $query);
    mysqli_stmt_bind_param($stmt, "ii", $offering->id, $conData->id);
    mysqli_set_charset($db, "utf8");
    $pool_id = null;
    if (mysqli_stmt_execute($stmt)) {
        $result = mysqli_stmt_get_result($stmt);

        while ($row = mysqli_fetch_object($result)) {
            $pool_id = $row->quantity_pool_id;
        }
        mysqli_stmt_close($stmt);
    } else {
        throw new DatabaseSqlException("Could not execute query: $query");
    }


    $query = <<<EOD
    SELECT count(i.id) as current_count, p.quantity, p.id as pool_id
    FROM reg_order_item i, reg_order ord, reg_offering of, reg_quantity_pool p 
    WHERE i.offering_id = of.id 
    AND i.order_id = ord.id
    AND (ord.status in ('PAID', 'CHECKED_OUT') or (ord.status = 'IN_PROGRESS' and timestampdiff(SECOND, ord.last_modified_date, now()) < 600))
    AND of.quantity_pool_id = p.id 
    AND ord.con_id = ?
    AND of.quantity_pool_id = ?
    GROUP BY p.id, p.quantity;
EOD;

    $stmt = mysqli_prepare($db, $query);
    mysqli_stmt_bind_param($stmt, "ii", $conData->id, $pool_id);
    mysqli_set_charset($db, "utf8");
    $available = 0;
    if (mysqli_stmt_execute($stmt)) {
        $result = mysqli_stmt_get_result($stmt);

        while ($row = mysqli_fetch_object($result)) {
            $available = $row->quantity - $row->current_count;
        }
        mysqli_stmt_close($stmt);
        return $available;
    } else {
        throw new DatabaseSqlException("Could not execute query: $query");
    }
}

$ini = read_ini();
$db = connect_to_db($ini);
try {

    $conData = find_current_con_with_db($db);
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {

        if ($conData) {

            $json = file_get_contents('php://input');
            $data = json_decode($json);

            $order_uuid = $data->orderId;
            if ($data->values && $data->offering) {

                $order = find_order_by_order_uuid_with_db($db, $conData, $order_uuid);

                if ($order == null) {
                    $order = create_order_with_order_uuid($db, $conData, $order_uuid);
                }
                
                $available = count_availability($db, $conData, $data->offering);
                if ($available >= 1) {
                    create_order_item_with_uuid($db, $conData, $order->id, $data->values, $data->offering, $data->itemUUID);
                    http_response_code(201);
                } else {
                    http_response_code(409);
                }
            } else {
                http_response_code(400);
            }
        } else {
            http_response_code(500);
        }

    } else if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(201);
    } else {
        http_response_code(404);
    }
} finally {
    $db->close();
}
?>