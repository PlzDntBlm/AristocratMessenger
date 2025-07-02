/**
 * routes/auth.js
 * Handles JWT-based authentication routes.
 */
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const { User, Location, sequelize} = require('../models');
const router = express.Router();
const saltRounds = 10;
const MIN_DISTANCE_SQUARED = 25; // Minimum distance of 5km, squared for efficiency

/**
 * Helper function to calculate the squared distance between two points.
 * Using squared distance avoids costly square root operations.
 * @param {object} p1 - Point 1 with x and y properties.
 * @param {object} p2 - Point 2 with x and y properties.
 * @returns {number} The squared distance.
 */
function getSquaredDistance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return dx * dx + dy * dy;
}


/**
 * POST /auth/register
 * Creates a new User and their initial Location in a single transaction.
 * Expects: { username, email, password, locationName, x, y }
 */
router.post('/register', async (req, res) => {
    const { username, email, password, locationName, x, y } = req.body;

    // --- 1. Basic Validation ---
    if (!username || !email || !password || !locationName || x === undefined || y === undefined) {
        return res.status(400).json({ success: false, message: "All fields, including location name and coordinates, are required." });
    }

    const t = await sequelize.transaction(); // Start a transaction

    try {
        // --- 2. Advanced Validation (within the transaction) ---
        // Check for existing user email
        const existingUser = await User.findOne({ where: { email: email }, transaction: t });
        if (existingUser) {
            await t.rollback();
            return res.status(409).json({ success: false, message: "This email address is already registered." });
        }

        // Check for unique location name
        const existingLocationName = await Location.findOne({ where: { name: locationName }, transaction: t });
        if (existingLocationName) {
            await t.rollback();
            return res.status(409).json({ success: false, message: "This location name is already taken. Please choose another." });
        }

        // Check for minimum distance from other locations
        const allLocations = await Location.findAll({ transaction: t });
        for (const loc of allLocations) {
            if (getSquaredDistance({ x, y }, loc) < MIN_DISTANCE_SQUARED) {
                await t.rollback();
                return res.status(409).json({ success: false, message: `Your chosen location is too close to "${loc.name}". Please select a different spot.` });
            }
        }

        // --- 3. Create Records ---
        // All checks passed, proceed with creation
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create the user
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword
        }, { transaction: t });

        // Create the associated location
        await Location.create({
            UserId: newUser.id,
            name: locationName,
            x: parseInt(x, 10),
            y: parseInt(y, 10),
            type: 'settlement', // Default type for new user locations
            description: `The home of ${username}.`
        }, { transaction: t });

        // If everything was successful, commit the transaction
        await t.commit();

        console.log("New user and location created:", newUser.username, locationName);
        res.status(201).json({ success: true, message: `Lord ${newUser.username} has established their seat at ${locationName}! You may now log in.` });

    } catch (error) {
        // If any error occurred, rollback the transaction
        await t.rollback();
        console.error("Registration transaction error:", error);
        res.status(500).json({ success: false, message: "An unexpected error occurred during registration." });
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