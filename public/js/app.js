/**
 * public/js/app.js
 * Main application entry point. Initializes the app, handles routing,
 * manages interaction between state, api, and component rendering.
 */
import * as api from './api.js';
import { getState, setAuthState } from './state.js';
// Import generic UI updaters from ui.js
import { renderNavbar, renderContent } from './ui.js';
// Import component functions
import { LoginPageComponent } from './components/LoginPage.js';
import { RegisterPageComponent } from './components/RegisterPage.js';
import { HomePageComponent } from './components/HomePage.js';
// NavbarComponent is used directly by renderNavbar in ui.js now

// --- Core Elements ---
// We select these here or pass selectors to handlers if needed
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
    const state = getState();

    // Normalize root path or empty route
    if(routeName === '' || routeName === '/') {
        routeName = state.isLoggedIn ? 'home' : 'login';
    }

    // Select and call the appropriate component function
    switch (routeName) {
        case 'login':
            // Redirect logged-in users trying to access login
            if (state.isLoggedIn) {
                console.log("Redirecting logged-in user from /login to /home");
                history.replaceState({ route: 'home' }, '', '/home'); // Use replaceState to avoid polluting history
                componentElement = HomePageComponent(state.currentUser);
            } else {
                componentElement = LoginPageComponent();
            }
            break;
        case 'register':
            // Redirect logged-in users trying to access register
            if (state.isLoggedIn) {
                console.log("Redirecting logged-in user from /register to /home");
                history.replaceState({ route: 'home' }, '', '/home');
                componentElement = HomePageComponent(state.currentUser);
            } else {
                componentElement = RegisterPageComponent();
            }
            break;
        case 'home':
            // Redirect logged-out users trying to access home
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

        // Only push state if the path is different from the current one
        if (path !== window.location.pathname) {
            console.log(`App: Navigating to route: ${route}, path: ${path}`);
            history.pushState({ route: route }, '', path); // Use pushState for navigation
        } else {
            console.log(`App: Already on route ${route}. Triggering render.`); // Handle clicking current route link
        }
        renderRoute(route); // Render the view for the target route

    } else if (logoutButton) {
        event.preventDefault();
        handleLogout(); // Delegate to logout handler
    }
}

/**
 * Handles the logout process.
 */
async function handleLogout() {
    console.log("App: Logout initiated...");
    try {
        const result = await api.logoutUser(); // Call API
        console.log('Logout API result:', result);
        if (result.success) {
            setAuthState(false, null);      // Update state
            renderNavbar();                 // Update navbar
            const route = 'login';
            const path = '/login';
            history.pushState({ route: route }, '', path); // Set URL
            renderRoute(route);             // Render login page
        } else {
            throw new Error(result.message || 'Logout failed');
        }
    } catch (error) {
        console.error("App: Logout failed:", error);
        alert(`Logout failed: ${error.message}`); // Basic error feedback
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
    if (submitButton) submitButton.disabled = true; // Disable button on submit

    try {
        let result;
        let nextRoute = null;
        let nextPath = null;

        if (form.id === 'login-form') {
            console.log('App: Submitting login via API:', data);
            result = await api.loginUser(data.email, data.password);
            if (result.success) {
                setAuthState(true, result.user);
                renderNavbar(); // Update navbar
                nextRoute = 'home';
                nextPath = '/home';
            } else { throw new Error(result.message || 'Login failed'); }

        } else if (form.id === 'register-form') {
            console.log('App: Submitting registration via API:', data);
            result = await api.registerUser(data.username, data.email, data.password);
            if (result.success) {
                console.log('Registration successful');
                // Decide what to do: Show message on register page? Or redirect immediately?
                // Let's redirect to login
                nextRoute = 'login';
                nextPath = '/login';
                // Optional: Display temporary success message before navigating?
                alert("Registration successful! Please log in."); // Simple alert for now
            } else { throw new Error(result.message || 'Registration failed'); }
        }

        // Navigate after successful action
        if (nextRoute && nextPath) {
            if (nextPath !== window.location.pathname) {
                history.pushState({ route: nextRoute }, '', nextPath);
            }
            renderRoute(nextRoute); // Render the next view
        }

    } catch (error) {
        console.error(`App: Form ${form.id} submission error:`, error);
        if (messageElement) {
            messageElement.textContent = error.message || 'An error occurred.';
            messageElement.className = 'mt-4 text-sm text-red-600';
        }
    } finally {
        if (submitButton) submitButton.disabled = false; // Re-enable button
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
        // Fallback if state is missing (should ideally not happen with pushState)
        const path = window.location.pathname;
        route = path.substring(1) || (getState().isLoggedIn ? 'home' : 'login');
        console.log(`Popstate: No state found, determined route from path ${path} -> ${route}`);
    }
    renderRoute(route); // Render the view for the history state
    renderNavbar();     // Re-render navbar as state might implicitly change
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
    } else {
        console.warn("Header element not found during init!");
    }
    if (contentElement) {
        contentElement.addEventListener('click', handleNavClick); // Catch clicks inside content too
        contentElement.addEventListener('submit', handleAuthFormSubmit); // Catch form submits
    } else {
        console.error("FATAL ERROR: #content element not found! Cannot initialize app.");
        return;
    }

    // Add Popstate listener for browser navigation
    window.addEventListener('popstate', handlePopstate);

    // Check initial authentication status from server
    try {
        console.log("App: Checking initial auth status via API...");
        const authStatus = await api.checkAuthStatus();
        console.log("App: Received initial auth status:", authStatus);
        setAuthState(authStatus.isLoggedIn, authStatus.user || null);
    } catch (error) {
        console.error("App: Failed to fetch initial auth status:", error);
        setAuthState(false, null); // Assume logged out on error
    }

    // Initial UI render
    renderNavbar(); // Initial navbar render based on fetched state

    // Initial route rendering based on current path
    const initialPath = window.location.pathname;
    const initialRoute = initialPath.substring(1);
    renderRoute(initialRoute); // Render initial view based on path/auth state

    console.log("App: Initialization complete.");
}

// Start the app
document.addEventListener('DOMContentLoaded', initializeApp);