const mopsSymbol = require('./symbol');

module.exports = Operation;

const slice = Array.prototype.slice;

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
    const len = array.length;
    let nextIndex = 0;

    return {
        next: function () {
            if (nextIndex < len) {
                const item = array[ nextIndex++ ];

                return {
                    value: function () {
                        return item[0].apply(this, item[1].concat(slice.call(arguments)));
                    },
                    done: false
                };

            } else {
                return { done: true };
            }
        }
    };
}
