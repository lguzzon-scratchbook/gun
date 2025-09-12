;(function(){

// On event emitter generic javascript utility.
module.exports = function onto(tag, arg, as){
	if(!tag){ return {to: onto} }
	
	var isFunction = typeof arg === 'function';
	var defaultNext = {
		next: function(arg){
			var tmp = this.to;
			if(tmp){ tmp.next(arg) }
		}
	};

	// Get or create tag
	var tagObj = (this.tag || (this.tag = {}))[tag];
	if(!tagObj && isFunction){
		tagObj = this.tag[tag] = {
			tag: tag,
			to: onto._ = defaultNext
		};
	}

	// Handle function case
	if(isFunction){
		var listener = {
			off: onto.off || function(){
				if(this.next === defaultNext.next){ return true }
				
				if(this === this.the.last){
					this.the.last = this.back;
				}

				this.to.back = this.back;
				this.next = defaultNext.next;
				this.back.to = this.to;

				if(this.the.last === this.the){
					delete this.on.tag[this.the.tag];
				}
			},
			to: defaultNext,
			next: arg,
			the: tagObj,
			on: this,
			as: as
		};

		var last = tagObj.last || tagObj;
		listener.back = last;
		last.to = listener;
		tagObj.last = listener;

		return listener;
	}

	// Handle non-function case
	var target = tagObj && tagObj.to;
	if(target && arg !== undefined){
		target.next(arg);
	}
	return target;
};
	
}());