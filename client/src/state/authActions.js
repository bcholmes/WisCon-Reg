import store from "./store";

export const ADD_AUTH_CREDENTIAL = 'ADD_AUTH_CREDENTIAL';
export const LOGOUT = 'LOGOUT';
export const LOGOUT_WITH_MESSAGE = 'LOGOUT_WITH_MESSAGE';

export function addAuthCredential(jwt) {
   let payload = {
      jwt: jwt
   }
   return {
      type: ADD_AUTH_CREDENTIAL,
      payload
   }
}
export function logout() {
    return {
       type: LOGOUT
    }
}
export function logoutWithMessage(message) {
   return {
      type: LOGOUT_WITH_MESSAGE,
      payload: message
   }
}

export function isAdmin() {
   if (store.getState().auth.jwt) {
      let jwt = store.getState().auth.jwt;
      let parts = jwt.split('.');
      if (parts.length === 3) {
            let payload = JSON.parse(atob(parts[1]));
            let scopes = payload['scope'];
            return scopes && scopes.indexOf('Registration') >= 0;
      } else {
            return false;
      }
   }
}