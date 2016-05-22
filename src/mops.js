const isObject = require('lodash/isObject');
const isFunction = require('lodash/isFunction');
const isString = require('lodash/isString');
const rearg = require('lodash/rearg');
const forOwn = require('lodash/forOwn');
const invariant = require('invariant');
const mopsQueue = require('./queue');
const mopsSymbol = require('./symbol');

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
    return mopsQueue.create();
};

MopsBase.prototype.define = function (actionName, action, weight) {
    if (isObject(actionName)) {
        forOwn(actionName, rearg(this.define.bind(this), 1, 0));
        return this;
    }

    invariant(isString(actionName), 'Declare the method name must be a string');
    invariant(isFunction(action), 'The value of a declared method must be a function');

    Object.defineProperty(this, actionName, {
        value: function () {
            let queue = this.queue();
            return mopsQueue.append(queue, { action: action.bind(queue, ...arguments), weight });
        }
    });

    this[ actionName ][ mopsSymbol.SUPER ] = { action, weight };

    return this;
};

module.exports = new MopsBase();
