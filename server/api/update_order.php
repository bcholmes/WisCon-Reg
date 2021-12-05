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

require_once('../vendor/autoload.php');

require_once("config.php");
require_once("db_common_functions.php");
require_once("email_functions.php");
require_once("email_composer.php");
require_once("format_functions.php");
require_once("jwt_functions.php");
require_once("zambia_functions.php");

function process_stripe_refund($ini, $order) {
    \Stripe\Stripe::setApiKey(
        $ini['stripe']['secret_key']
    );

    $re = \Stripe\Refund::create(['payment_intent' =>  $order->payment_intent_id ]);
    if ($re->status === 'succeeded') {
        return true;
    } else {
        error_log('Invalid response from Stripe: ' . $re->status);
        return false;
    }
}

function process_refund($ini, $db, $order) {
    if ($order->payment_method === 'CARD') {
        if (process_stripe_refund($ini, $order)) {
            mark_order_as_refunded($db, $order->id);
        }
    } else {
        mark_order_as_refunded($db, $order->id);
    }
}

function defer_order_to_later($db, $conData, $nextCon, $orderId) {
    mysqli_begin_transaction($db);
    try {
        remove_order_registrations($db, $conData, $orderId);

        $query = <<<EOD
        UPDATE reg_order 
        SET con_id = ?
    WHERE id = ?;
    EOD;

        $stmt = mysqli_prepare($db, $query);
        mysqli_stmt_bind_param($stmt, "ii", $nextCon->id, $orderId);

        if ($stmt->execute()) {
            mysqli_stmt_close($stmt);
        } else {
            throw new DatabaseSqlException("The Update could not be processed");
        }

        $query = <<<EOD
        UPDATE reg_program_link 
        SET con_id = ?
    WHERE order_item_id in (select id from reg_order_item where order_id = ?);
    EOD;

        $stmt = mysqli_prepare($db, $query);
        mysqli_stmt_bind_param($stmt, "ii", $nextCon->id, $orderId);

        if ($stmt->execute()) {
            mysqli_stmt_close($stmt);
        } else {
            throw new DatabaseSqlException("The Update could not be processed");
        }
        mysqli_commit($db);
    } catch (Exception $e) {
        mysqli_rollback($db);
        throw $e;
    }
}

function convert_to_donation($db, $donationType, $orderId) {
    $query = <<<EOD
        UPDATE reg_order_item 
        SET offering_id = ? 
    WHERE order_id = ? 
      AND offering_id NOT IN (select id from reg_offering where is_donation = 'Y');
    EOD;

    $stmt = mysqli_prepare($db, $query);
    mysqli_stmt_bind_param($stmt, "ii", $donationType, $orderId);

    if ($stmt->execute()) {
        mysqli_stmt_close($stmt);
    } else {
        throw new DatabaseSqlException("The Update could not be processed: $query");
    }
}

function send_marked_as_paid_email($ini, $db, $conData, $order) {
    $email_name = find_name_by_email_address($db, $conData, $order->confirmation_email);
    if (!$email_name) {
        $email_name = $order->confirmation_email;
    }
    $emailBody = <<<EOD
    <p>
        Hello $email_name,
    </p>
    <p>
        We just wanted to drop you a quick note to let you know that payment
        was received for your order (Order number <b>$order->id</b>). We've
        just updated our records, now.
    </p>
    <p>
        Thanks!<br />
        The System That Sends the Emails
    </p>
EOD;
    send_email($emailBody, 'Your ' . $conData->name . ' order has been processed', [$order->confirmation_email => $email_name],
        [$ini['email']['reg_email'] => 'Registration']);
}


$ini = read_ini();
$db = connect_to_db($ini);
try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && jwt_validate_token(jwt_from_header(), $ini['jwt']['key'], true)) {

        $conData = find_current_con_with_db($db);

        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if ($conData && $data['action'] && $data['orderId']) {

            $order = find_order_by_order_uuid_with_db($db, $conData, $data['orderId']);
            if ($order->status === 'CHECKED_OUT' || $order->status === 'PAID') {

                if ($data['action'] === 'MARK_AS_PAID') {
                    mark_order_as_paid($db, $order->id);
                    send_marked_as_paid_email($ini, $db, $conData, $order);
                } else if ($data['action'] === 'CANCEL' && $order->status !== 'PAID') {
                    mark_order_as_cancelled($db, $order->id);
                    remove_order_registrations($db, $conData, $order->id);
                } else if ($data['action'] === 'REFUND' && $order->status === 'PAID') {
                    process_refund($ini, $db, $order);
                    remove_order_registrations($db, $conData, $order->id);
                    http_response_code(201);
                } else if ($data['action'] === 'CONVERT_TO_DONATION' && $order->status === 'PAID' && $data['donationType']) {
                    convert_to_donation($db, $data['donationType'], $order->id);
                    remove_order_registrations($db, $conData, $order->id);
                    compose_email($ini, $db, $conData, $order->confirmation_email, $order->payment_method, $order, get_client_locale(), false, true);
                    http_response_code(201);
                } else if ($data['action'] === 'DEFER') {
                    $nextCon = find_next_con($db);
                    defer_order_to_later($db, $conData, $nextCon, $order->id);
                    http_response_code(201);
                } else {
                    http_response_code(400);
                }
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