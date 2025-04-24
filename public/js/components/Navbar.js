import { getState } from '../state.js'; // May need state for rendering
// Import logout function from api.js if handling logout click here
// import { logoutUser } from '../api.js';

/**
 * Renders the Navbar component.
 * @returns {HTMLElement} - The nav element.
 */
export function NavbarComponent() {
    const state = getState(); // Get current state
    const nav = document.createElement('nav');
    // TODO: Add Tailwind classes to nav element if needed

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
    nav.innerHTML = navHTML;

    // --- Event Handling within Component ---
    // Example: Handle logout click directly if preferred over delegation in app.js
    const logoutButton = nav.querySelector('#logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log("Logout button clicked (within Navbar component)");
            // Option 1: Call a global handler (like handleLogout in app.js - requires passing it down or importing)
            // Option 2: Directly call API and update state (might lead to repeated logic)
            // Let's stick with global handler via app.js delegation for now to keep this simple,
            // but this is where component-specific logic *could* go.
        });
    }

    return nav;
}