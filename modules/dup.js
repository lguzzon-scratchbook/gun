const { text_rand, match, poll, turn, each } = require('./shim.js');

/**
 * Duplication tracking utility.
 * Prevents processing of duplicate messages within a time window.
 * @param {Object} [options] - Options for the Dup instance.
 * @param {number} [options.max=999] - Maximum number of entries.
 * @param {number} [options.age=9000] - Age threshold for entries in milliseconds.
 * @returns {Object} dup - The Dup instance.
 */
function Dup(options = { max: 999, age: 9000 }) {
	const dup = { s: {} }; // Storage for tracked items
	const storage = dup.s;

	/**
	 * Checks if an ID exists in the tracking system.
	 * @param {string} id - The ID to check.
	 * @returns {boolean} True if the ID exists, false otherwise.
	 */
	dup.check = function (id) {
		if (!storage[id]) {
			return false;
		}
		return trackFunction(id); // Update timestamp on check
	};

	/**
	 * Tracks an ID, updating its timestamp.
	 * @param {string} id - The ID to track.
	 * @returns {Object} The tracked item.
	 */
	const trackFunction = (dup.track = function (id) {
		const item = storage[id] || (storage[id] = {});
		item.was = dup.now = Date.now();
		if (!dup.to) {
			dup.to = setTimeout(dup.drop, options.age + 9); // Schedule cleanup
		}
		if (trackFunction.ed) {
			trackFunction.ed(id);
		}
		return item;
	});

	/**
	 * Drops old entries from the tracking system.
	 * @param {number} [age] - The age threshold for dropping entries.
	 */
	dup.drop = function (age) {
		dup.to = null;
		dup.now = Date.now();
		const keys = Object.keys(storage);
		console.STAT && console.STAT(dup.now, Date.now() - dup.now, 'dup drop keys');
		each(
			keys,
			(id) => {
				const item = storage[id];
				if (item && (age || options.age) > dup.now - item.was) {
					return; // Keep if not old enough
				}
				delete storage[id];
			},
			0,
			99
		);
	};

	return dup;
}

module.exports = Dup;