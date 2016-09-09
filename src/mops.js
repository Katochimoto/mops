const isFunction = require('lodash/isFunction');
const isString = require('lodash/isString');
const isObject = require('lodash/isObject');
const toArray = require('lodash/toArray');
const invariant = require('invariant');
const mopsQueue = require('./queue');
const mopsSymbol = require('./symbol');

/**
 * @typedef {Object} Mops
 * @class
 * @augments MopsBase
 */

/**
 * @class
 * @returns {Mops}
 */
function MopsBase() {
    return this.clone();
}

/**
 * @returns {Mops}
 */
MopsBase.prototype.clone = function () {
    const Mops = function () {};
    Mops.prototype = Object.create(this);
    Mops.prototype.constructor = Mops;
    return new Mops();
};

/**
 * @returns {MopsQueue}
 */
MopsBase.prototype.queue = function () {
    return mopsQueue.create(this);
};

/**
 * @param {string|Object} actionName
 * @param {function} [action]
 * @param {number} weight
 * @returns {MopsBase}
 * @throws Declare the method name must be a string
 * @throws The value of a declared method must be a function
 */
MopsBase.prototype.define = function (actionName, action, weight) {
    if (isObject(actionName)) {
        for (let name in actionName) {
            if (actionName.hasOwnProperty(name)) {
                this.define(name, actionName[ name ]);
            }
        }

        return this;
    }

    invariant(isString(actionName), 'Declare the method name must be a string');
    invariant(isFunction(action), 'The value of a declared method must be a function');

    const method = function () {
        let queue = this.queue();
        return mopsQueue.append(queue, { action, weight, args: toArray(arguments) });
    };

    method[ mopsSymbol.SUPER ] = { action, weight };

    Object.defineProperty(this, actionName, { value: method });
    return this;
};

module.exports = new MopsBase();
