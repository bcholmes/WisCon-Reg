import store from './store';

export const ADD_TO_CART = 'ADD_TO_CART';
export const REMOVE_FROM_CART = 'REMOVE_FROM_CART';
export const CLEAR_CART = 'CLEAR_CART';
export const ADD_STRIPE_SECRET = 'ADD_STRIPE_SECRET';

export function addToCart(offering, name, values, uuid, amount, variant) {
   let payload = {
      offering: offering,
      variant: variant,
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

export function removeFromCart(item) {
   return {
      type: REMOVE_FROM_CART,
      payload: item
   }
}

export function clearCart() {
   return {
      type: CLEAR_CART
   }
}

export function addStripeSecret(clientSecret) {
   return {
      type: ADD_STRIPE_SECRET,
      payload: clientSecret
   }
}


export function calculateTotal() {
   let currency = 'USD';
   let total = 0;
   store.getState().cart.items.forEach(e => {
       total += e.amount;
       currency = e.offering.currency;
   });

   return {
       currency: currency,
       amount: total
   }
}

