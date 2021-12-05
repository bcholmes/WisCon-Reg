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
require_once("zambia_functions.php");
require_once("email_composer.php");

$ini = read_ini();

function find_all_membership_order_items($db, $order) {
    $query = <<<EOD
    SELECT 
           i.id, i.email_address, i.for_name, o.title, o.address_required, i.snail_mail_ok, 
           i.street_line_1, i.street_line_2, i.city, i.state_or_province, i.zip_or_postal_code, 
           i.country
      FROM 
           reg_order_item i, reg_offering o
     WHERE 
           i.order_id = ?
       AND
           o.id = i.offering_id
       AND
           o.is_membership = 'Y';
    EOD;
    $stmt = mysqli_prepare($db, $query);
    mysqli_stmt_bind_param($stmt, "i", $order->id);
    if (mysqli_stmt_execute($stmt)) {
        $result = mysqli_stmt_get_result($stmt);

        $memberships = array();
        while ($row = mysqli_fetch_object($result)) {
            $membership = array(
                "order_item_id" => $row->id,
                "email_address" => $row->email_address,
                "for_name" => $row->for_name,
                "title" => $row->title
            );
            if (($row->address_required == 'Y') || ($row->snail_mail_ok == 'Y')) {
                $address = array(
                    "street_line_1" => $row->street_line_1,
                    "street_line_2" => $row->street_line_2,
                    "city" => $row->city,
                    "state_or_province" => $row->state_or_province,
                    "zip_or_postal_code" => $row->zip_or_postal_code,
                    "country" => $row->country,
                );
                $membership['address'] = $address;
            }
            $memberships[] = $membership;
        }
        mysqli_free_result($result);
        mysqli_stmt_close($stmt);
        return $memberships;
    } else {
        throw new DatabaseSqlException("The Select statement could not be processed: " . $query);
    }
}

/**
 * Periodically, one person will register for a whole family, and use the same
 * email address for each family member. Obviously, this makes correlating records
 * by email address complicated.
 */
function is_email_address_unique($email, $memberships) {
    $count = 0;
    foreach ($memberships as $membership):
        if ($email === $membership['email_address']) {
            $count = $count + 1;
        }
    endforeach;

    return $count === 1;
}


function update_programming_system($db, $conData, $order) {
    $memberships = find_all_membership_order_items($db, $order);

    foreach ($memberships as $membership):

        $isEmailAddressUnique = is_email_address_unique($membership['email_address'], $memberships);
        $badgeid = find_best_candidate_badgeid($db, $conData, $membership['for_name'], $membership['email_address'], $isEmailAddressUnique);
        mysqli_begin_transaction($db);
        try {
            if ($badgeid) {
                update_programming_user($db, $badgeid, $membership['for_name'], $membership['title'], array_key_exists('address', $membership) != null ? $membership['address'] : null);
            } else {
                $badgeid = next_badgeid($db);
                create_new_programming_user($db, $badgeid, $membership['for_name'], $membership['email_address'], $membership['title'], array_key_exists('address', $membership) != null ? $membership['address'] : null);
            }
            create_programming_user_link($db, $conData, $badgeid, $membership['order_item_id']);
            mysqli_commit($db);
        } catch (mysqli_sql_exception $e) {
            mysqli_rollback($db);
            throw $e;
        }
    endforeach;
}


function process_stripe_status($ini, $db, $order, $paymentMethod) {
    if ($order->status != 'IN_PROGRESS') {
        return true;
    } else if ($paymentMethod === 'CARD') {
        \Stripe\Stripe::setApiKey(
            $ini['stripe']['secret_key']
        );
    
        $payment_intent = \Stripe\PaymentIntent::retrieve($order->payment_intent_id, []);
        if ($payment_intent->status === 'succeeded') {
            return mark_order_as_paid($db, $order->id);
        } else {
            return false;
        }
    } else if ($order->payment_intent_id) {
        $stripe = new \Stripe\StripeClient(
            $ini['stripe']['secret_key']
        );
        $stripe->paymentIntents->cancel($order->payment_intent_id, []);
        return true;
    } else {
        return true;
    }
}

$db = connect_to_db($ini);
try {
    $conData = find_current_con_with_db($db);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {

        $locale = locale_accept_from_http($_SERVER['HTTP_ACCEPT_LANGUAGE']);

        if ($conData) {

            $json = file_get_contents('php://input');
            $data = json_decode($json);

            $order_uuid = $data->orderId;
            if ($order_uuid && $data->paymentMethod && $data->email) {

                $order = find_order_by_order_uuid_with_db($db, $conData, $order_uuid);

                if ($order && ($order->status === 'IN_PROGRESS')) {
                    mark_order_as_finalized($db, $order->id, $data->paymentMethod, $data->email);
                    if (process_stripe_status($ini, $db, $order, $data->paymentMethod)) {
                        $order = find_order_by_order_uuid_with_db($db, $conData, $order_uuid);
                        compose_email($ini, $db, $conData, $data->email, $data->paymentMethod, $order, $locale);

                        update_programming_system($db, $conData, $order);
                        http_response_code(201);
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
        } else {
            http_response_code(500);
        }

    } else if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(201);
    } else {
        http_response_code(404);
    }
} finally {
    mysqli_close($db);
}
?>