<?php
// Copyright (c) 2021 BC Holmes. All rights reserved. See copyright document for more details.
// These functions provide support for common database queries.

class DatabaseException extends Exception {};
class DatabaseSqlException extends DatabaseException {};

function connect_to_db($db_ini) {
    $db = mysqli_connect($db_ini['mysql']['host'], $db_ini['mysql']['user'], $db_ini['mysql']['password'], $db_ini['mysql']['db_name']);
    if (!$db) {
        throw new DatabaseException("Could not connect to database");
    } else {
        mysqli_set_charset($db, "utf8");
        return $db;
    }
}

function find_current_con_with_db($db) {
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
   
    $stmt = mysqli_prepare($db, $query);
    if (mysqli_stmt_execute($stmt)) {
        $result = mysqli_stmt_get_result($stmt);
        if (mysqli_num_rows($result) == 1) {
            $dbobject = mysqli_fetch_object($result);
            mysqli_stmt_close($stmt);
            return $dbobject;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

function find_current_con($db_ini) {
    try {
        $db = connect_to_db($db_ini);
        $con = find_current_con_with_db($db);
        if ($con) {
            mysqli_close($db);
            return $con;
        } else {
            mysqli_close($db);
            return false;
        }
    } catch (Exception $e) {
        return false;
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

function find_order_by_order_uuid_with_db($db, $conData, $order_uuid) {
    $query = <<<EOD
 SELECT 
        o.id, o.status, o.payment_intent_id, o.payment_method
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
            return $dbobject;
        } else {
            return null;
        }
    } else {
        throw new DatabaseSqlException("The Select could not be processed.");
    }
}

function find_name_by_email_address($ini, $conData, $email_address) {
    $db = mysqli_connect($ini['mysql']['host'], $ini['mysql']['user'], $ini['mysql']['password'], $ini['mysql']['db_name']);
    if (!$db) {
        return false;
    } else {
        $query = <<<EOD
 SELECT 
        distinct i.for_name as name, count(*)
   FROM 
        reg_order o, reg_order_item i
  WHERE 
        o.id = i.order_id AND
        i.email_address = ? AND
        o.con_id  = ?
  GROUP BY name
  ORDER BY 2 desc, name;
 EOD;

        mysqli_set_charset($db, "utf8");
        $stmt = mysqli_prepare($db, $query);
        mysqli_stmt_bind_param($stmt, "si", $email_address, $conData->id);
        if (mysqli_stmt_execute($stmt)) {
            $result = mysqli_stmt_get_result($stmt);
            $name = false;
            while ($row = mysqli_fetch_object($result)) {
                $name = $row->name;
                if ($name) {
                    break;
                }
            }
            mysqli_stmt_close($stmt);
            mysqli_close($db);
            return $name;
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

function mark_order_as_finalized($db, $order_id, $payment_method, $email_address) {
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
    } else {
        throw new DatabaseSqlException("The Update could not be processed");
    }
}

function mark_order_as_paid($db, $order_id) {
    $query = <<<EOD
 UPDATE reg_order
    SET payment_date = now(),
        status = 'PAID'
  WHERE id = ?;
 EOD;

    mysqli_set_charset($db, "utf8");
    $stmt = mysqli_prepare($db, $query);
    mysqli_stmt_bind_param($stmt, "i", $order_id);

    if ($stmt->execute()) {
        mysqli_stmt_close($stmt);
        return true;
    } else {
        return false;
    }
}

function mark_order_as_cancelled($db, $order_id) {
    $query = <<<EOD
 UPDATE reg_order
    SET status = 'CANCELLED'
  WHERE id = ?;
 EOD;

    mysqli_set_charset($db, "utf8");
    $stmt = mysqli_prepare($db, $query);
    mysqli_stmt_bind_param($stmt, "i", $order_id);

    if ($stmt->execute()) {
        mysqli_stmt_close($stmt);
        return true;
    } else {
        return false;
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
        INTO reg_order_item (order_id, for_name, email_address, item_uuid, amount, email_ok, volunteer_ok, snail_mail_ok, 
        street_line_1, street_line_2, city, state_or_province, country, zip_or_postal_code, age, offering_id)
 SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, o.id
   from reg_offering o
 where  o.id = ?
   and  o.con_id = ?;
 EOD;

        mysqli_set_charset($db, "utf8");
        $stmt = mysqli_prepare($db, $query);
        mysqli_stmt_bind_param($stmt, "isssdssssssssssii", $orderId, $values->for, $values->email, $item_uuid, $values->amount, 
            boolean_value_from($values->newsletter != null ? $values->newsletter : false),
            boolean_value_from($values->volunteer != null ? $values->volunteer : false),
            boolean_value_from($values->snailMail != null ? $values->snailMail : false),
            $values->streetLine1,
            $values->streetLine2,
            $values->city,
            $values->stateOrProvince,
            $values->country,
            $values->zipOrPostalCode,
            $values->age,
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