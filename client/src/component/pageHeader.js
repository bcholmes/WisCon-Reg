import React, { Component } from 'react';
import axios from 'axios';

import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/esm/Modal';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { addAuthCredential } from '../state/authActions';
import store from '../state/store';

class PageHeader extends Component {

    constructor(props) {
        super(props);

        this.state = {
            login: {
                showModal: false,
                userid: '',
                password: '',
                loginEnabled: false
            }
        };
    }

    render() {
        let message = (this.state.login.message) ? (<div className="alert alert-danger">{this.state.login.message}</div>) : undefined;

        return [
            <header className="pb-3 mb-2" key="page-header-header">
                <img className="img-fluid" src="./images/wiscon_header.jpg" style={{width: "100%" }} alt="The WisCon Conference"/>
                <Navbar bg="dark" expand="lg" className="navbar-dark navbar-expand-md justify-content-between">
                    <Nav className="navbar-expand-md navbar-dark bg-dark ">
                        <Nav.Link href="https://wiscon.net">WisCon Home</Nav.Link>
                        <Nav.Link href="https://wiscon.net">Find My Registration</Nav.Link>
                    </Nav>
                    <Nav className="navbar-expand-md navbar-dark bg-dark ">
                        <Nav.Link onClick={() => this.showLoginModal()}>Admin</Nav.Link>
                    </Nav>
                </Navbar>
            </header>,
            <Modal show={this.state.showModal}  onHide={() => this.handleClose()} key="page-header-login-dialog">
                <Form>
                    <Modal.Header closeButton>
                    <Modal.Title>Login</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {message}
                        <Form.Group className="mb-3" controlId="formEmail">
                            <Form.Label className="sr-only">Email</Form.Label>
                            <Form.Control type="email" placeholder="Enter email" value={this.state.userid} onChange={(e) => this.setUserid(e.target.value)}/>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formPasswod">
                            <Form.Label className="sr-only">Password</Form.Label>
                            <Form.Control type="password" placeholder="Password"  value={this.state.password} onChange={(e) => this.setPassword(e.target.value)}/>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={() => this.processLogin()} disabled={!this.state.login.loginEnabled}>
                            Login
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        ]
    }

    setUserid(userid) {
        let state = this.state;
        let enabled = state.login.loginEnabled;
        if (userid && this.state.login.password) {
            enabled = true;
        } else {
            enabled = false;
        }
        this.setState({
            ...state,
            login: {
                ...state.login,
                userid: userid,
                loginEnabled: enabled,
                message: undefined
            }
        });
    }

    setPassword(value) {
        let state = this.state;
        let enabled = state.login.loginEnabled;
        if (this.state.login.userid && value) {
            enabled = true;
        } else {
            enabled = false;
        }
        this.setState({
            ...state,
            login: {
                ...state.login,
                password: value,
                loginEnabled: enabled,
                message: undefined
            }
        });
    }

    handleClose() {
        let state = this.state;
        this.setState({
            ...state, 
            login: {
                showModal: false
            }
        });
    }

    showLoginModal() {
        let state = this.state;
        this.setState({
            ...state, 
            login: {
                showModal: true
            }
        });
    }

    processLogin() {
        axios.post('https://wisconregtest.bcholmes.org/api/authenticate.php', {
            userid: this.state.userid,
            password: this.state.password
        })
        .then(res => {
            let jwt = this.extractJwt(res);
            if (jwt) {
                store.dispatch(addAuthCredential(jwt));
            }
            this.setState({
                showModal: false
            });
        })
        .catch(error => {
            let state = this.state;
            let message = "There was a technical problem trying to log you in. Try again later."
            if (error.response && error.response.status === 401) {
                message = "There was a problem with your userid and/or password."
            }
            this.setState({
                ...state,
                login: {
                    ...state.login,
                    message: message
                }
            })
        });
    }

    extractJwt(res) {
        let authHeader = res.headers['authorization'];
        if (authHeader.indexOf('Bearer ') === 0) {
            return authHeader.substring('Bearer '.length);
        } else {
            return undefined;
        }
    }
}

export default PageHeader;