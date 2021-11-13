import React, { Component } from 'react';

import axios from 'axios';

import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';

import { withRouter } from "react-router";

import { sdlc } from '../util/sdlcUtil';
import {formatAmount} from '../util/numberUtil';

class OrderSummary extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: true
        };
        this.fetchOrder(this.props.orderId, this.props.orderKey);
    }

    render() {
        let content = undefined;
        if (this.state.loading) {
            content = (
                    <div className="text-center">
                        <Spinner animation="border" />
                    </div>
            );
        } else if (this.state.message) {
            content = (
                <Alert variant="danger">{this.state.message}</Alert>
            );
        } else if (this.state.order) {
            let total = 0;
            let currency = 'USD';

            for (let i = 0; i < this.state.order.items.length; i++) {
                const item = this.state.order.items[i];
                total += (parseFloat(item.amount) || 0);
                currency = item.currency;
            }

            let rows = this.state.order.items ? this.state.order.items.map((item, i) => {
                return (<tr key={i}>
                    <td>{item.title}</td>
                    <td>{item.for}</td>
                    <td>{item.emailAddress}</td>
                    <td className="text-right"><small className="text-muted">{item.currency}</small> {formatAmount(item.amount, item.currency)}</td>
                </tr>)
            }) : undefined;
            content = (
                <section>
                    <h1>Order Number #{this.state.order.orderId}</h1>
                    <table className="mb-3">
                        <tbody>
                            <tr>
                                <th className="pr-2">Order Date: </th><td> <time dateTime={this.state.order.finalizedDate}>{this.state.order.finalizedDateSimple}</time></td>
                            </tr><tr>
                                <th className="pr-2">Payment method: </th><td> {this.state.order.paymentMethod}</td>
                            </tr><tr>
                                <th className="pr-2">Confirmation email: </th><td> {this.state.order.confirmationEmail}</td>
                            </tr>
                        </tbody>
                    </table>

                    <table className="table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>For</th>
                                <th>Email</th>
                                <th className="text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="3"><b>Total</b></td>
                                <td className="text-right"><small className="text-muted">{currency}</small> <b>{formatAmount(total, currency)}</b></td>
                            </tr>
                        </tfoot>
                    </table>
                </section>
            );
        } else {
            content = (
                <Alert variant="danger">Whoa! I don't know how we got here, but something really odd happened, and everything's broken.</Alert>
            );
        }

        return content;
    }

    fetchOrder(orderId, key) {
        axios.get(sdlc.serverUrl('/api/review_order.php') + '?orderId=' + orderId + '&key=' + key)
            .then(res => {
                this.setState({
                    loading: false,
                    message: undefined, 
                    order: res.data
                })
            })
            .catch(error => {
                let message = "There was an error trying to get the specified order."
                this.setState({
                    loading: false,
                    message: message
                })
            });
    }
}

export default withRouter(OrderSummary);