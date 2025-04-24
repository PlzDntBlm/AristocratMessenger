/**
 * public/js/app.js
 * Main application entry point. Initializes the app, handles routing (basic),
 * wires up modules (state, api, components).
 */
import * as api from './api.js';
import { getState, setAuthState } from './state.js';
// Import generic UI updaters
import { renderNavbar, renderContent } from './ui.js';
// Import component functions
import { NavbarComponent } from './components/Navbar.js'; // We render Navbar separately now
import { LoginPageComponent } from './components/LoginPage.js';
import { RegisterPageComponent } from './components/RegisterPage.js';
import { HomePageComponent } from './components/HomePage.js';

// --- Event Handlers ---

function handleNavClick(event) {
    const targetLink = event.target.closest('a[data-route]');
    const logoutButton = event.target.closest('#logout-button');

    if (targetLink) {
        event.preventDefault();
        const route = targetLink.getAttribute('data-route');
        console.log(`Routing to: ${route}`);
        renderRoute(route); // Use a dedicated function to render based on route
    } else if (logoutButton) {
        event.preventDefault();
        handleLogout();
    }
}

async function handleLogout() {
    console.log("Logout initiated...");
    try {
        const result = await api.logoutUser();
        console.log('Logout API result:', result);
        if (result.success) {
            setAuthState(false, null);
            renderNavbar(); // Re-render navbar (using function from ui.js)
            renderRoute('login'); // Render the login page after logout
        } else {
            throw new Error(result.message || 'Logout failed');
        }
    } catch (error) {
        console.error("Logout failed:", error);
        alert("Logout failed. Please try again.");
    }
}

async function handleAuthFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    // ... (get form data) ...
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const messageElement = form.querySelector('#login-message') || form.querySelector('#register-message');
    if (messageElement) messageElement.textContent = '';

    try {
        let result;
        if (form.id === 'login-form') {
            result = await api.loginUser(data.email, data.password);
            if (result.success) {
                setAuthState(true, result.user);
                renderNavbar(); // Re-render navbar
                renderRoute('home'); // Render home page
            } else { throw new Error(result.message || 'Login failed'); }
        } else if (form.id === 'register-form') {
            result = await api.registerUser(data.username, data.email, data.password);
            if (result.success) {
                console.log('Registration successful');
                renderRoute('login'); // Render login page
                // Optional: Show success message on login page after redirect
                // We might need a way to pass temporary messages between route changes
            } else { throw new Error(result.message || 'Registration failed'); }
        }
    } catch (error) {
        // ... (error handling - update messageElement) ...
        console.error(`Form ${form.id} submission error:`, error);
        if (messageElement) {
            messageElement.textContent = error.message || 'An error occurred.';
            messageElement.className = 'mt-4 text-sm text-red-600';
        }
    }
}

/**
 * Renders the appropriate component into the content area based on the route name.
 * @param {string} routeName - The name of the route (e.g., 'login', 'home').
 */
function renderRoute(routeName) {
    console.log(`Rendering route: ${routeName}`);
    let componentElement = null;
    const state = getState();

    switch (routeName) {
        case 'login':
            if(state.isLoggedIn) { // Redirect logged-in users from login
                routeName = 'home';
                window.location.hash = 'home';
                componentElement = HomePageComponent(state.currentUser);
            } else {
                componentElement = LoginPageComponent();
            }
            break;
        case 'register':
            if(state.isLoggedIn) { // Redirect logged-in users from register
                routeName = 'home';
                window.location.hash = 'home';
                componentElement = HomePageComponent(state.currentUser);
            } else {
                componentElement = RegisterPageComponent();
            }
            break;
        case 'home':
            if (state.isLoggedIn) {
                componentElement = HomePageComponent(state.currentUser);
            } else {
                console.warn("Attempted to render #home while logged out.");
                routeName = 'login';
                window.location.hash = 'login';
                componentElement = LoginPageComponent(); // Render login instead
            }
            break;
        // TODO: Add cases for other routes ('scriptorium', 'cabinet', etc.)
        default:
            console.warn(`Unknown route: ${routeName}`);
            // Render a 404 component or redirect to a default
            componentElement = document.createElement('p');
            componentElement.textContent = 'Page not found.';
        // Update hash to reflect reality or clear it
        // window.location.hash = 'not-found';
    }

    if (componentElement) {
        renderContent(componentElement); // Render the returned element
    }
    // Update hash only if it wasn't already updated by redirection logic
    if (window.location.hash !== `#${routeName}`) {
        window.location.hash = routeName;
    }
}


// --- Initialization ---
async function initializeApp() {
    console.log('Initializing App...');

    // Setup initial event listeners
    const header = document.querySelector('header');
    if (header) {
        header.addEventListener('click', handleNavClick); // Handles nav links and logout button
    }
    const contentElement = document.getElementById('content');
    if (contentElement) {
        // Handles clicks on links WITHIN rendered components (like login <-> register links)
        contentElement.addEventListener('click', handleNavClick);
        // Handles form submissions WITHIN rendered components
        contentElement.addEventListener('submit', (event) => {
            if (event.target.tagName === 'FORM' && (event.target.id === 'login-form' || event.target.id === 'register-form')) {
                handleAuthFormSubmit(event);
            }
        });
    } else {
        console.error("FATAL ERROR: #content element not found! Cannot initialize app.");
        return;
    }

    // Check initial authentication status
    try {
        console.log("Checking auth status via API...");
        const authStatus = await api.checkAuthStatus();
        console.log("Received auth status:", authStatus);
        setAuthState(authStatus.isLoggedIn, authStatus.user || null);
    } catch (error) {
        console.error("Failed to fetch initial auth status:", error);
        setAuthState(false, null);
    }

    // Initial UI render
    renderNavbar(); // Initial navbar render based on fetched state

    // Initial route rendering based on hash and state
    const initialRoute = window.location.hash.substring(1) || (getState().isLoggedIn ? 'home' : 'login');
    renderRoute(initialRoute); // Use the new function to render the initial route

    // TODO: Setup History API listener (popstate) for back/forward navigation
}

// Start the app
document.addEventListener('DOMContentLoaded', initializeApp);