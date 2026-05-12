const couponApi = {
    // Lấy tất cả mã giảm giá (Admin)
    getAllCoupons: async () => {
        return await fetchAPI('/coupons', {
            method: 'GET'
        });
    },

    // Tạo mã giảm giá mới (Admin)
    createCoupon: async (couponData) => {
        return await fetchAPI('/coupons', {
            method: 'POST',
            body: JSON.stringify(couponData)
        });
    },

    // Xóa mã giảm giá (Admin)
    deleteCoupon: async (id) => {
        return await fetchAPI(`/coupons/${id}`, {
            method: 'DELETE'
        });
    },

    // Kích hoạt/Vô hiệu hóa mã giảm giá (Admin)
    toggleCoupon: async (id) => {
        return await fetchAPI(`/coupons/${id}/toggle`, {
            method: 'PATCH'
        });
    },

    // Áp dụng mã giảm giá (User)
    applyCoupon: async (code, roomPrice) => {
        return await fetchAPI('/coupons/apply', {
            method: 'POST',
            body: JSON.stringify({ code, roomPrice })
        });
    }
};

window.couponApi = couponApi;
