/**
 * routes/api.js
 * Handles general API routes (non-auth actions, data fetching etc.)
 */
const express = require('express');
const router = express.Router();
const {User, Message, Location, ChatRoom} = require('../models');
const {isAuthenticated, isAdministrator} = require('../middleware/authMiddleware');
const {Op} = require('sequelize');

/**
 * GET /api/users/me
 * Uses the isAuthenticated middleware to verify a token and returns
 * the full profile information for the authenticated user.
 */
router.get('/users/me', isAuthenticated, async (req, res) => {
    try {
        // The user's id is available from the decoded token via `req.user.id`
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'username', 'email', 'createdAt', 'isAdmin'],
            include: [{
                model: Location,
                as: 'location',
                attributes: ['name', 'x', 'y', 'type', 'description']
            }]
        });

        if (!user) {
            return res.status(404).json({success: false, message: 'User not found.'});
        }

        res.json({success: true, user: user});

    } catch (error) {
        console.error('Error fetching "me" user data:', error);
        res.status(500).json({success: false, message: 'Error retrieving user profile.'});
    }
});

// --- User API Endpoints ---
// GET /api/users (for contact list) still works, but needs req.user.id for filtering self
/**
 * GET /api/users
 * Fetches a list of users, excluding the currently authenticated user.
 */
router.get('/users', isAuthenticated, async (req, res) => {
    try {
        const users = await User.findAll({
            where: {
                id: {[Op.ne]: req.user.id} // Filter out the current user
            },
            attributes: ['id', 'username'],
            order: [['username', 'ASC']]
        });
        res.json({success: true, data: users});
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({success: false, message: 'Failed to fetch users.'});
    }
});

// --- Message API Endpoints ---

/**
 * POST /api/messages
 * Creates a new message.
 * Expects: { "recipientId": ID, "subject": "string", "body": "text" }
 */
router.post('/messages', isAuthenticated, async (req, res) => {
    const {recipientId, subject, body} = req.body;
    const senderId = req.user.id;

    if (!recipientId || !subject || !body) {
        return res.status(400).json({success: false, message: 'Recipient, subject, and body are required.'});
    }

    if (parseInt(recipientId, 10) === senderId) {
        return res.status(400).json({success: false, message: 'Cannot send a message to yourself.'});
    }

    try {
        // Verify recipient exists
        const recipient = await User.findByPk(recipientId);
        if (!recipient) {
            return res.status(404).json({success: false, message: 'Recipient not found.'});
        }

        const message = await Message.create({
            senderId,
            recipientId,
            subject,
            body,
            status: 'sent', // Mark as 'sent' immediately for this basic implementation
            sentAt: new Date() // Set sentAt timestamp
        });
        // TODO: Implement logic for 'draft' status if needed (e.g., different endpoint or flag)
        // TODO: Later, consider a 'delivered' status update mechanism

        res.status(201).json({success: true, message: 'Message sent successfully!', data: message});
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({success: false, message: 'Failed to send message.'});
    }
});

/**
 * GET /api/messages/inbox
 * Fetches messages received by the logged-in user.
 */
router.get('/messages/inbox', isAuthenticated, async (req, res) => {
    const recipientId = req.user.id;
    try {
        const messages = await Message.findAll({
            where: {recipientId},
            include: [{
                model: User,
                as: 'sender', // Use the alias defined in Message model
                attributes: ['id', 'username'] // Only fetch necessary sender attributes
            }],
            order: [['createdAt', 'DESC']] // Show newest messages first
        });
        res.json({success: true, data: messages});
    } catch (error) {
        console.error('Error fetching inbox:', error);
        res.status(500).json({success: false, message: 'Failed to fetch inbox.'});
    }
});

/**
 * GET /api/messages/outbox
 * Fetches messages sent by the logged-in user.
 */
router.get('/messages/outbox', isAuthenticated, async (req, res) => {
    const senderId = req.user.id;
    try {
        const messages = await Message.findAll({
            where: {senderId},
            include: [{
                model: User,
                as: 'recipient', // Use the alias defined in Message model
                attributes: ['id', 'username'] // Only fetch necessary recipient attributes
            }],
            order: [['createdAt', 'DESC']]
        });
        res.json({success: true, data: messages});
    } catch (error) {
        console.error('Error fetching outbox:', error);
        res.status(500).json({success: false, message: 'Failed to fetch outbox.'});
    }
});

/**
 * GET /api/messages/:id
 * Fetches a single message by its ID.
 * User must be either the sender or the recipient.
 */
router.get('/messages/:id', isAuthenticated, async (req, res) => {
    const messageId = req.params.id;
    const userId = req.user.id;

    try {
        const message = await Message.findByPk(messageId, {
            include: [
                {model: User, as: 'sender', attributes: ['id', 'username']},
                {model: User, as: 'recipient', attributes: ['id', 'username']}
            ]
        });

        if (!message) {
            return res.status(404).json({success: false, message: 'Message not found.'});
        }

        // Authorization: Check if the logged-in user is the sender or recipient
        if (message.senderId !== userId && message.recipientId !== userId) {
            return res.status(403).json({success: false, message: 'You are not authorized to view this message.'});
        }

        // Optional: If user is recipient and message is unread, mark as read
        if (message.recipientId === userId && message.status !== 'read' && !message.readAt) {
            message.status = 'read';
            message.readAt = new Date();
            await message.save();
        }

        res.json({success: true, data: message});
    } catch (error) {
        console.error(`Error fetching message ${messageId}:`, error);
        res.status(500).json({success: false, message: 'Failed to fetch message.'});
    }
});


/**
 * PUT /api/messages/:id/read
 * Marks a message as read by the recipient.
 */
router.put('/messages/:id/read', isAuthenticated, async (req, res) => {
    const messageId = req.params.id;
    const userId = req.user.id; // Recipient

    try {
        const message = await Message.findByPk(messageId);

        if (!message) {
            return res.status(404).json({success: false, message: 'Message not found.'});
        }

        // Authorization: Only the recipient can mark the message as read
        if (message.recipientId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to mark this message as read.'
            });
        }

        if (message.status !== 'read') {
            message.status = 'read';
            message.readAt = new Date();
            await message.save();
            res.json({success: true, message: 'Message marked as read.', data: message});
        } else {
            res.json({success: true, message: 'Message was already read.', data: message});
        }
    } catch (error) {
        console.error(`Error marking message ${messageId} as read:`, error);
        res.status(500).json({success: false, message: 'Failed to mark message as read.'});
    }
});

// --- Location API Endpoints ---
/**
 * GET /api/locations
 * Fetches all locations for map display. This is a public route.
 */
router.get('/locations', async (req, res) => { // <-- isAuthenticated has been removed
    try {
        const locations = await Location.findAll({
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'username']
            }, {
                model: ChatRoom,
                as: 'chatRoom',
                attributes: ['id', 'name'] // We only need the ID and name for the link
            }],
            order: [['name', 'ASC']]
        });
        res.json({success: true, data: locations});
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({success: false, message: 'Failed to fetch locations.'});
    }
});

/**
 * PUT /api/users/profile
 * Allows a logged-in user to update their own profile (username, email).
 */
router.put('/users/profile', isAuthenticated, async (req, res) => {
    const {username, email} = req.body;
    const userId = req.user.id;

    // Basic validation
    if (!username || !email) {
        return res.status(400).json({success: false, message: 'Username and email are required.'});
    }

    try {
        // Check if the new email is already taken by ANOTHER user
        const existingEmailUser = await User.findOne({
            where: {
                email: email,
                id: {[Op.ne]: userId} // Op.ne means "not equal to"
            }
        });

        if (existingEmailUser) {
            return res.status(409).json({success: false, message: 'This email is already in use by another account.'});
        }

        const user = await User.findByPk(userId);
        if (!user) {
            // This case should be rare if isAuthenticated middleware is working
            return res.status(404).json({success: false, message: 'User not found.'});
        }

        // Update user fields
        user.username = username;
        user.email = email;
        await user.save();

        // Fetch the full updated user profile to send back, including location
        const updatedUser = await User.findByPk(userId, {
            attributes: ['id', 'username', 'email', 'createdAt'],
            include: [{
                model: Location,
                as: 'location',
                attributes: ['name', 'x', 'y', 'type', 'description']
            }]
        });

        res.json({
            success: true,
            message: 'Profile updated successfully!',
            user: updatedUser
        });

    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({success: false, message: 'An error occurred while updating your profile.'});
    }
});

/**
 * DELETE /api/users/profile
 * Allows a logged-in user to soft-delete their own account.
 */
router.delete('/users/profile', isAuthenticated, async (req, res) => {
    const userId = req.user.id;

    try {
        const userToDelete = await User.findByPk(userId);

        if (!userToDelete) {
            // Should be impossible if isAuthenticated passed, but good practice
            return res.status(404).json({success: false, message: 'User not found.'});
        }

        // Soft delete the user
        await userToDelete.destroy();

        // Note: We don't need to invalidate the JWT token on the server for this.
        // The client will be responsible for deleting the token and logging the user out.
        // Any future use of the old token will fail to find a user (since paranoid queries exclude deleted ones).

        res.json({success: true, message: 'Your account has been successfully deleted.'});

    } catch (error) {
        console.error(`Error soft-deleting user ${userId}:`, error);
        res.status(500).json({success: false, message: 'An error occurred while deleting your account.'});
    }
});

/**
 * POST /api/locations/check-name
 * Checks if a given location name is available.
 * This is a public route so it can be used during registration before a user is created.
 */
router.post('/locations/check-name', async (req, res) => {
    const {name} = req.body;
    if (!name) {
        return res.status(400).json({available: false, message: 'Name is required.'});
    }
    try {
        const location = await Location.findOne({where: {name: name}});
        if (location) {
            res.json({available: false, message: 'This name is already taken.'});
        } else {
            res.json({available: true, message: 'This name is available.'});
        }
    } catch (error) {
        console.error('Error checking location name:', error);
        res.status(500).json({available: false, message: 'Error checking name availability.'});
    }
});

// --- ADMIN ROUTES ---
/**
 * GET /api/admin/users
 * Fetches a list of all users.
 * Requires the user to be an authenticated administrator.
 */
router.get('/admin/users', [isAuthenticated, isAdministrator], async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'email', 'isAdmin', 'createdAt'],
            order: [['id', 'ASC']]
        });
        res.json({success: true, data: users});
    } catch (error) {
        console.error('Error fetching all users for admin:', error);
        res.status(500).json({success: false, message: 'Failed to fetch user list.'});
    }
});

/**
 * PUT /api/admin/users/:id/role
 * Toggles the isAdmin status of a specific user.
 * Requires administrator privileges.
 */
router.put('/admin/users/:id/role', [isAuthenticated, isAdministrator], async (req, res) => {
    const userIdToChange = req.params.id;
    const {isAdmin} = req.body; // Expecting { isAdmin: true } or { isAdmin: false }

    if (typeof isAdmin !== 'boolean') {
        return res.status(400).json({success: false, message: 'Invalid "isAdmin" value provided.'});
    }

    // Prevent an admin from accidentally removing their own admin status via this endpoint
    if (parseInt(userIdToChange, 10) === req.user.id) {
        return res.status(403).json({success: false, message: 'Administrators cannot change their own role.'});
    }

    try {
        const userToUpdate = await User.findByPk(userIdToChange);
        if (!userToUpdate) {
            return res.status(404).json({success: false, message: 'User to update not found.'});
        }

        userToUpdate.isAdmin = isAdmin;
        await userToUpdate.save();

        res.json({success: true, message: `User role for "${userToUpdate.username}" updated successfully.`});

    } catch (error) {
        console.error(`Error toggling admin role for user ${userIdToChange}:`, error);
        res.status(500).json({success: false, message: 'An error occurred while updating user role.'});
    }
});

/**
 * DELETE /api/admin/users/:id
 * Deletes a specific user.
 * Requires administrator privileges.
 */
router.delete('/admin/users/:id', [isAuthenticated, isAdministrator], async (req, res) => {
    const userIdToDelete = req.params.id;

    // Prevent an admin from deleting themselves
    if (parseInt(userIdToDelete, 10) === req.user.id) {
        return res.status(403).json({success: false, message: 'Administrators cannot delete their own account.'});
    }

    try {
        const userToDelete = await User.findByPk(userIdToDelete);
        if (!userToDelete) {
            return res.status(404).json({success: false, message: 'User to delete not found.'});
        }

        const deletedUsername = userToDelete.username;
        await userToDelete.destroy(); // This is a hard delete

        res.json({success: true, message: `User "${deletedUsername}" has been deleted successfully.`});

    } catch (error) {
        console.error(`Error deleting user ${userIdToDelete}:`, error);
        res.status(500).json({success: false, message: 'An error occurred while deleting the user.'});
    }
});

module.exports = router;