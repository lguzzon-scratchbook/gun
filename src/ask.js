;(() => {
  // request / response module, for asking and acking messages.
  require('./onto') // depends upon onto!
  module.exports = function ask(cb, as) {
    const random = String.random || (() => Math.random().toString(36).slice(2))
    if (!this.on) {
      return
    }
    const lack = (this.opt || {}).lack || 9000
    if (!('function' == typeof cb)) {
      if (!cb) {
        return
      }
      let id = cb['#'] || cb
      let tmp = (this.tag || '')[id]
      if (!tmp) {
        return
      }
      if (as) {
        tmp = this.on(id, as)
        clearTimeout(tmp.err)
        tmp.err = setTimeout(() => {
          tmp.off()
        }, lack)
      }
      return true
    }
    let id = (as && as['#']) || random(9)
    if (!cb) {
      return id
    }
    const to = this.on(id, cb, as)
    to.err =
      to.err ||
      setTimeout(() => {
        to.off()
        to.next({ err: 'Error: No ACK yet.', lack: true })
      }, lack)
    return id
  }
})()
