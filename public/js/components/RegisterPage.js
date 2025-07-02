/**
 * public/js/components/RegisterPageComponent.js
 * Defines the multi-step Register Page component.
 */
import * as api from '../api.js';
import { getState, setRegistrationFormState } from '../state.js';
import { publish } from '../pubsub.js';

const MIN_DISTANCE_SQUARED = 25; // 5km distance, squared for efficiency

/**
 * Helper function to calculate the squared distance between two points.
 * @param {object} p1 - Point 1 with x and y properties.
 * @param {object} p2 - Point 2 with x and y properties.
 * @returns {number} The squared distance.
 */
function getSquaredDistance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return dx * dx + dy * dy;
}


export function RegisterPageComponent() {
    // --- Component State ---
    let map = null;
    let existingLocations = [];
    let newLocationMarker = null;

    // --- Main Container ---
    const container = document.createElement('div');
    container.id = 'component-register';
    container.className = 'w-full max-w-4xl mx-auto'; // Use a wider container

    /**
     * Main render function that draws the component based on the current state.
     */
    function render() {
        const regState = getState().registrationForm;
        const currentTab = regState.currentTab;

        container.innerHTML = `
            <h2 class="text-3xl font-heading mb-6 text-center">Establish Your Legacy</h2>
            
            <div class="flex border-b border-border-color dark:border-dark-border-color mb-6">
                <div class="tab-item ${currentTab === 1 ? 'active' : ''}">1. Credentials</div>
                <div class="tab-item ${currentTab === 2 ? 'active' : ''}">2. Choose Land</div>
                <div class="tab-item ${currentTab === 3 ? 'active' : ''}">3. Name Your Seat</div>
            </div>

            <div id="register-tab-content"></div>

            <div id="register-global-error" class="text-red-500 mt-4 text-center"></div>
        `;

        renderTabContent(currentTab);
        attachEventListeners();
    }

    /**
     * Renders the content for the currently active tab.
     * @param {number} tabNumber - The tab to render (1, 2, or 3).
     */
    function renderTabContent(tabNumber) {
        const contentDiv = container.querySelector('#register-tab-content');
        const regState = getState().registrationForm;

        switch (tabNumber) {
            case 1:
                contentDiv.innerHTML = `
                    <p class="text-text-secondary dark:text-dark-text-secondary mb-4 text-center">First, scribe your identity for the royal records.</p>
                    <div class="space-y-4 max-w-md mx-auto">
                        <div>
                            <label for="reg-username" class="block text-sm font-bold mb-2">Username:</label>
                            <input type="text" id="reg-username" value="${regState.username}" class="form-input" required>
                        </div>
                        <div>
                            <label for="reg-email" class="block text-sm font-bold mb-2">Email:</label>
                            <input type="email" id="reg-email" value="${regState.email}" class="form-input" required>
                        </div>
                        <div>
                            <label for="reg-password" class="block text-sm font-bold mb-2">Password:</label>
                            <input type="password" id="reg-password" value="${regState.password}" class="form-input" required>
                        </div>
                        <div class="text-right">
                            <button id="next-btn-1" class="btn-accent">Next &raquo;</button>
                        </div>
                    </div>
                `;
                break;
            case 2:
                contentDiv.innerHTML = `
                    <p class="text-text-secondary dark:text-dark-text-secondary mb-4 text-center">Survey the realm and select a plot for your stronghold. You cannot build too close to an existing settlement.</p>
                    <div id="register-map" class="h-[400px] md:h-[500px] w-full border-2 border-border-color dark:border-dark-border-color rounded shadow-lg"></div>
                    <div id="map-error" class="text-red-500 text-sm mt-2"></div>
                    <div class="flex justify-between mt-4">
                        <button id="prev-btn-2" class="btn-secondary">&laquo; Previous</button>
                        <button id="next-btn-2" class="btn-accent" ${regState.x === null ? 'disabled' : ''}>Next &raquo;</button>
                    </div>
                `;
                // Initialize map after the container is in the DOM
                setTimeout(initializeRegisterMap, 0);
                break;
            case 3:
                contentDiv.innerHTML = `
                    <p class="text-text-secondary dark:text-dark-text-secondary mb-4 text-center">Your chosen land is at coordinates (X: ${regState.x}, Y: ${regState.y}). Now, give it a name.</p>
                    <div class="space-y-4 max-w-md mx-auto">
                         <div>
                            <label for="reg-location-name" class="block text-sm font-bold mb-2">Seat Name:</label>
                            <input type="text" id="reg-location-name" value="${regState.locationName}" class="form-input" required>
                            <div id="location-name-feedback" class="text-sm mt-1"></div>
                        </div>
                        <div class="flex justify-between mt-6">
                            <button id="prev-btn-3" class="btn-secondary">&laquo; Previous</button>
                            <button id="register-btn-final" class="btn-accent">Found Your Legacy</button>
                        </div>
                    </div>
                `;
                break;
        }
    }

    /**
     * Attaches all necessary event listeners for the current view.
     */
    function attachEventListeners() {
        // --- Navigation ---
        container.querySelector('#next-btn-1')?.addEventListener('click', handleNextFromTab1);
        container.querySelector('#prev-btn-2')?.addEventListener('click', () => changeTab(1));
        container.querySelector('#next-btn-2')?.addEventListener('click', handleNextFromTab2);
        container.querySelector('#prev-btn-3')?.addEventListener('click', () => changeTab(2));

        // --- Final Submission ---
        container.querySelector('#register-btn-final')?.addEventListener('click', handleFinalRegistration);

        // --- Live Validation ---
        const locNameInput = container.querySelector('#reg-location-name');
        if (locNameInput) {
            locNameInput.addEventListener('keyup', debounce(checkLocationNameUniqueness, 500));
        }
    }

    /**
     * Handles moving from tab 1 to 2, saving credential state.
     */
    function handleNextFromTab1() {
        const username = container.querySelector('#reg-username').value;
        const email = container.querySelector('#reg-email').value;
        const password = container.querySelector('#reg-password').value;
        if (!username || !email || !password) {
            alert('Please fill in all credential fields.');
            return;
        }
        setRegistrationFormState({ username, email, password, currentTab: 2 });
        render(); // Re-render for tab 2
    }

    /**
     * Handles moving from tab 2 to 3, saving location state.
     */
    function handleNextFromTab2() {
        const { x, y } = getState().registrationForm;
        if (x === null || y === null) {
            alert('You must select a location on the map.');
            return;
        }
        setRegistrationFormState({ currentTab: 3 });
        render(); // Re-render for tab 3
    }

    /**
     * Handles final registration submission.
     */
    async function handleFinalRegistration() {
        const locationName = container.querySelector('#reg-location-name').value;
        setRegistrationFormState({ locationName }); // Save final piece of state

        const regState = getState().registrationForm;
        if (!regState.locationName) {
            alert('Please provide a name for your location.');
            return;
        }

        const finalButton = container.querySelector('#register-btn-final');
        finalButton.disabled = true;
        finalButton.textContent = 'Scribing the Deed...';
        container.querySelector('#register-global-error').textContent = '';

        try {
            const result = await api.registerUser(
                regState.username,
                regState.email,
                regState.password,
                regState.locationName,
                regState.x,
                regState.y
            );

            if (result.success) {
                alert(result.message);
                // Reset state and redirect to login
                setRegistrationFormState({ currentTab: 1, username: '', email: '', password: '', locationName: '', x: null, y: null });
                publish('navigateToRoute', { routeName: 'login' });
            } else {
                throw new Error(result.message || 'Registration failed.');
            }
        } catch (error) {
            container.querySelector('#register-global-error').textContent = error.message;
            finalButton.disabled = false;
            finalButton.textContent = 'Found Your Legacy';
        }
    }


    /**
     * Changes the active tab.
     * @param {number} tabNumber - The tab to switch to.
     */
    function changeTab(tabNumber) {
        setRegistrationFormState({ currentTab: tabNumber });
        render();
    }

    /**
     * Initializes the Leaflet map for location selection.
     */
    async function initializeRegisterMap() {
        const mapDiv = container.querySelector('#register-map');
        if (!mapDiv || map) return; // Don't re-initialize

        map = L.map(mapDiv, { crs: L.CRS.Simple, attributionControl: false, scrollWheelZoom: true });
        const mapBounds = [[0, 0], [100, 100]];
        map.fitBounds(mapBounds);
        map.setView([50, 50], 0);

        try {
            const response = await api.getLocations(); // Fetch existing locations
            if (response.success) {
                existingLocations = response.data;
                // Display existing locations as disabled markers
                existingLocations.forEach(loc => {
                    L.circleMarker([loc.y, loc.x], { radius: 6, color: '#9ca3af', fillColor: '#6b7280', fillOpacity: 0.5 }).addTo(map)
                        .bindTooltip(loc.name, { permanent: false });
                });
            }
        } catch (error) {
            console.warn("Could not load existing locations for registration map:", error);
        }

        // Add user's chosen location marker if it exists in state
        const { x, y } = getState().registrationForm;
        if (x !== null && y !== null) {
            newLocationMarker = L.marker([y, x], { draggable: true }).addTo(map);
            attachMarkerEvents();
        }

        map.on('click', onMapClick);
    }

    function onMapClick(e) {
        const latlng = e.latlng;
        const newPos = { x: Math.round(latlng.lng), y: Math.round(latlng.lat) };
        const mapErrorDiv = container.querySelector('#map-error');
        mapErrorDiv.textContent = ''; // Clear previous error

        // Client-side validation for distance
        for (const loc of existingLocations) {
            if (getSquaredDistance(newPos, loc) < MIN_DISTANCE_SQUARED) {
                mapErrorDiv.textContent = `Too close to "${loc.name}". Please choose another spot.`;
                return;
            }
        }

        // If position is valid, update or create marker
        if (newLocationMarker) {
            newLocationMarker.setLatLng(e.latlng);
        } else {
            newLocationMarker = L.marker(e.latlng, { draggable: true }).addTo(map);
            attachMarkerEvents();
        }

        // Update state and UI
        setRegistrationFormState({ x: newPos.x, y: newPos.y });
        container.querySelector('#next-btn-2').disabled = false;
    }

    function attachMarkerEvents() {
        if (!newLocationMarker) return;
        newLocationMarker.on('dragend', function(event) {
            const marker = event.target;
            const position = marker.getLatLng();
            onMapClick({ latlng: position }); // Re-run validation on new position
        });
    }

    async function checkLocationNameUniqueness() {
        const input = container.querySelector('#reg-location-name');
        const feedbackDiv = container.querySelector('#location-name-feedback');
        const finalButton = container.querySelector('#register-btn-final');
        const name = input.value.trim();

        if (name.length < 3) {
            feedbackDiv.textContent = '';
            finalButton.disabled = true;
            return;
        }

        try {
            feedbackDiv.textContent = 'Checking...';
            feedbackDiv.className = 'text-sm mt-1 text-stone-500';
            const result = await api.checkLocationName(name);
            if (result.available) {
                feedbackDiv.textContent = `✔️ "${name}" is available!`;
                feedbackDiv.className = 'text-sm mt-1 text-green-600';
                finalButton.disabled = false;
            } else {
                feedbackDiv.textContent = `❌ "${name}" is already taken.`;
                feedbackDiv.className = 'text-sm mt-1 text-red-600';
                finalButton.disabled = true;
            }
        } catch (error) {
            feedbackDiv.textContent = 'Could not verify name.';
            feedbackDiv.className = 'text-sm mt-1 text-red-600';
            finalButton.disabled = true;
        }
    }

    function debounce(func, timeout = 300){
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(this, args); }, timeout);
        };
    }

    // --- Initial Render ---
    // Reset state on component load to ensure a clean form
    setRegistrationFormState({ currentTab: 1, username: '', email: '', password: '', locationName: '', x: null, y: null });
    render();

    return container;
}