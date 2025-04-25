/**
 * public/js/components/HomePage.js
 * Defines the HomePage component function.
 */

/**
 * Creates and returns the Home Page (Solar) DOM element structure.
 * @param {object | null} user - The current user object { id, username } or null.
 * @returns {HTMLElement} The root div element for the home page.
 */
export function HomePageComponent(user) {
    // Create the main container div
    const container = document.createElement('div');
    container.id = 'component-home'; // Optional ID

    // Determine username safely
    const username = user?.username || 'Esteemed Guest';

    // Set the inner HTML structure for the home page
    container.innerHTML = `
        <h2 class="text-xl font-semibold mb-4">Welcome to your Solar, ${username}!</h2>
        <p class="text-gray-700">This is your main hall. From here, you can manage your affairs.</p>
        <div class="mt-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Messenger Status:</h3>
            <p class="text-gray-600">Your messengers await your command.</p>
            <div class="mt-4 space-x-4">
                 <a href="/scriptorium" data-route="scriptorium" class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">Write New Letter</a>
                 <a href="/cabinet" data-route="cabinet" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">View Letters</a>
                 </div>
        </div>
         `;

    // Note: Event listeners for buttons/links specific to the home page
    // (e.g., Write New Letter) should be handled, likely via delegation
    // in app.js's handleNavClick for now, or within this component later.

    return container; // Return the constructed element
}