/**
 * middleware/authMiddleware.js
 *
 * Provides middleware for JWT-based authentication.
 */
const jwt = require('jsonwebtoken');

/**
 * Middleware to verify a JWT from the Authorization header.
 * If the token is valid, it attaches the decoded user payload to `req.user`.
 * If the token is missing or invalid, it sends an error response.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const isAuthenticated = (req, res, next) => {
    // Check for the token in the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log("Auth Middleware: Access denied (No token provided).");
        return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    // Extract the token from "Bearer <token>"
    const token = authHeader.split(' ')[1];

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the decoded payload (e.g., { id, username }) to the request object
        req.user = decoded;

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        console.error("Auth Middleware: Invalid token.", error.message);
        return res.status(403).json({ success: false, message: 'Invalid token.' });
    }
};

/**
 * Middleware to check if the authenticated user is an administrator.
 * Must be used AFTER the isAuthenticated middleware.
 */
const isAdministrator = (req, res, next) => {
    // req.user is attached by the isAuthenticated middleware
    if (req.user && req.user.isAdmin) {
        // User is an admin, proceed to the requested route
        next();
    } else {
        // User is not an admin
        console.log("Auth Middleware: Admin access denied.");
        res.status(403).json({ success: false, message: 'Forbidden. Administrator access required.' });
    }
};

module.exports = {
    isAuthenticated,
    isAdministrator
};