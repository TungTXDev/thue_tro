// Bookmarks Page Logic
async function loadBookmarkedRooms() {
    const roomGrid = document.getElementById('room-grid');
    const bookmarksContent = document.getElementById('bookmarks-content');

    const token = localStorage.getItem('authToken'); // Lấy token trực tiếp

    if (!token) {
        bookmarksContent.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-lock" style="font-size: 4rem; color: #ddd;"></i>
                <h3 class="mt-3">Vui lòng đăng nhập</h3>
                <p class="text-muted">Bạn cần đăng nhập để xem danh sách phòng đã lưu</p>
                <button class="btn btn-primary" onclick="openAuthModal()">
                    <i class="bi bi-box-arrow-in-right"></i> Đăng nhập ngay
                </button>
            </div>
        `;
        return;
    }

    try {
        const response = await apiClient('/users/bookmarks/list/all', {
            method: 'GET',
            requireAuth: true
        });

        bookmarksContent.style.display = 'none';

        if (!response.data.rooms || response.data.rooms.length === 0) {
            roomGrid.innerHTML = `
                <div class="col-12">
                    <div class="text-center py-5">
                        <i class="bi bi-bookmark" style="font-size: 4rem; color: #ddd;"></i>
                        <h3 class="mt-3">Chưa có phòng nào được lưu</h3>
                        <p class="text-muted">Hãy khám phá và lưu những phòng trọ yêu thích của bạn</p>
                        <a href="search.html" class="btn btn-primary">
                            <i class="bi bi-search"></i> Tìm phòng ngay
                        </a>
                    </div>
                </div>
            `;
            return;
        }

        renderBookmarkedRooms(response.data.rooms);
    } catch (error) {
        console.error('Error loading bookmarked rooms:', error);
        bookmarksContent.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-exclamation-triangle" style="font-size: 4rem; color: #dc3545;"></i>
                <h3 class="mt-3">Có lỗi xảy ra</h3>
                <p class="text-muted">${error.message || 'Không thể tải danh sách phòng đã lưu'}</p>
                <button class="btn btn-primary" onclick="loadBookmarkedRooms()">
                    <i class="bi bi-arrow-clockwise"></i> Thử lại
                </button>
            </div>
        `;
    }
}

function renderBookmarkedRooms(rooms) {
    const roomGrid = document.getElementById('room-grid');
    roomGrid.innerHTML = '';

    rooms.forEach(room => {
        const priceFormatted = formatVND(room.price);
        const roomId = room._id || room.id;

        let imagePath = room.image;
        if (imagePath && !imagePath.startsWith('http') && !imagePath.startsWith('images/')) {
            imagePath = 'images/' + imagePath;
        }

        // Calculate image count
        const imageCount = room.images && room.images.length > 0 ? room.images.length : 1;

        const pricePerM2 = room.area ? Math.round(room.price / room.area) : null;
        const pricePerM2Formatted = pricePerM2 ? formatVND(pricePerM2) : '';

        const daysPosted = Math.floor(Math.random() * 5) + 1;
        const bedrooms = room.bedrooms || 1;
        const bathrooms = room.bathrooms || 1;
        const area = room.area || 25;

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
                    <button class="bookmark-btn bookmarked" onclick="toggleBookmark('${roomId}', this)" title="Bỏ lưu">
                        <i class="bi bi-bookmark-heart-fill"></i>
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
    const token = localStorage.getItem('authToken'); // Lấy token trực tiếp

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
        } else {
            // Remove the card from the grid
            const card = buttonElement.closest('.room-card');
            card.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                card.remove();

                // Check if there are no more rooms
                const roomGrid = document.getElementById('room-grid');
                if (roomGrid.children.length === 0) {
                    roomGrid.innerHTML = `
                        <div class="col-12">
                            <div class="text-center py-5">
                                <i class="bi bi-bookmark" style="font-size: 4rem; color: #ddd;"></i>
                                <h3 class="mt-3">Chưa có phòng nào được lưu</h3>
                                <p class="text-muted">Hãy khám phá và lưu những phòng trọ yêu thích của bạn</p>
                                <a href="search.html" class="btn btn-primary">
                                    <i class="bi bi-search"></i> Tìm phòng ngay
                                </a>
                            </div>
                        </div>
                    `;
                }
            }, 300);
        }

        showToast(response.message || 'Cập nhật thành công', 'success');
    } catch (error) {
        console.error('Error toggling bookmark:', error);
        showToast(error.message || 'Có lỗi xảy ra', 'error');
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadBookmarkedRooms();
});

window.toggleBookmark = toggleBookmark;
window.loadBookmarkedRooms = loadBookmarkedRooms;
