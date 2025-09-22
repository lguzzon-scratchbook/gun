;(() => {
  const Gun = require('./root')
  const u = undefined
  const empty = Object.freeze({})
  const _noop = () => {}

  /**
   * Subscribe to events on a Gun chain reference
   *
   * This method provides two modes of operation:
   * 1. String-based event subscription with named events and callbacks
   * 2. Function-based subscription for data changes with options
   *
   * @param {string|Function} tag - Event name (string) or data retrieval function
   * @param {Function|Object} [arg] - Callback function for string events, or options for function events
   * @param {Object} [eas] - Event aggregation scope for subscription tracking
   * @param {*} [as] - Context for callback execution
   * @returns {Gun} Returns the Gun chain for method chaining
   *
   * @example
   * // String-based event subscription
   * gun.on('change', (data) => console.log('Data changed:', data));
   *
   * // Function-based data subscription
   * gun.on(function(data, key) {
   *   console.log('Got data:', data, 'for key:', key);
   * }, { change: true });
   */
  Gun.chain.on = function (tag, arg, eas, as) {
    const cat = this._
    const _root = cat.root

    // Handle string-based event subscription
    if (typeof tag === 'string') {
      // Return existing subscription if no callback provided
      if (!arg) {
        return cat.on(tag)
      }

      // Create new subscription with proper context
      const act = cat.on(tag, arg, eas || cat, as)

      // Track subscription for cleanup if event aggregation scope provided
      if (eas?.$ && Array.isArray(eas.subs)) {
        eas.subs.push(act)
      }

      return this
    }

    // Handle function-based subscription with options
    let opt = arg

    // Normalize options - convert boolean true to change options
    if (opt === true) {
      opt = { change: true }
    } else {
      opt = opt || {}
    }

    // Set internal flags for event handling
    opt.not = 1 // Enable "not found" events
    opt.on = 1 // Enable continuous listening

    // Subscribe to data changes using the function as a getter
    this.get(tag, opt)

    return this
  }

  /**
   * Subscribe to a single occurrence of an event or data retrieval
   *
   * This method follows specific rules:
   * 1. If data is cached, retrieval should be fast but not interfere with writes
   * 2. Should not retrigger other listeners, fires even if no data found
   * 3. Multiple callbacks resolve independently with their own timeouts
   * 4. Handles data validation and link resolution automatically
   *
   * @param {Function} [cb] - Callback function to execute once when data is available
   * @param {Object} [opt={}] - Configuration options
   * @param {number} [opt.wait=99] - Timeout in milliseconds before resolving with undefined
   * @returns {Gun} Returns the Gun chain or a new chainable interface if no callback
   *
   * @example
   * // With callback
   * gun.get('user').once((data, key) => {
   *   console.log('User data:', data);
   * });
   *
   * // Chainable without callback (experimental)
   * gun.get('user').once().get('name').on(callback);
   */
  Gun.chain.once = function (cb, opt = {}) {
    // Return chainable promise-like interface if no callback provided
    if (!cb) {
      return createOnceChain(this, opt)
    }

    const cat = this._
    const root = cat.root
    const subscriptionId = String.random(7)

    // Set up the one-time data listener
    this.get(
      function handleOnceData(data, key, msg, eve) {
        const $ = this
        const at = $._

        // Initialize once tracking object
        at.one ??= {}
        const onceTracker = at.one

        // Skip if event is stunned or already resolved for this subscription
        if (eve.stun || onceTracker[subscriptionId] === '') {
          return
        }

        const validationResult = Gun.valid(data)

        // Handle immediately valid data
        if (validationResult === true) {
          executeOnceCallback()
          return
        }

        // Skip if data validation failed with error
        if (typeof validationResult === 'string') {
          return
        }

        // Set up timeout for data resolution
        clearTimeout(cat.one?.[subscriptionId])
        clearTimeout(onceTracker[subscriptionId])
        onceTracker[subscriptionId] = setTimeout(
          executeOnceCallback,
          opt.wait || 99
        )

        /**
         * Execute the callback once with properly resolved data
         * Handles data resolution, link following, and cleanup
         *
         * @param {boolean} [forceExecution=false] - Force execution even if data is undefined
         */
        function executeOnceCallback(forceExecution = false) {
          let resolvedContext = at

          // Handle non-core messages by creating context
          if (!at.has && !at.soul) {
            resolvedContext = {
              get: key,
              put: data
            }
          }

          let resolvedData = resolvedContext.put

          // Fallback data resolution from message
          if (resolvedData === u) {
            resolvedData = msg.$$?._.put
          }

          // Handle linked data resolution
          const linkValidation = Gun.valid(resolvedData)
          if (typeof linkValidation === 'string') {
            // Follow the link to get actual data
            resolvedData = root.$.get(resolvedData)._.put

            // Retry if linked data not yet available and not forcing
            if (resolvedData === u && !forceExecution) {
              onceTracker[subscriptionId] = setTimeout(
                () => executeOnceCallback(true),
                opt.wait || 99
              )
              return
            }
          }

          // Skip if event stunned or already resolved during async operations
          if (eve.stun || onceTracker[subscriptionId] === '') {
            return
          }

          // Mark as resolved to prevent duplicate execution
          onceTracker[subscriptionId] = ''

          // Unsubscribe if this is a soul or hash-based chain to prevent memory leaks
          if (cat.soul || cat.has) {
            eve.off()
          }

          // Execute callback with resolved data and context
          try {
            cb.call($, resolvedData, resolvedContext.get)
          } catch (error) {
            Gun.log('Error in once callback:', error)
          }

          // Final cleanup
          clearTimeout(onceTracker[subscriptionId])
        }
      },
      { on: 1 } // Enable continuous listening until resolved
    )

    return this
  }

  /**
   * Create a chainable once interface without immediate callback execution
   * This is an experimental feature that allows chaining after once()
   *
   * @param {Gun} gun - Gun instance to create chain from
   * @param {Object} opt - Options object
   * @returns {Gun} New Gun chain that resolves once
   *
   * @private
   */
  function createOnceChain(gun, opt) {
    // Log experimental feature warning
    Gun.log.once(
      'valonce',
      'Chainable val is experimental, its behavior and API may change moving forward. ' +
        'Please play with it and report bugs and ideas on how to improve it.'
    )

    const chain = gun.chain()

    // Set up chain cleanup mechanism
    chain._.nix = gun.once(function handleChainData(data, key) {
      chain._.on('in', this._)
    })

    // Copy lexical context for proper chaining behavior
    chain._.lex = gun._.lex

    return chain
  }

  /**
   * Unsubscribe from events and clean up all related resources
   *
   * This method performs comprehensive cleanup:
   * 1. Resets acknowledgment state to allow resubscription
   * 2. Cleans up chain references and caches
   * 3. Removes from graph storage if has soul
   * 4. Recursively cleans up mapped and nested references
   * 5. Emits cleanup event for other listeners
   *
   * @returns {Gun} Returns the Gun chain for method chaining
   *
   * @example
   * const ref = gun.get('user').on(callback);
   * // Later...
   * ref.off(); // Clean up subscription and resources
   */
  Gun.chain.off = function () {
    const at = this._
    const cat = at.back

    // Early return if no parent context
    if (!cat) {
      return this
    }

    // Reset acknowledgment state to allow resubscription
    at.ack = 0

    // Clean up next chain references
    const next = cat.next
    if (next && at.get && next[at.get]) {
      delete next[at.get]
    }

    // Clear any cached data
    if (cat.any) {
      cat.any = {}
    }

    // Clean up pending requests queue
    const ask = cat.ask
    if (ask && at.get) {
      delete ask[at.get]
    }

    // Clean up put operation cache
    const put = cat.put
    if (put && at.get) {
      delete put[at.get]
    }

    // Remove from graph storage if this has a soul (persistent identifier)
    const soul = at.soul
    if (soul && cat.root?.graph) {
      delete cat.root.graph[soul]
    }

    // Recursively clean up mapped references
    const map = at.map
    if (map) {
      Object.keys(map).forEach((key) => {
        const mapAt = map[key]
        if (mapAt?.link && cat.root?.$) {
          // Clean up linked references
          cat.root.$.get(mapAt.link).off()
        }
      })
    }

    // Recursively clean up nested chain references
    const atNext = at.next
    if (atNext) {
      Object.keys(atNext).forEach((key) => {
        const nestedChain = atNext[key]
        if (nestedChain?.$?.off) {
          nestedChain.$.off()
        }
      })
    }

    // Emit cleanup event to notify other components
    at.on('off', empty)

    return this
  }
})()
