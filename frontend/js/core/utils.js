function formatVND(value) {
    if (value === null || value === undefined) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function escapeHTML(value) {
    if (!value) return '';
    const div = document.createElement('div');
    div.innerText = value;
    return div.innerHTML;
}

function getCurrentDateTime() {
    return new Date().toLocaleString('vi-VN');
}

function toPureNumber(val) {
    if (!val) return 0;
    const cleaned = String(val).replace(/[^0-9]/g, "");
    return cleaned ? parseInt(cleaned) : 0;
}
