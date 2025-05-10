/**
 * public/js/state.js
 * Manages the client-side application state.
 */
import { publish } from './pubsub.js';

const appState = {
    isLoggedIn: false,
    currentUser: null,
    scriptorium: { // State slice for Scriptorium
        isOpen: false,
        recipient: null, // Will be an object like { id, username }
        subject: '',     // For future use
        body: '',        // For future use
        // usersForContactList: [] // Could also store the fetched users here if needed across app
    },
    // TODO: Add other state properties as needed (e.g., messages, currentView)
};

/**
 * Updates the authentication state and publishes an 'authStateChanged' event.
 * @param {boolean} loggedInStatus
 * @param {object|null} userData - User object { id, username } or null
 */
function setAuthState(loggedInStatus, userData = null) {
    const authStateChanged = appState.isLoggedIn !== loggedInStatus ||
        JSON.stringify(appState.currentUser) !== JSON.stringify(userData);

    appState.isLoggedIn = loggedInStatus;
    appState.currentUser = userData;

    if (authStateChanged) {
        console.log('State updated (Auth):', { isLoggedIn: appState.isLoggedIn, currentUser: appState.currentUser });
        publish('authStateChanged', { // Publish specific event for auth
            isLoggedIn: appState.isLoggedIn,
            currentUser: appState.currentUser
        });
    }
}

/**
 * Updates a specific part of the Scriptorium state and publishes a 'scriptoriumStateChanged' event.
 * @param {object} newScriptoriumPartialState - Partial state to update for Scriptorium e.g., { recipient: user, isOpen: true }
 */
function setScriptoriumState(newScriptoriumPartialState) {
    let changed = false;
    // Iterate over the keys in the partial state provided
    for (const key in newScriptoriumPartialState) {
        // Ensure the key is a direct property of the new state and exists in appState.scriptorium
        if (Object.prototype.hasOwnProperty.call(newScriptoriumPartialState, key) &&
            Object.prototype.hasOwnProperty.call(appState.scriptorium, key)) {
            // Check if the value has actually changed to avoid unnecessary updates/publishes
            if (JSON.stringify(appState.scriptorium[key]) !== JSON.stringify(newScriptoriumPartialState[key])) {
                appState.scriptorium[key] = newScriptoriumPartialState[key];
                changed = true;
            }
        }
    }

    if (changed) {
        console.log('State updated (Scriptorium):', { ...appState.scriptorium });
        publish('scriptoriumStateChanged', { ...appState.scriptorium }); // Publish the full current Scriptorium state
    }
}


/**
 * Returns a copy of the current state or a specific slice.
 * @param {string} [sliceKey] - Optional: The key of the state slice to return (e.g., 'scriptorium', 'currentUser')
 * @returns {object | any}
 */
function getState(sliceKey = null) {
    if (sliceKey) {
        // Return a deep copy of the slice if it's an object, or the value itself
        const slice = appState[sliceKey];
        if (typeof slice === 'object' && slice !== null) {
            return { ...slice };
        }
        return slice; // For primitive values like isLoggedIn or currentUser directly
    }
    // Return a deep copy of the entire state
    return JSON.parse(JSON.stringify(appState));
}

export { getState, setAuthState, setScriptoriumState };