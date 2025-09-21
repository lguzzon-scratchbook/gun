;(() => {
  const noop = () => {}
  var Gun = require('./root'),
    next = Gun.chain.get.next
  /**
   * Handles lex query processing for get.next override.
   * @param {Object} gun - The gun instance.
   * @param {Object|string} lex - The lex query.
   * @param {Function} next - The original next function.
   * @param {Function} noop - No-op function.
   * @returns {Object} The chained result.
   */
  const handleLexQuery = (gun, lex, next, noop) => {
    let tmp
    if (!Object.plain(lex)) {
      return (next || noop)(gun, lex)
    }
    tmp = lex['#'] || ''
    tmp = tmp['='] || tmp
    if (tmp) {
      return gun.get(tmp)
    }
    const chainTmp = gun.chain()._
    chainTmp.lex = lex
    const processInEvent = function (eve) {
      if (
        String.match(
          eve.get || (eve.put || '')['.'],
          lex['.'] || lex['#'] || lex
        )
      ) {
        chainTmp.on('in', eve)
      }
      this.to.next(eve)
    }
    gun.on('in', processInEvent)
    return chainTmp.$
  }
  /**
   * Overrides the get.next chain method to handle lex queries.
   * @param {Object} gun - The gun instance.
   * @param {Object|string} lex - The lex query.
   * @returns {Object} The chained result.
   * @throws {Error} If gun or lex is invalid.
   */
  Gun.chain.get.next = (gun, lex) => {
    if (!gun || typeof gun !== 'object') throw new Error('Invalid gun instance')
    if (!lex) throw new Error('Invalid lex query')
    return handleLexQuery(gun, lex, next, noop)
  }
  /**
   * Maps over the data in the chain.
   * @param {Function|Object} cb - Callback function or lex query.
   * @param {*} _opt - Options (unused).
   * @param {*} _t - Additional parameter (unused).
   * @returns {Object} The chained result.
   */
  Gun.chain.map = function (cb, _opt, _t) {
    const cat = this._
    let lex
    let chain
    if (Object.plain(cb)) {
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
      Object.keys(msg.put).forEach((k) => {
        tmp[k] = msg.put[k]
      })
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
    const tmp = cat.lex
    return (
      !tmp ||
      String.match(msg.get || (put || '')['.'], tmp['.'] || tmp['#'] || tmp)
    )
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
  var event = { off: noop, stun: noop },
    u
})()
