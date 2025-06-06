/**
 * routes/api.js
 * Handles general API routes (non-auth actions, data fetching etc.)
 */
const express = require('express');
const router = express.Router();
const { User, Message ,Location} = require('../models'); // Import User and Message models
const { isAuthenticated } = require('../middleware/authMiddleware'); // Import isAuthenticated middleware
const { Op } = require('sequelize'); // For OR queries

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
            }
        });
    } else {
        // User is not logged in
        res.json({ isLoggedIn: false });
    }
});

// --- User API Endpoints ---
/**
 * GET /api/users
 * Fetches a list of users (id and username).
 * Requires authentication to access the user list for messaging.
 */
router.get('/users', isAuthenticated, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username'], // Only select necessary attributes
            order: [['username', 'ASC']]    // Order alphabetically by username
        });
        // Optional: Filter out the current logged-in user from the list
        // const filteredUsers = users.filter(user => user.id !== req.session.userId);
        // res.json({ success: true, data: filteredUsers });
        res.json({ success: true, data: users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch users.' });
    }
});

// --- Message API Endpoints ---

/**
 * POST /api/messages
 * Creates a new message.
 * Expects: { "recipientId": ID, "subject": "string", "body": "text" }
 */
router.post('/messages', isAuthenticated, async (req, res) => {
    const { recipientId, subject, body } = req.body;
    const senderId = req.session.userId;

    if (!recipientId || !subject || !body) {
        return res.status(400).json({ success: false, message: 'Recipient, subject, and body are required.' });
    }

    if (parseInt(recipientId, 10) === senderId) {
        return res.status(400).json({ success: false, message: 'Cannot send a message to yourself.' });
    }

    try {
        // Verify recipient exists
        const recipient = await User.findByPk(recipientId);
        if (!recipient) {
            return res.status(404).json({ success: false, message: 'Recipient not found.' });
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

        res.status(201).json({ success: true, message: 'Message sent successfully!', data: message });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, message: 'Failed to send message.' });
    }
});

/**
 * GET /api/messages/inbox
 * Fetches messages received by the logged-in user.
 */
router.get('/messages/inbox', isAuthenticated, async (req, res) => {
    const recipientId = req.session.userId;
    try {
        const messages = await Message.findAll({
            where: { recipientId },
            include: [{
                model: User,
                as: 'sender', // Use the alias defined in Message model
                attributes: ['id', 'username'] // Only fetch necessary sender attributes
            }],
            order: [['createdAt', 'DESC']] // Show newest messages first
        });
        res.json({ success: true, data: messages });
    } catch (error) {
        console.error('Error fetching inbox:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch inbox.' });
    }
});

/**
 * GET /api/messages/outbox
 * Fetches messages sent by the logged-in user.
 */
router.get('/messages/outbox', isAuthenticated, async (req, res) => {
    const senderId = req.session.userId;
    try {
        const messages = await Message.findAll({
            where: { senderId },
            include: [{
                model: User,
                as: 'recipient', // Use the alias defined in Message model
                attributes: ['id', 'username'] // Only fetch necessary recipient attributes
            }],
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, data: messages });
    } catch (error) {
        console.error('Error fetching outbox:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch outbox.' });
    }
});

/**
 * GET /api/messages/:id
 * Fetches a single message by its ID.
 * User must be either the sender or the recipient.
 */
router.get('/messages/:id', isAuthenticated, async (req, res) => {
    const messageId = req.params.id;
    const userId = req.session.userId;

    try {
        const message = await Message.findByPk(messageId, {
            include: [
                { model: User, as: 'sender', attributes: ['id', 'username'] },
                { model: User, as: 'recipient', attributes: ['id', 'username'] }
            ]
        });

        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found.' });
        }

        // Authorization: Check if the logged-in user is the sender or recipient
        if (message.senderId !== userId && message.recipientId !== userId) {
            return res.status(403).json({ success: false, message: 'You are not authorized to view this message.' });
        }

        // Optional: If user is recipient and message is unread, mark as read
        if (message.recipientId === userId && message.status !== 'read' && !message.readAt) {
            message.status = 'read';
            message.readAt = new Date();
            await message.save();
        }

        res.json({ success: true, data: message });
    } catch (error) {
        console.error(`Error fetching message ${messageId}:`, error);
        res.status(500).json({ success: false, message: 'Failed to fetch message.' });
    }
});


/**
 * PUT /api/messages/:id/read
 * Marks a message as read by the recipient.
 */
router.put('/messages/:id/read', isAuthenticated, async (req, res) => {
    const messageId = req.params.id;
    const userId = req.session.userId; // Recipient

    try {
        const message = await Message.findByPk(messageId);

        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found.' });
        }

        // Authorization: Only the recipient can mark the message as read
        if (message.recipientId !== userId) {
            return res.status(403).json({ success: false, message: 'You are not authorized to mark this message as read.' });
        }

        if (message.status !== 'read') {
            message.status = 'read';
            message.readAt = new Date();
            await message.save();
            res.json({ success: true, message: 'Message marked as read.', data: message });
        } else {
            res.json({ success: true, message: 'Message was already read.', data: message });
        }
    } catch (error) {
        console.error(`Error marking message ${messageId} as read:`, error);
        res.status(500).json({ success: false, message: 'Failed to mark message as read.' });
    }
});

// --- Location API Endpoints ---
/**
 * GET /api/locations
 * Fetches all locations along with basic user information (username) for map display.
 * Requires authentication.
 */
router.get('/locations', isAuthenticated, async (req, res) => {
    try {
        const locations = await Location.findAll({
            include: [{
                model: User,
                as: 'user', // Alias defined in Location.associate
                attributes: ['id', 'username'] // Only fetch necessary user attributes
            }],
            order: [['name', 'ASC']] // Optional: order by location name
        });
        res.json({ success: true, data: locations });
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch locations.' });
    }
});


module.exports = router;