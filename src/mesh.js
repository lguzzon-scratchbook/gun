;(()=> {

	require('./shim')

	const noop = () => { }

	const parse = JSON.parseAsync || ((t, cb, r) => {
		let u
		const d = +new Date
		try {
			cb(u, JSON.parse(t, r), json.sucks(+new Date - d))
		} catch (e) {
			cb(e)
		}
	})

	const json = JSON.stringifyAsync || ((v, cb, r, s) => {
		let u
		const d = +new Date
		try {
			cb(u, JSON.stringify(v, r, s), json.sucks(+new Date - d))
		} catch (e) {
			cb(e)
		}
	})

	json.sucks = (d) => {
		if (d > 99) {
			console.log("Warning: JSON blocking CPU detected. Add `gun/lib/yson.js` to fix.")
			json.sucks = noop
		}
	}

	function Mesh(root) {
		const mesh = () => { }
		const opt = root.opt || {}
		opt.log = opt.log || console.log
		opt.gap = opt.gap || opt.wait || 0
		opt.max = opt.max || (opt.memory ? (opt.memory * 999 * 999) : 300000000) * 0.3
		opt.pack = opt.pack || (opt.max * 0.01 * 0.01)
		opt.puff = opt.puff || 9

		const puff = setTimeout.turn || setTimeout

		const dup = root.dup
		const dup_check = dup.check
		const dup_track = dup.track

		const ST = +new Date
		const LT = ST

		const hear = mesh.hear = function (raw, peer) {
			if (!raw) return
			if (opt.max <= raw.length) {
				return mesh.say({ dam: '!', err: "Message too big!" }, peer)
			}
			if (mesh === this) {
				hear.d += raw.length || 0
				++hear.c
			}
			const S = peer.SH = +new Date
			const tmp = raw[0]
			let msg

			if ('[' === tmp) {
				parse(raw, (err, msg) => {
					if (err || !msg) return mesh.say({ dam: '!', err: "DAM JSON parse error." }, peer)
					console.STAT && console.STAT(+new Date, msg.length, '# on hear batch')
					const P = opt.puff;
					(function go() {
						const S = +new Date
						let i = 0, m
						while (i < P && (m = msg[i++])) {
							mesh.hear(m, peer)
						}
						msg = msg.slice(i)
						console.STAT && console.STAT(S, +new Date - S, 'hear loop')
						flush(peer)
						if (!msg.length) return
						puff(go, 0)
					})()
				})
				raw = ''
				return
			}

			if ('{' === tmp || ((raw['#'] || Object.plain(raw)) && (msg = raw))) {
				if (msg) return hear.one(msg, peer, S)
				parse(raw, (err, msg) => {
					if (err || !msg) return mesh.say({ dam: '!', err: "DAM JSON parse error." }, peer)
					hear.one(msg, peer, S)
				})
				return
			}
		}

		hear.one = (msg, peer, S) => {
			let id, hash, tmp, ash, DBG
			if (msg.DBG) msg.DBG = DBG = { DBG: msg.DBG }
			DBG && (DBG.h = S)
			DBG && (DBG.hp = +new Date)
			if (!(id = msg['#'])) id = msg['#'] = String.random(9)
			if ((tmp = dup_check(id))) return
			if (!(hash = msg['##']) && false && u !== msg.put) { }
			if (hash && (tmp = msg['@'] || (msg.get && id)) && dup.check(ash = tmp + hash)) return;
			(msg._ = () => { }).via = mesh.leap = peer
			if ((tmp = msg['><']) && typeof tmp === 'string') {
				tmp.slice(0, 99).split(',').forEach(function (k) { this[k] = 1 }, (msg._).yo = {})
			}
			if (tmp = msg.dam) {
				(dup_track(id) || {}).via = peer
				if (tmp = mesh.hear[tmp]) tmp(msg, peer, root)
				return
			}
			if (tmp = msg.ok) msg._.near = tmp['/']
			const SS = +new Date
			DBG && (DBG.is = SS); peer.SI = id
			dup_track.ed = (d) => {
				if (id !== d) return
				dup_track.ed = 0
				if (!(d = dup.s[id])) return
				d.via = peer
				if (msg.get) d.it = msg
			}
			root.on('in', mesh.last = msg)
			DBG && (DBG.hd = +new Date)
			console.STAT && console.STAT(SS, +new Date - SS, msg.get ? 'msg get' : msg.put ? 'msg put' : 'msg')
			dup_track(id)
			if (ash) dup_track(ash)
			mesh.leap = mesh.last = null
		}

		const tomap = (k, i, m) => { m(k, true) }
		hear.c = hear.d = 0;

		(() => {
			let SMIA = 0
			let loop

			mesh.hash = (msg, peer) => {
				let h, s, t
				const S = +new Date
				json(msg.put, function hash(err, text) {
					const ss = (s || (s = t = text || '')).slice(0, 32768)
					h = String.hash(ss, h)
					s = s.slice(32768)
					if (s) { puff(hash, 0); return }
					console.STAT && console.STAT(S, +new Date - S, 'say json+hash')
					msg._.$put = t
					msg['##'] = h
					mesh.say(msg, peer)
					delete msg._.$put
				}, sort)
			}

			function sort(k, v) {
				let tmp
				if (!(v instanceof Object)) return v
				Object.keys(v).sort().forEach(sorta, { to: tmp = {}, on: v })
				return tmp
			}
			function sorta(k) { this.to[k] = this.on[k] }

			mesh.say = function (msg, peer) {
				let tmp
				if ((tmp = this) && (tmp = tmp.to) && tmp.next) tmp.next(msg)
				if (!msg) return false
				let id, hash, raw, ack = msg['@']
				const meta = msg._ || (msg._ = () => { })
				const DBG = msg.DBG
				const S = +new Date
				meta.y = meta.y || S
				if (!peer) { DBG && (DBG.y = S) }
				if (!(id = msg['#'])) id = msg['#'] = String.random(9)
				!loop && dup_track(id)
				if (!(hash = msg['##']) && u !== msg.put && !meta.via && ack) { mesh.hash(msg, peer); return }
				if (!peer && ack) {
					peer = ((tmp = dup.s[ack]) && (tmp.via || ((tmp = tmp.it) && (tmp = tmp._) && tmp.via)))
						|| ((tmp = mesh.last) && ack === tmp['#'] && mesh.leap)
				}
				if (!peer && ack) {
					if (dup.s[ack]) return
					console.STAT && console.STAT(+new Date, ++SMIA, 'total no peer to ack to')
					return false
				}
				if (ack && !msg.put && !hash && ((dup.s[ack] || '').it || '')['##']) return false
				if (!peer && mesh.way) return mesh.way(msg)
				DBG && (DBG.yh = +new Date)
				if (!(raw = meta.raw)) { mesh.raw(msg, peer); return }
				DBG && (DBG.yr = +new Date)

				if (!peer || !peer.id) {
					if (!Object.plain(peer || opt.peers)) return false
					const SS = +new Date
					const P = opt.puff, ps = opt.peers, pl = Object.keys(peer || opt.peers || {})
					console.STAT && console.STAT(SS, +new Date - SS, 'peer keys');
					(function go() {
						const SS = +new Date
						loop = 1
						const wr = meta.raw
						meta.raw = raw
						let i = 0, p
						while (i < 9 && (p = (pl || '')[i++])) {
							if (!(p = ps[p] || (peer || '')[p])) continue
							mesh.say(msg, p)
						}
						meta.raw = wr
						loop = 0
						pl = pl.slice(i)
						console.STAT && console.STAT(SS, +new Date - SS, 'say loop')
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
				if ((tmp = meta.yo) && (tmp[peer.url] || tmp[peer.pid] || tmp[peer.id])) return false
				console.STAT && console.STAT(S, ((DBG || meta).yp = +new Date) - (meta.y || S), 'say prep')
				!loop && ack && dup_track(ack)

				if (peer.batch) {
					peer.tail = (tmp = peer.tail || 0) + raw.length
					if (peer.tail <= opt.pack) {
						peer.batch += (tmp ? ',' : '') + raw
						return
					}
					flush(peer)
				}

				peer.batch = '['
				const ST = +new Date
				setTimeout(() => {
					console.STAT && console.STAT(ST, +new Date - ST, '0ms TO')
					flush(peer)
				}, opt.gap)
				send(raw, peer)
				console.STAT && (ack === peer.SI) && console.STAT(S, +new Date - peer.SH, 'say ack')
			}

			mesh.say.c = mesh.say.d = 0

			mesh.raw = (msg, peer) => {
				if (!msg) return ''
				const meta = msg._ || {}
				let put, tmp
				if (tmp = meta.raw) return tmp
				if (typeof msg === 'string') return msg
				const hash = msg['##'], ack = msg['@']

				if (hash && ack) {
					if (!meta.via && dup_check(ack + hash)) return false
					if (tmp = (dup.s[ack] || '').it) {
						if (hash === tmp['##']) return false
						if (!tmp['##']) tmp['##'] = hash
					}
				}

				if (!msg.dam && !msg['@']) {
					let i = 0
					const to = []
					tmp = opt.peers
					for (const k in tmp) {
						const p = tmp[k]
						to.push(p.url || p.pid || p.id)
						if (++i > 6) break
					}
					if (i > 1) msg['><'] = to.join()
				}

				if (msg.put && (tmp = msg.ok)) {
					msg.ok = { '@': (tmp['@'] || 1) - 1, '/': (tmp['/'] === msg._.near) ? mesh.near : tmp['/'] }
				}

				if (put = meta.$put) {
					tmp = {}
					Object.keys(msg).forEach((k) => { tmp[k] = msg[k] })
					tmp.put = ':])([:'
					json(tmp, (err, raw) => {
						if (err) return
						const S = +new Date
						tmp = raw.indexOf('"put":":])([:"')
						res(u, raw = raw.slice(0, tmp + 6) + put + raw.slice(tmp + 14))
						console.STAT && console.STAT(S, +new Date - S, 'say slice')
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
					tmp = (tmp.length === 1 ? tmp[0] : JSON.stringify(tmp))
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
			} catch (e) {
				(peer.queue = peer.queue || []).push(raw)
			}
		}

		mesh.near = 0
		mesh.hi = (peer) => {
			const wire = peer.wire
			let tmp
			if (!wire) {
				mesh.wire((peer.length && { url: peer, id: peer }) || peer)
				return
			}
			if (peer.id) {
				opt.peers[peer.url || peer.id] = peer
			} else {
				tmp = peer.id = peer.id || peer.url || String.random(9)
				mesh.say({ dam: '?', pid: root.opt.pid }, opt.peers[tmp] = peer)
				delete dup.s[peer.last]
			}
			if (!peer.met) {
				mesh.near++
				peer.met = +new Date
				root.on('hi', peer)
			}
			tmp = peer.queue
			peer.queue = []
			setTimeout.each(tmp || [], (msg) => {
				send(msg, peer)
			}, 0, 9)
		}

		mesh.bye = (peer) => {
			peer.met && --mesh.near
			delete peer.met
			root.on('bye', peer)
			let tmp = +new Date
			tmp = (tmp - (peer.met || tmp))
			mesh.bye.time = ((mesh.bye.time || tmp) + tmp) / 2
		}

		mesh.hear['!'] = (msg, peer) => { opt.log('Error:', msg.err) }
		mesh.hear['?'] = (msg, peer) => {
			if (msg.pid) {
				if (!peer.pid) peer.pid = msg.pid
				if (msg['@']) return
			}
			mesh.say({ dam: '?', pid: opt.pid, '@': msg['#'] }, peer)
			delete dup.s[peer.last]
		}

		mesh.hear['mob'] = (msg, peer) => {
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
			peer.bye ? peer.bye() : (tmp = peer.wire) && tmp.close && tmp.close()
			delete opt.peers[peer.id]
			peer.wire = null
		})

		const gets = {}
		root.on('bye', function (peer, tmp) {
			this.to.next(peer)
			if (tmp = console.STAT) tmp.peers = mesh.near
			if (!(tmp = peer.url)) return
			gets[tmp] = true
			setTimeout(() => { delete gets[tmp] }, opt.lack || 9000)
		})

		root.on('hi', function (peer, tmp) {
			this.to.next(peer)
			if (tmp = console.STAT) tmp.peers = mesh.near
			if (opt.super) return
			const souls = Object.keys(root.next || '')
			if (souls.length > 9999 && !console.SUBS) {
				console.log(console.SUBS = "Warning: You have more than 10K live GETs...")
			}
			setTimeout.each(souls, (soul) => {
				const node = root.next[soul]
				if (opt.super || (node.ask || '')['']) {
					mesh.say({ get: { '#': soul } }, peer)
					return
				}
				setTimeout.each(Object.keys(node.ask || ''), (key) => {
					if (!key) return
					mesh.say({ '##': String.hash((root.graph[soul] || '')[key]), get: { '#': soul, '.': key } }, peer)
				})
			})
		})

		return mesh
	}

	try { module.exports = Mesh } catch (e) { }
	
})();