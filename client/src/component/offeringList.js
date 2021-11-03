import React, { Component } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/esm/Modal';
import Spinner from 'react-bootstrap/Spinner';

import { addToCart } from '../state/cartActions';
import store from '../state/store';
import { fetchOfferings } from '../state/offeringActions';
import { isValidEmail } from '../util/emailUtil';
import { formatAmount } from '../util/numberUtil';

class OfferingList extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showModal: false,
            offerings: store.getState().offerings
        }
    }

    componentDidMount() {
        if (this.state.offerings.loading) {
            fetchOfferings();
        }

        this.unsubscribe = store.subscribe(() => {
            let state = this.state;
            this.setState({
                ...state,
                offerings: store.getState().offerings
            });
        });
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    render() {
        if (this.state.offerings.loading) {
            return (
                <div className="text-center">
                    <Spinner animation="border" />
                </div>
            );
        } else {

            let offeringList = this.state.offerings.items.map((o) => {
                let highlights = o.highlights.map((h, i) => {
                    return (<li key={o.id.toString + "-" + i.toString()}>{h}</li>)
                })
                let price = o.suggestedPrice === undefined || o.suggestedPrice === null ? 'Any' : (o.suggestedPrice ===  0 ? 'Free' : ('$' + o.suggestedPrice.toFixed(0)));
                let priceSuffix = this.isVariableAmount(o) ? (<small className="text-muted">+/-</small>) : undefined;

                if (o.emphasis) {
                    return (
                        <div className="col" key={'offering-' + o.id}>
                            <div className="card mb-4 rounded-3 shadow-sm border-primary">
                            <div className="card-header py-3 bg-primary text-white">
                                <h5 className="my-0 fw-normal">{o.title}</h5>
                            </div>
                            <div className="card-body">
                                <h1 className="card-title pricing-card-title"><small className="text-muted fw-light"><small>{o.currency}</small></small> {price } {priceSuffix}</h1>
                                <ul className="list-unstyled mt-3 mb-4">
                                {highlights}
                                </ul>
                                <Button size="lg" className="w-100" onClick={()  => this.showModal(o) }>Add to cart</Button>
                            </div>
                            </div>
                        </div>
                    )
                } else {
                    return (
                        <div className="col" key={'offering-' + o.id}>
                            <div className="card mb-4 rounded-3 shadow-sm">
                            <div className="card-header py-3">
                                <h5 className="my-0 fw-normal">{o.title}</h5>
                            </div>
                            <div className="card-body">
                                <h1 className="card-title pricing-card-title"><small className="text-muted fw-light"><small>{o.currency}</small></small> {price } {priceSuffix}</h1>
                                <ul className="list-unstyled mt-3 mb-4">
                                {highlights}
                                </ul>
                                <Button size="lg" className="w-100" onClick={()  => this.showModal(o) } variant="outline-primary">Add to cart</Button>
                            </div>
                            </div>
                        </div>
                    )
                }
            });

            let title = this.state.selectedOffering ? this.state.selectedOffering.title : undefined;
            let description = this.state.selectedOffering ? (<p>{this.state.selectedOffering.description}</p>) : undefined;

            let message = this.state.messages ? this.state.messages.map((e, i)  => {
                return (<Alert variant="danger" key={i}>{e}</Alert>); } ) : undefined;
            let emailLabel = "Email address";
            if (this.state.selectedOffering && this.state.selectedOffering.emailRequired === 'OPTIONAL') {
                emailLabel = "Email address (optional)"
            }
            let emailOption =  (<Form.Group controlId="formEmail" key="email-field">
                <Form.Label className="sr-only">{emailLabel}</Form.Label>
                <Form.Control type="email" placeholder={emailLabel} onChange={(e) => this.setFormValue("email", e.target.value)}/>
                <Form.Text className="text-muted">
                    Provide a current email address to which information about this membership and the upcoming WisCon convention can be 
                    sent. This email will not be used or shared for any other purpose without your consent. (If you are also 
                    signing up for WisCon programming, please provide the same email address here so that we can match your profiles.)
                </Form.Text>
            </Form.Group>);

            if (this.state.selectedOffering && this.state.selectedOffering.emailRequired === 'NO') {
                emailOption = undefined;
            }

            let amountEntry = undefined;
            if (this.state.selectedOffering && this.state.selectedOffering.suggestedPrice == null) {
                amountEntry = (<Form.Group className="mb-3" controlId="amount">
                    <Form.Label className="sr-only">Name</Form.Label>
                    <Form.Control type="number" placeholder="Amount... (e.g. 30)" value={this.getFormValue('amount')} onChange={(e) => this.setFormValue("amount", e.target.value)}/>
                    <Form.Text className="text-muted">
                        Please choose the amount you wish provide for this item.
                    </Form.Text>
                </Form.Group>);
            } else if (this.isVariableAmount(this.state.selectedOffering)) {
                amountEntry = (<Form.Group className="mb-3" controlId="amount">
                    <Form.Label className="sr-only">Name</Form.Label>
                    <Form.Control type="number" placeholder="Amount... (e.g. 30)" value={this.getFormValue('amount')} onChange={(e) => this.setFormValue("amount", e.target.value)}/>
                    <Form.Text className="text-muted">
                        The suggested price for this item ({this.state.selectedOffering.title}) is {formatAmount(this.state.selectedOffering.suggestedPrice, this.state.selectedOffering.currency)}.
                        Please choose an amount between {formatAmount(this.state.selectedOffering.minimumPrice, this.state.selectedOffering.currency)} and {formatAmount(this.state.selectedOffering.maximumPrice, this.state.selectedOffering.currency)}.
                    </Form.Text>
                </Form.Group>);
            }

            let questions = (this.state.selectedOffering && this.state.selectedOffering.addPrompts) 
                ? [
                    <Form.Check className="mb-3" id="volunteer" key="form-volunteer" onClick={(e) => this.setFormValue('volunteer', e.target.checked)}
                            label="WisCon is entirely run by volunteers. Would you like to receive information about volunteering during the upcoming WisCon convention, or about getting involved in pre-convention organizing?" />,
                    <Form.Check id="newsletter"  key="form-newsletter" onClick={(e) => this.setFormValue('newsletter', e.target.checked)}
                            label="Would you like to subscribe by email to the WisCon / SF3 Newsletter, with updates about future WisCons and other SF3 events and activities?" />,
                    <Form.Text className="text-muted mb-3 ml-4" key="form-newsletter-text">
                            See more information <a href="https://wiscon.net/news/e-newsletter/" target="_blank" rel="noreferrer">here</a>
                    </Form.Text>,
                    <Form.Check className="mb-3" id="snailMail" key="form-snailmail" onClick={(e) => this.setFormValue('snailMail', e.target.checked)}
                            label="Would you like to receive annual reminder postcards by physical mail? (Requires a mailing address)" />
                ]
                : undefined;

            return (
                <div>
                    <p>Select from the following options.</p>
                    <div className="row row-cols-1 row-cols-md-3 mb-3 text-center">
                        {offeringList}
                    </div>
                    <Modal show={this.state.showModal}  onHide={() => this.handleClose()} size="lg">
                        <Form>
                            <Modal.Header closeButton>
                                <Modal.Title>{title}</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                {message}
                                {description}
                                <Form.Group className="mb-3" controlId="formName">
                                    <Form.Label className="sr-only">Name</Form.Label>
                                    <Form.Control type="text" placeholder="Name" value={this.getFormValue('for')} onChange={(e) => this.setFormValue("for", e.target.value)}/>
                                    <Form.Text className="text-muted">
                                        Please provide the full name of the person associated with this membership/item. 
                                        This name will appear on your badge, and does not need to be a wallet name.
                                    </Form.Text>

                                </Form.Group>
                                {emailOption}
                                {amountEntry}

                                {questions}
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="primary" onClick={() => this.addItem()}>
                                    Add to cart
                                </Button>
                            </Modal.Footer>
                        </Form>
                    </Modal>
                </div>
            );
        }
    }

    isVariableAmount(offering) {
        if (offering) {
            return offering.minimumPrice && offering.maximumPrice;
        } else {
            return false;
        }
    }

    getFormValue(formName) {
        if (this.state.values) {
            return this.state.values[formName] || '';
        } else {
            return '';
        }
    }

    setFormValue(formName, formValue) {
        let state = this.state;
        let value = state.values;
        let newValue = { ...value };
        newValue[formName] = formValue;
        this.setState({
            ...state,
            values: newValue,
            messages: null
        });

    }

    isValidForm() {
        return this.validateForm().length === 0;
    }

    toNumber(value) {
        let n = Number(value);
        if (isNaN(n)) {
            return 0;
        } else {
            return n;
        }
    }

    validateForm() {
        let messages = [];
        let offering = this.state.selectedOffering;
        let values = this.state.values;
        if (!values.for) {
            messages.push("Please provide a name.");
        }
        if (offering.emailRequired === 'REQUIRED' && (!values.email || !isValidEmail(values.email))) {
            messages.push("Please provide a valid email.");
        } else if (values.email && !isValidEmail(values.email)) {
            messages.push("That email doesn't look quite right.");
        }
        if (values.amount && !/^(\d*(\.\d{2})?)$/.test(values.amount)) {
            messages.push("The amount value looks a bit fishy");
        } else if (values.amount === '' || (values.amount === 0 && offering.suggestedPrice == null)) {
            messages.push("Please provide an amount.");
        } else if (this.isVariableAmount(offering) && values.amount < offering.minimumPrice) {
            messages.push("The minimum amount is " + offering.currency + " " + formatAmount(offering.minimumPrice, offering.currency));
        } else if (this.isVariableAmount(offering) && values.amount > offering.maximumPrice) {
            messages.push("The maximum amount is " + offering.currency + " " + formatAmount(offering.maximumPrice, offering.currency));
        }
        return messages;
    }

    showModal(offering) {
        let value = {};
        if (!offering.isMembership) {
            let items = store.getState().cart.items;
            if (items && items.length > 0) {
                let lastItem = items[items.length-1];
                value['for'] = lastItem.for;
            }
        }
        value.amount = offering.suggestedPrice || 0;
        if (offering.suggestedPrice == null) {
            value.amount = '';
        }
        this.setState({
            ...this.state,
            showModal: true,
            selectedOffering: offering,
            values: value,
            messages: null
        });
    }

    addItem() {
        let offering = this.state.selectedOffering;
        let values = this.state.values;
        let uuid = uuidv4();
        let newValues = {
            ...values,
            amount: this.toNumber(values.amount)
        }
        let price = newValues.amount || 0;
        if (this.isValidForm()) {
            axios.post('https://wisconregtest.bcholmes.org/api/order_item.php', {
                "orderId": store.getState().cart.orderId,
                "for": values.for,
                "itemUUID": uuid,
                "offering": offering,
                "values": newValues
            })
            .then(res => {
                store.dispatch(addToCart(offering, values.for, newValues, uuid, price));
                this.setState({
                    ...this.state,
                    showModal: false,
                    selectedOffering: null,
                    values: null,
                    messages: null
                });
                })
            .catch(error => {
                    this.setState({
                        ...this.state,
                        messages: "Sorry. There was a probably talking to the server. Try again?"
                    });
                });

        } else {
            this.setState({
                ...this.state,
                messages: this.validateForm()
            });
        }
    }


    handleClose() {
        this.setState({
            ...this.state,
            showModal: false
        });
    }
}

export default OfferingList;