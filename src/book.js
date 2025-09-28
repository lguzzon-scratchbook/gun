;(() => {
  // Book is a replacement for JS objects, maps, dictionaries.
  const sT = setTimeout
  let B = sT.Book
  if (!B) {
    /**
     * Creates a new Book instance.
     * @param {string} [text] - Optional serialized text to initialize the book.
     * @returns {Function} The book function for key-value operations.
     */
    B = sT.Book = (text) => {
      const b = function book(word, is) {
        const cached = b.all[word]
        if (is === undefined) {
          return cached ? cached.is : b.get(word)
        }
        if (cached) {
          // Update existing item
          const p = cached.page
          if (p) {
            p.size += size(is) - size(cached.is)
            p.text = ''
          }
          cached.text = ''
          cached.is = is
          return b
        }
        return b.set(word, is)
      }
      // Initialize with root page
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
   * If the page is stored as a string, converts it to an object.
   * @param {string} word - The word to search for.
   * @returns {Object} The page object.
   */
  function page(word) {
    const l = this.list
    const i = spot(word, l, this.parse)
    let p = l[i]
    if (typeof p === 'string') {
      // Convert string page to object
      l[i] = p = {
        book: this,
        first: this.parse ? this.parse(p) : p,
        get: this,
        read: list,
        size: -1, // Size will be calculated later
        substring: sub,
        toString: to
      }
    }
    // Note: If page size exceeds limit after operations, it may be split, requiring re-getting the page
    return p
  }
  /**
   * Retrieves the value associated with the given word.
   * Checks in-memory cache first, then searches in pages.
   * @param {string} word - The word to search for.
   * @returns {*} The value associated with the word, or undefined if not found.
   */
  function get(word) {
    if (!word) return
    // If word is an object with 'is' property, return its value
    if (word.is !== undefined) return word.is
    // Check in-memory cache
    const cached = this.all[word]
    if (cached) return cached.is
    // Search in the appropriate page
    const page = this.page(word)
    if (!page || !page.from) return // No data in this page
    return got(word, page)
  }
  /**
   * Retrieves the value for a word from a page.
   * Handles exact matches, non-exact matches, and escaped keys.
   * @param {string} word - The word to retrieve.
   * @param {Object} page - The page object.
   * @returns {*} The value associated with the word, or undefined if not found.
   */
  function got(word, page) {
    const b = page.book
    const l = from(page)
    if (!l) return
    let i = spot(word, l, B.decode)
    got.i = i
    let item = l[i]
    // Check for exact match
    if (item && word === item.word) {
      b.all[word] = item
      return item.is
    }
    // Check next item if current is not a string (possibly escaped)
    if (typeof item !== 'string') {
      i += 1
      got.i = i
      item = l[i]
      if (item && word === item.word) {
        b.all[word] = item
        return item.is
      }
    }
    // Parse as escaped key-value pair
    const [key, val] = slot(item)
    const decodedKey = B.decode(key)
    if (word !== decodedKey) {
      // Try next item for escaped
      i += 1
      got.i = i
      item = l[i]
      if (!item) return
      const [nextKey, nextVal] = slot(item)
      if (word !== B.decode(nextKey)) {
        return
      }
      // Cache the parsed item
      l[i] = b.all[word] = {
        is: B.decode(nextVal),
        page: page,
        substring: subt,
        toString: tot,
        word: String(word)
      }
      return l[i].is
    }
    // Create and cache new item for found escaped key
    item =
      l[i] =
      b.all[word] =
        {
          is: B.decode(val),
          page: page,
          substring: subt,
          toString: tot,
          word: String(word)
        }
    return item.is
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
    let low = 0
    let high = sorted.length
    const wordStr = String(word)
    while (low < high) {
      const mid = Math.floor((low + high) / 2)
      const midVal = parse(sorted[mid]) || ''
      if (wordStr < midVal) {
        high = mid
      } else {
        low = mid + 1
      }
    }
    return low
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
  function list(each = (x) => x) {
    const sortedItems = sort(this)
    const parse = this.book?.parse ?? (() => {})
    return sortedItems.map((item) => {
      const word = item.word || parse(item) || item
      return each(this.get(word), word, this)
    })
  }

  /**
   * Sets the value for a word in the book.
   * Handles updates and inserts, managing page sizes and splits.
   * @param {string} word - The word to set.
   * @param {*} is - The value to set.
   * @returns {Function} The book function.
   */
  function set(word, is) {
    // Check if already in memory
    let item = this.all[word]
    if (item) {
      return this(word, is) // Update via main function
    }
    const wordStr = String(word)
    const page = this.page(wordStr)
    // Check if it's an update in parseless data
    if (page?.from) {
      this.get(word)
      if (this.all[word]) {
        return this(word, is)
      }
    }
    // Insert new item
    item = this.all[wordStr] = {
      is: is,
      page: page,
      substring: subt,
      toString: tot,
      word: wordStr
    }
    page.first = page.first < wordStr ? page.first : wordStr
    if (!page.limbo) page.limbo = []
    page.limbo.push(item)
    this(word, is) // Update main function
    page.size += size(wordStr) + size(is)
    if ((this.PAGE ?? PAGE) < page.size) {
      split(page, this)
    }
    return this
  }

  /**
   * Splits a page when it exceeds the size limit.
   * Creates a new page with the second half of items.
   * @param {Object} p - The page to split.
   * @param {Object} b - The book containing the page.
   */
  function split(p, b) {
    const sortedItems = sort(p)
    const len = sortedItems.length
    const mid = Math.floor(len / 2)
    const midItem = sortedItems[mid]
    const newPage = {
      book: b,
      first: midItem.substring(), // Word of the middle item
      get: b,
      read: list,
      size: 0,
      substring: sub,
      toString: to
    }
    newPage.from = []
    const newFrom = newPage.from
    // Move second half to new page
    for (let k = mid; k < len; k++) {
      const item = sortedItems[k]
      newFrom.push(item)
      newPage.size += size(item.word) + size(item.is)
      item.page = newPage
    }
    // Keep first half in original page
    p.from = p.from.slice(0, mid)
    p.size -= newPage.size
    // Insert new page into book's list
    const insertIndex = spot(newPage.first, b.list, b.parse) + 1
    b.list.splice(insertIndex, 0, newPage)
    // Notify if split callback exists
    if (b.split) {
      b.split(newPage, p)
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
   * Calculates the size of a value for storage purposes.
   * Returns the length of the string representation, or 1 if empty.
   * @param {any} t - The value to measure.
   * @returns {number} The size, at least 1.
   */
  function size(t) {
    return (t ?? '').length || 1
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
   * @param {number} i - Start index.
   * @param {number} j - End index.
   * @returns {string} The substring.
   */
  function sub(i, j) {
    return (
      this.first ||
      this.word ||
      B.decode((from(this) || '')[0] || '')
    ).substring(i, j)
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
   * @param {Object} p - The page object.
   * @returns {string} The serialized string.
   */
  function text(p) {
    // PERF: read->[*] : text->"*" no edit waste 1 time perf.
    if (p.limbo) {
      sort(p)
    }
    return 'string' === typeof p.from ? p.from : `|${(p.from || []).join('|')}|`
  }

  /**
   * Sorts the page's items, mixing in any limbo items.
   * @param {Object} p - The page object.
   * @param {Array} [l] - Optional limbo array.
   * @returns {Array} The sorted array.
   */
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
  /**
   * Merges limbo items into the page's from array.
   * @param {Object} p - The page object.
   * @param {Array} [l] - Optional limbo array.
   * @returns {Array} The merged array.
   */
  function mix(p, l) {
    // TODO: IMPROVE PERFORMANCE!!!! l[j] = i is 5X+ faster than .push(
    const limbo = l || p.limbo || []
    p.limbo = null
    const f = p.from
    limbo.forEach((i) => {
      if (got(i.word, p)) {
        f[got.i] = i // TODO: Trick: allow for a GUN'S HAM CRDT hook here.
      } else {
        f.push(i)
      }
    })
    return f
  }

  /**
   * Encodes a value into a serialized string format.
   * @param {*} d - The value to encode.
   * @param {string} [s='|'] - The separator character.
   * @param {string} [u=' '] - The unit separator character.
   * @returns {string} The encoded string.
   */
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
        return l.reduce(
          (t, k) =>
            `${t}${uStr}${B.encode(k, sStr, uStr)}${uStr}${B.encode(d[k], sStr, uStr)}${uStr}${sStr}`,
          sStr
        )
      }
    }
  }
  /**
   * Decodes a serialized string back into its original value.
   * @param {string} t - The encoded string to decode.
   * @returns {*} The decoded value.
   */
  B.decode = (t) => {
    if (typeof t !== 'string') return
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
      case '|': {
        // Decode object
        const parts = t.slice(1, -1).split('|')
        const obj = {}
        for (const part of parts) {
          if (!part) continue
          const [key, val] = part.split(' ')
          obj[B.decode(key)] = B.decode(val)
        }
        return obj
      }
    }
    return t.slice(t.indexOf('"') + 1)
  }

  /**
   * Computes a hash value for a string.
   * @param {string} s - The string to hash.
   * @param {number} [c=0] - Initial hash value.
   * @returns {number} The computed hash.
   */
  B.hash = (s, c) => {
    // via SO
    if (typeof s !== 'string') {
      return
    }
    const cVal = c ?? 0 // CPU schedule hashing by
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
})()
