const Set = require('es6-set');
const mopsSymbol = require('./symbol');

module.exports = Operation;

const slice = Array.prototype.slice;

/**
 * @class
 */
function Operation() {
    Object.defineProperty(this, mopsSymbol.OPERATION, { value: [] });
    Object.defineProperty(this, mopsSymbol.ACTION_LOCK, { value: new Set() });
}

Operation.prototype.add = function (action, ...args) {
    if (this[ mopsSymbol.ACTION_LOCK ].has(action)) {
        return false;
    }

    this[ mopsSymbol.OPERATION ].push([ action, args ]);
    return true;
};

Operation.prototype.clear = function () {
    this[ mopsSymbol.OPERATION ] = [];
    this[ mopsSymbol.ACTION_LOCK ].clear();
};

/**
 * @returns {number}
 */
Operation.prototype.size = function () {
    return this[ mopsSymbol.OPERATION ].length;
};

Operation.prototype.lock = function (action) {
    this[ mopsSymbol.ACTION_LOCK ].add(action);
};

Operation.prototype.unlock = function (action) {
    this[ mopsSymbol.ACTION_LOCK ].delete(action);
};

Operation.prototype.merge = function (operation) {
    if (!operation || !(operation instanceof Operation)) {
        return;
    }

    operation[ mopsSymbol.ACTION_LOCK ].forEach(function (action) {
        this[ mopsSymbol.ACTION_LOCK ].add(action);
    }, this);

    this[ mopsSymbol.OPERATION ] =
        this[ mopsSymbol.OPERATION ]
        .concat(operation[ mopsSymbol.OPERATION ])
        .filter(item => !this[ mopsSymbol.ACTION_LOCK ].has(item[0]));
};

Operation.prototype.entries = function () {
    return iterator(this[ mopsSymbol.OPERATION ]);
};

Operation.prototype.filter = function (action) {
    const actions = this[ mopsSymbol.OPERATION ].filter(item => item[0] === action);
    return iterator(actions);
};

function iterator(array) {
    let nextIndex = 0;

    return {
        next: function () {
            if (nextIndex < array.length) {
                const item = array[ nextIndex++ ];

                return {
                    done: false,
                    value: function () {
                        return item[0].apply(this, item[1].concat(slice.call(arguments)));
                    }
                };

            } else {
                return { done: true };
            }
        }
    };
}
