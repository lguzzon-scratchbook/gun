; (() => {
	var u
	if ('' + u == typeof Gun) {
		return
	}
	var DEP = (n) => {
		console.log(
			'Warning! Deprecated internal utility will break in next version:',
			n
		)
	}
// Generic javascript utilities.
	var Type = Gun
	//Type.fns = Type.fn = {is: function(fn){ return (!!fn && fn instanceof Function) }}
	Type.fn = Type.fn || {
		is: (fn) => {
			DEP('fn')
			return !!fn && 'function' == typeof fn
		}
	}
	Type.bi = Type.bi || {
		is: (b) => {
			DEP('bi')
			return b instanceof Boolean || typeof b == 'boolean'
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
			return typeof t == 'string'
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
			return t && t.toString ? t.toString() : t
		})
	Type.text.random =
		Type.text.random ||
		((l, c) => {
			DEP('text.random')
			var s = ''
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
		((t, o) => {
			var tmp, u
			DEP('text.match')
			if ('string' !== typeof t) {
				return false
			}
		if ('string' == typeof o) {
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
		tmp = o['*'] || o['>'] || o['<']
		if (t.slice(0, (tmp || '').length) === tmp) {
			return true
		}
			if (u !== o['*']) {
				return false
			}
			if (u !== o['>'] && u !== o['<']) {
				return t >= o['>'] && t <= o['<'] ? true : false
			}
			if (u !== o['>'] && t >= o['>']) {
				return true
			}
			if (u !== o['<'] && t <= o['<']) {
				return true
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
			c = c || 0
			if (!s.length) {
				return c
			}
			for (var i = 0, l = s.length, n; i < l; ++i) {
				n = s.charCodeAt(i)
				c = (c << 5) - c + n
				c |= 0
			}
			return c
		})
	Type.list = Type.list || {
		is: (l) => {
			DEP('list')
			return l instanceof Array
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
	Type.obj = Type.boj || {
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
			return ((o || {})[k] = v), o
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
			return (o[k] = o[k] || (u === v ? {} : v))
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
			} catch (e) {
				o = {}
			}
			return o
		})
		; (() => {
			var u
			function map(v, k) {
				if (obj_has(this, k) && u !== this[k]) {
					return
				}
				this[k] = v
			}
			Type.obj.to =
				Type.obj.to ||
				((from, to) => {
					DEP('obj.to')
					to = to || {}
					obj_map(from, map, to)
					return to
				})
		})()
	Type.obj.copy =
		Type.obj.copy ||
		((o) => {
			DEP('obj.copy') // because http://web.archive.org/web/20140328224025/http://jsperf.com/cloning-an-object/2
			return !o ? o : JSON.parse(JSON.stringify(o)) // is shockingly faster than anything else, and our data has to be a subset of JSON anyways!
		})
		; (() => {
			function empty(v, i) {
				var n = this.n,
					u
				if (n && (i === n || (obj_is(n) && obj_has(n, i)))) {
					return
				}
				if (u !== i) {
					return true
				}
			}
			Type.obj.empty =
				Type.obj.empty ||
				((o, n) => {
					DEP('obj.empty')
					if (!o) {
						return true
					}
					return obj_map(o, empty, { n: n }) ? false : true
				})
		})()
		; (() => {
			function t(k, v) {
				if (2 === arguments.length) {
					t.r = t.r || {}
					t.r[k] = v
					return
				}
				t.r = t.r || []
				t.r.push(k)
			}
			var keys = Object.keys,
				map,
				u
			Object.keys =
				Object.keys ||
				((o) =>
					map(o, (v, k, t) => {
						t(k)
					}))
			Type.obj.map = map =
				Type.obj.map ||
				((l, c, _) => {
					DEP('obj.map')
					var u,
						i = 0,
						x,
						r,
						ll,
						lle,
						f = 'function' == typeof c
					t.r = u
					if (keys && obj_is(l)) {
						ll = keys(l)
						lle = true
					}
					_ = _ || {}
					if (list_is(l) || ll) {
						x = (ll || l).length
						for (; i < x; i++) {
							var ii = i + Type.list.index
							if (f) {
								r = lle ? c.call(_, l[ll[i]], ll[i], t) : c.call(_, l[i], ii, t)
								if (r !== u) {
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
								if (r !== u) {
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
			})
	})()
	Type.time = Type.time || {}
	Type.time.is =
		Type.time.is ||
		((t) => {
			DEP('time')
			return t ? t instanceof Date : Date.now().getTime()
		})

	var fn_is = Type.fn.is
	var list_is = Type.list.is
	var obj = Type.obj,
		obj_is = obj.is,
		obj_has = obj.has,
		obj_map = obj.map

	var Val = {}
	// Valid values are a subset of JSON: null, binary, number (!Infinity), text,
	// or a soul relation. Arrays need special algorithms to handle concurrency,
	// so they are not supported directly. Use an extension that supports them if
	// needed but research their problems first.
	Val.is = (v) => {
		DEP('val.is')
	// "deletes", nulling out keys.
		return (
			v === null ||
			'string' === typeof v ||
			'boolean' === typeof v ||
		// we want +/- Infinity to be, but JSON does not support it, sad face.
		// can you guess what v === v checks for? ;)
			('number' === typeof v && v != Infinity && v != -Infinity && v === v) ||
			(!!v &&
				'string' == typeof v['#'] &&
				Object.keys(v).length === 1 &&
				v['#'])
		)
	}
	Val.link = Val.rel = { _: '#' }
		; (() => {
			Val.link.is = (v) => {
				DEP('val.link.is') // this defines whether an object is a soul relation or not, they look like this: {'#': 'UUID'}
				if (v && v[rel_] && !v._ && obj_is(v)) {
					// must be an object.
					var o = {}
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
				return (this.id = false)
			} // if ID is already defined AND we're still looping through the object, it is considered invalid.
			if (k == rel_ && text_is(s)) {
				// the key should be '#' and have a text value.
				this.id = s // we found the soul!
			} else {
				return (this.id = false) // if there exists anything else on the object that isn't the soul, then it is considered invalid.
			}
		}
	})()
	Val.link.ify = (t) => {
		DEP('val.link.ify')
		return obj_put({}, rel_, t)
	} // convert a soul into a relation and return it.
	Type.obj.has._ = '.'
	var rel_ = Val.link._,
		u
	var bi_is = Type.bi.is
	var num_is = Type.num.is
	var text_is = Type.text.is
	var obj = Type.obj,
		obj_is = obj.is,
		obj_put = obj.put,
		obj_map = obj.map

	Type.val = Type.val || Val

	var Node = { _: '_' }
	Node.soul = (n, o) => {
		DEP('node.soul')
		return n && n._ && n._[o || soul_]
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
		; (() => {
			Node.is = (n, cb, as) => {
				DEP('node.is')
				var s // checks to see if an object is a valid node.
				if (!obj_is(n)) {
					return false
				} // must be an object.
				if ((s = Node.soul(n))) {
					// must have a soul on it.
					return !obj_map(n, map, { as: as, cb: cb, n: n, s: s })
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
		; (() => {
			Node.ify = (obj, o, as) => {
				DEP('node.ify') // returns a node from a shallow object.
				if (!o) {
					o = {}
				} else if (typeof o === 'string') {
					o = { soul: o }
				} else if ('function' == typeof o) {
					o = { map: o }
				}
			if (o.map) {
				o.node = o.map.call(as, obj, u, o.node || {})
			}
			if ((o.node = Node.soul.ify(o.node || {}, o))) {
				obj_map(obj, map, { as: as, o: o })
			}
			return o.node // This will only be a valid node if the object wasn't already deep!
		}
		function map(v, k) {
			var o = this.o,
				tmp,
				u // iterate over each key/value.
			if (o.map) {
				tmp = o.map.call(this.as, v, '' + k, o.node)
				if (u === tmp) {
					obj_del(o.node, k)
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
	var obj = Type.obj,
		obj_is = obj.is,
		obj_del = obj.del,
		obj_map = obj.map
	var text = Type.text,
		text_random = text.random
	var soul_ = Node.soul._
	var u
	Type.node = Type.node || Node

	var State = Type.state
	State.lex = () => {
		DEP('state.lex')
		return State().toString(36).replace('.', '')
	}
	State.to = (from, k, to) => {
		DEP('state.to')
		var val = (from || {})[k]
		if (obj_is(val)) {
			val = obj_copy(val)
		}
		return State.ify(to, k, State.is(from, k), val, Node.soul(from))
	}
		; (() => {
			State.map = (cb, s, as) => {
				DEP('state.map')
				var u // for use with Node.ify
				var o = obj_is((o = cb || s)) ? o : null
				cb = fn_is((cb = cb || s)) ? cb : null
				if (o && !cb) {
					s = num_is(s) ? s : State()
					o[N_] = o[N_] || {}
					obj_map(o, map, { o: o, s: s })
					return o
				}
			as = as || obj_is(s) ? s : u
			s = num_is(s) ? s : State()
			return function (v, k, o, opt) {
				if (!cb) {
					map.call({ o: o, s: s }, v, k)
					return v
				}
				cb.call(as || this || {}, v, k, o, opt)
				if (obj_has(o, k) && u === o[k]) {
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
	var obj = Type.obj,
		obj_as = obj.as,
		obj_has = obj.has,
		obj_is = obj.is,
		obj_map = obj.map,
		obj_copy = obj.copy
	var num = Type.num,
		num_is = num.is
	var fn = Type.fn,
		fn_is = fn.is
	var N_ = Node._,
		u

	var Graph = {}
		; (() => {
			Graph.is = (g, cb, fn, as) => {
				DEP('graph.is') // checks to see if an object is a valid graph.
				if (!g || !obj_is(g) || obj_empty(g)) {
					return false
				} // must be an object.
				return !obj_map(g, map, { as: as, cb: cb, fn: fn }) // makes sure it wasn't an empty object.
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
		; (() => {
			Graph.ify = (obj, env, as) => {
				DEP('graph.ify')
				var at = { obj: obj, path: [] }
				if (!env) {
					env = {}
				} else if (typeof env === 'string') {
					env = { soul: env }
				} else if ('function' == typeof env) {
					env.map = env
				}
				if (typeof as === 'string') {
					env.soul = env.soul || as
					as = u
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
				if ((tmp = seen(env, at))) {
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
				var env = this.env,
					is,
					tmp
				if (Node._ === k && obj_has(v, Val.link._)) {
					return n._ // TODO: Bug?
				}
			if (!(is = valid(v, k, n, this, env))) {
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
			if ((tmp = env.map)) {
				tmp.call(env.as || {}, v, k, n, this)
				if (obj_has(n, k)) {
					v = n[k]
					if (u === v) {
						obj_del(n, k)
						return
					}
					if (!(is = valid(v, k, n, this, env))) {
						return
					}
				}
			}
			if (!k) {
				return this.node
			}
			if (true === is) {
				return v
			}
			tmp = node(env, { obj: v, path: this.path.concat(k) })
			if (!tmp.node) {
				return
			}
			return tmp.link //{'#': Node.soul(tmp.node)};
		}
		function soul(id) {

			var prev = Val.link.is(this.link),
				graph = this.env.graph
			this.link = this.link || Val.link.ify(id)
			this.link[Val.link._] = id
			if (this.node && this.node[Node._]) {
				this.node[Node._][Val.link._] = id
			}
			if (obj_has(graph, prev)) {
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
			if ((tmp = env.invalid)) {
				v = tmp.call(env.as || {}, v, k, n)
				return valid(v, k, n, at, env)
			}
			env.err = "Invalid value at '" + at.path.concat(k).join('.') + "'!"
			if (Type.list.is(v)) {
				env.err += ' Use `.set(item)` instead of an Array.'
			}
		}
		function seen(env, at) {
			var arr = env.seen,
				i = arr.length,
				has
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
		; (() => {
			Graph.to = (graph, root, opt) => {
				DEP('graph.to')
				if (!graph) {
					return
				}
			var obj = {}
			opt = opt || { seen: {} }
			obj_map(graph[root], map, { graph: graph, obj: obj, opt: opt })
			return obj
		}
		function map(v, k) {
			var tmp, obj
			if (Node._ === k) {
				if (obj_empty(v, Val.link._)) {
					return
				}
				this.obj[k] = obj_copy(v)
				return
			}
			if (!(tmp = Val.link.is(v))) {
				this.obj[k] = v
				return
			}
			if ((obj = this.opt.seen[tmp])) {
				this.obj[k] = obj
				return
			}
			this.obj[k] = this.opt.seen[tmp] = Graph.to(this.graph, tmp, this.opt)
		}
	})()
	var fn_is = Type.fn.is
	var obj = Type.obj,
		obj_is = obj.is,
		obj_del = obj.del,
		obj_has = obj.has,
		obj_empty = obj.empty,
		obj_put = obj.put,
		obj_map = obj.map,
		obj_copy = obj.copy
	var u
	Type.graph = Type.graph || Graph
})()
