import React from 'react';
import Badge from 'react-bootstrap/Badge';
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

    goToOfferingForm(offering) {
        const { history } = this.props;
        history.push('/admin/offerings/' + offering.id);
    }

    renderDateRange(startTime, endTime) {
        if (startTime && endTime) {
            return dayjs(startTime).format('ddd, MMM D, YYYY') + ' - ' + dayjs(endTime).format('ddd, MMM D, YYYY');
        } else {
            return null;
        }
    }

    renderOptions(offering) {
        return (<>
            {offering.isMembership ? <Badge variant="primary" className="mr-1">Membership</Badge> : null}
            {offering.addPrompts ? <Badge variant="primary" className="mr-1">Volunteer prompts</Badge> : null}
            {(offering.emailRequired === 'REQUIRED' || offering.emailRequired === 'REQUIRED') ? <Badge variant="primary" className="mr-1">Email</Badge> : null}
            {offering.isDonation ? <Badge variant="primary" className="mr-1">Donation</Badge> : null}
        </>)
    }

    renderOfferingRows(offering) {
        if (offering?.variants?.length) {
            return offering.variants.map(v => (<tr key={'offering-'+offering.id + '-' + v.id} role="button" onClick={() => this.goToOfferingForm(offering)}>
                    <td>{offering.title}</td>
                    <td>{v.name}</td>
                    <td className="text-center">{renderAmountAsHtml(v.suggestedPrice, offering.currency, false)}</td>
                    <td>{this.renderDateRange(offering.startTime, offering.endTime)}</td>
                    <td>{this.renderOptions(offering)}</td>
                </tr>));
        } else {
            return (<tr key={'offering-'+offering.id} role="button" onClick={() => this.goToOfferingForm(offering)}>
                    <td>{offering.title}</td>
                    <td></td>
                    <td className="text-center">{renderPrice(offering)}</td>
                    <td>{this.renderDateRange(offering.startTime, offering.endTime)}</td>
                    <td>{this.renderOptions(offering)}</td>
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
