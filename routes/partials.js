/**
 * routes/partials.js
 *
 * Defines routes specifically for serving EJS partial views.
 * These routes are intended to be called via client-side JavaScript (fetch)
 * to dynamically load content into the SPA shell.
 */
const express = require('express');
const router = express.Router();

/**
 * GET /partials/home
 * Serves the home page partial view.
 */
router.get('/home', (req, res) => {
    // TODO: Add any data fetching needed for the home partial later
    res.render('partials/home', {
        // Pass data needed specifically by this partial
    });
});

/**
 * GET /partials/login
 * Serves the login page partial view.
 */
router.get('/login', (req, res) => {
    // TODO: Check if user is already logged in? Maybe redirect?
    res.render('partials/login', {
        // Pass data needed specifically by this partial
    });
});

/**
 * GET /partials/register
 * Serves the registration page partial view.
 */
router.get('/register', (req, res) => {
    res.render('partials/register', {
        // Pass data needed specifically by this partial if any
    });
});

// TODO: Add routes for other partials (cabinet, scriptorium, etc.) as they are created.

module.exports = router;