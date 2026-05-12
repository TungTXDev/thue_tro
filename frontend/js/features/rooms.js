// Hàm hiển thị phòng 
async function renderRooms(dataToRender = null) {
    const roomGrid = document.getElementById('room-grid');
    if (!roomGrid) return; // Nếu không ở trang chủ thì không chạy
    
    let rooms = [];

    // Nếu truyền dữ liệu vào thì dùng dữ liệu đó
    if (dataToRender) {
        rooms = dataToRender;
    } else {
        try {
            // Thử gọi API lấy danh sách phòng
            const response = await roomApi.getAllRooms();
            rooms = response.data.rooms;
        } catch (error) {
            console.warn("API lỗi/chưa bật, fallback sang localStorage:", error.message);
            // Fallback lấy toàn bộ từ LocalStorage
            rooms = getStorage(STORAGE_KEYS.ROOMS_DATA, []);
        }
    }
    
    roomGrid.innerHTML = ''; 

    // Nếu danh sách trống 
    if (!rooms || rooms.length === 0) {
        roomGrid.innerHTML = '<p class="empty-message"><i class="bi bi-search"></i> Không tìm thấy phòng nào phù hợp với yêu cầu của bạn.</p>';
        return;
    }

    rooms.forEach(room => {
        const priceFormatted = formatVND(room.price);

        const cardHTML = `
            <div class="card h-100 shadow-sm">
                <a href="detail.html?id=${room.id}">
                    <img src="${escapeHTML(room.image)}" alt="Ảnh phòng" class="card-img-top cursor-pointer">
                </a>
                <div class="card-body">
                    <span class="card-category badge text-bg-warning">${escapeHTML(room.category)}</span>
                    <h3 class="card-title">${escapeHTML(room.title)}</h3>
                    <p class="card-location"><i class="bi bi-geo-alt"></i> ${escapeHTML(room.district)}</p>
                    <div class="card-price">${priceFormatted}<span class="price-format"> / tháng</span></div>
                    <a href="detail.html?id=${room.id}" class="btn-detail btn btn-outline-primary btn-sm">Xem chi tiết</a>
                </div>
            </div>
        `;
        roomGrid.innerHTML += cardHTML;
    });
}

// TÌM KIẾM VÀ LỌC
async function filterRooms() {
    // Lấy giá trị người dùng đang nhập/chọn
    const searchInput = document.getElementById('search');
    const priceRange = document.getElementById('priceRange');
    const typeSelect = document.getElementById('type');

    if (!searchInput || !priceRange || !typeSelect) return;

    const searchText = searchInput.value.toLowerCase();
    const priceFilter = priceRange.value;
    const typeFilter = typeSelect.value;

    try {
        // Nếu API bật, ta có thể lọc ngay trên backend bằng cách gọi API với query parameters
        let queryParams = {};
        if (searchText) queryParams.search = searchText;
        if (typeFilter !== 'all') queryParams.category = typeFilter;
        
        if (priceFilter === 'under2') {
            queryParams.maxPrice = 2000000;
        } else if (priceFilter === '2to3') {
            queryParams.minPrice = 2000000;
            queryParams.maxPrice = 3000000;
        } else if (priceFilter === 'above3') {
            queryParams.minPrice = 3000000;
        }

        const response = await roomApi.getAllRooms(queryParams);
        renderRooms(response.data.rooms);
    } catch (error) {
        console.warn("API lỗi/chưa bật, dùng bộ lọc bằng localStorage:", error.message);
        // Lấy toàn bộ kho dữ liệu ra
        const allRooms = getStorage(STORAGE_KEYS.ROOMS_DATA, []);

        // Bắt đầu sàng lọc
        const filteredRooms = allRooms.filter(room => {
            // 1. Kiểm tra chữ tìm kiếm có nằm trong tên hoặc địa chỉ không?
            const matchText = room.title.toLowerCase().includes(searchText) || room.district.toLowerCase().includes(searchText);

            // 2. Kiểm tra loại phòng có khớp không? (Nếu chọn 'all' thì luôn đúng)
            const matchType = (typeFilter === 'all') || (room.category === typeFilter);

            // 3. Kiểm tra khoảng giá
            let matchPrice = true;
            if (priceFilter === 'under2') matchPrice = room.price < 2000000;
            else if (priceFilter === '2to3') matchPrice = room.price >= 2000000 && room.price <= 3000000;
            else if (priceFilter === 'above3') matchPrice = room.price > 3000000;

            // Phải thỏa mãn cả 3 điều kiện thì mới giữ lại phòng đó
            return matchText && matchType && matchPrice;
        });

        // Gọi lại hàm vẽ màn hình, nhưng lần này chỉ đưa vào danh sách đã lọc
        renderRooms(filteredRooms);
    }
}

// Gắn "cảm biến" vào các ô nhập liệu
function setupFilterEvents() {
    const searchInput = document.getElementById('search');
    const priceRange = document.getElementById('priceRange');
    const typeSelect = document.getElementById('type');

    if (searchInput) searchInput.addEventListener('input', filterRooms);
    if (priceRange) priceRange.addEventListener('change', filterRooms);
    if (typeSelect) typeSelect.addEventListener('change', filterRooms);
}

window.renderRooms = renderRooms;
window.filterRooms = filterRooms;
window.setupFilterEvents = setupFilterEvents;
