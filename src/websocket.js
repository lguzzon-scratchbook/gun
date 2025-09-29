;(() => {
  const Gun = require('./root')
  Gun.Mesh = require('./mesh')

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
      const filteredPeers = peers.filter(
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
})()
