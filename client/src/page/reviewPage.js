import React, { Component } from 'react';

import Container from 'react-bootstrap/Container';

import { withRouter } from "react-router";

import PageHeader from '../component/pageHeader';
import Footer from '../component/footer';
import OrderSummary from '../component/orderSummary';

class ReviewPage extends Component {

    constructor(props) {
        super(props);

        const search = props.location.search;  
        const key = new URLSearchParams(search).get('key');
        this.state = {
            "orderId": new URLSearchParams(search).get('orderId'),
            "key": key
        }
    }

    render() {

        return (
            <Container className="mx-auto">
                <PageHeader />
                <OrderSummary orderId={this.state.orderId} orderKey={this.state.key} />
                <Footer />
            </Container>
        );
    }
}

export default withRouter(ReviewPage);