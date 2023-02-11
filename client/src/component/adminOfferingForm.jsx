import React from "react";
import Button from "react-bootstrap/Button";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { findOfferingById } from "../state/offeringFunctions";


class AdminOfferingForm extends React.Component {

    render() {
        const { offering } = this.props;
        console.log(this.props.offeringId, offering);
        return (<>
            <h2>{offering?.title}</h2>

            <div className="text-right">
                <Button variant="link" onClick={() => this.navigateToOfferingsPage()} key="back-button" className="mr-2">
                    Back
                </Button>
                <Button variant="primary" onClick={() => {}} key="save-button">
                    Save
                </Button>
            </div>
        </>);
    }

    navigateToOfferingsPage() {
        const { history } = this.props;
        history.push('/admin/offerings');
    }

}

function mapStateToProps(state, ownProps) {
    return {
        offering: findOfferingById(parseInt(ownProps.offeringId))
    };
}

export default withRouter(connect(mapStateToProps)(AdminOfferingForm));