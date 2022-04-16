import React, { Component } from 'react';

import axios from 'axios';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';

import store from '../state/store'
import { withRouter } from "react-router";

import SimpleAlert from './simpleAlert';

import {formatAmount} from '../util/numberUtil';
import { isAdmin } from '../state/authActions';

class AdminOrderSummary extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            updateMode: false,
            values: {}
        };
    }

    componentDidMount() {
        this.fetchOrder(this.props.orderId);
    }

    render() {
        let content = undefined;
        if (this.state.loading) {
            content = (
                    <div className="text-center">
                        <Spinner animation="border" />
                    </div>
            );
        } else if (!this.state.order && this.state.message) {
            content = (
                <SimpleAlert message={this.state.message} />
            );
        } else if (this.state.order && this.state.order.status === 'CANCELLED') {
            content = (
                <Alert variant="info">This order has been cancelled.</Alert>
            );
        } else if (this.state.order && this.state.order.status === 'REFUNDED') {
            content = (
                <Alert variant="info">This order has been refunded.</Alert>
            );
        } else if (this.state.order) {
            let total = 0;
            let currency = 'USD';

            for (let i = 0; i < this.state.order.items.length; i++) {
                const item = this.state.order.items[i];
                total += (parseFloat(item.amount) || 0);
                currency = item.currency;
            }

            let rows = this.state.order.items ? this.state.order.items.map((item, i) => this.renderOrderItemRow(item, i)) : undefined;

            let updateForm = undefined;
            if (isAdmin()) {
                updateForm = (this.state.updateMode) 
                    ? (<Form onSubmit={(e) => this.updateOrder(e)}>
                        <Form.Group controlId="action" className="row">
                            <div className="offset-md-3 col-md-6">
                                <Form.Label>Update action:</Form.Label>
                                <Form.Control as="select" onChange={(e) => this.setFormValue("action", e.target.value)} value={this.getFormValue('action')} key="action">
                                    <option value="">Choose update action...</option>
                                    {this.allUpdateActions().map(e => { return (<option value={e.value} key={e.value}>{e.text}</option>); } )}
                                </Form.Control>
                            </div>
                        </Form.Group>
                        {this.createDonationChoice()}

                        <div className="text-right">
                            <Button variant="link" onClick={() => this.updateMode(false)} >
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" className="ml-3" key="update-button" disabled={!this.isUpdateEnabled()}>
                                Update
                            </Button>
                        </div>
                    </Form>)
                    : (<div className="text-right">
                    <Button variant="link" onClick={() => this.backToRegistrationsList()} key="back-button">
                        Back
                    </Button>
                    <Button variant="outline-primary" onClick={() => this.resendEmail()} key="resend-button">
                        Resend email
                    </Button>
                    <Button variant="outline-primary ml-3" onClick={() => this.updateMode(true)} key="update-button">
                        Update
                    </Button>
                </div>);
            }
            
            let paymentDate = this.state.order.paymentDate ? (<time dateTime={this.state.order.paymentDate}>{this.state.order.paymentDateSimple}</time>) : undefined;
            content = (
                <section>
                    <SimpleAlert message={this.state.message} />
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
                        {this.renderOrderItemTableHeader()}
                        <tbody>
                            {rows}
                        </tbody>
                        <tfoot>
                            <tr>
                                {this.isLineByLineUpdateMode() ? (<td>&nbsp;</td>) : undefined}
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

    isLineByLineUpdateMode() {
        return this.state.updateMode && this.getFormValue('action') === 'LINE_BY_LINE';
    }

    renderOrderItemRow(item, i) {
        let option = null;
        if (this.isLineByLineUpdateMode() && item.status == null) {
            option = (<td>
                    <Form.Group controlId="action" className="mb-0">
                        <Form.Label className="sr-only">Update:</Form.Label>
                        <Form.Control as="select" onChange={(e) => this.setFormItemValue(item.id, "action", e.target.value)} key={"item-select-" + i}>
                            <option value="">No change</option>
                            {this.allLineByLineOptions(item).map(e => { return (<option value={e.value} key={e.value}>{e.text}</option>); }) }
                        </Form.Control>
                    </Form.Group>
                </td>);
        } else if (this.isLineByLineUpdateMode()) {
            option = (<td>&nbsp;</td>);
        }
        return (<tr key={i} className={item.status ? "inactive-order" : ""}>
            {option}
            <td>{item.title}</td>
            <td>{item.for}</td>
            <td>{item.emailAddress}</td>
            <td className="text-right"><small className="text-muted">{item.currency}</small> {formatAmount(item.amount, item.currency)}</td>
        </tr>);
    }

    renderOrderItemTableHeader() {
        return (<thead>
            <tr>
                {this.isLineByLineUpdateMode() ? (<th>Action</th>) : undefined}
                <th>Item</th>
                <th>For</th>
                <th>Email</th>
                <th className="text-right">Amount</th>
            </tr>
        </thead>);
    }

    createDonationChoice() {
        if (this.state.updateMode && this.state.values && this.state.values.action === 'CONVERT_TO_DONATION') {
            return (<Form.Group controlId="donationType" className="row">
                        <div className="offset-md-3 col-md-6">
                            <Form.Label className="sr-only">Donation type:</Form.Label>
                            <Form.Control as="select" onChange={(e) => this.setFormValue("donationType", e.target.value)} key="donationType">
                                <option value="">Choose donation type...</option>
                                {this.allDonationOfferings().map(o => { return (<option value={o.id} key={o.id}>{o.title}</option>); } )}
                            </Form.Control>
                        </div>
                    </Form.Group>
            );
        } else {
            return undefined;
        }
    }

    resendEmail() {
        axios.post('/api/resend_email.php', { orderId: this.state.order.orderUuid}, {
            headers: {
                "Authorization": "Bearer " + store.getState().auth.jwt
            }
        })
        .then(res => {
            let message = { severity: "success", text: "Email sent." }
            this.setState({
                loading: false,
                message: message
            })
        })
        .catch(error => {
            let message = { severity: "danger", text: "There was an error trying to send email for the specified order." }
            this.setState({
                loading: false,
                message: message
            })
        });
    }

    allDonationOfferings() {
        let donations = store.getState().offerings.items.filter(o => o.isDonation);
        return donations;
    }

    updateMode(value) {
        this.setState({
            ...this.state,
            updateMode: value,
            message: null
        })
    }

    backToRegistrationsList() {
        const { history } = this.props;
        history.goBack();
    }

    getFormValue(formName) {
        let value = this.state.values;
        return value[formName] ? value[formName] : "";
    }

    setFormValue(formName, formValue) {
        let value = this.state.values;
        let newValue = { ...value };
        newValue[formName] = formValue;
        this.setState((state) => ({
            ...state,
            values: newValue
        }));
    }

    setFormItemValue(itemId, key, value) {
        itemId = "" + itemId;
        let items = this.state.values.items ? this.state.values.items : {};
        let newItems = items[itemId] ? { ...items[itemId] } : {};
        if (key === "action" && value === "") {
            newItems = {};
        } else {
            newItems[key] = value;
        }
        this.setState((state) => {
            let items = state.values.items ? { ...state.values.items } : {};
            items[itemId] = newItems;
            console.log(items);
            return {
                ...state,
                values: {
                    ...state.values,
                    items: items
                }
            };
        });
    }


    isUpdateEnabled() {
        if (this.state.values['action'] === 'CONVERT_TO_DONATION' && !this.state.values['donationType']) {
            return false;
        } else {
            return this.state.values['action'];
        }
    }

    allLineByLineOptions(item) {
        let result = [];
        if (this.state.order) {
            if (this.state.order.status !== 'PAID') {
                result.push({ "value": "CANCEL", "text": "Cancel item"});
            } else if (this.state.order.paymentMethodKey === 'CARD') {
                result.push({ "value": "REFUND", "text": "Refund item"});
                result.push({ "value": "DEFER", "text": "Defer to next year"});
            } else {
                result.push({ "value": "REFUND", "text": "Refund item (manual return)"});
                result.push({ "value": "DEFER", "text": "Defer to next year"});
            }
        }
        return result;
    }

    allUpdateActions() {
        if (this.state.order) {
            let result = [];
            if (this.state.order.status !== 'PAID') {
                result.push({ "value": "MARK_AS_PAID", "text": "Mark as paid"});
                result.push({ "value": "CANCEL", "text": "Cancel order"});
                if (this.state.order.items.length > 1) {
                    result.push({ "value": "LINE_BY_LINE", "text": "Line-by-line changes"});
                }
            } else if (this.state.order.paymentMethodKey === 'CARD') {
                result.push({ "value": "REFUND", "text": "Refund credit card"});
                result.push({ "value": "DEFER", "text": "Defer to next year"});
                result.push({ "value": "CONVERT_TO_DONATION", "text": "Convert to donation"});
                if (this.state.order.items.length > 1) {
                    result.push({ "value": "LINE_BY_LINE", "text": "Line-by-line changes"});
                }
            } else {
                result.push({ "value": "REFUND", "text": "Refund (manual return)"});
                result.push({ "value": "DEFER", "text": "Defer to next year"});
                result.push({ "value": "CONVERT_TO_DONATION", "text": "Convert to donation"});
                if (this.state.order.items.length > 1) {
                    result.push({ "value": "LINE_BY_LINE", "text": "Line-by-line changes"});
                }
            }
            return result;
        } else {
            return [];
        }
    }

    formatItemsForRest() {
        let result = [];
        if (this.state.values.items) {
            let keys = Object.keys(this.state.values.items);
            keys.forEach(k => {
                let item = { ...this.state.values.items[k] };
                item['id'] = k;

                result.push(item);
            });
        }
        return result;
    }


    updateOrder(e) {
        e.preventDefault();
        e.stopPropagation();

        let data = { action: this.getFormValue("action"), orderId: this.state.order.orderUuid };
        if (this.isLineByLineUpdateMode()) {
            data['items'] = this.formatItemsForRest();
        }

        axios.post('/api/update_order.php', data, {
            headers: {
                "Authorization": "Bearer " + store.getState().auth.jwt
            }
        })
        .then(res => {
            this.backToRegistrationsList();
        })
        .catch(error => {
            let message = { severity: "danger", text: "There was an error trying to update the specified order." }
            this.setState({
                loading: false,
                message: message
            })
        });
    }

    fetchOrder(orderId) {
        axios.get('/api/review_order.php?orderId=' + orderId, {
                headers: {
                    "Authorization": "Bearer " + store.getState().auth.jwt
                }
            })
            .then(res => {
                this.setState((state) => ({
                    ...state,
                    loading: false,
                    message: undefined, 
                    order: res.data,
                    updateMode: false
                }))
            })
            .catch(error => {
                let message = { severity: "danger", text: "There was an error trying to get the specified order." }
                this.setState({
                    loading: false,
                    message: message
                })
            });
    }
}

export default withRouter(AdminOrderSummary);