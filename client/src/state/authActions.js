
export const ADD_AUTH_CREDENTIAL = 'ADD_AUTH_CREDENTIAL';

export function addAuthCredential(jwt) {
   let payload = {
      jwt: jwt
   }
   return {
      type: ADD_AUTH_CREDENTIAL,
      payload
   }
}
