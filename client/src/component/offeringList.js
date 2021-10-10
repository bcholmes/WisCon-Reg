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
                                <Button size="lg" className="w-100" onClick={()  => this.addItem(o) }>Add to Cart</Button>
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
                                <Button size="lg" className="w-100" onClick={()  => this.addItem(o) } variant="outline-primary">Add to Cart</Button>
                            </div>
                            </div>
                        </div>
                    )
                }
            });

            let title = this.state.selectedOffering ? this.state.selectedOffering.title : undefined;
            let description = this.state.selectedOffering ? (<p>{this.state.selectedOffering.description}</p>) : undefined;

            let emailOptional = (this.state.selectedOffering && this.state.selectedOffering.emailRequired) ? undefined : (
                <Form.Check className="mb-4" id="noEmail" label="Don't have an email address" />);

            let questions = (this.state.selectedOffering && this.state.selectedOffering.addPrompts) 
                ? [
                    <Form.Check className="mb-3" id="volunteer" 
                            label="WisCon is entirely run by volunteers. Would you like to receive information about volunteering during the upcoming WisCon convention, or about getting involved in pre-convention organizing?" />,
                    <Form.Check id="newsletter" 
                            label="Would you like to subscribe by email to the WisCon / SF3 Newsletter, with updates about future WisCons and other SF3 events and activities?" />,
                    <Form.Text className="text-muted mb-3 ml-4">
                            See more information <a href="https://wiscon.net/news/e-newsletter/" target="_blank" rel="noreferrer">here</a>
                    </Form.Text>,
                    <Form.Check className="mb-3" id="snailMail" 
                            label="Would you like to receive annual reminder postcards by physical mail? (Requires a mailing address)" />
                ]
                : undefined;

            return (
                <div>
                    <p>Select from the following memberships or other options.</p>
                    <div className="row row-cols-1 row-cols-md-3 mb-3 text-center">
                        {offeringList}
                    </div>
                    <Modal show={this.state.showModal}  onHide={() => this.handleClose()} size="lg">
                        <Form>
                            <Modal.Header closeButton>
                                <Modal.Title>{title}</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                {description}
                                <Form.Group className="mb-3" controlId="formName">
                                    <Form.Label className="sr-only">Name</Form.Label>
                                    <Form.Control type="text" placeholder="Name" />
                                    <Form.Text className="text-muted">
                                        Please provide the full name of the person associated with this membership/item. 
                                        This name will appear on your badge, and does not need to be a wallet name.
                                    </Form.Text>

                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formEmail">
                                    <Form.Label className="sr-only">Email</Form.Label>
                                    <Form.Control type="email" placeholder="Email address" />
                                    <Form.Text className="text-muted">
                                        Provide a current email address to which information about this membership and the upcoming WisCon convention can be 
                                        sent. This email will not be used or shared for any other purpose without your consent. (If you are also 
                                        signing up for WisCon programming, please provide the same email address here so that we can match your profiles.)
                                    </Form.Text>
                                </Form.Group>
                                {emailOptional}

                                {questions}
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="primary">
                                    Add to Cart
                                </Button>
                            </Modal.Footer>
                        </Form>
                    </Modal>
                </div>
            );
        }
    }

    addItem(offering) {
        let price = offering.suggestedPrice || 0;
//        store.dispatch(addToCart(offering, 'Bill Finger', 'bill@example.com', price));
        this.setState({
            ...this.state,
            showModal: true,
            selectedOffering: offering
        });
    }

    handleClose() {
        this.setState({
            ...this.state,
            showModal: false
        });
    }
}

export default OfferingList;