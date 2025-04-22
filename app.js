// Load environment variables
require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // Use port from .env or default to 3000

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Tell Express where to find view files

// Serve static files (CSS, client-side JS) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Basic route for the homepage (we'll make this dynamic later)
app.get('/', (req, res) => {
    // For now, just send a simple message. We'll render index.ejs soon.
    res.send('Welcome to Aristocrat Messenger!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});