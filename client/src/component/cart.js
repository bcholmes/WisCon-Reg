import React, { Component } from 'react';
import axios from 'axios';

import Spinner from 'react-bootstrap/Spinner';
import store from '../state/store'
import { removeFromCart } from '../state/cartActions';
import { formatAmount } from '../util/numberUtil';
import { sdlc } from '../util/sdlcUtil';

class Cart extends Component {

    constructor(props) {
        super(props);

        this.state = {
            cart: store.getState().cart.items,
            loading: null
        }

        this.unsubscribe = store.subscribe(() => {
            this.setState({
                cart: store.getState().cart.items,
                loading: null
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
        let currency = undefined;
        let itemList = this.state.cart.map((e, i) => {
            if (this.state.loading === e.itemUUID) {
                return (<li className="list-group-item d-flex justify-content-between lh-sm text-center pb-2" key={i}>
                    <div className="text-center w-100">
                        <Spinner animation="border" />
                    </div>
                </li>);
            } else {
                total += e.amount;
                currency = e.offering.currency;
                let removeButton = this.props.edit ? (<button className="btn p-0" onClick={() => this.removeFromCart(e)}><i className="bi-trash text-danger"></i></button>) : undefined;
                return (<li className="list-group-item d-flex justify-content-between lh-sm visible-on-hover pb-2" key={i}>
                    <div>
                        <h6 className="my-0">{e.offering.title}</h6>
                        <small className="text-muted">{e.for}</small>
                    </div>
                    <div>
                        <div className="text-right"><span className="text-muted">{formatAmount(e.amount, e.offering.currency)}</span></div>
                        <div className="text-right" style={{ 'minHeight': '1.75rem'}}>{removeButton}</div>
                    </div>
                </li>);
            }
        });
        let message = count <= 0 
            ? (<div className="text-muted mb-3">You have no items in your cart.</div>) 
            : (<ul className="list-group mb-3">
                {itemList}
                <li className="list-group-item d-flex justify-content-between lh-sm" key="total">
                    <h6 className="my-0">Total (USD)</h6>
                    <strong>{formatAmount(total, currency)}</strong>
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

    removeFromCart(item) {
        this.setState({
            ...this.state,
            loading: item.itemUUID
        });

        axios.post(sdlc.serverUrl('/api/remove_item.php'), {
            "orderId": store.getState().cart.orderId,
            "itemId": item.itemUUID
        })
        .then(res => {
                store.dispatch(removeFromCart(item) );
            })
        .catch(error => {
                this.setState({
                    ...this.state,
                    loading: null
                });
            });
    }
}

export default Cart;