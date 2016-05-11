/*
import isPlainObject from 'lodash/isPlainObject';
import forOwn from 'lodash/forOwn';
import rearg from 'lodash/rearg';
import isString from 'lodash/isString';
import isFunction from 'lodash/isFunction';
import wrap from 'lodash/wrap';
import partial from 'lodash/partial';
import create from 'lodash/create';
const ACTIONS = Symbol('mops-actions');
*/

const forOwn = require('lodash/forOwn');
const rearg = require('lodash/rearg');
const wrap = require('lodash/wrap');
const partial = require('lodash/partial');
const cloneDeep = require('lodash/cloneDeep');

const QUEUE = Symbol('mops-queue');
const WRAP = {
    append: {
        value: function (action, weight = 100) {
            this[ QUEUE ].push([ action, weight ]);
            return this;
        }
    },

    then: {
        value: function () {}
    },

    catch: {
        value: function () {}
    },

    cond: {
        value: function () {}
    },

    start: {
        value: function () {
            let queue = this[ QUEUE ];
            this[ QUEUE ] = [];
        }
    },

    clone: {
        value: function () {
            throw new Error('The queue cannot be cloned');
        }
    },

    queue: {
        value: function () {
            return this;
        }
    },

    define: {
        value: function () {
            throw new Error('Cannot define a method in the queue');
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

MopsBase.prototype.queue = function (data) {
    const MopsQueue = function (operationData) {
        this[ QUEUE ] = [];
        Object.defineProperty(this, 'operation', { value: new MopsOperation(operationData) });
    };

    MopsQueue.prototype = Object.create(this, WRAP);
    MopsQueue.prototype.constructor = MopsQueue;

    return new MopsQueue(data);
};

MopsBase.prototype.define = function (actionName, action, weight) {
    const typeActionName = typeof actionName;

    switch (typeActionName) {
    case 'object':
        forOwn(actionName, rearg(this.define.bind(this), 1, 0));
        break;

    case 'string':
        if (typeof action === 'function') {
            Object.defineProperty(this, actionName, {
                value: function () {
                    return this.queue().append(wrap(action, wrapAction), weight);
                }
            });
        }
        break;
    }

    return this;
};

module.exports = new MopsBase();

function MopsOperation(data) {
    Object.defineProperty(this, 'data', { value: cloneDeep(data) });
}

function wrapAction(func, ...args) {
    return new Promise(partial(func, ...args));
}
