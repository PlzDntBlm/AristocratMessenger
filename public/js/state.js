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
    },
};

function setAuthState(loggedInStatus, userData = null) {
    const authStateChanged = appState.isLoggedIn !== loggedInStatus ||
        JSON.stringify(appState.currentUser) !== JSON.stringify(userData);

    appState.isLoggedIn = loggedInStatus;
    appState.currentUser = userData;

    if (authStateChanged) {
        console.log('State updated (Auth):', { isLoggedIn: appState.isLoggedIn, currentUser: appState.currentUser });
        publish('authStateChanged', {
            isLoggedIn: appState.isLoggedIn,
            currentUser: appState.currentUser
        });
    }
}

function setScriptoriumState(newScriptoriumPartialState) {
    let changed = false;
    for (const key in newScriptoriumPartialState) {
        if (Object.prototype.hasOwnProperty.call(newScriptoriumPartialState, key) &&
            Object.prototype.hasOwnProperty.call(appState.scriptorium, key)) {
            if (JSON.stringify(appState.scriptorium[key]) !== JSON.stringify(newScriptoriumPartialState[key])) {
                appState.scriptorium[key] = newScriptoriumPartialState[key];
                changed = true;
            }
        }
    }

    if (changed) {
        console.log('State updated (Scriptorium):', { ...appState.scriptorium });
        publish('scriptoriumStateChanged', { ...appState.scriptorium });
    }
}

function getState(sliceKey = null) {
    if (sliceKey) {
        const slice = appState[sliceKey];
        if (typeof slice === 'object' && slice !== null) {
            return { ...slice };
        }
        return slice;
    }
    return JSON.parse(JSON.stringify(appState));
}

export { getState, setAuthState, setScriptoriumState };