import React, { Component } from 'react';

import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

class Waiver extends Component {

    constructor(props) {
        super(props);

        this.state = {
            canCheckout: false
        }
    }
    
    render() {
        return (
            <Modal show={this.props.show} onHide={() => this.handleClose(false)} size="lg">
                <Modal.Header closeButton>
                <Modal.Title>Code of Conduct</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>WisCon is dedicated to working towards a harassment-free convention experience for all members, regardless of gender, gender identity and expression, sexual orientation, disability, physical appearance, body size, race, ethnicity, age, origin, or religion. We do not tolerate harassment of WisCon members in any form. Convention participants violating these rules may be sanctioned or expelled from the convention without a refund at the discretion of the convention organizers.</p>
                    <p>Our anti-harassment policy can be found at: <a href="https://wiscon.net/policies/anti-harassment/code-of-conduct/" target="_blank" rel="noreferrer">https://wiscon.net/policies/anti-harassment/code-of-conduct/</a>.</p>
                    <p>We are guided by our Statement of Principles, which can be found here: <a href="http://wiscon.net/policies/principles/" target="_blank" rel="noreferrer">http://wiscon.net/policies/principles/</a>.</p>
                    <div class="mt-5">
                        <Form.Check id="acknowledgement" checked={this.state.canCheckout} onChange={() => this.handleAcknowledge()}
                        label="I have read and acknowledge the WisCon Code of Conduct." />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="link" onClick={() => this.handleClose(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={() => this.handleClose(true)} disabled={!this.state.canCheckout}>
                        Checkout
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }

    handleAcknowledge() {
        let ok = this.state.canCheckout;
        this.setState({
            canCheckout: !ok
        })
    }

    handleClose(checkout) {
        if (this.props.onClose) {
            this.props.onClose(checkout);
        }
    }
}

export default Waiver;