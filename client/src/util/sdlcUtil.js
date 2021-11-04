
const hostname = window && window.location && window.location.hostname;

function hostPrefix() {
    if (hostname === 'localhost') {
        return 'https://wisconregtest.bcholmes.org/';
    } else {
        return 'https://' + hostname + '/';
    }
}

export function serverUrl(path) {
    if (path.indexOf('/') === 0) {
        return hostPrefix() + path.substring(1);
    } else {
        return hostPrefix() + path;
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
