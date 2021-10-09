import React, { Component } from 'react';
import axios from 'axios';

import Container from 'react-bootstrap/Container';
import PageHeader from '../component/pageHeader';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import download from 'downloadjs';

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
        this.loadData();
    }
    render() {
        let spinner = this.state.loading ? (<Spinner animation="border" />) : undefined;
        let message = (this.state.message) ? (<div className="alert alert-danger">{this.state.message}</div>) : undefined;

        return (
            <Container className="mx-auto">
                <PageHeader />
                <h1>Registration List</h1>
                {message}
                <div className="alert alert-warning">There are no registrations.</div>
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
                <table className="table">
                    <thead>
                        <tr>
                            <th>Order Number</th>
                            <th>Purchase Item</th>
                            <th>Amount</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Payment Method</th>
                        </tr>
                    </thead>
                </table>
                {spinner}
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

    loadData() {
        let state = this.state;
        this.setState({
            ...state,
            loading: true
        });

        axios.get('https://wisconregtest.bcholmes.org/api/registration_list.php')
        .then(res => {
            let state = this.state;
            this.setState({
                ...state,
                loading: false,
                message: 'There are no registrations'
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

export default RegistrationsPage;