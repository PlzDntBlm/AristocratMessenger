/**
 * public/js/app.js
 * Main application entry point. Initializes the app, handles routing,
 * manages interaction between state, api, and component rendering.
 */
import * as api from './api.js';
import { getState, setAuthState, setScriptoriumState } from './state.js';
import { renderContent, renderNavbar } from './ui.js';
import { LoginPageComponent } from './components/LoginPage.js';
import { RegisterPageComponent } from './components/RegisterPage.js';
import { HomePageComponent } from './components/HomePage.js';
import { ScriptoriumComponent } from './components/ScriptoriumComponent.js';
import { CabinetComponent } from './components/CabinetComponent.js';
import { MessageDetailComponent } from './components/MessageDetailComponent.js'; // Import MessageDetailComponent
import { subscribe, publish } from './pubsub.js';


// --- Core Elements ---
const contentElement = document.getElementById('content');
const bodyElement = document.body;

// --- Scriptorium Management ---
let scriptoriumElement = null;

/**
 * Updates the Scriptorium state to open and resets its fields.
 * The ScriptoriumComponent will react to the state change.
 */
function showScriptorium() {
    if (!scriptoriumElement) {
        scriptoriumElement = ScriptoriumComponent();
        bodyElement.appendChild(scriptoriumElement);
    }
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
 * The ScriptoriumComponent will react.
 */
function hideScriptorium() {
    setScriptoriumState({ isOpen: false });
    console.log('App: Requested to hide Scriptorium (state updated)');
}

/**
 * Handles sending a message from the Scriptorium.
 */
async function handleSendMessage() {
    const scriptoriumState = getState('scriptorium');
    if (!scriptoriumElement) return;

    const sendButton = scriptoriumElement.querySelector('#scriptorium-send-button');

    if (!scriptoriumState.recipient || !scriptoriumState.recipient.id ||
        !scriptoriumState.subject?.trim() || !scriptoriumState.body?.trim()) {
        alert('Please select a recipient and fill in both subject and body.');
        return;
    }

    if (sendButton) sendButton.disabled = true;

    try {
        console.log('App: Attempting to send message:', scriptoriumState);
        const result = await api.sendMessage(
            scriptoriumState.recipient.id,
            scriptoriumState.subject,
            scriptoriumState.body
        );

        if (result.success) {
            alert('Message sent successfully!');
            hideScriptorium();
            // Optionally, navigate to outbox or refresh cabinet view
            publish('messageSent', { message: result.data });

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
 * Renders the appropriate component into the content area based on the route name and path.
 * @param {string} path - The current window.location.pathname.
 */
function renderRouteByPath(path) {
    if (!contentElement) {
        console.error("FATAL ERROR: #content element not found in renderRouteByPath!");
        return;
    }
    console.log(`App: Rendering route for path: ${path}`);
    let componentElement = null;
    const currentAppState = getState();

    // Normalize path for safety, though History API should provide it correctly
    const normalizedPath = path.startsWith('/') ? path : '/' + path;
    const pathSegments = normalizedPath.split('/').filter(Boolean); // e.g., ['', 'message', '123'] -> ['message', '123']
    let routeName = pathSegments[0] || (currentAppState.isLoggedIn ? 'home' : 'login');
    let routeParam = pathSegments[1] || null;


    if (normalizedPath === '/' || normalizedPath === '') {
        routeName = currentAppState.isLoggedIn ? 'home' : 'login';
        const targetPath = '/' + routeName;
        if (window.location.pathname !== targetPath) {
            history.replaceState({ path: targetPath }, '', targetPath);
        }
    }

    // Ensure user is logged in for routes that require it
    const protectedRoutes = ['home', 'cabinet', 'scriptorium', 'message'];
    if (protectedRoutes.includes(routeName) && !currentAppState.isLoggedIn) {
        console.warn(`App: Access to protected route ${normalizedPath} denied. Redirecting to /login.`);
        const loginPath = '/login';
        history.replaceState({ path: loginPath }, '', loginPath);
        routeName = 'login'; // Force rendering login page
        routeParam = null; // Clear any params
    }

    switch (routeName) {
        case 'login':
            if (currentAppState.isLoggedIn) {
                const homePath = '/home';
                history.replaceState({ path: homePath }, '', homePath);
                componentElement = HomePageComponent(currentAppState.currentUser);
            } else {
                componentElement = LoginPageComponent();
            }
            break;
        case 'register':
            if (currentAppState.isLoggedIn) {
                const homePath = '/home';
                history.replaceState({ path: homePath }, '', homePath);
                componentElement = HomePageComponent(currentAppState.currentUser);
            } else {
                componentElement = RegisterPageComponent();
            }
            break;
        case 'home':
            componentElement = HomePageComponent(currentAppState.currentUser);
            break;
        case 'cabinet':
            componentElement = CabinetComponent();
            break;
        case 'message': // New route for message detail
            if (routeParam) { // Expects an ID, e.g., /message/123
                componentElement = MessageDetailComponent(routeParam);
            } else {
                console.warn(`App: Missing message ID for /message route. Redirecting to /cabinet.`);
                const cabinetPath = '/cabinet';
                history.replaceState({ path: cabinetPath }, '', cabinetPath);
                componentElement = CabinetComponent(); // Or a specific error component
            }
            break;
        default:
            console.warn(`Unknown route: ${routeName} from path ${normalizedPath}. Rendering 404-like content.`);
            componentElement = document.createElement('div');
            componentElement.className = 'p-6';
            componentElement.innerHTML = `
                <h2 class="text-2xl font-semibold text-red-600 mb-4">404 - Page Not Found</h2>
                <p class="text-gray-700 dark:text-gray-300">Sorry, the page you requested (${normalizedPath}) does not exist.</p>
                <a href="/home" data-route="home" class="mt-4 inline-block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Return to Home</a>
            `;
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

    // Scriptorium specific actions
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
            const username = selectRecipientButton.textContent; // Or a data attribute for username
            setScriptoriumState({ recipient: { id: userId, username: username } });
            console.log(`App: Selected recipient set in state: ${username} (ID: ${userId})`);
            return;
        }
        if (target.closest('[data-action="send-message"]')) {
            event.preventDefault();
            handleSendMessage();
            return;
        }
    }

    // Generic navigation links (data-route)
    const targetLink = target.closest('a[data-route]');
    if (targetLink) {
        event.preventDefault();
        const path = targetLink.getAttribute('href');
        if (path !== window.location.pathname) {
            history.pushState({ path: path }, '', path);
        }
        renderRouteByPath(path);
        return;
    }

    // Specific button actions
    const logoutButton = target.closest('#logout-button');
    if (logoutButton) {
        event.preventDefault();
        handleLogout();
        return;
    }

    const showScriptoriumButton = target.closest('#show-scriptorium-button');
    if (showScriptoriumButton) {
        event.preventDefault();
        showScriptorium();
        return;
    }

    // Handle clicks on message items within CabinetComponent
    // This requires CabinetComponent to add a `data-action="view-message"` and `data-message-id`
    const messageItemLink = target.closest('[data-action="view-message"]');
    if (messageItemLink) {
        event.preventDefault();
        const messageId = messageItemLink.dataset.messageId;
        if (messageId) {
            const path = `/message/${messageId}`;
            console.log(`App: Navigating to message detail: ${path}`);
            history.pushState({ path: path }, '', path);
            renderRouteByPath(path);
        } else {
            console.warn('App: Clicked view-message action but messageId is missing.');
        }
        return;
    }
}

/**
 * Handles the logout process.
 */
async function handleLogout() {
    console.log("App: Logout initiated...");
    try {
        const result = await api.logoutUser();
        if (result.success) {
            setAuthState(false, null);
            setScriptoriumState({ isOpen: false, recipient: null, subject: '', body: '' });
            const loginPath = '/login';
            history.pushState({ path: loginPath }, '', loginPath);
            renderRouteByPath(loginPath);
        } else {
            throw new Error(result.message || 'Logout failed');
        }
    } catch (error) {
        console.error("App: Logout failed:", error);
        alert(`Logout failed: ${error.message}`);
    }
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
                setAuthState(true, result.user);
                nextPath = '/home';
            } else { throw new Error(result.message || 'Login failed'); }
        } else if (form.id === 'register-form') {
            result = await api.registerUser(data.username, data.email, data.password);
            if (result.success) {
                nextPath = '/login';
                alert("Registration successful! Please log in.");
            } else { throw new Error(result.message || 'Registration failed'); }
        }

        if (nextPath) {
            if (nextPath !== window.location.pathname) {
                history.pushState({ path: nextPath }, '', nextPath);
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
        // Fallback if state is null or path is missing (e.g. initial load or external navigation)
        path = window.location.pathname;
        // Ensure state object is consistent even if it was initially null
        history.replaceState({ path: path }, '', path);
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
        contentElement.addEventListener('submit', handleAuthFormSubmit); // For login/register forms
    } else {
        console.error("FATAL ERROR: #content element not found! Auth forms may not work.");
    }

    window.addEventListener('popstate', handlePopstate);

    // Subscribe to navigateToRoute events (e.g., from MessageDetailComponent's "Back" button)
    subscribe('navigateToRoute', (data) => {
        if (data && data.routeName) {
            const path = `/${data.routeName}`; // Assuming simple route names for now
            if (path !== window.location.pathname) {
                history.pushState({ path: path }, '', path);
            }
            renderRouteByPath(path);
        }
    });

    try {
        const authStatus = await api.checkAuthStatus();
        setAuthState(authStatus.isLoggedIn, authStatus.user || null);
    } catch (error) {
        console.error("App: Failed to fetch initial auth status:", error);
        setAuthState(false, null); // Assume logged out on error
    }

    // Ensure scriptorium state is initialized
    setScriptoriumState({ isOpen: false, recipient: null, subject: '', body: '' });

    // Initial route rendering based on current URL path
    const initialPath = window.location.pathname;
    history.replaceState({ path: initialPath }, '', initialPath); // Ensure initial state has path
    renderRouteByPath(initialPath);

    console.log("App: Initialization complete.");
}

// Wait for the DOM to be fully loaded before initializing the app
document.addEventListener('DOMContentLoaded', initializeApp);