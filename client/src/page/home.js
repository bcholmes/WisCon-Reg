import React, { Component } from 'react';

import Container from 'react-bootstrap/Container';

import CheckoutButton from '../component/checkoutButton'
import Notice from '../component/notice'
import Welcome from '../component/welcome'
import Waiver from '../component/waiver'
import Cart from '../component/cart'
import OfferingList from '../component/offeringList';
import PageHeader from '../component/pageHeader';

class Home extends Component {

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

                <footer className="row my-4">
                    <hr className="my-2 col-md-12" />
                    <div className="text-muted col-md-9"><small>This site is maintained by SF3 – Society for the Furtherance &amp; Study of Fantasy &amp; Science Fiction</small></div>
                    <div className="col-md-1"><small><a href="http://wiscon.net/policies/privacy/" className="text-muted">Privacy</a></small></div>
                    <div className="col-md-1"><small><a href="http://wiscon.net/contact/" className="text-muted">Contact</a></small></div>
                </footer>
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
    }
}

export default Home;