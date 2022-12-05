import React, { Component } from 'react';
import { connect } from "react-redux";
import axios from 'axios';

import Spinner from 'react-bootstrap/Spinner';
import store from '../state/store'
import { removeFromCart } from '../state/cartActions';
import { addMessage } from '../state/pageMessageActions';
import { formatAmount } from '../util/numberUtil';

class Cart extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: null
        }
    }

    render() {
        let count = this.props.cart.length;
        let total = 0;
        let currency = undefined;
        let itemList = this.props.cart.map((e, i) => {
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
                        <h6 className="my-0">{this.renderItemTitle(e)}</h6>
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
                    <h6 className="my-0">{'Total (' + currency + ')'}</h6>
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

    renderItemTitle(item) {
        if (item.values?.variantId != null) {
            let title = item.offering?.title;
            let variant = item.offering?.variants?.filter(v => v.id?.toString() === item.values?.variantId);
            if (variant?.length) {
                return title + " / " + variant[0].name;
            } else {
                return title;
            }
        } else {
            return item.offering?.title;
        }
    }

    removeFromCart(item) {
        this.setState({
            ...this.state,
            loading: item.itemUUID
        });

        axios.post('/api/remove_item.php', {
            "orderId": store.getState().cart.orderId,
            "itemId": item.itemUUID
        })
        .then(res => {
                store.dispatch(removeFromCart(item) );
            })
        .catch(error => {
                store.dispatch(addMessage({severity: "danger", text: "There was a problem talking to the server.", category: "http" }));
                this.setState({
                    ...this.state,
                    loading: null
                });
            });
    }
}

function mapStateToProps(state, ownProps) {
    return {
        cart: state.cart.items
    };
}

export default connect(mapStateToProps)(Cart);