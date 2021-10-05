import React, { Component } from 'react';
import axios from 'axios';

import Container from 'react-bootstrap/Container';
import PageHeader from '../component/pageHeader';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

class RegistrationsPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            records: {
                rows: []
            },
            loading: false
        }

        this.loadData();
    }

    render() {
        let spinner = this.state.loading ? (<Spinner animation="border" />) : undefined;
        let message = (this.state.message) ? (<div className="alert alert-danger">{this.state.message}</div>) : undefined;

        return (
            <Container className="mx-auto">
                <PageHeader />
                <h1>Registration List</h1>
                {message}
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
                {spinner}
            </Container>
        );
    }

    loadData() {
        let state = this.state;
        this.setState({
            ...state,
            loading: true
        });

        axios.get('https://wisconregtest.bcholmes.org/api/registration-list.php')
        .then(res => {
            let state = this.state;
            this.setState({
                ...state,
                loading: false,
                message: 'There are no registrations'
            })
        })
        .catch(error => {
            let state = this.state;
            let message = "The registration list could not be loaded."
            this.setState({
                ...state,
                loading: false,
                message: message
            })
        });
    }
}

export default RegistrationsPage;