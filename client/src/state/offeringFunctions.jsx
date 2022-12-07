
export function renderPrice(offering) {
    let price = renderPriceAsString(offering);
    let priceSuffix = isVariableAmount(offering) ? (<small className="text-muted"><sup>+</sup>&#8260;<sub>-</sub></small>) : undefined;
    return (<>
            <small className="text-muted fw-light"><small>{offering.currency}</small></small>{' '}
            {price} {priceSuffix}
        </>);
}

function renderPriceAsString(offering) {
    if (isVariantsPresent(offering)) {
        if (isDefaultVariantPresent(offering)) {
            let defaultVariant = getDefaultVariant(offering);
            return renderAmountAsString(defaultVariant.suggestedPrice, offering.currency);
        } else {
            return 'Varies';
        }
    } else {
        return renderAmountAsString(offering.suggestedPrice, offering.currency);
    }
}

export const renderAmountAsHtml = (amount, currency, plusMinus) => {
    let priceSuffix = plusMinus ? (<small className="text-muted"><sup>+</sup>&#8260;<sub>-</sub></small>) : undefined;
    return (<>
        <small className="text-muted fw-light"><small>{currency}</small></small>{' '}
        {renderAmountAsString(amount, currency)} {priceSuffix}
    </>);
}

export const renderAmountAsString = (amount, currency) => {
    let prefix = (currency === 'USD' || currency === 'CAD') ? '$' : '';
    if (amount == null) {
        return prefix + 'Any';
    } else if (amount === 0) {
        return 'Free';
    } else if (typeof(amount) === "number") {
        let result = amount.toFixed(2);
        if (result.indexOf(".00") >= 0) {
            return prefix + amount.toFixed(0);
        } else {
            return prefix + result;
        }
    } else {
        return prefix + amount;
    }
}

const isVariantsPresent = (offering) => {
    return offering?.variants?.length;
}

const isDefaultVariantPresent = (offering) => {
    return getDefaultVariant(offering) != null;
}

const getDefaultVariant = (offering) => {
    let variants = offering?.variants?.filter(v => v.isDefault);
    return variants?.length ? variants[0] : null;
}

const isVariableAmount = (offering) => {
    if (isVariantsPresent(offering)) {
        return isDefaultVariantPresent(offering) && isDifferentVariantAmountsPresent(offering);
    } else if (offering) {
        return offering.minimumPrice;
    } else {
        return false;
    }
}

const isDifferentVariantAmountsPresent = (offering) => {
    if (offering?.variants?.length > 0) {
        let amount = offering.variants[0].suggestedPrice;
        let otherAmounts = offering.variants.filter(v => v.suggestedPrice !== amount);
        return otherAmounts.length > 0;
    } else {
        return false;
    }
}