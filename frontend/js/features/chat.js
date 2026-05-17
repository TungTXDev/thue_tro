// Hàm đóng mở khung chat
function toggleAIChat() {
    const box = document.getElementById('ai-chat-box');
    const floatBtn = document.getElementById('chat-float-btn');

    if (box) {
        if (box.classList.contains('show')) {
            box.classList.remove('show');
            if (floatBtn) floatBtn.style.display = 'flex';
        } else {
            box.classList.add('show');
            if (floatBtn) floatBtn.style.display = 'none';
        }
    }
}

// Hàm xóa lịch sử chat
function clearChat() {
    const content = document.getElementById('chat-content');
    if (!content) return;

    // Giữ lại tin nhắn chào mừng ban đầu
    content.innerHTML = `
        <div class="chat-message bot-message">
            <div class="message-avatar">
                <i class="bi bi-robot"></i>
            </div>
            <div class="message-text">
                <p><strong>Xin chào! Tôi là holaBot - trợ lý AI của RIPT Rental 🏠✨</strong></p>
                <p>Tôi có thể giúp bạn:</p>
                <ul>
                    <li>🔍 Tìm kiếm nhà trọ theo địa điểm</li>
                    <li>💰 Tư vấn về giá cả và tiện nghi</li>
                    <li>📍 Gợi ý khu vực phù hợp</li>
                    <li>❓ Giải đáp thắc mắc về dịch vụ</li>
                </ul>
                <p>Bạn đang tìm kiếm gì hôm nay?</p>
            </div>
        </div>
    `;
}

// Hàm gửi tin nhắn
function sendMessage() {
    const input = document.getElementById('chat-input');
    const content = document.getElementById('chat-content');
    if (!input || !content || !input.value.trim()) return;

    const userMessage = input.value.trim();

    // Hiện tin nhắn của người dùng
    const userMsgHTML = `
        <div class="chat-message user-message">
            <div class="message-avatar">
                <i class="bi bi-person-fill"></i>
            </div>
            <div class="message-text">${escapeHTML(userMessage)}</div>
        </div>
    `;
    content.innerHTML += userMsgHTML;
    input.value = "";
    content.scrollTop = content.scrollHeight;

    // AI trả lời giả lập
    setTimeout(() => {
        const botMsgHTML = `
            <div class="chat-message bot-message">
                <div class="message-avatar">
                    <i class="bi bi-robot"></i>
                </div>
                <div class="message-text">Cảm ơn bạn! Mình đã nhận được câu hỏi: "${escapeHTML(userMessage)}". Đội ngũ hỗ trợ sẽ phản hồi sớm nhất!</div>
            </div>
        `;
        content.innerHTML += botMsgHTML;
        content.scrollTop = content.scrollHeight;
    }, 800);
}

window.toggleAIChat = toggleAIChat;
window.clearChat = clearChat;
window.sendMessage = sendMessage;
