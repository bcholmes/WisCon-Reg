import React, { Component } from 'react';
import axios from 'axios';

import { withRouter } from "react-router";
import Alert from 'react-bootstrap/Alert';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import download from 'downloadjs';

import Footer from '../component/footer';
import PageHeader from '../component/pageHeader';
import { isAuthenticated } from '../util/jwtUtil';
import store from '../state/store';

class RegistrationsPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            records: {
                rows: []
            },
            loading: false
        }
    }

    componentDidMount() {
        console.log("authenticated: " + isAuthenticated());
        if (isAuthenticated()) {
            this.loadData();

            this.unsubscribe = store.subscribe(() => {
                if (!isAuthenticated()) {
                    this.goToHome();
                }
            });
        } else {
            this.goToHome();
        }
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    render() {
        let spinner = this.state.loading ? (<div className="text-center"><Spinner animation="border" /></div>) : undefined;
        let message = (this.state.message) ? (<div className="alert alert-danger">{this.state.message}</div>) : undefined;
        let warning = undefined;
        if (!this.state.loading && !this.state.items && !message) {
            warning = <Alert variant="warning">There are no registrations</Alert>;
        }

        let rows = this.state.items ? this.state.items.map((item, i) => {
            return (<tr>
                <td className="text-right">{item.id}</td>
                <td>{item.title}</td>
                <td className="text-right">{item.amount}</td>
                <td>{item.for}</td>
                <td>{item.email_address}</td>
                <td className="text-center">{item.payment_method}</td>
            </tr>);
        }) : undefined;

        return (
            <Container className="mx-auto">
                <PageHeader />
                <h1>Registration List</h1>
                {message}
                {warning}
                <div className="row mb-3">
                    <div className="col-md-6">
                        <Form.Group controlId="formFilter">
                            <Form.Label className="sr-only">Filter</Form.Label>
                            <Form.Control type="text" placeholder="Find..." />
                        </Form.Group>

                    </div>
                    <div className="col-md-6 text-right">
                        <Button variant="secondary" onClick={() => this.downloadReport()}>Download</Button>
                    </div>
                </div>
                {spinner}
                <table className="table table-hover table-sm">
                    <thead>
                        <tr>
                            <th className="text-right">Id</th>
                            <th>Purchase Item</th>
                            <th className="text-right">Amount</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th className="text-center">Payment Method</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows}
                    </tbody>
                </table>
                <Footer />
            </Container>
        );
    }

    async downloadReport() {

        axios.get('https://wisconregtest.bcholmes.org/api/download_report.php')
            .then(res => {

                let fileName = "report.csv";
                let disposition = res.headers['content-disposition'];
                if (disposition) {
                    let fileNameIndex = disposition.indexOf("filename=");
                    if (fileNameIndex >= 0) {
                        fileName = disposition.substr(fileNameIndex + "filename=".length);

                        if (fileName.indexOf(';') >= 0) {
                            fileName = fileName.substr(0, fileName.indexOf(';'));
                        }
                    }
                }
                let type = "text/csv";
                let contentType = res.headers['content-type'];
                if (contentType) {
                    type = contentType;
                    if (type.indexOf(';') >= 0) {
                        type = type.substr(0, type.indexOf(';'));
                    }
                }
                download(res.data, fileName, type);

            })
            .catch(error => {
                let state = this.state;
                let message = "The registration list could not be downloaded."
                this.setState({
                    ...state,
                    loading: false,
                    message: message
                })
            });
    }

    goToHome() {
        const { history } = this.props;
        history.push('/');
    }

    loadData() {
        let state = this.state;
        this.setState({
            ...state,
            loading: true
        });

        axios.get('https://wisconregtest.bcholmes.org/api/registrations_list.php')
        .then(res => {
            let state = this.state;
            this.setState({
                ...state,
                loading: false,
                message: null,
                items: res.data.items
            })
        })
        .catch(error => {
            let state = this.state;
            let message = "The registration list could not be loaded."
            this.setState({
                ...state,
                loading: false,
                message: message
            })
        });
    }
}

export default withRouter(RegistrationsPage);