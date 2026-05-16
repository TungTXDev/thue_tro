// 1. Hàm hiển thị các bình luận của phòng này
async function renderReviews() {
    const reviewsList = document.getElementById('reviews-list');
    if (!reviewsList) return;

    const roomId = getQueryParam('id');
    const currentUser = getStorage(STORAGE_KEYS.CURRENT_USER);
    let currentRoomReviews = [];

    // Hiển thị/ẩn form review dựa trên trạng thái đăng nhập
    toggleReviewForm();

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
        const stars = Array.from({ length: rev.stars }, () => '<i class="bi bi-star-fill"></i>').join('');
        const emptyStars = Array.from({ length: 5 - rev.stars }, () => '<i class="bi bi-star"></i>').join('');
        const userName = rev.userName || 'Khách hàng ẩn danh';
        const reviewDate = rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('vi-VN') : (rev.date || getCurrentDateTime());

        const isOwner = currentUser && rev.userId && currentUser._id === rev.userId;
        const contentEscaped = escapeHTML(rev.content).replace(/`/g, '\\`').replace(/'/g, "\\'");
        const editDeleteButtons = isOwner ? `
            <div class="review-actions">
                <button onclick="editReview('${rev._id || rev.id}', ${rev.stars}, \`${contentEscaped}\`, '${rev.userName}')" class="btn-edit-review">
                    <i class="bi bi-pencil"></i> Sửa
                </button>
                <button onclick="deleteReview('${rev._id || rev.id}')" class="btn-delete-review">
                    <i class="bi bi-trash"></i> Xóa
                </button>
            </div>
        ` : '';

        const reviewHTML = `
            <div class="review-item" data-review-id="${rev._id || rev.id}">
                <div class="review-header">
                    <div>
                        <strong><i class="bi bi-person-circle"></i> ${escapeHTML(userName)}</strong>
                        <div class="review-stars">${stars}${emptyStars}</div>
                    </div>
                    ${editDeleteButtons}
                </div>
                <p class="review-text">${escapeHTML(rev.content)}</p>
                <small class="review-date"><i class="bi bi-clock"></i> ${reviewDate}</small>
            </div>
        `;
        reviewsList.innerHTML += reviewHTML;
    });
}

// Hàm hiển thị/ẩn form review dựa trên trạng thái đăng nhập
function toggleReviewForm() {
    const currentUser = getStorage(STORAGE_KEYS.CURRENT_USER);
    const reviewFormCard = document.querySelector('.review-form-card');

    if (!reviewFormCard) return;

    if (!currentUser) {
        reviewFormCard.innerHTML = `
            <div style="text-align: center; padding: 30px 20px;">
                <i class="bi bi-lock-fill" style="font-size: 48px; color: #adb5bd; margin-bottom: 15px;"></i>
                <h4 style="color: #636e72; margin-bottom: 10px;">Đăng nhập để viết đánh giá</h4>
                <p style="color: #adb5bd; margin-bottom: 20px; font-size: 14px;">
                    Bạn cần đăng nhập để chia sẻ trải nghiệm của mình về phòng trọ này
                </p>
                <button onclick="openAuthModal('login')" class="review-submit-btn">
                    <i class="bi bi-box-arrow-in-right"></i> Đăng nhập ngay
                </button>
            </div>
        `;
    } else {
        reviewFormCard.innerHTML = `
            <h4 class="review-form-title">Viết đánh giá của bạn</h4>
            <div class="review-stars-input">
                <label class="stars-label">Đánh giá:</label>
                <div class="star-rating-input">
                    <i class="bi bi-star star-icon" data-rating="1"></i>
                    <i class="bi bi-star star-icon" data-rating="2"></i>
                    <i class="bi bi-star star-icon" data-rating="3"></i>
                    <i class="bi bi-star star-icon" data-rating="4"></i>
                    <i class="bi bi-star star-icon" data-rating="5"></i>
                </div>
                <input type="hidden" id="review-stars" value="0">
            </div>
            <textarea id="review-content" rows="3"
                placeholder="Chia sẻ trải nghiệm của bạn về phòng trọ..."
                class="review-textarea"></textarea>
            <button onclick="addReview()" class="review-submit-btn">
                <i class="bi bi-send-fill"></i> Gửi đánh giá
            </button>
        `;

        // Re-attach star rating event listeners
        initStarRating();
    }
}

// Khởi tạo star rating cho form review
function initStarRating() {
    const starIcons = document.querySelectorAll('.star-icon');
    const reviewStarsInput = document.getElementById('review-stars');

    if (starIcons.length > 0 && reviewStarsInput) {
        starIcons.forEach((star) => {
            star.addEventListener('click', function () {
                const rating = this.getAttribute('data-rating');
                reviewStarsInput.value = rating;

                starIcons.forEach((s, i) => {
                    if (i < rating) {
                        s.classList.remove('bi-star');
                        s.classList.add('bi-star-fill', 'active');
                    } else {
                        s.classList.remove('bi-star-fill', 'active');
                        s.classList.add('bi-star');
                    }
                });
            });

            star.addEventListener('mouseenter', function () {
                const rating = this.getAttribute('data-rating');
                starIcons.forEach((s, i) => {
                    if (i < rating) {
                        s.classList.remove('bi-star');
                        s.classList.add('bi-star-fill');
                    }
                });
            });
        });

        const starContainer = document.querySelector('.star-rating-input');
        if (starContainer) {
            starContainer.addEventListener('mouseleave', function () {
                const currentRating = reviewStarsInput.value;
                starIcons.forEach((s, i) => {
                    if (i < currentRating) {
                        s.classList.remove('bi-star');
                        s.classList.add('bi-star-fill', 'active');
                    } else {
                        s.classList.remove('bi-star-fill', 'active');
                        s.classList.add('bi-star');
                    }
                });
            });
        }
    }
}

// 2. Hàm thêm bình luận mới
async function addReview() {
    const currentUser = getStorage(STORAGE_KEYS.CURRENT_USER);
    if (!currentUser) {
        alert("Vui lòng đăng nhập để viết đánh giá!");
        openAuthModal('login');
        return;
    }

    const content = document.getElementById('review-content').value.trim();
    const starsValue = document.getElementById('review-stars').value;
    const roomId = getQueryParam('id');

    if (!starsValue || starsValue == '0') {
        alert("Vui lòng chọn số sao đánh giá!");
        return;
    }

    if (!content) {
        alert("Vui lòng nhập nội dung đánh giá!");
        return;
    }

    const stars = parseInt(starsValue);
    const reviewData = { roomId, stars, content };

    try {
        await reviewApi.createReview(reviewData);
        alert("Cảm ơn bạn đã đánh giá!");
    } catch (error) {
        console.warn("API lỗi/chưa bật, fallback sang localStorage:", error.message);
        const allReviews = getStorage(STORAGE_KEYS.ROOM_REVIEWS, []);
        const currentUser = getStorage(STORAGE_KEYS.CURRENT_USER);
        const newReview = {
            id: Date.now().toString(),
            roomId: roomId,
            stars: stars,
            content: content,
            userName: currentUser ? currentUser.name : 'Khách hàng ẩn danh',
            userId: currentUser ? currentUser._id : null,
            date: getCurrentDateTime()
        };
        allReviews.unshift(newReview);
        setStorage(STORAGE_KEYS.ROOM_REVIEWS, allReviews);
        alert("Cảm ơn bạn đã đánh giá!");
    }

    document.getElementById('review-content').value = '';
    document.getElementById('review-stars').value = '0';

    const starIcons = document.querySelectorAll('.star-icon');
    starIcons.forEach(s => {
        s.classList.remove('bi-star-fill', 'active');
        s.classList.add('bi-star');
    });

    renderReviews();
}

// 3. Hàm mở modal edit review
async function editReview(reviewId, currentStars, currentContent, userName) {
    const modal = document.getElementById('editReviewModal');
    const starsInput = document.getElementById('edit-review-stars');
    const contentInput = document.getElementById('edit-review-content');
    const reviewIdInput = document.getElementById('edit-review-id');

    starsInput.value = currentStars;
    contentInput.value = currentContent;
    reviewIdInput.value = reviewId;

    const starIcons = document.querySelectorAll('.star-icon-edit');
    starIcons.forEach((star, index) => {
        if (index < currentStars) {
            star.classList.remove('bi-star');
            star.classList.add('bi-star-fill', 'active');
        } else {
            star.classList.remove('bi-star-fill', 'active');
            star.classList.add('bi-star');
        }
    });

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeEditReviewModal() {
    const modal = document.getElementById('editReviewModal');
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

async function saveEditReview() {
    const reviewId = document.getElementById('edit-review-id').value;
    const stars = parseInt(document.getElementById('edit-review-stars').value);
    const content = document.getElementById('edit-review-content').value.trim();

    if (!stars || stars === 0) {
        alert('Vui lòng chọn số sao đánh giá!');
        return;
    }

    if (!content) {
        alert('Vui lòng nhập nội dung đánh giá!');
        return;
    }

    try {
        await reviewApi.updateReview(reviewId, { stars, content });
        alert('Đã cập nhật đánh giá!');
        closeEditReviewModal();
        renderReviews();
    } catch (error) {
        console.warn("API lỗi/chưa bật, fallback sang localStorage:", error.message);
        const allReviews = getStorage(STORAGE_KEYS.ROOM_REVIEWS, []);
        const reviewIndex = allReviews.findIndex(r => (r._id || r.id) === reviewId);
        if (reviewIndex !== -1) {
            allReviews[reviewIndex].stars = stars;
            allReviews[reviewIndex].content = content;
            setStorage(STORAGE_KEYS.ROOM_REVIEWS, allReviews);
            alert('Đã cập nhật đánh giá!');
            closeEditReviewModal();
            renderReviews();
        }
    }
}

async function deleteReview(reviewId) {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;

    try {
        await reviewApi.deleteReview(reviewId);
        alert('Đã xóa đánh giá!');
        renderReviews();
    } catch (error) {
        console.warn("API lỗi/chưa bật, fallback sang localStorage:", error.message);
        const allReviews = getStorage(STORAGE_KEYS.ROOM_REVIEWS, []);
        const filteredReviews = allReviews.filter(r => (r._id || r.id) !== reviewId);
        setStorage(STORAGE_KEYS.ROOM_REVIEWS, filteredReviews);
        alert('Đã xóa đánh giá!');
        renderReviews();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const starIconsEdit = document.querySelectorAll('.star-icon-edit');
    const reviewStarsEditInput = document.getElementById('edit-review-stars');

    if (starIconsEdit.length > 0 && reviewStarsEditInput) {
        starIconsEdit.forEach((star) => {
            star.addEventListener('click', function () {
                const rating = this.getAttribute('data-rating');
                reviewStarsEditInput.value = rating;

                starIconsEdit.forEach((s, i) => {
                    if (i < rating) {
                        s.classList.remove('bi-star');
                        s.classList.add('bi-star-fill', 'active');
                    } else {
                        s.classList.remove('bi-star-fill', 'active');
                        s.classList.add('bi-star');
                    }
                });
            });

            star.addEventListener('mouseenter', function () {
                const rating = this.getAttribute('data-rating');
                starIconsEdit.forEach((s, i) => {
                    if (i < rating) {
                        s.classList.remove('bi-star');
                        s.classList.add('bi-star-fill');
                    }
                });
            });
        });

        const starContainer = document.querySelector('.review-modal-body .star-rating-input');
        if (starContainer) {
            starContainer.addEventListener('mouseleave', function () {
                const currentRating = reviewStarsEditInput.value;
                starIconsEdit.forEach((s, i) => {
                    if (i < currentRating) {
                        s.classList.remove('bi-star');
                        s.classList.add('bi-star-fill', 'active');
                    } else {
                        s.classList.remove('bi-star-fill', 'active');
                        s.classList.add('bi-star');
                    }
                });
            });
        }
    }
});

window.renderReviews = renderReviews;
window.addReview = addReview;
window.editReview = editReview;
window.closeEditReviewModal = closeEditReviewModal;
window.saveEditReview = saveEditReview;
window.deleteReview = deleteReview;
window.toggleReviewForm = toggleReviewForm;
