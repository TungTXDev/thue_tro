// Global variables for image gallery
let currentImageIndex = 0;
let roomImages = [];
let currentRoomId = null;

document.addEventListener("DOMContentLoaded", async function () {
    // 1. LẤY DỮ LIỆU
    const id = getQueryParam('id');
    currentRoomId = id;

    // Kiểm tra nếu không có ID trong URL
    if (!id) {
        alert('Không tìm thấy ID phòng. Vui lòng quay lại trang chủ.');
        window.location.href = 'index.html';
        return;
    }

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
        // Setup images array
        setupImageGallery(room);

        // Check if room is bookmarked
        await checkBookmarkStatus(id);

        document.getElementById('room-title').innerText = room.title;
        document.getElementById('room-category').innerText = room.category;
        document.getElementById('room-address').innerHTML = `<i class="bi bi-geo-alt"></i> ${escapeHTML(room.district)}`;

        // Hiển thị mô tả
        const description = room.description || 'Phòng trọ được thiết kế hiện đại, tối ưu diện tích. Không gian thoáng đãng với cửa sổ lớn, ban công phơi đồ riêng biệt. Khu vực dân trí cao, camera an ninh 24/7, giờ giấc hoàn toàn tự do.';
        document.getElementById('room-description').innerText = description;

        // Hiển thị tiện ích từ database với icon phù hợp
        const amenitiesList = document.getElementById('amenities-list');
        if (room.amenities && room.amenities.length > 0) {
            amenitiesList.innerHTML = room.amenities.map(amenity =>
                `<li><i class="bi bi-${getAmenityIcon(amenity)}"></i> ${escapeHTML(amenity)}</li>`
            ).join('');
        } else {
            amenitiesList.innerHTML = '<li><i class="bi bi-info-circle"></i> Chưa có thông tin tiện ích</li>';
        }

        // Hiển thị tên chủ nhà
        const ownerName = room.ownerName || 'Chủ nhà';
        document.getElementById('owner-name').innerText = ownerName;

        const p = formatVND(room.price);
        document.getElementById('room-price').innerHTML = p + " <span>/tháng</span>";
        document.getElementById('modal-price').innerText = p;

        // Cập nhật Google Maps iframe với địa chỉ từ database
        const mapIframe = document.getElementById('google-map');
        const location = `${room.district}, Hồ Chí Minh, Việt Nam`;
        const encodedLocation = encodeURIComponent(location);
        mapIframe.src = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodedLocation}&zoom=14`;

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

// Setup image gallery
function setupImageGallery(room) {
    // Build images array
    roomImages = [];

    // Add main image
    if (room.image) {
        let imagePath = room.image;
        if (imagePath && !imagePath.startsWith('http') && !imagePath.startsWith('images/')) {
            imagePath = 'images/' + imagePath;
        }
        roomImages.push(imagePath);
    }

    // Add additional images
    if (room.images && room.images.length > 0) {
        room.images.forEach(img => {
            let imagePath = img;
            if (imagePath && !imagePath.startsWith('http') && !imagePath.startsWith('images/')) {
                imagePath = 'images/' + imagePath;
            }
            // Avoid duplicates
            if (!roomImages.includes(imagePath)) {
                roomImages.push(imagePath);
            }
        });
    }

    // If no images, use a placeholder
    if (roomImages.length === 0) {
        roomImages.push('images/room1.jpg');
    }

    // Display first image
    currentImageIndex = 0;
    displayImage(currentImageIndex);

    // Create thumbnails
    createThumbnails();

    // Update navigation buttons
    updateNavigationButtons();
}

// Display image at index
function displayImage(index) {
    const imgElement = document.getElementById('room-img');
    imgElement.src = roomImages[index];

    document.getElementById('current-image').textContent = index + 1;
    document.getElementById('total-images').textContent = roomImages.length;

    // Update active thumbnail
    updateActiveThumbnail(index);
}

// Create thumbnail images
function createThumbnails() {
    const thumbnailsContainer = document.getElementById('image-thumbnails');

    if (roomImages.length <= 1) {
        thumbnailsContainer.style.display = 'none';
        return;
    }

    thumbnailsContainer.innerHTML = '';

    roomImages.forEach((img, index) => {
        const thumbnail = document.createElement('div');
        thumbnail.className = 'thumbnail-item';
        if (index === 0) thumbnail.classList.add('active');

        thumbnail.innerHTML = `<img src="${img}" alt="Ảnh ${index + 1}">`;
        thumbnail.onclick = () => goToImage(index);

        thumbnailsContainer.appendChild(thumbnail);
    });
}

// Update active thumbnail
function updateActiveThumbnail(index) {
    const thumbnails = document.querySelectorAll('.thumbnail-item');
    thumbnails.forEach((thumb, i) => {
        if (i === index) {
            thumb.classList.add('active');
        } else {
            thumb.classList.remove('active');
        }
    });
}

// Go to specific image
function goToImage(index) {
    currentImageIndex = index;
    displayImage(currentImageIndex);
    updateNavigationButtons();
}

// Next image
function nextImage() {
    if (currentImageIndex < roomImages.length - 1) {
        currentImageIndex++;
        displayImage(currentImageIndex);
        updateNavigationButtons();
    }
}

// Previous image
function previousImage() {
    if (currentImageIndex > 0) {
        currentImageIndex--;
        displayImage(currentImageIndex);
        updateNavigationButtons();
    }
}

// Update navigation buttons state
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-image-btn');
    const nextBtn = document.getElementById('next-image-btn');

    if (roomImages.length <= 1) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        return;
    }

    prevBtn.style.display = 'flex';
    nextBtn.style.display = 'flex';

    prevBtn.disabled = currentImageIndex === 0;
    nextBtn.disabled = currentImageIndex === roomImages.length - 1;
}

// Check bookmark status
async function checkBookmarkStatus(roomId) {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
        const response = await apiClient('/users/bookmarks/list/all', {
            method: 'GET',
            requireAuth: true
        });

        const bookmarkedRoomIds = response.data.rooms.map(room => room._id || room.id);
        const isBookmarked = bookmarkedRoomIds.includes(roomId);

        const bookmarkBtn = document.getElementById('bookmark-btn');
        if (isBookmarked) {
            bookmarkBtn.classList.add('bookmarked');
            bookmarkBtn.innerHTML = '<i class="bi bi-bookmark-heart-fill"></i>';
            bookmarkBtn.title = 'Bỏ lưu';
        }
    } catch (error) {
        console.warn('Could not check bookmark status:', error);
    }
}

// Toggle bookmark on detail page
async function toggleBookmarkDetail() {
    const token = localStorage.getItem('authToken');

    if (!token) {
        openAuthModal();
        return;
    }

    const bookmarkBtn = document.getElementById('bookmark-btn');

    try {
        const response = await apiClient(`/users/bookmarks/${currentRoomId}`, {
            method: 'POST',
            requireAuth: true
        });

        if (response.data.bookmarked) {
            bookmarkBtn.classList.add('bookmarked');
            bookmarkBtn.innerHTML = '<i class="bi bi-bookmark-heart-fill"></i>';
            bookmarkBtn.title = 'Bỏ lưu';
            showToast('Đã lưu phòng vào danh sách yêu thích', 'success');
        } else {
            bookmarkBtn.classList.remove('bookmarked');
            bookmarkBtn.innerHTML = '<i class="bi bi-bookmark-heart"></i>';
            bookmarkBtn.title = 'Lưu phòng';
            showToast('Đã bỏ lưu phòng', 'success');
        }
    } catch (error) {
        console.error('Error toggling bookmark:', error);
        showToast(error.message || 'Có lỗi xảy ra', 'error');
    }
}

// Make functions global
window.nextImage = nextImage;
window.previousImage = previousImage;
window.goToImage = goToImage;
window.toggleBookmarkDetail = toggleBookmarkDetail;

// Map amenity names to Bootstrap icons
function getAmenityIcon(amenity) {
    const amenityLower = amenity.toLowerCase();

    // Wifi / Internet
    if (amenityLower.includes('wifi') || amenityLower.includes('internet') || amenityLower.includes('mạng')) {
        return 'wifi';
    }
    // Máy lạnh / Điều hòa
    if (amenityLower.includes('máy lạnh') || amenityLower.includes('điều hòa') || amenityLower.includes('air')) {
        return 'snow';
    }
    // Tủ lạnh
    if (amenityLower.includes('tủ lạnh') || amenityLower.includes('fridge')) {
        return 'box-seam';
    }
    // Máy giặt
    if (amenityLower.includes('máy giặt') || amenityLower.includes('washing')) {
        return 'droplet-half';
    }
    // Bếp / Nhà bếp
    if (amenityLower.includes('bếp') || amenityLower.includes('kitchen')) {
        return 'fire';
    }
    // Chỗ để xe / Bãi đỗ xe
    if (amenityLower.includes('xe') || amenityLower.includes('parking') || amenityLower.includes('đỗ')) {
        return 'car-front';
    }
    // Bảo vệ / An ninh / Camera
    if (amenityLower.includes('bảo vệ') || amenityLower.includes('an ninh') || amenityLower.includes('camera') || amenityLower.includes('security')) {
        return 'shield-check';
    }
    // Thang máy
    if (amenityLower.includes('thang máy') || amenityLower.includes('elevator')) {
        return 'arrow-up-square';
    }
    // Ban công
    if (amenityLower.includes('ban công') || amenityLower.includes('balcony')) {
        return 'door-open';
    }
    // Nóng lạnh / Nước nóng
    if (amenityLower.includes('nóng lạnh') || amenityLower.includes('nước nóng') || amenityLower.includes('water heater')) {
        return 'thermometer-half';
    }
    // Giường / Nệm
    if (amenityLower.includes('giường') || amenityLower.includes('nệm') || amenityLower.includes('bed')) {
        return 'moon';
    }
    // Tủ quần áo
    if (amenityLower.includes('tủ quần áo') || amenityLower.includes('tủ áo') || amenityLower.includes('wardrobe')) {
        return 'cabinet-fill';
    }
    // TV / Tivi
    if (amenityLower.includes('tv') || amenityLower.includes('tivi') || amenityLower.includes('television')) {
        return 'tv';
    }
    // Cửa sổ
    if (amenityLower.includes('cửa sổ') || amenityLower.includes('window')) {
        return 'window';
    }
    // WC riêng / Toilet riêng
    if (amenityLower.includes('wc') || amenityLower.includes('toilet') || amenityLower.includes('nhà vệ sinh')) {
        return 'door-closed';
    }
    // Thú cưng
    if (amenityLower.includes('thú cưng') || amenityLower.includes('pet')) {
        return 'heart';
    }
    // Gym / Phòng tập
    if (amenityLower.includes('gym') || amenityLower.includes('phòng tập')) {
        return 'heart-pulse';
    }
    // Hồ bơi
    if (amenityLower.includes('hồ bơi') || amenityLower.includes('pool')) {
        return 'water';
    }
    // Siêu thị / Cửa hàng
    if (amenityLower.includes('siêu thị') || amenityLower.includes('cửa hàng') || amenityLower.includes('shop')) {
        return 'shop';
    }

    // Default icon
    return 'check-circle';
}
