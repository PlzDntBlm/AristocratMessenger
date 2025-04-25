/**
 * public/js/app.js
 * Main application entry point. Initializes the app, handles routing,
 * manages interaction between state, api, and component rendering.
 * Uses PubSub for reacting to state changes (e.g., Navbar updates).
 */
import * as api from './api.js';
import { getState, setAuthState } from './state.js';
// Import generic UI updaters from ui.js
import { renderContent, renderNavbar } from './ui.js'; // renderNavbar is still needed for initial subscription setup? Check ui.js
// Import component functions
import { LoginPageComponent } from './components/LoginPage.js';
import { RegisterPageComponent } from './components/RegisterPage.js';
import { HomePageComponent } from './components/HomePage.js';
// Import PubSub (optional here, mostly used by state.js and ui.js)
// import { subscribe } from './pubsub.js';

// --- Core Elements ---
const headerElement = document.querySelector('header');
const contentElement = document.getElementById('content');

// --- Route Rendering Logic ---
/**
 * Renders the appropriate component into the content area based on the route name.
 * @param {string} routeName - The name of the route (e.g., 'login', 'home').
 */
function renderRoute(routeName) {
    if (!contentElement) return; // Guard clause

    console.log(`App: Rendering route: ${routeName}`);
    let componentElement = null;
    const state = getState(); // Get current state for routing decisions

    // Normalize root path or empty route
    if(routeName === '' || routeName === '/') {
        routeName = state.isLoggedIn ? 'home' : 'login';
        // Update history correctly for the normalized route
        const normalizedPath = '/' + routeName;
        if (window.location.pathname !== normalizedPath) {
            console.log(`App: Normalizing path to ${normalizedPath}`);
            history.replaceState({ route: routeName }, '', normalizedPath);
        }
    }

    // Select and call the appropriate component function
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
        // TODO: Add cases for other routes ('scriptorium', 'cabinet', etc.)
        // case 'scriptorium': componentElement = ScriptoriumComponent(); break;
        default:
            console.warn(`Unknown route: ${routeName}. Rendering 404.`);
            componentElement = document.createElement('div');
            componentElement.innerHTML = '<h2 class="text-xl font-semibold mb-4">404 - Page Not Found</h2><p>Sorry, the page you requested does not exist.</p>';
        // Optional: Update history state for the 404?
        // history.replaceState({ route: '404' }, '', '/' + routeName);
    }

    // Render the component's element into the content area
    if (componentElement) {
        renderContent(componentElement);
    }
}

// --- Event Handlers ---

/**
 * Handles clicks delegated from header or content area.
 * Primarily deals with navigation links and logout button.
 */
function handleNavClick(event) {
    const targetLink = event.target.closest('a[data-route]');
    const logoutButton = event.target.closest('#logout-button');

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
    }
}

/**
 * Handles the logout process.
 */
async function handleLogout() {
    console.log("App: Logout initiated...");
    try {
        const result = await api.logoutUser();
        console.log('Logout API result:', result);
        if (result.success) {
            setAuthState(false, null);      // Update state -> PubSub triggers renderNavbar
            // renderNavbar(); // No longer needed here
            const route = 'login';
            const path = '/login';
            history.pushState({ route: route }, '', path);
            renderRoute(route);             // Render login page
        } else {
            throw new Error(result.message || 'Logout failed');
        }
    } catch (error) {
        console.error("App: Logout failed:", error);
        alert(`Logout failed: ${error.message}`);
    }
}

/**
 * Handles login and register form submissions delegated from the content area.
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
            console.log('App: Submitting login via API:', data);
            result = await api.loginUser(data.email, data.password);
            if (result.success) {
                setAuthState(true, result.user); // Update state -> PubSub triggers renderNavbar
                // renderNavbar(); // No longer needed here
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

/**
 * Handles browser back/forward navigation.
 */
function handlePopstate(event) {
    console.log('App: Popstate event fired:', event.state);
    let route;
    if (event.state && event.state.route) {
        route = event.state.route;
    } else {
        const path = window.location.pathname;
        // Determine route from path, considering potential initial state
        const currentState = getState(); // Check state AFTER potential auth change
        route = path.substring(1) || (currentState.isLoggedIn ? 'home' : 'login');
        console.log(`Popstate: No state found, determined route from path ${path} -> ${route}`);
        // Ensure history state reflects the determined route if it wasn't set
        history.replaceState({ route: route }, '', path);
    }
    renderRoute(route); // Render the view for the history state
    // renderNavbar(); // No longer needed - PubSub handles navbar based on state changes
}

// --- Initialization ---
/**
 * Initializes the entire application.
 */
async function initializeApp() {
    console.log('App: Initializing...');

    // Setup global event listeners using delegation
    if (headerElement) {
        headerElement.addEventListener('click', handleNavClick);
    } else { console.warn("Header element not found during init!"); }

    if (contentElement) {
        contentElement.addEventListener('click', handleNavClick);
        contentElement.addEventListener('submit', handleAuthFormSubmit);
    } else { console.error("FATAL ERROR: #content element not found! Cannot initialize app."); return; }

    window.addEventListener('popstate', handlePopstate);

    // Ensure Navbar subscription is set up (handled by ui.js import)
    // renderNavbar(); // Remove this initial call - it's handled by the subscription in ui.js

    // Check initial authentication status from server
    try {
        console.log("App: Checking initial auth status via API...");
        const authStatus = await api.checkAuthStatus();
        console.log("App: Received initial auth status:", authStatus);
        // Setting state will trigger the 'authStateChanged' event,
        // and the subscribed renderNavbar function in ui.js will run.
        setAuthState(authStatus.isLoggedIn, authStatus.user || null);
    } catch (error) {
        console.error("App: Failed to fetch initial auth status:", error);
        setAuthState(false, null); // Assume logged out, triggers PubSub
    }

    // Initial route rendering based on current path (happens *after* auth state is set)
    const initialPath = window.location.pathname;
    const initialRoute = initialPath.substring(1); // Get route name from path
    renderRoute(initialRoute); // Render initial view based on path and now-set auth state

    console.log("App: Initialization complete.");
}

// Start the app
document.addEventListener('DOMContentLoaded', initializeApp);