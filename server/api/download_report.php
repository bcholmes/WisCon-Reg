<?php
// Copyright (c) 2018-2020 Peter Olszowka. All rights reserved. See copyright document for more details.

require_once("config.php");
require_once("db_common_functions.php");
require_once("format_functions.php");
require_once("jwt_functions.php");

$ini = read_ini();
$conData = find_current_con($ini);

$date = new DateTime();
$formattedDate = date_format($date, 'Y-m-d-H.i.s');
$locale = locale_accept_from_http($_SERVER['HTTP_ACCEPT_LANGUAGE']);

if ($_SERVER['REQUEST_METHOD'] === 'GET' && !jwt_validate_token(jwt_from_header(), $ini['jwt']['key'], true)) {
    http_response_code(401);
} else {
    $db = mysqli_connect($ini['mysql']['host'], $ini['mysql']['user'], $ini['mysql']['password'], $ini['mysql']['db_name']);
    if (!$db) {
        http_response_code(500);
    } else {
        $query = <<<EOD
    SELECT 
            o.id, o.confirmation_email, o.status, o.payment_method, o.finalized_date, i.for_name, i.email_address, i.amount, off.title
    FROM 
            reg_order o
    LEFT OUTER JOIN reg_order_item i
            ON
                o.id = i.order_id
    LEFT OUTER JOIN reg_offering off
            ON 
                i.offering_id = off.id
    WHERE o.con_id  = ?
        AND o.status in ('CHECKED_OUT', 'PAID')
    ORDER BY o.finalized_date, o.id, i.id
 EOD;

        mysqli_set_charset($db, "utf8");
        $stmt = mysqli_prepare($db, $query);
        mysqli_stmt_bind_param($stmt, "i", $conData->id);
        if (mysqli_stmt_execute($stmt)) {

            header("Content-disposition: attachment; filename=" . str_replace(' ', '_', strtolower($conData->name)) .  "-registration-" . $formattedDate . ".csv");
            header('Content-type: text/csv');
            echo 'Order Number, Confirmation Sent To, Purchase Item, Check-out Date, Paid, Amount, Name, Email, Payment Method';
            echo "\n";
            
            $result = mysqli_stmt_get_result($stmt);
            while ($row = mysqli_fetch_object($result)) {
                echo "\"" . $row->id . "\",\"" . $row->confirmation_email . "\",\"" . $row->title . "\",\"" . $row->finalized_date . "\"," . 
                    ($row->status == 'PAID' ? "\"Yes\"" : "\"No\"") . ',' . $row->amount . ",\"" . $row->for_name . "\",\"" . $row->email_address . "\",\"" . 
                    format_payment_type_for_display($row->payment_method, $locale) . "\"";
                echo "\n";
            }
            mysqli_stmt_close($stmt);
            mysqli_close($db);
        } else {
            mysqli_close($db);
        }
    }
}
?>