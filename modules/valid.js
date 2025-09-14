// Valid values are a subset of JSON: null, binary, number (!Infinity), text,
// or a soul relation. Arrays need special algorithms to handle concurrency,
// so they are not supported directly. Use an extension that supports them if
// needed but research their problems first.

/**
 * Validates if a value is acceptable for storage.
 * @param {*} value - The value to validate.
 * @returns {boolean} True if valid.
 */
module.exports = function(value){
  // "deletes", nulling out keys.
  return value === null ||
    "string" === typeof value ||
    "boolean" === typeof value ||
    // we want +/- Infinity to be, but JSON does not support it, sad face.
    // can you guess what value === value checks for? ;)
    ("number" === typeof value && value != Infinity && value != -Infinity && value === value) ||
    (!!value && "string" == typeof value["#"] && Object.keys(value).length === 1 && value["#"]);
}