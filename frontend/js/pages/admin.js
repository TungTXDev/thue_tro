// KIỂM TRA BẢO MẬT KHI VÀO TRANG ADMIN
const checkUser = getStorage(STORAGE_KEYS.CURRENT_USER);

if (!checkUser || (!checkUser.name.includes("Vũ") && checkUser.email !== "Vu69@gmail.com")) {
    alert("⛔ CẢNH BÁO: Bạn không có quyền truy cập khu vực này!");
    window.location.href = "index.html"; // Đá văng ra trang chủ ngay lập tức
}

async function loadAdminData() {
    let orders = [];
    let coupons = [];
    let totalRev = 0;

    try {
        const orderRes = await orderApi.getAllOrders();
        orders = orderRes.data.orders || [];
        
        const couponRes = await couponApi.getAllCoupons();
        coupons = couponRes.data.coupons || [];
        
        const dashRes = await adminApi.getDashboard();
        totalRev = dashRes.data.totalRevenue || 0;
    } catch (error) {
        console.warn("API lỗi/chưa bật, fallback sang localStorage:", error.message);
        orders = getStorage(STORAGE_KEYS.ALL_ORDERS, []);
        coupons = getStorage(STORAGE_KEYS.APP_COUPONS, []);
        
        // Tính toán doanh thu offline
        orders.forEach(order => {
            totalRev += order.pricePaid;
        });
    }

    const tableBody = document.getElementById('order-table-body');
    if (!tableBody) return;

    // 1. Hiển thị danh sách đơn hàng
    tableBody.innerHTML = '';
    orders.forEach(order => {
        // Fallback property mapping if backend uses different fields
        const date = order.createdAt ? new Date(order.createdAt).toLocaleString() : order.date;
        const userName = order.user ? order.user.name : order.userName;
        const roomName = order.room ? order.room.title : order.roomName;
        const pricePaid = order.totalPrice ? order.totalPrice : order.pricePaid;

        tableBody.innerHTML += `
            <tr>
                <td>${date}</td>
                <td><strong>${escapeHTML(userName || 'N/A')}</strong></td>
                <td>${escapeHTML(roomName || 'N/A')}</td>
                <td class="order-price">${formatVND(pricePaid)}</td>
                <td><span class="status-tag badge text-bg-success">Thành công</span></td>
            </tr>
        `;
    });

    // 2. Hiển thị tổng doanh thu
    const revDisplay = document.getElementById('total-revenue');
    if (revDisplay) {
        revDisplay.innerText = formatVND(totalRev);
    }

    // 3. Hiển thị danh sách mã giảm giá
    const couponList = document.getElementById('coupon-list');
    if (couponList) {
        couponList.innerText = "Mã đang chạy: " + coupons.map(c => c.code).join(', ');
    }
}

document.addEventListener("DOMContentLoaded", function() {
    loadAdminData();
});

async function clearOrders() {
    if(confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử đơn hàng?")) {
        try {
            await orderApi.clearOrders();
            alert("Đã xóa trên server");
        } catch (error) {
            console.warn("API lỗi/chưa bật, xóa ở localStorage:", error.message);
            removeStorage(STORAGE_KEYS.ALL_ORDERS);
        }
        location.reload();
    }
}

window.clearOrders = clearOrders;
