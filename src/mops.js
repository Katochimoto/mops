const cloneDeep = require('lodash/cloneDeep');
const forOwn = require('lodash/forOwn');
const isNumber = require('lodash/isNumber');
const isObject = require('lodash/isObject');
const isFunction = require('lodash/isFunction');
const isString = require('lodash/isString');
const isNil = require('lodash/isNil');
const rearg = require('lodash/rearg');
const sortBy = require('lodash/sortBy');
const wrap = require('lodash/wrap');
const invariant = require('invariant');
const Promise = require('es6-promise').Promise;
const Symbol = require('es6-symbol');

const QUEUE = Symbol('mops-queue');
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
            let queue = sortBy(this[ QUEUE ], 'weight');
            this[ QUEUE ] = [];

            this.operation = do {
                if (operation instanceof MopsOperation) {
                    operation;

                } else {
                    new MopsOperation(operation);
                }
            };

            return execute(queue, Promise.resolve());
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

function MopsBase() {
    return this.clone();
}

MopsBase.prototype.clone = function () {
    const Mops = function () {};
    Mops.prototype = Object.create(this);
    Mops.prototype.constructor = Mops;
    return new Mops();
};

MopsBase.prototype.queue = function () {
    const MopsQueue = function () {
        Object.defineProperty(this, QUEUE, { value: [], writable: true });
        Object.defineProperty(this, 'operation', { value: null, writable: true });
    };

    MopsQueue.prototype = Object.create(this, QUEUE_WRAP);
    MopsQueue.prototype.constructor = MopsQueue;

    return new MopsQueue();
};

MopsBase.prototype.define = function (actionName, action, weight) {
    if (isObject(actionName)) {
        forOwn(actionName, rearg(this.define.bind(this), 1, 0));

    } else if (isString(actionName) && isFunction(action)) {
        Object.defineProperty(this, actionName, {
            value: function () {
                let queue = this.queue();
                return append(queue, { weight, action: action.bind(queue, ...arguments) });
            }
        });
    }

    return this;
};

module.exports = new MopsBase();

function MopsOperation(data) {
    Object.defineProperty(this, 'data', { value: cloneDeep(data) });
    return Object.freeze(this);
}

function wrapAction(func, ...args) {
    let data = func(...args);
    return result(data) || data;
}

function execute(queue, promise) {
    let task = queue.shift();

    if (!task) {
        return promise;
    }

    let { action, condition, rejected } = task;

    action = wrap(action, wrapAction);

    if (!isNil(condition)) {
        action = wrap(action, function (func) {
            return Promise.resolve(isFunction(condition) ? condition() : condition).then(func);
        });
    }

    promise = do {
        if (rejected) {
            promise.catch(action);

        } else {
            promise.then(action);
        }
    };

    return execute(queue, promise.then(result, result));
}

function result(data) {
    if (isObject(data) && data.hasOwnProperty(QUEUE)) {
        return data.start();
    }
}

function append(queue, params) {
    let { action, weight } = params;

    if (isString(action) && isFunction(queue[ action ])) {
        // TODO передать condition и другие параметры
        return queue[ action ]();
    }

    invariant(isFunction(action), 'Add only possible method or function');

    if (!isNumber(weight)) {
        params.weight = 100;
    }

    queue[ QUEUE ].push(params);
    return queue;
}
