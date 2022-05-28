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
require_once("authentication.php");
require_once("order.php");
require_once("planz.php");
require_once("stripe_helper.php");

/**
 * There are two reasons why we might not want to refund everything:
 * 
 * 1. We might have already done a partial refund. The refunded items have a non-null status.
 * 2. Some items might have been deferred to next year: those items should have a different
 *    
 */
function process_stripe_refund($ini, $db, $order) {
    $o = new Order($order);
    $amount = $o->sumActiveAmounts($db) * 100;

    // process partial refund
    $stripeHelper = new StripeHelper($ini);
    $stripeHelper->refundPartialAmount($o, $amount);
    return true;
}

function process_refund($ini, $db, $order) {
    if ($order->payment_method === 'CARD') {
        if (process_stripe_refund($ini, $db, $order)) {
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
        SET con_id = ?,
            last_modified_date = CURRENT_TIMESTAMP()
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
    mysqli_begin_transaction($db);
    try {
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

        update_last_modified_date_on_order($db, $orderId);
        mysqli_commit($db);
    } catch (Exception $e) {
        mysqli_rollback($db);
        throw $e;
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
    send_email($emailBody, 'Your ' . $conData->name . ' order has been processed', [$order->confirmation_email => $email_name]);
}

function filter_items_by_action($items, $action) {
    $result = array();
    foreach ($items as $item) {
        if ($item['action'] === $action) {
            $result[] = $item;
        }
    }
    return $result;
}

function select_only_ids($items) {
    $result = [];
    foreach ($items as $i) {
        $result[] = $i['id'];
    }
    return $result;
}

function process_line_by_line_items($ini, $db, $items, $order) {
    mysqli_begin_transaction($db);
    try {
        $o = new Order($order);

        // handle the refunded items
        $subList = filter_items_by_action($items, 'REFUND');
        if (count($subList) > 0) {
            $itemIds = select_only_ids($subList);
            $o->updateItemStatus($db, $itemIds, 'REFUNDED');
            PlanZ::removeMemberships($db, $o->id, $itemIds);

            if ($o->isCardPaymentMethod()) {
                // figure out refund amount
                $amount = $o->sumAmounts($db, $itemIds) * 100;

                // process partial refund
                $stripeHelper = new StripeHelper($ini);
                $stripeHelper->refundPartialAmount($o, $amount);
            }
        }

        // handle the deferred items
        $subList = filter_items_by_action($items, 'DEFER');
        if (count($subList) > 0) {
            $nextCon = find_next_con($db);
            $newOrder = $o->createDuplicateOrderForNextYear($db, $nextCon);
            $itemIds = select_only_ids($subList);
            $newOrder->moveItemsToOrder($db, $itemIds, $o);
            PlanZ::deferMembershipsToCon($db, $o->id, $nextCon, $itemIds);
        }

        // handle the cancelled items
        $subList = filter_items_by_action($items, 'CANCEL');
        if (count($subList) > 0) {
            $itemIds = select_only_ids($subList);
            $o->updateItemStatus($db, $itemIds, 'CANCELLED');
            PlanZ::removeMemberships($db, $o->id, $itemIds);
        }

        mysqli_commit($db);
    } catch (Exception $e) {
        mysqli_rollback($db);
        throw $e;
    }
}


$ini = read_ini();
$db = connect_to_db($ini);
try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && Authentication::isRegistration($ini)) {

        $conData = find_current_con_with_db($db);

        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if ($conData && $data['action'] && $data['orderId']) {

            $order = find_order_by_order_uuid_with_db($db, $conData, $data['orderId']);
            if ($order->status === 'CHECKED_OUT' || $order->status === 'PAID') {
                $nextCon = find_next_con($db);

                if ($data['action'] === 'MARK_AS_PAID' && array_key_exists('atDoorPaymentMethod', $data)) {
                    mark_order_as_paid($db, $order->id, $data['atDoorPaymentMethod']);
                    send_marked_as_paid_email($ini, $db, $conData, $order);
                } else if ($data['action'] === 'CANCEL' && $order->status !== 'PAID') {
                    mark_order_as_cancelled($db, $order->id);
                    PlanZ::deferMembershipsToCon($db, $order->id, $nextCon);
                    remove_order_registrations($db, $conData, $order->id);
                } else if ($data['action'] === 'REFUND' && $order->status === 'PAID') {
                    process_refund($ini, $db, $order);
                    remove_order_registrations($db, $conData, $order->id);
                    PlanZ::deferMembershipsToCon($db, $order->id, $nextCon);
                    http_response_code(201);
                } else if ($data['action'] === 'CONVERT_TO_DONATION' && $order->status === 'PAID' && $data['donationType']) {
                    convert_to_donation($db, $data['donationType'], $order->id);
                    remove_order_registrations($db, $conData, $order->id);
                    PlanZ::deferMembershipsToCon($db, $order->id, $nextCon);
                    compose_email($ini, $db, $conData, $order->confirmation_email, $order->payment_method, $order, get_client_locale(), false, true);
                    http_response_code(201);
                } else if ($data['action'] === 'DEFER') {
                    $nextCon = find_next_con($db);
                    defer_order_to_later($db, $conData, $nextCon, $order->id);
                    PlanZ::deferMembershipsToCon($db, $order->id, $nextCon);
                    http_response_code(201);
                } else if ($data['action'] === 'LINE_BY_LINE' && array_key_exists('items', $data)) {
                    process_line_by_line_items($ini, $db, $data['items'], $order);
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