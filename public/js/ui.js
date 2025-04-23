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
    if (!navElement) return;
    console.log('Rendering Navbar for state:', state);
    // TODO: Generate navbar HTML based on state.isLoggedIn and state.currentUser
    let navHTML = '';
    if (state.isLoggedIn) {
        navHTML = `
             <a href="#home" data-route="home" class="...">Home</a>
             <span class="...">Welcome, ${state.currentUser?.username || 'User'}!</span>
             <button id="logout-button" class="...">Logout</button>
         `;
    } else {
        navHTML = `
             <a href="#login" data-route="login" class="...">Login</a>
             <a href="#register" data-route="register" class="...">Register</a>
         `;
    }
    // Replace entire nav content (simple approach)
    // Note: This will detach existing event listeners on nav items if not using delegation on header/body
    navElement.innerHTML = navHTML;
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

// TODO: Add functions to render specific pages/components like renderLoginPage(), renderRegisterPage(), renderHomePage(user) etc.

export { renderNavbar, renderContent };