;(() => {
  const Gun = require('./root')

  const EMPTY_OBJECT = Object.create(null)
  const validate = Gun.valid
  const LISTENER_ID_LENGTH = 7
  const CORE_KEY_EQUALS = '='
  const CORE_KEY_COLON = ':'
  const PATH_KEY = '.'

  /**
   * Handles retrieval for string keys.
   * @param {string} key - The string key to retrieve.
   * @param {function} [cb] - Optional callback function.
   * @param {object} context - The gun context.
   * @returns {object} The gun chain for the key.
   */
  function handleStringKey(key, cb, context) {
    if (key.length === 0) {
      const nodeChain = context.chain()
      nodeChain._.err = { err: Gun.log('0 length key!', key) }
      if (cb) {
        cb.call(nodeChain, nodeChain._.err)
      }
      return nodeChain
    }
    const currentContext = context._
    const nextChains = currentContext.next || EMPTY_OBJECT
    let nodeChain = nextChains[key]
    if (!nodeChain) {
      nodeChain = key && createCachedChain(key, context)
    }
    return nodeChain?.$
  }
  /**
   * Processes message data for get operations, handling links and not options.
   * @param {object} msg - The message object.
   * @param {object} getOptions - Options for the get operation.
   * @param {object} rootContext - The root context.
   * @returns {object} Processed data with at, nodeData, sat, and shouldSkip.
   */
  function processMessageData(msg, getOptions, rootContext) {
    const at = msg.$._
    const sat = (msg.$$ || '')._
    let nodeData = (sat || at).put
    if ((!at.has && !at.soul) || undefined === nodeData) {
      // Handle non-core data: extract from msg.put using core keys
      const passData = msg.put
      nodeData =
        undefined === (passData || '')[CORE_KEY_EQUALS]
          ? undefined === (passData || '')[CORE_KEY_COLON]
            ? passData
            : passData[CORE_KEY_COLON]
          : passData[CORE_KEY_EQUALS]
    }
    let passData = Gun.valid(nodeData)
    const isLink = 'string' === typeof passData
    if (isLink) {
      passData = rootContext.$.get(passData)._.put
      nodeData =
        undefined === passData
          ? getOptions.not
            ? undefined
            : nodeData
          : passData
    }
    const shouldSkip = getOptions.not && undefined === nodeData
    return { at, nodeData, sat, shouldSkip }
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
   * Creates a cached chain for the given key and back context.
   * @param {string} key - The key for the chain.
   * @param {object} back - The back context.
   * @returns {object} The new chain context.
   */
  function createCachedChain(key, back) {
    const backContext = back._
    backContext.next ??= {}
    const nextChains = backContext.next
    const newChain = back.chain()
    const newChainContext = newChain._
    newChainContext.get = key
    nextChains[key] = newChainContext
    if (back === backContext.root.$) {
      newChainContext.soul = key
    } else if (backContext.soul || backContext.has) {
      newChainContext.has = key
    }
    return newChainContext
  }
  /**
   * Extracts the soul from the gun context.
   * @param {object} gun - The gun instance.
   * @param {function} cb - The callback function.
   * @param {*} _opt - Options (unused).
   * @param {*} as - Additional context.
   * @returns {object} The gun instance.
   */
  function extractSoul(gun, cb, _opt, as) {
    const gunContext = gun._
    const soulValue = gunContext.soul || gunContext.link
    if (soulValue) {
      return cb(soulValue, as, gunContext)
    }
    if (gunContext.jam) {
      return gunContext.jam.push([cb, as])
    }
    gunContext.jam = [[cb, as]]
    let ackCount = 0
    gun.get(
      (msg, eve) => {
        const peerCount = Object.keys(gunContext.root.opt.peers).length
        if (
          undefined === msg.put &&
          !gunContext.root.opt.super &&
          peerCount &&
          ++ackCount <= peerCount
        ) {
          // Wait for acknowledgments from all peers before extracting soul to ensure data consistency across the network
          return
        }
        eve.rid(msg)
        const msgContext = msg.$ ? msg.$._ : {}
        const jamQueue = gunContext.jam
        delete gunContext.jam
        jamQueue.forEach((callbackArgs) => {
          if (!callbackArgs) return
          const [cb, args] = callbackArgs
          const soulId =
            msgContext.link ||
            msgContext.soul ||
            Gun.valid(msg.put) ||
            msg.put?._?.['#']
          cb?.(soulId, args, msg, eve)
        })
      },
      { out: { get: { [PATH_KEY]: true } } }
    )
    return gun
  }
})()
