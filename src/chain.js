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
   * Ensures the context has an ask Map, initializing it if necessary.
   * @param {Object} context - The chain context.
   * @returns {Map} The ask Map.
   */
  const ensureAskMap = (context) => {
    if (!context.ask) {
      context.ask = new Map()
    }
    return context.ask
  }

  /**
   * Creates a new chain instance, setting up its context and event listeners.
   * @param {Function} [subConstructor] - Optional subclass constructor.
   * @returns {Object} The new chain instance.
   */
  Gun.chain.chain = function (subConstructor) {
    const currentContext = this._
    const newChain = new (subConstructor || this).constructor(this)
    const newContext = newChain._
    const root = currentContext.root

    newContext.root = root
    newContext.id = ++root.once
    newContext.back = this._
    newContext.on = Gun.on

    // Set up input listener; must be done before any custom listeners
    newContext.on('in', Gun.on.in, newContext)

    // Set up output listener; no global option, must be individual
    newContext.on('out', Gun.on.out, newContext)

    return newChain
  }

  /**
   * Handles outgoing messages for the chain, managing requests and cached data.
   * @param {Object} msg - The message to output.
   */
  function output(msg) {
    let request
    const context = this.as
    let parent = context.back
    const root = context.root
    let temp

    if (!msg.$) {
      msg.$ = context.$
    }

    this.to.next(msg)

    if (context.err) {
      context.put = u
      context.on('in', { $: context.$, put: context.put })
      return
    }

    if (msg.get) {
      request = msg.get
      if (root.pass) {
        root.pass[context.id] = context
      } // Note: May cause buggy behavior elsewhere

      if (context.lex) {
        temp = msg.get = msg.get || {}
        Object.assign(temp, context.lex)
      }

      if (request['#'] || context.soul) {
        request['#'] = request['#'] || context.soul
        if (!msg['#']) {
          msg['#'] = text_rand(9)
        }
        parent = root.$.get(request['#'])._
        request = request['.']
        const parentSoul = parent.soul

        if (!request) {
          // Requesting full node (soul)
          temp = parent.ask?.get('')
          ensureAskMap(parent).set('', parent)
          if (u !== parent.put) {
            parent.on('in', parent) // Send cached data
            if (temp) {
              return // Already asked
            }
          }
          msg.$ = parent.$
        } else if (obj_has(parent.put, request)) {
          // Requesting specific property
          temp = parent.ask?.get(request)
          ensureAskMap(parent).set(request, parent.$.get(request)._)
          parent.on('in', {
            get: request,
            put: {
              ':': parent.put[request],
              '.': request,
              '#': parentSoul,
              '>': state_is(root.graph[parentSoul], request)
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
        if (context.get) {
          msg = { $: context.$, get: { '.': context.get } }
          ensureAskMap(parent).set(context.get, msg.$._)
          return parent.on('out', msg)
        }
        msg = { $: context.$, get: context.lex ? msg.get : {} }
        return parent.on('out', msg)
      }

      ensureAskMap(context).set('', context)

      if (context.get) {
        request['.'] = context.get
        ensureAskMap(parent).set(context.get, msg.$._)
        return parent.on('out', msg)
      }
    }

    return parent.on('out', msg)
  }

  /**
   * Handles incoming messages for the chain, processing data updates and propagating to listeners.
   * @param {Object} msg - The incoming message.
   * @param {Object} [context] - The chain context (optional, defaults to this.as).
   */
  function input(msg, context) {
    context = context || this.as
    const root = context.root
    if (!msg.$) {
      msg.$ = context.$
    }
    let gun = msg.$
    const msgData = (gun || '')._ || empty
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
          console.log('chain not yet supported for', temp, '...', msg, context)
          return
        }
        gun = context.root.$.get(soul)
        // Process each key asynchronously; note: Object.keys is slow
        return setTimeout.each(Object.keys(temp).sort(), (k) => {
          const state = state_is(temp, k)
          if ('_' === k || u === state) {
            return
          }
          context.on('in', {
            $: gun,
            put: { '.': k, '#': soul, '=': temp[k], '>': state },
            VIA: msg
          })
        })
      }
      soul = msgData.back.soul
      key = msgData.has || msgData.get
      context.on('in', {
        $: msgData.back.$,
        put: {
          '.': key,
          '#': soul,
          '=': temp,
          '>': state_is(msgData.back.put, key)
        },
        via: msg
      }) // Note: This approximation may be buggy if data is corrupted
      return
    }

    // Prevent processing duplicate messages
    if (msg.seen?.[context.id]) {
      return
    }
    if (!msg.seen) {
      msg.seen = {}
    }
    msg.seen[context.id] = context

    // Adjust message context if needed
    if (context !== msgData) {
      temp = { ...msg }
      temp.get = context.get || temp.get
      if (!context.soul && !context.has) {
        temp.$$$ = temp.$$$ || context.$
      } else if (msgData.soul) {
        temp.$ = context.$
        temp.$$ = temp.$$ || msgData.$
      }
      msg = temp
    }

    unlink(msg, context)

    // Update cache for soul chains or linked messages
    if ((context.soul || msg.$$) && state >= state_is(root.graph[soul], key)) {
      temp = root.$.get(soul)._
      temp.put = state_ify(temp.put, key, state, change, soul)
    }

    // Update cache for non-soul chains
    if (!msgData.soul && state >= state_is(root.graph[soul], key)) {
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
    if (context.any) {
      void Promise.all(
        Object.keys(context.any).map((listenerId) => {
          const listener = context.any[listenerId]
          return listener ? Promise.resolve(listener(msg)) : Promise.resolve()
        })
      )
    }

    // Handle echo listeners
    if (context.echo) {
      void Promise.all(
        Object.keys(context.echo).map((echoId) => {
          const echoChain = context.echo[echoId]
          return echoChain
            ? Promise.resolve(echoChain.on('in', msg))
            : Promise.resolve()
        })
      )
    }

    // Propagate to sub-chains if applicable
    if (((msg.$$ || '')._ || msgData).soul) {
      subChain = context.next?.[key]
      if (subChain) {
        temp = { ...msg }
        temp.get = key
        temp.$ = msg.$$?.get(temp.get) || msg.$?.get(temp.get)
        delete temp.$$
        delete temp.$$$
        subChain.on('in', temp)
      }
    }

    link(msg, context)
  }

  /**
   * Links chains for data propagation, establishing connections between related data nodes.
   * @param {Object} msg - The message containing link information.
   * @param {Object} context - The chain context (optional, defaults to this.as or msg.$._).
   */
  function link(msg, context) {
    context = context || this.as || msg.$._
    let targetChain

    // Ignore messages from linked sources unless called directly
    if (msg.$$ && this !== Gun.on) {
      return
    }

    // Cannot link to nothing or link a soul chain
    if (!msg.put || context.soul) {
      return
    }

    const put = msg.put || {}
    let linkTarget = put['='] || put[':']
    let temp
    const root = context.root
    const targetChainContext = root.$.get(put['#']).get(put['.'])._

    linkTarget = valid(linkTarget)
    if (typeof linkTarget !== 'string') {
      // Allow explicit linking to simple data when called from Gun.on
      if (this === Gun.on) {
        targetChainContext.echo = targetChainContext.echo || {}
        targetChainContext.echo[context.id] = context
      }
      return // Do not link to non-link data by default
    }

    targetChainContext.echo = targetChainContext.echo || {}

    // Avoid redundant linking unless a new listener requires a pass
    if (targetChainContext.echo[context.id] && !root.pass?.[context.id]) {
      return
    }

    temp = root.pass
    // Prevent infinite passes on circular graphs
    if (temp?.[linkTarget + context.id]) {
      return
    }
    if (temp) {
      temp[linkTarget + context.id] = 1
    }

    // Set up echo for self
    targetChainContext.echo[context.id] = context

    if (context.has) {
      context.link = linkTarget
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
    temp = ensureAskMap(context)
    if (context.ask?.has('') || context.lex) {
      // Load the entire linked node; note: context.lex may have edge cases
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
   * @param {Object} context - The chain context.
   */
  function unlink(msg, context) {
    const put = msg.put || {}
    const value = u !== put['='] ? put['='] : put[':']
    const root = context.root
    let linkTarget
    let temp

    if (u === value) {
      // Handle case where data is being cleared (e.g., not found or deleted)
      // Note: Potential bug with async cache clearing; may need async ID check
      // Note: Map handling may have issues with sync/async operations
      if (context.soul && u !== context.put) {
        return // Soul chains with existing data cannot be fully cleared
      }

      temp = msg.$$?._ || msg.$?._ || {}
      if (msg['@'] && (u !== temp.put || u !== context.put)) {
        return // Don't clear if we have data and received not-found from peers
      }

      linkTarget = context.link || msg.linked
      if (linkTarget) {
        delete root.$.get(linkTarget)?._?.echo?.[context.id]
      }

      if (context.has) {
        // TODO: Consider clearing links, maps, echoes, acks/asks
        context.link = null
      }

      context.put = u // Clear cache

      // Clear sub-chains
      // Note: For maps, may need to trigger individual subs instead of all
      void Promise.all(
        Object.keys(context.next || {}).map((property) => {
          const subChain = context.next?.[property]
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

    if (context.soul) {
      return // Soul chains cannot unlink themselves
    }

    if (msg.$$) {
      return // Linked chains don't handle unlinking; sub-chains do
    }

    linkTarget = valid(value) // Validate new link target
    temp = msg.$?._ || {}

    // Avoid redundant unlinking
    if (linkTarget === temp.link || (context.has && !temp.link)) {
      if (root.pass?.[context.id] && typeof linkTarget !== 'string') {
        // Allow during pass for non-string links
      } else {
        return
      }
    }

    delete temp.echo?.[context.id]
    const previousLink = msg.linked || temp.link
    msg.linked = previousLink

    // Recursively unlink sub-chains
    unlink(
      {
        $: msg.$,
        get: context.get,
        linked: previousLink,
        put: u
      },
      context
    )
  }

  /**
   * Handles acknowledgments for messages, processing responses to requests.
   * @param {Object} msg - The acknowledgment message.
   */
  function ack(msg) {
    // Memory leak prevention is now handled by .ask itself.
    const context = this.as
    const data = context.$._
    const req = context.get || {}
    const resp = msg.put?.[req['#']] || {}

    // Check if the response indicates no data found
    if (!msg.put || (typeof req['.'] === 'string' && u === resp[req['.']])) {
      // If we already have cached data, don't process
      if (u !== data.put) {
        return
      }
      // Only core chains (soul or has) handle not-found responses to avoid bugs
      if (!data.soul && !data.has) {
        return
      }
      data.ack = (data.ack || 0) + 1
      data.put = u
      data.on('in', {
        '@': msg['@'],
        $: data.$,
        get: data.get,
        put: data.put
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
