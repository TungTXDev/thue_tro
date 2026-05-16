// Khởi tạo trang chủ
document.addEventListener("DOMContentLoaded", function () {
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

// Search autocomplete for index page
let searchTimeout;

function handleSearchInput(event) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        filterRooms();
        updateSearchSuggestions();
    }, 300);
}

async function updateSearchSuggestions() {
    const searchInput = document.getElementById('search');
    const suggestionsDiv = document.getElementById('search-suggestions');
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
            const highlightedText = highlightMatch(suggestion.text, searchText);
            return `
                <div class="search-suggestion-item" onmousedown="selectSuggestion('${escapeHTML(suggestion.text)}')">
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
        const allRooms = getStorage(STORAGE_KEYS.ROOMS_DATA, []);
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
            const highlightedText = highlightMatch(suggestion.text, searchText);
            return `
                <div class="search-suggestion-item" onmousedown="selectSuggestion('${escapeHTML(suggestion.text)}')">
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

function highlightMatch(text, search) {
    const regex = new RegExp(`(${search})`, 'gi');
    return escapeHTML(text).replace(regex, '<span class="search-suggestion-highlight">$1</span>');
}

function selectSuggestion(text) {
    const searchInput = document.getElementById('search');
    searchInput.value = text;
    filterRooms();
    hideSuggestions();
}

function showSuggestions() {
    updateSearchSuggestions();
}

function hideSuggestions() {
    setTimeout(() => {
        const suggestionsDiv = document.getElementById('search-suggestions');
        if (suggestionsDiv) {
            suggestionsDiv.classList.remove('show');
        }
    }, 200);
}

window.handleSearchInput = handleSearchInput;
window.selectSuggestion = selectSuggestion;
window.showSuggestions = showSuggestions;
window.hideSuggestions = hideSuggestions;
