import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/esm/Modal';
import { addToCart } from '../state/cartActions';
import store from '../state/store';

class OfferingList extends Component {

    offerings = [
        {
            id: 1,
            title: "Former GoH",
            currency: "USD",
            suggestedPrice: 0,
            emphasis: false,
            highlights: [ "Available to previous Guests of Honor" ],
            description: "Available only to previous Guests of Honor."
        },
        {
            id: 2,
            title: "Adult Membership",
            currency: "USD",
            suggestedPrice: 65.00,
            emphasis: true,
            highlights: [ "Full Weekend (Thu-Mon)", "Ages 19+" ],
            description: "Our standard membership for adult guests (anyone 19 or older)."
        },
        {
            id: 3,
            title: "Teen Membership",
            currency: "USD",
            suggestedPrice: 20.00,
            emphasis: false,
            highlights: [ "Full Weekend (Thu-Mon)", "Ages 13-18" ]
        },
        {
            id: 4,
            title: "Youth Membership",
            currency: "USD",
            suggestedPrice: 20.00,
            emphasis: false,
            highlights: [ "Full Weekend (Thu-Mon)", "Ages 7-12" ]
        },
        {
            id: 5,
            title: "Wiscon Child Care",
            currency: "USD",
            suggestedPrice: 0.00,
            emphasis: false,
            highlights: [ "On-site daytime child care by licensed providers (Thu-Mon)", "Ages 0-6" ]
        },
        {
            id: 6,
            title: "Supporting Membership",
            currency: "USD",
            suggestedPrice: 25.00,
            emphasis: false,
            highlights: [ "A non-attending membership", "Receive printed materials, by mail" ]
        },
        {
            id: 7,
            title: "Dessert Ticket",
            currency: "USD",
            suggestedPrice: 35.00,
            emphasis: false,
            highlights: [ "Sunday Evening Dessert Salon", "Two desserts" ]
        },
        {
            id: 8,
            title: "Donate to Wiscon/SF3",
            currency: "USD",
            suggestedPrice: undefined,
            emphasis: false,
            highlights: [ "Donations to the general fund for SF3, WisCon's parent organization." ]
        },
        {
            id: 9,
            title: "Donate to WMAF",
            currency: "USD",
            suggestedPrice: undefined,
            emphasis: false,
            highlights: [ "The WisCon Member Assistance Fund supports anyone who needs financial assistance to attend" ]
        }
    ]

    constructor(props) {
        super(props);

        this.state = {
            showModal: false
        }
    }

    render() {
        let offeringList = this.offerings.map((o) => {
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
        let description = this.state.selectedOffering ? (<p>{this.state.selectedOffering.description}  <small className="text-muted">Eligibility for age-restricted memberships is based on age as of 2022-05-30 (Memorial Day, last day of the convention)</small></p>) : undefined;

        return (
            <div>
                <p>Select your membership type.</p>
                <div className="row row-cols-1 row-cols-md-3 mb-3 text-center">
                    {offeringList}
                </div>
                <Modal show={this.state.showModal}  onHide={() => this.handleClose()} size="xl">
                    <Form>
                        <Modal.Header closeButton>
                            <Modal.Title>{title}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {description}
                            <p>Please provide the full name of the person associated with this membership/item.</p>
                            <Form.Group className="mb-3" controlId="formName">
                                <Form.Label className="sr-only">Name</Form.Label>
                                <Form.Control type="text" placeholder="Name" />
                            </Form.Group>
                            <p>Provide a current email address to which information about this membership and the upcoming WisCon convention can be 
                                sent. This email will not be used or shared for any other purpose without your consent. (If you are also 
                                signing up for WisCon programming, please provide the same email address here so that we can match your profiles.)</p>
                            <Form.Group className="mb-3" controlId="formEmail">
                                <Form.Label className="sr-only">Email</Form.Label>
                                <Form.Control type="email" placeholder="Email address" />
                            </Form.Group>
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