window.DetailPageState = window.DetailPageState || {
    currentRoom: null,
    finalPrice: 0
};

// Hàm này chạy khi mở Modal để nạp giá gốc
function updateInitialPrice(room) {
    if (room) {
        window.DetailPageState.currentRoom = room;
        window.DetailPageState.finalPrice = room.price; 
    }
}

function openModal() { 
    document.getElementById('payModal').style.display = 'flex'; 
}

function closeModal() { 
    document.getElementById('payModal').style.display = 'none'; 
}

function switchPay(type) {
    if (!window.DetailPageState.currentRoom) return;

    const detail = document.getElementById('pay-detail');
    document.getElementById('btn-cash').classList.remove('active');
    document.getElementById('btn-qr').classList.remove('active');

    if(type === 'cash') {
        document.getElementById('btn-cash').classList.add('active');
        detail.innerHTML = '<p class="text-muted">Bạn sẽ thanh toán tiền khi đến xem phòng trực tiếp.</p>';
    } else {
        document.getElementById('btn-qr').classList.add('active');
        const qrUrl = `https://img.vietqr.io/image/mbbank-0987654321-compact2.png?amount=${window.DetailPageState.currentRoom.price}&addInfo=DatPhong${window.DetailPageState.currentRoom.id}`;
        detail.innerHTML = `<p class="qr-instruction">Quét mã để đặt cọc giữ phòng:</p><img src="${qrUrl}" class="qr-image">`;
    }
}

async function confirmBooking() {
    // 1. Hiện thông báo bắt đầu xử lý
    alert("Hệ thống đang xử lý đơn hàng ...");

    try {
        // 2. Lấy thông tin người dùng (đảm bảo đã đăng nhập)
        const user = getStorage(STORAGE_KEYS.CURRENT_USER) || { name: "Khách vãng lai" };

        let priceToSave = 0;
        if (typeof window.DetailPageState.finalPrice !== 'undefined' && window.DetailPageState.finalPrice !== 0) {
            priceToSave = toPureNumber(window.DetailPageState.finalPrice);
        } else if (window.DetailPageState.currentRoom && window.DetailPageState.currentRoom.price) {
            priceToSave = toPureNumber(window.DetailPageState.currentRoom.price);
        }

        const roomId = window.DetailPageState.currentRoom ? (window.DetailPageState.currentRoom._id || window.DetailPageState.currentRoom.id) : null;
        const roomName = window.DetailPageState.currentRoom ? window.DetailPageState.currentRoom.title : "Phòng trọ sinh viên";

        const orderData = {
            roomId: roomId,
            roomName: roomName,
            pricePaid: priceToSave
        };

        try {
            await orderApi.createOrder(orderData);
            alert(`Đã đặt phòng thành công qua API!\nSố tiền: ${priceToSave.toLocaleString()} VNĐ`);
        } catch (error) {
            console.warn("API lỗi/chưa bật, fallback sang localStorage:", error.message);
            
            // Fallback
            const newOrder = {
                date: getCurrentDateTime(),
                userName: user.name,
                roomName: roomName,
                pricePaid: priceToSave 
            };
            
            let storageOrders = getStorage(STORAGE_KEYS.ALL_ORDERS, []);
            storageOrders.push(newOrder);
            setStorage(STORAGE_KEYS.ALL_ORDERS, storageOrders);

            alert(`Đã đặt phòng thành công (Offline)!\nSố tiền: ${priceToSave.toLocaleString()} VNĐ`);
        }
        
        closeModal();
        location.reload();

    } catch (error) {
        console.error("Lỗi xác nhận đặt phòng:", error);
        alert("Có lỗi code rồi " + error.message);
    }
}

window.updateInitialPrice = updateInitialPrice;
window.openModal = openModal;
window.closeModal = closeModal;
window.switchPay = switchPay;
window.confirmBooking = confirmBooking;
