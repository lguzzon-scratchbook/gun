;(() => {
  const Gun = require('./root')
  const u = undefined
  const empty = Object.freeze({})
  const _noop = () => {}

  /**
   * Subscribe to events on a Gun chain reference
   *
   * @param {string|Function} tag - Event name or callback function
   * @param {Function|Object} [arg] - Callback function or options
   * @param {Object} [eas] - Event aggregation scope
   * @param {*} [as] - Context for callback execution
   * @returns {Gun} Returns the Gun chain for method chaining
   *
   * Flow:
   * 1. Handle string-based event subscriptions with callbacks
   * 2. Handle function-based subscriptions with options
   * 3. Set up event listening with proper context and cleanup
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

      // Create new subscription
      const act = cat.on(tag, arg, eas || cat, as)

      // Track subscription for cleanup if eas context provided
      if (eas?.$ && Array.isArray(eas.subs)) {
        eas.subs.push(act)
      }

      return this
    }

    // Handle function-based subscription with options
    let opt = arg
    opt = opt === true ? { change: true } : opt || {}
    opt.not = 1
    opt.on = 1

    // Track waiting state for event handling
    const _wait = {}

    // Subscribe to data changes
    this.get(tag, opt)

    return this
  }

  /**
   * Subscribe to a single occurrence of an event
   *
   * Rules:
   * 1. If cached, should be fast, but not read while write
   * 2. Should not retrigger other listeners, should get triggered even if nothing found
   * 3. Multiple callbacks should resolve independently
   *
   * @param {Function} [cb] - Callback function to execute once
   * @param {Object} [opt={}] - Options object
   * @param {number} [opt.wait=99] - Timeout in milliseconds
   * @returns {Gun} Returns the Gun chain or a new chain if no callback
   *
   * Flow:
   * 1. Generate unique ID for this subscription
   * 2. Set up timeout-based resolution mechanism
   * 3. Handle data validation and link resolution
   * 4. Execute callback once and clean up
   */
  Gun.chain.once = function (cb, opt = {}) {
    // Return chainable promise-like interface if no callback
    if (!cb) {
      return createOnceChain(this, opt)
    }

    const cat = this._
    const root = cat.root
    const id = String.random(7)

    this.get(
      function (data, key, msg, eve) {
        const $ = this
        const at = $._
        if (!at.one) at.one = {}
        const one = at.one

        // Skip if event is stunned or already resolved
        if (eve.stun || one[id] === '') {
          return
        }

        const tmp = Gun.valid(data)

        // Handle valid data immediately
        if (tmp === true) {
          executeOnce()
          return
        }

        // Skip if validation error
        if (typeof tmp === 'string') {
          return
        }

        // Clear existing timeouts and set new one
        clearTimeout(cat.one?.[id])
        clearTimeout(one[id])
        one[id] = setTimeout(executeOnce, opt.wait || 99)

        /**
         * Execute the callback once with proper data resolution
         * @param {boolean} [force] - Force execution even without data
         */
        function executeOnce(force = false) {
          let resolvedAt = at

          // Handle non-core messages
          if (!at.has && !at.soul) {
            resolvedAt = { get: key, put: data }
          }

          let resolvedData = resolvedAt.put

          // Fallback data resolution
          if (resolvedData === u) {
            resolvedData = msg.$$?._.put
          }

          // Handle linked data resolution
          if (typeof Gun.valid(resolvedData) === 'string') {
            resolvedData = root.$.get(resolvedData)._.put

            // Retry if linked data not yet available
            if (resolvedData === u && !force) {
              one[id] = setTimeout(() => executeOnce(true), opt.wait || 99)
              return
            }
          }

          // Skip if event stunned or already resolved
          if (eve.stun || one[id] === '') {
            return
          }

          // Mark as resolved and clean up
          one[id] = ''

          // Unsubscribe if this is a soul or hash-based chain
          if (cat.soul || cat.has) {
            eve.off()
          }

          // Execute callback with resolved data
          cb.call($, resolvedData, resolvedAt.get)

          // Final cleanup
          clearTimeout(one[id])
        }
      },
      { on: 1 }
    )

    return this
  }

  /**
   * Create a chainable once interface without callback
   * @param {Gun} gun - Gun instance
   * @param {Object} opt - Options
   * @returns {Gun} New Gun chain
   */
  function createOnceChain(gun, _opt) {
    Gun.log.once(
      'valonce',
      'Chainable val is experimental, its behavior and API may change moving forward. ' +
        'Please play with it and report bugs and ideas on how to improve it.'
    )

    const chain = gun.chain()

    // Set up chain cleanup
    chain._.nix = gun.once(function (_data, _key) {
      chain._.on('in', this._)
    })

    // Copy lexical context for proper chaining
    chain._.lex = gun._.lex

    return chain
  }

  /**
   * Unsubscribe from events and clean up all related resources
   *
   * @returns {Gun} Returns the Gun chain for method chaining
   *
   * Flow:
   * 1. Reset acknowledgment state for resubscription capability
   * 2. Clean up next/previous chain references
   * 3. Remove from caches and indexes
   * 4. Recursively clean up linked and mapped references
   * 5. Emit cleanup event
   */
  Gun.chain.off = function () {
    const at = this._
    const cat = at.back

    if (!cat) {
      return this
    }

    // Reset acknowledgment for potential resubscription
    at.ack = 0

    // Clean up next chain references
    const next = cat.next
    if (next) {
      if (next[at.get]) {
        delete next[at.get]
      }
    }

    // Clean up any cache
    if (cat.any) {
      cat.any = {}
    }

    // Clean up ask queue
    const ask = cat.ask
    if (ask) {
      delete ask[at.get]
    }

    // Clean up put cache
    const put = cat.put
    if (put) {
      delete put[at.get]
    }

    // Remove from graph if has soul
    const soul = at.soul
    if (soul) {
      delete cat.root.graph[soul]
    }

    // Recursively clean up mapped references
    const map = at.map
    if (map) {
      Object.keys(map).forEach((key) => {
        const mapAt = map[key]
        if (mapAt?.link) {
          cat.root.$.get(mapAt.link).off()
        }
      })
    }

    // Recursively clean up nested chains
    const atNext = at.next
    if (atNext) {
      Object.keys(atNext).forEach((key) => {
        const neat = atNext[key]
        neat?.$?.off()
      })
    }

    // Emit cleanup event
    at.on('off', empty)

    return this
  }
})()
