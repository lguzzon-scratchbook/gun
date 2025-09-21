;(() => {
  require('./shim')
  function Dup(opt) {
    const dup = { s: {} }
    const s = dup.s
    opt = opt || { age: 1000 * 9, max: 999 } //*/ 1000 * 9 * 3};
    dup.check = (id) => {
      if (!s[id]) {
        return false
      }
      return dt(id)
    }
    const dt = (dup.track = (id) => {
      const it = s[id] || (s[id] = {})
      it.was = dup.now = Date.now()
      if (!dup.to) {
        dup.to = setTimeout(dup.drop, opt.age + 9)
      }
      if (dt.ed) {
        dt.ed(id)
      }
      return it
    })
    dup.drop = (age) => {
      let it
      dup.to = null
      dup.now = Date.now()
      const l = Object.keys(s)
      console.STAT &&
        console.STAT(dup.now, Date.now() - dup.now, 'dup drop keys') // prev ~20% CPU 7% RAM 300MB // now ~25% CPU 7% RAM 500MB
      setTimeout.each(
        l,
        (id) => {
          it = s[id] // TODO: .keys( is slow?
          if (it && (age || opt.age) > dup.now - it.was) {
            return
          }
          delete s[id]
        },
        0,
        99
      )
    }
    return dup
  }
  module.exports = Dup
})()
