;(() => {
  /**
   * State Management Module
   *
   * This module provides a state management system with timestamp-based versioning
   * for distributed data synchronization. It generates unique timestamps with
   * microsecond precision to ensure proper ordering of state changes.
   *
   * Key Features:
   * - Monotonically increasing timestamps
   * - State drift compensation
   * - Node state management utilities
   *
   * @module State
   */

  // Import polyfills and compatibility shims
  require('./shim')

  // Constants for state management
  const NEGATIVE_INFINITY = -Infinity
  const DECIMAL_PRECISION = 999 // Microsecond precision multiplier
  const UNDEFINED = undefined

  // Module state variables
  let nodeCounter = 0
  let lastTimestamp = NEGATIVE_INFINITY

  /**
   * Generates a unique, monotonically increasing timestamp for state versioning.
   *
   * The timestamp system ensures that each state change gets a unique identifier
   * that maintains chronological order, even when multiple changes occur within
   * the same millisecond.
   *
   * Algorithm:
   * 1. Get current timestamp in milliseconds
   * 2. If current time > last recorded time, reset counter and use current time
   * 3. If current time <= last recorded time, increment counter and add fractional precision
   * 4. Apply drift compensation for clock synchronization
   *
   * @returns {number} Unique timestamp with microsecond precision
   */
  function State() {
    const currentTime = Date.now()

    if (lastTimestamp < currentTime) {
      // Reset counter for new millisecond
      nodeCounter = 0
      lastTimestamp = currentTime + State.drift
      return lastTimestamp
    }

    // Increment counter and add fractional precision for same millisecond
    nodeCounter += 1
    lastTimestamp = currentTime + nodeCounter / DECIMAL_PRECISION + State.drift
    return lastTimestamp
  }

  /**
   * Clock drift compensation value for distributed system synchronization.
   * Can be adjusted to compensate for network latency and clock differences.
   * @type {number}
   */
  State.drift = 0

  /**
   * Retrieves the state timestamp for a specific key on a node.
   *
   * This utility function safely extracts state information from a node's
   * metadata structure, providing a fallback value if the state doesn't exist.
   *
   * @param {Object} node - The node object containing state metadata
   * @param {string} key - The key to retrieve state for
   * @param {*} fallback - Fallback value if state doesn't exist
   * @returns {number|*} The state timestamp or fallback value
   *
   * @example
   * const stateValue = State.is(node, 'name', -Infinity);
   * console.log(stateValue); // Returns timestamp or -Infinity
   */
  State.is = (node, key, fallback) => {
    // Safely navigate to the state metadata
    const stateMetadata = (key && node?._ && node._['>']) || fallback

    if (!stateMetadata) {
      return fallback
    }

    const stateValue = stateMetadata[key]
    return typeof stateValue === 'number' ? stateValue : NEGATIVE_INFINITY
  }

  /**
   * Sets state information on a node for a specific key.
   *
   * This function manages the node's metadata structure, ensuring proper
   * initialization and state tracking for distributed synchronization.
   *
   * Node Structure:
   * - node._['#']: Soul identifier (unique node ID)
   * - node._['>']: State timestamps for each key
   * - node[key]: Actual data values
   *
   * @param {Object} node - The target node (will be created if null/undefined)
   * @param {string} key - The key to set state for
   * @param {number} stateTimestamp - The timestamp for this state change
   * @param {*} value - The actual value to store
   * @param {string} [soul] - Optional soul identifier for the node
   * @returns {Object} The modified node object
   *
   * @example
   * const node = State.ify({}, 'name', Date.now(), 'John', 'user123');
   * console.log(node.name); // 'John'
   * console.log(node._['>'].name); // timestamp
   */
  State.ify = (node, key, stateTimestamp, value, soul) => {
    // Initialize node and metadata if needed
    const targetNode = node || {}
    targetNode._ = targetNode._ || {}

    // Set soul identifier if provided
    if (soul) {
      targetNode._['#'] = soul
    }

    // Initialize or get state metadata object
    if (!targetNode._['>']) {
      targetNode._['>'] = {}
    }
    const stateMetadata = targetNode._['>']

    // Set state and value for valid keys (excluding metadata keys)
    if (key !== UNDEFINED && key !== '_') {
      // Set state timestamp if it's a valid number
      if (typeof stateTimestamp === 'number') {
        stateMetadata[key] = stateTimestamp
      }

      // Set the actual value (validation is caller's responsibility)
      if (value !== UNDEFINED) {
        targetNode[key] = value
      }
    }

    return targetNode
  }

  // Export the State function and its utilities
  module.exports = State
})()
