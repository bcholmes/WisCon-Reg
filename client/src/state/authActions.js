
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
