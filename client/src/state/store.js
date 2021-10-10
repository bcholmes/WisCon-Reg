import { createStore, combineReducers } from 'redux'
import { ADD_AUTH_CREDENTIAL, LOGOUT } from './authActions';
import { ADD_TO_CART } from './cartActions';
import { SET_OFFERINGS } from './offeringActions';


const offeringInitialState = {
    loading: true,
    reg_closed: false,
    items: []
}


const cartInitialState = {
    items: []
};

const authInitialState = {
    jwt: undefined
}

const offerings = (state = offeringInitialState, action) => {
    switch (action.type) {
        case SET_OFFERINGS: 
            return {
                ...state,
                loading: false,
                message: action.payload.message,
                items: action.payload.items,
                reg_closed: action.payload.reg_closed
            }
        default:
            return state;
    }
};

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
        case LOGOUT: 
            return {
                jwt: undefined
            };
        default:
            return state;
    }
};

const reducer = combineReducers({
    offerings,
    cart,
    auth
})
const store = createStore(reducer);

export default store;