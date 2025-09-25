;(() => {
  /**
   * @module core
   * Core module that loads all Gun components and exports the Gun constructor.
   */
  const Gun = require('./root')
  require('./chain')
  require('./back')
  require('./put')
  require('./get')
  module.exports = Gun
})()
