module.exports = function(Gun){

	const { text_rand } = require('./shim.js');

	Gun.chain.on = function(tag, arg, eas, as){
		const gun = this;
		const cat = gun._;
		
		if(typeof tag === 'string'){
			if(!arg) return cat.on(tag);
			const act = cat.on(tag, arg, eas || cat, as);
			if(eas?.$){
				(eas.subs ||= []).push(act);
			}
			return gun;
		}

		const opt = typeof arg === 'object' ? arg : {change: true};
		opt.not = 1;
		opt.on = 1;
		
		gun.get(tag, opt);
		return gun;
	};

	Gun.chain.once = function(cb, opt = {}){
		if(!cb) return none(this, opt);
		
		const gun = this;
		const cat = gun._;
		const root = cat.root;
		const id = text_rand(7);

		gun.get(function(data, key, msg, eve){
			const $ = this;
			const at = $._;
			const one = at.one ||= {};
			
			if(eve.stun || one[id] === '') return;
			
			const valid = Gun.valid(data);
			if(valid === true){
				once();
				return;
			}
			if(typeof valid === 'string') return;

			clearTimeout((cat.one||{})[id]);
			clearTimeout(one[id]);
			one[id] = setTimeout(once, opt.wait || 99);

			function once(f){
				if(!at.has && !at.soul) at = {put: data, get: key};
				
				let tmp = at.put;
				if(tmp === undefined) tmp = ((msg.$$ || '')._||'').put;
				
				if(typeof Gun.valid(tmp) === 'string'){
					tmp = root.$.get(tmp)._.put;
					if(tmp === undefined && !f){
						one[id] = setTimeout(() => once(1), opt.wait || 99);
						return;
					}
				}

				if(eve.stun || one[id] === '') return;
				one[id] = '';
				
				if(cat.soul || cat.has) eve.off();
				
				cb.call($, tmp, at.get);
				clearTimeout(one[id]);
			}
		}, {on: 1});
		
		return gun;
	};

	function none(gun, opt){
		Gun.log.once("valonce", "Chainable val is experimental, its behavior and API may change moving forward. Please play with it and report bugs and ideas on how to improve it.");
		
		const chain = gun.chain();
		chain._.nix = gun.once(function(data, key){ 
			chain._.on('in', this._);
		});
		chain._.lex = gun._.lex;
		return chain;
	}

	Gun.chain.off = function(){
		const gun = this;
		const at = gun._;
		const cat = at.back;
		
		if(!cat) return;
		
		at.ack = 0;

		if(cat.next?.[at.get]) delete cat.next[at.get];
		if(cat.any) cat.any = {};
		if(cat.ask?.[at.get]) delete cat.ask[at.get];
		if(cat.put?.[at.get]) delete cat.put[at.get];
		if(at.soul) delete cat.root.graph[at.soul];
		
		if(at.map){
			Object.keys(at.map).forEach(k => {
				const atMap = at.map[k];
				if(atMap.link) cat.root.$.get(atMap.link).off();
			});
		}

		if(at.next){
			Object.keys(at.next).forEach(k => {
				at.next[k].$.off();  
			});
		}

		at.on('off', {});
		return gun;
	};

};