<?php
// Copyright (c) 2021 BC Holmes. All rights reserved. See copyright document for more details.
// This function supports searching for a user's registration by email address.

require_once("config.php");
require_once("db_common_functions.php");

$ini = read_ini();

$conData = find_current_con($ini);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    if ($conData) {

        $json = file_get_contents('php://input');
        $data = json_decode($json);

        $email = $data->email;
        if ($email) {
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