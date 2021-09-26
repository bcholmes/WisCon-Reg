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
        let message = count <= 0 ? (<div className="text-muted mb-3">You have no items in your cart.</div>) : undefined;

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