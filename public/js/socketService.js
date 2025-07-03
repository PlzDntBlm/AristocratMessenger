/**
 * public/js/socketService.js
 * Manages the client-side WebSocket connection and event handling.
 */
import {getToken} from './api.js';
import {publish} from './pubsub.js';

let socket = null;

function connect() {
    if (socket && socket.connected) {
        console.log('SocketService: Already connected.');
        return;
    }

    const token = getToken();
    if (!token) {
        console.warn('SocketService: No token found, cannot connect.');
        return;
    }

    // Connect to the server, passing the token for authentication
    socket = io({
        auth: {
            token: token
        }
    });

    socket.on('connect', () => {
        console.log('SocketService: Connected successfully with ID:', socket.id);
    });

    socket.on('disconnect', () => {
        console.log('SocketService: Disconnected.');
    });

    socket.on('connect_error', (err) => {
        console.error('SocketService: Connection Error -', err.message);
    });

    // Listen for new messages from the server and publish them globally
    socket.on('newMessage', (message) => {
        console.log('SocketService: Received new message, publishing event.', message);
        publish('chatMessageReceived', message);
    });

    socket.on('chatError', (error) => {
        console.error('SocketService: Received chat error from server:', error.message);
        alert(`Chat Error: ${error.message}`);
    });
}

function disconnect() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

function joinRoom(roomId) {
    if (!socket || !socket.connected) return;
    socket.emit('joinRoom', roomId);
}

function leaveRoom(roomId) {
    if (!socket || !socket.connected) return;
    socket.emit('leaveRoom', roomId);
}

function sendMessage(roomId, content) {
    if (!socket || !socket.connected) return;
    socket.emit('sendMessage', {roomId, content});
}

export {
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    sendMessage,
};