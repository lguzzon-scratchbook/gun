;(() => {
  const Gun = require('./root')
  /**
   * Traverses back in the chain by a specified number of levels or path.
   * @param {number|string|Array|function} n - The number of levels to go back, a dot-separated string path, an array path, or a function to test.
   * @param {*} [opt] - Optional parameter passed to function if n is a function.
   * @returns {*} The node at the specified back position or the result of the function.
   */
  Gun.chain.back = function (n, opt) {
    const empty = {}
    n = n || 1
    if (n === -1 || n === Infinity) {
      return this._.root.$
    } else if (n === 1) {
      return (this._.back || this._).$
    }
    const at = this._
    if (typeof n === 'string') {
      n = n.split('.')
    }
    if (Array.isArray(n)) {
      const l = n.length
      let tmp = at
      for (let i = 0; i < l; i++) {
        tmp = (tmp || empty)[n[i]]
      }
      if (undefined !== tmp) {
        return opt ? this : tmp
      } else {
        const backTmp = at.back
        if (backTmp) {
          return backTmp.$.back(n, opt)
        }
      }
      return
    }
    if (typeof n === 'function') {
      let yes
      let tmp = { back: at }
      while (tmp.back) {
        tmp = tmp.back
        yes = n(tmp, opt)
        if (undefined !== yes) break
      }
      return yes
    }
    if (typeof n === 'number') {
      return (at.back || at).$.back(n - 1)
    }
    return this
  }
})()
