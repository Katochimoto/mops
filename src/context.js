const cloneDeepWith = require('lodash/cloneDeepWith');
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
    if (value instanceof Checked) {
        return value;
    }
}
