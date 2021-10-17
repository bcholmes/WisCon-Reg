import React, { Component } from 'react';
import axios from 'axios';
import { withRouter } from "react-router";

import Accordion from 'react-bootstrap/Accordion';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';

import Container from 'react-bootstrap/Container';
import PageHeader from '../component/pageHeader';
import Cart from '../component/cart';
import Footer from '../component/footer';
import { clearCart } from '../state/cartActions';
import store from '../state/store';

class CheckoutPage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            email: this.findEmail()
        };
    }

    render() {
        const total = this.calculateTotal();
        let message = this.state.message ? (<Alert variant="danger">{this.state.message}</Alert>) : undefined;

        return (
            <Container className="mx-auto">
                <PageHeader />
                <div className="row">
                    <section className="col-lg-9">
                        <h1>Checkout</h1>

                        {message}

                        <Form>
                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                <Form.Label>Send confirmation to:</Form.Label>
                                <Form.Control type="email" placeholder="Email address..." value={this.state.email} onChange={(e) => this.saveEmail(e.target.value)} />
                                <Form.Text className="text-muted">
                                    We'll never share your email with anyone outside of WisCon.
                                </Form.Text>
                            </Form.Group>
                        </Form>

                        <p>Choose your preferred payment method and complete your registration.</p>
                        <Accordion defaultActiveKey="0">
                            <Card>
                                <Accordion.Toggle as={Card.Header} variant="link" eventKey="0">
                                    Pay using Credit Card
                                </Accordion.Toggle>
                                <Accordion.Collapse eventKey="0">
                                    <Card.Body>


                                        <Button onClick={() => this.processPayment('CARD')}>Pay by credit card</Button>
                                    </Card.Body>

                                </Accordion.Collapse>
                            </Card>
                            <Card>
                                <Accordion.Toggle as={Card.Header}  variant="link" eventKey="1">
                                    Pay with Check <span title="This spelling makes me sad.">[sic]</span>
                                </Accordion.Toggle>
                                <Accordion.Collapse eventKey="1">
                                    <Card.Body>
                                        <p>Please make your check for {total} payable to SF3 and mail it to the following address:</p>

                                        <p>
                                            WisCon Registration<br />
                                            123 Main St.<br />
                                            Madison, WI, 12345<br />
                                            USA
                                        </p>

                                        <Button onClick={() => this.processPayment('CHEQUE')}>Pay by check</Button>
                                    </Card.Body>
                                </Accordion.Collapse>
                            </Card>
                            <Card>
                                <Accordion.Toggle as={Card.Header}  variant="link" eventKey="2">
                                    Pay at Door with Cash
                                </Accordion.Toggle>
                                <Accordion.Collapse eventKey="2">
                                    <Card.Body>
                                        <p>Your membership and/or other items will be available at the WisCon registration desk, as normal. 
                                        You will need to pay in full ({total}) at pick-up time.</p>

                                        <Button onClick={() => this.processPayment('CASH')}>Pay at door</Button>
                                    </Card.Body>
                                </Accordion.Collapse>
                            </Card>
                        </Accordion>
                    </section>
                    <section className="col-lg-3">
                        <Cart />
                    </section>
                </div>
                <Footer />
            </Container>
        );
    }

    saveEmail(emailAddress) {

    }

    processPayment(paymentMethod) {
        axios.post('https://wisconregtest.bcholmes.org/api/order_finalize.php', {
            "orderId": store.getState().cart.orderId,
            "paymentMethod": paymentMethod,
            "email": this.state.email
        })
        .then(res => {
            this.setState({
                ...this.state,
                message: null
            });
            store.dispatch(clearCart());
            this.goToHome();
        })
        .catch(error => {
            this.setState({
                ...this.state,
                message: "Sorry. There was a probably talking to the server. Try again?"
            });
        });
    }

    goToHome() {
        const { history } = this.props;
        history.push('/');
    }

    findEmail() {
        let result = undefined;
        store.getState().cart.items.forEach(e => {
            if (!result) {
                result = e.values.email;
            }
        });

        return result || '';
    }

    calculateTotal() {
        let currency = 'USD';
        let total = 0;
        store.getState().cart.items.forEach(e => {
            total += e.amount;
            currency = e.offering.currency;
        });

        return currency + ' $' + total.toFixed(0);
    }

}

export default withRouter(CheckoutPage);