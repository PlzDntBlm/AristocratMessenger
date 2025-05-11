/**
 * public/js/components/CabinetComponent.js
 * Defines the Cabinet (view messages) component, allowing users to see their inbox and outbox.
 */
import * as api from '../api.js';
// import { getState } from '../state.js'; // Not currently needed
// import { publish } from '../pubsub.js'; // For future navigation events

/**
 * Creates and returns the root DOM element for the Letter Cabinet page.
 * This component displays inbox and outbox tabs and areas for message lists.
 * @returns {HTMLElement} The main container element for the Cabinet page.
 */
export function CabinetComponent() {
    const container = document.createElement('div');
    container.id = 'component-cabinet';
    container.className = 'p-4 md:p-6';

    const header = document.createElement('h2');
    header.className = 'text-3xl font-semibold text-stone-700 dark:text-stone-300 mb-6 border-b pb-3 dark:border-stone-600';
    header.textContent = 'Your Letter Cabinet';
    container.appendChild(header);

    const tabContainer = document.createElement('div');
    tabContainer.className = 'mb-6 flex border-b border-stone-300 dark:border-stone-600';

    const inboxTabButton = document.createElement('button');
    inboxTabButton.id = 'cabinet-inbox-tab';
    inboxTabButton.dataset.tab = 'inbox';
    inboxTabButton.className = 'py-2 px-4 text-stone-600 dark:text-stone-400 hover:text-yellow-600 dark:hover:text-yellow-500 font-medium focus:outline-none cabinet-tab';
    inboxTabButton.textContent = 'Inbox';

    const outboxTabButton = document.createElement('button');
    outboxTabButton.id = 'cabinet-outbox-tab';
    outboxTabButton.dataset.tab = 'outbox';
    outboxTabButton.className = 'py-2 px-4 text-stone-600 dark:text-stone-400 hover:text-yellow-600 dark:hover:text-yellow-500 font-medium focus:outline-none cabinet-tab';
    outboxTabButton.textContent = 'Outbox (Sent)';

    tabContainer.appendChild(inboxTabButton);
    tabContainer.appendChild(outboxTabButton);
    container.appendChild(tabContainer);

    const messagesContentArea = document.createElement('div');
    messagesContentArea.id = 'cabinet-messages-content';

    const inboxSection = document.createElement('div');
    inboxSection.id = 'cabinet-inbox-section';
    const inboxHeader = document.createElement('h3');
    inboxHeader.className = 'text-xl font-semibold text-stone-700 dark:text-stone-300 mb-4';
    inboxHeader.textContent = 'Received Letters (Inbox)';
    const inboxMessageListDiv = document.createElement('div');
    inboxMessageListDiv.id = 'inbox-message-list';
    inboxMessageListDiv.className = 'space-y-3';
    inboxSection.appendChild(inboxHeader);
    inboxSection.appendChild(inboxMessageListDiv);
    messagesContentArea.appendChild(inboxSection);

    const outboxSection = document.createElement('div');
    outboxSection.id = 'cabinet-outbox-section';
    outboxSection.className = 'hidden';
    const outboxHeader = document.createElement('h3');
    outboxHeader.className = 'text-xl font-semibold text-stone-700 dark:text-stone-300 mb-4';
    outboxHeader.textContent = 'Sent Letters (Outbox)';
    const outboxMessageListDiv = document.createElement('div');
    outboxMessageListDiv.id = 'outbox-message-list';
    outboxMessageListDiv.className = 'space-y-3';
    outboxSection.appendChild(outboxHeader);
    outboxSection.appendChild(outboxMessageListDiv);
    messagesContentArea.appendChild(outboxSection);

    container.appendChild(messagesContentArea);

    let currentTab = 'inbox';
    let inboxLoaded = false;
    let outboxLoaded = false; // Flag for outbox

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
     * Handles the click event on a message item.
     * For now, logs message details. Later will navigate to detail view or trigger an event.
     * @param {object} message - The message object that was clicked.
     */
    function handleMessageItemClick(message) {
        console.log('Cabinet: Clicked message object:', message);
        alert(`Viewing message ID: ${message.id}\nSubject: "${message.subject}"\n(Full detail view coming soon!)`);
        // Future:
        // publish('navigateToMessageDetail', { messageId: message.id });
    }

    /**
     * Renders a list of messages into the specified container.
     * @param {Array<object>} messages - An array of message objects.
     * @param {HTMLElement} targetListDiv - The div element to render messages into.
     * @param {string} type - 'inbox' or 'outbox' to determine displayed user and styles.
     */
    function renderMessages(messages, targetListDiv, type = 'inbox') {
        targetListDiv.innerHTML = '';

        if (!messages || messages.length === 0) {
            targetListDiv.innerHTML = `<p class="text-stone-500 dark:text-stone-400">Your ${type} is empty.</p>`;
            return;
        }

        messages.forEach(msg => {
            const messageItem = document.createElement('div');
            const isUnreadInbox = type === 'inbox' && msg.status !== 'read';
            messageItem.className = `
                p-4 border rounded-md shadow-sm cursor-pointer
                hover:shadow-lg transition-all duration-200 ease-in-out
                ${isUnreadInbox ? 'bg-yellow-100 dark:bg-yellow-900/40 border-yellow-400 dark:border-yellow-700 font-semibold' : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700'}
            `;
            messageItem.dataset.messageId = msg.id;

            const fromToUser = type === 'inbox' ? msg.sender : msg.recipient;
            const fromToLabel = type === 'inbox' ? 'From:' : 'To:';
            const dateToShow = msg.sentAt || msg.createdAt;

            messageItem.innerHTML = `
                <div class="flex justify-between items-center mb-1">
                    <span class="font-medium text-stone-800 dark:text-stone-200">${fromToLabel} ${fromToUser?.username || 'Unknown User'}</span>
                    <span class="text-xs text-stone-500 dark:text-stone-400">${formatDate(dateToShow)}</span>
                </div>
                <div class="text-lg ${isUnreadInbox ? 'text-yellow-700 dark:text-yellow-300' : 'text-yellow-600 dark:text-yellow-400'}">${msg.subject}</div>
                <div class="mt-1 text-xs text-stone-500 dark:text-stone-400">
                    Status: <span class="font-medium ${isUnreadInbox ? 'text-red-600 dark:text-red-400' : (type === 'outbox' || msg.status === 'read' ? 'text-green-600 dark:text-green-400' : 'text-stone-600 dark:text-stone-400')}">${msg.status}</span>
                    ${type === 'inbox' && msg.readAt ? ` (Read: ${formatDate(msg.readAt)})` : ''}
                </div>
            `;

            messageItem.addEventListener('click', () => handleMessageItemClick(msg));
            targetListDiv.appendChild(messageItem);
        });
    }

    /**
     * Fetches and renders inbox messages.
     * @param {boolean} [forceRefresh=false] - Whether to force a refresh even if data was loaded.
     */
    async function loadInboxMessages(forceRefresh = false) {
        if (inboxLoaded && !forceRefresh) return;
        inboxMessageListDiv.innerHTML = '<p class="text-stone-500 dark:text-stone-400">Loading your inbox...</p>';
        try {
            const response = await api.getInboxMessages();
            if (response.success) {
                renderMessages(response.data, inboxMessageListDiv, 'inbox');
                inboxLoaded = true;
            } else {
                inboxMessageListDiv.innerHTML = `<p class="text-red-500 dark:text-red-400">Error loading inbox: ${response.message || 'Unknown error'}</p>`;
                inboxLoaded = false;
            }
        } catch (error) {
            console.error('Failed to fetch inbox messages:', error);
            inboxMessageListDiv.innerHTML = `<p class="text-red-500 dark:text-red-400">Could not fetch your messages. ${error.message}</p>`;
            inboxLoaded = false;
        }
    }

    /**
     * Fetches and renders outbox messages.
     * @param {boolean} [forceRefresh=false] - Whether to force a refresh.
     */
    async function loadOutboxMessages(forceRefresh = false) {
        if (outboxLoaded && !forceRefresh) return;
        outboxMessageListDiv.innerHTML = '<p class="text-stone-500 dark:text-stone-400">Loading your outbox...</p>';
        try {
            const response = await api.getOutboxMessages(); // Call the new API function
            if (response.success) {
                renderMessages(response.data, outboxMessageListDiv, 'outbox'); // Specify type 'outbox'
                outboxLoaded = true;
            } else {
                outboxMessageListDiv.innerHTML = `<p class="text-red-500 dark:text-red-400">Error loading outbox: ${response.message || 'Unknown error'}</p>`;
                outboxLoaded = false;
            }
        } catch (error) {
            console.error('Failed to fetch outbox messages:', error);
            outboxMessageListDiv.innerHTML = `<p class="text-red-500 dark:text-red-400">Could not fetch your sent messages. ${error.message}</p>`;
            outboxLoaded = false;
        }
    }

    /**
     * Sets the active tab in the Cabinet view.
     * @param {string} tabName - The name of the tab to activate ('inbox' or 'outbox').
     */
    function setActiveTab(tabName) {
        const isActiveTab = (targetTab) => tabName === targetTab;

        [inboxTabButton, outboxTabButton].forEach(button => {
            const isCurrentButtonActive = isActiveTab(button.dataset.tab);
            button.classList.toggle('border-b-2', isCurrentButtonActive);
            button.classList.toggle('border-yellow-600', isCurrentButtonActive);
            button.classList.toggle('dark:border-yellow-500', isCurrentButtonActive);
            button.classList.toggle('text-yellow-600', isCurrentButtonActive);
            button.classList.toggle('dark:text-yellow-500', isCurrentButtonActive);
            button.classList.toggle('text-stone-600', !isCurrentButtonActive);
            button.classList.toggle('dark:text-stone-400', !isCurrentButtonActive);
        });

        inboxSection.classList.toggle('hidden', !isActiveTab('inbox'));
        outboxSection.classList.toggle('hidden', !isActiveTab('outbox'));

        currentTab = tabName;
        console.log(`Cabinet: Switched to ${currentTab} tab.`);

        if (currentTab === 'inbox') {
            loadInboxMessages();
        } else if (currentTab === 'outbox') {
            loadOutboxMessages(); // Call function to load outbox messages
        }
    }

    inboxTabButton.addEventListener('click', () => setActiveTab('inbox'));
    outboxTabButton.addEventListener('click', () => setActiveTab('outbox'));

    setActiveTab('inbox'); // Initialize with inbox view

    return container;
}