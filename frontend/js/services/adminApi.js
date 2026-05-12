const adminApi = {
    // Lấy thống kê Dashboard
    getDashboard: async () => {
        return await fetchAPI('/admin/dashboard', {
            method: 'GET'
        });
    }
};

window.adminApi = adminApi;
