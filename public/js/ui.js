/**
 * public/js/ui.js
 * Handles rendering UI components and updating the DOM.
 */

const contentElement = document.getElementById('content');
const navElement = document.querySelector('header nav'); // Assuming nav is still in header

if (!contentElement) {
    console.error("FATAL ERROR: #content element not found!");
}
if (!navElement) {
    console.warn("Warning: Header nav element not found!");
}

/**
 * Renders the navigation bar based on the application state.
 * @param {object} state - The current application state from state.js
 */
function renderNavbar(state) {
    // Find the navigation element in the header
    const navElement = document.querySelector('header nav');
    if (!navElement) {
        console.warn("Warning: Header nav element not found for rendering!");
        return; // Can't render if the container doesn't exist
    }

    console.log('Rendering Navbar for state:', state);

    // Generate the HTML string for the navbar content
    let navHTML = '';
    if (state.isLoggedIn) {
        // HTML for logged-in users
        navHTML = `
             <a href="#home" data-route="home" class="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">Home</a>
             <span class="text-gray-300 px-3 py-2 text-sm">Welcome, ${state.currentUser?.username || 'User'}!</span>
             <button id="logout-button" class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm">Logout</button>
         `;
    } else {
        // HTML for logged-out users
        navHTML = `
             <a href="#login" data-route="login" class="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">Login</a>
             <a href="#register" data-route="register" class="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">Register</a>
         `;
    }

    // Replace the content of the nav element with the new HTML
    // Note: This approach replaces everything inside <nav>. If you have static elements
    // within the nav container that shouldn't be replaced, you might need a more specific
    // target element or more granular DOM manipulation.
    navElement.innerHTML = navHTML;

    // TODO: Add actual Tailwind classes to the links/buttons above instead of just "..." where applicable.
    // I've added back the classes from the original index.ejs for now.
}

/**
 * Renders the main content area with the given HTML or component output.
 * @param {string | HTMLElement} content - HTML string or DOM element to render.
 */
function renderContent(content) {
    if (!contentElement) return;
    console.log('Rendering main content...');
    if (typeof content === 'string') {
        contentElement.innerHTML = content;
    } else if (content instanceof HTMLElement) {
        contentElement.innerHTML = ''; // Clear previous content
        contentElement.appendChild(content);
    } else {
        console.error('Invalid content type for renderContent:', content);
        contentElement.innerHTML = '<p class="text-red-500">Error rendering content.</p>';
    }
    // TODO: Potentially run scripts or attach listeners after rendering content
}

/**
 * Renders the Login page/component into the main content area.
 */
function renderLoginPage() {
    console.log("UI: Rendering Login Page");
    const loginHTML = `
        <div id="partial-login">
            <h2 class="text-xl font-semibold mb-4">Login</h2>
            <form id="login-form" method="POST" action="/auth/login">
                <div class="mb-4">
                    <label for="login-email" class="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                    <input type="email" id="login-email" name="email" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="your.email@example.com" required>
                </div>
                <div class="mb-6">
                    <label for="login-password" class="block text-gray-700 text-sm font-bold mb-2">Password:</label>
                    <input type="password" id="login-password" name="password" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" placeholder="******************" required>
                </div>
                <div class="flex items-center justify-between">
                    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                        Sign In
                    </button>
                    <a href="#register" data-route="register" class="inline-block align-baseline font-bold text-sm text-green-500 hover:text-green-800">
                        Need an account? Register
                    </a>
                </div>
                <div id="login-message" class="mt-4 text-sm"></div>
            </form>
        </div>
    `;
    renderContent(loginHTML); // Use the existing renderContent function
}

/**
 * Renders the Register page/component into the main content area.
 */
function renderRegisterPage() {
    console.log("UI: Rendering Register Page");
    const registerHTML = `
        <div id="partial-register">
            <h2 class="text-xl font-semibold mb-4">Register New Account</h2>
            <form id="register-form" method="POST" action="/auth/register">
                <div class="mb-4">
                    <label for="register-username" class="block text-gray-700 text-sm font-bold mb-2">Username:</label>
                    <input type="text" id="register-username" name="username" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Choose a username" required>
                </div>
                <div class="mb-4">
                    <label for="register-email" class="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                    <input type="email" id="register-email" name="email" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="your.email@example.com" required>
                </div>
                <div class="mb-6">
                    <label for="register-password" class="block text-gray-700 text-sm font-bold mb-2">Password:</label>
                    <input type="password" id="register-password" name="password" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" placeholder="******************" required>
                </div>
                <div class="flex items-center justify-between">
                    <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                        Register
                    </button>
                    <a href="#login" data-route="login" class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
                        Already have an account? Login
                    </a>
                </div>
                <div id="register-message" class="mt-4 text-sm"></div>
            </form>
        </div>
    `;
    renderContent(registerHTML); // Use the existing renderContent function
}

/**
 * Renders the Home page (Solar) view into the main content area.
 * @param {object | null} user - The current user object { id, username } or null
 */
function renderHomePage(user) {
    console.log("UI: Rendering Home Page for user:", user?.username);
    // Default username if user object is unexpectedly null/undefined but state says logged in
    const username = user?.username || 'Esteemed Guest';
    const homeHTML = `
        <div id="partial-home">
            <h2 class="text-xl font-semibold mb-4">Welcome to your Solar, ${username}!</h2>
            <p class="text-gray-700">This is your main hall. From here, you can manage your affairs.</p>
            <div class="mt-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-2">Messenger Status:</h3>
                <p class="text-gray-600">Your messengers await your command.</p>
                <div class="mt-4 space-x-4">
                     <a href="#scriptorium" data-route="scriptorium" class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">Write New Letter</a>
                     <a href="#cabinet" data-route="cabinet" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">View Letters</a>
                </div>
            </div>
             </div>
    `;
    renderContent(homeHTML); // Use the existing renderContent function
}

// TODO: Add functions to render specific pages/components.

export { renderNavbar, renderContent, renderLoginPage, renderRegisterPage, renderHomePage };