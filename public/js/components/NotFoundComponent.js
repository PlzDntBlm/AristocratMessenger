/**
 * public/js/components/NotFoundComponent.js
 * Defines the component for the 404 Not Found page.
 */

export function NotFoundComponent() {
    const container = document.createElement('div');
    container.id = 'component-not-found';
    container.className = 'p-6 md:p-8 text-center';

    container.innerHTML = `
        <div class="max-w-md mx-auto">
            <img src="https://via.placeholder.com/250" alt="A raven lost in a thick fog" class="mx-auto mb-6 rounded-lg shadow-lg">
            <h2 class="text-4xl font-heading text-destructive dark:text-red-500 mb-4">404 - A Path Lost to the Mists</h2>
            <p class="text-text-secondary dark:text-dark-text-secondary mb-6">
                Alas, the page you seek has been claimed by the fog of the internet.
                Our most skilled cartographers could not find this destination in the known realm.
            </p>
            <a href="/home" data-route="home" class="btn-accent">
                Return to the Keep
            </a>
        </div>
    `;

    return container;
}