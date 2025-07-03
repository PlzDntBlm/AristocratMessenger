/**
 * public/js/components/ChatRoomPageComponent.js
 * Defines the main interface for a chat room.
 */
import * as api from '../api.js';
import {getState} from '../state.js';

// Helper to format dates for chat messages
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
    container.className = 'p-4 md:p-6 h-full flex flex-col';

    // --- Main Structure ---
    container.innerHTML = `
        <div id="chatroom-header" class="mb-4 pb-3 border-b border-border-color dark:border-dark-border-color">
            <h2 id="chatroom-name" class="text-2xl font-semibold text-text-primary dark:text-dark-text-primary">Loading Room...</h2>
            <p id="chatroom-description" class="text-sm text-text-secondary dark:text-dark-text-secondary"></p>
        </div>

        <div id="chatroom-messages-container" class="flex-grow overflow-y-auto mb-4 p-2 bg-white dark:bg-stone-900 rounded shadow-inner">
            <p class="text-center text-text-secondary dark:text-dark-text-secondary">Fetching message history...</p>
        </div>

        <div id="chatroom-form-container" class="mt-auto">
            <form id="chatroom-send-form" class="flex gap-2">
                <input type="text" id="chatroom-message-input" class="form-input flex-grow" placeholder="Type your message..." autocomplete="off">
                <button type="submit" class="btn-accent">Send</button>
            </form>
        </div>
    `;

    const messagesContainer = container.querySelector('#chatroom-messages-container');
    const roomNameHeader = container.querySelector('#chatroom-name');

    /**
     * Renders a single message object into the messages container.
     */
    function renderMessage(message) {
        const currentUserId = getState().currentUser?.id;
        const isMyMessage = message.author.id === currentUserId;

        const messageDiv = document.createElement('div');
        messageDiv.className = `flex items-end gap-2 mb-2 ${isMyMessage ? 'justify-end' : 'justify-start'}`;

        const messageBubble = document.createElement('div');
        messageBubble.className = `max-w-xs md:max-w-md p-2 rounded-lg ${isMyMessage ? 'bg-blue-500 text-white' : 'bg-stone-200 dark:bg-stone-700 text-text-primary dark:text-dark-text-primary'}`;

        messageBubble.innerHTML = `
            ${!isMyMessage ? `<div class="text-xs font-bold mb-1">${message.author.username}</div>` : ''}
            <p class="text-sm">${message.content}</p>
            <div class="text-xs mt-1 opacity-75 text-right">${formatMessageDate(message.createdAt)}</div>
        `;

        messageDiv.appendChild(messageBubble);
        messagesContainer.appendChild(messageDiv);

        // Scroll to the bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }


    /**
     * Fetches initial data (room details and message history)
     */
    async function initializeRoom() {
        try {
            // We'll add a getRoomDetails API call later if needed, for now we use history
            const messagesResponse = await api.getChatRoomMessages(roomId);

            if (messagesResponse.success) {
                messagesContainer.innerHTML = ''; // Clear "loading" message
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

    // Initial load
    initializeRoom();

    return container;
}