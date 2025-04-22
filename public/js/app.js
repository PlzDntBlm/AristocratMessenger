/**
 * public/js/app.js
 *
 * Main client-side JavaScript file for the Aristocrat Messenger SPA.
 * Handles navigation clicks (via links with data-partial attributes),
 * form submissions, fetching partial views from the server,
 * and updating the main content area dynamically.
 */

/**
 * Selects the main content area element where partials are loaded.
 * @type {HTMLElement}
 */
const contentElement = document.getElementById('content');

// We no longer need a specific navElement selector as we use event delegation on contentElement

/**
 * Fetches a partial view from the server and injects its HTML into the content area.
 * @param {string} partialName - The name of the partial to load (e.g., 'home', 'login', 'register').
 */
const loadPartial = async (partialName) => {
    if (!contentElement) {
        console.error("Error: Main content element '#content' not found.");
        return;
    }

    // Display a loading state
    contentElement.innerHTML = '<p class="text-center text-gray-500">Loading...</p>';
    // TODO: Implement a more sophisticated loading indicator (e.g., spinner)

    try {
        const response = await fetch(`/partials/${partialName}`);
        if (!response.ok) {
            // TODO: Handle different HTTP error statuses appropriately
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        contentElement.innerHTML = html; // Inject the new HTML content

        // TODO: Potentially run initialization scripts specific to the loaded partial
        // Example: if (typeof window[`init_${partialName}`] === 'function') { window[`init_${partialName}`](); }

    } catch (error) {
        console.error('Error loading partial:', error);
        contentElement.innerHTML = `<p class="text-center text-red-500">Error loading content. Please try again later.</p>`;
        // TODO: Provide more user-friendly error feedback
    }
};

/**
 * Handles form submissions within the #content area using Fetch API.
 * Identifies the form, sends data to the server, and handles the response.
 * @param {Event} event - The submit event object.
 */
const handleFormSubmit = async (event) => {
    event.preventDefault(); // Prevent default browser form submission

    const form = event.target; // The form element that triggered the submit
    const action = form.action; // Get URL from form's action attribute
    const method = form.method.toUpperCase(); // Get method (POST, GET, etc.)

    // Try to find a dedicated message display area within the form
    const messageElement = form.querySelector('#register-message') || form.querySelector('#login-message'); // Adapt selector if needed for other forms

    // Clear previous messages and indicate loading (optional)
    if (messageElement) messageElement.textContent = '';
    // TODO: Add loading state to submit button (e.g., disable button, change text)

    try {
        const formData = new FormData(form);
        // Encode form data for 'application/x-www-form-urlencoded' content type
        const body = new URLSearchParams(formData).toString();

        const response = await fetch(action, {
            method: method,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body,
        });

        const responseText = await response.text(); // Get text response from server (can be HTML, plain text, or JSON string)

        if (!response.ok) {
            // Display error message from server response body if available
            if (messageElement) {
                messageElement.textContent = responseText || `Error: ${response.statusText}`;
                messageElement.className = 'mt-4 text-sm text-red-600'; // Style as error
            }
            // TODO: Handle specific error codes (400 Bad Request, 409 Conflict, 500 Server Error) more distinctly if needed
            throw new Error(`HTTP error! status: ${response.status}, message: ${responseText}`);
        }

        // --- Success Handling ---
        if (form.id === 'register-form') {
            // Registration successful
            console.log('Registration successful:', responseText);
            if (messageElement) {
                messageElement.textContent = 'Registration successful! Redirecting to login...';
                messageElement.className = 'mt-4 text-sm text-green-600'; // Style as success
            }
            // Redirect to login partial after a short delay
            setTimeout(() => {
                loadPartial('login');
                // TODO: Update browser history for login page (e.g., history.pushState({}, '', '#login'))
            }, 1500); // Wait 1.5 seconds
        } else if (form.id === 'login-form') {
            // Login successful (according to server response)
            console.log('Login successful (Session TBD):', responseText);
            if (messageElement) {
                messageElement.textContent = 'Login successful! Loading home...'; // Updated placeholder
                messageElement.className = 'mt-4 text-sm text-green-600';
            }
            // TODO: Store session/token info from response if applicable later
            // Redirect to home partial
            setTimeout(() => {
                loadPartial('home'); // Load the home partial on successful login
                // TODO: Update browser history for home page
                // history.pushState({ partial: 'home' }, '', '#home');
            }, 1000); // Wait 1 second
        } else {
            // Handle other forms if needed in the future
            console.log('Form submitted successfully:', responseText);
            if (messageElement) messageElement.textContent = responseText; // Display generic success message from server
        }

    } catch (error) {
        console.error('Form submission error:', error);
        // Display a generic error if no specific message was set from the response
        if (messageElement && !messageElement.textContent) {
            messageElement.textContent = 'An unexpected error occurred. Please try again.';
            messageElement.className = 'mt-4 text-sm text-red-600';
        }
        // TODO: Add more robust client-side error reporting or handling
    } finally {
        // TODO: Remove loading state from submit button regardless of success/error
    }
};


/**
 * Initializes the SPA functionality.
 * Attaches event listeners using event delegation on the #content element
 * for both navigation clicks and form submissions. Loads the initial view.
 */
const initApp = () => {
    if (!contentElement) {
        console.error("Error: Main content element '#content' not found. Cannot initialize app.");
        return;
    }

    // Use event delegation on the main content container
    contentElement.addEventListener('click', (event) => {
        // Handle navigation link clicks within the loaded partials
        const targetLink = event.target.closest('a[data-partial]');
        if (targetLink) {
            event.preventDefault(); // Prevent default anchor link behavior
            const partialName = targetLink.getAttribute('data-partial');
            if (partialName) {
                loadPartial(partialName);
                // TODO: Update browser history using History API (pushState)
                // Example: history.pushState({ partial: partialName }, '', `#${partialName}`);
            }
        }
    });

    contentElement.addEventListener('submit', (event) => {
        // Handle form submissions originating within the content area
        if (event.target.tagName === 'FORM') {
            handleFormSubmit(event); // Delegate to the form submission handler
        }
    });

    // Also listen for clicks on the main header navigation (if separate from #content)
    const headerNav = document.querySelector('header nav');
    if(headerNav) {
        headerNav.addEventListener('click', (event) => {
            const targetLink = event.target.closest('a[data-partial]');
            if (targetLink) {
                event.preventDefault();
                const partialName = targetLink.getAttribute('data-partial');
                if (partialName) {
                    loadPartial(partialName);
                    // TODO: Update browser history using History API
                }
            }
        });
    } else {
        console.warn("Header navigation element not found for click handling.");
    }


    // Determine initial partial to load
    // Check URL hash first, otherwise default to 'login'
    // TODO: Later, check authentication status to default to 'home' if logged in
    const initialPartial = window.location.hash.substring(1) || 'login';
    loadPartial(initialPartial);

    // TODO: Add event listener for 'popstate' event to handle browser back/forward buttons
    // window.addEventListener('popstate', (event) => {
    //    const state = event.state;
    //    if (state && state.partial) {
    //        loadPartial(state.partial);
    //    } else {
    //        // Handle initial state or cases without state (e.g., load default)
    //        loadPartial(defaultPartial); // defaultPartial might be 'login' or 'home'
    //    }
    // });
};

// --- Initialization ---
// Wait for the DOM to be fully loaded before initializing the app
document.addEventListener('DOMContentLoaded', initApp);