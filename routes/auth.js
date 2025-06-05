/**
 * routes/auth.js
 * Handles authentication related routes: registration, login, logout.
 */
const express = require('express');
const bcrypt = require('bcrypt');
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
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required." });
    }
    try {
        const user = await User.findOne({
            where: { email: email },
            include: [{ // Include location data on login
                model: Location,
                as: 'location',
                attributes: ['name', 'x', 'y', 'type', 'description']
            }],
            // Also fetch attributes needed for the profile pane that might not be in the session
            attributes: ['id', 'username', 'email', 'createdAt', 'password'] // Include password for bcrypt.compare
        });

        if (!user) {
            console.log(`Login attempt failed: User not found for email ${email}`);
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }

        const match = await bcrypt.compare(password, user.password);
        if (match) {
            console.log(`Login successful for user: ${user.username} (${user.email})`);
            req.session.userId = user.id;
            req.session.username = user.username; // Keep session lean, full object in response

            // Construct the user object for the response, excluding password
            const userResponseData = {
                id: user.id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt,
                location: user.location || null
            };

            res.status(200).json({
                success: true,
                message: `Login successful for ${user.username}!`,
                user: userResponseData // Send back detailed user info
            });
        } else {
            console.log(`Login attempt failed: Incorrect password for email ${email}`);
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "An error occurred during login." });
    }
});

/**
 * POST /auth/logout
 */
router.post('/logout', (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Session destruction error:", err);
            return res.status(500).json({ success: false, message: "Logout failed." });
        }
        res.clearCookie('connect.sid');
        console.log("User logged out, session destroyed.");
        // Return JSON success
        res.status(200).json({ success: true, message: "Logout successful." });
    });
});

module.exports = router;