(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("lodash"));
	else if(typeof define === 'function' && define.amd)
		define(["lodash"], factory);
	else if(typeof exports === 'object')
		exports["mops"] = factory(require("lodash"));
	else
		root["mops"] = factory(root["_"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.Queue = __webpack_require__(1);
	exports.Action = __webpack_require__(71);
	exports.Context = __webpack_require__(28);
	exports.Error = __webpack_require__(72);
	exports.Checked = __webpack_require__(29);
	exports.Operation = __webpack_require__(70);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	var _require = __webpack_require__(2);

	var isFunction = _require.isFunction;
	var isUndefined = _require.isUndefined;
	var toArray = _require.toArray;
	var partialRight = _require.partialRight;


	var invariant = __webpack_require__(3);
	var Promise = __webpack_require__(5).Promise;
	var mopsSymbol = __webpack_require__(9);
	var Context = __webpack_require__(28);
	var Action = __webpack_require__(71);

	module.exports = Queue;

	/**
	 * @class
	 * @param {Context} [context]
	 */
	function Queue(context) {
	    Object.defineProperty(this, mopsSymbol.QUEUE, { value: [], writable: true });
	    Object.defineProperty(this, mopsSymbol.CONTEXT, { value: new Context(context) });
	}

	/**
	 * @param {mops.Action|function} onFulfilled [description]
	 * @param {mops.Action|function} onRejected  [description]
	 * @param {...*} [args]
	 * @returns {mops.Queue}
	 */
	Queue.prototype.then = function (onFulfilled, onRejected) {
	    for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
	        args[_key - 2] = arguments[_key];
	    }

	    if (!isUndefined(onRejected) && !isFunction(onRejected)) {
	        args.unshift(onRejected);
	        onRejected = undefined;
	    }

	    var isErrored = Boolean(!onFulfilled && onRejected || onFulfilled === onRejected);

	    if (onFulfilled) {
	        append(this, { args: args, isErrored: isErrored, action: onFulfilled });
	    }

	    if (onRejected) {
	        append(this, { args: args, isErrored: isErrored, action: onRejected, rejected: true });
	    }

	    return this;
	};

	/**
	 * @param {mops.Action|function} action
	 * @param {...*} [args]
	 * @returns {mops.Queue}
	 */
	Queue.prototype.catch = function (action) {
	    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
	        args[_key2 - 1] = arguments[_key2];
	    }

	    return this.then.apply(this, [null, action].concat(args));
	};

	/**
	 * @param {mops.Action|function} action
	 * @param {...*} [args]
	 * @returns {mops.Queue}
	 */
	Queue.prototype.always = function (action) {
	    for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
	        args[_key3 - 1] = arguments[_key3];
	    }

	    return this.then.apply(this, [action, action].concat(args));
	};

	/**
	 * @returns {Promise}
	 */
	Queue.prototype.start = function () {
	    var context = this[mopsSymbol.CONTEXT];
	    var tasks = this[mopsSymbol.QUEUE];
	    this[mopsSymbol.QUEUE] = [];

	    var promise = Promise.resolve();

	    for (var i = 0; i < tasks.length; i++) {
	        var _task$action;

	        var task = tasks[i];
	        var action = task.isErrored ? partialRight.apply(undefined, [task.action.bind(context)].concat(_toConsumableArray(toArray(task.args)))) : (_task$action = task.action).bind.apply(_task$action, [context].concat(_toConsumableArray(toArray(task.args))));

	        promise = task.rejected ? promise.then(Action.resultResolve, action) : promise.then(action, Action.resultReject);
	    }

	    return promise;
	};

	/**
	 * @param {Queue} queue
	 * @param {Object} params
	 * @param {function} params.action
	 * @returns {Queue}
	 * @throws Add only possible function
	 */
	function append(queue, params) {
	    invariant(isFunction(params.action), 'Add only possible function');

	    if (!params.action.hasOwnProperty(mopsSymbol.SUPER)) {
	        params.action = new Action(params.action);
	    }

	    queue[mopsSymbol.QUEUE].push(params);
	    return queue;
	}

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2013-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 */

	'use strict';

	/**
	 * Use invariant() to assert state which your program assumes to be true.
	 *
	 * Provide sprintf-style format (only %s is supported) and arguments
	 * to provide information about what broke and what you were
	 * expecting.
	 *
	 * The invariant message will be stripped in production, but the invariant
	 * will remain to ensure logic does not differ in production.
	 */

	var invariant = function(condition, format, a, b, c, d, e, f) {
	  if (process.env.NODE_ENV !== 'production') {
	    if (format === undefined) {
	      throw new Error('invariant requires an error message argument');
	    }
	  }

	  if (!condition) {
	    var error;
	    if (format === undefined) {
	      error = new Error(
	        'Minified exception occurred; use the non-minified dev environment ' +
	        'for the full error message and additional helpful warnings.'
	      );
	    } else {
	      var args = [a, b, c, d, e, f];
	      var argIndex = 0;
	      error = new Error(
	        format.replace(/%s/g, function() { return args[argIndex++]; })
	      );
	      error.name = 'Invariant Violation';
	    }

	    error.framesToPop = 1; // we don't care about invariant's own frame
	    throw error;
	  }
	};

	module.exports = invariant;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ },
/* 4 */
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var require;var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(process, global, module) {/*!
	 * @overview es6-promise - a tiny implementation of Promises/A+.
	 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
	 * @license   Licensed under MIT license
	 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
	 * @version   3.2.1
	 */

	(function() {
	    "use strict";
	    function lib$es6$promise$utils$$objectOrFunction(x) {
	      return typeof x === 'function' || (typeof x === 'object' && x !== null);
	    }

	    function lib$es6$promise$utils$$isFunction(x) {
	      return typeof x === 'function';
	    }

	    function lib$es6$promise$utils$$isMaybeThenable(x) {
	      return typeof x === 'object' && x !== null;
	    }

	    var lib$es6$promise$utils$$_isArray;
	    if (!Array.isArray) {
	      lib$es6$promise$utils$$_isArray = function (x) {
	        return Object.prototype.toString.call(x) === '[object Array]';
	      };
	    } else {
	      lib$es6$promise$utils$$_isArray = Array.isArray;
	    }

	    var lib$es6$promise$utils$$isArray = lib$es6$promise$utils$$_isArray;
	    var lib$es6$promise$asap$$len = 0;
	    var lib$es6$promise$asap$$vertxNext;
	    var lib$es6$promise$asap$$customSchedulerFn;

	    var lib$es6$promise$asap$$asap = function asap(callback, arg) {
	      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len] = callback;
	      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len + 1] = arg;
	      lib$es6$promise$asap$$len += 2;
	      if (lib$es6$promise$asap$$len === 2) {
	        // If len is 2, that means that we need to schedule an async flush.
	        // If additional callbacks are queued before the queue is flushed, they
	        // will be processed by this flush that we are scheduling.
	        if (lib$es6$promise$asap$$customSchedulerFn) {
	          lib$es6$promise$asap$$customSchedulerFn(lib$es6$promise$asap$$flush);
	        } else {
	          lib$es6$promise$asap$$scheduleFlush();
	        }
	      }
	    }

	    function lib$es6$promise$asap$$setScheduler(scheduleFn) {
	      lib$es6$promise$asap$$customSchedulerFn = scheduleFn;
	    }

	    function lib$es6$promise$asap$$setAsap(asapFn) {
	      lib$es6$promise$asap$$asap = asapFn;
	    }

	    var lib$es6$promise$asap$$browserWindow = (typeof window !== 'undefined') ? window : undefined;
	    var lib$es6$promise$asap$$browserGlobal = lib$es6$promise$asap$$browserWindow || {};
	    var lib$es6$promise$asap$$BrowserMutationObserver = lib$es6$promise$asap$$browserGlobal.MutationObserver || lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;
	    var lib$es6$promise$asap$$isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

	    // test for web worker but not in IE10
	    var lib$es6$promise$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
	      typeof importScripts !== 'undefined' &&
	      typeof MessageChannel !== 'undefined';

	    // node
	    function lib$es6$promise$asap$$useNextTick() {
	      // node version 0.10.x displays a deprecation warning when nextTick is used recursively
	      // see https://github.com/cujojs/when/issues/410 for details
	      return function() {
	        process.nextTick(lib$es6$promise$asap$$flush);
	      };
	    }

	    // vertx
	    function lib$es6$promise$asap$$useVertxTimer() {
	      return function() {
	        lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);
	      };
	    }

	    function lib$es6$promise$asap$$useMutationObserver() {
	      var iterations = 0;
	      var observer = new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);
	      var node = document.createTextNode('');
	      observer.observe(node, { characterData: true });

	      return function() {
	        node.data = (iterations = ++iterations % 2);
	      };
	    }

	    // web worker
	    function lib$es6$promise$asap$$useMessageChannel() {
	      var channel = new MessageChannel();
	      channel.port1.onmessage = lib$es6$promise$asap$$flush;
	      return function () {
	        channel.port2.postMessage(0);
	      };
	    }

	    function lib$es6$promise$asap$$useSetTimeout() {
	      return function() {
	        setTimeout(lib$es6$promise$asap$$flush, 1);
	      };
	    }

	    var lib$es6$promise$asap$$queue = new Array(1000);
	    function lib$es6$promise$asap$$flush() {
	      for (var i = 0; i < lib$es6$promise$asap$$len; i+=2) {
	        var callback = lib$es6$promise$asap$$queue[i];
	        var arg = lib$es6$promise$asap$$queue[i+1];

	        callback(arg);

	        lib$es6$promise$asap$$queue[i] = undefined;
	        lib$es6$promise$asap$$queue[i+1] = undefined;
	      }

	      lib$es6$promise$asap$$len = 0;
	    }

	    function lib$es6$promise$asap$$attemptVertx() {
	      try {
	        var r = require;
	        var vertx = __webpack_require__(7);
	        lib$es6$promise$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
	        return lib$es6$promise$asap$$useVertxTimer();
	      } catch(e) {
	        return lib$es6$promise$asap$$useSetTimeout();
	      }
	    }

	    var lib$es6$promise$asap$$scheduleFlush;
	    // Decide what async method to use to triggering processing of queued callbacks:
	    if (lib$es6$promise$asap$$isNode) {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useNextTick();
	    } else if (lib$es6$promise$asap$$BrowserMutationObserver) {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMutationObserver();
	    } else if (lib$es6$promise$asap$$isWorker) {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMessageChannel();
	    } else if (lib$es6$promise$asap$$browserWindow === undefined && "function" === 'function') {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$attemptVertx();
	    } else {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useSetTimeout();
	    }
	    function lib$es6$promise$then$$then(onFulfillment, onRejection) {
	      var parent = this;

	      var child = new this.constructor(lib$es6$promise$$internal$$noop);

	      if (child[lib$es6$promise$$internal$$PROMISE_ID] === undefined) {
	        lib$es6$promise$$internal$$makePromise(child);
	      }

	      var state = parent._state;

	      if (state) {
	        var callback = arguments[state - 1];
	        lib$es6$promise$asap$$asap(function(){
	          lib$es6$promise$$internal$$invokeCallback(state, child, callback, parent._result);
	        });
	      } else {
	        lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection);
	      }

	      return child;
	    }
	    var lib$es6$promise$then$$default = lib$es6$promise$then$$then;
	    function lib$es6$promise$promise$resolve$$resolve(object) {
	      /*jshint validthis:true */
	      var Constructor = this;

	      if (object && typeof object === 'object' && object.constructor === Constructor) {
	        return object;
	      }

	      var promise = new Constructor(lib$es6$promise$$internal$$noop);
	      lib$es6$promise$$internal$$resolve(promise, object);
	      return promise;
	    }
	    var lib$es6$promise$promise$resolve$$default = lib$es6$promise$promise$resolve$$resolve;
	    var lib$es6$promise$$internal$$PROMISE_ID = Math.random().toString(36).substring(16);

	    function lib$es6$promise$$internal$$noop() {}

	    var lib$es6$promise$$internal$$PENDING   = void 0;
	    var lib$es6$promise$$internal$$FULFILLED = 1;
	    var lib$es6$promise$$internal$$REJECTED  = 2;

	    var lib$es6$promise$$internal$$GET_THEN_ERROR = new lib$es6$promise$$internal$$ErrorObject();

	    function lib$es6$promise$$internal$$selfFulfillment() {
	      return new TypeError("You cannot resolve a promise with itself");
	    }

	    function lib$es6$promise$$internal$$cannotReturnOwn() {
	      return new TypeError('A promises callback cannot return that same promise.');
	    }

	    function lib$es6$promise$$internal$$getThen(promise) {
	      try {
	        return promise.then;
	      } catch(error) {
	        lib$es6$promise$$internal$$GET_THEN_ERROR.error = error;
	        return lib$es6$promise$$internal$$GET_THEN_ERROR;
	      }
	    }

	    function lib$es6$promise$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
	      try {
	        then.call(value, fulfillmentHandler, rejectionHandler);
	      } catch(e) {
	        return e;
	      }
	    }

	    function lib$es6$promise$$internal$$handleForeignThenable(promise, thenable, then) {
	       lib$es6$promise$asap$$asap(function(promise) {
	        var sealed = false;
	        var error = lib$es6$promise$$internal$$tryThen(then, thenable, function(value) {
	          if (sealed) { return; }
	          sealed = true;
	          if (thenable !== value) {
	            lib$es6$promise$$internal$$resolve(promise, value);
	          } else {
	            lib$es6$promise$$internal$$fulfill(promise, value);
	          }
	        }, function(reason) {
	          if (sealed) { return; }
	          sealed = true;

	          lib$es6$promise$$internal$$reject(promise, reason);
	        }, 'Settle: ' + (promise._label || ' unknown promise'));

	        if (!sealed && error) {
	          sealed = true;
	          lib$es6$promise$$internal$$reject(promise, error);
	        }
	      }, promise);
	    }

	    function lib$es6$promise$$internal$$handleOwnThenable(promise, thenable) {
	      if (thenable._state === lib$es6$promise$$internal$$FULFILLED) {
	        lib$es6$promise$$internal$$fulfill(promise, thenable._result);
	      } else if (thenable._state === lib$es6$promise$$internal$$REJECTED) {
	        lib$es6$promise$$internal$$reject(promise, thenable._result);
	      } else {
	        lib$es6$promise$$internal$$subscribe(thenable, undefined, function(value) {
	          lib$es6$promise$$internal$$resolve(promise, value);
	        }, function(reason) {
	          lib$es6$promise$$internal$$reject(promise, reason);
	        });
	      }
	    }

	    function lib$es6$promise$$internal$$handleMaybeThenable(promise, maybeThenable, then) {
	      if (maybeThenable.constructor === promise.constructor &&
	          then === lib$es6$promise$then$$default &&
	          constructor.resolve === lib$es6$promise$promise$resolve$$default) {
	        lib$es6$promise$$internal$$handleOwnThenable(promise, maybeThenable);
	      } else {
	        if (then === lib$es6$promise$$internal$$GET_THEN_ERROR) {
	          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$GET_THEN_ERROR.error);
	        } else if (then === undefined) {
	          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
	        } else if (lib$es6$promise$utils$$isFunction(then)) {
	          lib$es6$promise$$internal$$handleForeignThenable(promise, maybeThenable, then);
	        } else {
	          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
	        }
	      }
	    }

	    function lib$es6$promise$$internal$$resolve(promise, value) {
	      if (promise === value) {
	        lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$selfFulfillment());
	      } else if (lib$es6$promise$utils$$objectOrFunction(value)) {
	        lib$es6$promise$$internal$$handleMaybeThenable(promise, value, lib$es6$promise$$internal$$getThen(value));
	      } else {
	        lib$es6$promise$$internal$$fulfill(promise, value);
	      }
	    }

	    function lib$es6$promise$$internal$$publishRejection(promise) {
	      if (promise._onerror) {
	        promise._onerror(promise._result);
	      }

	      lib$es6$promise$$internal$$publish(promise);
	    }

	    function lib$es6$promise$$internal$$fulfill(promise, value) {
	      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }

	      promise._result = value;
	      promise._state = lib$es6$promise$$internal$$FULFILLED;

	      if (promise._subscribers.length !== 0) {
	        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, promise);
	      }
	    }

	    function lib$es6$promise$$internal$$reject(promise, reason) {
	      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }
	      promise._state = lib$es6$promise$$internal$$REJECTED;
	      promise._result = reason;

	      lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publishRejection, promise);
	    }

	    function lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
	      var subscribers = parent._subscribers;
	      var length = subscribers.length;

	      parent._onerror = null;

	      subscribers[length] = child;
	      subscribers[length + lib$es6$promise$$internal$$FULFILLED] = onFulfillment;
	      subscribers[length + lib$es6$promise$$internal$$REJECTED]  = onRejection;

	      if (length === 0 && parent._state) {
	        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, parent);
	      }
	    }

	    function lib$es6$promise$$internal$$publish(promise) {
	      var subscribers = promise._subscribers;
	      var settled = promise._state;

	      if (subscribers.length === 0) { return; }

	      var child, callback, detail = promise._result;

	      for (var i = 0; i < subscribers.length; i += 3) {
	        child = subscribers[i];
	        callback = subscribers[i + settled];

	        if (child) {
	          lib$es6$promise$$internal$$invokeCallback(settled, child, callback, detail);
	        } else {
	          callback(detail);
	        }
	      }

	      promise._subscribers.length = 0;
	    }

	    function lib$es6$promise$$internal$$ErrorObject() {
	      this.error = null;
	    }

	    var lib$es6$promise$$internal$$TRY_CATCH_ERROR = new lib$es6$promise$$internal$$ErrorObject();

	    function lib$es6$promise$$internal$$tryCatch(callback, detail) {
	      try {
	        return callback(detail);
	      } catch(e) {
	        lib$es6$promise$$internal$$TRY_CATCH_ERROR.error = e;
	        return lib$es6$promise$$internal$$TRY_CATCH_ERROR;
	      }
	    }

	    function lib$es6$promise$$internal$$invokeCallback(settled, promise, callback, detail) {
	      var hasCallback = lib$es6$promise$utils$$isFunction(callback),
	          value, error, succeeded, failed;

	      if (hasCallback) {
	        value = lib$es6$promise$$internal$$tryCatch(callback, detail);

	        if (value === lib$es6$promise$$internal$$TRY_CATCH_ERROR) {
	          failed = true;
	          error = value.error;
	          value = null;
	        } else {
	          succeeded = true;
	        }

	        if (promise === value) {
	          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$cannotReturnOwn());
	          return;
	        }

	      } else {
	        value = detail;
	        succeeded = true;
	      }

	      if (promise._state !== lib$es6$promise$$internal$$PENDING) {
	        // noop
	      } else if (hasCallback && succeeded) {
	        lib$es6$promise$$internal$$resolve(promise, value);
	      } else if (failed) {
	        lib$es6$promise$$internal$$reject(promise, error);
	      } else if (settled === lib$es6$promise$$internal$$FULFILLED) {
	        lib$es6$promise$$internal$$fulfill(promise, value);
	      } else if (settled === lib$es6$promise$$internal$$REJECTED) {
	        lib$es6$promise$$internal$$reject(promise, value);
	      }
	    }

	    function lib$es6$promise$$internal$$initializePromise(promise, resolver) {
	      try {
	        resolver(function resolvePromise(value){
	          lib$es6$promise$$internal$$resolve(promise, value);
	        }, function rejectPromise(reason) {
	          lib$es6$promise$$internal$$reject(promise, reason);
	        });
	      } catch(e) {
	        lib$es6$promise$$internal$$reject(promise, e);
	      }
	    }

	    var lib$es6$promise$$internal$$id = 0;
	    function lib$es6$promise$$internal$$nextId() {
	      return lib$es6$promise$$internal$$id++;
	    }

	    function lib$es6$promise$$internal$$makePromise(promise) {
	      promise[lib$es6$promise$$internal$$PROMISE_ID] = lib$es6$promise$$internal$$id++;
	      promise._state = undefined;
	      promise._result = undefined;
	      promise._subscribers = [];
	    }

	    function lib$es6$promise$promise$all$$all(entries) {
	      return new lib$es6$promise$enumerator$$default(this, entries).promise;
	    }
	    var lib$es6$promise$promise$all$$default = lib$es6$promise$promise$all$$all;
	    function lib$es6$promise$promise$race$$race(entries) {
	      /*jshint validthis:true */
	      var Constructor = this;

	      if (!lib$es6$promise$utils$$isArray(entries)) {
	        return new Constructor(function(resolve, reject) {
	          reject(new TypeError('You must pass an array to race.'));
	        });
	      } else {
	        return new Constructor(function(resolve, reject) {
	          var length = entries.length;
	          for (var i = 0; i < length; i++) {
	            Constructor.resolve(entries[i]).then(resolve, reject);
	          }
	        });
	      }
	    }
	    var lib$es6$promise$promise$race$$default = lib$es6$promise$promise$race$$race;
	    function lib$es6$promise$promise$reject$$reject(reason) {
	      /*jshint validthis:true */
	      var Constructor = this;
	      var promise = new Constructor(lib$es6$promise$$internal$$noop);
	      lib$es6$promise$$internal$$reject(promise, reason);
	      return promise;
	    }
	    var lib$es6$promise$promise$reject$$default = lib$es6$promise$promise$reject$$reject;


	    function lib$es6$promise$promise$$needsResolver() {
	      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
	    }

	    function lib$es6$promise$promise$$needsNew() {
	      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
	    }

	    var lib$es6$promise$promise$$default = lib$es6$promise$promise$$Promise;
	    /**
	      Promise objects represent the eventual result of an asynchronous operation. The
	      primary way of interacting with a promise is through its `then` method, which
	      registers callbacks to receive either a promise's eventual value or the reason
	      why the promise cannot be fulfilled.

	      Terminology
	      -----------

	      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
	      - `thenable` is an object or function that defines a `then` method.
	      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
	      - `exception` is a value that is thrown using the throw statement.
	      - `reason` is a value that indicates why a promise was rejected.
	      - `settled` the final resting state of a promise, fulfilled or rejected.

	      A promise can be in one of three states: pending, fulfilled, or rejected.

	      Promises that are fulfilled have a fulfillment value and are in the fulfilled
	      state.  Promises that are rejected have a rejection reason and are in the
	      rejected state.  A fulfillment value is never a thenable.

	      Promises can also be said to *resolve* a value.  If this value is also a
	      promise, then the original promise's settled state will match the value's
	      settled state.  So a promise that *resolves* a promise that rejects will
	      itself reject, and a promise that *resolves* a promise that fulfills will
	      itself fulfill.


	      Basic Usage:
	      ------------

	      ```js
	      var promise = new Promise(function(resolve, reject) {
	        // on success
	        resolve(value);

	        // on failure
	        reject(reason);
	      });

	      promise.then(function(value) {
	        // on fulfillment
	      }, function(reason) {
	        // on rejection
	      });
	      ```

	      Advanced Usage:
	      ---------------

	      Promises shine when abstracting away asynchronous interactions such as
	      `XMLHttpRequest`s.

	      ```js
	      function getJSON(url) {
	        return new Promise(function(resolve, reject){
	          var xhr = new XMLHttpRequest();

	          xhr.open('GET', url);
	          xhr.onreadystatechange = handler;
	          xhr.responseType = 'json';
	          xhr.setRequestHeader('Accept', 'application/json');
	          xhr.send();

	          function handler() {
	            if (this.readyState === this.DONE) {
	              if (this.status === 200) {
	                resolve(this.response);
	              } else {
	                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
	              }
	            }
	          };
	        });
	      }

	      getJSON('/posts.json').then(function(json) {
	        // on fulfillment
	      }, function(reason) {
	        // on rejection
	      });
	      ```

	      Unlike callbacks, promises are great composable primitives.

	      ```js
	      Promise.all([
	        getJSON('/posts'),
	        getJSON('/comments')
	      ]).then(function(values){
	        values[0] // => postsJSON
	        values[1] // => commentsJSON

	        return values;
	      });
	      ```

	      @class Promise
	      @param {function} resolver
	      Useful for tooling.
	      @constructor
	    */
	    function lib$es6$promise$promise$$Promise(resolver) {
	      this[lib$es6$promise$$internal$$PROMISE_ID] = lib$es6$promise$$internal$$nextId();
	      this._result = this._state = undefined;
	      this._subscribers = [];

	      if (lib$es6$promise$$internal$$noop !== resolver) {
	        typeof resolver !== 'function' && lib$es6$promise$promise$$needsResolver();
	        this instanceof lib$es6$promise$promise$$Promise ? lib$es6$promise$$internal$$initializePromise(this, resolver) : lib$es6$promise$promise$$needsNew();
	      }
	    }

	    lib$es6$promise$promise$$Promise.all = lib$es6$promise$promise$all$$default;
	    lib$es6$promise$promise$$Promise.race = lib$es6$promise$promise$race$$default;
	    lib$es6$promise$promise$$Promise.resolve = lib$es6$promise$promise$resolve$$default;
	    lib$es6$promise$promise$$Promise.reject = lib$es6$promise$promise$reject$$default;
	    lib$es6$promise$promise$$Promise._setScheduler = lib$es6$promise$asap$$setScheduler;
	    lib$es6$promise$promise$$Promise._setAsap = lib$es6$promise$asap$$setAsap;
	    lib$es6$promise$promise$$Promise._asap = lib$es6$promise$asap$$asap;

	    lib$es6$promise$promise$$Promise.prototype = {
	      constructor: lib$es6$promise$promise$$Promise,

	    /**
	      The primary way of interacting with a promise is through its `then` method,
	      which registers callbacks to receive either a promise's eventual value or the
	      reason why the promise cannot be fulfilled.

	      ```js
	      findUser().then(function(user){
	        // user is available
	      }, function(reason){
	        // user is unavailable, and you are given the reason why
	      });
	      ```

	      Chaining
	      --------

	      The return value of `then` is itself a promise.  This second, 'downstream'
	      promise is resolved with the return value of the first promise's fulfillment
	      or rejection handler, or rejected if the handler throws an exception.

	      ```js
	      findUser().then(function (user) {
	        return user.name;
	      }, function (reason) {
	        return 'default name';
	      }).then(function (userName) {
	        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
	        // will be `'default name'`
	      });

	      findUser().then(function (user) {
	        throw new Error('Found user, but still unhappy');
	      }, function (reason) {
	        throw new Error('`findUser` rejected and we're unhappy');
	      }).then(function (value) {
	        // never reached
	      }, function (reason) {
	        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
	        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
	      });
	      ```
	      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

	      ```js
	      findUser().then(function (user) {
	        throw new PedagogicalException('Upstream error');
	      }).then(function (value) {
	        // never reached
	      }).then(function (value) {
	        // never reached
	      }, function (reason) {
	        // The `PedgagocialException` is propagated all the way down to here
	      });
	      ```

	      Assimilation
	      ------------

	      Sometimes the value you want to propagate to a downstream promise can only be
	      retrieved asynchronously. This can be achieved by returning a promise in the
	      fulfillment or rejection handler. The downstream promise will then be pending
	      until the returned promise is settled. This is called *assimilation*.

	      ```js
	      findUser().then(function (user) {
	        return findCommentsByAuthor(user);
	      }).then(function (comments) {
	        // The user's comments are now available
	      });
	      ```

	      If the assimliated promise rejects, then the downstream promise will also reject.

	      ```js
	      findUser().then(function (user) {
	        return findCommentsByAuthor(user);
	      }).then(function (comments) {
	        // If `findCommentsByAuthor` fulfills, we'll have the value here
	      }, function (reason) {
	        // If `findCommentsByAuthor` rejects, we'll have the reason here
	      });
	      ```

	      Simple Example
	      --------------

	      Synchronous Example

	      ```javascript
	      var result;

	      try {
	        result = findResult();
	        // success
	      } catch(reason) {
	        // failure
	      }
	      ```

	      Errback Example

	      ```js
	      findResult(function(result, err){
	        if (err) {
	          // failure
	        } else {
	          // success
	        }
	      });
	      ```

	      Promise Example;

	      ```javascript
	      findResult().then(function(result){
	        // success
	      }, function(reason){
	        // failure
	      });
	      ```

	      Advanced Example
	      --------------

	      Synchronous Example

	      ```javascript
	      var author, books;

	      try {
	        author = findAuthor();
	        books  = findBooksByAuthor(author);
	        // success
	      } catch(reason) {
	        // failure
	      }
	      ```

	      Errback Example

	      ```js

	      function foundBooks(books) {

	      }

	      function failure(reason) {

	      }

	      findAuthor(function(author, err){
	        if (err) {
	          failure(err);
	          // failure
	        } else {
	          try {
	            findBoooksByAuthor(author, function(books, err) {
	              if (err) {
	                failure(err);
	              } else {
	                try {
	                  foundBooks(books);
	                } catch(reason) {
	                  failure(reason);
	                }
	              }
	            });
	          } catch(error) {
	            failure(err);
	          }
	          // success
	        }
	      });
	      ```

	      Promise Example;

	      ```javascript
	      findAuthor().
	        then(findBooksByAuthor).
	        then(function(books){
	          // found books
	      }).catch(function(reason){
	        // something went wrong
	      });
	      ```

	      @method then
	      @param {Function} onFulfilled
	      @param {Function} onRejected
	      Useful for tooling.
	      @return {Promise}
	    */
	      then: lib$es6$promise$then$$default,

	    /**
	      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
	      as the catch block of a try/catch statement.

	      ```js
	      function findAuthor(){
	        throw new Error('couldn't find that author');
	      }

	      // synchronous
	      try {
	        findAuthor();
	      } catch(reason) {
	        // something went wrong
	      }

	      // async with promises
	      findAuthor().catch(function(reason){
	        // something went wrong
	      });
	      ```

	      @method catch
	      @param {Function} onRejection
	      Useful for tooling.
	      @return {Promise}
	    */
	      'catch': function(onRejection) {
	        return this.then(null, onRejection);
	      }
	    };
	    var lib$es6$promise$enumerator$$default = lib$es6$promise$enumerator$$Enumerator;
	    function lib$es6$promise$enumerator$$Enumerator(Constructor, input) {
	      this._instanceConstructor = Constructor;
	      this.promise = new Constructor(lib$es6$promise$$internal$$noop);

	      if (!this.promise[lib$es6$promise$$internal$$PROMISE_ID]) {
	        lib$es6$promise$$internal$$makePromise(this.promise);
	      }

	      if (lib$es6$promise$utils$$isArray(input)) {
	        this._input     = input;
	        this.length     = input.length;
	        this._remaining = input.length;

	        this._result = new Array(this.length);

	        if (this.length === 0) {
	          lib$es6$promise$$internal$$fulfill(this.promise, this._result);
	        } else {
	          this.length = this.length || 0;
	          this._enumerate();
	          if (this._remaining === 0) {
	            lib$es6$promise$$internal$$fulfill(this.promise, this._result);
	          }
	        }
	      } else {
	        lib$es6$promise$$internal$$reject(this.promise, lib$es6$promise$enumerator$$validationError());
	      }
	    }

	    function lib$es6$promise$enumerator$$validationError() {
	      return new Error('Array Methods must be provided an Array');
	    }

	    lib$es6$promise$enumerator$$Enumerator.prototype._enumerate = function() {
	      var length  = this.length;
	      var input   = this._input;

	      for (var i = 0; this._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
	        this._eachEntry(input[i], i);
	      }
	    };

	    lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
	      var c = this._instanceConstructor;
	      var resolve = c.resolve;

	      if (resolve === lib$es6$promise$promise$resolve$$default) {
	        var then = lib$es6$promise$$internal$$getThen(entry);

	        if (then === lib$es6$promise$then$$default &&
	            entry._state !== lib$es6$promise$$internal$$PENDING) {
	          this._settledAt(entry._state, i, entry._result);
	        } else if (typeof then !== 'function') {
	          this._remaining--;
	          this._result[i] = entry;
	        } else if (c === lib$es6$promise$promise$$default) {
	          var promise = new c(lib$es6$promise$$internal$$noop);
	          lib$es6$promise$$internal$$handleMaybeThenable(promise, entry, then);
	          this._willSettleAt(promise, i);
	        } else {
	          this._willSettleAt(new c(function(resolve) { resolve(entry); }), i);
	        }
	      } else {
	        this._willSettleAt(resolve(entry), i);
	      }
	    };

	    lib$es6$promise$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
	      var promise = this.promise;

	      if (promise._state === lib$es6$promise$$internal$$PENDING) {
	        this._remaining--;

	        if (state === lib$es6$promise$$internal$$REJECTED) {
	          lib$es6$promise$$internal$$reject(promise, value);
	        } else {
	          this._result[i] = value;
	        }
	      }

	      if (this._remaining === 0) {
	        lib$es6$promise$$internal$$fulfill(promise, this._result);
	      }
	    };

	    lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
	      var enumerator = this;

	      lib$es6$promise$$internal$$subscribe(promise, undefined, function(value) {
	        enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED, i, value);
	      }, function(reason) {
	        enumerator._settledAt(lib$es6$promise$$internal$$REJECTED, i, reason);
	      });
	    };
	    function lib$es6$promise$polyfill$$polyfill() {
	      var local;

	      if (typeof global !== 'undefined') {
	          local = global;
	      } else if (typeof self !== 'undefined') {
	          local = self;
	      } else {
	          try {
	              local = Function('return this')();
	          } catch (e) {
	              throw new Error('polyfill failed because global object is unavailable in this environment');
	          }
	      }

	      var P = local.Promise;

	      if (P && Object.prototype.toString.call(P.resolve()) === '[object Promise]' && !P.cast) {
	        return;
	      }

	      local.Promise = lib$es6$promise$promise$$default;
	    }
	    var lib$es6$promise$polyfill$$default = lib$es6$promise$polyfill$$polyfill;

	    var lib$es6$promise$umd$$ES6Promise = {
	      'Promise': lib$es6$promise$promise$$default,
	      'polyfill': lib$es6$promise$polyfill$$default
	    };

	    /* global define:true module:true window: true */
	    if ("function" === 'function' && __webpack_require__(8)['amd']) {
	      !(__WEBPACK_AMD_DEFINE_RESULT__ = function() { return lib$es6$promise$umd$$ES6Promise; }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else if (typeof module !== 'undefined' && module['exports']) {
	      module['exports'] = lib$es6$promise$umd$$ES6Promise;
	    } else if (typeof this !== 'undefined') {
	      this['ES6Promise'] = lib$es6$promise$umd$$ES6Promise;
	    }

	    lib$es6$promise$polyfill$$default();
	}).call(this);


	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4), (function() { return this; }()), __webpack_require__(6)(module)))

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 7 */
/***/ function(module, exports) {

	/* (ignored) */

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = function() { throw new Error("define cannot be used indirect"); };


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _Symbol = __webpack_require__(10);

	exports.CONTEXT = _Symbol('mops-context');
	exports.QUEUE = _Symbol('mops-queue');
	exports.SUPER = _Symbol('mops-action-super');
	exports.CHECKED = _Symbol('mops-checked');
	exports.OPERATION = _Symbol('mops-operation');
	exports.ACTION_LOCK = _Symbol('mops-action-lock');

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(11)() ? Symbol : __webpack_require__(12);


/***/ },
/* 11 */
/***/ function(module, exports) {

	'use strict';

	var validTypes = { object: true, symbol: true };

	module.exports = function () {
		var symbol;
		if (typeof Symbol !== 'function') return false;
		symbol = Symbol('test symbol');
		try { String(symbol); } catch (e) { return false; }

		// Return 'true' also for polyfills
		if (!validTypes[typeof Symbol.iterator]) return false;
		if (!validTypes[typeof Symbol.toPrimitive]) return false;
		if (!validTypes[typeof Symbol.toStringTag]) return false;

		return true;
	};


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	// ES2015 Symbol polyfill for environments that do not support it (or partially support it)

	'use strict';

	var d              = __webpack_require__(13)
	  , validateSymbol = __webpack_require__(26)

	  , create = Object.create, defineProperties = Object.defineProperties
	  , defineProperty = Object.defineProperty, objPrototype = Object.prototype
	  , NativeSymbol, SymbolPolyfill, HiddenSymbol, globalSymbols = create(null)
	  , isNativeSafe;

	if (typeof Symbol === 'function') {
		NativeSymbol = Symbol;
		try {
			String(NativeSymbol());
			isNativeSafe = true;
		} catch (ignore) {}
	}

	var generateName = (function () {
		var created = create(null);
		return function (desc) {
			var postfix = 0, name, ie11BugWorkaround;
			while (created[desc + (postfix || '')]) ++postfix;
			desc += (postfix || '');
			created[desc] = true;
			name = '@@' + desc;
			defineProperty(objPrototype, name, d.gs(null, function (value) {
				// For IE11 issue see:
				// https://connect.microsoft.com/IE/feedbackdetail/view/1928508/
				//    ie11-broken-getters-on-dom-objects
				// https://github.com/medikoo/es6-symbol/issues/12
				if (ie11BugWorkaround) return;
				ie11BugWorkaround = true;
				defineProperty(this, name, d(value));
				ie11BugWorkaround = false;
			}));
			return name;
		};
	}());

	// Internal constructor (not one exposed) for creating Symbol instances.
	// This one is used to ensure that `someSymbol instanceof Symbol` always return false
	HiddenSymbol = function Symbol(description) {
		if (this instanceof HiddenSymbol) throw new TypeError('TypeError: Symbol is not a constructor');
		return SymbolPolyfill(description);
	};

	// Exposed `Symbol` constructor
	// (returns instances of HiddenSymbol)
	module.exports = SymbolPolyfill = function Symbol(description) {
		var symbol;
		if (this instanceof Symbol) throw new TypeError('TypeError: Symbol is not a constructor');
		if (isNativeSafe) return NativeSymbol(description);
		symbol = create(HiddenSymbol.prototype);
		description = (description === undefined ? '' : String(description));
		return defineProperties(symbol, {
			__description__: d('', description),
			__name__: d('', generateName(description))
		});
	};
	defineProperties(SymbolPolyfill, {
		for: d(function (key) {
			if (globalSymbols[key]) return globalSymbols[key];
			return (globalSymbols[key] = SymbolPolyfill(String(key)));
		}),
		keyFor: d(function (s) {
			var key;
			validateSymbol(s);
			for (key in globalSymbols) if (globalSymbols[key] === s) return key;
		}),

		// If there's native implementation of given symbol, let's fallback to it
		// to ensure proper interoperability with other native functions e.g. Array.from
		hasInstance: d('', (NativeSymbol && NativeSymbol.hasInstance) || SymbolPolyfill('hasInstance')),
		isConcatSpreadable: d('', (NativeSymbol && NativeSymbol.isConcatSpreadable) ||
			SymbolPolyfill('isConcatSpreadable')),
		iterator: d('', (NativeSymbol && NativeSymbol.iterator) || SymbolPolyfill('iterator')),
		match: d('', (NativeSymbol && NativeSymbol.match) || SymbolPolyfill('match')),
		replace: d('', (NativeSymbol && NativeSymbol.replace) || SymbolPolyfill('replace')),
		search: d('', (NativeSymbol && NativeSymbol.search) || SymbolPolyfill('search')),
		species: d('', (NativeSymbol && NativeSymbol.species) || SymbolPolyfill('species')),
		split: d('', (NativeSymbol && NativeSymbol.split) || SymbolPolyfill('split')),
		toPrimitive: d('', (NativeSymbol && NativeSymbol.toPrimitive) || SymbolPolyfill('toPrimitive')),
		toStringTag: d('', (NativeSymbol && NativeSymbol.toStringTag) || SymbolPolyfill('toStringTag')),
		unscopables: d('', (NativeSymbol && NativeSymbol.unscopables) || SymbolPolyfill('unscopables'))
	});

	// Internal tweaks for real symbol producer
	defineProperties(HiddenSymbol.prototype, {
		constructor: d(SymbolPolyfill),
		toString: d('', function () { return this.__name__; })
	});

	// Proper implementation of methods exposed on Symbol.prototype
	// They won't be accessible on produced symbol instances as they derive from HiddenSymbol.prototype
	defineProperties(SymbolPolyfill.prototype, {
		toString: d(function () { return 'Symbol (' + validateSymbol(this).__description__ + ')'; }),
		valueOf: d(function () { return validateSymbol(this); })
	});
	defineProperty(SymbolPolyfill.prototype, SymbolPolyfill.toPrimitive, d('', function () {
		var symbol = validateSymbol(this);
		if (typeof symbol === 'symbol') return symbol;
		return symbol.toString();
	}));
	defineProperty(SymbolPolyfill.prototype, SymbolPolyfill.toStringTag, d('c', 'Symbol'));

	// Proper implementaton of toPrimitive and toStringTag for returned symbol instances
	defineProperty(HiddenSymbol.prototype, SymbolPolyfill.toStringTag,
		d('c', SymbolPolyfill.prototype[SymbolPolyfill.toStringTag]));

	// Note: It's important to define `toPrimitive` as last one, as some implementations
	// implement `toPrimitive` natively without implementing `toStringTag` (or other specified symbols)
	// And that may invoke error in definition flow:
	// See: https://github.com/medikoo/es6-symbol/issues/13#issuecomment-164146149
	defineProperty(HiddenSymbol.prototype, SymbolPolyfill.toPrimitive,
		d('c', SymbolPolyfill.prototype[SymbolPolyfill.toPrimitive]));


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var assign        = __webpack_require__(14)
	  , normalizeOpts = __webpack_require__(21)
	  , isCallable    = __webpack_require__(22)
	  , contains      = __webpack_require__(23)

	  , d;

	d = module.exports = function (dscr, value/*, options*/) {
		var c, e, w, options, desc;
		if ((arguments.length < 2) || (typeof dscr !== 'string')) {
			options = value;
			value = dscr;
			dscr = null;
		} else {
			options = arguments[2];
		}
		if (dscr == null) {
			c = w = true;
			e = false;
		} else {
			c = contains.call(dscr, 'c');
			e = contains.call(dscr, 'e');
			w = contains.call(dscr, 'w');
		}

		desc = { value: value, configurable: c, enumerable: e, writable: w };
		return !options ? desc : assign(normalizeOpts(options), desc);
	};

	d.gs = function (dscr, get, set/*, options*/) {
		var c, e, options, desc;
		if (typeof dscr !== 'string') {
			options = set;
			set = get;
			get = dscr;
			dscr = null;
		} else {
			options = arguments[3];
		}
		if (get == null) {
			get = undefined;
		} else if (!isCallable(get)) {
			options = get;
			get = set = undefined;
		} else if (set == null) {
			set = undefined;
		} else if (!isCallable(set)) {
			options = set;
			set = undefined;
		}
		if (dscr == null) {
			c = true;
			e = false;
		} else {
			c = contains.call(dscr, 'c');
			e = contains.call(dscr, 'e');
		}

		desc = { get: get, set: set, configurable: c, enumerable: e };
		return !options ? desc : assign(normalizeOpts(options), desc);
	};


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(15)()
		? Object.assign
		: __webpack_require__(16);


/***/ },
/* 15 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function () {
		var assign = Object.assign, obj;
		if (typeof assign !== 'function') return false;
		obj = { foo: 'raz' };
		assign(obj, { bar: 'dwa' }, { trzy: 'trzy' });
		return (obj.foo + obj.bar + obj.trzy) === 'razdwatrzy';
	};


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var keys  = __webpack_require__(17)
	  , value = __webpack_require__(20)

	  , max = Math.max;

	module.exports = function (dest, src/*, …srcn*/) {
		var error, i, l = max(arguments.length, 2), assign;
		dest = Object(value(dest));
		assign = function (key) {
			try { dest[key] = src[key]; } catch (e) {
				if (!error) error = e;
			}
		};
		for (i = 1; i < l; ++i) {
			src = arguments[i];
			keys(src).forEach(assign);
		}
		if (error !== undefined) throw error;
		return dest;
	};


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(18)()
		? Object.keys
		: __webpack_require__(19);


/***/ },
/* 18 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function () {
		try {
			Object.keys('primitive');
			return true;
		} catch (e) { return false; }
	};


/***/ },
/* 19 */
/***/ function(module, exports) {

	'use strict';

	var keys = Object.keys;

	module.exports = function (object) {
		return keys(object == null ? object : Object(object));
	};


/***/ },
/* 20 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (value) {
		if (value == null) throw new TypeError("Cannot use null or undefined");
		return value;
	};


/***/ },
/* 21 */
/***/ function(module, exports) {

	'use strict';

	var forEach = Array.prototype.forEach, create = Object.create;

	var process = function (src, obj) {
		var key;
		for (key in src) obj[key] = src[key];
	};

	module.exports = function (options/*, …options*/) {
		var result = create(null);
		forEach.call(arguments, function (options) {
			if (options == null) return;
			process(Object(options), result);
		});
		return result;
	};


/***/ },
/* 22 */
/***/ function(module, exports) {

	// Deprecated

	'use strict';

	module.exports = function (obj) { return typeof obj === 'function'; };


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(24)()
		? String.prototype.contains
		: __webpack_require__(25);


/***/ },
/* 24 */
/***/ function(module, exports) {

	'use strict';

	var str = 'razdwatrzy';

	module.exports = function () {
		if (typeof str.contains !== 'function') return false;
		return ((str.contains('dwa') === true) && (str.contains('foo') === false));
	};


/***/ },
/* 25 */
/***/ function(module, exports) {

	'use strict';

	var indexOf = String.prototype.indexOf;

	module.exports = function (searchString/*, position*/) {
		return indexOf.call(this, searchString, arguments[1]) > -1;
	};


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var isSymbol = __webpack_require__(27);

	module.exports = function (value) {
		if (!isSymbol(value)) throw new TypeError(value + " is not a symbol");
		return value;
	};


/***/ },
/* 27 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (x) {
		if (!x) return false;
		if (typeof x === 'symbol') return true;
		if (!x.constructor) return false;
		if (x.constructor.name !== 'Symbol') return false;
		return (x[x.constructor.toStringTag] === 'Symbol');
	};


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _require = __webpack_require__(2);

	var cloneDeepWith = _require.cloneDeepWith;

	var Checked = __webpack_require__(29);
	var Operation = __webpack_require__(70);

	module.exports = Context;

	/**
	 * @class
	 * @param {*} data
	 * @returns {Context}
	 */
	function Context(data) {
	    if (data instanceof Context) {
	        return data;
	    }

	    Object.defineProperty(this, 'data', { value: cloneDeepWith(data, cloneCustomizer) });
	    return Object.freeze(this);
	}

	function cloneCustomizer(value) {
	    if (value instanceof Checked || value instanceof Operation) {

	        return value;
	    }
	}

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _require = __webpack_require__(2);

	var castArray = _require.castArray;
	var toArray = _require.toArray;
	var isSet = _require.isSet;
	var toString = _require.toString;

	var Set = __webpack_require__(30);
	var Map = __webpack_require__(63);
	var mopsSymbol = __webpack_require__(9);

	module.exports = Checked;

	/**
	 * @class
	 * @param {Set|array|*} [checked]
	 */
	function Checked(checked) {
	    Object.defineProperty(this, mopsSymbol.CHECKED, { value: toSet(checked) });
	}

	/**
	 * @param {*} obj
	 */
	Checked.prototype.check = function (obj) {
	    this[mopsSymbol.CHECKED].add(obj);
	};

	/**
	 * @param {*} obj
	 */
	Checked.prototype.uncheck = function (obj) {
	    this[mopsSymbol.CHECKED].delete(obj);
	};

	/**
	 * @param {*} obj
	 * @returns {boolean}
	 */
	Checked.prototype.has = function (obj) {
	    return this[mopsSymbol.CHECKED].has(obj);
	};

	Checked.prototype.clear = function () {
	    this[mopsSymbol.CHECKED].clear();
	};

	/**
	 * @returns {number}
	 */
	Checked.prototype.size = function () {
	    return this[mopsSymbol.CHECKED].size;
	};

	/**
	 * @returns {array}
	 */
	Checked.prototype.toArray = function () {
	    return setToArray(this[mopsSymbol.CHECKED]);
	};

	/**
	 * @param {function} getItemGroups
	 * @returns {array} [[ group1, [...] ], [ group2, [...] ], [ group3, [...] ]]
	 */
	Checked.prototype.getGroups = function (getItemGroups) {
	    var groups = new Map();

	    this[mopsSymbol.CHECKED].forEach(function mopsCheckedIterator(item) {
	        var itemGroups = castArray(getItemGroups(item) || []);
	        if (itemGroups.length) {
	            itemGroups.map(getSgroup, groups).forEach(addInSgroup, item);
	        }
	    });

	    return setToArray(groups);
	};

	/**
	 * @param {function} getItemGroups
	 * @returns {Checked}
	 */
	Checked.prototype.getCheckedGroups = function (getItemGroups) {
	    var checked = new Set(this[mopsSymbol.CHECKED]);
	    var groups = new Map();

	    checked.forEach(wrapCheckedIterator(getItemGroups), groups);
	    groups.forEach(groupsIterator, checked);
	    groups.clear();

	    return new this.constructor(checked);
	};

	function wrapCheckedIterator(getItemGroups) {
	    return function checkedIterator(item) {
	        var itemGroups = castArray(getItemGroups(item) || []);
	        if (itemGroups.length) {
	            itemGroups.map(getSgroup, this).forEach(addInSgroup, item);
	        }
	    };
	}

	function groupsIterator(items, group) {
	    if (this.has(group)) {
	        items.forEach(clearFromGroup, this);
	    }
	}

	function getSgroup(group) {
	    var sgroup = this.get(group);

	    if (!sgroup) {
	        sgroup = [];
	        this.set(group, sgroup);
	    }

	    return sgroup;
	}

	function addInSgroup(sgroup) {
	    sgroup.push(this);
	}

	function clearFromGroup(item) {
	    this.delete(item);
	}

	function toSet(data) {
	    if (!data) {
	        return new Set();
	    }

	    var out = void 0;

	    if (isSet(data)) {
	        out = data;
	    } else if (toString(data) === '[object Set]') {
	        out = new Set(setToArray(data));
	    } else if (Array.isArray(data)) {
	        out = new Set(data);
	    } else {
	        out = new Set([data]);
	    }

	    return out;
	}

	var setToArray = function () {
	    var toArraySupport = Boolean(toArray(new Set([1])).length);

	    if (toArraySupport) {
	        return toArray;
	    } else {
	        return function (set) {
	            var out = [];
	            set.forEach(function (item) {
	                return out.push(item);
	            });
	            return out;
	        };
	    }
	}();

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(31)() ? Set : __webpack_require__(32);


/***/ },
/* 31 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function () {
		var set, iterator, result;
		if (typeof Set !== 'function') return false;
		set = new Set(['raz', 'dwa', 'trzy']);
		if (String(set) !== '[object Set]') return false;
		if (set.size !== 3) return false;
		if (typeof set.add !== 'function') return false;
		if (typeof set.clear !== 'function') return false;
		if (typeof set.delete !== 'function') return false;
		if (typeof set.entries !== 'function') return false;
		if (typeof set.forEach !== 'function') return false;
		if (typeof set.has !== 'function') return false;
		if (typeof set.keys !== 'function') return false;
		if (typeof set.values !== 'function') return false;

		iterator = set.values();
		result = iterator.next();
		if (result.done !== false) return false;
		if (result.value !== 'raz') return false;

		return true;
	};


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var clear          = __webpack_require__(33)
	  , eIndexOf       = __webpack_require__(34)
	  , setPrototypeOf = __webpack_require__(40)
	  , callable       = __webpack_require__(45)
	  , d              = __webpack_require__(13)
	  , ee             = __webpack_require__(46)
	  , Symbol         = __webpack_require__(10)
	  , iterator       = __webpack_require__(47)
	  , forOf          = __webpack_require__(51)
	  , Iterator       = __webpack_require__(61)
	  , isNative       = __webpack_require__(62)

	  , call = Function.prototype.call
	  , defineProperty = Object.defineProperty, getPrototypeOf = Object.getPrototypeOf
	  , SetPoly, getValues, NativeSet;

	if (isNative) NativeSet = Set;

	module.exports = SetPoly = function Set(/*iterable*/) {
		var iterable = arguments[0], self;
		if (!(this instanceof SetPoly)) throw new TypeError('Constructor requires \'new\'');
		if (isNative && setPrototypeOf) self = setPrototypeOf(new NativeSet(), getPrototypeOf(this));
		else self = this;
		if (iterable != null) iterator(iterable);
		defineProperty(self, '__setData__', d('c', []));
		if (!iterable) return self;
		forOf(iterable, function (value) {
			if (eIndexOf.call(this, value) !== -1) return;
			this.push(value);
		}, self.__setData__);
		return self;
	};

	if (isNative) {
		if (setPrototypeOf) setPrototypeOf(SetPoly, NativeSet);
		SetPoly.prototype = Object.create(NativeSet.prototype, { constructor: d(SetPoly) });
	}

	ee(Object.defineProperties(SetPoly.prototype, {
		add: d(function (value) {
			if (this.has(value)) return this;
			this.emit('_add', this.__setData__.push(value) - 1, value);
			return this;
		}),
		clear: d(function () {
			if (!this.__setData__.length) return;
			clear.call(this.__setData__);
			this.emit('_clear');
		}),
		delete: d(function (value) {
			var index = eIndexOf.call(this.__setData__, value);
			if (index === -1) return false;
			this.__setData__.splice(index, 1);
			this.emit('_delete', index, value);
			return true;
		}),
		entries: d(function () { return new Iterator(this, 'key+value'); }),
		forEach: d(function (cb/*, thisArg*/) {
			var thisArg = arguments[1], iterator, result, value;
			callable(cb);
			iterator = this.values();
			result = iterator._next();
			while (result !== undefined) {
				value = iterator._resolve(result);
				call.call(cb, thisArg, value, value, this);
				result = iterator._next();
			}
		}),
		has: d(function (value) {
			return (eIndexOf.call(this.__setData__, value) !== -1);
		}),
		keys: d(getValues = function () { return this.values(); }),
		size: d.gs(function () { return this.__setData__.length; }),
		values: d(function () { return new Iterator(this); }),
		toString: d(function () { return '[object Set]'; })
	}));
	defineProperty(SetPoly.prototype, Symbol.iterator, d(getValues));
	defineProperty(SetPoly.prototype, Symbol.toStringTag, d('c', 'Set'));


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	// Inspired by Google Closure:
	// http://closure-library.googlecode.com/svn/docs/
	// closure_goog_array_array.js.html#goog.array.clear

	'use strict';

	var value = __webpack_require__(20);

	module.exports = function () {
		value(this).length = 0;
		return this;
	};


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var toPosInt = __webpack_require__(35)
	  , value    = __webpack_require__(20)

	  , indexOf = Array.prototype.indexOf
	  , hasOwnProperty = Object.prototype.hasOwnProperty
	  , abs = Math.abs, floor = Math.floor;

	module.exports = function (searchElement/*, fromIndex*/) {
		var i, l, fromIndex, val;
		if (searchElement === searchElement) { //jslint: ignore
			return indexOf.apply(this, arguments);
		}

		l = toPosInt(value(this).length);
		fromIndex = arguments[1];
		if (isNaN(fromIndex)) fromIndex = 0;
		else if (fromIndex >= 0) fromIndex = floor(fromIndex);
		else fromIndex = toPosInt(this.length) - floor(abs(fromIndex));

		for (i = fromIndex; i < l; ++i) {
			if (hasOwnProperty.call(this, i)) {
				val = this[i];
				if (val !== val) return i; //jslint: ignore
			}
		}
		return -1;
	};


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var toInteger = __webpack_require__(36)

	  , max = Math.max;

	module.exports = function (value) { return max(0, toInteger(value)); };


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var sign = __webpack_require__(37)

	  , abs = Math.abs, floor = Math.floor;

	module.exports = function (value) {
		if (isNaN(value)) return 0;
		value = Number(value);
		if ((value === 0) || !isFinite(value)) return value;
		return sign(value) * floor(abs(value));
	};


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(38)()
		? Math.sign
		: __webpack_require__(39);


/***/ },
/* 38 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function () {
		var sign = Math.sign;
		if (typeof sign !== 'function') return false;
		return ((sign(10) === 1) && (sign(-20) === -1));
	};


/***/ },
/* 39 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (value) {
		value = Number(value);
		if (isNaN(value) || (value === 0)) return value;
		return (value > 0) ? 1 : -1;
	};


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(41)()
		? Object.setPrototypeOf
		: __webpack_require__(42);


/***/ },
/* 41 */
/***/ function(module, exports) {

	'use strict';

	var create = Object.create, getPrototypeOf = Object.getPrototypeOf
	  , x = {};

	module.exports = function (/*customCreate*/) {
		var setPrototypeOf = Object.setPrototypeOf
		  , customCreate = arguments[0] || create;
		if (typeof setPrototypeOf !== 'function') return false;
		return getPrototypeOf(setPrototypeOf(customCreate(null), x)) === x;
	};


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	// Big thanks to @WebReflection for sorting this out
	// https://gist.github.com/WebReflection/5593554

	'use strict';

	var isObject      = __webpack_require__(43)
	  , value         = __webpack_require__(20)

	  , isPrototypeOf = Object.prototype.isPrototypeOf
	  , defineProperty = Object.defineProperty
	  , nullDesc = { configurable: true, enumerable: false, writable: true,
			value: undefined }
	  , validate;

	validate = function (obj, prototype) {
		value(obj);
		if ((prototype === null) || isObject(prototype)) return obj;
		throw new TypeError('Prototype must be null or an object');
	};

	module.exports = (function (status) {
		var fn, set;
		if (!status) return null;
		if (status.level === 2) {
			if (status.set) {
				set = status.set;
				fn = function (obj, prototype) {
					set.call(validate(obj, prototype), prototype);
					return obj;
				};
			} else {
				fn = function (obj, prototype) {
					validate(obj, prototype).__proto__ = prototype;
					return obj;
				};
			}
		} else {
			fn = function self(obj, prototype) {
				var isNullBase;
				validate(obj, prototype);
				isNullBase = isPrototypeOf.call(self.nullPolyfill, obj);
				if (isNullBase) delete self.nullPolyfill.__proto__;
				if (prototype === null) prototype = self.nullPolyfill;
				obj.__proto__ = prototype;
				if (isNullBase) defineProperty(self.nullPolyfill, '__proto__', nullDesc);
				return obj;
			};
		}
		return Object.defineProperty(fn, 'level', { configurable: false,
			enumerable: false, writable: false, value: status.level });
	}((function () {
		var x = Object.create(null), y = {}, set
		  , desc = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__');

		if (desc) {
			try {
				set = desc.set; // Opera crashes at this point
				set.call(x, y);
			} catch (ignore) { }
			if (Object.getPrototypeOf(x) === y) return { set: set, level: 2 };
		}

		x.__proto__ = y;
		if (Object.getPrototypeOf(x) === y) return { level: 2 };

		x = {};
		x.__proto__ = y;
		if (Object.getPrototypeOf(x) === y) return { level: 1 };

		return false;
	}())));

	__webpack_require__(44);


/***/ },
/* 43 */
/***/ function(module, exports) {

	'use strict';

	var map = { function: true, object: true };

	module.exports = function (x) {
		return ((x != null) && map[typeof x]) || false;
	};


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	// Workaround for http://code.google.com/p/v8/issues/detail?id=2804

	'use strict';

	var create = Object.create, shim;

	if (!__webpack_require__(41)()) {
		shim = __webpack_require__(42);
	}

	module.exports = (function () {
		var nullObject, props, desc;
		if (!shim) return create;
		if (shim.level !== 1) return create;

		nullObject = {};
		props = {};
		desc = { configurable: false, enumerable: false, writable: true,
			value: undefined };
		Object.getOwnPropertyNames(Object.prototype).forEach(function (name) {
			if (name === '__proto__') {
				props[name] = { configurable: true, enumerable: false, writable: true,
					value: undefined };
				return;
			}
			props[name] = desc;
		});
		Object.defineProperties(nullObject, props);

		Object.defineProperty(shim, 'nullPolyfill', { configurable: false,
			enumerable: false, writable: false, value: nullObject });

		return function (prototype, props) {
			return create((prototype === null) ? nullObject : prototype, props);
		};
	}());


/***/ },
/* 45 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (fn) {
		if (typeof fn !== 'function') throw new TypeError(fn + " is not a function");
		return fn;
	};


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var d        = __webpack_require__(13)
	  , callable = __webpack_require__(45)

	  , apply = Function.prototype.apply, call = Function.prototype.call
	  , create = Object.create, defineProperty = Object.defineProperty
	  , defineProperties = Object.defineProperties
	  , hasOwnProperty = Object.prototype.hasOwnProperty
	  , descriptor = { configurable: true, enumerable: false, writable: true }

	  , on, once, off, emit, methods, descriptors, base;

	on = function (type, listener) {
		var data;

		callable(listener);

		if (!hasOwnProperty.call(this, '__ee__')) {
			data = descriptor.value = create(null);
			defineProperty(this, '__ee__', descriptor);
			descriptor.value = null;
		} else {
			data = this.__ee__;
		}
		if (!data[type]) data[type] = listener;
		else if (typeof data[type] === 'object') data[type].push(listener);
		else data[type] = [data[type], listener];

		return this;
	};

	once = function (type, listener) {
		var once, self;

		callable(listener);
		self = this;
		on.call(this, type, once = function () {
			off.call(self, type, once);
			apply.call(listener, this, arguments);
		});

		once.__eeOnceListener__ = listener;
		return this;
	};

	off = function (type, listener) {
		var data, listeners, candidate, i;

		callable(listener);

		if (!hasOwnProperty.call(this, '__ee__')) return this;
		data = this.__ee__;
		if (!data[type]) return this;
		listeners = data[type];

		if (typeof listeners === 'object') {
			for (i = 0; (candidate = listeners[i]); ++i) {
				if ((candidate === listener) ||
						(candidate.__eeOnceListener__ === listener)) {
					if (listeners.length === 2) data[type] = listeners[i ? 0 : 1];
					else listeners.splice(i, 1);
				}
			}
		} else {
			if ((listeners === listener) ||
					(listeners.__eeOnceListener__ === listener)) {
				delete data[type];
			}
		}

		return this;
	};

	emit = function (type) {
		var i, l, listener, listeners, args;

		if (!hasOwnProperty.call(this, '__ee__')) return;
		listeners = this.__ee__[type];
		if (!listeners) return;

		if (typeof listeners === 'object') {
			l = arguments.length;
			args = new Array(l - 1);
			for (i = 1; i < l; ++i) args[i - 1] = arguments[i];

			listeners = listeners.slice();
			for (i = 0; (listener = listeners[i]); ++i) {
				apply.call(listener, this, args);
			}
		} else {
			switch (arguments.length) {
			case 1:
				call.call(listeners, this);
				break;
			case 2:
				call.call(listeners, this, arguments[1]);
				break;
			case 3:
				call.call(listeners, this, arguments[1], arguments[2]);
				break;
			default:
				l = arguments.length;
				args = new Array(l - 1);
				for (i = 1; i < l; ++i) {
					args[i - 1] = arguments[i];
				}
				apply.call(listeners, this, args);
			}
		}
	};

	methods = {
		on: on,
		once: once,
		off: off,
		emit: emit
	};

	descriptors = {
		on: d(on),
		once: d(once),
		off: d(off),
		emit: d(emit)
	};

	base = defineProperties({}, descriptors);

	module.exports = exports = function (o) {
		return (o == null) ? create(base) : defineProperties(Object(o), descriptors);
	};
	exports.methods = methods;


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var isIterable = __webpack_require__(48);

	module.exports = function (value) {
		if (!isIterable(value)) throw new TypeError(value + " is not iterable");
		return value;
	};


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var isArguments    = __webpack_require__(49)
	  , isString       = __webpack_require__(50)
	  , iteratorSymbol = __webpack_require__(10).iterator

	  , isArray = Array.isArray;

	module.exports = function (value) {
		if (value == null) return false;
		if (isArray(value)) return true;
		if (isString(value)) return true;
		if (isArguments(value)) return true;
		return (typeof value[iteratorSymbol] === 'function');
	};


/***/ },
/* 49 */
/***/ function(module, exports) {

	'use strict';

	var toString = Object.prototype.toString

	  , id = toString.call((function () { return arguments; }()));

	module.exports = function (x) { return (toString.call(x) === id); };


/***/ },
/* 50 */
/***/ function(module, exports) {

	'use strict';

	var toString = Object.prototype.toString

	  , id = toString.call('');

	module.exports = function (x) {
		return (typeof x === 'string') || (x && (typeof x === 'object') &&
			((x instanceof String) || (toString.call(x) === id))) || false;
	};


/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var isArguments = __webpack_require__(49)
	  , callable    = __webpack_require__(45)
	  , isString    = __webpack_require__(50)
	  , get         = __webpack_require__(52)

	  , isArray = Array.isArray, call = Function.prototype.call
	  , some = Array.prototype.some;

	module.exports = function (iterable, cb/*, thisArg*/) {
		var mode, thisArg = arguments[2], result, doBreak, broken, i, l, char, code;
		if (isArray(iterable) || isArguments(iterable)) mode = 'array';
		else if (isString(iterable)) mode = 'string';
		else iterable = get(iterable);

		callable(cb);
		doBreak = function () { broken = true; };
		if (mode === 'array') {
			some.call(iterable, function (value) {
				call.call(cb, thisArg, value, doBreak);
				if (broken) return true;
			});
			return;
		}
		if (mode === 'string') {
			l = iterable.length;
			for (i = 0; i < l; ++i) {
				char = iterable[i];
				if ((i + 1) < l) {
					code = char.charCodeAt(0);
					if ((code >= 0xD800) && (code <= 0xDBFF)) char += iterable[++i];
				}
				call.call(cb, thisArg, char, doBreak);
				if (broken) break;
			}
			return;
		}
		result = iterable.next();

		while (!result.done) {
			call.call(cb, thisArg, result.value, doBreak);
			if (broken) return;
			result = iterable.next();
		}
	};


/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var isArguments    = __webpack_require__(49)
	  , isString       = __webpack_require__(50)
	  , ArrayIterator  = __webpack_require__(53)
	  , StringIterator = __webpack_require__(60)
	  , iterable       = __webpack_require__(47)
	  , iteratorSymbol = __webpack_require__(10).iterator;

	module.exports = function (obj) {
		if (typeof iterable(obj)[iteratorSymbol] === 'function') return obj[iteratorSymbol]();
		if (isArguments(obj)) return new ArrayIterator(obj);
		if (isString(obj)) return new StringIterator(obj);
		return new ArrayIterator(obj);
	};


/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var setPrototypeOf = __webpack_require__(40)
	  , contains       = __webpack_require__(23)
	  , d              = __webpack_require__(13)
	  , Iterator       = __webpack_require__(54)

	  , defineProperty = Object.defineProperty
	  , ArrayIterator;

	ArrayIterator = module.exports = function (arr, kind) {
		if (!(this instanceof ArrayIterator)) return new ArrayIterator(arr, kind);
		Iterator.call(this, arr);
		if (!kind) kind = 'value';
		else if (contains.call(kind, 'key+value')) kind = 'key+value';
		else if (contains.call(kind, 'key')) kind = 'key';
		else kind = 'value';
		defineProperty(this, '__kind__', d('', kind));
	};
	if (setPrototypeOf) setPrototypeOf(ArrayIterator, Iterator);

	ArrayIterator.prototype = Object.create(Iterator.prototype, {
		constructor: d(ArrayIterator),
		_resolve: d(function (i) {
			if (this.__kind__ === 'value') return this.__list__[i];
			if (this.__kind__ === 'key+value') return [i, this.__list__[i]];
			return i;
		}),
		toString: d(function () { return '[object Array Iterator]'; })
	});


/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var clear    = __webpack_require__(33)
	  , assign   = __webpack_require__(14)
	  , callable = __webpack_require__(45)
	  , value    = __webpack_require__(20)
	  , d        = __webpack_require__(13)
	  , autoBind = __webpack_require__(55)
	  , Symbol   = __webpack_require__(10)

	  , defineProperty = Object.defineProperty
	  , defineProperties = Object.defineProperties
	  , Iterator;

	module.exports = Iterator = function (list, context) {
		if (!(this instanceof Iterator)) return new Iterator(list, context);
		defineProperties(this, {
			__list__: d('w', value(list)),
			__context__: d('w', context),
			__nextIndex__: d('w', 0)
		});
		if (!context) return;
		callable(context.on);
		context.on('_add', this._onAdd);
		context.on('_delete', this._onDelete);
		context.on('_clear', this._onClear);
	};

	defineProperties(Iterator.prototype, assign({
		constructor: d(Iterator),
		_next: d(function () {
			var i;
			if (!this.__list__) return;
			if (this.__redo__) {
				i = this.__redo__.shift();
				if (i !== undefined) return i;
			}
			if (this.__nextIndex__ < this.__list__.length) return this.__nextIndex__++;
			this._unBind();
		}),
		next: d(function () { return this._createResult(this._next()); }),
		_createResult: d(function (i) {
			if (i === undefined) return { done: true, value: undefined };
			return { done: false, value: this._resolve(i) };
		}),
		_resolve: d(function (i) { return this.__list__[i]; }),
		_unBind: d(function () {
			this.__list__ = null;
			delete this.__redo__;
			if (!this.__context__) return;
			this.__context__.off('_add', this._onAdd);
			this.__context__.off('_delete', this._onDelete);
			this.__context__.off('_clear', this._onClear);
			this.__context__ = null;
		}),
		toString: d(function () { return '[object Iterator]'; })
	}, autoBind({
		_onAdd: d(function (index) {
			if (index >= this.__nextIndex__) return;
			++this.__nextIndex__;
			if (!this.__redo__) {
				defineProperty(this, '__redo__', d('c', [index]));
				return;
			}
			this.__redo__.forEach(function (redo, i) {
				if (redo >= index) this.__redo__[i] = ++redo;
			}, this);
			this.__redo__.push(index);
		}),
		_onDelete: d(function (index) {
			var i;
			if (index >= this.__nextIndex__) return;
			--this.__nextIndex__;
			if (!this.__redo__) return;
			i = this.__redo__.indexOf(index);
			if (i !== -1) this.__redo__.splice(i, 1);
			this.__redo__.forEach(function (redo, i) {
				if (redo > index) this.__redo__[i] = --redo;
			}, this);
		}),
		_onClear: d(function () {
			if (this.__redo__) clear.call(this.__redo__);
			this.__nextIndex__ = 0;
		})
	})));

	defineProperty(Iterator.prototype, Symbol.iterator, d(function () {
		return this;
	}));
	defineProperty(Iterator.prototype, Symbol.toStringTag, d('', 'Iterator'));


/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var copy       = __webpack_require__(56)
	  , map        = __webpack_require__(57)
	  , callable   = __webpack_require__(45)
	  , validValue = __webpack_require__(20)

	  , bind = Function.prototype.bind, defineProperty = Object.defineProperty
	  , hasOwnProperty = Object.prototype.hasOwnProperty
	  , define;

	define = function (name, desc, bindTo) {
		var value = validValue(desc) && callable(desc.value), dgs;
		dgs = copy(desc);
		delete dgs.writable;
		delete dgs.value;
		dgs.get = function () {
			if (hasOwnProperty.call(this, name)) return value;
			desc.value = bind.call(value, (bindTo == null) ? this : this[bindTo]);
			defineProperty(this, name, desc);
			return this[name];
		};
		return dgs;
	};

	module.exports = function (props/*, bindTo*/) {
		var bindTo = arguments[1];
		return map(props, function (desc, name) {
			return define(name, desc, bindTo);
		});
	};


/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var assign = __webpack_require__(14)
	  , value  = __webpack_require__(20);

	module.exports = function (obj) {
		var copy = Object(value(obj));
		if (copy !== obj) return copy;
		return assign({}, obj);
	};


/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var callable = __webpack_require__(45)
	  , forEach  = __webpack_require__(58)

	  , call = Function.prototype.call;

	module.exports = function (obj, cb/*, thisArg*/) {
		var o = {}, thisArg = arguments[2];
		callable(cb);
		forEach(obj, function (value, key, obj, index) {
			o[key] = call.call(cb, thisArg, value, key, obj, index);
		});
		return o;
	};


/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(59)('forEach');


/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	// Internal method, used by iteration functions.
	// Calls a function for each key-value pair found in object
	// Optionally takes compareFn to iterate object in specific order

	'use strict';

	var callable = __webpack_require__(45)
	  , value    = __webpack_require__(20)

	  , bind = Function.prototype.bind, call = Function.prototype.call, keys = Object.keys
	  , propertyIsEnumerable = Object.prototype.propertyIsEnumerable;

	module.exports = function (method, defVal) {
		return function (obj, cb/*, thisArg, compareFn*/) {
			var list, thisArg = arguments[2], compareFn = arguments[3];
			obj = Object(value(obj));
			callable(cb);

			list = keys(obj);
			if (compareFn) {
				list.sort((typeof compareFn === 'function') ? bind.call(compareFn, obj) : undefined);
			}
			if (typeof method !== 'function') method = list[method];
			return call.call(method, list, function (key, index) {
				if (!propertyIsEnumerable.call(obj, key)) return defVal;
				return call.call(cb, thisArg, obj[key], key, obj, index);
			});
		};
	};


/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	// Thanks @mathiasbynens
	// http://mathiasbynens.be/notes/javascript-unicode#iterating-over-symbols

	'use strict';

	var setPrototypeOf = __webpack_require__(40)
	  , d              = __webpack_require__(13)
	  , Iterator       = __webpack_require__(54)

	  , defineProperty = Object.defineProperty
	  , StringIterator;

	StringIterator = module.exports = function (str) {
		if (!(this instanceof StringIterator)) return new StringIterator(str);
		str = String(str);
		Iterator.call(this, str);
		defineProperty(this, '__length__', d('', str.length));

	};
	if (setPrototypeOf) setPrototypeOf(StringIterator, Iterator);

	StringIterator.prototype = Object.create(Iterator.prototype, {
		constructor: d(StringIterator),
		_next: d(function () {
			if (!this.__list__) return;
			if (this.__nextIndex__ < this.__length__) return this.__nextIndex__++;
			this._unBind();
		}),
		_resolve: d(function (i) {
			var char = this.__list__[i], code;
			if (this.__nextIndex__ === this.__length__) return char;
			code = char.charCodeAt(0);
			if ((code >= 0xD800) && (code <= 0xDBFF)) return char + this.__list__[this.__nextIndex__++];
			return char;
		}),
		toString: d(function () { return '[object String Iterator]'; })
	});


/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var setPrototypeOf    = __webpack_require__(40)
	  , contains          = __webpack_require__(23)
	  , d                 = __webpack_require__(13)
	  , Iterator          = __webpack_require__(54)
	  , toStringTagSymbol = __webpack_require__(10).toStringTag

	  , defineProperty = Object.defineProperty
	  , SetIterator;

	SetIterator = module.exports = function (set, kind) {
		if (!(this instanceof SetIterator)) return new SetIterator(set, kind);
		Iterator.call(this, set.__setData__, set);
		if (!kind) kind = 'value';
		else if (contains.call(kind, 'key+value')) kind = 'key+value';
		else kind = 'value';
		defineProperty(this, '__kind__', d('', kind));
	};
	if (setPrototypeOf) setPrototypeOf(SetIterator, Iterator);

	SetIterator.prototype = Object.create(Iterator.prototype, {
		constructor: d(SetIterator),
		_resolve: d(function (i) {
			if (this.__kind__ === 'value') return this.__list__[i];
			return [this.__list__[i], this.__list__[i]];
		}),
		toString: d(function () { return '[object Set Iterator]'; })
	});
	defineProperty(SetIterator.prototype, toStringTagSymbol, d('c', 'Set Iterator'));


/***/ },
/* 62 */
/***/ function(module, exports) {

	// Exports true if environment provides native `Set` implementation,
	// whatever that is.

	'use strict';

	module.exports = (function () {
		if (typeof Set === 'undefined') return false;
		return (Object.prototype.toString.call(Set.prototype) === '[object Set]');
	}());


/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(64)() ? Map : __webpack_require__(65);


/***/ },
/* 64 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function () {
		var map, iterator, result;
		if (typeof Map !== 'function') return false;
		try {
			// WebKit doesn't support arguments and crashes
			map = new Map([['raz', 'one'], ['dwa', 'two'], ['trzy', 'three']]);
		} catch (e) {
			return false;
		}
		if (String(map) !== '[object Map]') return false;
		if (map.size !== 3) return false;
		if (typeof map.clear !== 'function') return false;
		if (typeof map.delete !== 'function') return false;
		if (typeof map.entries !== 'function') return false;
		if (typeof map.forEach !== 'function') return false;
		if (typeof map.get !== 'function') return false;
		if (typeof map.has !== 'function') return false;
		if (typeof map.keys !== 'function') return false;
		if (typeof map.set !== 'function') return false;
		if (typeof map.values !== 'function') return false;

		iterator = map.entries();
		result = iterator.next();
		if (result.done !== false) return false;
		if (!result.value) return false;
		if (result.value[0] !== 'raz') return false;
		if (result.value[1] !== 'one') return false;

		return true;
	};


/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var clear          = __webpack_require__(33)
	  , eIndexOf       = __webpack_require__(34)
	  , setPrototypeOf = __webpack_require__(40)
	  , callable       = __webpack_require__(45)
	  , validValue     = __webpack_require__(20)
	  , d              = __webpack_require__(13)
	  , ee             = __webpack_require__(46)
	  , Symbol         = __webpack_require__(10)
	  , iterator       = __webpack_require__(47)
	  , forOf          = __webpack_require__(51)
	  , Iterator       = __webpack_require__(66)
	  , isNative       = __webpack_require__(69)

	  , call = Function.prototype.call
	  , defineProperties = Object.defineProperties, getPrototypeOf = Object.getPrototypeOf
	  , MapPoly;

	module.exports = MapPoly = function (/*iterable*/) {
		var iterable = arguments[0], keys, values, self;
		if (!(this instanceof MapPoly)) throw new TypeError('Constructor requires \'new\'');
		if (isNative && setPrototypeOf && (Map !== MapPoly)) {
			self = setPrototypeOf(new Map(), getPrototypeOf(this));
		} else {
			self = this;
		}
		if (iterable != null) iterator(iterable);
		defineProperties(self, {
			__mapKeysData__: d('c', keys = []),
			__mapValuesData__: d('c', values = [])
		});
		if (!iterable) return self;
		forOf(iterable, function (value) {
			var key = validValue(value)[0];
			value = value[1];
			if (eIndexOf.call(keys, key) !== -1) return;
			keys.push(key);
			values.push(value);
		}, self);
		return self;
	};

	if (isNative) {
		if (setPrototypeOf) setPrototypeOf(MapPoly, Map);
		MapPoly.prototype = Object.create(Map.prototype, {
			constructor: d(MapPoly)
		});
	}

	ee(defineProperties(MapPoly.prototype, {
		clear: d(function () {
			if (!this.__mapKeysData__.length) return;
			clear.call(this.__mapKeysData__);
			clear.call(this.__mapValuesData__);
			this.emit('_clear');
		}),
		delete: d(function (key) {
			var index = eIndexOf.call(this.__mapKeysData__, key);
			if (index === -1) return false;
			this.__mapKeysData__.splice(index, 1);
			this.__mapValuesData__.splice(index, 1);
			this.emit('_delete', index, key);
			return true;
		}),
		entries: d(function () { return new Iterator(this, 'key+value'); }),
		forEach: d(function (cb/*, thisArg*/) {
			var thisArg = arguments[1], iterator, result;
			callable(cb);
			iterator = this.entries();
			result = iterator._next();
			while (result !== undefined) {
				call.call(cb, thisArg, this.__mapValuesData__[result],
					this.__mapKeysData__[result], this);
				result = iterator._next();
			}
		}),
		get: d(function (key) {
			var index = eIndexOf.call(this.__mapKeysData__, key);
			if (index === -1) return;
			return this.__mapValuesData__[index];
		}),
		has: d(function (key) {
			return (eIndexOf.call(this.__mapKeysData__, key) !== -1);
		}),
		keys: d(function () { return new Iterator(this, 'key'); }),
		set: d(function (key, value) {
			var index = eIndexOf.call(this.__mapKeysData__, key), emit;
			if (index === -1) {
				index = this.__mapKeysData__.push(key) - 1;
				emit = true;
			}
			this.__mapValuesData__[index] = value;
			if (emit) this.emit('_add', index, key);
			return this;
		}),
		size: d.gs(function () { return this.__mapKeysData__.length; }),
		values: d(function () { return new Iterator(this, 'value'); }),
		toString: d(function () { return '[object Map]'; })
	}));
	Object.defineProperty(MapPoly.prototype, Symbol.iterator, d(function () {
		return this.entries();
	}));
	Object.defineProperty(MapPoly.prototype, Symbol.toStringTag, d('c', 'Map'));


/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var setPrototypeOf    = __webpack_require__(40)
	  , d                 = __webpack_require__(13)
	  , Iterator          = __webpack_require__(54)
	  , toStringTagSymbol = __webpack_require__(10).toStringTag
	  , kinds             = __webpack_require__(67)

	  , defineProperties = Object.defineProperties
	  , unBind = Iterator.prototype._unBind
	  , MapIterator;

	MapIterator = module.exports = function (map, kind) {
		if (!(this instanceof MapIterator)) return new MapIterator(map, kind);
		Iterator.call(this, map.__mapKeysData__, map);
		if (!kind || !kinds[kind]) kind = 'key+value';
		defineProperties(this, {
			__kind__: d('', kind),
			__values__: d('w', map.__mapValuesData__)
		});
	};
	if (setPrototypeOf) setPrototypeOf(MapIterator, Iterator);

	MapIterator.prototype = Object.create(Iterator.prototype, {
		constructor: d(MapIterator),
		_resolve: d(function (i) {
			if (this.__kind__ === 'value') return this.__values__[i];
			if (this.__kind__ === 'key') return this.__list__[i];
			return [this.__list__[i], this.__values__[i]];
		}),
		_unBind: d(function () {
			this.__values__ = null;
			unBind.call(this);
		}),
		toString: d(function () { return '[object Map Iterator]'; })
	});
	Object.defineProperty(MapIterator.prototype, toStringTagSymbol,
		d('c', 'Map Iterator'));


/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(68)('key',
		'value', 'key+value');


/***/ },
/* 68 */
/***/ function(module, exports) {

	'use strict';

	var forEach = Array.prototype.forEach, create = Object.create;

	module.exports = function (arg/*, …args*/) {
		var set = create(null);
		forEach.call(arguments, function (name) { set[name] = true; });
		return set;
	};


/***/ },
/* 69 */
/***/ function(module, exports) {

	// Exports true if environment provides native `Map` implementation,
	// whatever that is.

	'use strict';

	module.exports = (function () {
		if (typeof Map === 'undefined') return false;
		return (Object.prototype.toString.call(new Map()) === '[object Map]');
	}());


/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var Set = __webpack_require__(30);
	var Map = __webpack_require__(63);
	var mopsSymbol = __webpack_require__(9);

	module.exports = Operation;

	var slice = Array.prototype.slice;

	/**
	 * @class
	 */
	function Operation() {
	    Object.defineProperty(this, mopsSymbol.OPERATION, { value: [] });
	    Object.defineProperty(this, mopsSymbol.ACTION_LOCK, { value: new Map() });
	}

	Operation.prototype.add = function (action) {
	    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	        args[_key - 1] = arguments[_key];
	    }

	    if (checkLock(this[mopsSymbol.ACTION_LOCK], action, args)) {
	        return false;
	    }

	    this[mopsSymbol.OPERATION].push([action, args]);
	    return true;
	};

	Operation.prototype.has = function (action) {
	    return this[mopsSymbol.OPERATION].some(function (item) {
	        return item[0] === action;
	    });
	};

	Operation.prototype.clear = function () {
	    this[mopsSymbol.OPERATION].length = 0;
	    this[mopsSymbol.ACTION_LOCK].clear();
	};

	/**
	 * @param {function} [action]
	 * @returns {number}
	 */
	Operation.prototype.size = function (action) {
	    var oper = this[mopsSymbol.OPERATION];

	    if (action) {
	        return oper.filter(function (item) {
	            return item[0] === action;
	        }).length;
	    }

	    return oper.length;
	};

	/**
	 * @param {function} action
	 * @param {function} [checker] _.partial(function(checkerArg, callArg1, ...) { return true; }, 'test')
	 */
	Operation.prototype.lock = function (action, checker) {
	    var lock = this[mopsSymbol.ACTION_LOCK];
	    var checkers = lock.get(action);

	    if (checkers === null) {
	        return;
	    }

	    if (!checker) {
	        lock.set(action, null);
	    } else if (checkers) {
	        checkers.add(checker);
	    } else {
	        lock.set(action, new Set([checker]));
	    }

	    var oper = this[mopsSymbol.OPERATION];
	    for (var i = 0; i < oper.length; i++) {
	        if (oper[i][0] === action) {
	            if (checker) {
	                if (checker.apply(null, oper[i][1])) {
	                    oper.splice(i, 1);
	                }
	            } else {
	                oper.splice(i, 1);
	            }
	        }
	    }
	};

	Operation.prototype.unlock = function (action, checker) {
	    var lock = this[mopsSymbol.ACTION_LOCK];

	    if (checker) {
	        var checkers = lock.get(action);
	        checkers && checkers.delete(checker);
	    } else {
	        lock.delete(action);
	    }
	};

	Operation.prototype.isLock = function (action, checker) {
	    var lock = this[mopsSymbol.ACTION_LOCK];

	    if (checker) {
	        var checkers = lock.get(action);
	        return checkers && checkers.has(checker) || false;
	    } else {
	        return lock.has(action);
	    }
	};

	Operation.prototype.merge = function (data) {
	    if (!data || !(data instanceof Operation)) {
	        return false;
	    }

	    var lock = this[mopsSymbol.ACTION_LOCK];
	    var oper = this[mopsSymbol.OPERATION];
	    var operSource = data[mopsSymbol.OPERATION];
	    var lockSource = data[mopsSymbol.ACTION_LOCK];

	    var i = 0;
	    while (i < oper.length) {
	        var item = oper[i];
	        if (checkLock(lockSource, item[0], item[1])) {
	            oper.splice(i, 1);
	        } else {
	            i++;
	        }
	    }

	    var lenSource = operSource.length;
	    for (i = 0; i < lenSource; i++) {
	        var _item = operSource[i];
	        if (!checkLock(lock, _item[0], _item[1])) {
	            oper.push(_item);
	        }
	    }

	    lockSource.forEach(function (checkers, action) {
	        if (checkers === null) {
	            lock.set(action, checkers);
	        } else {
	            (function () {
	                var lockCheckers = lock.get(action);
	                if (lockCheckers) {
	                    checkers.forEach(function (checker) {
	                        return lockCheckers.add(checker);
	                    });
	                } else {
	                    lock.set(action, checkers);
	                }
	            })();
	        }
	    });

	    data.clear();

	    return true;
	};

	Operation.prototype.entries = function () {
	    return iterator(this[mopsSymbol.OPERATION]);
	};

	Operation.prototype.filter = function (action) {
	    var oper = this[mopsSymbol.OPERATION].filter(function (item) {
	        return item[0] === action;
	    });
	    return iterator(oper);
	};

	function iterator(array) {
	    var nextIndex = 0;

	    return {
	        next: function next() {
	            if (nextIndex < array.length) {
	                var _ret2 = function () {
	                    var item = array[nextIndex++];

	                    return {
	                        v: {
	                            done: false,
	                            value: function value() {
	                                return item[0].apply(this, item[1].concat(slice.call(arguments)));
	                            }
	                        }
	                    };
	                }();

	                if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
	            } else {
	                return { done: true };
	            }
	        }
	    };
	}

	function checkLock(lock, action, args) {
	    var checkers = lock.get(action);

	    if (checkers) {
	        var _ret3 = function () {
	            var isLock = false;

	            checkers.forEach(function (checker) {
	                if (!isLock && checker.apply(null, args)) {
	                    isLock = true;
	                }
	            });

	            return {
	                v: isLock
	            };
	        }();

	        if ((typeof _ret3 === 'undefined' ? 'undefined' : _typeof(_ret3)) === "object") return _ret3.v;
	    }

	    return checkers === null;
	}

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _require = __webpack_require__(2);

	var isError = _require.isError;
	var isObject = _require.isObject;
	var wrap = _require.wrap;

	var Promise = __webpack_require__(5).Promise;
	var mopsSymbol = __webpack_require__(9);

	module.exports = Action;

	/**
	 * @class
	 * @param {function} callback
	 * @returns {function}
	 */
	function Action(callback) {
	    var action = wrap(callback, wrapAction);
	    Object.defineProperty(action, mopsSymbol.SUPER, { value: callback });
	    return action;
	}

	/**
	 * @param {*} [data]
	 * @returns {Promise}
	 */
	Action.resultResolve = function (data) {
	    return result(data) || Promise.resolve();
	};

	/**
	 * @param {*} [data]
	 * @returns {Promise}
	 */
	Action.resultReject = function (data) {
	    return result(data) || Promise.reject();
	};

	/**
	 * @param {function} action
	 * @param {...*} args
	 * @returns {function}
	 * @this {Context}
	 * @private
	 */
	function wrapAction(action) {
	    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	        args[_key - 1] = arguments[_key];
	    }

	    var data = action.apply(this, args);
	    return result(data) || data;
	}

	/**
	 * @param {*} data
	 * @returns {?Promise}
	 * @private
	 */
	function result(data) {
	    if (isObject(data) && data.hasOwnProperty(mopsSymbol.QUEUE)) {
	        return data.start();
	    } else if (isError(data)) {
	        return Promise.reject(data);
	    }
	}

/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _require = __webpack_require__(2);

	var toString = _require.toString;


	module.exports = MopsError;

	/**
	 * @class
	 * @param {string} message
	 */
	function MopsError(message) {
	    this.message = toString(message);
	}

	MopsError.prototype = Object.create(Error.prototype, {
	    'constructor': {
	        'value': MopsError
	    },

	    'name': {
	        'value': 'MopsError'
	    }
	});

/***/ }
/******/ ])
});
;