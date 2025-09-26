;(() => {
  /**
   * Generates a random string of specified length using the given character set.
   * @param {number} [length=24] - The length of the random string.
   * @param {string} [chars='0123456789ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz'] - The character set to use.
   * @returns {string} The generated random string.
   *
   * Flow: Initializes an empty string, sets default length and charset if not provided,
   * then appends random characters from the charset in a decrementing loop until length is reached.
   */
  String.random = (
    length = 24,
    chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz'
  ) => {
    return Array.from({ length }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('')
  }

  /**
   * Custom matching function for strings against various criteria.
   * Supports exact match ('='), prefix match ('*'), greater than ('>'), less than ('<'), or range.
   * @param {string} text - The string to match.
   * @param {object|string} options - Matching criteria (object with keys '=', '*', '>', '<' or a string for exact match).
   * @returns {boolean} True if the text matches the criteria, false otherwise.
   *
   * Flow:
   * 1. Validate input types.
   * 2. Normalize options to an object if it's a string.
   * 3. Check for exact match using a fallback tmp value.
   * 4. Handle cases where exact match is defined (early return false if mismatched).
   * 5. Check for prefix match.
   * 6. Handle range or inequality checks if applicable.
   * Note: This function uses 'undefined' checks implicitly via 'u' to determine presence of options.
   */
  String.match = (text, options) => {
    let tmp
    const u = undefined // Explicitly set for clarity in undefined checks
    if (typeof text !== 'string') {
      return false
    }
    if (typeof options === 'string') {
      options = { '=': options }
    }
    options = options || {}
    tmp = options['='] || options['*'] || options['>'] || options['<']
    if (text === tmp) {
      return true
    }
    if (u !== options['=']) {
      return false
    }
    tmp = options['*'] || options['>']
    if (text.slice(0, (tmp || '').length) === tmp) {
      return true
    }
    if (u !== options['*']) {
      return false
    }
    if (u !== options['>'] && u !== options['<']) {
      return !!(text >= options['>'] && text <= options['<'])
    }
    if (u !== options['>'] && text >= options['>']) {
      return true
    }
    if (u !== options['<'] && text <= options['<']) {
      return true
    }
    return false
  }

  /**
   * Computes a simple hash for a string.
   * @param {string} str - The input string.
   * @param {number} [seed=0] - Initial seed value for hashing.
   * @returns {number|undefined} The hash value or undefined if input is not a string.
   *
   * Flow: Validates input, iterates over each character, updates the hash using bit shifts and addition.
   */
  String.hash = (str, seed = 0) => {
    if (typeof str !== 'string') {
      return
    }
    if (!str.length) {
      return seed
    }
    for (let i = 0, len = str.length; i < len; ++i) {
      const charCode = str.charCodeAt(i)
      seed = (seed << 5) - seed + charCode
      seed |= 0 // Convert to 32-bit integer
    }
    return seed
  }

  const hasOwn = Object.prototype.hasOwnProperty

  /**
   * Checks if an object is a plain object (not an instance of a custom class or other types).
   * @param {any} obj - The object to check.
   * @returns {boolean} True if it's a plain object, false otherwise.
   *
   * Flow: Checks constructor and uses toString for confirmation.
   */
  Object.plain = (obj) => {
    return obj
      ? (obj instanceof Object && obj.constructor === Object) ||
          Object.prototype.toString
            .call(obj)
            .match(/^\[object (\w+)\]$/)?.[1] === 'Object'
      : false
  }

  /**
   * Checks if an object is empty, optionally ignoring specified keys.
   * @param {object} obj - The object to check.
   * @param {string[]} [ignoreKeys] - Array of keys to ignore.
   * @returns {boolean} True if empty (considering ignored keys), false otherwise.
   *
   * Flow: Iterates over own properties, returns false if any non-ignored key is found.
   */
  Object.empty = (obj, ignoreKeys) => {
    if (!obj) return true
    return !Object.keys(obj).some(
      (key) => !ignoreKeys || ignoreKeys.indexOf(key) === -1
    )
  }

  /**
   * Polyfill for Object.keys if not available.
   * @param {object} obj - The object whose keys to retrieve.
   * @returns {string[]} Array of own enumerable keys.
   *
   * Flow: Uses native if available, otherwise iterates and collects keys.
   */
  Object.keys =
    Object.keys ||
    ((obj) => {
      const keys = []
      for (const key in obj) {
        if (hasOwn.call(obj, key)) {
          keys.push(key)
        }
      }
      return keys
    })

  // Enhanced setTimeout utilities for polling and efficient asynchronous execution.
  ;(() => {
    const setT = setTimeout
    let lastTime = 0
    let counter = 0

    // Use MessageChannel for microtask-like behavior if available, fallback to setTimeout.
    const scheduleImmediate =
      (typeof setImmediate !== 'undefined' && setImmediate) ||
      (() => {
        if (typeof MessageChannel === 'undefined') {
          return setT
        }
        const channel = new MessageChannel()
        let callback
        channel.port1.onmessage = (event) => {
          if (event.data === '') callback()
        }
        return (fn) => {
          callback = fn
          channel.port2.postMessage('')
        }
      })()

    // Performance.now fallback to Date.now.
    let perf
    if (!setT.check) {
      setT.check = (typeof performance !== 'undefined' && performance) || {
        now: () => Date.now()
      }
    }
    perf = setT.check

    // Minimum hold time for polling (e.g., half a frame).
    setT.hold = setT.hold || 9

    /**
     * Polls a function efficiently, batching if within hold time.
     * @param {Function} fn - The function to poll/execute.
     *
     * Flow: If within hold time and under counter limit, execute immediately and increment counter.
     * Otherwise, reset counter and schedule via scheduleImmediate, updating lastTime.
     */
    setT.poll =
      setT.poll ||
      ((fn) => {
        if (setT.hold >= perf.now() - lastTime && counter < 3333) {
          counter++
          fn()
          return
        }
        counter = 0
        scheduleImmediate(() => {
          lastTime = perf.now()
          fn()
        })
      })
  })()

  // Turn-based threading over a single thread to avoid blocking with too many polls.
  ;(() => {
    const setT = setTimeout
    const poll = setT.poll
    let queue
    if (!setT.turn) {
      setT.turn = (fn) => {
        if (queue.push(fn) === 1) {
          poll(processQueue)
        }
      }
    }
    const turn = setT.turn
    if (!turn.s) turn.s = []
    queue = turn.s
    let index = 0

    /**
     * Processes the queue in turns.
     *
     * Flow: Executes the next function in queue, increments index.
     * If at end or 99 items, slices remaining queue and resets index.
     * Reschedules if more items remain.
     */
    const processQueue = () => {
      const fn = queue[index]
      index++
      if (fn) {
        fn()
      }
      if (index === queue.length || index === 99) {
        queue = queue.slice(index)
        turn.s = queue
        index = 0
      }
      if (queue.length) {
        poll(processQueue)
      }
    }
  })()

  // Each utility for processing arrays in batches asynchronously.
  ;(() => {
    const u = undefined
    const setT = setTimeout
    const turn = setT.turn

    if (!setT.each) {
      /**
       * Processes an array in batches asynchronously.
       * @param {any[]} list - The array to process.
       * @param {Function} processFn - Function to apply to each item.
       * @param {Function} [callback] - Optional callback on completion or error.
       * @param {number} [batchSize=9] - Number of items per batch.
       *
       * Flow: Splices batches from the list, processes them synchronously in loop,
       * schedules next batch via turn if more remain and no early return, or calls callback.
       */
      setT.each = (list, processFn, callback, batchSize) => {
        if (!batchSize) batchSize = 9
        ;(function processBatch() {
          const batch = (list || []).splice(0, batchSize)
          const batchLen = batch.length
          if (batchLen) {
            let result
            for (const item of batch) {
              result = processFn(item)
              if (u !== result) {
                break
              }
            }
            if (u === result) {
              turn(processBatch)
              return
            }
            // biome-ignore lint/complexity/useOptionalChain: TODO: Investigate better... odd cases
            callback && callback(result)
          } else {
            // biome-ignore lint/complexity/useOptionalChain: TODO: Investigate better... odd cases
            callback && callback()
          }
        })()
      }
    }
  })()
})()
