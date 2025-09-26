;(() => {
  require('./shim')

  /**
   * No-op function.
   */
  const noop = () => {}

  /**
   * Retry helper for async operations.
   * @param {function} fn - Function to retry.
   * @param {number} maxRetries - Maximum retries.
   * @returns {function} Retried function.
   */
  const retry =
    (fn, maxRetries = 3) =>
    (...args) => {
      const cb = args[args.length - 2] // assuming cb is second last
      let attempts = 0
      const attempt = () => {
        fn(...args.slice(0, -1), (err, ...rest) => {
          if (err && attempts < maxRetries) {
            attempts++
            setTimeout(attempt, 10)
            return
          }
          cb(err, ...rest)
        })
      }
      attempt()
    }

  /**
   * Asynchronous JSON parse with retries and validation.
   * @param {string} t - JSON string to parse.
   * @param {function} cb - Callback (err, result, time).
   * @param {function} r - Reviver function.
   */
  const parse =
    JSON.parseAsync ||
    retry((t, cb, r) => {
      if (typeof t !== 'string')
        return cb(new Error('Invalid input: not a string'))
      t = t.trim()
      const d = Date.now()
      try {
        cb(null, JSON.parse(t, r), json.sucks(Date.now() - d))
      } catch (e) {
        cb(e)
      }
    })

  /**
   * Asynchronous JSON stringify with retries.
   * @param {*} v - Value to stringify.
   * @param {function} cb - Callback (err, result, time).
   * @param {function} r - Replacer function.
   * @param {number|string} s - Space.
   */
  const json =
    JSON.stringifyAsync ||
    retry((v, cb, r, s) => {
      const d = Date.now()
      try {
        cb(null, JSON.stringify(v, r, s), json.sucks(Date.now() - d))
      } catch (e) {
        cb(e)
      }
    })

  /**
   * Warns if JSON operation takes too long.
   * @param {number} d - Duration in ms.
   */
  json.sucks = (d) => {
    if (d > 99) {
      console.log(
        'Warning: JSON blocking CPU detected. Add `gun/lib/yson.js` to fix.'
      )
      json.sucks = noop
    }
  }

  /**
   * Creates a mesh instance for peer communication and message handling.
   * @param {object} root - The Gun root instance.
   * @returns {object} The mesh instance with hear, say, hi, bye methods.
   */
  function Mesh(root) {
    const mesh = () => {}
    const opt = root.opt || {}
    opt.log = opt.log || console.log
    opt.gap = opt.gap || opt.wait || 0
    opt.max = opt.max || (opt.memory ? opt.memory * 999 * 999 : 300000000) * 0.3
    opt.pack = opt.pack || opt.max * 0.01 * 0.01
    opt.puff = opt.puff || 9

    const puff = setTimeout.turn || setTimeout

    const dup = root.dup
    const dup_check = dup.check
    const dup_track = dup.track

    mesh.hear = function (raw, peer) {
      if (!raw) return
      if (opt.max <= raw.length) {
        return mesh.say({ dam: '!', err: 'Message too big!' }, peer)
      }
      if (mesh === this) {
        hear.d += raw.length || 0
        ++hear.c
      }
      peer.SH = Date.now()
      const S = peer.SH
      const tmp = raw[0]
      let msg

      if ('[' === tmp) {
        parse(raw, (err, msg) => {
          if (err || !msg)
            return mesh.say({ dam: '!', err: 'DAM JSON parse error.' }, peer)
          console.STAT?.(Date.now(), msg.length, '# on hear batch')
          const P = opt.puff
          ;(function go() {
            const S = Date.now()
            msg.splice(0, P).forEach((m) => {
              if (m) mesh.hear(m, peer)
            })
            console.STAT?.(S, Date.now() - S, 'hear loop')
            flush(peer)
            if (!msg.length) return
            puff(go, 0)
          })()
        })
        raw = ''
        return
      }

      if ('{' === tmp) {
        parse(raw, (err, msg) => {
          if (err || !msg)
            return mesh.say({ dam: '!', err: 'DAM JSON parse error.' }, peer)
          hear.one(msg, peer, S)
        })
        return
      }

      if (raw['#'] || Object.plain(raw)) {
        msg = raw
        return hear.one(msg, peer, S)
      }
    }

    const hear = mesh.hear

    hear.one = (msg, peer, S) => {
      let id, hash, tmp, ash, DBG
      if (msg.DBG) msg.DBG = DBG = { DBG: msg.DBG }
      if (DBG) {
        DBG.h = S
        DBG.hp = Date.now()
      }
      id = msg['#']
      if (!id) id = msg['#'] = String.random(9)
      tmp = dup_check(id)
      if (tmp) return
      if (hash) {
        tmp = msg['@'] || (msg.get && id)
        ash = tmp + hash
        if (dup.check(ash)) {
          return
        }
      }
      msg._ = () => {}
      msg._.via = mesh.leap = peer
      tmp = msg['><']
      if (tmp && typeof tmp === 'string') {
        msg._.yo = {}
        for (const k of Iterator.from(tmp.slice(0, 99).split(',')).take(99)) {
          msg._.yo[k] = 1
        }
      }
      tmp = msg.dam
      if (tmp) {
        ;(dup_track(id) || {}).via = peer
        tmp = mesh.hear[tmp]
        if (tmp) tmp(msg, peer, root)
        return
      }
      tmp = msg.ok
      if (tmp) msg._.near = tmp['/']
      const SS = Date.now()
      if (DBG) DBG.is = SS
      peer.SI = id
      dup_track.ed = (d) => {
        if (id !== d) return
        dup_track.ed = 0
        d = dup.s[id]
        if (!d) return
        d.via = peer
        if (msg.get) d.it = msg
      }
      mesh.last = msg
      root.on('in', mesh.last)
      if (DBG) DBG.hd = Date.now()
      console.STAT?.(
        SS,
        Date.now() - SS,
        msg.get ? 'msg get' : msg.put ? 'msg put' : 'msg'
      )
      dup_track(id)
      if (ash) dup_track(ash)
      mesh.leap = mesh.last = null
    }

    hear.c = hear.d = 0

    ;(() => {
      let noPeerAckCount = 0
      let loop

      /**
       * Hashes the message put data and sends the message.
       * @param {object} msg - The message to hash.
       * @param {object} peer - The target peer.
       */
      mesh.hash = (msg, peer) => {
        let h, s, t
        const S = Date.now()
        json(
          msg.put,
          function hash(_err, text) {
            if (!s) {
              t = text || ''
              s = t
            }
            const ss = s.slice(0, 32768)
            h = String.hash(ss, h)
            s = s.slice(32768)
            if (s) {
              puff(hash, 0)
              return
            }
            console.STAT?.(S, Date.now() - S, 'say json+hash')
            msg._.$put = t
            msg['##'] = h
            mesh.say(msg, peer)
            delete msg._.$put
          },
          sort
        )
      }

      function sort(_k, v) {
        if (!(v instanceof Object)) return v
        const sorted = {}
        Object.keys(v).sort().forEach(sorta, { on: v, to: sorted })
        return sorted
      }
      function sorta(k) {
        this.to[k] = this.on[k]
      }

      mesh.say = function (msg, peer) {
        let tmp
        tmp = this
        const to = tmp ? tmp.to : null
        if (tmp && to && to.next) to.next(msg)
        if (!msg) return false
        let id,
          hash,
          raw,
          ack = msg['@']
        let meta = msg._
        if (!meta) meta = msg._ = () => {}
        const DBG = msg.DBG
        const S = Date.now()
        meta.y = meta.y || S
        if (!peer) {
          if (DBG) DBG.y = S
        }
        id = msg['#']
        if (!id) id = msg['#'] = String.random(9)
        !loop && dup_track(id)
        hash = msg['##']
        if (!hash && undefined !== msg.put && !meta.via && ack) {
          mesh.hash(msg, peer)
          return
        }
        if (!peer && ack) {
          const leftTmp = dup.s[ack]
          const left = leftTmp && (leftTmp.via || leftTmp.it?._?.via)
          const rightTmp = mesh.last
          const right = rightTmp && ack === rightTmp['#'] && mesh.leap
          peer = left || right
        }
        if (!peer && ack) {
          if (dup.s[ack]) return
          console.STAT?.(
            Date.now(),
            ++noPeerAckCount,
            'total no peer to ack to'
          )
          return false
        }
        if (ack && !msg.put && !hash && ((dup.s[ack] || '').it || '')['##'])
          return false
        if (!peer && mesh.way) return mesh.way(msg)
        if (DBG) DBG.yh = Date.now()
        raw = meta.raw
        if (!raw) {
          mesh.raw(msg, peer)
          return
        }
        if (DBG) DBG.yr = Date.now()

        if (!peer || !peer.id) {
          if (!Object.plain(peer || opt.peers)) return false
          const SS = Date.now()
          ps = opt.peers
          pl = Object.keys(peer || opt.peers || {})
          console.STAT?.(SS, Date.now() - SS, 'peer keys')
          ;(function go() {
            const SS = Date.now()
            loop = 1
            const wr = meta.raw
            meta.raw = raw
            let i = 0,
              p
            p = (pl || '')[i++]
            while (i < 9 && p) {
              p = ps[p] || (peer || '')[p]
              if (!p) {
                p = (pl || '')[i++]
                continue
              }
              mesh.say(msg, p)
              p = (pl || '')[i++]
            }
            meta.raw = wr
            loop = 0
            pl = pl.slice(i)
            console.STAT?.(SS, Date.now() - SS, 'say loop')
            if (!pl.length) return
            puff(go, 0)
            ack && dup_track(ack)
          })()
          return
        }

        if (!peer.wire && mesh.wire) mesh.wire(peer)
        if (id === peer.last) return
        peer.last = id
        if (peer === meta.via) return false
        tmp = meta.yo
        if (tmp && (tmp[peer.url] || tmp[peer.pid] || tmp[peer.id]))
          return false
        ;(DBG || meta).yp = Date.now()
        console.STAT?.(S, (DBG || meta).yp - (meta.y || S), 'say prep')
        !loop && ack && dup_track(ack)

        if (peer.batch) {
          tmp = peer.tail || 0
          peer.tail = tmp + raw.length
          if (peer.tail <= opt.pack) {
            peer.batch += (tmp ? ',' : '') + raw
            return
          }
          flush(peer)
        }

        peer.batch = '['
        const ST = Date.now()
        setTimeout(() => {
          console.STAT?.(ST, Date.now() - ST, '0ms TO')
          flush(peer)
        }, opt.gap)
        send(raw, peer)
        console.STAT &&
          ack === peer.SI &&
          console.STAT(S, Date.now() - peer.SH, 'say ack')
      }

      mesh.say.c = mesh.say.d = 0

      mesh.raw = (msg, peer) => {
        if (!msg) return ''
        const meta = msg._ || {}
        let put, tmp
        tmp = meta.raw
        if (tmp) return tmp
        if (typeof msg === 'string') return msg
        const hash = msg['##'],
          ack = msg['@']

        if (hash && ack) {
          if (!meta.via && dup_check(ack + hash)) return false
          tmp = (dup.s[ack] || '').it
          if (tmp) {
            if (hash === tmp['##']) return false
            if (!tmp['##']) tmp['##'] = hash
          }
        }

        if (!msg.dam && !msg['@']) {
          tmp = opt.peers
          const to = Object.keys(tmp)
            .slice(0, 7)
            .map((k) => tmp[k].url || tmp[k].pid || tmp[k].id)
          if (to.length > 1) msg['><'] = to.join()
        }

        if (msg.put) {
          tmp = msg.ok
          if (tmp) {
            msg.ok = {
              '@': (tmp['@'] || 1) - 1,
              '/': tmp['/'] === msg._.near ? mesh.near : tmp['/']
            }
          }
        }

        put = meta.$put
        if (put) {
          tmp = {}
          Object.keys(msg).forEach((k) => {
            tmp[k] = msg[k]
          })
          tmp.put = ':])([:'
          json(tmp, (err, raw) => {
            if (err) return
            const S = Date.now()
            tmp = raw.indexOf('"put":":])([:"')
            const newRaw = raw.slice(0, tmp + 6) + put + raw.slice(tmp + 14)
            res(undefined, newRaw)
            console.STAT?.(S, Date.now() - S, 'say slice')
          })
          return
        }

        json(msg, res)
        function res(err, raw) {
          if (err) return
          meta.raw = raw
          mesh.say(msg, peer)
        }
      }
    })()

    function flush(peer) {
      let tmp = peer.batch
      const t = typeof tmp === 'string'
      if (t) tmp += ']'
      peer.batch = peer.tail = null
      if (!tmp) return
      if (t ? 3 > tmp.length : !tmp.length) return
      if (!t) {
        try {
          tmp = tmp.length === 1 ? tmp[0] : JSON.stringify(tmp)
        } catch (e) {
          return opt.log('DAM JSON stringify error', e)
        }
      }
      if (!tmp) return
      send(tmp, peer)
    }

    function send(raw, peer) {
      try {
        const wire = peer.wire
        if (peer.say) {
          peer.say(raw)
        } else if (wire.send) {
          wire.send(raw)
        }
        mesh.say.d += raw.length || 0
        ++mesh.say.c
      } catch (_e) {
        peer.queue = peer.queue || []
        peer.queue.push(raw)
      }
    }

    mesh.near = 0
    mesh.hi = (peer) => {
      const wire = peer.wire
      let tmp
      if (!wire) {
        mesh.wire((peer.length && { id: peer, url: peer }) || peer)
        return
      }
      if (peer.id) {
        opt.peers[peer.url || peer.id] = peer
      } else {
        tmp = peer.id = peer.id || peer.url || String.random(9)
        opt.peers[tmp] = peer
        mesh.say({ dam: '?', pid: root.opt.pid }, opt.peers[tmp])
        delete dup.s[peer.last]
      }
      if (!peer.met) {
        mesh.near++
        peer.met = Date.now()
        root.on('hi', peer)
      }
      tmp = peer.queue
      peer.queue = []
      setTimeout.each(
        tmp || [],
        (msg) => {
          send(msg, peer)
        },
        0,
        9
      )
    }

    mesh.bye = (peer) => {
      peer.met && --mesh.near
      delete peer.met
      root.on('bye', peer)
      let tmp = Date.now()
      tmp = tmp - (peer.met || tmp)
      mesh.bye.time = ((mesh.bye.time || tmp) + tmp) / 2
    }

    mesh.hear['!'] = (msg, _peer) => {
      opt.log('Error:', msg.err)
    }
    mesh.hear['?'] = (msg, peer) => {
      if (msg.pid) {
        if (!peer.pid) peer.pid = msg.pid
        if (msg['@']) return
      }
      mesh.say({ '@': msg['#'], dam: '?', pid: opt.pid }, peer)
      delete dup.s[peer.last]
    }

    mesh.hear.mob = (msg, peer) => {
      if (!msg.peers) return
      const peers = Object.keys(msg.peers)
      const one = peers[(Math.random() * peers.length) >> 0]
      if (!one) return
      mesh.bye(peer)
      mesh.hi(one)
    }

    root.on('create', function (root) {
      root.opt.pid = root.opt.pid || String.random(9)
      this.to.next(root)
      root.on('out', mesh.say)
    })

    root.on('bye', function (peer, tmp) {
      peer = opt.peers[peer.id || peer] || peer
      this.to.next(peer)
      if (peer.bye) {
        peer.bye()
      } else {
        tmp = peer.wire
        if (tmp?.close) tmp.close()
      }
      delete opt.peers[peer.id]
      peer.wire = null
    })

    const gets = new Set()
    root.on('bye', function (peer, tmp) {
      this.to.next(peer)
      tmp = console.STAT
      if (tmp) tmp.peers = mesh.near
      tmp = peer.url
      if (!tmp) return
      gets.add(tmp)
      setTimeout(() => {
        gets.delete(tmp)
      }, opt.lack || 9000)
    })

    root.on('hi', function (peer, tmp) {
      this.to.next(peer)
      tmp = console.STAT
      if (tmp) tmp.peers = mesh.near
      if (opt.super) return
      const souls = Object.keys(root.next || '')
      if (souls.length > 9999 && !console.SUBS) {
        console.SUBS = 'Warning: You have more than 10K live GETs...'
        console.log(console.SUBS)
      }
      setTimeout.each(souls, (soul) => {
        const node = root.next[soul]
        if (opt.super || (node.ask || '')['']) {
          mesh.say({ get: { '#': soul } }, peer)
          return
        }
        setTimeout.each(Object.keys(node.ask || ''), (key) => {
          if (!key) return
          mesh.say(
            {
              '##': String.hash((root.graph[soul] || '')[key]),
              get: { '.': key, '#': soul }
            },
            peer
          )
        })
      })
    })

    return mesh
  }

  try {
    module.exports = Mesh
  } catch (_e) {}
})()
