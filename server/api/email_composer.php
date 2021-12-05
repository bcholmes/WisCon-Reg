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

use function PHPSTORM_META\map;

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

function find_donations_in_order($db, $order) {
    $query = <<<EOD
    SELECT 
            i.amount, off.title, off.currency, off.short_name
        FROM 
        reg_order_item i
        LEFT OUTER JOIN reg_offering off
            ON 
                i.offering_id = off.id
        WHERE i.order_id  = ?
          AND off.is_donation = 'Y'
        ORDER BY i.id
EOD;
    $donations = array();
    $currency = null;
    $stmt = mysqli_prepare($db, $query);
    mysqli_stmt_bind_param($stmt, "i", $order->id);
    if (mysqli_stmt_execute($stmt)) {
        $result = mysqli_stmt_get_result($stmt);

        while ($row = mysqli_fetch_object($result)) {
            $currency = $row->currency;
            $key = $row->short_name ? $row->short_name : $row->title;
            if (array_key_exists($key, $donations)) {
                $amount = $donations[$key];
                $amount = $amount + $row->amount;
                $donations[$key] = $amount;
            } else {
                $donations[$key] = $row->amount;     
            }
        }
        mysqli_stmt_close($stmt);
        return array("to" => $donations, "currency" => $currency);
    } else {
        throw new DatabaseSqlException("Query could not be processed: $query");
    }
}

function donation_tax_clause($db, $order) {

    $donations = find_donations_in_order($db, $order);

    if (count($donations['to']) == 0) {
        return "";
    } else {
        $gift = "";
        $currency = $donations['currency'];
        $total = 0.00;
        foreach ($donations['to'] as $name => $amount) {
            if (mb_strlen($gift) > 0) {
                $gift .= " and ";
            }
            $gift .= format_monetary_amount($amount, $currency);
            $gift .= " to the ";
            $gift .= $name;

            $total += $amount;
        }

        if (count($donations['to']) > 1) {
            $gift .= " for a total of ";
            $gift .= format_monetary_amount($total, $currency);
        }

        $dateClause = "";
        if ($order->payment_date) {
            $date = convert_database_date_to_date($order->payment_date);
            $dateClause = " which we received on " . date_format($date, 'M j H:i e');
        } else {
            $date = convert_database_date_to_date($order->finalized_date);
            $dateClause = " which was pledged on " . date_format($date, 'M j H:i e');
        }
        $taxClause = <<<EOD
        <p>SF3, WisCon's parent not-for-profit, would like to thank you for your gift of $gift$dateClause. 
        SF3 is a 501(c)(3) tax-exempt organization as recognized by the 
        Internal Revenue Service (EIN 39-1256799). No goods or services, in whole or in part, were 
        received in exchange for this contribution; therefore, the full amount of your gift is 
        tax-deductible if you pay taxes in the United States. This note is provided by SF3 in order 
        to express our gratitude and to comply with the rules and regulations promulgated by the US 
        Internal Revenue Service. If you pay taxes in the United States, please retain this email 
        with your tax records.</p>
    EOD;
        return $taxClause;
    }
}


function compose_email($ini, $db, $conData, $email_address, $payment_method, $order, $locale, $resend = false, $update = false) {

    $cheque = format_payment_type_for_display('CHEQUE', $locale);

    $result = create_order_items_table($db, $order, $email_address);

    if ($result) {
        $reg_email = $ini['email']['reg_email'];

        $resend_text = $resend ? "This email is a resend of a previously-sent confirmation." : "";
        $update_text = $update ? "This email reflects some changes that Registration has made to your order, so please review it carefully. " : "";

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

        $taxClause = donation_tax_clause($db, $order);

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
        $taxClause
        <p>
            $update_text
            Please reach out to <a href="mailto:$reg_email">Registration</a> if you 
            have questions about this order or need assistance.
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