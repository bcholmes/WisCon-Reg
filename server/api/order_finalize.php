<?php
// Copyright (c) 2021 BC Holmes. All rights reserved. See copyright document for more details.
// This function supports order finalization functionality

require_once("config.php");
require_once("db_common_functions.php");

$ini = read_ini();

$conData = find_current_con($ini);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    if ($conData) {

        $json = file_get_contents('php://input');
        $data = json_decode($json);

        $order_uuid = $data->orderId;
        if ($order_uuid && $data->paymentMethod && $data->email) {

            $order = find_order_by_order_uuid($ini, $conData, $order_uuid);

            if ($order) {
                if (mark_order_as_finalized($ini, $order->id, $data->paymentMethod, $data->email)) {
                    http_response_code(201);
                } else {
                    http_response_code(400);
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