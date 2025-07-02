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
    isProfilePaneOpen: false, // State for profile panel visibility
    registrationForm: {
        currentTab: 1,
        username: '',
        email: '',
        password: '',
        locationName: '',
        x: null,
        y: null,
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

/**
 * Sets the visibility state of the Profile Pane.
 * @param {boolean} isOpen - Whether the profile pane should be open.
 */
function setProfilePaneState(isOpen) {
    if (appState.isProfilePaneOpen !== isOpen) {
        appState.isProfilePaneOpen = isOpen;
        console.log('State updated (Profile Pane):', { isOpen: appState.isProfilePaneOpen });
        publish('profilePaneStateChanged', { isOpen: appState.isProfilePaneOpen });
    }
}

/**
 * Sets or updates the state for the registration form.
 * @param {object} newRegistrationFormState - Partial or full state for the registration form.
 */
function setRegistrationFormState(newRegistrationFormState) {
    let changed = false;
    for (const key in newRegistrationFormState) {
        if (Object.prototype.hasOwnProperty.call(newRegistrationFormState, key)) {
            if (appState.registrationForm[key] !== newRegistrationFormState[key]) {
                appState.registrationForm[key] = newRegistrationFormState[key];
                changed = true;
            }
        }
    }
    if (changed) {
        // We can publish an event if any component needs to react live to form changes.
        // For now, the RegisterPageComponent will manage its own re-rendering internally.
        console.log('State updated (Registration Form):', { ...appState.registrationForm });
        publish('registrationFormStateChanged', { ...appState.registrationForm });
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

export { getState, setAuthState, setScriptoriumState, setProfilePaneState, setRegistrationFormState };