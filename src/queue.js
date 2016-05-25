const isFunction = require('lodash/isFunction');
const isString = require('lodash/isString');
const isObject = require('lodash/isObject');
const isNil = require('lodash/isNil');
const isNumber = require('lodash/isNumber');
const isUndefined = require('lodash/isUndefined');
const wrap = require('lodash/wrap');
const assign = require('lodash/assign');
const invariant = require('invariant');
const Promise = require('es6-promise').Promise;
const mopsSymbol = require('./symbol');
const MopsOperation = require('./operation');

exports.create = create;
exports.append = append;

/**
 * @constant
 * @type {Object}
 */
const QUEUE_MIXIN = {
    then: {
        value: function () {
            return this.cond(null, ...arguments);
        }
    },

    catch: {
        value: function (action) {
            return append(this, { action, rejected: true });
        }
    },

    cond: {
        value: function (condition, onFulfilled, onRejected) {
            if (onFulfilled) {
                append(this, { action: onFulfilled, condition });
            }

            if (onRejected) {
                append(this, { action: onRejected, rejected: true, condition });
            }

            return this;
        }
    },

    start: {
        /**
         * @function start
         * @memberof MopsQueue
         * @param {*|MopsOperation} operation
         * @returns {Promise}
         */
        value: function (operation) {
            let tasks = this[ mopsSymbol.QUEUE ].sort(sortByWeight);
            this[ mopsSymbol.QUEUE ] = [];

            this.operation = do {
                if (operation instanceof MopsOperation) {
                    operation;

                } else {
                    new MopsOperation(operation);
                }
            };

            return execute(tasks, Promise.resolve());
        }
    },

    queue: {
        /**
         * @function queue
         * @memberof MopsQueue
         * @returns {MopsQueue}
         */
        value: function () {
            return this;
        }
    },

    define: {
        /**
         * @function define
         * @memberof MopsQueue
         * @throws Cannot define a method in the queue
         */
        value: function () {
            invariant(false, 'Cannot define a method in the queue');
        }
    },

    clone: {
        /**
         * @function clone
         * @memberof MopsQueue
         * @throws The queue cannot be cloned
         */
        value: function () {
            invariant(false, 'The queue cannot be cloned');
        }
    }
};

/**
 * @typedef {Object} MopsQueue
 * @class
 * @augments Mops
 */

/**
 * @param {Mops} mops
 * @returns {MopsQueue}
 */
function create(mops) {
    const MopsQueue = function () {
        Object.defineProperty(this, mopsSymbol.QUEUE, { value: [], writable: true });
        Object.defineProperty(this, 'operation', { value: null, writable: true });
    };

    MopsQueue.prototype = Object.create(mops, QUEUE_MIXIN);
    MopsQueue.prototype.constructor = MopsQueue;

    return new MopsQueue();
}

/**
 * @param {MopsQueue} queue
 * @param {Object} params
 * @param {string|function} params.action
 * @param {number} [params.weight=100]
 * @param {boolean} [params.rejected=false]
 * @param {boolean|function|Promise} [params.condition=true]
 * @returns {MopsQueue}
 * @throws Add only possible method or function
 */
function append(queue, params) {
    if (isString(params.action) && isFunction(queue[ params.action ])) {
        params = assign(params, queue[ params.action ][ mopsSymbol.SUPER ]);
    }

    invariant(isFunction(params.action), 'Add only possible method or function');

    params.action = params.action.bind(queue);

    if (isNumber(params.weight)) {
        params.weight = 100;
    }

    queue[ mopsSymbol.QUEUE ].push(params);
    return queue;
}

/**
 * @param {function} action
 * @param {...*} args
 * @returns {function}
 * @private
 */
function wrapAction(action, ...args) {
    let data = action(...args);
    return result(data) || data;
}

/**
 * @param {boolean|function|Promise} condition
 * @param {function} action
 * @param {...*} args
 * @returns {function}
 * @private
 */
function wrapCondition(condition, action, ...args) {
    condition = isFunction(condition) ? condition() : condition;

    return Promise.resolve(condition).then(function (data) {
        if (isUndefined(data) || Boolean(data)) {
            return wrapAction(action, ...args);
        }
    });
}

/**
 * @param {*} data
 * @returns {?Promise}
 * @private
 */
function result(data) {
    if (isObject(data) && data.hasOwnProperty(mopsSymbol.QUEUE)) {
        return data.start();
    }
}

/**
 * @param {array} tasks
 * @param {Promise} promise
 * @returns {Promise}
 * @private
 */
function execute(tasks, promise) {
    let task = tasks.shift();

    if (!task) {
        return promise;
    }

    let { action, condition, rejected } = task;
    let wrapper = do {
        if (isNil(condition)) {
            wrapAction;

        } else {
            wrap(condition, wrapCondition);
        }
    };

    action = wrap(action, wrapper);

    promise = do {
        if (rejected) {
            promise.catch(action);

        } else {
            promise.then(action);
        }
    };

    return execute(tasks, promise.then(result, result));
}

/**
 * @param {Object} p1
 * @param {Object} p2
 * @returns {number}
 * @private
 */
function sortByWeight(p1, p2) {
    if (p1.weight > p2.weight) {
        return 1;

    } else if (p1.weight < p2.weight) {
        return -1;
    }

    return 0;
}
