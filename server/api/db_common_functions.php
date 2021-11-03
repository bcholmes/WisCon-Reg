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

function find_order_by_order_uuid($ini, $conData, $order_uuid) {
    $db = mysqli_connect($ini['mysql']['host'], $ini['mysql']['user'], $ini['mysql']['password'], $ini['mysql']['db_name']);
    if (!$db) {
        return false;
    } else {
        $query = <<<EOD
 SELECT 
        o.id, o.status, o.payment_intent_id
   FROM 
        reg_order o
  WHERE 
        o.order_uuid = ? AND
        o.con_id  = ?;
 EOD;

        mysqli_set_charset($db, "utf8");
        $stmt = mysqli_prepare($db, $query);
        mysqli_stmt_bind_param($stmt, "si", $order_uuid, $conData->id);
        if (mysqli_stmt_execute($stmt)) {
            $result = mysqli_stmt_get_result($stmt);
            if (mysqli_num_rows($result) == 1) {
                $dbobject = mysqli_fetch_object($result);
                mysqli_stmt_close($stmt);
                mysqli_close($db);
                return $dbobject;
            } else {
                mysqli_close($db);
                return null;
            }
        } else {
            mysqli_close($db);
            return false;
        }
    }
}

function create_order_with_order_uuid($ini, $conData, $order_uuid) {
    $db = mysqli_connect($ini['mysql']['host'], $ini['mysql']['user'], $ini['mysql']['password'], $ini['mysql']['db_name']);
    if (!$db) {
        return false;
    } else {
        $query = <<<EOD
 INSERT
        INTO reg_order (order_uuid, con_id)
 VALUES 
        (?, ?);
 EOD;

        mysqli_set_charset($db, "utf8");
        $stmt = mysqli_prepare($db, $query);
        mysqli_stmt_bind_param($stmt, "si", $order_uuid, $conData->id);

        if ($stmt->execute()) {
            mysqli_stmt_close($stmt);
            mysqli_close($db);
            return find_order_by_order_uuid($ini, $conData, $order_uuid);
        } else {
            mysqli_close($db);
            return false;
        }
    }
}

function mark_order_as_finalized($ini, $order_id, $payment_method, $email_address) {
    $db = mysqli_connect($ini['mysql']['host'], $ini['mysql']['user'], $ini['mysql']['password'], $ini['mysql']['db_name']);
    if (!$db) {
        return false;
    } else {
        $query = <<<EOD
 UPDATE reg_order
    SET payment_method = ?,
        confirmation_email = ?,
        status = 'CHECKED_OUT',
        finalized_date = now()
  WHERE id = ?;
 EOD;

        mysqli_set_charset($db, "utf8");
        $stmt = mysqli_prepare($db, $query);
        mysqli_stmt_bind_param($stmt, "ssi", $payment_method, $email_address, $order_id);

        if ($stmt->execute()) {
            mysqli_stmt_close($stmt);
            mysqli_close($db);
            return true;
        } else {
            mysqli_close($db);
            return false;
        }
    }
}

function boolean_value_from($value) {
    if ($value == null) {
        return null;
    } else if ($value) {
        return "Y";
    } else {
        return "N";
    }
}

function create_order_item_with_uuid($ini, $conData, $orderId, $values, $offering, $item_uuid) {
    $db = mysqli_connect($ini['mysql']['host'], $ini['mysql']['user'], $ini['mysql']['password'], $ini['mysql']['db_name']);
    if (!$db) {
        return false;
    } else {
        $query = <<<EOD
 INSERT
        INTO reg_order_item (order_id, for_name, email_address, item_uuid, amount, email_ok, volunteer_ok, snail_mail_ok, offering_id)
 SELECT ?, ?, ?, ?, ?, ?, ?, ?, o.id
   from reg_offering o
 where  o.id = ?
   and  o.con_id = ?;
 EOD;

        mysqli_set_charset($db, "utf8");
        $stmt = mysqli_prepare($db, $query);
        mysqli_stmt_bind_param($stmt, "isssdsssii", $orderId, $values->for, $values->email, $item_uuid, $values->amount, 
            boolean_value_from($values->newsletter),
            boolean_value_from($values->volunteer),
            boolean_value_from($values->snailMail),
            $offering->id, $conData->id);

        if ($stmt->execute()) {
            mysqli_stmt_close($stmt);
            mysqli_close($db);
            return true;
        } else {
            mysqli_close($db);
            return false;
        }
    }
}

?>