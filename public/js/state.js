/**
 * public/js/state.js
 * Manages the client-side application state.
 */
import { publish } from './pubsub.js'; // Import the publish function

// Initial state (will be updated on load)
const appState = {
    isLoggedIn: false,
    currentUser: null, // { id, username }
    // TODO: Add other state properties as needed (e.g., currentView, messages)
};

/**
 * Updates the authentication state and publishes an event.
 * @param {boolean} loggedInStatus
 * @param {object|null} userData - User object { id, username } or null
 */
function setAuthState(loggedInStatus, userData = null) {
    const changed = appState.isLoggedIn !== loggedInStatus || JSON.stringify(appState.currentUser) !== JSON.stringify(userData);

    appState.isLoggedIn = loggedInStatus;
    appState.currentUser = userData;
    console.log('State updated:', appState); // Log state changes

    // Publish an event only if the state actually changed
    if (changed) {
        publish('authStateChanged', {
            isLoggedIn: appState.isLoggedIn,
            currentUser: appState.currentUser
        });
    } else {
        console.log('State: setAuthState called but state did not change.');
    }
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