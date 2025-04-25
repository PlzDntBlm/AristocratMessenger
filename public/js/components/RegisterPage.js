/**
 * public/js/components/RegisterPage.js
 * Defines the RegisterPage component function.
 */

/**
 * Creates and returns the Register Page DOM element structure.
 * @returns {HTMLElement} The root div element for the register page.
 */
export function RegisterPageComponent() {
    // Create the main container div
    const container = document.createElement('div');
    container.id = 'component-register'; // Optional ID

    // Set the inner HTML structure for the register page
    container.innerHTML = `
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
                <a href="/login" data-route="login" class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
                    Already have an account? Login
                </a>
            </div>
            <div id="register-message" class="mt-4 text-sm"></div>
        </form>
    `;

    // Note: The 'submit' event for the form (#register-form) is currently handled
    // by delegation in app.js (handleAuthFormSubmit).

    return container; // Return the constructed element
}