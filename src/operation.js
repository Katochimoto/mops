const cloneDeep = require('lodash/cloneDeep');

/**
 * @param {*} data
 * @returns {MopsOperation}
 */
module.exports = function MopsOperation(data) {
    Object.defineProperty(this, 'data', { value: cloneDeep(data) });
    return Object.freeze(this);
};
