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

$ini = read_ini();

$conData = find_current_con($ini);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    if ($conData) {

        $json = file_get_contents('php://input');
        $data = json_decode($json);

        $order_uuid = $data->orderId;
        if ($data->values && $data->offering) {

            $order = find_order_by_order_uuid($ini, $conData, $order_uuid);

            if ($order == null) {
                $order = create_order_with_order_uuid($ini, $conData, $order_uuid);
            }
            
            if ($order) {
                if (create_order_item_with_uuid($ini, $conData, $order->id, $data->values, $data->offering, $data->itemUUID)) {
                    http_response_code(201);
                } else {
                    http_response_code(500);
                }
            } else {
                http_response_code(500);
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

?>