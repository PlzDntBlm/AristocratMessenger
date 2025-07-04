/**
 * public/js/components/AdminPageComponent.js
 * Defines the Admin Page for user management.
 */
import * as api from '../api.js';
import {getState} from '../state.js';

export function AdminPageComponent() {
    const container = document.createElement('div');
    container.id = 'component-admin';
    container.className = 'w-full';

    let userCache = []; // To hold the list of users

    /**
     * Main render function for the component.
     */
    async function render() {
        container.innerHTML = `<h2 class="text-3xl font-heading mb-6">User Management</h2>`;

        try {
            const response = await api.getAllUsersForAdmin();
            if (response.success) {
                userCache = response.data;
                renderUserTable(userCache);
            } else {
                throw new Error(response.message || "Failed to load users.");
            }
        } catch (error) {
            container.innerHTML += `<p class="text-red-500">Error: ${error.message}</p>`;
        }
    }

    /**
     * Renders the user data into a table.
     * @param {Array<object>} users - The array of user objects to render.
     */
    function renderUserTable(users) {
        const loggedInAdminId = getState().currentUser.id;

        const tableContainer = document.createElement('div');
        tableContainer.className = 'overflow-x-auto bg-surface dark:bg-dark-surface p-4 rounded-lg shadow';

        const table = document.createElement('table');
        table.className = 'min-w-full divide-y divide-border-color dark:divide-dark-border-color';
        table.innerHTML = `
            <thead class="bg-surface dark:bg-dark-surface">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-heading tracking-wider text-text-secondary dark:text-dark-text-secondary uppercase">User</th>
                    <th class="px-6 py-3 text-left text-xs font-heading tracking-wider text-text-secondary dark:text-dark-text-secondary uppercase">Role</th>
                    <th class="px-6 py-3 text-left text-xs font-heading tracking-wider text-text-secondary dark:text-dark-text-secondary uppercase">Joined On</th>
                    <th class="px-6 py-3 text-right text-xs font-heading tracking-wider text-text-secondary dark:text-dark-text-secondary uppercase">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-border-color dark:divide-dark-border-color">
                ${users.map(user => `
                    <tr id="user-row-${user.id}" class="hover:bg-gray-100 dark:hover:bg-gray-700">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-text-primary dark:text-dark-text-primary">${user.username}</div>
                            <div class="text-sm text-text-secondary dark:text-dark-text-secondary">${user.email}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary dark:text-dark-text-secondary">
                            ${user.isAdmin ? '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-200 text-yellow-800">Admin</span>' : 'User'}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary dark:text-dark-text-secondary">
                            ${new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            ${user.id !== loggedInAdminId ? `
                                <button data-action="toggle-role" data-user-id="${user.id}" data-is-admin="${user.isAdmin}" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200">${user.isAdmin ? 'Demote' : 'Promote'}</button>
                                <button data-action="delete-user" data-user-id="${user.id}" data-username="${user.username}" class="ml-4 text-destructive hover:text-red-900 dark:text-red-500 dark:hover:text-red-300">Delete</button>
                            ` : '<span class="text-xs text-text-secondary dark:text-dark-text-secondary">(You)</span>'}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        `;

        tableContainer.appendChild(table);
        container.appendChild(tableContainer);
        attachActionListeners();
    }

    /**
     * Attaches event listeners to the action buttons in the user table.
     */
    function attachActionListeners() {
        container.addEventListener('click', async (event) => {
            const target = event.target;
            const action = target.dataset.action;
            const userId = target.dataset.userId;

            if (!action || !userId) return;

            if (action === 'toggle-role') {
                const currentIsAdmin = target.dataset.isAdmin === 'true';
                if (confirm(`Are you sure you want to ${currentIsAdmin ? 'demote' : 'promote'} this user?`)) {
                    await api.updateUserRole(userId, !currentIsAdmin);
                    render(); // Re-render the whole table to show the change
                }
            }

            if (action === 'delete-user') {
                const username = target.dataset.username;
                if (confirm(`Are you sure you want to permanently delete user "${username}"? This cannot be undone.`)) {
                    await api.deleteUser(userId);
                    // Instead of a full re-render, we can just remove the row for a smoother UX
                    document.getElementById(`user-row-${userId}`).remove();
                }
            }
        });
    }

    render(); // Initial render
    return container;
}