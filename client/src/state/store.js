import { createStore, combineReducers } from 'redux'
import { ADD_AUTH_CREDENTIAL, LOGOUT } from './authActions';
import { ADD_TO_CART } from './cartActions';
import { SET_OFFERINGS } from './offeringActions';


const offeringInitialState = {
    loading: true,
    reg_closed: false,
    items: [
        {
            id: 1,
            title: "Former GoH",
            currency: "USD",
            suggestedPrice: 0,
            emphasis: false,
            highlights: [ "Available to previous Guests of Honor" ],
            description: "Available only to previous Guests of Honor.",
            emailRequired: true,
            membershipType: true,
            addPrompts: true
        },
        {
            id: 2,
            title: "Adult Membership",
            currency: "USD",
            suggestedPrice: 65.00,
            emphasis: true,
            highlights: [ "Full Weekend (Thu-Mon)", "Ages 19+" ],
            description: "Our standard membership for adult guests (anyone 19 or older as of 2022-05-30/Memorial Day, last day of the convention).",
            emailRequired: true,
            membershipType: true,
            addPrompts: true
        },
        {
            id: 3,
            title: "Teen Membership",
            currency: "USD",
            suggestedPrice: 20.00,
            emphasis: false,
            highlights: [ "Full Weekend (Thu-Mon)", "Ages 13-18" ],
            description: "Our weekend membership for teen guests (anyone 13 to 18 as of 2022-05-30/Memorial Day, last day of the convention).",
            emailRequired: false,
            membershipType: true,
            addPrompts: true
        },
        {
            id: 4,
            title: "Youth Membership",
            currency: "USD",
            suggestedPrice: 20.00,
            emphasis: false,
            highlights: [ "Full Weekend (Thu-Mon)", "Ages 7-12" ],
            description: "Our weekend membership for young guests (anyone 7 to 12 as of 2022-05-30/Memorial Day, last day of the convention).",
            emailRequired: false,
            membershipType: true,
            addPrompts: false
        },
        {
            id: 5,
            title: "Wiscon Child Care",
            currency: "USD",
            suggestedPrice: 0.00,
            emphasis: false,
            highlights: [ "On-site daytime child care by licensed providers (Thu-Mon)", "Ages 0-6" ],
            description: "Child Membership (Ages 0–6) for WisCon 45 in May 2022. Includes on-site child care by licensed providers during the day, on each day of the convention (check wiscon.net for details and hours).",
            emailRequired: false,
            membershipType: true,
            addPrompts: false
        },
        {
            id: 6,
            title: "Supporting Membership",
            currency: "USD",
            suggestedPrice: 25.00,
            emphasis: false,
            highlights: [ "A non-attending membership", "Receive printed materials, by mail" ],
            description: "A non-attending membership for the convention. Supporting Members will receive any announcements and mailings sent to the general membership, as well as a physical copy of our program and souvenir book (requires a mailing address).",
            emailRequired: true,
            membershipType: true,
            addPrompts: true
        },
        {
            id: 7,
            title: "Dessert Ticket",
            currency: "USD",
            suggestedPrice: 35.00,
            emphasis: false,
            highlights: [ "Sunday Evening Dessert Salon", "Two desserts" ],
            description: "Ticket for the Dessert Salon on Sunday evening of WisCon 45 in 2020, including two desserts from the buffet. (Proceeds from the Dessert Salon help to offset the costs of other aspects of the convention.)",
            emailRequired: true,
            membershipType: false,
            addPrompts: false
        },
        {
            id: 8,
            title: "Donate to Wiscon/SF3",
            currency: "USD",
            suggestedPrice: undefined,
            emphasis: false,
            highlights: [ "Donations to the general fund for SF3, WisCon's parent organization." ],
            emailRequired: true,
            membershipType: false,
            addPrompts: false
        },
        {
            id: 9,
            title: "Donate to WMAF",
            currency: "USD",
            suggestedPrice: undefined,
            emphasis: false,
            highlights: [ "The WisCon Member Assistance Fund supports anyone who needs financial assistance to attend" ],
            emailRequired: true,
            membershipType: false,
            addPrompts: false
        }
    ]
}


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