/**
 * public/js/app.js
 *
 * Main client-side JavaScript file for the Aristocrat Messenger SPA.
 * Handles navigation clicks, fetching partial views from the server,
 * and updating the main content area dynamically.
 */

/**
 * Selects the main content area element.
 * @type {HTMLElement}
 */
const contentElement = document.getElementById('content');

/**
 * Selects the main navigation element.
 * @type {HTMLElement}
 */
const navElement = document.querySelector('header nav'); // Assuming nav is in the header

/**
 * Fetches a partial view from the server and injects its HTML into the content area.
 * @param {string} partialName - The name of the partial to load (e.g., 'home', 'login').
 */
const loadPartial = async (partialName) => {
    if (!contentElement) {
        console.error("Error: Main content element '#content' not found.");
        return;
    }

    // Display a loading state
    contentElement.innerHTML = '<p class="text-center text-gray-500">Loading...</p>';
    // TODO: Implement a more sophisticated loading indicator (e.g., spinner)

    try {
        const response = await fetch(`/partials/${partialName}`);
        if (!response.ok) {
            // TODO: Handle different HTTP error statuses appropriately
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        contentElement.innerHTML = html;

        // TODO: Potentially run initialization scripts specific to the loaded partial
        // Example: if (typeof window[`init_${partialName}`] === 'function') { window[`init_${partialName}`](); }

    } catch (error) {
        console.error('Error loading partial:', error);
        contentElement.innerHTML = `<p class="text-center text-red-500">Error loading content. Please try again later.</p>`;
        // TODO: Provide more user-friendly error feedback
    }
};

/**
 * Handles clicks within the navigation area.
 * Checks if the clicked element is a link with a 'data-partial' attribute.
 * If so, prevents default navigation and loads the specified partial.
 * @param {Event} event - The click event object.
 */
const handleNavClick = (event) => {
    const targetLink = event.target.closest('a[data-partial]'); // Find the nearest anchor link with the attribute

    if (targetLink) {
        event.preventDefault(); // Prevent standard link navigation
        const partialName = targetLink.getAttribute('data-partial');
        if (partialName) {
            loadPartial(partialName);
            // TODO: Update browser history using History API (pushState) for proper back/forward navigation
            // Example: history.pushState({ partial: partialName }, '', `#${partialName}`);
        } else {
            console.warn("Navigation link clicked, but 'data-partial' attribute is missing or empty.", targetLink);
        }
    }
};

/**
 * Initializes the SPA functionality.
 * Attaches event listeners and loads the initial view.
 */
const initApp = () => {
    if (!navElement) {
        console.error("Error: Navigation element not found. Cannot attach click listener.");
        return;
    }
    // Use event delegation on the navigation container
    navElement.addEventListener('click', handleNavClick);

    // TODO: Implement logic to determine the initial partial based on URL hash or default
    // For now, let's default to loading the 'login' partial initially.
    // Change this to 'home' or based on auth status later.
    const initialPartial = 'login'; // Or determine from window.location.hash, or check auth status
    loadPartial(initialPartial);

    // TODO: Add event listener for 'popstate' event to handle browser back/forward buttons
    // window.addEventListener('popstate', (event) => { /* load partial from event.state */ });
};

// --- Initialization ---
// Wait for the DOM to be fully loaded before initializing the app
document.addEventListener('DOMContentLoaded', initApp);