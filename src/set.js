;(() => {
  /**
   * Sets an item in the graph, handling nodes, links, and plain objects.
   * @param {*} item - The item to set
   * @param {function} cb - Callback function
   * @param {object} opt - Options
   * @returns {*} The item or chain
   */
  const Gun = require('./root')
  Gun.chain.set = function (item, cb, opt) {
    const root = this.back(-1)
    let soul
    cb = cb || (() => {})
    opt = opt || {}
    opt.item = opt.item || item
    // Check if item is already a node reference
    soul = item?._?.['#']
    if (soul) {
      item = {}
      item['#'] = soul
    } // check if node, make link.
    // Validate the item
    const validationResult = Gun.valid(item)
    if (typeof validationResult === 'string') {
      soul = validationResult
      return this.get(soul).put(item, cb, opt)
    } // check if link
    // If item is not a Gun node
    if (!Gun.is(item)) {
      if (Object.plain(item)) {
        soul = this.back('opt.uuid')()
        item = root.get(soul).put(item)
      }
      return this.get(soul || root.back('opt.uuid')(7)).put(item, cb, opt)
    }
    // Set the item by retrieving its soul
    this.put((go) => {
      item.get((soul, _o, msg) => {
        // TODO: BUG! We no longer have this option? & go error not handled?
        if (!soul) {
          return cb.call(this, {
            err: Gun.log(`Only a node can be linked! Not "${msg.put}"!`)
          })
        }
        const linkData = {}
        linkData[soul] = { '#': soul }
        go(linkData)
      }, true)
    })
    return item
  }
})()
