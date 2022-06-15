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
// This file fetches information about the current con.

require_once("config.php");
require_once("db_common_functions.php");
require_once("con_info.php");

$ini = read_ini();
$db = connect_to_db($ini);

try {
    $conData = ConInfo::findCurrentCon($db);

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        header('Content-type: application/json');
        $json_string = json_encode($conData->asJson());
        echo $json_string;
    } else {
        http_response_code(405);
    }
} finally {
    $db->close();
}


?>