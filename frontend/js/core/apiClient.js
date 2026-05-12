const BASE_API_URL = "http://localhost:4000/api";

/**
 * Fetch wrapper cho toàn bộ project
 * Tự động gắn token nếu có, xử lý lỗi, trả về JSON
 */
async function fetchAPI(endpoint, options = {}) {
    const url = `${BASE_API_URL}${endpoint}`;
    
    // Khởi tạo headers mặc định
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    // Lấy token từ localStorage (nếu có)
    const token = localStorage.getItem('authToken');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers
    };

    try {
        const response = await fetch(url, config);
        
        // Phân tích dữ liệu JSON trả về
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            // Quăng lỗi để hàm gọi API xử lý
            throw new Error(data.message || `Lỗi từ server: ${response.status}`);
        }

        return data;
    } catch (error) {
        // Ném lỗi ra ngoài để các nơi gọi API dùng try...catch bắt được
        // Điều này cho phép fallback sang localStorage
        throw error;
    }
}

window.fetchAPI = fetchAPI;
window.BASE_API_URL = BASE_API_URL;
