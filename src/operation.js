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

Operation.prototype.has = function (action) {
    return this[ mopsSymbol.OPERATION ].some(item => item[0] === action);
};

Operation.prototype.clear = function () {
    this[ mopsSymbol.OPERATION ].length = 0;
    this[ mopsSymbol.ACTION_LOCK ].clear();
};

/**
 * @param {function} [action]
 * @returns {number}
 */
Operation.prototype.size = function (action) {
    const oper = this[ mopsSymbol.OPERATION ];

    if (action) {
        return oper.filter(item => item[0] === action).length;
    }

    return oper.length;
};

Operation.prototype.lock = function (action) {
    const oper = this[ mopsSymbol.OPERATION ];

    this[ mopsSymbol.ACTION_LOCK ].add(action);

    for (let i = 0; i < oper.length; i++) {
        if (oper[ i ][0] === action) {
            oper.splice(i, 1);
        }
    }
};

Operation.prototype.unlock = function (action) {
    this[ mopsSymbol.ACTION_LOCK ].delete(action);
};

Operation.prototype.isLock = function (action) {
    return this[ mopsSymbol.ACTION_LOCK ].has(action);
};

Operation.prototype.merge = function (data) {
    if (!data || !(data instanceof Operation)) {
        return false;
    }

    const lock = this[ mopsSymbol.ACTION_LOCK ];
    const oper = this[ mopsSymbol.OPERATION ];
    const operSource = data[ mopsSymbol.OPERATION ];
    const lockSource = data[ mopsSymbol.ACTION_LOCK ];

    for (let i = 0; i < oper.length; i++) {
        if (lockSource.has(oper[ i ][0])) {
            oper.splice(i, 1);
        }
    }

    const lenSource = operSource.length;
    for (let i = 0; i < lenSource; i++) {
        const item = operSource[ i ];
        if (!lock.has(item[0])) {
            oper.push(item);
        }
    }

    lockSource.forEach(function (action) {
        lock.add(action);
    });

    return true;
};

Operation.prototype.entries = function () {
    return iterator(this[ mopsSymbol.OPERATION ]);
};

Operation.prototype.filter = function (action) {
    const oper = this[ mopsSymbol.OPERATION ].filter(item => item[0] === action);
    return iterator(oper);
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
