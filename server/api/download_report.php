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
require_once("format_functions.php");
require_once("jwt_functions.php");
require_once("con_info.php");

function yes_no($value) {
    if ($value === 'Y') {
        return 'Yes';
    } else {
        return 'No';
    }
}

$ini = read_ini();
try {
    $db = connect_to_db($ini);
    try {

        $conId = array_key_exists("conId", $_REQUEST) ? $_REQUEST["conId"] : null;

        $conData = find_current_con_with_db($db);
        $requestedConData = $conId ? ConInfo::findById($db, $conId) : ConInfo::findCurrentCon($db);

        $date = new DateTime();
        $formattedDate = date_format($date, 'Y-m-d-H.i.s');
        $locale = locale_accept_from_http($_SERVER['HTTP_ACCEPT_LANGUAGE']);

        if ($_SERVER['REQUEST_METHOD'] === 'GET' && !jwt_validate_token(jwt_from_header(), $ini['jwt']['key'])) {
            http_response_code(401);
        } else {
            $query = <<<EOD
        SELECT
                o.id, o.confirmation_email, o.status, o.payment_method, o.finalized_date, i.for_name, i.email_address, i.amount, off.title,
                i.email_ok, i.volunteer_ok, i.snail_mail_ok, off.add_prompts, i.age, off.age_required, i.status as item_status,
                o.con_id, o.at_door_payment_method, v.name as option_name
        FROM
                reg_order o
        LEFT OUTER JOIN reg_order_item i
                ON
                    o.id = i.order_id
        LEFT OUTER JOIN reg_offering_variant v
                ON
                    v.id = i.variant_id
        LEFT OUTER JOIN reg_offering off
        ON
            i.offering_id = off.id
            WHERE (o.con_id = ? or off.con_id = ?)
            AND o.status != 'IN_PROGRESS'
        ORDER BY o.finalized_date, o.id, i.id
    EOD;

            $stmt = mysqli_prepare($db, $query);
            mysqli_stmt_bind_param($stmt, "ii", $requestedConData->id, $requestedConData->id);
            if (mysqli_stmt_execute($stmt)) {

                header("Content-disposition: attachment; filename=" . str_replace(' ', '_', strtolower($requestedConData->name)) .  "-registration-" . $formattedDate . ".csv");
                header('Content-type: text/csv');
                echo 'Order Number, Confirmation Sent To, Purchase Item, Variant, Check-out Date, Paid, Amount, Name, Email, Payment Method, Send Email, Volunteer, Snail Mail OK, Age of Child';
                echo "\n";

                $result = mysqli_stmt_get_result($stmt);
                $cons = array();
                while ($row = mysqli_fetch_object($result)) {
                    $paid = 'No';
                    if ($row->status === 'CANCELLED' || $row->item_status === 'CANCELLED') {
                        $paid = 'Cancelled';
                    } else if ($row->status === 'REFUNDED' || $row->item_status === 'REFUNDED') {
                        $paid = 'Refunded';
                    } else if ($row->status === 'PAID' && $row->at_door_payment_method) {
                        $paid = 'Yes (' . format_payment_type_for_display($row->at_door_payment_method, $locale) . ")";
                    } else if ($row->status === 'PAID') {
                        $paid = 'Yes';
                    }

                    echo "\"" . $row->id . "\",\"" . $row->confirmation_email . "\",\"" . $row->title . "\",\"" .
                        ($row->option_name ? $row->option_name  : "") . "\",\"" . $row->finalized_date . "\"," .
                        $paid . ',' . $row->amount . ",\"" . $row->for_name . "\",\"" . $row->email_address . "\",\"" .
                        format_payment_type_for_display($row->payment_method, $locale) . "\"";
                    if ($row->add_prompts == 'N') {
                        echo ",\"\",\"\",\"\"";
                    } else {
                        echo ",\"" . ($row->email_ok == null ? "No" : yes_no($row->email_ok)) . "\",\"" .
                            ($row->volunteer_ok == null ? "No" : yes_no($row->volunteer_ok)) . "\",\"" .
                            ($row->snail_mail_ok == null ? "No" : yes_no($row->snail_mail_ok)) . "\"";
                    }
                    if ($row->age_required == 'N') {
                        echo ",\"\"";
                    } else {
                        echo ",\"" . $row->age . "\"";
                    }
                    if ($row->con_id != $requestedConData->id) {
                        if (array_key_exists($row->con_id, $cons)) {
                            $otherCon = ConInfo::findById($db, $row->con_id);
                            $cons[$otherCon->id] = $otherCon;
                            unset($otherCon);
                        }

                        $otherCon = $cons[$row->con_id];

                        echo ",\"" . $otherCon->name . "\"";
                    } else {
                        echo ",\"" . $requestedConData->name . "\"";
                    }
                    echo "\n";
                }
                mysqli_stmt_close($stmt);
            } else {
                throw new DatabaseSqlException();
            }
        }
    } finally {
        mysqli_close($db);
    }
} catch (Exception $ex) {
    error_log($ex->getMessage());
    http_response_code(500);
}

?>