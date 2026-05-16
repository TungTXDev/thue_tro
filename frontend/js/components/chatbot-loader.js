// Load chatbot component
async function loadChatbot() {
    try {
        const response = await fetch('components/chatbot.html');
        const html = await response.text();

        // Insert chatbot HTML at the end of body
        const container = document.createElement('div');
        container.innerHTML = html;
        document.body.appendChild(container);

        console.log('Chatbot component loaded successfully');
    } catch (error) {
        console.error('Failed to load chatbot component:', error);
    }
}

// Load chatbot when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadChatbot);
} else {
    loadChatbot();
}
