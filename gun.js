;(function(){

  /* UNBUILD */
  function USE(arg, req){
    return req? require(arg) : arg.slice? USE[R(arg)] : function(mod, path){
      arg(mod = {exports: {}});
      USE[R(path)] = mod.exports;
    }
    function R(p){
      return p.split('/').slice(-1).toString().replace('.js','');
    }
  }
  if(typeof module !== "undefined"){ var MODULE = module }
  /* UNBUILD */

	;USE(function(module) {
	// Shim for generic JavaScript utilities
	// Provides polyfills and extensions for String, Object, and setTimeout

	// Constants
	const DEFAULT_RANDOM_LENGTH = 24;
	const DEFAULT_CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz';
	const UNDEFINED_VALUE = void 0;
	const SET_TIMEOUT_HOLD = 9;
	const POLL_COUNT_LIMIT = 3333;
	const CHUNK_SIZE_DEFAULT = 9;
	const TURN_BATCH_SIZE = 99;

	// String Utilities

	/**
	 * Generates a random string of specified length using given charset.
	 * @param {number} [length=24] - Length of the random string
	 * @param {string} [charset] - Characters to use for generation
	 * @returns {string} Random string
	 */
	String.random = function(length, charset) {
		let result = '';
		length = length || DEFAULT_RANDOM_LENGTH;
		charset = charset || DEFAULT_CHARSET;

		while (length-- > 0) {
			result += charset.charAt(Math.floor(Math.random() * charset.length));
		}

		return result;
	};

	/**
	 * Matches a string against patterns defined in options object.
	 * @param {string} text - Text to match
	 * @param {Object} options - Matching options
	 * @returns {boolean} True if matches
	 */
	String.match = function(text, options) {
		if (typeof text !== 'string') {
			return false;
		}

		if (typeof options === 'string') {
			options = { '=': options };
		}

		options = options || {};

		// Exact match
		let pattern = options['='] || options['*'] || options['>'] || options['<'];
		if (text === pattern) {
			return true;
		}

		// No exact match
		if (UNDEFINED_VALUE !== options['=']) {
			return false;
		}

		// Prefix match
		pattern = options['*'] || options['>'];
		if (text.slice(0, (pattern || '').length) === pattern) {
			return true;
		}

		// No prefix match
		if (UNDEFINED_VALUE !== options['*']) {
			return false;
		}

		// Range match
		if (UNDEFINED_VALUE !== options['>'] && UNDEFINED_VALUE !== options['<']) {
			return (text >= options['>'] && text <= options['<']) ? true : false;
		}

		if (UNDEFINED_VALUE !== options['>'] && text >= options['>']) {
			return true;
		}

		if (UNDEFINED_VALUE !== options['<'] && text <= options['<']) {
			return true;
		}

		return false;
	};

	/**
	 * Computes a hash for a string using a simple algorithm.
	 * @param {string} str - String to hash
	 * @param {number} [hash=0] - Initial hash value
	 * @returns {number} Hash value
	 */
	String.hash = function(str, hash) {
		if (typeof str !== 'string') {
			return;
		}

		hash = hash || 0;

		if (!str.length) {
			return hash;
		}

		let charCode;
		[...str].forEach(char => {
			charCode = char.charCodeAt(0);
			hash = ((hash << 5) - hash) + charCode;
			hash |= 0;
		});

		return hash;
	};

	// Object Utilities

	const hasOwnProperty = Object.prototype.hasOwnProperty;

	/**
	 * Checks if an object is a plain object (not an instance of a custom class).
	 * @param {*} obj - Object to check
	 * @returns {boolean} True if plain object
	 */
	Object.plain = function(obj) {
		if (!obj) {
			return false;
		}

		return (obj instanceof Object && obj.constructor === Object) ||
			Object.prototype.toString.call(obj).match(/^\[object (\w+)\]$/)[1] === 'Object';
	};

	/**
	 * Checks if an object is empty, optionally excluding certain keys.
	 * @param {Object} obj - Object to check
	 * @param {Array} [exclude] - Keys to exclude from check
	 * @returns {boolean} True if empty
	 */
	Object.empty = function(obj, exclude) {
		for (let key in obj) {
			if (hasOwnProperty.call(obj, key) && (!exclude || exclude.indexOf(key) === -1)) {
				return false;
			}
		}

		return true;
	};

	/**
	 * Polyfill for Object.keys.
	 * @param {Object} obj - Object to get keys from
	 * @returns {Array} Array of keys
	 */
	Object.keys = Object.keys || function(obj) {
		return Object.getOwnPropertyNames(obj).filter(key => obj.propertyIsEnumerable(key));
	};

	// setTimeout Utilities for Better Async Handling

	(function() {
		let undefinedValue;
		const setTimeoutRef = setTimeout;
		let lastTime = 0;
		let pollCount = 0;

		// SetImmediate shim
		const setImmediateShim = (typeof setImmediate !== '' + undefinedValue && setImmediate) ||
			(function(callback, func) {
				if (typeof MessageChannel === '' + undefinedValue) {
					return setTimeoutRef;
				}

				const channel = new MessageChannel();
				channel.port1.onmessage = function(event) {
					if ('' === event.data) {
						func();
					}
				};

				return function(queue) {
					func = queue;
					channel.port2.postMessage('');
				};
			}());

		// Performance check
		const performanceCheck = setTimeoutRef.check = setTimeoutRef.check ||
			(typeof performance !== '' + undefinedValue && performance) ||
			{ now: function() { return +new Date; } };

		setTimeoutRef.hold = setTimeoutRef.hold || SET_TIMEOUT_HOLD;

		/**
		 * Polling function with performance optimization
		 * @param {Function} func - Function to execute
		 */
		setTimeoutRef.poll = setTimeoutRef.poll || function(func) {
			if ((setTimeoutRef.hold >= (performanceCheck.now() - lastTime)) &&
				pollCount++ < POLL_COUNT_LIMIT) {
				func();
				return;
			}

			setImmediateShim(function() {
				lastTime = performanceCheck.now();
				func();
			}, pollCount = 0);
		};
	}());

	// Threading mechanism to handle multiple polls in turns

	(function() {
		const setTimeoutRef = setTimeout;
		const poll = setTimeoutRef.poll;
		let queue = [];
		let index = 0;
		let currentFunc;

		/**
		 * Turn-based function execution
		 * @param {Function} func - Function to queue for execution
		 * @returns {number} Queue position
		 */
		setTimeoutRef.turn = setTimeoutRef.turn || function(func) {
			if (1 === queue.push(func)) {
				poll(turnFunc);
			}
		};

		// Make queue accessible
		setTimeoutRef.turn.s = queue;

		function turnFunc() {
			if (currentFunc = queue[index++]) {
				currentFunc();
			}

			if (index === queue.length || index === TURN_BATCH_SIZE) {
				queue = setTimeoutRef.turn.s = queue.slice(index);
				index = 0;
			}

			if (queue.length) {
				poll(turnFunc);
			}
		}
	}());

	// Each utility for processing arrays in chunks

	(function() {
		let undefinedValue;
		const setTimeoutRef = setTimeout;
		const turn = setTimeoutRef.turn;

		/**
		 * Process array items in chunks to prevent blocking
		 * @param {Array} list - Array to process
		 * @param {Function} func - Processing function
		 * @param {Function} [end] - End callback
		 * @param {number} [chunkSize=9] - Items per chunk
		 * @returns {void}
		 */
		setTimeoutRef.each = setTimeoutRef.each || function(list, func, end, chunkSize) {
			chunkSize = chunkSize || CHUNK_SIZE_DEFAULT;

			let index = 0;
			(function process(result) {
				const subList = (list || []).slice(index, index + chunkSize);
				index += chunkSize;
				if (subList.length) {
					const stopped = subList.some(item => {
						result = func(item);
						return undefinedValue !== result;
					});
					if (!stopped) {
						turn(process);
						return;
					}
				}
		
				if (end) {
					end(result);
				}
			}());
		};
	}());

})(USE, './shim');

	;USE(function(module){
		// On event emitter generic JavaScript utility.
		// Provides a simple event system for chaining listeners.

		/**
		 * Creates or manages event listeners for a given tag.
		 * @param {string} tag - The event tag to listen to or emit on.
		 * @param {Function|*} arg - Function to add as listener, or data to emit.
		 * @param {*} as - Additional context or metadata.
		 * @returns {Object|undefined} Listener object if adding, or target if emitting.
		 */
		module.exports = function onto(tag, arg, as){
			if(!tag){ return {to: onto} } // Return a chainable object if no tag provided

			var isFunction = typeof arg === 'function';
			var defaultNext = {
				next: function(data){
					var nextTarget = this.to;
					if(nextTarget){ nextTarget.next(data) }
				}
			};

			// Get or create tag object in the context
			var tagObj = (this.tag || (this.tag = {}))[tag];
			if(!tagObj && isFunction){
				tagObj = this.tag[tag] = {
					tag: tag,
					to: onto._ = defaultNext // Set default handler
				};
			}

			// Handle function case: add listener
			if(isFunction){
				var listener = {
					off: onto.off || function(){
						if(this.next === defaultNext.next){ return true } // Already off

						if(this === this.the.last){
							this.the.last = this.back; // Update last pointer
						}

						this.to.back = this.back; // Link previous to next
						this.next = defaultNext.next; // Mark as removed
						this.back.to = this.to; // Link next to previous

						if(this.the.last === this.the){
							delete this.on.tag[this.the.tag]; // Remove empty tag
						}
					},
					to: defaultNext, // Next in chain
					next: arg, // The listener function
					the: tagObj, // Reference to tag object
					on: this, // Context
					as: as // Metadata
				};

				var lastListener = tagObj.last || tagObj;
				listener.back = lastListener; // Link to previous last
				lastListener.to = listener; // Previous points to new
				tagObj.last = listener; // Update last

				return listener;
			}

			// Handle non-function case: emit data
			var target = tagObj && tagObj.to;
			if(target && arg !== undefined){
				target.next(arg); // Trigger listeners
			}
			return target;
		};
	})(USE, './onto');

	;USE(function(module){
		// TODO: BUG! Unbuild will make these globals... CHANGE unbuild to wrap files in a function.
		// Book is a replacement for JS objects, maps, dictionaries.
		// Provides a CRDT-like data structure for managing key-value pairs with versioning and paging.

		/**
		 * Creates a Book instance for managing key-value data with paging and versioning.
		 * @param {string} text - Initial text data for the book.
		 * @returns {Function} Book function that can get/set values.
		 */
		var setTimeoutRef = setTimeout, Book = setTimeoutRef.Book || (setTimeoutRef.Book = function(text){
			/**
			 * Main book function: get or set a value for a word.
			 * @param {string} word - The key to get or set.
			 * @param {*} is - The value to set (if provided).
			 * @returns {*} The value if getting, or the book if setting.
			 */
			var book = function book(word, is){
				var existing = book.all[word], pageRef;
				if(is === undefined){ return (existing && existing.is) || book.get(existing || word) }
				if(existing){
					if(pageRef = existing.page){
						pageRef.size += size(is) - size(existing.is);
						pageRef.text = '';
					}
					existing.text = '';
					existing.is = is;
					return book;
				}
				//book.all[word] = {is: word}; return book;
				return book.set(word, is);
			};
			// TODO: if from text, preserve the separator symbol.
			book.list = [{from: text, size: (text||'').length, substring: sub, toString: to, book: book, get: book, read: list}];
			book.page = page;
			book.set = set;
			book.get = get;
			book.all = {};
			return book;
		}), PAGE_SIZE = 2**12;

		/**
		 * Finds or creates a page for a given word.
		 * @param {string} word - The word to find a page for.
		 * @returns {Object} The page object.
		 */
		function page(word){
			var book = this, pages = book.list, index = spot(word, pages, book.parse), pageObj = pages[index];
			if('string' == typeof pageObj){ pages[index] = pageObj = {size: -1, first: book.parse? book.parse(pageObj) : pageObj, substring: sub, toString: to, book: book, get: book, read: list} } // TODO: test, how do we arrive at this condition again?
			//pageObj.i = index;
			return pageObj;
			// TODO: BUG! What if we get the page, it turns out to be too big & split, we must then RE get the page!
		}
		/**
		 * Retrieves a value for a given word.
		 * @param {string} word - The word to get the value for.
		 * @returns {*} The value associated with the word.
		 */
		function get(word){
			if(!word){ return }
			if(undefined !== word.is){ return word.is } // JS falsey values!
			var book = this, existing = book.all[word];
			if(existing){ return existing.is }
			// get does an exact match, so we would have found it already, unless parseless page:
			var pageObj = book.page(word), list, existing, array, index;
			if(!pageObj || !pageObj.from){ return } // no parseless data
			return got(word, pageObj);
		}
		/**
		 * Helper function to retrieve a value from a page.
		 * @param {string} word - The word to find.
		 * @param {Object} page - The page to search in.
		 * @returns {*} The value if found.
		 */
		function got(word, page){
			var book = page.book, list, existing, array, index;
			if(list = from(page)){ existing = list[got.i = index = spot(word, list, Book.decode)]; } // TODO: POTENTIAL BUG! This assumes that each word on a page uses the same serializer/formatter/structure. // TOOD: BUG!!! Not actually, but if we want to do non-exact radix-like closest-word lookups on a page, we need to check limbo & potentially sort first.
			// parseless may return -1 from actual value, so we may need to test both. // TODO: Double check? I think this is correct.
			if(existing && word == existing.word){ return (book.all[word] = existing).is }
			if('string' != typeof existing){ existing = list[got.i = index+=1] }
			if(existing && word == existing.word){ return (book.all[word] = existing).is }
			array = slot(existing) // Escape!
			if(word != Book.decode(array[0])){
				existing = list[got.i = index+=1]; // edge case bug?
				array = slot(existing); // edge case bug?
				if(word != Book.decode(array[0])){ return }
			}
			existing = list[index] = book.all[word] = {word: ''+word, is: Book.decode(array[1]), page: page, substring: subt, toString: tot}; // TODO: convert to a JS value!!! Maybe index! TODO: BUG word needs a page!!!! TODO: Check for other types!!!
			return existing.is;
		}

		/**
		 * Finds the insertion point for a word in a sorted list using binary search.
		 * @param {string} word - The word to find.
		 * @param {Array} sorted - The sorted list to search in.
		 * @param {Function} parse - Parser function.
		 * @returns {number} The index where the word should be inserted.
		 */
		function spot(word, sorted, parse){ parse = parse || spot.no || (spot.no = function(t){ return t }); // TODO: BUG???? Why is there substring()||0 ? // TODO: PERF!!! .toString() is +33% faster, can we combine it with the export?
			var list = sorted, wordLen = (word=''+word).length;
			var insertionIndex = list.findLastIndex(item => (parse(item)||'').substring() <= word);
			return insertionIndex + 1;
		}

		/**
		 * Parses the 'from' property of a page into a list if it's a string.
		 * @param {Object} page - The page object.
		 * @returns {Array} The parsed list.
		 */
		function from(page, temp, list){
			if('string' != typeof page.from){ return page.from }
			//(list = page.from = (temp = page.from||'').substring(1, temp.length-1).split(temp[0])); // slot
			(list = page.from = slot(temp = temp||page.from||''));
			return list;
		}
		/**
		 * Reads all entries from the book, applying a callback to each.
		 * @param {Function} each - Callback function for each entry.
		 * @returns {Array} Array of results from the callback.
		 */
		function list(each){ each = each || function(x){return x}
			var index = 0, sortedList = sort(this), entry, results = [], parseFunc = this.book.parse || function(){};
			//while(entry = sortedList[index++]){ results.push(each(slot(entry)[1], parseFunc(entry)||entry, this)) }
			while(entry = sortedList[index++]){ results.push(each(this.get(entry = entry.word||parseFunc(entry)||entry), entry, this)) } // TODO: BUG! PERF?
			return results;
		}

		/**
		 * Sets a value for a word, handling inserts and updates.
		 * @param {string} word - The word to set.
		 * @param {*} is - The value to set.
		 * @returns {Function} The book function.
		 */
		function set(word, is){
			// TODO: Perf on random write is decent, but short keys or seq seems significantly slower.
			var book = this, existing = book.all[word];
			if(existing){ return book(word, is) } // updates to in-memory items will always match exactly.
			var pageObj = book.page(word=''+word), temp; // before we assume this is an insert tho, we need to check
			if(pageObj && pageObj.from){ // if it could be an update to an existing word from parseless.
				book.get(word);
				if(book.all[word]){ return book(word, is) }
			}
			// MUST be an insert:
			existing = book.all[word] = {word: word, is: is, page: pageObj, substring: subt, toString: tot};
			pageObj.first = (pageObj.first < word)? pageObj.first : word;
			if(!pageObj.limbo){ (pageObj.limbo = []) }
			pageObj.limbo.push(existing);
			book(word, is);
			pageObj.size += size(word) + size(is);
			if((book.PAGE || PAGE_SIZE) < pageObj.size){ split(pageObj, book) }
			return book;
		}

		/**
		 * Splits a page when it exceeds the size limit.
		 * @param {Object} page - The page to split.
		 * @param {Function} book - The book function.
		 */
		function split(page, book){ // TODO: use closest hash instead of half.
			//console.time();
			//var startTime = performance.now();
			var sortedList = sort(page), listLen = sortedList.length, midIndex = listLen/2 >> 0, midPos = midIndex, midWord = sortedList[midPos], temp;
			//console.timeEnd();
			var newPage = {first: midWord.substring(), size: 0, substring: sub, toString: to, book: book, get: book, read: list}, newFrom = newPage.from = [];
			while(temp = sortedList[midIndex++]){
				newFrom.push(temp);
				newPage.size += (temp.is||'').length||1;
				temp.page = newPage;
			}
			page.from = page.from.slice(0, midPos);
			page.size -= newPage.size;
			book.list.splice(spot(newPage.first, book.list)+1, 0, newPage); // TODO: BUG! Make sure newPage.first is decoded text. // TODO: BUG! spot may need parse too?
			//console.timeEnd();
			if(book.split){ book.split(newPage, page) }
			//console.log(startTime = (performance.now() - startTime), 'split');
			//console.BIG = console.BIG > startTime? console.BIG : startTime;
		}

		/**
		 * Parses a string into an array using a separator.
		 * @param {string} str - The string to parse.
		 * @returns {Array} The parsed array.
		 */
		function slot(str){ return heal((str=str||'').substring(1, str.length-1).split(str[0]), str[0]) } Book.slot = slot; // TODO: check first=last & pass `s`.
		/**
		 * Handles escaped values in a parsed array.
		 * @param {Array} list - The array to heal.
		 * @param {string} sep - The separator.
		 * @returns {Array} The healed array.
		 */
		function heal(list, sep){ var index, end;
			if(0 > (index = list.findLastIndex(item => item === ''))){ return list } // ~700M ops/sec on 4KB of Math.random()s, even faster if escape does exist.
			if('' == list[0] && 1 == list.length){ return [] } // annoying edge cases! how much does this slow us down?
			//if((count=index+2+parseInt(list[index+1])) != count){ return [] } // maybe still faster than below?
			if((end=index+2+parseInt((end=list[index+1]).substring(0, end.indexOf('"'))||end)) != end){ return [] } // NaN check in JS is weird.
			list[index] = list.slice(index, end).join(sep||'|'); // rejoin the escaped value
			return list.slice(0,index+1).concat(heal(list.slice(end), sep)); // merge left with checked right.
		}

		/**
		 * Calculates the size of a value.
		 * @param {*} value - The value to measure.
		 * @returns {number} The size.
		 */
		function size(value){ return (value||'').length||1 } // bits/numbers less size? Bug or feature?
		/**
		 * Substring for word.
		 * @param {number} start - Start index.
		 * @param {number} end - End index.
		 * @returns {string} Substring.
		 */
		function subt(start, end){ return this.word }

		/**
		 * To string for entry.
		 * @returns {string} String representation.
		 */
		function tot(){ var temp = {};
			//if((temp = this.page) && temp.saving){ delete temp.book.all[this.word]; } // TODO: BUG! Book can't know about RAD, this was from RAD, so this MIGHT be correct but we need to refactor. Make sure to add tests that will re-trigger this.
			return this.text = this.text || ":"+Book.encode(this.word)+":"+Book.encode(this.is)+":";
			temp[this.word] = this.is;
			return this.text = this.text || Book.encode(temp,'|',':').slice(1,-1);
			//return this.text = this.text || "'"+(this.word)+"'"+(this.is)+"'";
		}

		/**
		 * Substring for page.
		 * @param {number} start - Start index.
		 * @param {number} end - End index.
		 * @returns {string} Substring.
		 */
		function sub(start, end){ return (this.first||this.word||Book.decode((from(this)||'')[0]||'')).substring(start, end) }

		/**
		 * To string for page.
		 * @returns {string} String representation.
		 */
		function to(){ return this.text = this.text || text(this) }
		/**
		 * Generates the text representation of a page.
		 * @param {Object} page - The page to represent.
		 * @returns {string} Text representation.
		 */
		function text(page){ // PERF: read->[*] : text->"*" no edit waste 1 time perf.
			if(page.limbo){ sort(page) } // TODO: BUG? Empty page meaning? undef, '', '||'?
			return ('string' == typeof page.from)? page.from : '|'+(page.from||[]).join('|')+'|';
		}

		/**
		 * Sorts the entries in a page.
		 * @param {Object} page - The page to sort.
		 * @param {Array} limbo - Limbo entries.
		 * @returns {Array} Sorted list.
		 */
		function sort(page, limbo){
			var fromList = page.from = ('string' == typeof page.from)? slot(page.from) : page.from||[];
			if(!(limbo = limbo || page.limbo)){ return fromList }
			return mix(page).sort(function(a,b){
				return (a.word||Book.decode(''+a)) < (b.word||Book.decode(''+b))? -1:1;
			});
		}
		/**
		 * Mixes limbo entries into the from list.
		 * @param {Object} page - The page.
		 * @param {Array} limbo - Limbo entries.
		 * @returns {Array} Mixed list.
		 */
		function mix(page, limbo){ // TODO: IMPROVE PERFORMANCE!!!! l[j] = i is 5X+ faster than .push(
			limbo = (limbo || page.limbo || []).toReversed(); page.limbo = null;
			var fromList = page.from;
			limbo.forEach(entry => {
				if(got(entry.word, page)){
					fromList[got.i] = entry; // TODO: Trick: allow for a GUN'S HAM CRDT hook here.
				} else {
					fromList.push(entry);
				}
			});
			return fromList;
		}

		/**
		 * Encodes a value to a string.
		 * @param {*} data - The data to encode.
		 * @param {string} sep - Separator.
		 * @param {string} unitSep - Unit separator.
		 * @returns {string} Encoded string.
		 */
		Book.encode = function(data, sep, unitSep){ sep = sep || "|"; unitSep = unitSep || String.fromCharCode(32);
			switch(typeof data){
				case 'string': // text
					const count = (data.match(new RegExp(sep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
					return (count?sep+count:'')+ '"' + data;
				case 'number': return (data < 0)? ''+data : '+'+data;
				case 'boolean': return data? '+' : '-';
				case 'object': if(!data){ return ' ' } // TODO: BUG!!! Nested objects don't slot correctly
					var keys = Object.keys(data).sort(), result = sep;
					for(const key of keys){ result += unitSep+Book.encode(key,sep,unitSep)+unitSep+Book.encode(data[key],sep,unitSep)+unitSep+sep }
					return result;
			}
		}
		/**
		 * Decodes a string back to a value.
		 * @param {string} str - The string to decode.
		 * @param {string} sep - Separator.
		 * @returns {*} Decoded value.
		 */
		Book.decode = function(str, sep){ sep = sep || "|";
			if('string' != typeof str){ return }
			switch(str){ case ' ': return null; case '-': return false; case '+': return true; }
			switch(str[0]){
				case '-': case '+': return parseFloat(str);
				case '"': return str.slice(1);
			}
			return str.slice(str.indexOf('"')+1);
		}

		/**
		 * Computes a hash for a string.
		 * @param {string} str - String to hash.
		 * @param {number} hash - Initial hash value.
		 * @returns {number} Hash value.
		 */
		Book.hash = function(str, hash){ // via SO
			if(typeof str !== 'string'){ return }
		  hash = hash || 0; // CPU schedule hashing by
		  if(!str.length){ return hash }
		  for(var i=0, len=str.length, charCode; i<len; ++i){
		    charCode = str.charCodeAt(i);
		    hash = ((hash<<5)-hash)+charCode;
		    hash |= 0;
		  }
		  return hash;
		}

		/**
		 * Records a key-value pair as a string.
		 * @param {string} key - The key.
		 * @param {*} value - The value.
		 * @returns {string} Encoded record.
		 */
		function record(key, value){ return key+Book.encode(value)+"%"+key.length }

		/**
		 * Decords a string back to a key-value pair.
		 * @param {string} str - The encoded record.
		 * @returns {Object} Decoded object.
		 */
		function decord(str){
			var obj = {}, index = str.lastIndexOf("%"), keyLen = parseFloat(str.slice(index+1));
			obj[str.slice(0,keyLen)] = Book.decode(str.slice(keyLen,index));
			return obj;
		}

		try{module.exports=Book}catch(e){}
	})(USE, './book');

	;USE(function(module){
		// Valid values are a subset of JSON: null, binary, number (!Infinity), text,
		// or a soul relation. Arrays need special algorithms to handle concurrency,
		// so they are not supported directly. Use an extension that supports them if
		// needed but research their problems first.

		/**
		 * Validates if a value is acceptable for storage.
		 * @param {*} value - The value to validate.
		 * @returns {boolean} True if valid.
		 */
		module.exports = function(value){
		  // "deletes", nulling out keys.
		  return value === null ||
			"string" === typeof value ||
			"boolean" === typeof value ||
			// we want +/- Infinity to be, but JSON does not support it, sad face.
			// can you guess what value === value checks for? ;)
			("number" === typeof value && value != Infinity && value != -Infinity && value === value) ||
			(!!value && "string" == typeof value["#"] && Object.keys(value).length === 1 && value["#"]);
		}
	})(USE, './valid');

	;USE(function(module) {
	    USE('./shim');

	    /**
	     * @typedef {Object} StateNode
	     * @property {Object} _ - Metadata container
	     * @property {string} _['#'] - Soul identifier
	     * @property {Object} _['>'] - State timestamps
	     */

	    /**
	     * Creates a timestamp-based state with drift compensation.
	     * Generates unique timestamps for conflict resolution.
	     * @returns {number} Calculated state timestamp.
	     */
	    function State() {
	        const currentTime = +new Date();
	        const DECIMAL_PRECISION = 999; // Adjustable based on machine processing speed

	        if (State.lastTimestamp < currentTime) {
	            State.counter = 0;
	            State.lastTimestamp = currentTime + State.drift;
	            return State.lastTimestamp;
	        }

	        State.counter += 1;
	        State.lastTimestamp = currentTime + (State.counter / DECIMAL_PRECISION) + State.drift;
	        return State.lastTimestamp;
	    }

	    // Initialize state properties
	    State.drift = 0; // Clock drift compensation
	    State.counter = 0; // Counter for same-millisecond timestamps
	    State.lastTimestamp = -Infinity; // Last generated timestamp

	    /**
	     * Retrieves state value for a given key on a node.
	     * @param {StateNode} node - Target node.
	     * @param {string} key - Key to check.
	     * @param {Object} [fallback] - Fallback object if node state unavailable.
	     * @returns {number|undefined} State value or -Infinity if not found.
	     */
	    State.is = function(node, key, fallback) {
	        const stateContainer = (key && node?._?.['>']) || fallback;
	        if (!stateContainer) return undefined;

	        const stateValue = stateContainer[key];
	        return typeof stateValue === 'number' ? stateValue : -Infinity;
	    };

	    /**
	     * Sets state for a key on a node.
	     * @param {StateNode} node - Target node.
	     * @param {string} key - Key to modify.
	     * @param {number} state - State value.
	     * @param {*} value - Associated value.
	     * @param {string} [soul] - Soul identifier.
	     * @returns {StateNode} Modified node.
	     */
	    State.ify = function(node = {}, key, state, value, soul) {
	        // Initialize metadata container
	        node._ = node._ || {};

	        if (soul) {
	            node._['#'] = soul;
	        }

	        const stateTimestamps = node._['>'] || (node._['>'] = {});

	        if (key !== undefined && key !== '_') {
	            if (typeof state === 'number') {
	                stateTimestamps[key] = state;
	            }
	            if (value !== undefined) {
	                node[key] = value;
	            }
	        }

	        return node;
	    };

	    module.exports = State;
	})(USE, './state');

USE(function (module) {
  USE('./shim');

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
			setTimeout.each(
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
})(USE, './dup');

	USE(function (module) {
	    // Request/response module for asking and acknowledging messages.
	    USE('./onto'); // Depends upon onto!

	    /**
	     * Handles request/response messages for acknowledgments.
	     * @param {Function|string|Object} callback - Callback function or message ID.
	     * @param {Object} [options] - Additional parameters.
	     * @returns {string|boolean} Message ID or true if successful.
	     */
	    module.exports = function ask(callback, options) {
	        if (!this.on) return;

	        const timeout = (this.opt || {}).lack || 9000;

	        if (typeof callback !== 'function') {
	            if (!callback) return;
	            const messageId = callback['#'] || callback;
	            let listener = (this.tag || '')[messageId];
	            if (!listener) return;
	            if (options) {
	                listener = this.on(messageId, options);
	                clearTimeout(listener.err);
	                listener.err = setTimeout(() => listener.off(), timeout);
	            }
	            return true;
	        }

	        const id = (options && options['#']) || randomString(9);
	        if (!callback) return id;

	        const listener = this.on(id, callback, options);
	        listener.err = listener.err || setTimeout(() => {
	            listener.off();
	            listener.next({ err: "Error: No ACK yet.", lack: true });
	        }, timeout);

	        return id;
	    };

	    /**
	     * Generates a random string of specified length.
	     * @param {number} [length=9] - Length of the random string.
	     * @returns {string} Random string.
	     */
			const randomString = String.random || function (length = 9) { return Math.random().toString(36).slice(2, 2 + length) };
		})(USE, './ask');
	
	;USE(function(module){

		/**
		 * Main Gun constructor.
		 * Creates a new Gun instance or returns existing if passed.
		 * @param {Object} [options] - Configuration options.
		 * @returns {Object} Gun chain instance.
		 */
		function Gun(options){
			if(options instanceof Gun){ return (this._ = {$: this}).$ }
			if(!(this instanceof Gun)){ return new Gun(options) }
			return Gun.create(this._ = {$: this, opt: options});
		}

		/**
		 * Checks if an object is a Gun instance.
		 * @param {*} obj - Object to check.
		 * @returns {boolean} True if Gun instance.
		 */
		Gun.is = function(obj){ return (obj instanceof Gun) || (obj && obj._ && (obj === obj._.$)) || false }

		Gun.version = 0.2020;

		Gun.chain = Gun.prototype;
		Gun.chain.toJSON = function(){};

		USE('./shim');
		Gun.valid = USE('./valid');
		Gun.state = USE('./state');
		Gun.on = USE('./onto');
		Gun.dup = USE('./dup');
		Gun.ask = USE('./ask');

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
				setTimeout.each(ctx.match, function(cb){cb && cb()}); 
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

		;(function(){
			Gun.on.get = function(msg, gun){
				var root = gun._, get = msg.get, soul = get['#'], node = root.graph[soul], has = get['.'];
				var next = root.next || (root.next = {}), at = next[soul];

				// TODO: Azarattum bug, what is in graph is not same as what is in next. Fix!

				// queue concurrent GETs?
				// TODO: consider tagging original message into dup for DAM.
				// TODO: ^ above? In chat app, 12 messages resulted in same peer asking for `#user.pub` 12 times. (same with #user GET too, yipes!) // DAM note: This also resulted in 12 replies from 1 peer which all had same ##hash but none of them deduped because each get was different.
				// TODO: Moving quick hacks fixing these things to axe for now.
				// TODO: a lot of GET #foo then GET #foo."" happening, why?
				// TODO: DAM's ## hash check, on same get ACK, producing multiple replies still, maybe JSON vs YSON?
				// TMP note for now: viMZq1slG was chat LEX query #.
				/*if(gun !== (tmp = msg.$) && (tmp = (tmp||'')._)){
					if(tmp.Q){ tmp.Q[msg['#']] = ''; return } // chain does not need to ask for it again.
					tmp.Q = {};
				}*/
				/*if(u === has){
					if(at.Q){
						//at.Q[msg['#']] = '';
						//return;
					}
					at.Q = {};
				}*/
				var ctx = msg._||{}, DBG = ctx.DBG = msg.DBG;
				DBG && (DBG.g = +new Date);
				//console.log("GET:", get, node, has, at);
				//if(!node && !at){ return root.on('get', msg) }
				//if(has && node){ // replace 2 below lines to continue dev?
				if(!node){ return root.on('get', msg) }
				if(has){
					if('string' != typeof has || u === node[has]){
						if(!((at||'').next||'')[has]){ root.on('get', msg); return }
					}
					node = state_ify({}, has, state_is(node, has), node[has], soul);
					// If we have a key in-memory, do we really need to fetch?
					// Maybe... in case the in-memory key we have is a local write
					// we still need to trigger a pull/merge from peers.
				}
				//Gun.window? Gun.obj.copy(node) : node; // HNPERF: If !browser bump Performance? Is this too dangerous to reference root graph? Copy / shallow copy too expensive for big nodes. Gun.obj.to(node); // 1 layer deep copy // Gun.obj.copy(node); // too slow on big nodes
				node && ack(msg, node);
				root.on('get', msg); // send GET to storage adapters.
			}
			function ack(msg, node){
				var S = +new Date, ctx = msg._||{}, DBG = ctx.DBG = msg.DBG;
				var to = msg['#'], id = text_rand(9), keys = Object.keys(node||'').sort(), soul = ((node||'')._||'')['#'], kl = keys.length, j = 0, root = msg.$._.root, F = (node === root.graph[soul]);
				console.STAT && console.STAT(S, ((DBG||ctx).gk = +new Date) - S, 'got keys');
				// PERF: Consider commenting this out to force disk-only reads for perf testing? // TODO: .keys( is slow
				node && (function go(){
					S = +new Date;
					var i = 0, k, put = {}, tmp;
					while(i < 9 && (k = keys[i++])){
						state_ify(put, k, state_is(node, k), node[k], soul);
					}
					keys = keys.slice(i);
					(tmp = {})[soul] = put; put = tmp;
					var faith; if(F){ faith = function(){}; faith.ram = faith.faith = true; } // HNPERF: We're testing performance improvement by skipping going through security again, but this should be audited.
					tmp = keys.length;
					console.STAT && console.STAT(S, -(S - (S = +new Date)), 'got copied some');
					DBG && (DBG.ga = +new Date);
					root.on('in', {'@': to, '#': id, put: put, '%': (tmp? (id = text_rand(9)) : u), $: root.$, _: faith, DBG: DBG});
					console.STAT && console.STAT(S, +new Date - S, 'got in');
					if(!tmp){ return }
					setTimeout.turn(go);
				}());
				if(!node){ root.on('in', {'@': msg['#']}) } // TODO: I don't think I like this, the default lS adapter uses this but "not found" is a sensitive issue, so should probably be handled more carefully/individually.
			} Gun.on.get.ack = ack;
		}());

		;(function(){
			Gun.chain.opt = function(opt){
				opt = opt || {};
				var gun = this, at = gun._, tmp = opt.peers || opt;
				if(!Object.plain(opt)){ opt = {} }
				if(!Object.plain(at.opt)){ at.opt = opt }
				if('string' == typeof tmp){ tmp = [tmp] }
				if(!Object.plain(at.opt.peers)){ at.opt.peers = {}}
				if(tmp instanceof Array){
					opt.peers = {};
					tmp.forEach(function(url){
						var p = {}; p.id = p.url = url;
						opt.peers[url] = at.opt.peers[url] = at.opt.peers[url] || p;
					})
				}
				obj_each(opt, function each(k){ var v = this[k];
					if((this && this.hasOwnProperty(k)) || 'string' == typeof v || Object.empty(v)){ this[k] = v; return }
					if(v && v.constructor !== Object && !(v instanceof Array)){ return }
					obj_each(v, each);
				});
				at.opt.from = opt;
				Gun.on('opt', at);
				at.opt.uuid = at.opt.uuid || function uuid(l){ return Gun.state().toString(36).replace('.','') + String.random(l||12) }
				return gun;
			}
		}());

		var obj_each = function(o,f){ Object.keys(o).forEach(f,o) }, text_rand = String.random, turn = setTimeout.turn, valid = Gun.valid, state_is = Gun.state.is, state_ify = Gun.state.ify, u, empty = {}, C;

		Gun.log = function(){ return (!Gun.log.off && C.log.apply(C, arguments)), [].slice.call(arguments).join(' ') };
		Gun.log.once = function(w,s,o){ return (o = Gun.log.once)[w] = o[w] || 0, o[w]++ || Gun.log(s) };

		if(typeof window !== "undefined"){ (window.GUN = window.Gun = Gun).window = window }
		try{ if(typeof MODULE !== "undefined"){ MODULE.exports = Gun } }catch(e){}
		module.exports = Gun;
		
		(Gun.window||{}).console = (Gun.window||{}).console || {log: function(){}};
		(C = console).only = function(i, s){ return (C.only.i && i === C.only.i && C.only.i++) && (C.log.apply(C, arguments) || s) };

		;"Please do not remove welcome log unless you are paying for a monthly sponsorship, thanks!";
		Gun.log.once("welcome", "Hello wonderful person! :) Thanks for using GUN, please ask for help on http://chat.gun.eco if anything takes you longer than 5min to figure out!");
	})(USE, './root');

	USE(function(module) {
	    const Gun = USE('./root');

	    /**
	     * Navigates back in the chain to a previous context.
	     * @param {number|string|function} steps - Number of steps, path string, or matcher function.
	     * @param {object} [options] - Optional parameter.
	     * @returns {object} The resulting node in the chain.
	     */
	    Gun.chain.back = function(steps = 1, options) {
	        if (steps === -1 || steps === Infinity) {
	            return this._.root.$; // Root of the chain
	        }
	        if (steps === 1) {
	            return (this._.back || this._).$; // Immediate parent
	        }

	        const gun = this;
	        let context = gun._;

	        if (typeof steps === 'string') {
	            steps = steps.split('.'); // Convert path to array
	        }

	        if (Array.isArray(steps)) {
	            let current = context;
	            for (const key of steps) {
	                current = (current || {})[key];
	            }
	            if (current !== undefined) {
	                return options ? gun : current;
	            }
	            if ((current = context.back)) {
	                return current.$.back(steps, options); // Recurse up
	            }
	            return;
	        }

	        if (typeof steps === 'function') {
	            let result;
	            let current = { back: context };
	            while ((current = current.back) && (result = steps(current, options)) === undefined) {}
	            return result;
	        }

	        if (typeof steps === 'number') {
	            return (context.back || context).$.back(steps - 1); // Decrement steps
	        }

	        return this;
	    };

	})(USE, './back');

	;USE(function(module){
		// WARNING: GUN is very simple, but the JavaScript chaining API around GUN
		// is complicated and was extremely hard to build. If you port GUN to another
		// language, consider implementing an easier API to build.
		var Gun = USE('./root');
		Gun.chain.chain = function(sub){
			var gun = this, at = gun._, chain = new (sub || gun).constructor(gun), cat = chain._, root;
			cat.root = root = at.root;
			cat.id = ++root.once;
			cat.back = gun._;
			cat.on = Gun.on;
			cat.on('in', Gun.on.in, cat); // For 'in' if I add my own listeners to each then I MUST do it before in gets called. If I listen globally for all incoming data instead though, regardless of individual listeners, I can transform the data there and then as well.
			cat.on('out', Gun.on.out, cat); // However for output, there isn't really the global option. I must listen by adding my own listener individually BEFORE this one is ever called.
			return chain;
		}

		function output(msg){
			var put, get, at = this.as, back = at.back, root = at.root, tmp;
			if(!msg.$){ msg.$ = at.$ }
			this.to.next(msg);
			if(at.err){ at.on('in', {put: at.put = u, $: at.$}); return }
			if(get = msg.get){
				/*if(u !== at.put){
					at.on('in', at);
					return;
				}*/
				if(root.pass){ root.pass[at.id] = at; } // will this make for buggy behavior elsewhere?
				if(at.lex){ Object.keys(at.lex).forEach(function(k){ tmp[k] = at.lex[k] }, tmp = msg.get = msg.get || {}) }
				if(get['#'] || at.soul){
					get['#'] = get['#'] || at.soul;
					//root.graph[get['#']] = root.graph[get['#']] || {_:{'#':get['#'],'>':{}}};
					msg['#'] || (msg['#'] = text_rand(9)); // A3120 ?
					back = (root.$.get(get['#'])._);
					if(!(get = get['.'])){ // soul
						tmp = back.ask && back.ask['']; // check if we have already asked for the full node
						(back.ask || (back.ask = {}))[''] = back; // add a flag that we are now.
						if(u !== back.put){ // if we already have data,
							back.on('in', back); // send what is cached down the chain
							if(tmp){ return } // and don't ask for it again.
						}
						msg.$ = back.$;
					} else
					if(obj_has(back.put, get)){ // TODO: support #LEX !
						tmp = back.ask && back.ask[get];
						(back.ask || (back.ask = {}))[get] = back.$.get(get)._;
						back.on('in', {get: get, put: {'#': back.soul, '.': get, ':': back.put[get], '>': state_is(root.graph[back.soul], get)}});
						if(tmp){ return }
					}
						/*put = (back.$.get(get)._);
						if(!(tmp = put.ack)){ put.ack = -1 }
						back.on('in', {
							$: back.$,
							put: Gun.state.ify({}, get, Gun.state(back.put, get), back.put[get]),
							get: back.get
						});
						if(tmp){ return }
					} else
					if('string' != typeof get){
						var put = {}, meta = (back.put||{})._;
						Gun.obj.map(back.put, function(v,k){
							if(!Gun.text.match(k, get)){ return }
							put[k] = v;
						})
						if(!Gun.obj.empty(put)){
							put._ = meta;
							back.on('in', {$: back.$, put: put, get: back.get})
						}
						if(tmp = at.lex){
							tmp = (tmp._) || (tmp._ = function(){});
							if(back.ack < tmp.ask){ tmp.ask = back.ack }
							if(tmp.ask){ return }
							tmp.ask = 1;
						}
					}
					*/
					root.ask(ack, msg); // A3120 ?
					return root.on('in', msg);
				}
				//if(root.now){ root.now[at.id] = root.now[at.id] || true; at.pass = {} }
				if(get['.']){
					if(at.get){
						msg = {get: {'.': at.get}, $: at.$};
						(back.ask || (back.ask = {}))[at.get] = msg.$._; // TODO: PERFORMANCE? More elegant way?
						return back.on('out', msg);
					}
					msg = {get: at.lex? msg.get : {}, $: at.$};
					return back.on('out', msg);
				}
				(at.ask || (at.ask = {}))[''] = at;	 //at.ack = at.ack || -1;
				if(at.get){
					get['.'] = at.get;
					(back.ask || (back.ask = {}))[at.get] = msg.$._; // TODO: PERFORMANCE? More elegant way?
					return back.on('out', msg);
				}
			}
			return back.on('out', msg);
		}; Gun.on.out = output;

		function input(msg, cat){ cat = cat || this.as; // TODO: V8 may not be able to optimize functions with different parameter calls, so try to do benchmark to see if there is any actual difference.
			var root = cat.root, gun = msg.$ || (msg.$ = cat.$), at = (gun||'')._ || empty, tmp = msg.put||'', soul = tmp['#'], key = tmp['.'], change = (u !== tmp['='])? tmp['='] : tmp[':'], state = tmp['>'] || -Infinity, sat; // eve = event, at = data at, cat = chain at, sat = sub at (children chains).
			if(u !== msg.put && (u === tmp['#'] || u === tmp['.'] || (u === tmp[':'] && u === tmp['=']) || u === tmp['>'])){ // convert from old format
				if(!valid(tmp)){
					if(!(soul = ((tmp||'')._||'')['#'])){ console.log("chain not yet supported for", tmp, '...', msg, cat); return; }
					gun = cat.root.$.get(soul);
					return setTimeout.each(Object.keys(tmp).sort(), function(k){ // TODO: .keys( is slow // BUG? ?Some re-in logic may depend on this being sync?
						if('_' == k || u === (state = state_is(tmp, k))){ return }
						cat.on('in', {$: gun, put: {'#': soul, '.': k, '=': tmp[k], '>': state}, VIA: msg});
					});
				}
				cat.on('in', {$: at.back.$, put: {'#': soul = at.back.soul, '.': key = at.has || at.get, '=': tmp, '>': state_is(at.back.put, key)}, via: msg}); // TODO: This could be buggy! It assumes/approxes data, other stuff could have corrupted it.
				return;
			}
			if((msg.seen||'')[cat.id]){ return } (msg.seen || (msg.seen = function(){}))[cat.id] = cat; // help stop some infinite loops

			if(cat !== at){ // don't worry about this when first understanding the code, it handles changing contexts on a message. A soul chain will never have a different context.
				Object.keys(msg).forEach(function(k){ tmp[k] = msg[k] }, tmp = {}); // make copy of message
				tmp.get = cat.get || tmp.get;
				if(!cat.soul && !cat.has){ // if we do not recognize the chain type
					tmp.$$$ = tmp.$$$ || cat.$; // make a reference to wherever it came from.
				} else
				if(at.soul){ // a has (property) chain will have a different context sometimes if it is linked (to a soul chain). Anything that is not a soul or has chain, will always have different contexts.
					tmp.$ = cat.$;
					tmp.$$ = tmp.$$ || at.$;
				}
				msg = tmp; // use the message with the new context instead;
			}
			unlink(msg, cat);

			if(((cat.soul/* && (cat.ask||'')['']*/) || msg.$$) && state >= state_is(root.graph[soul], key)){ // The root has an in-memory cache of the graph, but if our peer has asked for the data then we want a per deduplicated chain copy of the data that might have local edits on it.
				(tmp = root.$.get(soul)._).put = state_ify(tmp.put, key, state, change, soul);
			}
			if(!at.soul /*&& (at.ask||'')['']*/ && state >= state_is(root.graph[soul], key) && (sat = (root.$.get(soul)._.next||'')[key])){ // Same as above here, but for other types of chains. // TODO: Improve perf by preventing echoes recaching.
				sat.put = change; // update cache
				if('string' == typeof (tmp = valid(change))){
					sat.put = root.$.get(tmp)._.put || change; // share same cache as what we're linked to.
				}
			}

			this.to && this.to.next(msg); // 1st API job is to call all chain listeners.
			// TODO: Make input more reusable by only doing these (some?) calls if we are a chain we recognize? This means each input listener would be responsible for when listeners need to be called, which makes sense, as they might want to filter.
			cat.any && setTimeout.each(Object.keys(cat.any), function(any){ (any = cat.any[any]) && any(msg) },0,99); // 1st API job is to call all chain listeners. // TODO: .keys( is slow // BUG: Some re-in logic may depend on this being sync.
			cat.echo && setTimeout.each(Object.keys(cat.echo), function(lat){ (lat = cat.echo[lat]) && lat.on('in', msg) },0,99); // & linked at chains // TODO: .keys( is slow // BUG: Some re-in logic may depend on this being sync.

			if(((msg.$$||'')._||at).soul){ // comments are linear, but this line of code is non-linear, so if I were to comment what it does, you'd have to read 42 other comments first... but you can't read any of those comments until you first read this comment. What!? // shouldn't this match link's check?
				// is there cases where it is a $$ that we do NOT want to do the following? 
				if((sat = cat.next) && (sat = sat[key])){ // TODO: possible trick? Maybe have `ionmap` code set a sat? // TODO: Maybe we should do `cat.ask` instead? I guess does not matter.
					tmp = {}; Object.keys(msg).forEach(function(k){ tmp[k] = msg[k] });
					tmp.$ = (msg.$$||msg.$).get(tmp.get = key); delete tmp.$$; delete tmp.$$$;
					sat.on('in', tmp);
				}
			}

			link(msg, cat);
		}; Gun.on.in = input;

		function link(msg, cat){ cat = cat || this.as || msg.$._;
			if(msg.$$ && this !== Gun.on){ return } // $$ means we came from a link, so we are at the wrong level, thus ignore it unless overruled manually by being called directly.
			if(!msg.put || cat.soul){ return } // But you cannot overrule being linked to nothing, or trying to link a soul chain - that must never happen.
			var put = msg.put||'', link = put['=']||put[':'], tmp;
			var root = cat.root, tat = root.$.get(put['#']).get(put['.'])._;
			if('string' != typeof (link = valid(link))){
				if(this === Gun.on){ (tat.echo || (tat.echo = {}))[cat.id] = cat } // allow some chain to explicitly force linking to simple data.
				return; // by default do not link to data that is not a link.
			}
			if((tat.echo || (tat.echo = {}))[cat.id] // we've already linked ourselves so we do not need to do it again. Except... (annoying implementation details)
				&& !(root.pass||'')[cat.id]){ return } // if a new event listener was added, we need to make a pass through for it. The pass will be on the chain, not always the chain passed down. 
			if(tmp = root.pass){ if(tmp[link+cat.id]){ return } tmp[link+cat.id] = 1 } // But the above edge case may "pass through" on a circular graph causing infinite passes, so we hackily add a temporary check for that.

			(tat.echo||(tat.echo={}))[cat.id] = cat; // set ourself up for the echo! // TODO: BUG? Echo to self no longer causes problems? Confirm.

			if(cat.has){ cat.link = link }
			var sat = root.$.get(tat.link = link)._; // grab what we're linking to.
			(sat.echo || (sat.echo = {}))[tat.id] = tat; // link it.
			var tmp = cat.ask||''; // ask the chain for what needs to be loaded next!
			if(tmp[''] || cat.lex){ // we might need to load the whole thing // TODO: cat.lex probably has edge case bugs to it, need more test coverage.
				sat.on('out', {get: {'#': link}});
			}
			setTimeout.each(Object.keys(tmp), function(get, sat){ // if sub chains are asking for data. // TODO: .keys( is slow // BUG? ?Some re-in logic may depend on this being sync?
				if(!get || !(sat = tmp[get])){ return }
				sat.on('out', {get: {'#': link, '.': get}}); // go get it.
			},0,99);
		}; Gun.on.link = link;

		function unlink(msg, cat){ // ugh, so much code for seemingly edge case behavior.
			var put = msg.put||'', change = (u !== put['='])? put['='] : put[':'], root = cat.root, link, tmp;
			if(u === change){ // 1st edge case: If we have a brand new database, no data will be found.
				// TODO: BUG! because emptying cache could be async from below, make sure we are not emptying a newer cache. So maybe pass an Async ID to check against?
				// TODO: BUG! What if this is a map? // Warning! Clearing things out needs to be robust against sync/async ops, or else you'll see `map val get put` test catastrophically fail because map attempts to link when parent graph is streamed before child value gets set. Need to differentiate between lack acks and force clearing.
				if(cat.soul && u !== cat.put){ return } // data may not be found on a soul, but if a soul already has data, then nothing can clear the soul as a whole.
				//if(!cat.has){ return }
				tmp = (msg.$$||msg.$||'')._||'';
				if(msg['@'] && (u !== tmp.put || u !== cat.put)){ return } // a "not found" from other peers should not clear out data if we have already found it.
				//if(cat.has && u === cat.put && !(root.pass||'')[cat.id]){ return } // if we are already unlinked, do not call again, unless edge case. // TODO: BUG! This line should be deleted for "unlink deeply nested".
				if(link = cat.link || msg.linked){
					delete (root.$.get(link)._.echo||'')[cat.id];
				}
				if(cat.has){ // TODO: Empty out links, maps, echos, acks/asks, etc.?
					cat.link = null;
				}
				cat.put = u; // empty out the cache if, for example, alice's car's color no longer exists (relative to alice) if alice no longer has a car.
				// TODO: BUG! For maps, proxy this so the individual sub is triggered, not all subs.
				setTimeout.each(Object.keys(cat.next||''), function(get, sat){ // empty out all sub chains. // TODO: .keys( is slow // BUG? ?Some re-in logic may depend on this being sync? // TODO: BUG? This will trigger deeper put first, does put logic depend on nested order? // TODO: BUG! For map, this needs to be the isolated child, not all of them.
					if(!(sat = cat.next[get])){ return }
					//if(cat.has && u === sat.put && !(root.pass||'')[sat.id]){ return } // if we are already unlinked, do not call again, unless edge case. // TODO: BUG! This line should be deleted for "unlink deeply nested".
					if(link){ delete (root.$.get(link).get(get)._.echo||'')[sat.id] }
					sat.on('in', {get: get, put: u, $: sat.$}); // TODO: BUG? Add recursive seen check?
				},0,99);
				return;
			}
			if(cat.soul){ return } // a soul cannot unlink itself.
			if(msg.$$){ return } // a linked chain does not do the unlinking, the sub chain does. // TODO: BUG? Will this cancel maps?
			link = valid(change); // need to unlink anytime we are not the same link, though only do this once per unlink (and not on init).
			tmp = msg.$._||'';
			if(link === tmp.link || (cat.has && !tmp.link)){
				if((root.pass||'')[cat.id] && 'string' !== typeof link){

				} else {
					return;
				}
			}
			delete (tmp.echo||'')[cat.id];
			unlink({get: cat.get, put: u, $: msg.$, linked: msg.linked = msg.linked || tmp.link}, cat); // unlink our sub chains.
		}; Gun.on.unlink = unlink;

		function ack(msg, ev){
			//if(!msg['%'] && (this||'').off){ this.off() } // do NOT memory leak, turn off listeners! Now handled by .ask itself
			// manhattan:
			var as = this.as, at = as.$._, root = at.root, get = as.get||'', tmp = (msg.put||'')[get['#']]||'';
			if(!msg.put || ('string' == typeof get['.'] && u === tmp[get['.']])){
				if(u !== at.put){ return }
				if(!at.soul && !at.has){ return } // TODO: BUG? For now, only core-chains will handle not-founds, because bugs creep in if non-core chains are used as $ but we can revisit this later for more powerful extensions.
				at.ack = (at.ack || 0) + 1;
				at.on('in', {
					get: at.get,
					put: at.put = u,
					$: at.$,
					'@': msg['@']
				});
				/*(tmp = at.Q) && setTimeout.each(Object.keys(tmp), function(id){ // TODO: Temporary testing, not integrated or being used, probably delete.
					Object.keys(msg).forEach(function(k){ tmp[k] = msg[k] }, tmp = {}); tmp['@'] = id; // copy message
					root.on('in', tmp);
				}); delete at.Q;*/
				return;
			}
			(msg._||{}).miss = 1;
			Gun.on.put(msg);
			return; // eom
		}

		var empty = {}, u, text_rand = String.random, valid = Gun.valid, obj_has = function(o, k){ return o && Object.prototype.hasOwnProperty.call(o, k) }, state = Gun.state, state_is = state.is, state_ify = state.ify;
	})(USE, './chain');

	;USE(function(module){
		var Gun = USE('./root');
		Gun.chain.get = function(key, cb, as){
			var gun, tmp;
			if(typeof key === 'string'){
				if(key.length == 0) {	
					(gun = this.chain())._.err = {err: Gun.log('0 length key!', key)};
					if(cb){ cb.call(gun, gun._.err) }
					return gun;
				}
				var back = this, cat = back._;
				var next = cat.next || empty;
				if(!(gun = next[key])){
					gun = key && cache(key, back);
				}
				gun = gun && gun.$;
			} else
			if('function' == typeof key){
				if(true === cb){ return soul(this, key, cb, as), this }
				gun = this;
				var cat = gun._, opt = cb || {}, root = cat.root, id;
				opt.at = cat;
				opt.ok = key;
				var wait = {}; // can we assign this to the at instead, like in once?
				//var path = []; cat.$.back(at => { at.get && path.push(at.get.slice(0,9))}); path = path.reverse().join('.');
				function any(msg, eve, f){
					if(any.stun){ return }
					if((tmp = root.pass) && !tmp[id]){ return }
					var at = msg.$._, sat = (msg.$$||'')._, data = (sat||at).put, odd = (!at.has && !at.soul), test = {}, link, tmp;
					if(odd || u === data){ // handles non-core
						data = (u === ((tmp = msg.put)||'')['='])? (u === (tmp||'')[':'])? tmp : tmp[':'] : tmp['='];
					}
					if(link = ('string' == typeof (tmp = Gun.valid(data)))){
						data = (u === (tmp = root.$.get(tmp)._.put))? opt.not? u : data : tmp;
					}
					if(opt.not && u === data){ return }
					if(u === opt.stun){
						if((tmp = root.stun) && tmp.on){
							cat.$.back(function(a){ // our chain stunned?
								tmp.on(''+a.id, test = {});
								if((test.run || 0) < any.id){ return test } // if there is an earlier stun on gapless parents/self.
							});
							!test.run && tmp.on(''+at.id, test = {}); // this node stunned?
							!test.run && sat && tmp.on(''+sat.id, test = {}); // linked node stunned?
							if(any.id > test.run){
								if(!test.stun || test.stun.end){
									test.stun = tmp.on('stun');
									test.stun = test.stun && test.stun.last;
								}
								if(test.stun && !test.stun.end){
									//if(odd && u === data){ return }
									//if(u === msg.put){ return } // "not found" acks will be found if there is stun, so ignore these.
									(test.stun.add || (test.stun.add = {}))[id] = function(){ any(msg,eve,1) } // add ourself to the stun callback list that is called at end of the write.
									return;
								}
							}
						}
						if(/*odd &&*/ u === data){ f = 0 } // if data not found, keep waiting/trying.
						/*if(f && u === data){
							cat.on('out', opt.out);
							return;
						}*/
						if((tmp = root.hatch) && !tmp.end && u === opt.hatch && !f){ // quick hack! // What's going on here? Because data is streamed, we get things one by one, but a lot of developers would rather get a callback after each batch instead, so this does that by creating a wait list per chain id that is then called at the end of the batch by the hatch code in the root put listener.
							if(wait[at.$._.id]){ return } wait[at.$._.id] = 1;
							tmp.push(function(){any(msg,eve,1)});
							return;
						}; wait = {}; // end quick hack.
					}
					// call:
					if(root.pass){ if(root.pass[id+at.id]){ return } root.pass[id+at.id] = 1 }
					if(opt.on){ opt.ok.call(at.$, data, at.get, msg, eve || any); return } // TODO: Also consider breaking `this` since a lot of people do `=>` these days and `.call(` has slower performance.
					if(opt.v2020){ opt.ok(msg, eve || any); return }
					Object.keys(msg).forEach(function(k){ tmp[k] = msg[k] }, tmp = {}); msg = tmp; msg.put = data; // 2019 COMPATIBILITY! TODO: GET RID OF THIS!
					opt.ok.call(opt.as, msg, eve || any); // is this the right
				};
				any.at = cat;
				//(cat.any||(cat.any=function(msg){ setTimeout.each(Object.keys(cat.any||''), function(act){ (act = cat.any[act]) && act(msg) },0,99) }))[id = String.random(7)] = any; // maybe switch to this in future?
				(cat.any||(cat.any={}))[id = String.random(7)] = any;
				any.off = function(){ any.stun = 1; if(!cat.any){ return } delete cat.any[id] }
				any.rid = rid; // logic from old version, can we clean it up now?
				any.id = opt.run || ++root.once; // used in callback to check if we are earlier than a write. // will this ever cause an integer overflow?
				tmp = root.pass; (root.pass = {})[id] = 1; // Explanation: test trade-offs want to prevent recursion so we add/remove pass flag as it gets fulfilled to not repeat, however map map needs many pass flags - how do we reconcile?
				opt.out = opt.out || {get: {}};
				cat.on('out', opt.out);
				root.pass = tmp;
				return gun;
			} else
			if('number' == typeof key){
				return this.get(''+key, cb, as);
			} else
			if('string' == typeof (tmp = valid(key))){
				return this.get(tmp, cb, as);
			} else
			if(tmp = this.get.next){
				gun = tmp(this, key);
			}
			if(!gun){
				(gun = this.chain())._.err = {err: Gun.log('Invalid get request!', key)}; // CLEAN UP
				if(cb){ cb.call(gun, gun._.err) }
				return gun;
			}
			if(cb && 'function' == typeof cb){
				gun.get(cb, as);
			}
			return gun;
		}
		function cache(key, back){
			var cat = back._, next = cat.next, gun = back.chain(), at = gun._;
			if(!next){ next = cat.next = {} }
			next[at.get = key] = at;
			if(back === cat.root.$){
				at.soul = key;
				//at.put = {};
			} else
			if(cat.soul || cat.has){
				at.has = key;
				//if(obj_has(cat.put, key)){
					//at.put = cat.put[key];
				//}
			}
			return at;
		}
		function soul(gun, cb, opt, as){
			var cat = gun._, acks = 0, tmp;
			if(tmp = cat.soul || cat.link){ return cb(tmp, as, cat) }
			if(cat.jam){ return cat.jam.push([cb, as]) }
			cat.jam = [[cb,as]];
			gun.get(function go(msg, eve){
				if(u === msg.put && !cat.root.opt.super && (tmp = Object.keys(cat.root.opt.peers).length) && ++acks <= tmp){ // TODO: super should not be in core code, bring AXE up into core instead to fix? // TODO: .keys( is slow
					return;
				}
				eve.rid(msg);
				var at = ((at = msg.$) && at._) || {}, i = 0, as;
				tmp = cat.jam; delete cat.jam; // tmp = cat.jam.splice(0, 100);
				//if(tmp.length){ process.nextTick(function(){ go(msg, eve) }) }
				while(as = tmp[i++]){ //Gun.obj.map(tmp, function(as, cb){
					var cb = as[0], id; as = as[1];
					cb && cb(id = at.link || at.soul || Gun.valid(msg.put) || ((msg.put||{})._||{})['#'], as, msg, eve);
				} //);
			}, {out: {get: {'.':true}}});
			return gun;
		}
		function rid(at){
			var cat = this.at || this.on;
			if(!at || cat.soul || cat.has){ return this.off() }
			if(!(at = (at = (at = at.$ || at)._ || at).id)){ return }
			var map = cat.map, tmp, seen;
			//if(!map || !(tmp = map[at]) || !(tmp = tmp.at)){ return }
			if(tmp = (seen = this.seen || (this.seen = {}))[at]){ return true }
			seen[at] = true;
			//tmp.echo[cat.id] = {}; // TODO: Warning: This unsubscribes ALL of this chain's listeners from this link, not just the one callback event.
			//obj.del(map, at); // TODO: Warning: This unsubscribes ALL of this chain's listeners from this link, not just the one callback event.
			return;
		}
		var empty = {}, valid = Gun.valid, u;
	})(USE, './get');

	USE(function(module) {
    var Gun = USE('./root');

    /**
     * Puts data into the Gun database.
     * @param {Object|Function} data - The data to put into the database.
     * @param {Function} [cb] - Optional callback function.
     * @param {Object} [as] - Optional additional options.
     * @returns {Object} The Gun chain.
     */
    Gun.chain.put = function(data, cb, as) {
        var gun = this, at = gun._, root = at.root;
        as = as || {};
        as.root = at.root;
        as.run = as.run || root.once;
        stun(as, at.id); // Set a flag for reads to check if this chain is writing.
        as.ack = as.ack || cb;
        as.via = as.via || gun;
        as.data = as.data || data;
        as.soul = as.soul || at.soul || (typeof cb === 'string' && cb);
        var s = as.state = as.state || Gun.state();

        // If data is a function, execute it and put the result
        if (typeof data === 'function') {
            data(function(d) {
                as.data = d;
                gun.put(undefined, undefined, as);
            });
            return gun;
        }

        // If no soul is provided, retrieve it
        if (!as.soul) {
            return get(as), gun;
        }

        as.$ = root.$.get(as.soul);
        as.todo = [{ it: as.data, ref: as.$ }];
        as.turn = as.turn || turn;
        as.ran = as.ran || ran;

        // Walk through the data and process it
        (function walk() {
            var to = as.todo, at = to.pop(), d = at.it, cid = at.ref && at.ref._.id, v, k, cat, tmp, g;
            stun(as, at.ref);

            // Process nested data
            if (tmp = at.todo) {
                k = tmp.pop();
                d = d[k];
                if (tmp.length) {
                    to.push(at);
                }
            }

            k && (to.path || (to.path = [])).push(k);

            // Validate data
            if (!(v = valid(d)) && !(g = Gun.is(d))) {
                if (!Object.plain(d)) {
                    ran.err(as, `Invalid data: ${check(d)} at ${as.via.back(function(at) { at.get && tmp.push(at.get); }, tmp = []) || tmp.join('.')}.${(to.path || []).join('.')}`);
                    return;
                }
                var seen = as.seen || (as.seen = []), i = seen.length;
                while (i--) {
                    if (d === (tmp = seen[i]).it) {
                        v = d = tmp.link;
                        break;
                    }
                }
            }

            // Update state
            if (k && v) {
                at.node = state_ify(at.node, k, s, d);
            } else {
                if (!as.seen) {
                    ran.err(as, "Data at root of graph must be a node (an object).");
                    return;
                }
                as.seen.push(cat = { it: d, link: {}, todo: g ? [] : Object.keys(d).sort().reverse(), path: (to.path || []).slice(), up: at });
                at.node = state_ify(at.node, k, s, cat.link);
                !g && cat.todo.length && to.push(cat);

                var id = as.seen.length;
                (as.wait || (as.wait = {}))[id] = '';
                tmp = (cat.ref = (g ? d : k ? at.ref.get(k) : at.ref))._;
                (tmp = (d && (d._ || '')['#']) || tmp.soul || tmp.link) ? resolve({ soul: tmp }) : cat.ref.get(resolve, { run: as.run, v2020: 1, out: { get: { '.': ' ' } } });

                function resolve(msg, eve) {
                    var end = cat.link['#'];
                    if (eve) {
                        eve.off();
                        eve.rid(msg);
                    }
                    var soul = end || msg.soul || (tmp = (msg.$$ || msg.$)._ || '').soul || tmp.link || ((tmp = tmp.put || '')._ || '')['#'] || tmp['#'] || (((tmp = msg.put || '') && msg.$$) ? tmp['#'] : (tmp['='] || tmp[':'] || '')['#']);
                    !end && stun(as, msg.$);
                    if (!soul && !at.link['#']) {
                        (at.wait || (at.wait = [])).push(function() { resolve(msg, eve); });
                        return;
                    }
                    if (!soul) {
                        soul = [];
                        (msg.$$ || msg.$).back(function(at) {
                            if (tmp = at.soul || at.link) {
                                return soul.push(tmp);
                            }
                            soul.push(at.get);
                        });
                        soul = soul.reverse().join('/');
                    }
                    cat.link['#'] = soul;
                    !g && (((as.graph || (as.graph = {}))[soul] = (cat.node || (cat.node = { _: {} })))._['#'] = soul);
                    delete as.wait[id];
                    cat.wait && setTimeout.each(cat.wait, function(cb) { cb && cb(); });
                    as.ran(as);
                }
            }

            if (!to.length) {
                return as.ran(as);
            }
            as.turn(walk);
        }());

        return gun;
    };

    /**
     * Sets a flag for reads to check if this chain is writing.
     * @param {Object} as - The options object.
     * @param {string} id - The ID to stun.
     */
    function stun(as, id) {
        if (!id) {
            return;
        }
        id = (id._ || '').id || id;
        var run = as.root.stun || (as.root.stun = { on: Gun.on }), test = {}, tmp;
        as.stun || (as.stun = run.on('stun', function() {}));
        if (tmp = run.on('' + id)) {
            tmp.the.last.next(test);
        }
        if (test.run >= as.run) {
            return;
        }
        run.on('' + id, function(test) {
            if (as.stun.end) {
                this.off();
                this.to.next(test);
                return;
            }
            test.run = test.run || as.run;
            test.stun = test.stun || as.stun;
        });
    }

    /**
     * Handles the completion of the put operation.
     * @param {Object} as - The options object.
     */
    function ran(as) {
        if (as.err) {
            ran.end(as.stun, as.root);
            return;
        }
        if (as.todo.length || as.end || !Object.empty(as.wait)) {
            return;
        }
        as.end = 1;
        var cat = (as.$.back(-1)._), root = cat.root, ask = cat.ask(function(ack) {
            root.on('ack', ack);
            if (ack.err && !ack.lack) {
                Gun.log(ack);
            }
            if (++acks > (as.acks || 0)) {
                this.off();
            }
            if (!as.ack) {
                return;
            }
            as.ack(ack, this);
        }, as.opt), acks = 0, stun = as.stun, tmp;
        (tmp = function() {
            if (!stun) {
                return;
            }
            ran.end(stun, root);
            setTimeout.each(Object.keys(stun = stun.add || ''), function(cb) {
                if (cb = stun[cb]) {
                    cb();
                }
            });
        }).hatch = tmp;
        if (as.ack && !as.ok) {
            as.ok = as.acks || 9;
        }
        (as.via._).on('out', { put: as.out = as.graph, ok: as.ok && { '@': as.ok + 1 }, opt: as.opt, '#': ask, _: tmp });
    }

    /**
     * Ends the stun operation.
     * @param {Object} stun - The stun object.
     * @param {Object} root - The root object.
     */
    ran.end = function(stun, root) {
        stun.end = noop;
        if (stun.the.to === stun && stun === stun.the.last) {
            delete root.stun;
        }
        stun.off();
    };

    /**
     * Handles errors during the put operation.
     * @param {Object} as - The options object.
     * @param {string} err - The error message.
     */
    ran.err = function(as, err) {
        (as.ack || noop).call(as, as.out = { err: as.err = Gun.log(err) });
        as.ran(as);
    };

    /**
     * Retrieves data for the put operation.
     * @param {Object} as - The options object.
     */
    function get(as) {
        var at = as.via._, tmp;
        as.via = as.via.back(function(at) {
            if (at.soul || !at.get) {
                return at.$;
            }
            tmp = as.data;
            (as.data = {})[at.get] = tmp;
        });
        if (!as.via || !as.via._.soul) {
            as.via = at.root.$.get(((as.data || '')._ || '')['#'] || at.$.back('opt.uuid')());
        }
        as.via.put(as.data, as.ack, as);
    }

    /**
     * Checks the type of the data.
     * @param {any} d - The data to check.
     * @returns {string} The type of the data.
     */
    function check(d) {
        return ((d && (d.constructor && d.constructor.name)) || typeof d);
    }

    var u, empty = {}, noop = function() {}, turn = setTimeout.turn, valid = Gun.valid, state_ify = Gun.state.ify;
})(USE, './put');

	;USE(function(module){
		var Gun = USE('./root');
		USE('./chain');
		USE('./back');
		USE('./put');
		USE('./get');
		module.exports = Gun;
	})(USE, './core');

	;USE(function(module){
		var Gun = USE('./root');
		USE('./shim');
		USE('./onto');
		USE('./book');
		USE('./valid');
		USE('./state');
		USE('./dup');
		USE('./ask');
		USE('./core');
		USE('./on');
		USE('./map');
		USE('./set');
		USE('./mesh');
		USE('./websocket');
		USE('./localStorage');
		module.exports = Gun;
	})(USE, './index');

	USE(function(module){
		const Gun = USE('./root');
		
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
			const id = String.random(7);

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

	})(USE, './on');

	;USE(function(module){
		var Gun = USE('./root'), next = Gun.chain.get.next;
		Gun.chain.get.next = function(gun, lex){ var tmp;
			if(!Object.plain(lex)){ return (next||noop)(gun, lex) }
			if(tmp = ((tmp = lex['#'])||'')['='] || tmp){ return gun.get(tmp) }
			(tmp = gun.chain()._).lex = lex; // LEX!
			gun.on('in', function(eve){
				if(String.match(eve.get|| (eve.put||'')['.'], lex['.'] || lex['#'] || lex)){
					tmp.on('in', eve);
				}
				this.to.next(eve);
			});
			return tmp.$;
		}
		Gun.chain.map = function(cb, opt, t){
			var gun = this, cat = gun._, lex, chain;
			if(Object.plain(cb)){ lex = cb['.']? cb : {'.': cb}; cb = u }
			if(!cb){
				if(chain = cat.each){ return chain }
				(cat.each = chain = gun.chain())._.lex = lex || chain._.lex || cat.lex;
				chain._.nix = gun.back('nix');
				gun.on('in', map, chain._);
				return chain;
			}
			Gun.log.once("mapfn", "Map functions are experimental, their behavior and API may change moving forward. Please play with it and report bugs and ideas on how to improve it.");
			chain = gun.chain();
			gun.map().on(function(data, key, msg, eve){
				var next = (cb||noop).call(this, data, key, msg, eve);
				if(u === next){ return }
				if(data === next){ return chain._.on('in', msg) }
				if(Gun.is(next)){ return chain._.on('in', next._) }
				var tmp = {}; Object.keys(msg.put).forEach(function(k){ tmp[k] = msg.put[k] }, tmp); tmp['='] = next; 
				chain._.on('in', {get: key, put: tmp});
			});
			return chain;
		}
		function map(msg){ this.to.next(msg);
			var cat = this.as, gun = msg.$, at = gun._, put = msg.put, tmp;
			if(!at.soul && !msg.$$){ return } // this line took hundreds of tries to figure out. It only works if core checks to filter out above chains during link tho. This says "only bother to map on a node" for this layer of the chain. If something is not a node, map should not work.
			if((tmp = cat.lex) && !String.match(msg.get|| (put||'')['.'], tmp['.'] || tmp['#'] || tmp)){ return }
			Gun.on.link(msg, cat);
		}
		var noop = function(){}, event = {stun: noop, off: noop}, u;
	})(USE, './map');

	;USE(function(module){
		const Gun = USE('./root');
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
	})(USE, './set');

	;USE(function(module){
		USE('./shim');

		var noop = function(){}
		var parse = JSON.parseAsync || function(t,cb,r){ var u, d = +new Date; try{ cb(u, JSON.parse(t,r), json.sucks(+new Date - d)) }catch(e){ cb(e) } }
		var json = JSON.stringifyAsync || function(v,cb,r,s){ var u, d = +new Date; try{ cb(u, JSON.stringify(v,r,s), json.sucks(+new Date - d)) }catch(e){ cb(e) } }
		json.sucks = function(d){ if(d > 99){ console.log("Warning: JSON blocking CPU detected. Add `gun/lib/yson.js` to fix."); json.sucks = noop } }

		function Mesh(root){
			var mesh = function(){};
			var opt = root.opt || {};
			opt.log = opt.log || console.log;
			opt.gap = opt.gap || opt.wait || 0;
			opt.max = opt.max || (opt.memory? (opt.memory * 999 * 999) : 300000000) * 0.3;
			opt.pack = opt.pack || (opt.max * 0.01 * 0.01);
			opt.puff = opt.puff || 9; // IDEA: do a start/end benchmark, divide ops/result.
			var puff = setTimeout.turn || setTimeout;

			var dup = root.dup, dup_check = dup.check, dup_track = dup.track;

			var ST = +new Date, LT = ST;

			var hear = mesh.hear = function(raw, peer){
				if(!raw){ return }
				if(opt.max <= raw.length){ return mesh.say({dam: '!', err: "Message too big!"}, peer) }
				if(mesh === this){
					/*if('string' == typeof raw){ try{
						var stat = console.STAT || {};
						//console.log('HEAR:', peer.id, (raw||'').slice(0,250), ((raw||'').length / 1024 / 1024).toFixed(4));
						
						//console.log(setTimeout.turn.s.length, 'stacks', parseFloat((-(LT - (LT = +new Date))/1000).toFixed(3)), 'sec', parseFloat(((LT-ST)/1000 / 60).toFixed(1)), 'up', stat.peers||0, 'peers', stat.has||0, 'has', stat.memhused||0, stat.memused||0, stat.memax||0, 'heap mem max');
					}catch(e){ console.log('DBG err', e) }}*/
					hear.d += raw.length||0 ; ++hear.c } // STATS!
				var S = peer.SH = +new Date;
				var tmp = raw[0], msg;
				//raw && raw.slice && console.log("hear:", ((peer.wire||'').headers||'').origin, raw.length, raw.slice && raw.slice(0,50)); //tc-iamunique-tc-package-ds1
				if('[' === tmp){
					parse(raw, function(err, msg){
						if(err || !msg){ return mesh.say({dam: '!', err: "DAM JSON parse error."}, peer) }
						console.STAT && console.STAT(+new Date, msg.length, '# on hear batch');
						var P = opt.puff;
						(function go(){
							var S = +new Date;
							var i = 0, m; while(i < P && (m = msg[i++])){ mesh.hear(m, peer) }
							msg = msg.slice(i); // slicing after is faster than shifting during.
							console.STAT && console.STAT(S, +new Date - S, 'hear loop');
							flush(peer); // force send all synchronously batched acks.
							if(!msg.length){ return }
							puff(go, 0);
						}());
					});
					raw = ''; // 
					return;
				}
				if('{' === tmp || ((raw['#'] || Object.plain(raw)) && (msg = raw))){
					if(msg){ return hear.one(msg, peer, S) }
					parse(raw, function(err, msg){
						if(err || !msg){ return mesh.say({dam: '!', err: "DAM JSON parse error."}, peer) }
						hear.one(msg, peer, S);
					});
					return;
				}
			}
			hear.one = function(msg, peer, S){ // S here is temporary! Undo.
				var id, hash, tmp, ash, DBG;
				if(msg.DBG){ msg.DBG = DBG = {DBG: msg.DBG} }
				DBG && (DBG.h = S);
				DBG && (DBG.hp = +new Date);
				if(!(id = msg['#'])){ id = msg['#'] = String.random(9) }
				if(tmp = dup_check(id)){ return }
				// DAM logic:
				if(!(hash = msg['##']) && false && u !== msg.put){ /*hash = msg['##'] = Type.obj.hash(msg.put)*/ } // disable hashing for now // TODO: impose warning/penalty instead (?)
				if(hash && (tmp = msg['@'] || (msg.get && id)) && dup.check(ash = tmp+hash)){ return } // Imagine A <-> B <=> (C & D), C & D reply with same ACK but have different IDs, B can use hash to dedup. Or if a GET has a hash already, we shouldn't ACK if same.
				(msg._ = function(){}).via = mesh.leap = peer;
				if((tmp = msg['><']) && 'string' == typeof tmp){ tmp.slice(0,99).split(',').forEach(function(k){ this[k] = 1 }, (msg._).yo = {}) } // Peers already sent to, do not resend.
				// DAM ^
				if(tmp = msg.dam){
					(dup_track(id)||{}).via = peer;
					if(tmp = mesh.hear[tmp]){
						tmp(msg, peer, root);
					}
					return;
				}
				if(tmp = msg.ok){ msg._.near = tmp['/'] }
				var S = +new Date;
				DBG && (DBG.is = S); peer.SI = id;
				dup_track.ed = function(d){
					if(id !== d){ return }
					dup_track.ed = 0;
					if(!(d = dup.s[id])){ return }
					d.via = peer;
					if(msg.get){ d.it = msg }
				}
				root.on('in', mesh.last = msg);
				DBG && (DBG.hd = +new Date);
				console.STAT && console.STAT(S, +new Date - S, msg.get? 'msg get' : msg.put? 'msg put' : 'msg');
				dup_track(id); // in case 'in' does not call track.
				if(ash){ dup_track(ash) } //dup.track(tmp+hash, true).it = it(msg);
				mesh.leap = mesh.last = null; // warning! mesh.leap could be buggy.
			}
			var tomap = function(k,i,m){m(k,true)};
			hear.c = hear.d = 0;

			;(function(){
				var SMIA = 0;
				var loop;
				mesh.hash = function(msg, peer){ var h, s, t;
					var S = +new Date;
					json(msg.put, function hash(err, text){
						var ss = (s || (s = t = text||'')).slice(0, 32768); // 1024 * 32
					  h = String.hash(ss, h); s = s.slice(32768);
					  if(s){ puff(hash, 0); return }
						console.STAT && console.STAT(S, +new Date - S, 'say json+hash');
					  msg._.$put = t;
					  msg['##'] = h;
					  mesh.say(msg, peer);
					  delete msg._.$put;
					}, sort);
				}
				function sort(k, v){ var tmp;
					if(!(v instanceof Object)){ return v }
					Object.keys(v).sort().forEach(sorta, {to: tmp = {}, on: v});
					return tmp;
				} function sorta(k){ this.to[k] = this.on[k] }

				var say = mesh.say = function(msg, peer){ var tmp;
					if((tmp = this) && (tmp = tmp.to) && tmp.next){ tmp.next(msg) } // compatible with middleware adapters.
					if(!msg){ return false }
					var id, hash, raw, ack = msg['@'];
//if(opt.super && (!ack || !msg.put)){ return } // TODO: MANHATTAN STUB //OBVIOUSLY BUG! But squelch relay. // :( get only is 100%+ CPU usage :(
					var meta = msg._||(msg._=function(){});
					var DBG = msg.DBG, S = +new Date; meta.y = meta.y || S; if(!peer){ DBG && (DBG.y = S) }
					if(!(id = msg['#'])){ id = msg['#'] = String.random(9) }
					!loop && dup_track(id);//.it = it(msg); // track for 9 seconds, default. Earth<->Mars would need more! // always track, maybe move this to the 'after' logic if we split function.
					//if(msg.put && (msg.err || (dup.s[id]||'').err)){ return false } // TODO: in theory we should not be able to stun a message, but for now going to check if it can help network performance preventing invalid data to relay.
					if(!(hash = msg['##']) && u !== msg.put && !meta.via && ack){ mesh.hash(msg, peer); return } // TODO: Should broadcasts be hashed?
					if(!peer && ack){ peer = ((tmp = dup.s[ack]) && (tmp.via || ((tmp = tmp.it) && (tmp = tmp._) && tmp.via))) || ((tmp = mesh.last) && ack === tmp['#'] && mesh.leap) } // warning! mesh.leap could be buggy! mesh last check reduces this. // TODO: CLEAN UP THIS LINE NOW? `.it` should be reliable.
					if(!peer && ack){ // still no peer, then ack daisy chain 'tunnel' got lost.
						if(dup.s[ack]){ return } // in dups but no peer hints that this was ack to ourself, ignore.
						console.STAT && console.STAT(+new Date, ++SMIA, 'total no peer to ack to'); // TODO: Delete this now. Dropping lost ACKs is protocol fine now.
						return false;
					} // TODO: Temporary? If ack via trace has been lost, acks will go to all peers, which trashes browser bandwidth. Not relaying the ack will force sender to ask for ack again. Note, this is technically wrong for mesh behavior.
					if(ack && !msg.put && !hash && ((dup.s[ack]||'').it||'')['##']){ return false } // If we're saying 'not found' but a relay had data, do not bother sending our not found. // Is this correct, return false? // NOTE: ADD PANIC TEST FOR THIS!
					if(!peer && mesh.way){ return mesh.way(msg) }
					DBG && (DBG.yh = +new Date);
					if(!(raw = meta.raw)){ mesh.raw(msg, peer); return }
					DBG && (DBG.yr = +new Date);
					if(!peer || !peer.id){
						if(!Object.plain(peer || opt.peers)){ return false }
						var S = +new Date;
						var P = opt.puff, ps = opt.peers, pl = Object.keys(peer || opt.peers || {}); // TODO: .keys( is slow
						console.STAT && console.STAT(S, +new Date - S, 'peer keys');
						;(function go(){
							var S = +new Date;
							//Type.obj.map(peer || opt.peers, each); // in case peer is a peer list.
							loop = 1; var wr = meta.raw; meta.raw = raw; // quick perf hack
							var i = 0, p; while(i < 9 && (p = (pl||'')[i++])){
								if(!(p = ps[p] || (peer||'')[p])){ continue }
								mesh.say(msg, p);
							}
							meta.raw = wr; loop = 0;
							pl = pl.slice(i); // slicing after is faster than shifting during.
							console.STAT && console.STAT(S, +new Date - S, 'say loop');
							if(!pl.length){ return }
							puff(go, 0);
							ack && dup_track(ack); // keep for later
						}());
						return;
					}
					// TODO: PERF: consider splitting function here, so say loops do less work.
					if(!peer.wire && mesh.wire){ mesh.wire(peer) }
					if(id === peer.last){ return } peer.last = id;  // was it just sent?
					if(peer === meta.via){ return false } // don't send back to self.
					if((tmp = meta.yo) && (tmp[peer.url] || tmp[peer.pid] || tmp[peer.id]) /*&& !o*/){ return false }
					console.STAT && console.STAT(S, ((DBG||meta).yp = +new Date) - (meta.y || S), 'say prep');
					!loop && ack && dup_track(ack); // streaming long responses needs to keep alive the ack.
					if(peer.batch){
						peer.tail = (tmp = peer.tail || 0) + raw.length;
						if(peer.tail <= opt.pack){
							peer.batch += (tmp?',':'')+raw;
							return;
						}
						flush(peer);
					}
					peer.batch = '['; // Prevents double JSON!
					var ST = +new Date;
					setTimeout(function(){
						console.STAT && console.STAT(ST, +new Date - ST, '0ms TO');
						flush(peer);
					}, opt.gap); // TODO: queuing/batching might be bad for low-latency video game performance! Allow opt out?
					send(raw, peer);
					console.STAT && (ack === peer.SI) && console.STAT(S, +new Date - peer.SH, 'say ack');
				}
				mesh.say.c = mesh.say.d = 0;
				// TODO: this caused a out-of-memory crash!
				mesh.raw = function(msg, peer){ // TODO: Clean this up / delete it / move logic out!
					if(!msg){ return '' }
					var meta = (msg._) || {}, put, tmp;
					if(tmp = meta.raw){ return tmp }
					if('string' == typeof msg){ return msg }
					var hash = msg['##'], ack = msg['@'];
					if(hash && ack){
						if(!meta.via && dup_check(ack+hash)){ return false } // for our own out messages, memory & storage may ack the same thing, so dedup that. Tho if via another peer, we already tracked it upon hearing, so this will always trigger false positives, so don't do that!
						if(tmp = (dup.s[ack]||'').it){
							if(hash === tmp['##']){ return false } // if ask has a matching hash, acking is optional.
							if(!tmp['##']){ tmp['##'] = hash } // if none, add our hash to ask so anyone we relay to can dedup. // NOTE: May only check against 1st ack chunk, 2nd+ won't know and still stream back to relaying peers which may then dedup. Any way to fix this wasted bandwidth? I guess force rate limiting breaking change, that asking peer has to ask for next lexical chunk.
						}
					}
					if(!msg.dam && !msg['@']){
						var i = 0, to = []; tmp = opt.peers;
						for(var k in tmp){ var p = tmp[k]; // TODO: Make it up peers instead!
							to.push(p.url || p.pid || p.id);
							if(++i > 6){ break }
						}
						if(i > 1){ msg['><'] = to.join() } // TODO: BUG! This gets set regardless of peers sent to! Detect?
					}
					if(msg.put && (tmp = msg.ok)){ msg.ok = {'@':(tmp['@']||1)-1, '/': (tmp['/']==msg._.near)? mesh.near : tmp['/']}; }
					if(put = meta.$put){
						tmp = {}; Object.keys(msg).forEach(function(k){ tmp[k] = msg[k] });
						tmp.put = ':])([:';
						json(tmp, function(err, raw){
							if(err){ return } // TODO: Handle!!
							var S = +new Date;
							tmp = raw.indexOf('"put":":])([:"');
							res(u, raw = raw.slice(0, tmp+6) + put + raw.slice(tmp + 14));
							console.STAT && console.STAT(S, +new Date - S, 'say slice');
						});
						return;
					}
					json(msg, res);
					function res(err, raw){
						if(err){ return } // TODO: Handle!!
						meta.raw = raw; //if(meta && (raw||'').length < (999 * 99)){ meta.raw = raw } // HNPERF: If string too big, don't keep in memory.
						mesh.say(msg, peer);
					}
				}
			}());

			function flush(peer){
				var tmp = peer.batch, t = 'string' == typeof tmp, l;
				if(t){ tmp += ']' }// TODO: Prevent double JSON!
				peer.batch = peer.tail = null;
				if(!tmp){ return }
				if(t? 3 > tmp.length : !tmp.length){ return } // TODO: ^
				if(!t){try{tmp = (1 === tmp.length? tmp[0] : JSON.stringify(tmp));
				}catch(e){return opt.log('DAM JSON stringify error', e)}}
				if(!tmp){ return }
				send(tmp, peer);
			}
			// for now - find better place later.
			function send(raw, peer){ try{
				var wire = peer.wire;
				if(peer.say){
					peer.say(raw);
				} else
				if(wire.send){
					wire.send(raw);
				}
				mesh.say.d += raw.length||0; ++mesh.say.c; // STATS!
			}catch(e){
				(peer.queue = peer.queue || []).push(raw);
			}}

			mesh.near = 0;
			mesh.hi = function(peer){
				var wire = peer.wire, tmp;
				if(!wire){ mesh.wire((peer.length && {url: peer, id: peer}) || peer); return }
				if(peer.id){
					opt.peers[peer.url || peer.id] = peer;
				} else {
					tmp = peer.id = peer.id || peer.url || String.random(9);
					mesh.say({dam: '?', pid: root.opt.pid}, opt.peers[tmp] = peer);
					delete dup.s[peer.last]; // IMPORTANT: see https://gun.eco/docs/DAM#self
				}
				if(!peer.met){
					mesh.near++;
					peer.met = +(new Date);
					root.on('hi', peer)
				}
				// @rogowski I need this here by default for now to fix go1dfish's bug
				tmp = peer.queue; peer.queue = [];
				setTimeout.each(tmp||[],function(msg){
					send(msg, peer);
				},0,9);
				//Type.obj.native && Type.obj.native(); // dirty place to check if other JS polluted.
			}
			mesh.bye = function(peer){
				peer.met && --mesh.near;
				delete peer.met;
				root.on('bye', peer);
				var tmp = +(new Date); tmp = (tmp - (peer.met||tmp));
				mesh.bye.time = ((mesh.bye.time || tmp) + tmp) / 2;
			}
			mesh.hear['!'] = function(msg, peer){ opt.log('Error:', msg.err) }
			mesh.hear['?'] = function(msg, peer){
				if(msg.pid){
					if(!peer.pid){ peer.pid = msg.pid }
					if(msg['@']){ return }
				}
				mesh.say({dam: '?', pid: opt.pid, '@': msg['#']}, peer);
				delete dup.s[peer.last]; // IMPORTANT: see https://gun.eco/docs/DAM#self
			}
			mesh.hear['mob'] = function(msg, peer){ // NOTE: AXE will overload this with better logic.
				if(!msg.peers){ return }
				var peers = Object.keys(msg.peers), one = peers[(Math.random()*peers.length) >> 0];
				if(!one){ return }
				mesh.bye(peer);
				mesh.hi(one);
			}

			root.on('create', function(root){
				root.opt.pid = root.opt.pid || String.random(9);
				this.to.next(root);
				root.on('out', mesh.say);
			});

			root.on('bye', function(peer, tmp){
				peer = opt.peers[peer.id || peer] || peer;
				this.to.next(peer);
				peer.bye? peer.bye() : (tmp = peer.wire) && tmp.close && tmp.close();
				delete opt.peers[peer.id];
				peer.wire = null;
			});

			var gets = {};
			root.on('bye', function(peer, tmp){ this.to.next(peer);
				if(tmp = console.STAT){ tmp.peers = mesh.near; }
				if(!(tmp = peer.url)){ return } gets[tmp] = true;
				setTimeout(function(){ delete gets[tmp] },opt.lack || 9000);
			});
			root.on('hi', function(peer, tmp){ this.to.next(peer);
				if(tmp = console.STAT){ tmp.peers = mesh.near }
				if(opt.super){ return } // temporary (?) until we have better fix/solution?
				var souls = Object.keys(root.next||''); // TODO: .keys( is slow
				if(souls.length > 9999 && !console.SUBS){ console.log(console.SUBS = "Warning: You have more than 10K live GETs, which might use more bandwidth than your screen can show - consider `.off()`.") }
				setTimeout.each(souls, function(soul){ var node = root.next[soul];
					if(opt.super || (node.ask||'')['']){ mesh.say({get: {'#': soul}}, peer); return }
					setTimeout.each(Object.keys(node.ask||''), function(key){ if(!key){ return }
						// is the lack of ## a !onion hint?
						mesh.say({'##': String.hash((root.graph[soul]||'')[key]), get: {'#': soul, '.': key}}, peer);
						// TODO: Switch this so Book could route?
					})
				});
			});

			return mesh;
		}
	  var empty = {}, ok = true, u;

	  try{ module.exports = Mesh }catch(e){}

	})(USE, './mesh');

	;USE(function(module){
		var Gun = USE('./root');
		Gun.Mesh = USE('./mesh');

		// TODO: resync upon reconnect online/offline
		//window.ononline = window.onoffline = function(){ console.log('online?', navigator.onLine) }

		Gun.on('opt', function(root){
			this.to.next(root);
			if(root.once){ return }
			var opt = root.opt;
			if(false === opt.WebSocket){ return }

			var env = Gun.window || {};
			var websocket = opt.WebSocket || env.WebSocket || env.webkitWebSocket || env.mozWebSocket;
			if(!websocket){ return }
			opt.WebSocket = websocket;

			var mesh = opt.mesh = opt.mesh || Gun.Mesh(root);

			var wired = mesh.wire || opt.wire;
			mesh.wire = opt.wire = open;
			function open(peer){ try{
				if(!peer || !peer.url){ return wired && wired(peer) }
				var url = peer.url.replace(/^http/, 'ws');
				var wire = peer.wire = new opt.WebSocket(url);
				wire.onclose = function(){
					reconnect(peer);
					opt.mesh.bye(peer);
				};
				wire.onerror = function(err){
					reconnect(peer);
				};
				wire.onopen = function(){
					opt.mesh.hi(peer);
				}
				wire.onmessage = function(msg){
					if(!msg){ return }
					opt.mesh.hear(msg.data || msg, peer);
				};
				return wire;
			}catch(e){ opt.mesh.bye(peer) }}

			setTimeout(function(){ !opt.super && root.on('out', {dam:'hi'}) },1); // it can take a while to open a socket, so maybe no longer lazy load for perf reasons?

			var wait = 2 * 999;
			function reconnect(peer){
				clearTimeout(peer.defer);
				if(!opt.peers[peer.url]){ return }
				if(doc && peer.retry <= 0){ return }
				peer.retry = (peer.retry || opt.retry+1 || 60) - ((-peer.tried + (peer.tried = +new Date) < wait*4)?1:0);
				peer.defer = setTimeout(function to(){
					if(doc && doc.hidden){ return setTimeout(to,wait) }
					open(peer);
				}, wait);
			}
			var doc = (''+u !== typeof document) && document;
		});
		var noop = function(){}, u;
	})(USE, './websocket');

USE(function(module) {
    if (typeof Gun === 'undefined') return;

    const noop = () => {};
    let store;
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

    const parse = JSON.parseAsync || ((t, cb, r) => {
        try {
            cb(undefined, JSON.parse(t, r));
        } catch (e) {
            cb(e);
        }
    });

    const json = JSON.stringifyAsync || ((v, cb, r, s) => {
        try {
            cb(undefined, JSON.stringify(v, r, s));
        } catch (e) {
            cb(e);
        }
    });

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
})(USE, './localStorage');
}());

/* BELOW IS TEMPORARY FOR OLD INTERNAL COMPATIBILITY, THEY ARE IMMEDIATELY DEPRECATED AND WILL BE REMOVED IN NEXT VERSION */
;(function(){
	var u;
	if(''+u == typeof Gun){ return }
	var DEP = function(n){ console.warn("Warning! Deprecated internal utility will break in next version:", n) }
	// Generic javascript utilities.
	var Type = Gun;
	//Type.fns = Type.fn = {is: function(fn){ return (!!fn && fn instanceof Function) }}
	Type.fn = Type.fn || {is: function(fn){ DEP('fn'); return (!!fn && 'function' == typeof fn) }}
	Type.bi = Type.bi || {is: function(b){ DEP('bi');return (b instanceof Boolean || typeof b == 'boolean') }}
	Type.num = Type.num || {is: function(n){ DEP('num'); return !list_is(n) && ((n - parseFloat(n) + 1) >= 0 || Infinity === n || -Infinity === n) }}
	Type.text = Type.text || {is: function(t){ DEP('text'); return (typeof t == 'string') }}
	Type.text.ify = Type.text.ify || function(t){ DEP('text.ify');
		if(Type.text.is(t)){ return t }
		if(typeof JSON !== "undefined"){ return JSON.stringify(t) }
		return (t && t.toString)? t.toString() : t;
	}
	Type.text.random = Type.text.random || function(l, c){ DEP('text.random');
		var s = '';
		l = l || 24; // you are not going to make a 0 length random number, so no need to check type
		c = c || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz';
		while(l > 0){ s += c.charAt(Math.floor(Math.random() * c.length)); l-- }
		return s;
	}
	Type.text.match = Type.text.match || function(t, o){ var tmp, u; DEP('text.match');
		if('string' !== typeof t){ return false }
		if('string' == typeof o){ o = {'=': o} }
		o = o || {};
		tmp = (o['='] || o['*'] || o['>'] || o['<']);
		if(t === tmp){ return true }
		if(u !== o['=']){ return false }
		tmp = (o['*'] || o['>'] || o['<']);
		if(t.slice(0, (tmp||'').length) === tmp){ return true }
		if(u !== o['*']){ return false }
		if(u !== o['>'] && u !== o['<']){
			return (t >= o['>'] && t <= o['<'])? true : false;
		}
		if(u !== o['>'] && t >= o['>']){ return true }
		if(u !== o['<'] && t <= o['<']){ return true }
		return false;
	}
	Type.text.hash = Type.text.hash || function(s, c){ // via SO
		DEP('text.hash');
		if(typeof s !== 'string'){ return }
	  c = c || 0;
	  if(!s.length){ return c }
	  for(var i=0,l=s.length,n; i<l; ++i){
	    n = s.charCodeAt(i);
	    c = ((c<<5)-c)+n;
	    c |= 0;
	  }
	  return c;
	}
	Type.list = Type.list || {is: function(l){ DEP('list'); return (l instanceof Array) }}
	Type.list.slit = Type.list.slit || Array.prototype.slice;
	Type.list.sort = Type.list.sort || function(k){ // creates a new sort function based off some key
		DEP('list.sort');
		return function(A,B){
			if(!A || !B){ return 0 } A = A[k]; B = B[k];
			if(A < B){ return -1 }else if(A > B){ return 1 }
			else { return 0 }
		}
	}
	Type.list.map = Type.list.map || function(l, c, _){ DEP('list.map'); return obj_map(l, c, _) }
	Type.list.index = 1; // change this to 0 if you want non-logical, non-mathematical, non-matrix, non-convenient array notation
	Type.obj = Type.boj || {is: function(o){ DEP('obj'); return o? (o instanceof Object && o.constructor === Object) || Object.prototype.toString.call(o).match(/^\[object (\w+)\]$/)[1] === 'Object' : false }}
	Type.obj.put = Type.obj.put || function(o, k, v){ DEP('obj.put'); return (o||{})[k] = v, o }
	Type.obj.has = Type.obj.has || function(o, k){ DEP('obj.has'); return o && Object.prototype.hasOwnProperty.call(o, k) }
	Type.obj.del = Type.obj.del || function(o, k){ DEP('obj.del'); 
		if(!o){ return }
		o[k] = null;
		delete o[k];
		return o;
	}
	Type.obj.as = Type.obj.as || function(o, k, v, u){ DEP('obj.as'); return o[k] = o[k] || (u === v? {} : v) }
	Type.obj.ify = Type.obj.ify || function(o){ DEP('obj.ify'); 
		if(obj_is(o)){ return o }
		try{o = JSON.parse(o);
		}catch(e){o={}};
		return o;
	}
	;(function(){ var u;
		function map(v,k){
			if(obj_has(this,k) && u !== this[k]){ return }
			this[k] = v;
		}
		Type.obj.to = Type.obj.to || function(from, to){ DEP('obj.to'); 
			to = to || {};
			obj_map(from, map, to);
			return to;
		}
	}());
	Type.obj.copy = Type.obj.copy || function(o){ DEP('obj.copy'); // because http://web.archive.org/web/20140328224025/http://jsperf.com/cloning-an-object/2
		return !o? o : JSON.parse(JSON.stringify(o)); // is shockingly faster than anything else, and our data has to be a subset of JSON anyways!
	}
	;(function(){
		function empty(v,i){ var n = this.n, u;
			if(n && (i === n || (obj_is(n) && obj_has(n, i)))){ return }
			if(u !== i){ return true }
		}
		Type.obj.empty = Type.obj.empty || function(o, n){ DEP('obj.empty'); 
			if(!o){ return true }
			return obj_map(o,empty,{n:n})? false : true;
		}
	}());
	;(function(){
		function t(k,v){
			if(2 === arguments.length){
				t.r = t.r || {};
				t.r[k] = v;
				return;
			} t.r = t.r || [];
			t.r.push(k);
		};
		var keys = Object.keys, map, u;
		Object.keys = Object.keys || function(o){ return map(o, function(v,k,t){t(k)}) }
		Type.obj.map = map = Type.obj.map || function(l, c, _){ DEP('obj.map'); 
			var u, i = 0, x, r, ll, lle, f = 'function' == typeof c;
			t.r = u;
			if(keys && obj_is(l)){
				ll = keys(l); lle = true;
			}
			_ = _ || {};
			if(list_is(l) || ll){
				x = (ll || l).length;
				for(;i < x; i++){
					var ii = (i + Type.list.index);
					if(f){
						r = lle? c.call(_, l[ll[i]], ll[i], t) : c.call(_, l[i], ii, t);
						if(r !== u){ return r }
					} else {
						//if(Type.test.is(c,l[i])){ return ii } // should implement deep equality testing!
						if(c === l[lle? ll[i] : i]){ return ll? ll[i] : ii } // use this for now
					}
				}
			} else {
				for(i in l){
					if(f){
						if(obj_has(l,i)){
							r = _? c.call(_, l[i], i, t) : c(l[i], i, t);
							if(r !== u){ return r }
						}
					} else {
						//if(a.test.is(c,l[i])){ return i } // should implement deep equality testing!
						if(c === l[i]){ return i } // use this for now
					}
				}
			}
			return f? t.r : Type.list.index? 0 : -1;
		}
	}());
	Type.time = Type.time || {};
	Type.time.is = Type.time.is || function(t){ DEP('time'); return t? t instanceof Date : (+new Date().getTime()) }

	var fn_is = Type.fn.is;
	var list_is = Type.list.is;
	var obj = Type.obj, obj_is = obj.is, obj_has = obj.has, obj_map = obj.map;

	var Val = {};
	Val.is = function(v){ DEP('val.is'); // Valid values are a subset of JSON: null, binary, number (!Infinity), text, or a soul relation. Arrays need special algorithms to handle concurrency, so they are not supported directly. Use an extension that supports them if needed but research their problems first.
		if(v === u){ return false }
		if(v === null){ return true } // "deletes", nulling out keys.
		if(v === Infinity){ return false } // we want this to be, but JSON does not support it, sad face.
		if(text_is(v) // by "text" we mean strings.
		|| bi_is(v) // by "binary" we mean boolean.
		|| num_is(v)){ // by "number" we mean integers or decimals.
			return true; // simple values are valid.
		}
		return Val.link.is(v) || false; // is the value a soul relation? Then it is valid and return it. If not, everything else remaining is an invalid data type. Custom extensions can be built on top of these primitives to support other types.
	}
	Val.link = Val.rel = {_: '#'};
	;(function(){
		Val.link.is = function(v){ DEP('val.link.is'); // this defines whether an object is a soul relation or not, they look like this: {'#': 'UUID'}
			if(v && v[rel_] && !v._ && obj_is(v)){ // must be an object.
				var o = {};
				obj_map(v, map, o);
				if(o.id){ // a valid id was found.
					return o.id; // yay! Return it.
				}
			}
			return false; // the value was not a valid soul relation.
		}
		function map(s, k){ var o = this; // map over the object...
			if(o.id){ return o.id = false } // if ID is already defined AND we're still looping through the object, it is considered invalid.
			if(k == rel_ && text_is(s)){ // the key should be '#' and have a text value.
				o.id = s; // we found the soul!
			} else {
				return o.id = false; // if there exists anything else on the object that isn't the soul, then it is considered invalid.
			}
		}
	}());
	Val.link.ify = function(t){ DEP('val.link.ify'); return obj_put({}, rel_, t) } // convert a soul into a relation and return it.
	Type.obj.has._ = '.';
	var rel_ = Val.link._, u;
	var bi_is = Type.bi.is;
	var num_is = Type.num.is;
	var text_is = Type.text.is;
	var obj = Type.obj, obj_is = obj.is, obj_put = obj.put, obj_map = obj.map;

	Type.val = Type.val || Val;

	var Node = {_: '_'};
	Node.soul = function(n, o){ DEP('node.soul'); return (n && n._ && n._[o || soul_]) } // convenience function to check to see if there is a soul on a node and return it.
	Node.soul.ify = function(n, o){ DEP('node.soul.ify'); // put a soul on an object.
		o = (typeof o === 'string')? {soul: o} : o || {};
		n = n || {}; // make sure it exists.
		n._ = n._ || {}; // make sure meta exists.
		n._[soul_] = o.soul || n._[soul_] || text_random(); // put the soul on it.
		return n;
	}
	Node.soul._ = Val.link._;
	;(function(){
		Node.is = function(n, cb, as){ DEP('node.is'); var s; // checks to see if an object is a valid node.
			if(!obj_is(n)){ return false } // must be an object.
			if(s = Node.soul(n)){ // must have a soul on it.
				return !obj_map(n, map, {as:as,cb:cb,s:s,n:n});
			}
			return false; // nope! This was not a valid node.
		}
		function map(v, k){ // we invert this because the way we check for this is via a negation.
			if(k === Node._){ return } // skip over the metadata.
			if(!Val.is(v)){ return true } // it is true that this is an invalid node.
			if(this.cb){ this.cb.call(this.as, v, k, this.n, this.s) } // optionally callback each key/value.
		}
	}());
	;(function(){
		Node.ify = function(obj, o, as){ DEP('node.ify'); // returns a node from a shallow object.
			if(!o){ o = {} }
			else if(typeof o === 'string'){ o = {soul: o} }
			else if('function' == typeof o){ o = {map: o} }
			if(o.map){ o.node = o.map.call(as, obj, u, o.node || {}) }
			if(o.node = Node.soul.ify(o.node || {}, o)){
				obj_map(obj, map, {o:o,as:as});
			}
			return o.node; // This will only be a valid node if the object wasn't already deep!
		}
		function map(v, k){ var o = this.o, tmp, u; // iterate over each key/value.
			if(o.map){
				tmp = o.map.call(this.as, v, ''+k, o.node);
				if(u === tmp){
					obj_del(o.node, k);
				} else
				if(o.node){ o.node[k] = tmp }
				return;
			}
			if(Val.is(v)){
				o.node[k] = v;
			}
		}
	}());
	var obj = Type.obj, obj_is = obj.is, obj_del = obj.del, obj_map = obj.map;
	var text = Type.text, text_random = text.random;
	var soul_ = Node.soul._;
	var u;
	Type.node = Type.node || Node;

	var State = Type.state;
	State.lex = function(){ DEP('state.lex'); return State().toString(36).replace('.','') }
	State.to = function(from, k, to){ DEP('state.to'); 
		var val = (from||{})[k];
		if(obj_is(val)){
			val = obj_copy(val);
		}
		return State.ify(to, k, State.is(from, k), val, Node.soul(from));
	}
	;(function(){
		State.map = function(cb, s, as){ DEP('state.map'); var u; // for use with Node.ify
			var o = obj_is(o = cb || s)? o : null;
			cb = fn_is(cb = cb || s)? cb : null;
			if(o && !cb){
				s = num_is(s)? s : State();
				o[N_] = o[N_] || {};
				obj_map(o, map, {o:o,s:s});
				return o;
			}
			as = as || obj_is(s)? s : u;
			s = num_is(s)? s : State();
			return function(v, k, o, opt){
				if(!cb){
					map.call({o: o, s: s}, v,k);
					return v;
				}
				cb.call(as || this || {}, v, k, o, opt);
				if(obj_has(o,k) && u === o[k]){ return }
				map.call({o: o, s: s}, v,k);
			}
		}
		function map(v,k){
			if(N_ === k){ return }
			State.ify(this.o, k, this.s) ;
		}
	}());
	var obj = Type.obj, obj_as = obj.as, obj_has = obj.has, obj_is = obj.is, obj_map = obj.map, obj_copy = obj.copy;
	var num = Type.num, num_is = num.is;
	var fn = Type.fn, fn_is = fn.is;
	var N_ = Node._, u;

	var Graph = {};
	;(function(){
		Graph.is = function(g, cb, fn, as){ DEP('graph.is'); // checks to see if an object is a valid graph.
			if(!g || !obj_is(g) || obj_empty(g)){ return false } // must be an object.
			return !obj_map(g, map, {cb:cb,fn:fn,as:as}); // makes sure it wasn't an empty object.
		}
		function map(n, s){ // we invert this because the way'? we check for this is via a negation.
			if(!n || s !== Node.soul(n) || !Node.is(n, this.fn, this.as)){ return true } // it is true that this is an invalid graph.
			if(!this.cb){ return }
			nf.n = n; nf.as = this.as; // sequential race conditions aren't races.
			this.cb.call(nf.as, n, s, nf);
		}
		function nf(fn){ // optional callback for each node.
			if(fn){ Node.is(nf.n, fn, nf.as) } // where we then have an optional callback for each key/value.
		}
	}());
	;(function(){
		Graph.ify = function(obj, env, as){ DEP('graph.ify'); 
			var at = {path: [], obj: obj};
			if(!env){
				env = {};
			} else
			if(typeof env === 'string'){
				env = {soul: env};
			} else
			if('function' == typeof env){
				env.map = env;
			}
			if(typeof as === 'string'){
				env.soul = env.soul || as;
				as = u;
			}
			if(env.soul){
				at.link = Val.link.ify(env.soul);
			}
			env.shell = (as||{}).shell;
			env.graph = env.graph || {};
			env.seen = env.seen || [];
			env.as = env.as || as;
			node(env, at);
			env.root = at.node;
			return env.graph;
		}
		function node(env, at){ var tmp;
			if(tmp = seen(env, at)){ return tmp }
			at.env = env;
			at.soul = soul;
			if(Node.ify(at.obj, map, at)){
				at.link = at.link || Val.link.ify(Node.soul(at.node));
				if(at.obj !== env.shell){
					env.graph[Val.link.is(at.link)] = at.node;
				}
			}
			return at;
		}
		function map(v,k,n){
			var at = this, env = at.env, is, tmp;
			if(Node._ === k && obj_has(v,Val.link._)){
				return n._; // TODO: Bug?
			}
			if(!(is = valid(v,k,n, at,env))){ return }
			if(!k){
				at.node = at.node || n || {};
				if(obj_has(v, Node._) && Node.soul(v)){ // ? for safety ?
					at.node._ = obj_copy(v._);
				}
				at.node = Node.soul.ify(at.node, Val.link.is(at.link));
				at.link = at.link || Val.link.ify(Node.soul(at.node));
			}
			if(tmp = env.map){
				tmp.call(env.as || {}, v,k,n, at);
				if(obj_has(n,k)){
					v = n[k];
					if(u === v){
						obj_del(n, k);
						return;
					}
					if(!(is = valid(v,k,n, at,env))){ return }
				}
			}
			if(!k){ return at.node }
			if(true === is){
				return v;
			}
			tmp = node(env, {obj: v, path: at.path.concat(k)});
			if(!tmp.node){ return }
			return tmp.link; //{'#': Node.soul(tmp.node)};
		}
		function soul(id){ var at = this;
			var prev = Val.link.is(at.link), graph = at.env.graph;
			at.link = at.link || Val.link.ify(id);
			at.link[Val.link._] = id;
			if(at.node && at.node[Node._]){
				at.node[Node._][Val.link._] = id;
			}
			if(obj_has(graph, prev)){
				graph[id] = graph[prev];
				obj_del(graph, prev);
			}
		}
		function valid(v,k,n, at,env){ var tmp;
			if(Val.is(v)){ return true }
			if(obj_is(v)){ return 1 }
			if(tmp = env.invalid){
				v = tmp.call(env.as || {}, v,k,n);
				return valid(v,k,n, at,env);
			}
			env.err = "Invalid value at '" + at.path.concat(k).join('.') + "'!";
			if(Type.list.is(v)){ env.err += " Use `.set(item)` instead of an Array." }
		}
		function seen(env, at){
			var arr = env.seen, i = arr.length, has;
			while(i--){ has = arr[i];
				if(at.obj === has.obj){ return has }
			}
			arr.push(at);
		}
	}());
	Graph.node = function(node){ DEP('graph.node'); 
		var soul = Node.soul(node);
		if(!soul){ return }
		return obj_put({}, soul, node);
	}
	;(function(){
		Graph.to = function(graph, root, opt){ DEP('graph.to'); 
			if(!graph){ return }
			var obj = {};
			opt = opt || {seen: {}};
			obj_map(graph[root], map, {obj:obj, graph: graph, opt: opt});
			return obj;
		}
		function map(v,k){ var tmp, obj;
			if(Node._ === k){
				if(obj_empty(v, Val.link._)){
					return;
				}
				this.obj[k] = obj_copy(v);
				return;
			}
			if(!(tmp = Val.link.is(v))){
				this.obj[k] = v;
				return;
			}
			if(obj = this.opt.seen[tmp]){
				this.obj[k] = obj;
				return;
			}
			this.obj[k] = this.opt.seen[tmp] = Graph.to(this.graph, tmp, this.opt);
		}
	}());
	var fn_is = Type.fn.is;
	var obj = Type.obj, obj_is = obj.is, obj_del = obj.del, obj_has = obj.has, obj_empty = obj.empty, obj_put = obj.put, obj_map = obj.map, obj_copy = obj.copy;
	var u;
	Type.graph = Type.graph || Graph;
}());
