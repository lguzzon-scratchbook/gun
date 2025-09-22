;(function(){

  /* UNBUILD */
function USE(arg, req) {
  return req
    ? require(arg)
    : arg.slice
      ? USE[R(arg)]
      : (mod, path) => {
          arg((mod = { exports: {} }))
          USE[R(path)] = mod.exports
        }
  function R(p) {
    return p.split('/').slice(-1).toString().replace('.js', '')
  }
}
if (typeof module !== 'undefined') {
  var MODULE = module
}

  /* UNBUILD */

	;USE(function(module){
		/**
		   * JavaScript Utilities Library
		   *
		   * A comprehensive collection of utility functions extending native JavaScript objects
		   * and providing enhanced scheduling capabilities. This library adds methods to String
		   * and Object prototypes while implementing advanced asynchronous execution patterns.
		   *
		   * @version 1.0.0
		   * @author JavaScript Utilities Team
		   */

		  // ===== STRING UTILITIES =====

		  /**
		   * Generates a random string of specified length using provided character set
		   *
		   * @param {number} [length=24] - Length of the random string to generate
		   * @param {string} [charset='0123456789ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz'] - Character set to use
		   * @returns {string} Generated random string
		   *
		   * @example
		   * String.random(8) // Returns: 'aB3xY9mK'
		   * String.random(4, '0123456789') // Returns: '7421'
		   */
		  String.random = (
		    length = 24,
		    charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz'
		  ) => {
		    let result = ''
		    const charsetLength = charset.length

		    for (let i = 0; i < length; i++) {
		      result += charset.charAt(Math.floor(Math.random() * charsetLength))
		    }

		    return result
		  }

		  /**
		   * Advanced string matching utility supporting multiple comparison operators
		   *
		   * @param {string} target - The string to test
		   * @param {string|Object} options - Matching criteria
		   * @param {string} [options['=']] - Exact match
		   * @param {string} [options['*']] - Starts with match
		   * @param {string} [options['>']] - Greater than or starts with
		   * @param {string} [options['<']] - Less than
		   * @returns {boolean} True if target matches any of the specified criteria
		   *
		   * @example
		   * String.match('hello', 'hello') // Returns: true (exact match)
		   * String.match('hello world', {'*': 'hello'}) // Returns: true (starts with)
		   * String.match('zebra', {'>': 'apple', '<': 'zoo'}) // Returns: true (between range)
		   */
		  String.match = (target, options) => {
		    if (typeof target !== 'string') {
		      return false
		    }

		    // Convert string option to exact match object
		    if (typeof options === 'string') {
		      options = { '=': options }
		    }

		    options = options || {}

		    // Check exact match first
		    if (options['='] !== undefined) {
		      return target === options['=']
		    }

		    // Check starts with pattern
		    if (options['*'] !== undefined) {
		      const prefix = options['*']
		      return target.startsWith(prefix)
		    }

		    // Check range comparisons
		    const hasGreaterThan = options['>'] !== undefined
		    const hasLessThan = options['<'] !== undefined

		    if (hasGreaterThan && hasLessThan) {
		      return target >= options['>'] && target <= options['<']
		    } else if (hasGreaterThan) {
		      return target >= options['>']
		    } else if (hasLessThan) {
		      return target <= options['<']
		    }

		    return false
		  }

		  /**
		   * Generates a hash code for a string using a simple hash algorithm
		   * Based on Java's String.hashCode() implementation
		   *
		   * @param {string} str - The string to hash
		   * @param {number} [seed=0] - Initial seed value for the hash
		   * @returns {number|undefined} Hash code as 32-bit integer, undefined for non-strings
		   *
		   * @example
		   * String.hash('hello') // Returns: 99162322
		   * String.hash('world', 12345) // Returns: hash with seed
		   */
		  String.hash = (str, seed = 0) => {
		    if (typeof str !== 'string') {
		      return undefined
		    }

		    if (str.length === 0) {
		      return seed
		    }

		    let hash = seed
		    for (let i = 0; i < str.length; i++) {
		      const char = str.charCodeAt(i)
		      hash = (hash << 5) - hash + char
		      hash = hash & hash // Convert to 32-bit integer
		    }

		    return hash
		  }

		  // ===== OBJECT UTILITIES =====

		  const hasOwnProperty = Object.prototype.hasOwnProperty

		  /**
		   * Determines if an object is a plain object (created by {} or new Object())
		   *
		   * @param {*} obj - Value to test
		   * @returns {boolean} True if the value is a plain object
		   *
		   * @example
		   * Object.plain({}) // Returns: true
		   * Object.plain([]) // Returns: false
		   * Object.plain(new Date()) // Returns: false
		   */
		  Object.plain = (obj) => {
		    if (!obj || typeof obj !== 'object') {
		      return false
		    }

		    // Check if it's a plain object created by {} or new Object()
		    return (
		      obj.constructor === Object ||
		      Object.prototype.toString.call(obj) === '[object Object]'
		    )
		  }

		  /**
		   * Checks if an object is empty (has no own enumerable properties)
		   *
		   * @param {Object} obj - Object to check
		   * @param {string[]} [excludeKeys] - Keys to exclude from the emptiness check
		   * @returns {boolean} True if object has no own properties (excluding specified keys)
		   *
		   * @example
		   * Object.empty({}) // Returns: true
		   * Object.empty({a: 1}) // Returns: false
		   * Object.empty({a: 1, b: 2}, ['a']) // Returns: false (b still exists)
		   */
		  Object.empty = (obj, excludeKeys) => {
		    if (!obj || typeof obj !== 'object') {
		      return true
		    }

		    for (const key in obj) {
		      if (hasOwnProperty.call(obj, key)) {
		        if (!excludeKeys || !excludeKeys.includes(key)) {
		          return false
		        }
		      }
		    }

		    return true
		  }

		  /**
		   * Polyfill for Object.keys() - returns array of object's own enumerable property names
		   * Only adds the method if it doesn't already exist (for older browsers)
		   */
		  if (!Object.keys) {
		    Object.keys = (obj) => {
		      const keys = []
		      for (const key in obj) {
		        if (hasOwnProperty.call(obj, key)) {
		          keys.push(key)
		        }
		      }
		      return keys
		    }
		  }
		  // ===== ADVANCED SCHEDULING UTILITIES =====

		  /**
		   * Enhanced setTimeout with polling capabilities and performance optimization
		   * Implements frame-aware scheduling to prevent blocking
		   */
		  ;(() => {
		    const originalSetTimeout = setTimeout
		    let lastTime = 0
		    let counter = 0

		    // Create setImmediate polyfill using MessageChannel for better performance
		    const setImmediatePolyfill = (() => {
		      if (typeof setImmediate !== 'undefined') {
		        return setImmediate
		      }

		      if (typeof MessageChannel !== 'undefined') {
		        const channel = new MessageChannel()
		        let callback

		        channel.port1.onmessage = (event) => {
		          if (event.data === 'trigger' && callback) {
		            callback()
		          }
		        }

		        return (fn) => {
		          callback = fn
		          channel.port2.postMessage('trigger')
		        }
		      }

		      return originalSetTimeout
		    })()

		    // Performance timing utility
		    const performanceTimer = (() => {
		      if (typeof performance !== 'undefined' && performance.now) {
		        return performance
		      }
		      return { now: () => Date.now() }
		    })()

		    /**
		     * Frame hold time - minimum time to hold before yielding control
		     * @type {number}
		     */
		    originalSetTimeout.hold = originalSetTimeout.hold || 9

		    /**
		     * Performance check utility
		     * @type {Object}
		     */
		    originalSetTimeout.check = originalSetTimeout.check || performanceTimer

		    /**
		     * Intelligent polling function that yields control when necessary
		     * Prevents blocking by limiting consecutive executions
		     *
		     * @param {Function} fn - Function to execute
		     */
		    originalSetTimeout.poll =
		      originalSetTimeout.poll ||
		      ((fn) => {
		        const now = performanceTimer.now()

		        // If we haven't held long enough and haven't exceeded max consecutive runs
		        if (now - lastTime >= originalSetTimeout.hold && counter++ < 3333) {
		          fn()
		          return
		        }

		        // Yield control and reset
		        setImmediatePolyfill(() => {
		          lastTime = performanceTimer.now()
		          counter = 0
		          fn()
		        })
		      })
		  })()

		  /**
		   * Turn-based execution system for managing multiple polling operations
		   * Prevents overwhelming the event loop by scheduling functions in turns
		   */
		  ;(() => {
		    const originalSetTimeout = setTimeout
		    const pollFunction = originalSetTimeout.poll
		    let currentIndex = 0
		    let currentFunction

		    /**
		     * Queue for turn-based function execution
		     * @type {Function[]}
		     */
		    const executionQueue = []

		    /**
		     * Main execution loop for turn-based processing
		     * Processes functions in queue with automatic cleanup
		     */
		    const executeNextTurn = () => {
		      // Execute current function if available
		      if ((currentFunction = executionQueue[currentIndex++])) {
		        currentFunction()
		      }

		      // Clean up queue when reaching end or batch limit
		      if (currentIndex === executionQueue.length || currentIndex === 99) {
		        executionQueue.splice(0, currentIndex)
		        currentIndex = 0
		      }

		      // Continue processing if queue has items
		      if (executionQueue.length > 0) {
		        pollFunction(executeNextTurn)
		      }
		    }

		    /**
		     * Adds a function to the turn-based execution queue
		     * Starts processing if this is the first function in queue
		     *
		     * @param {Function} fn - Function to add to execution queue
		     */
		    const addToTurnQueue = (fn) => {
		      const isFirstItem = executionQueue.push(fn) === 1
		      if (isFirstItem) {
		        pollFunction(executeNextTurn)
		      }
		    }

		    // Expose turn queue functionality
		    addToTurnQueue.s = executionQueue
		    originalSetTimeout.turn = originalSetTimeout.turn || addToTurnQueue
		  })()

		  /**
		   * Batch processing utility for handling large arrays without blocking
		   * Processes arrays in chunks with configurable batch sizes
		   */
		  ;(() => {
		    const originalSetTimeout = setTimeout
		    const turnFunction = originalSetTimeout.turn

		    /**
		     * Processes an array in batches to prevent UI blocking
		     *
		     * @param {Array} list - Array to process
		     * @param {Function} processor - Function to call for each item
		     * @param {Function} [callback] - Function to call when processing completes
		     * @param {number} [batchSize=9] - Number of items to process per batch
		     *
		     * @example
		     * setTimeout.each(largeArray, (item) => {
		     *   console.log(item);
		     * }, () => {
		     *   console.log('Processing complete');
		     * }, 10);
		     */
		    const batchProcessor = (list, processor, callback, batchSize = 9) => {
		      const processNextBatch = () => {
		        const batch = (list || []).splice(0, batchSize)
		        const batchLength = batch.length
		        let result

		        if (batchLength > 0) {
		          // Process current batch
		          for (let i = 0; i < batchLength; i++) {
		            result = processor(batch[i])
		            if (result !== undefined) {
		              break // Stop processing if processor returns a value
		            }
		          }

		          // Continue with next batch if no early termination
		          if (result === undefined) {
		            turnFunction(processNextBatch)
		            return
		          }
		        }

		        // Call completion callback if provided
		        if (callback) {
		          callback(result)
		        }
		      }

		      processNextBatch()
		    }

		    originalSetTimeout.each = originalSetTimeout.each || batchProcessor
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
		// TODO: BUG! Unbuild will make these globals... CHANGE unbuild to wrap files in a function.
		  // Book is a replacement for JS objects, maps, dictionaries.
		  const sT = setTimeout
		  let B = sT.Book
		  if (!B) {
		    /**
		     * @constructor Book
		     * @param {string} [text] - Optional text input for initializing the book.
		     * @returns {Function} The book function that manages key-value storage.
		     */
		    B = sT.Book = (text) => {
		      const b = function book(word, is) {
		        const has = b.all[word]
		        if (is === undefined) {
		          return has ? has.is : b.get(word)
		        }
		        if (has) {
		          const p = has.page
		          if (p) {
		            p.size += size(is) - size(has.is)
		            p.text = ''
		          }
		          has.text = ''
		          has.is = is
		          return b
		        }
		        //b.all[word] = {is: word}; return b;
		        return b.set(word, is)
		      }
		      // TODO: if from text, preserve the separator symbol.
		      b.list = [
		        {
		          book: b,
		          from: text,
		          get: b,
		          read: list,
		          size: (text || '').length,
		          substring: sub,
		          toString: to
		        }
		      ]
		      b.page = page
		      b.set = set
		      b.get = get
		      b.all = {}
		      return b
		    }
		  }
		  const PAGE = 2 ** 12

		  /**
		   * Retrieves the page for the given word.
		   * @param {string} word - The word to search for.
		   * @returns {Object} The page object.
		   */
		  function page(word) {
		    const l = this.list
		    const i = spot(word, l, this.parse)
		    let p = l[i]
		    if ('string' === typeof p) {
		      l[i] = p = {
		        book: this,
		        first: this.parse ? this.parse(p) : p,
		        get: this,
		        read: list,
		        size: -1,
		        substring: sub,
		        toString: to
		      }
		    } // TODO: test, how do we arrive at this condition again?
		    return p
		    // TODO: BUG! What if we get the page, it turns out to be too big & split, we must then RE get the page!
		  }
		  /**
		   * Retrieves the value associated with the given word.
		   * @param {string} word - The word to search for.
		   * @returns {*} The value associated with the word, or undefined if not found.
		   */
		  function get(word) {
		    if (!word) {
		      return
		    }
		    if (undefined !== word.is) {
		      return word.is
		    } // JS falsy values!
		    const hasGet = this.all[word]
		    if (hasGet) {
		      return hasGet.is
		    }
		    // get does an exact match, so we would have found it already, unless parseless page:
		    const page = this.page(word)
		    if (!page?.from) {
		      return
		    } // no parseless data
		    return got(word, page)
		  }
		  /**
		   * Retrieves the value for a word from a page.
		   * @param {string} word - The word to retrieve.
		   * @param {Object} page - The page object.
		   * @returns {*} The value associated with the word, or undefined if not found.
		   */
		  function got(word, page) {
		    const b = page.book
		    const l = from(page)
		    let hasGot
		    let i
		    if (l) {
		      i = spot(word, l, B.decode)
		      got.i = i
		      hasGot = l[i]
		    } // TODO: POTENTIAL BUG! This assumes that each word on a page uses the same serializer/formatter/structure. // TODO: BUG!!! Not actually, but if we want to do non-exact radix-like closest-word lookups on a page, we need to check limbo & potentially sort first.
		    // parseless may return -1 from actual value, so we may need to test both. // TODO: Double check? I think this is correct.
		    if (hasGot && word === hasGot.word) {
		      b.all[word] = hasGot
		      return hasGot.is
		    }
		    if (typeof hasGot !== 'string') {
		      i += 1
		      got.i = i
		      hasGot = l[i]
		    }
		    if (hasGot && word === hasGot.word) {
		      b.all[word] = hasGot
		      return hasGot.is
		    }
		    const [key, val] = slot(hasGot) // Escape!
		    if (word !== B.decode(key)) {
		      i += 1
		      got.i = i
		      hasGot = l[i][key] = slot(hasGot) // edge case bug?
		      if (word !== B.decode(key)) {
		        return
		      }
		    }
		    hasGot =
		      l[i] =
		      b.all[word] =
		        {
		          is: B.decode(val),
		          page: page,
		          substring: subt,
		          toString: tot,
		          word: String(word)
		        } // TODO: convert to a JS value!!! Maybe index! TODO: BUG word needs a page!!!! TODO: Check for other types!!!
		    return hasGot.is
		  }

		  /**
		   * Performs a binary search on a sorted array to find the insertion point for a word.
		   * @param {string} word - The word to search for.
		   * @param {Array} sorted - The sorted array to search in.
		   * @param {Function} [parse] - Optional parse function to transform array elements.
		   * @returns {number} The index where the word should be inserted.
		   */
		  function spot(word, sorted, parse) {
		    if (!Array.isArray(sorted)) {
		      throw new TypeError('sorted must be an array')
		    }
		    if (parse && typeof parse !== 'function') {
		      throw new TypeError('parse must be a function if provided')
		    }
		    if (!parse) {
		      if (!spot.no) {
		        spot.no = (t) => t
		      }
		      parse = spot.no
		    }
		    const L = sorted
		    let min = 0
		    let max = L.length
		    let i = Math.floor(max / 2)
		    word = String(word)
		    while (i !== min) {
		      const currentI = Math.floor(i)
		      const parsed = parse(L[currentI]) || ''
		      const page = parsed.substring()
		      const nextParsed = parse(L[currentI + 1]) || ''
		      const nextPage = nextParsed.substring()
		      if (!(word < page || nextPage <= word)) break
		      if (page <= word) {
		        min = currentI
		        i += (max - min) / 2
		      } else {
		        max = currentI
		        i -= (max - min) / 2
		      }
		    }
		    return Math.floor(i)
		  }

		  /**
		   * Processes the 'from' property of the given object.
		   * If 'from' is not a string, returns it as is.
		   * Otherwise, parses it using slot and updates the object.
		   * @param {Object} a - The object containing the 'from' property.
		   * @param {string|*} a.from - The value to process.
		   * @returns {*} The processed value.
		   */
		  function from(a) {
		    if ('string' !== typeof a.from) {
		      return a.from
		    }
		    const t = a.from || ''
		    const l = slot(t)
		    a.from = l
		    return l
		  }
		  /**
		   * Lists the items in the book, applying the each function to each item.
		   * @param {Function} [each] - Function to apply to each item. Defaults to identity.
		   * @returns {Array} Array of results from applying each to each item.
		   */
		  function list(each) {
		    each = each ?? ((x) => x)
		    const l = sort(this)
		    const r = []
		    const p = this.book?.parse ?? (() => {})
		    //while(w = l[i++]){ r.push(each(slot(w)[1], p(w)||w, this)) }
		    for (let idx = 0; idx < l.length; idx++) {
		      let w = l[idx]
		      w = w.word || p(w) || w
		      r.push(each(this.get(w), w, this))
		    } // TODO: BUG! PERF?
		    return r
		  }

		  /**
		   * Sets the value for a word in the book.
		   * @param {string} word - The word to set.
		   * @param {*} is - The value to set.
		   * @returns {Function} The book function.
		   */
		  function set(word, is) {
		    // TODO: Perf on random write is decent, but short keys or seq seems significantly slower.
		    let hasSet = this.all[word]
		    if (hasSet) {
		      return this(word, is)
		    } // updates to in-memory items will always match exactly.
		    const wordStr = String(word)
		    const page = this.page(wordStr)
		    if (page?.from) {
		      // if it could be an update to an existing word from parseless.
		      this.get(word)
		      if (this.all[word]) {
		        return this(word, is)
		      }
		    }
		    // MUST be an insert:
		    hasSet = this.all[wordStr] = {
		      is: is,
		      page: page,
		      substring: subt,
		      toString: tot,
		      word: wordStr
		    }
		    page.first = page.first < wordStr ? page.first : wordStr
		    if (!page.limbo) {
		      page.limbo = []
		    }
		    page.limbo.push(hasSet)
		    this(word, is)
		    page.size += size(wordStr) + size(is)
		    if ((this.PAGE ?? PAGE) < page.size) {
		      split(page, this)
		    }
		    return this
		  }

		  /**
		   * Splits a page when it exceeds the size limit.
		   * @param {Object} p - The page to split.
		   * @param {Object} b - The book containing the page.
		   */
		  function split(p, b) {
		    // TODO: use closest hash instead of half.
		    const L = sort(p)
		    const l = L.length
		    const i = (l / 2) >> 0
		    const j = i
		    const half = L[j]
		    const next = {
		      book: b,
		      first: half.substring(),
		      get: b,
		      read: list,
		      size: 0,
		      substring: sub,
		      toString: to
		    }
		    next.from = []
		    const f = next.from
		    let idx = 0
		    while (idx < L.length) {
		      const tmp = L[idx]
		      idx++
		      f.push(tmp)
		      next.size += (tmp.is || '').length || 1
		      tmp.page = next
		    }
		    p.from = p.from.slice(0, j)
		    p.size -= next.size
		    b.list.splice(spot(next.first, b.list) + 1, 0, next) // TODO: BUG! Make sure next.first is decoded text. // TODO: BUG! spot may need parse too?
		    if (b.split) {
		      b.split(next, p)
		    }
		  }

		  /**
		   * Parses a serialized string into an array.
		   * @param {string} t - The serialized string to parse.
		   * @returns {Array} The parsed array.
		   */
		  function slot(t) {
		    t = t ?? ''
		    return heal(t.substring(1, t.length - 1).split(t[0]), t[0])
		  }
		  B.slot = slot // TODO: check first=last & pass `s`.
		  /**
		   * Heals an array by rejoining escaped values split by a separator.
		   * @param {Array} l - The array to heal.
		   * @param {string} [s] - The separator, defaults to '|'.
		   * @returns {Array} The healed array.
		   */
		  function heal(l, s) {
		    if (!Array.isArray(l)) return []
		    if (typeof s !== 'string') s = '|'
		    const i = l.indexOf('')
		    if (0 > i) {
		      return l
		    } // ~700M ops/sec on 4KB of Math.random()s, even faster if escape does exist.
		    if ('' === l[0] && 1 === l.length) {
		      return []
		    } // annoying edge cases! how much does this slow us down?
		    //if((c=i+2+parseInt(l[i+1])) !== c){ return [] } // maybe still faster than below?
		    const originalE = l[i + 1]
		    const parsed = parseInt(
		      originalE.substring(0, originalE.indexOf('"')) || originalE,
		      10
		    )
		    const e = i + 2 + parsed
		    if (Number.isNaN(e)) {
		      return []
		    } // NaN check in JS is weird.
		    l[i] = l.slice(i, e).join(s ?? '|') // rejoin the escaped value
		    return l.slice(0, i + 1).concat(heal(l.slice(e), s)) // merge left with checked right.
		  }

		  /**
		   * @param {any} t
		   * @returns {number}
		   */
		  function size(t) {
		    return (t ?? '').length || 1
		  } // bits/numbers less size? Bug or feature?
		  /**
		   * @function subt
		   * @param {number} _i - Unused parameter.
		   * @param {number} _j - Unused parameter.
		   * @returns {string} The word property of the context.
		   */
		  function subt(_i, _j) {
		    return this.word
		  }
		  //function tot(){ return this.text = this.text || "'"+(this.word)+"'"+(this.is)+"'" }
		  function tot() {
		    //if((tmp = this.page) && tmp.saving){ delete tmp.book.all[this.word]; } // TODO: BUG! Book can't know about RAD, this was from RAD, so this MIGHT be correct but we need to refactor. Make sure to add tests that will re-trigger this.
		    this.text = this.text || `:${B.encode(this.word)}:${B.encode(this.is)}:`
		    return this.text
		    // tmp[this.word] = this.is;
		    // return this.text = this.text || B.encode(tmp,'|',':').slice(1,-1);
		    //return this.text = this.text || `'${this.word}'${this.is}'`;
		  }
		  function sub(i, j) {
		    return (
		      this.first ||
		      this.word ||
		      B.decode((from(this) || '')[0] || '')
		    ).substring(i, j)
		  }
		  function to() {
		    this.text = this.text || text(this)
		    return this.text
		  }
		  function text(p) {
		    // PERF: read->[*] : text->"*" no edit waste 1 time perf.
		    if (p.limbo) {
		      sort(p)
		    } // TODO: BUG? Empty page meaning? undef, '', '||'?
		    return 'string' === typeof p.from ? p.from : `|${(p.from || []).join('|')}|`
		  }

		  function sort(p, l) {
		    const f = 'string' === typeof p.from ? slot(p.from) : p.from || []
		    p.from = f
		    const limbo = l || p.limbo
		    if (!limbo) {
		      return f
		    }
		    return mix(p, limbo).sort((a, b) =>
		      (a.word || B.decode(String(a))) < (b.word || B.decode(String(b))) ? -1 : 1
		    )
		  }
		  function mix(p, l) {
		    // TODO: IMPROVE PERFORMANCE!!!! l[j] = i is 5X+ faster than .push(
		    const limbo = l || p.limbo || []
		    p.limbo = null
		    let i
		    const f = p.from
		    for (let idx = 0; idx < limbo.length; idx++) {
		      i = limbo[idx]
		      if (got(i.word, p)) {
		        f[got.i] = i // TODO: Trick: allow for a GUN'S HAM CRDT hook here.
		      } else {
		        f.push(i)
		      }
		    }
		    return f
		  }

		  B.encode = (d, s, u) => {
		    const sStr = s || '|'
		    const uStr = u || String.fromCharCode(32)
		    switch (typeof d) {
		      case 'string': {
		        // text
		        let i = d.indexOf(sStr)
		        let c = 0
		        while (i !== -1) {
		          c++
		          i = d.indexOf(sStr, i + 1)
		        }
		        return `${c ? `${sStr}${c}` : ''}"${d}`
		      }
		      case 'number':
		        return d < 0 ? `${d}` : `+${d}`
		      case 'boolean':
		        return d ? '+' : '-'
		      case 'object': {
		        if (!d) {
		          return ' '
		        } // TODO: BUG!!! Nested objects don't slot correctly
		        const l = Object.keys(d).sort()
		        let t = sStr
		        for (let idx = 0; idx < l.length; idx++) {
		          const k = l[idx]
		          t += `${uStr}${B.encode(k, sStr, uStr)}${uStr}${B.encode(d[k], sStr, uStr)}${uStr}${sStr}`
		        }
		        return t
		      }
		    }
		  }
		  B.decode = (t) => {
		    if ('string' !== typeof t) {
		      return
		    }
		    switch (t) {
		      case ' ':
		        return null
		      case '-':
		        return false
		      case '+':
		        return true
		    }
		    switch (t[0]) {
		      case '-':
		      case '+':
		        return parseFloat(t)
		      case '"':
		        return t.slice(1)
		    }
		    return t.slice(t.indexOf('"') + 1)
		  }

		  B.hash = (s, c) => {
		    // via SO
		    if (typeof s !== 'string') {
		      return
		    }
		    const cVal = c || 0 // CPU schedule hashing by
		    if (!s.length) {
		      return cVal
		    }
		    let cTemp = cVal
		    for (let i = 0, l = s.length; i < l; ++i) {
		      const n = s.charCodeAt(i)
		      cTemp = (cTemp << 5) - cTemp + n
		      cTemp |= 0
		    }
		    return cTemp
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
		      // we want +/- Infinity to be, but JSON does not support it, sad face.
		      // can you guess what v === v checks for? ;)
		      // biome-ignore lint/suspicious/noSelfCompare: old code works good like this ...
		      ('number' === typeof v && v !== Infinity && v !== -Infinity && v === v) ||
		      // Allow soul relations: objects with exactly one key '#' that is a non-empty string
		      (!!v &&
		        'string' === typeof v['#'] &&
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
		USE('./shim')
		  /**
		   * Creates a Dup instance for tracking duplicate IDs with automatic cleanup.
		   * @param {Object} [opt] - Options object.
		   * @param {number} [opt.age=9000] - Age in ms for cleanup.
		   * @param {number} [opt.max=999] - Max items.
		   * @returns {Object} Dup instance with check, track, drop methods.
		   */
		  function Dup(opt = { age: 1000 * 9, max: 999 }) {
		    const dup = { s: {} }
		    const s = dup.s
		    /**
		     * Checks if an ID is tracked, and tracks it if so.
		     * @param {string} id - The ID to check.
		     * @returns {Object|boolean} The tracked item or false.
		     */
		    dup.check = (id) => {
		      if (!s[id]) return false
		      return dt(id)
		    }
		    /**
		     * Tracks an ID with timestamp.
		     * @param {string} id - The ID to track.
		     * @returns {Object} The tracked item.
		     */
		    dup.track = (id) => {
		      if (!s[id]) {
		        s[id] = {}
		      }
		      const it = s[id]
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
		      let it
		      dup.to = null
		      dup.now = Date.now()
		      const l = Object.keys(s)
		      console.STAT?.(dup.now, Date.now() - dup.now, 'dup drop keys') // prev ~20% CPU 7% RAM 300MB // now ~25% CPU 7% RAM 500MB
		      setTimeout.each(
		        l,
		        (id) => {
		          it = s[id] // TODO: .keys( is slow?
		          if (it && (age || opt.age) > dup.now - it.was) {
		            return
		          }
		          delete s[id]
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
		   * @param {object} obj - The request object with err property.
		   * @param {Function} callback - Function to execute on timeout.
		   * @param {number} delay - Timeout delay in milliseconds.
		   * @param {boolean} [clearExisting=false] - Whether to clear existing timeout before setting new one.
		   */
		  const setRequestTimeout = (obj, callback, delay, clearExisting = false) => {
		    if (clearExisting) {
		      clearTimeout(obj.err) // Clear existing timeout if requested
		    }
		    obj.err = obj.err ?? setTimeout(callback, delay) // Set new timeout only if not already set
		  }
		  /**
		   * Generates a unique request ID, using provided ID if valid, otherwise random.
		   * @param {object} [as] - Options object that may contain a '#' property for ID.
		   * @returns {string} - The generated or provided ID.
		   * @throws {Error} - If ID generation fails or is invalid.
		   */
		  const generateRequestId = (as) => {
		    // Use provided ID if available and valid
		    const providedId = as?.['#']
		    if (providedId && typeof providedId === 'string' && providedId.length > 0) {
		      return providedId
		    }
		    // Fallback to random generation with error handling
		    const random =
		      String.random ??
		      (() => {
		        try {
		          return Math.random().toString(36).slice(2)
		        } catch (error) {
		          throw new Error(`Failed to generate random ID: ${error.message}`)
		        }
		      })
		    let generated
		    try {
		      generated = random()
		    } catch (error) {
		      throw new Error(`Random ID generation failed: ${error.message}`)
		    }
		    if (typeof generated !== 'string' || generated.length === 0) {
		      throw new Error('Generated random string is invalid')
		    }
		    return generated.slice(0, 9)
		  }

		  /**
		   * Handles asking and acknowledging messages with timeout management.
		   * @param {Function|string|object} cb - Callback function for ask, or ID/message for ack.
		   * @param {object} [as] - Additional options or data.
		   * @returns {string|boolean|undefined} - ID for ask, true for ack, or undefined.
		   */
		  const handleAcknowledgment = (self, cb, as, lack) => {
		    if (!cb) return // No callback provided, nothing to acknowledge
		    const id = cb?.['#'] || cb // Extract message ID from callback object or use cb directly
		    let tmp = self.tag?.[id] // Retrieve the pending request object from the tag map
		    if (!tmp) return // No pending request found, ignore acknowledgment
		    if (as) {
		      // If acknowledgment data is provided
		      tmp = self.on(id, as) // Update the request with acknowledgment data
		      setRequestTimeout(tmp, () => tmp.off(), lack, true) // Clear existing and set new timeout to remove request after lack period
		    }
		    return true // Acknowledgment handled successfully
		  }

		  /**
		   * Handles the ask operation by setting up the request and timeout.
		   * @param {object} self - The context object with 'on' method.
		   * @param {Function} cb - Callback function for the ask.
		   * @param {object} [as] - Additional options or data.
		   * @param {string} id - Unique identifier for the request.
		   * @param {number} lack - Timeout duration in milliseconds.
		   * @returns {string} - The request ID.
		   */
		  const handleAsk = (self, cb, as, id, lack) => {
		    const to = self.on(id, cb, as)
		    // Set timeout to handle lack of acknowledgment if not already set
		    setRequestTimeout(
		      to,
		      () => {
		        to.off()
		        to.next({ err: 'Error: No ACK yet.', lack: true })
		      },
		      lack,
		      false
		    )
		    return id
		  }

		  module.exports = function ask(cb, as) {
		    if (!this.on) {
		      throw new Error('Context must have an "on" method.')
		    }
		    const lack = this.opt?.lack ?? 9000

		    if (typeof cb !== 'function') {
		      // Handle acknowledgment for non-function cb (ack operation)
		      return handleAcknowledgment(this, cb, as, lack)
		    }
		    // Generate request ID for ask operation
		    const id = generateRequestId(as)
		    if (!cb) {
		      // Edge case: return ID if callback is falsy (though unlikely for function)
		      return id
		    }
		    // Set up ask operation with timeout
		    return handleAsk(this, cb, as, id, lack)
		  }
	})(USE, './ask');

	;USE(function(module){
		function Gun(o) {
		    if (o instanceof Gun) {
		      this._ = { $: this }
		      return this._.$
		    }
		    if (!(this instanceof Gun)) {
		      return new Gun(o)
		    }
		    this._ = { $: this, opt: o }
		    return Gun.create(this._)
		  }

		  Gun.is = ($) => $ instanceof Gun || ($?._ && $ === $._.$) || false

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
		    function universe(msg) {
		      //if(!F){ var eve = this; setTimeout(function(){ universe.call(eve, msg,1) },Math.random() * 100);return; } // ADD F TO PARAMS!
		      if (!msg) {
		        return
		      }
		      if (msg.out === universe) {
		        this.to.next(msg)
		        return
		      }
		      const as = this.as,
		        at = as.at || as,
		        gun = at.$,
		        dup = at.dup,
		        DBG = msg.DBG
		      let tmp
		      tmp = msg['#']
		      if (!tmp) {
		        tmp = msg['#'] = text_rand(9)
		      }
		      if (dup.check(tmp)) {
		        return
		      }
		      dup.track(tmp)
		      tmp = msg._
		      msg._ = 'function' === typeof tmp ? tmp : () => {}
		      const tmp$ = msg.$ && msg.$ === (msg.$._ || '').$
		      if (!tmp$) {
		        msg.$ = gun
		      }
		      if (msg['@'] && !msg.put) {
		        ack(msg)
		      }
		      if (!at.ask(msg['@'], msg)) {
		        // is this machine listening for an ack?
		        if (DBG) {
		          DBG.u = Date.now()
		        }
		        if (msg.put) {
		          put(msg)
		          return
		        } else if (msg.get) {
		          Gun.on.get(msg, gun)
		        }
		      }
		      if (DBG) {
		        DBG.uc = Date.now()
		      }
		      this.to.next(msg)
		      if (DBG) {
		        DBG.ua = Date.now()
		      }
		      if (msg.nts || msg.NTS) {
		        return
		      } // TODO: This shouldn't be in core, but fast way to prevent NTS spread. Delete this line after all peers have upgraded to newer versions.
		      msg.out = universe
		      at.on('out', msg)
		      if (DBG) {
		        DBG.ue = Date.now()
		      }
		    }
		    function put(msg) {
		      if (!msg) {
		        return
		      }
		      const ctx = msg._ || ''
		      ctx.$ = msg.$ || ''
		      ctx.root = (ctx.$._ || '').root
		      const root = ctx.root
		      if (msg['@'] && ctx.faith && !ctx.miss) {
		        // TODO: AXE may split/route based on 'put' what should we do here? Detect @ in AXE? I think we don't have to worry, as DAM will route it on @.
		        msg.out = universe
		        root.on('out', msg)
		        return
		      }
		      ctx.latch = root.hatch
		      ctx.match = root.hatch = []
		      const put = msg.put
		      ctx.DBG = msg.DBG
		      const DBG = ctx.DBG
		      const S = Date.now()
		      CT = CT || S
		      if (put['#'] && put['.']) {
		        /*root && root.on('put', msg);*/ return
		      } // TODO: BUG! This needs to call HAM instead.
		      if (DBG) {
		        DBG.p = S
		      }
		      ctx['#'] = msg['#']
		      ctx.msg = msg
		      ctx.all = 0
		      ctx.stun = 1
		      const nl = Object.keys(put) //.sort(); // TODO: This is unbounded operation, large graphs will be slower. Write our own CPU scheduled sort? Or somehow do it in below? Keys itself is not O(1) either, create ES5 shim over ?weak map? or custom which is constant.
		      if (console.STAT) {
		        ;(DBG || ctx).pk = Date.now()
		        console.STAT(S, (DBG || ctx).pk - S, 'put sort')
		      }
		      let ni = 0
		      let nj
		      let kl
		      let soul
		      let node
		      let states
		      let err
		      let tmp
		      const pop = (o) => {
		        if (nj !== ni) {
		          nj = ni
		          soul = nl[ni]
		          if (!soul) {
		            if (console.STAT) {
		              ;(DBG || ctx).pd = Date.now()
		              console.STAT(S, (DBG || ctx).pd - S, 'put')
		            }
		            fire(ctx)
		            return
		          }
		          node = put[soul]
		          if (!node) {
		            err = `${ERR + cut(soul)}no node.`
		          } else tmp = node._
		          if (!tmp) {
		            err = `${ERR + cut(soul)}no meta.`
		          } else if (soul !== tmp['#']) {
		            err = `${ERR + cut(soul)}soul not same.`
		          } else states = tmp['>']
		          if (!states) {
		            err = `${ERR + cut(soul)}no state.`
		          }
		          kl = Object.keys(node || {}) // TODO: .keys( is slow
		        }
		        if (err) {
		          msg.err = ctx.err = err // invalid data should error and stun the message.
		          fire(ctx)
		          //console.log("handle error!", err) // handle!
		          return
		        }
		        let i = 0
		        let key
		        o = o || 0
		        while (o++ < 9) {
		          key = kl[i++]
		          if (!key) {
		            break
		          }
		          if ('_' === key) {
		            continue
		          }
		          const val = node[key],
		            state = states[key]
		          if (u === state) {
		            err = `${ERR + cut(key)}on${cut(soul)}no state.`
		            break
		          }
		          if (!valid(val)) {
		            err = `${ERR + cut(key)}on${cut(soul)}bad ${typeof val}${cut(val)}`
		            break
		          }
		          //ctx.all++; //ctx.ack[soul+key] = '';
		          ham(val, key, soul, state, msg)
		          ++C // courtesy count;
		        }
		        kl = kl.slice(i)
		        if (kl.length) {
		          turn(pop)
		          return
		        }
		        ++ni
		        kl = null
		        pop(o)
		      }
		      pop()
		    }
		    Gun.on.put = put
		    // TODO: MARK!!! clock below, reconnect sync, SEA certify wire merge, User.auth taking multiple times, // msg put, put, say ack, hear loop...
		    // WASIS BUG! local peer not ack. .off other people: .open
		    const ham = (val, key, soul, state, msg) => {
		      const ctx = msg._ || {}
		      const root = ctx.root
		      const graph = root?.graph
		      const vertex = graph?.[soul] || empty
		      const was = state_is(vertex, key, 1)
		      const known = vertex[key]

		      const DBG = ctx.DBG
		      if (console.STAT) {
		        if (!graph?.[soul] || !known) {
		          console.STAT.has = (console.STAT.has || 0) + 1
		        }
		      }

		      const now = State()
		      if (state > now) {
		        const tmp = state - now
		        const delay = tmp > MD ? MD : tmp
		        setTimeout(() => ham(val, key, soul, state, msg), delay)
		        if (console.STAT) {
		          const hf = Date.now()
		          if (DBG) DBG.Hf = hf
		          console.STAT(hf, delay, 'future')
		        }
		        return
		      }
		      if (state < was) {
		        return
		      }
		      if (!ctx.faith) {
		        if (state === was && (val === known || L(val) <= L(known))) {
		          if (!ctx.miss) {
		            return
		          }
		        }
		      }
		      ctx.stun++
		      const aid = msg['#'] + ctx.all++
		      const id = { _: ctx, toString: () => aid }
		      id.toJSON = id.toString
		      root.dup.track(id)['#'] = msg['#']
		      if (DBG) {
		        DBG.ph = DBG.ph || Date.now()
		      }
		      root.on('put', {
		        _: ctx,
		        '@': msg['@'],
		        '#': id,
		        ok: msg.ok,
		        put: { ':': val, '.': key, '#': soul, '>': state }
		      })
		    }
		    function map(msg) {
		      const DBG = (msg._ || '').DBG
		      if (DBG) {
		        DBG.pa = Date.now()
		        DBG.pm = DBG.pm || Date.now()
		      }
		      const root = this.as,
		        graph = root.graph,
		        ctx = msg._,
		        put = msg.put,
		        soul = put['#'],
		        key = put['.'],
		        val = put[':'],
		        state = put['>']
		      let tmp = ctx.msg
		      if (tmp) {
		        tmp = tmp.put
		        if (tmp) {
		          tmp = tmp[soul]
		          if (tmp) {
		            state_ify(tmp, key, state, val, soul)
		          }
		        }
		      } // necessary! or else out messages do not get SEA transforms.
		      //var bytes = ((graph[soul]||'')[key]||'').length||1;
		      graph[soul] = state_ify(graph[soul], key, state, val, soul)
		      const tmp_next = (root.next || '')[soul]
		      if (tmp_next) {
		        //tmp.bytes = (tmp.bytes||0) + ((val||'').length||1) - bytes;
		        //if(tmp.bytes > 2**13){ Gun.log.once('byte-limit', "Note: In the future, GUN peers will enforce a ~4KB query limit. Please see https://gun.eco/docs/Page") }
		        tmp_next.on('in', msg)
		      }
		      fire(ctx)
		      this.to.next(msg)
		    }
		    const fire = (ctx, msg) => {
		      if (ctx.stop) {
		        return
		      }
		      ctx.stun--
		      if (!ctx.err && 0 < ctx.stun) {
		        return
		      } // TODO: 'forget' feature in SEA tied to this, bad approach, but hacked in for now. Any changes here must update there.
		      ctx.stop = 1
		      const root = ctx.root
		      if (!root) {
		        return
		      }
		      let tmp = ctx.match
		      tmp.end = 1
		      if (tmp === root.hatch) {
		        tmp = ctx.latch
		        if (!tmp || tmp.end) {
		          delete root.hatch
		        } else {
		          root.hatch = tmp
		        }
		      }
		      ctx.hatch?.() // TODO: rename/rework how put & this interact.
		      setTimeout.each(ctx.match, (cb) => {
		        cb?.()
		      })
		      msg = ctx.msg
		      if (!msg || ctx.err || msg.err) {
		        return
		      }
		      msg.out = universe
		      ctx.root.on('out', msg)

		      CF() // courtesy check;
		    }
		    const ack = (msg) => {
		      // aggregate ACKs.
		      const id = msg['@'] || ''
		      const ctx = id._
		      if (!ctx) {
		        let dup = msg.$?._?.root?.dup
		        dup = dup?.check(id)
		        if (!dup) {
		          return
		        }
		        msg['@'] = dup?.['#'] || msg['@'] // This doesn't do anything anymore, backtrack it to something else?
		        return
		      }
		      ctx.acks = (ctx.acks || 0) + 1
		      ctx.err = msg.err
		      if (ctx.err) {
		        msg['@'] = ctx['#']
		        fire(ctx) // TODO: BUG? How it skips/stops propagation of msg if any 1 item is error, this would assume a whole batch/resync has same malicious intent.
		      }
		      ctx.ok = msg.ok || ctx.ok
		      if (!ctx.stop && !ctx.crack) {
		        ctx.crack = ctx.match?.push(() => {
		          back(ctx)
		        })
		      } // handle synchronous acks. NOTE: If a storage peer ACKs synchronously then the PUT loop has not even counted up how many items need to be processed, so ctx.STOP flags this and adds only 1 callback to the end of the PUT loop.
		      back(ctx)
		    }
		    const back = (ctx) => {
		      if (!ctx?.root) {
		        return
		      }
		      if (ctx.stun || ctx.acks !== ctx.all) {
		        return
		      }
		      ctx.root.on('in', {
		        '@': ctx['#'],
		        err: ctx.err,
		        ok: ctx.err ? u : ctx.ok || { '': 1 }
		      })
		    }

		    const ERR = 'Error: Invalid graph!'
		    const cut = (s) => ` '${(`${s}`).slice(0, 9)}...' `
		    const L = JSON.stringify,
		      MD = 2147483647,
		      State = Gun.state
		    let C = 0
		    let CT
		    let CF = () => {
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
		    Gun.on.get = (msg, gun) => {
		      const root = gun._,
		        get = msg.get,
		        soul = get['#'],
		        has = get['.']
		      let node = root.graph[soul]
		      if (!root.next) root.next = {}
		      const next = root.next
		      const at = next[soul]

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
		      const ctx = msg._ || {}
		      ctx.DBG = msg.DBG
		      const DBG = ctx.DBG
		      if (DBG) DBG.g = Date.now()
		      //console.log("GET:", get, node, has, at);
		      //if(!node && !at){ return root.on('get', msg) }
		      //if(has && node){ // replace 2 below lines to continue dev?
		      if (!node) {
		        return root.on('get', msg)
		      }
		      if (has) {
		        if ('string' !== typeof has || u === node[has]) {
		          if (!at?.next?.[has]) {
		            root.on('get', msg)
		            return
		          }
		        }
		        node = state_ify({}, has, state_is(node, has), node[has], soul)
		        // If we have a key in-memory, do we really need to fetch?
		        // Maybe... in case the in-memory key we have is a local write
		        // we still need to trigger a pull/merge from peers.
		      }
		      //Gun.window? Gun.obj.copy(node) : node; // HNPERF: If !browser bump Performance? Is this too dangerous to reference root graph? Copy / shallow copy too expensive for big nodes. Gun.obj.to(node); // 1 layer deep copy // Gun.obj.copy(node); // too slow on big nodes
		      node && ack(msg, node)
		      root.on('get', msg) // send GET to storage adapters.
		    }
		    const ack = (msg, node) => {
		      let S = Date.now()
		      const ctx = msg._ || {}
		      ctx.DBG = msg.DBG
		      const DBG = ctx.DBG
		      let keys = Object.keys(node || '').sort()
		      const to = msg['#']
		      let id = text_rand(9)
		      const soul = ((node || '')._ || '')['#']
		      const root = msg.$._.root
		      const F = node === root.graph[soul]
		      const gk = Date.now()
		      if (DBG) DBG.gk = gk
		      else ctx.gk = gk
		      console.STAT?.(S, gk - S, 'got keys')
		      // PERF: Consider commenting this out to force disk-only reads for perf testing? // TODO: .keys( is slow
		      node &&
		        (() => {
		          const go = () => {
		            S = Date.now()
		            let i = 0
		            let k
		            let put = {}
		            while (i < 9) {
		              k = keys[i]
		              i++
		              state_ify(put, k, state_is(node, k), node[k], soul)
		            }
		            keys = keys.slice(i)
		            const tmpObj = {}
		            tmpObj[soul] = put
		            put = tmpObj
		            const faith = F ? () => {} : undefined
		            if (faith) {
		              faith.ram = faith.faith = true
		            } // HNPERF: We're testing performance improvement by skipping going through security again, but this should be audited.
		            const tmp = keys.length
		            const newS = Date.now()
		            console.STAT?.(S, -(S - newS), 'got copied some')
		            S = newS
		            if (DBG) DBG.ga = Date.now()
		            if (tmp) {
		              id = text_rand(9)
		            }
		            root.on('in', {
		              _: faith,
		              '@': to,
		              '#': id,
		              '%': tmp ? id : u,
		              $: root.$,
		              DBG: DBG,
		              put: put
		            })
		            console.STAT?.(S, Date.now() - S, 'got in')
		            if (!tmp) {
		              return
		            }
		            setTimeout.turn(go)
		          }
		          go()
		        })()
		      if (!node) {
		        root.on('in', { '@': msg['#'] })
		      } // TODO: I don't think I like this, the default lS adapter uses this but "not found" is a sensitive issue, so should probably be handled more carefully/individually.
		    }
		    Gun.on.get.ack = ack
		  })()

		  ;(() => {
		    Gun.chain.opt = function (opt) {
		      opt = opt || {}
		      const at = this._
		      let tmp = opt.peers || opt
		      if (!Object.plain(opt)) {
		        opt = {}
		      }
		      if (!Object.plain(at.opt)) {
		        at.opt = opt
		      }
		      if ('string' === typeof tmp) {
		        tmp = [tmp]
		      }
		      if (!Object.plain(at.opt.peers)) {
		        at.opt.peers = {}
		      }
		      if (Array.isArray(tmp)) {
		        opt.peers = {}
		        tmp.forEach((url) => {
		          const p = {}
		          p.id = p.url = url
		          opt.peers[url] = at.opt.peers[url] = at.opt.peers[url] || p
		        })
		      }
		      const each = (k) => {
		        const v = opt[k]
		        if (
		          (opt && Object.hasOwn(opt, k)) ||
		          'string' === typeof v ||
		          Object.empty(v)
		        ) {
		          opt[k] = v
		          return
		        }
		        if (v && v.constructor !== Object && !Array.isArray(v)) {
		          return
		        }
		        obj_each(v, each)
		      }
		      obj_each(opt, each)
		      at.opt.from = opt
		      Gun.on('opt', at)
		      at.opt.uuid =
		        at.opt.uuid ||
		        function uuid(l) {
		          return (
		            Gun.state().toString(36).replace('.', '') + String.random(l || 12)
		          )
		        }
		      return this
		    }
		  })()

		  const obj_each = (o, f) => {
		    Object.keys(o).forEach(f, o)
		  }
		  const text_rand = String.random
		  const turn = setTimeout.turn
		  const valid = Gun.valid
		  const state_is = Gun.state.is
		  const state_ify = Gun.state.ify
		  const u = undefined
		  const empty = {}

		  Gun.log = (...args) => {
		    if (!Gun.log.off) {
		      C.log.apply(C, args)
		    }
		    return args.join(' ')
		  }
		  Gun.log.once = (w, s, o) => {
		    o = Gun.log.once
		    o[w] = o[w] || 0
		    const count = o[w]++
		    if (count === 0) {
		      Gun.log(s)
		    }
		    return count
		  }

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

		  ;(Gun.window || {}).console = Gun.window?.console || { log: () => {} }
		  const C = console
		  C.only = (i, s, ...args) => {
		    if (C.only.i && i === C.only.i) {
		      C.only.i++
		      C.log(i, s, ...args)
		      return s
		    }
		  }

		  ;('Please do not remove welcome log unless you are paying for a monthly sponsorship, thanks!')
		  Gun.log.once(
		    'welcome',
		    'Hello wonderful person! :) Thanks for using GUN, please ask for help on http://chat.gun.eco if anything takes you longer than 5min to figure out!'
		  )
	})(USE, './root');

	;USE(function(module){
		const Gun = USE('./root')
		  /**
		   * Traverses back in the chain by a specified number of levels or path.
		   * @param {number|string|Array|function} n - The number of levels to go back, a dot-separated string path, an array path, or a function to test.
		   * @param {*} [opt] - Optional parameter passed to function if n is a function.
		   * @returns {*} The node at the specified back position or the result of the function.
		   */
		  Gun.chain.back = function (n, opt) {
		    const empty = {}
		    n = n || 1
		    if (n === -1 || n === Infinity) {
		      return this._.root.$
		    } else if (n === 1) {
		      return (this._.back || this._).$
		    }
		    const at = this._
		    if (typeof n === 'string') {
		      n = n.split('.')
		    }
		    if (Array.isArray(n)) {
		      const l = n.length
		      let tmp = at
		      for (let i = 0; i < l; i++) {
		        tmp = (tmp || empty)[n[i]]
		      }
		      if (undefined !== tmp) {
		        return opt ? this : tmp
		      } else {
		        const backTmp = at.back
		        if (backTmp) {
		          return backTmp.$.back(n, opt)
		        }
		      }
		      return
		    }
		    if (typeof n === 'function') {
		      let yes
		      let tmp = { back: at }
		      while (tmp.back) {
		        tmp = tmp.back
		        yes = n(tmp, opt)
		        if (undefined !== yes) break
		      }
		      return yes
		    }
		    if (typeof n === 'number') {
		      return (at.back || at).$.back(n - 1)
		    }
		    return this
		  }
	})(USE, './back');

	;USE(function(module){
		// WARNING: GUN is very simple, but the JavaScript chaining API around GUN
		  // is complicated and was extremely hard to build. If you port GUN to another
		  // language, consider implementing an easier API to build.
		  const Gun = USE('./root')

		  const empty = {}
		  const u = undefined
		  const text_rand = String.random
		  const valid = Gun.valid
		  const obj_has = (o, k) => o && Object.hasOwn(o, k)
		  const state = Gun.state
		  const state_is = state.is
		  const state_ify = state.ify

		  /**
		   * Creates a new chain instance.
		   * @param {Function} [sub] - Optional subclass constructor.
		   * @returns {Object} The new chain instance.
		   */
		  Gun.chain.chain = function (sub) {
		    const at = this._
		    const chain = new (sub || this).constructor(this)
		    const cat = chain._
		    const root = at.root
		    cat.root = root
		    cat.id = ++root.once
		    cat.back = this._
		    cat.on = Gun.on
		    cat.on('in', Gun.on.in, cat) // For 'in' if I add my own listeners to each then I MUST do it before in gets called. If I listen globally for all incoming data instead though, regardless of individual listeners, I can transform the data there and then as well.
		    cat.on('out', Gun.on.out, cat) // However for output, there isn't really the global option. I must listen by adding my own listener individually BEFORE this one is ever called.
		    return chain
		  }

		  /**
		   * Handles outgoing messages for the chain.
		   * @param {Object} msg - The message to output.
		   */
		  function output(msg) {
		    let get
		    const at = this.as
		    let back = at.back
		    const root = at.root
		    let tmp
		    if (!msg.$) {
		      msg.$ = at.$
		    }
		    this.to.next(msg)
		    if (at.err) {
		      at.put = u
		      at.on('in', { $: at.$, put: at.put })
		      return
		    }
		    if (msg.get) {
		      get = msg.get
		      /*if(u !== at.put){
					at.on('in', at);
					return;
				}*/
		      if (root.pass) {
		        root.pass[at.id] = at
		      } // will this make for buggy behavior elsewhere?
		      if (at.lex) {
		        tmp = msg.get = msg.get || {}
		        Object.keys(at.lex).forEach((k) => {
		          tmp[k] = at.lex[k]
		        })
		      }
		      if (get['#'] || at.soul) {
		        get['#'] = get['#'] || at.soul
		        //root.graph[get['#']] = root.graph[get['#']] || {_:{'#':get['#'],'>':{}}};
		        if (!msg['#']) {
		          msg['#'] = text_rand(9)
		        } // A3120 ?
		        back = root.$.get(get['#'])._
		        get = get['.']
		        if (!get) {
		          // soul
		          tmp = back.ask?.[''] // check if we have already asked for the full node
		          if (!back.ask) {
		            back.ask = {}
		          }
		          back.ask[''] = back // add a flag that we are now.
		          if (u !== back.put) {
		            // if we already have data,
		            back.on('in', back) // send what is cached down the chain
		            if (tmp) {
		              return
		            } // and don't ask for it again.
		          }
		          msg.$ = back.$
		        } else if (obj_has(back.put, get)) {
		          // TODO: support #LEX !
		          tmp = back.ask?.[get]
		          if (!back.ask) {
		            back.ask = {}
		          }
		          back.ask[get] = back.$.get(get)._
		          back.on('in', {
		            get: get,
		            put: {
		              ':': back.put[get],
		              '.': get,
		              '#': back.soul,
		              '>': state_is(root.graph[back.soul], get)
		            }
		          })
		          if (tmp) {
		            return
		          }
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
						let put = {}, meta = (back.put||{})._;
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
		        root.ask(ack, msg) // A3120 ?
		        return root.on('in', msg)
		      }
		      //if(root.now){ root.now[at.id] = root.now[at.id] || true; at.pass = {} }
		      if (get['.']) {
		        if (at.get) {
		          msg = { $: at.$, get: { '.': at.get } }
		          if (!back.ask) {
		            back.ask = {}
		          }
		          back.ask[at.get] = msg.$._ // TODO: PERFORMANCE? More elegant way?
		          return back.on('out', msg)
		        }
		        msg = { $: at.$, get: at.lex ? msg.get : {} }
		        return back.on('out', msg)
		      }
		      if (!at.ask) {
		        at.ask = {}
		      }
		      at.ask[''] = at //at.ack = at.ack || -1;
		      if (at.get) {
		        get['.'] = at.get
		        if (!back.ask) {
		          back.ask = {}
		        }
		        back.ask[at.get] = msg.$._ // TODO: PERFORMANCE? More elegant way?
		        return back.on('out', msg)
		      }
		    }
		    return back.on('out', msg)
		  }

		  /**
		   * Handles incoming messages for the chain.
		   * @param {Object} msg - The incoming message.
		   * @param {Object} [cat] - The chain context.
		   */
		  function input(msg, cat) {
		    cat = cat || this.as // TODO: V8 may not be able to optimize functions with different parameter calls, so try to do benchmark to see if there is any actual difference.
		    const root = cat.root
		    if (!msg.$) {
		      msg.$ = cat.$
		    }
		    let gun = msg.$
		    const at = (gun || '')._ || empty
		    let tmp = msg.put || ''
		    let soul = tmp['#']
		    let key = tmp['.']
		    const change = u !== tmp['='] ? tmp['='] : tmp[':']
		    const state = tmp['>'] || -Infinity
		    let sat // eve = event, at = data at, cat = chain at, sat = sub at (children chains).
		    if (
		      u !== msg.put &&
		      (u === tmp['#'] ||
		        u === tmp['.'] ||
		        (u === tmp[':'] && u === tmp['=']) ||
		        u === tmp['>'])
		    ) {
		      // convert from old format
		      if (!valid(tmp)) {
		        soul = ((tmp || '')._ || '')['#']
		        if (!soul) {
		          console.log('chain not yet supported for', tmp, '...', msg, cat)
		          return
		        }
		        gun = cat.root.$.get(soul)
		        return setTimeout.each(Object.keys(tmp).sort(), (k) => {
		          // TODO: .keys( is slow // BUG? ?Some re-in logic may depend on this being sync?
		          const state = state_is(tmp, k)
		          if ('_' === k || u === state) {
		            return
		          }
		          cat.on('in', {
		            $: gun,
		            put: { '.': k, '#': soul, '=': tmp[k], '>': state },
		            VIA: msg
		          })
		        })
		      }
		      soul = at.back.soul
		      key = at.has || at.get
		      cat.on('in', {
		        $: at.back.$,
		        put: {
		          '.': key,
		          '#': soul,
		          '=': tmp,
		          '>': state_is(at.back.put, key)
		        },
		        via: msg
		      }) // TODO: This could be buggy! It assumes/approximates data, other stuff could have corrupted it.
		      return
		    }
		    if ((msg.seen || '')[cat.id]) {
		      return
		    }
		    if (!msg.seen) {
		      msg.seen = {}
		    }
		    msg.seen[cat.id] = cat // help stop some infinite loops

		    if (cat !== at) {
		      // don't worry about this when first understanding the code, it handles changing contexts on a message. A soul chain will never have a different context.
		      tmp = {}
		      Object.keys(msg).forEach((k) => {
		        tmp[k] = msg[k]
		      }) // make copy of message
		      tmp.get = cat.get || tmp.get
		      if (!cat.soul && !cat.has) {
		        // if we do not recognize the chain type
		        tmp.$$$ = tmp.$$$ || cat.$ // make a reference to wherever it came from.
		      } else if (at.soul) {
		        // a has (property) chain will have a different context sometimes if it is linked (to a soul chain). Anything that is not a soul or has chain, will always have different contexts.
		        tmp.$ = cat.$
		        tmp.$$ = tmp.$$ || at.$
		      }
		      msg = tmp // use the message with the new context instead;
		    }
		    unlink(msg, cat)

		    if (
		      (cat.soul /* && (cat.ask||'')['']*/ || msg.$$) &&
		      state >= state_is(root.graph[soul], key)
		    ) {
		      // The root has an in-memory cache of the graph, but if our peer has asked for the data then we want a per deduplicated chain copy of the data that might have local edits on it.
		      tmp = root.$.get(soul)._
		      tmp.put = state_ify(tmp.put, key, state, change, soul)
		    }
		    if (
		      !at.soul /*&& (at.ask||'')['']*/ &&
		      state >= state_is(root.graph[soul], key)
		    ) {
		      sat = (root.$.get(soul)._.next || '')[key]
		      if (sat) {
		        // Same as above here, but for other types of chains. // TODO: Improve perf by preventing echoes re-caching.
		        sat.put = change // update cache
		        const tmp = valid(change)
		        if (typeof tmp === 'string') {
		          sat.put = root.$.get(tmp)._.put || change // share same cache as what we're linked to.
		        }
		      }
		    }

		    this.to?.next(msg) // 1st API job is to call all chain listeners.
		    // TODO: Make input more reusable by only doing these (some?) calls if we are a chain we recognize? This means each input listener would be responsible for when listeners need to be called, which makes sense, as they might want to filter.
		    if (cat.any) {
		      setTimeout.each(
		        Object.keys(cat.any),
		        (any) => {
		          const anyValue = cat.any[any]
		          anyValue?.(msg)
		        },
		        0,
		        99
		      ) // 1st API job is to call all chain listeners. // TODO: .keys( is slow // BUG: Some re-in logic may depend on this being sync.
		    }
		    if (cat.echo) {
		      setTimeout.each(
		        Object.keys(cat.echo),
		        (lat) => {
		          const latValue = cat.echo[lat]
		          latValue?.on('in', msg)
		        },
		        0,
		        99
		      ) // & linked at chains // TODO: .keys( is slow // BUG: Some re-in logic may depend on this being sync.
		    }

		    if (((msg.$$ || '')._ || at).soul) {
		      // comments are linear, but this line of code is non-linear, so if I were to comment what it does, you'd have to read 42 other comments first... but you can't read any of those comments until you first read this comment. What!? // shouldn't this match link's check?
		      // is there cases where it is a $$ that we do NOT want to do the following?
		      sat = cat.next?.[key]
		      if (sat) {
		        // TODO: possible trick? Maybe have `ion map` code set a sat? // TODO: Maybe we should do `cat.ask` instead? I guess does not matter.
		        tmp = {}
		        Object.assign(tmp, msg)
		        tmp.get = key
		        tmp.$ = msg.$$?.get(tmp.get) || msg.$?.get(tmp.get)
		        delete tmp.$$
		        delete tmp.$$$
		        sat.on('in', tmp)
		      }
		    }

		    link(msg, cat)
		  }

		  /**
		   * Links chains for data propagation.
		   * @param {Object} msg - The message.
		   * @param {Object} cat - The chain context.
		   */
		  function link(msg, cat) {
		    cat = cat || this.as || msg.$._
		    let sat
		    if (msg.$$ && this !== Gun.on) {
		      return
		    } // $$ means we came from a link, so we are at the wrong level, thus ignore it unless overruled manually by being called directly.
		    if (!msg.put || cat.soul) {
		      return
		    } // But you cannot overrule being linked to nothing, or trying to link a soul chain - that must never happen.
		    const put = msg.put || ''
		    let link = put['='] || put[':']
		    let tmp
		    const root = cat.root
		    const tat = root.$.get(put['#']).get(put['.'])._
		    link = valid(link)
		    if (typeof link !== 'string') {
		      if (this === Gun.on) {
		        tat.echo = tat.echo || {}
		        tat.echo[cat.id] = cat
		      } // allow some chain to explicitly force linking to simple data.
		      return // by default do not link to data that is not a link.
		    }
		    tat.echo = tat.echo || {}
		    if (
		      tat.echo?.[cat.id] && // we've already linked ourselves so we do not need to do it again. Except... (annoying implementation details)
		      !root.pass?.[cat.id]
		    ) {
		      return
		    } // if a new event listener was added, we need to make a pass through for it. The pass will be on the chain, not always the chain passed down.
		    tmp = root.pass
		    if (tmp?.[link + cat.id]) {
		      return
		    }
		    if (tmp) {
		      tmp[link + cat.id] = 1
		    } // But the above edge case may "pass through" on a circular graph causing infinite passes, so we hackily add a temporary check for that.

		    tat.echo = tat.echo || {}
		    tat.echo[cat.id] = cat // set ourself up for the echo! // TODO: BUG? Echo to self no longer causes problems? Confirm.

		    if (cat.has) {
		      cat.link = link
		    }
		    tat.link = link
		    sat = root.$.get(link)?._ // grab what we're linking to.
		    if (!sat?.echo) {
		      if (sat) sat.echo = {}
		    }
		    if (sat?.echo) sat.echo[tat.id] = tat // link it.
		    tmp = cat.ask || '' // ask the chain for what needs to be loaded next!
		    if (cat.ask?.[''] || cat.lex) {
		      // we might need to load the whole thing // TODO: cat.lex probably has edge case bugs to it, need more test coverage.
		      sat?.on('out', { get: { '#': link } })
		    }
		    setTimeout.each(
		      Object.keys(tmp),
		      (get) => {
		        // if sub chains are asking for data. // TODO: .keys( is slow // BUG? ?Some re-in logic may depend on this being sync?
		        const sat = cat?.ask?.[get]
		        if (!get || !sat) {
		          return
		        }
		        sat.on('out', { get: { '.': get, '#': link } }) // go get it.
		      },
		      0,
		      99
		    )
		  }

		  /**
		   * Unlinks chains when data is removed.
		   * @param {Object} msg - The message.
		   * @param {Object} cat - The chain context.
		   */
		  function unlink(msg, cat) {
		    // ugh, so much code for seemingly edge case behavior.
		    const put = msg.put || ''
		    const change = u !== put['='] ? put['='] : put[':']
		    const root = cat.root
		    let link
		    let tmp
		    if (u === change) {
		      // 1st edge case: If we have a brand new database, no data will be found.
		      // TODO: BUG! because emptying cache could be async from below, make sure we are not emptying a newer cache. So maybe pass an Async ID to check against?
		      // TODO: BUG! What if this is a map? // Warning! Clearing things out needs to be robust against sync/async ops, or else you'll see `map val get put` test catastrophically fail because map attempts to link when parent graph is streamed before child value gets set. Need to differentiate between lack acks and force clearing.
		      if (cat.soul && u !== cat.put) {
		        return
		      } // data may not be found on a soul, but if a soul already has data, then nothing can clear the soul as a whole.
		      //if(!cat.has){ return }
		      tmp = msg.$$?._ || msg.$?._ || ''
		      if (msg?.['@'] && (u !== tmp.put || u !== cat.put)) {
		        return
		      } // a "not found" from other peers should not clear out data if we have already found it.
		      //if(cat.has && u === cat.put && !(root.pass||'')[cat.id]){ return } // if we are already unlinked, do not call again, unless edge case. // TODO: BUG! This line should be deleted for "unlink deeply nested".
		      link = cat.link || msg.linked
		      if (link) {
		        delete root.$.get(link)?._?.echo?.[cat.id]
		      }
		      if (cat.has) {
		        // TODO: Empty out links, maps, echos, acks/asks, etc.?
		        cat.link = null
		      }
		      cat.put = u // empty out the cache if, for example, alice's car's color no longer exists (relative to alice) if alice no longer has a car.
		      // TODO: BUG! For maps, proxy this so the individual sub is triggered, not all subs.
		      setTimeout.each(
		        Object.keys(cat.next || ''),
		        (get) => {
		          // empty out all sub chains. // TODO: .keys( is slow // BUG? ?Some re-in logic may depend on this being sync? // TODO: BUG? This will trigger deeper put first, does put logic depend on nested order? // TODO: BUG! For map, this needs to be the isolated child, not all of them.
		          const sat = cat.next?.[get]
		          if (!sat) {
		            return
		          }
		          //if(cat.has && u === sat.put && !(root.pass||'')[sat.id]){ return } // if we are already unlinked, do not call again, unless edge case. // TODO: BUG! This line should be deleted for "unlink deeply nested".
		          if (link) {
		            delete root.$.get(link)?.get(get)?._?.echo?.[sat.id]
		          }
		          sat.on('in', { $: sat.$, get: get, put: u }) // TODO: BUG? Add recursive seen check?
		        },
		        0,
		        99
		      )
		      return
		    }
		    if (cat.soul) {
		      return
		    } // a soul cannot unlink itself.
		    if (msg.$$) {
		      return
		    } // a linked chain does not do the unlinking, the sub chain does. // TODO: BUG? Will this cancel maps?
		    link = valid(change) // need to unlink anytime we are not the same link, though only do this once per unlink (and not on init).
		    tmp = msg.$?._ || ''
		    if (link === tmp?.link || (cat.has && !tmp?.link)) {
		      if (root.pass?.[cat.id] && 'string' !== typeof link) {
		      } else {
		        return
		      }
		    }
		    delete tmp?.echo?.[cat.id]
		    const linkedValue = msg.linked || tmp.link
		    msg.linked = linkedValue
		    unlink(
		      {
		        $: msg.$,
		        get: cat.get,
		        linked: linkedValue,
		        put: u
		      },
		      cat
		    ) // unlink our sub chains.
		  }

		  /**
		   * Handles acknowledgments for messages.
		   * @param {Object} msg - The message.
		   */
		  function ack(msg) {
		    //if(!msg['%'] && (this||'').off){ this.off() } // do NOT memory leak, turn off listeners! Now handled by .ask itself
		    // manhattan:
		    const as = this.as
		    const at = as.$._
		    const get = as.get || ''
		    const tmp = (msg.put || '')[get['#']] || ''
		    if (
		      !msg.put ||
		      (typeof get?.['.'] === 'string' && u === tmp?.[get?.['.']])
		    ) {
		      if (u !== at.put) {
		        return
		      }
		      if (!at.soul && !at.has) {
		        return
		      } // TODO: BUG? For now, only core-chains will handle not-founds, because bugs creep in if non-core chains are used as $ but we can revisit this later for more powerful extensions.
		      at.ack = (at.ack || 0) + 1
		      at.put = u
		      at.on('in', {
		        '@': msg['@'],
		        $: at.$,
		        get: at.get,
		        put: at.put
		      })
		      /*(tmp = at.Q) && setTimeout.each(Object.keys(tmp), function(id){ // TODO: Temporary testing, not integrated or being used, probably delete.
					Object.keys(msg).forEach(function(k){ tmp[k] = msg[k] }, tmp = {}); tmp['@'] = id; // copy message
					root.on('in', tmp);
				}); delete at.Q;*/
		      return
		    }
		    ;(msg._ || {}).miss = 1
		    Gun.on.put(msg)
		    return // eom
		  }

		  Gun.on.out = output
		  Gun.on.in = input
		  Gun.on.link = link
		  Gun.on.unlink = unlink
	})(USE, './chain');

	;USE(function(module){
		const Gun = USE('./root')

		  const emptyObject = {}
		  const validate = Gun.valid
		  const undefinedValue = undefined

		  /**
		   * Handles retrieval for string keys.
		   * @param {string} key - The string key to retrieve.
		   * @param {function} [cb] - Optional callback function.
		   * @param {object} context - The gun context.
		   * @returns {object} The gun chain for the key.
		   */
		  function handleStringKey(key, cb, context) {
		    if (key.length === 0) {
		      const nodeChain = context.chain()
		      nodeChain._.err = { err: Gun.log('0 length key!', key) }
		      if (cb) {
		        cb.call(nodeChain, nodeChain._.err)
		      }
		      return nodeChain
		    }
		    const currentContext = context._
		    const nextChains = currentContext.next || emptyObject
		    let nodeChain = nextChains[key]
		    if (!nodeChain) {
		      nodeChain = key && createCachedChain(key, context)
		    }
		    return nodeChain?.$
		  }
		  function processMessageData(msg, getOptions, rootContext) {
		    const at = msg.$._
		    const sat = (msg.$$ || '')._
		    let nodeData = (sat || at).put
		    if ((!at.has && !at.soul) || undefinedValue === nodeData) {
		      // handles non-core
		      const passData = msg.put
		      nodeData =
		        undefinedValue === (passData || '')['=']
		          ? undefinedValue === (passData || '')[':']
		            ? passData
		            : passData[':']
		          : passData['=']
		    }
		    let passData = Gun.valid(nodeData)
		    const isLink = 'string' === typeof passData
		    if (isLink) {
		      passData = rootContext.$.get(passData)._.put
		      nodeData =
		        undefinedValue === passData
		          ? getOptions.not
		            ? undefinedValue
		            : nodeData
		          : passData
		    }
		    const shouldSkip = getOptions.not && undefinedValue === nodeData
		    return { at, nodeData, sat, shouldSkip }
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
		    let listenerId = String.random(7)
		    getOptions.at = currentContext
		    getOptions.ok = key
		    let waitList = {} // can we assign this to the at instead, like in once?
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
		      if (undefinedValue === getOptions.stun) {
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
		              //if(isOddNode && undefinedValue === nodeData){ return }
		              //if(undefinedValue === msg.put){ return } // "not found" acks will be found if there is stun, so ignore these.
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
		        if (/*isOddNode &&*/ undefinedValue === nodeData) {
		          f = 0
		        } // if data not found, keep waiting/trying.
		        /*if(f && undefinedValue === nodeData){
		    currentContext.on('out', getOptions.out);
		    return;
		  }*/
		        const hatchData = rootContext.hatch
		        if (
		          hatchData &&
		          !hatchData.end &&
		          undefinedValue === getOptions.hatch &&
		          !f
		        ) {
		          // quick hack! // What's going on here? Because data is streamed, we get things one by one, but a lot of developers would rather get a callback after each batch instead, so this does that by creating a wait list per chain id that is then called at the end of the batch by the hatch code in the root put listener.
		          if (waitList[at.$._.id]) {
		            return
		          }
		          waitList[at.$._.id] = 1
		          hatchData.push(() => {
		            listenerHandler(msg, eve, 1)
		          })
		          return
		        }
		        waitList = {} // end quick hack.
		      }
		      // call:
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
		      const messageCopy = {}
		      Object.keys(msg).forEach((k) => {
		        messageCopy[k] = msg[k]
		      })
		      msg = messageCopy
		      msg.put = nodeData // 2019 COMPATIBILITY! TODO: GET RID OF THIS!
		      getOptions.ok.call(getOptions.as, msg, eve || listenerHandler) // is this the right
		    }
		    listenerHandler.at = currentContext
		    listenerId = String.random(7)
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
		        this.seen = {}
		      }
		      const seenNodes = this.seen
		      const tempNode = seenNodes[at]
		      if (tempNode) {
		        return true
		      }
		      seenNodes[at] = true
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
		   * Creates a cached chain for the given key and back context.
		   * @param {string} key - The key for the chain.
		   * @param {object} back - The back context.
		   * @returns {object} The new chain context.
		   */
		  function createCachedChain(key, back) {
		    const backContext = back._
		    let nextChains = backContext.next
		    if (!nextChains) {
		      nextChains = backContext.next = {}
		    }
		    const newChain = back.chain()
		    const newChainContext = newChain._
		    newChainContext.get = key
		    nextChains[key] = newChainContext
		    if (back === backContext.root.$) {
		      newChainContext.soul = key
		    } else if (backContext.soul || backContext.has) {
		      newChainContext.has = key
		    }
		    return newChainContext
		  }
		  /**
		   * Extracts the soul from the gun context.
		   * @param {object} gun - The gun instance.
		   * @param {function} cb - The callback function.
		   * @param {*} _opt - Options (unused).
		   * @param {*} as - Additional context.
		   * @returns {object} The gun instance.
		   */
		  function extractSoul(gun, cb, _opt, as) {
		    const gunContext = gun._
		    const soulValue = gunContext.soul || gunContext.link
		    if (soulValue) {
		      return cb(soulValue, as, gunContext)
		    }
		    if (gunContext.jam) {
		      return gunContext.jam.push([cb, as])
		    }
		    gunContext.jam = [[cb, as]]
		    let ackCount = 0
		    gun.get(
		      (msg, eve) => {
		        const peerCount = Object.keys(gunContext.root.opt.peers).length
		        if (
		          undefinedValue === msg.put &&
		          !gunContext.root.opt.super &&
		          peerCount &&
		          ++ackCount <= peerCount
		        ) {
		          // Wait for all peers to respond before processing, to get the soul.
		          return
		        }
		        eve.rid(msg)
		        const msgContext = msg.$ ? msg.$._ : {}
		        const jamQueue = gunContext.jam
		        delete gunContext.jam
		        for (let index = 0; index < jamQueue.length; index++) {
		          const callbackArgs = jamQueue[index]
		          if (!callbackArgs) continue
		          const [cb, args] = callbackArgs
		          const soulId =
		            msgContext.link ||
		            msgContext.soul ||
		            Gun.valid(msg.put) ||
		            msg.put?._?.['#']
		          cb?.(soulId, args, msg, eve)
		        }
		      },
		      { out: { get: { '.': true } } }
		    )
		    return gun
		  }
	})(USE, './get');

	;USE(function(module){
		var Gun = USE('./root')
		  Gun.chain.put = function (data, cb, as) {
		    // I rewrote it :)
		    var at = this._,
		      root = at.root
		    as = as || {}
		    as.root = at.root
		    as.run || (as.run = root.once)
		    stun(as, at.id) // set a flag for reads to check if this chain is writing.
		    as.ack = as.ack || cb
		    as.via = as.via || this
		    as.data = as.data || data
		    as.soul || (as.soul = at.soul || ('string' == typeof cb && cb))
		    var s = (as.state = as.state || Gun.state())
		    if ('function' == typeof data) {
		      data((d) => {
		        as.data = d
		        this.put(u, u, as)
		      })
		      return this
		    }
		    if (!as.soul) {
		      return get(as), this
		    }
		    as.$ = root.$.get(as.soul) // TODO: This may not allow user chaining and similar?
		    as.todo = [{ it: as.data, ref: as.$ }]
		    as.turn = as.turn || turn
		    as.ran = as.ran || ran
		    //var path = []; as.via.back(at => { at.get && path.push(at.get.slice(0,9)) }); path = path.reverse().join('.');
		    // TODO: Perf! We only need to stun chains that are being modified, not necessarily written to.
		    ;(function walk() {
		      var to = as.todo,
		        at = to.pop(),
		        d = at.it,
		        cid = at.ref && at.ref._.id,
		        v,
		        k,
		        cat,
		        tmp,
		        g
		      stun(as, at.ref)
		      if ((tmp = at.todo)) {
		        k = tmp.pop()
		        d = d[k]
		        if (tmp.length) {
		          to.push(at)
		        }
		      }
		      k && (to.path || (to.path = [])).push(k)
		      if (!(v = valid(d)) && !(g = Gun.is(d))) {
		        if (!Object.plain(d)) {
		          ran.err(
		            as,
		            'Invalid data: ' +
		              check(d) +
		              ' at ' +
		              (as.via.back(
		                (at) => {
		                  at.get && tmp.push(at.get)
		                },
		                (tmp = [])
		              ) || tmp.join('.')) +
		              '.' +
		              (to.path || []).join('.')
		          )
		          return
		        }
		        var seen = as.seen || (as.seen = []),
		          i = seen.length
		        while (i--) {
		          if (d === (tmp = seen[i]).it) {
		            v = d = tmp.link
		            break
		          }
		        }
		      }
		      if (k && v) {
		        at.node = state_ify(at.node, k, s, d)
		      } // handle soul later.
		      else {
		        if (!as.seen) {
		          ran.err(as, 'Data at root of graph must be a node (an object).')
		          return
		        }
		        as.seen.push(
		          (cat = {
		            it: d,
		            link: {},
		            path: (to.path || []).slice(),
		            todo: g ? [] : Object.keys(d).sort().reverse(),
		            up: at
		          })
		        ) // Any perf reasons to CPU schedule this .keys( ?
		        at.node = state_ify(at.node, k, s, cat.link)
		        !g && cat.todo.length && to.push(cat)
		        // ---------------
		        var id = as.seen.length
		        ;(as.wait || (as.wait = {}))[id] = ''
		        tmp = (cat.ref = g ? d : k ? at.ref.get(k) : at.ref)._
		        ;(tmp = (d && (d._ || '')['#']) || tmp.soul || tmp.link)
		          ? resolve({ soul: tmp })
		          : cat.ref.get(resolve, {
		              out: { get: { '.': ' ' } },
		              run: as.run,
		              /*hatch: 0,*/ v2020: 1
		            }) // TODO: BUG! This should be resolve ONLY soul to prevent full data from being loaded. // Fixed now?
		        //setTimeout(function(){ if(F){ return } console.log("I HAVE NOT BEEN CALLED!", path, id, cat.ref._.id, k) }, 9000); var F; // MAKE SURE TO ADD F = 1 below!
		        function resolve(msg, eve) {
		          var end = cat.link['#']
		          if (eve) {
		            eve.off()
		            eve.rid(msg)
		          } // TODO: Too early! Check all peers ack not found.
		          // TODO: BUG maybe? Make sure this does not pick up a link change wipe, that it uses the changign link instead.
		          var soul =
		            end ||
		            msg.soul ||
		            (tmp = (msg.$$ || msg.$)._ || '').soul ||
		            tmp.link ||
		            ((tmp = tmp.put || '')._ || '')['#'] ||
		            tmp['#'] ||
		            ((tmp = msg.put || '') && msg.$$
		              ? tmp['#']
		              : (tmp['='] || tmp[':'] || '')['#'])
		          !end && stun(as, msg.$)
		          if (!soul && !at.link['#']) {
		            // check soul link above us
		            ;(at.wait || (at.wait = [])).push(() => {
		              resolve(msg, eve)
		            }) // wait
		            return
		          }
		          if (!soul) {
		            soul = []
		            ;(msg.$$ || msg.$).back((at) => {
		              if ((tmp = at.soul || at.link)) {
		                return soul.push(tmp)
		              }
		              soul.push(at.get)
		            })
		            soul = soul.reverse().join('/')
		          }
		          cat.link['#'] = soul
		          !g &&
		            (((as.graph || (as.graph = {}))[soul] =
		              cat.node || (cat.node = { _: {} }))._['#'] = soul)
		          delete as.wait[id]
		          cat.wait &&
		            setTimeout.each(cat.wait, (cb) => {
		              cb && cb()
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
		    id = (id._ || '').id || id
		    var run = as.root.stun || (as.root.stun = { on: Gun.on }),
		      test = {},
		      tmp
		    as.stun || (as.stun = run.on('stun', () => {}))
		    if ((tmp = run.on('' + id))) {
		      tmp.the.last.next(test)
		    }
		    if (test.run >= as.run) {
		      return
		    }
		    run.on('' + id, function (test) {
		      if (as.stun.end) {
		        this.off()
		        this.to.next(test)
		        return
		      }
		      test.run = test.run || as.run
		      test.stun = test.stun || as.stun
		      return
		      if (this.to.to) {
		        this.the.last.next(test)
		        return
		      }
		      test.stun = as.stun
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
		    //(as.retry = function(){ as.acks = 0;
		    var cat = as.$.back(-1)._,
		      root = cat.root,
		      ask = cat.ask(function (ack) {
		        root.on('ack', ack)
		        if (ack.err && !ack.lack) {
		          Gun.log(ack)
		        }
		        if (++acks > (as.acks || 0)) {
		          this.off()
		        } // Adjustable ACKs! Only 1 by default.
		        if (!as.ack) {
		          return
		        }
		        as.ack(ack, this)
		      }, as.opt),
		      acks = 0,
		      stun = as.stun,
		      tmp
		    ;(tmp = () => {
		      // this is not official yet, but quick solution to hack in for now.
		      if (!stun) {
		        return
		      }
		      ran.end(stun, root)
		      setTimeout.each(Object.keys((stun = stun.add || '')), (cb) => {
		        if ((cb = stun[cb])) {
		          cb()
		        }
		      }) // resume the stunned reads // Any perf reasons to CPU schedule this .keys( ?
		    }).hatch = tmp // this is not official yet ^
		    //console.log(1, "PUT", as.run, as.graph);
		    if (as.ack && !as.ok) {
		      as.ok = as.acks || 9
		    } // TODO: In future! Remove this! This is just old API support.
		    as.via._.on('out', {
		      _: tmp,
		      '#': ask,
		      ok: as.ok && { '@': as.ok + 1 },
		      opt: as.opt,
		      put: (as.out = as.graph)
		    })
		    //})();
		  }
		  ran.end = (stun, root) => {
		    stun.end = noop // like with the earlier id, cheaper to make this flag a function so below callbacks do not have to do an extra type check.
		    if (stun.the.to === stun && stun === stun.the.last) {
		      delete root.stun
		    }
		    stun.off()
		  }
		  ran.err = (as, err) => {
		    ;(as.ack || noop).call(as, (as.out = { err: (as.err = Gun.log(err)) }))
		    as.ran(as)
		  }

		  function get(as) {
		    var at = as.via._,
		      tmp
		    as.via = as.via.back((at) => {
		      if (at.soul || !at.get) {
		        return at.$
		      }
		      tmp = as.data
		      ;(as.data = {})[at.get] = tmp
		    })
		    if (!as.via || !as.via._.soul) {
		      as.via = at.root.$.get(
		        ((as.data || '')._ || '')['#'] || at.$.back('opt.uuid')()
		      )
		    }
		    as.via.put(as.data, as.ack, as)

		    return
		    if (at.get && at.back.soul) {
		      tmp = as.data
		      as.via = at.back.$
		      ;(as.data = {})[at.get] = tmp
		      as.via.put(as.data, as.ack, as)
		      return
		    }
		  }
		  function check(d, tmp) {
		    return (d && (tmp = d.constructor) && tmp.name) || typeof d
		  }

		  var u,
		    empty = {},
		    noop = () => {},
		    turn = setTimeout.turn,
		    valid = Gun.valid,
		    state_ify = Gun.state.ify
		  var iife = (fn, as) => {
		    fn.call(as || empty)
		  }
	})(USE, './put');

	;USE(function(module){
		const Gun = USE('./root')
		USE('./chain')
		USE('./back')
		USE('./put')
		USE('./get')
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
		  function createOnceChain(gun, opt) {
		    // Log experimental feature warning
		    Gun.log.once(
		      'valonce',
		      'Chainable val is experimental, its behavior and API may change moving forward. ' +
		        'Please play with it and report bugs and ideas on how to improve it.'
		    )

		    const chain = gun.chain()

		    // Set up chain cleanup mechanism
		    chain._.nix = gun.once(function handleChainData(data, key) {
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
		    const tmp = lex['#'] || ''
		    if (Array.isArray(tmp)) return tmp[0] || ''
		    return tmp['='] || tmp
		  }
		  /** @function getLexPattern @param {object|string} lex - Input lex. @returns {string} Lex pattern. */
		  const getLexPattern = (lex) => {
		    if (!lex) return ''
		    return lex['.'] || lex['#'] || lex
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
		    if (!node._) throw new Error('Invalid node: missing _ property')
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
		  /** @function handleMapCallbackResult @param {object} chain - Chain. @param {*} data - Data. @param {string} key - Key. @param {object} msg - Message. @param {object} eve - Event. @param {*} next - Next value. */
		  const handleMapCallbackResult = (chain, data, key, msg, eve, next) => {
		    if (u === next) return
		    if (data === next) return chain._.on('in', msg)
		    if (Gun.is(next)) return chain._.on('in', next._)
		    const tmp = {}
		    Object.assign(tmp, msg.put)
		    tmp['='] = next
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
		      lex = cb['.'] ? cb : { '.': cb }
		      cb = u
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
		    return !lex || String.match(msg.get || (put || '')['.'], getLexPattern(lex))
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
		  const _event = { off: noop, stun: noop },
		    u = undefined
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
		    if ((soul = ((item || '')._ || '')['#'])) {
		      ;(item = {})['#'] = soul
		    } // check if node, make link.
		    if ('string' == typeof (tmp = Gun.valid(item))) {
		      return this.get((soul = tmp)).put(item, cb, opt)
		    } // check if link
		    if (!Gun.is(item)) {
		      if (Object.plain(item)) {
		        item = root.get((soul = this.back('opt.uuid')())).put(item)
		      }
		      return this.get(soul || root.back('opt.uuid')(7)).put(item, cb, opt)
		    }
		    this.put((go) => {
		      item.get((soul, o, msg) => {
		        // TODO: BUG! We no longer have this option? & go error not handled?
		        if (!soul) {
		          return cb.call(this, {
		            err: Gun.log('Only a node can be linked! Not "' + msg.put + '"!')
		          })
		        }
		        ;(tmp = {})[soul] = { '#': soul }
		        go(tmp)
		      }, true)
		    })
		    return item
		  }
	})(USE, './set');

	;USE(function(module){
		USE('./shim')

		  /**
		   * No-op function.
		   */
		  const noop = () => {}

		  /**
		   * Retry helper for async operations.
		   * @param {function} fn - Function to retry.
		   * @param {number} maxRetries - Maximum retries.
		   * @returns {function} Retried function.
		   */
		  const retry =
		    (fn, maxRetries = 3) =>
		    (...args) => {
		      const cb = args[args.length - 2] // assuming cb is second last
		      let attempts = 0
		      const attempt = () => {
		        fn(...args.slice(0, -1), (err, ...rest) => {
		          if (err && attempts < maxRetries) {
		            attempts++
		            setTimeout(attempt, 10)
		            return
		          }
		          cb(err, ...rest)
		        })
		      }
		      attempt()
		    }

		  /**
		   * Asynchronous JSON parse with retries and validation.
		   * @param {string} t - JSON string to parse.
		   * @param {function} cb - Callback (err, result, time).
		   * @param {function} r - Reviver function.
		   */
		  const parse =
		    JSON.parseAsync ||
		    retry((t, cb, r) => {
		      if (typeof t !== 'string')
		        return cb(new Error('Invalid input: not a string'))
		      t = t.trim()
		      const d = Date.now()
		      try {
		        cb(null, JSON.parse(t, r), json.sucks(Date.now() - d))
		      } catch (e) {
		        cb(e)
		      }
		    })

		  /**
		   * Asynchronous JSON stringify with retries.
		   * @param {*} v - Value to stringify.
		   * @param {function} cb - Callback (err, result, time).
		   * @param {function} r - Replacer function.
		   * @param {number|string} s - Space.
		   */
		  const json =
		    JSON.stringifyAsync ||
		    retry((v, cb, r, s) => {
		      const d = Date.now()
		      try {
		        cb(null, JSON.stringify(v, r, s), json.sucks(Date.now() - d))
		      } catch (e) {
		        cb(e)
		      }
		    })

		  /**
		   * Warns if JSON operation takes too long.
		   * @param {number} d - Duration in ms.
		   */
		  json.sucks = (d) => {
		    if (d > 99) {
		      console.log(
		        'Warning: JSON blocking CPU detected. Add `gun/lib/yson.js` to fix.'
		      )
		      json.sucks = noop
		    }
		  }

		  function Mesh(root) {
		    const mesh = () => {}
		    const opt = root.opt || {}
		    opt.log = opt.log || console.log
		    opt.gap = opt.gap || opt.wait || 0
		    opt.max = opt.max || (opt.memory ? opt.memory * 999 * 999 : 300000000) * 0.3
		    opt.pack = opt.pack || opt.max * 0.01 * 0.01
		    opt.puff = opt.puff || 9

		    const puff = setTimeout.turn || setTimeout

		    const dup = root.dup
		    const dup_check = dup.check
		    const dup_track = dup.track

		    const ST = Date.now()
		    const LT = ST

		    const hear = (mesh.hear = function (raw, peer) {
		      if (!raw) return
		      if (opt.max <= raw.length) {
		        return mesh.say({ dam: '!', err: 'Message too big!' }, peer)
		      }
		      if (mesh === this) {
		        hear.d += raw.length || 0
		        ++hear.c
		      }
		      const S = (peer.SH = Date.now())
		      const tmp = raw[0]
		      let msg

		      if ('[' === tmp) {
		        parse(raw, (err, msg) => {
		          if (err || !msg)
		            return mesh.say({ dam: '!', err: 'DAM JSON parse error.' }, peer)
		          console.STAT?.(Date.now(), msg.length, '# on hear batch')
		          const P = opt.puff
		          ;(function go() {
		            const S = Date.now()
		            let i = 0,
		              m
		            while (i < P && (m = msg[i++])) {
		              mesh.hear(m, peer)
		            }
		            msg = msg.slice(i)
		            console.STAT?.(S, Date.now() - S, 'hear loop')
		            flush(peer)
		            if (!msg.length) return
		            puff(go, 0)
		          })()
		        })
		        raw = ''
		        return
		      }

		      if ('{' === tmp || ((raw['#'] || Object.plain(raw)) && (msg = raw))) {
		        if (msg) return hear.one(msg, peer, S)
		        parse(raw, (err, msg) => {
		          if (err || !msg)
		            return mesh.say({ dam: '!', err: 'DAM JSON parse error.' }, peer)
		          hear.one(msg, peer, S)
		        })
		        return
		      }
		    })

		    hear.one = (msg, peer, S) => {
		      let id, hash, tmp, ash, DBG
		      if (msg.DBG) msg.DBG = DBG = { DBG: msg.DBG }
		      DBG && (DBG.h = S)
		      DBG && (DBG.hp = Date.now())
		      if (!(id = msg['#'])) id = msg['#'] = String.random(9)
		      if ((tmp = dup_check(id))) return
		      if (!(hash = msg['##']) && false && u !== msg.put) {
		      }
		      if (
		        hash &&
		        (tmp = msg['@'] || (msg.get && id)) &&
		        dup.check((ash = tmp + hash))
		      )
		        return
		      ;(msg._ = () => {}).via = mesh.leap = peer
		      if ((tmp = msg['><']) && typeof tmp === 'string') {
		        tmp
		          .slice(0, 99)
		          .split(',')
		          .forEach(
		            function (k) {
		              this[k] = 1
		            },
		            (msg._.yo = {})
		          )
		      }
		      if ((tmp = msg.dam)) {
		        ;(dup_track(id) || {}).via = peer
		        if ((tmp = mesh.hear[tmp])) tmp(msg, peer, root)
		        return
		      }
		      if ((tmp = msg.ok)) msg._.near = tmp['/']
		      const SS = Date.now()
		      DBG && (DBG.is = SS)
		      peer.SI = id
		      dup_track.ed = (d) => {
		        if (id !== d) return
		        dup_track.ed = 0
		        if (!(d = dup.s[id])) return
		        d.via = peer
		        if (msg.get) d.it = msg
		      }
		      root.on('in', (mesh.last = msg))
		      DBG && (DBG.hd = Date.now())
		      console.STAT?.(
		        SS,
		        Date.now() - SS,
		        msg.get ? 'msg get' : msg.put ? 'msg put' : 'msg'
		      )
		      dup_track(id)
		      if (ash) dup_track(ash)
		      mesh.leap = mesh.last = null
		    }

		    const tomap = (k, i, m) => {
		      m(k, true)
		    }
		    hear.c = hear.d = 0

		    ;(() => {
		      let SMIA = 0
		      let loop

		      mesh.hash = (msg, peer) => {
		        let h, s, t
		        const S = Date.now()
		        json(
		          msg.put,
		          function hash(err, text) {
		            const ss = (s || (s = t = text || '')).slice(0, 32768)
		            h = String.hash(ss, h)
		            s = s.slice(32768)
		            if (s) {
		              puff(hash, 0)
		              return
		            }
		            console.STAT?.(S, Date.now() - S, 'say json+hash')
		            msg._.$put = t
		            msg['##'] = h
		            mesh.say(msg, peer)
		            delete msg._.$put
		          },
		          sort
		        )
		      }

		      function sort(k, v) {
		        let tmp
		        if (!(v instanceof Object)) return v
		        Object.keys(v)
		          .sort()
		          .forEach(sorta, { on: v, to: (tmp = {}) })
		        return tmp
		      }
		      function sorta(k) {
		        this.to[k] = this.on[k]
		      }

		      mesh.say = function (msg, peer) {
		        let tmp
		        if ((tmp = this) && (tmp = tmp.to) && tmp.next) tmp.next(msg)
		        if (!msg) return false
		        let id,
		          hash,
		          raw,
		          ack = msg['@']
		        const meta = msg._ || (msg._ = () => {})
		        const DBG = msg.DBG
		        const S = Date.now()
		        meta.y = meta.y || S
		        if (!peer) {
		          DBG && (DBG.y = S)
		        }
		        if (!(id = msg['#'])) id = msg['#'] = String.random(9)
		        !loop && dup_track(id)
		        if (!(hash = msg['##']) && u !== msg.put && !meta.via && ack) {
		          mesh.hash(msg, peer)
		          return
		        }
		        if (!peer && ack) {
		          peer =
		            ((tmp = dup.s[ack]) &&
		              (tmp.via || ((tmp = tmp.it) && (tmp = tmp._) && tmp.via))) ||
		            ((tmp = mesh.last) && ack === tmp['#'] && mesh.leap)
		        }
		        if (!peer && ack) {
		          if (dup.s[ack]) return
		          console.STAT &&
		            console.STAT(Date.now(), ++SMIA, 'total no peer to ack to')
		          return false
		        }
		        if (ack && !msg.put && !hash && ((dup.s[ack] || '').it || '')['##'])
		          return false
		        if (!peer && mesh.way) return mesh.way(msg)
		        DBG && (DBG.yh = Date.now())
		        if (!(raw = meta.raw)) {
		          mesh.raw(msg, peer)
		          return
		        }
		        DBG && (DBG.yr = Date.now())

		        if (!peer || !peer.id) {
		          if (!Object.plain(peer || opt.peers)) return false
		          const SS = Date.now()
		          let P = opt.puff,
		            ps = opt.peers,
		            pl = Object.keys(peer || opt.peers || {})
		          console.STAT?.(SS, Date.now() - SS, 'peer keys')
		          ;(function go() {
		            const SS = Date.now()
		            loop = 1
		            const wr = meta.raw
		            meta.raw = raw
		            let i = 0,
		              p
		            while (i < 9 && (p = (pl || '')[i++])) {
		              if (!(p = ps[p] || (peer || '')[p])) continue
		              mesh.say(msg, p)
		            }
		            meta.raw = wr
		            loop = 0
		            pl = pl.slice(i)
		            console.STAT?.(SS, Date.now() - SS, 'say loop')
		            if (!pl.length) return
		            puff(go, 0)
		            ack && dup_track(ack)
		          })()
		          return
		        }

		        if (!peer.wire && mesh.wire) mesh.wire(peer)
		        if (id === peer.last) return
		        peer.last = id
		        if (peer === meta.via) return false
		        if ((tmp = meta.yo) && (tmp[peer.url] || tmp[peer.pid] || tmp[peer.id]))
		          return false
		        console.STAT?.(
		          S,
		          ((DBG || meta).yp = Date.now()) - (meta.y || S),
		          'say prep'
		        )
		        !loop && ack && dup_track(ack)

		        if (peer.batch) {
		          peer.tail = (tmp = peer.tail || 0) + raw.length
		          if (peer.tail <= opt.pack) {
		            peer.batch += (tmp ? ',' : '') + raw
		            return
		          }
		          flush(peer)
		        }

		        peer.batch = '['
		        const ST = Date.now()
		        setTimeout(() => {
		          console.STAT?.(ST, Date.now() - ST, '0ms TO')
		          flush(peer)
		        }, opt.gap)
		        send(raw, peer)
		        console.STAT &&
		          ack === peer.SI &&
		          console.STAT(S, Date.now() - peer.SH, 'say ack')
		      }

		      mesh.say.c = mesh.say.d = 0

		      mesh.raw = (msg, peer) => {
		        if (!msg) return ''
		        const meta = msg._ || {}
		        let put, tmp
		        if ((tmp = meta.raw)) return tmp
		        if (typeof msg === 'string') return msg
		        const hash = msg['##'],
		          ack = msg['@']

		        if (hash && ack) {
		          if (!meta.via && dup_check(ack + hash)) return false
		          if ((tmp = (dup.s[ack] || '').it)) {
		            if (hash === tmp['##']) return false
		            if (!tmp['##']) tmp['##'] = hash
		          }
		        }

		        if (!msg.dam && !msg['@']) {
		          let i = 0
		          const to = []
		          tmp = opt.peers
		          for (const k in tmp) {
		            const p = tmp[k]
		            to.push(p.url || p.pid || p.id)
		            if (++i > 6) break
		          }
		          if (i > 1) msg['><'] = to.join()
		        }

		        if (msg.put && (tmp = msg.ok)) {
		          msg.ok = {
		            '@': (tmp['@'] || 1) - 1,
		            '/': tmp['/'] === msg._.near ? mesh.near : tmp['/']
		          }
		        }

		        if ((put = meta.$put)) {
		          tmp = {}
		          Object.keys(msg).forEach((k) => {
		            tmp[k] = msg[k]
		          })
		          tmp.put = ':])([:'
		          json(tmp, (err, raw) => {
		            if (err) return
		            const S = Date.now()
		            tmp = raw.indexOf('"put":":])([:"')
		            res(u, (raw = raw.slice(0, tmp + 6) + put + raw.slice(tmp + 14)))
		            console.STAT?.(S, Date.now() - S, 'say slice')
		          })
		          return
		        }

		        json(msg, res)
		        function res(err, raw) {
		          if (err) return
		          meta.raw = raw
		          mesh.say(msg, peer)
		        }
		      }
		    })()

		    function flush(peer) {
		      let tmp = peer.batch
		      const t = typeof tmp === 'string'
		      if (t) tmp += ']'
		      peer.batch = peer.tail = null
		      if (!tmp) return
		      if (t ? 3 > tmp.length : !tmp.length) return
		      if (!t) {
		        try {
		          tmp = tmp.length === 1 ? tmp[0] : JSON.stringify(tmp)
		        } catch (e) {
		          return opt.log('DAM JSON stringify error', e)
		        }
		      }
		      if (!tmp) return
		      send(tmp, peer)
		    }

		    function send(raw, peer) {
		      try {
		        const wire = peer.wire
		        if (peer.say) {
		          peer.say(raw)
		        } else if (wire.send) {
		          wire.send(raw)
		        }
		        mesh.say.d += raw.length || 0
		        ++mesh.say.c
		      } catch (e) {
		        ;(peer.queue = peer.queue || []).push(raw)
		      }
		    }

		    mesh.near = 0
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
		        mesh.say({ dam: '?', pid: root.opt.pid }, (opt.peers[tmp] = peer))
		        delete dup.s[peer.last]
		      }
		      if (!peer.met) {
		        mesh.near++
		        peer.met = Date.now()
		        root.on('hi', peer)
		      }
		      tmp = peer.queue
		      peer.queue = []
		      setTimeout.each(
		        tmp || [],
		        (msg) => {
		          send(msg, peer)
		        },
		        0,
		        9
		      )
		    }

		    mesh.bye = (peer) => {
		      peer.met && --mesh.near
		      delete peer.met
		      root.on('bye', peer)
		      let tmp = Date.now()
		      tmp = tmp - (peer.met || tmp)
		      mesh.bye.time = ((mesh.bye.time || tmp) + tmp) / 2
		    }

		    mesh.hear['!'] = (msg, peer) => {
		      opt.log('Error:', msg.err)
		    }
		    mesh.hear['?'] = (msg, peer) => {
		      if (msg.pid) {
		        if (!peer.pid) peer.pid = msg.pid
		        if (msg['@']) return
		      }
		      mesh.say({ '@': msg['#'], dam: '?', pid: opt.pid }, peer)
		      delete dup.s[peer.last]
		    }

		    mesh.hear['mob'] = (msg, peer) => {
		      if (!msg.peers) return
		      const peers = Object.keys(msg.peers)
		      const one = peers[(Math.random() * peers.length) >> 0]
		      if (!one) return
		      mesh.bye(peer)
		      mesh.hi(one)
		    }

		    root.on('create', function (root) {
		      root.opt.pid = root.opt.pid || String.random(9)
		      this.to.next(root)
		      root.on('out', mesh.say)
		    })

		    root.on('bye', function (peer, tmp) {
		      peer = opt.peers[peer.id || peer] || peer
		      this.to.next(peer)
		      peer.bye ? peer.bye() : (tmp = peer.wire) && tmp.close && tmp.close()
		      delete opt.peers[peer.id]
		      peer.wire = null
		    })

		    const gets = {}
		    root.on('bye', function (peer, tmp) {
		      this.to.next(peer)
		      if ((tmp = console.STAT)) tmp.peers = mesh.near
		      if (!(tmp = peer.url)) return
		      gets[tmp] = true
		      setTimeout(() => {
		        delete gets[tmp]
		      }, opt.lack || 9000)
		    })

		    root.on('hi', function (peer, tmp) {
		      this.to.next(peer)
		      if ((tmp = console.STAT)) tmp.peers = mesh.near
		      if (opt.super) return
		      const souls = Object.keys(root.next || '')
		      if (souls.length > 9999 && !console.SUBS) {
		        console.log(
		          (console.SUBS = 'Warning: You have more than 10K live GETs...')
		        )
		      }
		      setTimeout.each(souls, (soul) => {
		        const node = root.next[soul]
		        if (opt.super || (node.ask || '')['']) {
		          mesh.say({ get: { '#': soul } }, peer)
		          return
		        }
		        setTimeout.each(Object.keys(node.ask || ''), (key) => {
		          if (!key) return
		          mesh.say(
		            {
		              '##': String.hash((root.graph[soul] || '')[key]),
		              get: { '.': key, '#': soul }
		            },
		            peer
		          )
		        })
		      })
		    })

		    return mesh
		  }

		  try {
		    module.exports = Mesh
		  } catch (e) {}
	})(USE, './mesh');

	;USE(function(module){
		var Gun = USE('./root')
		  Gun.Mesh = USE('./mesh')

		  // TODO: resync upon reconnect online/offline
		  //window.ononline = window.onoffline = function(){ console.log('online?', navigator.onLine) }

		  Gun.on('opt', function (root) {
		    this.to.next(root)
		    if (root.once) {
		      return
		    }
		    var opt = root.opt
		    if (false === opt.WebSocket) {
		      return
		    }

		    var env = Gun.window || {}
		    var websocket =
		      opt.WebSocket || env.WebSocket || env.webkitWebSocket || env.mozWebSocket
		    if (!websocket) {
		      return
		    }
		    opt.WebSocket = websocket

		    opt.mesh = opt.mesh || Gun.Mesh(root)
		    var mesh = opt.mesh

		    var wired = mesh.wire || opt.wire
		    mesh.wire = opt.wire = open
		    function open(peer) {
		      var url, wire
		      try {
		        if (!peer || !peer.url) {
		          return wired && wired(peer)
		        }
		        url = peer.url.replace(/^http/, 'ws')
		        peer.wire = new opt.WebSocket(url)
		        wire = peer.wire
		        wire.onclose = () => {
		          reconnect(peer)
		          opt.mesh.bye(peer)
		        }
		        wire.onerror = (err) => {
		          reconnect(peer)
		        }
		        wire.onopen = () => {
		          opt.mesh.hi(peer)
		        }
		        wire.onmessage = (msg) => {
		          if (!msg) {
		            return
		          }
		          opt.mesh.hear(msg.data || msg, peer)
		        }
		        return wire
		      } catch (e) {
		        opt.mesh.bye(peer)
		      }
		    }

		    setTimeout(() => {
		      !opt.super && root.on('out', { dam: 'hi' })
		    }, 1) // it can take a while to open a socket, so maybe no longer lazy load for perf reasons?

		    var wait = 2 * 999
		    function reconnect(peer) {
		      clearTimeout(peer.defer)
		      if (!opt.peers[peer.url]) {
		        return
		      }
		      if (doc && peer.retry <= 0) {
		        return
		      }
		      var previousTried = peer.tried
		      var now = Date.now()
		      peer.tried = now
		      var delta = now - (previousTried || 0)
		      peer.retry =
		        (peer.retry || opt.retry + 1 || 60) - (delta < wait * 4 ? 1 : 0)
		      peer.defer = setTimeout(function to() {
		        if (doc && doc.hidden) {
		          return setTimeout(to, wait)
		        }
		        open(peer)
		      }, wait)
		    }
		    var doc = typeof document !== 'undefined' && document
		  })
		  var noop = () => {},
		    u
	})(USE, './websocket');

	;USE(function(module){
		if (typeof Gun === 'undefined') {
		    return
		  }

		  // Constants and utilities
		  const noop = () => {}
		  let store
		  const u = undefined
		  try {
		    store = (Gun.window || noop).localStorage
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
		        cb(u, JSON.parse(t, r))
		      } catch (e) {
		        cb(e)
		      }
		    })
		  const json =
		    JSON.stringifyAsync ||
		    ((v, cb, r, s) => {
		      try {
		        cb(u, JSON.stringify(v, r, s))
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
		      disk = lg[opt.prefix] = lg[opt.prefix] || JSON.parse(item) || {} // TODO: Perf! This will block, should we care, since limited to 5MB anyways?
		      size = (item || '').length
		    } catch (_e) {
		      disk = lg[opt.prefix] = {}
		      size = 0
		    }

		    root.on('get', function (msg) {
		      this.to.next(msg)
		      const lex = msg.get
		      const soul = lex?.['#']
		      let data
		      const u = undefined
		      if (!lex || !soul) {
		        return
		      }
		      // Retrieve data from in-memory disk
		      data = disk[soul] || u
		      const tmp = lex?.['.']
		      if (data && tmp && !Object.plain(tmp)) {
		        // Pluck specific field from the data
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
		      const _tmp = undefined // pull data off wire envelope
		      // Merge data into in-memory disk
		      disk[soul] = Gun.state.ify(disk[soul], key, put['>'], put[':'], soul)
		      if (stop && size > 4999880) {
		        // Check localStorage size limit (~5MB)
		        root.on('in', { '@': id, err: 'localStorage max!' })
		        return
		      }
		      // Probabilistic ack to avoid flooding (only for non-ack messages)
		      if (!msg['@'] && (!msg._.via || Math.random() < ok['@'] / ok['/'])) {
		        acks.push(id)
		      }
		      if (to) {
		        return
		      }
		      // Schedule flush with delay based on data size
		      to = setTimeout(flush, 9 + size / 333) // 0.1MB = 0.3s, 5MB = 15s
		    })
		    function flush() {
		      // Defer flush if busy and no pending acks
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
		      json(disk, (_err, tmp) => {
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
		            put: disk
		          })
		        }
		        size = tmp.length

		        // Send acks for persisted messages
		        setTimeout.each(
		          ack,
		          (id) => {
		            root.on('in', { '@': id, err: _err, ok: 0 }) // localStorage isn't reliable, so make its `ok` code be a low number.
		          },
		          0,
		          99
		        )
		      })
		    }
		  })
	})(USE, './localStorage');



}());

/* BELOW IS TEMPORARY FOR OLD INTERNAL COMPATIBILITY, THEY ARE IMMEDIATELY DEPRECATED AND WILL BE REMOVED IN NEXT VERSION */
;(() => {
  if (typeof Gun === 'undefined') {
    return
  }
  const DEP = (n) => {
    console.warn(
      `Warning! Deprecated internal utility will break in next version: ${n}`
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
    hash: (s, c) => {
      // via SO
      DEP('text.hash')
      if (typeof s !== 'string') {
        return
      }
      c = c || 0
      if (!s.length) {
        return c
      }
      let i
      let l
      let n
      for (i = 0, l = s.length, void 0; i < l; ++i) {
        n = s.charCodeAt(i)
        c = (c << 5) - c + n
        c |= 0
      }
      return c
    },
    ify: (t) => {
      DEP('text.ify')
      if (Type.text.is(t)) {
        return t
      }
      if (typeof JSON !== 'undefined') {
        return JSON.stringify(t)
      }
      return t?.toString?.() ?? t
    },
    is: (t) => {
      DEP('text')
      return typeof t === 'string'
    },
    match: (t, o) => {
      let tmp
      DEP('text.match')
      if ('string' !== typeof t) {
        return false
      }
      if (typeof o === 'string') {
        o = { '=': o }
      }
      o = o || {}
      tmp = o['='] || o['*'] || o['>'] || o['<']
      if (t === tmp) {
        return true
      }
      if (undefined !== o['=']) {
        return false
      }
      tmp = o['*'] || o['>'] || o['<']
      if (t.slice(0, (tmp || '').length) === tmp) {
        return true
      }
      if (undefined !== o['*']) {
        return false
      }
      if (undefined !== o['>'] && undefined !== o['<']) {
        return t >= o['>'] && t <= o['<']
      }
      if (undefined !== o['>'] && t >= o['>']) {
        return true
      }
      if (undefined !== o['<'] && t <= o['<']) {
        return true
      }
      return false
    },
    random: (l, c) => {
      DEP('text.random')
      let s = ''
      l = l || 24 // you are not going to make a 0 length random number, so no need to check type
      c = c || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
      while (l > 0) {
        s += c.charAt(Math.floor(Math.random() * c.length))
        l--
      }
      return s
    }
  }
  Type.list = Type.list || {
    index: 1, // change this to 0 if you want non-logical, non-mathematical, non-matrix, non-convenient array notation
    is: (l) => {
      DEP('list')
      return Array.isArray(l)
    },
    map: (l, c, _) => {
      DEP('list.map')
      return obj_map(l, c, _)
    },
    slit: Array.prototype.slice,
    sort: (k) => {
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
    }
  }
  Type.obj = Type.boj || {
    as: (o, k, v, u) => {
      DEP('obj.as')
      o[k] = o[k] || (u === v ? {} : v)
      return o[k]
    },
    copy: (o) => {
      DEP('obj.copy') // because http://web.archive.org/web/20140328224025/http://jsperf.com/cloning-an-object/2
      return !o ? o : JSON.parse(JSON.stringify(o)) // is shockingly faster than anything else, and our data has to be a subset of JSON anyways!
    },
    del: (o, k) => {
      DEP('obj.del')
      if (!o) {
        return
      }
      o[k] = null
      delete o[k]
      return o
    },
    empty: (() => {
      function empty(_v, i) {
        const n = this.n
        if (n && (i === n || (obj_is(n) && Object.hasOwn(n, i)))) {
          return
        }
        if (undefined !== i) {
          return true
        }
      }
      return (o, n) => {
        DEP('obj.empty')
        if (!o) {
          return true
        }
        return !obj_map(o, empty, { n: n })
      }
    })(),
    has: (o, k) => {
      DEP('obj.has')
      return Object.hasOwn(o, k)
    },
    ify: (o) => {
      DEP('obj.ify')
      if (obj_is(o)) {
        return o
      }
      try {
        o = JSON.parse(o)
      } catch {
        o = {}
      }
      return o
    },
    is: (o) => {
      DEP('obj')
      return o
        ? (o instanceof Object && o.constructor === Object) ||
            Object.prototype.toString
              .call(o)
              .match(/^\[object (\w+)\]$/)?.[1] === 'Object'
        : false
    },
    map: (() => {
      function t(...args) {
        if (args.length === 2) {
          const [k, v] = args
          t.r = t.r || {}
          t.r[k] = v
          return
        }
        const [k] = args
        t.r = t.r || []
        t.r.push(k)
      }
      const keys = Object.keys
      let map
      Object.keys =
        Object.keys ||
        ((o) =>
          map(o, (_v, k, t) => {
            t(k)
          }))
      return (l, c, _) => {
        DEP('obj.map')
        let i = 0
        let x
        let r
        let ll
        let lle
        let ii
        const f = typeof c === 'function'
        t.r = undefined
        if (keys && obj_is(l)) {
          ll = keys(l)
          lle = true
        }
        _ = _ || {}
        if (list_is(l) || ll) {
          x = (ll || l).length
          for (; i < x; i++) {
            ii = i + Type.list.index
            if (f) {
              r = lle ? c.call(_, l[ll[i]], ll[i], t) : c.call(_, l[i], ii, t)
              if (r !== undefined) {
                return r
              }
            } else {
              //if(Type.test.is(c,l[i])){ return ii } // should implement deep equality testing!
              if (c === l[lle ? ll[i] : i]) {
                return ll ? ll[i] : ii
              } // use this for now
            }
          }
        } else {
          for (i in l) {
            if (f) {
              if (obj_has(l, i)) {
                r = _ ? c.call(_, l[i], i, t) : c(l[i], i, t)
                if (r !== undefined) {
                  return r
                }
              }
            } else {
              //if(a.test.is(c,l[i])){ return i } // should implement deep equality testing!
              if (c === l[i]) {
                return i
              } // use this for now
            }
          }
        }
        return f ? t.r : Type.list.index ? 0 : -1
      }
    })(),
    put: (o, k, v) => {
      DEP('obj.put')
      const temp = o || {}
      temp[k] = v
      return temp
    },
    to: (() => {
      function map(v, k) {
        if (obj_has(this, k) && undefined !== this[k]) {
          return
        }
        this[k] = v
      }
      return (from, to) => {
        DEP('obj.to')
        to = to || {}
        obj_map(from, map, to)
        return to
      }
    })()
  }
  Type.time = Type.time || {}
  Type.time.is =
    Type.time.is ||
    ((t) => {
      DEP('time')
      return t ? t instanceof Date : Date.now()
    })

  const list_is = Type.list.is
  const obj = Type.obj
  const obj_is = obj.is
  const obj_has = obj.has
  const obj_map = obj.map

  var Val = {
    is: (v) => {
      DEP('val.is') // Valid values are a subset of JSON: null, binary, number (!Infinity), text, or a soul relation. Arrays need special algorithms to handle concurrency, so they are not supported directly. Use an extension that supports them if needed but research their problems first.
      if (v === undefined) {
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
    },
    link: { _: '#' }
  }
  Val.rel = Val.link
  ;(() => {
    Val.link.is = (v) => {
      DEP('val.link.is') // this defines whether an object is a soul relation or not, they look like this: {'#': 'UUID'}
      let o
      if (v?.[rel_] && !v?._ && obj_is(v)) {
        // must be an object.
        o = {}
        obj_map(v, map, o)
        if (o.id) {
          // a valid id was found.
          return o.id // yay! Return it.
        }
      }
      return false // the value was not a valid soul relation.
    }
    function map(s, k) {
      if (this.id) {
        this.id = false
        return this.id
      } // if ID is already defined AND we're still looping through the object, it is considered invalid.
      if (k === rel_ && text_is(s)) {
        // the key should be '#' and have a text value.
        this.id = s // we found the soul!
      } else {
        this.id = false
        return this.id // if there exists anything else on the object that isn't the soul, then it is considered invalid.
      }
    }
  })()
  Val.link.ify = (t) => {
    DEP('val.link.ify')
    return obj_put({}, rel_, t)
  } // convert a soul into a relation and return it.
  Type.obj.has._ = '.'
  const rel_ = Val.link._
  var bi_is = Type.bi.is
  var num_is = Type.num.is
  var text_is = Type.text.is
  const obj_put = obj.put

  Type.val = Type.val || Val

  var Node = { _: '_' }
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
      let s // checks to see if an object is a valid node.
      if (!obj_is2(n)) {
        return false
      } // must be an object.
      s = Node.soul(n)
      if (s) {
        // must have a soul on it.
        return !obj_map2(n, map, { as: as, cb: cb, n: n, s: s })
      }
      return false // nope! This was not a valid node.
    }
    function map(v, k) {
      // we invert this because the way we check for this is via a negation.
      if (k === Node._) {
        return
      } // skip over the metadata.
      if (!Val.is(v)) {
        return true
      } // it is true that this is an invalid node.
      if (this.cb) {
        this.cb.call(this.as, v, k, this.n, this.s)
      } // optionally callback each key/value.
    }
  })()
  ;(() => {
    Node.ify = (obj, o, as) => {
      DEP('node.ify') // returns a node from a shallow object.
      if (!o) {
        o = {}
      } else if (typeof o === 'string') {
        o = { soul: o }
      } else if (typeof o === 'function') {
        o = { map: o }
      }
      if (o.map) {
        o.node = o.map.call(as, obj, undefined, o.node || {})
      }
      o.node = Node.soul.ify(o.node || {}, o)
      if (o.node) {
        obj_map2(obj, map, { as: as, o: o })
      }
      return o.node // This will only be a valid node if the object wasn't already deep!
    }
    function map(v, k) {
      const o = this.o
      let tmp
      if (o.map) {
        tmp = o.map.call(this.as, v, `${k}`, o.node)
        if (undefined === tmp) {
          obj_del2(o.node, k)
        } else if (o.node) {
          o.node[k] = tmp
        }
        return
      }
      if (Val.is(v)) {
        o.node[k] = v
      }
    }
  })()
  const obj2 = Type.obj
  const obj_is2 = obj2.is
  const obj_del2 = obj2.del
  const obj_map2 = obj2.map
  var text = Type.text
  var text_random = text.random
  var soul_ = Node.soul._
  Type.node = Type.node || Node

  var State = Type.state
  State.lex = () => {
    DEP('state.lex')
    return State().toString(36).replace('.', '')
  }
  State.to = (from, k, to) => {
    DEP('state.to')
    var val = from?.[k]
    if (obj_is3(val)) {
      val = obj_copy3(val)
    }
    return State.ify(to, k, State.is(from, k), val, Node.soul(from))
  }
  ;(() => {
    State.map = (cb, s, as) => {
      DEP('state.map')

      const temp = cb || s
      const o = obj_is3(temp) ? temp : null
      const temp2 = cb || s
      cb = fn_is3(temp2) ? temp2 : null
      if (o && !cb) {
        s = num_is3(s) ? s : State()
        o[N_] = o[N_] || {}
        obj_map3(o, map, { o: o, s: s })
        return o
      }
      as = as || obj_is3(s) ? s : undefined
      s = num_is3(s) ? s : State()
      return function (v, k, o, opt) {
        if (!cb) {
          map.call({ o: o, s: s }, v, k)
          return v
        }
        cb.call(as || this || {}, v, k, o, opt)
        if (obj_has3(o, k) && undefined === o[k]) {
          return
        }
        map.call({ o: o, s: s }, v, k)
      }
    }
    function map(_v, k) {
      if (N_ === k) {
        return
      }
      State.ify(this.o, k, this.s)
    }
  })()
  const obj3 = Type.obj
  const obj_has3 = obj3.has
  const obj_is3 = obj3.is
  const obj_map3 = obj3.map
  const obj_copy3 = obj3.copy
  var num3 = Type.num
  var num_is3 = num3.is
  var fn3 = Type.fn
  var fn_is3 = fn3.is
  var N_ = Node._

  var Graph = {}
  ;(() => {
    Graph.is = (g, cb, fn, as) => {
      DEP('graph.is') // checks to see if an object is a valid graph.
      if (!g || !obj_is4(g) || obj_empty4(g)) {
        return false
      } // must be an object.
      return !obj_map4(g, map, { as: as, cb: cb, fn: fn }) // makes sure it wasn't an empty object.
    }
    function map(n, s) {
      // we invert this because the way'? we check for this is via a negation.
      if (!n || s !== Node.soul(n) || !Node.is(n, this.fn, this.as)) {
        return true
      } // it is true that this is an invalid graph.
      if (!this.cb) {
        return
      }
      nf.n = n
      nf.as = this.as // sequential race conditions aren't races.
      this.cb.call(nf.as, n, s, nf)
    }
    function nf(fn) {
      // optional callback for each node.
      if (fn) {
        Node.is(nf.n, fn, nf.as)
      } // where we then have an optional callback for each key/value.
    }
  })()
  ;(() => {
    Graph.ify = (obj, env, as) => {
      DEP('graph.ify')
      var at = { obj: obj, path: [] }
      if (!env) {
        env = {}
      } else if (typeof env === 'string') {
        env = { soul: env }
      } else if (typeof env === 'function') {
        env.map = env
      }
      if (typeof as === 'string') {
        env.soul = env.soul || as
        as = undefined
      }
      if (env.soul) {
        at.link = Val.link.ify(env.soul)
      }
      env.shell = as?.shell
      env.graph = env.graph || {}
      env.seen = env.seen || []
      env.as = env.as || as
      node(env, at)
      env.root = at.node
      return env.graph
    }
    function node(env, at) {
      let tmp
      tmp = seen(env, at)
      if (tmp) {
        return tmp
      }
      at.env = env
      at.soul = soul
      if (Node.ify(at.obj, map, at)) {
        at.link = at.link || Val.link.ify(Node.soul(at.node))
        if (at.obj !== env.shell) {
          env.graph[Val.link.is(at.link)] = at.node
        }
      }
      return at
    }
    function map(v, k, n) {
      var env = this.env
      var is
      let tmp
      if (Node._ === k && Object.hasOwn(v, Val.link._)) {
        return n._ // TODO: Bug?
      }
      is = valid(v, k, n, this, env)
      if (!is) {
        return
      }
      if (!k) {
        this.node = this.node || n || {}
        if (Object.hasOwn(v, Node._) && Node.soul(v)) {
          // ? for safety ?
          this.node._ = obj_copy(v._)
        }
        this.node = Node.soul.ify(this.node, Val.link.is(this.link))
        this.link = this.link || Val.link.ify(Node.soul(this.node))
      }
      tmp = env.map
      if (tmp) {
        tmp.call(env.as || {}, v, k, n, this)
        if (Object.hasOwn(n, k)) {
          v = n[k]
          if (undefined === v) {
            obj_del(n, k)
            return
          }
          is = valid(v, k, n, this, env)
          if (!is) {
            return
          }
        }
      }
      if (!k) {
        return this.node
      }
      if (is) {
        return v
      }
      tmp = node(env, { obj: v, path: this.path.concat(k) })
      if (!tmp.node) {
        return
      }
      return tmp.link //{'#': Node.soul(tmp.node)};
    }
    function soul(id) {
      var prev = Val.link.is(this.link)
      var graph = this.env.graph
      this.link = this.link || Val.link.ify(id)
      this.link[Val.link._] = id
      if (this.node?.[Node._]) {
        this.node[Node._][Val.link._] = id
      }
      if (Object.hasOwn(graph, prev)) {
        graph[id] = graph[prev]
        obj_del(graph, prev)
      }
    }
    function valid(v, k, n, at, env) {
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
        return valid(v, k, n, at, env)
      }
      env.err = `Invalid value at '${at.path.concat(k).join('.')}'!`
      if (Type.list.is(v)) {
        env.err = `${env.err} Use \`.set(item)\` instead of an Array.`
      }
    }
    function seen(env, at) {
      var arr = env.seen
      var i = arr.length
      var has
      while (i--) {
        has = arr[i]
        if (at.obj === has.obj) {
          return has
        }
      }
      arr.push(at)
    }
  })()
  Graph.node = (node) => {
    DEP('graph.node')
    var soul = Node.soul(node)
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
      obj_map4(graph[root], map, { graph: graph, obj: obj, opt: opt })
      return obj
    }
    function map(v, k) {
      let tmp
      let obj
      if (Node._ === k) {
        if (obj_empty4(v, Val.link._)) {
          return
        }
        this.obj[k] = obj_copy4(v)
        return
      }
      tmp = Val.link.is(v)
      if (!tmp) {
        this.obj[k] = v
        return
      }
      obj = this.opt.seen[tmp]
      if (obj) {
        this.obj[k] = obj
        return
      }
      this.obj[k] = this.opt.seen[tmp] = Graph.to(this.graph, tmp, this.opt)
    }
  })()
  Type.graph = Type.graph || Graph
})()
