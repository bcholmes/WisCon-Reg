
export const ADD_AUTH_CREDENTIAL = 'ADD_AUTH_CREDENTIAL';
export const LOGOUT = 'LOGOUT';

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
 