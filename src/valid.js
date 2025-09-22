;(() => {
  // Valid values are a subset of JSON: null, binary, number (!Infinity), text,
  // or a soul relation. Arrays need special algorithms to handle concurrency,
  // so they are not supported directly. Use an extension that supports them if
  // needed but research their problems first.

  /**
   * Validates if a value is a valid Gun value.
   * Valid values include null, strings, booleans, finite numbers, and soul relations (objects with a single '#' key).
   * @param {*} v - The value to validate.
   * @returns {boolean} - Returns true if the value is valid, false otherwise.
   * @example
   * // Valid values
   * valid(null); // true
   * valid("hello"); // true
   * valid(true); // true
   * valid(42); // true
   * valid({ "#": "soul123" }); // true
   *
   * // Invalid values
   * valid(Infinity); // false
   * valid({}); // false
   * valid([]); // false
   */
  module.exports = (v) => {
    // "deletes", nulling out keys.
    return (
      // Allow null values (used for deletions)
      v === null ||
      // Allow string values
      'string' === typeof v ||
      // Allow boolean values
      'boolean' === typeof v ||
      // Allow finite numbers (exclude Infinity and NaN)
      // we want +/- Infinity to be, but JSON does not support it, sad face.
      // can you guess what v === v checks for? ;)
      // biome-ignore lint/suspicious/noSelfCompare: old code works good like this ...
      ('number' === typeof v && v !== Infinity && v !== -Infinity && v === v) ||
      // Allow soul relations: objects with exactly one key '#' that is a non-empty string
      (!!v &&
        'string' === typeof v['#'] &&
        Object.keys(v).length === 1 &&
        v['#'])
    )
  }
})()
