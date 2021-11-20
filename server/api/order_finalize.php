<?php
// Copyright (c) 2021 BC Holmes. All rights reserved. See copyright document for more details.
// This function supports order finalization functionality

require_once('../vendor/autoload.php');

require_once("config.php");
require_once("db_common_functions.php");
require_once("zambia_functions.php");
require_once("email_functions.php");
require_once("format_functions.php");

$ini = read_ini();

function create_order_items_table($db, $order, $email_address) {
    $query = <<<EOD
    SELECT 
            i.for_name, i.email_address, i.amount, off.title, off.currency
        FROM 
        reg_order_item i
        LEFT OUTER JOIN reg_offering off
            ON 
                i.offering_id = off.id
        WHERE i.order_id  = ?
        ORDER BY i.id
EOD;

    $lines = '<table><thead><tr><th style=\"text-align: left;\">Description</th><th style=\"text-align: left;\">Name</th><th style=\"text-align: right;\">Amount</th></tr></thead></tbody>';
    $addressee = null;
    $total = 0.0;
    $stmt = mysqli_prepare($db, $query);
    $currency = null;
    mysqli_stmt_bind_param($stmt, "i", $order->id);
    mysqli_set_charset($db, "utf8");
    if (mysqli_stmt_execute($stmt)) {
        $result = mysqli_stmt_get_result($stmt);

        while ($row = mysqli_fetch_object($result)) {
            $amount = format_monetary_amount($row->amount, $row->currency);
            $currency = $row->currency;

            $table_row = "<tr><td style=\"padding-right: 1rem;\">" . $row->title . "</td><td style=\"padding-right: 1rem;\">" . $row->for_name . "</td><td style=\"text-align: right\">" . $amount . "</td></tr>";
            $lines = $lines . $table_row;
            $total += $row->amount;

            if ((!$addressee && $row->for_name) || $row->email_address === $email_address) {
                $addressee = $row->for_name;
            }
        }
        mysqli_stmt_close($stmt);

        $amount = format_monetary_amount($total, $currency);
        $lines = $lines . "</tbody><tfoot><tr><td colspan=\"2\"><b>Total</b></td><td style=\"text-align: right;\"><b>" . $amount . "</b></td></tr></tfoot></table>";
    
        return array(
            "lines" => $lines,
            "addressee" => $addressee
        );

    } else {
        throw new DatabaseSqlException("The Select statement could not be executed");
    }
}

function find_all_membership_order_items($db, $order) {
    $query = <<<EOD
    SELECT 
           i.id, i.email_address, i.for_name, o.title, o.address_required, i.snail_mail_ok
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
            $memberships[] = array(
                "order_item_id" => $row->id,
                "email_address" => $row->email_address,
                "for_name" => $row->for_name,
                "title" => $row->title
            );
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
        if ($badgeid) {
            update_programming_user($db, $badgeid, $membership['for_name'], $membership['title']);
        } else {
            $badgeid = next_badgeid($db);
            create_new_programming_user($db, $badgeid, $membership['for_name'], $membership['email_address'], $membership['title']);
        }
        create_programming_user_link($db, $conData, $badgeid, $membership['order_item_id']);

    endforeach;

}


function process_stripe_status($ini, $db, $order, $paymentMethod) {
    if ($paymentMethod === 'CARD') {
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


function compose_email($ini, $db, $conData, $email_address, $payment_method, $order, $locale) {

    $cheque = format_payment_type_for_display('CHEQUE', $locale);

    $result = create_order_items_table($db, $order, $email_address);

    if ($result) {
        $reg_email = $ini['email']['reg_email'];

        $payment_text = "<p>You have chosen to pay for these items using a credit card.</p>";
        if ($payment_method === 'CASH') {
            $payment_text = <<<EOD
        <p>You have elected to pay for these items in cash at the registration desk. Your membership 
        will be ready for pick-up, but the final balance must be paid at that time.</p>
EOD;
        } else if ($payment_method === 'NO_CHARGE') {
            $payment_text = <<<EOD
        <p>Because you've only selected free items, your order does not require payment.</p>
EOD;

        } else if ($payment_method === 'CHEQUE') {
            $reg_snail_mail = $ini['email']['reg_snail_mail'];
            $reg_snail_mail = str_replace("\n", "<br />", $reg_snail_mail);

            $payment_text = <<<EOD
        <p>You have elected to pay for these items by mailing us a $cheque. Please mail your $cheque to:</p>
        <p>$reg_snail_mail</p>
        <p>Please write your order number (Order #$order->id) on the $cheque or send the $cheque with a printed copy of this
           email to help us process your payment more easily.</p>
EOD;
        }

        $to = $email_address;
        $addressee = $result['addressee'];
        $lines = $result['lines'];
        if (!$addressee) {
            $addressee = $email_address;
        } else {
            $to = [ $email_address => $addressee ];
        }

        $emailBody = <<<EOD
        <p>
            Hello $addressee,
        </p>
        <p>
            This email confirms your registration for 
            <b>$conData->name</b>.
        </p>
        <p>
            Your order number is #<b>$order->id</b>.
        </p>
        $payment_text
        $lines
        <p>
            Please reach out to <a href="mailto:$reg_email">Registration</a> if you 
            have questions about this registration or need assistance.
        </p>
        <p>
            Thanks,<br />
            The System That Sends the Emails
        </p>
EOD;

        $subject = "Your registration for " . $conData->name;

        send_email($emailBody, $subject, $to);
        return true;
    } else {
        return false;
    }
}

try {
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

                    if ($order) {
                        mark_order_as_finalized($db, $order->id, $data->paymentMethod, $data->email);
                        if (process_stripe_status($ini, $db, $order, $data->paymentMethod)) {
                            compose_email($ini, $db, $conData, $data->email, $data->paymentMethod, $order, $locale);

                            update_programming_system($db, $conData, $order);
                            http_response_code(201);
                        } else {
                            http_response_code(500);
                        }
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
} catch (Exception $e) {
    error_log($e->getMessage());
    error_log($e->getFile());
    error_log($e->getLine());
    error_log($e->getTraceAsString());
    http_response_code(500);
}
?>