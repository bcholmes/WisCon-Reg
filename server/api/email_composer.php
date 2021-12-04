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

require_once("db_common_functions.php");
require_once("email_functions.php");
require_once("format_functions.php");

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

function compose_email($ini, $db, $conData, $email_address, $payment_method, $order, $locale, $resend = false) {

    $cheque = format_payment_type_for_display('CHEQUE', $locale);

    $result = create_order_items_table($db, $order, $email_address);

    if ($result) {
        $reg_email = $ini['email']['reg_email'];

        $resend_text = $resend ? "This email is a resend of a previously-sent confirmation." : "";

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
            $resend_text
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


?>