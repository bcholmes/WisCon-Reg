import React, { Component } from 'react';

import Container from 'react-bootstrap/Container';
import PageHeader from '../component/pageHeader';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Cart from '../component/cart'

class CheckoutPage extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Container className="mx-auto">
                <PageHeader />
                <div className="row">
                    <section className="col-lg-9">
                        <h1>Checkout</h1>
                        <p>Checkout using PayPal.</p>
                    </section>
                    <section className="col-lg-3">
                        <Cart />
                    </section>
                </div>
 
            </Container>
        );
    }
}

export default CheckoutPage;