import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import store from '../state/store'

class CheckoutButton extends Component {

    constructor(props) {
        super(props);

        this.state = {
            enabled: store.getState().cart.items.length > 0
        }
    }

    componentDidMount() {
        this.unsubscribe = store.subscribe(() => {
            this.setState({
                enabled: store.getState().cart.items.length > 0
            });
        });
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    render() {
        return (
            <div className="text-center">
                <Button variant="secondary" onClick={() => this.handleClick()} disabled={!this.state.enabled}>Checkout</Button>
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