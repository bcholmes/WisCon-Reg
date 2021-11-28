import React, { Component } from 'react';

import axios from 'axios';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';

import store from '../state/store'
import { withRouter } from "react-router";

import {formatAmount} from '../util/numberUtil';

class AdminOrderSummary extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            updateMode: false,
            values: {}
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
        } else if (this.state.order && this.state.order.status === 'CANCELLED') {
            content = (
                <Alert variant="info">This order has been cancelled.</Alert>
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


            let updateForm = (this.state.updateMode) 
                ? (<Form onSubmit={(e) => this.updateOrder(e)}>
                    <Form.Group controlId="action" className="row">
                        <div className="offset-md-3 col-md-6">
                            <Form.Label>Update action:</Form.Label>
                            <Form.Control as="select" onChange={(e) => this.setFormValue("action", e.target.value)} key="action">
                                <option value="">Choose...</option>
                                {this.allUpdateActions().map(e => { return (<option value={e.value} key={e.value}>{e.text}</option>); } )}
                            </Form.Control>
                        </div>
                    </Form.Group>

                    <div className="text-right">
                        <Button variant="link" onClick={() => this.updateMode(false)} >
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" className="ml-3" key="update-button" disabled={!this.state.values['action']}>
                            Update
                        </Button>
                    </div>
                </Form>)
                : (<div className="text-right">
                <Button variant="outline-primary" onClick={() => this.updateMode(true)} key="update-button">
                    Update
                </Button>
            </div>);

            let paymentDate = this.state.order.paymentDate ? (<time dateTime={this.state.order.paymentDate}>{this.state.order.paymentDateSimple}</time>) : undefined;
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
                                <th className="pr-2">Paid: </th><td> {this.state.order.status === 'PAID' ? 'Yes' : 'No'}</td>
                            </tr><tr>
                                <th className="pr-2">Payment date: </th><td>{paymentDate}</td>
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
                    {updateForm}
                </section>
            );
        } else {
            content = (
                <Alert variant="danger">Whoa! I don't know how we got here, but something really odd happened, and everything's broken.</Alert>
            );
        }

        return content;
    }

    updateMode(value) {
        this.setState({
            ...this.state,
            updateMode: value
        })
    }

    setFormValue(formName, formValue) {
        let value = this.state.values;
        let newValue = { ...value };
        newValue[formName] = formValue;
        console.log(newValue);
        this.setState({
            ...this.state,
            values: newValue
        });
    }

    allUpdateActions() {
        if (this.state.order) {
            let result = [];
            if (this.state.order.status !== 'PAID') {
                result.push({ "value": "MARK_AS_PAID", "text": "Mark as paid"});
                result.push({ "value": "CANCEL", "text": "Cancel order"});
            } else if (this.state.order.paymentMethodKey === 'CARD') {
                result.push({ "value": "REFUND", "text": "Refund credit card"});
                result.push({ "value": "DEFER", "text": "Defer to next year"});
            } else {
                result.push({ "value": "REFUND", "text": "Refund (manual return)"});
                result.push({ "value": "DEFER", "text": "Defer to next year"});
            }
            return result;
        } else {
            return [];
        }
    }

    updateOrder(e) {
        e.preventDefault();
        e.stopPropagation();

        axios.post('/api/update_order.php', { ...this.state.values, orderId: this.state.order.orderUuid }, {
            headers: {
                "Authorization": "Bearer " + store.getState().auth.jwt
            }
        })
        .then(res => {
            if (this.props.onUpdate) {
                this.props.onUpdate();
            }
        })
        .catch(error => {
            let message = "There was an error trying to get the specified order."
            this.setState({
                loading: false,
                message: message
            })
        });
    }

    fetchOrder(orderId, key) {
        axios.get('/api/review_order.php' + '?orderId=' + orderId + '&key=' + key)
            .then(res => {
                this.setState({
                    loading: false,
                    message: undefined, 
                    order: res.data,
                    updateMode: false
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

export default withRouter(AdminOrderSummary);