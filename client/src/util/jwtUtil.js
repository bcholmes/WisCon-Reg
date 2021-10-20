import store from '../state/store'

export function isAuthenticated() {
    return (store.getState().auth && store.getState().auth.jwt) ? true : false;
}
