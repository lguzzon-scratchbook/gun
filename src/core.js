;(() => {
  /**
   * @module core
   * Core module that loads all Gun components and exports the Gun constructor.
   */
  // Load the root Gun constructor and base functionality
  const Gun = require('./root')
  // Load chain methods for data manipulation and traversal
  require('./chain')
  // Load backend and storage integration functionality
  require('./back')
  // Load put operations for data writing
  require('./put')
  // Load get operations for data reading
  require('./get')
  // Export the Gun constructor as the module's main export
  module.exports = Gun
})()
