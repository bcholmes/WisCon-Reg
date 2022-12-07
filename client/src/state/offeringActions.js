import store from './store';
import axios from 'axios';
import { sdlc } from '../util/sdlcUtil';

export const SET_OFFERINGS = 'SET_OFFERINGS';

export function fetchOfferings() {
    axios.get(sdlc.serverUrl('/api/offering_list.php'))
        .then(res => {
            store.dispatch(setOfferings(res.data));
        })
        .catch(error => {
            let message = "The list of offerings could not be downloaded."
            store.dispatch(setOfferings({}, message));
        });
}

export function setOfferings(offerings, message = null) {
    let payload = {
        ...offerings,
        message: message
     }
     return {
        type: SET_OFFERINGS,
        payload
     }
}
