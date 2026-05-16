const roomApi = {
    // Lấy danh sách phòng
    getAllRooms: async (filters = {}) => {
        // Build query string if filters are provided
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = queryParams ? `/rooms?${queryParams}` : '/rooms';

        return await fetchAPI(endpoint, {
            method: 'GET'
        });
    },

    // Lấy chi tiết một phòng
    getRoomById: async (id) => {
        return await fetchAPI(`/rooms/${id}`, {
            method: 'GET'
        });
    },

    // Lấy gợi ý tìm kiếm
    getSuggestions: async (query) => {
        return await fetchAPI(`/rooms/suggestions?q=${encodeURIComponent(query)}`, {
            method: 'GET'
        });
    },

    // Tạo phòng mới (với upload ảnh)
    createRoom: async (formData) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('Vui lòng đăng nhập');
        }

        const response = await fetch(`${BASE_API_URL}/rooms`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData // FormData object
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Tạo phòng thất bại');
        }
        return data;
    },

    // Cập nhật phòng (với upload ảnh)
    updateRoom: async (id, formData) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('Vui lòng đăng nhập');
        }

        const response = await fetch(`${BASE_API_URL}/rooms/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData // FormData object
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Cập nhật phòng thất bại');
        }
        return data;
    },

    // Xóa phòng
    deleteRoom: async (id) => {
        return await fetchAPI(`/rooms/${id}`, {
            method: 'DELETE'
        });
    }
};

window.roomApi = roomApi;
