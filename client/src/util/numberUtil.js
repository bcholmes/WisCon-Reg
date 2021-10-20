export function formatAmount(amount) {
    let result = amount.toFixed(2);
    if (result.indexOf(".00") >= 0) {
        return '$' + amount.toFixed(0);
    } else {
        return '$' + result;
    }
}
