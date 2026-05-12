const landlordUser = getStorage(STORAGE_KEYS.CURRENT_USER);
const landlordRole = typeof getUserRole === "function" ? getUserRole(landlordUser) : (landlordUser && landlordUser.role);

if (!landlordUser || landlordRole !== "landlord") {
    alert("Bạn không có quyền truy cập màn Chủ trọ.");
    window.location.href = "index.html";
}

async function loadLandlordData() {
    if (!landlordUser || landlordRole !== "landlord") return;
    let rooms = [];
    let orders = [];

    try {
        const response = await roomApi.getAllRooms();
        rooms = response.data.rooms || [];
    } catch (error) {
        console.warn("API lỗi/chưa bật, fallback sang localStorage:", error.message);
        rooms = getStorage(STORAGE_KEYS.ROOMS_DATA, []);
    }

    orders = getStorage(STORAGE_KEYS.ALL_ORDERS, []);

    const myRooms = rooms.slice(0, 8);
    const myRoomNames = new Set(myRooms.map(room => room.title));
    const myOrders = orders.filter(order => myRoomNames.has(order.roomName)).slice(0, 10);

    const totalRooms = document.getElementById('landlord-total-rooms');
    const availableRooms = document.getElementById('landlord-available-rooms');
    const totalOrders = document.getElementById('landlord-total-orders');
    const userName = document.getElementById('dashboard-user-name');

    if (totalRooms) totalRooms.innerText = myRooms.length;
    if (availableRooms) availableRooms.innerText = myRooms.length;
    if (totalOrders) totalOrders.innerText = myOrders.length;
    if (userName) userName.innerText = landlordUser.name || 'Chủ trọ';

    renderLandlordRooms(myRooms);
    renderLandlordOrders(myOrders);
}

function renderLandlordRooms(rooms) {
    const roomList = document.getElementById('landlord-room-list');
    if (!roomList) return;

    if (!rooms.length) {
        roomList.innerHTML = '<p class="text-muted">Chưa có phòng nào để quản lý.</p>';
        return;
    }

    roomList.innerHTML = rooms.map(room => `
        <article class="landlord-room-card">
            <img src="${escapeHTML(room.image)}" alt="${escapeHTML(room.title)}">
            <div class="room-card-body">
                <h3>${escapeHTML(room.title)}</h3>
                <p><i class="bi bi-geo-alt"></i> ${escapeHTML(room.district)}</p>
                <p class="fw-bold text-primary">${formatVND(room.price)} / tháng</p>
                <span class="badge text-bg-success">Đang hiển thị</span>
            </div>
        </article>
    `).join('');
}

function renderLandlordOrders(orders) {
    const tableBody = document.getElementById('landlord-order-table-body');
    if (!tableBody) return;

    if (!orders.length) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-muted">Chưa có đơn đặt phòng liên quan.</td></tr>';
        return;
    }

    tableBody.innerHTML = orders.map(order => `
        <tr>
            <td>${escapeHTML(order.date || 'N/A')}</td>
            <td><strong>${escapeHTML(order.userName || 'N/A')}</strong></td>
            <td>${escapeHTML(order.roomName || 'N/A')}</td>
            <td class="order-price">${formatVND(order.pricePaid || 0)}</td>
            <td><span class="badge text-bg-success">Thành công</span></td>
        </tr>
    `).join('');
}

document.addEventListener("DOMContentLoaded", loadLandlordData);
