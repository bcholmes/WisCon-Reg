export const SET_CON_LIST = 'SET_CON_LIST';
export const SET_CURRENT_CON = 'SET_CURRENT_CON';

export function setCurrentCon(con, message = null) {
    let payload = {
        currentCon: con,
        message: message
     }
     return {
        type: SET_CURRENT_CON,
        payload
     }
}

export function setConList(list) {
    let payload = {
        cons: list
     }
     return {
        type: SET_CON_LIST,
        payload
     }
}