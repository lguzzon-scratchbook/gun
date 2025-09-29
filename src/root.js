;(() => {
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

  require('./shim')
  Gun.valid = require('./valid')
  Gun.state = require('./state')
  Gun.on = require('./onto')
  Gun.dup = require('./dup')
  Gun.ask = require('./ask')

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
  if (typeof global !== 'undefined') {
    global.Gun = Gun
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
})()
