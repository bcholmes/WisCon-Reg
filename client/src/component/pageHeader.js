import React, { Component } from 'react';
import axios from 'axios';

import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/esm/Modal';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

class PageHeader extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showModal: false,
            userid: '',
            password: '',
            loginEnabled: false
        };
    }

    render() {
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
                        <Button variant="primary" onClick={() => this.processLogin()} disabled={!this.state.loginEnabled}>
                            Login
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        ]
    }

    setUserid(userid) {
        let state = this.state;
        let enabled = state.loginEnabled;
        if (userid && this.state.password) {
            enabled = true;
        } else {
            enabled = false;
        }
        this.setState({
            ...state,
            userid: userid,
            loginEnabled: enabled
        });
    }

    setPassword(value) {
        let state = this.state;
        let enabled = state.loginEnabled;
        if (this.state.userid && value) {
            enabled = true;
        } else {
            enabled = false;
        }
        this.setState({
            ...state,
            password: value,
            loginEnabled: enabled
        });
    }

    handleClose() {
        this.setState({
            showModal: false
        });
    }

    showLoginModal() {
        this.setState({
            showModal: true
        });
    }

    processLogin() {
        axios.post('https://wisconregtest.bcholmes.org/api/authenticate.php', {
            userid: this.state.userid,
            password: this.state.password
        })
            .then(function (response) {

            })
            .catch(function (error) {
                console.log(error);
            });
    }
}

export default PageHeader;