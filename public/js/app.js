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
import { CabinetComponent } from './components/CabinetComponent.js'; // Import CabinetComponent

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
 * Renders the appropriate component into the content area based on the route name.
 * @param {string} routeName - The name of the route (e.g., 'login', 'home', 'cabinet').
 */
function renderRoute(routeName) {
    if (!contentElement) {
        console.error("FATAL ERROR: #content element not found in renderRoute!");
        return;
    }

    console.log(`App: Rendering route: ${routeName}`);
    let componentElement = null;
    const currentAppState = getState();

    if (routeName === '' || routeName === '/') {
        routeName = currentAppState.isLoggedIn ? 'home' : 'login';
        const normalizedPath = '/' + routeName;
        if (window.location.pathname !== normalizedPath) {
            history.replaceState({ route: routeName }, '', normalizedPath);
        }
    }

    // Ensure user is logged in for routes that require it
    const protectedRoutes = ['home', 'cabinet', 'scriptorium']; // Add other protected routes here
    if (protectedRoutes.includes(routeName) && !currentAppState.isLoggedIn) {
        console.warn(`App: Access to protected route /${routeName} denied. Redirecting to /login.`);
        history.replaceState({ route: 'login' }, '', '/login');
        routeName = 'login'; // Force rendering login page
    }


    switch (routeName) {
        case 'login':
            if (currentAppState.isLoggedIn) {
                history.replaceState({ route: 'home' }, '', '/home');
                componentElement = HomePageComponent(currentAppState.currentUser);
            } else {
                componentElement = LoginPageComponent();
            }
            break;
        case 'register':
            if (currentAppState.isLoggedIn) {
                history.replaceState({ route: 'home' }, '', '/home');
                componentElement = HomePageComponent(currentAppState.currentUser);
            } else {
                componentElement = RegisterPageComponent();
            }
            break;
        case 'home':
            // Already protected by the check above
            componentElement = HomePageComponent(currentAppState.currentUser);
            break;
        case 'cabinet': // <<< --- NEW ROUTE CASE
            // Already protected by the check above
            componentElement = CabinetComponent();
            break;
        default:
            console.warn(`Unknown route: ${routeName}. Rendering 404 like content.`);
            componentElement = document.createElement('div');
            componentElement.innerHTML = '<h2 class="text-xl font-semibold mb-4">404 - Page Not Found</h2><p>Sorry, the page you requested does not exist.</p>';
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

    const targetLink = target.closest('a[data-route]');
    const logoutButton = target.closest('#logout-button');
    const showScriptoriumButton = target.closest('#show-scriptorium-button');

    if (targetLink) {
        event.preventDefault();
        const route = targetLink.getAttribute('data-route');
        const path = targetLink.getAttribute('href');
        if (path !== window.location.pathname) {
            history.pushState({ route: route }, '', path);
        }
        renderRoute(route); // Render the view for the target route
    } else if (logoutButton) {
        event.preventDefault();
        handleLogout();
    } else if (showScriptoriumButton) {
        event.preventDefault();
        showScriptorium();
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
            const route = 'login';
            const path = '/login';
            history.pushState({ route: route }, '', path);
            renderRoute(route);
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
        let nextRoute = null;
        let nextPath = null;

        if (form.id === 'login-form') {
            result = await api.loginUser(data.email, data.password);
            if (result.success) {
                setAuthState(true, result.user);
                nextRoute = 'home';
                nextPath = '/home';
            } else { throw new Error(result.message || 'Login failed'); }
        } else if (form.id === 'register-form') {
            result = await api.registerUser(data.username, data.email, data.password);
            if (result.success) {
                nextRoute = 'login';
                nextPath = '/login';
                alert("Registration successful! Please log in.");
            } else { throw new Error(result.message || 'Registration failed'); }
        }

        if (nextRoute && nextPath) {
            if (nextPath !== window.location.pathname) {
                history.pushState({ route: nextRoute }, '', nextPath);
            }
            renderRoute(nextRoute);
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
 * Handles browser back/forward navigation.
 * @param {Event} event - The popstate event.
 */
function handlePopstate(event) {
    console.log('App: Popstate event fired:', event.state);
    let route;
    if (event.state && event.state.route) {
        route = event.state.route;
    } else {
        const path = window.location.pathname;
        const currentAppState = getState();
        route = path.substring(1) || (currentAppState.isLoggedIn ? 'home' : 'login');
        history.replaceState({ route: route }, '', path);
    }
    renderRoute(route);
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

    try {
        const authStatus = await api.checkAuthStatus();
        setAuthState(authStatus.isLoggedIn, authStatus.user || null);
    } catch (error) {
        console.error("App: Failed to fetch initial auth status:", error);
        setAuthState(false, null);
    }

    setScriptoriumState({ isOpen: false, recipient: null, subject: '', body: '' });

    const initialPath = window.location.pathname;
    const initialRoute = initialPath.substring(1) || (getState('isLoggedIn') ? 'home' : 'login');
    renderRoute(initialRoute);

    console.log("App: Initialization complete.");
}

document.addEventListener('DOMContentLoaded', initializeApp);