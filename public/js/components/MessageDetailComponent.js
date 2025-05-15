/**
 * public/js/components/MessageDetailComponent.js
 * Defines the Message Detail component for displaying a single message.
 */
import * as api from '../api.js';
import { getState } from '../state.js';
import { publish } from '../pubsub.js'; // For potential future actions like "reply"

/**
 * Formats a date string or Date object into a more readable format.
 * @param {string|Date|null} dateInput - The date to format.
 * @returns {string} A formatted date string (e.g., "May 11, 2025, 04:30 PM") or 'N/A'.
 */
function formatDate(dateInput) {
    if (!dateInput) return 'N/A';
    try {
        return new Date(dateInput).toLocaleString(undefined, {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch (e) {
        console.error("Error formatting date:", dateInput, e);
        return 'Invalid Date';
    }
}

/**
 * Creates and returns the root DOM element for the Message Detail page.
 * Fetches and displays the details of a specific message.
 * @param {string|number} messageId - The ID of the message to display.
 * @returns {HTMLElement} The main container element for the Message Detail page.
 */
export function MessageDetailComponent(messageId) {
    const container = document.createElement('div');
    container.id = `component-message-detail-${messageId}`;
    container.className = 'p-4 md:p-6';

    const loadingMessage = document.createElement('p');
    loadingMessage.className = 'text-stone-600 dark:text-stone-400';
    loadingMessage.textContent = 'Loading message details...';
    container.appendChild(loadingMessage);

    /**
     * Fetches message details and renders them, or shows an error.
     * @async
     */
    async function loadMessageDetails() {
        try {
            const response = await api.getMessageById(messageId);
            if (response.success && response.data) {
                const message = response.data;
                const currentUserId = getState('currentUser')?.id;
                renderMessage(message, currentUserId);
                // If this was an unread inbox message, the API call already marked it read.
                // We might want to refresh the cabinet list or update unread count.
                // For now, we can publish an event that CabinetComponent *could* listen to.
                if (message.recipientId === currentUserId) {
                    publish('messageRead', { messageId: message.id });
                }
            } else {
                renderError(response.message || 'Could not load message.');
            }
        } catch (error) {
            console.error(`MessageDetailComponent: Error fetching message ${messageId}:`, error);
            renderError(error.message || 'An unexpected error occurred while fetching the message.');
        }
    }

    /**
     * Renders the message details into the container.
     * @param {object} msg - The message object.
     * @param {number|null} currentUserId - The ID of the currently logged-in user.
     */
    function renderMessage(msg, currentUserId) {
        container.innerHTML = ''; // Clear loading/error message

        const isCurrentUserSender = msg.senderId === currentUserId;
        const isCurrentUserRecipient = msg.recipientId === currentUserId;

        const header = document.createElement('h2');
        header.className = 'text-2xl font-semibold text-stone-700 dark:text-stone-300 mb-2';
        header.textContent = msg.subject;
        container.appendChild(header);

        const detailsGrid = document.createElement('div');
        detailsGrid.className = 'grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2 mb-6 pb-4 border-b border-stone-300 dark:border-stone-600';

        const fromDetail = document.createElement('div');
        fromDetail.innerHTML = `
            <span class="font-medium text-stone-600 dark:text-stone-400">From:</span>
            <span class="text-stone-800 dark:text-stone-200 ml-2">${msg.sender?.username || 'Unknown User'} ${isCurrentUserSender ? '(You)' : ''}</span>
        `;
        detailsGrid.appendChild(fromDetail);

        const toDetail = document.createElement('div');
        toDetail.innerHTML = `
            <span class="font-medium text-stone-600 dark:text-stone-400">To:</span>
            <span class="text-stone-800 dark:text-stone-200 ml-2">${msg.recipient?.username || 'Unknown User'} ${isCurrentUserRecipient ? '(You)' : ''}</span>
        `;
        detailsGrid.appendChild(toDetail);

        const sentAtDetail = document.createElement('div');
        sentAtDetail.innerHTML = `
            <span class="font-medium text-stone-600 dark:text-stone-400">Sent:</span>
            <span class="text-stone-800 dark:text-stone-200 ml-2">${formatDate(msg.sentAt || msg.createdAt)}</span>
        `;
        detailsGrid.appendChild(sentAtDetail);

        const statusDetail = document.createElement('div');
        statusDetail.innerHTML = `
            <span class="font-medium text-stone-600 dark:text-stone-400">Status:</span>
            <span class="text-stone-800 dark:text-stone-200 ml-2">${msg.status}</span>
        `;
        detailsGrid.appendChild(statusDetail);

        if (msg.readAt && isCurrentUserRecipient) {
            const readAtDetail = document.createElement('div');
            readAtDetail.innerHTML = `
                <span class="font-medium text-stone-600 dark:text-stone-400">Read:</span>
                <span class="text-stone-800 dark:text-stone-200 ml-2">${formatDate(msg.readAt)}</span>
            `;
            detailsGrid.appendChild(readAtDetail);
        }
        container.appendChild(detailsGrid);

        const bodyContainer = document.createElement('div');
        bodyContainer.className = 'bg-white dark:bg-stone-800 p-4 rounded-md shadow';

        const bodyHeader = document.createElement('h3');
        bodyHeader.className = 'text-lg font-semibold text-stone-700 dark:text-stone-300 mb-2';
        bodyHeader.textContent = 'Letter Contents:';
        bodyContainer.appendChild(bodyHeader);

        const bodyParagraph = document.createElement('p');
        bodyParagraph.className = 'text-stone-700 dark:text-stone-300 whitespace-pre-wrap'; // Preserve line breaks
        bodyParagraph.textContent = msg.body;
        bodyContainer.appendChild(bodyParagraph);

        container.appendChild(bodyContainer);

        // "Back to Cabinet" button
        const backButton = document.createElement('button');
        backButton.id = 'back-to-cabinet-button';
        backButton.className = 'mt-6 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none';
        backButton.textContent = 'Back to Cabinet';
        backButton.addEventListener('click', () => {
            // Navigate back to the cabinet, or use history.back() if appropriate.
            // For SPA, explicit navigation is often better.
            // This relies on app.js to have 'cabinet' route registered
            history.pushState({ route: 'cabinet' }, '', '/cabinet');
            publish('navigateToRoute', { routeName: 'cabinet' }); // app.js should listen to this
        });
        container.appendChild(backButton);
    }

    /**
     * Renders an error message into the container.
     * @param {string} errorMessage - The error message to display.
     */
    function renderError(errorMessage) {
        container.innerHTML = ''; // Clear loading message
        const errorP = document.createElement('p');
        errorP.className = 'text-red-600 dark:text-red-400';
        errorP.textContent = `Error: ${errorMessage}`;

        const tryAgainButton = document.createElement('button');
        tryAgainButton.className = 'mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded';
        tryAgainButton.textContent = 'Try Again';
        tryAgainButton.addEventListener('click', loadMessageDetails);

        const backButton = document.createElement('button');
        backButton.className = 'mt-4 ml-2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded';
        backButton.textContent = 'Back to Cabinet';
        backButton.addEventListener('click', () => {
            history.pushState({ route: 'cabinet' }, '', '/cabinet');
            publish('navigateToRoute', { routeName: 'cabinet' });
        });

        container.appendChild(errorP);
        container.appendChild(tryAgainButton);
        container.appendChild(backButton);
    }

    // Initial load
    loadMessageDetails();

    return container;
}