<?php

class Authentication {

    /**
     * Checks to see if the user is validly registered.
     */
    public static function isRegistration($ini) {
        return jwt_validate_token(jwt_from_header(), $ini['jwt']['key'], 'Registration');
    }
}

?>