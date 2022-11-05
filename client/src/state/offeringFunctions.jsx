
export function renderPrice(offering) {
    let price = (offering.suggestedPrice == null) ? 'Any' : (offering.suggestedPrice ===  0 ? 'Free' : ('$' + offering.suggestedPrice.toFixed(0)));
    let priceSuffix = isVariableAmount(offering) ? (<small className="text-muted">+/-</small>) : undefined;
    return (<>
            <small className="text-muted fw-light"><small>{offering.currency}</small></small>{' '}
            {price} {priceSuffix}
        </>);
}

const isVariableAmount = (offering) => {
    if (offering) {
        return offering.minimumPrice;
    } else {
        return false;
    }
}
