/**
 * public/js/components/LoginPage.js
 * Defines the LoginPage component function.
 */

/**
 * Creates and returns the Login Page DOM element structure.
 * @returns {HTMLElement} The root div element for the login page.
 */
export function LoginPageComponent() {
    // Create the main container div
    const container = document.createElement('div');
    container.id = 'component-login'; // Optional ID for styling/selection

    // Set the inner HTML structure for the login page
    container.innerHTML = `
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
                <a href="/register" data-route="register" class="inline-block align-baseline font-bold text-sm text-green-500 hover:text-green-800">
                    Need an account? Register
                </a>
            </div>
            <div id="login-message" class="mt-4 text-sm"></div>
        </form>
    `;

    // Note: The 'submit' event for the form (#login-form) is currently handled
    // by delegation in app.js (handleAuthFormSubmit). If needed later,
    // component-specific submit logic could be added here.
    // Example:
    // const form = container.querySelector('#login-form');
    // form.addEventListener('submit', (e) => { /* component-specific handler */ });

    return container; // Return the constructed element
}