;(() => {
  const Gun = require('./root')
  /**
   * Traverses back in the chain by a specified number of levels or path.
   * @param {number|string|Array|function} n - The number of levels to go back, a dot-separated string path, an array path, or a function to test.
   * @param {*} [opt] - Optional parameter passed to function if n is a function.
   * @returns {*} The node at the specified back position or the result of the function.
   */
  Gun.chain.back = function (n, opt) {
    n = n ?? 1
    if (n === -1 || n === Infinity) {
      return this._.root.$
    }
    if (n === 1) {
      return (this._.back || this._).$
    }
    const at = this._
    if (typeof n === 'string') {
      n = n.split('.')
    }
    if (Array.isArray(n)) {
      // Traverse the path in the current context
      const tmp = n.reduce((acc, key) => acc?.[key], at)
      if (tmp !== undefined) {
        return opt ? this : tmp
      }
      // If not found, try traversing back
      const backTmp = at.back
      if (backTmp) {
        return backTmp.$.back(n, opt)
      }
      return
    }
    if (typeof n === 'function') {
      // Traverse backwards until the function returns a defined value
      let yes
      let tmp = { back: at }
      while (tmp.back) {
        tmp = tmp.back
        yes = n(tmp, opt)
        if (yes !== undefined) break
      }
      return yes
    }
    if (typeof n === 'number') {
      // Traverse back by n levels
      let node = this
      for (let i = 0; i < n; i++) {
        const currentAt = node._
        node = (currentAt.back || currentAt).$
      }
      return node
    }
    return this
  }
})()
