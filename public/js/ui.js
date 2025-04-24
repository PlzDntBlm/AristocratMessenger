/**
 * public/js/ui.js
 * Handles generic UI updates like rendering main content and the navbar.
 */
import { getState } from './state.js'; // Needed for renderNavbar

const contentElement = document.getElementById('content');
const navContainer = document.querySelector('header > div'); // Target the container holding the nav

if (!contentElement) console.error("FATAL ERROR: #content element not found!");
if (!navContainer) console.warn("Warning: Header container element not found for Navbar!");

/**
 * Renders the navigation bar based on the application state.
 * @param {object} state - The current application state from state.js
 */
function renderNavbar() { // No longer needs state passed in, gets it itself
    if (!navContainer) return;
    const state = getState(); // Get current state
    console.log('UI: Rendering Navbar for state:', state);

    // Find or create the nav element within the container
    let navElement = navContainer.querySelector('nav');
    if (!navElement) {
        navElement = document.createElement('nav');
        // Find where to insert it - maybe after the h1? Adjust selector as needed.
        const heading = navContainer.querySelector('h1');
        if (heading) {
            heading.insertAdjacentElement('afterend', navElement);
        } else {
            navContainer.appendChild(navElement); // Fallback
        }
    }


    let navHTML = '';
    if (state.isLoggedIn) {
        navHTML = `
             <a href="#home" data-route="home" class="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">Home</a>
             <span class="text-gray-300 px-3 py-2 text-sm">Welcome, ${state.currentUser?.username || 'User'}!</span>
             <button id="logout-button" class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm">Logout</button>
         `;
    } else {
        navHTML = `
             <a href="#login" data-route="login" class="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">Login</a>
             <a href="#register" data-route="register" class="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">Register</a>
         `;
    }
    navElement.innerHTML = navHTML;
    // Note: Event listeners for logout/nav links are handled by delegation in app.js
}

/**
 * Renders the main content area by appending a component's root element.
 * @param {HTMLElement} componentElement - The root HTMLElement returned by a component function.
 */
function renderContent(componentElement) {
    if (!contentElement) return;
    console.log('UI: Rendering main content component...');
    if (componentElement instanceof HTMLElement) {
        contentElement.innerHTML = ''; // Clear previous content
        contentElement.appendChild(componentElement);
    } else {
        console.error('Invalid content type for renderContent, expected HTMLElement:', componentElement);
        contentElement.innerHTML = '<p class="text-red-500">Error rendering content.</p>';
    }
}

// Export only the generic functions now
export { renderNavbar, renderContent };