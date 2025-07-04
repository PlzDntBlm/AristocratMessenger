/**
 * public/js/components/MapComponent.js
 * Defines the Map component for displaying user locations.
 */
import * as api from '../api.js';
import {getState, setScriptoriumState} from '../state.js';

/**
 * Creates and returns the root DOM element for the Map view.
 * Initializes a Leaflet map and populates it with user locations.
 * @param {object} options - Configuration options for the map.
 * @param {number} options.initialWidth - The initial width for the map container in pixels.
 * @param {number} options.initialHeight - The initial height for the map container in pixels.
 * @returns {HTMLElement} The main container element for the Map.
 */
export function MapComponent({initialWidth = 100, initialHeight = 100} = {}) {
    const mapContainer = document.createElement('div');
    mapContainer.id = 'aristocrat-map-container';
    //mapContainer.style.width = `${initialWidth}px`;
    mapContainer.style.height = `${initialHeight}px`;
    mapContainer.style.border = '2px solid #78716c';
    mapContainer.style.backgroundColor = '#e7e5e4';
    mapContainer.style.margin = '20px';
    mapContainer.style.position = 'relative';
    mapContainer.className = 'grow flex';

    const actualMapDiv = document.createElement('div');
    actualMapDiv.id = 'aristocrat-leaflet-map';
    actualMapDiv.style.width = '100%';
    actualMapDiv.style.height = '100%';
    actualMapDiv.className = '';
    mapContainer.appendChild(actualMapDiv);

    const loadingOverlay = document.createElement('div');
    loadingOverlay.style.position = 'absolute';
    loadingOverlay.style.top = '0';
    loadingOverlay.style.left = '0';
    loadingOverlay.style.width = '100%';
    loadingOverlay.style.height = '100%';
    loadingOverlay.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
    loadingOverlay.style.display = 'flex';
    loadingOverlay.style.alignItems = 'center';
    loadingOverlay.style.justifyContent = 'center';
    loadingOverlay.style.zIndex = '1000';
    loadingOverlay.innerHTML = '<p class="text-stone-700 text-lg">Loading map and locations...</p>';
    mapContainer.appendChild(loadingOverlay);

    let map = null;

    async function initializeMap() {
        if (map) {
            map.remove();
            map = null;
        }
        loadingOverlay.style.display = 'flex';

        const mapBounds = [[0, 0], [100, 100]];

        map = L.map(actualMapDiv, { // L is now global
            crs: L.CRS.Simple,    // L is now global
            minZoom: -1,
            maxZoom: 4,
            attributionControl: false,
            scrollWheelZoom: true,
        });

        actualMapDiv.style.backgroundColor = '#d6d3d1';
        map.fitBounds(mapBounds);

        const currentUser = getState('currentUser');
        let initialCenter = [50, 50];
        let initialZoom = 0;

        try {
            const response = await api.getLocations();
            if (response.success && response.data) {
                if (currentUser && currentUser.id) {
                    const userLocation = response.data.find(loc => loc.UserId === currentUser.id);
                    if (userLocation) {
                        initialCenter = [userLocation.y, userLocation.x];
                        initialZoom = 1;
                    }
                }
                map.setView(initialCenter, initialZoom);
                console.log('MapComponent: Leaflet map initialized and centered.');
                renderMarkers(response.data);
            } else {
                map.setView(initialCenter, initialZoom);
                console.warn('MapComponent: Failed to load locations for initial centering -', response.message);
                showError('Could not load locations for map.');
            }
        } catch (error) {
            map.setView(initialCenter, initialZoom);
            console.error('MapComponent: Error fetching locations for initial centering:', error);
            showError('Error fetching locations.');
        } finally {
            loadingOverlay.style.display = 'none';
        }
    }

    function showError(messageText) {
        actualMapDiv.innerHTML = `<p class="text-red-600 p-4">${messageText}</p>`;
        loadingOverlay.style.display = 'none';
    }

    function renderMarkers(locations) {
        if (!map) return;
        locations.forEach(loc => {
            if (typeof loc.x === 'number' && typeof loc.y === 'number') {
                const marker = L.circleMarker([loc.y, loc.x], {
                    radius: 7,
                    fillColor: '#fbbf24',
                    color: '#b45309',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.7
                }).addTo(map);

                marker.bindTooltip(loc.name || 'Unnamed Location', {
                    permanent: false,
                    direction: 'top',
                    offset: [0, -7]
                });

                // --- Popup Content Modification ---
                let popupContentHTML = `
                <div class="p-1">
                    <div class="font-semibold text-md text-stone-800 dark:text-stone-200 mb-1">${loc.name || 'Unnamed Location'}</div>
                    <div class="text-xs text-stone-600 dark:text-stone-400">Type: ${loc.type || 'N/A'}</div>
            `;
                if (loc.user) {
                    popupContentHTML += `<div class="text-xs text-stone-500 dark:text-stone-300">Owner: ${loc.user.username}</div>`;
                }
                if (loc.description) {
                    popupContentHTML += `<p class="mt-1 text-xs text-stone-500 dark:text-stone-300">${loc.description}</p>`;
                }

                const currentUser = getState('currentUser');
                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'mt-2 flex flex-wrap gap-2';

                // Send Message Button
                if (loc.user && currentUser && loc.user.id !== currentUser.id) {
                    buttonContainer.innerHTML += `
                    <button id="map-send-msg-btn-${loc.user.id}"
                            class="bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-bold py-1 px-2 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
                            data-recipient-id="${loc.user.id}"
                            data-recipient-username="${loc.user.username}"
                            data-location-name="${loc.name || 'Unnamed Location'}">
                        Send Message
                    </button>
                `;
                }

                // Join Chat Button <<<--- ADD THIS BLOCK
                if (loc.chatRoom && loc.chatRoom.id) {
                    buttonContainer.innerHTML += `
                    <a href="/chat/room/${loc.chatRoom.id}"
                       data-route="chat/room/${loc.chatRoom.id}"
                       class="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1 px-2 rounded focus:outline-none focus:ring-1 focus:ring-green-500 no-underline">
                        Join Chat
                    </a>
                `;
                }

                popupContentHTML += buttonContainer.outerHTML;
                popupContentHTML += `</div>`;
                marker.bindPopup(popupContentHTML, {minWidth: 180});
            } else {
                console.warn('MapComponent: Location with invalid coordinates skipped:', loc);
            }
        });
    }

    actualMapDiv.addEventListener('click', function (event) {
        let target = event.target;
        if (target.tagName === 'I' && target.parentElement.matches('button[data-recipient-id]')) {
            target = target.parentElement;
        }

        if (target && target.matches('button[data-recipient-id]')) {
            const recipientId = target.dataset.recipientId;
            const recipientUsername = target.dataset.recipientUsername;
            const locationName = target.dataset.locationName;

            if (recipientId && recipientUsername) {
                console.log(`MapComponent: Opening Scriptorium for User ID: ${recipientId} (${recipientUsername})`);
                setScriptoriumState({
                    isOpen: true,
                    recipient: {id: parseInt(recipientId, 10), username: recipientUsername},
                    subject: `Regarding ${locationName}`,
                    body: `Greetings from the map,\n\nI am writing to you concerning your location, ${locationName}.\n\n`
                });
                if (map && map.closePopup) map.closePopup();
            }
        }
    });

    setTimeout(initializeMap, 0);
    return mapContainer;
}