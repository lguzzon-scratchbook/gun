/**
 * Polyfill for CommonJS require or define module loader.
 * @param {any} arg - Module path or function
 * @param {boolean} req - Whether to require or define
 * @returns {any} - Required module or define function
 */
// biome-ignore lint/correctness/noUnusedVariables: Odd case to be maintained
function USE(arg, req) {
  return req
    ? require(arg)
    : arg.slice
      ? USE[resolveModuleName(arg)]
      : (cache, path) => {
          const mod = { exports: {} }
          arg(mod)
          cache[resolveModuleName(path)] = mod.exports
        }
  /**
   * Resolves module name from path by taking filename without extension.
   * @param {string} p - Module path
   * @returns {string} - Resolved module name
   */
  function resolveModuleName(p) {
    const lastSlash = p.lastIndexOf('/')
    const filename = lastSlash === -1 ? p : p.substring(lastSlash + 1)
    return filename.replace('.js', '')
  }
}
if (typeof module !== 'undefined') {
  MODULE = module
}
