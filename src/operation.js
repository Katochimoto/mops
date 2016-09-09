const cloneDeep = require('lodash/cloneDeep');
const MopsError = require('./error');

module.exports = MopsOperation;

/**
 * @param {*} data
 * @returns {MopsOperation}
 */
function MopsOperation(data) {
    Object.defineProperty(this, 'data', { value: cloneDeep(data) });
    return Object.freeze(this);
}

/**
 * @param {string} message
 * @returns {MopsError}
 */
MopsOperation.prototype.error = function (message) {
    return new MopsError(message);
};
