/**
 * public/js/components/HomePage.js
 * Defines the HomePage component function.
 */

export function HomePageComponent(user) {
    const container = document.createElement('div');
    container.id = 'component-home';

    const username = user?.username || 'Esteemed Guest';

    container.innerHTML = `
        <h2 class="text-xl font-semibold mb-4">Welcome to your Solar, ${username}!</h2>
        <p class="text-gray-700">This is your main hall. From here, you can manage your affairs.</p>
        <div class="mt-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Messenger Status:</h3>
            <p class="text-gray-600">Your messengers await your command.</p>
            <div class="mt-4 space-x-4">
                 <button id="show-scriptorium-button" class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">Write New Letter</button>
                 <a href="/cabinet" data-route="cabinet" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">View Letters</a>
            </div>
        </div>
         `;
    // Note: "View Letters" is still a route link. "Write New Letter" is now a button.

    return container;
}