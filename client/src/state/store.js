import { createStore, combineReducers } from 'redux'
import { ADD_AUTH_CREDENTIAL } from './authActions';
import { ADD_TO_CART } from './cartActions';

const cartInitialState = {
    items: [
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

const authInitialState = {}

const cart = (state = cartInitialState, action) => {
    switch (action.type) {
        case ADD_TO_CART: 
            return {
                items: [
                    ...state.items,
                    action.payload
                ]
            }
        default:
            return state;
    }
};

const auth = (state = authInitialState, action) => {
    switch (action.type) {
        case ADD_AUTH_CREDENTIAL: 
            return {
                jwt: action.payload.jwt
            }
        default:
            return state;
    }
};

const reducer = combineReducers({
    cart,
    auth
})
const store = createStore(reducer);

export default store;