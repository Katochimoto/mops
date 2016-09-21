const spread = require('lodash/spread');
const partial = require('lodash/partial');
const flatten = require('lodash/flatten');
const mopsSymbol = require('./symbol');

module.exports = Operation;

const wrapper = spread(partial);

/**
 * @class
 */
function Operation() {
    Object.defineProperty(this, mopsSymbol.OPERATION, { value: [] });
}

Operation.prototype.add = function (action, ...args) {
    this[ mopsSymbol.OPERATION ].push([
        action,
        args
    ]);

    return this;
};

Operation.prototype.clear = function () {
    this[ mopsSymbol.OPERATION ] = [];
};

/**
 * @returns {number}
 */
Operation.prototype.size = function () {
    return this[ mopsSymbol.OPERATION ].length;
};

Operation.prototype.entries = function () {
    return iterator(this[ mopsSymbol.OPERATION ]);
};

Operation.prototype.filter = function (action) {
    const actions = this[ mopsSymbol.OPERATION ].filter(item => item[0] === action);
    return iterator(actions);
};

function iterator(array) {
    var nextIndex = 0;

    return {
        next: function () {
            return nextIndex < array.length ?
                { value: wrapper(flatten(array[ nextIndex++ ])), done: false } :
                { done: true };
        }
    };
}
