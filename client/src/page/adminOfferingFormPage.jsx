import React from "react";
import Container from "react-bootstrap/Container";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import AdminOfferingForm from "../component/adminOfferingForm";
import PageHeader from "../component/pageHeader";
import { isAuthenticated } from "../util/jwtUtil";


class AdminOfferingFormPage extends React.Component {

    componentDidMount() {
        if (!this.props.isAuthenticated) {
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
            <h1>Maintain Offering</h1>
            <p>Use this page to update the offering details.</p>

            <AdminOfferingForm offeringId={this.props.match.params.offeringId} />
        </Container>);
    }

}

function mapStateToProps(state, ownProps) {
    return {
        isAuthenticated: isAuthenticated()
    };
}

export default withRouter(connect(mapStateToProps)(AdminOfferingFormPage));