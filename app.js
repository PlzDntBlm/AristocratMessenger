/**
 * app.js (Server-Side)
 * Main application file for Aristocrat Messenger.
 * Sets up the Express server, middleware, routes, and starts listening for requests.
 */

// Load environment variables
require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http'); // <<<--- Import Node's http module
const {Server} = require("socket.io"); // <<<--- Import the socket.io Server

// Import Routers
const authRouter = require('./routes/auth');
const apiRouter = require('./routes/api');
const chatRouter = require('./routes/chat'); // <<<--- Import the new chat router

const app = express();
const server = http.createServer(app); // <<<--- Create an http server with the Express app
const io = new Server(server); // <<<--- Create a socket.io server attached to the http server

const PORT = process.env.PORT || 3000;

// --- Socket.IO Connection Handling ---
// We will create a dedicated handler for this
require('./socket/chatHandler')(io); // <<<--- Pass the 'io' instance to our handler

// --- Other Core Middleware ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (CSS, client-side JS) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/libs/leaflet', express.static(path.join(__dirname, 'node_modules/leaflet/dist')));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// --- Specific Routes ---
app.use('/api', apiRouter);
app.use('/api/chat', chatRouter); // <<<--- Use the new chat router
app.use('/auth', authRouter);

app.get('/', (req, res) => {
    console.log("Serving index.ejs for GET /");
    res.render('index');
});

// --- SPA Catch-All Middleware ---
const serveSpaHtml = (req, res, next) => {
    if (
        req.method === 'GET' &&
        req.accepts('html') &&
        !req.path.startsWith('/api/') &&
        !req.path.startsWith('/auth/') &&
        !req.path.startsWith('/partials/') &&
        !req.path.match(/\.\w+$/)
    ) {
        console.log(`SPA Middleware: Serving index.ejs for GET ${req.path}`);
        res.render('index');
    } else {
        console.log(`SPA Middleware: Passing request ${req.method} ${req.path} to next handler.`);
        next();
    }
};
app.use(serveSpaHtml);

// --- Error Handling ---
app.use((req, res, next) => {
    // This now catches everything that didn't match a file or an API route.
    // We'll serve the main app and let the client-side router handle the 404 display.
    console.log(`Final Handler: Serving index.ejs for unmatched route ${req.method} ${req.originalUrl}`);
    res.status(404).render('index');
});

app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack || err);
    res.status(500).send('Something broke on the server!');
});

// --- Server Activation ---
// We now use the 'server' object (with socket.io) instead of 'app' to listen
server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});