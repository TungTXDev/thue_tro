// Load auth modal component
async function loadAuthModal() {
    try {
        const response = await fetch('components/auth-modal.html');
        const html = await response.text();

        // Insert auth modal HTML at the end of body
        const container = document.createElement('div');
        container.innerHTML = html;
        document.body.appendChild(container);

        console.log('Auth modal component loaded successfully');

        // Setup auth form after loading
        if (typeof setupAuthForm === 'function') {
            setupAuthForm();
        }
    } catch (error) {
        console.error('Failed to load auth modal component:', error);
    }
}

// Load auth modal when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAuthModal);
} else {
    loadAuthModal();
}
