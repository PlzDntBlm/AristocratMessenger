/**
 * public/js/app.js
 * Main application entry point. Initializes the app, handles routing (basic),
 * wires up modules (state, api, ui).
 */
import * as api from './api.js'; // Import API functions
import { getState, setAuthState } from './state.js'; // Import state functions
import { renderNavbar, renderContent } /*, renderLoginPage, renderRegisterPage, renderHomePage... */ from './ui.js'; // Import UI functions

// --- Global Elements / Initial Setup ---
// TODO: Consider moving DOM element selections to ui.js if preferred


// --- Event Handlers ---

function handleNavClick(event) {
    const targetLink = event.target.closest('a[data-route]'); // Change to data-route maybe?
    const logoutButton = event.target.closest('#logout-button');

    if (targetLink) {
        event.preventDefault();
        const route = targetLink.getAttribute('data-route');
        console.log(`Routing to: ${route}`);
        // TODO: Implement actual routing logic to render correct component/view
        renderContent(`<p>Navigating to ${route} (Component TBD)...</p>`); // Placeholder
        // Example: if (route === 'login') { renderLoginPage(); }
    } else if (logoutButton) {
        event.preventDefault();
        handleLogout(); // Call logout handler
    }
}

async function handleLogout() {
    console.log("Logout initiated...");
    try {
        // const result = await api.logoutUser(); // TODO: Implement api.logoutUser()
        // console.log('Logout API result:', result);
        setAuthState(false, null); // Update client state
        renderNavbar(getState()); // Re-render navbar immediately
        // renderLoginPage(); // TODO: Render login page component
        renderContent('<p>Logout successful. Login page TBD.</p>'); // Placeholder
        window.location.hash = 'login'; // Update hash
    } catch (error) {
        console.error("Logout failed:", error);
        // TODO: Show error message in UI
    }
}

async function handleAuthFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries()); // Convert FormData to plain object

    try {
        let result;
        if (form.id === 'login-form') {
            console.log('Submitting login:', data);
            // result = await api.loginUser(data.email, data.password); // TODO: Implement api.loginUser()
            // Temp placeholder until API is implemented
            result = { success: true, user: { id: 1, username: data.email.split('@')[0] || 'TestUser' } }; // MOCK SUCCESS
            if(result.success) {
                setAuthState(true, result.user); // Update client state
                renderNavbar(getState()); // Update navbar
                // renderHomePage(result.user); // TODO: Render home page component
                renderContent(`<p>Login successful! Welcome ${result.user.username}. Home page TBD.</p>`); // Placeholder
                window.location.hash = 'home';
            } else {
                throw new Error(result.message || 'Login failed');
            }
        } else if (form.id === 'register-form') {
            console.log('Submitting registration:', data);
            // result = await api.registerUser(data.username, data.email, data.password); // TODO: Implement api.registerUser()
            // Temp placeholder
            result = { success: true }; // MOCK SUCCESS
            if(result.success) {
                console.log('Registration successful');
                // renderLoginPage(); // TODO: Render login page component after registration
                renderContent(`<p>Registration successful! Please login. Login page TBD.</p>`); // Placeholder
                window.location.hash = 'login';
            } else {
                throw new Error(result.message || 'Registration failed');
            }
        }
        // Clear form messages if successful? TODO
    } catch (error) {
        console.error(`Form ${form.id} submission error:`, error);
        const messageElement = form.querySelector('#login-message') || form.querySelector('#register-message');
        if (messageElement) {
            messageElement.textContent = error.message || 'An error occurred.';
            messageElement.className = 'mt-4 text-sm text-red-600';
        }
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
        contentElement.addEventListener('submit', (event) => {
            if (event.target.tagName === 'FORM' && (event.target.id === 'login-form' || event.target.id === 'register-form')) {
                handleAuthFormSubmit(event);
            }
        });
        // Add other listeners as needed
    }


    // Check initial authentication status
    try {
        // Remove or comment out the mock placeholder:
        // const authStatus = { isLoggedIn: false, user: null }; // MOCK logged out state

        console.log("Checking auth status via API...");
        const authStatus = await api.checkAuthStatus(); // Call the function from api.js
        console.log("Received auth status:", authStatus);

        // Update the client state based on the REAL response from the server
        setAuthState(authStatus.isLoggedIn, authStatus.user || null); // Use the actual data
    } catch (error) {
        console.error("Failed to fetch initial auth status:", error);
        setAuthState(false, null); // Assume logged out on error
        // TODO: Maybe display an error message to the user in the UI?
    }

    // Initial UI render based on state
    renderNavbar(getState());
    // TODO: Implement initial routing based on hash and state
    if(getState().isLoggedIn) {
        // renderHomePage(getState().currentUser);
        renderContent(`<p>Welcome back ${getState().currentUser?.username}. Home page TBD.</p>`); // Placeholder
    } else {
        // renderLoginPage();
        renderContent(`<p>Please login or register. Login page TBD.</p>`); // Placeholder
        // Handle initial hash like #register if necessary
        if(window.location.hash === '#register') {
            // renderRegisterPage();
            renderContent(`<p>Register page TBD.</p>`); // Placeholder
        }
    }

    // TODO: Setup History API listener (popstate) for back/forward navigation
}

// Start the app once the DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);