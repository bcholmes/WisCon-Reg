import { SET_CON_LIST, SET_CURRENT_CON } from "./conActions";

const conInitialState = {
    currentCon: null,
    list: null
}

export const con = (state = conInitialState, action) => {
    switch (action.type) {
        case SET_CURRENT_CON: 
            return {
                ...state,
                currentCon: action.payload.currentCon
            }
        case SET_CON_LIST: 
            return {
                ...state,
                list: action.payload.cons
            }
        default:
            return state;
    }
};