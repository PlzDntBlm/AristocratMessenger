/**
 * public/js/components/Navbar.js
 * Defines the Navbar component function.
 */
import { getState } from '../state.js'; // Import state getter

/**
 * Creates and returns the Navbar DOM element based on current state.
 * @returns {HTMLElement} The <nav> element containing the appropriate links/buttons.
 */
export function NavbarComponent() {
    // Get the current authentication state
    const state = getState();
    // Create the main <nav> container element
    const navElement = document.createElement('nav');

    // Define the inner HTML based on login state
    let navHTML = '';
    if (state.isLoggedIn) {
        // Logged-in user view
        navHTML = `
            <a href="/home" data-route="home" class="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">Home</a>
            <span class="text-gray-300 px-3 py-2 text-sm">Welcome, ${state.currentUser?.username || 'User'}!</span>
            <button id="logout-button" class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm">Logout</button>
        `;
    } else {
        // Logged-out user view
        navHTML = `
            <a href="/login" data-route="login" class="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">Login</a>
            <a href="/register" data-route="register" class="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">Register</a>
        `;
    }
    // Set the inner HTML of the nav element
    navElement.innerHTML = navHTML;

    // Note: Event listeners for navigation links (data-route) and the logout button
    // are currently handled via delegation in app.js for simplicity.
    // They *could* be added here if more complex component-specific logic was needed.

    return navElement; // Return the fully constructed nav element
}