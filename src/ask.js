;(() => {
  // request / response module, for asking and acknowledging messages.
  require('./onto') // depends upon onto!

  /**
   * Utility function to manage request timeouts.
   * @param {object} obj - The request object with err property.
   * @param {Function} callback - Function to execute on timeout.
   * @param {number} delay - Timeout delay in milliseconds.
   * @param {boolean} [clearExisting=false] - Whether to clear existing timeout before setting new one.
   */
  const setRequestTimeout = (obj, callback, delay, clearExisting = false) => {
    if (clearExisting) {
      clearTimeout(obj.err) // Clear existing timeout if requested
    }
    obj.err = obj.err ?? setTimeout(callback, delay) // Set new timeout only if not already set
  }
  /**
   * Generates a unique request ID, using provided ID if valid, otherwise random.
   * @param {object} [as] - Options object that may contain a '#' property for ID.
   * @returns {string} - The generated or provided ID.
   * @throws {Error} - If ID generation fails or is invalid.
   */
  const generateRequestId = (as) => {
    // Use provided ID if available and valid
    const providedId = as?.['#']
    if (providedId && typeof providedId === 'string' && providedId.length > 0) {
      return providedId
    }
    // Fallback to random generation with error handling
    const random =
      String.random ??
      (() => {
        try {
          return Math.random().toString(36).slice(2)
        } catch (error) {
          throw new Error(`Failed to generate random ID: ${error.message}`)
        }
      })
    let generated
    try {
      generated = random()
    } catch (error) {
      throw new Error(`Random ID generation failed: ${error.message}`)
    }
    if (typeof generated !== 'string' || generated.length === 0) {
      throw new Error('Generated random string is invalid')
    }
    return generated.slice(0, 9)
  }

  /**
   * Handles asking and acknowledging messages with timeout management.
   * @param {Function|string|object} cb - Callback function for ask, or ID/message for ack.
   * @param {object} [as] - Additional options or data.
   * @returns {string|boolean|undefined} - ID for ask, true for ack, or undefined.
   */
  const handleAcknowledgment = (self, cb, as, lack) => {
    if (!cb) return // No callback provided, nothing to acknowledge
    const id = cb?.['#'] || cb // Extract message ID from callback object or use cb directly
    let tmp = self.tag?.[id] // Retrieve the pending request object from the tag map
    if (!tmp) return // No pending request found, ignore acknowledgment
    if (as) {
      // If acknowledgment data is provided
      tmp = self.on(id, as) // Update the request with acknowledgment data
      setRequestTimeout(tmp, () => tmp.off(), lack, true) // Clear existing and set new timeout to remove request after lack period
    }
    return true // Acknowledgment handled successfully
  }

  /**
   * Handles the ask operation by setting up the request and timeout.
   * @param {object} self - The context object with 'on' method.
   * @param {Function} cb - Callback function for the ask.
   * @param {object} [as] - Additional options or data.
   * @param {string} id - Unique identifier for the request.
   * @param {number} lack - Timeout duration in milliseconds.
   * @returns {string} - The request ID.
   */
  const handleAsk = (self, cb, as, id, lack) => {
    const to = self.on(id, cb, as)
    // Set timeout to handle lack of acknowledgment if not already set
    setRequestTimeout(
      to,
      () => {
        to.off()
        to.next({ err: 'Error: No ACK yet.', lack: true })
      },
      lack,
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
    const lack = this.opt?.lack ?? 9000

    if (typeof cb !== 'function') {
      // Handle acknowledgment for non-function cb (ack operation)
      return handleAcknowledgment(this, cb, as, lack)
    }
    // Generate request ID for ask operation
    const id = generateRequestId(as)
    if (!cb) {
      // Edge case: return ID if callback is falsy (though unlikely for function)
      return id
    }
    // Set up ask operation with timeout
    return handleAsk(this, cb, as, id, lack)
  }
})()
