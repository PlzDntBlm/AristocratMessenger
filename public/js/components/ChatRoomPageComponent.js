/**
 * public/js/components/ChatRoomPageComponent.js
 * Defines the main interface for a chat room with real-time functionality.
 */
import * as api from '../api.js';
import {getState} from '../state.js';
import socketService from '../socketService.js';

function formatMessageDate(dateString) {
    if (!dateString) return '';
    try {
        return new Date(dateString).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    } catch (e) {
        return '';
    }
}

export function ChatRoomPageComponent(roomId) {
    const container = document.createElement('div');
    container.id = `component-chatroom-${roomId}`;
    container.className = 'h-[calc(100vh-200px)] w-full flex flex-col';

    container.innerHTML = `
        <div id="chatroom-header" class="mb-4 pb-3 border-b border-border-color dark:border-dark-border-color">
            <h2 id="chatroom-name" class="text-2xl font-semibold text-text-primary dark:text-dark-text-primary">Loading Room...</h2>
            
            <p id="chatroom-description" class="text-sm text-text-secondary dark:text-dark-text-secondary"></p>
            
            <a href="/home" data-route="home" class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mt-1 inline-block">&laquo; Back to Map</a>
        </div>

        <div id="chatroom-messages-container" class="flex-grow overflow-y-auto mb-4 p-2 bg-white dark:bg-stone-900 rounded shadow-inner">
            <p class="text-center text-text-secondary dark:text-dark-text-secondary">Awaiting connection...</p>
        </div>

        <div id="chatroom-form-container" class="mt-auto">
            <form id="chatroom-send-form" class="flex gap-2">
                <input type="text" id="chatroom-message-input" class="form-input flex-grow" placeholder="Type your message..." autocomplete="off" required disabled>
                <button type="submit" class="btn-accent" disabled>Send</button>
            </form>
        </div>
    `;

    const messagesContainer = container.querySelector('#chatroom-messages-container');
    const roomNameHeader = container.querySelector('#chatroom-name');
    const roomDescription = container.querySelector('#chatroom-description');
    const form = container.querySelector('#chatroom-send-form');
    const input = container.querySelector('#chatroom-message-input');
    const sendButton = container.querySelector('button[type="submit"]');

    function renderMessage(message) {
        const messageRoomId = parseInt(message.ChatRoomId, 10);
        const componentRoomId = parseInt(roomId, 10);
        if (messageRoomId !== componentRoomId) return;

        const currentUserId = getState().currentUser?.id;
        const isMyMessage = message.author.id === currentUserId;

        const messageDiv = document.createElement('div');
        messageDiv.className = `flex items-end gap-2 mb-2 ${isMyMessage ? 'justify-end' : 'justify-start'}`;

        const messageBubble = document.createElement('div');
        messageBubble.className = `max-w-xs md:max-w-md p-2 rounded-lg ${isMyMessage ? 'bg-blue-600 text-white' : 'bg-stone-200 dark:bg-stone-700 text-text-primary dark:text-dark-text-primary'}`;

        messageBubble.innerHTML = `
            ${!isMyMessage ? `<div class="text-xs font-bold mb-1">${message.author.username}</div>` : ''}
            <p class="text-sm" style="word-wrap: break-word;">${message.content}</p>
            <div class="text-xs mt-1 opacity-75 text-right">${formatMessageDate(message.createdAt)}</div>
        `;

        messageDiv.appendChild(messageBubble);
        messagesContainer.appendChild(messageDiv);

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async function initializeRoom() {
        try {
            await socketService.connect();
            socketService.joinRoom(roomId);

            input.disabled = false;
            sendButton.disabled = false;
            messagesContainer.innerHTML = '';

            socketService.registerMessageHandler(renderMessage);

            const [detailsResponse, messagesResponse] = await Promise.all([
                api.getChatRoomDetails(roomId),
                api.getChatRoomMessages(roomId)
            ]);

            if (detailsResponse.success) {
                roomNameHeader.textContent = detailsResponse.data.name;
                roomDescription.textContent = detailsResponse.data.description;
            } else {
                roomNameHeader.textContent = 'Unknown Room';
            }

            if (messagesResponse.success) {
                messagesResponse.data.forEach(renderMessage);
            } else {
                messagesContainer.innerHTML = `<p class="text-red-500">Could not load message history.</p>`;
            }

        } catch (error) {
            console.error('Error initializing chat room:', error);
            roomNameHeader.textContent = 'Error';
            messagesContainer.innerHTML = `<p class="text-red-500">Failed to connect to the chat room.</p>`;
        }
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const content = input.value.trim();
        if (content) {
            socketService.sendMessage(roomId, content);
            input.value = '';
        }
    });

    const observer = new MutationObserver((mutations) => {
        if (!document.body.contains(container)) {
            console.log(`ChatRoom ${roomId}: Component removed from DOM. Cleaning up.`);
            socketService.leaveRoom(roomId);
            socketService.unregisterMessageHandler();
            observer.disconnect();
        }
    });

    observer.observe(document.getElementById('content'), {childList: true});

    initializeRoom();

    return container;
}