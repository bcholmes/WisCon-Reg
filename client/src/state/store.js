import { createStore, combineReducers } from 'redux'
import { ADD_AUTH_CREDENTIAL, LOGOUT, LOGOUT_WITH_MESSAGE } from './authActions';
import { ADD_STRIPE_SECRET, ADD_TO_CART, CLEAR_CART, REMOVE_FROM_CART } from './cartActions';
import { SET_OFFERINGS } from './offeringActions';
import { ADD_MESSAGE, REMOVE_MESSAGE } from './pageMessageActions';
import { v4 as uuidv4 } from 'uuid';
import { con } from './conReducer';

const offeringInitialState = {
    loading: true,
    regClosed: false,
    items: []
}

const cartInitialState = createInitialCart();

const authInitialState = {
    jwt: undefined
}

const pageMessageInitialState = {
    messages: []
}


function createInitialCart() {
    return {
        orderId: uuidv4(),
        items: []
    };
}

const pageMessage = (state = pageMessageInitialState, action) => {
    switch (action.type) {
        case ADD_MESSAGE: 
        case LOGOUT_WITH_MESSAGE:
            return {
                ...state,
                messages: [
                    ...state.messages,
                    action.payload
                ]
            }
        case REMOVE_MESSAGE: 
            return {
                ...state,
                messages: state.messages.filter(m => m && m.text !== action.payload.text && m.severity !== action.payload.severity && m.category !== action.payload.category)
            }
        default:
            return state;
    }
}

const offerings = (state = offeringInitialState, action) => {
    switch (action.type) {
        case SET_OFFERINGS: 
            return {
                ...state,
                loading: false,
                message: action.payload.message,
                items: action.payload.items || [],
                regClosed: action.payload.reg_closed
            }
        default:
            return state;
    }
};

const cart = (state = cartInitialState, action) => {
    switch (action.type) {
        case ADD_TO_CART: 
            return {
                ...state,
                items: [
                    ...state.items,
                    action.payload
                ]
            }
        case REMOVE_FROM_CART: {
            let item = action.payload;
            let newItemList = state.items.filter(e => e.itemUUID !== item.itemUUID);
            return {
                ...state,
                items: newItemList
            }
            }
        case ADD_STRIPE_SECRET:
            return {
                ...state,
                clientSecret: action.payload
            };
        case CLEAR_CART:
            return createInitialCart();
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
        case LOGOUT_WITH_MESSAGE: 
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
    auth,
    pageMessage,
    con: con
})
const store = createStore(reducer);

export default store;