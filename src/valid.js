;(() => {
  // Valid values are a subset of JSON: null, binary, number (!Infinity), text,
  // or a soul relation. Arrays need special algorithms to handle concurrency,
  // so they are not supported directly. Use an extension that supports them if
  // needed but research their problems first.

  /**
   * Validates if a value is a valid Gun value.
   * Valid values include null, strings, booleans, finite numbers, and soul relations (objects with a single '#' key).
   * @param {*} value - The value to validate.
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
  module.exports = (value) => {
    // "deletes", nulling out keys.
    return (
      // Allow null values (used for deletions)
      value === null ||
      // Allow string values
      'string' === typeof value ||
      // Allow boolean values
      'boolean' === typeof value ||
      // Allow finite numbers (exclude Infinity and NaN)
      Number.isFinite(value) ||
      // Allow soul relations: objects with exactly one key '#' that is a non-empty string
      (!!value &&
        Object.hasOwn(value, '#') &&
        typeof value['#'] === 'string' &&
        Object.keys(value).length === 1 &&
        value['#'])
    )
  }
})()
