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
require_once("con_info.php");
require_once("offering.php");
require_once("db_common_functions.php");

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

                $con = ConInfo::findCurrentCon($db);
                $offering = Offering::findByConAndId($db, $con, $data->offering->id);

                if ($offering != null && $offering->hasRemainingQuantity()) {
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