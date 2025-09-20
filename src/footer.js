/* BELOW IS TEMPORARY FOR OLD INTERNAL COMPATIBILITY, THEY ARE IMMEDIATELY DEPRECATED AND WILL BE REMOVED IN NEXT VERSION */
;(() => {
  if (typeof Gun === 'undefined') {
    return
  }
  const DEP = (n) => {
    console.warn(
      `Warning! Deprecated internal utility will break in next version: ${n}`
    )
  }
  // Generic javascript utilities.
  const Type = Gun
  //Type.fns = Type.fn = {is: function(fn){ return (!!fn && fn instanceof Function) }}
  Type.fn = Type.fn || {
    is: (fn) => {
      DEP('fn')
      return !!fn && typeof fn === 'function'
    }
  }
  Type.bi = Type.bi || {
    is: (b) => {
      DEP('bi')
      return b instanceof Boolean || typeof b === 'boolean'
    }
  }
  Type.num = Type.num || {
    is: (n) => {
      DEP('num')
      return (
        !list_is(n) &&
        (n - parseFloat(n) + 1 >= 0 || Infinity === n || -Infinity === n)
      )
    }
  }
  Type.text = Type.text || {
    hash: (s, c) => {
      // via SO
      DEP('text.hash')
      if (typeof s !== 'string') {
        return
      }
      c = c || 0
      if (!s.length) {
        return c
      }
      var i
      var l
      var n
      for (i = 0, l = s.length, void 0; i < l; ++i) {
        n = s.charCodeAt(i)
        c = (c << 5) - c + n
        c |= 0
      }
      return c
    },
    ify: (t) => {
      DEP('text.ify')
      if (Type.text.is(t)) {
        return t
      }
      if (typeof JSON !== 'undefined') {
        return JSON.stringify(t)
      }
      return t?.toString?.() ?? t
    },
    is: (t) => {
      DEP('text')
      return typeof t === 'string'
    },
    match: (t, o) => {
      var tmp
      DEP('text.match')
      if ('string' !== typeof t) {
        return false
      }
      if (typeof o === 'string') {
        o = { '=': o }
      }
      o = o || {}
      tmp = o['='] || o['*'] || o['>'] || o['<']
      if (t === tmp) {
        return true
      }
      if (undefined !== o['=']) {
        return false
      }
      tmp = o['*'] || o['>'] || o['<']
      if (t.slice(0, (tmp || '').length) === tmp) {
        return true
      }
      if (undefined !== o['*']) {
        return false
      }
      if (undefined !== o['>'] && undefined !== o['<']) {
        return t >= o['>'] && t <= o['<']
      }
      if (undefined !== o['>'] && t >= o['>']) {
        return true
      }
      if (undefined !== o['<'] && t <= o['<']) {
        return true
      }
      return false
    },
    random: (l, c) => {
      DEP('text.random')
      var s = ''
      l = l || 24 // you are not going to make a 0 length random number, so no need to check type
      c = c || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
      while (l > 0) {
        s += c.charAt(Math.floor(Math.random() * c.length))
        l--
      }
      return s
    }
  }
  Type.list = Type.list || {
    index: 1, // change this to 0 if you want non-logical, non-mathematical, non-matrix, non-convenient array notation
    is: (l) => {
      DEP('list')
      return Array.isArray(l)
    },
    map: (l, c, _) => {
      DEP('list.map')
      return obj_map(l, c, _)
    },
    slit: Array.prototype.slice,
    sort: (k) => {
      // creates a new sort function based off some key
      DEP('list.sort')
      return (A, B) => {
        if (!A || !B) {
          return 0
        }
        A = A[k]
        B = B[k]
        if (A < B) {
          return -1
        } else if (A > B) {
          return 1
        } else {
          return 0
        }
      }
    }
  }
  Type.obj = Type.boj || {
    as: (o, k, v, u) => {
      DEP('obj.as')
      o[k] = o[k] || (u === v ? {} : v)
      return o[k]
    },
    copy: (o) => {
      DEP('obj.copy') // because http://web.archive.org/web/20140328224025/http://jsperf.com/cloning-an-object/2
      return !o ? o : JSON.parse(JSON.stringify(o)) // is shockingly faster than anything else, and our data has to be a subset of JSON anyways!
    },
    del: (o, k) => {
      DEP('obj.del')
      if (!o) {
        return
      }
      o[k] = null
      delete o[k]
      return o
    },
    empty: (() => {
      function empty(v, i) {
        var n = this.n
        if (n && (i === n || (obj_is(n) && Object.hasOwn(n, i)))) {
          return
        }
        if (undefined !== i) {
          return true
        }
      }
      return (o, n) => {
        DEP('obj.empty')
        if (!o) {
          return true
        }
        return obj_map(o, empty, { n: n }) ? false : true
      }
    })(),
    has: (o, k) => {
      DEP('obj.has')
      return Object.hasOwn(o, k)
    },
    ify: (o) => {
      DEP('obj.ify')
      if (obj_is(o)) {
        return o
      }
      try {
        o = JSON.parse(o)
      } catch {
        o = {}
      }
      return o
    },
    is: (o) => {
      DEP('obj')
      return o
        ? (o instanceof Object && o.constructor === Object) ||
            Object.prototype.toString
              .call(o)
              .match(/^\[object (\w+)\]$/)?.[1] === 'Object'
        : false
    },
    map: (() => {
      function t(...args) {
        if (args.length === 2) {
          const [k, v] = args
          t.r = t.r || {}
          t.r[k] = v
          return
        }
        const [k] = args
        t.r = t.r || []
        t.r.push(k)
      }
      var keys = Object.keys
      var map
      Object.keys =
        Object.keys ||
        ((o) =>
          map(o, (v, k, t) => {
            t(k)
          }))
      return (l, c, _) => {
        DEP('obj.map')
        var i = 0
        var x
        var r
        var ll
        var lle
        var ii
        var f = typeof c === 'function'
        t.r = undefined
        if (keys && obj_is(l)) {
          ll = keys(l)
          lle = true
        }
        _ = _ || {}
        if (list_is(l) || ll) {
          x = (ll || l).length
          for (; i < x; i++) {
            ii = i + Type.list.index
            if (f) {
              r = lle ? c.call(_, l[ll[i]], ll[i], t) : c.call(_, l[i], ii, t)
              if (r !== undefined) {
                return r
              }
            } else {
              //if(Type.test.is(c,l[i])){ return ii } // should implement deep equality testing!
              if (c === l[lle ? ll[i] : i]) {
                return ll ? ll[i] : ii
              } // use this for now
            }
          }
        } else {
          for (i in l) {
            if (f) {
              if (obj_has(l, i)) {
                r = _ ? c.call(_, l[i], i, t) : c(l[i], i, t)
                if (r !== undefined) {
                  return r
                }
              }
            } else {
              //if(a.test.is(c,l[i])){ return i } // should implement deep equality testing!
              if (c === l[i]) {
                return i
              } // use this for now
            }
          }
        }
        return f ? t.r : Type.list.index ? 0 : -1
      }
    })(),
    put: (o, k, v) => {
      DEP('obj.put')
      const temp = o || {}
      temp[k] = v
      return temp
    },
    to: (() => {
      function map(v, k) {
        if (obj_has(this, k) && undefined !== this[k]) {
          return
        }
        this[k] = v
      }
      return (from, to) => {
        DEP('obj.to')
        to = to || {}
        obj_map(from, map, to)
        return to
      }
    })()
  }
  Type.time = Type.time || {}
  Type.time.is =
    Type.time.is ||
    ((t) => {
      DEP('time')
      return t ? t instanceof Date : Date.now()
    })

  var list_is = Type.list.is
  var obj = Type.obj
  var obj_is = obj.is
  var obj_has = obj.has
  var obj_map = obj.map

  var Val = {
    is: (v) => {
      DEP('val.is') // Valid values are a subset of JSON: null, binary, number (!Infinity), text, or a soul relation. Arrays need special algorithms to handle concurrency, so they are not supported directly. Use an extension that supports them if needed but research their problems first.
      if (v === undefined) {
        return false
      }
      if (v === null) {
        return true
      } // "deletes", nulling out keys.
      if (v === Infinity) {
        return false
      } // we want this to be, but JSON does not support it, sad face.
      if (
        text_is(v) || // by "text" we mean strings.
        bi_is(v) || // by "binary" we mean boolean.
        num_is(v)
      ) {
        // by "number" we mean integers or decimals.
        return true // simple values are valid.
      }
      return Val.link.is(v) || false // is the value a soul relation? Then it is valid and return it. If not, everything else remaining is an invalid data type. Custom extensions can be built on top of these primitives to support other types.
    },
    link: { _: '#' }
  }
  Val.rel = Val.link
  ;(() => {
    Val.link.is = (v) => {
      DEP('val.link.is') // this defines whether an object is a soul relation or not, they look like this: {'#': 'UUID'}
      var o
      if (v?.[rel_] && !v?._ && obj_is(v)) {
        // must be an object.
        o = {}
        obj_map(v, map, o)
        if (o.id) {
          // a valid id was found.
          return o.id // yay! Return it.
        }
      }
      return false // the value was not a valid soul relation.
    }
    function map(s, k) {
      if (this.id) {
        this.id = false
        return this.id
      } // if ID is already defined AND we're still looping through the object, it is considered invalid.
      if (k === rel_ && text_is(s)) {
        // the key should be '#' and have a text value.
        this.id = s // we found the soul!
      } else {
        this.id = false
        return this.id // if there exists anything else on the object that isn't the soul, then it is considered invalid.
      }
    }
  })()
  Val.link.ify = (t) => {
    DEP('val.link.ify')
    return obj_put({}, rel_, t)
  } // convert a soul into a relation and return it.
  Type.obj.has._ = '.'
  var rel_ = Val.link._
  var bi_is = Type.bi.is
  var num_is = Type.num.is
  var text_is = Type.text.is
  var obj_put = obj.put

  Type.val = Type.val || Val

  var Node = { _: '_' }
  Node.soul = (n, o) => {
    DEP('node.soul')
    return n?._?.[o || soul_]
  } // convenience function to check to see if there is a soul on a node and return it.
  Node.soul.ify = (n, o) => {
    DEP('node.soul.ify') // put a soul on an object.
    o = typeof o === 'string' ? { soul: o } : o || {}
    n = n || {} // make sure it exists.
    n._ = n._ || {} // make sure meta exists.
    n._[soul_] = o.soul || n._[soul_] || text_random() // put the soul on it.
    return n
  }
  Node.soul._ = Val.link._
  ;(() => {
    Node.is = (n, cb, as) => {
      DEP('node.is')
      var s // checks to see if an object is a valid node.
      if (!obj_is2(n)) {
        return false
      } // must be an object.
      s = Node.soul(n)
      if (s) {
        // must have a soul on it.
        return !obj_map2(n, map, { as: as, cb: cb, s: s, n: n })
      }
      return false // nope! This was not a valid node.
    }
    function map(v, k) {
      // we invert this because the way we check for this is via a negation.
      if (k === Node._) {
        return
      } // skip over the metadata.
      if (!Val.is(v)) {
        return true
      } // it is true that this is an invalid node.
      if (this.cb) {
        this.cb.call(this.as, v, k, this.n, this.s)
      } // optionally callback each key/value.
    }
  })()
  ;(() => {
    Node.ify = (obj, o, as) => {
      DEP('node.ify') // returns a node from a shallow object.
      if (!o) {
        o = {}
      } else if (typeof o === 'string') {
        o = { soul: o }
      } else if (typeof o === 'function') {
        o = { map: o }
      }
      if (o.map) {
        o.node = o.map.call(as, obj, undefined, o.node || {})
      }
      o.node = Node.soul.ify(o.node || {}, o)
      if (o.node) {
        obj_map2(obj, map, { o: o, as: as })
      }
      return o.node // This will only be a valid node if the object wasn't already deep!
    }
    function map(v, k) {
      var o = this.o
      var tmp
      if (o.map) {
        tmp = o.map.call(this.as, v, '' + k, o.node)
        if (undefined === tmp) {
          obj_del2(o.node, k)
        } else if (o.node) {
          o.node[k] = tmp
        }
        return
      }
      if (Val.is(v)) {
        o.node[k] = v
      }
    }
  })()
  var obj2 = Type.obj
  var obj_is2 = obj2.is
  var obj_del2 = obj2.del
  var obj_map2 = obj2.map
  var text = Type.text
  var text_random = text.random
  var soul_ = Node.soul._
  Type.node = Type.node || Node

  var State = Type.state
  State.lex = () => {
    DEP('state.lex')
    return State().toString(36).replace('.', '')
  }
  State.to = (from, k, to) => {
    DEP('state.to')
    var val = (from || {})[k]
    if (obj_is3(val)) {
      val = obj_copy3(val)
    }
    return State.ify(to, k, State.is(from, k), val, Node.soul(from))
  }
  ;(() => {
    State.map = (cb, s, as) => {
      DEP('state.map')

      const temp = cb || s
      var o = obj_is3(temp) ? temp : null
      const temp2 = cb || s
      cb = fn_is3(temp2) ? temp2 : null
      if (o && !cb) {
        s = num_is3(s) ? s : State()
        o[N_] = o[N_] || {}
        obj_map3(o, map, { o: o, s: s })
        return o
      }
      as = as || obj_is3(s) ? s : undefined
      s = num_is3(s) ? s : State()
      return function (v, k, o, opt) {
        if (!cb) {
          map.call({ o: o, s: s }, v, k)
          return v
        }
        cb.call(as || this || {}, v, k, o, opt)
        if (obj_has3(o, k) && undefined === o[k]) {
          return
        }
        map.call({ o: o, s: s }, v, k)
      }
    }
    function map(v, k) {
      if (N_ === k) {
        return
      }
      State.ify(this.o, k, this.s)
    }
  })()
  var obj3 = Type.obj
  var obj_as3 = obj3.as
  var obj_has3 = obj3.has
  var obj_is3 = obj3.is
  var obj_map3 = obj3.map
  var obj_copy3 = obj3.copy
  var num3 = Type.num
  var num_is3 = num3.is
  var fn3 = Type.fn
  var fn_is3 = fn3.is
  var N_ = Node._

  var Graph = {}
  ;(() => {
    Graph.is = (g, cb, fn, as) => {
      DEP('graph.is') // checks to see if an object is a valid graph.
      if (!g || !obj_is4(g) || obj_empty4(g)) {
        return false
      } // must be an object.
      return !obj_map4(g, map, { cb: cb, fn: fn, as: as }) // makes sure it wasn't an empty object.
    }
    function map(n, s) {
      // we invert this because the way'? we check for this is via a negation.
      if (!n || s !== Node.soul(n) || !Node.is(n, this.fn, this.as)) {
        return true
      } // it is true that this is an invalid graph.
      if (!this.cb) {
        return
      }
      nf.n = n
      nf.as = this.as // sequential race conditions aren't races.
      this.cb.call(nf.as, n, s, nf)
    }
    function nf(fn) {
      // optional callback for each node.
      if (fn) {
        Node.is(nf.n, fn, nf.as)
      } // where we then have an optional callback for each key/value.
    }
  })()
  ;(() => {
    Graph.ify = (obj, env, as) => {
      DEP('graph.ify')
      var at = { path: [], obj: obj }
      if (!env) {
        env = {}
      } else if (typeof env === 'string') {
        env = { soul: env }
      } else if (typeof env === 'function') {
        env.map = env
      }
      if (typeof as === 'string') {
        env.soul = env.soul || as
        as = undefined
      }
      if (env.soul) {
        at.link = Val.link.ify(env.soul)
      }
      env.shell = (as || {}).shell
      env.graph = env.graph || {}
      env.seen = env.seen || []
      env.as = env.as || as
      node(env, at)
      env.root = at.node
      return env.graph
    }
    function node(env, at) {
      var tmp
      tmp = seen(env, at)
      if (tmp) {
        return tmp
      }
      at.env = env
      at.soul = soul
      if (Node.ify(at.obj, map, at)) {
        at.link = at.link || Val.link.ify(Node.soul(at.node))
        if (at.obj !== env.shell) {
          env.graph[Val.link.is(at.link)] = at.node
        }
      }
      return at
    }
    function map(v, k, n) {
      var env = this.env
      var is
      var tmp
      if (Node._ === k && Object.hasOwn(v, Val.link._)) {
        return n._ // TODO: Bug?
      }
      is = valid(v, k, n, this, env)
      if (!is) {
        return
      }
      if (!k) {
        this.node = this.node || n || {}
        if (Object.hasOwn(v, Node._) && Node.soul(v)) {
          // ? for safety ?
          this.node._ = obj_copy(v._)
        }
        this.node = Node.soul.ify(this.node, Val.link.is(this.link))
        this.link = this.link || Val.link.ify(Node.soul(this.node))
      }
      tmp = env.map
      if (tmp) {
        tmp.call(env.as || {}, v, k, n, this)
        if (Object.hasOwn(n, k)) {
          v = n[k]
          if (undefined === v) {
            obj_del(n, k)
            return
          }
          is = valid(v, k, n, this, env)
          if (!is) {
            return
          }
        }
      }
      if (!k) {
        return this.node
      }
      if (is) {
        return v
      }
      tmp = node(env, { obj: v, path: this.path.concat(k) })
      if (!tmp.node) {
        return
      }
      return tmp.link //{'#': Node.soul(tmp.node)};
    }
    function soul(id) {
      var prev = Val.link.is(this.link)
      var graph = this.env.graph
      this.link = this.link || Val.link.ify(id)
      this.link[Val.link._] = id
      if (this.node?.[Node._]) {
        this.node[Node._][Val.link._] = id
      }
      if (Object.hasOwn(graph, prev)) {
        graph[id] = graph[prev]
        obj_del(graph, prev)
      }
    }
    function valid(v, k, n, at, env) {
      var tmp
      if (Val.is(v)) {
        return true
      }
      if (obj_is(v)) {
        return 1
      }
      tmp = env.invalid
      if (tmp) {
        v = tmp.call(env.as || {}, v, k, n)
        return valid(v, k, n, at, env)
      }
      env.err = `Invalid value at '${at.path.concat(k).join('.')}'!`
      if (Type.list.is(v)) {
        env.err = `${env.err} Use \`.set(item)\` instead of an Array.`
      }
    }
    function seen(env, at) {
      var arr = env.seen
      var i = arr.length
      var has
      while (i--) {
        has = arr[i]
        if (at.obj === has.obj) {
          return has
        }
      }
      arr.push(at)
    }
  })()
  Graph.node = (node) => {
    DEP('graph.node')
    var soul = Node.soul(node)
    if (!soul) {
      return
    }
    return obj_put({}, soul, node)
  }
  ;(() => {
    Graph.to = (graph, root, opt) => {
      DEP('graph.to')
      if (!graph) {
        return
      }
      var obj = {}
      opt = opt || { seen: {} }
      obj_map4(graph[root], map, { obj: obj, graph: graph, opt: opt })
      return obj
    }
    function map(v, k) {
      var tmp
      var obj
      if (Node._ === k) {
        if (obj_empty4(v, Val.link._)) {
          return
        }
        this.obj[k] = obj_copy4(v)
        return
      }
      tmp = Val.link.is(v)
      if (!tmp) {
        this.obj[k] = v
        return
      }
      obj = this.opt.seen[tmp]
      if (obj) {
        this.obj[k] = obj
        return
      }
      this.obj[k] = this.opt.seen[tmp] = Graph.to(this.graph, tmp, this.opt)
    }
  })()
  Type.graph = Type.graph || Graph
})()
