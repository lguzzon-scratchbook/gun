module.exports = function(Gun){

	Gun.chain.set = function(item, cb = () => {}, opt = {}){
		const gun = this;
		const root = gun.back(-1);
		let soul;

		opt.item = opt.item || item;

		// If item is a node, extract soul and convert to link
		if (item?._?.['#']) {
			soul = item._['#'];
			item = {'#': soul};
		}

		// Check if item is a valid link
		const tmp = Gun.valid(item);
		if (typeof tmp === 'string') {
			return gun.get(soul = tmp).put(item, cb, opt);
		}

		// Handle non-Gun items - plain objects and other values
		if (!Gun.is(item)) {
			if (Object.plain(item)) {
				soul = gun.back('opt.uuid')();
				item = root.get(soul).put(item);
			}
			soul = soul || root.back('opt.uuid')(7);
			return gun.get(soul).put(item, cb, opt);
		}

		// Handle Gun items - get soul and create link
		gun.put(async (go) => {
			item.get((soul, o, msg) => {
				// Error if no valid soul found
				if (!soul) {
					return cb.call(gun, {
						err: Gun.log(`Only a node can be linked! Not "${msg.put}"!`)
					});
				}
				// Create the link object
				const tmp = {};
				tmp[soul] = {'#': soul};
				go(tmp);
			}, true);
		});

		return item;
	}

};