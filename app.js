/**
 * app.js (Server-Side)
 * Main application file for Aristocrat Messenger.
 * Sets up the Express server, middleware, routes, and starts listening for requests.
 */

// Load environment variables
require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session'); // Require session

// Import Routers
const partialsRouter = require('./routes/partials');
const authRouter = require('./routes/auth');
const apiRouter = require('./routes/api'); // Require the new API router

const app = express();
const PORT = process.env.PORT || 3000;

// --- Session Configuration ---
// IMPORTANT: Session middleware should come BEFORE routers that use sessions
app.use(session({
    secret: process.env.SESSION_SECRET, // Use the secret from your .env file
    resave: false,                      // Don't save session if unmodified
    saveUninitialized: false,           // Don't create session until something stored
    cookie: {
        // secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (requires HTTPS)
        secure: false, // Set to true if your development environment uses HTTPS
        httpOnly: true, // Prevents client-side JS from reading the cookie
        maxAge: 1000 * 60 * 60 * 24 // Cookie expiration time (e.g., 24 hours in milliseconds)
        // TODO: Consider using a session store like connect-session-sequelize for production
    }
}));

// --- Make Session Data Available to Templates ---
// This middleware runs for every request BEFORE the routers
app.use((req, res, next) => {
    res.locals.isLoggedIn = !!req.session.userId; // Boolean: true if userId exists in session
    res.locals.username = req.session.username || null; // Username or null
    // You can add other session data to res.locals if needed
    next(); // Continue to the next middleware/router
});

// --- Other Core Middleware ---
// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Tell Express where to find view files

// Serve static files (CSS, client-side JS) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Body Parsers (Place AFTER static, BEFORE routes)
app.use(express.json()); // Parses incoming JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded form data


// --- Routes ---
// Mount the routers (Place AFTER core middleware)
app.use('/api', apiRouter); // Mount the API router under /api
app.use('/partials', partialsRouter); // Keep this for now? Or remove if fully client-side? (Let's keep for now)
app.use('/auth', authRouter);

/**
 * GET /
 * Route to serve the main Single Page Application (SPA) shell.
 * This should be defined only once.
 */
app.get('/', (req, res) => {
    // res.locals are automatically available in templates rendered via res.render
    res.render('index', {
        // You can pass additional page-specific variables here if needed
        // pageTitle: 'Aristocrat Messenger' // Example
    });
});

// --- Error Handling --- (Place AFTER all routes)
// Basic 404 Not Found handler
app.use((req, res, next) => {
    res.status(404).send("Sorry, that route doesn't exist.");
    // TODO: Consider rendering a 404 EJS template
});

// General error handling middleware (must have 4 arguments)
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack || err);
    res.status(500).send('Something broke on the server!');
    // TODO: Consider rendering a 500 EJS template, especially for production
});

// --- Server Activation ---
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});