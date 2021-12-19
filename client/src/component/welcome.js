import Alert from 'react-bootstrap/Alert';

const Welcome = () => {

    return (<div>
        <h1>Wiscon Registration</h1>
        <p className="lead">WisCon 2022 will be held from May 27, 2022 to May 30, 2022. Register now!</p>
        <p>For more information about membership types, including our online memberships, visit 
            <a href="https://wiscon.net/register/" target="_blank" rel="noreferrer"> https://wiscon.net/register/</a>.</p>
        <Alert variant="info">
            <h5 className="alert-heading">Proof of Vaccination Required</h5>
            <p>All attendees, including children, must show documentation of COVID vaccination to attend. Unvaccinated 
                individuals, including children too young to be vaccinated, will not be able to attend WisCon 2022 
                in person.</p>
        </Alert>
    </div>);
}

export default Welcome;