import { ADD_STRIPE_SECRET, ADD_TO_CART, CLEAR_CART, REMOVE_FROM_CART } from "./cartActions";
import { v4 as uuidv4 } from 'uuid';

const cartInitialState = createInitialCart();

function createInitialCart() {
    return {
        orderId: uuidv4(),
        items: []
    };
}

export const cart = (state = cartInitialState, action) => {
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