/**
 * public/js/components/MapComponent.js
 * Defines the Map component for displaying user locations.
 */
import L from 'leaflet'; // Import Leaflet
import * as api from '../api.js';
import { getState, setScriptoriumState } from '../state.js';
import { publish } from '../pubsub.js';

/**
 * Creates and returns the root DOM element for the Map view.
 * Initializes a Leaflet map and populates it with user locations.
 * @param {object} options - Configuration options for the map.
 * @param {number} options.initialWidth - The initial width for the map container.
 * @param {number} options.initialHeight - The initial height for the map container.
 * @returns {HTMLElement} The main container element for the Map.
 */
export function MapComponent({ initialWidth = 800, initialHeight = 600 } = {}) {
    const mapContainer = document.createElement('div');
    mapContainer.id = 'aristocrat-map';
    // Apply static dimensions directly to the map container
    mapContainer.style.width = `${initialWidth}px`;
    mapContainer.style.height = `${initialHeight}px`;
    mapContainer.style.border = '2px solid #57534e'; // A simple border, can be styled further
    mapContainer.style.backgroundColor = '#f5f5f4'; // A light placeholder background
    mapContainer.style.margin = '0 auto'; // Center it if HomePageComponent allows

    const loadingMessage = document.createElement('p');
    loadingMessage.className = 'p-4 text-stone-600 dark:text-stone-400';
    loadingMessage.textContent = 'Loading map and locations...';
    mapContainer.appendChild(loadingMessage);

    let map = null; // To hold the Leaflet map instance

    /**
     * Initializes the Leaflet map.
     * @async
     */
    async function initializeMap() {
        if (map) { // If map already initialized, clear it or return
            map.remove();
            map = null;
        }
        mapContainer.innerHTML = ''; // Clear loading message or previous map
        // Re-apply static dimensions because innerHTML clears style if not set on mapContainer itself
        mapContainer.style.width = `${initialWidth}px`;
        mapContainer.style.height = `${initialHeight}px`;

        // Define map bounds (0-100 km for x and y)
        // Leaflet's Simple CRS uses [y, x] for coordinates by default.
        // Bounds are [[south, west], [north, east]] or [[minY, minX], [maxY, maxX]]
        const mapBounds = [[0, 0], [100, 100]]; // y goes from 0 to 100, x goes from 0 to 100

        map = L.map(mapContainer, {
            crs: L.CRS.Simple, // Use a simple Cartesian coordinate system
            minZoom: -1,      // Adjust min/max zoom as needed for your map scale
            maxZoom: 3,
            attributionControl: false // Hide default Leaflet attribution
        });

        // Placeholder background (a colored div)
        // When you have an image: L.imageOverlay('path/to/your/map_image.jpg', mapBounds).addTo(map);
        // For now, just fit bounds to make the area usable
        map.fitBounds(mapBounds);
        map.setView([50, 50], 0); // Center on [y,x] = [50,50] (center of 100x100 map), initial zoom

        console.log('MapComponent: Leaflet map initialized.');
        await loadLocations();
    }

    /**
     * Fetches locations from the API and adds them to the map.
     * @async
     */
    async function loadLocations() {
        if (!map) return;

        try {
            const response = await api.getLocations(); // Ensure this function exists in api.js
            if (response.success && response.data) {
                const locations = response.data;
                console.log('MapComponent: Fetched locations', locations);
                renderMarkers(locations);

                // Center on current user's location if available
                const currentUser = getState('currentUser');
                if (currentUser && currentUser.id) {
                    const userLocation = locations.find(loc => loc.UserId === currentUser.id);
                    if (userLocation) {
                        map.setView([userLocation.y, userLocation.x], 1); // Zoom in a bit on user's location
                    }
                }

            } else {
                console.error('MapComponent: Failed to load locations -', response.message);
                mapContainer.innerHTML = `<p class="text-red-500 p-4">Could not load locations: ${response.message || 'Unknown error'}</p>`;
            }
        } catch (error) {
            console.error('MapComponent: Error fetching locations:', error);
            mapContainer.innerHTML = `<p class="text-red-500 p-4">Error fetching locations: ${error.message}</p>`;
        }
    }

    /**
     * Renders location markers on the map.
     * @param {Array<object>} locations - Array of location objects.
     */
    function renderMarkers(locations) {
        if (!map) return;

        locations.forEach(loc => {
            if (typeof loc.x === 'number' && typeof loc.y === 'number') {
                const marker = L.circleMarker([loc.y, loc.x], { // Leaflet uses [lat, lng] or [y, x] for simple CRS
                    radius: 6,
                    fillColor: '#D97706', // Amber-600
                    color: '#9A3412',    // Amber-800
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                }).addTo(map);

                let popupContent = `
                    <div class="font-semibold text-lg text-stone-700">${loc.name || 'Unnamed Location'}</div>
                    <div class="text-sm text-stone-600">Type: ${loc.type || 'N/A'}</div>
                `;
                if (loc.user) {
                    popupContent += `<div class="text-sm text-stone-500">Owner: ${loc.user.username}</div>`;
                }
                if (loc.description) {
                    popupContent += `<p class="mt-1 text-xs text-stone-500">${loc.description}</p>`;
                }

                // Add "Send Message" button if the location has a user and it's not the current user
                const currentUser = getState('currentUser');
                if (loc.user && currentUser && loc.user.id !== currentUser.id) {
                    const sendMessageButtonId = `send-message-to-${loc.user.id}-loc-${loc.id}`;
                    popupContent += `
                        <button id="${sendMessageButtonId}"
                                class="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-bold py-1 px-2 rounded"
                                data-recipient-id="${loc.user.id}"
                                data-recipient-username="${loc.user.username}">
                            Send Message
                        </button>
                    `;
                }
                marker.bindPopup(popupContent);
            } else {
                console.warn('MapComponent: Location with invalid coordinates skipped:', loc);
            }
        });
    }

    // Event delegation for "Send Message" buttons inside popups
    mapContainer.addEventListener('click', function(event) {
        if (event.target && event.target.matches('button[data-recipient-id]')) {
            const recipientId = event.target.dataset.recipientId;
            const recipientUsername = event.target.dataset.recipientUsername;

            if (recipientId && recipientUsername) {
                console.log(`MapComponent: Opening Scriptorium for User ID: ${recipientId} (${recipientUsername})`);
                setScriptoriumState({
                    isOpen: true,
                    recipient: { id: parseInt(recipientId, 10), username: recipientUsername },
                    subject: `Regarding your location: ${event.target.closest('.leaflet-popup-content').querySelector('.font-semibold').textContent}`, // Pre-fill subject
                    body: ''
                });
                // ScriptoriumComponent itself should react to isOpen state change.
                // If map is not full screen and Scriptorium opens as overlay, it should work.
                // Close the popup
                if(map && map.closePopup) map.closePopup();
            }
        }
    });


    // Initial load
    // Use a small delay to ensure the container is in the DOM and has dimensions,
    // especially if rendered into a dynamically created part of HomePageComponent.
    setTimeout(initializeMap, 0);

    return mapContainer;
}