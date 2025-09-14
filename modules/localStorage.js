;(function(){
	if (typeof Gun === 'undefined') return;

	var noop = function(){}, store, u;
	try {
		store = (Gun.window || noop).localStorage;
	} catch (e) {
		Gun.log("Warning: No localStorage exists to persist data to!");
		store = {
			setItem: function(k, v) { this[k] = v; },
			removeItem: function(k) { delete this[k]; },
			getItem: function(k) { return this[k]; }
		};
	}

	const parse = JSON.parseAsync || function(t, cb, r) {
		try {
			cb(undefined, JSON.parse(t, r));
		} catch (e) {
			cb(e);
		}
	};

	const json = JSON.stringifyAsync || function(v, cb, r, s) {
		try {
			cb(undefined, JSON.stringify(v, r, s));
		} catch (e) {
			cb(e);
		}
	};

	Gun.on('create', function lg(root) {
		this.to.next(root);
		const opt = root.opt;
		const graph = root.graph;
		let acks = [];
		let disk;
		let to;
		let size;
		let stop;

		if (opt.localStorage === false) return;

		opt.prefix = opt.file || 'gun/';
		try {
			disk = lg[opt.prefix] = lg[opt.prefix] || JSON.parse(size = store.getItem(opt.prefix)) || {};
		} catch (e) {
			disk = lg[opt.prefix] = {};
		}
		size = (size || '').length;

		root.on('get', function(msg) {
			this.to.next(msg);
			const lex = msg.get;
			if (!lex || !lex['#']) return;

			const soul = lex['#'];
			let data = disk[soul];
			if (data && lex['.'] && !Object.plain(lex['.'])) {
				data = Gun.state.ify({}, lex['.'], Gun.state.is(data, lex['.']), data[lex['.']], soul);
			}
			Gun.on.get.ack(msg, data);
		});

		root.on('put', function(msg) {
			this.to.next(msg);
			const put = msg.put;
			const soul = put['#'];
			const key = put['.'];
			const id = msg['#'];
			const ok = msg.ok || '';

			disk[soul] = Gun.state.ify(disk[soul], key, put['>'], put[':'], soul);
			if (stop && size > 4999880) {
				root.on('in', { '@': id, err: "localStorage max!" });
				return;
			}
			if (!msg['@'] && (!msg._.via || Math.random() < (ok['@'] / ok['/']))) {
				acks.push(id);
			}
			if (to) return;
			to = setTimeout(flush, 9 + (size / 333));
		});

		function flush() {
			if (!acks.length && ((setTimeout.turn || '').s || '').length) {
				setTimeout(flush, 99);
				return;
			}
			const ack = acks;
			clearTimeout(to);
			to = false;
			acks = [];
			json(disk, function(err, tmp) {
				try {
					if (!err) store.setItem(opt.prefix, tmp);
				} catch (e) {
					err = stop = e || "localStorage failure";
				}
				if (err) {
					Gun.log(`${err} Consider using GUN's IndexedDB plugin for RAD for more storage space, https://gun.eco/docs/RAD#install`);
					root.on('localStorage:error', { err, get: opt.prefix, put: disk });
				}
				size = tmp.length;
				setTimeout.each(ack, function(id) {
					root.on('in', { '@': id, err, ok: 0 });
				}, 0, 99);
			});
		}
	});

}());