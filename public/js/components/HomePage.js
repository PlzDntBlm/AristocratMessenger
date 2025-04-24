/**
 * Renders the Home page (Solar) component.
 * @param {object | null} user - The current user object { id, username } or null
 * @returns {HTMLElement} - The div element for the home page.
 */
export function HomePageComponent(user) {
    console.log("Component: Rendering Home Page for user:", user?.username);
    const container = document.createElement('div');
    container.id = 'partial-home';
    const username = user?.username || 'Esteemed Guest';
    container.innerHTML = `
        <h2 class="text-xl font-semibold mb-4">Welcome to your Solar, ${username}!</h2>
        <p class="text-gray-700">This is your main hall. From here, you can manage your affairs.</p>
        <div class="mt-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Messenger Status:</h3>
            <p class="text-gray-600">Your messengers await your command.</p>
            <div class="mt-4 space-x-4">
                 <a href="#scriptorium" data-route="scriptorium" class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">Write New Letter</a>
                 <a href="#cabinet" data-route="cabinet" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">View Letters</a>
            </div>
        </div>
    `;
    // TODO: Add event listeners for buttons/links within home if needed
    return container;
}