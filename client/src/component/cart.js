import React, { Component } from 'react';

class Cart extends Component {

    render() {
        return [
            <h5 className="d-flex justify-content-between align-items-center mb-3 text-primary">
                <span>Your cart</span>
            </h5>,
            <div className="text-muted mb-3">You have no items in your cart.</div>
        ];
    }
}

export default Cart;