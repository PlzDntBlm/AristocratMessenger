/**
 * public/js/api.js
 * Handles all communication with the backend API using fetch.
 */

// TODO: Add functions like:
// async function checkAuthStatus() { ... }
// async function loginUser(email, password) { ... }
// async function logoutUser() { ... }
// async function registerUser(username, email, password) { ... }
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


// Export functions as they are added
export { postData, getData /*, checkAuthStatus, loginUser, logoutUser ... */ };