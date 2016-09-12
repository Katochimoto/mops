const isFunction = require('lodash/isFunction');
const isUndefined = require('lodash/isUndefined');
const toArray = require('lodash/toArray');
const partialRight = require('lodash/partialRight');
const invariant = require('invariant');
const Promise = require('es6-promise').Promise;
const mopsSymbol = require('./symbol');
const Context = require('./Context');
const Action = require('./Action');

module.exports = Queue;

/**
 * @class
 * @param {mops.Context} [context]
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
Queue.prototype.then = function (onFulfilled, onRejected, ...args) {
    if (!isUndefined(onRejected) && !isFunction(onRejected)) {
        args.unshift(onRejected);
        onRejected = undefined;
    }

    const isErrored = Boolean((!onFulfilled && onRejected) || (onFulfilled === onRejected));

    if (onFulfilled) {
        append(this, { args, isErrored, action: onFulfilled });
    }

    if (onRejected) {
        append(this, { args, isErrored, action: onRejected, rejected: true });
    }

    return this;
};

/**
 * @param {mops.Action|function} action
 * @param {...*} [args]
 * @returns {mops.Queue}
 */
Queue.prototype.catch = function (action, ...args) {
    return this.then(null, action, ...args);
};

/**
 * @param {mops.Action|function} action
 * @param {...*} [args]
 * @returns {mops.Queue}
 */
Queue.prototype.always = function (action, ...args) {
    return this.then(action, action, ...args);
};

/**
 * @returns {Promise}
 */
Queue.prototype.start = function () {
    const context = this[ mopsSymbol.CONTEXT ];
    const tasks = this[ mopsSymbol.QUEUE ];
    this[ mopsSymbol.QUEUE ] = [];

    let promise = Promise.resolve();

    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[ i ];
        const action = do {
            if (task.isErrored) {
                partialRight(task.action.bind(context), ...toArray(task.args));

            } else {
                task.action.bind(context, ...toArray(task.args));
            }
        };

        promise = do {
            if (task.rejected) {
                promise.then(Action.resultResolve, action);

            } else {
                promise.then(action, Action.resultReject);
            }
        };
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

    queue[ mopsSymbol.QUEUE ].push(params);
    return queue;
}
