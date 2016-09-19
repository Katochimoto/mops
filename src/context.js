const cloneDeepWith = require('lodash/cloneDeepWith');
const isSet = require('lodash/isSet');
const isMap = require('lodash/isMap');
const isWeakMap = require('lodash/isWeakMap');
const isWeakSet = require('lodash/isWeakSet');
const Checked = require('./checked');

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
    if (value instanceof Checked || isSet(value) || isMap(value) || isWeakMap(value) || isWeakSet(value)) {
        return value;
    }
}
