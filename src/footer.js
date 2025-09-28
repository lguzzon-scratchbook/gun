;(() => {
  /* BELOW IS TEMPORARY FOR OLD INTERNAL COMPATIBILITY, THEY ARE IMMEDIATELY DEPRECATED AND WILL BE REMOVED IN NEXT VERSION */
  const u = undefined
  if (typeof Gun === 'undefined') {
    return
  }
  const DEP = (n) => {
    console.warn(
      'Warning! Deprecated internal utility will break in next version:',
      n
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
    is: (t) => {
      DEP('text')
      return typeof t === 'string'
    }
  }
  Type.text.ify =
    Type.text.ify ||
    ((t) => {
      DEP('text.ify')
      if (Type.text.is(t)) {
        return t
      }
      if (typeof JSON !== 'undefined') {
        return JSON.stringify(t)
      }
      return t?.toString?.() ?? t
    })
  Type.text.random =
    Type.text.random ||
    ((l, c) => {
      DEP('text.random')
      let s = ''
      l = l || 24 // you are not going to make a 0 length random number, so no need to check type
      c = c || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz'
      while (l > 0) {
        s += c.charAt(Math.floor(Math.random() * c.length))
        l--
      }
      return s
    })
  Type.text.match =
    Type.text.match ||
    ((text, options) => {
      DEP('text.match')
      if (typeof text !== 'string') {
        return false
      }
      if (typeof options === 'string') {
        options = { '=': options }
      }
      options = options || {}
      // Check exact match
      if (options['='] !== undefined) {
        return text === options['=']
      }
      // Check prefix match
      if (options['*'] !== undefined) {
        return text.startsWith(options['*'])
      }
      // Check range
      const hasMin = options['>'] !== undefined
      const hasMax = options['<'] !== undefined
      if (hasMin && hasMax) {
        return text >= options['>'] && text <= options['<']
      }
      if (hasMin) {
        return text >= options['>']
      }
      if (hasMax) {
        return text <= options['<']
      }
      return false
    })
  Type.text.hash =
    Type.text.hash ||
    ((s, c) => {
      // via SO
      DEP('text.hash')
      if (typeof s !== 'string') {
        return
      }
      c ??= 0
      if (!s.length) {
        return c
      }
      let i = 0
      const l = s.length
      let n
      for (; i < l; ++i) {
        n = s.charCodeAt(i)
        c = (c << 5) - c + n
        c |= 0
      }
      return c
    })
  Type.list = Type.list || {
    is: (l) => {
      DEP('list')
      return Array.isArray(l)
    }
  }
  Type.list.slit = Type.list.slit || Array.prototype.slice
  Type.list.sort =
    Type.list.sort ||
    ((k) => {
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
    })
  Type.list.map =
    Type.list.map ||
    ((l, c, _) => {
      DEP('list.map')
      return obj_map(l, c, _)
    })
  Type.list.index = 1 // change this to 0 if you want non-logical, non-mathematical, non-matrix, non-convenient array notation
  Type.obj = Type.obj || {
    is: (o) => {
      DEP('obj')
      return o
        ? (o instanceof Object && o.constructor === Object) ||
            Object.prototype.toString.call(o).match(/^\[object (\w+)\]$/)[1] ===
              'Object'
        : false
    }
  }
  Type.obj.put =
    Type.obj.put ||
    ((o, k, v) => {
      DEP('obj.put')
      const target = o || {}
      target[k] = v
      return target
    })
  Type.obj.has =
    Type.obj.has ||
    ((o, k) => {
      DEP('obj.has')
      return o && Object.hasOwn(o, k)
    })
  Type.obj.del =
    Type.obj.del ||
    ((o, k) => {
      DEP('obj.del')
      if (!o) {
        return
      }
      o[k] = null
      delete o[k]
      return o
    })
  Type.obj.as =
    Type.obj.as ||
    ((o, k, v, u) => {
      DEP('obj.as')
      o[k] = o[k] || (u === v ? {} : v)
      return o[k]
    })
  Type.obj.ify =
    Type.obj.ify ||
    ((o) => {
      DEP('obj.ify')
      if (obj_is(o)) {
        return o
      }
      try {
        o = JSON.parse(o)
      } catch (_e) {
        o = {}
      }
      return o
    })
  ;(() => {
    // Copy properties from 'from' to 'to', setting only if key is missing or value is undefined
    function copyPropertyIfNotPresent(value, key) {
      if (!(key in this) || this[key] === undefined) {
        this[key] = value
      }
    }
    Type.obj.to =
      Type.obj.to ||
      ((from, to) => {
        DEP('obj.to')
        to = to || {}
        obj_map(from, copyPropertyIfNotPresent, to)
        return to
      })
  })()
  Type.obj.copy =
    Type.obj.copy ||
    ((o) => {
      DEP('obj.copy') // because http://web.archive.org/web/20140328224025/http://jsperf.com/cloning-an-object/2
      return !o ? o : JSON.parse(JSON.stringify(o)) // is shockingly faster than anything else, and our data has to be a subset of JSON anyways!
    })
  ;(() => {
    // Check if object has any keys not in the excluded set (excluded can be a value or object of keys to exclude)
    function isNonExcludedKey(_value, key) {
      const excluded = this.excluded
      if (excluded) {
        if (
          typeof excluded === 'object' &&
          obj_is(excluded) &&
          obj_has(excluded, key)
        ) {
          return // key is excluded
        }
        if (key === excluded) {
          return // key matches excluded value
        }
      }
      if (key !== undefined) {
        return true // found a non-excluded key
      }
    }
    Type.obj.empty =
      Type.obj.empty ||
      ((o, excluded) => {
        DEP('obj.empty')
        if (!o) {
          return true
        }
        return !obj_map(o, isNonExcludedKey, { excluded: excluded })
      })
  })()
  ;(() => {
    // Result collector function: if 2 args, sets key-value in object; if 1 arg, pushes to array
    function resultCollector(...args) {
      if (args.length === 2) {
        const [k, v] = args
        resultCollector.results = resultCollector.results || {}
        resultCollector.results[k] = v
        return
      }
      const [k] = args
      resultCollector.results = resultCollector.results || []
      resultCollector.results.push(k)
    }
    const keys = Object.keys
    let map, _u
    Object.keys =
      Object.keys ||
      ((o) =>
        map(o, (_v, k, resultCollector) => {
          resultCollector(k)
        }))
    Type.obj.map = map =
      Type.obj.map ||
      ((listOrObj, callbackOrValue, context) => {
        DEP('obj.map')
        const u = undefined
        let i = 0,
          x,
          result,
          objKeys,
          hasObjKeys,
          index,
          isFunction = 'function' === typeof callbackOrValue
        resultCollector.results = u
        if (keys && obj_is(listOrObj)) {
          objKeys = keys(listOrObj)
          hasObjKeys = true
        }
        context = context || {}
        if (list_is(listOrObj) || objKeys) {
          x = (objKeys || listOrObj).length
          for (; i < x; i++) {
            index = i + Type.list.index
            if (isFunction) {
              result = hasObjKeys
                ? callbackOrValue.call(
                    context,
                    listOrObj[objKeys[i]],
                    objKeys[i],
                    resultCollector
                  )
                : callbackOrValue.call(
                    context,
                    listOrObj[i],
                    index,
                    resultCollector
                  )
              if (result !== u) {
                return result
              }
            } else {
              // If callbackOrValue is not a function, treat as value to find
              // TODO: implement deep equality testing
              if (callbackOrValue === listOrObj[hasObjKeys ? objKeys[i] : i]) {
                return hasObjKeys ? objKeys[i] : index
              }
            }
          }
        } else {
          for (i in listOrObj) {
            if (isFunction) {
              if (obj_has(listOrObj, i)) {
                result = context
                  ? callbackOrValue.call(
                      context,
                      listOrObj[i],
                      i,
                      resultCollector
                    )
                  : callbackOrValue(listOrObj[i], i, resultCollector)
                if (result !== u) {
                  return result
                }
              }
            } else {
              // TODO: implement deep equality testing
              if (callbackOrValue === listOrObj[i]) {
                return i
              }
            }
          }
        }
        return isFunction ? resultCollector.results : Type.list.index ? 0 : -1
      })
  })()
  Type.time = Type.time || {}
  Type.time.is =
    Type.time.is ||
    ((t) => {
      DEP('time')
      return t ? t instanceof Date : +Date.now()
    })

  const fn_is = Type.fn.is
  const list_is = Type.list.is
  const Val = {}
  Val.is = (v) => {
    DEP('val.is') // Valid values are a subset of JSON: null, binary, number (!Infinity), text, or a soul relation. Arrays need special algorithms to handle concurrency, so they are not supported directly. Use an extension that supports them if needed but research their problems first.
    if (v === u) {
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
  }
  Val.link = Val.rel = { _: '#' }
  ;(() => {
    Val.link.is = (v) => {
      DEP('val.link.is') // this defines whether an object is a soul relation or not, they look like this: {'#': 'UUID'}
      if (v?.[rel_] && !v._ && obj_is(v)) {
        // must be an object.
        const validationResult = {}
        obj_map(v, validateRelationProperty, validationResult)
        if (validationResult.id) {
          // we found an id.
          return validationResult.id // yay! Return it.
        }
      }
      return false // the value was not a valid soul relation.
    }
    // Ensure the object has exactly one property: the relation key with a string value
    function validateRelationProperty(value, key) {
      if (this.id !== undefined) {
        this.id = false
        return
      } // if ID is already defined AND we're still looping through the object, it is considered invalid.
      if (key === rel_ && text_is(value)) {
        // the key should be '#' and have a text value.
        this.id = value // we found the soul!
      } else {
        this.id = false // if there exists anything else on the object that isn't the soul, then it is considered invalid.
      }
    }
  })()
  Val.link.ify = (t) => {
    DEP('val.link.ify')
    return obj_put({}, rel_, t)
  } // convert a soul into a relation and return it.
  Type.obj.has._ = '.'
  const rel_ = Val.link._

  Type.val = Type.val || Val

  const Node = { _: '_' }
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
      // checks to see if an object is a valid node.
      if (!obj_is(n)) {
        return false
      } // must be an object.
      const soul = Node.soul(n)
      if (soul) {
        // must have a soul on it.
        return !obj_map(n, validateNodeValue, { as: as, cb: cb, n: n, s: soul })
      }
      return false // nope! This was not a valid node.
    }
    // Validate each property of the node
    function validateNodeValue(value, key) {
      if (key === Node._) {
        return
      } // skip over the metadata.
      if (!Val.is(value)) {
        return true
      } // it is true that this is an invalid node.
      if (this.cb) {
        this.cb.call(this.as, value, key, this.n, this.s)
      } // optionally callback each key/value.
    }
  })()
  ;(() => {
    Node.ify = (obj, options, as) => {
      DEP('node.ify') // returns a node from a shallow object.
      if (!options) {
        options = {}
      } else if (typeof options === 'string') {
        options = { soul: options }
      } else if ('function' === typeof options) {
        options = { map: options }
      }
      if (options.map) {
        options.node = options.map.call(as, obj, u, options.node || {})
      }
      options.node = Node.soul.ify(options.node || {}, options)
      if (options.node) {
        obj_map(obj, processObjectProperty, { as: as, o: options })
      }
      return options.node // This will only be a valid node if the object wasn't already deep!
    }
    // Process each property of the object to build the node
    function processObjectProperty(value, key) {
      const options = this.o
      let transformed
      if (options.map) {
        transformed = options.map.call(this.as, value, key, options.node)
        if (transformed === undefined) {
          obj_del(options.node, key)
        } else if (options.node) {
          options.node[key] = transformed
        }
        return
      }
      if (Val.is(value)) {
        options.node[key] = value
      }
    }
  })()
  const soul_ = Node.soul._
  const _u = undefined
  Type.node = Type.node || Node

  const State = Type.state
  State.lex = () => {
    DEP('state.lex')
    return State().toString(36).replace('.', '')
  }
  State.to = (from, k, to) => {
    DEP('state.to')
    let val = from?.[k]
    if (obj_is(val)) {
      val = obj_copy(val)
    }
    return State.ify(to, k, State.is(from, k), val, Node.soul(from))
  }
  ;(() => {
    State.map = (cb, s, as) => {
      DEP('state.map')
      const u = undefined
      const temp = cb || s
      const stateObj = obj_is(temp) ? temp : null
      cb = fn_is(temp) ? temp : null
      if (stateObj && !cb) {
        s = num_is(s) ? s : State()
        stateObj[N_] = stateObj[N_] || {}
        obj_map(stateObj, setKeyState, { o: stateObj, s: s })
        return stateObj
      }
      as = as || obj_is(s) ? s : u
      s = num_is(s) ? s : State()
      return function (v, k, o, opt) {
        if (!cb) {
          setKeyState.call({ o: o, s: s }, v, k)
          return v
        }
        cb.call(as || this || {}, v, k, o, opt)
        if (obj_has(o, k) && u === o[k]) {
          return
        }
        setKeyState.call({ o: o, s: s }, v, k)
      }
    }
    // Set state for the key if not metadata
    function setKeyState(_value, key) {
      if (key === N_) {
        return
      }
      State.ify(this.o, key, this.s)
    }
  })()
  const N_ = Node._

  const Graph = {}
  ;(() => {
    Graph.is = (g, cb, fn, as) => {
      DEP('graph.is') // checks to see if an object is a valid graph.
      if (!g || !obj_is(g) || obj_empty(g)) {
        return false
      } // must be an object.
      return !obj_map(g, validateGraphSoul, { as: as, cb: cb, fn: fn }) // makes sure it wasn't an empty object.
    }
    // Validate that each node in the graph is valid
    function validateGraphSoul(node, soul) {
      if (
        !node ||
        soul !== Node.soul(node) ||
        !Node.is(node, this.fn, this.as)
      ) {
        return true
      } // it is true that this is an invalid graph.
      if (!this.cb) {
        return
      }
      nodeValidator.n = node
      nodeValidator.as = this.as // sequential race conditions aren't races.
      this.cb.call(nodeValidator.as, node, soul, nodeValidator)
    }
    // Callback function for node validation
    function nodeValidator(callback) {
      if (callback) {
        Node.is(nodeValidator.n, callback, nodeValidator.as)
      }
    }
  })()
  ;(() => {
    Graph.ify = (obj, env, as) => {
      DEP('graph.ify')
      const context = { obj: obj, path: [] }
      if (!env) {
        env = {}
      } else if (typeof env === 'string') {
        env = { soul: env }
      } else if ('function' === typeof env) {
        env.map = env
      }
      if (typeof as === 'string') {
        env.soul = env.soul || as
        as = u
      }
      if (env.soul) {
        context.link = Val.link.ify(env.soul)
      }
      env.shell = as?.shell
      env.graph = env.graph || {}
      env.seen = env.seen || []
      env.as = env.as || as
      processGraphNode(env, context)
      env.root = context.node
      return env.graph
    }
    // Process a node in the object graph, handling cycles
    function processGraphNode(env, context) {
      const existing = findPreviouslySeenObject(env, context)
      if (existing) {
        return existing
      }
      context.env = env
      context.soul = updateNodeSoul
      if (Node.ify(context.obj, processGraphValue, context)) {
        context.link = context.link || Val.link.ify(Node.soul(context.node))
        if (context.obj !== env.shell) {
          env.graph[Val.link.is(context.link)] = context.node
        }
      }
      return context
    }
    // Process each value in the object, validating and linking
    function processGraphValue(v, k, n) {
      const env = this.env
      let isValid
      let tmp
      if (Node._ === k && obj_has(v, Val.link._)) {
        return n._ // TODO: Bug?
      }
      isValid = validateGraphValue(v, k, n, this, env)
      if (!isValid) {
        return
      }
      if (!k) {
        this.node = this.node || n || {}
        if (obj_has(v, Node._) && Node.soul(v)) {
          // ? for safety ?
          this.node._ = obj_copy(v._)
        }
        this.node = Node.soul.ify(this.node, Val.link.is(this.link))
        this.link = this.link || Val.link.ify(Node.soul(this.node))
      }
      tmp = env.map
      if (tmp) {
        tmp.call(env.as || {}, v, k, n, this)
        if (obj_has(n, k)) {
          v = n[k]
          if (u === v) {
            obj_del(n, k)
            return
          }

          isValid = validateGraphValue(v, k, n, this, env)
          if (!isValid) {
            return
          }
        }
      }
      if (!k) {
        return this.node
      }
      if (true === isValid) {
        return v
      }
      tmp = processGraphNode(env, { obj: v, path: this.path.concat(k) })
      if (!tmp.node) {
        return
      }
      return tmp.link //{'#': Node.soul(tmp.node)};
    }
    // Update the soul of the current context
    function updateNodeSoul(id) {
      const prev = Val.link.is(this.link),
        graph = this.env.graph
      this.link = this.link || Val.link.ify(id)
      this.link[Val.link._] = id
      if (this.node?.[Node._]) {
        this.node[Node._][Val.link._] = id
      }
      if (obj_has(graph, prev)) {
        graph[id] = graph[prev]
        obj_del(graph, prev)
      }
    }
    // Validate the value for inclusion in the graph
    function validateGraphValue(v, k, n, context, env) {
      let tmp
      if (Val.is(v)) {
        return true
      }
      if (obj_is(v)) {
        return 1
      }
      tmp = env.invalid
      if (tmp) {
        v = tmp.call(env.as || {}, v, k, n)
        return validateGraphValue(v, k, n, context, env)
      }
      env.err = `Invalid value at '${context.path.concat(k).join('.')}'!`
      if (Type.list.is(v)) {
        env.err += ' Use `.set(item)` instead of an Array.'
      }
    }
    // Find if the object has been seen before to avoid cycles
    function findPreviouslySeenObject(env, context) {
      let arr = env.seen,
        i = arr.length,
        has
      while (i--) {
        has = arr[i]
        if (context.obj === has.obj) {
          return has
        }
      }
      arr.push(context)
    }
  })()
  Graph.node = (node) => {
    DEP('graph.node')
    const soul = Node.soul(node)
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
      const obj = {}
      opt = opt || { seen: {} }
      obj_map(graph[root], convertGraphValue, {
        graph: graph,
        obj: obj,
        opt: opt
      })
      return obj
    }
    // Convert graph node back to object, resolving links recursively
    function convertGraphValue(value, key) {
      let linkId, resolved
      if (key === Node._) {
        if (obj_empty(value, Val.link._)) {
          return
        }
        this.obj[key] = obj_copy(value)
        return
      }
      linkId = Val.link.is(value)
      if (!linkId) {
        this.obj[key] = value
        return
      }
      resolved = this.opt.seen[linkId]
      if (resolved) {
        this.obj[key] = resolved
        return
      }
      this.obj[key] = this.opt.seen[linkId] = Graph.to(
        this.graph,
        linkId,
        this.opt
      )
    }
  })()
  Type.graph = Type.graph || Graph
})()
