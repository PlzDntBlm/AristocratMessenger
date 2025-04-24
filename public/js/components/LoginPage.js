/**
 * Renders the Login Page component.
 * @returns {HTMLElement} - The div element containing the login form.
 */
export function LoginPageComponent() {
    const container = document.createElement('div');
    container.id = 'partial-login'; // Keep ID for potential styling/selection
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
                <a href="#register" data-route="register" class="inline-block align-baseline font-bold text-sm text-green-500 hover:text-green-800">
                    Need an account? Register
                </a>
            </div>
            <div id="login-message" class="mt-4 text-sm"></div>
        </form>
    `;

    // --- Component-Specific Event Handling (Example - Submit) ---
    // The actual form submission logic (calling api.js, updating state)
    // is currently handled by handleAuthFormSubmit in app.js via delegation.
    // We could move that logic here, but it requires passing down handlers or
    // having components directly interact with api.js/state.js.
    // Let's keep delegation for submit for now for simplicity.
    // const form = container.querySelector('#login-form');
    // form.addEventListener('submit', (event) => { /* component-specific submit handling */ });

    return container;
}