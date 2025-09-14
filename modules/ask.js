const { text_rand } = require('./shim.js');

/**
 * Handles request/response messages for acknowledgments.
 * @param {Function|string|Object} callback - Callback function or message ID.
 * @param {Object} [options] - Additional parameters.
 * @returns {string|boolean} Message ID or true if successful.
 */
module.exports = function ask(callback, options) {
    if (!this.on) return;

    const timeout = (this.opt || {}).lack || 9000;

    if (typeof callback !== 'function') {
        if (!callback) return;
        const messageId = callback['#'] || callback;
        let listener = (this.tag || '')[messageId];
        if (!listener) return;
        if (options) {
            listener = this.on(messageId, options);
            clearTimeout(listener.err);
            listener.err = setTimeout(() => listener.off(), timeout);
        }
        return true;
    }

    const id = (options && options['#']) || randomString(9);
    if (!callback) return id;

    const listener = this.on(id, callback, options);
    listener.err = listener.err || setTimeout(() => {
        listener.off();
        listener.next({ err: "Error: No ACK yet.", lack: true });
    }, timeout);

    return id;
};

/**
 * Generates a random string of specified length.
 * @param {number} [length=9] - Length of the random string.
 * @returns {string} Random string.
 */
const randomString = text_rand || function (length = 9) { return Math.random().toString(36).slice(2, 2 + length) };