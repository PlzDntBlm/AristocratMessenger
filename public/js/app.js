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

// --- Core Elements ---
const contentElement = document.getElementById('content');
const bodyElement = document.body;

// --- Scriptorium Management ---
let scriptoriumElement = null;

function showScriptorium() {
    if (!scriptoriumElement) {
        scriptoriumElement = ScriptoriumComponent();
        bodyElement.appendChild(scriptoriumElement);
    }
    // Update central state to open Scriptorium and reset its fields
    setScriptoriumState({
        isOpen: true,
        recipient: null,
        subject: '',
        body: ''
    });
    // ScriptoriumComponent's subscription to 'scriptoriumStateChanged'
    // will handle removing 'hidden' and can also trigger loadContacts.
    console.log('App: Requested to show Scriptorium (state updated)');
}

function hideScriptorium() {
    setScriptoriumState({ isOpen: false });
    console.log('App: Requested to hide Scriptorium (state updated)');
}

// --- Route Rendering Logic ---
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
            if (!currentAppState.isLoggedIn) {
                history.replaceState({ route: 'login' }, '', '/login');
                componentElement = LoginPageComponent();
            } else {
                componentElement = HomePageComponent(currentAppState.currentUser);
            }
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
function handleGlobalClick(event) {
    const target = event.target;

    const currentScriptoriumState = getState('scriptorium'); // Get current Scriptorium state

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
            console.log('App: Send message button clicked - logic TODO');
            // Call a function like handleSendMessage()
            // const { recipient, subject, body } = getState('scriptorium');
            // if (recipient && subject && body) {
            //   api.sendMessage(recipient.id, subject, body).then...
            // }
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
        renderRoute(route);
    } else if (logoutButton) {
        event.preventDefault();
        handleLogout();
    } else if (showScriptoriumButton) {
        event.preventDefault();
        showScriptorium();
    }
}

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