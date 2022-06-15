import axios from "axios";
import { setCurrentCon } from "./conActions";
import store from "./store";

export function fetchCurrentCon() {
    axios.get('/api/get_con_info.php')
        .then(res => {
            store.dispatch(setCurrentCon(res.data));
        })
        .catch(error => {
            let message = "The list of offerings could not be downloaded."
            store.dispatch(setCurrentCon({}, message));
        });
}
