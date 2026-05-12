const authApi = {
    // Đăng ký tài khoản
    register: async (userData) => {
        return await fetchAPI('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    // Đăng nhập
    login: async (credentials) => {
        return await fetchAPI('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },

    // Lấy thông tin user hiện tại (nếu cần)
    getMe: async () => {
        return await fetchAPI('/auth/me', {
            method: 'GET'
        });
    }
};

window.authApi = authApi;
