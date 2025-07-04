/**
 * public/js/components/ProfilePaneComponent.js
 * Defines the Profile Pane component with view and edit modes.
 */
import * as api from '../api.js';
import {getState, setAuthState, setProfilePaneState} from '../state.js';
import {publish, subscribe} from '../pubsub.js';

function formatDateForProfile(dateInput) {
    if (!dateInput) return 'N/A';
    try {
        return new Date(dateInput).toLocaleDateString(undefined, {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    } catch (e) {
        console.error("Error formatting date for profile:", dateInput, e);
        return 'Invalid Date';
    }
}

export function ProfilePaneComponent() {
    const pane = document.createElement('div');
    pane.id = 'profile-pane';
    pane.className = `fixed top-0 left-0 h-full w-[350px] bg-stone-50 dark:bg-stone-800 shadow-2xl z-[1020] transform -translate-x-full transition-transform duration-300 ease-in-out flex flex-col`;

    let isEditing = false;
    let backdropElement = null;

    // --- Create Static Elements ---
    const paneHeader = document.createElement('div');
    paneHeader.className = 'p-4 border-b border-stone-200 dark:border-stone-700 flex justify-between items-center';
    const paneTitle = document.createElement('h2');
    paneTitle.id = 'profile-pane-title';
    paneTitle.className = 'text-xl font-semibold text-stone-700 dark:text-stone-200';
    paneHeader.appendChild(paneTitle);

    const closeButtonContainer = document.createElement('div');
    closeButtonContainer.id = 'profile-pane-close-button';
    closeButtonContainer.className = 'absolute top-0 -right-[30px] h-[40px] w-[30px] bg-yellow-600 hover:bg-yellow-700 flex items-center justify-center cursor-pointer rounded-r-md shadow-md opacity-0 transition-opacity duration-300 ease-in-out pointer-events-none';
    closeButtonContainer.title = 'Close Profile';
    closeButtonContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="white" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>`;

    const paneContent = document.createElement('div');
    paneContent.id = 'profile-pane-content';
    paneContent.className = 'p-4 space-y-4 flex-grow overflow-y-auto';

    const paneFooter = document.createElement('div');
    paneFooter.id = 'profile-pane-footer';
    paneFooter.className = 'p-4 border-t border-stone-200 dark:border-stone-700 mt-auto';

    // Append static parts
    pane.appendChild(closeButtonContainer);
    pane.appendChild(paneHeader);
    pane.appendChild(paneContent);
    pane.appendChild(paneFooter);

    /**
     * Toggles the pane between view and edit modes.
     * @param {boolean} editing - True to enter edit mode, false to enter view mode.
     */
    function toggleEditMode(editing) {
        isEditing = editing;
        if (isEditing) {
            renderEditView();
        } else {
            renderViewMode();
        }
    }

    /**
     * Renders the standard read-only view of the profile.
     */
    function renderViewMode() {
        const currentUser = getState().currentUser;
        paneFooter.innerHTML = ''; // Clear footer

        const editProfileButton = document.createElement('button');
        editProfileButton.textContent = 'Edit Profile';
        editProfileButton.className = 'w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50';
        editProfileButton.disabled = !currentUser; // Disable if no user
        editProfileButton.onclick = () => toggleEditMode(true);

        const logoutButton = document.createElement('button');
        logoutButton.textContent = 'Logout';
        logoutButton.className = 'w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-3 focus:outline-none focus:ring-2 focus:ring-red-400';
        logoutButton.onclick = () => publish('requestLogout');

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete Account';
        deleteButton.className = 'w-full text-destructive dark:text-red-500 hover:underline text-xs mt-4';
        deleteButton.onclick = handleDeleteProfile;

        paneFooter.appendChild(editProfileButton);
        paneFooter.appendChild(logoutButton);
        paneFooter.appendChild(deleteButton);

        populateProfileData(); // Repopulate the main content area
    }

    /**
     * Renders the profile content as an editable form.
     */
    function renderEditView() {
        const currentUser = getState().currentUser;
        if (!currentUser) return; // Should not happen if edit button is clicked correctly

        paneContent.innerHTML = `
            <div id="profile-edit-error" class="text-red-500 text-sm mb-2"></div>
            <div class="text-center mb-4">
                <img id="profile-pic-preview" src="${currentUser.profilePictureUrl || 'https://via.placeholder.com/150/stone/stone'}" alt="Profile Picture Preview" class="w-32 h-32 rounded-full mx-auto object-cover border-4 border-stone-200 dark:border-stone-600">
                <label for="profile-pic-upload" class="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                    Change Picture
                    <input type="file" id="profile-pic-upload" class="hidden" accept="image/*">
                </label>
            </div>
            <div>
                <label for="profile-edit-username" class="block text-sm font-medium text-stone-600 dark:text-stone-400">Username</label>
                <input type="text" id="profile-edit-username" value="${currentUser.username}" class="mt-1 block w-full p-2 border border-stone-300 rounded dark:bg-stone-600 dark:border-stone-500 dark:text-gray-200 focus:ring-yellow-500 focus:border-yellow-500">
            </div>
            <div>
                <label for="profile-edit-email" class="block text-sm font-medium text-stone-600 dark:text-stone-400">Email</label>
                <input type="email" id="profile-edit-email" value="${currentUser.email}" class="mt-1 block w-full p-2 border border-stone-300 rounded dark:bg-stone-600 dark:border-stone-500 dark:text-gray-200 focus:ring-yellow-500 focus:border-yellow-500">
            </div>
        `;

        const fileInput = pane.querySelector('#profile-pic-upload');
        const previewImage = pane.querySelector('#profile-pic-preview');
        fileInput.addEventListener('change', () => {
            const file = fileInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewImage.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        paneFooter.innerHTML = ''; // Clear footer

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save Changes';
        saveButton.className = 'w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-400';
        saveButton.onclick = handleSaveChanges;

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.className = 'w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mt-3 focus:outline-none focus:ring-2 focus:ring-gray-400';
        cancelButton.onclick = () => toggleEditMode(false);

        paneFooter.appendChild(saveButton);
        paneFooter.appendChild(cancelButton);
    }

    /**
     * Handles the logic for saving profile changes.
     */
    async function handleSaveChanges() {
        const usernameInput = pane.querySelector('#profile-edit-username');
        const emailInput = pane.querySelector('#profile-edit-email');
        const fileInput = pane.querySelector('#profile-pic-upload');
        const errorDiv = pane.querySelector('#profile-edit-error');
        const saveButton = paneFooter.querySelector('button');

        const updatedData = {
            username: usernameInput.value.trim(),
            email: emailInput.value.trim(),
        };

        if (!updatedData.username || !updatedData.email) {
            errorDiv.textContent = 'Username and email cannot be empty.';
            return;
        }

        errorDiv.textContent = '';
        saveButton.disabled = true;
        saveButton.textContent = 'Saving...';

        try {
            if (fileInput.files[0]) {
                const formData = new FormData();
                formData.append('profilePicture', fileInput.files[0]);
                const uploadResult = await api.uploadProfilePicture(formData);
                if (!uploadResult.success) {
                    throw new Error(uploadResult.message || 'Failed to upload picture.');
                }
            }

            const result = await api.updateUserProfile(updatedData);

            if (result.success) {
                setAuthState(true, result.user);
                toggleEditMode(false);
            } else {
                throw new Error(result.message || 'Failed to save changes.');
            }
        } catch (error) {
            errorDiv.textContent = error.message;
            saveButton.disabled = false;
            saveButton.textContent = 'Save Changes';
        }
    }

    async function handleDeleteProfile() {
        if (!confirm('Are you sure you want to permanently delete your account? All of your messages and location data will be disassociated. This action cannot be undone.')) {
            return;
        }

        // Second, more aggressive confirmation
        if (!confirm('FINAL WARNING: This is your last chance to turn back. Are you absolutely certain?')) {
            return;
        }

        try {
            const result = await api.deleteMyProfile();
            if (result.success) {
                alert('Your account has been deleted. You will now be logged out.');
                // The handleLogout function in app.js will clear the token and redirect.
                publish('requestLogout');
            } else {
                throw new Error(result.message || 'Failed to delete account.');
            }
        } catch (error) {
            alert(`Error deleting account: ${error.message}`);
        }
    }

    /**
     * Populates the profile pane's content area with user data (view mode).
     */
    function populateProfileData() {
        const currentUser = getState().currentUser;
        if (!currentUser || !currentUser.id) {
            paneTitle.textContent = 'Profile';
            paneContent.innerHTML = '<p class="text-stone-500 dark:text-stone-400 p-4">Not currently logged in.</p>';
            return;
        }

        paneTitle.textContent = currentUser.location ? `${currentUser.username} of ${currentUser.location.name}` : `${currentUser.username}'s Profile`;
        paneContent.innerHTML = `
            <div class="text-center mb-4">
                 <img src="${currentUser.profilePictureUrl || 'https://via.placeholder.com/150/stone/stone'}" alt="Profile Picture" class="w-32 h-32 rounded-full mx-auto object-cover border-4 border-stone-200 dark:border-stone-600">
            </div>
            <div class="mb-3">
                <h3 class="text-lg font-semibold text-stone-700 dark:text-stone-300">${currentUser.username}</h3>
                <p class="text-sm text-stone-500 dark:text-stone-400">${currentUser.email}</p>
            </div>
            <div>
                <h4 class="text-md font-medium text-stone-600 dark:text-stone-400">Location:</h4>
                ${currentUser.location ? `<p class="text-sm text-stone-500 dark:text-stone-400">${currentUser.location.name || 'Not Set'}</p>` : `<p class="text-sm text-stone-500 dark:text-stone-400">No location set.</p>`}
            </div>
            <div>
                <h4 class="text-md font-medium text-stone-600 dark:text-stone-400">Member Since:</h4>
                <p class="text-sm text-stone-500 dark:text-stone-400">${formatDateForProfile(currentUser.createdAt)}</p>
            </div>
        `;
    }

    // --- Visibility and State Subscription Logic ---
    closeButtonContainer.addEventListener('click', () => setProfilePaneState(false));

    function setVisibility(isOpen) {
        if (isOpen) {
            toggleEditMode(false); // Always open in view mode
            pane.classList.remove('-translate-x-full');
            if (!backdropElement) {
                backdropElement = document.createElement('div');
                backdropElement.id = 'profile-pane-backdrop';
                backdropElement.className = 'fixed inset-0 bg-black/50 opacity-0 transition-opacity duration-300 ease-in-out z-[1010]';
                backdropElement.addEventListener('click', () => setProfilePaneState(false));
                document.body.appendChild(backdropElement);
            }
            backdropElement.style.display = 'block';
            requestAnimationFrame(() => backdropElement.classList.add('opacity-100'));
        } else {
            pane.classList.add('-translate-x-full');
            if (backdropElement) {
                backdropElement.classList.remove('opacity-100');
                setTimeout(() => {
                    if (backdropElement) backdropElement.style.display = 'none';
                }, 300);
            }
        }
        // Toggle close button visibility along with the pane
        closeButtonContainer.classList.toggle('opacity-0', !isOpen);
        closeButtonContainer.classList.toggle('pointer-events-none', !isOpen);
    }

    subscribe('profilePaneStateChanged', (data) => setVisibility(data.isOpen));
    subscribe('authStateChanged', () => {
        if (!isEditing) {
            populateProfileData();
        }
    });

    renderViewMode(); // Set initial content to view mode
    setVisibility(getState().isProfilePaneOpen);

    return pane;
}