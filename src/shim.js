;(() => {
  // Shim for generic javascript utilities.
  String.random = (l, c) => {
    var s = ''
    l = l || 24 // you are not going to make a 0 length random number, so no need to check type
    c = c || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz'
    while (l > 0) {
      s += c.charAt(Math.floor(Math.random() * c.length))
      l--
    }
    return s
  }
  String.match = (t, o) => {
    var tmp, u
    if ('string' !== typeof t) {
      return false
    }
    if ('string' === typeof o) {
      o = { '=': o }
    }
    o = o || {}
    tmp = o['='] || o['*'] || o['>'] || o['<']
    if (t === tmp) {
      return true
    }
    if (u !== o['=']) {
      return false
    }
    tmp = o['*'] || o['>']
    if (t.slice(0, (tmp || '').length) === tmp) {
      return true
    }
    if (u !== o['*']) {
      return false
    }
    if (u !== o['>'] && u !== o['<']) {
      return !!(t >= o['>'] && t <= o['<'])
    }
    if (u !== o['>'] && t >= o['>']) {
      return true
    }
    if (u !== o['<'] && t <= o['<']) {
      return true
    }
    return false
  }
  String.hash = (s, c) => {
    // via SO
    if (typeof s !== 'string') {
      return
    }
    c = c || 0 // CPU schedule hashing by
    if (!s.length) {
      return c
    }
    for (let i = 0, l = s.length, n; i < l; ++i) {
      n = s.charCodeAt(i)
      c = (c << 5) - c + n
      c |= 0
    }
    return c
  }
  var has = Object.prototype.hasOwnProperty
  Object.plain = (o) =>
    o
      ? (o instanceof Object && o.constructor === Object) ||
        Object.prototype.toString.call(o).match(/^\[object (\w+)\]$/)[1] ===
          'Object'
      : false
  Object.empty = (o, n) => {
    for (var k in o) {
      if (has.call(o, k) && (!n || -1 === n.indexOf(k))) {
        return false
      }
    }
    return true
  }
  Object.keys =
    Object.keys ||
    ((o) => {
      var l = []
      for (var k in o) {
        if (has.call(o, k)) {
          l.push(k)
        }
      }
      return l
    })
  ;(() => {
    var sT = setTimeout,
      l = 0,
      c = 0,
      sI =
        (typeof setImmediate !== 'undefined' && setImmediate) ||
        ((c, f) => {
          if (typeof MessageChannel === `undefined`) {
            return sT
          }
          c = new MessageChannel()
          c.port1.onmessage = (e) => {
            '' === e.data && f()
          }
          return (q) => {
            f = q
            c.port2.postMessage('')
          }
        })(),
      check
    if (!sT.check) {
      sT.check = (typeof performance !== 'undefined' && performance) || {
        now: () => Date.now()
      }
    }
    check = sT.check
    sT.hold = sT.hold || 9 // half a frame benchmarks faster than < 1ms?
    sT.poll =
      sT.poll ||
      ((f) => {
        if (sT.hold >= check.now() - l && c < 3333) {
          c++
          f()
          return
        }
        c = 0
        sI(() => {
          l = check.now()
          f()
        }, c)
      })
  })()
  ;(() => {
    // Too many polls block, this "threads" them in turns over a single thread in time.
    var sT = setTimeout,
      t,
      s
    if (!sT.turn) {
      sT.turn = (f) => {
        1 === s.push(f) && p(T)
      }
    }
    t = sT.turn
    if (!t.s) t.s = []
    s = t.s
    p = sT.poll
    i = 0
    let f
    T = () => {
      f = s[i]
      i++
      if (f) {
        f()
      }
      if (i === s.length || 99 === i) {
        s = s.slice(i)
        t.s = s
        i = 0
      }
      if (s.length) {
        p(T)
      }
    }
  })()
  ;(() => {
    var u,
      sT = setTimeout,
      T = sT.turn
    if (!sT.each) {
      sT.each = (l, f, e, S) => {
        if (!S) S = 9
        ;(function t(s, L, r) {
          s = (l || []).splice(0, S)
          L = s.length
          if (L) {
            for (let i = 0; i < L; i++) {
              r = f(s[i])
              if (u !== r) {
                break
              }
            }
            if (u === r) {
              T(t)
              return
            }
          }
          // biome-ignore lint/complexity/useOptionalChain: TODO: Investigate better... odd cases
          e && e(r)
        })()
      }
    }
    sT.each()
  })()
})()
