import React, { Component } from 'react';
import axios from 'axios';

import { withRouter } from "react-router";
import Alert from 'react-bootstrap/Alert';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import download from 'downloadjs';

import Footer from '../component/footer';
import PageHeader from '../component/pageHeader';
import { isAuthenticated } from '../util/jwtUtil';
import store from '../state/store';
import { logout } from '../state/authActions';
import { sdlc } from '../util/sdlcUtil';
import AdminOrderSummary from '../component/adminOrderSummary';

class RegistrationsPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            records: {
                rows: []
            },
            loading: false,
            term: ''
        }
    }

    componentDidMount() {
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
            return (<tr key={item.id + '-' + i}  onClick={() => {this.openOrder(item)}} role="button">
                <td className="text-right">{item.id}</td>
                <td><time dateTime={item.finalized_date}>{item.finalized_date_simple}</time></td>
                <td>{item.title}</td>
                <td className="text-right">{item.amount}</td>
                <td>{item.for}</td>
                <td>{item.email_address}</td>
                <td className="text-center">{item.payment_method}</td>
            </tr>);
        }) : undefined;

        let pagination = this.state.pagination ? (
                <div className="row mb-2">
                    <div className="col-md-8">

                    </div>
                    <div className="col-md-4 text-right">
                        <b>Displaying records {this.state.pagination.start} to {this.state.pagination.end} of {this.state.pagination.totalRows}</b>
                    </div>
                </div>
        ) : undefined;

        let links = this.renderLinks();
        let linkFooter = links ? (<tfoot>
                <tr>
                    <td colSpan="7">
                        {links}
                    </td>
                </tr>
            </tfoot>) : undefined;

        return (
            <Container className="mx-auto">
                <PageHeader />
                <h1>Registration List</h1>
                {message}
                {warning}
                <div className="row mb-3">
                    <div className="col-md-6">
                        <Form onSubmit={(e) => e.preventDefault()}>
                            <Form.Group controlId="term">
                                <Form.Label className="sr-only">Filter</Form.Label>
                                <div className="input-group mb-3">
                                <Form.Control value={this.getTerm()} placeholder="Find..." name="filter" onChange={(e) => this.executeFilter(e.target.value)} />
                                <span className="input-group-append">
                                    <button className="btn btn-secondary" type="button" onClick={() => this.fastExecuteFilter()}>
                                        <i className="fa fa-times"></i>
                                    </button>
                                </span>
                                </div>
                            </Form.Group>
                        </Form>
                    </div>
                    <div className="col-md-6 text-right">
                        <Button variant="secondary" onClick={() => this.refresh()}><i className="bi bi-arrow-clockwise"></i></Button>
                        <Button variant="secondary" className="ml-2" onClick={() => this.downloadReport()}>Download</Button>
                    </div>
                </div>
                {spinner}
                {pagination}
                <table className="table table-hover table-sm">
                    <thead>
                        <tr>
                            <th className="text-right">Id</th>
                            <th>Date</th>
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
                    {linkFooter}
                </table>

                <Modal show={this.state.showModal}  onHide={() => this.handleClose()} size="xl">
                    <Modal.Header closeButton>
                    <Modal.Title>Order Review</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <AdminOrderSummary orderId={this.state.orderId} orderKey={this.state.orderKey} onUpdate={() => this.handleOrderUpdate()}/>
                    </Modal.Body>
                </Modal>
                <Footer />
            </Container>
        );
    }

    renderLinks() {
        if (this.state.links) {
            let orderedLinks = [];
            if (this.state.links['start']) {
                orderedLinks.push({ name: '«', link: this.state.links['start'] });
            }
            for (let i = 1; true; i++) {
                if (this.state.links[i]) {
                    orderedLinks.push({ name: '' + i, link: this.state.links['' + i] });
                } else {
                    break;
                }
            }
            if (this.state.links['end']) {
                orderedLinks.push({ name: '»', link: this.state.links['end'] });
            }
            let items = orderedLinks.map((link, i) => {
                let active = (this.state.pagination && this.state.pagination.page != null) 
                    ? (((this.state.pagination.page + 1).toString()) === link['name'] ? "active" : "") 
                    : "";
                let pageItemClass = "page-item " + active;
                return (<li className={pageItemClass}><a className="page-link" href="#" onClick={(e) => {e.preventDefault(); this.loadDataWithUrl(link['link']);}}>{link['name']}</a></li>);
            });
            return (<ul className="pagination">{items}</ul>);
        } else {
            return undefined;
        }
    }

    openOrder(orderItem) {
        console.log("open order");
        this.setState({
            ...this.state,
            showModal: true,
            orderId: orderItem.orderUuid,
            orderKey: orderItem.key
        });
    }

    handleClose() {
        this.setState({
            ...this.state,
            showModal: false,
            orderId: undefined,
            orderKey: undefined
        })
    }

    getTerm() {
        return this.state.term || '';
    }
    executeFilter(term) {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.setState({
            ...this.state,
            term: term
        })
        this.timeout = setTimeout(() => {
            this.loadDataWithFilter(term);
            this.timeout = undefined;
        }, 1000);
    }

    fastExecuteFilter() {
        this.setState({
            ...this.state,
            term: ''
        });
        this.timeout = setTimeout(() => {
            this.loadData();
            this.timeout = undefined;
        }, 250);
    }

    async downloadReport() {

        axios.get(sdlc.serverUrl('/api/download_report.php'), {
                headers: {
                    "Authorization": "Bearer " + store.getState().auth.jwt
                }
            })
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
                if (error.response && error.response.status === 401) {
                    store.dispatch(logout());
                }
            });
    }

    goToHome() {
        const { history } = this.props;
        history.push('/');
    }

    loadDataWithFilter(term) {
        if (term) {
            this.loadDataWithUrl('/api/registrations_list.php' + '?term=' + term);
        } else {
            this.loadData();
        }
    }
    loadData() {
        this.loadDataWithUrl('/api/registrations_list.php');
    }
    loadDataWithUrl(url) {
        let state = this.state;
        this.setState({
            ...state,
            loading: true,
            lastLoadedUrl: url
        });

        if (isAuthenticated()) {
            axios.get(url, {
                headers: {
                    "Authorization": "Bearer " + store.getState().auth.jwt
                }
            })
            .then(res => {
                let state = this.state;
                this.setState({
                    ...state,
                    loading: false,
                    message: null,
                    items: res.data.items,
                    pagination: res.data.pagination,
                    links: res.data.links
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
                if (error.response && error.response.status === 401) {
                    store.dispatch(logout());
                }
            });
        }
    }

    handleOrderUpdate() {
        this.handleClose();
        this.timeout = setTimeout(() => {
            this.refresh();
            this.timeout = undefined;
        }, 250);
    }

    refresh() {
        this.loadDataWithUrl(this.state.lastLoadedUrl);
    }
}

export default withRouter(RegistrationsPage);