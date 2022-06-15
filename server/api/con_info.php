<?php

class ConInfo {

    public $id;
    public $name;
    public $startDate;
    public $endDate;

    function __construct($id, $name, $startDate, $endDate) {
        $this->id = $id;
        $this->name = $name;
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    function asJson() {
        return array("id" => $this->id, "name" => $this->name,
            "startDate" => $this->startDate, "endDate" => $this->endDate);
    }

    public static function asJsonList($cons) {
        $result = array();
        foreach ($cons as $con) {
            $result[] = $con->asJson();
        }
        return array("list" => $result);        
    }

    public static function findById($db, $id) {
        $query = <<<EOD
        SELECT 
               c.id, c.name, p.name as perrenial_name, c.con_start_date, c.con_end_date, c.reg_close_time
          FROM 
               reg_con_info c, reg_perennial_con_info p
         WHERE 
               c.perennial_con_id = p.id AND
               c.id = ?;
EOD;
       
        $stmt = mysqli_prepare($db, $query);
        mysqli_stmt_bind_param($stmt, "i", $id);
        if (mysqli_stmt_execute($stmt)) {
            $resultSet = mysqli_stmt_get_result($stmt);
            if (mysqli_num_rows($resultSet) == 1) {
                $dbobject = mysqli_fetch_object($resultSet);
                mysqli_stmt_close($stmt);
                $result = new ConInfo($dbobject->id, $dbobject->name, $dbobject->con_start_date, $dbobject->con_end_date);
                return $result;
            } else {
                throw new DatabaseException("Expected one result, but found " . mysqli_num_rows($resultSet));
            }
        } else {
            return new DatabaseSqlException("Query could not be executed: $query");
        }
    }

    public static function findAll($db) {
        $query = <<<EOD
        SELECT 
               c.id, c.name, p.name as perrenial_name, c.con_start_date, c.con_end_date, c.reg_close_time
          FROM 
               reg_con_info c, reg_perennial_con_info p
         WHERE 
               c.perennial_con_id = p.id;
EOD;
        $result = array();
        $stmt = mysqli_prepare($db, $query);
        if (mysqli_stmt_execute($stmt)) {
            $resultSet = mysqli_stmt_get_result($stmt);
            while ($dbobject = mysqli_fetch_object($resultSet)) {
                $result[] = new ConInfo($dbobject->id, $dbobject->name, $dbobject->con_start_date, $dbobject->con_end_date);
            }
            return $result;
            mysqli_stmt_close($stmt);
        } else {
            return new DatabaseSqlException("Query could not be executed: $query");
        }
    }

    public static function findCurrentCon($db) {
        $query = <<<EOD
        SELECT 
               c.id, c.name, p.name as perrenial_name, c.con_start_date, c.con_end_date, c.reg_close_time
          FROM 
               reg_con_info c, reg_perennial_con_info p
         WHERE 
               c.perennial_con_id = p.id AND
               c.active_from_time <= NOW() AND
               c.active_to_time >= NOW();
EOD;
       
        $stmt = mysqli_prepare($db, $query);
        if (mysqli_stmt_execute($stmt)) {
            $resultSet = mysqli_stmt_get_result($stmt);
            if (mysqli_num_rows($resultSet) == 1) {
                $dbobject = mysqli_fetch_object($resultSet);
                mysqli_stmt_close($stmt);
                $result = new ConInfo($dbobject->id, $dbobject->name, $dbobject->con_start_date, $dbobject->con_end_date);
                return $result;
            } else {
                throw new DatabaseException("Expected one result, but found " . mysqli_num_rows($resultSet));
            }
        } else {
            return new DatabaseSqlException("Query could not be executed: $query");
        }
    }
}

?>