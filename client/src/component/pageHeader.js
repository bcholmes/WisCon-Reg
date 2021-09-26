import React, { Component } from 'react';

import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/esm/Modal';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

class PageHeader extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showModal: false
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
                        <Nav.Link onClick={() => this.login()}>Admin</Nav.Link>
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
                            <Form.Control type="email" placeholder="Enter email" />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formPasswod">
                            <Form.Label className="sr-only">Password</Form.Label>
                            <Form.Control type="password" placeholder="Password" />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary">
                            Login
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        ]
    }

    handleClose() {
        this.setState({
            showModal: false
        });
    }

    login() {
        this.setState({
            showModal: true
        });
    }
}

export default PageHeader;