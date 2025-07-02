/**
 * public/js/components/Navbar.js
 * Defines the Navbar component function.
 */
import { getState } from '../state.js';

/**
 * Creates and returns the Navbar DOM element based on current state.
 * @returns {HTMLElement} The <nav> element containing the appropriate links/buttons.
 */
export function NavbarComponent() {
    const state = getState();
    const navElement = document.createElement('nav');
    // Added classes for layout
    navElement.className = 'flex items-center gap-4';

    // --- Theme Toggle Button ---
    const themeToggleButton = document.createElement('button');
    themeToggleButton.id = 'theme-toggle-button';
    themeToggleButton.type = 'button';
    themeToggleButton.className = 'p-2 rounded-full text-stone-300 hover:bg-yellow-700/50 focus:outline-none focus:ring-2 focus:ring-yellow-400';
    themeToggleButton.title = 'Toggle light/dark theme';

    // Sun icon (for dark mode, to switch to light)
    const sunIcon = `<svg id="theme-toggle-sun" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>`;

    // Moon icon (for light mode, to switch to dark)
    const moonIcon = `<svg id="theme-toggle-moon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 008.25-4.437z" /></svg>`;

    // Set initial icon based on current theme
    if (document.documentElement.classList.contains('dark')) {
        themeToggleButton.innerHTML = sunIcon;
    } else {
        themeToggleButton.innerHTML = moonIcon;
    }
    navElement.appendChild(themeToggleButton);


    // --- Auth Links/Buttons ---
    const authContainer = document.createElement('div');
    authContainer.className = 'flex items-center gap-2';

    let authHTML = '';
    if (state.isLoggedIn) {
        // Logged-in user view
        authHTML = `
            <span class="text-gray-300 px-3 py-2 text-sm hidden md:inline">Welcome, ${state.currentUser?.username || 'User'}!</span>
            <a href="/home" data-route="home" class="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">Home</a>
            <button id="logout-button" class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm">Logout</button>
        `;
    } else {
        // Logged-out user view
        authHTML = `
            <a href="/login" data-route="login" class="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">Login</a>
            <a href="/register" data-route="register" class="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">Register</a>
        `;
    }
    authContainer.innerHTML = authHTML;
    navElement.appendChild(authContainer);

    return navElement;
}