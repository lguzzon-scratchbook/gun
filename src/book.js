;(() => {
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
})()
