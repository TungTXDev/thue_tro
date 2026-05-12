const orderApi = {
    // Lấy danh sách đơn đặt phòng (Admin)
    getAllOrders: async () => {
        return await fetchAPI('/orders', {
            method: 'GET'
        });
    },

    // Tạo đơn đặt phòng mới
    createOrder: async (orderData) => {
        return await fetchAPI('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    },

    // Xóa tất cả đơn đặt phòng (Admin)
    clearOrders: async () => {
        return await fetchAPI('/orders/clear', {
            method: 'DELETE'
        });
    }
};

window.orderApi = orderApi;
