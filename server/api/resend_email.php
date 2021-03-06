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
require_once("email_composer.php");
require_once("format_functions.php");
require_once("jwt_functions.php");

$locale = get_client_locale();
$ini = read_ini();
$db = connect_to_db($ini);
try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && jwt_validate_token(jwt_from_header(), $ini['jwt']['key'], 'Registration')) {

        $conData = find_current_con_with_db($db);

        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if ($conData && $data['orderId']) {
            $order = find_order_by_order_uuid_with_db($db, $conData, $data['orderId']);
            if ($order->status === 'CHECKED_OUT' || $order->status === 'PAID') {

                compose_email($ini, $db, $conData, $order->confirmation_email, $order->payment_method, $order, $locale, true);
            } else {
                http_response_code(409);
            }
        } else {
            http_response_code(400);
        }
    } else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        http_response_code(401);
    } else {
        http_response_code(405);
    }
} finally {
    $db->close();
}
?>