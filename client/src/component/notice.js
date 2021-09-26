import React, { Component } from 'react';

class Notice extends Component {

    render() {
        return (
            <p className="mt-2 text-muted">
                Note that all members are expected to abide by {' '}
                <a href="http://wiscon.net/policies/anti-harassment/code-of-conduct/" target="_blank" rel="noreferrer">
                    WisCon's Code of Conduct
                </a>. 
                {' '}You will be asked to acknowledge this expectation.
            </p>
        )
    }
}

export default Notice;