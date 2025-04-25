/**
 * public/js/ui.js
 * Handles generic UI updates like rendering the navbar and main content area.
 * Uses PubSub to react to state changes for Navbar updates.
 */
import { subscribe } from './pubsub.js'; // Import subscribe
// We no longer need getState here directly, NavbarComponent will use it.

const contentElement = document.getElementById('content');
const headerElement = document.querySelector('header');

if (!contentElement) console.error("FATAL ERROR: #content element not found!");
if (!headerElement) console.warn("Warning: Header element not found!");

/**
 * Renders the navigation bar component into the header.
 * This function is now primarily responsible for the *act* of rendering,
 * triggered by the 'authStateChanged' event.
 * It dynamically imports the NavbarComponent to ensure the latest version is used.
 */
function renderNavbar() {
    if (!headerElement) return;

    console.log("UI: Received trigger to render Navbar...");

    // Find the existing nav element within the header to replace it
    const existingNav = headerElement.querySelector('nav');

    // Dynamically import and call the NavbarComponent function
    import('./components/Navbar.js').then(({ NavbarComponent }) => {
        const newNavElement = NavbarComponent(); // Get the new <nav> element from the component

        if (!newNavElement) {
            console.error("NavbarComponent did not return a valid element.");
            return;
        }

        if (existingNav) {
            existingNav.replaceWith(newNavElement); // Replace the old nav
            console.log('UI: Navbar updated via PubSub.');
        } else {
            // Fallback: Append if no existing nav found (initial load or error recovery)
            console.log('UI: No existing navbar found, appending new one.');
            const h1 = headerElement.querySelector('h1');
            if(h1) {
                h1.insertAdjacentElement('afterend', newNavElement);
            } else {
                headerElement.appendChild(newNavElement); // Simple append as last resort
            }
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


// --- PubSub Subscription ---
// Subscribe the renderNavbar function to the authStateChanged event.
// This happens once when the ui.js module is loaded.
// Now, whenever 'authStateChanged' is published (e.g., from state.js), renderNavbar will run.
subscribe('authStateChanged', renderNavbar);
console.log("UI: Subscribed renderNavbar to 'authStateChanged' event.");


// Export the generic functions (renderNavbar is exported but primarily triggered via PubSub)
export { renderNavbar, renderContent };