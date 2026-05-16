const STORAGE_KEYS = {
    ROOMS_DATA: 'sinhVienRoomsData',
    CURRENT_USER: 'currentUser',
    ROOM_REVIEWS: 'roomReviews',
    APP_COUPONS: 'appCoupons',
    ALL_ORDERS: 'allOrders',
    AUTH_TOKEN: 'authToken'
};

function getStorage(key, fallback = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (error) {
        console.error(`Lỗi đọc localStorage [${key}]:`, error);
        return fallback;
    }
}

function setStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Lỗi lưu localStorage [${key}]:`, error);
    }
}

function removeStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Lỗi xóa localStorage [${key}]:`, error);
    }
}
