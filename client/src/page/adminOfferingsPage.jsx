import React from 'react';
import Container from 'react-bootstrap/esm/Container';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Footer from '../component/footer';
import PageHeader from '../component/pageHeader';
import { renderPrice } from '../state/offeringFunctions';
import { isAuthenticated } from '../util/jwtUtil';

import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import advancedFormat from "dayjs/plugin/advancedFormat"
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);

class AdminOfferingsPage extends React.Component {

    componentDidMount() {
        if (!isAuthenticated()) {
            this.goToHome();
        }
    }

    componentDidUpdate() {
        if (!this.props.isAuthenticated) {
            this.goToHome();
        }
    }

    render() {
        return (<Container className="mx-auto">
            <PageHeader />
            <h1>Available Offerings</h1>

            <p>The following items are available for purchase for {this.props.con}.</p>

            <table className="table table-sm table-hover">
                <thead>
                    <tr>
                        <th>Offering</th>
                        <th>Price</th>
                        <th>Availability</th>
                        <th>Options</th>
                    </tr>
                </thead>
                <tbody>
                    {this.props.offerings.map(o => { return (<tr key={'offering-'+o.id}>
                        <td>{o.title}</td>
                        <td>{renderPrice(o)}</td>
                        <td>To be provided</td>
                        <td></td>
                    </tr>); })}
                </tbody>
            </table>

            <Footer />
        </Container>);
    }

    goToHome() {
        const { history } = this.props;
        history.push('/');
    }
}

function mapStateToProps(state) {
    return {
        isAuthenticated: isAuthenticated(),
        offerings: state?.offerings?.items,
        con: state?.con?.currentCon?.name
    };
}

export default withRouter(connect(mapStateToProps)(AdminOfferingsPage));
