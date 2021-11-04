
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
        return 'pk_test_51Ji4wMC2R9aJdAuoBn5Q1TasCjN2CFBlGLYK2aN50y1iJD7JRVEgG5AEhH6PvdQf32IYOCFfhvYavMMlBVq5atgn007JKQegmA';
    } else {
        return '';
    }
}

export const sdlc = new SdlcUtil();
