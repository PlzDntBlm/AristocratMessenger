/**
 * public/js/components/ScriptoriumComponent.js
 * Defines the Scriptorium (compose message) component.
 */
import * as api from '../api.js';
import { getState, setScriptoriumState } from '../state.js'; // getState and setScriptoriumState
import { subscribe } from '../pubsub.js'; // To subscribe to state changes

export function ScriptoriumComponent() {
    const overlay = document.createElement('div');
    overlay.id = 'scriptorium-overlay';
    overlay.className = 'fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4 hidden'; // Start hidden

    const panel = document.createElement('div');
    panel.id = 'scriptorium-panel';
    panel.className = 'bg-stone-100 p-6 rounded-lg shadow-xl w-full max-w-3xl h-auto max-h-[90vh] flex flex-col dark:bg-stone-800 dark:text-gray-200';

    // --- Header ---
    const headerDiv = document.createElement('div');
    headerDiv.className = 'flex justify-between items-center mb-4 pb-2 border-b border-stone-300 dark:border-stone-600';
    const title = document.createElement('h2');
    title.className = 'text-2xl font-semibold text-stone-700 dark:text-stone-300';
    title.textContent = 'Prepare Your Missive';
    const closeButton = document.createElement('button');
    closeButton.dataset.action = 'close-scriptorium'; // Action handled by app.js
    closeButton.className = 'text-stone-500 hover:text-red-600 dark:text-stone-400 dark:hover:text-red-500 text-2xl font-bold leading-none';
    closeButton.innerHTML = '&times;';
    closeButton.title = 'Close Scriptorium';
    headerDiv.appendChild(title);
    headerDiv.appendChild(closeButton);
    panel.appendChild(headerDiv);

    // --- Main Content Area ---
    const scriptoriumContent = document.createElement('div');
    scriptoriumContent.className = 'flex-grow overflow-hidden flex flex-col md:flex-row gap-4';

    // --- Left Panel (Contacts) ---
    const contactsOuterPanel = document.createElement('div');
    contactsOuterPanel.className = 'w-full md:w-1/3 flex flex-col gap-2 bg-stone-50 dark:bg-stone-700 p-3 rounded border border-stone-200 dark:border-stone-600';

    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.id = 'scriptorium-contact-search';
    searchInput.placeholder = 'Search contacts...';
    searchInput.className = 'w-full p-2 border border-stone-300 rounded dark:bg-stone-600 dark:border-stone-500 dark:text-gray-200 focus:ring-yellow-500 focus:border-yellow-500';
    contactsOuterPanel.appendChild(searchInput);

    const contactsListDiv = document.createElement('div');
    contactsListDiv.id = 'scriptorium-contacts-list';
    contactsListDiv.className = 'flex-grow overflow-y-auto space-y-1 pr-1';
    contactsOuterPanel.appendChild(contactsListDiv);

    // --- Center/Right Panel (Message Form) ---
    const messageFormPanel = document.createElement('div');
    messageFormPanel.id = 'scriptorium-message-form-panel';
    messageFormPanel.className = 'w-full md:w-2/3 p-3 rounded flex flex-col gap-3';

    const recipientDisplayLabel = document.createElement('label');
    recipientDisplayLabel.setAttribute('for', 'scriptorium-recipient-display');
    recipientDisplayLabel.className = 'block text-sm font-medium text-stone-700 dark:text-stone-300';
    recipientDisplayLabel.textContent = 'To:';
    messageFormPanel.appendChild(recipientDisplayLabel);

    const recipientDisplayInput = document.createElement('input');
    recipientDisplayInput.type = 'text';
    recipientDisplayInput.id = 'scriptorium-recipient-display';
    recipientDisplayInput.readOnly = true;
    recipientDisplayInput.className = 'mt-1 block w-full p-2 border border-stone-300 rounded bg-stone-200 dark:bg-stone-600 dark:border-stone-500 dark:text-gray-300 cursor-not-allowed';
    recipientDisplayInput.placeholder = 'Select a recipient from the list';
    messageFormPanel.appendChild(recipientDisplayInput);
    // Hidden input for recipient ID is not strictly needed here if state.js holds it
    // But can be useful if form is submitted traditionally (not in this SPA though)

    const subjectLabel = document.createElement('label');
    subjectLabel.setAttribute('for', 'scriptorium-subject');
    subjectLabel.className = 'block text-sm font-medium text-stone-700 dark:text-stone-300 mt-2';
    subjectLabel.textContent = 'Subject:';
    messageFormPanel.appendChild(subjectLabel);

    const subjectInput = document.createElement('input');
    subjectInput.type = 'text';
    subjectInput.id = 'scriptorium-subject';
    subjectInput.className = 'mt-1 block w-full p-2 border border-stone-300 rounded dark:bg-stone-600 dark:border-stone-500 dark:text-gray-200 focus:ring-yellow-500 focus:border-yellow-500';
    subjectInput.placeholder = 'Enter subject...';
    messageFormPanel.appendChild(subjectInput);
    // TODO: Update state.scriptorium.subject on input

    const bodyLabel = document.createElement('label');
    bodyLabel.setAttribute('for', 'scriptorium-body');
    bodyLabel.className = 'block text-sm font-medium text-stone-700 dark:text-stone-300 mt-2';
    bodyLabel.textContent = 'Your Missive:';
    messageFormPanel.appendChild(bodyLabel);

    const bodyTextarea = document.createElement('textarea');
    bodyTextarea.id = 'scriptorium-body';
    bodyTextarea.rows = '6'; // Adjust as needed
    bodyTextarea.className = 'mt-1 block w-full p-2 border border-stone-300 rounded dark:bg-stone-600 dark:border-stone-500 dark:text-gray-200 focus:ring-yellow-500 focus:border-yellow-500 resize-none'; // 'resize-none' or 'resize-y'
    bodyTextarea.placeholder = 'Pen your letter here...';
    messageFormPanel.appendChild(bodyTextarea);
    // TODO: Update state.scriptorium.body on input

    scriptoriumContent.appendChild(contactsOuterPanel);
    scriptoriumContent.appendChild(messageFormPanel);
    panel.appendChild(scriptoriumContent);

    // --- Footer ---
    const footer = document.createElement('div');
    footer.className = 'mt-auto pt-4 border-t border-stone-300 dark:border-stone-600 flex justify-end gap-3';
    const sendButton = document.createElement('button');
    sendButton.id = 'scriptorium-send-button';
    sendButton.dataset.action = 'send-message'; // Action handled by app.js
    sendButton.className = 'bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50';
    sendButton.textContent = 'Send Letter';
    footer.appendChild(sendButton);
    panel.appendChild(footer);

    overlay.appendChild(panel);

    // --- Component Logic ---
    let allUsersCache = []; // Cache for users to avoid re-fetching if not needed
    const currentLoggedInUser = getState('currentUser');

    async function loadUsers() {
        contactsListDiv.innerHTML = '<p class="text-sm text-stone-500 dark:text-stone-400 p-2">Loading contacts...</p>';
        try {
            const response = await api.getUsers();
            if (response.success && response.data) {
                allUsersCache = response.data.filter(user => user.id !== currentLoggedInUser?.id);
                renderUserList(allUsersCache);
            } else {
                contactsListDiv.innerHTML = `<p class="text-sm text-red-500 p-2">Failed to load contacts: ${response.message || 'Unknown error'}</p>`;
            }
        } catch (error) {
            console.error('Error loading users for Scriptorium:', error);
            contactsListDiv.innerHTML = `<p class="text-sm text-red-500 p-2">Error loading contacts: ${error.message}</p>`;
        }
    }

    function renderUserList(usersToRender) {
        contactsListDiv.innerHTML = '';
        if (usersToRender.length === 0) {
            contactsListDiv.innerHTML = '<p class="text-sm text-stone-500 dark:text-stone-400 p-2">No contacts found.</p>';
            return;
        }
        usersToRender.forEach(user => {
            const userButton = document.createElement('button');
            userButton.className = 'w-full text-left p-2 rounded hover:bg-yellow-200 dark:hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-stone-700 dark:text-stone-300';
            userButton.textContent = user.username;
            userButton.dataset.userId = user.id;
            userButton.dataset.action = 'select-recipient'; // This action is handled by app.js
            contactsListDiv.appendChild(userButton);
        });
    }

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredUsers = allUsersCache.filter(user =>
            user.username.toLowerCase().includes(searchTerm)
        );
        renderUserList(filteredUsers);
    });

    // Function to update UI based on Scriptorium state
    function updateUIFromState(scriptoriumState) {
        // Update visibility (though app.js primarily handles this via class toggle)
        if (scriptoriumState.isOpen && overlay.classList.contains('hidden')) {
            overlay.classList.remove('hidden');
        } else if (!scriptoriumState.isOpen && !overlay.classList.contains('hidden')) {
            overlay.classList.add('hidden');
        }

        // Update recipient display
        recipientDisplayInput.value = scriptoriumState.recipient ? scriptoriumState.recipient.username : '';
        // (Hidden recipient ID input is not strictly necessary here if app.js uses the state)

        // Update subject and body (for future: if user re-opens a draft)
        subjectInput.value = scriptoriumState.subject || '';
        bodyTextarea.value = scriptoriumState.body || '';

        // Enable/disable send button
        // More robust validation: recipient, subject, and body must be non-empty
        const isFormValid = scriptoriumState.recipient &&
            scriptoriumState.recipient.id &&
            subjectInput.value.trim() !== '' && // Check current input value
            bodyTextarea.value.trim() !== '';   // Check current input value
        sendButton.disabled = !isFormValid;
    }

    // Update inputs in central state as user types (debouncing could be added later)
    subjectInput.addEventListener('input', (e) => {
        setScriptoriumState({ subject: e.target.value });
    });
    bodyTextarea.addEventListener('input', (e) => {
        setScriptoriumState({ body: e.target.value });
    });


    // Initial UI setup from current state
    const initialScriptoriumState = getState('scriptorium');
    if (initialScriptoriumState) {
        updateUIFromState(initialScriptoriumState);
    }

    // Subscribe to scriptorium state changes
    const scriptoriumSubscription = subscribe('scriptoriumStateChanged', (newState) => {
        updateUIFromState(newState);
    });

    // Expose loadContacts to be called by app.js
    overlay.loadContacts = loadUsers;

    // TODO: Implement unsubscribe logic if the Scriptorium component can be truly "destroyed" / removed from DOM.
    // For now, since it's just hidden/shown, the subscription persists.

    return overlay;
}