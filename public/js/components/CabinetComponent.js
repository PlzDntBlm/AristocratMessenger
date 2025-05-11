/**
 * public/js/components/CabinetComponent.js
 * Defines the Cabinet (view messages) component, allowing users to see their inbox and outbox.
 */
import * as api from '../api.js'; // Import the API module
// import { getState } from '../state.js'; // May be needed for user context or other state

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
    inboxMessageListDiv.innerHTML = '<p class="text-stone-500 dark:text-stone-400">Loading your inbox...</p>';
    inboxSection.appendChild(inboxHeader);
    inboxSection.appendChild(inboxMessageListDiv);
    messagesContentArea.appendChild(inboxSection);

    const outboxSection = document.createElement('div');
    outboxSection.id = 'cabinet-outbox-section';
    outboxSection.className = 'hidden'; // Start hidden
    const outboxHeader = document.createElement('h3');
    outboxHeader.className = 'text-xl font-semibold text-stone-700 dark:text-stone-300 mb-4';
    outboxHeader.textContent = 'Sent Letters (Outbox)';
    const outboxMessageListDiv = document.createElement('div');
    outboxMessageListDiv.id = 'outbox-message-list';
    outboxMessageListDiv.className = 'space-y-3';
    outboxMessageListDiv.innerHTML = '<p class="text-stone-500 dark:text-stone-400">Outbox functionality coming soon...</p>';
    outboxSection.appendChild(outboxHeader);
    outboxSection.appendChild(outboxMessageListDiv);
    messagesContentArea.appendChild(outboxSection);

    container.appendChild(messagesContentArea);

    let currentTab = 'inbox';
    let inboxLoaded = false;
    // let outboxLoaded = false; // For future use

    /**
     * Formats a date string or Date object into a more readable format.
     * @param {string|Date} dateInput - The date to format.
     * @returns {string} A formatted date string (e.g., "May 11, 2025, 04:30 PM").
     */
    function formatDate(dateInput) {
        if (!dateInput) return 'N/A';
        try {
            return new Date(dateInput).toLocaleString(undefined, {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } catch (e) {
            return 'Invalid Date';
        }
    }

    /**
     * Renders a list of messages into the specified container.
     * @param {Array<object>} messages - An array of message objects.
     * @param {HTMLElement} targetListDiv - The div element to render messages into.
     * @param {string} type - 'inbox' or 'outbox' to determine displayed user.
     */
    function renderMessages(messages, targetListDiv, type = 'inbox') {
        targetListDiv.innerHTML = ''; // Clear previous content (loading message or old messages)

        if (!messages || messages.length === 0) {
            targetListDiv.innerHTML = `<p class="text-stone-500 dark:text-stone-400">Your ${type === 'inbox' ? 'inbox' : 'outbox'} is empty.</p>`;
            return;
        }

        messages.forEach(msg => {
            const messageItem = document.createElement('div');
            messageItem.className = `
                p-4 border rounded-md shadow-sm cursor-pointer
                hover:shadow-md transition-shadow duration-200
                ${msg.status !== 'read' && type === 'inbox' ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700' : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700'}
            `;
            messageItem.dataset.messageId = msg.id;
            messageItem.dataset.action = 'view-message-detail'; // For future click handling

            const fromToText = type === 'inbox' ? `From: ${msg.sender?.username || 'Unknown Sender'}` : `To: ${msg.recipient?.username || 'Unknown Recipient'}`;
            const dateToShow = type === 'inbox' ? (msg.sentAt || msg.createdAt) : (msg.sentAt || msg.createdAt);

            messageItem.innerHTML = `
                <div class="flex justify-between items-center mb-1">
                    <span class="font-semibold text-stone-700 dark:text-stone-300">${fromToText}</span>
                    <span class="text-xs text-stone-500 dark:text-stone-400">${formatDate(dateToShow)}</span>
                </div>
                <div class="text-lg text-yellow-700 dark:text-yellow-400">${msg.subject}</div>
                <div class="mt-1 text-xs text-stone-500 dark:text-stone-400">
                    Status: <span class="font-medium">${msg.status}</span>
                    ${type === 'inbox' && msg.readAt ? `(Read: ${formatDate(msg.readAt)})` : ''}
                </div>
            `;
            // TODO: Add click listener to messageItem to navigate to message detail view
            targetListDiv.appendChild(messageItem);
        });
    }

    /**
     * Fetches and renders inbox messages.
     */
    async function loadInboxMessages() {
        if (inboxLoaded && currentTab === 'inbox') { // Optional: prevent re-fetch if already loaded and on tab
            // console.log('Inbox already loaded.');
            // return;
        }
        inboxMessageListDiv.innerHTML = '<p class="text-stone-500 dark:text-stone-400">Loading your inbox...</p>';
        try {
            const response = await api.getInboxMessages();
            if (response.success) {
                renderMessages(response.data, inboxMessageListDiv, 'inbox');
                inboxLoaded = true;
            } else {
                inboxMessageListDiv.innerHTML = `<p class="text-red-500">Error loading inbox: ${response.message || 'Unknown error'}</p>`;
            }
        } catch (error) {
            console.error('Failed to fetch inbox messages:', error);
            inboxMessageListDiv.innerHTML = `<p class="text-red-500">Could not fetch your messages. ${error.message}</p>`;
        }
    }

    /**
     * Fetches and renders outbox messages. (Placeholder for future)
     */
    async function loadOutboxMessages() {
        outboxMessageListDiv.innerHTML = '<p class="text-stone-500 dark:text-stone-400">Loading your outbox...</p>';
        // TODO: Implement API call and rendering for outbox
        // const response = await api.getOutboxMessages(); ...
        // renderMessages(response.data, outboxMessageListDiv, 'outbox');
        // outboxLoaded = true;
        setTimeout(() => { // Simulate delay for now
            outboxMessageListDiv.innerHTML = '<p class="text-stone-500 dark:text-stone-400">Outbox functionality coming soon. Sent messages will appear here.</p>';
        }, 1000);
    }

    /**
     * Sets the active tab in the Cabinet view.
     * @param {string} tabName - The name of the tab to activate ('inbox' or 'outbox').
     */
    function setActiveTab(tabName) {
        const isActiveTab = (targetTab) => tabName === targetTab;

        inboxTabButton.classList.toggle('border-b-2', isActiveTab('inbox'));
        inboxTabButton.classList.toggle('border-yellow-600', isActiveTab('inbox'));
        inboxTabButton.classList.toggle('text-yellow-600', isActiveTab('inbox'));
        inboxTabButton.classList.toggle('dark:text-yellow-500', isActiveTab('inbox'));
        inboxTabButton.classList.toggle('text-stone-600', !isActiveTab('inbox'));
        inboxTabButton.classList.toggle('dark:text-stone-400', !isActiveTab('inbox'));

        outboxTabButton.classList.toggle('border-b-2', isActiveTab('outbox'));
        outboxTabButton.classList.toggle('border-yellow-600', isActiveTab('outbox'));
        outboxTabButton.classList.toggle('text-yellow-600', isActiveTab('outbox'));
        outboxTabButton.classList.toggle('dark:text-yellow-500', isActiveTab('outbox'));
        outboxTabButton.classList.toggle('text-stone-600', !isActiveTab('outbox'));
        outboxTabButton.classList.toggle('dark:text-stone-400', !isActiveTab('outbox'));

        inboxSection.classList.toggle('hidden', !isActiveTab('inbox'));
        outboxSection.classList.toggle('hidden', !isActiveTab('outbox'));

        currentTab = tabName;
        console.log(`Cabinet: Switched to ${currentTab} tab.`);

        if (currentTab === 'inbox') {
            loadInboxMessages();
        } else if (currentTab === 'outbox') {
            loadOutboxMessages(); // Call placeholder for now
        }
    }

    inboxTabButton.addEventListener('click', () => setActiveTab('inbox'));
    outboxTabButton.addEventListener('click', () => setActiveTab('outbox'));

    // Initialize by loading the default active tab's content
    setActiveTab('inbox');

    return container;
}