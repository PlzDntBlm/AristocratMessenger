/**
 * routes/chat.js
 * Handles API routes related to the chat feature.
 */
const express = require('express');
const router = express.Router();
const {ChatRoom, ChatMessage, User, Location} = require('../models');
const {isAuthenticated} = require('../middleware/authMiddleware');

/**
 * GET /api/chat/rooms
 * Fetches a list of all available chat rooms.
 * Each room is associated with a user's location.
 */
router.get('/rooms', isAuthenticated, async (req, res) => {
    try {
        const rooms = await ChatRoom.findAll({
            attributes: ['id', 'name', 'description', 'createdAt'],
            include: [{
                model: Location,
                as: 'location',
                attributes: ['name', 'x', 'y'],
                include: {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username']
                }
            }],
            order: [['createdAt', 'DESC']]
        });
        res.json({success: true, data: rooms});
    } catch (error) {
        console.error('Error fetching chat rooms:', error);
        res.status(500).json({success: false, message: 'Failed to fetch chat rooms.'});
    }
});

/**
 * GET /api/chat/rooms/:roomId/messages
 * Fetches the message history for a specific chat room.
 */
router.get('/rooms/:roomId/messages', isAuthenticated, async (req, res) => {
    const {roomId} = req.params;
    try {
        const messages = await ChatMessage.findAll({
            where: {ChatRoomId: roomId},
            include: [{
                model: User,
                as: 'author',
                attributes: ['id', 'username']
            }],
            order: [['createdAt', 'ASC']], // Show oldest messages first
            limit: 50 // Limit to the last 50 messages for initial load
        });
        res.json({success: true, data: messages});
    } catch (error) {
        console.error(`Error fetching messages for room ${roomId}:`, error);
        res.status(500).json({success: false, message: 'Failed to fetch messages.'});
    }
});

module.exports = router;