/**
 * public/js/app.js
 * Main application entry point. Initializes the app, handles routing (basic),
 * wires up modules (state, api, ui).
 */
import * as api from './api.js'; // Import API functions
import { getState, setAuthState } from './state.js'; // Import state functions
import { renderNavbar, renderContent, renderLoginPage, renderRegisterPage, renderHomePage } from './ui.js';

// --- Global Elements / Initial Setup ---
// TODO: Consider moving DOM element selections to ui.js if preferred


// --- Event Handlers ---

function handleNavClick(event) {
    const targetLink = event.target.closest('a[data-route]');
    const logoutButton = event.target.closest('#logout-button');

    if (targetLink) {
        event.preventDefault();
        let route = targetLink.getAttribute('data-route');
        console.log(`Routing to: ${route}`);

        // --- Call specific rendering function based on route ---
        switch (route) {
            case 'login':
                renderLoginPage();
                break;
            case 'register':
                renderRegisterPage();
                break;
            case 'home':
                // Check if user is logged in before rendering home
                if (getState().isLoggedIn) {
                    renderHomePage(getState().currentUser); // Call the new function
                } else {
                    console.warn("Attempted to navigate to #home while logged out.");
                    renderLoginPage(); // Redirect to login if not logged in
                    route = 'login'; // Update route for hash update
                }
                break;
            // TODO: Add cases for other routes (scriptorium, cabinet, etc.)
            default:
                console.warn(`Unknown route: ${route}`);
                renderContent('<p>Page not found.</p>');
        }
        // Update the URL hash (simple routing)
        window.location.hash = route;
        // TODO: Use History API for cleaner URLs later

    } else if (logoutButton) {
        event.preventDefault();
        handleLogout();
    }
}

async function handleLogout() {
    console.log("Logout initiated...");
    // TODO: Add visual feedback (e.g., disable button)
    try {
        // --- Call the actual API function ---
        const result = await api.logoutUser();
        console.log('Logout API result:', result);

        if (result.success) {
            setAuthState(false, null); // Update client state
            renderNavbar(getState()); // Re-render navbar immediately
            // TODO: Render login page component instead of placeholder
            renderContent('<p>Logout successful. Login page TBD.</p>');
            window.location.hash = 'login'; // Update hash
        } else {
            throw new Error(result.message || 'Logout failed');
        }
    } catch (error) {
        console.error("Logout failed:", error);
        // TODO: Show error message in UI
        alert("Logout failed. Please try again."); // Simple alert for now
    } finally {
        // TODO: Remove visual feedback
    }
}

async function handleAuthFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries()); // Convert FormData to plain object
    const messageElement = form.querySelector('#login-message') || form.querySelector('#register-message');

    // Clear previous messages and potentially disable button (TODO)
    if (messageElement) messageElement.textContent = '';

    try {
        let result; // Variable to store the API response

        if (form.id === 'login-form') {
            console.log('Submitting login via API:', data);
            // --- Call the actual API function ---
            result = await api.loginUser(data.email, data.password);
            console.log('Login API result:', result);

            if (result.success) {
                setAuthState(true, result.user); // Update client state with user data from response
                renderNavbar(getState());       // Update navbar
                renderHomePage(result.user); // Use user data from API response
                window.location.hash = 'home'; // Navigate to home view
            } else {
                // Error handled by the catch block as api functions throw on non-ok response
                // This else is technically not needed if api functions always throw, but kept for clarity
                throw new Error(result.message || 'Login failed');
            }

        } else if (form.id === 'register-form') {
            console.log('Submitting registration via API:', data);
            // --- Call the actual API function ---
            result = await api.registerUser(data.username, data.email, data.password);
            console.log('Register API result:', result);

            if (result.success) {
                console.log('Registration successful');
                // TODO: Render login page component after registration instead of placeholder
                renderContent(`<p>Registration successful! Please login. Login page TBD.</p>`);
                window.location.hash = 'login'; // Navigate to login view
                // Optional: Display success message temporarily before redirecting/rendering login
                // if(messageElement) messageElement.textContent = result.message; // Show server success message?
            } else {
                throw new Error(result.message || 'Registration failed');
            }
        }
        // TODO: Re-enable button

    } catch (error) {
        console.error(`Form ${form.id} submission error:`, error);
        if (messageElement) {
            messageElement.textContent = error.message || 'An error occurred.';
            messageElement.className = 'mt-4 text-sm text-red-600';
        }
        // TODO: Re-enable button
    }
}


// --- Initialization ---
async function initializeApp() {
    console.log('Initializing App...');

    // Setup initial event listeners using delegation
    const header = document.querySelector('header');
    if(header) {
        header.addEventListener('click', handleNavClick); // Handles nav links and logout button
    }
    const contentElement = document.getElementById('content');
    if(contentElement) {
        // --- Add this click listener for links inside #content ---
        contentElement.addEventListener('click', handleNavClick); // Handles clicks on links within dynamic content

        // Existing listener for form submissions inside #content
        contentElement.addEventListener('submit', (event) => {
            // Only handle auth forms for now
            if (event.target.tagName === 'FORM' && (event.target.id === 'login-form' || event.target.id === 'register-form')) {
                handleAuthFormSubmit(event);
            }
        });
        // Add other listeners as needed (e.g., clicks within content for non-nav actions)
    }

    // Check initial authentication status
    try {
        console.log("Checking auth status via API...");
        const authStatus = await api.checkAuthStatus(); // Call the function from api.js
        console.log("Received auth status:", authStatus);
        setAuthState(authStatus.isLoggedIn, authStatus.user || null); // Update state
    } catch (error) {
        console.error("Failed to fetch initial auth status:", error);
        setAuthState(false, null); // Assume logged out on error
        // TODO: Maybe display an error message to the user in the UI?
    }

    // Initial UI render based on state
    renderNavbar(getState()); // Render navbar based on fetched state

    // Determine initial route from hash or auth state
    let initialRoute = window.location.hash.substring(1); // Get route from hash (e.g., 'login')
    console.log(`Initial Route from hash: '${initialRoute}'`);

    if (getState().isLoggedIn) {
        // If logged in, default to 'home' if no specific hash or if hash is login/register
        if (!initialRoute || initialRoute === 'login' || initialRoute === 'register') {
            initialRoute = 'home';
            // Ensure the hash reflects the actual view
            if (window.location.hash !== `#${initialRoute}`) {
                window.location.hash = initialRoute;
            }
        }
        // Render based on initial route for logged-in users
        switch(initialRoute) {
            case 'home':
                // TODO: Implement renderHomePage()
                renderHomePage(getState().currentUser);
                break;
            // TODO: Add cases for other logged-in routes
            default:
                console.warn(`Unhandled logged-in route: ${initialRoute}`);
                // Fallback to home page TBD
                renderHomePage(getState().currentUser);
                if (window.location.hash !== '#home') window.location.hash = 'home';
        }

    } else {
        // Logged out - default to 'login' if no hash or irrelevant hash (like #home)
        if (!initialRoute || initialRoute === 'home' ) {
            initialRoute = 'login';
            if (window.location.hash !== `#${initialRoute}`) {
                window.location.hash = initialRoute;
            }
        }

        // Render based on initial route for logged-out users
        switch(initialRoute) {
            case 'login':
                renderLoginPage();
                break;
            case 'register':
                renderRegisterPage();
                break;
            default:
                console.warn(`Unknown initial route for logged-out user: ${initialRoute}`);
                renderLoginPage(); // Default to login
                if (window.location.hash !== '#login') window.location.hash = 'login';
        }
    }

    // TODO: Setup History API listener (popstate) for back/forward navigation
}

// Start the app once the DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);