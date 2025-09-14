const { text_rand, match, hash, poll, turn, each } = require('./shim.js');

module.exports = function(Gun){
;(function(){
			/**
			 * Creates the internal Gun instance with event handlers.
			 * @param {Object} context - The Gun context.
			 * @returns {Object} The Gun chain.
			 */
			Gun.create = function(context){
				context.root = context.root || context;
				context.graph = context.graph || {}; // In-memory graph
				context.on = context.on || Gun.on; // Event emitter
				context.ask = context.ask || Gun.ask; // Request handler
				context.dup = context.dup || Gun.dup(); // Duplication tracker
				var chain = context.$.opt(context.opt);
				if(!context.once){
					context.on('in', universe, context); // Incoming messages
					context.on('out', universe, context); // Outgoing messages
					context.on('put', map, context); // Put operations
					Gun.on('create', context); // Global create event
					context.on('create', context); // Local create event
				}
				context.once = 1;
				return chain;
			}
			/**
			 * Main message processing function for incoming/outgoing messages.
			 * Handles deduplication, routing, and event emission.
			 * @param {Object} message - The message to process.
			 */
			function universe(message){
				// TODO: BUG! message.out = null being set!
				//if(!F){ var eve = this; setTimeout(function(){ universe.call(eve, message,1) },Math.random() * 100);return; } // ADD F TO PARAMS!
				if(!message){ return }
				if(message.out === universe){ this.to.next(message); return }
				var event = this, context = event.as, instance = context.at || context, gunInstance = instance.$, dupTracker = instance.dup, temp, debug = message.DBG;
				(temp = message['#']) || (temp = message['#'] = text_rand(9));
				if(dupTracker.check(temp)){ return } dupTracker.track(temp);
				temp = message._; message._ = ('function' == typeof temp)? temp : function(){};
				(message.$ && (message.$ === (message.$._||'').$)) || (message.$ = gunInstance);
				if(message['@'] && !message.put){ ack(message) }
				if(!instance.ask(message['@'], message)){ // is this machine listening for an ack?
					debug && (debug.u = +new Date);
					if(message.put){ put(message); return } else
					if(message.get){ Gun.on.get(message, gunInstance) }
				}
				debug && (debug.uc = +new Date);
				event.to.next(message);
				debug && (debug.ua = +new Date);
				if(message.nts || message.NTS){ return } // TODO: This shouldn't be in core, but fast way to prevent NTS spread. Delete this line after all peers have upgraded to newer versions.
				message.out = universe; instance.on('out', message);
				debug && (debug.ue = +new Date);
			}
			function put(msg){
				if(!msg){ return }
				var ctx = msg._||'', root = ctx.root = ((ctx.$ = msg.$||'')._||'').root;
				if(msg['@'] && ctx.faith && !ctx.miss){ // TODO: AXE may split/route based on 'put' what should we do here? Detect @ in AXE? I think we don't have to worry, as DAM will route it on @.
					msg.out = universe;
					root.on('out', msg);
					return;
				}
				ctx.latch = root.hatch; ctx.match = root.hatch = [];
				var put = msg.put;
				var DBG = ctx.DBG = msg.DBG, S = +new Date; CT = CT || S;
				if(put['#'] && put['.']){ /*root && root.on('put', msg);*/ return } // TODO: BUG! This needs to call HAM instead.
				DBG && (DBG.p = S);
				ctx['#'] = msg['#'];
				ctx.msg = msg;
				ctx.all = 0;
				ctx.stun = 1;
				var nl = Object.keys(put);//.sort(); // TODO: This is unbounded operation, large graphs will be slower. Write our own CPU scheduled sort? Or somehow do it in below? Keys itself is not O(1) either, create ES5 shim over ?weak map? or custom which is constant.
				console.STAT && console.STAT(S, ((DBG||ctx).pk = +new Date) - S, 'put sort');
				var ni = 0, nj, kl, soul, node, states, err, tmp;
				(function pop(o){
					if(nj != ni){ nj = ni;
						if(!(soul = nl[ni])){
							console.STAT && console.STAT(S, ((DBG||ctx).pd = +new Date) - S, 'put');
							fire(ctx);
							return;
						}
						if(!(node = put[soul])){ err = ERR+cut(soul)+"no node." } else
						if(!(tmp = node._)){ err = ERR+cut(soul)+"no meta." } else
						if(soul !== tmp['#']){ err = ERR+cut(soul)+"soul not same." } else
						if(!(states = tmp['>'])){ err = ERR+cut(soul)+"no state." }
						kl = Object.keys(node||{}); // TODO: .keys( is slow
					}
					if(err){
						msg.err = ctx.err = err; // invalid data should error and stun the message.
						fire(ctx);
						//console.log("handle error!", err) // handle!
						return;
					}
					var i = 0, key; o = o || 0;
					while(o++ < 9 && (key = kl[i++])){
						if('_' === key){ continue }
						var val = node[key], state = states[key];
						if(u === state){ err = ERR+cut(key)+"on"+cut(soul)+"no state."; break }
						if(!valid(val)){ err = ERR+cut(key)+"on"+cut(soul)+"bad "+(typeof val)+cut(val); break }
						//ctx.all++; //ctx.ack[soul+key] = '';
						ham(val, key, soul, state, msg);
						++C; // courtesy count;
					}
					if((kl = kl.slice(i)).length){ turn(pop); return }
					++ni; kl = null; pop(o);
				}());
			} Gun.on.put = put;
			// TODO: MARK!!! clock below, reconnect sync, SEA certify wire merge, User.auth taking multiple times, // msg put, put, say ack, hear loop...
			// WASIS BUG! local peer not ack. .off other people: .open
			function ham(val, key, soul, state, msg){
				var ctx = msg._||'', root = ctx.root, graph = root.graph, lot, tmp;
				var vertex = graph[soul] || empty, was = state_is(vertex, key, 1), known = vertex[key];
				
				var DBG = ctx.DBG; if(tmp = console.STAT){ if(!graph[soul] || !known){ tmp.has = (tmp.has || 0) + 1 } }

				var now = State(), u;
				if(state > now){
					setTimeout(function(){ ham(val, key, soul, state, msg) }, (tmp = state - now) > MD? MD : tmp); // Max Defer 32bit. :(
					console.STAT && console.STAT(((DBG||ctx).Hf = +new Date), tmp, 'future');
					return;
				}
				if(state < was){ /*old;*/ if(true || !ctx.miss){ return } } // but some chains have a cache miss that need to re-fire. // TODO: Improve in future. // for AXE this would reduce rebroadcast, but GUN does it on message forwarding. // TURNS OUT CACHE MISS WAS NOT NEEDED FOR NEW CHAINS ANYMORE!!! DANGER DANGER DANGER, ALWAYS RETURN! (or am I missing something?)
				if(!ctx.faith){ // TODO: BUG? Can this be used for cache miss as well? // Yes this was a bug, need to check cache miss for RAD tests, but should we care about the faith check now? Probably not.
					if(state === was && (val === known || L(val) <= L(known))){ /*console.log("same");*/ /*same;*/ if(!ctx.miss){ return } } // same
				}
				ctx.stun++; // TODO: 'forget' feature in SEA tied to this, bad approach, but hacked in for now. Any changes here must update there.
				var aid = msg['#']+ctx.all++, id = {toString: function(){ return aid }, _: ctx}; id.toJSON = id.toString; // this *trick* makes it compatible between old & new versions.
				root.dup.track(id)['#'] = msg['#']; // fixes new OK acks for RPC like RTC.
				DBG && (DBG.ph = DBG.ph || +new Date);
				root.on('put', {'#': id, '@': msg['@'], put: {'#': soul, '.': key, ':': val, '>': state}, ok: msg.ok, _: ctx});
			}
			function map(msg){
				var DBG; if(DBG = (msg._||'').DBG){ DBG.pa = +new Date; DBG.pm = DBG.pm || +new Date}
      	var eve = this, root = eve.as, graph = root.graph, ctx = msg._, put = msg.put, soul = put['#'], key = put['.'], val = put[':'], state = put['>'], id = msg['#'], tmp;
      	if((tmp = ctx.msg) && (tmp = tmp.put) && (tmp = tmp[soul])){ state_ify(tmp, key, state, val, soul) } // necessary! or else out messages do not get SEA transforms.
      	//var bytes = ((graph[soul]||'')[key]||'').length||1;
				graph[soul] = state_ify(graph[soul], key, state, val, soul);
				if(tmp = (root.next||'')[soul]){
					//tmp.bytes = (tmp.bytes||0) + ((val||'').length||1) - bytes;
					//if(tmp.bytes > 2**13){ Gun.log.once('byte-limit', "Note: In the future, GUN peers will enforce a ~4KB query limit. Please see https://gun.eco/docs/Page") }
					tmp.on('in', msg)
				}
				fire(ctx);
				eve.to.next(msg);
			}
			function fire(ctx, msg){ var root;
				if(ctx.stop){ return }
				if(!ctx.err && 0 < --ctx.stun){ return } // TODO: 'forget' feature in SEA tied to this, bad approach, but hacked in for now. Any changes here must update there.
				ctx.stop = 1;
				if(!(root = ctx.root)){ return }
				var tmp = ctx.match; tmp.end = 1;
				if(tmp === root.hatch){ if(!(tmp = ctx.latch) || tmp.end){ delete root.hatch } else { root.hatch = tmp } }
				ctx.hatch && ctx.hatch(); // TODO: rename/rework how put & this interact.
				each(ctx.match, function(cb){cb && cb()}); 
				if(!(msg = ctx.msg) || ctx.err || msg.err){ return }
				msg.out = universe;
				ctx.root.on('out', msg);

				CF(); // courtesy check;
			}
			function ack(msg){ // aggregate ACKs.
				var id = msg['@'] || '', ctx, ok, tmp;
				if(!(ctx = id._)){
					var dup = (dup = msg.$) && (dup = dup._) && (dup = dup.root) && (dup = dup.dup);
					if(!(dup = dup.check(id))){ return }
					msg['@'] = dup['#'] || msg['@']; // This doesn't do anything anymore, backtrack it to something else?
					return;
				}
				ctx.acks = (ctx.acks||0) + 1;
				if(ctx.err = msg.err){
					msg['@'] = ctx['#'];
					fire(ctx); // TODO: BUG? How it skips/stops propagation of msg if any 1 item is error, this would assume a whole batch/resync has same malicious intent.
				}
				ctx.ok = msg.ok || ctx.ok;
				if(!ctx.stop && !ctx.crack){ ctx.crack = ctx.match && ctx.match.push(function(){back(ctx)}) } // handle synchronous acks. NOTE: If a storage peer ACKs synchronously then the PUT loop has not even counted up how many items need to be processed, so ctx.STOP flags this and adds only 1 callback to the end of the PUT loop.
				back(ctx);
			}
			function back(ctx){
				if(!ctx || !ctx.root){ return }
				if(ctx.stun || ctx.acks !== ctx.all){ return }
				ctx.root.on('in', {'@': ctx['#'], err: ctx.err, ok: ctx.err? u : ctx.ok || {'':1}});
			}

			var ERR = "Error: Invalid graph!";
			var cut = function(s){ return " '"+(''+s).slice(0,9)+"...' " }
			var L = JSON.stringify, MD = 2147483647, State = Gun.state;
			var C = 0, CT, CF = function(){if(C>999 && (C/-(CT - (CT = +new Date))>1)){Gun.window && console.log("Warning: You're syncing 1K+ records a second, faster than DOM can update - consider limiting query.");CF=function(){C=0}}};

		}());
		var valid = Gun.valid, state_is = Gun.state.is, state_ify = Gun.state.ify, u, empty = {};
};