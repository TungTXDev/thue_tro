// Search page functionality

let allRooms = [];
let filteredRooms = [];

// Load rooms on page load
document.addEventListener('DOMContentLoaded', async function () {
    await loadRooms();
    applyFilters();
});

// Load all rooms from API or localStorage
async function loadRooms() {
    try {
        const response = await roomApi.getAllRooms();
        allRooms = response.data.rooms;
    } catch (error) {
        console.warn("API lỗi/chưa bật, fallback sang localStorage:", error.message);
        allRooms = getStorage(STORAGE_KEYS.ROOMS_DATA, []);
    }
}

// Apply all filters
function applyFilters() {
    const searchText = document.getElementById('search-input').value.toLowerCase();
    const areaMin = parseInt(document.getElementById('area-min').value);
    const areaMax = parseInt(document.getElementById('area-max').value);
    const priceMin = parseInt(document.getElementById('price-min').value);
    const priceMax = parseInt(document.getElementById('price-max').value);
    const sortBy = document.getElementById('sort-by').value;

    // Get selected amenities
    const selectedAmenities = [];
    document.querySelectorAll('.amenities-checkboxes input[type="checkbox"]:checked').forEach(checkbox => {
        selectedAmenities.push(checkbox.value);
    });

    // Filter rooms
    filteredRooms = allRooms.filter(room => {
        // Search filter
        const matchSearch = !searchText ||
            room.title.toLowerCase().includes(searchText) ||
            room.district.toLowerCase().includes(searchText);

        // Area filter
        const roomArea = room.area || 25;
        const matchArea = roomArea >= areaMin && roomArea <= areaMax;

        // Price filter
        const matchPrice = room.price >= priceMin && room.price <= priceMax;

        // Amenities filter
        const matchAmenities = selectedAmenities.length === 0 ||
            selectedAmenities.every(amenity =>
                room.amenities && room.amenities.includes(amenity)
            );

        return matchSearch && matchArea && matchPrice && matchAmenities;
    });

    // Sort rooms
    sortRooms(sortBy);

    // Render results
    renderRooms();
    updateResultsCount();
}

// Sort rooms
function sortRooms(sortBy) {
    switch (sortBy) {
        case 'price-asc':
            filteredRooms.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filteredRooms.sort((a, b) => b.price - a.price);
            break;
        case 'area-asc':
            filteredRooms.sort((a, b) => (a.area || 25) - (b.area || 25));
            break;
        case 'area-desc':
            filteredRooms.sort((a, b) => (b.area || 25) - (a.area || 25));
            break;
        default:
            // Default sorting (no change)
            break;
    }
}

// Render rooms
async function renderRooms() {
    const roomGrid = document.getElementById('room-grid');

    if (!filteredRooms || filteredRooms.length === 0) {
        roomGrid.innerHTML = '<p class="empty-message"><i class="bi bi-search"></i> Không tìm thấy phòng nào phù hợp với bộ lọc của bạn.</p>';
        return;
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

    filteredRooms.forEach(room => {
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

// Update results count
function updateResultsCount() {
    const resultsCount = document.getElementById('results-count');
    resultsCount.textContent = `Tìm thấy ${filteredRooms.length} phòng trọ`;
}

// Update area range
function updateAreaRange() {
    let minVal = parseInt(document.getElementById('area-min').value);
    let maxVal = parseInt(document.getElementById('area-max').value);

    // Ensure min is not greater than max
    if (minVal > maxVal) {
        const temp = minVal;
        minVal = maxVal;
        maxVal = temp;
        document.getElementById('area-min').value = minVal;
        document.getElementById('area-max').value = maxVal;
    }

    document.getElementById('area-min-value').textContent = minVal;
    document.getElementById('area-max-value').textContent = maxVal;

    // Update active track
    updateRangeTrack('area', minVal, maxVal, 0, 100);

    applyFilters();
}

// Update price range
function updatePriceRange() {
    let minVal = parseInt(document.getElementById('price-min').value);
    let maxVal = parseInt(document.getElementById('price-max').value);

    // Ensure min is not greater than max
    if (minVal > maxVal) {
        const temp = minVal;
        minVal = maxVal;
        maxVal = temp;
        document.getElementById('price-min').value = minVal;
        document.getElementById('price-max').value = maxVal;
    }

    document.getElementById('price-min-value').textContent = formatVND(minVal);
    document.getElementById('price-max-value').textContent = formatVND(maxVal);

    // Update active track
    updateRangeTrack('price', minVal, maxVal, 0, 6000000);

    applyFilters();
}

// Update range track visual
function updateRangeTrack(type, minVal, maxVal, min, max) {
    const wrapper = document.querySelector(`#${type}-min`).parentElement;
    const percent1 = ((minVal - min) / (max - min)) * 100;
    const percent2 = ((maxVal - min) / (max - min)) * 100;

    // Calculate the actual width of the wrapper minus padding
    const wrapperWidth = wrapper.offsetWidth - 8; // 8px = 4px padding on each side
    const leftPos = (percent1 / 100) * wrapperWidth;
    const rightPos = (percent2 / 100) * wrapperWidth;
    const width = rightPos - leftPos;

    wrapper.style.setProperty('--range-left', leftPos + 'px');
    wrapper.style.setProperty('--range-width', width + 'px');
}

// Reset all filters
function resetFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('area-min').value = 0;
    document.getElementById('area-max').value = 100;
    document.getElementById('price-min').value = 0;
    document.getElementById('price-max').value = 6000000;
    document.getElementById('sort-by').value = 'default';

    document.querySelectorAll('.amenities-checkboxes input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });

    updateAreaRange();
    updatePriceRange();
    applyFilters();
}

// Toggle sidebar on mobile
function toggleSidebar() {
    const sidebar = document.querySelector('.search-sidebar');
    sidebar.classList.toggle('show');
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function (event) {
    const sidebar = document.querySelector('.search-sidebar');
    const toggleBtn = document.querySelector('.btn-toggle-sidebar');

    if (sidebar && sidebar.classList.contains('show')) {
        if (!sidebar.contains(event.target) && !toggleBtn.contains(event.target)) {
            sidebar.classList.remove('show');
        }
    }
});

// Make functions global
window.applyFilters = applyFilters;
window.updateAreaRange = updateAreaRange;
window.updatePriceRange = updatePriceRange;
window.resetFilters = resetFilters;
window.toggleSidebar = toggleSidebar;
window.toggleBookmark = toggleBookmark;

// Search autocomplete for search page
let searchTimeoutSidebar;

function handleSearchInputSidebar(event) {
    clearTimeout(searchTimeoutSidebar);
    searchTimeoutSidebar = setTimeout(() => {
        applyFilters();
        updateSearchSuggestionsSidebar();
    }, 300);
}

async function updateSearchSuggestionsSidebar() {
    const searchInput = document.getElementById('search-input');
    const suggestionsDiv = document.getElementById('search-suggestions-sidebar');
    const searchText = searchInput.value.trim();

    if (!searchText || searchText.length < 2) {
        suggestionsDiv.classList.remove('show');
        return;
    }

    try {
        // Try to fetch from API
        const response = await roomApi.getSuggestions(searchText);
        const suggestions = response.data.suggestions;

        if (suggestions.length === 0) {
            suggestionsDiv.innerHTML = '<div class="search-no-results">Không tìm thấy kết quả</div>';
            suggestionsDiv.classList.add('show');
            return;
        }

        suggestionsDiv.innerHTML = suggestions.map(suggestion => {
            const highlightedText = highlightMatchSidebar(suggestion.text, searchText);
            return `
                <div class="search-suggestion-item" onmousedown="selectSuggestionSidebar('${escapeHTML(suggestion.text)}')">
                    <i class="bi bi-${suggestion.icon}"></i>
                    <div class="search-suggestion-text">
                        <div class="search-suggestion-title">${highlightedText}</div>
                        <div class="search-suggestion-subtitle">${escapeHTML(suggestion.subtitle)}</div>
                    </div>
                </div>
            `;
        }).join('');

        suggestionsDiv.classList.add('show');
    } catch (error) {
        console.warn("API error, fallback to localStorage:", error.message);

        // Fallback to localStorage
        const searchTextLower = searchText.toLowerCase();
        const suggestions = [];
        const seen = new Set();

        allRooms.forEach(room => {
            if (room.title.toLowerCase().includes(searchTextLower) && !seen.has(room.title)) {
                suggestions.push({
                    type: 'room',
                    text: room.title,
                    subtitle: room.district,
                    icon: 'house-door'
                });
                seen.add(room.title);
            }

            if (room.district.toLowerCase().includes(searchTextLower) && !seen.has(room.district)) {
                suggestions.push({
                    type: 'location',
                    text: room.district,
                    subtitle: 'Khu vực',
                    icon: 'geo-alt'
                });
                seen.add(room.district);
            }
        });

        if (suggestions.length === 0) {
            suggestionsDiv.innerHTML = '<div class="search-no-results">Không tìm thấy kết quả</div>';
            suggestionsDiv.classList.add('show');
            return;
        }

        const limitedSuggestions = suggestions.slice(0, 5);
        suggestionsDiv.innerHTML = limitedSuggestions.map(suggestion => {
            const highlightedText = highlightMatchSidebar(suggestion.text, searchText);
            return `
                <div class="search-suggestion-item" onmousedown="selectSuggestionSidebar('${escapeHTML(suggestion.text)}')">
                    <i class="bi bi-${suggestion.icon}"></i>
                    <div class="search-suggestion-text">
                        <div class="search-suggestion-title">${highlightedText}</div>
                        <div class="search-suggestion-subtitle">${escapeHTML(suggestion.subtitle)}</div>
                    </div>
                </div>
            `;
        }).join('');

        suggestionsDiv.classList.add('show');
    }
}

function highlightMatchSidebar(text, search) {
    const regex = new RegExp(`(${search})`, 'gi');
    return escapeHTML(text).replace(regex, '<span class="search-suggestion-highlight">$1</span>');
}

function selectSuggestionSidebar(text) {
    const searchInput = document.getElementById('search-input');
    searchInput.value = text;
    applyFilters();
    hideSuggestionsSidebar();
}

function showSuggestionsSidebar() {
    updateSearchSuggestionsSidebar();
}

function hideSuggestionsSidebar() {
    setTimeout(() => {
        const suggestionsDiv = document.getElementById('search-suggestions-sidebar');
        if (suggestionsDiv) {
            suggestionsDiv.classList.remove('show');
        }
    }, 200);
}

window.handleSearchInputSidebar = handleSearchInputSidebar;
window.selectSuggestionSidebar = selectSuggestionSidebar;
window.showSuggestionsSidebar = showSuggestionsSidebar;
window.hideSuggestionsSidebar = hideSuggestionsSidebar;
