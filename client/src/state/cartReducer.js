import { createStore } from 'redux'

const cartReducer = (state, action) => {
    return { 
        cart: [
            "fred",
            "barney"
        ]
    };
};

const store = createStore(cartReducer);

export default store;