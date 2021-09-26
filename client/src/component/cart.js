import React, { Component } from 'react';
import store from '../state/cartReducer'

class Cart extends Component {

    constructor(props) {
        super(props);

        this.state = {
            cart: store.getState().cart
        }

        store.subscribe(() => {
            this.setState({
                cart: store.getState().cart
            });
        });
    }

    render() {
        let count = this.state.cart.length;
        let total = 0;
        let itemList = this.state.cart.map((e, i) => {
            total += e.amount;
            return <li className="list-group-item d-flex justify-content-between lh-sm">
                <div>
                    <h6 class="my-0">{e.offering.name}</h6>
                    <small class="text-muted">{e.for}</small>
                </div>
                <span class="text-muted">${e.amount.toFixed(0)}</span>
            </li>
        });
        let message = count <= 0 
            ? (<div className="text-muted mb-3">You have no items in your cart.</div>) 
            : (<ul className="list-group mb-3">
                {itemList}
                <li className="list-group-item d-flex justify-content-between lh-sm">
                    <h6 class="my-0">Total (USD)</h6>
                    <strong>${total.toFixed(0)}</strong>
                </li>
            </ul>);

        return [
            <h5 className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-primary">Your cart</span>
                <span className="badge bg-primary rounded-pill text-white">{count}</span>
            </h5>,
            <div>{message}</div>
        ];
    }
}

export default Cart;