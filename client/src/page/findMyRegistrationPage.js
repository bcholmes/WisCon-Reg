import React, { Component } from 'react';
import axios from 'axios';

import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'

import Footer from '../component/footer';
import PageHeader from '../component/pageHeader';
import { isValidEmail } from '../util/emailUtil';
import { sdlc } from '../util/sdlcUtil';

class FindMyRegistrationPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            email: '',
            submitEnabled: false
        }
    }

    render() {
        let message = undefined;
        if (this.state.message) {
            if (this.state.message.type === 'success') {
                message = (<div className="alert alert-success">{this.state.message.text}</div>);
            } else {
                message = (<div className="alert alert-danger">{this.state.message.text}</div>);
            }
        }

        return (
            <Container className="mx-auto">
                <PageHeader />
                <Card>
                    <Card.Header><h4>Find My Registration</h4></Card.Header>
                    <Card.Body>
                        {message}
                        <p>Provide the email address that you used to register, and we'll send you an email with a link to your registration details.</p>
                        <div className="row mt-4">

                            <Form className="col-md-5" onSubmit={(e) => e.preventDefault()}>
                                <Form.Group controlId="formBasicEmail">
                                    <Form.Label className="sr-only">Email address</Form.Label>
                                    <Form.Control type="email" placeholder="Email" value={this.state.email} onChange={(e) => this.setEmail(e.target.value)}/>
                                    <Form.Text className="text-muted">
                                        We'll never share your email with anyone outside of WisCon. We're not cads.
                                    </Form.Text>
                                </Form.Group>

                                <div className="text-center">
                                    <Button variant="primary" onClick={(e) => this.submitFindMyRegistration(e)} disabled={!this.state.submitEnabled}>
                                        Email me
                                    </Button>
                                </div>
                            </Form>
                        </div>
                    </Card.Body>
                </Card>
                <Footer />
            </Container>
        );
    }

    setEmail(email) {
        this.setState({
            email: email,
            submitEnabled: isValidEmail(email),
            message: undefined
        })
    }

    submitFindMyRegistration(e) {
        e.preventDefault();
        axios.post(sdlc.serverUrl('/api/find_registration.php'), {
            email: this.state.email
        })
        .then(res => {
            let state = this.state;
            let message = "You should receive an email shortly."
            this.setState({
                ...state,
                message: {
                    text: message,
                    type: "success"
                }
            })
        })
        .catch(error => {
            let state = this.state;
            let message = "We had a problem trying to connect to the server."
            this.setState({
                ...state,
                message: {
                    text: message,
                    type: "danger"
                }
            })
        });
    }
}

export default FindMyRegistrationPage;