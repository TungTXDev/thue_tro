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

    // Get user's bookmarked rooms
    let bookmarkedRoomIds = [];
    const token = localStorage.getItem('authToken'); // Lấy token trực tiếp
    if (token) {
        try {
            const bookmarksResponse = await apiClient('/users/bookmarks/list/all', {
                method: 'GET',
                requireAuth: true
            });
            bookmarkedRoomIds = bookmarksResponse.data.rooms.map(room => room._id || room.id);
        } catch (error) {
            console.warn("Could not fetch bookmarks:", error);
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
        const roomId = room._id || room.id; // Ưu tiên _id từ MongoDB, fallback sang id

        // Fix image path - thêm images/ nếu chưa có và không phải URL
        let imagePath = room.image;
        if (imagePath && !imagePath.startsWith('http') && !imagePath.startsWith('images/')) {
            imagePath = 'images/' + imagePath;
        }

        // Calculate image count
        const imageCount = room.images && room.images.length > 0 ? room.images.length : 1;

        // Calculate price per m2 if area is available
        const pricePerM2 = room.area ? Math.round(room.price / room.area) : null;
        const pricePerM2Formatted = pricePerM2 ? formatVND(pricePerM2) : '';

        // Calculate days posted (mock data - you can replace with actual createdAt)
        const daysPosted = Math.floor(Math.random() * 5) + 1; // Random 1-5 days for demo

        // Get room specs
        const bedrooms = room.bedrooms || 1;
        const bathrooms = room.bathrooms || 1;
        const area = room.area || 25;

        // Check if room is bookmarked
        const isBookmarked = bookmarkedRoomIds.includes(roomId);
        const bookmarkClass = isBookmarked ? 'bookmarked' : '';
        const bookmarkIcon = isBookmarked ? 'bi-bookmark-heart-fill' : 'bi-bookmark-heart';

        const cardHTML = `
            <div class="room-card">
                <div class="room-card-image-wrapper">
                    <div class="room-card-badge">
                        <i class="bi bi-patch-check-fill"></i>
                        Tin đáng chất lượng
                    </div>
                    <img src="${escapeHTML(imagePath)}" alt="${escapeHTML(room.title)}" class="room-card-image" onclick="window.location.href='detail.html?id=${roomId}'">
                    <div class="room-card-image-counter">
                        <i class="bi bi-camera-fill"></i>
                        1/${imageCount}
                    </div>
                    <button class="bookmark-btn ${bookmarkClass}" onclick="toggleBookmark('${roomId}', this)" title="${isBookmarked ? 'Bỏ lưu' : 'Lưu phòng'}">
                        <i class="bi ${bookmarkIcon}"></i>
                    </button>
                    <button class="room-card-nav room-card-nav-prev" onclick="event.stopPropagation()">
                        <i class="bi bi-chevron-left"></i>
                    </button>
                    <button class="room-card-nav room-card-nav-next" onclick="event.stopPropagation()">
                        <i class="bi bi-chevron-right"></i>
                    </button>
                </div>
                <div class="room-card-body" onclick="window.location.href='detail.html?id=${roomId}'">
                    <div class="room-card-price-row">
                        <div>
                            <span class="room-card-price">${priceFormatted}</span>
                            ${pricePerM2 ? `<span class="room-card-price-unit"> · ${pricePerM2Formatted}/m²</span>` : ''}
                        </div>
                        <div class="room-card-posted">đăng ${daysPosted} ngày trước</div>
                    </div>
                    <h3 class="room-card-title">${escapeHTML(room.title)}</h3>
                    <div class="room-card-location">
                        <i class="bi bi-geo-alt-fill"></i>
                        ${escapeHTML(room.district)}
                    </div>
                    <div class="room-card-specs">
                        <div class="room-card-spec">
                            <i class="bi bi-door-closed"></i>
                            ${bedrooms} PN
                        </div>
                        <div class="room-card-spec">
                            <i class="bi bi-droplet"></i>
                            ${bathrooms}
                        </div>
                        <div class="room-card-spec">
                            <i class="bi bi-arrows-angle-expand"></i>
                            ${area} m²
                        </div>
                    </div>
                </div>
            </div>
        `;
        roomGrid.innerHTML += cardHTML;
    });
}

async function toggleBookmark(roomId, buttonElement) {
    const token = localStorage.getItem('authToken'); // Lấy token trực tiếp, không qua getStorage

    if (!token) {
        openAuthModal();
        return;
    }

    try {
        const response = await apiClient(`/users/bookmarks/${roomId}`, {
            method: 'POST',
            requireAuth: true
        });

        if (response.data.bookmarked) {
            buttonElement.classList.add('bookmarked');
            buttonElement.innerHTML = '<i class="bi bi-bookmark-heart-fill"></i>';
            buttonElement.title = 'Bỏ lưu';
            showToast('Đã lưu phòng vào danh sách yêu thích', 'success');
        } else {
            buttonElement.classList.remove('bookmarked');
            buttonElement.innerHTML = '<i class="bi bi-bookmark-heart"></i>';
            buttonElement.title = 'Lưu phòng';
            showToast('Đã bỏ lưu phòng', 'success');
        }
    } catch (error) {
        console.error('Error toggling bookmark:', error);
        showToast(error.message || 'Có lỗi xảy ra', 'error');
    }
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
window.toggleBookmark = toggleBookmark;
