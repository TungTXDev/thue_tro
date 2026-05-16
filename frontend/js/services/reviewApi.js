const reviewApi = {
    // Lấy danh sách đánh giá của 1 phòng
    getReviewsByRoom: async (roomId) => {
        return await fetchAPI(`/reviews/room/${roomId}`, {
            method: 'GET'
        });
    },

    // Thêm đánh giá mới
    createReview: async (reviewData) => {
        return await fetchAPI('/reviews', {
            method: 'POST',
            body: JSON.stringify(reviewData)
        });
    },

    // Cập nhật đánh giá
    updateReview: async (reviewId, reviewData) => {
        return await fetchAPI(`/reviews/${reviewId}`, {
            method: 'PUT',
            body: JSON.stringify(reviewData)
        });
    },

    // Xóa đánh giá
    deleteReview: async (reviewId) => {
        return await fetchAPI(`/reviews/${reviewId}`, {
            method: 'DELETE'
        });
    }
};

window.reviewApi = reviewApi;
