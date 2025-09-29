;(() => {
  function Radix() {
    const radix = (key, val, t) => {
      radix.unit = 0
      if (!t && u !== val) {
        radix.last = `${key}` < radix.last ? radix.last : `${key}`
        delete radix.$?.[_]
      }
      if (!t) {
        if (!radix.$) radix.$ = {}
        t = radix.$
      }
      if (!key && Object.keys(t).length) {
        return t
      }
      key = `${key}`
      let i = 0
      const l = key.length - 1
      let k = key[i]
      let at = t[k]
      let tmp
      while (!at && i < l) {
        i++
        k += key[i]
        at = t[k]
      }
      if (!at) {
        if (
          !each(t, (r, s) => {
            let ii = 0
            let kk = ''
            if ((s || '').length) {
              while (s[ii] === key[ii]) {
                kk += s[ii++]
              }
            }
            if (kk) {
              if (u === val) {
                if (ii <= l) {
                  return
                }
                if (!tmp) tmp = {}
                tmp[s.slice(ii)] = r
                return r
              }
              const __ = {}
              __[s.slice(ii)] = r
              const ii_slice = key.slice(ii)
              if ('' === ii_slice) {
                __[''] = val
              } else {
                const sub = {}
                __[ii_slice] = sub
                sub[''] = val
              }
              t[kk] = __
              if (Radix.debug && 'undefined' === `${kk}`) {
                console.log(0, kk)
              }
              delete t[s]
              return true
            }
          })
        ) {
          if (u === val) {
            return
          }
          let node = t[k]
          if (!node) {
            node = {}
            t[k] = node
          }
          node[''] = val
          if (Radix.debug && 'undefined' === `${k}`) {
            console.log(1, k)
          }
        }
        if (u === val) {
          return tmp
        }
      } else if (i === l) {
        if (u === val) {
          const tmp = at['']
          radix.unit = 1
          return u === tmp ? at : tmp
        }
        at[''] = val
      } else {
        if (u !== val) {
          delete at[_]
        }
        if (!at) at = {}
        return radix(key.slice(++i), val, at)
      }
    }
    return radix
  }

  Radix.map = function rap(radix, cb, opt, pre) {
    try {
      pre = pre || [] // TODO: BUG: most out-of-memory crashes come from here.
      const t = 'function' === typeof radix ? radix.$ || {} : radix
      if (!t) {
        return
      }
      if ('string' === typeof t) {
        if (Radix.debug) {
          throw ['BUG:', radix, cb, opt, pre]
        }
        return
      }
      const sort_obj = t[_] || no
      let keys = sort_obj.sort
      if (!keys) {
        const $ = () => {}
        $.sort = Object.keys(t).sort()
        t[_] = $
        keys = $.sort
      }
      opt = true === opt ? { branch: true } : opt || {}
      const rev = opt.reverse
      if (rev) {
        keys = keys.slice(0).reverse()
      }
      const start = opt.start
      const end = opt.end
      const END = '\uffff'
      let i = 0
      const l = keys.length
      for (; i < l; i++) {
        const key = keys[i]
        const tree = t[key]
        let tmp
        let p
        let pt
        if (!tree || '' === key || _ === key || 'undefined' === key) {
          continue
        }
        p = pre.slice(0)
        p.push(key)
        pt = p.join('')
        if (u !== start && pt < (start || '').slice(0, pt.length)) {
          continue
        }
        if (u !== end && (end || END) < pt) {
          continue
        }
        if (rev) {
          // children must be checked first when going in reverse.
          tmp = rap(tree, cb, opt, p)
          if (u !== tmp) {
            return tmp
          }
        }
        tmp = tree['']
        if (u !== tmp) {
          let yes = 1
          if (u !== start && pt < (start || '')) {
            yes = 0
          }
          if (u !== end && pt > (end || END)) {
            yes = 0
          }
          if (yes) {
            const result = cb(tmp, pt, key, pre)
            if (u !== result) {
              return result
            }
          }
        } else if (opt.branch) {
          tmp = cb(u, pt, key, pre)
          if (u !== tmp) {
            return tmp
          }
        }
        pre = p
        if (!rev) {
          tmp = rap(tree, cb, opt, pre)
          if (u !== tmp) {
            return tmp
          }
        }
        pre.pop()
      }
    } catch (e) {
      console.error(e)
    }
  }

  ;((name, exports) => {
    if (typeof window !== 'undefined') {
      window[name] = window[name] || exports
    }
    try {
      module.exports = exports
    } catch (_e) {}
  })('Radix', Radix)
  Radix.object = (o, f) => {
    for (const k in o) {
      if (!Object.hasOwn(o, k)) {
        continue
      }
      const r_val = f(o[k], k)
      if (r_val !== u) {
        return r_val
      }
    }
  }
  const each = Radix.object
  const no = {}
  let u
  const _ = String.fromCharCode(24)
})()
