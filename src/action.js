/* @ifdef LODASH */
const isError = require('lodash/isError');
const isObject = require('lodash/isObject');
const wrap = require('lodash/wrap');
/* @endif */
/* @ifdef NOLODASH **
const { isError, isObject, wrap } = require('lodash');
/* @endif */
const { Promise } = require('vow');
const mopsSymbol = require('./symbol');

module.exports = Action;

/**
 * @class
 * @param {function} callback
 * @returns {function}
 */
function Action(callback) {
    const action = wrap(callback, wrapAction);
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
function wrapAction(action, ...args) {
    const data = action.apply(this, args);
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
