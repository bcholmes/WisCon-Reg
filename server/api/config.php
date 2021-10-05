
<?php
// Copyright (c) 2021 BC Holmes. All rights reserved. See copyright document for more details.
// This function supports searching for a user's registration by email address.

function read_ini() {
    return  parse_ini_file(__DIR__ . "/../../reg_new_conf.ini", true);
}

?>