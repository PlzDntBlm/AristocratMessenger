/**
 * public/js/ui.js
 * Handles generic UI updates like rendering the navbar and main content area.
 * Uses PubSub to react to state changes for Navbar updates.
 */
import { subscribe } from './pubsub.js';

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
        const newNavElement = NavbarComponent();

        if (!newNavElement) {
            console.error("NavbarComponent did not return a valid element.");
            return;
        }

        headerElement.querySelectorAll('nav').forEach(nav => nav.remove());
        headerElement.appendChild(newNavElement);

        console.log('UI: Navbar rendered.');
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
        contentElement.appendChild(componentElement);
    } else {
        console.error('Invalid content type for renderContent, expected HTMLElement:', componentElement);
        contentElement.innerHTML = '<p class="text-red-500">Error: Could not render content.</p>';
    }
}

// Subscribe the renderNavbar function to the authStateChanged event.
subscribe('authStateChanged', renderNavbar);
console.log("UI: Subscribed renderNavbar to 'authStateChanged' event.");

// We should also call it once on initial load to make sure the navbar is there from the start.
// This will render the correct version (logged in/out) based on the initial auth check.
renderNavbar();

export { renderNavbar, renderContent };