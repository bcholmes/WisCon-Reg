import React, { Component } from 'react';

import Container from 'react-bootstrap/Container';

import CheckoutButton from '../component/checkoutButton'
import Notice from '../component/notice'
import Welcome from '../component/welcome'
import Waiver from '../component/waiver'
import Cart from '../component/cart'
import OfferingList from '../component/offeringList';
import PageHeader from '../component/pageHeader';
import PropTypes from "prop-types";
import Footer from '../component/footer';
import { withRouter } from "react-router";

class Home extends Component {
    static propTypes = {
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            showWaiver: false
        }
    }

    render() {
        return (
            <Container className="mx-auto">
                <PageHeader />
                <div className="row">
                    <section className="col-lg-9">
                        <Welcome key="welcome"/>
                        <OfferingList key="offering"/>
                    </section>
                    <section className="col-lg-3">
                        <Cart />
                        <CheckoutButton onClick={() => this.showWaiver()}/>
                        <Notice />
                    </section>
                </div>
                <Waiver show={this.state.showWaiver} onClose={(accepted) => { this.waiverClose(accepted) } }/>

                <Footer />
            </Container>
        );
    }

    showWaiver() {
        this.setState({
            showWaiver: true
        });
    }

    waiverClose(accepted) {
        this.setState({
            showWaiver: false
        });
        if (accepted) {
            const { history } = this.props;
            history.push('/checkout');    
        }
    }
}

export default withRouter(Home);