/**
 * public/js/components/CabinetComponent.js
 * Defines the Cabinet (view messages) component, allowing users to see their inbox and outbox.
 */

// import * as api from '../api.js'; // Will be needed for fetching messages
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

    const inboxTab = document.createElement('button');
    inboxTab.id = 'cabinet-inbox-tab';
    inboxTab.dataset.tab = 'inbox';
    inboxTab.className = 'py-2 px-4 text-stone-600 dark:text-stone-400 hover:text-yellow-600 dark:hover:text-yellow-500 font-medium focus:outline-none cabinet-tab';
    inboxTab.textContent = 'Inbox';

    const outboxTab = document.createElement('button');
    outboxTab.id = 'cabinet-outbox-tab';
    outboxTab.dataset.tab = 'outbox';
    outboxTab.className = 'py-2 px-4 text-stone-600 dark:text-stone-400 hover:text-yellow-600 dark:hover:text-yellow-500 font-medium focus:outline-none cabinet-tab';
    outboxTab.textContent = 'Outbox (Sent)';

    tabContainer.appendChild(inboxTab);
    tabContainer.appendChild(outboxTab);
    container.appendChild(tabContainer);

    const messagesContentArea = document.createElement('div');
    messagesContentArea.id = 'cabinet-messages-content';

    const inboxSection = document.createElement('div');
    inboxSection.id = 'cabinet-inbox-section';
    inboxSection.innerHTML = `
        <h3 class="text-xl font-semibold text-stone-700 dark:text-stone-300 mb-4">Received Letters (Inbox)</h3>
        <div id="inbox-message-list" class="space-y-3">
            <p class="text-stone-500 dark:text-stone-400">Loading your inbox...</p>
            </div>
    `;
    messagesContentArea.appendChild(inboxSection);

    const outboxSection = document.createElement('div');
    outboxSection.id = 'cabinet-outbox-section';
    outboxSection.className = 'hidden';
    outboxSection.innerHTML = `
        <h3 class="text-xl font-semibold text-stone-700 dark:text-stone-300 mb-4">Sent Letters (Outbox)</h3>
        <div id="outbox-message-list" class="space-y-3">
            <p class="text-stone-500 dark:text-stone-400">Outbox functionality coming soon...</p>
            </div>
    `;
    messagesContentArea.appendChild(outboxSection);
    container.appendChild(messagesContentArea);

    let currentTab = 'inbox';

    /**
     * Sets the active tab in the Cabinet view.
     * Updates tab button styling and visibility of content sections.
     * @param {string} tabName - The name of the tab to activate ('inbox' or 'outbox').
     */
    function setActiveTab(tabName) {
        const isActiveTab = (targetTab) => tabName === targetTab;

        // Update Inbox Tab Style
        inboxTab.classList.toggle('border-b-2', isActiveTab('inbox'));
        inboxTab.classList.toggle('border-yellow-600', isActiveTab('inbox'));
        inboxTab.classList.toggle('text-yellow-600', isActiveTab('inbox'));
        inboxTab.classList.toggle('dark:text-yellow-500', isActiveTab('inbox'));
        inboxTab.classList.toggle('text-stone-600', !isActiveTab('inbox')); // Reset non-active color
        inboxTab.classList.toggle('dark:text-stone-400', !isActiveTab('inbox')); // Reset non-active dark color


        // Update Outbox Tab Style
        outboxTab.classList.toggle('border-b-2', isActiveTab('outbox'));
        outboxTab.classList.toggle('border-yellow-600', isActiveTab('outbox'));
        outboxTab.classList.toggle('text-yellow-600', isActiveTab('outbox'));
        outboxTab.classList.toggle('dark:text-yellow-500', isActiveTab('outbox'));
        outboxTab.classList.toggle('text-stone-600', !isActiveTab('outbox')); // Reset non-active color
        outboxTab.classList.toggle('dark:text-stone-400', !isActiveTab('outbox')); // Reset non-active dark color


        // Show/hide content sections
        inboxSection.classList.toggle('hidden', !isActiveTab('inbox'));
        outboxSection.classList.toggle('hidden', !isActiveTab('outbox'));

        currentTab = tabName;
        console.log(`Cabinet: Switched to ${currentTab} tab.`);

        if (currentTab === 'inbox') {
            // TODO: Call function to load/refresh inbox messages (Iteration 32.3)
            // if (typeof loadInboxMessages === 'function') loadInboxMessages();
        } else if (currentTab === 'outbox') {
            // TODO: Call function to load/refresh outbox messages (Future Iteration)
            // if (typeof loadOutboxMessages === 'function') loadOutboxMessages();
        }
    }

    inboxTab.addEventListener('click', () => setActiveTab('inbox'));
    outboxTab.addEventListener('click', () => setActiveTab('outbox'));

    // Initialize the default active tab
    setActiveTab('inbox');

    return container;
}