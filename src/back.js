;(() => {
  const Gun = require('./root')

  /**
   * Traverses an array path in the given context, recursively checking back if not found.
   * @param {Object} context - The current context object.
   * @param {Array} path - The array path to traverse.
   * @returns {*} The value at the path or undefined if not found.
   */
  function traverseArrayPath(context, path) {
    // Try to find the path in the current context
    const result = path.reduce((acc, key) => acc?.[key], context)
    if (result !== undefined) {
      return result
    }
    // If not found, recursively check the back context
    const backContext = context.back
    if (backContext) {
      return traverseArrayPath(backContext, path)
    }
    return undefined
  }

  /**
   * Traverses backwards using a test function until it returns a defined value.
   * @param {Object} context - The starting context.
   * @param {Function} testFn - The function to test each context.
   * @param {*} opt - Optional parameter passed to the test function.
   * @returns {*} The result of the test function or undefined.
   */
  function traverseWithTestFunction(context, testFn, opt) {
    let current = { back: context }
    while (current.back) {
      current = current.back
      const result = testFn(current, opt)
      if (result !== undefined) {
        return result
      }
    }
    return undefined
  }

  /**
   * Traverses back by a specified number of levels in the chain.
   * @param {Object} chain - The starting chain node.
   * @param {number} levels - The number of levels to go back.
   * @returns {Object} The chain node after traversing back.
   */
  function traverseBackLevels(chain, levels) {
    let node = chain
    for (let i = 0; i < levels; i++) {
      const context = node._
      node = (context.back || context).$
    }
    return node
  }

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
    const context = this._
    if (typeof n === 'string') {
      n = n.split('.')
    }
    if (Array.isArray(n)) {
      return traverseArrayPath(context, n)
    }
    if (typeof n === 'function') {
      return traverseWithTestFunction(context, n, opt)
    }
    if (typeof n === 'number') {
      return traverseBackLevels(this, n)
    }
    return this
  }
})()
