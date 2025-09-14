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