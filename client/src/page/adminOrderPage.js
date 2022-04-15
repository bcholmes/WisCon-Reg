import React from 'react';
import Container from 'react-bootstrap/esm/Container';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import AdminOrderSummary from '../component/adminOrderSummary';
import Footer from '../component/footer';
import PageHeader from '../component/pageHeader';
import { isAuthenticated } from '../util/jwtUtil';

class AdminOrderPage extends React.Component {

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
            <AdminOrderSummary orderId={this.props.match.params.orderId} />

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
        isAuthenticated: isAuthenticated()
    };
}

export default withRouter(connect(mapStateToProps)(AdminOrderPage));
