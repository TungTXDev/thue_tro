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

function showToast(message, type = 'success') {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;

    const icon = type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill';

    toast.innerHTML = `
        <i class="bi ${icon}"></i>
        <span>${escapeHTML(message)}</span>
    `;

    document.body.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

window.showToast = showToast;
