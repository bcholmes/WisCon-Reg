<?php
// Copyright (c) 2021 BC Holmes. All rights reserved. See copyright document for more details.
// This function supports searching for a user's registration by email address.

require_once("config.php");
require_once("db_common_functions.php");
require_once("email_functions.php");
require_once("format_functions.php");

$ini = read_ini();

function create_not_found_email($email_address, $con_name, $ini) {
    $reg_email = $ini['email']['reg_email'];
    $emailBody = <<<EOD
    <p>
        Hello $email_address,
    </p>
    <p>
        Someone &mdash; hopefully you &mdash; was trying to look up your registration for 
        <b>$con_name</b>.
    </p>
    <p>
        Sadly, we cannot find a registration under that email address. Please reach out to 
        <a href="mailto:$reg_email">Registration</a> if you need assistance.
    </p>
    <p>
        Thanks,<br />
        The System That Sends the Emails
    </p>
    EOD;
    return $emailBody;
}

function create_order_review_email($ini, $email_address, $con_name, $orders, $hostName) {
    $reg_email = $ini['email']['reg_email'];
    $list = '';
    foreach ($orders as $value) {
        $key = create_order_key($value['order_id'], $value['order_uuid'], $value['confirmation_email']);
        $order_url = 'https://' . $hostName . '/review?orderId=' . $value['order_uuid'] . '&key=' . $key;
        $list = $list . '<li><a href="' . $order_url . '">' . $order_url . '</a></li>';
    }

    $emailBody = <<<EOD
    <p>
        Hello $email_address,
    </p>
    <p>
        Someone &mdash; hopefully you &mdash; was trying to look up your registration for 
        <b>$con_name</b>.
    </p>
    <p>
        We've found one or more orders associated with your email address:
    </p>

    <sl>
        $list
    </sl>
        
    <p>Please reach out to <a href="mailto:$reg_email">Registration</a> if you need further assistance.</p>

    <p>
        Thanks,<br />
        The System That Sends the Emails
    </p>
    EOD;
    return $emailBody;
}

function find_orders_with_email($db, $conData, $email) {
    $query = <<<EOD
 SELECT 
        o.id, o.order_uuid, o.confirmation_email
   FROM 
        reg_order o
  WHERE 
        (o.confirmation_email = ? OR
        o.id in (select i.order_id from reg_order_item i where i.email_address = ?))
        AND o.status in ('CHECKED_OUT', 'PAID')
        AND o.con_id  = ?;
 EOD;

    $stmt = mysqli_prepare($db, $query);
    mysqli_stmt_bind_param($stmt, "ssi", $email, $email, $conData->id);
    if (mysqli_stmt_execute($stmt)) {
        $result = mysqli_stmt_get_result($stmt);
        $orders = array();
        while ($row = mysqli_fetch_object($result)) {
            $order_data = array(
                "order_id" => $row->id,
                "order_uuid" => $row->order_uuid,
                "confirmation_email" => $row->confirmation_email
            );
            array_push($orders, $order_data);
        }
        return $orders;
    } else {
        throw new DatabaseSqlException($query);
    }
}

$db = connect_to_db($ini);
try {
    $conData = find_current_con_with_db($db);


    if ($_SERVER['REQUEST_METHOD'] === 'POST') {

        if ($conData) {

            $json = file_get_contents('php://input');
            $data = json_decode($json);

            $email = $data->email;
            if ($email) {
                $subject = "" . $conData->name . " Registration Lookup Request";

                $orders = find_orders_with_email($db, $conData, $email);

                if ($orders) {
                    $email_name = find_name_by_email_address($db, $conData, $email);
                    if (!$email_name) {
                        $email_name = $email;
                    }
                    send_email(create_order_review_email($ini, $email_name, $conData->name, $orders, $_SERVER['SERVER_NAME']), 
                    $subject, [ $email => $email_name ]);
                } else {
                    send_email(create_not_found_email($email, $conData->name, $ini), $subject, 
                        $email);
                }
                http_response_code(204);
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
    $db->close();
}

?>