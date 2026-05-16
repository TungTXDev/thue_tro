// Load footer component
async function loadFooter() {
    try {
        const response = await fetch('components/footer.html');
        const html = await response.text();

        // Find the footer placeholder or insert at the end of body
        const footerPlaceholder = document.getElementById('footer-placeholder');
        if (footerPlaceholder) {
            footerPlaceholder.innerHTML = html;
        } else {
            // Insert at the end of body (before scripts)
            const container = document.createElement('div');
            container.innerHTML = html;
            document.body.appendChild(container.firstElementChild);
        }

        console.log('Footer component loaded successfully');
    } catch (error) {
        console.error('Failed to load footer component:', error);
    }
}

// Load footer when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFooter);
} else {
    loadFooter();
}
