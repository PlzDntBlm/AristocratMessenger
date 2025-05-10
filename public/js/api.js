/**
 * public/js/api.js
 * Handles all communication with the backend API using fetch.
 */

/**
 * Checks the user's current authentication status with the server.
 * @returns {Promise<object>} - Promise resolving to the auth status object (e.g., { isLoggedIn: boolean, user: object|null })
 */
async function checkAuthStatus() {
    console.log('API: Checking auth status...');
    // Use the getData helper function defined earlier in this file
    return await getData('/api/auth/status');
}

/**
 * Attempts to log the user in via the backend API.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} - Promise resolving to the server's JSON response (e.g., { success: boolean, user?: object, message?: string })
 */
async function loginUser(email, password) {
    console.log(`API: Attempting login for ${email}...`);
    return await postData('/auth/login', { email, password });
}

/**
 * Logs the user out via the backend API.
 * @returns {Promise<object>} - Promise resolving to the server's JSON response (e.g., { success: boolean, message?: string })
 */
async function logoutUser() {
    console.log('API: Attempting logout...');
    // Using postData assuming the server endpoint might check Content-Type, even if body is empty.
    // Alternatively, use fetch directly if preferred for empty body POST.
    return await postData('/auth/logout', {});
}

/**
 * Attempts to register a new user via the backend API.
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} - Promise resolving to the server's JSON response (e.g., { success: boolean, message?: string })
 */
async function registerUser(username, email, password) {
    console.log(`API: Attempting registration for ${username} \(${email})...`);
    return await postData('/auth/register', { username, email, password });
}

// TODO: Add functions like:
// async function loadComponentData(componentName) { ... }

// Example structure for fetch calls
async function postData(url = '', data = {}) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Expecting to send JSON now
            },
            body: JSON.stringify(data)
        });
        // Check for non-2xx responses first
        if (!response.ok) {
            // Try to parse error message from body, fallback to statusText
            let errorMsg = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.message || errorMsg;
            } catch (e) { /* Ignore if body isn't valid JSON */ }
            const error = new Error(errorMsg);
            error.status = response.status; // Attach status code to error object
            throw error;
        }
        // Check if response has content to parse as JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response.json(); // Parse JSON body
        } else {
            return { success: true, data: await response.text() }; // Return text for non-JSON success, or handle as needed
        }
    } catch (error) {
        console.error('Fetch POST error:', error);
        throw error; // Re-throw the error to be caught by the caller
    }
}

async function getData(url = '') {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            let errorMsg = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.message || errorMsg;
            } catch (e) { /* Ignore */ }
            const error = new Error(errorMsg);
            error.status = response.status;
            throw error;
        }
        // Check if response has content to parse as JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response.json(); // Parse JSON body
        } else {
            // Decide how to handle non-JSON GET responses if necessary
            console.warn(`GET request to ${url} did not return JSON.`);
            return { success: true, data: await response.text() };
        }
    } catch (error) {
        console.error('Fetch GET error:', error);
        throw error;
    }
}

/**
 * Fetches a list of all users.
 * @returns {Promise<object>} - Promise resolving to the server's JSON response (e.g., { success: boolean, data: Array<User> })
 */
async function getUsers() {
    console.log('API: Fetching all users...');
    return await getData('/api/users');
}


// Export functions as they are added
export {
    postData,
    getData,
    checkAuthStatus,
    loginUser,
    logoutUser,
    registerUser,
    getUsers // Add new function here
    // TODO: Add sendMessage function later
};