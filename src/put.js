;(() => {
  const Gun = require('./root')
  /**
   * Puts data into the graph at the current chain location.
   * @param {*} data - The data to put (object, primitive, or function).
   * @param {function} [cb] - Callback for acknowledgments.
   * @param {object} [as] - Internal options object.
   * @returns {Gun.chain} The chain for chaining.
   */
  Gun.chain.put = function (data, cb, as) {
    const at = this._
    const root = at.root
    as = as || {}
    as.root = at.root
    as.run ||= root.once
    stun(as, at.id) // set a flag for reads to check if this chain is writing.
    as.ack = as.ack || cb
    as.via = as.via || this
    as.data = as.data || data
    if (!as.soul) {
      as.soul = at.soul || ('string' === typeof cb && cb)
    }
    as.state = as.state || Gun.state()
    if ('function' === typeof data) {
      data((d) => {
        as.data = d
        this.put(undefined, undefined, as)
      })
      return this
    }
    if (!as.soul) {
      get(as)
      return this
    }
    as.$ = root.$.get(as.soul) // TODO: This may not allow user chaining and similar?
    as.todo = [{ it: as.data, ref: as.$ }]
    as.turn = as.turn || turn
    as.ran = as.ran || ran
    // TODO: Perf! We only need to stun chains that are being modified, not necessarily written to.
    /**
     * Processes the todo queue for putting data into the graph.
     */
    ;(function walk() {
      let to = as.todo,
        at = to.pop(),
        d = at.it,
        v,
        k,
        cat,
        tmp,
        g,
        seen,
        id
      stun(as, at.ref)
      tmp = at.todo
      if (tmp) {
        k = tmp.pop()
        d = d[k]
        if (tmp.length) {
          to.push(at)
        }
      }
      if (k) {
        if (!to.path) to.path = []
        to.path.push(k)
      }
      v = valid(d)
      g = Gun.is(d)
      if (!v && !g) {
        if (!Object.plain(d)) {
          tmp = []
          ran.err(
            as,
            `Invalid data: ${check(d)} at ${
              as.via.back((at) => {
                at.get && tmp.push(at.get)
              }, tmp) || tmp.join('.')
            }.${(to.path || []).join('.')}`
          )
          return
        }
        if (!as.seen) as.seen = []
        seen = as.seen
        let i = seen.length
        while (i--) {
          tmp = seen[i]
          if (d === tmp.it) {
            v = d = tmp.link
            break
          }
        }
      }
      if (k && v) {
        at.node = state_ify(at.node, k, as.state, d)
      } // handle soul later.
      else {
        if (!as.seen) {
          ran.err(as, 'Data at root of graph must be a node (an object).')
          return
        }
        cat = {
          it: d,
          link: {},
          path: (to.path || []).slice(),
          todo: g ? [] : Object.keys(d).sort().reverse(),
          up: at
        }
        as.seen.push(cat) // Any perf reasons to CPU schedule this .keys( ?
        at.node = state_ify(at.node, k, as.state, cat.link)
        !g && cat.todo.length && to.push(cat)
        // ---------------
        id = as.seen.length
        if (!as.wait) as.wait = {}
        as.wait[id] = ''
        cat.ref = g ? d : k ? at.ref.get(k) : at.ref
        tmp = cat.ref._
        tmp = (d && (d._ || '')['#']) || tmp.soul || tmp.link
        tmp
          ? resolve({ soul: tmp })
          : cat.ref.get(resolve, {
              out: { get: { '.': ' ' } },
              run: as.run,
              /*hatch: 0,*/ v2020: 1
            }) // TODO: BUG! This should be resolve ONLY soul to prevent full data from being loaded. // Fixed now?
        /**
         * Resolves the soul for a reference during put operation.
         * @param {object} msg - The message from the get operation.
         * @param {object} eve - The event object.
         */
        function resolve(msg, eve) {
          const end = cat.link['#']
          if (eve) {
            eve.off()
            eve.rid(msg)
          } // TODO: Too early! Check all peers ack not found.
          // TODO: BUG maybe? Make sure this does not pick up a link change wipe, that it uses the changing link instead.
          let soul = end || msg.soul
          let tmp
          let node
          if (!soul) {
            tmp = (msg.$$ || msg.$)?._ || {}
            soul =
              tmp.soul ||
              tmp.link ||
              tmp.put?._?.['#'] ||
              tmp['#'] ||
              (msg.put && msg.$$
                ? msg.put['#']
                : (msg.put?.['='] || msg.put?.[':'] || '')['#'])
          }
          !end && stun(as, msg.$)
          if (!soul && !at.link['#']) {
            // check soul link above us
            if (!at.wait) {
              at.wait = []
            }
            at.wait.push(() => {
              resolve(msg, eve)
            }) // wait
            return
          }
          if (!soul) {
            soul = []
            ;(msg.$$ || msg.$).back((at) => {
              tmp = at.soul || at.link
              if (tmp) {
                return soul.push(tmp)
              }
              soul.push(at.get)
            })
            soul = soul.reverse().join('/')
          }
          cat.link['#'] = soul
          if (!g) {
            if (!as.graph) {
              as.graph = {}
            }
            node = cat.node
            if (!node) {
              node = cat.node = { _: {} }
            }
            as.graph[soul] = node
            node._['#'] = soul
          }
          delete as.wait[id]
          cat.wait &&
            setTimeout.each(cat.wait, (cb) => {
              cb?.()
            })
          as.ran(as)
        }
        // ---------------
      }
      if (!to.length) {
        return as.ran(as)
      }
      as.turn(walk)
    })()
    return this
  }

  /**
   * Stuns a chain to prevent reads during writes.
   * @param {object} as - The put operation context.
   * @param {string|object} id - The chain ID to stun.
   */
  function stun(as, id) {
    if (!id) {
      return
    }
    id = id?._?.id || id
    let run
    if (!as.root.stun) {
      as.root.stun = { on: Gun.on }
    }
    run = as.root.stun
    let test = {},
      tmp
    if (!as.stun) {
      as.stun = run.on('stun', () => {})
    }
    tmp = run.on(`${id}`)
    if (tmp) {
      tmp.the.last.next(test)
    }
    if (test.run >= as.run) {
      return
    }
    run.on(`${id}`, function (test) {
      if (as.stun.end) {
        this.off()
        this.to.next(test)
        return
      }
      test.run = test.run || as.run
      test.stun = test.stun || as.stun
      return
    })
  }

  /**
   * Finalizes the put operation and handles acknowledgments.
   * @param {object} as - The put operation context.
   */
  function ran(as) {
    if (as.err) {
      ran.end(as.stun, as.root)
      return
    } // move log handle here.
    if (as.todo.length || as.end || !Object.empty(as.wait)) {
      return
    }
    as.end = 1
    const cat = as.$.back(-1)._
    const root = cat.root
    const ask = cat.ask(function (ack) {
      root.on('ack', ack)
      if (ack.err && !ack.lack) {
        Gun.log(ack)
      }
      acks++
      if (acks > (as.acks || 0)) {
        this.off()
      } // Adjustable ACKs! Only 1 by default.
      if (!as.ack) {
        return
      }
      as.ack(ack, this)
    }, as.opt)
    let acks = 0
    const stun = as.stun
    const tmp = () => {
      // this is not official yet, but quick solution to hack in for now.
      if (!stun) {
        return
      }
      ran.end(stun, root)
      const stunAdd = stun.add || ''
      setTimeout.each(Object.keys(stunAdd), (key) => {
        const cb = stunAdd[key]
        if (cb) {
          cb()
        }
      }) // resume the stunned reads // Any perf reasons to CPU schedule this .keys( ?
    }
    tmp.hatch = tmp // this is not official yet ^
    if (as.ack && !as.ok) {
      as.ok = as.acks || 9
    } // TODO: In future! Remove this! This is just old API support.
    as.out = as.graph
    as.via._.on('out', {
      _: tmp,
      '#': ask,
      ok: as.ok && { '@': as.ok + 1 },
      opt: as.opt,
      put: as.out
    })
  }
  ran.end = (stun, root) => {
    stun.end = noop // like with the earlier id, cheaper to make this flag a function so below callbacks do not have to do an extra type check.
    if (stun.the.to === stun && stun === stun.the.last) {
      delete root.stun
    }
    stun.off()
  }
  ran.err = (as, err) => {
    as.err = Gun.log(err)
    as.out = { err: as.err }
    ;(as.ack || noop).call(as, as.out)
    as.ran(as)
  }

  /**
   * Handles getting a soul for the put operation when none is provided.
   * @param {object} as - The put operation context.
   */
  function get(as) {
    const at = as.via._
    as.via = as.via.back((at) => {
      if (at.soul || !at.get) {
        return at.$
      }
      const tmp = as.data
      as.data = {}
      as.data[at.get] = tmp
    })
    if (!as.via || !as.via?._.soul) {
      as.via = at.root.$.get(as.data?._?.['#'] || at.$.back('opt.uuid')())
    }
    as.via.put(as.data, as.ack, as)

    return
  }
  /**
   * Returns the type or constructor name of the data.
   * @param {*} d - The data to check.
   * @returns {string} The type or constructor name.
   */
  function check(d) {
    return d?.constructor?.name || typeof d
  }

  const empty = {}
  const noop = () => {}
  const turn = setTimeout.turn
  const valid = Gun.valid
  const state_ify = Gun.state.ify
  const _iife = (fn, as) => {
    fn.call(as || empty)
  }
})()
