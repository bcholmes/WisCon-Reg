import React, { Component } from 'react';

import Container from 'react-bootstrap/Container';
import PageHeader from '../component/pageHeader';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'

class Find extends Component {

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
                <Card>
                    <Card.Header><h4>Find My Registration</h4></Card.Header>
                    <Card.Body>
                        <p>Provide the email address that you used to register, and we'll send you an email with a link to your registration details.</p>
                        <div className="row mt-4">

                            <Form className="col-md-5">
                                <Form.Group controlId="formBasicEmail">
                                    <Form.Label className="sr-only">Email address</Form.Label>
                                    <Form.Control type="email" placeholder="Email" />
                                    <Form.Text className="text-muted">
                                        We'll never share your email with anyone outside of WisCon. We're not savages.
                                    </Form.Text>
                                </Form.Group>

                                <div className="text-center">
                                    <Button variant="primary" onClick={() => this.submitFindMyRegistration()}>
                                        Email me
                                    </Button>
                                </div>
                            </Form>
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    submitFindMyRegistration() {
        
    }
}

export default Find;