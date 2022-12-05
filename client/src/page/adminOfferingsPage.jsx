import React from 'react';
import Container from 'react-bootstrap/esm/Container';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Footer from '../component/footer';
import PageHeader from '../component/pageHeader';
import { renderAmountAsHtml, renderPrice } from '../state/offeringFunctions';
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
                        <th>Variant</th>
                        <th className="text-center">Price</th>
                        <th>Availability</th>
                        <th>Options</th>
                    </tr>
                </thead>
                <tbody>
                    {this.props.offerings.map(o => this.renderOfferingRows(o))}
                </tbody>
            </table>

            <Footer />
        </Container>);
    }

    goToHome() {
        const { history } = this.props;
        history.push('/');
    }

    renderOfferingRows(offering) {
        if (offering?.variants?.length) {
            return offering.variants.map(v => (<tr key={'offering-'+offering.id + '-' + v.id}>
                    <td>{offering.title}</td>
                    <td>{v.name}</td>
                    <td className="text-center">{renderAmountAsHtml(v.suggestedPrice, offering.currency, false)}</td>
                    <td>To be provided</td>
                    <td></td>
                </tr>));
        } else {
            return (<tr key={'offering-'+offering.id}>
                    <td>{offering.title}</td>
                    <td></td>
                    <td className="text-center">{renderPrice(offering)}</td>
                    <td>To be provided</td>
                    <td></td>
                </tr>);
        }
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
