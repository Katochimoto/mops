const invariant = require('invariant');
const forOwn = require('lodash/forOwn');
const rearg = require('lodash/rearg');
const wrap = require('lodash/wrap');
const partial = require('lodash/partial');
const cloneDeep = require('lodash/cloneDeep');
const isNumber = require('lodash/isNumber');
const isObject = require('lodash/isObject');
const sortBy = require('lodash/sortBy');
const noop = require('lodash/noop');
const Promise = require('es6-promise').Promise;

const QUEUE = Symbol('mops-queue');
const QUEUE_WRAP = {
    then: {
        value: function (params) {
            return this.cond(true, ...params);
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
    const typeActionName = typeof actionName;
    const typeAction = typeof action;

    if (typeActionName === 'object') {
        forOwn(actionName, rearg(this.define.bind(this), 1, 0));

    } else if (typeActionName === 'string' && typeAction === 'function') {
        Object.defineProperty(this, actionName, {
            value: function () {
                let queue = this.queue();
                return append(queue, { action: action.bind(queue, ...arguments), weight });
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
    let data = partial(func, ...args)();

    if (isObject(data) && data.hasOwnProperty(QUEUE)) {
        return data.start();
    }

    return data;
}

function execute(queue, promise) {
    let task = queue.shift();

    if (!task) {
        return promise;
    }

    let { action, condition, rejected } = task;
    action = wrap(action, wrapAction);

    // if (condition) {
    // }

    promise = do {
        if (rejected) {
            promise.catch(action);

        } else {
            promise.then(action);
        }
    };

    return execute(queue, promise.then(noop, noop));
}

function append(queue, params) {
    let { action, weight } = params;

    if (typeof action === 'string' && queue.hasOwnProperty(action)) {
        action = queue[ action ];
    }

    invariant(typeof action === 'function', 'Add only possible method or function');

    if (!isNumber(weight)) {
        params.weight = 100;
    }

    queue[ QUEUE ].push(params);
    return queue;
}
