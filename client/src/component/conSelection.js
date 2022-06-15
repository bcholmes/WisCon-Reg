import React, { Component } from 'react';
import axios from 'axios';

import Modal from 'react-bootstrap/Modal';
import store from '../state/store';
import SimpleAlert from './simpleAlert';
import { connect } from 'react-redux';
import Button from 'react-bootstrap/esm/Button';
import Spinner from 'react-bootstrap/esm/Spinner';
import { setConList } from '../state/conActions';

import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import advancedFormat from "dayjs/plugin/advancedFormat"
import customParseFormat from "dayjs/plugin/customParseFormat"
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);

class ConSelection extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: this.props.conList == null,
            message: null
        }
    }
    
    componentDidMount() {
        if (this.state.loading) {
            this.fetchCons();
        }
    }

    render() {
        return <Modal show={this.props.show} onHide={() => this.props.onClose(null)} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Con Selection</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <SimpleAlert message={this.state.message} />
                <p>Choose which con you want to work with.</p>
                {this.renderConList()}
            </Modal.Body>
        </Modal>;
    }

    renderConList() {
        if (this.props.loading) {
            return (<div className="text-center">
                <Spinner animation="border" />
            </div>);
        } else if (this.props.conList != null) {
            let rows = this.props.conList.map((c) => {
                let startDate = dayjs(c.startDate).format('ddd, MMM D, YYYY')
                let endDate = dayjs(c.endDate).format('ddd, MMM D, YYYY')

                return (<tr key={'con-' + c.id}>
                    <td>{c.name}</td>
                    <td>{startDate}</td>
                    <td>{endDate}</td>
                    <td className="text-right"><Button variant="outline-primary" onClick={() => this.props.onClose(c)}>Select</Button></td>
                </tr>);
            });
            return (<table className="table">
                <tbody>
                    {rows}
                </tbody>
            </table>);
        } else {
            return undefined;
        }
    }

    fetchCons() {
        axios.get('/api/get_con_list.php', {
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
            });
            store.dispatch(setConList(res.data.list));
        })
        .catch(error => {
            let state = this.state;
            let message = "The cons list could not be loaded."
            this.setState({
                ...state,
                loading: false,
                message: { severity: "danger", text: message }
            })
            if (error.response && error.response.status === 401) {
                this.forceLogout();
            }
        });
    }
}
function mapStateToProps(state) {
    return { conList: state.con.list };
}

export default connect(mapStateToProps)(ConSelection);