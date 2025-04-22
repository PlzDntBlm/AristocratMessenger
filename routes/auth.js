/**
 * routes/auth.js
 *
 * Handles authentication related routes: registration, login, logout.
 */
const express = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../models'); // Import the User model (index.js in models exports all models)

const router = express.Router();
const saltRounds = 10; // Cost factor for bcrypt hashing

/**
 * POST /auth/register
 * Handles user registration form submission.
 */
router.post('/register', async (req, res) => {
    // TODO: Add input validation (username length, valid email, password strength)
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        // TODO: Send a more user-friendly error response, maybe redirect back to form with message
        return res.status(400).send("Username, email, and password are required.");
    }

    try {
        // Check if user already exists (optional but good practice)
        const existingUser = await User.findOne({ where: { email: email } });
        if (existingUser) {
            // TODO: Redirect back to form with "Email already in use" message
            return res.status(409).send("Email already in use.");
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create the user in the database
        const newUser = await User.create({
            username: username,
            email: email,
            password: hashedPassword // Store the hashed password
        });

        console.log("New user created:", newUser.username, newUser.email); // Server log

        // TODO: Redirect to the login page/partial upon successful registration
        // For now, just send a success message
        res.status(201).send(`User ${newUser.username} registered successfully!`);

    } catch (error) {
        console.error("Registration error:", error);
        // TODO: Handle different types of errors (e.g., database errors) more gracefully
        res.status(500).send("An error occurred during registration.");
    }
});

/**
 * POST /auth/login
 * Handles user login form submission.
 */
router.post('/login', async (req, res) => {
    // TODO: Add input validation (e.g., is email valid format?)
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send("Email and password are required.");
    }

    try {
        // Find the user by email
        const user = await User.findOne({ where: { email: email } });

        if (!user) {
            // User not found (send a generic error message for security)
            console.log(`Login attempt failed: User not found for email ${email}`);
            return res.status(401).send("Invalid email or password."); // Unauthorized
        }

        // Compare submitted password with the stored hash
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            // Passwords match - Login successful!
            console.log(`Login successful for user: <span class="math-inline">\{user\.username\} \(</span>{user.email})`);
            // --- SESSION MANAGEMENT WILL GO HERE ---
            // TODO: Step 1: Create a session for the user (e.g., req.session.userId = user.id)
            // TODO: Step 2: Send response indicating success, maybe redirect to home partial via client-side JS
            res.status(200).send(`Login successful for ${user.username}! Session handling TBD.`);
        } else {
            // Passwords don't match
            console.log(`Login attempt failed: Incorrect password for email ${email}`);
            return res.status(401).send("Invalid email or password."); // Unauthorized
        }

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).send("An error occurred during login.");
    }
});

/**
 * POST /auth/logout
 * Handles user logout.
 * TODO: Implement logout logic (destroy session or invalidate token)
 */
router.post('/logout', (req, res) => {
    // Implementation pending...
    res.status(501).send("Logout endpoint not implemented yet.");
});


module.exports = router;