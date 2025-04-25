/**
 * public/js/ui.js
 * Handles generic UI updates like rendering the navbar and main content area.
 */
import { getState } from './state.js'; // Needed for renderNavbar

const contentElement = document.getElementById('content');
// Target the header element to find the nav container within it more reliably
const headerElement = document.querySelector('header');

if (!contentElement) console.error("FATAL ERROR: #content element not found!");
if (!headerElement) console.warn("Warning: Header element not found!");

/**
 * Renders the navigation bar component into the header.
 * Assumes NavbarComponent returns a <nav> element.
 */
function renderNavbar() {
    if (!headerElement) return;
    // Find the existing nav element within the header to replace it
    const existingNav = headerElement.querySelector('nav');

    // Import and call the NavbarComponent function *inside* here
    // This avoids needing to pass state down explicitly if NavbarComponent uses getState()
    import('./components/Navbar.js').then(({ NavbarComponent }) => {
        const newNavElement = NavbarComponent(); // Get the new <nav> element
        if (existingNav) {
            existingNav.replaceWith(newNavElement); // Replace the old nav
            console.log('UI: Navbar updated.');
        } else {
            // Fallback: Append if no existing nav found (e.g., first load)
            // Adjust this logic based on your header structure if needed
            const h1 = headerElement.querySelector('h1');
            if(h1) {
                h1.insertAdjacentElement('afterend', newNavElement);
            } else {
                headerElement.appendChild(newNavElement); // Simple append as last resort
            }
            console.log('UI: Navbar rendered.');
        }
    }).catch(error => console.error("Failed to load or render NavbarComponent:", error));
}


/**
 * Clears and renders the main content area by appending a component's root element.
 * @param {HTMLElement} componentElement - The root HTMLElement returned by a component function.
 */
function renderContent(componentElement) {
    if (!contentElement) {
        console.error("Cannot render content, #content element not found.");
        return;
    }
    console.log('UI: Rendering main content with component:', componentElement?.id || 'Component');
    if (componentElement instanceof HTMLElement) {
        contentElement.innerHTML = ''; // Clear previous content
        contentElement.appendChild(componentElement); // Append the new component element
    } else {
        console.error('Invalid content type for renderContent, expected HTMLElement:', componentElement);
        contentElement.innerHTML = '<p class="text-red-500">Error: Could not render content.</p>';
    }
    // TODO: Handle component-specific initialization or focus management if needed after render
}

// Export the generic functions
export { renderNavbar, renderContent };