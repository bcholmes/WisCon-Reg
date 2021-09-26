import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';

class CheckoutButton extends Component {

    render() {
        return (
            <div className="text-center">
                <Button variant="secondary" onClick={() => this.handleClick()}>Checkout</Button>
            </div>
        )
    }

    handleClick() {
        if (this.props.onClick) {
            this.props.onClick();
        }
    }
}

export default CheckoutButton;