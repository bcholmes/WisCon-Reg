
<?php
// Copyright (c) 2021 BC Holmes. All rights reserved. See copyright document for more details.
// This file supports reading configuration 

function read_ini() {
    return parse_ini_file(__DIR__ . "/../../reg_new_conf.ini", true);
}

?>