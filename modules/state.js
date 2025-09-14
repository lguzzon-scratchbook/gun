const { text_rand, match, hash, poll, turn, each } = require('./shim.js');

/**
 * @typedef {Object} StateNode
 * @property {Object} _ - Metadata container
 * @property {string} _['#'] - Soul identifier
 * @property {Object} _['>'] - State timestamps
 */

/**
 * Creates a timestamp-based state with drift compensation.
 * Generates unique timestamps for conflict resolution.
 * @returns {number} Calculated state timestamp.
 */
function State() {
    const currentTime = +new Date();
    const DECIMAL_PRECISION = 999; // Adjustable based on machine processing speed

    if (State.lastTimestamp < currentTime) {
        State.counter = 0;
        State.lastTimestamp = currentTime + State.drift;
        return State.lastTimestamp;
    }

    State.counter += 1;
    State.lastTimestamp = currentTime + (State.counter / DECIMAL_PRECISION) + State.drift;
    return State.lastTimestamp;
}

// Initialize state properties
State.drift = 0; // Clock drift compensation
State.counter = 0; // Counter for same-millisecond timestamps
State.lastTimestamp = -Infinity; // Last generated timestamp

/**
 * Retrieves state value for a given key on a node.
 * @param {StateNode} node - Target node.
 * @param {string} key - Key to check.
 * @param {Object} [fallback] - Fallback object if node state unavailable.
 * @returns {number|undefined} State value or -Infinity if not found.
 */
State.is = function(node, key, fallback) {
    const stateContainer = (key && node?._?.['>']) || fallback;
    if (!stateContainer) return undefined;

    const stateValue = stateContainer[key];
    return typeof stateValue === 'number' ? stateValue : -Infinity;
};

/**
 * Sets state for a key on a node.
 * @param {StateNode} node - Target node.
 * @param {string} key - Key to modify.
 * @param {number} state - State value.
 * @param {*} value - Associated value.
 * @param {string} [soul] - Soul identifier.
 * @returns {StateNode} Modified node.
 */
State.ify = function(node = {}, key, state, value, soul) {
    // Initialize metadata container
    node._ = node._ || {};

    if (soul) {
        node._['#'] = soul;
    }

    const stateTimestamps = node._['>'] || (node._['>'] = {});

    if (key !== undefined && key !== '_') {
        if (typeof state === 'number') {
            stateTimestamps[key] = state;
        }
        if (value !== undefined) {
            node[key] = value;
        }
    }

    return node;
};

module.exports = State;