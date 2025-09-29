const Gun = typeof window !== 'undefined' ? window.Gun : require('../gun')

Gun.on('create', function (root) {
  if (Gun.TESTING) {
    root.opt.file = 'radatatest'
  }
  this.to.next(root)
  const opt = root.opt
  const _empty = {}
  const undefinedValue = undefined
  if (false === opt.rad || false === opt.radisk) {
    return
  }
  if (
    typeof process !== 'undefined' &&
    'false' === `${(process.env || '').RAD}`
  ) {
    return
  }
  const Radisk = Gun.window?.Radisk || require('./radisk')
  const Radix = Radisk.Radix
  const dare = Radisk(opt)
  const esc = String.fromCharCode(27)
  let ST = 0

  root.on('put', function (msg) {
    this.to.next(msg)
    if ((msg._ || '').rad) {
      return
    } // don't save what just came from a read.
    //if(msg['@']){ return } // WHY DID I NOT ADD THIS?
    const id = msg['#']
    const put = msg.put
    const soul = put['#']
    const key = put['.']
    const val = put[':']
    const state = put['>']
    let _tmp
    const DBG = (msg._ || '').DBG
    if (DBG) {
      DBG.sp = DBG.sp || Date.now()
    }
    //let lot = (msg._||'').lot||''; count[id] = (count[id] || 0) + 1;
    const ctx_ = msg._ || ''
    let S = ctx_.RPS
    if (!S) {
      S = ctx_.RPS = Date.now()
    }
    //console.log("PUT ------->>>", soul,key, val, state);
    //dare(soul+esc+key, {':': val, '>': state}, dare.one[id] || function(err, ok){
    let debug_r
    if (DBG) {
      debug_r = DBG.r = DBG.r || {}
    }
    dare(
      soul + esc + key,
      { ':': val, '>': state },
      (err, ok) => {
        //console.log("<<<------- PAT", soul,key, val, state, 'in', +new Date - S);
        if (DBG) {
          DBG.spd = DBG.spd || Date.now()
        }
        console.STAT?.(S, Date.now() - S, 'put')
        //if(!err && count[id] !== lot.s){ console.log(err = "Disk count not same as ram count."); console.STAT && console.STAT(+new Date, lot.s - count[id], 'put ack != count') } delete count[id];
        if (err) {
          root.on('in', { '@': id, err: err, DBG: DBG })
          return
        }
        root.on('in', { '@': id, ok: ok, DBG: DBG })
        //}, id, DBG && (DBG.r = DBG.r || {}));
      },
      false && id,
      debug_r
    )
    if (DBG) {
      DBG.sps = DBG.sps || Date.now()
    }
  })
  const _count = {}
  const _obj_empty = Object.empty

  root.on('get', function (msg) {
    this.to.next(msg)
    const ctx = msg._ || ''
    ctx.DBG = msg.DBG
    const DBG = ctx.DBG
    if (DBG) {
      DBG.sg = Date.now()
    }
    const id = msg['#']
    const get = msg.get
    const soul = msg.get['#']
    const has = msg.get['.'] || ''
    const o = {}
    let graph
    let _lex
    let key
    let tmp
    let force
    if ('string' === typeof soul) {
      key = soul
    } else if (soul) {
      const tmp = soul['*']
      if (undefinedValue !== tmp) {
        o.limit = force = 1
      }
      if (undefinedValue !== soul['>']) {
        o.start = soul['>']
      }
      if (undefinedValue !== soul['<']) {
        o.end = soul['<']
      }
      key = force ? `${tmp}` : tmp || soul['=']
      force = null
    }
    if (key && !o.limit) {
      // a soul.has must be on a soul, and not during soul*
      if ('string' === typeof has) {
        key = key + esc + (o.atom = has)
      } else if (has) {
        if (undefinedValue !== has['>']) {
          o.start = has['>']
          o.limit = 1
        }
        if (undefinedValue !== has['<']) {
          o.end = has['<']
          o.limit = 1
        }
        if (undefinedValue !== (tmp = has['*'])) {
          o.limit = force = 1
        }
        if (key) {
          key =
            key +
            esc +
            (force ? `${tmp || ''}` : tmp || (o.atom = has['='] || ''))
        }
      }
    }
    if ((tmp = get['%']) || o.limit) {
      o.limit = tmp <= (o.pack || 1000 * 100) ? tmp : 1
    }
    if (has['-'] || soul?.['-'] || get['-']) {
      o.reverse = true
    }
    if ((tmp = (root.next || '')[soul]) && tmp.put) {
      if (o.atom) {
        tmp = (tmp.next || '')[o.atom]
        if (tmp?.root?.graph?.[soul]?.[o.atom]) {
          return
        }
      } else if (tmp?.rad) {
        return
      }
    }
    const now = Gun.state()
    let S = Date.now()
    let C = 0
    let _SPT = 0 // STATS!
    if (DBG) {
      DBG.sgm = S
    }
    //const GID = String.random(3); console.log("GET ------->>>", GID, key, o, '?', get);
    dare(
      key || '',
      (err, data, info) => {
        //console.log("<<<------- GOT", GID, +new Date - S, err, data);
        if (DBG) {
          DBG.sgr = Date.now()
        }
        if (DBG) {
          DBG.sgi = info
        }
        try {
          opt.store.stats.get.time[statg % 50] = Date.now() - S
          ++statg
          opt.store.stats.get.count++
          if (err) {
            opt.store.stats.get.err = err
          }
        } catch (_e) {} // STATS!
        //if(u === data && info.chunks > 1){ return } // if we already sent a chunk, ignore ending empty responses. // this causes tests to fail.
        console.STAT?.(S, Date.now() - S, 'got', JSON.stringify(key))
        S = Date.now()
        info = info || ''
        let va
        let ve
        if (
          info.unit &&
          data &&
          undefinedValue !== (va = data[':']) &&
          undefinedValue !== (ve = data['>'])
        ) {
          // new format
          const tmp = key.split(esc)
          const so = tmp[0]
          const ha = tmp[1]
          ;(graph = graph || {})[so] = Gun.state.ify(graph[so], ha, ve, va, so)
          root.$.get(so).get(ha)._.rad = now
          // REMEMBER TO ADD _rad TO NODE/SOUL QUERY!
        } else if (data) {
          // old code path
          if (typeof data !== 'string') {
            if (o.atom) {
              data = undefinedValue
            } else {
              Radix.map(data, each, o) // IS A RADIX TREE, NOT FUNCTION!
            }
          }
          if (!graph && data) {
            each(data, '')
          }
          // TODO: !has what about soul lookups?
          if (
            !o.atom &&
            !has & ('string' === typeof soul) &&
            !o.limit &&
            !o.more
          ) {
            root.$.get(soul)._.rad = now
          }
        }
        if (DBG) {
          DBG.sgp = Date.now()
        }
        // TODO: PERF NOTES! This is like 0.2s, but for each ack, or all? Can you cache these preps?
        // TODO: PERF NOTES! This is like 0.2s, but for each ack, or all? Can you cache these preps?
        // TODO: PERF NOTES! This is like 0.2s, but for each ack, or all? Can you cache these preps?
        // TODO: PERF NOTES! This is like 0.2s, but for each ack, or all? Can you cache these preps?
        // TODO: PERF NOTES! This is like 0.2s, but for each ack, or all? Can you cache these preps?
        // Or benchmark by reusing first start date.
        if (console.STAT && (ST = Date.now() - S) > 9) {
          console.STAT(S, ST, 'got prep time')
          console.STAT(S, C, 'got prep #')
        }
        _SPT += ST
        C = 0
        S = Date.now()
        const faith = () => {}
        faith.faith = true
        faith.rad = get // HNPERF: We're testing performance improvement by skipping going through security again, but this should be audited.
        root.on('in', {
          '@': id,
          put: graph,
          '%': info.more ? 1 : undefinedValue,
          err: err ? err : undefinedValue,
          _: faith,
          DBG: DBG
        })
        console.STAT &&
          (ST = Date.now() - S) > 9 &&
          console.STAT(S, ST, 'got emit', Object.keys(graph || {}).length)
        graph = undefinedValue // each is outside our scope, we have to reset graph to nothing!
      },
      o,
      DBG && (DBG.r = DBG.r || {})
    )
    if (DBG) {
      DBG.sgd = Date.now()
    }
    console.STAT && (ST = Date.now() - S) > 9 && console.STAT(S, ST, 'get call') // TODO: Perf: this was half a second??????
    function each(val, has, _a, _b) {
      // TODO: THIS CODE NEEDS TO BE FASTER!!!!
      C++
      if (!val) {
        return
      }
      has = (key + has).split(esc)
      const soul = has.slice(0, 1)[0]
      has = has.slice(-1)[0]
      if (o.limit && o.limit <= o.count) {
        return true
      }
      let va
      let ve
      const so = soul
      const ha = has
      //if(u !== (va = val[':']) && u !== (ve = val['>'])){ // THIS HANDLES NEW CODE!
      if ('string' !== typeof val) {
        // THIS HANDLES NEW CODE!
        va = val[':']
        ve = val['>']
        ;(graph = graph || {})[so] = Gun.state.ify(graph[so], ha, ve, va, so)
        //root.$.get(so).get(ha)._.rad = now;
        o.count = (o.count || 0) + ((va || '').length || 9)
        return
      }
      o.count = (o.count || 0) + val.length
      const tmp = val.lastIndexOf('>')
      const state = Radisk.decode(val.slice(tmp + 1), null, esc)
      val = Radisk.decode(val.slice(0, tmp), null, esc)
      ;(graph = graph || {})[soul] = Gun.state.ify(
        graph[soul],
        has,
        state,
        val,
        soul
      )
    }
  })
  const _val_is = Gun.valid
  ;(opt.store || {}).stats = {
    get: { time: {}, count: 0 },
    put: { time: {}, count: 0 }
  } // STATS!
  let statg = 0
  const _statp = 0 // STATS!
})
