import { createStore } from 'redux'

const cartReducer = (state, action) => {
    return { 
        cart: [
            {
                offering: {
                    name: "Adult Membership"
                },
                for: "Sam Carruthers",
                amount: 65.00
            },
            {
                offering: {
                    name: "Adult Membership"
                },
                for: "Brad Carruthers",
                amount: 65.00
            }
        ]
    };
};

const store = createStore(cartReducer);

export default store;