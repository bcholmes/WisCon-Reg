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
// This function supports formatting datatypes (monetary amounts, "enums", etc.) for view in the front-end.

function get_client_locale() {
    $locale = array_key_exists('HTTP_ACCEPT_LANGUAGE', $_SERVER) ? locale_accept_from_http($_SERVER['HTTP_ACCEPT_LANGUAGE']) : locale_get_default();
    return $locale;
}

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