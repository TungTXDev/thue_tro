document.addEventListener("DOMContentLoaded", async function() {
    // 1. LẤY DỮ LIỆU
    const id = getQueryParam('id');
    let room = null;

    try {
        const response = await roomApi.getRoomById(id);
        room = response.data.room;
    } catch (error) {
        console.warn("API lỗi/chưa bật, fallback sang localStorage:", error.message);
        const data = getStorage(STORAGE_KEYS.ROOMS_DATA, []);
        room = data.find(r => r.id == id || r._id == id);
    }

    if (room) {
        document.getElementById('room-img').src = room.image;
        document.getElementById('room-title').innerText = room.title;
        document.getElementById('room-category').innerText = room.category;
        document.getElementById('room-address').innerHTML = `<i class="bi bi-geo-alt"></i> ${escapeHTML(room.district)}`;
        
        const p = formatVND(room.price);
        document.getElementById('room-price').innerHTML = p + " <span>/tháng</span>";
        document.getElementById('modal-price').innerText = p;

        // Cập nhật giá gốc cho chức năng booking
        if (typeof updateInitialPrice === "function") {
            updateInitialPrice(room);
        }
    }

    // 2. KHỞI TẠO BÌNH LUẬN
    if (typeof renderReviews === "function") {
        renderReviews();
    }
});
