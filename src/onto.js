;(() => {
  /**
   * Event Emitter Utility - A lightweight event system for JavaScript
   *
   * This module provides a simple event emitter implementation that allows:
   * - Registering event listeners
   * - Emitting events to registered listeners
   * - Removing event listeners
   * - Chaining event listeners
   *
   * @module EventEmitter
   */

  /**
   * Main event emitter function that handles both event registration and emission
   *
   * @param {string} eventName - The name of the event to listen to or emit
   * @param {Function|*} handler - Event handler function or data to emit
   * @param {*} context - Optional context for the event handler
   * @returns {Object|Function} Returns event system object or listener for chaining
   */
  function onto(eventName, handler, context) {
    // If no event name provided, return the onto function for chaining
    if (!eventName) {
      return { to: onto }
    }

    const isFunction = typeof handler === 'function'

    // Initialize event registry if it doesn't exist
    this.tag ??= {}

    // Get existing event or create new one if handler is a function
    let eventRegistry = this.tag[eventName]

    if (!eventRegistry && isFunction) {
      // Create new event registry with terminal node
      eventRegistry = this.tag[eventName] = {
        tag: eventName,
        to: onto.terminalNode
      }
    }

    // If handler is a function, register it as a listener
    if (isFunction) {
      return registerEventListener(eventRegistry, handler, context, this)
    }

    // If handler is not a function, emit the event
    if (eventRegistry?.to && handler !== undefined) {
      eventRegistry.to.next(handler)
    }

    return eventRegistry?.to
  }

  /**
   * Terminal node for the event chain - handles the end of the listener chain
   */
  onto.terminalNode = {
    next(data) {
      // Pass data to next listener in chain if it exists
      this.to?.next(data)
    }
  }

  /**
   * Registers a new event listener in the event chain
   *
   * @param {Object} eventRegistry - The event registry object
   * @param {Function} handler - The event handler function
   * @param {*} context - Optional context for the handler
   * @param {Object} emitter - The event emitter instance
   * @returns {Object} The new listener object
   */
  function registerEventListener(eventRegistry, handler, context, emitter) {
    const listener = {
      as: context,
      next: handler,
      off: removeListener,
      on: emitter,
      the: eventRegistry,
      to: onto.terminalNode
    }

    // Link the new listener into the chain
    const previousLast = eventRegistry.last || eventRegistry
    listener.back = previousLast
    previousLast.to = listener
    eventRegistry.last = listener

    return listener
  }

  /**
   * Removes a listener from the event chain
   * This function is bound to each listener object as the 'off' method
   *
   * @returns {boolean} True if listener was already removed
   */
  function removeListener() {
    // Check if already removed
    if (this.next === onto.terminalNode.next) {
      return true
    }

    // Update the last pointer if this is the last listener
    if (this === this.the.last) {
      this.the.last = this.back
    }

    // Remove from the chain by linking previous to next
    this.to.back = this.back
    this.back.to = this.to

    // Mark as removed
    this.next = onto.terminalNode.next

    // Clean up event registry if no more listeners
    if (this.the.last === this.the) {
      delete this.on.tag[this.the.tag]
    }

    return false
  }

  // Attach the removal function to the main onto function for access
  onto.off = removeListener

  // Export the module
  if (module?.exports) {
    module.exports = onto
  } else if (typeof window !== 'undefined') {
    window.onto = onto
  }
})()
