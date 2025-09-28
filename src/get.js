;(() => {
  const Gun = require('./root')

  const EMPTY_OBJECT = Object.create(null)
  const validate = Gun.valid
  const LISTENER_ID_LENGTH = 7
  const CORE_KEY_EQUALS = '='
  const CORE_KEY_COLON = ':'
  const PATH_KEY = '.'

  /**
   * Handles retrieval for string keys by returning or creating a cached chain.
   * @param {string} key - The string key to retrieve.
   * @param {function} [callback] - Optional callback function for errors.
   * @param {object} chainContext - The Gun chain context.
   * @returns {object} The Gun chain for the key.
   */
  function handleStringKey(key, callback, chainContext) {
    if (key.length === 0) {
      // Invalid: empty key
      const errorChain = chainContext.chain()
      errorChain._.err = { err: Gun.log('0 length key!', key) }
      if (callback) {
        callback.call(errorChain, errorChain._.err)
      }
      return errorChain
    }
    const context = chainContext._
    const cachedChains = context.next || EMPTY_OBJECT
    let targetChain = cachedChains[key]
    if (!targetChain) {
      // Create and cache a new chain for this key
      targetChain = createCachedChain(key, chainContext)
    }
    return targetChain?.$ // Return the chain's public interface
  }
  /**
   * Processes message data for get operations, handling links and 'not' options.
   * Extracts node data from the message, resolving links if necessary.
   * @param {object} msg - The incoming message object.
   * @param {object} getOptions - Options for the get operation, including 'not' flag.
   * @param {object} rootContext - The root Gun context.
   * @returns {object} Processed data: { currentContext, nodeData, linkedContext, shouldSkip }
   */
  function processMessageData(msg, getOptions, rootContext) {
    const currentContext = msg.$._
    const linkedContext = (msg.$$ || '')._
    let nodeData = (linkedContext || currentContext).put

    // If no core data (no soul or has), extract from msg.put using special keys
    if (
      (!currentContext.has && !currentContext.soul) ||
      nodeData === undefined
    ) {
      const messagePut = msg.put
      // Prefer '=' key, then ':' key, fallback to entire put
      nodeData =
        messagePut?.[CORE_KEY_EQUALS] !== undefined
          ? messagePut[CORE_KEY_EQUALS]
          : messagePut?.[CORE_KEY_COLON] !== undefined
            ? messagePut[CORE_KEY_COLON]
            : messagePut
    }

    const validatedData = Gun.valid(nodeData)
    const isLink = typeof validatedData === 'string'
    if (isLink) {
      // Resolve link: get the linked node's data
      const linkedNodeData = rootContext.$.get(validatedData)._.put
      nodeData =
        linkedNodeData === undefined
          ? getOptions.not
            ? undefined
            : nodeData // If 'not' option and no data, return undefined
          : linkedNodeData
    }

    const shouldSkip = getOptions.not && nodeData === undefined
    return { at: currentContext, nodeData, sat: linkedContext, shouldSkip }
  }

  /**
   * Handles retrieval for function keys (callbacks).
   * @param {function} key - The callback function.
   * @param {*} cb - Options or true for soul extraction.
   * @param {*} as - Additional context.
   * @param {object} context - The gun context.
   * @returns {object} The gun chain.
   */
  function handleFunctionKey(key, cb, as, context) {
    if (true === cb) {
      extractSoul(context, key, cb, as)
      return context
    }
    const nodeChain = context
    const currentContext = nodeChain._
    const getOptions = cb || {}
    const rootContext = currentContext.root
    let listenerId = String.random(LISTENER_ID_LENGTH)
    getOptions.at = currentContext
    getOptions.ok = key
    const waitList = new Map() // can we assign this to the at instead, like in once?
    //var path = []; context.$.back(at => { at.get && path.push(at.get.slice(0,9))}); path = path.reverse().join('.');
    function listenerHandler(msg, eve, f) {
      if (listenerHandler.stun) {
        return
      }
      const passData = rootContext.pass
      if (passData && !passData[listenerId]) {
        return
      }
      const { nodeData, at, sat, shouldSkip } = processMessageData(
        msg,
        getOptions,
        rootContext
      )
      if (shouldSkip) return
      let stunCheck = {}
      if (undefined === getOptions.stun) {
        // Stun mechanism: pauses listeners during concurrent writes to ensure data consistency
        const stunData = rootContext.stun
        if (stunData?.on) {
          currentContext.$.back((a) => {
            // our chain stunned?
            stunCheck = {}
            stunData.on(`${a.id}`, stunCheck)
            if ((stunCheck.run || 0) < listenerHandler.id) {
              return stunCheck
            } // if there is an earlier stun on gapless parents/self.
          })
          if (!stunCheck.run) {
            stunCheck = {}
            stunData.on(`${at.id}`, stunCheck)
          } // this node stunned?
          if (!stunCheck.run && sat) {
            stunCheck = {}
            stunData.on(`${sat.id}`, stunCheck)
          } // linked node stunned?
          if (listenerHandler.id > stunCheck.run) {
            if (!stunCheck.stun || stunCheck.stun.end) {
              stunCheck.stun = stunData.on('stun')
              stunCheck.stun = stunCheck.stun?.last
            }
            if (stunCheck.stun && !stunCheck.stun.end) {
              //if(isOddNode && undefined === nodeData){ return }
              //if(undefined === msg.put){ return } // "not found" acks will be found if there is stun, so ignore these.
              if (!stunCheck.stun.add) {
                stunCheck.stun.add = {}
              }
              stunCheck.stun.add[listenerId] = () => {
                listenerHandler(msg, eve, 1)
              } // add ourself to the stun callback list that is called at end of the write.
              return
            }
          }
        }
        if (/*isOddNode &&*/ undefined === nodeData) {
          f = 0
        } // if data not found, keep waiting/trying.
        /*if(f && undefined === nodeData){
    currentContext.on('out', getOptions.out);
    return;
  }*/
        const hatchData = rootContext.hatch
        if (
          hatchData &&
          !hatchData.end &&
          undefined === getOptions.hatch &&
          !f
        ) {
          // Hatch: batches listener callbacks to fire after a complete batch of data is streamed, improving performance for bulk updates
          if (waitList.has(at.$._.id)) {
            return
          }
          waitList.set(at.$._.id, 1)
          hatchData.push(() => {
            listenerHandler(msg, eve, 1)
          })
          return
        }
        waitList.clear() // end quick hack.
      }
      // Call listener: prevent recursion with pass tracking
      if (rootContext.pass) {
        if (rootContext.pass[listenerId + at.id]) {
          return
        }
        rootContext.pass[listenerId + at.id] = 1
      }
      if (getOptions.on) {
        getOptions.ok.call(at.$, nodeData, at.get, msg, eve || listenerHandler)
        return
      } // TODO: Also consider breaking `this` since a lot of people do `=>` these days and `.call(` has slower performance.
      if (getOptions.v2020) {
        getOptions.ok(msg, eve || listenerHandler)
        return
      }
      const messageCopy = { ...msg }
      msg = messageCopy
      msg.put = nodeData // Compatibility with 2019 API: modify message.put for old callback style
      getOptions.ok.call(getOptions.as, msg, eve || listenerHandler) // is this the right
    }
    listenerHandler.at = currentContext
    listenerId = String.random(LISTENER_ID_LENGTH)
    if (!currentContext.any) {
      currentContext.any = {}
    }
    currentContext.any[listenerId] = listenerHandler
    listenerHandler.off = () => {
      listenerHandler.stun = 1
      if (!currentContext.any) {
        return
      }
      delete currentContext.any[listenerId]
    }
    listenerHandler.rid = function rid(at) {
      const ridContext = this.at || this.on
      if (!at || ridContext.soul || ridContext.has) {
        return this.off()
      }
      at = at.$ || at
      at = at._ || at
      if (!at.id) {
        return
      }

      //if(!map || !(tempNode = map[at]) || !(tempNode = tempNode.at)){ return }
      if (!this.seen) {
        this.seen = new Map()
      }
      const seenNodes = this.seen
      const tempNode = seenNodes.get(at)
      if (tempNode) {
        return true
      }
      seenNodes.set(at, true)
      //tempNode.echo[ridContext.id] = {}; // TODO: Warning: This unsubscribes ALL of this chain's listeners from this link, not just the one callback event.
      //obj.del(map, at); // TODO: Warning: This unsubscribes ALL of this chain's listeners from this link, not just the one callback event.
      return
    } // logic from old version, can we clean it up now?
    listenerHandler.id = getOptions.run || ++rootContext.once // used in callback to check if we are earlier than a write. // will this ever cause an integer overflow?
    const originalPass = rootContext.pass
    rootContext.pass = {}
    rootContext.pass[listenerId] = 1 // Explanation: test trade-offs want to prevent recursion so we add/remove pass flag as it gets fulfilled to not repeat, however map map needs many pass flags - how do we reconcile?
    getOptions.out = getOptions.out || { get: {} }
    currentContext.on('out', getOptions.out)
    rootContext.pass = originalPass
    return nodeChain
  }

  /**
   * Handles retrieval for number keys by converting to string.
   * @param {number} key - The number key.
   * @param {function} [cb] - Optional callback function.
   * @param {*} [as] - Additional options.
   * @param {object} context - The gun context.
   * @returns {object} The gun chain.
   */
  function handleNumberKey(key, cb, as, context) {
    return context.get(`${key}`, cb, as)
  }

  /**
   * Handles retrieval for invalid keys by validating or delegating.
   * @param {*} key - The key to validate.
   * @param {function} [cb] - Optional callback function.
   * @param {*} [as] - Additional options.
   * @param {object} context - The gun context.
   * @returns {object|undefined} The gun chain or undefined.
   */
  function handleInvalidKey(key, cb, as, context) {
    const validatedKey = validate(key)
    if ('string' === typeof validatedKey) {
      return context.get(validatedKey, cb, as)
    }
    const nextHandler = context.get.next
    if (nextHandler) {
      return nextHandler(context, key)
    }
    return undefined
  }

  /**
   * Retrieves data from the Gun database based on the key type.
   * @param {string|function|number} key - The key to get, or a callback function, or a number.
   * @param {function|boolean|object} [cb] - The callback function, true for soul extraction, or options object.
   * @param {*} [as] - Additional options or context.
   * @returns {object} The gun chain.
   */
  Gun.chain.get = function (key, cb, as) {
    let nodeChain
    if (typeof key === 'string') {
      nodeChain = handleStringKey(key, cb, this)
    } else if ('function' === typeof key) {
      nodeChain = handleFunctionKey(key, cb, as, this)
    } else if ('number' === typeof key) {
      nodeChain = handleNumberKey(key, cb, as, this)
    } else {
      nodeChain = handleInvalidKey(key, cb, as, this)
    }
    if (!nodeChain) {
      const errorChain = this.chain()
      errorChain._.err = {
        err: Gun.log('Invalid get request!', key)
      }
      if (cb) {
        cb.call(errorChain, errorChain._.err)
      }
      return errorChain
    }
    if (cb && 'function' === typeof cb) {
      nodeChain.get(cb, as)
    }
    return nodeChain
  }
  /**
   * Creates a cached chain for the given key and parent context.
   * Caches the chain to avoid recreating it for repeated accesses.
   * @param {string} key - The key for the chain.
   * @param {object} parent - The parent Gun chain context.
   * @returns {object} The new child chain context.
   */
  function createCachedChain(key, parent) {
    const parentContext = parent._
    parentContext.next ??= {}
    const nextChains = parentContext.next
    const childChain = parent.chain()
    const childContext = childChain._
    childContext.get = key
    nextChains[key] = childContext

    // Determine if this is a root soul or a property/has
    if (parent === parentContext.root.$) {
      childContext.soul = key // Root-level key is a soul
    } else if (parentContext.soul || parentContext.has) {
      childContext.has = key // Child of soul or has is a property
    }

    return childContext
  }
  /**
   * Extracts the soul (unique identifier) from the Gun context.
   * If soul is not immediately available, queues the callback and waits for network acknowledgments.
   * @param {object} gun - The Gun chain instance.
   * @param {function} callback - The callback function to receive the soul.
   * @param {*} _options - Unused options parameter.
   * @param {*} additionalContext - Additional context passed to callback.
   * @returns {object} The Gun instance.
   */
  function extractSoul(gun, callback, _options, additionalContext) {
    const context = gun._
    const soul = context.soul || context.link
    if (soul) {
      // Soul is already available, call callback immediately
      return callback(soul, additionalContext, context)
    }
    if (context.jam) {
      // Queue is already set up, add to existing queue
      return context.jam.push([callback, additionalContext])
    }
    // Initialize queue with this callback
    context.jam = [[callback, additionalContext]]
    let acknowledgmentCount = 0
    gun.get(
      (message, event) => {
        const peerCount = Object.keys(context.root.opt.peers).length
        if (
          message.put === undefined &&
          !context.root.opt.super &&
          peerCount &&
          ++acknowledgmentCount <= peerCount
        ) {
          // Wait for acknowledgments from all peers to ensure data consistency
          return
        }
        event.rid(message)
        const messageContext = message.$ ? message.$._ : {}
        const callbackQueue = context.jam
        delete context.jam
        callbackQueue.forEach((callbackArgs) => {
          if (!callbackArgs) return
          const [cb, args] = callbackArgs
          // Extract soul ID from various possible sources
          const soulId =
            messageContext.link ||
            messageContext.soul ||
            Gun.valid(message.put) ||
            message.put?._?.['#']
          cb?.(soulId, args, message, event)
        })
      },
      { out: { get: { [PATH_KEY]: true } } }
    )
    return gun
  }
})()
