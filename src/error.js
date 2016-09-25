/* @ifdef LODASH */
const toString = require('lodash/toString');
/* @endif */
/* @ifdef NOLODASH **
const { toString } = require('lodash');
/* @endif */

module.exports = MopsError;

/**
 * @class
 * @param {string} message
 */
function MopsError(message) {
    this.message = toString(message);
}

MopsError.prototype = Object.create(Error.prototype, {
    'constructor': {
        'value': MopsError
    },

    'name': {
        'value': 'MopsError'
    }
});
