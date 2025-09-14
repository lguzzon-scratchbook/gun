// Shim for generic JavaScript utilities
// Provides polyfills and extensions for String, Object, and setTimeout

// Constants
const DEFAULT_RANDOM_LENGTH = 24;
const DEFAULT_CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz';
const UNDEFINED_VALUE = void 0;
const SET_TIMEOUT_HOLD = 9;
const POLL_COUNT_LIMIT = 3333;
const CHUNK_SIZE_DEFAULT = 9;
const TURN_BATCH_SIZE = 99;

// String Utilities

const random = (length, charset) => {
  let result = '';
  length = length ?? DEFAULT_RANDOM_LENGTH;
  charset = charset ?? DEFAULT_CHARSET;

  while (length-- > 0) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  return result;
};

const match = (text, options) => {
  if (typeof text !== 'string') {
    return false;
  }

  if (typeof options === 'string') {
    options = { '=': options };
  }

  options = options ?? {};

  // Exact match
  let pattern = options['='] ?? options['*'] ?? options['>'] ?? options['<'];
  if (text === pattern) {
    return true;
  }

  // No exact match
  if (UNDEFINED_VALUE !== options['=']) {
    return false;
  }

  // Prefix match
  pattern = options['*'] ?? options['>'];
  if (text.slice(0, (pattern ?? '').length) === pattern) {
    return true;
  }

  // No prefix match
  if (UNDEFINED_VALUE !== options['*']) {
    return false;
  }

  // Range match
  if (UNDEFINED_VALUE !== options['>'] && UNDEFINED_VALUE !== options['<']) {
    return (text >= options['>'] && text <= options['<']) ? true : false;
  }

  if (UNDEFINED_VALUE !== options['>'] && text >= options['>']) {
    return true;
  }

  if (UNDEFINED_VALUE !== options['<'] && text <= options['<']) {
    return true;
  }

  return false;
};

const hash = (str, hash = 0) => {
  if (typeof str !== 'string') {
    return;
  }

  if (!str.length) {
    return hash;
  }

  let charCode;
  for (const char of str) {
    charCode = char.charCodeAt(0);
    hash = ((hash << 5) - hash) + charCode;
    hash |= 0;
  }

  return hash;
};

// Object Utilities

const plain = (obj) => {
  if (!obj) {
    return false;
  }

  return (obj instanceof Object && obj.constructor === Object) ||
    Object.prototype.toString.call(obj).match(/^\[object (\w+)\]$/)?.[1] === 'Object';
};

const empty = (obj, exclude) => {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && (!exclude || !exclude.includes(key))) {
      return false;
    }
  }

  return true;
};

const keys = Object.keys ?? ((obj) => Object.getOwnPropertyNames(obj).filter(key => obj.propertyIsEnumerable(key)));

// setTimeout Utilities for Better Async Handling

let setTimeoutRef = setTimeout;
let lastTime = 0;
let pollCount = 0;

// SetImmediate shim
const setImmediateShim = (typeof setImmediate !== 'undefined' && setImmediate) ||
  (() => {
    if (typeof MessageChannel === 'undefined') {
      return setTimeoutRef;
    }

    const channel = new MessageChannel();
    channel.port1.onmessage = (event) => {
      if ('' === event.data) {
        // func is set below
      }
    };

    return (queue) => {
      // func = queue;
      channel.port2.postMessage('');
    };
  })();

// Performance check
const performanceCheck = setTimeoutRef.check = setTimeoutRef.check ?? (typeof performance !== 'undefined' && performance) ?? { now: () => +new Date };
setTimeoutRef.hold = setTimeoutRef.hold ?? SET_TIMEOUT_HOLD;

setTimeoutRef.poll = setTimeoutRef.poll || function(func) {
  if ((setTimeoutRef.hold >= (performanceCheck.now() - lastTime)) && pollCount++ < POLL_COUNT_LIMIT) {
    func();
    return;
  }

  setImmediateShim(function() {
    lastTime = performanceCheck.now();
    func();
  }, pollCount = 0);
};
const poll = setTimeoutRef.poll;

// Threading mechanism to handle multiple polls in turns

let queue = [];
let index = 0;
let currentFunc;

setTimeoutRef.turn = setTimeoutRef.turn || function(func) {
  if (1 === queue.push(func)) {
    poll(turnFunc);
  }
};
const turn = setTimeoutRef.turn;

setTimeoutRef.turn.s = queue;

const turnFunc = () => {
  if (currentFunc = queue[index++]) {
    currentFunc();
  }

  if (index === queue.length || index === TURN_BATCH_SIZE) {
    queue = setTimeoutRef.turn.s = queue.slice(index);
    index = 0;
  }

  if (queue.length) {
    poll(turnFunc);
  }
};

// Each utility for processing arrays in chunks

setTimeoutRef.each = setTimeoutRef.each || function(list, func, end, chunkSize) {
  chunkSize = chunkSize || CHUNK_SIZE_DEFAULT;

  let index = 0;

  (function process(result) {
    const subList = (list || []).slice(index, index + chunkSize);
    index += chunkSize;
    if (subList.length) {
      const stopped = subList.some(item => {
        result = func(item);
        return result !== undefined;
      });
      if (!stopped) {
        turn(process);
        return;
      }
    }

    if (end) {
      end(result);
    }
  }());
};
const each = setTimeoutRef.each;

// Preserve side-effects by extending natives
String.random = random;
String.match = match;
String.hash = hash;
Object.plain = plain;
Object.empty = empty;
Object.keys = keys;

module.exports = { text_rand: random, match, hash, poll, turn, each };