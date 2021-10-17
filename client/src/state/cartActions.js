
export const ADD_TO_CART = 'ADD_TO_CART';
export const CLEAR_CART = 'CLEAR_CART';

export function addToCart(offering, name, values, uuid, amount) {
   let payload = {
      offering: offering,
      for: name,
      values: values,
      amount: amount,
      itemUUID: uuid
   }
   return {
      type: ADD_TO_CART,
      payload
   }
}

export function clearCart() {
   return {
      type: CLEAR_CART
   }
}