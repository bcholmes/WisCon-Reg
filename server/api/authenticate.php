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
//
// This function provides support for login.

require_once(__DIR__ . "/config.php");
require_once(__DIR__ . "/db_common_functions.php");
require_once(__DIR__ . "/jwt_functions.php");

function get_name($dbobject) {
    if (isset($dbobject->badgename) && $dbobject->badgename !== '') {
        return $dbobject->badgename;
    } else {
        return $dbobject->firstname." ".$dbobject->lastname;
    }
}

function get_permission_roles($db, $badgeid) {
    $query = <<<EOD
 SELECT
        role_name
   FROM
        reg_user_roles
  WHERE
         badgeid = ?;
 EOD;

    $stmt = mysqli_prepare($db, $query);
    mysqli_stmt_bind_param($stmt, "s", $badgeid);
    if (mysqli_stmt_execute($stmt)) {
        $result = mysqli_stmt_get_result($stmt);
        $roles = array();
        while ($dbobject = mysqli_fetch_object($result)) {
            $roles[] = $dbobject->role_name;
        }
        mysqli_stmt_close($stmt);
        return $roles;
    } else {
        throw new DatabaseSqlException("Query could not be executed: $query");
    }
}

function resolve_login($db, $ini, $userid, $password) {
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
            if (password_verify($password, $dbobject->password)) {
                return jwt_create_token($dbobject->badgeid, get_name($dbobject), get_permission_roles($db, $dbobject->badgeid), $ini['jwt']['issuer'], $ini['jwt']['key']);
            } else {
                return false;
            }
        } else {
            throw new DatabaseSqlException("More than one result found.");
        }
    } else {
        throw new DatabaseSqlException("Invalid SQL");
    }
}

$db_ini = read_ini();
$db = connect_to_db($db_ini);
try {
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
            $loginResult = resolve_login($db, $db_ini, $userid, $password);

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
} finally {
    $db->close();
}
?>