;(() => {
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
})()
