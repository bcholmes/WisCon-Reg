<?php
// Copyright (c) 2021 BC Holmes. All rights reserved. See copyright document for more details.
// This function supports formatting datatypes (monetary amounts, "enums", etc.) for view in the front-end.

function format_monetary_amount($value, $currency) {
    $value = number_format($value, 2);
    $amount = $currency . " " . $value;

    if ($currency === 'USD' || $currency === 'CAD') {
        $amount = $currency . " $" . $value;
    } else if ($currency === 'EUR') {
        $amount = $currency . " &euro;" . $value;
    } else if ($currency === 'GBP') {
        $amount = $currency . " &pound;" . $value;
    } else if ($currency === 'JPY') {
        $amount = $currency . " &yen;" . $value;
    }
    return $amount;
}

function format_payment_type_for_display($payment_type, $locale) {
    if ($payment_type === 'CASH') {
        return 'Cash';
    } else if ($payment_type === 'CARD') {
        return 'Credit Card';
    } else if ($payment_type === 'CHEQUE' && $locale === 'en_US') {
        return 'Check';
    } else if ($payment_type === 'CHEQUE') {
        return 'Cheque';
    } else if ($payment_type === 'NO_CHARGE') {
        return 'No Charge';
    } else {
        return 'Unknown';
    }
}

function create_order_key($order_id, $order_uuid, $confirmation_email) {
    $key = '' . $order_id . '||' . $order_uuid . '||' . $confirmation_email;
    $key = substr( hash('sha256', $key), -12);
    return $key;
}

?>