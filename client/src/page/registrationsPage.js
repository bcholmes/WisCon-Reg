import React, { Component } from 'react';

import Container from 'react-bootstrap/Container';
import PageHeader from '../component/pageHeader';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

class RegistrationsPage extends Component {

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
                <h1>Registration List</h1>
                <div className="alert alert-warning">There are no registrations.</div>
                <div className="row mb-3">
                    <div className="col-md-6">
                        <Form.Group controlId="formFilter">
                            <Form.Label className="sr-only">Filter</Form.Label>
                            <Form.Control type="text" placeholder="Find..." />
                        </Form.Group>

                    </div>
                    <div className="col-md-6 text-right">
                        <Button variant="secondary">Download</Button>
                    </div>
                </div>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Order Number</th>
                            <th>Purchase Item</th>
                            <th>Amount</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Payment Method</th>
                        </tr>
                    </thead>
                </table>
            </Container>
        );
    }

}

export default RegistrationsPage;