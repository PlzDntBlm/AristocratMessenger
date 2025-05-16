/**
 * public/js/components/HomePage.js
 * Defines the HomePage component function.
 */
import { MapComponent } from './MapComponent.js'; // Import the MapComponent

export function HomePageComponent(user) {
    const container = document.createElement('div');
    container.id = 'component-home';
    container.className = 'space-y-8'; // Add some spacing between sections

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
    actionsSection.className = 'mt-6 bg-white dark:bg-stone-800 p-6 rounded-lg shadow-lg';
    actionsSection.innerHTML = `
        <h3 class="text-xl font-semibold text-stone-700 dark:text-stone-300 mb-4">Messenger Status & Actions:</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">Your messengers await your command.</p>
        <div class="flex flex-wrap gap-3">
             <button id="show-scriptorium-button" class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded shadow focus:outline-none focus:ring-2 focus:ring-yellow-400">
                Compose New Missive
             </button>
             <a href="/cabinet" data-route="cabinet" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-400 no-underline">
                View Your Cabinet
             </a>
        </div>
    `;
    container.appendChild(actionsSection);

    // Map Section ("Window to the World")
    const mapSection = document.createElement('div');
    mapSection.className = 'mt-8';
    const mapHeader = document.createElement('h3');
    mapHeader.className = 'text-2xl font-semibold text-stone-700 dark:text-stone-300 mb-4';
    mapHeader.textContent = 'A Window to the Realm';
    mapSection.appendChild(mapHeader);

    // Create and append the MapComponent
    // Pass the static dimensions here
    const mapElement = MapComponent({ initialWidth: 800, initialHeight: 600 });
    mapSection.appendChild(mapElement);
    container.appendChild(mapSection);

    return container;
}