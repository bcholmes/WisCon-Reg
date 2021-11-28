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
// This function supports removing an item from an order

require_once("config.php");
require_once("db_common_functions.php");

function delete_order_item($db, $order, $order_item_uuid) {
    $query = <<<EOD
 DELETE from reg_order_item
  WHERE item_uuid = ?
    AND order_id = ?;
 EOD;

    $stmt = mysqli_prepare($db, $query);
    mysqli_stmt_bind_param($stmt, "si", $order_item_uuid, $order->id);

    if ($stmt->execute()) {
        mysqli_stmt_close($stmt);
        return true;
    } else {
        return false;
    }
}


$ini = read_ini();

$db = connect_to_db($ini);
try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {

        $conData = find_current_con_with_db($db);

        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        $order_uuid = array_key_exists('orderId', $data) ? $data['orderId'] : null;
        $order_item_uuid = array_key_exists('itemId', $data) ? $data['itemId'] : null;

        if ($conData && $order_uuid && $order_item_uuid) {

            $order = find_order_by_order_uuid_with_db($db, $conData, $order_uuid);
            if ($order->status === 'IN_PROGRESS') {
                delete_order_item($db, $order, $order_item_uuid);
                http_response_code(201);
            } else {
                http_response_code(409);
            }
        } else {
            http_response_code(400);
        }

    } else if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(201);
    } else {
        http_response_code(405);
    }
} finally {
    $db->close();
}
?>