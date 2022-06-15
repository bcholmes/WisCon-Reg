import React from 'react';

import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

const LoadingButton = (props) => {

    const spinner = props.loading ? (<Spinner
        as="span"
        animation="border"
        size="sm"
        role="status"
        aria-hidden="true"
    />) : undefined;
    return (<Button variant="primary" onClick={() => props.onClick()} 
        className={props.className}
        disabled={!props.enabled || props.loading}>{spinner} {props.text} {props.children}</Button>);
}

export default LoadingButton;