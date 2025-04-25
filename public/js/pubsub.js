/**
 * public/js/pubsub.js
 * A simple Publish/Subscribe system for decoupling event handling.
 */

const events = {}; // { eventName: [callback1, callback2, ...] }

/**
 * Subscribes a callback function to a specific event.
 * @param {string} eventName - The name of the event to subscribe to.
 * @param {function} callback - The function to call when the event is published.
 * @returns {object} An object with an `unsubscribe` method.
 */
function subscribe(eventName, callback) {
    if (typeof callback !== 'function') {
        console.error(`PubSub: Attempted to subscribe with non-function for event "${eventName}".`);
        return { unsubscribe: () => {} }; // Return a no-op unsubscribe function
    }

    if (!events[eventName]) {
        events[eventName] = [];
    }
    events[eventName].push(callback);
    console.log(`PubSub: Subscribed to event "${eventName}".`);

    // Return an object with an unsubscribe method specific to this subscription
    return {
        unsubscribe: () => {
            unsubscribe(eventName, callback);
        }
    };
}

/**
 * Unsubscribes a specific callback function from an event.
 * @param {string} eventName - The name of the event to unsubscribe from.
 * @param {function} callback - The specific callback function to remove.
 */
function unsubscribe(eventName, callback) {
    if (!events[eventName]) {
        return; // No subscribers for this event
    }

    events[eventName] = events[eventName].filter(cb => cb !== callback);
    console.log(`PubSub: Unsubscribed from event "${eventName}".`);

    // Optional: Clean up the event array if no subscribers are left
    if (events[eventName].length === 0) {
        delete events[eventName];
    }
}

/**
 * Publishes an event, calling all subscribed callbacks with the provided data.
 * @param {string} eventName - The name of the event to publish.
 * @param {*} [data] - Optional data to pass to the callbacks.
 */
function publish(eventName, data) {
    if (!events[eventName]) {
        // console.log(`PubSub: No subscribers for event "${eventName}", publish ignored.`);
        return; // No one is listening
    }

    console.log(`PubSub: Publishing event "${eventName}" with data:`, data);
    // Call each callback associated with the event name
    // Iterate over a copy in case a callback unsubscribes during iteration
    [...events[eventName]].forEach(callback => {
        try {
            callback(data);
        } catch (error) {
            console.error(`PubSub: Error in subscriber for event "${eventName}":`, error);
        }
    });
}

// Export the core functions
export { subscribe, unsubscribe, publish };

// TODO: Consider adding error handling for invalid event names or data types.
// TODO: Potentially add a 'once' subscription method.