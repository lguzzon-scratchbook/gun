;(() => {
  var Gun = require('./root')
  Gun.Mesh = require('./mesh')

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
})()
