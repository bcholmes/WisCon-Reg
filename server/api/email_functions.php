<?php

require_once('../vendor/autoload.php');

function send_email($body, $subject, $to, $cc = null) {
    $ini = read_ini();
    $mailer = create_mail_sender($ini);

    //Create the message and set subject
    $message = (new Swift_Message($subject));
    $message->setBody($body,'text/html');

    //Define from address
    $message->setFrom([ $ini['email']['from_email'] => $ini['email']['from_name'] ] );

    if ($ini['email']['reg_email'] && $ini['email']['reg_name']) {
        $message->setReplyTo([ $ini['email']['reg_email'] => $ini['email']['reg_name'] ] );
    }

    $ok = true;
    try {
        $message->addTo($to);
    } catch (Swift_SwiftException $e) {
        $ok = FALSE;
    }

    if ($ok) {
        try {
            $sendMailResult = $mailer->send($message);
        } catch (Swift_TransportException $e) {
            $ok = FALSE;
            error_log("Swift transport exception: send email failed.");
        } catch (Swift_SwiftException $e) {
            $ok = FALSE;
            error_log("Swift exception: send email failed.");
        }
    }
}

function create_mail_sender($ini) {
    //Create the Transport
    if (empty($ini['email']['protocol'])) {
        $transport = (new Swift_SmtpTransport($ini['email']['address'], $ini['email']['port']));
    } else {
        $transport = (new Swift_SmtpTransport($ini['email']['address'], $ini['email']['port'], $ini['email']['protocol']));
    }
    if (!empty($ini['email']['user'])) {
        $transport->setUsername($ini['email']['user']);
    }
    if (!empty($ini['email']['password'])) {
        $transport->setPassword($ini['email']['password']);
    }

    return new Swift_Mailer($transport);
}
?>