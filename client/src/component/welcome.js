import React, { Component } from 'react';
import Alert from 'react-bootstrap/Alert';

class Welcome extends Component {

    render() {
        return (<div>
            <h1>Wiscon Registration</h1>
            <p className="lead">WisCon 2022 will be held from May 27, 2022 to May 30, 2022. Register now!</p>
            <p>For more information about membership types, including our online memberships, visit 
                <a href="https://wiscon.net/register/" target="_blank" rel="noreferrer"> https://wiscon.net/register/</a>.</p>
            <Alert variant="info">
                <h5 className="alert-heading">Proof of Vaccination Required</h5>
                <p>You will be required to show documentation of COVID vaccination to attend.</p>
            </Alert>
        </div>);
    }
}

export default Welcome;