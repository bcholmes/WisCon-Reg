<?php

class PlanZ {

    public static function deferMembershipsToCon($db, $orderId, $nextCon, $items = null) {
        $idClause = "";
        if ($items != null) {
            $idList = implode_and_escape_ids($db, $items);
            $idClause = " AND order_item_id in ($idList) ";
        }

        $query = <<<EOD
        UPDATE `CongoDump`
           SET regtype = NULL
         WHERE badgeid in 
         (select badgeid from reg_program_link
            WHERE order_item_id in (select id from reg_order_item where order_id = ?)
             $idClause );
EOD;
    
        $stmt = mysqli_prepare($db, $query);
        mysqli_stmt_bind_param($stmt, "i", $orderId);
    
        if ($stmt->execute()) {
            mysqli_stmt_close($stmt);
        } else {
            throw new DatabaseSqlException($query);
        }
        $query = <<<EOD
        UPDATE reg_program_link 
        SET con_id = ?
    WHERE order_item_id in (select id from reg_order_item where order_id = ?)
        $idClause;
EOD;
        $stmt = mysqli_prepare($db, $query);
        mysqli_stmt_bind_param($stmt, "ii", $nextCon->id, $orderId);

        if ($stmt->execute()) {
            mysqli_stmt_close($stmt);
        } else {
            throw new DatabaseSqlException("The Update could not be processed");
        }
    }

    public static function removeMemberships($db, $orderId, $items) {
        $idClause = "";
        if ($items != null) {
            $idList = implode_and_escape_ids($db, $items);
            $idClause = " AND order_item_id in ($idList) ";
        }

        $query = <<<EOD
        UPDATE `CongoDump`
           SET regtype = NULL
         WHERE badgeid in 
         (select badgeid from reg_program_link
            WHERE order_item_id in (select id from reg_order_item where order_id = ?)
             $idClause ); 
EOD;
    
        $stmt = mysqli_prepare($db, $query);
        mysqli_stmt_bind_param($stmt, "i", $orderId);
    
        if ($stmt->execute()) {
            mysqli_stmt_close($stmt);
        } else {
            throw new DatabaseSqlException($query);
        }

        $query = <<<EOD
        DELETE from reg_program_link 
    WHERE order_item_id in (select id from reg_order_item where order_id = ?)
        $idClause;
EOD;
        $stmt = mysqli_prepare($db, $query);
        mysqli_stmt_bind_param($stmt, "i", $orderId);

        if ($stmt->execute()) {
            mysqli_stmt_close($stmt);
        } else {
            throw new DatabaseSqlException("The Update could not be processed");
        }
    }
}
?>