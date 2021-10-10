import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/esm/Modal';
import Spinner from 'react-bootstrap/Spinner';
import { addToCart } from '../state/cartActions';
import store from '../state/store';
import { fetchOfferings } from '../state/offeringActions';

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

                if (o.emphasis) {
                    return (
                        <div className="col" key={'offering-' + o.id}>
                            <div className="card mb-4 rounded-3 shadow-sm border-primary">
                            <div className="card-header py-3 bg-primary text-white">
                                <h5 className="my-0 fw-normal">{o.title}</h5>
                            </div>
                            <div className="card-body">
                                <h1 className="card-title pricing-card-title"><small className="text-muted fw-light"><small>{o.currency}</small></small> {price }</h1>
                                <ul className="list-unstyled mt-3 mb-4">
                                {highlights}
                                </ul>
                                <Button size="lg" className="w-100" onClick={()  => this.showModal(o) }>Add to Cart</Button>
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
                                <h1 className="card-title pricing-card-title"><small className="text-muted fw-light"><small>{o.currency}</small></small> {price }</h1>
                                <ul className="list-unstyled mt-3 mb-4">
                                {highlights}
                                </ul>
                                <Button size="lg" className="w-100" onClick={()  => this.showModal(o) } variant="outline-primary">Add to Cart</Button>
                            </div>
                            </div>
                        </div>
                    )
                }
            });

            let title = this.state.selectedOffering ? this.state.selectedOffering.title : undefined;
            let description = this.state.selectedOffering ? (<p>{this.state.selectedOffering.description}</p>) : undefined;

            let message = this.state.message ? (<div className="alert alert-danger">{this.state.message}</div>) : undefined;
            let emailOption =  (<Form.Group controlId="formEmail" key="email-field">
                <Form.Label className="sr-only">Email</Form.Label>
                <Form.Control type="email" placeholder="Email address" onChange={(e) => this.setFormValue("email", e.target.value)}/>
                <Form.Text className="text-muted">
                    Provide a current email address to which information about this membership and the upcoming WisCon convention can be 
                    sent. This email will not be used or shared for any other purpose without your consent. (If you are also 
                    signing up for WisCon programming, please provide the same email address here so that we can match your profiles.)
                </Form.Text>
            </Form.Group>);

            if (this.state.selectedOffering && this.state.selectedOffering.emailRequired === 'NO') {
                emailOption = undefined;
            } else if (this.state.selectedOffering && this.state.selectedOffering.emailRequired === 'OPTIONAL') {
                emailOption = [emailOption, <Form.Check className="mb-4" id="noEmail" label="Don't have an email address" key="no-email-check"/>]
            }

            let questions = (this.state.selectedOffering && this.state.selectedOffering.addPrompts) 
                ? [
                    <Form.Check className="mb-3" id="volunteer" key="form-volunteer"
                            label="WisCon is entirely run by volunteers. Would you like to receive information about volunteering during the upcoming WisCon convention, or about getting involved in pre-convention organizing?" />,
                    <Form.Check id="newsletter"  key="form-newsletter"
                            label="Would you like to subscribe by email to the WisCon / SF3 Newsletter, with updates about future WisCons and other SF3 events and activities?" />,
                    <Form.Text className="text-muted mb-3 ml-4" key="form-newsletter-text">
                            See more information <a href="https://wiscon.net/news/e-newsletter/" target="_blank" rel="noreferrer">here</a>
                    </Form.Text>,
                    <Form.Check className="mb-3" id="snailMail" key="form-snailmail"
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
                                    <Form.Control type="text" placeholder="Name" value={this.getFormValue('name')} onChange={(e) => this.setFormValue("name", e.target.value)}/>
                                    <Form.Text className="text-muted">
                                        Please provide the full name of the person associated with this membership/item. 
                                        This name will appear on your badge, and does not need to be a wallet name.
                                    </Form.Text>

                                </Form.Group>
                                {emailOption}

                                {questions}
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="primary" onClick={() => this.addItem()}>
                                    Add to Cart
                                </Button>
                            </Modal.Footer>
                        </Form>
                    </Modal>
                </div>
            );
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
            message: null
        });

    }

    showModal(offering) {
        let value = {};
        if (!offering.isMembership) {
            let items = store.getState().cart.items;
            if (items) {
                let lastItem = items[items.length-1];
                value['name'] = lastItem.for;
            }
        }
        this.setState({
            ...this.state,
            showModal: true,
            selectedOffering: offering,
            values: value,
            message: null
        });
    }

    addItem() {
        let offering = this.state.selectedOffering;
        let price = offering.suggestedPrice || 0;
        let values = this.state.values;
        if (values.name) {
            store.dispatch(addToCart(offering, values.name, 'bill@example.com', price));
            this.setState({
                ...this.state,
                showModal: false,
                selectedOffering: null,
                values: null,
                message: null
            });
        } else {
            this.setState({
                ...this.state,
                message: "Please provide a name."
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