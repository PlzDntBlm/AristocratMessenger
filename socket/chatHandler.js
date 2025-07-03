/**
 * socket/chatHandler.js
 * Manages all WebSocket events for the chat feature.
 */
const jwt = require('jsonwebtoken');
const {ChatMessage, User} = require('../models');

module.exports = function (io) {

    // Middleware to authenticate socket connections using JWT
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error: No token provided.'));
        }
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return next(new Error('Authentication error: Invalid token.'));
            }
            socket.user = decoded; // Attach user info ({ id, username, isAdmin }) to the socket
            next();
        });
    });

    // Main connection listener
    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id} for User: ${socket.user.username} (ID: ${socket.user.id})`);

        // Event Listener for Joining a Room
        socket.on('joinRoom', (roomId) => {
            socket.join(roomId);
            console.log(`User ${socket.user.username} (Socket: ${socket.id}) joined room: ${roomId}`);
        });

        // Event Listener for Leaving a Room
        socket.on('leaveRoom', (roomId) => {
            socket.leave(roomId);
            console.log(`User ${socket.user.username} (Socket: ${socket.id}) left room: ${roomId}`);
        });

        // --- Event Listener for a new message ---
        socket.on('sendMessage', async (data) => {
            const {roomId, content} = data;
            if (!roomId || !content?.trim()) {
                // Handle error, maybe emit back to the user
                socket.emit('chatError', {message: 'Message content and room ID are required.'});
                return;
            }

            try {
                // 1. Save the message to the database
                const message = await ChatMessage.create({
                    content: content,
                    UserId: socket.user.id,
                    ChatRoomId: roomId
                });

                // 2. Prepare the payload to send to clients
                // We fetch the user details to include the username
                const author = await User.findByPk(socket.user.id, {attributes: ['id', 'username']});
                const messagePayload = {
                    id: message.id,
                    content: message.content,
                    ChatRoomId: message.ChatRoomId,
                    createdAt: message.createdAt,
                    author: author
                };

                // 3. Broadcast the message to everyone in the room
                io.to(roomId).emit('newMessage', messagePayload);
                console.log(`Message from ${socket.user.username} broadcasted to room ${roomId}`);

            } catch (error) {
                console.error('Error saving or broadcasting chat message:', error);
                socket.emit('chatError', {message: 'Could not send your message.'});
            }
        });

        // Disconnect Listener
        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });
};