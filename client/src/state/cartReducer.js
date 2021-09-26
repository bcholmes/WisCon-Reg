import { createStore } from 'redux'
import { ADD_TO_CART } from './cartActions';

const initialState = {
    cart: [
        {
            offering: {
                title: "Adult Membership"
            },
            for: "Sam Carruthers",
            amount: 65.00
        },
        {
            offering: {
                title: "Adult Membership"
            },
            for: "Brad Carruthers",
            amount: 65.00
        }
    ]
};

const cartReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_TO_CART: 
            return {
                cart: [
                    ...state.cart,
                    action.payload
                ]
            }
        default:
            return state;
    }
};

const store = createStore(cartReducer);

export default store;