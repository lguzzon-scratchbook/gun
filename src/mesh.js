;(() => {
  require('./shim')

  const noop = () => {}
  const parse =
    JSON.parseAsync ||
    ((t, cb, r) => {
      const u = undefined
      const d = Date.now()
      try {
        cb(u, JSON.parse(t, r), json.sucks(Date.now() - d))
      } catch (e) {
        cb(e)
      }
    })
  const json =
    JSON.stringifyAsync ||
    ((v, cb, r, s) => {
      const u = undefined
      const d = Date.now()
      try {
        cb(u, JSON.stringify(v, r, s), json.sucks(Date.now() - d))
      } catch (e) {
        cb(e)
      }
    })
  json.sucks = (d) => {
    if (d > 99) {
      console.log(
        'Warning: JSON blocking CPU detected. Add `gun/lib/yson.js` to fix.'
      )
      json.sucks = noop
    }
  }

  /**
   * Creates a mesh network handler for Gun.js peer-to-peer communication.
   * Manages message routing, deduplication, batching, and peer connections.
   * @param {object} root - The root Gun instance containing options and event handlers.
   * @returns {object} Mesh object with hear, say, hi, bye, and other networking methods.
   */
  function Mesh(root) {
    const mesh = () => {}
    const opt = root.opt || {}
    opt.log ||= console.log
    opt.gap ||= opt.wait || 0
    opt.max ||= (opt.memory ? opt.memory * 999 * 999 : 300000000) * 0.3
    opt.pack ||= opt.max * 0.01 * 0.01
    opt.puff ||= 9 // IDEA: do a start/end benchmark, divide ops/result.
    const puff = setTimeout.turn || setTimeout

    const dup = root.dup
    const dup_check = dup.check
    const dup_track = dup.track

    /**
     * Processes incoming messages from peers, handling JSON parsing, deduplication, and message routing.
     * @param {string|object} raw - The raw message data received from the peer.
     * @param {object} peer - The peer object representing the sender.
     */
    const hear = function (raw, peer) {
      if (!raw) {
        return
      }
      if (opt.max <= raw.length) {
        return mesh.say({ dam: '!', err: 'Message too big!' }, peer)
      }
      if (mesh === this) {
        hear.d += raw.length || 0
        ++hear.c
      } // STATS!
      const S = Date.now()
      peer.SH = S
      const tmp = raw[0]
      let msg
      //raw && raw.slice && console.log("hear:", ((peer.wire||'').headers||'').origin, raw.length, raw.slice && raw.slice(0,50)); //tc-iamunique-tc-package-ds1
      if ('[' === tmp) {
        parse(raw, (err, msg) => {
          if (err || !msg) {
            return mesh.say({ dam: '!', err: 'DAM JSON parse error.' }, peer)
          }
          console.STAT?.(Date.now(), msg.length, '# on hear batch')
          const P = opt.puff
          ;(function go() {
            const S = Date.now()
            let i = 0
            let m
            while (i < P) {
              m = msg[i]
              i++
              mesh.hear(m, peer)
            }
            msg = msg.slice(i) // slicing after is faster than shifting during.
            console.STAT?.(S, Date.now() - S, 'hear loop')
            flush(peer) // force send all synchronously batched acks.
            if (!msg.length) {
              return
            }
            puff(go, 0) // Yield to event loop for batch processing to prevent blocking.
          })()
        })
        raw = '' //
        return
      }
      if ('{' === tmp) {
        parse(raw, (err, msg) => {
          if (err || !msg) {
            return mesh.say({ dam: '!', err: 'DAM JSON parse error.' }, peer)
          }
          hear.one(msg, peer, S)
        })
        return
      }
      if (raw['#'] || Object.plain(raw)) {
        msg = raw
        if (msg) {
          return hear.one(msg, peer, S)
        }
        parse(raw, (err, msg) => {
          if (err || !msg) {
            return mesh.say({ dam: '!', err: 'DAM JSON parse error.' }, peer)
          }
          hear.one(msg, peer, S)
        })
        return
      }
    }
    mesh.hear = hear
    hear.one = (msg, peer, S) => {
      // S here is temporary! Undo.
      let id, hash, tmp, ash, DBG
      if (msg.DBG) {
        msg.DBG = DBG = { DBG: msg.DBG }
      }
      if (DBG) {
        DBG.h = S
        DBG.hp = Date.now()
      }
      id = msg['#']
      if (!id) {
        id = String.random(9)
        msg['#'] = id
      }
      tmp = dup_check(id)
      if (tmp) {
        return
      }
      // DAM logic:
      hash = msg['##']
      // disable hashing for now // TODO: impose warning/penalty instead (?)
      tmp = msg['@'] || (msg.get && id)
      ash = tmp + hash
      if (hash && tmp && dup.check(ash)) {
        return
      } // Imagine A <-> B <=> (C & D), C & D reply with same ACK but have different IDs, B can use hash to dedup. Or if a GET has a hash already, we shouldn't ACK if same.
      msg._ = () => {}
      msg._.via = mesh.leap = peer
      tmp = msg['><']
      if (tmp && 'string' === typeof tmp) {
        msg._.yo = {}
        for (const k of tmp.slice(0, 99).split(',')) {
          msg._.yo[k] = 1
        }
      } // Peers already sent to, do not resend.
      // DAM ^
      if (msg.dam && mesh.hear[msg.dam]) {
        mesh.hear[msg.dam](msg, peer, root)
        dup_track(id)
        return
      }
      tmp = msg.ok
      if (tmp) {
        msg._.near = tmp['/']
      }
      const S_inner = Date.now()
      if (DBG) DBG.is = S_inner
      peer.SI = id
      dup_track.ed = (d) => {
        if (id !== d) {
          return
        }
        dup_track.ed = 0
        d = dup.s[id]
        if (!d) {
          return
        }
        d.via = peer
        if (msg.get) {
          d.it = msg
        }
      }
      mesh.last = msg
      root.on('in', msg)
      if (DBG) DBG.hd = Date.now()
      console.STAT?.(
        S_inner,
        Date.now() - S_inner,
        msg.get ? 'msg get' : msg.put ? 'msg put' : 'msg'
      )
      dup_track(id) // in case 'in' does not call track.
      if (ash) {
        dup_track(ash)
      } //dup.track(tmp+hash, true).it = it(msg);
      mesh.leap = mesh.last = null // warning! mesh.leap could be buggy.
    }
    const _tomap = (k, _i, m) => {
      m(k, true)
    }
    hear.c = hear.d = 0

    ;(() => {
      let SMIA = 0
      let loop
      mesh.hash = (msg, peer) => {
        let h
        let s
        let t
        const S = Date.now()
        json(
          msg.put,
          function hash(_err, text) {
            if (!s) {
              s = t = text || ''
            }
            const ss = s.slice(0, 32768) // 1024 * 32
            h = String.hash(ss, h)
            s = s.slice(32768)
            if (s) {
              puff(hash, 0) // Continue hashing in next tick to avoid blocking.
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
        if (!(v instanceof Object)) {
          return v
        }
        const tmp = {}
        for (const k of Object.keys(v).sort()) {
          // Sort keys for consistent hashing.
          tmp[k] = v[k]
        }
        return tmp
      }

      /**
       * Sends a message to a specific peer or broadcasts it, handling serialization, batching, deduplication, and routing.
       * @param {object} msg - The message object to send.
       * @param {object} [peer] - The target peer; if omitted, broadcasts to all known peers.
       * @returns {boolean|undefined} False if sending failed, otherwise undefined.
       */
      mesh.say = function (msg, peer) {
        let tmp
        tmp = this
        if (tmp) {
          tmp = tmp.to
          if (tmp?.next) {
            tmp.next(msg)
          }
        } // compatible with middleware adapters.
        if (!msg) {
          return false
        }
        let id
        let hash
        let raw
        const ack = msg['@']
        let meta = msg._
        if (!meta) {
          meta = () => {}
          msg._ = meta
        }
        const DBG = msg.DBG,
          S = Date.now()
        meta.y ||= S
        if (!peer) {
          if (DBG) DBG.y = S
        }
        id = msg['#']
        if (!id) {
          id = String.random(9)
          msg['#'] = id
        }
        !loop && dup_track(id) //.it = it(msg); // track for 9 seconds, default. Earth<->Mars would need more! // always track, maybe move this to the 'after' logic if we split function.
        hash = msg['##']
        if (!hash && u !== msg.put && !meta.via && ack) {
          mesh.hash(msg, peer)
          return
        } // TODO: Should broadcasts be hashed?
        if (!peer && ack) {
          peer =
            dup.s[ack]?.via ||
            dup.s[ack]?.it?._?.via ||
            (mesh.last && ack === mesh.last['#'] && mesh.leap)
        } // warning! mesh.leap could be buggy! mesh last check reduces this. // TODO: CLEAN UP THIS LINE NOW? `.it` should be reliable.
        if (!peer && ack) {
          // still no peer, then ack daisy chain 'tunnel' got lost.
          if (dup.s[ack]) {
            return
          } // in dups but no peer hints that this was ack to ourself, ignore.
          console.STAT?.(Date.now(), ++SMIA, 'total no peer to ack to') // TODO: Delete this now. Dropping lost ACKs is protocol fine now.
          return false
        } // TODO: Temporary? If ack via trace has been lost, acks will go to all peers, which trashes browser bandwidth. Not relaying the ack will force sender to ask for ack again. Note, this is technically wrong for mesh behavior.
        if (ack && !msg.put && !hash && dup.s[ack]?.it?.['##']) {
          return false
        } // If we're saying 'not found' but a relay had data, do not bother sending our not found. // Is this correct, return false? // NOTE: ADD PANIC TEST FOR THIS!
        if (!peer && mesh.way) {
          return mesh.way(msg)
        }
        if (DBG) DBG.yh = Date.now()
        raw = meta.raw
        if (!raw) {
          mesh.raw(msg, peer)
          return
        }
        if (DBG) DBG.yr = Date.now()
        if (!peer || !peer.id) {
          if (!Object.plain(peer || opt.peers)) {
            return false
          }
          const S = Date.now()
          let _P = opt.puff,
            ps = opt.peers,
            pl = Object.keys(peer || opt.peers || {}) // TODO: .keys( is slow
          console.STAT?.(S, Date.now() - S, 'peer keys')
          ;(function go() {
            const S = Date.now()
            //Type.obj.map(peer || opt.peers, each); // in case peer is a peer list.
            loop = 1
            const wr = meta.raw
            meta.raw = raw // quick perf hack
            let i = 0
            let p
            while (i < 9) {
              p = (pl || '')[i]
              i++
              p = ps[p] || (peer || '')[p]
              if (!p) {
                continue
              }
              mesh.say(msg, p)
            }
            meta.raw = wr
            loop = 0
            pl = pl.slice(i) // slicing after is faster than shifting during.
            console.STAT?.(S, Date.now() - S, 'say loop')
            if (!pl.length) {
              return
            }
            puff(go, 0) // Process next batch of peers asynchronously.
            ack && dup_track(ack) // keep for later
          })()
          return
        }
        // TODO: PERF: consider splitting function here, so say loops do less work.
        if (!peer.wire && mesh.wire) {
          mesh.wire(peer)
        }
        if (id === peer.last) {
          return
        }
        peer.last = id // was it just sent?
        if (peer === meta.via) {
          return false
        } // don't send back to self.
        if (meta.yo?.[peer.url] || meta.yo?.[peer.pid] || meta.yo?.[peer.id]) {
          return false
        }
        console.STAT?.(
          S,
          (() => {
            const yp = Date.now()
            ;(DBG || meta).yp = yp
            return yp
          })() - (meta.y || S),
          'say prep'
        )
        !loop && ack && dup_track(ack) // streaming long responses needs to keep alive the ack.
        if (peer.batch) {
          tmp = peer.tail || 0
          peer.tail = tmp + raw.length
          if (peer.tail <= opt.pack) {
            peer.batch += (tmp ? ',' : '') + raw
            return
          }
          flush(peer)
        }
        peer.batch = '[' // Prevents double JSON!
        const ST = Date.now()
        setTimeout(() => {
          console.STAT?.(ST, Date.now() - ST, '0ms TO')
          flush(peer)
        }, opt.gap) // Batch messages with delay to allow accumulation; may impact latency.
        send(raw, peer)
        console.STAT &&
          ack === peer.SI &&
          console.STAT(S, Date.now() - peer.SH, 'say ack')
      }
      mesh.say.c = mesh.say.d = 0
      // TODO: this caused a out-of-memory crash!
      mesh.raw = (msg, peer) => {
        // TODO: Clean this up / delete it / move logic out!
        if (!msg) {
          return ''
        }
        const meta = msg._ || {}
        let put
        let tmp
        tmp = meta.raw
        if (tmp) {
          return tmp
        }
        if (typeof msg === 'string') {
          return msg
        }
        const hash = msg['##']
        const ack = msg['@']
        if (hash && ack) {
          if (!meta.via && dup_check(ack + hash)) {
            return false
          } // for our own out messages, memory & storage may ack the same thing, so dedup that. Tho if via another peer, we already tracked it upon hearing, so this will always trigger false positives, so don't do that!
          tmp = dup.s[ack]?.it
          if (tmp) {
            if (hash === tmp['##']) {
              return false
            } // if ask has a matching hash, acking is optional.
            if (!tmp['##']) {
              tmp['##'] = hash
            } // if none, add our hash to ask so anyone we relay to can dedup. // NOTE: May only check against 1st ack chunk, 2nd+ won't know and still stream back to relaying peers which may then dedup. Any way to fix this wasted bandwidth? I guess force rate limiting breaking change, that asking peer has to ask for next lexical chunk.
          }
        }
        if (!msg.dam && !msg['@']) {
          const to = []
          for (const [_k, p] of Object.entries(opt.peers)) {
            to.push(p.url || p.pid || p.id)
            if (to.length > 6) {
              break
            }
          }
          if (to.length > 1) {
            msg['><'] = to.join()
          } // TODO: BUG! This gets set regardless of peers sent to! Detect?
        }
        tmp = msg.ok
        if (msg.put && tmp) {
          msg.ok = {
            '@': (tmp['@'] ?? 1) - 1,
            '/': tmp['/'] === msg._.near ? mesh.near : tmp['/']
          }
        }
        put = meta.$put
        if (put) {
          const tmp = { ...msg }
          tmp.put = ':])([:' // Placeholder to avoid double serialization of put data.
          json(tmp, (err, raw) => {
            if (err) {
              return
            } // TODO: Handle!!
            const S = Date.now()
            const tmp = raw.indexOf('"put":":])([:"')
            raw = raw.slice(0, tmp + 6) + put + raw.slice(tmp + 14) // Replace placeholder with actual put data.
            res(u, raw)
            console.STAT?.(S, Date.now() - S, 'say slice')
          })
          return
        }
        json(msg, res)
        function res(err, raw) {
          if (err) {
            return
          } // TODO: Handle!!
          meta.raw = raw
          mesh.say(msg, peer)
        }
      }
    })()

    function flush(peer) {
      let tmp = peer.batch
      const t = typeof tmp === 'string'
      if (t) {
        tmp += ']'
      } // TODO: Prevent double JSON!
      peer.batch = peer.tail = null
      if (!tmp) {
        return
      }
      if (t ? 3 > tmp.length : !tmp.length) {
        return
      } // TODO: ^
      if (!t) {
        try {
          tmp = 1 === tmp.length ? tmp[0] : JSON.stringify(tmp)
        } catch (e) {
          return opt.log('DAM JSON stringify error', e)
        }
      }
      if (!tmp) {
        return
      }
      send(tmp, peer)
    }
    // for now - find better place later.
    function send(raw, peer) {
      try {
        const wire = peer.wire
        if (peer.say) {
          peer.say(raw)
        } else if (wire.send) {
          wire.send(raw)
        }
        mesh.say.d += raw.length || 0
        ++mesh.say.c // STATS!
      } catch (_e) {
        peer.queue = peer.queue || [] // Queue message for retry if send fails.
        peer.queue.push(raw)
      }
    }

    mesh.near = 0
    /**
     * Initializes a new peer connection, sets up peer state, and processes any queued messages.
     * @param {object} peer - The peer object to connect and initialize.
     */
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
        mesh.say({ dam: '?', pid: root.opt.pid }, peer)
        delete dup.s[peer.last] // IMPORTANT: see https://gun.eco/docs/DAM#self
      }
      if (!peer.met) {
        mesh.near++
        peer.met = Date.now()
        root.on('hi', peer)
      }
      // @rogowski I need this here by default for now to fix go1dfish's bug
      tmp = peer.queue
      peer.queue = []
      setTimeout.each(
        // Send queued messages in batches to avoid overwhelming the peer.
        tmp || [],
        (msg) => {
          send(msg, peer)
        },
        0,
        9
      )
    }
    /**
     * Handles disconnection of a peer, cleans up state, and updates connection metrics.
     * @param {object} peer - The peer object to disconnect.
     */
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
        if (!peer.pid) {
          peer.pid = msg.pid
        }
        if (msg['@']) {
          return
        }
      }
      mesh.say({ '@': msg['#'], dam: '?', pid: opt.pid }, peer)
      delete dup.s[peer.last] // IMPORTANT: see https://gun.eco/docs/DAM#self
    }
    mesh.hear.mob = (msg, peer) => {
      // NOTE: AXE will overload this with better logic.
      if (!msg.peers) {
        return
      }
      const peers = Object.keys(msg.peers),
        one = peers[Math.floor(Math.random() * peers.length)]
      if (!one) {
        return
      }
      mesh.bye(peer)
      mesh.hi(one)
    }

    root.on('create', function (root) {
      root.opt.pid ||= String.random(9)
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
        tmp?.close?.()
      }
      delete opt.peers[peer.id]
      peer.wire = null
    })

    const gets = {}
    root.on('bye', function (peer, tmp) {
      this.to.next(peer)
      tmp = console.STAT
      if (tmp) {
        tmp.peers = mesh.near
      }
      tmp = peer.url
      if (!tmp) {
        return
      }
      gets[tmp] = true
      setTimeout(() => {
        delete gets[tmp]
      }, opt.lack || 9000)
    })
    root.on('hi', function (peer, tmp) {
      this.to.next(peer)
      tmp = console.STAT
      if (tmp) {
        tmp.peers = mesh.near
      }
      if (opt.super) {
        return
      } // temporary (?) until we have better fix/solution?
      const souls = Object.keys(root.next || '') // TODO: .keys( is slow
      if (souls.length > 9999 && !console.SUBS) {
        console.SUBS =
          'Warning: You have more than 10K live GETs, which might use more bandwidth than your screen can show - consider `.off()`.'
        console.log(console.SUBS)
      }
      setTimeout.each(souls, (soul) => {
        const node = root.next[soul]
        if (opt.super || (node.ask || '')['']) {
          mesh.say({ get: { '#': soul } }, peer)
          return
        }
        setTimeout.each(Object.keys(node.ask || ''), (key) => {
          if (!key) {
            return
          }
          // is the lack of ## a !onion hint?
          mesh.say(
            {
              '##': String.hash((root.graph[soul] || '')[key]),
              get: { '.': key, '#': soul }
            },
            peer
          )
          // TODO: Switch this so Book could route?
        })
      })
    })

    return mesh
  }
  const _empty = {}
  const _ok = true
  let u

  try {
    module.exports = Mesh
  } catch (_e) {}
})()
