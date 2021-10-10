<?php
// Copyright (c) 2021 BC Holmes. All rights reserved. See copyright document for more details.
// These functions provide support for common database queries.

function find_current_con($db_ini) {
    $db = mysqli_connect($db_ini['mysql']['host'], $db_ini['mysql']['user'], $db_ini['mysql']['password'], $db_ini['mysql']['db_name']);
    if (!$db) {
        return false;
    } else {
        $query = <<<EOD
 SELECT 
        c.id, c.name, p.name as perrenial_name, c.con_start_date, c.con_end_date
   FROM 
        reg_con_info c, reg_perennial_con_info p
  WHERE 
        c.perennial_con_id = p.id AND
        c.active_from_time <= NOW() AND
        c.active_to_time >= NOW();

 EOD;

        mysqli_set_charset($db, "utf8");
        $stmt = mysqli_prepare($db, $query);
        if (mysqli_stmt_execute($stmt)) {
            $result = mysqli_stmt_get_result($stmt);
            if (mysqli_num_rows($result) == 1) {
                $dbobject = mysqli_fetch_object($result);
                mysqli_stmt_close($stmt);
                mysqli_close($db);
                return $dbobject;
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

?>