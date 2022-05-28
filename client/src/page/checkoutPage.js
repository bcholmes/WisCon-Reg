import React, { Component } from 'react';
import axios from 'axios';
import { withRouter } from "react-router";
import {loadStripe} from '@stripe/stripe-js';
import {Elements, ElementsConsumer, PaymentElement } from '@stripe/react-stripe-js';

import Accordion from 'react-bootstrap/Accordion';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';

import Container from 'react-bootstrap/Container';
import PageHeader from '../component/pageHeader';
import Cart from '../component/cart';
import Footer from '../component/footer';
import { clearCart, calculateTotal } from '../state/cartActions';
import { isValidEmail } from '../util/emailUtil';
import { formatAmount } from '../util/numberUtil';
import { stripePublicKey, sdlc } from '../util/sdlcUtil';
import store from '../state/store';

const stripePromise = loadStripe(stripePublicKey());

export function StripeCheckoutForm(props) {

    return (<ElementsConsumer>
        {({stripe, elements}) => 
            <CheckoutForm stripe={stripe} elements={elements} onSubmit={props.onSubmit} />
        }
        </ElementsConsumer>
    );
}

class CheckoutForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false
        };
    }
    handleSubmit = async (event) => {
      event.preventDefault();
      this.setState({
          loading: true
      });
      const {stripe, elements, onSubmit} = this.props;

      if (elements != null && onSubmit) {
          onSubmit(stripe, elements, () => this.hideSpinner());
      }
    };

    hideSpinner() {
        this.setState({
            loading: false
        })
    }
  
    render() {
      const { stripe } = this.props;
      const total = formatTotal();
      const spinner = this.state.loading ? (<Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
        />) : undefined;
      return (
        <form onSubmit={(e) => this.handleSubmit(e)}>
            <p>Provide your credit card information, below, to process your payment for {total}.</p>
            <PaymentElement />
            <Button className="mt-3" type="submit" disabled={!stripe || this.state.loading}>
                {spinner}
                Pay by credit card
            </Button>
        </form>
      );
    }
  }

class CheckoutPage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            email: this.findEmail()
        };
    }

    render() {
        const total = calculateTotal();
        const section = (total.amount === 0) ? this.renderNoPaymentRequired() : this.renderPaymentMethods();
        return (
            <Container className="mx-auto">
                <PageHeader />
                <div className="row">
                    {section}
                    <section className="col-lg-3">
                        <Cart />
                    </section>
                </div>
                <Footer />
                <Modal show={this.state.showModal}  onHide={() => this.handleClose()} key="page-header-login-dialog">
                    <Modal.Header closeButton>
                    <Modal.Title>Order Checked Out!</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>
                            Your order has been passed on to our finest registration volunteers. Each order is 
                            lovingly processed through our registration workflow, which includes a light spritzing of 
                            inclusive feminism, before eventually being converted into your very own
                            WisCon membership.
                        </p>
                        <p>You should also shortly receive an email confirmation, crafted by our most diligent email composers.</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={() => this.handleClose()}>
                            OK
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>

        )
    }

    renderNoPaymentRequired() {
        const total = formatTotal();
        let message = this.state.message ? (<Alert variant="danger">{this.state.message}</Alert>) : undefined;
        return (
            <section className="col-lg-9">
                <h1>Checkout</h1>

                {message}

                <p>Good news! Your cart totals the low, low amount of {total}, and therefore no payment is required. 
                    But you <b>do</b> need to click the "Confirm" button to finalize your order.</p>


                <Form>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Send confirmation to:</Form.Label>
                        <Form.Control type="email" placeholder="Email address..." value={this.state.email} onChange={(e) => this.saveEmail(e.target.value)} />
                        <Form.Text className="text-muted">
                            We'll never share your email with anyone outside of WisCon.
                        </Form.Text>
                    </Form.Group>
                </Form>

                <p><Button onClick={() => this.processPayment('NO_CHARGE')}>Confirm</Button></p>
            </section>
        )
    }

    renderPaymentMethods() {
        const total = formatTotal();
        let message = this.state.message ? (<Alert variant="danger">{this.state.message}</Alert>) : undefined;
        const options = {
            clientSecret: store.getState().cart.clientSecret
        };
        return (
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

                                <Elements stripe={stripePromise} options={options}>
                                    <StripeCheckoutForm onSubmit={(stripe, card, completion) => this.processCardPayment(stripe, card, completion)}/>
                                </Elements>

                            </Card.Body>

                        </Accordion.Collapse>
                    </Card>
                    <Card>
                        <Accordion.Toggle as={Card.Header}  variant="link" eventKey="1">
                            Pay with Check
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey="1">
                            <Card.Body>
                                <p>Please make your check for {total} payable to SF3 and mail it to the following address:</p>

                                <p>
                                    SF3<br />
                                    PO Box 1624<br />
                                    Madison WI 53701-1624<br />
                                    USA
                                </p>

                                <Button onClick={() => this.processPayment('CHEQUE')}>Pay by check</Button>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                    <Card>
                        <Accordion.Toggle as={Card.Header}  variant="link" eventKey="2">
                            Pay at the Registration Desk (Cash, Credit Card, etc.)
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey="2">
                            <Card.Body>
                                <p>If you choose to pay at the door, your membership will be reserved. If we approach the 
                                    membership cap, we may contact you to ask that you confirm that you still plan to 
                                    attend. At the convention, you will need to pay in full ({total}) when picking up 
                                    your badge(s) and/or dessert ticket(s).</p>

                                <Button onClick={() => this.processPayment('AT_DOOR')}>Pay at door</Button>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                </Accordion>
            </section>
        );
    }

    saveEmail(emailAddress) {
        this.setState({
            ...this.state,
            email: emailAddress
        });
    }

    processPayment(paymentMethod, completion) {
        if (this.state.email && isValidEmail(this.state.email)) {
            axios.post(sdlc.serverUrl('/api/order_finalize.php'), {
                "orderId": store.getState().cart.orderId,
                "paymentMethod": paymentMethod,
                "email": this.state.email
            })
            .then(res => {
                if (completion) {
                    completion();
                }
                this.setState({
                    ...this.state,
                    message: null,
                    showModal: true
                });
                store.dispatch(clearCart());
            })
            .catch(error => {
                if (completion) {
                    completion();
                }
                console.log(error);
                this.setState({
                    ...this.state,
                    message: "Sorry. There was a problem talking to the server. Try again?"
                });
            });
        } else {
            this.setState({
                ...this.state,
                message: "Please provide a valid email address"
            });
        }
    }

    handleClose() {
        let state = this.state;
        this.setState({
            ...state, 
            showModal: false
        });
        this.goToHome();
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

    processStripePaymentMethod(stripe, elements, completion) {
        if (this.state.email && isValidEmail(this.state.email)) {
            stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: "http://localhost:3000/checkout",
                },
                redirect: "if_required"
            }).then(res => {
                completion(res);
            });
        } else {
            completion(false);
            this.setState({
                ...this.state,
                message: "Please provide a valid email address"
            });
        }
    }

    processCardPayment(stripe, card, completion) {
        this.processStripePaymentMethod(stripe, card, (res => {
            if (res && res.paymentIntent && res.paymentIntent.status === 'succeeded') {
                this.processPayment('CARD', completion);
            } else if (res) {
                completion(false);
                this.setState({
                    ...this.state,
                    message: "The payment did not succeed successfully. Check your information or try again with a different card."
                });
            } else {
                completion(false);
            }
        }));
    }
}

function formatTotal() {
    let total = calculateTotal();
    return total.currency + ' ' + formatAmount(total.amount, total.currency);
}



export default withRouter(CheckoutPage);