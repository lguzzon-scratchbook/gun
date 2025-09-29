;(function(){

  /* UNBUILD */
// biome-ignore lint/correctness/noUnusedVariables: Odd case to be maintained
function USE(arg, req) {
  return req
    ? require(arg)
    : arg.slice
      ? USE[R(arg)]
      : (mod, path) => {
          mod = { exports: {} }
          arg(mod)
          USE[R(path)] = mod.exports
        }
  function R(p) {
    const lastSlash = p.lastIndexOf('/')
    const filename = lastSlash === -1 ? p : p.substring(lastSlash + 1)
    return filename.replace('.js', '')
  }
}
if (typeof module !== 'undefined') {
  // biome-ignore lint/correctness/noInnerDeclarations: Odd case to be maintained
  // biome-ignore lint/correctness/noUnusedVariables: Odd case to be maintained
  var MODULE = module
}

  /* UNBUILD */

	;USE(function(module){
		/**
		   * Generates a random string of specified length using the given character set.
		   * @param {number} [length=24] - The length of the random string.
		   * @param {string} [chars='0123456789ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz'] - The character set to use.
		   * @returns {string} The generated random string.
		   *
		   * Flow: Initializes an empty string, sets default length and charset if not provided,
		   * then appends random characters from the charset in a decrementing loop until length is reached.
		   */
		  String.random = (
		    length = 24,
		    chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz'
		  ) => {
		    return Array.from({ length }, () =>
		      chars.charAt(Math.floor(Math.random() * chars.length))
		    ).join('')
		  }

		  /**
		   * Custom matching function for strings against various criteria.
		   * Supports exact match ('='), prefix match ('*'), greater than ('>'), less than ('<'), or range.
		   * @param {string} text - The string to match.
		   * @param {object|string} options - Matching criteria (object with keys '=', '*', '>', '<' or a string for exact match).
		   * @returns {boolean} True if the text matches the criteria, false otherwise.
		   *
		   * Flow:
		   * 1. Validate input types.
		   * 2. Normalize options to an object if it's a string.
		   * 3. Check for exact match using a fallback tmp value.
		   * 4. Handle cases where exact match is defined (early return false if mismatched).
		   * 5. Check for prefix match.
		   * 6. Handle range or inequality checks if applicable.
		   * Note: This function uses 'undefined' checks implicitly via 'u' to determine presence of options.
		   */
		  String.match = (text, options) => {
		    let tmp
		    const u = undefined // Explicitly set for clarity in undefined checks
		    if (typeof text !== 'string') {
		      return false
		    }
		    if (typeof options === 'string') {
		      options = { '=': options }
		    }
		    options = options || {}
		    tmp = options['='] || options['*'] || options['>'] || options['<']
		    if (text === tmp) {
		      return true
		    }
		    if (u !== options['=']) {
		      return false
		    }
		    tmp = options['*'] || options['>']
		    if (text.slice(0, (tmp || '').length) === tmp) {
		      return true
		    }
		    if (u !== options['*']) {
		      return false
		    }
		    if (u !== options['>'] && u !== options['<']) {
		      return !!(text >= options['>'] && text <= options['<'])
		    }
		    if (u !== options['>'] && text >= options['>']) {
		      return true
		    }
		    if (u !== options['<'] && text <= options['<']) {
		      return true
		    }
		    return false
		  }

		  /**
		   * Computes a simple hash for a string.
		   * @param {string} str - The input string.
		   * @param {number} [seed=0] - Initial seed value for hashing.
		   * @returns {number|undefined} The hash value or undefined if input is not a string.
		   *
		   * Flow: Validates input, iterates over each character, updates the hash using bit shifts and addition.
		   */
		  String.hash = (str, seed = 0) => {
		    if (typeof str !== 'string') {
		      return
		    }
		    if (!str.length) {
		      return seed
		    }
		    for (let i = 0, len = str.length; i < len; ++i) {
		      const charCode = str.charCodeAt(i)
		      seed = (seed << 5) - seed + charCode
		      seed |= 0 // Convert to 32-bit integer
		    }
		    return seed
		  }

		  const hasOwn = Object.prototype.hasOwnProperty

		  /**
		   * Checks if an object is a plain object (not an instance of a custom class or other types).
		   * @param {any} obj - The object to check.
		   * @returns {boolean} True if it's a plain object, false otherwise.
		   *
		   * Flow: Checks constructor and uses toString for confirmation.
		   */
		  Object.plain = (obj) => {
		    return obj
		      ? (obj instanceof Object && obj.constructor === Object) ||
		          Object.prototype.toString
		            .call(obj)
		            .match(/^\[object (\w+)\]$/)?.[1] === 'Object'
		      : false
		  }

		  /**
		   * Checks if an object is empty, optionally ignoring specified keys.
		   * @param {object} obj - The object to check.
		   * @param {string[]} [ignoreKeys] - Array of keys to ignore.
		   * @returns {boolean} True if empty (considering ignored keys), false otherwise.
		   *
		   * Flow: Iterates over own properties, returns false if any non-ignored key is found.
		   */
		  Object.empty = (obj, ignoreKeys) => {
		    if (!obj) return true
		    return !Object.keys(obj).some(
		      (key) => !ignoreKeys || ignoreKeys.indexOf(key) === -1
		    )
		  }

		  /**
		   * Polyfill for Object.keys if not available.
		   * @param {object} obj - The object whose keys to retrieve.
		   * @returns {string[]} Array of own enumerable keys.
		   *
		   * Flow: Uses native if available, otherwise iterates and collects keys.
		   */
		  Object.keys =
		    Object.keys ||
		    ((obj) => {
		      const keys = []
		      for (const key in obj) {
		        if (hasOwn.call(obj, key)) {
		          keys.push(key)
		        }
		      }
		      return keys
		    })

		  // Enhanced setTimeout utilities for polling and efficient asynchronous execution.
		  ;(() => {
		    const setT = setTimeout
		    let lastTime = 0
		    let counter = 0

		    // Use MessageChannel for microtask-like behavior if available, fallback to setTimeout.
		    const scheduleImmediate =
		      (typeof setImmediate !== 'undefined' && setImmediate) ||
		      (() => {
		        if (typeof MessageChannel === 'undefined') {
		          return setT
		        }
		        const channel = new MessageChannel()
		        let callback
		        channel.port1.onmessage = (event) => {
		          if (event.data === '') callback()
		        }
		        return (fn) => {
		          callback = fn
		          channel.port2.postMessage('')
		        }
		      })()

		    // Performance.now fallback to Date.now.
		    let perf
		    if (!setT.check) {
		      setT.check = (typeof performance !== 'undefined' && performance) || {
		        now: () => Date.now()
		      }
		    }
		    perf = setT.check

		    // Minimum hold time for polling (e.g., half a frame).
		    setT.hold = setT.hold || 9

		    /**
		     * Polls a function efficiently, batching if within hold time.
		     * @param {Function} fn - The function to poll/execute.
		     *
		     * Flow: If within hold time and under counter limit, execute immediately and increment counter.
		     * Otherwise, reset counter and schedule via scheduleImmediate, updating lastTime.
		     */
		    setT.poll =
		      setT.poll ||
		      ((fn) => {
		        if (setT.hold >= perf.now() - lastTime && counter < 3333) {
		          counter++
		          fn()
		          return
		        }
		        counter = 0
		        scheduleImmediate(() => {
		          lastTime = perf.now()
		          fn()
		        })
		      })
		  })()

		  // Turn-based threading over a single thread to avoid blocking with too many polls.
		  ;(() => {
		    const setT = setTimeout
		    const poll = setT.poll
		    let queue
		    if (!setT.turn) {
		      setT.turn = (fn) => {
		        if (queue.push(fn) === 1) {
		          poll(processQueue)
		        }
		      }
		    }
		    const turn = setT.turn
		    if (!turn.s) turn.s = []
		    queue = turn.s
		    let index = 0

		    /**
		     * Processes the queue in turns.
		     *
		     * Flow: Executes the next function in queue, increments index.
		     * If at end or 99 items, slices remaining queue and resets index.
		     * Reschedules if more items remain.
		     */
		    const processQueue = () => {
		      const fn = queue[index]
		      index++
		      if (fn) {
		        fn()
		      }
		      if (index === queue.length || index === 99) {
		        queue = queue.slice(index)
		        turn.s = queue
		        index = 0
		      }
		      if (queue.length) {
		        poll(processQueue)
		      }
		    }
		  })()

		  // Each utility for processing arrays in batches asynchronously.
		  ;(() => {
		    const u = undefined
		    const setT = setTimeout
		    const turn = setT.turn

		    if (!setT.each) {
		      /**
		       * Processes an array in batches asynchronously.
		       * @param {any[]} list - The array to process.
		       * @param {Function} processFn - Function to apply to each item.
		       * @param {Function} [callback] - Optional callback on completion or error.
		       * @param {number} [batchSize=9] - Number of items per batch.
		       *
		       * Flow: Splices batches from the list, processes them synchronously in loop,
		       * schedules next batch via turn if more remain and no early return, or calls callback.
		       */
		      setT.each = (list, processFn, callback, batchSize) => {
		        if (!batchSize) batchSize = 9
		        ;(function processBatch() {
		          const batch = (list || []).splice(0, batchSize)
		          const batchLen = batch.length
		          if (batchLen) {
		            let result
		            for (const item of batch) {
		              result = processFn(item)
		              if (u !== result) {
		                break
		              }
		            }
		            if (u === result) {
		              turn(processBatch)
		              return
		            }
		            // biome-ignore lint/complexity/useOptionalChain: TODO: Investigate better... odd cases
		            callback && callback(result)
		          } else {
		            // biome-ignore lint/complexity/useOptionalChain: TODO: Investigate better... odd cases
		            callback && callback()
		          }
		        })()
		      }
		    }
		  })()
	})(USE, './shim');

	;USE(function(module){
		/**
		   * Event Emitter Utility - A lightweight event system for JavaScript
		   *
		   * This module provides a simple event emitter implementation that allows:
		   * - Registering event listeners
		   * - Emitting events to registered listeners
		   * - Removing event listeners
		   * - Chaining event listeners
		   *
		   * @module EventEmitter
		   */

		  /**
		   * Main event emitter function that handles both event registration and emission
		   *
		   * @param {string} eventName - The name of the event to listen to or emit
		   * @param {Function|*} handler - Event handler function or data to emit
		   * @param {*} context - Optional context for the event handler
		   * @returns {Object|Function} Returns event system object or listener for chaining
		   */
		  function onto(eventName, handler, context) {
		    // If no event name provided, return the onto function for chaining
		    if (!eventName) {
		      return { to: onto }
		    }

		    const isFunction = typeof handler === 'function'

		    // Initialize event registry if it doesn't exist
		    this.tag ??= {}

		    // Get existing event or create new one if handler is a function
		    let eventRegistry = this.tag[eventName]

		    if (!eventRegistry && isFunction) {
		      // Create new event registry with terminal node
		      eventRegistry = this.tag[eventName] = {
		        tag: eventName,
		        to: onto.terminalNode
		      }
		    }

		    // If handler is a function, register it as a listener
		    if (isFunction) {
		      return registerEventListener(eventRegistry, handler, context, this)
		    }

		    // If handler is not a function, emit the event
		    if (eventRegistry?.to && handler !== undefined) {
		      eventRegistry.to.next(handler)
		    }

		    return eventRegistry?.to
		  }

		  /**
		   * Terminal node for the event chain - handles the end of the listener chain
		   */
		  onto.terminalNode = {
		    next(data) {
		      // Pass data to next listener in chain if it exists
		      this.to?.next(data)
		    }
		  }

		  /**
		   * Registers a new event listener in the event chain
		   *
		   * @param {Object} eventRegistry - The event registry object
		   * @param {Function} handler - The event handler function
		   * @param {*} context - Optional context for the handler
		   * @param {Object} emitter - The event emitter instance
		   * @returns {Object} The new listener object
		   */
		  function registerEventListener(eventRegistry, handler, context, emitter) {
		    const listener = {
		      as: context,
		      next: handler,
		      off: removeListener,
		      on: emitter,
		      the: eventRegistry,
		      to: onto.terminalNode
		    }

		    // Link the new listener into the chain
		    const previousLast = eventRegistry.last || eventRegistry
		    listener.back = previousLast
		    previousLast.to = listener
		    eventRegistry.last = listener

		    return listener
		  }

		  /**
		   * Removes a listener from the event chain
		   * This function is bound to each listener object as the 'off' method
		   *
		   * @returns {boolean} True if listener was already removed
		   */
		  function removeListener() {
		    // Check if already removed
		    if (this.next === onto.terminalNode.next) {
		      return true
		    }

		    // Update the last pointer if this is the last listener
		    if (this === this.the.last) {
		      this.the.last = this.back
		    }

		    // Remove from the chain by linking previous to next
		    this.to.back = this.back
		    this.back.to = this.to

		    // Mark as removed
		    this.next = onto.terminalNode.next

		    // Clean up event registry if no more listeners
		    if (this.the.last === this.the) {
		      delete this.on.tag[this.the.tag]
		    }

		    return false
		  }

		  // Attach the removal function to the main onto function for access
		  onto.off = removeListener

		  // Export the module
		  if (module?.exports) {
		    module.exports = onto
		  } else if (typeof window !== 'undefined') {
		    window.onto = onto
		  }
	})(USE, './onto');

	;USE(function(module){
		// Book is a replacement for JS objects, maps, dictionaries.
		  const sT = setTimeout
		  let B = sT.Book
		  if (!B) {
		    /**
		     * Creates a new Book instance.
		     * @param {string} [initialText] - Optional serialized text to initialize the book.
		     * @returns {Function} The book function for key-value operations.
		     */
		    B = sT.Book = (initialText) => {
		      const bookInstance = function book(key, value) {
		        const cachedItem = bookInstance.all[key]
		        if (value === undefined) {
		          return cachedItem ? cachedItem.is : bookInstance.get(key)
		        }
		        if (cachedItem) {
		          // Update existing item
		          const pageObj = cachedItem.page
		          if (pageObj) {
		            pageObj.size += size(value) - size(cachedItem.is)
		            pageObj.text = ''
		          }
		          cachedItem.text = ''
		          cachedItem.is = value
		          return bookInstance
		        }
		        return bookInstance.set(key, value)
		      }
		      // Initialize with root page
		      bookInstance.list = [
		        {
		          book: bookInstance,
		          from: initialText,
		          get: bookInstance,
		          read: list,
		          size: (initialText || '').length,
		          substring: sub,
		          toString: to
		        }
		      ]
		      bookInstance.page = page
		      bookInstance.set = set
		      bookInstance.get = get
		      bookInstance.cache = {}
		      return bookInstance
		    }
		  }
		  const PAGE = 2 ** 12

		  /**
		   * Retrieves the page for the given word.
		   * If the page is stored as a string, converts it to an object.
		   * @param {string} searchWord - The word to search for.
		   * @returns {Object} The page object.
		   */
		  function page(searchWord) {
		    const pageList = this.list
		    // Find the appropriate page index for the searchWord
		    const index = spot(searchWord, pageList, this.parse)
		    let pageObj = pageList[index]
		    if (typeof pageObj === 'string') {
		      // Lazy loading: convert serialized page string to object
		      pageList[index] = pageObj = {
		        book: this,
		        first: this.parse ? this.parse(pageObj) : pageObj,
		        get: this,
		        read: list,
		        size: -1, // Size will be calculated later
		        substring: sub,
		        toString: to
		      }
		    }
		    // Note: If page size exceeds limit after operations, it may be split, requiring re-getting the page
		    return pageObj
		  }
		  /**
		   * Retrieves the value associated with the given word.
		   * Checks in-memory cache first, then searches in pages.
		   * @param {string} searchWord - The word to search for.
		   * @returns {*} The value associated with the word, or undefined if not found.
		   */
		  function get(searchWord) {
		    if (!searchWord) return
		    // If searchWord is an object with 'is' property, return its value
		    if (searchWord.is !== undefined) return searchWord.is
		    // Check in-memory cache
		    const cachedItem = this.cache[searchWord]
		    if (cachedItem) return cachedItem.is
		    // Search in the appropriate page
		    const pageObj = this.page(searchWord)
		    if (!pageObj || !pageObj.from) return // No data in this page
		    return got(searchWord, pageObj)
		  }
		  /**
		   * Retrieves the value for a word from a page.
		   * Handles exact matches, non-exact matches, and escaped keys.
		   * @param {string} searchWord - The word to retrieve.
		   * @param {Object} pageObj - The page object.
		   * @returns {*} The value associated with the word, or undefined if not found.
		   */
		  function got(searchWord, pageObj) {
		    const book = pageObj.book
		    // Get the parsed array from the page
		    const fromArray = from(pageObj)
		    if (!fromArray) return // No data in page
		    // Find the insertion point using binary search
		    let index = spot(searchWord, fromArray, B.decode)
		    got.i = index // Store index for external use
		    let currentItem = fromArray[index]
		    // Attempt exact match with the item at the spotted index
		    if (currentItem && searchWord === currentItem.word) {
		      // Exact match found, cache and return
		      book.cache[searchWord] = currentItem
		      return currentItem.is
		    }
		    // If current item is not a string, it might be an object; check the next item
		    if (typeof currentItem !== 'string') {
		      index += 1
		      got.i = index
		      currentItem = fromArray[index]
		      if (currentItem && searchWord === currentItem.word) {
		        // Found match in next item
		        book.cache[searchWord] = currentItem
		        return currentItem.is
		      }
		    }
		    // No exact match, treat currentItem as serialized key-value pair
		    const [key, val] = slot(currentItem) // Parse the serialized pair
		    const decodedKey = B.decode(key)
		    if (searchWord !== decodedKey) {
		      // Not matching current, try the next item as escaped pair
		      index += 1
		      got.i = index
		      currentItem = fromArray[index]
		      if (!currentItem) return // No more items
		      const [nextKey, nextVal] = slot(currentItem)
		      if (searchWord !== B.decode(nextKey)) {
		        return // No match found
		      }
		      // Found in next item, create and cache the parsed item
		      fromArray[index] = book.cache[searchWord] = {
		        is: B.decode(nextVal),
		        page: pageObj,
		        substring: subt,
		        toString: tot,
		        word: String(searchWord)
		      }
		      return fromArray[index].is
		    }
		    // Found in current item, create and cache the parsed item
		    currentItem =
		      fromArray[index] =
		      book.cache[searchWord] =
		        {
		          is: B.decode(val),
		          page: pageObj,
		          substring: subt,
		          toString: tot,
		          word: String(searchWord)
		        }
		    return currentItem.is
		  }

		  /**
		   * Performs a binary search on a sorted array to find the insertion point for a word.
		   * @param {string} searchWord - The word to search for.
		   * @param {Array} sortedArray - The sorted array to search in.
		   * @param {Function} [parseFn] - Optional parse function to transform array elements.
		   * @returns {number} The index where the word should be inserted.
		   */
		  function spot(searchWord, sortedArray, parseFn) {
		    if (!Array.isArray(sortedArray)) {
		      throw new TypeError('sortedArray must be an array')
		    }
		    if (parseFn && typeof parseFn !== 'function') {
		      throw new TypeError('parseFn must be a function if provided')
		    }
		    if (!parseFn) {
		      if (!spot.no) {
		        spot.no = (value) => value
		      }
		      parseFn = spot.no
		    }
		    let lowIndex = 0
		    let highIndex = sortedArray.length
		    const searchWordStr = String(searchWord)
		    while (lowIndex < highIndex) {
		      const midIndex = Math.floor((lowIndex + highIndex) / 2)
		      const midValue = parseFn(sortedArray[midIndex]) || ''
		      if (searchWordStr < midValue) {
		        highIndex = midIndex
		      } else {
		        lowIndex = midIndex + 1
		      }
		    }
		    return lowIndex
		  }

		  /**
		   * Processes the 'from' property of the given object.
		   * If 'from' is not a string, returns it as is.
		   * Otherwise, parses it using slot and updates the object.
		   * @param {Object} obj - The object containing the 'from' property.
		   * @param {string|*} obj.from - The value to process.
		   * @returns {*} The processed value.
		   */
		  function from(obj) {
		    if (typeof obj.from !== 'string') {
		      return obj.from
		    }
		    const text = obj.from || ''
		    const parsedArray = slot(text)
		    obj.from = parsedArray
		    return parsedArray
		  }
		  /**
		   * Lists the items in the book, applying the map function to each item.
		   * @param {Function} [mapFn] - Function to apply to each item. Defaults to identity.
		   * @returns {Array} Array of results from applying mapFn to each item.
		   */
		  function list(mapFn = (value) => value) {
		    const sortedItemsArray = sort(this)
		    const parseFn = this.book?.parse ?? (() => {})
		    return sortedItemsArray.map((item) => {
		      const word = item.word || parseFn(item) || item
		      return mapFn(this.get(word), word, this)
		    })
		  }

		  /**
		   * Sets the value for a key in the book.
		   * Handles updates and inserts, managing page sizes and splits.
		   * @param {string} key - The key to set.
		   * @param {*} value - The value to set.
		   * @returns {Function} The book function.
		   */
		  function set(key, value) {
		    // Check if already in memory
		    let existingItem = this.cache[key]
		    if (existingItem) {
		      return this(key, value) // Update via main function
		    }
		    const keyStr = String(key)
		    const pageObj = this.page(keyStr)
		    // Check if it's an update in parseless data
		    if (pageObj?.from) {
		      this.get(key)
		      if (this.cache[key]) {
		        return this(key, value)
		      }
		    }
		    // Insert new item
		    existingItem = this.cache[keyStr] = {
		      is: value,
		      page: pageObj,
		      substring: subt,
		      toString: tot,
		      word: keyStr
		    }
		    pageObj.first = pageObj.first < keyStr ? pageObj.first : keyStr
		    if (!pageObj.limbo) pageObj.limbo = []
		    pageObj.limbo.push(existingItem)
		    this(key, value) // Update main function
		    pageObj.size += size(keyStr) + size(value)
		    if ((this.PAGE ?? PAGE) < pageObj.size) {
		      split(pageObj, this)
		    }
		    return this
		  }

		  /**
		   * Splits a page when it exceeds the size limit.
		   * Creates a new page with the second half of items.
		   * @param {Object} pageObj - The page to split.
		   * @param {Object} book - The book containing the page.
		   */
		  function split(pageObj, book) {
		    const sortedItemsArray = sort(pageObj)
		    const length = sortedItemsArray.length
		    const midIndex = Math.floor(length / 2)
		    const midItem = sortedItemsArray[midIndex]
		    const newPageObj = {
		      book: book,
		      first: midItem.substring(), // Word of the middle item
		      get: book,
		      read: list,
		      size: 0,
		      substring: sub,
		      toString: to
		    }
		    newPageObj.from = []
		    const newFromArray = newPageObj.from
		    // Move second half to new page
		    for (let index = midIndex; index < length; index++) {
		      const item = sortedItemsArray[index]
		      newFromArray.push(item)
		      newPageObj.size += size(item.word) + size(item.is)
		      item.page = newPageObj
		    }
		    // Keep first half in original page
		    pageObj.from = pageObj.from.slice(0, midIndex)
		    pageObj.size -= newPageObj.size
		    // Insert new page into book's list
		    const insertIndex = spot(newPageObj.first, book.list, book.parse) + 1
		    book.list.splice(insertIndex, 0, newPageObj)
		    // Notify if split callback exists
		    if (book.split) {
		      book.split(newPageObj, pageObj)
		    }
		  }

		  /**
		   * Parses a serialized string into an array.
		   * @param {string} text - The serialized string to parse.
		   * @returns {Array} The parsed array.
		   */
		  function slot(text) {
		    text = text ?? ''
		    return heal(text.substring(1, text.length - 1).split(text[0]), text[0])
		  }
		  B.slot = slot // TODO: check first=last & pass `s`.
		  /**
		   * Heals an array by rejoining escaped values split by a separator.
		   * Escaped values are marked by an empty string followed by length-prefixed data.
		   * @param {Array} array - The array to heal.
		   * @param {string} [separator] - The separator, defaults to '|'.
		   * @returns {Array} The healed array.
		   */
		  function heal(array, separator) {
		    if (!Array.isArray(array)) return []
		    if (typeof separator !== 'string') separator = '|'
		    // Find the index of the empty string marker for escaped values
		    const emptyIndex = array.indexOf('')
		    if (emptyIndex < 0) {
		      // No escaped values, return as is
		      return array
		    }
		    if (array[0] === '' && array.length === 1) {
		      // Handle edge case of single empty string
		      return []
		    }
		    // Extract the escaped segment info
		    const originalEscape = array[emptyIndex + 1] // The element after empty contains length prefix and data
		    const parsedLength = parseInt(
		      originalEscape.substring(0, originalEscape.indexOf('"')) ||
		        originalEscape,
		      10
		    ) // Parse the length of the escaped value
		    const endIndex = emptyIndex + 2 + parsedLength // Calculate the end index of the escaped segment
		    if (Number.isNaN(endIndex)) {
		      // Invalid length, return empty
		      return []
		    }
		    // Rejoin the escaped parts into the original value
		    array[emptyIndex] = array.slice(emptyIndex, endIndex).join(separator ?? '|')
		    // Recursively heal the remaining parts
		    return array
		      .slice(0, emptyIndex + 1)
		      .concat(heal(array.slice(endIndex), separator))
		  }

		  /**
		   * Calculates the size of a value for storage purposes.
		   * Returns the length of the string representation, or 1 if empty.
		   * @param {any} value - The value to measure.
		   * @returns {number} The size, at least 1.
		   */
		  function size(value) {
		    return (value ?? '').length || 1
		  }
		  /**
		   * Returns the word property of the item.
		   * @returns {string} The word.
		   */
		  function subt() {
		    return this.word
		  }
		  /**
		   * Converts the item to its encoded string representation.
		   * @returns {string} The encoded text.
		   */
		  function tot() {
		    this.text = this.text || `:${B.encode(this.word)}:${B.encode(this.is)}:`
		    return this.text
		  }
		  /**
		   * Returns a substring of the first word or decoded value.
		   * @param {number} startIndex - Start index.
		   * @param {number} endIndex - End index.
		   * @returns {string} The substring.
		   */
		  function sub(startIndex, endIndex) {
		    return (
		      this.first ||
		      this.word ||
		      B.decode((from(this) || '')[0] || '')
		    ).substring(startIndex, endIndex)
		  }
		  /**
		   * Returns the string representation of the page.
		   * @returns {string} The text.
		   */
		  function to() {
		    this.text = this.text || text(this)
		    return this.text
		  }
		  /**
		   * Generates the serialized text for a page.
		   * If the page has limbo items, sorts them first.
		   * Empty page is represented as '||'.
		   * @param {Object} pageObj - The page object.
		   * @returns {string} The serialized string.
		   */
		  function text(pageObj) {
		    // PERF: read->[*] : text->"*" no edit waste 1 time perf.
		    if (pageObj.limbo) {
		      sort(pageObj)
		    }
		    return typeof pageObj.from === 'string'
		      ? pageObj.from
		      : `|${(pageObj.from || []).join('|')}|`
		  }

		  /**
		   * Sorts the page's items, mixing in any limbo items.
		   * @param {Object} pageObj - The page object.
		   * @param {Array} [limboArray] - Optional limbo array.
		   * @returns {Array} The sorted array.
		   */
		  function sort(pageObj, limboArray) {
		    const fromArray =
		      typeof pageObj.from === 'string' ? slot(pageObj.from) : pageObj.from || []
		    pageObj.from = fromArray
		    const limbo = limboArray || pageObj.limbo
		    if (!limbo) {
		      return fromArray
		    }
		    return mix(pageObj, limbo).sort((a, b) =>
		      (a.word || B.decode(String(a))) < (b.word || B.decode(String(b))) ? -1 : 1
		    )
		  }
		  /**
		   * Merges limbo items into the page's from array.
		   * @param {Object} pageObj - The page object.
		   * @param {Array} [limboArray] - Optional limbo array.
		   * @returns {Array} The merged array.
		   */
		  function mix(pageObj, limboArray) {
		    // TODO: IMPROVE PERFORMANCE!!!! l[j] = i is 5X+ faster than .push(
		    const limbo = limboArray || pageObj.limbo || []
		    pageObj.limbo = null
		    const fromArray = pageObj.from
		    limbo.forEach((item) => {
		      if (got(item.word, pageObj)) {
		        fromArray[got.i] = item // TODO: Trick: allow for a GUN'S HAM CRDT hook here.
		      } else {
		        fromArray.push(item)
		      }
		    })
		    return fromArray
		  }

		  /**
		   * Encodes a value into a serialized string format.
		   * @param {*} data - The value to encode.
		   * @param {string} [separator='|'] - The separator character.
		   * @param {string} [unitSeparator=' '] - The unit separator character.
		   * @returns {string} The encoded string.
		   */
		  B.encode = (data, separator, unitSeparator) => {
		    const sepStr = separator || '|'
		    const unitSepStr = unitSeparator || String.fromCharCode(32)
		    switch (typeof data) {
		      case 'string': {
		        // text
		        let index = data.indexOf(sepStr)
		        let count = 0
		        while (index !== -1) {
		          count++
		          index = data.indexOf(sepStr, index + 1)
		        }
		        return `${count ? `${sepStr}${count}` : ''}"${data}`
		      }
		      case 'number':
		        return data < 0 ? `${data}` : `+${data}`
		      case 'boolean':
		        return data ? '+' : '-'
		      case 'object': {
		        if (!data) {
		          return ' '
		        } // TODO: BUG!!! Nested objects don't slot correctly
		        const keysArray = Object.keys(data).sort()
		        return keysArray.reduce(
		          (result, key) =>
		            `${result}${unitSepStr}${B.encode(key, sepStr, unitSepStr)}${unitSepStr}${B.encode(data[key], sepStr, unitSepStr)}${unitSepStr}${sepStr}`,
		          sepStr
		        )
		      }
		    }
		  }
		  /**
		   * Decodes a serialized string back into its original value.
		   * @param {string} text - The encoded string to decode.
		   * @returns {*} The decoded value.
		   */
		  B.decode = (text) => {
		    if (typeof text !== 'string') return
		    if (text === ' ') return null
		    if (text === '-') return false
		    if (text === '+') return true
		    if (text[0] === '"') return text.slice(1)
		    if (text[0] === '-' || text[0] === '+') return parseFloat(text)
		    if (text[0] === '|') {
		      const quoteIndex = text.indexOf('"')
		      if (quoteIndex > 0) {
		        // Escaped string with separator count
		        return text.slice(quoteIndex + 1)
		      } else {
		        // Object
		        const partsArray = text.slice(1, -1).split('|')
		        const resultObj = {}
		        for (const currentPart of partsArray) {
		          if (!currentPart) continue
		          const trimmed = currentPart.trim()
		          const parts = trimmed.split(' ')
		          if (parts.length >= 2) {
		            const [keyStr, valStr] = parts
		            resultObj[B.decode(keyStr)] = B.decode(valStr)
		          }
		        }
		        return resultObj
		      }
		    }
		    return text
		  }

		  /**
		   * Computes a hash value for a string.
		   * @param {string} inputStr - The string to hash.
		   * @param {number} [initialHash=0] - Initial hash value.
		   * @returns {number} The computed hash.
		   */
		  B.hash = (inputStr, initialHash) => {
		    // via SO
		    if (typeof inputStr !== 'string') {
		      return
		    }
		    const hashValue = initialHash ?? 0 // CPU schedule hashing by
		    if (!inputStr.length) {
		      return hashValue
		    }
		    let tempHash = hashValue
		    for (let index = 0, length = inputStr.length; index < length; ++index) {
		      const charCode = inputStr.charCodeAt(index)
		      tempHash = (tempHash << 5) - tempHash + charCode
		      tempHash |= 0
		    }
		    return tempHash
		  }

		  try {
		    module.exports = B
		  } catch {}
	})(USE, './book');

	;USE(function(module){
		// Valid values are a subset of JSON: null, binary, number (!Infinity), text,
		  // or a soul relation. Arrays need special algorithms to handle concurrency,
		  // so they are not supported directly. Use an extension that supports them if
		  // needed but research their problems first.

		  /**
		   * Validates if a value is a valid Gun value.
		   * Valid values include null, strings, booleans, finite numbers, and soul relations (objects with a single '#' key).
		   * @param {*} v - The value to validate.
		   * @returns {boolean} - Returns true if the value is valid, false otherwise.
		   * @example
		   * // Valid values
		   * valid(null); // true
		   * valid("hello"); // true
		   * valid(true); // true
		   * valid(42); // true
		   * valid({ "#": "soul123" }); // true
		   *
		   * // Invalid values
		   * valid(Infinity); // false
		   * valid({}); // false
		   * valid([]); // false
		   */
		  module.exports = (v) => {
		    // "deletes", nulling out keys.
		    return (
		      // Allow null values (used for deletions)
		      v === null ||
		      // Allow string values
		      'string' === typeof v ||
		      // Allow boolean values
		      'boolean' === typeof v ||
		      // Allow finite numbers (exclude Infinity and NaN)
		      Number.isFinite(v) ||
		      // Allow soul relations: objects with exactly one key '#' that is a non-empty string
		      (!!v &&
		        Object.hasOwn(v, '#') &&
		        typeof v['#'] === 'string' &&
		        Object.keys(v).length === 1 &&
		        v['#'])
		    )
		  }
	})(USE, './valid');

	;USE(function(module){
		/**
		   * State Management Module
		   *
		   * This module provides a state management system with timestamp-based versioning
		   * for distributed data synchronization. It generates unique timestamps with
		   * microsecond precision to ensure proper ordering of state changes.
		   *
		   * Key Features:
		   * - Monotonically increasing timestamps
		   * - State drift compensation
		   * - Node state management utilities
		   *
		   * @module State
		   */

		  // Import polyfills and compatibility shims
		  USE('./shim')

		  // Constants for state management
		  const NEGATIVE_INFINITY = -Infinity
		  const DECIMAL_PRECISION = 999 // Microsecond precision multiplier
		  const UNDEFINED = undefined

		  // Module state variables
		  let nodeCounter = 0
		  let lastTimestamp = NEGATIVE_INFINITY

		  /**
		   * Generates a unique, monotonically increasing timestamp for state versioning.
		   *
		   * The timestamp system ensures that each state change gets a unique identifier
		   * that maintains chronological order, even when multiple changes occur within
		   * the same millisecond.
		   *
		   * Algorithm:
		   * 1. Get current timestamp in milliseconds
		   * 2. If current time > last recorded time, reset counter and use current time
		   * 3. If current time <= last recorded time, increment counter and add fractional precision
		   * 4. Apply drift compensation for clock synchronization
		   *
		   * @returns {number} Unique timestamp with microsecond precision
		   */
		  function State() {
		    const currentTime = Date.now()

		    if (lastTimestamp < currentTime) {
		      // Reset counter for new millisecond
		      nodeCounter = 0
		      lastTimestamp = currentTime + State.drift
		      return lastTimestamp
		    }

		    // Increment counter and add fractional precision for same millisecond
		    nodeCounter += 1
		    lastTimestamp = currentTime + nodeCounter / DECIMAL_PRECISION + State.drift
		    return lastTimestamp
		  }

		  /**
		   * Clock drift compensation value for distributed system synchronization.
		   * Can be adjusted to compensate for network latency and clock differences.
		   * @type {number}
		   */
		  State.drift = 0

		  /**
		   * Retrieves the state timestamp for a specific key on a node.
		   *
		   * This utility function safely extracts state information from a node's
		   * metadata structure, providing a fallback value if the state doesn't exist.
		   *
		   * @param {Object} node - The node object containing state metadata
		   * @param {string} key - The key to retrieve state for
		   * @param {*} fallback - Fallback value if state doesn't exist
		   * @returns {number|*} The state timestamp or fallback value
		   *
		   * @example
		   * const stateValue = State.is(node, 'name', -Infinity);
		   * console.log(stateValue); // Returns timestamp or -Infinity
		   */
		  State.is = (node, key, fallback) => {
		    // Safely navigate to the state metadata
		    const stateMetadata = (key && node?._ && node._['>']) || fallback

		    if (!stateMetadata) {
		      return fallback
		    }

		    const stateValue = stateMetadata[key]
		    return typeof stateValue === 'number' ? stateValue : NEGATIVE_INFINITY
		  }

		  /**
		   * Sets state information on a node for a specific key.
		   *
		   * This function manages the node's metadata structure, ensuring proper
		   * initialization and state tracking for distributed synchronization.
		   *
		   * Node Structure:
		   * - node._['#']: Soul identifier (unique node ID)
		   * - node._['>']: State timestamps for each key
		   * - node[key]: Actual data values
		   *
		   * @param {Object} node - The target node (will be created if null/undefined)
		   * @param {string} key - The key to set state for
		   * @param {number} stateTimestamp - The timestamp for this state change
		   * @param {*} value - The actual value to store
		   * @param {string} [soul] - Optional soul identifier for the node
		   * @returns {Object} The modified node object
		   *
		   * @example
		   * const node = State.ify({}, 'name', Date.now(), 'John', 'user123');
		   * console.log(node.name); // 'John'
		   * console.log(node._['>'].name); // timestamp
		   */
		  State.ify = (node, key, stateTimestamp, value, soul) => {
		    // Initialize node and metadata if needed
		    const targetNode = node || {}
		    targetNode._ = targetNode._ || {}

		    // Set soul identifier if provided
		    if (soul) {
		      targetNode._['#'] = soul
		    }

		    // Initialize or get state metadata object
		    if (!targetNode._['>']) {
		      targetNode._['>'] = {}
		    }
		    const stateMetadata = targetNode._['>']

		    // Set state and value for valid keys (excluding metadata keys)
		    if (key !== UNDEFINED && key !== '_') {
		      // Set state timestamp if it's a valid number
		      if (typeof stateTimestamp === 'number') {
		        stateMetadata[key] = stateTimestamp
		      }

		      // Set the actual value (validation is caller's responsibility)
		      if (value !== UNDEFINED) {
		        targetNode[key] = value
		      }
		    }

		    return targetNode
		  }

		  // Export the State function and its utilities
		  module.exports = State
	})(USE, './state');

	;USE(function(module){
		/**
		   * @module dup
		   * Module for tracking duplicate IDs with automatic cleanup.
		   */
		  USE('./shim')
		  /**
		   * Creates a Dup instance for tracking duplicate IDs with automatic cleanup.
		   * @param {Object} [opt] - Options object.
		   * @param {number} [opt.age=9000] - Age in ms for cleanup.
		   * @param {number} [opt.max=999] - Max items.
		   * @returns {Object} Dup instance with check, track, drop methods.
		   */
		  function Dup(opt = { age: 1000 * 9, max: 999 }) {
		    const dup = { s: new Map() }
		    const s = dup.s
		    /**
		     * Checks if an ID is tracked, and updates its timestamp if so.
		     * @param {string} id - The ID to check.
		     * @returns {Object|boolean} The tracked item or false.
		     */
		    dup.check = (id) => {
		      if (!s.has(id)) return false
		      return dt(id)
		    }
		    /**
		     * Tracks an ID with timestamp.
		     * @param {string} id - The ID to track.
		     * @returns {Object} The tracked item.
		     */
		    dup.track = (id) => {
		      if (!s.has(id)) {
		        s.set(id, {})
		      }
		      const it = s.get(id)
		      const now = Date.now()
		      it.was = now
		      dup.now = now
		      if (!dup.to) {
		        dup.to = setTimeout(dup.drop, opt.age + 9)
		      }
		      dt.ed?.(id)
		      return it
		    }
		    const dt = dup.track
		    /**
		     * Drops old tracked items based on age.
		     * @param {number} [age] - Optional age override.
		     */
		    dup.drop = (age) => {
		      dup.to = null
		      dup.now = Date.now()
		      const l = Array.from(s.keys())
		      console.STAT?.(dup.now, Date.now() - dup.now, 'dup drop keys') // prev ~20% CPU 7% RAM 300MB // now ~25% CPU 7% RAM 500MB
		      setTimeout.each(
		        l,
		        (id) => {
		          const it = s.get(id)
		          if (it && (age || opt.age) > dup.now - it.was) {
		            return
		          }
		          s.delete(id)
		        },
		        0,
		        99
		      )
		    }
		    return dup
		  }
		  module.exports = Dup
	})(USE, './dup');

	;USE(function(module){
		// request / response module, for asking and acknowledging messages.
		  USE('./onto') // depends upon onto!

		  /**
		   * Utility function to manage request timeouts.
		   * @param {object} request - The request object with timeoutId property.
		   * @param {Function} callback - Function to execute on timeout.
		   * @param {number} delay - Timeout delay in milliseconds.
		   * @param {boolean} [clearExisting=false] - Whether to clear existing timeout before setting new one.
		   */
		  const setRequestTimeout = (
		    request,
		    callback,
		    delay,
		    clearExisting = false
		  ) => {
		    if (clearExisting && request.timeoutId) {
		      clearTimeout(request.timeoutId) // Clear existing timeout if requested and exists
		    }
		    if (!request.timeoutId) {
		      request.timeoutId = setTimeout(callback, delay) // Set new timeout only if not already set
		    }
		  }
		  /**
		   * Generates a unique request ID, using provided ID if valid, otherwise random.
		   * @param {object} [as] - Options object that may contain a '#' property for ID.
		   * @returns {string} - The generated or provided ID.
		   */
		  const generateRequestId = (as) => {
		    // Use provided ID if available and valid
		    const providedId = as?.['#']
		    if (providedId && typeof providedId === 'string' && providedId.length > 0) {
		      return providedId
		    }
		    // Generate random ID
		    return Math.random().toString(36).slice(2, 11) // 9-character random string
		  }

		  /**
		   * Handles acknowledging messages with timeout management.
		   * @param {object} self - The context object.
		   * @param {Function|string|object} cb - ID or message for ack.
		   * @param {object} [as] - Additional acknowledgment data.
		   * @param {number} ackTimeout - Acknowledgment timeout duration in milliseconds.
		   * @returns {boolean|undefined} - True if acknowledgment handled, undefined otherwise.
		   */
		  const handleAcknowledgment = (self, cb, as, ackTimeout) => {
		    if (!cb) return // No callback provided, nothing to acknowledge
		    const id = cb?.['#'] || cb // Extract message ID from callback object or use cb directly
		    let pendingRequest = self.tag?.[id] // Retrieve the pending request object from the tag map
		    if (!pendingRequest) return // No pending request found, ignore acknowledgment
		    if (as) {
		      // If acknowledgment data is provided
		      pendingRequest = self.on(id, as) // Update the request with acknowledgment data
		      setRequestTimeout(
		        pendingRequest,
		        () => pendingRequest.off(),
		        ackTimeout,
		        true
		      ) // Clear existing and set new timeout to remove request after ackTimeout
		    }
		    return true // Acknowledgment handled successfully
		  }

		  /**
		   * Handles the ask operation by setting up the request and timeout.
		   * @param {object} self - The context object with 'on' method.
		   * @param {Function} cb - Callback function for the ask.
		   * @param {object} [as] - Additional options or data.
		   * @param {string} id - Unique identifier for the request.
		   * @param {number} ackTimeout - Timeout duration in milliseconds.
		   * @returns {string} - The request ID.
		   */
		  const handleAsk = (self, cb, as, id, ackTimeout) => {
		    const request = self.on(id, cb, as)
		    // Set timeout to handle lack of acknowledgment if not already set
		    setRequestTimeout(
		      request,
		      () => {
		        request.off()
		        request.next({ err: 'No acknowledgment received yet.', lack: true })
		      },
		      ackTimeout,
		      false
		    )
		    return id
		  }

		  /**
		   * Sends a request and waits for acknowledgment, or acknowledges a received message.
		   * @param {Function|object|string} cb - Callback for ask operation, or message ID/data for ack.
		   * @param {object} [as] - Additional options or data for the operation.
		   * @returns {string|boolean|undefined} - Request ID for ask, true for successful ack, or undefined if no action.
		   */
		  module.exports = function ask(cb, as) {
		    if (!this.on) {
		      throw new Error('Context must have an "on" method.')
		    }
		    const ackTimeout = this.opt?.lack ?? 9000

		    if (typeof cb !== 'function') {
		      // Handle acknowledgment for non-function cb (ack operation)
		      return handleAcknowledgment(this, cb, as, ackTimeout)
		    }
		    // Generate request ID for ask operation
		    const id = generateRequestId(as)
		    // Set up ask operation with timeout
		    return handleAsk(this, cb, as, id, ackTimeout)
		  }
	})(USE, './ask');

	;USE(function(module){
		// Gun.js - Decentralized Graph Database
		  function Gun(options) {
		    // Constructor for Gun instances
		    if (options instanceof Gun) {
		      this._ = { $: this }
		      return this._.$
		    }
		    if (!(this instanceof Gun)) {
		      return new Gun(options)
		    }
		    this._ = { $: this, opt: options }
		    return Gun.create(this._)
		  }

		  Gun.is = (instance) =>
		    instance instanceof Gun ||
		    (instance?._ && instance === instance._.$) ||
		    false

		  Gun.version = 0.202

		  Gun.chain = Gun.prototype
		  Gun.chain.toJSON = () => {}

		  USE('./shim')
		  Gun.valid = USE('./valid')
		  Gun.state = USE('./state')
		  Gun.on = USE('./onto')
		  Gun.dup = USE('./dup')
		  Gun.ask = USE('./ask')

		  ;(() => {
		    Gun.create = (at) => {
		      at.root = at.root || at
		      at.graph = at.graph || {}
		      at.on = at.on || Gun.on
		      at.ask = at.ask || Gun.ask
		      at.dup = at.dup || Gun.dup()
		      const gun = at.$.opt(at.opt)
		      if (!at.once) {
		        at.on('in', universe, at)
		        at.on('out', universe, at)
		        at.on('put', map, at)
		        Gun.on('create', at)
		        at.on('create', at)
		      }
		      at.once = 1
		      return gun
		    }
		    function universe(message) {
		      // Central message processing hub for Gun's event system
		      if (!message) {
		        return
		      }
		      if (message.out === universe) {
		        this.to.next(message)
		        return
		      }
		      const instance = this.as,
		        context = instance.at || instance,
		        gunInstance = context.$,
		        deduplication = context.dup,
		        debugInfo = message.DBG
		      let temp
		      temp = message['#']
		      if (!temp) {
		        temp = message['#'] = text_rand(9)
		      }
		      if (deduplication.check(temp)) {
		        return
		      }
		      deduplication.track(temp)
		      temp = message._
		      message._ = 'function' === typeof temp ? temp : () => {}
		      const hasValidGun = message.$ && message.$ === (message.$._ || '').$
		      if (!hasValidGun) {
		        message.$ = gunInstance
		      }
		      if (message['@'] && !message.put) {
		        ack(message)
		      }
		      if (!context.ask(message['@'], message)) {
		        // Is this machine listening for an ack?
		        if (debugInfo) {
		          debugInfo.u = Date.now()
		        }
		        if (message.put) {
		          put(message)
		          return
		        } else if (message.get) {
		          Gun.on.get(message, gunInstance)
		        }
		      }
		      if (debugInfo) {
		        debugInfo.uc = Date.now()
		      }
		      this.to.next(message)
		      if (debugInfo) {
		        debugInfo.ua = Date.now()
		      }
		      if (message.nts || message.NTS) {
		        return
		      } // TODO: This shouldn't be in core, but fast way to prevent NTS spread. Delete this line after all peers have upgraded to newer versions.
		      message.out = universe
		      context.on('out', message)
		      if (debugInfo) {
		        debugInfo.ue = Date.now()
		      }
		    }
		    function put(message) {
		      // Process put operations to store data in the graph
		      if (!message) {
		        return
		      }
		      const context = message._ || ''
		      context.$ = message.$ || ''
		      context.root = (context.$._ || '').root
		      const root = context.root
		      if (message['@'] && context.faith && !context.miss) {
		        // TODO: AXE may split/route based on 'put' what should we do here? Detect @ in AXE? I think we don't have to worry, as DAM will route it on @.
		        message.out = universe
		        root.on('out', message)
		        return
		      }
		      context.latch = root.hatch
		      context.match = root.hatch = []
		      const putData = message.put
		      context.DBG = message.DBG
		      const debugInfo = context.DBG
		      const startTime = Date.now()
		      CT = CT || startTime
		      if (putData['#'] && putData['.']) {
		        /*root && root.on('put', message);*/ return
		      } // TODO: BUG! This needs to call HAM instead.
		      if (debugInfo) {
		        debugInfo.p = startTime
		      }
		      context['#'] = message['#']
		      context.msg = message
		      context.all = 0
		      context.stun = 1
		      const nodeList = Object.keys(putData) //.sort(); // TODO: This is unbounded operation, large graphs will be slower. Write our own CPU scheduled sort? Or somehow do it in below? Keys itself is not O(1) either, create ES5 shim over ?weak map? or custom which is constant.
		      if (console.STAT) {
		        ;(debugInfo || context).pk = Date.now()
		        console.STAT(
		          startTime,
		          (debugInfo || context).pk - startTime,
		          'put sort'
		        )
		      }
		      let nodeIndex = 0
		      let nextNodeIndex
		      let keyList
		      let nodeId
		      let nodeData
		      let stateMap
		      let error
		      let temp
		      const processNode = (offset) => {
		        if (nextNodeIndex !== nodeIndex) {
		          nextNodeIndex = nodeIndex
		          nodeId = nodeList[nodeIndex]
		          if (!nodeId) {
		            if (console.STAT) {
		              ;(debugInfo || context).pd = Date.now()
		              console.STAT(
		                startTime,
		                (debugInfo || context).pd - startTime,
		                'put'
		              )
		            }
		            fire(context)
		            return
		          }
		          nodeData = putData[nodeId]
		          if (!nodeData) {
		            error = `${ERR + cut(nodeId)}no node.`
		          } else temp = nodeData._
		          if (!temp) {
		            error = `${ERR + cut(nodeId)}no meta.`
		          } else if (nodeId !== temp['#']) {
		            error = `${ERR + cut(nodeId)}soul not same.`
		          } else stateMap = temp['>']
		          if (!stateMap) {
		            error = `${ERR + cut(nodeId)}no state.`
		          }
		          keyList = Object.keys(nodeData || {}) // TODO: .keys( is slow
		        }
		        if (error) {
		          message.err = context.err = error // Invalid data should error and stun the message.
		          fire(context)
		          return
		        }
		        let keyIndex = 0
		        let propertyKey
		        offset = offset || 0
		        while (offset++ < 9) {
		          propertyKey = keyList[keyIndex++]
		          if (!propertyKey) {
		            break
		          }
		          if ('_' === propertyKey) {
		            continue
		          }
		          const value = nodeData[propertyKey],
		            timestamp = stateMap[propertyKey]
		          if (u === timestamp) {
		            error = `${ERR + cut(propertyKey)}on${cut(nodeId)}no state.`
		            break
		          }
		          if (!valid(value)) {
		            error = `${ERR + cut(propertyKey)}on${cut(nodeId)}bad ${typeof value}${cut(value)}`
		            break
		          }
		          ham(value, propertyKey, nodeId, timestamp, message)
		          ++C // Courtesy count
		        }
		        keyList = keyList.slice(keyIndex)
		        if (keyList.length) {
		          turn(processNode)
		          return
		        }
		        ++nodeIndex
		        keyList = null
		        processNode(offset)
		      }
		      processNode()
		    }
		    Gun.on.put = put
		    // TODO: MARK!!! clock below, reconnect sync, SEA certify wire merge, User.auth taking multiple times, // msg put, put, say ack, hear loop...
		    // WASIS BUG! local peer not ack. .off other people: .open
		    const ham = (value, propertyKey, nodeId, timestamp, message) => {
		      // Conflict resolution using HAM (Hash Array Mapped Trie) logic
		      const context = message._ || {}
		      const root = context.root
		      const graph = root?.graph
		      const node = graph?.[nodeId] || empty
		      const previousTimestamp = state_is(node, propertyKey, 1)
		      const existingValue = node[propertyKey]

		      const debugInfo = context.DBG
		      if (console.STAT) {
		        if (!graph?.[nodeId] || !existingValue) {
		          console.STAT.has = (console.STAT.has || 0) + 1
		        }
		      }

		      const currentTime = State()
		      if (timestamp > currentTime) {
		        const timeDifference = timestamp - currentTime
		        const delay = timeDifference > MD ? MD : timeDifference
		        setTimeout(
		          () => ham(value, propertyKey, nodeId, timestamp, message),
		          delay
		        )
		        if (console.STAT) {
		          const futureTime = Date.now()
		          if (debugInfo) debugInfo.Hf = futureTime
		          console.STAT(futureTime, delay, 'future')
		        }
		        return
		      }
		      if (timestamp < previousTimestamp) {
		        return
		      }
		      if (!context.faith) {
		        if (
		          timestamp === previousTimestamp &&
		          (value === existingValue || L(value) <= L(existingValue))
		        ) {
		          if (!context.miss) {
		            return
		          }
		        }
		      }
		      context.stun++
		      const uniqueId = message['#'] + context.all++
		      const id = { _: context, toString: () => uniqueId }
		      id.toJSON = id.toString
		      root.dup.track(id)['#'] = message['#']
		      if (debugInfo) {
		        debugInfo.ph = debugInfo.ph || Date.now()
		      }
		      root.on('put', {
		        _: context,
		        '@': message['@'],
		        '#': id,
		        ok: message.ok,
		        put: { ':': value, '.': propertyKey, '#': nodeId, '>': timestamp }
		      })
		    }
		    function map(message) {
		      // Map incoming put messages to update the local graph
		      const debugInfo = (message._ || '').DBG
		      if (debugInfo) {
		        debugInfo.pa = Date.now()
		        debugInfo.pm = debugInfo.pm || Date.now()
		      }
		      const root = this.as,
		        graph = root.graph,
		        context = message._,
		        putData = message.put,
		        nodeId = putData['#'],
		        propertyKey = putData['.'],
		        value = putData[':'],
		        timestamp = putData['>']
		      let temp = context.msg
		      if (temp) {
		        temp = temp.put
		        if (temp) {
		          temp = temp[nodeId]
		          if (temp) {
		            state_ify(temp, propertyKey, timestamp, value, nodeId)
		          }
		        }
		      } // Necessary for SEA (Security, Encryption, Authorization) transforms on outgoing messages.
		      graph[nodeId] = state_ify(
		        graph[nodeId],
		        propertyKey,
		        timestamp,
		        value,
		        nodeId
		      )
		      const nextHandler = (root.next || '')[nodeId]
		      if (nextHandler) {
		        nextHandler.on('in', message)
		      }
		      fire(context)
		      this.to.next(message)
		    }
		    const fire = (context, message) => {
		      // Fire completion callbacks and send outgoing messages
		      if (context.stop) {
		        return
		      }
		      context.stun--
		      if (!context.err && 0 < context.stun) {
		        return
		      } // TODO: 'forget' feature in SEA tied to this, bad approach, but hacked in for now. Any changes here must update there.
		      context.stop = 1
		      const root = context.root
		      if (!root) {
		        return
		      }
		      let matchList = context.match
		      matchList.end = 1
		      if (matchList === root.hatch) {
		        matchList = context.latch
		        if (!matchList || matchList.end) {
		          delete root.hatch
		        } else {
		          root.hatch = matchList
		        }
		      }
		      context.hatch?.() // TODO: rename/rework how put & this interact.
		      setTimeout.each(context.match, (callback) => {
		        callback?.()
		      })
		      message = context.msg
		      if (!message || context.err || message.err) {
		        return
		      }
		      message.out = universe
		      context.root.on('out', message)

		      CF() // Courtesy check for performance warnings
		    }
		    const ack = (message) => {
		      // Aggregate acknowledgments (ACKs) for put operations
		      const ackId = message['@'] || ''
		      const context = ackId._
		      if (!context) {
		        let deduplication = message.$?._?.root?.dup
		        deduplication = deduplication?.check(ackId)
		        if (!deduplication) {
		          return
		        }
		        message['@'] = deduplication?.['#'] || message['@'] // This doesn't do anything anymore, backtrack it to something else?
		        return
		      }
		      context.acks = (context.acks || 0) + 1
		      context.err = message.err
		      if (context.err) {
		        message['@'] = context['#']
		        fire(context) // TODO: BUG? How it skips/stops propagation of msg if any 1 item is error, this would assume a whole batch/resync has same malicious intent.
		      }
		      context.ok = message.ok || context.ok
		      if (!context.stop && !context.crack) {
		        context.crack = context.match?.push(() => {
		          back(context)
		        })
		      } // Handle synchronous acks. NOTE: If a storage peer ACKs synchronously then the PUT loop has not even counted up how many items need to be processed, so ctx.STOP flags this and adds only 1 callback to the end of the PUT loop.
		      back(context)
		    }
		    const back = (context) => {
		      // Send back acknowledgment to the originator
		      if (!context?.root) {
		        return
		      }
		      if (context.stun || context.acks !== context.all) {
		        return
		      }
		      context.root.on('in', {
		        '@': context['#'],
		        err: context.err,
		        ok: context.err ? u : context.ok || { '': 1 }
		      })
		    }

		    // Error messages and utilities
		    const ERR = 'Error: Invalid graph!'
		    const cut = (str) => ` '${(`${str}`).slice(0, 9)}...' `
		    const L = JSON.stringify,
		      MD = 2147483647,
		      State = Gun.state
		    let C = 0
		    let CT
		    let CF = () => {
		      // Performance check for high-frequency operations
		      const oldCT = CT
		      CT = Date.now()
		      if (C > 999 && C / -(oldCT - CT) > 1) {
		        Gun.window &&
		          console.log(
		            "Warning: You're syncing 1K+ records a second, faster than DOM can update - consider limiting query."
		          )
		        CF = () => {
		          C = 0
		        }
		      }
		    }
		  })()

		  ;(() => {
		    Gun.on.get = (message, gunInstance) => {
		      // Handle get requests by retrieving data from the graph
		      const root = gunInstance._,
		        getRequest = message.get,
		        nodeId = getRequest['#'],
		        propertyKey = getRequest['.']
		      let node = root.graph[nodeId]
		      if (!root.next) root.next = {}
		      const nextMap = root.next
		      const handler = nextMap[nodeId]

		      // TODO: Azarattum bug, what is in graph is not same as what is in next. Fix!

		      // Queue concurrent GETs?
		      // TODO: consider tagging original message into dup for DAM.
		      // TODO: ^ above? In chat app, 12 messages resulted in same peer asking for `#user.pub` 12 times. (same with #user GET too, yipes!) // DAM note: This also resulted in 12 replies from 1 peer which all had same ##hash but none of them deduped because each get was different.
		      // TODO: Moving quick hacks fixing these things to axe for now.
		      // TODO: a lot of GET #foo then GET #foo."" happening, why?
		      // TODO: DAM's ## hash check, on same get ACK, producing multiple replies still, maybe JSON vs YSON?
		      // TMP note for now: viMZq1slG was chat LEX query #.
		      const context = message._ || {}
		      context.DBG = message.DBG
		      const debugInfo = context.DBG
		      if (debugInfo) debugInfo.g = Date.now()
		      if (!node) {
		        return root.on('get', message)
		      }
		      if (propertyKey) {
		        if ('string' !== typeof propertyKey || u === node[propertyKey]) {
		          if (!handler?.next?.[propertyKey]) {
		            root.on('get', message)
		            return
		          }
		        }
		        node = state_ify(
		          {},
		          propertyKey,
		          state_is(node, propertyKey),
		          node[propertyKey],
		          nodeId
		        )
		        // If we have a key in-memory, do we really need to fetch?
		        // Maybe... in case the in-memory key we have is a local write
		        // we still need to trigger a pull/merge from peers.
		      }
		      node && ack(message, node)
		      root.on('get', message) // Send GET to storage adapters.
		    }
		    const ack = (message, node) => {
		      // Acknowledge get requests by sending back the retrieved data
		      let startTime = Date.now()
		      const context = message._ || {}
		      context.DBG = message.DBG
		      const debugInfo = context.DBG
		      const propertyKeys = Object.keys(node || '').sort()
		      const messageId = message['#']
		      let batchId = text_rand(9)
		      const nodeId = ((node || '')._ || '')['#']
		      const root = message.$._.root
		      const isFromGraph = node === root.graph[nodeId]
		      const keysTime = Date.now()
		      if (debugInfo) debugInfo.gk = keysTime
		      else context.gk = keysTime
		      console.STAT?.(startTime, keysTime - startTime, 'got keys')
		      // PERF: Consider commenting this out to force disk-only reads for perf testing? // TODO: .keys( is slow
		      node &&
		        (() => {
		          const sendBatch = () => {
		            startTime = Date.now()
		            let putData = {}
		            const batch = propertyKeys.splice(0, 9)
		            for (const key of batch) {
		              state_ify(putData, key, state_is(node, key), node[key], nodeId)
		            }
		            const wrappedPut = {}
		            wrappedPut[nodeId] = putData
		            putData = wrappedPut
		            const faith = isFromGraph ? () => {} : undefined
		            if (faith) {
		              faith.ram = faith.faith = true
		            } // HNPERF: We're testing performance improvement by skipping going through security again, but this should be audited.
		            const remaining = propertyKeys.length
		            const copyTime = Date.now()
		            console.STAT?.(
		              startTime,
		              -(startTime - copyTime),
		              'got copied some'
		            )
		            startTime = copyTime
		            if (debugInfo) debugInfo.ga = Date.now()
		            if (remaining) {
		              batchId = text_rand(9)
		            }
		            root.on('in', {
		              _: faith,
		              '@': messageId,
		              '#': batchId,
		              '%': remaining ? batchId : u,
		              $: root.$,
		              DBG: debugInfo,
		              put: putData
		            })
		            console.STAT?.(startTime, Date.now() - startTime, 'got in')
		            if (!remaining) {
		              return
		            }
		            setTimeout.turn(sendBatch)
		          }
		          sendBatch()
		        })()
		      if (!node) {
		        root.on('in', { '@': message['#'] })
		      } // TODO: I don't think I like this, the default lS adapter uses this but "not found" is a sensitive issue, so should probably be handled more carefully/individually.
		    }
		    Gun.on.get.ack = ack
		  })()

		  ;(() => {
		    Gun.chain.opt = function (options) {
		      // Configure Gun instance options, including peers
		      options = options || {}
		      const context = this._
		      let peers = options.peers || options
		      if (!Object.plain(options)) {
		        options = {}
		      }
		      if (!Object.plain(context.opt)) {
		        context.opt = options
		      }
		      if ('string' === typeof peers) {
		        peers = [peers]
		      }
		      if (!Object.plain(context.opt.peers)) {
		        context.opt.peers = {}
		      }
		      if (Array.isArray(peers)) {
		        options.peers = {}
		        peers.forEach((url) => {
		          const peer = {}
		          peer.id = peer.url = url
		          options.peers[url] = context.opt.peers[url] =
		            context.opt.peers[url] || peer
		        })
		      }
		      const processOption = (key) => {
		        const value = options[key]
		        if (
		          (options && Object.hasOwn(options, key)) ||
		          'string' === typeof value ||
		          Object.empty(value)
		        ) {
		          options[key] = value
		          return
		        }
		        if (value && value.constructor !== Object && !Array.isArray(value)) {
		          return
		        }
		        obj_each(value, processOption)
		      }
		      obj_each(options, processOption)
		      context.opt.from = options
		      Gun.on('opt', context)
		      context.opt.uuid =
		        context.opt.uuid ||
		        function uuid(length) {
		          return (
		            Gun.state().toString(36).replace('.', '') +
		            String.random(length || 12)
		          )
		        }
		      return this
		    }
		  })()

		  // Utility functions
		  const obj_each = (object, callback) => {
		    Object.keys(object).forEach(callback, object)
		  }
		  const text_rand = String.random
		  const turn = setTimeout.turn
		  const valid = Gun.valid
		  const state_is = Gun.state.is
		  const state_ify = Gun.state.ify
		  const u = undefined
		  const empty = {}

		  // Logging utilities
		  Gun.log = (...args) => {
		    if (!Gun.log.off) {
		      C.log.apply(C, args)
		    }
		    return args.join(' ')
		  }
		  Gun.log.once = (warning, message, storage) => {
		    storage = Gun.log.once
		    storage[warning] = storage[warning] || 0
		    const count = storage[warning]++
		    if (count === 0) {
		      Gun.log(message)
		    }
		    return count
		  }

		  // Browser globals
		  if (typeof window !== 'undefined') {
		    window.GUN = Gun
		    window.Gun = Gun
		    window.Gun.window = window
		  }
		  try {
		    if (typeof MODULE !== 'undefined') {
		      MODULE.exports = Gun
		    }
		  } catch {}
		  module.exports = Gun

		  // Console setup
		  ;(Gun.window || {}).console = Gun.window?.console || { log: () => {} }
		  const C = console
		  C.only = (index, message, ...args) => {
		    if (C.only.i && index === C.only.i) {
		      C.only.i++
		      C.log(index, message, ...args)
		      return message
		    }
		  }

		  // Welcome message
		  ;('Please do not remove welcome log unless you are paying for a monthly sponsorship, thanks!')
		  Gun.log.once(
		    'welcome',
		    'Hello wonderful person! :) Thanks for using GUN, please ask for help on http://chat.gun.eco if anything takes you longer than 5min to figure out!'
		  )
	})(USE, './root');

	;USE(function(module){
		const Gun = USE('./root')

		  /**
		   * Traverses an array path in the given context, recursively checking back if not found.
		   * @param {Object} context - The current context object.
		   * @param {Array} path - The array path to traverse.
		   * @returns {*} The value at the path or undefined if not found.
		   */
		  function traverseArrayPath(context, path) {
		    // Try to find the path in the current context
		    const result = path.reduce((acc, key) => acc?.[key], context)
		    if (result !== undefined) {
		      return result
		    }
		    // If not found, recursively check the back context
		    const backContext = context.back
		    if (backContext) {
		      return traverseArrayPath(backContext, path)
		    }
		    return undefined
		  }

		  /**
		   * Traverses backwards using a test function until it returns a defined value.
		   * @param {Object} context - The starting context.
		   * @param {Function} testFn - The function to test each context.
		   * @param {*} opt - Optional parameter passed to the test function.
		   * @returns {*} The result of the test function or undefined.
		   */
		  function traverseWithTestFunction(context, testFn, opt) {
		    let current = context
		    while (current) {
		      const result = testFn(current, opt)
		      if (result !== undefined) {
		        return result
		      }
		      current = current.back
		    }
		    return undefined
		  }

		  /**
		   * Traverses back by a specified number of levels in the chain.
		   * @param {Object} chain - The starting chain node.
		   * @param {number} levels - The number of levels to go back.
		   * @returns {Object} The chain node after traversing back.
		   */
		  function traverseBackLevels(chain, levels) {
		    let currentChain = chain
		    for (let i = 0; i < levels; i++) {
		      const internalContext = currentChain._
		      currentChain = (internalContext.back || internalContext).$
		    }
		    return currentChain
		  }

		  /**
		   * Traverses back in the chain by a specified number of levels or path.
		   * @param {number|string|Array|function} n - The number of levels to go back, a dot-separated string path, an array path, or a function to test.
		   * @param {*} [opt] - Optional parameter passed to function if n is a function.
		   * @returns {*} The node at the specified back position or the result of the function.
		   */
		  Gun.chain.back = function (n, opt) {
		    n = n ?? 1
		    if (n === -1 || n === Infinity) {
		      return this._.root.$
		    }
		    if (n === 1) {
		      return (this._.back || this._).$
		    }
		    const context = this._
		    if (typeof n === 'string') {
		      n = n.split('.')
		    }
		    if (Array.isArray(n)) {
		      return traverseArrayPath(context, n)
		    }
		    if (typeof n === 'function') {
		      return traverseWithTestFunction(context, n, opt)
		    }
		    if (typeof n === 'number') {
		      return traverseBackLevels(this, n)
		    }
		    return this
		  }
	})(USE, './back');

	;USE(function(module){
		/**
		   * @module chain
		   * Gun chaining API module for handling chain operations, input/output, linking, and unlinking.
		   */
		  // WARNING: GUN is very simple, but the JavaScript chaining API around GUN
		  // is complicated and was extremely hard to build. If you port GUN to another
		  // language, consider implementing an easier API to build.
		  const Gun = USE('./root')

		  const empty = {}
		  const u = undefined
		  const text_rand = String.random
		  const valid = Gun.valid
		  /**
		   * Checks if an object or map has a property.
		   * @param {Object|Map} o - The object or map to check.
		   * @param {string} k - The key to check for.
		   * @returns {boolean} True if the object or map has the key.
		   */
		  const obj_has = (o, k) =>
		    o && (o instanceof Map ? o.has(k) : Object.hasOwn(o, k))
		  const state = Gun.state
		  const state_is = state.is
		  const state_ify = state.ify

		  /**
		   * Ensures the context has an ask Map, initializing it if necessary.
		   * @param {Object} context - The chain context.
		   * @returns {Map} The ask Map.
		   */
		  const ensureAskMap = (context) => {
		    if (!context.ask) {
		      context.ask = new Map()
		    }
		    return context.ask
		  }

		  /**
		   * Creates a new chain instance, setting up its context and event listeners.
		   * @param {Function} [subConstructor] - Optional subclass constructor.
		   * @returns {Object} The new chain instance.
		   */
		  Gun.chain.chain = function (subConstructor) {
		    const currentContext = this._
		    const newChain = new (subConstructor || this).constructor(this)
		    const newContext = newChain._
		    const root = currentContext.root

		    newContext.root = root
		    newContext.id = ++root.once
		    newContext.back = this._
		    newContext.on = Gun.on

		    // Set up input listener; must be done before any custom listeners
		    newContext.on('in', Gun.on.in, newContext)

		    // Set up output listener; no global option, must be individual
		    newContext.on('out', Gun.on.out, newContext)

		    return newChain
		  }

		  /**
		   * Handles outgoing messages for the chain, managing requests and cached data.
		   * @param {Object} msg - The message to output.
		   */
		  function output(msg) {
		    let request
		    const context = this.as
		    let parent = context.back
		    const root = context.root
		    let temp

		    if (!msg.$) {
		      msg.$ = context.$
		    }

		    this.to.next(msg)

		    if (context.err) {
		      context.put = u
		      context.on('in', { $: context.$, put: context.put })
		      return
		    }

		    if (msg.get) {
		      request = msg.get
		      if (root.pass) {
		        root.pass[context.id] = context
		      } // Note: May cause buggy behavior elsewhere

		      if (context.lex) {
		        temp = msg.get = msg.get || {}
		        Object.assign(temp, context.lex)
		      }

		      if (request['#'] || context.soul) {
		        request['#'] = request['#'] || context.soul
		        if (!msg['#']) {
		          msg['#'] = text_rand(9)
		        }
		        parent = root.$.get(request['#'])._
		        request = request['.']
		        const parentSoul = parent.soul

		        if (!request) {
		          // Requesting full node (soul)
		          temp = parent.ask?.get('')
		          ensureAskMap(parent).set('', parent)
		          if (u !== parent.put) {
		            parent.on('in', parent) // Send cached data
		            if (temp) {
		              return // Already asked
		            }
		          }
		          msg.$ = parent.$
		        } else if (obj_has(parent.put, request)) {
		          // Requesting specific property
		          temp = parent.ask?.get(request)
		          ensureAskMap(parent).set(request, parent.$.get(request)._)
		          parent.on('in', {
		            get: request,
		            put: {
		              ':': parent.put[request],
		              '.': request,
		              '#': parentSoul,
		              '>': state_is(root.graph[parentSoul], request)
		            }
		          })
		          if (temp) {
		            return // Already asked
		          }
		        }

		        root.ask(ack, msg)
		        return root.on('in', msg)
		      }

		      if (request['.']) {
		        if (context.get) {
		          msg = { $: context.$, get: { '.': context.get } }
		          ensureAskMap(parent).set(context.get, msg.$._)
		          return parent.on('out', msg)
		        }
		        msg = { $: context.$, get: context.lex ? msg.get : {} }
		        return parent.on('out', msg)
		      }

		      ensureAskMap(context).set('', context)

		      if (context.get) {
		        request['.'] = context.get
		        ensureAskMap(parent).set(context.get, msg.$._)
		        return parent.on('out', msg)
		      }
		    }

		    return parent.on('out', msg)
		  }

		  /**
		   * Handles incoming messages for the chain, processing data updates and propagating to listeners.
		   * @param {Object} msg - The incoming message.
		   * @param {Object} [context] - The chain context (optional, defaults to this.as).
		   */
		  function input(msg, context) {
		    context = context || this.as
		    const root = context.root
		    if (!msg.$) {
		      msg.$ = context.$
		    }
		    let gun = msg.$
		    const msgData = (gun || '')._ || empty
		    let temp = msg.put || {}
		    let soul = temp['#']
		    let key = temp['.']
		    const change = u !== temp['='] ? temp['='] : temp[':']
		    const state = temp['>'] || -Infinity
		    let subChain // Sub-chain for children

		    // Handle old format conversion
		    if (
		      u !== msg.put &&
		      (u === temp['#'] ||
		        u === temp['.'] ||
		        (u === temp[':'] && u === temp['=']) ||
		        u === temp['>'])
		    ) {
		      if (!valid(temp)) {
		        soul = ((temp || '')._ || '')['#']
		        if (!soul) {
		          console.log('chain not yet supported for', temp, '...', msg, context)
		          return
		        }
		        gun = context.root.$.get(soul)
		        // Process each key asynchronously; note: Object.keys is slow
		        return setTimeout.each(Object.keys(temp).sort(), (k) => {
		          const state = state_is(temp, k)
		          if ('_' === k || u === state) {
		            return
		          }
		          context.on('in', {
		            $: gun,
		            put: { '.': k, '#': soul, '=': temp[k], '>': state },
		            VIA: msg
		          })
		        })
		      }
		      soul = msgData.back.soul
		      key = msgData.has || msgData.get
		      context.on('in', {
		        $: msgData.back.$,
		        put: {
		          '.': key,
		          '#': soul,
		          '=': temp,
		          '>': state_is(msgData.back.put, key)
		        },
		        via: msg
		      }) // Note: This approximation may be buggy if data is corrupted
		      return
		    }

		    // Prevent processing duplicate messages
		    if (msg.seen?.[context.id]) {
		      return
		    }
		    if (!msg.seen) {
		      msg.seen = {}
		    }
		    msg.seen[context.id] = context

		    // Adjust message context if needed
		    if (context !== msgData) {
		      temp = { ...msg }
		      temp.get = context.get || temp.get
		      if (!context.soul && !context.has) {
		        temp.$$$ = temp.$$$ || context.$
		      } else if (msgData.soul) {
		        temp.$ = context.$
		        temp.$$ = temp.$$ || msgData.$
		      }
		      msg = temp
		    }

		    unlink(msg, context)

		    // Update cache for soul chains or linked messages
		    if ((context.soul || msg.$$) && state >= state_is(root.graph[soul], key)) {
		      temp = root.$.get(soul)._
		      temp.put = state_ify(temp.put, key, state, change, soul)
		    }

		    // Update cache for non-soul chains
		    if (!msgData.soul && state >= state_is(root.graph[soul], key)) {
		      subChain = root.$.get(soul)._.next?.[key]
		      if (subChain) {
		        subChain.put = change
		        const validatedChange = valid(change)
		        if (typeof validatedChange === 'string') {
		          subChain.put = root.$.get(validatedChange)._.put || change
		        }
		      }
		    }

		    // Propagate to next listener in chain
		    this.to?.next(msg)

		    // Handle any listeners
		    if (context.any) {
		      void Promise.all(
		        Object.keys(context.any).map((listenerId) => {
		          const listener = context.any[listenerId]
		          return listener ? Promise.resolve(listener(msg)) : Promise.resolve()
		        })
		      )
		    }

		    // Handle echo listeners
		    if (context.echo) {
		      void Promise.all(
		        Object.keys(context.echo).map((echoId) => {
		          const echoChain = context.echo[echoId]
		          return echoChain
		            ? Promise.resolve(echoChain.on('in', msg))
		            : Promise.resolve()
		        })
		      )
		    }

		    // Propagate to sub-chains if applicable
		    if (((msg.$$ || '')._ || msgData).soul) {
		      subChain = context.next?.[key]
		      if (subChain) {
		        temp = { ...msg }
		        temp.get = key
		        temp.$ = msg.$$?.get(temp.get) || msg.$?.get(temp.get)
		        delete temp.$$
		        delete temp.$$$
		        subChain.on('in', temp)
		      }
		    }

		    link(msg, context)
		  }

		  /**
		   * Links chains for data propagation, establishing connections between related data nodes.
		   * @param {Object} msg - The message containing link information.
		   * @param {Object} context - The chain context (optional, defaults to this.as or msg.$._).
		   */
		  function link(msg, context) {
		    context = context || this.as || msg.$._
		    let targetChain

		    // Ignore messages from linked sources unless called directly
		    if (msg.$$ && this !== Gun.on) {
		      return
		    }

		    // Cannot link to nothing or link a soul chain
		    if (!msg.put || context.soul) {
		      return
		    }

		    const put = msg.put || {}
		    let linkTarget = put['='] || put[':']
		    let temp
		    const root = context.root
		    const targetChainContext = root.$.get(put['#']).get(put['.'])._

		    linkTarget = valid(linkTarget)
		    if (typeof linkTarget !== 'string') {
		      // Allow explicit linking to simple data when called from Gun.on
		      if (this === Gun.on) {
		        targetChainContext.echo = targetChainContext.echo || {}
		        targetChainContext.echo[context.id] = context
		      }
		      return // Do not link to non-link data by default
		    }

		    targetChainContext.echo = targetChainContext.echo || {}

		    // Avoid redundant linking unless a new listener requires a pass
		    if (targetChainContext.echo[context.id] && !root.pass?.[context.id]) {
		      return
		    }

		    temp = root.pass
		    // Prevent infinite passes on circular graphs
		    if (temp?.[linkTarget + context.id]) {
		      return
		    }
		    if (temp) {
		      temp[linkTarget + context.id] = 1
		    }

		    // Set up echo for self
		    targetChainContext.echo[context.id] = context

		    if (context.has) {
		      context.link = linkTarget
		    }
		    targetChainContext.link = linkTarget

		    // Get the target chain we're linking to
		    targetChain = root.$.get(linkTarget)?._
		    if (targetChain && !targetChain.echo) {
		      targetChain.echo = {}
		    }
		    if (targetChain?.echo) {
		      targetChain.echo[targetChainContext.id] = targetChainContext
		    }

		    // Request data for pending asks
		    temp = ensureAskMap(context)
		    if (context.ask?.has('') || context.lex) {
		      // Load the entire linked node; note: context.lex may have edge cases
		      targetChain?.on('out', { get: { '#': linkTarget } })
		    }

		    // Request specific properties for sub-chains
		    void Promise.all(
		      [...temp.keys()].map((property) => {
		        const subChain = temp.get(property)
		        if (!property || !subChain) {
		          return Promise.resolve()
		        }
		        return Promise.resolve(
		          subChain.on('out', { get: { '.': property, '#': linkTarget } })
		        )
		      })
		    )
		  }

		  /**
		   * Unlinks chains when data is removed, cleaning up connections and caches.
		   * @param {Object} msg - The message indicating data removal.
		   * @param {Object} context - The chain context.
		   */
		  function unlink(msg, context) {
		    const put = msg.put || {}
		    const value = u !== put['='] ? put['='] : put[':']
		    const root = context.root
		    let linkTarget
		    let temp

		    if (u === value) {
		      // Handle case where data is being cleared (e.g., not found or deleted)
		      // Note: Potential bug with async cache clearing; may need async ID check
		      // Note: Map handling may have issues with sync/async operations
		      if (context.soul && u !== context.put) {
		        return // Soul chains with existing data cannot be fully cleared
		      }

		      temp = msg.$$?._ || msg.$?._ || {}
		      if (msg['@'] && (u !== temp.put || u !== context.put)) {
		        return // Don't clear if we have data and received not-found from peers
		      }

		      linkTarget = context.link || msg.linked
		      if (linkTarget) {
		        delete root.$.get(linkTarget)?._?.echo?.[context.id]
		      }

		      if (context.has) {
		        // TODO: Consider clearing links, maps, echoes, acks/asks
		        context.link = null
		      }

		      context.put = u // Clear cache

		      // Clear sub-chains
		      // Note: For maps, may need to trigger individual subs instead of all
		      void Promise.all(
		        Object.keys(context.next || {}).map((property) => {
		          const subChain = context.next?.[property]
		          if (!subChain) {
		            return Promise.resolve()
		          }
		          if (linkTarget) {
		            delete root.$.get(linkTarget)?.get(property)?._?.echo?.[subChain.id]
		          }
		          return Promise.resolve(
		            subChain.on('in', { $: subChain.$, get: property, put: u })
		          )
		        })
		      )
		      return
		    }

		    if (context.soul) {
		      return // Soul chains cannot unlink themselves
		    }

		    if (msg.$$) {
		      return // Linked chains don't handle unlinking; sub-chains do
		    }

		    linkTarget = valid(value) // Validate new link target
		    temp = msg.$?._ || {}

		    // Avoid redundant unlinking
		    if (linkTarget === temp.link || (context.has && !temp.link)) {
		      if (root.pass?.[context.id] && typeof linkTarget !== 'string') {
		        // Allow during pass for non-string links
		      } else {
		        return
		      }
		    }

		    delete temp.echo?.[context.id]
		    const previousLink = msg.linked || temp.link
		    msg.linked = previousLink

		    // Recursively unlink sub-chains
		    unlink(
		      {
		        $: msg.$,
		        get: context.get,
		        linked: previousLink,
		        put: u
		      },
		      context
		    )
		  }

		  /**
		   * Handles acknowledgments for messages, processing responses to requests.
		   * @param {Object} msg - The acknowledgment message.
		   */
		  function ack(msg) {
		    // Memory leak prevention is now handled by .ask itself.
		    const context = this.as
		    const data = context.$._
		    const req = context.get || {}
		    const resp = msg.put?.[req['#']] || {}

		    // Check if the response indicates no data found
		    if (!msg.put || (typeof req['.'] === 'string' && u === resp[req['.']])) {
		      // If we already have cached data, don't process
		      if (u !== data.put) {
		        return
		      }
		      // Only core chains (soul or has) handle not-found responses to avoid bugs
		      if (!data.soul && !data.has) {
		        return
		      }
		      data.ack = (data.ack || 0) + 1
		      data.put = u
		      data.on('in', {
		        '@': msg['@'],
		        $: data.$,
		        get: data.get,
		        put: data.put
		      })
		      return
		    }
		    // Mark as a miss and delegate to put handler
		    ;(msg._ || {}).miss = 1
		    Gun.on.put(msg)
		  }

		  Gun.on.out = output
		  Gun.on.in = input
		  Gun.on.link = link
		  Gun.on.unlink = unlink
	})(USE, './chain');

	;USE(function(module){
		const Gun = USE('./root')

		  const EMPTY_OBJECT = Object.create(null)
		  const validate = Gun.valid
		  const LISTENER_ID_LENGTH = 7
		  const CORE_KEY_EQUALS = '='
		  const CORE_KEY_COLON = ':'
		  const PATH_KEY = '.'

		  /**
		   * Handles retrieval for string keys by returning or creating a cached chain.
		   * @param {string} key - The string key to retrieve.
		   * @param {function} [callback] - Optional callback function for errors.
		   * @param {object} chainContext - The Gun chain context.
		   * @returns {object} The Gun chain for the key.
		   */
		  function handleStringKey(key, callback, chainContext) {
		    if (key.length === 0) {
		      // Invalid: empty key
		      const errorChain = chainContext.chain()
		      errorChain._.err = { err: Gun.log('0 length key!', key) }
		      if (callback) {
		        callback.call(errorChain, errorChain._.err)
		      }
		      return errorChain
		    }
		    const context = chainContext._
		    const cachedChains = context.next || EMPTY_OBJECT
		    let targetChain = cachedChains[key]
		    if (!targetChain) {
		      // Create and cache a new chain for this key
		      targetChain = createCachedChain(key, chainContext)
		    }
		    return targetChain?.$ // Return the chain's public interface
		  }
		  /**
		   * Processes message data for get operations, handling links and 'not' options.
		   * Extracts node data from the message, resolving links if necessary.
		   * @param {object} msg - The incoming message object.
		   * @param {object} getOptions - Options for the get operation, including 'not' flag.
		   * @param {object} rootContext - The root Gun context.
		   * @returns {object} Processed data: { currentContext, nodeData, linkedContext, shouldSkip }
		   */
		  function processMessageData(msg, getOptions, rootContext) {
		    const currentContext = msg.$._
		    const linkedContext = (msg.$$ || '')._
		    let nodeData = (linkedContext || currentContext).put

		    // If no core data (no soul or has), extract from msg.put using special keys
		    if (
		      (!currentContext.has && !currentContext.soul) ||
		      nodeData === undefined
		    ) {
		      const messagePut = msg.put
		      // Prefer '=' key, then ':' key, fallback to entire put
		      nodeData =
		        messagePut?.[CORE_KEY_EQUALS] !== undefined
		          ? messagePut[CORE_KEY_EQUALS]
		          : messagePut?.[CORE_KEY_COLON] !== undefined
		            ? messagePut[CORE_KEY_COLON]
		            : messagePut
		    }

		    const validatedData = Gun.valid(nodeData)
		    const isLink = typeof validatedData === 'string'
		    if (isLink) {
		      // Resolve link: get the linked node's data
		      const linkedNodeData = rootContext.$.get(validatedData)._.put
		      nodeData =
		        linkedNodeData === undefined
		          ? getOptions.not
		            ? undefined
		            : nodeData // If 'not' option and no data, return undefined
		          : linkedNodeData
		    }

		    const shouldSkip = getOptions.not && nodeData === undefined
		    return { at: currentContext, nodeData, sat: linkedContext, shouldSkip }
		  }

		  /**
		   * Handles retrieval for function keys (callbacks).
		   * @param {function} key - The callback function.
		   * @param {*} cb - Options or true for soul extraction.
		   * @param {*} as - Additional context.
		   * @param {object} context - The gun context.
		   * @returns {object} The gun chain.
		   */
		  function handleFunctionKey(key, cb, as, context) {
		    if (true === cb) {
		      extractSoul(context, key, cb, as)
		      return context
		    }
		    const nodeChain = context
		    const currentContext = nodeChain._
		    const getOptions = cb || {}
		    const rootContext = currentContext.root
		    let listenerId = String.random(LISTENER_ID_LENGTH)
		    getOptions.at = currentContext
		    getOptions.ok = key
		    const waitList = new Map() // can we assign this to the at instead, like in once?
		    //var path = []; context.$.back(at => { at.get && path.push(at.get.slice(0,9))}); path = path.reverse().join('.');
		    function listenerHandler(msg, eve, f) {
		      if (listenerHandler.stun) {
		        return
		      }
		      const passData = rootContext.pass
		      if (passData && !passData[listenerId]) {
		        return
		      }
		      const { nodeData, at, sat, shouldSkip } = processMessageData(
		        msg,
		        getOptions,
		        rootContext
		      )
		      if (shouldSkip) return
		      let stunCheck = {}
		      if (undefined === getOptions.stun) {
		        // Stun mechanism: pauses listeners during concurrent writes to ensure data consistency
		        const stunData = rootContext.stun
		        if (stunData?.on) {
		          currentContext.$.back((a) => {
		            // our chain stunned?
		            stunCheck = {}
		            stunData.on(`${a.id}`, stunCheck)
		            if ((stunCheck.run || 0) < listenerHandler.id) {
		              return stunCheck
		            } // if there is an earlier stun on gapless parents/self.
		          })
		          if (!stunCheck.run) {
		            stunCheck = {}
		            stunData.on(`${at.id}`, stunCheck)
		          } // this node stunned?
		          if (!stunCheck.run && sat) {
		            stunCheck = {}
		            stunData.on(`${sat.id}`, stunCheck)
		          } // linked node stunned?
		          if (listenerHandler.id > stunCheck.run) {
		            if (!stunCheck.stun || stunCheck.stun.end) {
		              stunCheck.stun = stunData.on('stun')
		              stunCheck.stun = stunCheck.stun?.last
		            }
		            if (stunCheck.stun && !stunCheck.stun.end) {
		              //if(isOddNode && undefined === nodeData){ return }
		              //if(undefined === msg.put){ return } // "not found" acks will be found if there is stun, so ignore these.
		              if (!stunCheck.stun.add) {
		                stunCheck.stun.add = {}
		              }
		              stunCheck.stun.add[listenerId] = () => {
		                listenerHandler(msg, eve, 1)
		              } // add ourself to the stun callback list that is called at end of the write.
		              return
		            }
		          }
		        }
		        if (/*isOddNode &&*/ undefined === nodeData) {
		          f = 0
		        } // if data not found, keep waiting/trying.
		        /*if(f && undefined === nodeData){
		    currentContext.on('out', getOptions.out);
		    return;
		  }*/
		        const hatchData = rootContext.hatch
		        if (
		          hatchData &&
		          !hatchData.end &&
		          undefined === getOptions.hatch &&
		          !f
		        ) {
		          // Hatch: batches listener callbacks to fire after a complete batch of data is streamed, improving performance for bulk updates
		          if (waitList.has(at.$._.id)) {
		            return
		          }
		          waitList.set(at.$._.id, 1)
		          hatchData.push(() => {
		            listenerHandler(msg, eve, 1)
		          })
		          return
		        }
		        waitList.clear() // end quick hack.
		      }
		      // Call listener: prevent recursion with pass tracking
		      if (rootContext.pass) {
		        if (rootContext.pass[listenerId + at.id]) {
		          return
		        }
		        rootContext.pass[listenerId + at.id] = 1
		      }
		      if (getOptions.on) {
		        getOptions.ok.call(at.$, nodeData, at.get, msg, eve || listenerHandler)
		        return
		      } // TODO: Also consider breaking `this` since a lot of people do `=>` these days and `.call(` has slower performance.
		      if (getOptions.v2020) {
		        getOptions.ok(msg, eve || listenerHandler)
		        return
		      }
		      const messageCopy = { ...msg }
		      msg = messageCopy
		      msg.put = nodeData // Compatibility with 2019 API: modify message.put for old callback style
		      getOptions.ok.call(getOptions.as, msg, eve || listenerHandler) // is this the right
		    }
		    listenerHandler.at = currentContext
		    listenerId = String.random(LISTENER_ID_LENGTH)
		    if (!currentContext.any) {
		      currentContext.any = {}
		    }
		    currentContext.any[listenerId] = listenerHandler
		    listenerHandler.off = () => {
		      listenerHandler.stun = 1
		      if (!currentContext.any) {
		        return
		      }
		      delete currentContext.any[listenerId]
		    }
		    listenerHandler.rid = function rid(at) {
		      const ridContext = this.at || this.on
		      if (!at || ridContext.soul || ridContext.has) {
		        return this.off()
		      }
		      at = at.$ || at
		      at = at._ || at
		      if (!at.id) {
		        return
		      }

		      //if(!map || !(tempNode = map[at]) || !(tempNode = tempNode.at)){ return }
		      if (!this.seen) {
		        this.seen = new Map()
		      }
		      const seenNodes = this.seen
		      const tempNode = seenNodes.get(at)
		      if (tempNode) {
		        return true
		      }
		      seenNodes.set(at, true)
		      //tempNode.echo[ridContext.id] = {}; // TODO: Warning: This unsubscribes ALL of this chain's listeners from this link, not just the one callback event.
		      //obj.del(map, at); // TODO: Warning: This unsubscribes ALL of this chain's listeners from this link, not just the one callback event.
		      return
		    } // logic from old version, can we clean it up now?
		    listenerHandler.id = getOptions.run || ++rootContext.once // used in callback to check if we are earlier than a write. // will this ever cause an integer overflow?
		    const originalPass = rootContext.pass
		    rootContext.pass = {}
		    rootContext.pass[listenerId] = 1 // Explanation: test trade-offs want to prevent recursion so we add/remove pass flag as it gets fulfilled to not repeat, however map map needs many pass flags - how do we reconcile?
		    getOptions.out = getOptions.out || { get: {} }
		    currentContext.on('out', getOptions.out)
		    rootContext.pass = originalPass
		    return nodeChain
		  }

		  /**
		   * Handles retrieval for number keys by converting to string.
		   * @param {number} key - The number key.
		   * @param {function} [cb] - Optional callback function.
		   * @param {*} [as] - Additional options.
		   * @param {object} context - The gun context.
		   * @returns {object} The gun chain.
		   */
		  function handleNumberKey(key, cb, as, context) {
		    return context.get(`${key}`, cb, as)
		  }

		  /**
		   * Handles retrieval for invalid keys by validating or delegating.
		   * @param {*} key - The key to validate.
		   * @param {function} [cb] - Optional callback function.
		   * @param {*} [as] - Additional options.
		   * @param {object} context - The gun context.
		   * @returns {object|undefined} The gun chain or undefined.
		   */
		  function handleInvalidKey(key, cb, as, context) {
		    const validatedKey = validate(key)
		    if ('string' === typeof validatedKey) {
		      return context.get(validatedKey, cb, as)
		    }
		    const nextHandler = context.get.next
		    if (nextHandler) {
		      return nextHandler(context, key)
		    }
		    return undefined
		  }

		  /**
		   * Retrieves data from the Gun database based on the key type.
		   * @param {string|function|number} key - The key to get, or a callback function, or a number.
		   * @param {function|boolean|object} [cb] - The callback function, true for soul extraction, or options object.
		   * @param {*} [as] - Additional options or context.
		   * @returns {object} The gun chain.
		   */
		  Gun.chain.get = function (key, cb, as) {
		    let nodeChain
		    if (typeof key === 'string') {
		      nodeChain = handleStringKey(key, cb, this)
		    } else if ('function' === typeof key) {
		      nodeChain = handleFunctionKey(key, cb, as, this)
		    } else if ('number' === typeof key) {
		      nodeChain = handleNumberKey(key, cb, as, this)
		    } else {
		      nodeChain = handleInvalidKey(key, cb, as, this)
		    }
		    if (!nodeChain) {
		      const errorChain = this.chain()
		      errorChain._.err = {
		        err: Gun.log('Invalid get request!', key)
		      }
		      if (cb) {
		        cb.call(errorChain, errorChain._.err)
		      }
		      return errorChain
		    }
		    if (cb && 'function' === typeof cb) {
		      nodeChain.get(cb, as)
		    }
		    return nodeChain
		  }
		  /**
		   * Creates a cached chain for the given key and parent context.
		   * Caches the chain to avoid recreating it for repeated accesses.
		   * @param {string} key - The key for the chain.
		   * @param {object} parent - The parent Gun chain context.
		   * @returns {object} The new child chain context.
		   */
		  function createCachedChain(key, parent) {
		    const parentContext = parent._
		    parentContext.next ??= {}
		    const nextChains = parentContext.next
		    const childChain = parent.chain()
		    const childContext = childChain._
		    childContext.get = key
		    nextChains[key] = childContext

		    // Determine if this is a root soul or a property/has
		    if (parent === parentContext.root.$) {
		      childContext.soul = key // Root-level key is a soul
		    } else if (parentContext.soul || parentContext.has) {
		      childContext.has = key // Child of soul or has is a property
		    }

		    return childContext
		  }
		  /**
		   * Extracts the soul (unique identifier) from the Gun context.
		   * If soul is not immediately available, queues the callback and waits for network acknowledgments.
		   * @param {object} gun - The Gun chain instance.
		   * @param {function} callback - The callback function to receive the soul.
		   * @param {*} _options - Unused options parameter.
		   * @param {*} additionalContext - Additional context passed to callback.
		   * @returns {object} The Gun instance.
		   */
		  function extractSoul(gun, callback, _options, additionalContext) {
		    const context = gun._
		    const soul = context.soul || context.link
		    if (soul) {
		      // Soul is already available, call callback immediately
		      return callback(soul, additionalContext, context)
		    }
		    if (context.jam) {
		      // Queue is already set up, add to existing queue
		      return context.jam.push([callback, additionalContext])
		    }
		    // Initialize queue with this callback
		    context.jam = [[callback, additionalContext]]
		    let acknowledgmentCount = 0
		    gun.get(
		      (message, event) => {
		        const peerCount = Object.keys(context.root.opt.peers).length
		        if (
		          message.put === undefined &&
		          !context.root.opt.super &&
		          peerCount &&
		          ++acknowledgmentCount <= peerCount
		        ) {
		          // Wait for acknowledgments from all peers to ensure data consistency
		          return
		        }
		        event.rid(message)
		        const messageContext = message.$ ? message.$._ : {}
		        const callbackQueue = context.jam
		        delete context.jam
		        callbackQueue.forEach((callbackArgs) => {
		          if (!callbackArgs) return
		          const [cb, args] = callbackArgs
		          // Extract soul ID from various possible sources
		          const soulId =
		            messageContext.link ||
		            messageContext.soul ||
		            Gun.valid(message.put) ||
		            message.put?._?.['#']
		          cb?.(soulId, args, message, event)
		        })
		      },
		      { out: { get: { [PATH_KEY]: true } } }
		    )
		    return gun
		  }
	})(USE, './get');

	;USE(function(module){
		var Gun = USE('./root')
		  Gun.chain.put = function (data, cb, as) {
		    // I rewrote it :)
		    const at = this._
		    const root = at.root
		    as = as || {}
		    as.root = at.root
		    as.run ||= root.once
		    stun(as, at.id) // set a flag for reads to check if this chain is writing.
		    as.ack = as.ack || cb
		    as.via = as.via || this
		    as.data = as.data || data
		    if (!as.soul) {
		      as.soul = at.soul || ('string' === typeof cb && cb)
		    }
		    as.state = as.state || Gun.state()
		    if ('function' === typeof data) {
		      data((d) => {
		        as.data = d
		        this.put(undefined, undefined, as)
		      })
		      return this
		    }
		    if (!as.soul) {
		      get(as)
		      return this
		    }
		    as.$ = root.$.get(as.soul) // TODO: This may not allow user chaining and similar?
		    as.todo = [{ it: as.data, ref: as.$ }]
		    as.turn = as.turn || turn
		    as.ran = as.ran || ran
		    // TODO: Perf! We only need to stun chains that are being modified, not necessarily written to.
		    ;(function walk() {
		      let to = as.todo,
		        at = to.pop(),
		        d = at.it,
		        v,
		        k,
		        cat,
		        tmp,
		        g,
		        seen,
		        id
		      stun(as, at.ref)
		      tmp = at.todo
		      if (tmp) {
		        k = tmp.pop()
		        d = d[k]
		        if (tmp.length) {
		          to.push(at)
		        }
		      }
		      if (k) {
		        if (!to.path) to.path = []
		        to.path.push(k)
		      }
		      v = valid(d)
		      g = Gun.is(d)
		      if (!v && !g) {
		        if (!Object.plain(d)) {
		          tmp = []
		          ran.err(
		            as,
		            `Invalid data: ${check(d)} at ${
		              as.via.back((at) => {
		                at.get && tmp.push(at.get)
		              }, tmp) || tmp.join('.')
		            }.${(to.path || []).join('.')}`
		          )
		          return
		        }
		        if (!as.seen) as.seen = []
		        seen = as.seen
		        let i = seen.length
		        while (i--) {
		          tmp = seen[i]
		          if (d === tmp.it) {
		            v = d = tmp.link
		            break
		          }
		        }
		      }
		      if (k && v) {
		        at.node = state_ify(at.node, k, as.state, d)
		      } // handle soul later.
		      else {
		        if (!as.seen) {
		          ran.err(as, 'Data at root of graph must be a node (an object).')
		          return
		        }
		        cat = {
		          it: d,
		          link: {},
		          path: (to.path || []).slice(),
		          todo: g ? [] : Object.keys(d).sort().reverse(),
		          up: at
		        }
		        as.seen.push(cat) // Any perf reasons to CPU schedule this .keys( ?
		        at.node = state_ify(at.node, k, as.state, cat.link)
		        !g && cat.todo.length && to.push(cat)
		        // ---------------
		        id = as.seen.length
		        if (!as.wait) as.wait = {}
		        as.wait[id] = ''
		        cat.ref = g ? d : k ? at.ref.get(k) : at.ref
		        tmp = cat.ref._
		        tmp = (d && (d._ || '')['#']) || tmp.soul || tmp.link
		        tmp
		          ? resolve({ soul: tmp })
		          : cat.ref.get(resolve, {
		              out: { get: { '.': ' ' } },
		              run: as.run,
		              /*hatch: 0,*/ v2020: 1
		            }) // TODO: BUG! This should be resolve ONLY soul to prevent full data from being loaded. // Fixed now?
		        function resolve(msg, eve) {
		          const end = cat.link['#']
		          if (eve) {
		            eve.off()
		            eve.rid(msg)
		          } // TODO: Too early! Check all peers ack not found.
		          // TODO: BUG maybe? Make sure this does not pick up a link change wipe, that it uses the changing link instead.
		          let soul = end || msg.soul
		          let tmp
		          let node
		          if (!soul) {
		            tmp = (msg.$$ || msg.$)?._ || {}
		            soul =
		              tmp.soul ||
		              tmp.link ||
		              tmp.put?._?.['#'] ||
		              tmp['#'] ||
		              (msg.put && msg.$$
		                ? msg.put['#']
		                : (msg.put?.['='] || msg.put?.[':'] || '')['#'])
		          }
		          !end && stun(as, msg.$)
		          if (!soul && !at.link['#']) {
		            // check soul link above us
		            if (!at.wait) {
		              at.wait = []
		            }
		            at.wait.push(() => {
		              resolve(msg, eve)
		            }) // wait
		            return
		          }
		          if (!soul) {
		            soul = []
		            ;(msg.$$ || msg.$).back((at) => {
		              tmp = at.soul || at.link
		              if (tmp) {
		                return soul.push(tmp)
		              }
		              soul.push(at.get)
		            })
		            soul = soul.reverse().join('/')
		          }
		          cat.link['#'] = soul
		          if (!g) {
		            if (!as.graph) {
		              as.graph = {}
		            }
		            node = cat.node
		            if (!node) {
		              node = cat.node = { _: {} }
		            }
		            as.graph[soul] = node
		            node._['#'] = soul
		          }
		          delete as.wait[id]
		          cat.wait &&
		            setTimeout.each(cat.wait, (cb) => {
		              cb?.()
		            })
		          as.ran(as)
		        }
		        // ---------------
		      }
		      if (!to.length) {
		        return as.ran(as)
		      }
		      as.turn(walk)
		    })()
		    return this
		  }

		  function stun(as, id) {
		    if (!id) {
		      return
		    }
		    id = id?._?.id || id
		    let run
		    if (!as.root.stun) {
		      as.root.stun = { on: Gun.on }
		    }
		    run = as.root.stun
		    let test = {},
		      tmp
		    if (!as.stun) {
		      as.stun = run.on('stun', () => {})
		    }
		    tmp = run.on(`${id}`)
		    if (tmp) {
		      tmp.the.last.next(test)
		    }
		    if (test.run >= as.run) {
		      return
		    }
		    run.on(`${id}`, function (test) {
		      if (as.stun.end) {
		        this.off()
		        this.to.next(test)
		        return
		      }
		      test.run = test.run || as.run
		      test.stun = test.stun || as.stun
		      return
		    })
		  }

		  function ran(as) {
		    if (as.err) {
		      ran.end(as.stun, as.root)
		      return
		    } // move log handle here.
		    if (as.todo.length || as.end || !Object.empty(as.wait)) {
		      return
		    }
		    as.end = 1
		    const cat = as.$.back(-1)._
		    const root = cat.root
		    const ask = cat.ask(function (ack) {
		      root.on('ack', ack)
		      if (ack.err && !ack.lack) {
		        Gun.log(ack)
		      }
		      acks++
		      if (acks > (as.acks || 0)) {
		        this.off()
		      } // Adjustable ACKs! Only 1 by default.
		      if (!as.ack) {
		        return
		      }
		      as.ack(ack, this)
		    }, as.opt)
		    let acks = 0
		    const stun = as.stun
		    const tmp = () => {
		      // this is not official yet, but quick solution to hack in for now.
		      if (!stun) {
		        return
		      }
		      ran.end(stun, root)
		      const stunAdd = stun.add || ''
		      setTimeout.each(Object.keys(stunAdd), (key) => {
		        const cb = stunAdd[key]
		        if (cb) {
		          cb()
		        }
		      }) // resume the stunned reads // Any perf reasons to CPU schedule this .keys( ?
		    }
		    tmp.hatch = tmp // this is not official yet ^
		    if (as.ack && !as.ok) {
		      as.ok = as.acks || 9
		    } // TODO: In future! Remove this! This is just old API support.
		    as.out = as.graph
		    as.via._.on('out', {
		      _: tmp,
		      '#': ask,
		      ok: as.ok && { '@': as.ok + 1 },
		      opt: as.opt,
		      put: as.out
		    })
		  }
		  ran.end = (stun, root) => {
		    stun.end = noop // like with the earlier id, cheaper to make this flag a function so below callbacks do not have to do an extra type check.
		    if (stun.the.to === stun && stun === stun.the.last) {
		      delete root.stun
		    }
		    stun.off()
		  }
		  ran.err = (as, err) => {
		    as.err = Gun.log(err)
		    as.out = { err: as.err }
		    ;(as.ack || noop).call(as, as.out)
		    as.ran(as)
		  }

		  function get(as) {
		    const at = as.via._
		    as.via = as.via.back((at) => {
		      if (at.soul || !at.get) {
		        return at.$
		      }
		      const tmp = as.data
		      as.data = {}
		      as.data[at.get] = tmp
		    })
		    if (!as.via || !as.via?._.soul) {
		      as.via = at.root.$.get(as.data?._?.['#'] || at.$.back('opt.uuid')())
		    }
		    as.via.put(as.data, as.ack, as)

		    return
		  }
		  function check(d) {
		    return d?.constructor?.name || typeof d
		  }

		  const empty = {}
		  const noop = () => {}
		  const turn = setTimeout.turn
		  const valid = Gun.valid
		  const state_ify = Gun.state.ify
		  const _iife = (fn, as) => {
		    fn.call(as || empty)
		  }
	})(USE, './put');

	;USE(function(module){
		/**
		   * @module core
		   * Core module that loads all Gun components and exports the Gun constructor.
		   */
		  // Load the root Gun constructor and base functionality
		  const Gun = USE('./root')
		  // Load chain methods for data manipulation and traversal
		  USE('./chain')
		  // Load backend and storage integration functionality
		  USE('./back')
		  // Load put operations for data writing
		  USE('./put')
		  // Load get operations for data reading
		  USE('./get')
		  // Export the Gun constructor as the module's main export
		  module.exports = Gun
	})(USE, './core');

	;USE(function(module){
		const Gun = USE('./root')
		  USE('./shim')
		  USE('./onto')
		  USE('./book')
		  USE('./valid')
		  USE('./state')
		  USE('./dup')
		  USE('./ask')
		  USE('./core')
		  USE('./on')
		  USE('./map')
		  USE('./set')
		  USE('./mesh')
		  USE('./websocket')
		  USE('./localStorage')

		  /**
		   * Main GUN module export.
		   * This file loads all core Gun modules and exports the Gun constructor.
		   * @module Gun
		   */
		  module.exports = Gun
	})(USE, './index');

	;USE(function(module){
		const Gun = USE('./root')
		  const u = undefined
		  const empty = Object.freeze({})
		  const _noop = () => {}

		  /**
		   * Subscribe to events on a Gun chain reference
		   *
		   * This method provides two modes of operation:
		   * 1. String-based event subscription with named events and callbacks
		   * 2. Function-based subscription for data changes with options
		   *
		   * @param {string|Function} tag - Event name (string) or data retrieval function
		   * @param {Function|Object} [arg] - Callback function for string events, or options for function events
		   * @param {Object} [eas] - Event aggregation scope for subscription tracking
		   * @param {*} [as] - Context for callback execution
		   * @returns {Gun} Returns the Gun chain for method chaining
		   *
		   * @example
		   * // String-based event subscription
		   * gun.on('change', (data) => console.log('Data changed:', data));
		   *
		   * // Function-based data subscription
		   * gun.on(function(data, key) {
		   *   console.log('Got data:', data, 'for key:', key);
		   * }, { change: true });
		   */
		  Gun.chain.on = function (tag, arg, eas, as) {
		    const cat = this._
		    const _root = cat.root

		    // Handle string-based event subscription
		    if (typeof tag === 'string') {
		      // Return existing subscription if no callback provided
		      if (!arg) {
		        return cat.on(tag)
		      }

		      // Create new subscription with proper context
		      const act = cat.on(tag, arg, eas || cat, as)

		      // Track subscription for cleanup if event aggregation scope provided
		      if (eas?.$ && Array.isArray(eas.subs)) {
		        eas.subs.push(act)
		      }

		      return this
		    }

		    // Handle function-based subscription with options
		    let opt = arg

		    // Normalize options - convert boolean true to change options
		    if (opt === true) {
		      opt = { change: true }
		    } else {
		      opt = opt || {}
		    }

		    // Set internal flags for event handling
		    opt.not = 1 // Enable "not found" events
		    opt.on = 1 // Enable continuous listening

		    // Subscribe to data changes using the function as a getter
		    this.get(tag, opt)

		    return this
		  }

		  /**
		   * Subscribe to a single occurrence of an event or data retrieval
		   *
		   * This method follows specific rules:
		   * 1. If data is cached, retrieval should be fast but not interfere with writes
		   * 2. Should not retrigger other listeners, fires even if no data found
		   * 3. Multiple callbacks resolve independently with their own timeouts
		   * 4. Handles data validation and link resolution automatically
		   *
		   * @param {Function} [cb] - Callback function to execute once when data is available
		   * @param {Object} [opt={}] - Configuration options
		   * @param {number} [opt.wait=99] - Timeout in milliseconds before resolving with undefined
		   * @returns {Gun} Returns the Gun chain or a new chainable interface if no callback
		   *
		   * @example
		   * // With callback
		   * gun.get('user').once((data, key) => {
		   *   console.log('User data:', data);
		   * });
		   *
		   * // Chainable without callback (experimental)
		   * gun.get('user').once().get('name').on(callback);
		   */
		  Gun.chain.once = function (cb, opt = {}) {
		    // Return chainable promise-like interface if no callback provided
		    if (!cb) {
		      return createOnceChain(this, opt)
		    }

		    const cat = this._
		    const root = cat.root
		    const subscriptionId = String.random(7)

		    // Set up the one-time data listener
		    this.get(
		      function handleOnceData(data, key, msg, eve) {
		        const $ = this
		        const at = $._

		        // Initialize once tracking object
		        at.one ??= {}
		        const onceTracker = at.one

		        // Skip if event is stunned or already resolved for this subscription
		        if (eve.stun || onceTracker[subscriptionId] === '') {
		          return
		        }

		        const validationResult = Gun.valid(data)

		        // Handle immediately valid data
		        if (validationResult === true) {
		          executeOnceCallback()
		          return
		        }

		        // Skip if data validation failed with error
		        if (typeof validationResult === 'string') {
		          return
		        }

		        // Set up timeout for data resolution
		        clearTimeout(cat.one?.[subscriptionId])
		        clearTimeout(onceTracker[subscriptionId])
		        onceTracker[subscriptionId] = setTimeout(
		          executeOnceCallback,
		          opt.wait || 99
		        )

		        /**
		         * Execute the callback once with properly resolved data
		         * Handles data resolution, link following, and cleanup
		         *
		         * @param {boolean} [forceExecution=false] - Force execution even if data is undefined
		         */
		        function executeOnceCallback(forceExecution = false) {
		          let resolvedContext = at

		          // Handle non-core messages by creating context
		          if (!at.has && !at.soul) {
		            resolvedContext = {
		              get: key,
		              put: data
		            }
		          }

		          let resolvedData = resolvedContext.put

		          // Fallback data resolution from message
		          if (resolvedData === u) {
		            resolvedData = msg.$$?._.put
		          }

		          // Handle linked data resolution
		          const linkValidation = Gun.valid(resolvedData)
		          if (typeof linkValidation === 'string') {
		            // Follow the link to get actual data
		            resolvedData = root.$.get(resolvedData)._.put

		            // Retry if linked data not yet available and not forcing
		            if (resolvedData === u && !forceExecution) {
		              onceTracker[subscriptionId] = setTimeout(
		                () => executeOnceCallback(true),
		                opt.wait || 99
		              )
		              return
		            }
		          }

		          // Skip if event stunned or already resolved during async operations
		          if (eve.stun || onceTracker[subscriptionId] === '') {
		            return
		          }

		          // Mark as resolved to prevent duplicate execution
		          onceTracker[subscriptionId] = ''

		          // Unsubscribe if this is a soul or hash-based chain to prevent memory leaks
		          if (cat.soul || cat.has) {
		            eve.off()
		          }

		          // Execute callback with resolved data and context
		          try {
		            cb.call($, resolvedData, resolvedContext.get)
		          } catch (error) {
		            Gun.log('Error in once callback:', error)
		          }

		          // Final cleanup
		          clearTimeout(onceTracker[subscriptionId])
		        }
		      },
		      { on: 1 } // Enable continuous listening until resolved
		    )

		    return this
		  }

		  /**
		   * Create a chainable once interface without immediate callback execution
		   * This is an experimental feature that allows chaining after once()
		   *
		   * @param {Gun} gun - Gun instance to create chain from
		   * @param {Object} opt - Options object
		   * @returns {Gun} New Gun chain that resolves once
		   *
		   * @private
		   */
		  function createOnceChain(gun, _opt) {
		    // Log experimental feature warning
		    Gun.log.once(
		      'valOnce',
		      'Chainable val is experimental, its behavior and API may change moving forward. ' +
		        'Please play with it and report bugs and ideas on how to improve it.'
		    )

		    const chain = gun.chain()

		    // Set up chain cleanup mechanism
		    chain._.nix = gun.once(function handleChainData(_data, _key) {
		      chain._.on('in', this._)
		    })

		    // Copy lexical context for proper chaining behavior
		    chain._.lex = gun._.lex

		    return chain
		  }

		  /**
		   * Unsubscribe from events and clean up all related resources
		   *
		   * This method performs comprehensive cleanup:
		   * 1. Resets acknowledgment state to allow resubscription
		   * 2. Cleans up chain references and caches
		   * 3. Removes from graph storage if has soul
		   * 4. Recursively cleans up mapped and nested references
		   * 5. Emits cleanup event for other listeners
		   *
		   * @returns {Gun} Returns the Gun chain for method chaining
		   *
		   * @example
		   * const ref = gun.get('user').on(callback);
		   * // Later...
		   * ref.off(); // Clean up subscription and resources
		   */
		  Gun.chain.off = function () {
		    const at = this._
		    const cat = at.back

		    // Early return if no parent context
		    if (!cat) {
		      return this
		    }

		    // Reset acknowledgment state to allow resubscription
		    at.ack = 0

		    // Clean up next chain references
		    const next = cat.next
		    if (next && at.get && next[at.get]) {
		      delete next[at.get]
		    }

		    // Clear any cached data
		    if (cat.any) {
		      cat.any = {}
		    }

		    // Clean up pending requests queue
		    const ask = cat.ask
		    if (ask && at.get) {
		      delete ask[at.get]
		    }

		    // Clean up put operation cache
		    const put = cat.put
		    if (put && at.get) {
		      delete put[at.get]
		    }

		    // Remove from graph storage if this has a soul (persistent identifier)
		    const soul = at.soul
		    if (soul && cat.root?.graph) {
		      delete cat.root.graph[soul]
		    }

		    // Recursively clean up mapped references
		    const map = at.map
		    if (map) {
		      Object.keys(map).forEach((key) => {
		        const mapAt = map[key]
		        if (mapAt?.link && cat.root?.$) {
		          // Clean up linked references
		          cat.root.$.get(mapAt.link).off()
		        }
		      })
		    }

		    // Recursively clean up nested chain references
		    const atNext = at.next
		    if (atNext) {
		      Object.keys(atNext).forEach((key) => {
		        const nestedChain = atNext[key]
		        if (nestedChain?.$?.off) {
		          nestedChain.$.off()
		        }
		      })
		    }

		    // Emit cleanup event to notify other components
		    at.on('off', empty)

		    return this
		  }
	})(USE, './on');

	;USE(function(module){
		// Utility Functions
		  /** @function noop @returns {void} No-op function. */
		  const noop = () => {}
		  /** @function getSoul @param {object|string} lex - Input lex. @returns {string} Soul if present. */
		  const getSoul = (lex) => {
		    if (!lex) return ''
		    const tmp = lex?.['#'] || ''
		    if (Array.isArray(tmp)) return tmp[0] || ''
		    return tmp?.['='] || tmp
		  }
		  /** @function getLexPattern @param {object|string} lex - Input lex. @returns {string} Lex pattern. */
		  const getLexPattern = (lex) => {
		    if (!lex) return ''
		    return lex?.['.'] || lex?.['#'] || lex
		  }
		  /** @function checkMapField @param {string|object} field - Field to check. @returns {boolean} True if valid map field. @throws {Error} For invalid inputs. */
		  const checkMapField = (field) => {
		    return (
		      typeof field === 'string' ||
		      (field && typeof field === 'object' && !Array.isArray(field))
		    )
		  }
		  /** @function invokeLexSafely @param {Object} gun - Gun instance. @param {string|Object} query - Lex query. @param {function} next - Next function. @param {function} noop - Noop function. @returns {*} Result of lex or fallback. */
		  const invokeLexSafely = (gun, query, next, noop) => {
		    try {
		      return lex(gun, query, next, noop)
		    } catch (error) {
		      if (!gun._) {
		        console.warn('GUN map.get.next: Internal fallback for missing gun._')
		        return next?.call(gun, query) ?? gun
		      }
		      throw error
		    }
		  }
		  const Gun = USE('./root'),
		    next = Gun.chain.get.next
		  /** @function validateLexInput @param {object} node - Gun node instance. @param {string|object} lexQuery - Lex query. @throws {Error} For invalid node or lexQuery. */
		  const validateLexInput = (node, lexQuery) => {
		    if (!node || typeof node !== 'object')
		      throw new Error('Invalid node: must be an object')
		    if (!node?._) throw new Error('Invalid node: missing _ property')
		    if (
		      typeof lexQuery !== 'string' &&
		      (!lexQuery || typeof lexQuery !== 'object' || Array.isArray(lexQuery))
		    ) {
		      throw new Error(
		        `Invalid lex query: expected string or plain object, got ${typeof lexQuery}`
		      )
		    }
		  }
		  /** @function createHandleLexEvent @param {object} chainTmp - Chain temp object. @param {string|object} lexQuery - Lex query. @returns {function} Event handler function. */
		  const createHandleLexEvent = (chainTmp, lexQuery) =>
		    function (eve) {
		      if (
		        String.match(eve.get || (eve.put || '')['.'], getLexPattern(lexQuery))
		      ) {
		        chainTmp.on('in', eve)
		      }
		      this.to.next(eve)
		    }
		  /**
		   * @param {IGunInstance} node
		   * @param {string|object} lexQuery
		   * @param {function} [next=noop]
		   * @param {function} [noop=() => {}]
		   * @returns {IGunChainReference} Chain with optional off method
		   * @throws {Error} Invalid inputs
		   * @example lex(node, '#soul', cb)
		   */
		  const lex = (node, lexQuery, next, noop) => {
		    validateLexInput(node, lexQuery)
		    // Handles non-plain objects by direct callback
		    if (!Object.plain(lexQuery)) {
		      return (next || noop)(node, lexQuery)
		    }
		    const soul = getSoul(lexQuery)
		    if (soul) {
		      return node.get(soul)
		    }
		    const chainTmp = node.chain()._
		    chainTmp.lex = lexQuery
		    const handleLexEvent = createHandleLexEvent(chainTmp, lexQuery)
		    node.on('in', handleLexEvent)
		    chainTmp.$.off = () => node.off('in', handleLexEvent)
		    return chainTmp.$
		  }
		  /**
		   * Overrides the get.next chain method to handle lex queries.
		   * @param {Object} gun - The gun instance (optional internal usage tolerated).
		   * @param {string|Object} query - The lex query (string or plain object).
		   * @returns {IGunChainReference} The chained result.
		   * @throws {Error} If gun or query is invalid.
		   * @example gun.get('#soul')
		   * @example gun.get({'.': 'field'})
		   */
		  Gun.chain.get.next = (gun, query) => {
		    if (
		      !gun ||
		      typeof gun !== 'object' ||
		      (gun._ && typeof gun._ !== 'object')
		    ) {
		      throw new Error('GUN map.get.next: Invalid gun instance')
		    }
		    if (!query || !checkMapField(query))
		      throw new Error('GUN map.get.next: Invalid lex query')
		    return invokeLexSafely(gun, query, next, noop)
		  }
		  /** @function validateMapCallback @param {*} cb - Callback or field. @throws {Error} For invalid cb. */
		  const validateMapCallback = (cb) => {
		    if (cb != null && !checkMapField(cb) && typeof cb !== 'function')
		      throw new Error('Invalid map argument')
		  }
		  /** @function isValidMapNode @param {object} at - Gun at object. @param {object} msg - Message. @returns {boolean} True if valid node. */
		  const isValidMapNode = (at, msg) => at.soul || msg.$$
		  /** @function handleMapCallbackResult @param {object} chain - Chain. @param {*} data - Data. @param {string} key - Key. @param {object} msg - Message. @param {object} _eve - Event. @param {*} next - Next value. */
		  const handleMapCallbackResult = (chain, data, key, msg, _eve, next) => {
		    // Handle different types of callback results: ignore undefined, pass through data, Gun instances, or transform to new put
		    if (undefined === next) return
		    if (data === next) return chain._.on('in', msg)
		    if (Gun.is(next)) return chain._.on('in', next._)
		    const tmp = { ...msg.put, '=': next }
		    chain._.on('in', { get: key, put: tmp })
		  }
		  /**
		   * Maps over the data in the chain.
		   * @param {Function|Object|string} cb - Callback function or lex query.
		   * @param {*} _opt - Options (unused).
		   * @param {*} _t - Additional parameter (unused).
		   * @returns {IGunChainReference} - updated chain
		   * @throws {Error} - invalid cb
		   * @example chain.map('field')
		   * @example chain.map(function(data, key) { ... })
		   */
		  Gun.chain.map = function (cb, _opt, _t) {
		    const cat = this._
		    validateMapCallback(cb)
		    let lex
		    if (checkMapField(cb)) {
		      // If cb is a field, convert to lex query and set cb to undefined
		      lex = cb['.'] ? cb : { '.': cb }
		      cb = undefined
		    }
		    if (!cb) {
		      const chain = cat.each
		      if (chain) return chain
		      const newChain = this.chain()
		      cat.each = newChain
		      newChain._.lex = lex || newChain._.lex || cat.lex
		      newChain._.nix = this.back('nix')
		      this.on('in', map, newChain._)
		      return newChain
		    }
		    Gun.log.once(
		      'mapfn',
		      'Map functions are experimental, their behavior and API may change moving forward. Please play with it and report bugs and ideas on how to improve it.'
		    )
		    const chain = this.chain()
		    this.map().on((data, key, msg, eve) => {
		      const next = (cb || noop).call(this, data, key, msg, eve)
		      handleMapCallbackResult(chain, data, key, msg, eve, next)
		    })
		    return chain
		  }
		  /**
		   * Checks if the message matches the lex query.
		   * @param {Object} cat - The category object.
		   * @param {Object} msg - The message object.
		   * @param {Object} put - The put object.
		   * @returns {boolean} True if matches, false otherwise.
		   */
		  const checkLex = (cat, msg, put) => {
		    const lex = cat.lex
		    return (
		      !lex || String.match(msg?.get || (put || '')?.['.'], getLexPattern(lex))
		    )
		  }
		  /**
		   * Internal map function to handle messages.
		   * @param {Object} msg - The message object.
		   */
		  function map(msg) {
		    this.to.next(msg)
		    const cat = this.as
		    const gun = msg.$
		    const at = gun._
		    const put = msg.put
		    if (!isValidMapNode(at, msg)) return
		    if (!checkLex(cat, msg, put)) return
		    Gun.on.link(msg, cat)
		  }
		  const _event = { off: noop, stun: noop }
	})(USE, './map');

	;USE(function(module){
		const Gun = USE('./root')
		  Gun.chain.set = function (item, cb, opt) {
		    const root = this.back(-1)
		    let soul
		    let tmp
		    cb = cb || (() => {})
		    opt = opt || {}
		    opt.item = opt.item || item
		    soul = item?._?.['#']
		    if (soul) {
		      item = {}
		      item['#'] = soul
		    } // check if node, make link.
		    tmp = Gun.valid(item)
		    if (typeof tmp === 'string') {
		      soul = tmp
		      return this.get(soul).put(item, cb, opt)
		    } // check if link
		    if (!Gun.is(item)) {
		      if (Object.plain(item)) {
		        soul = this.back('opt.uuid')()
		        item = root.get(soul).put(item)
		      }
		      return this.get(soul || root.back('opt.uuid')(7)).put(item, cb, opt)
		    }
		    this.put((go) => {
		      item.get((soul, _o, msg) => {
		        // TODO: BUG! We no longer have this option? & go error not handled?
		        if (!soul) {
		          return cb.call(this, {
		            err: Gun.log(`Only a node can be linked! Not "${msg.put}"!`)
		          })
		        }
		        tmp = {}
		        tmp[soul] = { '#': soul }
		        go(tmp)
		      }, true)
		    })
		    return item
		  }
	})(USE, './set');

	;USE(function(module){
		USE('./shim')

		  const parse =
		    JSON.parseAsync ||
		    ((t, cb, r) => {
		      const d = Date.now()
		      try {
		        cb(undefined, JSON.parse(t, r), json.sucks(Date.now() - d))
		      } catch (e) {
		        cb(e)
		      }
		    })
		  const json =
		    JSON.stringifyAsync ||
		    ((v, cb, r, s) => {
		      const d = Date.now()
		      try {
		        cb(undefined, JSON.stringify(v, r, s), json.sucks(Date.now() - d))
		      } catch (e) {
		        cb(e)
		      }
		    })
		  json.sucks = (d) => {
		    if (d > 99) {
		      console.log(
		        'Warning: JSON blocking CPU detected. Add `gun/lib/yson.js` to fix.'
		      )
		      json.sucks = () => {}
		    }
		  }

		  /**
		   * Creates a mesh network handler for Gun.js peer-to-peer communication.
		   * Manages message routing, deduplication, batching, and peer connections.
		   * @param {object} root - The root Gun instance containing options and event handlers.
		   * @returns {object} Mesh object with hear, say, hi, bye, and other networking methods.
		   */
		  function Mesh(root) {
		    const mesh = () => {}
		    const opt = root.opt || {}
		    opt.log ||= console.log
		    opt.gap ||= opt.wait || 0
		    opt.max ||= (opt.memory ? opt.memory * 999 * 999 : 300000000) * 0.3
		    opt.pack ||= opt.max * 0.01 * 0.01
		    opt.puff ||= 9 // IDEA: do a start/end benchmark, divide ops/result.
		    const puff = setTimeout.turn || setTimeout

		    const dup = root.dup
		    const dup_check = dup.check
		    const dup_track = dup.track

		    /**
		     * Processes incoming messages from peers, handling JSON parsing, deduplication, and message routing.
		     * @param {string|object} raw - The raw message data received from the peer.
		     * @param {object} peer - The peer object representing the sender.
		     */
		    const hear = function (raw, peer) {
		      if (!raw) {
		        return
		      }
		      if (opt.max <= raw.length) {
		        return mesh.say({ dam: '!', err: 'Message too big!' }, peer)
		      }
		      if (mesh === this) {
		        hear.d += raw.length || 0
		        ++hear.c
		      } // STATS!
		      const S = Date.now()
		      peer.SH = S
		      const tmp = raw[0]
		      let msg
		      //raw && raw.slice && console.log("hear:", ((peer.wire||'').headers||'').origin, raw.length, raw.slice && raw.slice(0,50)); //tc-iamunique-tc-package-ds1
		      if ('[' === tmp) {
		        parse(raw, (err, msg) => {
		          if (err || !msg) {
		            return mesh.say({ dam: '!', err: 'DAM JSON parse error.' }, peer)
		          }
		          console.STAT?.(Date.now(), msg.length, '# on hear batch')
		          const P = opt.puff /**
		           * Processes a batch of messages asynchronously to prevent blocking the event loop.
		           */
		          ;(function processMessageBatch() {
		            const S = Date.now()
		            let i = 0
		            let m
		            while (i < P) {
		              m = msg[i]
		              i++
		              mesh.hear(m, peer)
		            }
		            msg = msg.slice(i) // slicing after is faster than shifting during.
		            console.STAT?.(S, Date.now() - S, 'hear loop')
		            flush(peer) // force send all synchronously batched acks.
		            if (!msg.length) {
		              return
		            }
		            puff(processMessageBatch, 0) // Yield to event loop for batch processing to prevent blocking.
		          })()
		        })
		        raw = '' //
		        return
		      }
		      if ('{' === tmp) {
		        parse(raw, (err, msg) => {
		          if (err || !msg) {
		            return mesh.say({ dam: '!', err: 'DAM JSON parse error.' }, peer)
		          }
		          hear.one(msg, peer, S)
		        })
		        return
		      }
		      if (raw['#'] || Object.plain(raw)) {
		        msg = raw
		        if (msg) {
		          return hear.one(msg, peer, S)
		        }
		        parse(raw, (err, msg) => {
		          if (err || !msg) {
		            return mesh.say({ dam: '!', err: 'DAM JSON parse error.' }, peer)
		          }
		          hear.one(msg, peer, S)
		        })
		        return
		      }
		    }
		    mesh.hear = hear
		    hear.one = (msg, peer, S) => {
		      // S here is temporary! Undo.
		      let id, hash, tmp, ash, DBG
		      if (msg.DBG) {
		        msg.DBG = DBG = { DBG: msg.DBG }
		      }
		      if (DBG) {
		        DBG.h = S
		        DBG.hp = Date.now()
		      }
		      id = msg['#']
		      if (!id) {
		        id = String.random(9)
		        msg['#'] = id
		      }
		      tmp = dup_check(id)
		      if (tmp) {
		        return
		      }
		      // DAM logic:
		      hash = msg['##']
		      // disable hashing for now // TODO: impose warning/penalty instead (?)
		      tmp = msg['@'] || (msg.get && id)
		      ash = tmp + hash
		      if (hash && tmp && dup.check(ash)) {
		        return
		      } // Imagine A <-> B <=> (C & D), C & D reply with same ACK but have different IDs, B can use hash to dedup. Or if a GET has a hash already, we shouldn't ACK if same.
		      msg._ = () => {}
		      msg._.via = mesh.leap = peer
		      tmp = msg['><']
		      if (tmp && 'string' === typeof tmp) {
		        msg._.yo = {}
		        for (const k of tmp.slice(0, 99).split(',')) {
		          msg._.yo[k] = 1
		        }
		      } // Peers already sent to, do not resend.
		      // DAM ^
		      if (msg.dam && mesh.hear[msg.dam]) {
		        mesh.hear[msg.dam](msg, peer, root)
		        dup_track(id)
		        return
		      }
		      tmp = msg.ok
		      if (tmp) {
		        msg._.near = tmp['/']
		      }
		      const S_inner = Date.now()
		      if (DBG) DBG.is = S_inner
		      peer.SI = id
		      dup_track.ed = (d) => {
		        if (id !== d) {
		          return
		        }
		        dup_track.ed = 0
		        d = dup.s[id]
		        if (!d) {
		          return
		        }
		        d.via = peer
		        if (msg.get) {
		          d.it = msg
		        }
		      }
		      mesh.last = msg
		      root.on('in', msg)
		      if (DBG) DBG.hd = Date.now()
		      console.STAT?.(
		        S_inner,
		        Date.now() - S_inner,
		        msg.get ? 'msg get' : msg.put ? 'msg put' : 'msg'
		      )
		      dup_track(id) // in case 'in' does not call track.
		      if (ash) {
		        dup_track(ash)
		      } //dup.track(tmp+hash, true).it = it(msg);
		      mesh.leap = mesh.last = null // warning! mesh.leap could be buggy.
		    }
		    hear.c = hear.d = 0

		    ;(() => {
		      let SMIA = 0
		      let loop
		      mesh.hash = (msg, peer) => {
		        let currentHash
		        let remainingText
		        let fullJsonText
		        const hashStartTime = Date.now()
		        json(
		          msg.put,
		          /**
		           * Processes JSON text in chunks to compute a hash without blocking the event loop.
		           * @param {Error|null} _error - Potential error from JSON serialization.
		           * @param {string} jsonText - The serialized JSON text.
		           */
		          function processHashChunk(_error, jsonText) {
		            if (!remainingText) {
		              remainingText = fullJsonText = jsonText || ''
		            }
		            const chunk = remainingText.slice(0, 32768) // Process in 32KB chunks to avoid blocking.
		            currentHash = String.hash(chunk, currentHash)
		            remainingText = remainingText.slice(32768)
		            if (remainingText) {
		              puff(processHashChunk, 0) // Continue hashing in next tick to avoid blocking.
		              return
		            }
		            console.STAT?.(
		              hashStartTime,
		              Date.now() - hashStartTime,
		              'say json+hash'
		            )
		            msg._.$put = fullJsonText
		            msg['##'] = currentHash
		            mesh.say(msg, peer)
		            delete msg._.$put
		          },
		          sortObjectKeysForHashing
		        )
		      }
		      /**
		       * Sorts object keys alphabetically for consistent JSON hashing.
		       * @param {string} _key - The key (unused).
		       * @param {*} value - The value to process.
		       * @returns {*} The sorted object or original value.
		       */
		      const sortObjectKeysForHashing = (_key, value) => {
		        if (!(value instanceof Object)) {
		          return value
		        }
		        const sortedObject = {}
		        for (const key of Object.keys(value).sort()) {
		          sortedObject[key] = value[key]
		        }
		        return sortedObject
		      }

		      /**
		       * Sends a message to a specific peer or broadcasts it, handling serialization, batching, deduplication, and routing.
		       * @param {object} msg - The message object to send.
		       * @param {object} [peer] - The target peer; if omitted, broadcasts to all known peers.
		       * @returns {boolean|undefined} False if sending failed, otherwise undefined.
		       */
		      mesh.say = function (msg, peer) {
		        let tmp
		        tmp = this
		        if (tmp) {
		          tmp = tmp.to
		          if (tmp?.next) {
		            tmp.next(msg)
		          }
		        } // compatible with middleware adapters.
		        if (!msg) {
		          return false
		        }
		        let id
		        let raw
		        const ack = msg['@']
		        let meta = msg._
		        if (!meta) {
		          meta = () => {}
		          msg._ = meta
		        }
		        const DBG = msg.DBG,
		          S = Date.now()
		        meta.y ||= S
		        if (!peer) {
		          if (DBG) DBG.y = S
		        }
		        id = msg['#']
		        if (!id) {
		          id = String.random(9)
		          msg['#'] = id
		        }
		        !loop && dup_track(id) //.it = it(msg); // track for 9 seconds, default. Earth<->Mars would need more! // always track, maybe move this to the 'after' logic if we split function.
		        const hash = msg['##']
		        if (!hash && undefined !== msg.put && !meta.via && ack) {
		          mesh.hash(msg, peer)
		          return
		        } // TODO: Should broadcasts be hashed?
		        if (!peer && ack) {
		          peer =
		            dup.s[ack]?.via ||
		            dup.s[ack]?.it?._?.via ||
		            (mesh.last && ack === mesh.last['#'] && mesh.leap)
		        } // warning! mesh.leap could be buggy! mesh last check reduces this. // TODO: CLEAN UP THIS LINE NOW? `.it` should be reliable.
		        if (!peer && ack) {
		          // still no peer, then ack daisy chain 'tunnel' got lost.
		          if (dup.s[ack]) {
		            return
		          } // in dups but no peer hints that this was ack to ourself, ignore.
		          console.STAT?.(Date.now(), ++SMIA, 'total no peer to ack to') // TODO: Delete this now. Dropping lost ACKs is protocol fine now.
		          return false
		        } // TODO: Temporary? If ack via trace has been lost, acks will go to all peers, which trashes browser bandwidth. Not relaying the ack will force sender to ask for ack again. Note, this is technically wrong for mesh behavior.
		        if (ack && !msg.put && !hash && dup.s[ack]?.it?.['##']) {
		          return false
		        } // If we're saying 'not found' but a relay had data, do not bother sending our not found. // Is this correct, return false? // NOTE: ADD PANIC TEST FOR THIS!
		        if (!peer && mesh.way) {
		          return mesh.way(msg)
		        }
		        if (DBG) DBG.yh = Date.now()
		        raw = meta.raw
		        if (!raw) {
		          mesh.raw(msg, peer)
		          return
		        }
		        if (DBG) DBG.yr = Date.now()
		        if (!peer || !peer.id) {
		          if (!Object.plain(peer || opt.peers)) {
		            return false
		          }
		          const S = Date.now()
		          let _P = opt.puff,
		            ps = opt.peers,
		            pl = Object.keys(peer || opt.peers || {}) // TODO: .keys( is slow
		          console.STAT?.(S, Date.now() - S, 'peer keys') /**
		           * Processes a batch of messages asynchronously to prevent blocking the event loop.
		           */
		          ;(function processMessageBatch() {
		            const S = Date.now()
		            //Type.obj.map(peer || opt.peers, each); // in case peer is a peer list.
		            loop = 1
		            const wr = meta.raw
		            meta.raw = raw // quick perf hack
		            let i = 0
		            let p
		            while (i < 9) {
		              p = (pl || '')[i]
		              i++
		              p = ps[p] || (peer || '')[p]
		              if (!p) {
		                continue
		              }
		              mesh.say(msg, p)
		            }
		            meta.raw = wr
		            loop = 0
		            pl = pl.slice(i) // slicing after is faster than shifting during.
		            console.STAT?.(S, Date.now() - S, 'say loop')
		            if (!pl.length) {
		              return
		            }
		            puff(processMessageBatch, 0) // Process next batch of peers asynchronously.
		            ack && dup_track(ack) // keep for later
		          })()
		          return
		        }
		        // TODO: PERF: consider splitting function here, so say loops do less work.
		        if (!peer.wire && mesh.wire) {
		          mesh.wire(peer)
		        }
		        if (id === peer.last) {
		          return
		        }
		        peer.last = id // was it just sent?
		        if (peer === meta.via) {
		          return false
		        } // don't send back to self.
		        if (meta.yo?.[peer.url] || meta.yo?.[peer.pid] || meta.yo?.[peer.id]) {
		          return false
		        }
		        console.STAT?.(
		          S,
		          (() => {
		            const yp = Date.now()
		            ;(DBG || meta).yp = yp
		            return yp
		          })() - (meta.y || S),
		          'say prep'
		        )
		        !loop && ack && dup_track(ack) // streaming long responses needs to keep alive the ack.
		        if (peer.batch) {
		          tmp = peer.tail || 0
		          peer.tail = tmp + raw.length
		          if (peer.tail <= opt.pack) {
		            peer.batch += (tmp ? ',' : '') + raw
		            return
		          }
		          flush(peer)
		        }
		        peer.batch = '[' // Prevents double JSON!
		        const ST = Date.now()
		        setTimeout(() => {
		          console.STAT?.(ST, Date.now() - ST, '0ms TO')
		          flush(peer)
		        }, opt.gap) // Batch messages with delay to allow accumulation; may impact latency.
		        send(raw, peer)
		        console.STAT &&
		          ack === peer.SI &&
		          console.STAT(S, Date.now() - peer.SH, 'say ack')
		      }
		      mesh.say.c = mesh.say.d = 0
		      // TODO: this caused a out-of-memory crash!
		      mesh.raw = (msg, _peer) => {
		        // TODO: Clean this up / delete it / move logic out!
		        if (!msg) {
		          return ''
		        }
		        const meta = msg._ || {}
		        let put
		        let tmp
		        tmp = meta.raw
		        if (tmp) {
		          return tmp
		        }
		        if (typeof msg === 'string') {
		          return msg
		        }
		        const hash = msg['##']
		        const ack = msg['@']
		        if (hash && ack) {
		          if (!meta.via && dup_check(ack + hash)) {
		            return false
		          } // for our own out messages, memory & storage may ack the same thing, so dedup that. Tho if via another peer, we already tracked it upon hearing, so this will always trigger false positives, so don't do that!
		          tmp = dup.s[ack]?.it
		          if (tmp) {
		            if (hash === tmp['##']) {
		              return false
		            } // if ask has a matching hash, acking is optional.
		            if (!tmp['##']) {
		              tmp['##'] = hash
		            } // if none, add our hash to ask so anyone we relay to can dedup. // NOTE: May only check against 1st ack chunk, 2nd+ won't know and still stream back to relaying peers which may then dedup. Any way to fix this wasted bandwidth? I guess force rate limiting breaking change, that asking peer has to ask for next lexical chunk.
		          }
		        }
		        if (!msg.dam && !msg['@']) {
		          const to = []
		          for (const [_k, p] of Object.entries(opt.peers)) {
		            to.push(p.url || p.pid || p.id)
		            if (to.length > 6) {
		              break
		            }
		          }
		          if (to.length > 1) {
		            msg['><'] = to.join()
		          } // TODO: BUG! This gets set regardless of peers sent to! Detect?
		        }
		        tmp = msg.ok
		        if (msg.put && tmp) {
		          msg.ok = {
		            '@': (tmp['@'] ?? 1) - 1,
		            '/': tmp['/'] === msg._.near ? mesh.near : tmp['/']
		          }
		        }

		        put = meta.$put
		        if (put) {
		          const tmp = { ...msg }
		          tmp.put = ':])([:' // Placeholder to avoid double serialization of put data.
		          json(tmp, (err, raw) => {
		            if (err) {
		              return
		            } // TODO: Handle!!
		            const S = Date.now()
		            const tmp = raw.indexOf('"put":":])([:"')
		            raw = raw.slice(0, tmp + 6) + put + raw.slice(tmp + 14) // Replace placeholder with actual put data.
		            handleSerializationResult(undefined, raw)
		            console.STAT?.(S, Date.now() - S, 'say slice')
		          })
		          return
		        }
		        json(msg, handleSerializationResult)
		        function handleSerializationResult(err, raw) {
		          if (err) {
		            return
		          } // TODO: Handle!!
		          meta.raw = raw
		          mesh.say(msg, peer)
		        }
		      }
		    })()

		    function flush(peer) {
		      let tmp = peer.batch
		      const t = typeof tmp === 'string'
		      if (t) {
		        tmp += ']'
		      } // TODO: Prevent double JSON!
		      peer.batch = peer.tail = null
		      if (!tmp) {
		        return
		      }
		      if (t ? 3 > tmp.length : !tmp.length) {
		        return
		      } // TODO: ^
		      if (!t) {
		        try {
		          tmp = 1 === tmp.length ? tmp[0] : JSON.stringify(tmp)
		        } catch (e) {
		          return opt.log('DAM JSON stringify error', e)
		        }
		      }
		      if (!tmp) {
		        return
		      }
		      send(tmp, peer)
		    }
		    // for now - find better place later.
		    function send(raw, peer) {
		      try {
		        const wire = peer.wire
		        if (peer.say) {
		          peer.say(raw)
		        } else if (wire.send) {
		          wire.send(raw)
		        }
		        mesh.say.d += raw.length || 0
		        ++mesh.say.c // STATS!
		      } catch (_e) {
		        peer.queue = peer.queue || [] // Queue message for retry if send fails.
		        peer.queue.push(raw)
		      }
		    }

		    mesh.near = 0
		    /**
		     * Initializes a new peer connection, sets up peer state, and processes any queued messages.
		     * @param {object} peer - The peer object to connect and initialize.
		     */
		    mesh.hi = (peer) => {
		      const wire = peer.wire
		      let tmp
		      if (!wire) {
		        mesh.wire((peer.length && { id: peer, url: peer }) || peer)
		        return
		      }
		      if (peer.id) {
		        opt.peers[peer.url || peer.id] = peer
		      } else {
		        tmp = peer.id = peer.id || peer.url || String.random(9)
		        opt.peers[tmp] = peer
		        mesh.say({ dam: '?', pid: root.opt.pid }, peer)
		        delete dup.s[peer.last] // IMPORTANT: see https://gun.eco/docs/DAM#self
		      }
		      if (!peer.met) {
		        mesh.near++
		        peer.met = Date.now()
		        root.on('hi', peer)
		      }
		      // @rogowski I need this here by default for now to fix go1dfish's bug
		      tmp = peer.queue
		      peer.queue = []
		      setTimeout.each(
		        // Send queued messages in batches to avoid overwhelming the peer.
		        tmp || [],
		        (msg) => {
		          send(msg, peer)
		        },
		        0,
		        9
		      )
		    }
		    /**
		     * Handles disconnection of a peer, cleans up state, and updates connection metrics.
		     * @param {object} peer - The peer object to disconnect.
		     */
		    mesh.bye = (peer) => {
		      peer.met && --mesh.near
		      delete peer.met
		      root.on('bye', peer)
		      let tmp = Date.now()
		      tmp = tmp - (peer.met || tmp)
		      mesh.bye.time = ((mesh.bye.time || tmp) + tmp) / 2
		    }
		    mesh.hear['!'] = (msg, _peer) => {
		      opt.log('Error:', msg.err)
		    }
		    mesh.hear['?'] = (msg, peer) => {
		      if (msg.pid) {
		        if (!peer.pid) {
		          peer.pid = msg.pid
		        }
		        if (msg['@']) {
		          return
		        }
		      }
		      mesh.say({ '@': msg['#'], dam: '?', pid: opt.pid }, peer)
		      delete dup.s[peer.last] // IMPORTANT: see https://gun.eco/docs/DAM#self
		    }
		    mesh.hear.mob = (msg, peer) => {
		      // NOTE: AXE will overload this with better logic.
		      if (!msg.peers) {
		        return
		      }
		      const peers = Object.keys(msg.peers),
		        one = peers[Math.floor(Math.random() * peers.length)]
		      if (!one) {
		        return
		      }
		      mesh.bye(peer)
		      mesh.hi(one)
		    }

		    root.on('create', function (root) {
		      root.opt.pid ||= String.random(9)
		      this.to.next(root)
		      root.on('out', mesh.say)
		    })

		    root.on('bye', function (peer, tmp) {
		      peer = opt.peers[peer.id || peer] || peer
		      this.to.next(peer)
		      if (peer.bye) {
		        peer.bye()
		      } else {
		        tmp = peer.wire
		        tmp?.close?.()
		      }
		      delete opt.peers[peer.id]
		      peer.wire = null
		    })

		    const gets = {}
		    root.on('bye', function (peer, tmp) {
		      this.to.next(peer)
		      tmp = console.STAT
		      if (tmp) {
		        tmp.peers = mesh.near
		      }
		      tmp = peer.url
		      if (!tmp) {
		        return
		      }
		      gets[tmp] = true
		      setTimeout(() => {
		        delete gets[tmp]
		      }, opt.lack || 9000)
		    })
		    root.on('hi', function (peer, tmp) {
		      this.to.next(peer)
		      tmp = console.STAT
		      if (tmp) {
		        tmp.peers = mesh.near
		      }
		      if (opt.super) {
		        return
		      } // temporary (?) until we have better fix/solution?
		      const souls = Object.keys(root.next || '') // TODO: .keys( is slow
		      if (souls.length > 9999 && !console.SUBS) {
		        console.SUBS =
		          'Warning: You have more than 10K live GETs, which might use more bandwidth than your screen can show - consider `.off()`.'
		        console.log(console.SUBS)
		      }
		      setTimeout.each(souls, (soul) => {
		        const node = root.next[soul]
		        if (opt.super || (node.ask || '')['']) {
		          mesh.say({ get: { '#': soul } }, peer)
		          return
		        }
		        setTimeout.each(Object.keys(node.ask || ''), (key) => {
		          if (!key) {
		            return
		          }
		          // is the lack of ## a !onion hint?
		          mesh.say(
		            {
		              '##': String.hash((root.graph[soul] || '')[key]),
		              get: { '.': key, '#': soul }
		            },
		            peer
		          )
		          // TODO: Switch this so Book could route?
		        })
		      })
		    })

		    return mesh
		  }

		  try {
		    module.exports = Mesh
		  } catch (_e) {}
	})(USE, './mesh');

	;USE(function(module){
		const Gun = USE('./root')
		  Gun.Mesh = USE('./mesh')

		  /**
		   * WebSocketManager handles WebSocket peer connections with improved reconnection,
		   * error handling, and online/offline support.
		   */
		  class WebSocketManager {
		    /**
		     * @param {Object} root - Gun root instance
		     * @param {Object} opt - Options object containing mesh, peers, etc.
		     */
		    constructor(root, opt) {
		      this.root = root
		      this.opt = opt
		      this.mesh = opt.mesh
		      this.logger = opt.logger || console
		      this.wait = 2 * 999 // Base retry delay in ms
		      this.maxRetries = opt.retry || 60
		    }

		    /**
		     * Sets up the wire function for mesh to create WebSocket connections.
		     */
		    setupWire() {
		      const wired = this.mesh.wire || this.opt.wire
		      this.mesh.wire = this.opt.wire = (peer) =>
		        this.open(peer) || wired?.(peer)
		    }

		    /**
		     * Sets up online/offline event listeners to handle reconnections.
		     */
		    setupOnlineOfflineHandling() {
		      if (typeof window !== 'undefined') {
		        window.addEventListener('online', () => this.handleOnline())
		        window.addEventListener('offline', () => this.handleOffline())
		      }
		    }

		    /**
		     * Handles when the browser comes online - attempts to reconnect peers and resync.
		     */
		    handleOnline() {
		      this.logger.log('Network online, reconnecting peers...')
		      this.reconnectAllPeers()
		      // Trigger a resync by sending 'hi' message
		      if (!this.opt.super) {
		        this.root.on('out', { dam: 'hi' })
		      }
		    }

		    /**
		     * Handles when the browser goes offline - logs the event.
		     */
		    handleOffline() {
		      this.logger.log('Network offline')
		    }

		    /**
		     * Attempts to reconnect all peers after coming online.
		     */
		    reconnectAllPeers() {
		      const peers = Object.values(this.opt.peers || {})
		      const peerIter = peers.values()
		      const filteredPeers = peerIter.filter(
		        (peer) => peer.wire && peer.wire.readyState === WebSocket.CLOSED
		      )
		      for (const peer of filteredPeers) {
		        peer.attempts = 0 // Reset attempt count
		        this.open(peer)
		      }
		    }

		    /**
		     * Creates a WebSocket connection for a peer with improved error handling.
		     * @param {Object} peer - Peer object with url and other properties.
		     * @returns {WebSocket|undefined} The WebSocket instance or undefined.
		     */
		    open(peer) {
		      if (!peer || !peer.url) {
		        return
		      }

		      const url = peer.url.replace(/^http/, 'ws')
		      let wire
		      try {
		        peer.wire = new this.opt.WebSocket(url)
		        wire = peer.wire

		        wire.onclose = () => {
		          this.logger.log('WebSocket closed for peer:', peer.url)
		          this.reconnect(peer)
		          this.mesh.bye(peer)
		        }

		        wire.onerror = (err) => {
		          this.logger.error('WebSocket error for peer:', peer.url, err)
		          this.reconnect(peer)
		        }

		        wire.onopen = () => {
		          this.logger.log('WebSocket opened for peer:', peer.url)
		          peer.attempts = 0 // Reset on successful connection
		          this.mesh.hi(peer)
		        }

		        wire.onmessage = (msg) => {
		          if (!msg) {
		            return
		          }
		          this.mesh.hear(msg.data || msg, peer)
		        }

		        return wire
		      } catch (e) {
		        this.logger.error('Failed to create WebSocket for peer:', peer.url, e)
		        this.mesh.bye(peer)
		      }
		    }

		    /**
		     * Handles reconnection with exponential backoff and jitter.
		     * @param {Object} peer - Peer to reconnect.
		     */
		    reconnect(peer) {
		      clearTimeout(peer.defer)

		      if (!this.opt.peers[peer.url]) {
		        return
		      }

		      peer.attempts = (peer.attempts || 0) + 1

		      if (peer.attempts > this.maxRetries) {
		        this.logger.log(
		          'Max reconnection attempts exceeded for peer:',
		          peer.url
		        )
		        return
		      }

		      const baseDelay = this.wait
		      const delay = Math.min(
		        baseDelay * 2 ** (peer.attempts - 1) + Math.random() * 1000,
		        30000
		      ) // Cap at 30 seconds with jitter

		      const doc = typeof document !== 'undefined' && document
		      peer.defer = setTimeout(() => {
		        if (doc?.hidden) {
		          peer.defer = setTimeout(() => this.open(peer), this.wait)
		          return
		        }
		        this.open(peer)
		      }, delay)
		    }

		    /**
		     * Sends initial 'hi' message to peers.
		     */
		    sendInitialHi() {
		      setTimeout(() => {
		        if (!this.opt.super) {
		          this.root.on('out', { dam: 'hi' })
		        }
		      }, 1) // Minimal delay to allow socket setup
		    }

		    /**
		     * Initializes the WebSocket manager by setting up wire, online/offline handling, and sending initial hi.
		     */
		    init() {
		      this.setupWire()
		      this.setupOnlineOfflineHandling()
		      this.sendInitialHi()
		    }
		  }

		  Gun.on('opt', function (root) {
		    this.to.next(root)
		    if (root.once) {
		      return
		    }
		    const opt = root.opt
		    if (false === opt.WebSocket) {
		      return
		    }

		    const env = Gun.window || {}
		    const websocket =
		      opt.WebSocket || env.WebSocket || env.webkitWebSocket || env.mozWebSocket
		    if (!websocket) {
		      return
		    }
		    opt.WebSocket = websocket

		    opt.mesh = opt.mesh || Gun.Mesh(root)

		    // Create and initialize WebSocket manager
		    const wsManager = new WebSocketManager(root, opt)
		    wsManager.init()
		  })
	})(USE, './websocket');

	;USE(function(module){
		if (typeof Gun === 'undefined') {
		    return
		  }

		  // Constants and utilities
		  let store

		  try {
		    store = Gun.window?.localStorage
		  } catch (_e) {}
		  if (!store) {
		    Gun.log('Warning: No localStorage exists to persist data to!')
		    store = {
		      getItem: function (k) {
		        return this[k]
		      },
		      removeItem: function (k) {
		        delete this[k]
		      },
		      setItem: function (k, v) {
		        this[k] = v
		      }
		    }
		  }

		  // Async JSON utilities (fallback if not available)
		  const _parse =
		    JSON.parseAsync ||
		    ((t, cb, r) => {
		      try {
		        cb(undefined, JSON.parse(t, r))
		      } catch (e) {
		        cb(e)
		      }
		    })
		  const json =
		    JSON.stringifyAsync ||
		    ((v, cb, r, s) => {
		      try {
		        cb(undefined, JSON.stringify(v, r, s))
		      } catch (e) {
		        cb(e)
		      }
		    })

		  /**
		   * Initializes localStorage persistence for a GUN instance.
		   * Sets up event listeners for get and put operations to persist data.
		   * @param {Object} root - The GUN root instance.
		   */
		  Gun.on('create', function lg(root) {
		    this.to.next(root)
		    const opt = root.opt
		    const _graph = root.graph
		    let acks = []
		    let disk
		    let to
		    let size
		    let stop
		    if (false === opt.localStorage) {
		      return
		    }
		    opt.prefix = opt.file || 'gun/'
		    try {
		      const item = store.getItem(opt.prefix)
		      disk = lg[opt.prefix] =
		        lg[opt.prefix] || new Map(Object.entries(JSON.parse(item) || {})) // Load persisted data from localStorage (blocking, but limited to 5MB)
		      size = (item || '').length
		    } catch (_e) {
		      disk = lg[opt.prefix] = new Map()
		      size = 0
		    }

		    root.on('get', function (msg) {
		      this.to.next(msg)
		      const lex = msg.get
		      const soul = lex?.['#']
		      let data

		      if (!lex || !soul) {
		        return
		      }
		      // Retrieve data from in-memory disk
		      data = disk.get(soul)
		      const tmp = lex?.['.']
		      if (data && tmp && !Object.plain(tmp)) {
		        // Pluck specific field from the data using state management
		        data = Gun.state.ify({}, tmp, Gun.state.is(data, tmp), data[tmp], soul)
		      }
		      //if(data){ (tmp = {})[soul] = data } // back into a graph.
		      //setTimeout(function(){
		      Gun.on.get.ack(msg, data) //root.on('in', {'@': msg['#'], put: tmp, lS:1});// || root.$});
		      //}, Math.random() * 10); // FOR TESTING PURPOSES!
		    })

		    root.on('put', function (msg) {
		      this.to.next(msg) // remember to call next middleware adapter
		      const put = msg.put
		      const soul = put['#']
		      const key = put['.']
		      const id = msg['#']
		      const ok = msg.ok || ''
		      // Merge data into in-memory disk using state management
		      disk.set(
		        soul,
		        Gun.state.ify(disk.get(soul), key, put['>'], put[':'], soul)
		      )
		      if (stop && size > 4999880) {
		        // Enforce localStorage size limit (~5MB) to prevent errors
		        root.on('in', { '@': id, err: 'localStorage max!' })
		        return
		      }
		      // Probabilistic ack to reduce network traffic for non-ack messages
		      if (!msg['@'] && (!msg._.via || Math.random() < ok['@'] / ok['/'])) {
		        acks.push(id)
		      }
		      if (to) {
		        return
		      }
		      // Schedule flush with delay proportional to data size to balance performance
		      to = setTimeout(flush, 9 + size / 333) // 0.1MB = 0.3s, 5MB = 15s
		    })
		    /**
		     * Flushes the in-memory disk to localStorage with deferred execution.
		     * Handles size limits, probabilistic acks, and error reporting.
		     */
		    function flush() {
		      // Defer flush if event loop is busy and no pending acks to avoid blocking
		      if (!acks.length && ((setTimeout.turn || '').s || '').length) {
		        setTimeout(flush, 99)
		        return
		      }
		      let _err
		      const ack = acks
		      clearTimeout(to)
		      to = false
		      acks = []
		      // Persist disk to localStorage
		      json(Object.fromEntries(disk), (_err, tmp) => {
		        try {
		          !_err && store.setItem(opt.prefix, tmp)
		        } catch (e) {
		          _err = stop = e || 'localStorage failure'
		        }
		        if (_err) {
		          Gun.log(
		            _err +
		              " Consider using GUN's IndexedDB plugin for RAD for more storage space, https://gun.eco/docs/RAD#install"
		          )
		          root.on('localStorage:error', {
		            err: _err,
		            get: opt.prefix,
		            put: Object.fromEntries(disk)
		          })
		        }
		        size = tmp.length

		        // Send acks for persisted messages
		        let delay = 0
		        for (const id of ack) {
		          setTimeout(() => {
		            root.on('in', { '@': id, err: _err, ok: 0 }) // localStorage isn't reliable, so make its `ok` code be a low number.
		          }, delay)
		          delay += 99
		        }
		      })
		    }
		  })
	})(USE, './localStorage');



}());

;(() => {
  /* BELOW IS TEMPORARY FOR OLD INTERNAL COMPATIBILITY, THEY ARE IMMEDIATELY DEPRECATED AND WILL BE REMOVED IN NEXT VERSION */
  const u = undefined
  if (typeof Gun === 'undefined') {
    return
  }
  const DEP = (n) => {
    console.warn(
      'Warning! Deprecated internal utility will break in next version:',
      n
    )
  }
  // Generic javascript utilities.
  const Type = Gun
  //Type.fns = Type.fn = {is: function(fn){ return (!!fn && fn instanceof Function) }}
  Type.fn = Type.fn || {
    is: (fn) => {
      DEP('fn')
      return !!fn && typeof fn === 'function'
    }
  }
  Type.bi = Type.bi || {
    is: (b) => {
      DEP('bi')
      return b instanceof Boolean || typeof b === 'boolean'
    }
  }
  Type.num = Type.num || {
    is: (n) => {
      DEP('num')
      return (
        !list_is(n) &&
        (n - parseFloat(n) + 1 >= 0 || Infinity === n || -Infinity === n)
      )
    }
  }
  Type.text = Type.text || {
    is: (t) => {
      DEP('text')
      return typeof t === 'string'
    }
  }
  Type.text.ify =
    Type.text.ify ||
    ((t) => {
      DEP('text.ify')
      if (Type.text.is(t)) {
        return t
      }
      if (typeof JSON !== 'undefined') {
        return JSON.stringify(t)
      }
      return t?.toString?.() ?? t
    })
  Type.text.random =
    Type.text.random ||
    ((l, c) => {
      DEP('text.random')
      let s = ''
      l = l || 24 // you are not going to make a 0 length random number, so no need to check type
      c = c || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz'
      while (l > 0) {
        s += c.charAt(Math.floor(Math.random() * c.length))
        l--
      }
      return s
    })
  Type.text.match =
    Type.text.match ||
    ((text, options) => {
      DEP('text.match')
      if (typeof text !== 'string') {
        return false
      }
      if (typeof options === 'string') {
        options = { '=': options }
      }
      options = options || {}
      // Check exact match
      if (options['='] !== undefined) {
        return text === options['=']
      }
      // Check prefix match
      if (options['*'] !== undefined) {
        return text.startsWith(options['*'])
      }
      // Check range
      const hasMin = options['>'] !== undefined
      const hasMax = options['<'] !== undefined
      if (hasMin && hasMax) {
        return text >= options['>'] && text <= options['<']
      }
      if (hasMin) {
        return text >= options['>']
      }
      if (hasMax) {
        return text <= options['<']
      }
      return false
    })
  Type.text.hash =
    Type.text.hash ||
    ((s, c) => {
      // via SO
      DEP('text.hash')
      if (typeof s !== 'string') {
        return
      }
      c ??= 0
      if (!s.length) {
        return c
      }
      let i = 0
      const l = s.length
      let n
      for (; i < l; ++i) {
        n = s.charCodeAt(i)
        c = (c << 5) - c + n
        c |= 0
      }
      return c
    })
  Type.list = Type.list || {
    is: (l) => {
      DEP('list')
      return Array.isArray(l)
    }
  }
  Type.list.slit = Type.list.slit || Array.prototype.slice
  Type.list.sort =
    Type.list.sort ||
    ((k) => {
      // creates a new sort function based off some key
      DEP('list.sort')
      return (A, B) => {
        if (!A || !B) {
          return 0
        }
        A = A[k]
        B = B[k]
        if (A < B) {
          return -1
        } else if (A > B) {
          return 1
        } else {
          return 0
        }
      }
    })
  Type.list.map =
    Type.list.map ||
    ((l, c, _) => {
      DEP('list.map')
      return obj_map(l, c, _)
    })
  Type.list.index = 1 // change this to 0 if you want non-logical, non-mathematical, non-matrix, non-convenient array notation
  Type.obj = Type.obj || {
    is: (o) => {
      DEP('obj')
      return o
        ? (o instanceof Object && o.constructor === Object) ||
            Object.prototype.toString.call(o).match(/^\[object (\w+)\]$/)[1] ===
              'Object'
        : false
    }
  }
  Type.obj.put =
    Type.obj.put ||
    ((o, k, v) => {
      DEP('obj.put')
      const target = o || {}
      target[k] = v
      return target
    })
  Type.obj.has =
    Type.obj.has ||
    ((o, k) => {
      DEP('obj.has')
      return o && Object.hasOwn(o, k)
    })
  Type.obj.del =
    Type.obj.del ||
    ((o, k) => {
      DEP('obj.del')
      if (!o) {
        return
      }
      o[k] = null
      delete o[k]
      return o
    })
  Type.obj.as =
    Type.obj.as ||
    ((o, k, v, u) => {
      DEP('obj.as')
      o[k] = o[k] || (u === v ? {} : v)
      return o[k]
    })
  Type.obj.ify =
    Type.obj.ify ||
    ((o) => {
      DEP('obj.ify')
      if (obj_is(o)) {
        return o
      }
      try {
        o = JSON.parse(o)
      } catch (_e) {
        o = {}
      }
      return o
    })
  ;(() => {
    // Copy properties from 'from' to 'to', setting only if key is missing or value is undefined
    function copyPropertyIfNotPresent(value, key) {
      if (!(key in this) || this[key] === undefined) {
        this[key] = value
      }
    }
    Type.obj.to =
      Type.obj.to ||
      ((from, to) => {
        DEP('obj.to')
        to = to || {}
        obj_map(from, copyPropertyIfNotPresent, to)
        return to
      })
  })()
  Type.obj.copy =
    Type.obj.copy ||
    ((o) => {
      DEP('obj.copy') // because http://web.archive.org/web/20140328224025/http://jsperf.com/cloning-an-object/2
      return !o ? o : JSON.parse(JSON.stringify(o)) // is shockingly faster than anything else, and our data has to be a subset of JSON anyways!
    })
  ;(() => {
    // Check if object has any keys not in the excluded set (excluded can be a value or object of keys to exclude)
    function isNonExcludedKey(_value, key) {
      const excluded = this.excluded
      if (excluded) {
        if (
          typeof excluded === 'object' &&
          obj_is(excluded) &&
          obj_has(excluded, key)
        ) {
          return // key is excluded
        }
        if (key === excluded) {
          return // key matches excluded value
        }
      }
      if (key !== undefined) {
        return true // found a non-excluded key
      }
    }
    Type.obj.empty =
      Type.obj.empty ||
      ((o, excluded) => {
        DEP('obj.empty')
        if (!o) {
          return true
        }
        return !obj_map(o, isNonExcludedKey, { excluded: excluded })
      })
  })()
  ;(() => {
    // Result collector function: if 2 args, sets key-value in object; if 1 arg, pushes to array
    function resultCollector(...args) {
      if (args.length === 2) {
        const [k, v] = args
        resultCollector.results = resultCollector.results || {}
        resultCollector.results[k] = v
        return
      }
      const [k] = args
      resultCollector.results = resultCollector.results || []
      resultCollector.results.push(k)
    }
    const keys = Object.keys
    let map, _u
    Object.keys =
      Object.keys ||
      ((o) =>
        map(o, (_v, k, resultCollector) => {
          resultCollector(k)
        }))
    Type.obj.map = map =
      Type.obj.map ||
      ((listOrObj, callbackOrValue, context) => {
        DEP('obj.map')
        const u = undefined
        let i = 0,
          x,
          result,
          objKeys,
          hasObjKeys,
          index,
          isFunction = 'function' === typeof callbackOrValue
        resultCollector.results = u
        if (keys && obj_is(listOrObj)) {
          objKeys = keys(listOrObj)
          hasObjKeys = true
        }
        context = context || {}
        if (list_is(listOrObj) || objKeys) {
          x = (objKeys || listOrObj).length
          for (; i < x; i++) {
            index = i + Type.list.index
            if (isFunction) {
              result = hasObjKeys
                ? callbackOrValue.call(
                    context,
                    listOrObj[objKeys[i]],
                    objKeys[i],
                    resultCollector
                  )
                : callbackOrValue.call(
                    context,
                    listOrObj[i],
                    index,
                    resultCollector
                  )
              if (result !== u) {
                return result
              }
            } else {
              // If callbackOrValue is not a function, treat as value to find
              // TODO: implement deep equality testing
              if (callbackOrValue === listOrObj[hasObjKeys ? objKeys[i] : i]) {
                return hasObjKeys ? objKeys[i] : index
              }
            }
          }
        } else {
          for (i in listOrObj) {
            if (isFunction) {
              if (obj_has(listOrObj, i)) {
                result = context
                  ? callbackOrValue.call(
                      context,
                      listOrObj[i],
                      i,
                      resultCollector
                    )
                  : callbackOrValue(listOrObj[i], i, resultCollector)
                if (result !== u) {
                  return result
                }
              }
            } else {
              // TODO: implement deep equality testing
              if (callbackOrValue === listOrObj[i]) {
                return i
              }
            }
          }
        }
        return isFunction ? resultCollector.results : Type.list.index ? 0 : -1
      })
  })()
  Type.time = Type.time || {}
  Type.time.is =
    Type.time.is ||
    ((t) => {
      DEP('time')
      return t ? t instanceof Date : +Date.now()
    })

  const fn_is = Type.fn.is
  const list_is = Type.list.is
  const Val = {}
  Val.is = (v) => {
    DEP('val.is') // Valid values are a subset of JSON: null, binary, number (!Infinity), text, or a soul relation. Arrays need special algorithms to handle concurrency, so they are not supported directly. Use an extension that supports them if needed but research their problems first.
    if (v === u) {
      return false
    }
    if (v === null) {
      return true
    } // "deletes", nulling out keys.
    if (v === Infinity) {
      return false
    } // we want this to be, but JSON does not support it, sad face.
    if (
      text_is(v) || // by "text" we mean strings.
      bi_is(v) || // by "binary" we mean boolean.
      num_is(v)
    ) {
      // by "number" we mean integers or decimals.
      return true // simple values are valid.
    }
    return Val.link.is(v) || false // is the value a soul relation? Then it is valid and return it. If not, everything else remaining is an invalid data type. Custom extensions can be built on top of these primitives to support other types.
  }
  Val.link = Val.rel = { _: '#' }
  ;(() => {
    Val.link.is = (v) => {
      DEP('val.link.is') // this defines whether an object is a soul relation or not, they look like this: {'#': 'UUID'}
      if (v?.[rel_] && !v._ && obj_is(v)) {
        // must be an object.
        const validationResult = {}
        obj_map(v, validateRelationProperty, validationResult)
        if (validationResult.id) {
          // we found an id.
          return validationResult.id // yay! Return it.
        }
      }
      return false // the value was not a valid soul relation.
    }
    // Ensure the object has exactly one property: the relation key with a string value
    function validateRelationProperty(value, key) {
      if (this.id !== undefined) {
        this.id = false
        return
      } // if ID is already defined AND we're still looping through the object, it is considered invalid.
      if (key === rel_ && text_is(value)) {
        // the key should be '#' and have a text value.
        this.id = value // we found the soul!
      } else {
        this.id = false // if there exists anything else on the object that isn't the soul, then it is considered invalid.
      }
    }
  })()
  Val.link.ify = (t) => {
    DEP('val.link.ify')
    return obj_put({}, rel_, t)
  } // convert a soul into a relation and return it.
  Type.obj.has._ = '.'
  const rel_ = Val.link._

  Type.val = Type.val || Val

  const Node = { _: '_' }
  Node.soul = (n, o) => {
    DEP('node.soul')
    return n?._?.[o || soul_]
  } // convenience function to check to see if there is a soul on a node and return it.
  Node.soul.ify = (n, o) => {
    DEP('node.soul.ify') // put a soul on an object.
    o = typeof o === 'string' ? { soul: o } : o || {}
    n = n || {} // make sure it exists.
    n._ = n._ || {} // make sure meta exists.
    n._[soul_] = o.soul || n._[soul_] || text_random() // put the soul on it.
    return n
  }
  Node.soul._ = Val.link._
  ;(() => {
    Node.is = (n, cb, as) => {
      DEP('node.is')
      // checks to see if an object is a valid node.
      if (!obj_is(n)) {
        return false
      } // must be an object.
      const soul = Node.soul(n)
      if (soul) {
        // must have a soul on it.
        return !obj_map(n, validateNodeValue, { as: as, cb: cb, n: n, s: soul })
      }
      return false // nope! This was not a valid node.
    }
    // Validate each property of the node
    function validateNodeValue(value, key) {
      if (key === Node._) {
        return
      } // skip over the metadata.
      if (!Val.is(value)) {
        return true
      } // it is true that this is an invalid node.
      if (this.cb) {
        this.cb.call(this.as, value, key, this.n, this.s)
      } // optionally callback each key/value.
    }
  })()
  ;(() => {
    Node.ify = (obj, options, as) => {
      DEP('node.ify') // returns a node from a shallow object.
      if (!options) {
        options = {}
      } else if (typeof options === 'string') {
        options = { soul: options }
      } else if ('function' === typeof options) {
        options = { map: options }
      }
      if (options.map) {
        options.node = options.map.call(as, obj, u, options.node || {})
      }
      options.node = Node.soul.ify(options.node || {}, options)
      if (options.node) {
        obj_map(obj, processObjectProperty, { as: as, o: options })
      }
      return options.node // This will only be a valid node if the object wasn't already deep!
    }
    // Process each property of the object to build the node
    function processObjectProperty(value, key) {
      const options = this.o
      let transformed
      if (options.map) {
        transformed = options.map.call(this.as, value, key, options.node)
        if (transformed === undefined) {
          obj_del(options.node, key)
        } else if (options.node) {
          options.node[key] = transformed
        }
        return
      }
      if (Val.is(value)) {
        options.node[key] = value
      }
    }
  })()
  const soul_ = Node.soul._
  const _u = undefined
  Type.node = Type.node || Node

  const State = Type.state
  State.lex = () => {
    DEP('state.lex')
    return State().toString(36).replace('.', '')
  }
  State.to = (from, k, to) => {
    DEP('state.to')
    let val = from?.[k]
    if (obj_is(val)) {
      val = obj_copy(val)
    }
    return State.ify(to, k, State.is(from, k), val, Node.soul(from))
  }
  ;(() => {
    State.map = (cb, s, as) => {
      DEP('state.map')
      const u = undefined
      const temp = cb || s
      const stateObj = obj_is(temp) ? temp : null
      cb = fn_is(temp) ? temp : null
      if (stateObj && !cb) {
        s = num_is(s) ? s : State()
        stateObj[N_] = stateObj[N_] || {}
        obj_map(stateObj, setKeyState, { o: stateObj, s: s })
        return stateObj
      }
      as = as || obj_is(s) ? s : u
      s = num_is(s) ? s : State()
      return function (v, k, o, opt) {
        if (!cb) {
          setKeyState.call({ o: o, s: s }, v, k)
          return v
        }
        cb.call(as || this || {}, v, k, o, opt)
        if (obj_has(o, k) && u === o[k]) {
          return
        }
        setKeyState.call({ o: o, s: s }, v, k)
      }
    }
    // Set state for the key if not metadata
    function setKeyState(_value, key) {
      if (key === N_) {
        return
      }
      State.ify(this.o, key, this.s)
    }
  })()
  const N_ = Node._

  const Graph = {}
  ;(() => {
    Graph.is = (g, cb, fn, as) => {
      DEP('graph.is') // checks to see if an object is a valid graph.
      if (!g || !obj_is(g) || obj_empty(g)) {
        return false
      } // must be an object.
      return !obj_map(g, validateGraphSoul, { as: as, cb: cb, fn: fn }) // makes sure it wasn't an empty object.
    }
    // Validate that each node in the graph is valid
    function validateGraphSoul(node, soul) {
      if (
        !node ||
        soul !== Node.soul(node) ||
        !Node.is(node, this.fn, this.as)
      ) {
        return true
      } // it is true that this is an invalid graph.
      if (!this.cb) {
        return
      }
      nodeValidator.n = node
      nodeValidator.as = this.as // sequential race conditions aren't races.
      this.cb.call(nodeValidator.as, node, soul, nodeValidator)
    }
    // Callback function for node validation
    function nodeValidator(callback) {
      if (callback) {
        Node.is(nodeValidator.n, callback, nodeValidator.as)
      }
    }
  })()
  ;(() => {
    Graph.ify = (obj, env, as) => {
      DEP('graph.ify')
      const context = { obj: obj, path: [] }
      if (!env) {
        env = {}
      } else if (typeof env === 'string') {
        env = { soul: env }
      } else if ('function' === typeof env) {
        env.map = env
      }
      if (typeof as === 'string') {
        env.soul = env.soul || as
        as = u
      }
      if (env.soul) {
        context.link = Val.link.ify(env.soul)
      }
      env.shell = as?.shell
      env.graph = env.graph || {}
      env.seen = env.seen || []
      env.as = env.as || as
      processGraphNode(env, context)
      env.root = context.node
      return env.graph
    }
    // Process a node in the object graph, handling cycles
    function processGraphNode(env, context) {
      const existing = findPreviouslySeenObject(env, context)
      if (existing) {
        return existing
      }
      context.env = env
      context.soul = updateNodeSoul
      if (Node.ify(context.obj, processGraphValue, context)) {
        context.link = context.link || Val.link.ify(Node.soul(context.node))
        if (context.obj !== env.shell) {
          env.graph[Val.link.is(context.link)] = context.node
        }
      }
      return context
    }
    // Process each value in the object, validating and linking
    function processGraphValue(v, k, n) {
      const env = this.env
      let isValid
      let tmp
      if (Node._ === k && obj_has(v, Val.link._)) {
        return n._ // TODO: Bug?
      }
      isValid = validateGraphValue(v, k, n, this, env)
      if (!isValid) {
        return
      }
      if (!k) {
        this.node = this.node || n || {}
        if (obj_has(v, Node._) && Node.soul(v)) {
          // ? for safety ?
          this.node._ = obj_copy(v._)
        }
        this.node = Node.soul.ify(this.node, Val.link.is(this.link))
        this.link = this.link || Val.link.ify(Node.soul(this.node))
      }
      tmp = env.map
      if (tmp) {
        tmp.call(env.as || {}, v, k, n, this)
        if (obj_has(n, k)) {
          v = n[k]
          if (u === v) {
            obj_del(n, k)
            return
          }

          isValid = validateGraphValue(v, k, n, this, env)
          if (!isValid) {
            return
          }
        }
      }
      if (!k) {
        return this.node
      }
      if (true === isValid) {
        return v
      }
      tmp = processGraphNode(env, { obj: v, path: this.path.concat(k) })
      if (!tmp.node) {
        return
      }
      return tmp.link //{'#': Node.soul(tmp.node)};
    }
    // Update the soul of the current context
    function updateNodeSoul(id) {
      const prev = Val.link.is(this.link),
        graph = this.env.graph
      this.link = this.link || Val.link.ify(id)
      this.link[Val.link._] = id
      if (this.node?.[Node._]) {
        this.node[Node._][Val.link._] = id
      }
      if (obj_has(graph, prev)) {
        graph[id] = graph[prev]
        obj_del(graph, prev)
      }
    }
    // Validate the value for inclusion in the graph
    function validateGraphValue(v, k, n, context, env) {
      let tmp
      if (Val.is(v)) {
        return true
      }
      if (obj_is(v)) {
        return 1
      }
      tmp = env.invalid
      if (tmp) {
        v = tmp.call(env.as || {}, v, k, n)
        return validateGraphValue(v, k, n, context, env)
      }
      env.err = `Invalid value at '${context.path.concat(k).join('.')}'!`
      if (Type.list.is(v)) {
        env.err += ' Use `.set(item)` instead of an Array.'
      }
    }
    // Find if the object has been seen before to avoid cycles
    function findPreviouslySeenObject(env, context) {
      let arr = env.seen,
        i = arr.length,
        has
      while (i--) {
        has = arr[i]
        if (context.obj === has.obj) {
          return has
        }
      }
      arr.push(context)
    }
  })()
  Graph.node = (node) => {
    DEP('graph.node')
    const soul = Node.soul(node)
    if (!soul) {
      return
    }
    return obj_put({}, soul, node)
  }
  ;(() => {
    Graph.to = (graph, root, opt) => {
      DEP('graph.to')
      if (!graph) {
        return
      }
      const obj = {}
      opt = opt || { seen: {} }
      obj_map(graph[root], convertGraphValue, {
        graph: graph,
        obj: obj,
        opt: opt
      })
      return obj
    }
    // Convert graph node back to object, resolving links recursively
    function convertGraphValue(value, key) {
      let linkId, resolved
      if (key === Node._) {
        if (obj_empty(value, Val.link._)) {
          return
        }
        this.obj[key] = obj_copy(value)
        return
      }
      linkId = Val.link.is(value)
      if (!linkId) {
        this.obj[key] = value
        return
      }
      resolved = this.opt.seen[linkId]
      if (resolved) {
        this.obj[key] = resolved
        return
      }
      this.obj[key] = this.opt.seen[linkId] = Graph.to(
        this.graph,
        linkId,
        this.opt
      )
    }
  })()
  Type.graph = Type.graph || Graph
})()
