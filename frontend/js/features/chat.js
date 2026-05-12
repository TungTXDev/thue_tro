// Hàm đóng mở khung chat
function toggleAIChat() {
    const box = document.getElementById('ai-chat-box');
    
    // Kiểm tra xem nó đang ẩn hay hiện để lật ngược lại
    if (box.style.display === 'none' || box.style.display === '') {
        box.style.display = 'block';
        console.log("Đã hiện khung chat!"); 
    } else {
        box.style.display = 'none';
        console.log("Đã ẩn khung chat!");
    }
}

// Hàm gửi tin nhắn
function sendMessage() {
    const input = document.getElementById('chat-input');
    const content = document.getElementById('chat-content');
    if (!input.value.trim()) return;

    // Hiện tin nhắn của bạn
    content.innerHTML += `<div class="chat-message user-message">${escapeHTML(input.value)}</div>`;
    input.value = "";
    content.scrollTop = content.scrollHeight;

    // AI trả lời giả lập
    setTimeout(() => {
        content.innerHTML += `<div class="chat-message bot-message">Cảm ơn ban, mình đã nhận được yêu cầu!</div>`;
        content.scrollTop = content.scrollHeight;
    }, 800);
}

window.toggleAIChat = toggleAIChat;
window.sendMessage = sendMessage;
