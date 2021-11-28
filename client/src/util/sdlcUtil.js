import { TEST_STRIPE_PUBLIC_KEY, PROD_STRIPE_PUBLIC_KEY } from "./secrets";

const hostname = window && window.location && window.location.hostname;

class SdlcUtil {

    hostPrefix() {
        if (hostname === 'localhost') {
            return 'https://wisconregtest.bcholmes.org/';
        } else {
            return 'https://' + hostname + '/';
        }
    }
    
    serverUrl(path) {
        if (path.indexOf('/') === 0) {
            return this.hostPrefix() + path.substring(1);
        } else {
            return this.hostPrefix() + path;
        }
    }
    
    passwordResetUrl() {
        if (isTestEnvironment()) {
            return 'https://wiscontest.bcholmes.org/ForgotPassword.php';
        } else {
            return 'https://program.wiscon.net/ForgotPassword.php';
        }
    }
}


function isTestEnvironment() {
    if (hostname === 'reg.wiscon.net') {
        return false;
    } else {
        return true;
    }
}

export function stripePublicKey() {
    if (isTestEnvironment()) {
        return TEST_STRIPE_PUBLIC_KEY;
    } else {
        return PROD_STRIPE_PUBLIC_KEY;
    }
}

export const sdlc = new SdlcUtil();
