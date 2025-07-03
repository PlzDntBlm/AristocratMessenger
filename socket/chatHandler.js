/**
 * socket/chatHandler.js
 * Manages all WebSocket events for the chat feature.
 */
const jwt = require('jsonwebtoken');

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

        // --- Event Listener for Joining a Room ---
        socket.on('joinRoom', (roomId) => {
            // Here you could add logic to verify if the user has rights to join this room
            socket.join(roomId);
            console.log(`User ${socket.user.username} (Socket: ${socket.id}) joined room: ${roomId}`);
            // You could emit an event to the room to announce the new user
            // io.to(roomId).emit('userJoined', { username: socket.user.username });
        });

        // --- Event Listener for Leaving a Room ---
        socket.on('leaveRoom', (roomId) => {
            socket.leave(roomId);
            console.log(`User ${socket.user.username} (Socket: ${socket.id}) left room: ${roomId}`);
        });

        // --- Disconnect Listener ---
        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });

        // We will add the 'sendMessage' listener in the next sub-task.
    });
};