/**
 * public/js/app.js
 * Main application entry point. Initializes the app, handles routing,
 * manages interaction between state, api, and component rendering.
 * Uses PubSub for reacting to state changes (e.g., Navbar updates).
 */
import * as api from './api.js';
import { getState, setAuthState } from './state.js';
import { renderContent, renderNavbar } from './ui.js';
import { LoginPageComponent } from './components/LoginPage.js';
import { RegisterPageComponent } from './components/RegisterPage.js';
import { HomePageComponent } from './components/HomePage.js';
import { ScriptoriumComponent } from './components/ScriptoriumComponent.js'; // Import Scriptorium

// --- Core Elements ---
const headerElement = document.querySelector('header');
const contentElement = document.getElementById('content');
const bodyElement = document.body; // For appending overlay

// --- Scriptorium Management ---
let scriptoriumElement = null; // Hold a reference to the Scriptorium DOM element

function showScriptorium() {
    if (!scriptoriumElement) {
        scriptoriumElement = ScriptoriumComponent();
        bodyElement.appendChild(scriptoriumElement); // Append to body to ensure it's on top
    }
    scriptoriumElement.classList.remove('hidden');
    console.log('App: Showing Scriptorium');
    // TODO: Focus management (e.g., first input field)
}

function hideScriptorium() {
    if (scriptoriumElement) {
        scriptoriumElement.classList.add('hidden');
        console.log('App: Hiding Scriptorium');
        // Optional: Remove from DOM if not needed frequently, or keep for performance
        // scriptoriumElement.remove();
        // scriptoriumElement = null;
    }
}

// --- Route Rendering Logic ---
// ... (renderRoute function remains the same)
function renderRoute(routeName) {
    if (!contentElement) return;

    console.log(`App: Rendering route: ${routeName}`);
    let componentElement = null;
    const state = getState();

    if(routeName === '' || routeName === '/') {
        routeName = state.isLoggedIn ? 'home' : 'login';
        const normalizedPath = '/' + routeName;
        if (window.location.pathname !== normalizedPath) {
            console.log(`App: Normalizing path to ${normalizedPath}`);
            history.replaceState({ route: routeName }, '', normalizedPath);
        }
    }

    switch (routeName) {
        case 'login':
            if (state.isLoggedIn) {
                console.log("Redirecting logged-in user from /login to /home");
                history.replaceState({ route: 'home' }, '', '/home');
                componentElement = HomePageComponent(state.currentUser);
            } else {
                componentElement = LoginPageComponent();
            }
            break;
        case 'register':
            if (state.isLoggedIn) {
                console.log("Redirecting logged-in user from /register to /home");
                history.replaceState({ route: 'home' }, '', '/home');
                componentElement = HomePageComponent(state.currentUser);
            } else {
                componentElement = RegisterPageComponent();
            }
            break;
        case 'home':
            if (!state.isLoggedIn) {
                console.warn("Redirecting logged-out user from /home to /login.");
                history.replaceState({ route: 'login' }, '', '/login');
                componentElement = LoginPageComponent();
            } else {
                componentElement = HomePageComponent(state.currentUser);
            }
            break;
        default:
            console.warn(`Unknown route: ${routeName}. Rendering 404.`);
            componentElement = document.createElement('div');
            componentElement.innerHTML = '<h2 class="text-xl font-semibold mb-4">404 - Page Not Found</h2><p>Sorry, the page you requested does not exist.</p>';
    }

    if (componentElement) {
        renderContent(componentElement);
    }
}


// --- Event Handlers ---
function handleGlobalClick(event) {
    const targetLink = event.target.closest('a[data-route]');
    const logoutButton = event.target.closest('#logout-button');
    const showScriptoriumButton = event.target.closest('#show-scriptorium-button');
    const closeScriptoriumButton = event.target.closest('[data-action="close-scriptorium"]'); // Target close button

    if (targetLink) {
        event.preventDefault();
        const route = targetLink.getAttribute('data-route');
        const path = targetLink.getAttribute('href');

        if (path !== window.location.pathname) {
            console.log(`App: Navigating to route: ${route}, path: ${path}`);
            history.pushState({ route: route }, '', path);
        } else {
            console.log(`App: Already on route ${route}. (Re-rendering anyway)`);
        }
        renderRoute(route);
    } else if (logoutButton) {
        event.preventDefault();
        handleLogout();
    } else if (showScriptoriumButton) {
        event.preventDefault();
        showScriptorium();
    } else if (closeScriptoriumButton && scriptoriumElement && !scriptoriumElement.classList.contains('hidden')) {
        // Ensure scriptoriumElement exists and is visible before trying to hide
        event.preventDefault();
        hideScriptorium();
    }
    // TODO: Add delegation for Scriptorium form submit button later
}

// ... (handleLogout, handleAuthFormSubmit, handlePopstate remain the same)
async function handleLogout() {
    console.log("App: Logout initiated...");
    try {
        const result = await api.logoutUser();
        console.log('Logout API result:', result);
        if (result.success) {
            setAuthState(false, null);
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
            console.log('App: Submitting login via API:', data);
            result = await api.loginUser(data.email, data.password);
            if (result.success) {
                setAuthState(true, result.user);
                nextRoute = 'home';
                nextPath = '/home';
            } else { throw new Error(result.message || 'Login failed'); }

        } else if (form.id === 'register-form') {
            console.log('App: Submitting registration via API:', data);
            result = await api.registerUser(data.username, data.email, data.password);
            if (result.success) {
                console.log('Registration successful');
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
        const currentState = getState();
        route = path.substring(1) || (currentState.isLoggedIn ? 'home' : 'login');
        console.log(`Popstate: No state found, determined route from path ${path} -> ${route}`);
        history.replaceState({ route: route }, '', path);
    }
    renderRoute(route);
}


// --- Initialization ---
async function initializeApp() {
    console.log('App: Initializing...');

    // Use a single global event listener on the body for clicks
    bodyElement.addEventListener('click', handleGlobalClick);

    // Form submissions can be delegated from #content if all forms are within it.
    // If Scriptorium forms are outside #content, need to adjust or add listener to body too.
    // For now, assuming auth forms are in #content.
    if (contentElement) {
        contentElement.addEventListener('submit', handleAuthFormSubmit);
    } else {
        console.error("FATAL ERROR: #content element not found! Auth forms may not work.");
    }
    // TODO: Add a delegated submit handler for Scriptorium form once it's built.

    window.addEventListener('popstate', handlePopstate);

    try {
        console.log("App: Checking initial auth status via API...");
        const authStatus = await api.checkAuthStatus();
        console.log("App: Received initial auth status:", authStatus);
        setAuthState(authStatus.isLoggedIn, authStatus.user || null);
    } catch (error) {
        console.error("App: Failed to fetch initial auth status:", error);
        setAuthState(false, null);
    }

    const initialPath = window.location.pathname;
    const initialRoute = initialPath.substring(1);
    renderRoute(initialRoute);

    console.log("App: Initialization complete.");
}

document.addEventListener('DOMContentLoaded', initializeApp);