/**
 * public/js/api.js
 * Handles all communication with the backend API using fetch.
 */

// Helper function for GET requests (assuming it's defined elsewhere or here)
async function getData(url = '') {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            let errorMsg = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.message || errorMsg;
            } catch (e) { /* Ignore if body isn't JSON */ }
            const error = new Error(errorMsg);
            error.status = response.status;
            throw error;
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response.json();
        } else {
            return { success: true, data: await response.text() }; // Or handle as error if JSON expected
        }
    } catch (error) {
        console.error(`Workspace GET error for ${url}:`, error);
        throw error;
    }
}

// Helper function for POST requests (assuming it's defined elsewhere or here)
async function postData(url = '', data = {}) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            let errorMsg = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json(); // Try to parse JSON error response
                errorMsg = errorData.message || errorMsg;
            } catch (e) { /* Ignore if body isn't JSON */ }
            const error = new Error(errorMsg);
            error.status = response.status; // Attach status code
            throw error;
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response.json();
        } else {
            // If no JSON, but still ok, consider it a success (e.g. for 204 No Content)
            // For this app, we generally expect JSON.
            return { success: true, data: await response.text() };
        }
    } catch (error) {
        console.error(`Workspace POST error for ${url}:`, error);
        throw error;
    }
}


/**
 * Checks the user's current authentication status with the server.
 * @returns {Promise<object>} - Promise resolving to the auth status object.
 */
async function checkAuthStatus() {
    console.log('API: Checking auth status...');
    return await getData('/api/auth/status');
}

/**
 * Attempts to log the user in via the backend API.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} - Promise resolving to the server's JSON response.
 */
async function loginUser(email, password) {
    console.log(`API: Attempting login for ${email}...`);
    return await postData('/auth/login', { email, password });
}

/**
 * Logs the user out via the backend API.
 * @returns {Promise<object>} - Promise resolving to the server's JSON response.
 */
async function logoutUser() {
    console.log('API: Attempting logout...');
    return await postData('/auth/logout', {});
}

/**
 * Attempts to register a new user via the backend API.
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} - Promise resolving to the server's JSON response.
 */
async function registerUser(username, email, password) {
    console.log(`API: Attempting registration for ${username} (${email})...`);
    return await postData('/auth/register', { username, email, password });
}

/**
 * Fetches a list of all users.
 * @returns {Promise<object>} - Promise resolving to the server's JSON response.
 */
async function getUsers() {
    console.log('API: Fetching all users...');
    return await getData('/api/users');
}

/**
 * Sends a new message to the backend.
 * @param {number} recipientId - The ID of the recipient user.
 * @param {string} subject - The subject of the message.
 * @param {string} body - The body content of the message.
 * @returns {Promise<object>} - Promise resolving to the server's JSON response.
 */
async function sendMessage(recipientId, subject, body) {
    console.log('API: Sending message...');
    const messageData = { recipientId, subject, body };
    return await postData('/api/messages', messageData);
}

/**
 * Fetches the logged-in user's inbox messages.
 * @returns {Promise<object>} - Promise resolving to the server's JSON response containing inbox messages.
 */
async function getInboxMessages() {
    console.log('API: Fetching inbox messages...');
    return await getData('/api/messages/inbox');
}

/**
 * Fetches the logged-in user's outbox (sent) messages.
 * @returns {Promise<object>} - Promise resolving to the server's JSON response containing outbox messages.
 */
async function getOutboxMessages() {
    console.log('API: Fetching outbox messages...');
    return await getData('/api/messages/outbox');
}

/**
 * Fetches a single message by its ID.
 * The backend API endpoint already handles marking the message as read if the requester is the recipient.
 * @param {string|number} messageId - The ID of the message to fetch.
 * @returns {Promise<object>} - Promise resolving to the server's JSON response containing the message.
 */
async function getMessageById(messageId) {
    console.log(`API: Fetching message by ID: ${messageId}...`);
    return await getData(`/api/messages/${messageId}`);
}

export {
    postData,
    getData,
    checkAuthStatus,
    loginUser,
    logoutUser,
    registerUser,
    getUsers,
    sendMessage,
    getInboxMessages,
    getOutboxMessages,
    getMessageById
};