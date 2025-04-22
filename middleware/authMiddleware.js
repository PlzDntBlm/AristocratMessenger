/**
 * middleware/authMiddleware.js
 *
 * Provides middleware functions related to authentication.
 */

/**
 * Middleware to check if a user is authenticated via session.
 * If authenticated, proceeds to the next middleware/route handler.
 * If not authenticated, sends a 401 Unauthorized status (suitable for API/fetch requests).
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        // User is authenticated, proceed to the requested route
        return next();
    } else {
        // User is not authenticated
        // For partial requests (fetch), sending 401 is appropriate.
        // Client-side JS should handle this 401 by redirecting to login.
        console.log("Auth Middleware: Access denied (no session).");
        res.status(401).send("Unauthorized: You must be logged in to access this resource.");
        // TODO: Consider redirecting for non-fetch requests if routes change later
    }
};

module.exports = {
    isAuthenticated
};