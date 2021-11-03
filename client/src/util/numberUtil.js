export function formatAmount(amount, currency) {
    let result = amount.toFixed(2);
    let prefix = (currency === 'USD' || currency === 'CAD') ? '$' : '';
    if (result.indexOf(".00") >= 0) {
        return prefix + amount.toFixed(0);
    } else {
        return prefix + result;
    }
}
