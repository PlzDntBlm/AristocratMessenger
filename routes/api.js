/**
 * routes/api.js
 * Handles general API routes (non-auth actions, data fetching etc.)
 */
const express = require('express');
const router = express.Router();

/**
 * GET /api/auth/status
 * Checks the current session and returns the user's login status.
 */
router.get('/auth/status', (req, res) => {
    if (req.session && req.session.userId) {
        // User is logged in
        res.json({
            isLoggedIn: true,
            user: {
                id: req.session.userId,
                username: req.session.username
                // Add other user details stored in session if needed
            }
        });
    } else {
        // User is not logged in
        res.json({ isLoggedIn: false });
    }
});

// TODO: Add other API endpoints here later (e.g., fetching messages)

module.exports = router;