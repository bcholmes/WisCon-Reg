<?php
// Copyright (c) 2018-2020 Peter Olszowka. All rights reserved. See copyright document for more details.

$date = new DateTime();
$formattedDate = date_format($date, 'Y-m-d-H.i.s');

header("Content-disposition: attachment; filename=report-" . $formattedDate . ".csv");
header('Content-type: text/csv');

echo 'Order Number, Purchase Item, Purchase Date, Amount, Name, Email, Payment Method';

?>