// biome-ignore lint/correctness/noUnusedVariables: Odd case to be maintained
function USE(arg, req) {
  return req
    ? require(arg)
    : arg.slice
      ? USE[R(arg)]
      : (mod, path) => {
          mod = { exports: {} }
          arg(mod)
          USE[R(path)] = mod.exports
        }
  function R(p) {
    const lastSlash = p.lastIndexOf('/')
    const filename = lastSlash === -1 ? p : p.substring(lastSlash + 1)
    return filename.replace('.js', '')
  }
}
if (typeof module !== 'undefined') {
  // biome-ignore lint/correctness/noInnerDeclarations: Odd case to be maintained
  // biome-ignore lint/correctness/noUnusedVariables: Odd case to be maintained
  var MODULE = module
}
