/**
 * public/js/app.js
 * Main application entry point. Initializes the app, handles routing,
 * manages interaction between state, api, and component rendering.
 */
import * as api from './api.js';
import {getState, setAuthState, setScriptoriumState, setProfilePaneState} from './state.js';
import {renderContent, renderNavbar} from './ui.js';
import {initializeTheme, toggleTheme} from './theme.js';
import {LoginPageComponent} from './components/LoginPage.js';
import {RegisterPageComponent} from './components/RegisterPage.js';
import {HomePageComponent} from './components/HomePage.js';
import {ScriptoriumComponent} from './components/ScriptoriumComponent.js';
import {CabinetComponent} from './components/CabinetComponent.js';
import {MessageDetailComponent} from './components/MessageDetailComponent.js';
import {subscribe, publish} from './pubsub.js';
import {AdminPageComponent} from './components/AdminPageComponent.js';
import {ChatRoomPageComponent} from './components/ChatRoomPageComponent.js';
import {NotFoundComponent} from './components/NotFoundComponent.js';


// --- Core Elements ---
const contentElement = document.getElementById('content');
const bodyElement = document.body;

// --- Scriptorium Management ---
// Scriptorium is a global overlay. We'll instantiate it once on app load.
let scriptoriumElement = null; // Scriptorium is an overlay, managed here

/**
 * Updates the Scriptorium state to open and resets its fields.
 */
function showScriptorium() {
    setScriptoriumState({
        isOpen: true,
        recipient: null,
        subject: '',
        body: ''
    });
    console.log('App: Requested to show Scriptorium (state updated)');
}

/**
 * Updates the Scriptorium state to closed.
 */
function hideScriptorium() {
    setScriptoriumState({isOpen: false});
    console.log('App: Requested to hide Scriptorium (state updated)');
}

/**
 * Handles sending a message from the Scriptorium.
 */
async function handleSendMessage() {
    const scriptoriumState = getState('scriptorium');
    if (!scriptoriumElement) return;
    const sendButton = scriptoriumElement.querySelector('#scriptorium-send-button');
    if (!scriptoriumState.recipient || !scriptoriumState.recipient.id || !scriptoriumState.subject?.trim() || !scriptoriumState.body?.trim()) {
        alert('Please select a recipient and fill in both subject and body.');
        return;
    }
    if (sendButton) sendButton.disabled = true;
    try {
        const result = await api.sendMessage(scriptoriumState.recipient.id, scriptoriumState.subject, scriptoriumState.body);
        if (result.success) {
            alert('Message sent successfully!');
            hideScriptorium();
            publish('messageSent', {message: result.data});
        } else {
            alert(`Failed to send message: ${result.message || 'Unknown error'}`);
            if (sendButton) sendButton.disabled = false;
        }
    } catch (error) {
        console.error('App: Error sending message:', error);
        alert(`Error sending message: ${error.message || 'Network or server error'}`);
        if (sendButton) sendButton.disabled = false;
    }
}

// --- Route Rendering Logic ---
/**
 * Renders the appropriate component into the content area based on the route path.
 * @param {string} path - The current window.location.pathname.
 */
function renderRouteByPath(path) {
    if (!contentElement) {
        console.error("FATAL ERROR: #content element not found in renderRouteByPath!");
        return;
    }
    console.log(`App: Rendering route for path: ${path}`);
    // Close Profile Pane when navigating, unless the navigation is *to* a profile-specific route (none yet)
    if (getState().isProfilePaneOpen) {
        setProfilePaneState(false);
    }

    let componentElement = null;
    const currentAppState = getState();
    const normalizedPath = path.startsWith('/') ? path : '/' + path;
    const pathSegments = normalizedPath.split('/').filter(Boolean);

    let routeName = pathSegments[0] || (currentAppState.isLoggedIn ? 'home' : 'login');
    let routeParam = pathSegments[1] || null;

    // A more robust way to handle multi-segment routes like /chat/room/:id
    if (pathSegments[0] === 'chat' && pathSegments[1] === 'room' && pathSegments[2]) {
        routeName = 'chatroom';
        routeParam = pathSegments[2];
    } else if (pathSegments[0] === 'message' && pathSegments[1]) {
        routeName = 'message';
        routeParam = pathSegments[1];
    }

    if (normalizedPath === '/' || normalizedPath === '') {
        routeName = currentAppState.isLoggedIn ? 'home' : 'login';
        const targetPath = '/' + routeName;
        if (window.location.pathname !== targetPath) {
            history.replaceState({path: targetPath}, '', targetPath);
        }
    }

    const protectedRoutes = ['home', 'cabinet', 'scriptorium', 'message', 'map', 'chatroom']; // Added 'map'
    if (protectedRoutes.includes(routeName) && !currentAppState.isLoggedIn) {
        console.warn(`App: Access to protected route ${normalizedPath} denied. Redirecting to /login.`);
        const loginPath = '/login';
        history.replaceState({path: loginPath}, '', loginPath);
        routeName = 'login';
        routeParam = null;
    }

    switch (routeName) {
        case 'login':
            componentElement = currentAppState.isLoggedIn ? HomePageComponent(currentAppState.currentUser) : LoginPageComponent();
            if (currentAppState.isLoggedIn && window.location.pathname !== '/home') history.replaceState({path: '/home'}, '', '/home');
            break;
        case 'register':
            componentElement = currentAppState.isLoggedIn ? HomePageComponent(currentAppState.currentUser) : RegisterPageComponent();
            if (currentAppState.isLoggedIn && window.location.pathname !== '/home') history.replaceState({path: '/home'}, '', '/home');
            break;
        case 'home':
            componentElement = HomePageComponent(currentAppState.currentUser);
            break;
        case 'cabinet':
            componentElement = CabinetComponent();
            break;
        case 'message':
            if (routeParam) {
                componentElement = MessageDetailComponent(routeParam);
            } else {
                console.warn(`App: Missing message ID for /message route. Redirecting to /cabinet.`);
                history.replaceState({path: '/cabinet'}, '', '/cabinet');
                componentElement = CabinetComponent();
            }
            break;
        case 'chatroom':
            if (routeParam) {
                componentElement = ChatRoomPageComponent(routeParam);
            } else {
                console.warn(`App: Missing room ID for /chat/room route. Redirecting to /home.`);
                history.replaceState({path: '/home'}, '', '/home');
                componentElement = HomePageComponent(currentAppState.currentUser);
            }
            break;
        // --- ADMIN ROUTE CASE ---
        case 'admin':
            // The API protecting the data is the source of truth, but we can
            // also prevent rendering for non-admins on the client-side for a better UX.
            if (currentAppState.currentUser && currentAppState.currentUser.isAdmin) {
                componentElement = AdminPageComponent();
            } else {
                // If a non-admin tries to access /admin, show an error or redirect
                console.warn("Client-side block: Non-admin attempted to access /admin route.");
                history.replaceState({path: '/home'}, '', '/home');
                componentElement = HomePageComponent(currentAppState.currentUser);
            }
            break;
        default:
            console.warn(`Unknown route: ${routeName} from path ${normalizedPath}. Rendering 404 component.`);
            componentElement = NotFoundComponent();
            break;
    }

    if (componentElement) {
        renderContent(componentElement);
    }
}


// --- Event Handlers ---
/**
 * Handles global click events using event delegation.
 * @param {Event} event - The click event.
 */
function handleGlobalClick(event) {
    const target = event.target;
    const currentScriptoriumState = getState('scriptorium');

    if (target.closest('#theme-toggle-button')) {
        event.preventDefault();
        toggleTheme();
        return;
    }

    // Profile Pane Crest Click
    if (target.closest('#profile-crest-button')) {
        event.preventDefault();
        setProfilePaneState(!getState().isProfilePaneOpen); // Toggle pane
        return;
    }

    // Click on Profile Pane Backdrop to close
    if (target.matches('#profile-pane-backdrop')) {
        event.preventDefault();
        setProfilePaneState(false);
        return;
    }
    // Note: ProfilePaneComponent's internal close button calls setProfilePaneState(false) directly.

    // Scriptorium specific actions (check if it's open first)
    if (currentScriptoriumState && currentScriptoriumState.isOpen) {
        if (target.closest('[data-action="close-scriptorium"]')) {
            event.preventDefault();
            hideScriptorium();
            return;
        }
        if (target.closest('[data-action="select-recipient"]')) {
            event.preventDefault();
            const selectRecipientButton = target.closest('[data-action="select-recipient"]');
            const userId = parseInt(selectRecipientButton.dataset.userId, 10);
            const username = selectRecipientButton.textContent;
            setScriptoriumState({recipient: {id: userId, username: username}});
            return;
        }
        if (target.closest('[data-action="send-message"]')) {
            event.preventDefault();
            handleSendMessage();
            return;
        }
    }

    // Generic navigation links
    const targetLink = target.closest('a[data-route]');
    if (targetLink) {
        event.preventDefault();
        const path = targetLink.getAttribute('href');
        if (path !== window.location.pathname) {
            history.pushState({path: path}, '', path);
        }
        renderRouteByPath(path);
        return;
    }

    // Specific button actions
    if (target.closest('#logout-button')) { // For main navbar logout
        event.preventDefault();
        handleLogout();
        return;
    }
    if (target.closest('#show-scriptorium-button')) {
        event.preventDefault();
        showScriptorium();
        return;
    }
    const messageItemLink = target.closest('[data-action="view-message"]');
    if (messageItemLink) {
        event.preventDefault();
        const messageId = messageItemLink.dataset.messageId;
        if (messageId) {
            const path = `/message/${messageId}`;
            history.pushState({path: path}, '', path);
            renderRouteByPath(path);
        }
        return;
    }
}

/**
 * Handles the logout process by deleting the token and updating state.
 */
async function handleLogout() {
    console.log("App: Logout initiated...");
    await api.logoutUser(); // This just deletes the token from local storage
    setAuthState(false, null);
    setScriptoriumState({isOpen: false});
    setProfilePaneState(false);

    // Redirect to login page
    const loginPath = '/login';
    history.pushState({path: loginPath}, '', loginPath);
    renderRouteByPath(loginPath);
}

/**
 * Handles login and register form submissions.
 * @param {Event} event - The submit event.
 */
async function handleAuthFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const messageElement = form.querySelector('#login-message') || form.querySelector('#register-message');
    const submitButton = form.querySelector('button[type="submit"]');

    if (messageElement) messageElement.textContent = '';
    if (submitButton) submitButton.disabled = true;

    try {
        let result;
        let nextPath = null;

        if (form.id === 'login-form') {
            result = await api.loginUser(data.email, data.password);
            if (result.success) {
                setAuthState(true, result.user); // setAuthState now handles user data including location
                nextPath = '/home';
            } else {
                throw new Error(result.message || 'Login failed');
            }
        } else if (form.id === 'register-form') {
            result = await api.registerUser(data.username, data.email, data.password);
            if (result.success) {
                nextPath = '/login';
                alert("Registration successful! Please log in.");
            } else {
                throw new Error(result.message || 'Registration failed');
            }
        }

        if (nextPath) {
            if (nextPath !== window.location.pathname) {
                history.pushState({path: nextPath}, '', nextPath);
            }
            renderRouteByPath(nextPath);
        }
    } catch (error) {
        console.error(`App: Form ${form.id} submission error:`, error);
        if (messageElement) {
            messageElement.textContent = error.message || 'An error occurred.';
            messageElement.className = 'mt-4 text-sm text-red-600';
        }
    } finally {
        if (submitButton) submitButton.disabled = false;
    }
}

/**
 * Handles browser back/forward navigation (popstate event).
 * @param {PopStateEvent} event - The popstate event.
 */
function handlePopstate(event) {
    console.log('App: Popstate event fired:', event.state);
    let path;
    if (event.state && event.state.path) {
        path = event.state.path;
    } else {
        path = window.location.pathname;
        history.replaceState({path: path}, '', path);
    }
    renderRouteByPath(path);
}

// --- Initialization ---
/**
 * Initializes the entire application.
 */
async function initializeApp() {
    console.log('App: Initializing...');
    bodyElement.addEventListener('click', handleGlobalClick);
    if (contentElement) {
        contentElement.addEventListener('submit', handleAuthFormSubmit);
    } else {
        console.error("FATAL ERROR: #content element not found! Auth forms may not work.");
    }
    window.addEventListener('popstate', handlePopstate);

    // --- Create global overlay components ---
    // The Scriptorium is instantiated once and appended to the body.
    // Its visibility is controlled entirely by its subscription to 'scriptoriumStateChanged'.
    scriptoriumElement = ScriptoriumComponent(); // <<< MOVED HERE
    bodyElement.appendChild(scriptoriumElement);  // <<< MOVED HERE
    console.log('App: Scriptorium component initialized and appended to body.');

    subscribe('navigateToRoute', (data) => {
        if (data && data.routeName) {
            const path = `/${data.routeName}`;
            if (path !== window.location.pathname) {
                history.pushState({path: path}, '', path);
            }
            renderRouteByPath(path);
        }
    });
    subscribe('requestLogout', handleLogout); // Listen for logout requests (e.g., from ProfilePane)


    // --- Initial JWT-based Auth Check ---
    const token = api.getToken();
    if (token) {
        console.log('App: Token found, attempting to verify user...');
        try {
            // Use the new /api/users/me endpoint
            const response = await api.getMyProfile();
            if (response.success) {
                setAuthState(true, response.user);
            } else {
                // Token is invalid or expired
                console.warn('App: Token was found but is invalid. Logging out.');
                api.logoutUser(); // Clear the bad token
                setAuthState(false, null);
            }
        } catch (error) {
            console.error("App: Error verifying token on init:", error.message);
            api.logoutUser(); // Clear the bad token
            setAuthState(false, null);
        }
    } else {
        // No token found, ensure logged out state
        console.log('App: No token found. User is logged out.');
        setAuthState(false, null);
    }

    // Set initial states for overlays to be closed.
    setScriptoriumState({isOpen: false, recipient: null, subject: '', body: ''});
    setProfilePaneState(false); // Ensure profile pane is closed on init

    // --- Initial Route Rendering ---
    const initialPath = window.location.pathname;
    history.replaceState({path: initialPath}, '', initialPath);
    renderRouteByPath(initialPath);
    console.log("App: Initialization complete.");
}

document.addEventListener('DOMContentLoaded', initializeApp);