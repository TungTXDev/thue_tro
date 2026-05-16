// Compare page functionality

let allRooms = [];
let selectedRoomSlot = null; // 1 or 2
let room1Data = null;
let room2Data = null;

// Load all rooms on page load
document.addEventListener('DOMContentLoaded', async function () {
    await loadAllRooms();

    // Check if rooms are passed via URL params
    const urlParams = new URLSearchParams(window.location.search);
    const room1Id = urlParams.get('room1');
    const room2Id = urlParams.get('room2');

    if (room1Id) {
        await selectRoom(1, room1Id);
    }
    if (room2Id) {
        await selectRoom(2, room2Id);
    }
});

// Load all rooms from API or localStorage
async function loadAllRooms() {
    try {
        const response = await roomApi.getAllRooms();
        allRooms = response.data.rooms;
    } catch (error) {
        console.warn("API lỗi/chưa bật, fallback sang localStorage:", error.message);
        allRooms = getStorage(STORAGE_KEYS.ROOMS_DATA, []);
    }
}

// Open room selector modal
function openRoomSelector(slot) {
    selectedRoomSlot = slot;
    const modal = document.getElementById('room-selector-modal');
    modal.classList.add('show');
    renderRoomList();
}

// Close room selector modal
function closeRoomSelector() {
    const modal = document.getElementById('room-selector-modal');
    modal.classList.remove('show');
    selectedRoomSlot = null;
}

// Render room list in modal
function renderRoomList(filteredRooms = null) {
    const roomList = document.getElementById('room-list');
    const rooms = filteredRooms || allRooms;

    if (!rooms || rooms.length === 0) {
        roomList.innerHTML = '<p style="text-align: center; color: #888;">Không có phòng nào</p>';
        return;
    }

    roomList.innerHTML = '';

    rooms.forEach(room => {
        const roomId = room._id || room.id;

        // Skip if room is already selected
        if ((room1Data && (room1Data._id === roomId || room1Data.id === roomId)) ||
            (room2Data && (room2Data._id === roomId || room2Data.id === roomId))) {
            return;
        }

        let imagePath = room.image;
        if (imagePath && !imagePath.startsWith('http') && !imagePath.startsWith('images/')) {
            imagePath = 'images/' + imagePath;
        }

        const itemHTML = `
            <div class="room-list-item" onclick="selectRoom(${selectedRoomSlot}, '${roomId}')">
                <img src="${escapeHTML(imagePath)}" alt="${escapeHTML(room.title)}" class="room-list-item-image">
                <div class="room-list-item-info">
                    <div class="room-list-item-title">${escapeHTML(room.title)}</div>
                    <div class="room-list-item-location">
                        <i class="bi bi-geo-alt-fill"></i>
                        ${escapeHTML(room.district)}
                    </div>
                    <div class="room-list-item-price">${formatVND(room.price)}</div>
                </div>
            </div>
        `;

        roomList.innerHTML += itemHTML;
    });
}

// Filter rooms in modal
function filterModalRooms() {
    const searchInput = document.getElementById('modal-search-input');
    const searchText = searchInput.value.toLowerCase();

    if (!searchText) {
        renderRoomList();
        return;
    }

    const filtered = allRooms.filter(room => {
        return room.title.toLowerCase().includes(searchText) ||
            room.district.toLowerCase().includes(searchText);
    });

    renderRoomList(filtered);
}

// Select a room for comparison
async function selectRoom(slot, roomId) {
    const room = allRooms.find(r => (r._id === roomId || r.id === roomId));

    if (!room) {
        alert('Không tìm thấy phòng');
        return;
    }

    if (slot === 1) {
        room1Data = room;
        renderRoomContent(1, room);
    } else {
        room2Data = room;
        renderRoomContent(2, room);
    }

    closeRoomSelector();
}

// Render room content
function renderRoomContent(slot, room) {
    const placeholder = document.getElementById(`room${slot}-placeholder`);
    const content = document.getElementById(`room${slot}-content`);

    placeholder.style.display = 'none';
    content.style.display = 'block';

    const roomId = room._id || room.id;
    let imagePath = room.image;
    if (imagePath && !imagePath.startsWith('http') && !imagePath.startsWith('images/')) {
        imagePath = 'images/' + imagePath;
    }

    const pricePerM2 = room.area ? Math.round(room.price / room.area) : null;
    const bedrooms = room.bedrooms || 1;
    const bathrooms = room.bathrooms || 1;
    const area = room.area || 25;

    content.innerHTML = `
        <div class="room-header">
            <img src="${escapeHTML(imagePath)}" alt="${escapeHTML(room.title)}" class="room-image">
            <button class="room-remove-btn" onclick="removeRoom(${slot})">
                <i class="bi bi-x-lg"></i>
            </button>
        </div>
        <div class="room-body">
            <h2 class="room-title">${escapeHTML(room.title)}</h2>
            <div class="room-location">
                <i class="bi bi-geo-alt-fill"></i>
                ${escapeHTML(room.district)}
            </div>
            <div class="room-price">
                ${formatVND(room.price)}
                <span class="room-price-unit">/ tháng</span>
            </div>
            
            <div class="compare-table">
                <div class="compare-row">
                    <div>
                        <div class="compare-label">
                            <i class="bi bi-cash-coin"></i>
                            Giá thuê
                        </div>
                        <div class="compare-value highlight">${formatVND(room.price)}/tháng</div>
                    </div>
                </div>
                
                ${pricePerM2 ? `
                <div class="compare-row">
                    <div>
                        <div class="compare-label">
                            <i class="bi bi-calculator"></i>
                            Giá/m²
                        </div>
                        <div class="compare-value">${formatVND(pricePerM2)}/m²</div>
                    </div>
                </div>
                ` : ''}
                
                <div class="compare-row">
                    <div>
                        <div class="compare-label">
                            <i class="bi bi-door-closed"></i>
                            Phòng ngủ
                        </div>
                        <div class="compare-value">${bedrooms} phòng</div>
                    </div>
                </div>
                
                <div class="compare-row">
                    <div>
                        <div class="compare-label">
                            <i class="bi bi-droplet"></i>
                            Phòng tắm
                        </div>
                        <div class="compare-value">${bathrooms} phòng</div>
                    </div>
                </div>
                
                <div class="compare-row">
                    <div>
                        <div class="compare-label">
                            <i class="bi bi-arrows-angle-expand"></i>
                            Diện tích
                        </div>
                        <div class="compare-value">${area} m²</div>
                    </div>
                </div>
                
                <div class="compare-row">
                    <div>
                        <div class="compare-label">
                            <i class="bi bi-tag"></i>
                            Loại phòng
                        </div>
                        <div class="compare-value">${escapeHTML(room.category)}</div>
                    </div>
                </div>
                
                ${room.amenities && room.amenities.length > 0 ? `
                <div class="compare-row">
                    <div style="width: 100%;">
                        <div class="compare-label">
                            <i class="bi bi-star"></i>
                            Tiện ích
                        </div>
                        <div class="amenities-list">
                            ${room.amenities.map(a => `<span class="amenity-tag">${escapeHTML(a)}</span>`).join('')}
                        </div>
                    </div>
                </div>
                ` : ''}
            </div>
            
            <a href="detail.html?id=${roomId}" class="btn btn-primary room-action-btn">
                <i class="bi bi-eye"></i> Xem chi tiết
            </a>
        </div>
    `;

    // Highlight better values if both rooms are selected
    if (room1Data && room2Data) {
        highlightBetterValues();
    }
}

// Remove room from comparison
function removeRoom(slot) {
    const placeholder = document.getElementById(`room${slot}-placeholder`);
    const content = document.getElementById(`room${slot}-content`);

    placeholder.style.display = 'flex';
    content.style.display = 'none';
    content.innerHTML = '';

    if (slot === 1) {
        room1Data = null;
    } else {
        room2Data = null;
    }
}

// Highlight better values when comparing
function highlightBetterValues() {
    if (!room1Data || !room2Data) return;

    // Compare prices (lower is better)
    const room1Content = document.getElementById('room1-content');
    const room2Content = document.getElementById('room2-content');

    // Price comparison
    if (room1Data.price < room2Data.price) {
        room1Content.querySelector('.room-price').classList.add('better');
        room2Content.querySelector('.room-price').classList.add('worse');
    } else if (room2Data.price < room1Data.price) {
        room2Content.querySelector('.room-price').classList.add('better');
        room1Content.querySelector('.room-price').classList.add('worse');
    }
}

// Make functions global
window.openRoomSelector = openRoomSelector;
window.closeRoomSelector = closeRoomSelector;
window.selectRoom = selectRoom;
window.removeRoom = removeRoom;
window.filterModalRooms = filterModalRooms;
