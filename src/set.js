;(()=> {

const Gun = require('./root');
Gun.chain.set = function(item, cb, opt){
	const root = this.back(-1);
	let soul;
	let tmp;
	cb = cb || (()=> {});
	opt = opt || {}; opt.item = opt.item || item;
	if(soul = ((item||'')._||'')['#']){ (item = {})['#'] = soul } // check if node, make link.
	if('string' == typeof (tmp = Gun.valid(item))){ return this.get(soul = tmp).put(item, cb, opt) } // check if link
	if(!Gun.is(item)){
		if(Object.plain(item)){
			item = root.get(soul = this.back('opt.uuid')()).put(item);
		}
		return this.get(soul || root.back('opt.uuid')(7)).put(item, cb, opt);
	}
	this.put((go)=> {
		item.get((soul, o, msg)=> { // TODO: BUG! We no longer have this option? & go error not handled?
			if(!soul){ return cb.call(this, {err: Gun.log('Only a node can be linked! Not "' + msg.put + '"!')}) }
			(tmp = {})[soul] = {'#': soul}; go(tmp);
		},true);
	})
	return item;
}

})();