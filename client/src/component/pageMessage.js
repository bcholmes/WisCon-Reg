import React from 'react';

import Alert from 'react-bootstrap/Alert';
import { connect } from 'react-redux';

import { removeMessage } from '../state/pageMessageActions';
import store from '../state/store';

const PageMessage = (props) => {

    function removeTheMessage(m) {
        store.dispatch(removeMessage(m));
    }

    return props.messages.map((m) => {
        return (<Alert variant={m.severity} dismissible onClose={() => removeTheMessage(m)}>{m.text}</Alert>)
    });
}

function mapStateToProps(state) {
    return { messages: state.pageMessage.messages || [] };
}

export default connect(mapStateToProps)(PageMessage);