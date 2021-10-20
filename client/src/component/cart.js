import React, { Component } from 'react';
import store from '../state/store'
import { formatAmount } from '../util/numberUtil';

class Cart extends Component {

    constructor(props) {
        super(props);

        this.state = {
            cart: store.getState().cart.items
        }

        this.unsubscribe = store.subscribe(() => {
            this.setState({
                cart: store.getState().cart.items
            });
        });
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    render() {
        let count = this.state.cart.length;
        let total = 0;
        let itemList = this.state.cart.map((e, i) => {
            total += e.amount;
            return <li className="list-group-item d-flex justify-content-between lh-sm" key={i}>
                <div>
                    <h6 className="my-0">{e.offering.title}</h6>
                    <small className="text-muted">{e.for}</small>
                </div>
                <span className="text-muted">{formatAmount(e.amount)}</span>
            </li>
        });
        let message = count <= 0 
            ? (<div className="text-muted mb-3">You have no items in your cart.</div>) 
            : (<ul className="list-group mb-3">
                {itemList}
                <li className="list-group-item d-flex justify-content-between lh-sm" key="total">
                    <h6 className="my-0">Total (USD)</h6>
                    <strong>{formatAmount(total)}</strong>
                </li>
            </ul>);

        return (<div>
            <h5 className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-primary">Your cart</span>
                <span className="badge bg-primary rounded-pill text-white">{count}</span>
            </h5>
            {message}
        </div>);
    }
}

export default Cart;