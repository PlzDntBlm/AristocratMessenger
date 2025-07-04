/**
 * public/js/components/HomePage.js
 * Defines the HomePage component function.
 */
import {MapComponent} from './MapComponent.js';
import {ProfilePaneComponent} from './ProfilePaneComponent.js';
import {getState} from '../state.js';

export function HomePageComponent(user) {
    const container = document.createElement('div');
    container.id = 'component-home';
    container.className = 'flex flex-col w-full';

    const appState = getState();

    // --- Profile Crest ---
    // Only add the crest if the user is logged in.
    // The Profile Pane itself will handle not showing data if somehow opened when not logged in.
    if (appState.isLoggedIn) {
        const profileCrest = document.createElement('div');
        profileCrest.id = 'profile-crest-button';
        profileCrest.className = `fixed top-20 left-4 z-30 bg-accent dark:bg-accent-hover text-white rounded-full shadow-lg cursor-pointer hover:bg-accent-hover transition-colors duration-200 w-20 h-20 flex items-center justify-center overflow-hidden border-2 border-yellow-400`;
        profileCrest.title = 'View Profile';

        const profilePicUrl = appState.currentUser.profilePictureUrl || '/images/default-avatar.png';
        // Placeholder Shield Icon (SVG)
        profileCrest.innerHTML = `
            <img src="${profilePicUrl}" alt="View Profile" class="w-full h-full object-cover">
        `;

        // Add slight glow on hover via CSS (can be done in output.css or inline if simple)
        // For now, Tailwind hover:bg-yellow-600 handles visual feedback.
        // A 'glow' might be: hover:shadow-yellow-500/50 or custom CSS.
        container.appendChild(profileCrest);
    }


    // --- Profile Pane ---
    // Instantiate and append the ProfilePaneComponent (it will be hidden by default via its own CSS)
    // It should only be added once. If HomePageComponent can re-render, ensure this isn't added multiple times.
    // A simple check:
    if (appState.isLoggedIn && !document.getElementById('profile-pane')) {
        const profilePaneElement = ProfilePaneComponent();
        document.body.appendChild(profilePaneElement); // Append to body to ensure it can overlay everything
    }


    const username = user?.username || 'Esteemed Guest';

    // Welcome Section
    const welcomeSection = document.createElement('div');
    welcomeSection.innerHTML = `
        <h2 class="text-3xl font-semibold text-stone-700 dark:text-stone-300 mb-3">Welcome to your Solar, ${username}!</h2>
        <p class="text-gray-700 dark:text-gray-400">This is your main hall. From here, you can manage your affairs and survey the lands.</p>
    `;
    container.appendChild(welcomeSection);

    // Actions Section
    const actionsSection = document.createElement('div');
    // Using surface and border-color for the card
    actionsSection.className = 'mt-6 bg-surface dark:bg-dark-surface p-6 rounded-lg shadow-lg border border-border-color dark:border-dark-border-color';
    actionsSection.innerHTML = `
        <h3 class="text-xl font-semibold text-text-primary dark:text-dark-text-primary mb-4">Messenger Status & Actions:</h3>
        <p class="text-text-secondary dark:text-dark-text-secondary mb-4">Your messengers await your command.</p>
        <div class="flex flex-wrap gap-3">
             <button id="show-scriptorium-button" class="bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded shadow focus:outline-none focus:ring-2 focus:ring-accent">
                Compose New Missive
             </button>
             <a href="/cabinet" data-route="cabinet" class="bg-action hover:bg-action-hover text-white font-bold py-2 px-4 rounded shadow focus:outline-none focus:ring-2 focus:ring-action no-underline">
                View Your Cabinet
             </a>
        </div>
    `;
    container.appendChild(actionsSection);

    // Map Section
    const mapSection = document.createElement('div');
    mapSection.className = 'mt-8 grow flex flex-col min-h-100';
    const mapHeader = document.createElement('h3');
    mapHeader.className = 'text-2xl font-semibold text-text-primary dark:text-dark-text-primary mb-4';
    mapHeader.textContent = 'A Window to the Realm';
    mapSection.appendChild(mapHeader);

    const mapElement = MapComponent({initialWidth: 100, initialHeight: 100});
    mapSection.appendChild(mapElement);
    container.appendChild(mapSection);

    return container;
}