/**
 * public/js/api.js
 * Handles all communication with the backend API using fetch and JWT.
 */

// --- Token Management ---

/**
 * Saves the JWT to local storage.
 * @param {string} token - The JWT to save.
 */
function saveToken(token) {
    localStorage.setItem('aristocrat_token', token);
}

/**
 * Retrieves the JWT from local storage.
 * @returns {string|null} The saved token or null if not found.
 */
function getToken() {
    return localStorage.getItem('aristocrat_token');
}

/**
 * Deletes the JWT from local storage.
 */
function deleteToken() {
    localStorage.removeItem('aristocrat_token');
}

/**
 * Creates a standard headers object including the Authorization header if a token exists.
 * @returns {object} A headers object for fetch requests.
 */
function getAuthHeaders() {
    const headers = {
        'Content-Type': 'application/json',
    };
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}


// --- Generic Fetch Helpers (Updated to use Auth Headers) ---

async function getData(url = '') {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            let errorMsg = `HTTP error! status: ${response.status}`;
            if (response.status === 401 || response.status === 403) {
                // On auth error, we should probably trigger a global logout event.
                // For now, just throwing the error is sufficient for the caller to handle.
                console.warn('Authentication error detected.');
            }
            try {
                const errorData = await response.json();
                errorMsg = errorData.message || errorMsg;
            } catch (e) { /* Ignore */ }
            throw new Error(errorMsg);
        }
        return response.json(); // Assuming all GET responses are JSON
    } catch (error) {
        console.error(`API GET error for ${url}:`, error);
        throw error;
    }
}

async function postData(url = '', data = {}) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            let errorMsg = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.message || errorMsg;
            } catch (e) { /* Ignore */ }
            throw new Error(errorMsg);
        }
        return response.json();
    } catch (error) {
        console.error(`API POST error for ${url}:`, error);
        throw error;
    }
}

async function putData(url = '', data = {}) {
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            let errorMsg = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.message || errorMsg;
            } catch (e) { /* Ignore */ }
            throw new Error(errorMsg);
        }
        return response.json();
    } catch (error) {
        console.error(`API PUT error for ${url}:`, error);
        throw error;
    }
}

// --- Specific API Functions ---

/**
 * Replaces checkAuthStatus. Fetches the current user's profile using their token.
 * @returns {Promise<object>} - Promise resolving to the server's response.
 */
async function getMyProfile() {
    console.log('API: Fetching current user profile...');
    return await getData('/api/users/me');
}

/**
 * Attempts to log the user in. If successful, saves the returned token.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} - Promise resolving to the server's JSON response.
 */
async function loginUser(email, password) {
    console.log(`API: Attempting login for ${email}...`);
    // Login doesn't send an auth header, it creates one.
    const response = await postData('/auth/login', { email, password });
    if (response.success && response.token) {
        saveToken(response.token);
    }
    return response;
}

/**
 * Logs the user out by deleting the token.
 * @returns {Promise<void>}
 */
async function logoutUser() {
    console.log('API: Logging out on client-side.');
    deleteToken();
    // We can still call the server endpoint if we want to log the event server-side,
    // but it's not required for the client to be logged out.
    // await postData('/auth/logout', {});
    return Promise.resolve();
}

/**
 * Registers a new user. Now includes location data.
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @param {string} locationName
 * @param {number} x
 * @param {number} y
 * @returns {Promise<object>}
 */
async function registerUser(username, email, password, locationName, x, y) {
    console.log(`API: Attempting registration for ${username} (${email})...`);
    // The data object now includes all required fields for the backend
    const registrationData = {
        username,
        email,
        password,
        locationName,
        x,
        y,
    };
    return await postData('/auth/register', registrationData);
}

// All subsequent functions are now automatically authenticated
// because the generic getData/postData/putData helpers use getAuthHeaders().

async function getUsers() {
    console.log('API: Fetching all users...');
    return await getData('/api/users');
}

async function sendMessage(recipientId, subject, body) {
    console.log('API: Sending message...');
    return await postData('/api/messages', { recipientId, subject, body });
}

async function getInboxMessages() {
    console.log('API: Fetching inbox messages...');
    return await getData('/api/messages/inbox');
}

async function getOutboxMessages() {
    console.log('API: Fetching outbox messages...');
    return await getData('/api/messages/outbox');
}

async function getMessageById(messageId) {
    console.log(`API: Fetching message by ID: ${messageId}...`);
    return await getData(`/api/messages/${messageId}`);
}

async function getLocations() {
    console.log('API: Fetching all locations...');
    return await getData('/api/locations');
}

/**
 * Checks if a given location name is available.
 * @param {string} name - The location name to check.
 * @returns {Promise<object>}
 */
async function checkLocationName(name) {
    console.log(`API: Checking availability of location name "${name}"...`);
    return await postData('/api/locations/check-name', { name });
}

async function updateUserProfile(profileData) {
    console.log('API: Updating user profile...');
    return await putData('/api/users/profile', profileData);
}

/**
 * NEW generic helper for DELETE requests.
 * @param {string} url - The URL to send the DELETE request to.
 * @returns {Promise<object>} - A promise that resolves to the server's JSON response.
 */
async function deleteData(url = '') {
    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
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
        // DELETE requests might not return a body, but if they do, parse as JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response.json();
        } else {
            return { success: true }; // Assume success if no JSON body and status is ok
        }
    } catch (error) {
        console.error(`API DELETE error for ${url}:`, error);
        throw error;
    }
}

// --- ADMIN API FUNCTIONS ---

/**
 * Fetches the full list of users for the admin panel.
 * @returns {Promise<object>}
 */
async function getAllUsersForAdmin() {
    console.log('API: (Admin) Fetching all users...');
    return await getData('/api/admin/users');
}

/**
 * Updates a user's role.
 * @param {number} userId - The ID of the user to update.
 * @param {boolean} isAdmin - The new admin status.
 * @returns {Promise<object>}
 */
async function updateUserRole(userId, isAdmin) {
    console.log(`API: (Admin) Setting isAdmin=${isAdmin} for user ID ${userId}...`);
    return await putData(`/api/admin/users/${userId}/role`, { isAdmin });
}

/**
 * Deletes a user.
 * @param {number} userId - The ID of the user to delete.
 * @returns {Promise<object>}
 */
async function deleteUser(userId) {
    console.log(`API: (Admin) Deleting user ID ${userId}...`);
    return await deleteData(`/api/admin/users/${userId}`);
}


export {
    getToken,
    getMyProfile,
    loginUser,
    logoutUser,
    registerUser,
    getUsers,
    sendMessage,
    getInboxMessages,
    getOutboxMessages,
    getMessageById,
    getLocations,
    updateUserProfile,
    checkLocationName,
    getAllUsersForAdmin,
    updateUserRole,
    deleteUser,
};