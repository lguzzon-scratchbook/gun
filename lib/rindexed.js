;(() => {
  // Constants for timeouts and delays to improve maintainability
  const RETRY_DELAY = 1 // ms for recursive DB calls if not ready
  const MEMORY_GET_DELAY = 5 // ms delay for memory get simulation
  const MEMORY_PUT_DELAY = 250 // ms delay for memory put simulation
  const DB_RESET_INTERVAL = 15000 // ms to reset DB connection (WebKit bug workaround)

  /**
   * Creates a storage adapter for IndexedDB with fallback to in-memory storage.
   * @param {Object} opt - Options object.
   * @param {string} opt.file - Database name (default: 'radata').
   * @param {IDBFactory} opt.indexedDB - IndexedDB factory.
   * @returns {Function} Store instance.
   */
  function Store(opt) {
    opt = opt || {}
    opt.file = String(opt.file || 'radata')
    const existingStore = Store[opt.file]
    let db = null
    const undefinedValue = undefined

    if (existingStore) {
      console.log('Warning: reusing same IndexedDB store and options as 1st.')
      return Store[opt.file]
    }
    Store[opt.file] = () => {}
    const store = Store[opt.file]

    try {
      opt.indexedDB = opt.indexedDB || Store.indexedDB || indexedDB
    } catch (_error) {
      // Ignore IndexedDB access errors
    }

    try {
      if (!opt.indexedDB || 'file:' === location.protocol) {
        let memoryStore = store.d
        if (!memoryStore) {
          store.d = memoryStore = {}
        }
        // Fallback to in-memory storage
        store.put = (file, data, callback) => {
          memoryStore[file] = data
          setTimeout(() => {
            callback(null, 1)
          }, MEMORY_PUT_DELAY)
        }
        store.get = (file, callback) => {
          setTimeout(() => {
            callback(null, memoryStore[file] || undefinedValue)
          }, MEMORY_GET_DELAY)
        }
        console.log(
          'Warning: No IndexedDB available, falling back to in-memory storage.'
        )
        return store
      }
    } catch (error) {
      // Fallback to memory on any error accessing IndexedDB
      console.warn('IndexedDB error, using in-memory storage:', error)
      let memoryStore = store.d
      if (!memoryStore) {
        store.d = memoryStore = {}
      }
      store.put = (file, data, callback) => {
        memoryStore[file] = data
        setTimeout(() => {
          callback(null, 1)
        }, MEMORY_PUT_DELAY)
      }
      store.get = (file, callback) => {
        setTimeout(() => {
          callback(null, memoryStore[file] || undefinedValue)
        }, MEMORY_GET_DELAY)
      }
      return store
    }

    /**
     * Initializes the IndexedDB database and object store if needed.
     */
    store.start = () => {
      const openRequest = opt.indexedDB.open(opt.file, 1)
      openRequest.onupgradeneeded = (event) => {
        const database = event.target.result
        if (!database.objectStoreNames.contains(opt.file)) {
          database.createObjectStore(opt.file)
        }
      }
      openRequest.onsuccess = () => {
        db = openRequest.result
      }
      openRequest.onerror = (event) => {
        console.error('Database open error:', event.target.error || event)
      }
    }
    store.start()

    /**
     * Stores data in IndexedDB using a readwrite transaction.
     * @param {string} key - Key to store data under.
     * @param {*} data - Data to store.
     * @param {Function} callback - Callback invoked with (error, success).
     */
    store.put = (key, data, callback) => {
      // Shared handlers for put operation to reduce duplication
      const handlePutSuccess = () => {
        callback(null, 1)
      }

      const handlePutError = (event) => {
        const errorMsg = event?.target?.error || event || 'put.tx.error'
        callback(errorMsg)
      }

      const handlePutAbort = (event) => {
        const errorMsg = event || 'put.tx.abort'
        callback(errorMsg)
      }

      if (!db) {
        setTimeout(() => {
          store.put(key, data, callback)
        }, RETRY_DELAY)
        return
      }

      const transaction = db.transaction([opt.file], 'readwrite')
      const objectStore = transaction.objectStore(opt.file)
      const request = objectStore.put(data, `${key}`)

      // Assign shared handlers to all relevant events
      request.onsuccess = handlePutSuccess
      objectStore.onsuccess = handlePutSuccess
      transaction.onsuccess = handlePutSuccess

      request.onabort = handlePutAbort
      objectStore.onabort = handlePutAbort
      transaction.onabort = handlePutAbort

      request.onerror = handlePutError
      objectStore.onerror = handlePutError
      transaction.onerror = handlePutError
    }

    /**
     * Retrieves data from IndexedDB.
     * @param {string} key - Key to retrieve data for.
     * @param {Function} callback - Callback function.
     */
    store.get = (key, callback) => {
      if (!db) {
        setTimeout(() => {
          store.get(key, callback)
        }, 9)
        return
      }
      const transaction = db.transaction([opt.file], 'readonly')
      const objectStore = transaction.objectStore(opt.file)
      const request = objectStore.get(`${key}`)
      request.onsuccess = () => {
        callback(null, request.result)
      }
      request.onabort = (event) => {
        callback(event || 4)
      }
      request.onerror = (event) => {
        callback(event || 5)
      }
    }

    // Reset connection every 15 seconds to work around WebKit bug
    setInterval(() => {
      if (db) {
        db.close()
        db = null
        store.start()
      }
    }, DB_RESET_INTERVAL)

    return store
  }

  if (typeof window !== 'undefined') {
    Store.window = window
    window.RindexedDB = Store
    Store.indexedDB = window.indexedDB // safari bug
  } else {
    try {
      module.exports = Store
    } catch (_e) {}
  }

  try {
    const Gun = Store.window.Gun || require('../gun')
    Gun.on('create', function (root) {
      this.to.next(root)
      root.opt.store = root.opt.store || Store(root.opt)
    })
  } catch (_e) {}
})()
