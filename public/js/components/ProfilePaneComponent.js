/**
 * public/js/components/ProfilePaneComponent.js
 * Defines the Profile Pane component.
 */
import { getState, setProfilePaneState } from '../state.js';
import {publish, subscribe} from '../pubsub.js'; // For logout or other actions

/**
 * Formats a JavaScript Date object or a date string into a more readable format.
 * @param {string|Date|null} dateInput - The date to format.
 * @returns {string} A formatted date string (e.g., "May 11, 2025") or 'N/A'.
 */
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

/**
 * Creates and returns the Profile Pane DOM element.
 * @returns {HTMLElement} The main div element for the profile pane.
 */
export function ProfilePaneComponent() {
    const pane = document.createElement('div');
    pane.id = 'profile-pane';
    pane.className = `
        fixed top-0 left-0 h-full w-[350px] bg-stone-50 dark:bg-stone-800 
        shadow-2xl z-50 transform -translate-x-full transition-transform duration-300 ease-in-out
        flex flex-col
    `;

    const paneHeader = document.createElement('div');
    paneHeader.className = 'p-4 border-b border-stone-200 dark:border-stone-700 flex justify-between items-center';
    const paneTitle = document.createElement('h2');
    paneTitle.id = 'profile-pane-title';
    paneTitle.className = 'text-xl font-semibold text-stone-700 dark:text-stone-200';
    paneHeader.appendChild(paneTitle);
    pane.appendChild(paneHeader);

    const closeButtonContainer = document.createElement('div');
    closeButtonContainer.id = 'profile-pane-close-button'; // Give it an ID for more specific styling/control
    closeButtonContainer.className = `
        absolute top-0 -right-[30px] h-[40px] w-[30px] 
        bg-yellow-600 hover:bg-yellow-700 
        flex items-center justify-center cursor-pointer
        rounded-r-md shadow-md opacity-0 transition-opacity duration-300 ease-in-out pointer-events-none 
    `; // Start hidden (opacity-0, pointer-events-none)
    closeButtonContainer.title = 'Close Profile';
    closeButtonContainer.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="white" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    `;
    closeButtonContainer.addEventListener('click', () => {
        setProfilePaneState(false);
    });
    pane.appendChild(closeButtonContainer);

    const paneContent = document.createElement('div');
    paneContent.id = 'profile-pane-content';
    paneContent.className = 'p-4 space-y-4 flex-grow overflow-y-auto';
    pane.appendChild(paneContent);

    const paneFooter = document.createElement('div');
    paneFooter.className = 'p-4 border-t border-stone-200 dark:border-stone-700 mt-auto';
    const editProfileButton = document.createElement('button');
    editProfileButton.id = 'profile-edit-button';
    editProfileButton.className = 'w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed';
    editProfileButton.textContent = 'Edit Profile';
    editProfileButton.disabled = true;
    editProfileButton.title = 'Profile editing coming soon!';
    const logoutButton = document.createElement('button');
    logoutButton.id = 'profile-logout-button';
    logoutButton.className = 'w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-3 focus:outline-none focus:ring-2 focus:ring-red-400';
    logoutButton.textContent = 'Logout';
    logoutButton.addEventListener('click', () => {
        publish('requestLogout');
    });
    paneFooter.appendChild(editProfileButton);
    paneFooter.appendChild(logoutButton);
    pane.appendChild(paneFooter);

    function populateProfileData() {
        const appState = getState();
        const currentUser = appState.currentUser;

        // Added check: If currentUser is null (e.g. not logged in or data not ready), show loading/default.
        if (!currentUser || !currentUser.id) { // Check for currentUser.id to ensure it's a populated user object
            paneTitle.textContent = 'Profile';
            paneContent.innerHTML = '<p class="text-stone-500 dark:text-stone-400 p-4">Loading user data or not logged in...</p>';
            // Consider disabling buttons if no user
            editProfileButton.disabled = true;
            logoutButton.disabled = true; // Or hide logout if not logged in
            return;
        }

        // Re-enable buttons if they were disabled
        // editProfileButton.disabled = true; // Still keep edit disabled per MVP
        logoutButton.disabled = false;


        let titleText = currentUser.username;
        if (currentUser.location && currentUser.location.name) {
            paneTitle.textContent = `${currentUser.username} of ${currentUser.location.name}`;
        } else {
            paneTitle.textContent = `${currentUser.username}'s Profile`;
        }

        paneContent.innerHTML = `
            <div class="mb-3">
                <h3 class="text-lg font-semibold text-stone-700 dark:text-stone-300">${currentUser.username || 'N/A'}</h3>
                <p class="text-sm text-stone-500 dark:text-stone-400">${currentUser.email || 'N/A'}</p>
            </div>
            <div>
                <h4 class="text-md font-medium text-stone-600 dark:text-stone-400">Location:</h4>
                ${currentUser.location ? `
                    <p class="text-sm text-stone-500 dark:text-stone-400">
                        ${currentUser.location.name || 'Not Set'} 
                        (Type: ${currentUser.location.type || 'N/A'})
                    </p>
                    <p class="text-xs text-stone-400 dark:text-stone-500">
                        Coordinates: X: ${currentUser.location.x !== undefined ? currentUser.location.x : 'N/A'}, Y: ${currentUser.location.y !== undefined ? currentUser.location.y : 'N/A'}
                    </p>
                    ${currentUser.location.description ? `<p class="mt-1 text-xs italic text-stone-500 dark:text-stone-400">"${currentUser.location.description}"</p>` : ''}
                ` : `
                    <p class="text-sm text-stone-500 dark:text-stone-400">No location set.</p>
                `}
            </div>
            <div>
                <h4 class="text-md font-medium text-stone-600 dark:text-stone-400">Member Since:</h4>
                <p class="text-sm text-stone-500 dark:text-stone-400">${formatDateForProfile(currentUser.createdAt)}</p>
            </div>
        `;
    }

    let backdropElement = null;

    function setVisibility(isOpen) {
        if (isOpen) {
            // Crucial: Ensure data is populated ONLY if user is actually logged in.
            // getState() is called here, so it uses the current state.
            const loggedInUser = getState().currentUser;
            if (loggedInUser && loggedInUser.id) {
                populateProfileData();
            } else {
                // If trying to open but no valid user, show a generic state or prevent opening.
                // For now, populateProfileData handles the "no user" display.
                populateProfileData();
            }

            pane.classList.remove('-translate-x-full');
            pane.classList.add('translate-x-0');
            closeButtonContainer.classList.remove('opacity-0', 'pointer-events-none'); // Show close button
            closeButtonContainer.classList.add('opacity-100', 'pointer-events-auto');


            if (!backdropElement) {
                backdropElement = document.createElement('div');
                backdropElement.id = 'profile-pane-backdrop';
                backdropElement.className = 'fixed inset-0 bg-black/50 z-40 opacity-0 transition-opacity duration-300 ease-in-out';
                backdropElement.addEventListener('click', () => setProfilePaneState(false));
                document.body.appendChild(backdropElement);
                requestAnimationFrame(() => {
                    backdropElement.classList.add('opacity-100');
                });
            } else {
                backdropElement.style.display = 'block';
                requestAnimationFrame(() => {
                    backdropElement.classList.add('opacity-100');
                });
            }
        } else {
            pane.classList.add('-translate-x-full');
            pane.classList.remove('translate-x-0');
            closeButtonContainer.classList.add('opacity-0', 'pointer-events-none'); // Hide close button
            closeButtonContainer.classList.remove('opacity-100', 'pointer-events-auto');


            if (backdropElement) {
                backdropElement.classList.remove('opacity-100');
                setTimeout(() => {
                    if (backdropElement && !getState().isProfilePaneOpen) { // Check state again before hiding
                        backdropElement.style.display = 'none';
                    }
                }, 300);
            }
        }
    }

    // Ensure initial state respects whether user is logged in for data population.
    // This call on component creation helps if the component is added to DOM while user is already logged in.
    populateProfileData();


    const unsubscribeProfilePaneState = subscribe('profilePaneStateChanged', (data) => {
        setVisibility(data.isOpen);
    });

    const unsubscribeAuthState = subscribe('authStateChanged', (authData) => {
        // If pane is currently open or is told to open, and auth state changes, re-populate.
        // Or, if user logs out while pane is open, content should reflect that.
        if (getState().isProfilePaneOpen || (authData && !authData.isLoggedIn)) {
            populateProfileData();
        }
        // If user logs out, ensure pane is closed if it isn't already being handled
        if (!authData.isLoggedIn && getState().isProfilePaneOpen) {
            setProfilePaneState(false);
        }
    });

    // Call setVisibility on creation to set initial hidden state correctly, including for close button.
    // This is important if the initial state for isProfilePaneOpen could somehow be true.
    setVisibility(getState().isProfilePaneOpen);

    return pane;
}