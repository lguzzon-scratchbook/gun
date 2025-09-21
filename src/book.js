;(() => {
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
})()
