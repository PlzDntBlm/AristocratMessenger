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
const partialsRouter = require('./routes/partials');
const authRouter = require('./routes/auth'); // Import the auth router

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Tell Express where to find view files

// Serve static files (CSS, client-side JS) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Body Parsers
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded form data
// app.use(express.json()); // Add if you need to parse JSON bodies

// TODO: Add middleware for session management (e.g., express-session) when auth is added.
// TODO: Add custom middleware (e.g., for logging, auth checks, setting res.locals) as needed.

// --- Routes ---
// Mount the routers
app.use('/partials', partialsRouter); // Serves HTML partials for the SPA
app.use('/auth', authRouter);         // Handles authentication requests (register, login, logout)

/**
 * GET /
 * Route to serve the main Single Page Application (SPA) shell.
 */
app.get('/', (req, res) => {
    res.render('index', {
        // pageTitle: 'Aristocrat Messenger' // Example
    });
    // TODO: Potentially check authentication status here and pass user info to the template
});

// --- Error Handling ---
// TODO: Add a basic 404 Not Found handler
app.use((req, res, next) => {
    res.status(404).send("Sorry, that route doesn't exist.");
});

// TODO: Add a more robust error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// --- Server Activation ---
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});