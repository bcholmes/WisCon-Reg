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

require_once("config.php");
require_once("db_common_functions.php");
require_once("jwt_functions.php");
require_once("format_functions.php");
require_once("con_info.php");

function filter_clause($db, $term) {
    $filterQuery = "";
    if ($term) {
        $id_clause = (is_numeric($term)) ? (" or o.id = " . $term) : "";
        $termPhrase = '%' . mysqli_real_escape_string($db, strtolower($term)) . '%';
        $filterQuery = "and (i.for_name like '" . $termPhrase . "' OR i.email_address like '" . $termPhrase
            . "' or o.confirmation_email like '" . $termPhrase . "'" . $id_clause . ")";
    }
    return $filterQuery;
}

function find_registrations($conData, $db, $term, $page, $pageSize) {
    $locale = locale_accept_from_http($_SERVER['HTTP_ACCEPT_LANGUAGE']);

    $filterQuery = filter_clause($db, $term);
    $start = $page * $pageSize;

    $query = <<<EOD
    SELECT
            o.id, o.confirmation_email, o.status, o.order_uuid, o.payment_method, o.finalized_date, i.for_name,
            i.email_address, i.amount, off.title, i.status as item_status, o.con_id, v.name
    FROM
            reg_order o
    LEFT OUTER JOIN reg_order_item i
            ON
                o.id = i.order_id
    LEFT OUTER JOIN reg_offering off
            ON
                i.offering_id = off.id
    LEFT OUTER JOIN reg_offering_variant v
            ON
                i.variant_id = v.id
    WHERE (o.con_id  = ? or off.con_id = ?)
        AND o.status != 'IN_PROGRESS'
        $filterQuery
    ORDER BY o.id, i.id
    LIMIT $start, $pageSize
    EOD;

    $stmt = mysqli_prepare($db, $query);
    mysqli_stmt_bind_param($stmt, "ii", $conData->id, $conData->id);
    $cons = array();
    if (mysqli_stmt_execute($stmt)) {

        $items = array();
        $result = mysqli_stmt_get_result($stmt);
        while ($row = mysqli_fetch_object($result)) {
            $current = array(
                "id" => $row->id,
                "confirmation_mail" => $row->confirmation_email,
                "orderUuid" => $row->order_uuid,
                "key" => create_order_key($row->id, $row->order_uuid, $row->confirmation_email),
                "title" => $row->title . ($row->name == null ? "" : (" / " . $row->name)),
                "status" => $row->status,
                "paid" => ($row->status == 'PAID' ? "\"Yes\"" : "\"No\""),
                "amount" => $row->amount,
                "for" => $row->for_name,
                "email_address" => $row->email_address,
                "item_status" => $row->item_status,
                "payment_method" => format_payment_type_for_display($row->payment_method, $locale)
            );
            if ($row->con_id != $conData->id) {
                if (!array_key_exists($row->con_id, $cons)) {
                    $temp = ConInfo::findById($db, $row->con_id);
                    $cons[$row->con_id] = $temp;
                }
                $nextCon = $cons[$row->con_id];
                $current['deferred'] = array("name" => $nextCon->name);
            }
            if ($row->finalized_date) {
                $date = convert_database_date_to_date($row->finalized_date);
                $current['finalized_date'] = date_format($date, 'c');
                $current['finalized_date_simple'] = date_format($date, 'M j H:i T');
            }
            array_push($items, $current);
        }
        mysqli_stmt_close($stmt);
        return $items;
    } else {
        throw new DatabaseSqlException("Select failed: $query");
    }
}

function count_registrations($conData, $db, $term) {
    $filterQuery = filter_clause($db, $term);

    $query = <<<EOD
    SELECT
            count(*) as row_count
    FROM
            reg_order o
    LEFT OUTER JOIN reg_order_item i
            ON
                o.id = i.order_id
    LEFT OUTER JOIN reg_offering off
            ON
                i.offering_id = off.id
    WHERE (o.con_id  = ? or off.con_id = ?)
      AND o.status != 'IN_PROGRESS'
        $filterQuery
    ORDER BY o.finalized_date, o.id, i.id
    EOD;

    $stmt = mysqli_prepare($db, $query);
    mysqli_stmt_bind_param($stmt, "ii", $conData->id, $conData->id);
    if (mysqli_stmt_execute($stmt)) {

        $count = 0;
        $result = mysqli_stmt_get_result($stmt);
        while ($row = mysqli_fetch_object($result)) {
            $count = $row->row_count;
        }
        mysqli_stmt_close($stmt);
        return $count;
    } else {
        throw new DatabaseSqlException("Select failed: $query");
    }
}

function determine_links($baseUrl, $items, $count, $PAGE_SIZE, $conId) {
    $links = array();
    if (count($items) < $count) {
        $totalPages = floor(($count + $PAGE_SIZE - 1) / $PAGE_SIZE);
        $links['start'] = $baseUrl . 'page=0';
        $links['end'] = $baseUrl . 'page=' . ($totalPages -1);

        for ($i = 0; $i < $totalPages; $i++) {
            $links[$i+1] = $baseUrl . 'page=' . $i . ($conId != null ? ("&conId=" . $conId) : "");
        }
    }
    return $links;
}

$ini = read_ini();
$db = connect_to_db($ini);
try {
    $conId = array_key_exists("conId", $_REQUEST) ? $_REQUEST["conId"] : null;
    $conData = $conId != null ? ConInfo::findById($db, $conId) : ConInfo::findCurrentCon($db);

    $PAGE_SIZE = 50;
    $term = array_key_exists('term', $_REQUEST) ? $_REQUEST['term'] : null;
    $page = array_key_exists('page', $_REQUEST) ?$_REQUEST['page'] : null;
    if (!$page) {
        $page = 0;
    } else {
        $page = ctype_digit($page) ? intval($page) : 0;
    }

    $count = count_registrations($conData, $db, $term);
    $items = find_registrations($conData, $db, $term, $page, $PAGE_SIZE);

    if ($_SERVER['REQUEST_METHOD'] === 'GET' && !jwt_validate_token(jwt_from_header(), $ini['jwt']['key'])) {
        http_response_code(401);
    } else if ($items === false) {
        http_response_code(500);
    } else {
        $baseUrl = $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['SERVER_NAME'] . '/api/registrations_list.php?';
        if ($term) {
            $baseUrl = $baseUrl . 'term=' . urlencode($term) . '&';
        }
        $result = array( "items" => $items,
            "pagination" => array(
                "start" => (count($items) > 0 ? 1 + ($page * $PAGE_SIZE) : 0),
                "end" => count($items) + ($page * $PAGE_SIZE),
                "page" => $page,
                "totalRows" => $count
            ),
            "links" => determine_links($baseUrl, $items, $count, $PAGE_SIZE, $conId)
        );
        $json_string = json_encode($result);
        echo $json_string;
    }
} finally {
    $db->close();
}
?>