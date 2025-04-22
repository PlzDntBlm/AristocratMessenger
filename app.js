/**
 * app.js
 * Main application file for Aristocrat Messenger.
 * Sets up the Express server, middleware, routes, and starts listening for requests.
 */

// Load environment variables
require('dotenv').config();

const express = require('express');
const path = require('path');

// Import Routers
const partialsRouter = require('./routes/partials'); // Import the partials router

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Tell Express where to find view files

// Serve static files (CSS, client-side JS) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// TODO: Add middleware for parsing request bodies (e.g., express.json(), express.urlencoded()) when forms/APIs are added.
// TODO: Add middleware for session management (e.g., express-session) when auth is added.
// TODO: Add custom middleware (e.g., for logging, auth checks, setting res.locals) as needed.

// --- Routes ---
// Mount the partials router
app.use('/partials', partialsRouter); // All routes in partials.js will be prefixed with /partials

/**
 * GET /
 * Route to serve the main Single Page Application (SPA) shell.
 * This renders the main layout, and client-side JS will handle loading content.
 */
app.get('/', (req, res) => {
    res.render('index', {
        // Pass any data needed by the main layout itself
        // pageTitle: 'Aristocrat Messenger' // Example
    });
    // TODO: Potentially check authentication status here and pass user info to the template
});

// TODO: Add other top-level routes if necessary (e.g., /auth routes for login/logout POST requests)

// --- Error Handling ---
// TODO: Add a basic 404 Not Found handler
// TODO: Add a more robust error handling middleware

// --- Server Activation ---
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});