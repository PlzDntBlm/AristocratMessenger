/**
 * app.js (Server-Side)
 * Main application file for Aristocrat Messenger.
 * Sets up the Express server, middleware, routes, and starts listening for requests.
 */

// Load environment variables
require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const {Server} = require("socket.io");

// Import Routers
const authRouter = require('./routes/auth');
const apiRouter = require('./routes/api');
const chatRouter = require('./routes/chat');

const app = express();
const server = http.createServer(app);

// --- Socket.IO Connection Handling ---
// Select the correct origin based on the environment
const corsOrigin = process.env.NODE_ENV === 'production'
    ? process.env.CORS_ORIGIN_PROD
    : process.env.CORS_ORIGIN_DEV;
const socketURL = process.env.NODE_ENV === 'production' ? process.env.SOCKET_URL_PROD : '';

// Initialize socket.io server with the dynamic CORS origin
const io = new Server(server, {
    cors: {
        origin: corsOrigin,
        methods: ["GET", "POST"]
    }
});

require('./socket/chatHandler')(io); // Pass the 'io' instance to our handler

const PORT = process.env.PORT || 3000;

// --- Other Core Middleware ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (CSS, client-side JS) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/libs/leaflet', express.static(path.join(__dirname, 'node_modules/leaflet/dist')));

// Serve uploaded files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, 'images')));


// Body Parsers
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// --- Specific Routes ---
app.use('/api', apiRouter);
app.use('/api/chat', chatRouter);
app.use('/auth', authRouter);

app.get('/', (req, res) => {
    console.log("Serving index.ejs for GET /");
    res.render('index', {SOCKET_URL: socketURL});
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
        res.render('index', {SOCKET_URL: socketURL});
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
    res.status(404).render('index', {SOCKET_URL: socketURL});
});

app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack || err);
    res.status(500).send('Something broke on the server!');
});

// --- Server Activation ---
server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(`CORS origin for WebSockets is set to: ${corsOrigin}`); // Added for clarity
});