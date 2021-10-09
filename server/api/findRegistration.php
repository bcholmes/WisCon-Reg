<?php
// Copyright (c) 2021 BC Holmes. All rights reserved. See copyright document for more details.
// This function supports searching for a user's registration by email address.

require_once("config.php");
require_once("db_common_functions.php");
require_once("email_functions.php");

$ini = read_ini();

$conData = find_current_con($ini);

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


if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    if ($conData) {

        $json = file_get_contents('php://input');
        $data = json_decode($json);

        $email = $data->email;
        if ($email) {
            $subject = "" . $conData->name . " Registration Lookup Request";
            send_email(create_not_found_email($email, $conData->name, $ini), $subject, 
                $email);

            http_response_code(201);
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

?>