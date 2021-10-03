<?php
// Copyright (c) 2021 BC Holmes. All rights reserved. See copyright document for more details.
// This function provides support for login.

$db_ini = parse_ini_file(__DIR__ . "/../../reg_new_conf.ini", true);

require_once("jwt_functions.php");

function get_name($dbobject) {
    if (isset($dbobject->badgename) && $dbobject->badgename !== '') {
        return $dbobject->badgename;
    } else {
        return $dbobject->firstname." ".$dbobject->lastname;
    }
}

function resolve_login($userid, $password, $db_ini) {
    $db = mysqli_connect($db_ini['mysql']['host'], $db_ini['mysql']['user'], $db_ini['mysql']['password'], $db_ini['mysql']['db_name']);
    if (!$db) {
        return false;
    } else {
        $query = <<<EOD
 SELECT 
        password, badgeid, firstname, lastname, badgename 
   FROM 
        reg_users 
  WHERE 
         email = ?;
 EOD;

        $stmt = mysqli_prepare($db, $query);
        mysqli_stmt_bind_param($stmt, "s", $userid);
        if (mysqli_stmt_execute($stmt)) {
            $result = mysqli_stmt_get_result($stmt);
            if (mysqli_num_rows($result) == 1) {
                $dbobject = mysqli_fetch_object($result);
                mysqli_stmt_close($stmt);
                mysqli_close($db);
                if (password_verify($password, $dbobject->password)) {
                    return jwt_create_token($dbobject->badgeid, get_name($dbobject), $db_ini['jwt']['issuer'], $db_ini['jwt']['key']);
                } else {
                    return false;
                }
            } else {
                mysqli_close($db);
                return false;
            }
        } else {
            mysqli_close($db);
            return false;
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $json = file_get_contents('php://input');
    $data = json_decode($json);

    $userid = $data->userid;
    $password = $data->password;

    // we want to avoid letting this API be an easy way for
    // hackers to test userid/password combinations, so we
    // will reject all requests that don't include a basic JWT.
    /*
    $jwt = jwt_from_header();
	if (jwt_validate_token($jwt)) {
        http_response_code(401);
    } else {
    */
        $loginResult = resolve_login($userid, $password, $db_ini);

        if ($loginResult) {
            header('Content-type: application/json');
            header("Authorization: Bearer ".$loginResult);
            $result = array( "success" => true, "message" => "I like you. I really like you." );
            echo json_encode($result);
                
        } else {
            $result = array( "success" => false, "message" => "You're not of the body!" );
            http_response_code(401);
            echo "\n\n";
            echo json_encode($result);
        }
    /*
    }
    */
} else if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
} else {
    http_response_code(404);
}

?>