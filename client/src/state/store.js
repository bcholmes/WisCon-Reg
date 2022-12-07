import { createStore, combineReducers } from 'redux'
import { ADD_AUTH_CREDENTIAL, LOGOUT, LOGOUT_WITH_MESSAGE } from './authActions';
import { SET_OFFERINGS } from './offeringActions';
import { ADD_MESSAGE, REMOVE_MESSAGE } from './pageMessageActions';
import { con } from './conReducer';
import { cart } from './cartReducer';

const offeringInitialState = {
    loading: true,
    regClosed: false,
    items: []
}



const authInitialState = {
    jwt: undefined
}

const pageMessageInitialState = {
    messages: []
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
    auth,
    pageMessage,
    cart: cart,
    con: con
})
const store = createStore(reducer);

export default store;