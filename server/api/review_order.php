<?php
// Copyright (c) 2021 BC Holmes. All rights reserved. See copyright document for more details.
// These functions provide support for common database queries.

require_once("config.php");
require_once("db_common_functions.php");
require_once("format_functions.php");

$ini = read_ini();
$conData = find_current_con($ini);
$locale = locale_accept_from_http($_SERVER['HTTP_ACCEPT_LANGUAGE']);

$order_uuid = $_REQUEST['orderId'];
$key = $_REQUEST['key'];

function find_order_items($db, $orderId) {
    $query = <<<EOD
    SELECT 
           i.for_name, i.email_address, i.amount, o.currency, o.title
      FROM 
           reg_order_item i, reg_offering o
     WHERE 
           i.offering_id = o.id AND
           i.order_id  = ?;
    EOD;

    mysqli_set_charset($db, "utf8");
    $stmt = mysqli_prepare($db, $query);
    mysqli_stmt_bind_param($stmt, "i", $orderId);
    if (mysqli_stmt_execute($stmt)) {
        $result = mysqli_stmt_get_result($stmt);
        $items = array();
        while($row = mysqli_fetch_object($result)) {
            $item = array(
                "for" => $row->for_name,
                "emailAddress" => $row->email_address,
                "currency" => $row->currency,
                "amount" => $row->amount,
                "title" => $row->title
            );
            array_push($items, $item);
        }
        mysqli_stmt_close($stmt);
        return $items;
    } else {
        return false;
    }
}

function find_order_and_items_by_order_uuid($ini, $conData, $order_uuid, $locale) {
    $db = mysqli_connect($ini['mysql']['host'], $ini['mysql']['user'], $ini['mysql']['password'], $ini['mysql']['db_name']);
    if (!$db) {
        return false;
    } else {
        $query = <<<EOD
 SELECT 
        o.id, o.status, o.confirmation_email, o.payment_method, o.finalized_date
   FROM 
        reg_order o
  WHERE 
        o.order_uuid = ? AND
        o.con_id  = ?;
 EOD;

        mysqli_set_charset($db, "utf8");
        $stmt = mysqli_prepare($db, $query);
        mysqli_stmt_bind_param($stmt, "si", $order_uuid, $conData->id);
        if (mysqli_stmt_execute($stmt)) {
            $result = mysqli_stmt_get_result($stmt);
            if (mysqli_num_rows($result) == 1) {
                $row = mysqli_fetch_object($result);
                mysqli_stmt_close($stmt);

                $date = date_create_from_format('Y-m-d H:i:s', $row->finalized_date);
                $date->setTimezone(new DateTimeZone('America/Chicago'));
                $items = find_order_items($db, $row->id);
                if ($items === false) {
                    return false;
                } else {
                    $order = array(
                        "orderId" => $row->id,
                        "orderUuid" => $order_uuid,
                        "confirmationEmail" => $row->confirmation_email,
                        "paymentMethod" => format_payment_type_for_display($row->payment_method, $locale),
                        "finalizedDate" => date_format($date, 'c'),
                        "finalizedDateSimple" => date_format($date, 'M j h:i A T'),

                        "items" => $items
                    );
                    mysqli_close($db);
                    return $order;
                }
            } else {
                mysqli_close($db);
                return null;
            }
        } else {
            mysqli_close($db);
            return false;
        }
    }
}

function validate_key($order, $key) {
    $valid_key = create_order_key($order['orderId'], $order['orderUuid'], $order['confirmationEmail']);
    if (strlen($key) > 12) {
        $key = substr($key, -12);
    }
    return $valid_key === $key;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    $order = find_order_and_items_by_order_uuid($ini, $conData, $order_uuid, $locale);
    // TODO check key
    if ($order && validate_key($order, $key)) {
        $json_string = json_encode($order);
        echo $json_string;
    } else if ($order) {
        http_response_code(400);
    } else if ($order === null) {
        http_response_code(404);
    } else {
        http_response_code(500);
    }
} else if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(201);
} else {
    http_response_code(404);
}