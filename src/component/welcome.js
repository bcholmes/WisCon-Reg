import React, { Component } from 'react';
import Alert from 'react-bootstrap/Alert';

class Welcome extends Component {

    render() {
        return [
            <h1>Wiscon Registration</h1>,
            <p class="lead">WisCon 44 will be held from May 27, 2022 to May 30, 2022. Register now!</p>,
            <Alert variant="info">
                <h4 class="alert-heading">Proof of Vaccination Required</h4>
                <p>Please note that for our 2022 conference, you will be required to show proof of COVID vaccination to attend.</p>
            </Alert>
        ];
    }
}

export default Welcome;