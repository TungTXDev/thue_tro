// 1. Hàm hiển thị các bình luận của phòng này
async function renderReviews() {
    const reviewsList = document.getElementById('reviews-list');
    if (!reviewsList) return;

    const roomId = getQueryParam('id');
    let currentRoomReviews = [];

    try {
        const response = await reviewApi.getReviewsByRoom(roomId);
        currentRoomReviews = response.data.reviews || response.data;
    } catch (error) {
        console.warn("API lỗi/chưa bật, fallback sang localStorage:", error.message);
        const allReviews = getStorage(STORAGE_KEYS.ROOM_REVIEWS, []);
        currentRoomReviews = allReviews.filter(rev => rev.roomId == roomId);
    }

    reviewsList.innerHTML = '';

    if (currentRoomReviews.length === 0) {
        reviewsList.innerHTML = '<p class="empty-review">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!</p>';
        return;
    }

    currentRoomReviews.forEach(rev => {
        const stars = '⭐'.repeat(rev.stars);
        const reviewHTML = `
            <div class="review-item">
                <div class="review-header">
                    <strong>👤 Khách hàng ẩn danh</strong>
                    <span class="review-stars">${stars}</span>
                </div>
                <p class="review-text">${escapeHTML(rev.content)}</p>
                <small class="review-date">Đã đăng vào: ${rev.date}</small>
            </div>
        `;
        reviewsList.innerHTML += reviewHTML;
    });
}

// 2. Hàm thêm bình luận mới
async function addReview() {
    const content = document.getElementById('review-content').value.trim();
    const stars = document.getElementById('review-stars').value;
    const roomId = getQueryParam('id');
    
    if (!content) {
        alert("Nhập nội dung bình luận đã nhé!");
        return;
    }

    const reviewData = { roomId, stars: parseInt(stars), content };

    try {
        await reviewApi.createReview(reviewData);
        // Không cần alert ở đây để trải nghiệm mượt hơn
    } catch (error) {
        console.warn("API lỗi/chưa bật, fallback sang localStorage:", error.message);
        const allReviews = getStorage(STORAGE_KEYS.ROOM_REVIEWS, []);
        const newReview = {
            roomId: roomId, 
            stars: parseInt(stars),
            content: content,
            date: getCurrentDateTime()
        };
        allReviews.unshift(newReview); 
        setStorage(STORAGE_KEYS.ROOM_REVIEWS, allReviews);
    }

    document.getElementById('review-content').value = '';
    renderReviews();
}

window.renderReviews = renderReviews;
window.addReview = addReview;
