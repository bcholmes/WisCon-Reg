
export const ADD_TO_CART = 'ADD_TO_CART';

export function addToCart(offering, name, email, amount) {
   let payload = {
      offering: offering,
      for: name,
      email: email,
      amount: amount
   }
   return {
      type: ADD_TO_CART,
      payload
   }
}
