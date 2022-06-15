import Alert from 'react-bootstrap/Alert';
import {connect} from 'react-redux';

import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import advancedFormat from "dayjs/plugin/advancedFormat"
import customParseFormat from "dayjs/plugin/customParseFormat"
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);

const Welcome = (props) => {

    if (props.currentCon != null) {
        let startDate = dayjs(props.currentCon.startDate).format('MMM D, YYYY')
        let endDate = dayjs(props.currentCon.endDate).format('MMM D, YYYY')

        return (<div>
            <h1>Wiscon Registration</h1>
            <p className="lead">{props.currentCon.name + ' '} will be held from 
                {' ' + startDate + ' '} to {' ' + endDate}. Register now!</p>
            <p>For more information about membership types, including our online memberships, visit {' '}
                <a href="https://wiscon.net/register/" target="_blank" rel="noreferrer">https://wiscon.net/register/</a>.</p>
            <Alert variant="info">
                <h5 className="alert-heading">Masks and Proof of Vaccination Required</h5>
                <p>
                    All attendees, including children, must show documentation of COVID vaccination to attend, and must wear masks in 
                    convention spaces. Unvaccinated individuals, including children too young to be vaccinated, will not be able to
                    attend WisCon 2022 in person. For more information, visit {' '}
                    <a href="http://wiscon.net/covid-19-and-wiscon-2022/" className="alert-link" target="_blank" rel="noreferrer">COVID-19 and WisCon 2022</a>.
                </p>
            </Alert>
        </div>);
    } else {
        return null;
    }
}

function mapStateToProps(state) {
    return { currentCon: state.con.currentCon };
}

export default connect(mapStateToProps)(Welcome);