export const ADD_MESSAGE = 'ADD_MESSAGE';
export const REMOVE_MESSAGE = 'REMOVE_MESSAGE';

export function addMessage(message) {
    let payload = message;
    return {
       type: ADD_MESSAGE,
       payload: payload
    }
}

export function removeMessage(message) {
    let payload = message;
    return {
       type: REMOVE_MESSAGE,
       payload: payload
    }
}