;(() => {
  const Gun = require('./root')
  Gun.chain.set = function (item, cb, opt) {
    const root = this.back(-1)
    let soul
    let tmp
    cb = cb || (() => {})
    opt = opt || {}
    opt.item = opt.item || item
    soul = ((item || '')._ || '')['#']
    if (soul) {
      item = {}
      item['#'] = soul
    } // check if node, make link.
    tmp = Gun.valid(item)
    if (typeof tmp === 'string') {
      soul = tmp
      return this.get(soul).put(item, cb, opt)
    } // check if link
    if (!Gun.is(item)) {
      if (Object.plain(item)) {
        soul = this.back('opt.uuid')()
        item = root.get(soul).put(item)
      }
      return this.get(soul || root.back('opt.uuid')(7)).put(item, cb, opt)
    }
    this.put((go) => {
      item.get((soul, _o, msg) => {
        // TODO: BUG! We no longer have this option? & go error not handled?
        if (!soul) {
          return cb.call(this, {
            err: Gun.log(`Only a node can be linked! Not "${msg.put}"!`)
          })
        }
        tmp = {}
        tmp[soul] = { '#': soul }
        go(tmp)
      }, true)
    })
    return item
  }
})()
