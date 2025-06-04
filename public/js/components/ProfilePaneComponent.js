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
    `; // Initially off-screen to the left

    // Header section of the pane
    const paneHeader = document.createElement('div');
    paneHeader.className = 'p-4 border-b border-stone-200 dark:border-stone-700 flex justify-between items-center';

    const paneTitle = document.createElement('h2');
    paneTitle.id = 'profile-pane-title';
    paneTitle.className = 'text-xl font-semibold text-stone-700 dark:text-stone-200';
    paneTitle.textContent = 'Your Profile'; // Default title

    // Close button (bookmark style)
    const closeButtonContainer = document.createElement('div');
    closeButtonContainer.className = `
        absolute top-0 -right-[30px] h-[40px] w-[30px] 
        bg-yellow-600 hover:bg-yellow-700 
        flex items-center justify-center cursor-pointer
        rounded-r-md shadow-md
    `;
    closeButtonContainer.title = 'Close Profile';
    closeButtonContainer.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="white" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    `;
    closeButtonContainer.addEventListener('click', () => {
        setProfilePaneState(false);
    });

    paneHeader.appendChild(paneTitle);
    // No, the close button is not in the header, it's attached to the side of the pane
    pane.appendChild(closeButtonContainer); // Attach close bookmark to the pane itself
    pane.appendChild(paneHeader);


    // Content section of the pane
    const paneContent = document.createElement('div');
    paneContent.id = 'profile-pane-content';
    paneContent.className = 'p-4 space-y-4 flex-grow overflow-y-auto';
    pane.appendChild(paneContent);

    // Footer section for buttons
    const paneFooter = document.createElement('div');
    paneFooter.className = 'p-4 border-t border-stone-200 dark:border-stone-700 mt-auto';
    const editProfileButton = document.createElement('button');
    editProfileButton.id = 'profile-edit-button';
    editProfileButton.className = `
        w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded 
        focus:outline-none focus:ring-2 focus:ring-blue-400
        disabled:opacity-50 disabled:cursor-not-allowed
    `;
    editProfileButton.textContent = 'Edit Profile';
    editProfileButton.disabled = true; // Disabled for this MVP
    editProfileButton.title = 'Profile editing coming soon!';

    const logoutButton = document.createElement('button');
    logoutButton.id = 'profile-logout-button';
    logoutButton.className = 'w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-3 focus:outline-none focus:ring-2 focus:ring-red-400';
    logoutButton.textContent = 'Logout';
    logoutButton.addEventListener('click', () => {
        publish('requestLogout'); // app.js will listen for this
    });

    paneFooter.appendChild(editProfileButton);
    paneFooter.appendChild(logoutButton);
    pane.appendChild(paneFooter);


    /**
     * Populates the profile pane with user data.
     */
    function populateProfileData() {
        const appState = getState(); // Get the whole state once
        const currentUser = appState.currentUser;

        if (!currentUser) {
            paneContent.innerHTML = '<p class="text-stone-500 dark:text-stone-400">Not logged in.</p>';
            paneTitle.textContent = 'Profile';
            return;
        }

        // Update Title based on your preference
        let titleText = currentUser.username;
        if (currentUser.location && currentUser.location.name) {
            // For "[Username]\n[Title] of [Location Name]" - deferring "Title" (Lord/Lady)
            // For now: "[Username] of [Location Name]"
            // paneTitle.textContent = `${currentUser.username} of ${currentUser.location.name}`;
            // Or keep it simple:
            paneTitle.textContent = `${currentUser.username}'s Chambers`;
        } else {
            paneTitle.textContent = `${currentUser.username}'s Profile`;
        }


        paneContent.innerHTML = `
            <div class="mb-3">
                <h3 class="text-lg font-semibold text-stone-700 dark:text-stone-300">${currentUser.username}</h3>
                <p class="text-sm text-stone-500 dark:text-stone-400">${currentUser.email}</p>
            </div>
            <div>
                <h4 class="text-md font-medium text-stone-600 dark:text-stone-400">Location:</h4>
                ${currentUser.location ? `
                    <p class="text-sm text-stone-500 dark:text-stone-400">
                        ${currentUser.location.name || 'Not Set'} 
                        (Type: ${currentUser.location.type || 'N/A'})
                    </p>
                    <p class="text-xs text-stone-400 dark:text-stone-500">
                        Coordinates: X: ${currentUser.location.x}, Y: ${currentUser.location.y}
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

    // Initially populate, though it might be re-populated if authState changes while pane is open
    // but more critically, it populates when the pane is made visible.
    // This direct call is useful if the component is created when user is already known.
    populateProfileData();


    // Store the backdrop element reference
    let backdropElement = null;

    /**
     * Shows or hides the profile pane.
     * @param {boolean} isOpen - True to show, false to hide.
     */
    function setVisibility(isOpen) {
        if (isOpen) {
            populateProfileData(); // Refresh data when opening
            pane.classList.remove('-translate-x-full');
            pane.classList.add('translate-x-0');
            // Create and show backdrop
            if (!backdropElement) {
                backdropElement = document.createElement('div');
                backdropElement.id = 'profile-pane-backdrop';
                backdropElement.className = 'fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ease-in-out';
                backdropElement.addEventListener('click', () => setProfilePaneState(false)); // Click outside to close
                document.body.appendChild(backdropElement);
                // Force reflow for transition
                requestAnimationFrame(() => {
                    backdropElement.classList.add('opacity-100');
                    backdropElement.classList.remove('opacity-0');
                });

            } else {
                backdropElement.style.display = 'block'; // Ensure it's visible
                requestAnimationFrame(() => {
                    backdropElement.classList.add('opacity-100');
                    backdropElement.classList.remove('opacity-0');
                });
            }
        } else {
            pane.classList.add('-translate-x-full');
            pane.classList.remove('translate-x-0');
            // Hide and remove backdrop
            if (backdropElement) {
                backdropElement.classList.remove('opacity-100');
                backdropElement.classList.add('opacity-0');
                // Remove after transition
                setTimeout(() => {
                    if (backdropElement) { // Check if it wasn't removed by another call
                        backdropElement.style.display = 'none';
                    }
                }, 300); // Match transition duration
            }
        }
    }

    // Subscribe to state changes to control visibility
    // and re-populate data if auth state changes while pane is configured to be open.
    const unsubscribeProfilePaneState = subscribe('profilePaneStateChanged', (data) => {
        setVisibility(data.isOpen);
    });
    const unsubscribeAuthState = subscribe('authStateChanged', () => {
        // If pane is currently open and auth state changes (e.g. user logs out elsewhere, or details updated), re-populate.
        if (getState().isProfilePaneOpen) {
            populateProfileData();
        }
    });

    // Initial visibility based on current state (e.g. if page reloads with pane open)
    // However, typically it will start closed.
    // setVisibility(getState().isProfilePaneOpen); // This might be redundant if state init is always false

    // Add a "destroy" method or similar cleanup for when the component is removed (advanced)
    // For now, we assume it lives as long as the app session.
    // pane.destroy = () => {
    //     unsubscribeProfilePaneState.unsubscribe();
    //     unsubscribeAuthState.unsubscribe();
    //     if (backdropElement && backdropElement.parentNode) {
    //         backdropElement.parentNode.removeChild(backdropElement);
    //     }
    //     pane.remove();
    // };

    return pane;
}