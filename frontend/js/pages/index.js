// Khởi tạo trang chủ
document.addEventListener("DOMContentLoaded", function() {
    // Khởi tạo dữ liệu nếu cần
    if (typeof seedRoomsIfNeeded === "function") {
        seedRoomsIfNeeded();
    }

    // Thiết lập hiển thị phòng
    if (typeof renderRooms === "function") {
        renderRooms(); 
    }

    // Thiết lập Header & Auth
    if (typeof updateHeader === "function") {
        updateHeader();
    }
    if (typeof setupAuthForm === "function") {
        setupAuthForm();
    }

    // Thiết lập bộ lọc
    if (typeof setupFilterEvents === "function") {
        setupFilterEvents();
    }
});
