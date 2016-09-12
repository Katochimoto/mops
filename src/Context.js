const cloneDeep = require('lodash/cloneDeep');

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

    Object.defineProperty(this, 'data', { value: cloneDeep(data) });
    return Object.freeze(this);
}
