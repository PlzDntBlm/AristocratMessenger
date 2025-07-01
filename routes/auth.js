/**
 * routes/auth.js
 * Handles JWT-based authentication routes.
 */
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const { User, Location } = require('../models');
const router = express.Router();
const saltRounds = 10;

/**
 * POST /auth/register
 */
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        // Return JSON error
        return res.status(400).json({ success: false, message: "Username, email, and password are required." });
    }
    try {
        const existingUser = await User.findOne({ where: { email: email } });
        if (existingUser) {
            // Return JSON error
            return res.status(409).json({ success: false, message: "Email already in use." });
        }
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = await User.create({ username, email, password: hashedPassword });
        console.log("New user created:", newUser.username, newUser.email);
        // Return JSON success
        res.status(201).json({ success: true, message: `User ${newUser.username} registered successfully!` });
    } catch (error) {
        console.error("Registration error:", error);
        // Return JSON error
        res.status(500).json({ success: false, message: "An error occurred during registration." });
    }
});

/**
 * POST /auth/login
 * Validates credentials and returns a signed JWT.
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required." });
    }
    try {
        const user = await User.findOne({
            where: { email: email },
            attributes: ['id', 'username', 'email', 'createdAt', 'password']
        });

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }

        const match = await bcrypt.compare(password, user.password);
        if (match) {
            // User authenticated, create JWT payload
            const payload = {
                id: user.id,
                username: user.username
                // Add roles here in the future, e.g., role: user.role
            };

            // Sign the token
            const token = jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Fetch full user data to return to client (for initial state)
            const userResponseData = {
                id: user.id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt,
                // Location data will now be fetched by the new /api/users/me endpoint
            };

            res.status(200).json({
                success: true,
                message: `Login successful for ${user.username}!`,
                token: token,
                user: userResponseData
            });
        } else {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "An error occurred during login." });
    }
});

/**
 * POST /auth/logout
 * This route is now effectively handled by the client (deleting the token).
 * We can keep a server-side logout route for blocklisting tokens in the future,
 * but for a simple JWT implementation, it's not strictly necessary.
 * For now, we'll return a success message.
 */
router.post('/logout', (req, res) => {
    console.log("User logged out on client-side.");
    res.status(200).json({ success: true, message: "Logout successful." });
});

module.exports = router;