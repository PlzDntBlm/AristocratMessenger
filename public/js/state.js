/**
 * public/js/state.js
 * Manages the client-side application state.
 */

// Initial state (will be updated on load)
const appState = {
    isLoggedIn: false,
    currentUser: null, // { id, username }
    // TODO: Add other state properties as needed (e.g., currentView, messages)
};

/**
 * Updates the authentication state.
 * @param {boolean} loggedInStatus
 * @param {object|null} userData - User object { id, username } or null
 */
function setAuthState(loggedInStatus, userData = null) {
    appState.isLoggedIn = loggedInStatus;
    appState.currentUser = userData;
    console.log('State updated:', appState); // Log state changes
    // TODO: Implement observer pattern or trigger UI updates explicitly from here or calling function
}

/**
 * Returns a copy of the current state.
 * @returns {object}
 */
function getState() {
    return { ...appState }; // Return a copy to prevent direct modification
}

// Export the functions needed by other modules
export { getState, setAuthState };