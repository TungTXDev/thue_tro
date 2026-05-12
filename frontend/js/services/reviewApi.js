const reviewApi = {
    // Lấy danh sách đánh giá của 1 phòng
    getReviewsByRoom: async (roomId) => {
        return await fetchAPI(`/reviews/${roomId}`, {
            method: 'GET'
        });
    },

    // Thêm đánh giá mới
    createReview: async (reviewData) => {
        return await fetchAPI('/reviews', {
            method: 'POST',
            body: JSON.stringify(reviewData)
        });
    }
};

window.reviewApi = reviewApi;
