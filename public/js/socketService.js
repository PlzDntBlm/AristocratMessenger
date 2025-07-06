/**
 * public/js/socketService.js
 * Manages the client-side WebSocket connection and event handling using a singleton pattern.
 */
import {getToken} from './api.js';
import {publish} from './pubsub.js';

const socketService = (() => {
    let socket = null;
    let connectionPromise = null;

    const getSocket = () => {
        if (socket) {
            return Promise.resolve(socket);
        }

        if (connectionPromise) {
            return connectionPromise;
        }

        connectionPromise = new Promise((resolve, reject) => {
            const token = getToken();
            if (!token) {
                console.warn('SocketService: No token found, cannot connect.');
                return reject(new Error('No auth token'));
            }

            const newSocket = io({
                auth: {token},
                path: '/socket.io' // Explicitly define the connection path
            });

            newSocket.on('connect', () => {
                console.log('SocketService: Connected successfully with ID:', newSocket.id);
                socket = newSocket;

                // Set up general listeners once on creation
                socket.on('newMessage', (message) => {
                    publish('chatMessageReceived', message);
                });

                socket.on('chatError', (error) => {
                    console.error('SocketService: Received chat error from server:', error.message);
                    alert(`Chat Error: ${error.message}`);
                });

                socket.on('disconnect', () => {
                    console.log('SocketService: Disconnected.');
                    socket = null; // Reset on disconnect
                    connectionPromise = null;
                });

                resolve(socket);
            });

            newSocket.on('connect_error', (err) => {
                console.error('SocketService: Connection Error -', err.message);
                connectionPromise = null;
                reject(err);
            });
        });

        return connectionPromise;
    };

    return {
        connect: getSocket,
        disconnect: () => {
            if (socket) {
                socket.disconnect();
            }
        },
        joinRoom: async (roomId) => {
            try {
                const s = await getSocket();
                s.emit('joinRoom', roomId);
            } catch (error) {
                console.error('SocketService: Failed to join room', error);
            }
        },
        leaveRoom: async (roomId) => {
            try {
                const s = await getSocket();
                s.emit('leaveRoom', roomId);
            } catch (error) {
                console.error('SocketService: Failed to leave room', error);
            }
        },
        sendMessage: async (roomId, content) => {
            try {
                const s = await getSocket();
                s.emit('sendMessage', {roomId, content});
            } catch (error) {
                console.error('SocketService: Failed to send message', error);
            }
        }
    };
})();

export default socketService;