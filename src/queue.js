const isNumber = require('lodash/isNumber');
const isObject = require('lodash/isObject');
const isFunction = require('lodash/isFunction');
const isString = require('lodash/isString');
const isUndefined = require('lodash/isUndefined');
const isNil = require('lodash/isNil');
const sortBy = require('lodash/sortBy');
const wrap = require('lodash/wrap');
const assign = require('lodash/assign');
const invariant = require('invariant');
const Promise = require('es6-promise').Promise;
const mopsSymbol = require('./symbol');
const MopsOperation = require('./operation');

exports.create = create;
exports.append = append;

const QUEUE_WRAP = {
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
            onFulfilled && append(this, { action: onFulfilled, condition });
            onRejected && append(this, { action: onRejected, rejected: true, condition });
            return this;
        }
    },

    start: {
        value: function (operation) {
            let tasks = sortBy(this[ mopsSymbol.QUEUE ], 'weight');
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
        value: function () {
            return this;
        }
    },

    define: {
        value: function () {
            invariant(false, 'Cannot define a method in the queue');
        }
    },

    clone: {
        value: function () {
            invariant(false, 'The queue cannot be cloned');
        }
    }
};

/**
 * @returns {MopsQueue}
 */
function create() {
    const MopsQueue = function () {
        Object.defineProperty(this, mopsSymbol.QUEUE, { value: [], writable: true });
        Object.defineProperty(this, 'operation', { value: null, writable: true });
    };

    MopsQueue.prototype = Object.create(this, QUEUE_WRAP);
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
 */
function append(queue, params) {
    if (isString(params.action) && isFunction(queue[ params.action ])) {
        params = assign(params, queue[ params.action ][ mopsSymbol.SUPER ]);
    }

    invariant(isFunction(params.action), 'Add only possible method or function');

    params.action = params.action.bind(queue);

    if (!isNumber(params.weight)) {
        params.weight = 100;
    }

    queue[ mopsSymbol.QUEUE ].push(params);
    return queue;
}

/**
 * @param {function} action
 * @param {...*} args
 * @returns {function}
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
 */
function wrapCondition(condition, action, ...args) {
    return Promise.resolve(isFunction(condition) ? condition() : condition).then(function (data) {
        if (isUndefined(data) || Boolean(data)) {
            return wrapAction(action, ...args);
        }
    });
}

/**
 * @param {*} data
 * @returns {?Promise}
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
 */
function execute(tasks, promise) {
    let task = tasks.shift();

    if (!task) {
        return promise;
    }

    let { action, condition, rejected } = task;
    let wrapper = isNil(condition) ? wrapAction : wrap(condition, wrapCondition);

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
