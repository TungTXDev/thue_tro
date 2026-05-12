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
    }
};

window.roomApi = roomApi;
