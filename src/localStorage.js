;(() => {
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
  Gun.on('create', function localStoragePlugin(root) {
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
      disk = localStoragePlugin[opt.prefix] =
        localStoragePlugin[opt.prefix] ||
        new Map(Object.entries(JSON.parse(item) || {})) // Load persisted data from localStorage (blocking, but limited to 5MB)
      size = (item || '').length
    } catch (_e) {
      disk = localStoragePlugin[opt.prefix] = new Map()
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
})()
