// Load header component
async function loadHeader() {
    try {
        const response = await fetch('components/header.html');
        const html = await response.text();

        // Find the header placeholder or insert at the beginning of body
        const headerPlaceholder = document.getElementById('header-placeholder');
        if (headerPlaceholder) {
            headerPlaceholder.innerHTML = html;
        } else {
            // Insert at the beginning of body
            const container = document.createElement('div');
            container.innerHTML = html;
            document.body.insertBefore(container.firstElementChild, document.body.firstChild);
        }

        console.log('Header component loaded successfully');

        // Setup auth form after loading header (which now includes auth modal)
        if (typeof setupAuthForm === 'function') {
            setupAuthForm();
        }

        // Update header to show login status after loading
        if (typeof updateHeader === 'function') {
            updateHeader();
        }
    } catch (error) {
        console.error('Failed to load header component:', error);
    }
}

// Load header when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHeader);
} else {
    loadHeader();
}
