;(() => {
  /**
   * @module dup
   * Module for tracking duplicate IDs with automatic cleanup.
   */
  require('./shim')
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
     * Checks if an ID is tracked, and updates its timestamp if so.
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
})()
