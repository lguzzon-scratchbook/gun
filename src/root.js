;(() => {
  function Gun(o) {
    if (o instanceof Gun) {
      this._ = { $: this }
      return this._.$
    }
    if (!(this instanceof Gun)) {
      return new Gun(o)
    }
    this._ = { $: this, opt: o }
    return Gun.create(this._)
  }

  Gun.is = ($) => $ instanceof Gun || ($?._ && $ === $._.$) || false

  Gun.version = 0.202

  Gun.chain = Gun.prototype
  Gun.chain.toJSON = () => {}

  require('./shim')
  Gun.valid = require('./valid')
  Gun.state = require('./state')
  Gun.on = require('./onto')
  Gun.dup = require('./dup')
  Gun.ask = require('./ask')

  ;(() => {
    Gun.create = (at) => {
      at.root = at.root || at
      at.graph = at.graph || {}
      at.on = at.on || Gun.on
      at.ask = at.ask || Gun.ask
      at.dup = at.dup || Gun.dup()
      const gun = at.$.opt(at.opt)
      if (!at.once) {
        at.on('in', universe, at)
        at.on('out', universe, at)
        at.on('put', map, at)
        Gun.on('create', at)
        at.on('create', at)
      }
      at.once = 1
      return gun
    }
    function universe(msg) {
      //if(!F){ var eve = this; setTimeout(function(){ universe.call(eve, msg,1) },Math.random() * 100);return; } // ADD F TO PARAMS!
      if (!msg) {
        return
      }
      if (msg.out === universe) {
        this.to.next(msg)
        return
      }
      const as = this.as,
        at = as.at || as,
        gun = at.$,
        dup = at.dup,
        DBG = msg.DBG
      let tmp
      tmp = msg['#']
      if (!tmp) {
        tmp = msg['#'] = text_rand(9)
      }
      if (dup.check(tmp)) {
        return
      }
      dup.track(tmp)
      tmp = msg._
      msg._ = 'function' === typeof tmp ? tmp : () => {}
      const tmp$ = msg.$ && msg.$ === (msg.$._ || '').$
      if (!tmp$) {
        msg.$ = gun
      }
      if (msg['@'] && !msg.put) {
        ack(msg)
      }
      if (!at.ask(msg['@'], msg)) {
        // is this machine listening for an ack?
        if (DBG) {
          DBG.u = Date.now()
        }
        if (msg.put) {
          put(msg)
          return
        } else if (msg.get) {
          Gun.on.get(msg, gun)
        }
      }
      if (DBG) {
        DBG.uc = Date.now()
      }
      this.to.next(msg)
      if (DBG) {
        DBG.ua = Date.now()
      }
      if (msg.nts || msg.NTS) {
        return
      } // TODO: This shouldn't be in core, but fast way to prevent NTS spread. Delete this line after all peers have upgraded to newer versions.
      msg.out = universe
      at.on('out', msg)
      if (DBG) {
        DBG.ue = Date.now()
      }
    }
    function put(msg) {
      if (!msg) {
        return
      }
      const ctx = msg._ || ''
      ctx.$ = msg.$ || ''
      ctx.root = (ctx.$._ || '').root
      const root = ctx.root
      if (msg['@'] && ctx.faith && !ctx.miss) {
        // TODO: AXE may split/route based on 'put' what should we do here? Detect @ in AXE? I think we don't have to worry, as DAM will route it on @.
        msg.out = universe
        root.on('out', msg)
        return
      }
      ctx.latch = root.hatch
      ctx.match = root.hatch = []
      const put = msg.put
      ctx.DBG = msg.DBG
      const DBG = ctx.DBG
      const S = Date.now()
      CT = CT || S
      if (put['#'] && put['.']) {
        /*root && root.on('put', msg);*/ return
      } // TODO: BUG! This needs to call HAM instead.
      if (DBG) {
        DBG.p = S
      }
      ctx['#'] = msg['#']
      ctx.msg = msg
      ctx.all = 0
      ctx.stun = 1
      const nl = Object.keys(put) //.sort(); // TODO: This is unbounded operation, large graphs will be slower. Write our own CPU scheduled sort? Or somehow do it in below? Keys itself is not O(1) either, create ES5 shim over ?weak map? or custom which is constant.
      if (console.STAT) {
        ;(DBG || ctx).pk = Date.now()
        console.STAT(S, (DBG || ctx).pk - S, 'put sort')
      }
      let ni = 0
      let nj
      let kl
      let soul
      let node
      let states
      let err
      let tmp
      const pop = (o) => {
        if (nj !== ni) {
          nj = ni
          soul = nl[ni]
          if (!soul) {
            if (console.STAT) {
              ;(DBG || ctx).pd = Date.now()
              console.STAT(S, (DBG || ctx).pd - S, 'put')
            }
            fire(ctx)
            return
          }
          node = put[soul]
          if (!node) {
            err = `${ERR + cut(soul)}no node.`
          } else tmp = node._
          if (!tmp) {
            err = `${ERR + cut(soul)}no meta.`
          } else if (soul !== tmp['#']) {
            err = `${ERR + cut(soul)}soul not same.`
          } else states = tmp['>']
          if (!states) {
            err = `${ERR + cut(soul)}no state.`
          }
          kl = Object.keys(node || {}) // TODO: .keys( is slow
        }
        if (err) {
          msg.err = ctx.err = err // invalid data should error and stun the message.
          fire(ctx)
          //console.log("handle error!", err) // handle!
          return
        }
        let i = 0
        let key
        o = o || 0
        while (o++ < 9) {
          key = kl[i++]
          if (!key) {
            break
          }
          if ('_' === key) {
            continue
          }
          const val = node[key],
            state = states[key]
          if (u === state) {
            err = `${ERR + cut(key)}on${cut(soul)}no state.`
            break
          }
          if (!valid(val)) {
            err = `${ERR + cut(key)}on${cut(soul)}bad ${typeof val}${cut(val)}`
            break
          }
          //ctx.all++; //ctx.ack[soul+key] = '';
          ham(val, key, soul, state, msg)
          ++C // courtesy count;
        }
        kl = kl.slice(i)
        if (kl.length) {
          turn(pop)
          return
        }
        ++ni
        kl = null
        pop(o)
      }
      pop()
    }
    Gun.on.put = put
    // TODO: MARK!!! clock below, reconnect sync, SEA certify wire merge, User.auth taking multiple times, // msg put, put, say ack, hear loop...
    // WASIS BUG! local peer not ack. .off other people: .open
    const ham = (val, key, soul, state, msg) => {
      const ctx = msg._ || {}
      const root = ctx.root
      const graph = root?.graph
      const vertex = graph?.[soul] || empty
      const was = state_is(vertex, key, 1)
      const known = vertex[key]

      const DBG = ctx.DBG
      if (console.STAT) {
        if (!graph?.[soul] || !known) {
          console.STAT.has = (console.STAT.has || 0) + 1
        }
      }

      const now = State()
      if (state > now) {
        const tmp = state - now
        const delay = tmp > MD ? MD : tmp
        setTimeout(() => ham(val, key, soul, state, msg), delay)
        if (console.STAT) {
          const hf = Date.now()
          if (DBG) DBG.Hf = hf
          console.STAT(hf, delay, 'future')
        }
        return
      }
      if (state < was) {
        return
      }
      if (!ctx.faith) {
        if (state === was && (val === known || L(val) <= L(known))) {
          if (!ctx.miss) {
            return
          }
        }
      }
      ctx.stun++
      const aid = msg['#'] + ctx.all++
      const id = { _: ctx, toString: () => aid }
      id.toJSON = id.toString
      root.dup.track(id)['#'] = msg['#']
      if (DBG) {
        DBG.ph = DBG.ph || Date.now()
      }
      root.on('put', {
        _: ctx,
        '@': msg['@'],
        '#': id,
        ok: msg.ok,
        put: { ':': val, '.': key, '#': soul, '>': state }
      })
    }
    function map(msg) {
      const DBG = (msg._ || '').DBG
      if (DBG) {
        DBG.pa = Date.now()
        DBG.pm = DBG.pm || Date.now()
      }
      const root = this.as,
        graph = root.graph,
        ctx = msg._,
        put = msg.put,
        soul = put['#'],
        key = put['.'],
        val = put[':'],
        state = put['>']
      let tmp = ctx.msg
      if (tmp) {
        tmp = tmp.put
        if (tmp) {
          tmp = tmp[soul]
          if (tmp) {
            state_ify(tmp, key, state, val, soul)
          }
        }
      } // necessary! or else out messages do not get SEA transforms.
      //var bytes = ((graph[soul]||'')[key]||'').length||1;
      graph[soul] = state_ify(graph[soul], key, state, val, soul)
      const tmp_next = (root.next || '')[soul]
      if (tmp_next) {
        //tmp.bytes = (tmp.bytes||0) + ((val||'').length||1) - bytes;
        //if(tmp.bytes > 2**13){ Gun.log.once('byte-limit', "Note: In the future, GUN peers will enforce a ~4KB query limit. Please see https://gun.eco/docs/Page") }
        tmp_next.on('in', msg)
      }
      fire(ctx)
      this.to.next(msg)
    }
    const fire = (ctx, msg) => {
      if (ctx.stop) {
        return
      }
      ctx.stun--
      if (!ctx.err && 0 < ctx.stun) {
        return
      } // TODO: 'forget' feature in SEA tied to this, bad approach, but hacked in for now. Any changes here must update there.
      ctx.stop = 1
      const root = ctx.root
      if (!root) {
        return
      }
      let tmp = ctx.match
      tmp.end = 1
      if (tmp === root.hatch) {
        tmp = ctx.latch
        if (!tmp || tmp.end) {
          delete root.hatch
        } else {
          root.hatch = tmp
        }
      }
      ctx.hatch?.() // TODO: rename/rework how put & this interact.
      setTimeout.each(ctx.match, (cb) => {
        cb?.()
      })
      msg = ctx.msg
      if (!msg || ctx.err || msg.err) {
        return
      }
      msg.out = universe
      ctx.root.on('out', msg)

      CF() // courtesy check;
    }
    const ack = (msg) => {
      // aggregate ACKs.
      const id = msg['@'] || ''
      const ctx = id._
      if (!ctx) {
        let dup = msg.$?._?.root?.dup
        dup = dup?.check(id)
        if (!dup) {
          return
        }
        msg['@'] = dup?.['#'] || msg['@'] // This doesn't do anything anymore, backtrack it to something else?
        return
      }
      ctx.acks = (ctx.acks || 0) + 1
      ctx.err = msg.err
      if (ctx.err) {
        msg['@'] = ctx['#']
        fire(ctx) // TODO: BUG? How it skips/stops propagation of msg if any 1 item is error, this would assume a whole batch/resync has same malicious intent.
      }
      ctx.ok = msg.ok || ctx.ok
      if (!ctx.stop && !ctx.crack) {
        ctx.crack = ctx.match?.push(() => {
          back(ctx)
        })
      } // handle synchronous acks. NOTE: If a storage peer ACKs synchronously then the PUT loop has not even counted up how many items need to be processed, so ctx.STOP flags this and adds only 1 callback to the end of the PUT loop.
      back(ctx)
    }
    const back = (ctx) => {
      if (!ctx?.root) {
        return
      }
      if (ctx.stun || ctx.acks !== ctx.all) {
        return
      }
      ctx.root.on('in', {
        '@': ctx['#'],
        err: ctx.err,
        ok: ctx.err ? u : ctx.ok || { '': 1 }
      })
    }

    const ERR = 'Error: Invalid graph!'
    const cut = (s) => ` '${(`${s}`).slice(0, 9)}...' `
    const L = JSON.stringify,
      MD = 2147483647,
      State = Gun.state
    let C = 0
    let CT
    let CF = () => {
      const oldCT = CT
      CT = Date.now()
      if (C > 999 && C / -(oldCT - CT) > 1) {
        Gun.window &&
          console.log(
            "Warning: You're syncing 1K+ records a second, faster than DOM can update - consider limiting query."
          )
        CF = () => {
          C = 0
        }
      }
    }
  })()

  ;(() => {
    Gun.on.get = (msg, gun) => {
      const root = gun._,
        get = msg.get,
        soul = get['#'],
        has = get['.']
      let node = root.graph[soul]
      if (!root.next) root.next = {}
      const next = root.next
      const at = next[soul]

      // TODO: Azarattum bug, what is in graph is not same as what is in next. Fix!

      // queue concurrent GETs?
      // TODO: consider tagging original message into dup for DAM.
      // TODO: ^ above? In chat app, 12 messages resulted in same peer asking for `#user.pub` 12 times. (same with #user GET too, yipes!) // DAM note: This also resulted in 12 replies from 1 peer which all had same ##hash but none of them deduped because each get was different.
      // TODO: Moving quick hacks fixing these things to axe for now.
      // TODO: a lot of GET #foo then GET #foo."" happening, why?
      // TODO: DAM's ## hash check, on same get ACK, producing multiple replies still, maybe JSON vs YSON?
      // TMP note for now: viMZq1slG was chat LEX query #.
      /*if(gun !== (tmp = msg.$) && (tmp = (tmp||'')._)){
			if(tmp.Q){ tmp.Q[msg['#']] = ''; return } // chain does not need to ask for it again.
			tmp.Q = {};
		}*/
      /*if(u === has){
			if(at.Q){
				//at.Q[msg['#']] = '';
				//return;
			}
			at.Q = {};
		}*/
      const ctx = msg._ || {}
      ctx.DBG = msg.DBG
      const DBG = ctx.DBG
      if (DBG) DBG.g = Date.now()
      //console.log("GET:", get, node, has, at);
      //if(!node && !at){ return root.on('get', msg) }
      //if(has && node){ // replace 2 below lines to continue dev?
      if (!node) {
        return root.on('get', msg)
      }
      if (has) {
        if ('string' !== typeof has || u === node[has]) {
          if (!at?.next?.[has]) {
            root.on('get', msg)
            return
          }
        }
        node = state_ify({}, has, state_is(node, has), node[has], soul)
        // If we have a key in-memory, do we really need to fetch?
        // Maybe... in case the in-memory key we have is a local write
        // we still need to trigger a pull/merge from peers.
      }
      //Gun.window? Gun.obj.copy(node) : node; // HNPERF: If !browser bump Performance? Is this too dangerous to reference root graph? Copy / shallow copy too expensive for big nodes. Gun.obj.to(node); // 1 layer deep copy // Gun.obj.copy(node); // too slow on big nodes
      node && ack(msg, node)
      root.on('get', msg) // send GET to storage adapters.
    }
    const ack = (msg, node) => {
      let S = Date.now()
      const ctx = msg._ || {}
      ctx.DBG = msg.DBG
      const DBG = ctx.DBG
      let keys = Object.keys(node || '').sort()
      const to = msg['#']
      let id = text_rand(9)
      const soul = ((node || '')._ || '')['#']
      const root = msg.$._.root
      const F = node === root.graph[soul]
      const gk = Date.now()
      if (DBG) DBG.gk = gk
      else ctx.gk = gk
      console.STAT?.(S, gk - S, 'got keys')
      // PERF: Consider commenting this out to force disk-only reads for perf testing? // TODO: .keys( is slow
      node &&
        (() => {
          const go = () => {
            S = Date.now()
            let i = 0
            let k
            let put = {}
            while (i < 9) {
              k = keys[i]
              i++
              state_ify(put, k, state_is(node, k), node[k], soul)
            }
            keys = keys.slice(i)
            const tmpObj = {}
            tmpObj[soul] = put
            put = tmpObj
            const faith = F ? () => {} : undefined
            if (faith) {
              faith.ram = faith.faith = true
            } // HNPERF: We're testing performance improvement by skipping going through security again, but this should be audited.
            const tmp = keys.length
            const newS = Date.now()
            console.STAT?.(S, -(S - newS), 'got copied some')
            S = newS
            if (DBG) DBG.ga = Date.now()
            if (tmp) {
              id = text_rand(9)
            }
            root.on('in', {
              _: faith,
              '@': to,
              '#': id,
              '%': tmp ? id : u,
              $: root.$,
              DBG: DBG,
              put: put
            })
            console.STAT?.(S, Date.now() - S, 'got in')
            if (!tmp) {
              return
            }
            setTimeout.turn(go)
          }
          go()
        })()
      if (!node) {
        root.on('in', { '@': msg['#'] })
      } // TODO: I don't think I like this, the default lS adapter uses this but "not found" is a sensitive issue, so should probably be handled more carefully/individually.
    }
    Gun.on.get.ack = ack
  })()

  ;(() => {
    Gun.chain.opt = function (opt) {
      opt = opt || {}
      const at = this._
      let tmp = opt.peers || opt
      if (!Object.plain(opt)) {
        opt = {}
      }
      if (!Object.plain(at.opt)) {
        at.opt = opt
      }
      if ('string' === typeof tmp) {
        tmp = [tmp]
      }
      if (!Object.plain(at.opt.peers)) {
        at.opt.peers = {}
      }
      if (Array.isArray(tmp)) {
        opt.peers = {}
        tmp.forEach((url) => {
          const p = {}
          p.id = p.url = url
          opt.peers[url] = at.opt.peers[url] = at.opt.peers[url] || p
        })
      }
      const each = (k) => {
        const v = opt[k]
        if (
          (opt && Object.hasOwn(opt, k)) ||
          'string' === typeof v ||
          Object.empty(v)
        ) {
          opt[k] = v
          return
        }
        if (v && v.constructor !== Object && !Array.isArray(v)) {
          return
        }
        obj_each(v, each)
      }
      obj_each(opt, each)
      at.opt.from = opt
      Gun.on('opt', at)
      at.opt.uuid =
        at.opt.uuid ||
        function uuid(l) {
          return (
            Gun.state().toString(36).replace('.', '') + String.random(l || 12)
          )
        }
      return this
    }
  })()

  const obj_each = (o, f) => {
    Object.keys(o).forEach(f, o)
  }
  const text_rand = String.random
  const turn = setTimeout.turn
  const valid = Gun.valid
  const state_is = Gun.state.is
  const state_ify = Gun.state.ify
  const u = undefined
  const empty = {}

  Gun.log = (...args) => {
    if (!Gun.log.off) {
      C.log.apply(C, args)
    }
    return args.join(' ')
  }
  Gun.log.once = (w, s, o) => {
    o = Gun.log.once
    o[w] = o[w] || 0
    const count = o[w]++
    if (count === 0) {
      Gun.log(s)
    }
    return count
  }

  if (typeof window !== 'undefined') {
    window.GUN = Gun
    window.Gun = Gun
    window.Gun.window = window
  }
  try {
    if (typeof MODULE !== 'undefined') {
      MODULE.exports = Gun
    }
  } catch {}
  module.exports = Gun

  ;(Gun.window || {}).console = Gun.window?.console || { log: () => {} }
  const C = console
  C.only = (i, s, ...args) => {
    if (C.only.i && i === C.only.i) {
      C.only.i++
      C.log(i, s, ...args)
      return s
    }
  }

  ;('Please do not remove welcome log unless you are paying for a monthly sponsorship, thanks!')
  Gun.log.once(
    'welcome',
    'Hello wonderful person! :) Thanks for using GUN, please ask for help on http://chat.gun.eco if anything takes you longer than 5min to figure out!'
  )
})()
