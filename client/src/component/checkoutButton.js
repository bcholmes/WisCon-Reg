import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';

class CheckoutButton extends Component {

    render() {
        return (
            <div className="text-center">
                <Button variant="secondary">Checkout</Button>
            </div>
        )
    }
}

export default CheckoutButton;