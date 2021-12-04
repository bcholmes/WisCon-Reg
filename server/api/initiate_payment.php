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
// This function provides support for Stripe payments.

require_once('../vendor/autoload.php');

require_once("config.php");
require_once("db_common_functions.php");
$ini = read_ini();

$conData = find_current_con($ini);

function add_payment_intent_id_to_order($ini, $order, $payment_intent_id) {
    $db = mysqli_connect($ini['mysql']['host'], $ini['mysql']['user'], $ini['mysql']['password'], $ini['mysql']['db_name']);
    if (!$db) {
        return false;
    } else {
        $query = <<<EOD
 UPDATE reg_order
 SET 
        payment_intent_id = ?
 WHERE  id = ?
 EOD;

        mysqli_set_charset($db, "utf8");
        $stmt = mysqli_prepare($db, $query);
        mysqli_stmt_bind_param($stmt, "si", $payment_intent_id, $order->id);

        if ($stmt->execute()) {
            mysqli_stmt_close($stmt);
            mysqli_close($db);
            return true;
        } else {
            mysqli_close($db);
            return false;
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $json = file_get_contents('php://input');
    $data = json_decode($json);

    // Set your secret key. Remember to switch to your live secret key in production.
    // See your keys here: https://dashboard.stripe.com/apikeys
    \Stripe\Stripe::setApiKey(
        $ini['stripe']['secret_key']
    );

    if ($data && $data->amount && $data->orderId && $conData) {

        $order = find_order_by_order_uuid($ini, $conData, $data->orderId);
        if ($order && $order->status === 'IN_PROGRESS') {
            $payment_intent = null;
            if ($order->payment_intent_id) {
                $payment_intent = \Stripe\PaymentIntent::update($order->payment_intent_id, [
                    'amount' => $data->amount->amount * 100,
                    'currency' => $data->amount->currency,
                    'payment_method_types' => ['card'],
                    'metadata' => [
                        'orderId' => $order->id
                    ]
                ]);
            } else {
                $payment_intent = \Stripe\PaymentIntent::create([
                    'amount' => $data->amount->amount * 100,
                    'currency' => $data->amount->currency,
                    'payment_method_types' => ['card'],
                    'metadata' => [
                        'orderId' => $order->id
                    ]
                ]);
            }

            if ($order->payment_intent_id || add_payment_intent_id_to_order($ini, $order, $payment_intent->id)) {
                header('Content-type: application/json');
                $json_string = json_encode([ 'key' => $payment_intent->client_secret ]);
                echo $json_string;
            } else {
                http_response_code(500);
            }
        } else if ($order) {
            http_response_code(409);
        } else {
            http_response_code(400);
        }
    } else {
        http_response_code(400);
    }
} else if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
} else {
    http_response_code(405);
}

?>