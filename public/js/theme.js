/**
 * public/js/theme.js
 * Handles theme switching and persistence.
 */

const sunIcon = `<svg id="theme-toggle-sun" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>`;
const moonIcon = `<svg id="theme-toggle-moon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 008.25-4.437z" /></svg>`;

/**
 * Updates the theme toggle button icon based on the current theme.
 */
function updateButtonIcon() {
    const themeToggleButton = document.getElementById('theme-toggle-button');
    if (themeToggleButton) {
        if (localStorage.getItem('theme') === 'dark') {
            themeToggleButton.innerHTML = sunIcon;
        } else {
            themeToggleButton.innerHTML = moonIcon;
        }
    }
}

/**
 * Toggles the color theme between light and dark and saves the preference.
 */
export function toggleTheme() {
    // toggle theme
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
    updateButtonIcon();
}

/**
 * Initializes the theme based on saved preference or system settings.
 * This should be called once when the application starts.
 */
export function initializeTheme() {
    // The initial class is already set by a small script in index.ejs <head>
    // to prevent flashing. This function's main job now is to ensure the
    // button icon is correct on initial load.
    updateButtonIcon();
    console.log('Theme initialized.');
}