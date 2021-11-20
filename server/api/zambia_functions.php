<?php
// Copyright (c) 2021 BC Holmes. All rights reserved. See copyright document for more details.
// These functions provide support for Zambia database updates and queries.

require_once("db_common_functions.php");

function split_first_and_last_names($name) {
    $words = preg_split('/\s+/',  $name, -1, PREG_SPLIT_NO_EMPTY);

    if ($words == false) {
        return array("first_name" => '',
            "last_name" => $name);
    } else if (count($words) === 0) {
        return array("first_name" => '',
            "last_name" => '');
    } else if (count($words) === 1) {
        return array("first_name" => '',
            "last_name" => $name);
    } else {
        $last = $words[count($words) - 1];
        $first = "";
        for ($i = 0; $i < count($words) - 1; $i++) {
            if ($i > 0) {
                $first .= ' ';
            }
            $first .= $words[$i]; 
        }
        return array("first_name" => $first,
            "last_name" => $last);
    }
}

function next_badgeid($db) {
    $query=<<<EOD
    SELECT
            MAX(CONVERT(badgeid, UNSIGNED)) M
        FROM
            Participants
        WHERE badgeid LIKE '
    EOD;
    $query .=  "%'";
    $last_badgeid = "";

    $stmt = mysqli_prepare($db, $query);
    if (mysqli_stmt_execute($stmt)) {
        $result = mysqli_stmt_get_result($stmt);

        while ($row = mysqli_fetch_object($result)) {
            $last_badgeid = $row->M;
        }
        mysqli_free_result($result);
        if ($last_badgeid == "") {
            $last_badgeid = "1000";
        }
        $id = $last_badgeid;
        return strval(intval($id) + 1);
    } else {
        throw new DatabaseSqlException("The query could not be processed");
    }
}

function find_best_candidate_badgeid($db, $conData, $name, $email_address, $is_unique) {
    $query = <<<EOD
    SELECT 
            p.badgeid, p.pubsname, c.firstname, c.lastname, c.badgename, c.email
    FROM    `Participants` p, `CongoDump` c
    WHERE   p.badgeid = c.badgeid
      AND   (c.regtype = '' OR c.regtype is null)
      AND   lower(c.email) = ?
      AND   p.badgeid not in (SELECT badgeid from reg_program_link where con_id = ?);
EOD;
    $stmt = mysqli_prepare($db, $query);
    mysqli_stmt_bind_param($stmt, "si", mb_strtolower($email_address, "utf8"), $conData->id);
    if (mysqli_stmt_execute($stmt)) {

        $result = mysqli_stmt_get_result($stmt);
        $badges = array();
        while ($row = mysqli_fetch_object($result)) {
            $badges[] = array(
                "badgeid" => $row->badgeid,
                "pubsname" => $row->pubsname,
                "badgename" => $row->badgename,
                "firstname" => $row->firstname,
                "lastname" => $row->lastname
            );
        }
        mysqli_free_result($result);
        mysqli_stmt_close($stmt);

        if (count($badges) === 1 && $is_unique) {
            $badge = $badges[0];
            return $badge['badgeid'];
        } else {
            $badgeid = null;
            $name_parts = split_first_and_last_names($name);
            foreach ($badges as $badge):
                if (mb_strtolower($name, "utf8") === mb_strtolower($badge['pubsname'], "utf8") 
                    or mb_strtolower($name, "utf8") === mb_strtolower($badge['badgename'], "utf8")
                    or (mb_strtolower($name_parts['last_name'], "utf8") == mb_strtolower($badge['lastname'], "utf8")
                        and mb_strtolower($name_parts['first_name'], "utf8") == mb_strtolower($badge['first_name'], "utf8"))) {
                    $badgeid = $badge['badgeid'];
                }
            endforeach;

            return $badgeid;
        }
    } else {
        throw new DatabaseSqlException("The Select query could not be processed: " . $query);
    }
}


function create_new_programming_user($db, $badgeid, $pubsname, $email_address, $reg_type) {
    $query = <<<EOD
    INSERT
        INTO `Participants` (badgeid, pubsname)
 VALUES 
        (?, ?);
 EOD;

    $stmt = mysqli_prepare($db, $query);
    mysqli_stmt_bind_param($stmt, "ss", $badgeid, $pubsname);

    if ($stmt->execute()) {
        mysqli_stmt_close($stmt);
    } else {
        throw new DatabaseSqlException("The Insert could not be processed");
    }

    $query = <<<EOD
    INSERT
        INTO `CongoDump` (badgeid, badgename, `email`, regtype, firstname, lastname)
 VALUES 
        (?, ?, ?, ?, ?, ?);
 EOD;

    $name = split_first_and_last_names($pubsname);
    $stmt = mysqli_prepare($db, $query);
    mysqli_stmt_bind_param($stmt, "ssssss", $badgeid, $pubsname, $email_address, $reg_type, $name['first_name'], $name['last_name']);

    if ($stmt->execute()) {
        mysqli_stmt_close($stmt);
    } else {
        throw new DatabaseSqlException("The Insert could not be processed");
    }
}


function update_programming_user($db, $badgeid, $pubsname, $reg_type) {
    $query = <<<EOD
    UPDATE `Participants` 
     SET pubsname = ?
   WHERE badgeid = ?;
 EOD;

    $stmt = mysqli_prepare($db, $query);
    mysqli_stmt_bind_param($stmt, "ss", $pubsname, $badgeid);

    if ($stmt->execute()) {
        mysqli_stmt_close($stmt);
    } else {
        throw new DatabaseSqlException("The Update could not be processed");
    }

    $query = <<<EOD
    UPDATE `CongoDump` 
       SET badgename = ?, regtype = ? 
       WHERE badgeid = ?;
    EOD;

    $stmt = mysqli_prepare($db, $query);
    mysqli_stmt_bind_param($stmt, "sss", $pubsname, $reg_type, $badgeid);

    if ($stmt->execute()) {
        mysqli_stmt_close($stmt);
    } else {
        throw new DatabaseSqlException("The Update could not be processed");
    }
}

function create_programming_user_link($db, $conData, $badgeid, $order_item_id) {
    $query = <<<EOD
    INSERT
        INTO reg_program_link (con_id, order_item_id, badgeid)
 VALUES 
        (?, ?, ?);
 EOD;

    $stmt = mysqli_prepare($db, $query);
    mysqli_stmt_bind_param($stmt, "iis", $conData->id, $order_item_id, $badgeid);

    if ($stmt->execute()) {
        mysqli_stmt_close($stmt);
    } else {
        throw new DatabaseSqlException("The Insert could not be processed");
    }
}

?>