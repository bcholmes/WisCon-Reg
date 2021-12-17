import React, { Component } from 'react';

import Alert from 'react-bootstrap/Alert';

import { removeMessage } from '../state/pageMessageActions';
import store from '../state/store';

class PageMessage extends Component {

    constructor(props) {
        super(props);
        this.state = { messages: store.getState().pageMessage.messages };
    }

    componentWillMount() {
        this.unsubscribe = store.subscribe(() => {
            this.setState({
                messages: store.getState().pageMessage.messages
            });
        });
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }


    render() {
        return this.state.messages.map((m) => {
            return (<Alert variant={m.severity} dismissible onClose={() => this.removeMessage(m)}>{m.text}</Alert>)
        })
    }

    removeMessage(m) {
        store.dispatch(removeMessage(m));
    }
}

export default PageMessage;