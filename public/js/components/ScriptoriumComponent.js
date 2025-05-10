/**
 * public/js/components/ScriptoriumComponent.js
 * Defines the Scriptorium (compose message) component.
 */

export function ScriptoriumComponent() {
    const overlay = document.createElement('div');
    overlay.id = 'scriptorium-overlay';
    overlay.className = `
        fixed inset-0 bg-black/60 z-40
        flex items-center justify-center p-4
        hidden
    `; // Start hidden

    const panel = document.createElement('div');
    panel.id = 'scriptorium-panel';
    panel.className = `
        bg-stone-100 p-6 rounded-lg shadow-xl
        w-full max-w-3xl h-auto max-h-[90vh]
        flex flex-col
        dark:bg-stone-800 dark:text-gray-200
    `;

    const headerDiv = document.createElement('div');
    headerDiv.className = 'flex justify-between items-center mb-4 pb-2 border-b border-stone-300 dark:border-stone-600';
    const title = document.createElement('h2');
    title.className = 'text-2xl font-semibold text-stone-700 dark:text-stone-300';
    title.textContent = 'Prepare Your Missive';
    const closeButton = document.createElement('button');
    closeButton.id = 'scriptorium-close-button';
    closeButton.dataset.action = 'close-scriptorium'; // For event delegation
    closeButton.className = 'text-stone-500 hover:text-red-600 dark:text-stone-400 dark:hover:text-red-500 text-2xl font-bold leading-none';
    closeButton.innerHTML = '&times;';
    closeButton.title = 'Close Scriptorium';

    headerDiv.appendChild(title);
    headerDiv.appendChild(closeButton);
    panel.appendChild(headerDiv);

    const scriptoriumContent = document.createElement('div');
    scriptoriumContent.className = 'flex-grow overflow-y-auto flex flex-col md:flex-row gap-4';

    const contactsPanel = document.createElement('div');
    contactsPanel.id = 'scriptorium-contacts-panel';
    contactsPanel.className = 'w-full md:w-1/3 bg-stone-50 dark:bg-stone-700 p-3 rounded border border-stone-200 dark:border-stone-600 min-h-[200px]'; // Added min-height
    contactsPanel.innerHTML = '<p class="text-sm text-stone-600 dark:text-stone-400">Contacts loading...</p>';
    // TODO: Implement contacts list and search (Iteration 31.3)

    const messageFormPanel = document.createElement('div');
    messageFormPanel.id = 'scriptorium-message-form-panel';
    messageFormPanel.className = 'w-full md:w-2/3 p-3 rounded min-h-[200px]'; // Added min-height
    messageFormPanel.innerHTML = '<p class="text-sm text-stone-600 dark:text-stone-400">Message form here...</p>';
    // TODO: Implement message form (Iteration 31.4)

    scriptoriumContent.appendChild(contactsPanel);
    scriptoriumContent.appendChild(messageFormPanel);
    panel.appendChild(scriptoriumContent);

    const footer = document.createElement('div');
    footer.className = 'mt-6 pt-4 border-t border-stone-300 dark:border-stone-600 flex justify-end gap-3';
    const sendButtonPlaceholder = document.createElement('button');
    sendButtonPlaceholder.id = 'scriptorium-send-button'; // Add ID
    sendButtonPlaceholder.dataset.action = 'send-message'; // For event delegation
    sendButtonPlaceholder.className = 'bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded disabled:bg-yellow-600/50';
    sendButtonPlaceholder.textContent = 'Send Letter'; // Changed text
    sendButtonPlaceholder.disabled = true; // Will enable when form is valid
    // TODO: Implement send functionality (Iteration 31.4)

    footer.appendChild(sendButtonPlaceholder);
    panel.appendChild(footer);

    overlay.appendChild(panel);

    return overlay;
}