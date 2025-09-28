;(() => {
  // request / response module, for asking and acknowledging messages.
  require('./onto') // depends upon onto!

  /**
   * Utility function to manage request timeouts.
   * @param {object} request - The request object with timeoutId property.
   * @param {Function} callback - Function to execute on timeout.
   * @param {number} delay - Timeout delay in milliseconds.
   * @param {boolean} [clearExisting=false] - Whether to clear existing timeout before setting new one.
   */
  const setRequestTimeout = (
    request,
    callback,
    delay,
    clearExisting = false
  ) => {
    if (clearExisting && request.timeoutId) {
      clearTimeout(request.timeoutId) // Clear existing timeout if requested and exists
    }
    if (!request.timeoutId) {
      request.timeoutId = setTimeout(callback, delay) // Set new timeout only if not already set
    }
  }
  /**
   * Generates a unique request ID, using provided ID if valid, otherwise random.
   * @param {object} [as] - Options object that may contain a '#' property for ID.
   * @returns {string} - The generated or provided ID.
   */
  const generateRequestId = (as) => {
    // Use provided ID if available and valid
    const providedId = as?.['#']
    if (providedId && typeof providedId === 'string' && providedId.length > 0) {
      return providedId
    }
    // Generate random ID
    return Math.random().toString(36).slice(2, 11) // 9-character random string
  }

  /**
   * Handles acknowledging messages with timeout management.
   * @param {object} self - The context object.
   * @param {Function|string|object} cb - ID or message for ack.
   * @param {object} [as] - Additional acknowledgment data.
   * @param {number} ackTimeout - Acknowledgment timeout duration in milliseconds.
   * @returns {boolean|undefined} - True if acknowledgment handled, undefined otherwise.
   */
  const handleAcknowledgment = (self, cb, as, ackTimeout) => {
    if (!cb) return // No callback provided, nothing to acknowledge
    const id = cb?.['#'] || cb // Extract message ID from callback object or use cb directly
    let pendingRequest = self.tag?.[id] // Retrieve the pending request object from the tag map
    if (!pendingRequest) return // No pending request found, ignore acknowledgment
    if (as) {
      // If acknowledgment data is provided
      pendingRequest = self.on(id, as) // Update the request with acknowledgment data
      setRequestTimeout(
        pendingRequest,
        () => pendingRequest.off(),
        ackTimeout,
        true
      ) // Clear existing and set new timeout to remove request after ackTimeout
    }
    return true // Acknowledgment handled successfully
  }

  /**
   * Handles the ask operation by setting up the request and timeout.
   * @param {object} self - The context object with 'on' method.
   * @param {Function} cb - Callback function for the ask.
   * @param {object} [as] - Additional options or data.
   * @param {string} id - Unique identifier for the request.
   * @param {number} ackTimeout - Timeout duration in milliseconds.
   * @returns {string} - The request ID.
   */
  const handleAsk = (self, cb, as, id, ackTimeout) => {
    const request = self.on(id, cb, as)
    // Set timeout to handle lack of acknowledgment if not already set
    setRequestTimeout(
      request,
      () => {
        request.off()
        request.next({ err: 'No acknowledgment received yet.', lack: true })
      },
      ackTimeout,
      false
    )
    return id
  }

  /**
   * Sends a request and waits for acknowledgment, or acknowledges a received message.
   * @param {Function|object|string} cb - Callback for ask operation, or message ID/data for ack.
   * @param {object} [as] - Additional options or data for the operation.
   * @returns {string|boolean|undefined} - Request ID for ask, true for successful ack, or undefined if no action.
   */
  module.exports = function ask(cb, as) {
    if (!this.on) {
      throw new Error('Context must have an "on" method.')
    }
    const ackTimeout = this.opt?.lack ?? 9000

    if (typeof cb !== 'function') {
      // Handle acknowledgment for non-function cb (ack operation)
      return handleAcknowledgment(this, cb, as, ackTimeout)
    }
    // Generate request ID for ask operation
    const id = generateRequestId(as)
    // Set up ask operation with timeout
    return handleAsk(this, cb, as, id, ackTimeout)
  }
})()
