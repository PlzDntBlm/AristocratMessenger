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
const authRouter = require('./routes/auth');
const apiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Session Configuration ---
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
        // TODO: Consider using a session store
    }
}));

// --- Make Session Data Available to Templates ---
app.use((req, res, next) => {
    res.locals.isLoggedIn = !!req.session.userId;
    res.locals.username = req.session.username || null;
    next();
});

// --- Other Core Middleware ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (CSS, client-side JS) from the 'public' directory
// IMPORTANT: Placed BEFORE any specific or catch-all routes.
app.use(express.static(path.join(__dirname, 'public')));

// Serve leaflet.css and other leaflet assets (like images for markers) from node_modules
app.use('/libs/leaflet', express.static(path.join(__dirname, 'node_modules/leaflet/dist')));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// --- Specific Routes ---
// Mount the specific routers BEFORE the catch-all middleware
app.use('/api', apiRouter);
app.use('/auth', authRouter);

/**
 * GET /
 * Specific handler for the root path.
 */
app.get('/', (req, res) => {
    console.log("Serving index.ejs for GET /");
    res.render('index');
});

// --- SPA Catch-All Middleware ---
/**
 * Middleware to serve the main index.ejs file for SPA routes.
 * This should be placed AFTER static file middleware and specific routes.
 */
const serveSpaHtml = (req, res, next) => {
    // Check if the request is a GET request, accepts HTML, and doesn't look like an API/Asset path.
    if (
        req.method === 'GET' &&
        req.accepts('html') &&                      // Check if the client accepts HTML
        !req.path.startsWith('/api/') &&            // Exclude specific API prefix
        !req.path.startsWith('/auth/') &&           // Exclude specific Auth prefix (though most are POST)
        !req.path.startsWith('/partials/') &&       // Exclude partials prefix
        !req.path.match(/\.\w+$/)                   // Exclude paths that look like file extensions
    ) {
        console.log(`SPA Middleware: Serving index.ejs for GET ${req.path}`);
        res.render('index'); // Serve the main SPA file
    } else {
        // If it's not a GET, doesn't accept HTML, or looks like an excluded path,
        // pass it to the next middleware (likely the 404 handler).
        console.log(`SPA Middleware: Passing request ${req.method} ${req.path} to next handler.`);
        next();
    }
};

// Use the SPA catch-all middleware
app.use(serveSpaHtml);


// --- Error Handling --- (Place AFTER all routes and middleware)
// Basic 404 Not Found handler
app.use((req, res, next) => {
    console.log(`404 Handler: Route not found for ${req.method} ${req.originalUrl}`);
    res.status(404).send("Sorry, that route doesn't exist.");
});

// General error handling middleware
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack || err);
    res.status(500).send('Something broke on the server!');
});

// --- Server Activation ---
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});