/**
 * public/js/components/ScriptoriumComponent.js
 * Defines the Scriptorium (compose message) component.
 */
import * as api from '../api.js';
import { getState, setScriptoriumState } from '../state.js';
import { subscribe } from '../pubsub.js';

export function ScriptoriumComponent() {
    const overlay = document.createElement('div');
    overlay.id = 'scriptorium-overlay';
    overlay.className = 'fixed inset-0 bg-black/60 z-1000 flex items-center justify-center p-4 hidden';

    const panel = document.createElement('div');
    panel.id = 'scriptorium-panel';
    panel.className = 'bg-stone-100 p-6 rounded-lg shadow-xl w-full max-w-3xl h-auto max-h-[90vh] flex flex-col dark:bg-stone-800 dark:text-gray-200';

    const headerDiv = document.createElement('div');
    headerDiv.className = 'flex justify-between items-center mb-4 pb-2 border-b border-stone-300 dark:border-stone-600';
    const title = document.createElement('h2');
    title.className = 'text-2xl font-semibold text-stone-700 dark:text-stone-300';
    title.textContent = 'Prepare Your Missive';
    const closeButton = document.createElement('button');
    closeButton.dataset.action = 'close-scriptorium';
    closeButton.className = 'text-stone-500 hover:text-red-600 dark:text-stone-400 dark:hover:text-red-500 text-2xl font-bold leading-none';
    closeButton.innerHTML = '&times;';
    closeButton.title = 'Close Scriptorium';
    headerDiv.appendChild(title);
    headerDiv.appendChild(closeButton);
    panel.appendChild(headerDiv);

    const scriptoriumContent = document.createElement('div');
    scriptoriumContent.className = 'flex-grow overflow-hidden flex flex-col md:flex-row gap-4';

    const contactsOuterPanel = document.createElement('div');
    contactsOuterPanel.className = 'w-full md:w-1/3 flex flex-col gap-2 bg-stone-50 dark:bg-stone-700 p-3 rounded border border-stone-200 dark:border-stone-600';
    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.id = 'scriptorium-contact-search';
    searchInput.placeholder = 'Search contacts...';
    searchInput.className = 'w-full p-2 border border-stone-300 rounded dark:bg-stone-600 dark:border-stone-500 dark:text-gray-200 focus:ring-yellow-500 focus:border-yellow-500';
    const contactsListDiv = document.createElement('div');
    contactsListDiv.id = 'scriptorium-contacts-list';
    contactsListDiv.className = 'flex-grow overflow-y-auto space-y-1 pr-1';
    contactsOuterPanel.appendChild(searchInput);
    contactsOuterPanel.appendChild(contactsListDiv);

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

    const bodyLabel = document.createElement('label');
    bodyLabel.setAttribute('for', 'scriptorium-body');
    bodyLabel.className = 'block text-sm font-medium text-stone-700 dark:text-stone-300 mt-2';
    bodyLabel.textContent = 'Your Missive:';
    messageFormPanel.appendChild(bodyLabel);

    const bodyTextarea = document.createElement('textarea');
    bodyTextarea.id = 'scriptorium-body';
    bodyTextarea.rows = '6';
    bodyTextarea.className = 'mt-1 block w-full p-2 border border-stone-300 rounded dark:bg-stone-600 dark:border-stone-500 dark:text-gray-200 focus:ring-yellow-500 focus:border-yellow-500 resize-none';
    bodyTextarea.placeholder = 'Pen your letter here...';
    messageFormPanel.appendChild(bodyTextarea);

    scriptoriumContent.appendChild(contactsOuterPanel);
    scriptoriumContent.appendChild(messageFormPanel);
    panel.appendChild(scriptoriumContent);

    const footer = document.createElement('div');
    footer.className = 'mt-auto pt-4 border-t border-stone-300 dark:border-stone-600 flex justify-end gap-3';
    const sendButton = document.createElement('button');
    sendButton.id = 'scriptorium-send-button';
    sendButton.dataset.action = 'send-message';
    sendButton.className = 'bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50';
    sendButton.textContent = 'Send Letter';
    footer.appendChild(sendButton);
    panel.appendChild(footer);

    overlay.appendChild(panel);

    // --- Component Logic ---
    let allUsersCache = [];
    let contactsLoaded = false; // Flag to prevent multiple loads if not necessary

    async function loadContactsInternal() {
        if (contactsLoaded && allUsersCache.length > 0) { // Don't reload if already loaded unless cache is empty
            console.log('Scriptorium: Contacts already loaded, using cache.');
            renderUserList(allUsersCache); // Re-render from cache in case search was active
            return;
        }
        contactsListDiv.innerHTML = '<p class="text-sm text-stone-500 dark:text-stone-400 p-2">Loading contacts...</p>';
        const currentLoggedInUser = getState('currentUser'); // Get fresh current user state
        try {
            const response = await api.getUsers();
            if (response.success && response.data) {
                allUsersCache = response.data.filter(user => user.id !== currentLoggedInUser?.id);
                contactsLoaded = true;
                renderUserList(allUsersCache);
            } else {
                contactsLoaded = false; // Allow retry
                contactsListDiv.innerHTML = `<p class="text-sm text-red-500 p-2">Failed to load contacts: ${response.message || 'Unknown error'}</p>`;
            }
        } catch (error) {
            contactsLoaded = false; // Allow retry
            console.error('Error loading users for Scriptorium:', error);
            contactsListDiv.innerHTML = `<p class="text-sm text-red-500 p-2">Error loading contacts: ${error.message}</p>`;
        }
    }

    function renderUserList(usersToRender) {
        contactsListDiv.innerHTML = '';
        if (usersToRender.length === 0 && contactsLoaded) { // Only show "No contacts" if load attempt was made
            contactsListDiv.innerHTML = '<p class="text-sm text-stone-500 dark:text-stone-400 p-2">No other users found.</p>';
            return;
        } else if (usersToRender.length === 0 && !contactsLoaded) {
            // If still loading or failed, message is already set by loadContactsInternal
            return;
        }

        usersToRender.forEach(user => {
            const userButton = document.createElement('button');
            userButton.className = 'w-full text-left p-2 rounded hover:bg-yellow-200 dark:hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-stone-700 dark:text-stone-300';
            userButton.textContent = user.username;
            userButton.dataset.userId = user.id;
            userButton.dataset.action = 'select-recipient';
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

    function updateUIFromState(scriptoriumState) {
        if (scriptoriumState.isOpen) {
            overlay.classList.remove('hidden');
            if (!contactsLoaded) { // Load contacts if Scriptorium is opened and contacts haven't been loaded yet
                loadContactsInternal();
            }
        } else {
            overlay.classList.add('hidden');
            // contactsLoaded = false; // Reset flag so contacts reload next time it opens, if desired
        }

        recipientDisplayInput.value = scriptoriumState.recipient ? scriptoriumState.recipient.username : '';
        subjectInput.value = scriptoriumState.subject || '';
        bodyTextarea.value = scriptoriumState.body || '';

        const isFormValid = scriptoriumState.recipient &&
            scriptoriumState.recipient.id &&
            (scriptoriumState.subject || '').trim() !== '' &&
            (scriptoriumState.body || '').trim() !== '';
        sendButton.disabled = !isFormValid;
    }

    subjectInput.addEventListener('input', (e) => {
        setScriptoriumState({ subject: e.target.value });
    });
    bodyTextarea.addEventListener('input', (e) => {
        setScriptoriumState({ body: e.target.value });
    });

    const initialScriptoriumState = getState('scriptorium');
    if (initialScriptoriumState) {
        updateUIFromState(initialScriptoriumState); // Set initial UI state (especially if isOpen was true)
    }

    const scriptoriumSubscription = subscribe('scriptoriumStateChanged', (newState) => {
        updateUIFromState(newState);
    });

    // Expose a method for app.js to potentially re-trigger or manage, though state change should handle most.
    // This specific `overlay.loadContacts` is not strictly necessary anymore if the subscription
    // to `scriptoriumStateChanged` correctly calls `loadContactsInternal` when `isOpen` becomes true.
    // However, keeping it doesn't hurt and can be a direct trigger if needed.
    overlay.loadContacts = loadContactsInternal;


    return overlay;
}