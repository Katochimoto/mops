/* @ifdef LODASH */
const cloneDeepWith = require('lodash/cloneDeepWith');
/* @endif */
/* @ifdef NOLODASH **
const { cloneDeepWith } = require('lodash');
/* @endif */
const Checked = require('./checked');
const Operation = require('./operation');

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
    if (value instanceof Checked ||
        value instanceof Operation) {

        return value;
    }
}
