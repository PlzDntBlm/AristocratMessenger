/**
 * public/js/components/HomePage.js
 * Defines the HomePage component function.
 */
import { MapComponent } from './MapComponent.js';
import { ProfilePaneComponent } from './ProfilePaneComponent.js';
import { getState } from '../state.js';

export function HomePageComponent(user) {
    const container = document.createElement('div');
    container.id = 'component-home';
    container.className = 'space-y-8 relative';

    const appState = getState();

    // --- Profile Crest ---
    // Only add the crest if the user is logged in.
    // The Profile Pane itself will handle not showing data if somehow opened when not logged in.
    if (appState.isLoggedIn) {
        const profileCrest = document.createElement('div');
        profileCrest.id = 'profile-crest-button';
        profileCrest.className = `fixed top-20 left-4 z-30 p-2 bg-accent dark:bg-accent-hover text-white rounded-full shadow-lg cursor-pointer hover:bg-accent-hover transition-colors duration-200
        `;
        profileCrest.title = 'View Profile';

        // Placeholder Shield Icon (SVG)
        profileCrest.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 md:w-8 md:h-8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
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
    mapSection.className = 'mt-8';
    const mapHeader = document.createElement('h3');
    mapHeader.className = 'text-2xl font-semibold text-text-primary dark:text-dark-text-primary mb-4';
    mapHeader.textContent = 'A Window to the Realm';
    mapSection.appendChild(mapHeader);

    const mapElement = MapComponent({ initialWidth: 800, initialHeight: 600 });
    mapSection.appendChild(mapElement);
    container.appendChild(mapSection);

    return container;
}