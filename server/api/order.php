<?php

require_once('../vendor/autoload.php');

use UUID\UUID;

class Order {
    public $id;
    public $status;
    public $paymentMethod;
    public $paymentIntentId;

    function __construct($orderObject) {
        $this->id = $orderObject->id;
        $this->status = $orderObject->status;
        $this->paymentMethod = $orderObject->payment_method;
        $this->paymentIntentId = $orderObject->payment_intent_id;
    }

    public function isCardPaymentMethod() {
        return $this->paymentMethod === 'CARD';
    }

    private function updateLastModifiedDate($db) {
        $query = <<<EOD
     UPDATE reg_order
        SET last_modified_date = now()
      WHERE id = ?;
EOD;
    
        $stmt = mysqli_prepare($db, $query);
        mysqli_stmt_bind_param($stmt, "i", $this->id);
    
        if ($stmt->execute()) {
            mysqli_stmt_close($stmt);
            return true;
        } else {
            throw new DatabaseException("Update could not be processed: $query");
        }
    }

    public function moveItemsToOrder($db, $items, $fromOrder) {
        $idList = implode_and_escape_ids($db, $items);

        $query = <<<EOD
        UPDATE reg_order_item
           SET order_id = ?
        WHERE id in ($idList)
          AND order_id = ?;
EOD;
        $stmt = mysqli_prepare($db, $query);
        mysqli_stmt_bind_param($stmt, "ii", $this->id, $fromOrder->id);

        if ($stmt->execute()) {
            mysqli_stmt_close($stmt);
            $fromOrder->updateLastModifiedDate($db);
            return $this->updateLastModifiedDate($db);
        } else {
            throw new DatabaseException("Update could not be processed: $query");
        }
    }

    public function sumAmounts($db, $itemIds) {
        $idList = implode_and_escape_ids($db, $itemIds);

        $query = <<<EOD
        SELECT sum(amount) as amount
         FROM reg_order_item
        WHERE order_id = ?
          AND id in ($idList);
EOD;
        $stmt = mysqli_prepare($db, $query);
        mysqli_stmt_bind_param($stmt, "i", $this->id);

        if ($stmt->execute()) {
            $result = null;
            $resultSet = mysqli_stmt_get_result($stmt);
            if (mysqli_num_rows($resultSet) == 1) {
                $record = mysqli_fetch_object($resultSet);
                $result = $record->amount;
            }
            mysqli_stmt_close($stmt);
            return $result;
        } else {
            throw new DatabaseException("Update could not be processed: $query");
        }
    }

    public function sumActiveAmounts($db) {

        $query = <<<EOD
        SELECT sum(amount) as amount
         FROM reg_order_item
        WHERE order_id = ?
          AND status is NULL;
EOD;
        $stmt = mysqli_prepare($db, $query);
        mysqli_stmt_bind_param($stmt, "i", $this->id);

        if ($stmt->execute()) {
            $result = null;
            $resultSet = mysqli_stmt_get_result($stmt);
            if (mysqli_num_rows($resultSet) == 1) {
                $record = mysqli_fetch_object($resultSet);
                $result = $record->amount;
            }
            mysqli_stmt_close($stmt);
            return $result;
        } else {
            throw new DatabaseException("Update could not be processed: $query");
        }
    }

    public function updateItemStatus($db, $items, $status) {
        $idList = implode_and_escape_ids($db, $items);
        $safeStatus = $db->escape_string($status);

        $query = <<<EOD
        UPDATE reg_order_item
           SET status = '$safeStatus'
        WHERE id in ($idList)
          AND order_id = ?;
EOD;
    
        $stmt = mysqli_prepare($db, $query);
        mysqli_stmt_bind_param($stmt, "i", $this->id);
    
        if ($stmt->execute()) {
            mysqli_stmt_close($stmt);
            return $this->updateLastModifiedDate($db);
        } else {
            throw new DatabaseException("Update could not be processed: $query");
        }
    }

    private function findOrderById($db, $orderId) {
        $query = <<<EOD
     SELECT 
            o.id, o.status, o.payment_intent_id, o.payment_method, o.confirmation_email, o.payment_date, o.finalized_date
       FROM 
            reg_order o
      WHERE 
            o.id = ?;
     EOD;
    
        $stmt = mysqli_prepare($db, $query);
        mysqli_stmt_bind_param($stmt, "i", $orderId);
        if (mysqli_stmt_execute($stmt)) {
            $result = mysqli_stmt_get_result($stmt);
            if (mysqli_num_rows($result) == 1) {
                $dbobject = mysqli_fetch_object($result);
                mysqli_stmt_close($stmt);
                return new Order($dbobject);
            } else {
                return null;
            }
        } else {
            throw new DatabaseSqlException("The Select could not be processed.");
        }
    }

    public function createDuplicateOrderForNextYear($db, $nextCon) {
        $query = <<<EOD
        insert into reg_order 
               (order_uuid, `status`, creation_date, last_modified_date, payment_date, 
               payment_method, con_id, finalized_date, confirmation_email, payment_intent_id, orig_order_id)
        select ?, `status`, creation_date, CURRENT_TIMESTAMP(), payment_date, payment_method, ?, finalized_date, 
               confirmation_email, payment_intent_id, id 
          from reg_order
         where id = ?;
EOD;
        $uuid = UUID::uuid4();

        $stmt = mysqli_prepare($db, $query);
        mysqli_stmt_bind_param($stmt, "sii", $uuid, $nextCon->id, $this->id);
    
        if ($stmt->execute()) {
            mysqli_stmt_close($stmt);

            $newId = mysqli_insert_id($db);
            return $this->findOrderById($db, $newId);
        } else {
            throw new DatabaseException("Update could not be processed: $query");
        }
    }
}


?>