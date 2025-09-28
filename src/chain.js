;(() => {
  /**
   * @module chain
   * Gun chaining API module for handling chain operations, input/output, linking, and unlinking.
   */
  // WARNING: GUN is very simple, but the JavaScript chaining API around GUN
  // is complicated and was extremely hard to build. If you port GUN to another
  // language, consider implementing an easier API to build.
  const Gun = require('./root')

  const empty = {}
  const u = undefined
  const text_rand = String.random
  const valid = Gun.valid
  /**
   * Checks if an object or map has a property.
   * @param {Object|Map} o - The object or map to check.
   * @param {string} k - The key to check for.
   * @returns {boolean} True if the object or map has the key.
   */
  const obj_has = (o, k) =>
    o && (o instanceof Map ? o.has(k) : Object.hasOwn(o, k))
  const state = Gun.state
  const state_is = state.is
  const state_ify = state.ify

  /**
   * Creates a new chain instance, setting up its context and event listeners.
   * @param {Function} [subConstructor] - Optional subclass constructor.
   * @returns {Object} The new chain instance.
   */
  Gun.chain.chain = function (subConstructor) {
    const currentChainContext = this._
    const newChain = new (subConstructor || this).constructor(this)
    const newChainContext = newChain._
    const root = currentChainContext.root

    newChainContext.root = root
    newChainContext.id = ++root.once
    newChainContext.back = this._
    newChainContext.on = Gun.on

    // Set up input listener; must be done before any custom listeners
    newChainContext.on('in', Gun.on.in, newChainContext)

    // Set up output listener; no global option, must be individual
    newChainContext.on('out', Gun.on.out, newChainContext)

    return newChain
  }

  /**
   * Handles outgoing messages for the chain, managing requests and cached data.
   * @param {Object} msg - The message to output.
   */
  function output(msg) {
    let request
    const chainContext = this.as
    let parentChain = chainContext.back
    const root = chainContext.root
    let temp

    if (!msg.$) {
      msg.$ = chainContext.$
    }

    this.to.next(msg)

    if (chainContext.err) {
      chainContext.put = u
      chainContext.on('in', { $: chainContext.$, put: chainContext.put })
      return
    }

    if (msg.get) {
      request = msg.get
      if (root.pass) {
        root.pass[chainContext.id] = chainContext
      } // Note: May cause buggy behavior elsewhere

      if (chainContext.lex) {
        temp = msg.get = msg.get || {}
        Object.assign(temp, chainContext.lex)
      }

      if (request['#'] || chainContext.soul) {
        request['#'] = request['#'] || chainContext.soul
        if (!msg['#']) {
          msg['#'] = text_rand(9)
        }
        parentChain = root.$.get(request['#'])._
        request = request['.']

        if (!request) {
          // Requesting full node (soul)
          temp = parentChain.ask?.get('')
          if (!parentChain.ask) {
            parentChain.ask = new Map()
          }
          parentChain.ask.set('', parentChain)
          if (u !== parentChain.put) {
            parentChain.on('in', parentChain) // Send cached data
            if (temp) {
              return // Already asked
            }
          }
          msg.$ = parentChain.$
        } else if (obj_has(parentChain.put, request)) {
          // Requesting specific property
          temp = parentChain.ask?.get(request)
          if (!parentChain.ask) {
            parentChain.ask = new Map()
          }
          parentChain.ask.set(request, parentChain.$.get(request)._)
          parentChain.on('in', {
            get: request,
            put: {
              ':': parentChain.put[request],
              '.': request,
              '#': parentChain.soul,
              '>': state_is(root.graph[parentChain.soul], request)
            }
          })
          if (temp) {
            return // Already asked
          }
        }

        root.ask(ack, msg)
        return root.on('in', msg)
      }

      if (request['.']) {
        if (chainContext.get) {
          msg = { $: chainContext.$, get: { '.': chainContext.get } }
          if (!parentChain.ask) {
            parentChain.ask = new Map()
          }
          parentChain.ask.set(chainContext.get, msg.$._)
          return parentChain.on('out', msg)
        }
        msg = { $: chainContext.$, get: chainContext.lex ? msg.get : {} }
        return parentChain.on('out', msg)
      }

      if (!chainContext.ask) {
        chainContext.ask = new Map()
      }
      chainContext.ask.set('', chainContext)

      if (chainContext.get) {
        request['.'] = chainContext.get
        if (!parentChain.ask) {
          parentChain.ask = new Map()
        }
        parentChain.ask.set(chainContext.get, msg.$._)
        return parentChain.on('out', msg)
      }
    }

    return parentChain.on('out', msg)
  }

  /**
   * Handles incoming messages for the chain, processing data updates and propagating to listeners.
   * @param {Object} msg - The incoming message.
   * @param {Object} [chainContext] - The chain context (optional, defaults to this.as).
   */
  function input(msg, chainContext) {
    chainContext = chainContext || this.as
    const root = chainContext.root
    if (!msg.$) {
      msg.$ = chainContext.$
    }
    let gun = msg.$
    const messageChainData = (gun || '')._ || empty
    let temp = msg.put || {}
    let soul = temp['#']
    let key = temp['.']
    const change = u !== temp['='] ? temp['='] : temp[':']
    const state = temp['>'] || -Infinity
    let subChain // Sub-chain for children

    // Handle old format conversion
    if (
      u !== msg.put &&
      (u === temp['#'] ||
        u === temp['.'] ||
        (u === temp[':'] && u === temp['=']) ||
        u === temp['>'])
    ) {
      if (!valid(temp)) {
        soul = ((temp || '')._ || '')['#']
        if (!soul) {
          console.log(
            'chain not yet supported for',
            temp,
            '...',
            msg,
            chainContext
          )
          return
        }
        gun = chainContext.root.$.get(soul)
        // Process each key asynchronously; note: Object.keys is slow
        return setTimeout.each(Object.keys(temp).sort(), (k) => {
          const state = state_is(temp, k)
          if ('_' === k || u === state) {
            return
          }
          chainContext.on('in', {
            $: gun,
            put: { '.': k, '#': soul, '=': temp[k], '>': state },
            VIA: msg
          })
        })
      }
      soul = messageChainData.back.soul
      key = messageChainData.has || messageChainData.get
      chainContext.on('in', {
        $: messageChainData.back.$,
        put: {
          '.': key,
          '#': soul,
          '=': temp,
          '>': state_is(messageChainData.back.put, key)
        },
        via: msg
      }) // Note: This approximation may be buggy if data is corrupted
      return
    }

    // Prevent processing duplicate messages
    if (msg.seen?.[chainContext.id]) {
      return
    }
    if (!msg.seen) {
      msg.seen = {}
    }
    msg.seen[chainContext.id] = chainContext

    // Adjust message context if needed
    if (chainContext !== messageChainData) {
      temp = { ...msg }
      temp.get = chainContext.get || temp.get
      if (!chainContext.soul && !chainContext.has) {
        temp.$$$ = temp.$$$ || chainContext.$
      } else if (messageChainData.soul) {
        temp.$ = chainContext.$
        temp.$$ = temp.$$ || messageChainData.$
      }
      msg = temp
    }

    unlink(msg, chainContext)

    // Update cache for soul chains or linked messages
    if (
      (chainContext.soul || msg.$$) &&
      state >= state_is(root.graph[soul], key)
    ) {
      temp = root.$.get(soul)._
      temp.put = state_ify(temp.put, key, state, change, soul)
    }

    // Update cache for non-soul chains
    if (!messageChainData.soul && state >= state_is(root.graph[soul], key)) {
      subChain = root.$.get(soul)._.next?.[key]
      if (subChain) {
        subChain.put = change
        const validatedChange = valid(change)
        if (typeof validatedChange === 'string') {
          subChain.put = root.$.get(validatedChange)._.put || change
        }
      }
    }

    // Propagate to next listener in chain
    this.to?.next(msg)

    // Handle any listeners
    if (chainContext.any) {
      void Promise.all(
        Object.keys(chainContext.any).map((listenerId) => {
          const listener = chainContext.any[listenerId]
          return listener ? Promise.resolve(listener(msg)) : Promise.resolve()
        })
      )
    }

    // Handle echo listeners
    if (chainContext.echo) {
      void Promise.all(
        Object.keys(chainContext.echo).map((echoId) => {
          const echoChain = chainContext.echo[echoId]
          return echoChain
            ? Promise.resolve(echoChain.on('in', msg))
            : Promise.resolve()
        })
      )
    }

    // Propagate to sub-chains if applicable
    if (((msg.$$ || '')._ || messageChainData).soul) {
      subChain = chainContext.next?.[key]
      if (subChain) {
        temp = { ...msg }
        temp.get = key
        temp.$ = msg.$$?.get(temp.get) || msg.$?.get(temp.get)
        delete temp.$$
        delete temp.$$$
        subChain.on('in', temp)
      }
    }

    link(msg, chainContext)
  }

  /**
   * Links chains for data propagation, establishing connections between related data nodes.
   * @param {Object} msg - The message containing link information.
   * @param {Object} cat - The chain context (optional, defaults to this.as or msg.$._).
   */
  function link(msg, cat) {
    cat = cat || this.as || msg.$._
    let targetChain

    // Ignore messages from linked sources unless called directly
    if (msg.$$ && this !== Gun.on) {
      return
    }

    // Cannot link to nothing or link a soul chain
    if (!msg.put || cat.soul) {
      return
    }

    const putData = msg.put || {}
    let linkTarget = putData['='] || putData[':']
    let temp
    const root = cat.root
    const targetChainContext = root.$.get(putData['#']).get(putData['.'])._

    linkTarget = valid(linkTarget)
    if (typeof linkTarget !== 'string') {
      // Allow explicit linking to simple data when called from Gun.on
      if (this === Gun.on) {
        targetChainContext.echo = targetChainContext.echo || {}
        targetChainContext.echo[cat.id] = cat
      }
      return // Do not link to non-link data by default
    }

    targetChainContext.echo = targetChainContext.echo || {}

    // Avoid redundant linking unless a new listener requires a pass
    if (targetChainContext.echo[cat.id] && !root.pass?.[cat.id]) {
      return
    }

    temp = root.pass
    // Prevent infinite passes on circular graphs
    if (temp?.[linkTarget + cat.id]) {
      return
    }
    if (temp) {
      temp[linkTarget + cat.id] = 1
    }

    // Set up echo for self
    targetChainContext.echo[cat.id] = cat

    if (cat.has) {
      cat.link = linkTarget
    }
    targetChainContext.link = linkTarget

    // Get the target chain we're linking to
    targetChain = root.$.get(linkTarget)?._
    if (targetChain && !targetChain.echo) {
      targetChain.echo = {}
    }
    if (targetChain?.echo) {
      targetChain.echo[targetChainContext.id] = targetChainContext
    }

    // Request data for pending asks
    temp = cat.ask || new Map()
    if (cat.ask?.has('') || cat.lex) {
      // Load the entire linked node; note: cat.lex may have edge cases
      targetChain?.on('out', { get: { '#': linkTarget } })
    }

    // Request specific properties for sub-chains
    void Promise.all(
      [...temp.keys()].map((property) => {
        const subChain = temp.get(property)
        if (!property || !subChain) {
          return Promise.resolve()
        }
        return Promise.resolve(
          subChain.on('out', { get: { '.': property, '#': linkTarget } })
        )
      })
    )
  }

  /**
   * Unlinks chains when data is removed, cleaning up connections and caches.
   * @param {Object} msg - The message indicating data removal.
   * @param {Object} cat - The chain context.
   */
  function unlink(msg, cat) {
    const putData = msg.put || {}
    const change = u !== putData['='] ? putData['='] : putData[':']
    const root = cat.root
    let linkTarget
    let temp

    if (u === change) {
      // Handle case where data is being cleared (e.g., not found or deleted)
      // Note: Potential bug with async cache clearing; may need async ID check
      // Note: Map handling may have issues with sync/async operations
      if (cat.soul && u !== cat.put) {
        return // Soul chains with existing data cannot be fully cleared
      }

      temp = msg.$$?._ || msg.$?._ || {}
      if (msg['@'] && (u !== temp.put || u !== cat.put)) {
        return // Don't clear if we have data and received not-found from peers
      }

      linkTarget = cat.link || msg.linked
      if (linkTarget) {
        delete root.$.get(linkTarget)?._?.echo?.[cat.id]
      }

      if (cat.has) {
        // TODO: Consider clearing links, maps, echoes, acks/asks
        cat.link = null
      }

      cat.put = u // Clear cache

      // Clear sub-chains
      // Note: For maps, may need to trigger individual subs instead of all
      void Promise.all(
        Object.keys(cat.next || {}).map((property) => {
          const subChain = cat.next?.[property]
          if (!subChain) {
            return Promise.resolve()
          }
          if (linkTarget) {
            delete root.$.get(linkTarget)?.get(property)?._?.echo?.[subChain.id]
          }
          return Promise.resolve(
            subChain.on('in', { $: subChain.$, get: property, put: u })
          )
        })
      )
      return
    }

    if (cat.soul) {
      return // Soul chains cannot unlink themselves
    }

    if (msg.$$) {
      return // Linked chains don't handle unlinking; sub-chains do
    }

    linkTarget = valid(change) // Validate new link target
    temp = msg.$?._ || {}

    // Avoid redundant unlinking
    if (linkTarget === temp.link || (cat.has && !temp.link)) {
      if (root.pass?.[cat.id] && typeof linkTarget !== 'string') {
        // Allow during pass for non-string links
      } else {
        return
      }
    }

    delete temp.echo?.[cat.id]
    const previousLink = msg.linked || temp.link
    msg.linked = previousLink

    // Recursively unlink sub-chains
    unlink(
      {
        $: msg.$,
        get: cat.get,
        linked: previousLink,
        put: u
      },
      cat
    )
  }

  /**
   * Handles acknowledgments for messages, processing responses to requests.
   * @param {Object} msg - The acknowledgment message.
   */
  function ack(msg) {
    // Memory leak prevention is now handled by .ask itself.
    const chainContext = this.as
    const chainData = chainContext.$._
    const request = chainContext.get || {}
    const responseData = msg.put?.[request['#']] || {}

    // Check if the response indicates no data found
    if (
      !msg.put ||
      (typeof request['.'] === 'string' && u === responseData[request['.']])
    ) {
      // If we already have cached data, don't process
      if (u !== chainData.put) {
        return
      }
      // Only core chains (soul or has) handle not-found responses to avoid bugs
      if (!chainData.soul && !chainData.has) {
        return
      }
      chainData.ack = (chainData.ack || 0) + 1
      chainData.put = u
      chainData.on('in', {
        '@': msg['@'],
        $: chainData.$,
        get: chainData.get,
        put: chainData.put
      })
      return
    }
    // Mark as a miss and delegate to put handler
    ;(msg._ || {}).miss = 1
    Gun.on.put(msg)
  }

  Gun.on.out = output
  Gun.on.in = input
  Gun.on.link = link
  Gun.on.unlink = unlink
})()
