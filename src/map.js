;(() => {
  // Utility Functions
  /** @function noop @returns {void} No-op function. */
  const noop = () => {}
  /** @function getSoul @param {object|string} lex - Input lex. @returns {string} Soul if present. */
  const getSoul = (lex) => {
    if (!lex) return ''
    const tmp = lex['#'] || ''
    if (Array.isArray(tmp)) return tmp[0] || ''
    return tmp['='] || tmp
  }
  /** @function getLexPattern @param {object|string} lex - Input lex. @returns {string} Lex pattern. */
  const getLexPattern = (lex) => {
    if (!lex) return ''
    return lex['.'] || lex['#'] || lex
  }
  /** @function checkMapField @param {string|object} field - Field to check. @returns {boolean} True if valid map field. @throws {Error} For invalid inputs. */
  const checkMapField = (field) => {
    return (
      typeof field === 'string' ||
      (field && typeof field === 'object' && !Array.isArray(field))
    )
  }
  /** @function invokeLexSafely @param {Object} gun - Gun instance. @param {string|Object} query - Lex query. @param {function} next - Next function. @param {function} noop - Noop function. @returns {*} Result of lex or fallback. */
  const invokeLexSafely = (gun, query, next, noop) => {
    try {
      return lex(gun, query, next, noop)
    } catch (error) {
      if (!gun._) {
        console.warn('GUN map.get.next: Internal fallback for missing gun._')
        return next?.call(gun, query) ?? gun
      }
      throw error
    }
  }
  const Gun = require('./root'),
    next = Gun.chain.get.next
  /** @function validateLexInput @param {object} node - Gun node instance. @param {string|object} lexQuery - Lex query. @throws {Error} For invalid node or lexQuery. */
  const validateLexInput = (node, lexQuery) => {
    if (!node || typeof node !== 'object')
      throw new Error('Invalid node: must be an object')
    if (!node._) throw new Error('Invalid node: missing _ property')
    if (
      typeof lexQuery !== 'string' &&
      (!lexQuery || typeof lexQuery !== 'object' || Array.isArray(lexQuery))
    ) {
      throw new Error(
        `Invalid lex query: expected string or plain object, got ${typeof lexQuery}`
      )
    }
  }
  /** @function createHandleLexEvent @param {object} chainTmp - Chain temp object. @param {string|object} lexQuery - Lex query. @returns {function} Event handler function. */
  const createHandleLexEvent = (chainTmp, lexQuery) =>
    function (eve) {
      if (
        String.match(eve.get || (eve.put || '')['.'], getLexPattern(lexQuery))
      ) {
        chainTmp.on('in', eve)
      }
      this.to.next(eve)
    }
  /**
   * @param {IGunInstance} node
   * @param {string|object} lexQuery
   * @param {function} [next=noop]
   * @param {function} [noop=() => {}]
   * @returns {IGunChainReference} Chain with optional off method
   * @throws {Error} Invalid inputs
   * @example lex(node, '#soul', cb)
   */
  const lex = (node, lexQuery, next, noop) => {
    validateLexInput(node, lexQuery)
    // Handles non-plain objects by direct callback
    if (!Object.plain(lexQuery)) {
      return (next || noop)(node, lexQuery)
    }
    const soul = getSoul(lexQuery)
    if (soul) {
      return node.get(soul)
    }
    const chainTmp = node.chain()._
    chainTmp.lex = lexQuery
    const handleLexEvent = createHandleLexEvent(chainTmp, lexQuery)
    node.on('in', handleLexEvent)
    chainTmp.$.off = () => node.off('in', handleLexEvent)
    return chainTmp.$
  }
  /**
   * Overrides the get.next chain method to handle lex queries.
   * @param {Object} gun - The gun instance (optional internal usage tolerated).
   * @param {string|Object} query - The lex query (string or plain object).
   * @returns {IGunChainReference} The chained result.
   * @throws {Error} If gun or query is invalid.
   * @example gun.get('#soul')
   * @example gun.get({'.': 'field'})
   */
  Gun.chain.get.next = (gun, query) => {
    if (
      !gun ||
      typeof gun !== 'object' ||
      (gun._ && typeof gun._ !== 'object')
    ) {
      throw new Error('GUN map.get.next: Invalid gun instance')
    }
    if (!query || !checkMapField(query))
      throw new Error('GUN map.get.next: Invalid lex query')
    return invokeLexSafely(gun, query, next, noop)
  }
  /** @function validateMapCallback @param {*} cb - Callback or field. @throws {Error} For invalid cb. */
  const validateMapCallback = (cb) => {
    if (cb != null && !checkMapField(cb) && typeof cb !== 'function')
      throw new Error('Invalid map argument')
  }
  /** @function isValidMapNode @param {object} at - Gun at object. @param {object} msg - Message. @returns {boolean} True if valid node. */
  const isValidMapNode = (at, msg) => at.soul || msg.$$
  /** @function handleMapCallbackResult @param {object} chain - Chain. @param {*} data - Data. @param {string} key - Key. @param {object} msg - Message. @param {object} _eve - Event. @param {*} next - Next value. */
  const handleMapCallbackResult = (chain, data, key, msg, _eve, next) => {
    // Handle different types of callback results: ignore undefined, pass through data, Gun instances, or transform to new put
    if (undefined === next) return
    if (data === next) return chain._.on('in', msg)
    if (Gun.is(next)) return chain._.on('in', next._)
    const tmp = {}
    Object.assign(tmp, msg.put)
    tmp['='] = next
    chain._.on('in', { get: key, put: tmp })
  }
  /**
   * Maps over the data in the chain.
   * @param {Function|Object|string} cb - Callback function or lex query.
   * @param {*} _opt - Options (unused).
   * @param {*} _t - Additional parameter (unused).
   * @returns {IGunChainReference} - updated chain
   * @throws {Error} - invalid cb
   * @example chain.map('field')
   * @example chain.map(function(data, key) { ... })
   */
  Gun.chain.map = function (cb, _opt, _t) {
    const cat = this._
    validateMapCallback(cb)
    let lex
    if (checkMapField(cb)) {
      // If cb is a field, convert to lex query and set cb to undefined
      lex = cb['.'] ? cb : { '.': cb }
      cb = undefined
    }
    if (!cb) {
      const chain = cat.each
      if (chain) return chain
      const newChain = this.chain()
      cat.each = newChain
      newChain._.lex = lex || newChain._.lex || cat.lex
      newChain._.nix = this.back('nix')
      this.on('in', map, newChain._)
      return newChain
    }
    Gun.log.once(
      'mapfn',
      'Map functions are experimental, their behavior and API may change moving forward. Please play with it and report bugs and ideas on how to improve it.'
    )
    const chain = this.chain()
    this.map().on((data, key, msg, eve) => {
      const next = (cb || noop).call(this, data, key, msg, eve)
      handleMapCallbackResult(chain, data, key, msg, eve, next)
    })
    return chain
  }
  /**
   * Checks if the message matches the lex query.
   * @param {Object} cat - The category object.
   * @param {Object} msg - The message object.
   * @param {Object} put - The put object.
   * @returns {boolean} True if matches, false otherwise.
   */
  const checkLex = (cat, msg, put) => {
    const lex = cat.lex
    return !lex || String.match(msg.get || (put || '')['.'], getLexPattern(lex))
  }
  /**
   * Internal map function to handle messages.
   * @param {Object} msg - The message object.
   */
  function map(msg) {
    this.to.next(msg)
    const cat = this.as
    const gun = msg.$
    const at = gun._
    const put = msg.put
    if (!isValidMapNode(at, msg)) return
    if (!checkLex(cat, msg, put)) return
    Gun.on.link(msg, cat)
  }
  const _event = { off: noop, stun: noop }
})()
