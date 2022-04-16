<?php

class StripeException extends Exception {};

class StripeHelper {

    public $ini;

    function __construct($ini) {
        $this->ini = $ini;
    }

    function refundAll($order) {
        \Stripe\Stripe::setApiKey(
            $this->ini['stripe']['secret_key']
        );
    
        $re = \Stripe\Refund::create(['payment_intent' =>  $order->payment_intent_id ]);
        if ($re->status === 'succeeded') {
            return true;
        } else {
            error_log('Invalid response from Stripe: ' . $re->status);
            throw new StripeException($re->status);
        }
    }

    function refundPartialAmount($order, $amountInCents) {
        \Stripe\Stripe::setApiKey(
            $this->ini['stripe']['secret_key']
        );
    
        $re = \Stripe\Refund::create(['payment_intent' =>  $order->payment_intent_id, 'amount' => $amountInCents ]);
        if ($re->status === 'succeeded') {
            return true;
        } else {
            error_log('Invalid response from Stripe: ' . $re->status);
            throw new StripeException($re->status);
        }
    }
}

?>