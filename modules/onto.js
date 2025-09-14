/**
 * On event emitter generic JavaScript utility.
 * Provides a simple event system for chaining listeners.
 */

/**
 * Creates or manages event listeners for a given tag.
 * @param {string} tag - The event tag to listen to or emit on.
 * @param {Function|*} arg - Function to add as listener, or data to emit.
 * @param {*} as - Additional context or metadata.
 * @returns {Object|undefined} Listener object if adding, or target if emitting.
 */
function onto(tag, arg, as) {
	if (!tag) { return { to: onto }; }

	const isFunction = typeof arg === 'function';

	const defaultNext = {
		next: function(data) {
			if (this.to) this.to.next(data);
		}
	};

	this.tag ??= {};
	let tagObj = this.tag[tag];

	if (!tagObj && isFunction) {
		onto._ = defaultNext;
		tagObj = this.tag[tag] = {
			tag,
			to: onto._
		};
	}

	if (isFunction) {
		const listener = {
			off: onto.off || function() {
				if (this.next === defaultNext.next) { return true; }

				if (this === this.the?.last) {
					this.the.last = this.back;
				}

				this.to.back = this.back;
				this.next = defaultNext.next;
				this.back.to = this.to;

				if (this.the?.last === this.the) {
					delete this.on?.tag?.[this.the.tag];
				}
			},
			to: defaultNext,
			next: arg,
			the: tagObj,
			on: this,
			as
		};

		const lastListener = tagObj.last ?? tagObj;
		listener.back = lastListener;
		lastListener.to = listener;
		tagObj.last = listener;

		return listener;
	}

	const target = tagObj?.to;
	if (target && arg !== undefined) {
		target.next(arg);
	}
	return target;
}

module.exports = onto;