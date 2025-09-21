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
    if (!node || !node._ || typeof node !== 'object')
      throw new Error('Invalid node')
    if (
      typeof lexQuery !== 'string' &&
      (!lexQuery || typeof lexQuery !== 'object' || Array.isArray(lexQuery))
    ) {
      throw new Error(
        `Invalid lex query: expected string or plain object, got ${typeof lexQuery}`
      )
    }
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
    const handleLexEvent = function (eve) {
      if (
        String.match(eve.get || (eve.put || '')['.'], getLexPattern(lexQuery))
      ) {
        chainTmp.on('in', eve)
      }
      this.to.next(eve)
    }
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
  /**
   * Maps over the data in the chain.
   * @param {Object} chain - GUN chain
   * @param {Function|Object} cb - Callback function or lex query.
   * @param {*} _opt - Options (unused).
   * @param {*} _t - Additional parameter (unused).
   * @returns {Object} - updated chain
   * @throws {Error} - invalid field
   * @example chain.map('field')
   */
  Gun.chain.map = function (cb, _opt, _t) {
    const cat = this._
    if (cb != null && !checkMapField(cb) && typeof cb !== 'function')
      throw new Error('Invalid map argument')
    let lex
    let chain
    if (checkMapField(cb)) {
      lex = cb['.'] ? cb : { '.': cb }
      cb = u
    }
    if (!cb) {
      chain = cat.each
      if (chain) {
        return chain
      }
      chain = this.chain()
      cat.each = chain
      chain._.lex = lex || chain._.lex || cat.lex
      chain._.nix = this.back('nix')
      this.on('in', map, chain._)
      return chain
    }
    Gun.log.once(
      'mapfn',
      'Map functions are experimental, their behavior and API may change moving forward. Please play with it and report bugs and ideas on how to improve it.'
    )
    chain = this.chain()
    this.map().on(function (data, key, msg, eve) {
      const next = (cb || noop).call(this, data, key, msg, eve)
      if (u === next) {
        return
      }
      if (data === next) {
        return chain._.on('in', msg)
      }
      if (Gun.is(next)) {
        return chain._.on('in', next._)
      }
      const tmp = {}
      Object.assign(tmp, msg.put)
      tmp['='] = next
      chain._.on('in', { get: key, put: tmp })
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
    if (!at.soul && !msg.$$) {
      return
    } // this line took hundreds of tries to figure out. It only works if core checks to filter out above chains during link tho. This says "only bother to map on a node" for this layer of the chain. If something is not a node, map should not work.
    if (!checkLex(cat, msg, put)) {
      return
    }
    Gun.on.link(msg, cat)
  }
  const _event = { off: noop, stun: noop },
    u = undefined
})()
