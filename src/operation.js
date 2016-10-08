/* @ifdef LODASH */
const isFunction = require('lodash/isFunction');
const toString = require('lodash/toString');
/* @endif */
/* @ifdef NOLODASH **
const { isFunction, toString } = require('lodash');
/* @endif */

const Set = require('es6-set');
const Map = require('es6-map');
const mopsSymbol = require('./symbol');

module.exports = Operation;

const slice = Array.prototype.slice;

/**
 * @class
 */
function Operation() {
    Object.defineProperty(this, mopsSymbol.OPERATION, { value: [] });
    Object.defineProperty(this, mopsSymbol.ACTION_LOCK, { value: new Map() });
    Object.defineProperty(this, mopsSymbol.ACTION_GROUP, { value: new Map() });
}

Operation.prototype.add = function (action, ...args) {
    if (checkLock(this[ mopsSymbol.ACTION_LOCK ], action, args)) {
        return false;
    }

    this[ mopsSymbol.OPERATION ].push([ action, args ]);
    return true;
};

Operation.prototype.addUniq = function (action, ...args) {
    const len = args.length;
    const resolver = len > 1 && isFunction(args[ len - 1 ]) ? args.pop() : null;
    const cacheKey = resolver && resolver(...args) || toString(args) || 'default';

    if (checkUniq(this[ mopsSymbol.ACTION_GROUP ], action, cacheKey)) {
        return false;
    }

    if (checkLock(this[ mopsSymbol.ACTION_LOCK ], action, args)) {
        return false;
    }

    this[ mopsSymbol.OPERATION ].push([ action, args, cacheKey ]);

    const group = this[ mopsSymbol.ACTION_GROUP ];
    const groupAction = group.get(action);

    if (groupAction) {
        groupAction.add(cacheKey);

    } else {
        group.set(action, new Set([ cacheKey ]));
    }
};

Operation.prototype.has = function (action) {
    return this[ mopsSymbol.OPERATION ].some(item => item[0] === action);
};

Operation.prototype.clear = function () {
    this[ mopsSymbol.OPERATION ].length = 0;
    this[ mopsSymbol.ACTION_LOCK ].clear();
    this[ mopsSymbol.ACTION_GROUP ].clear();
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

/**
 * @param {function} action
 * @param {function} [checker] _.partial(function(checkerArg, callArg1, ...) { return true; }, 'test')
 */
Operation.prototype.lock = function (action, checker) {
    const lock = this[ mopsSymbol.ACTION_LOCK ];
    const checkers = lock.get(action);

    if (checkers === null) {
        return;
    }

    if (!checker) {
        lock.set(action, null);

    } else if (checkers) {
        checkers.add(checker);

    } else {
        lock.set(action, new Set([ checker ]));
    }

    const oper = this[ mopsSymbol.OPERATION ];
    for (let i = 0; i < oper.length; i++) {
        if (oper[ i ][0] === action) {
            if (checker) {
                if (checker.apply(null, oper[ i ][1])) {
                    oper.splice(i, 1);
                }

            } else {
                oper.splice(i, 1);
            }
        }
    }
};

Operation.prototype.unlock = function (action, checker) {
    const lock = this[ mopsSymbol.ACTION_LOCK ];

    if (checker) {
        const checkers = lock.get(action);
        checkers && checkers.delete(checker);

    } else {
        lock.delete(action);
    }
};

Operation.prototype.isLock = function (action, checker) {
    const lock = this[ mopsSymbol.ACTION_LOCK ];

    if (checker) {
        const checkers = lock.get(action);
        return checkers && checkers.has(checker) || false;

    } else {
        return lock.has(action);
    }
};

Operation.prototype.merge = function (data) {
    if (!data || !(data instanceof Operation)) {
        return false;
    }

    const group = this[ mopsSymbol.ACTION_GROUP ];
    const lock = this[ mopsSymbol.ACTION_LOCK ];
    const oper = this[ mopsSymbol.OPERATION ];
    const groupSource = data[ mopsSymbol.ACTION_GROUP ];
    const lockSource = data[ mopsSymbol.ACTION_LOCK ];
    const operSource = data[ mopsSymbol.OPERATION ];

    let i = 0;
    while (i < oper.length) {
        const item = oper[ i ];
        if (checkLock(lockSource, item[0], item[1])) {
            oper.splice(i, 1);

        } else {
            i++;
        }
    }

    const lenSource = operSource.length;
    for (i = 0; i < lenSource; i++) {
        const item = operSource[ i ];
        if (!checkLock(lock, item[0], item[1]) &&
            !checkUniq(group, item[0], item[2])) {

            oper.push(item);
        }
    }

    lockSource.forEach(lockIterator, lock);
    groupSource.forEach(groupIterator, group);

    data.clear();

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

function checkLock(lock, action, args) {
    const checkers = lock.get(action);

    if (checkers) {
        let isLock = false;

        checkers.forEach(function (checker) {
            if (!isLock && checker.apply(null, args)) {
                isLock = true;
            }
        });

        return isLock;
    }

    return checkers === null;
}

function checkUniq(group, action, cacheKey) {
    if (!cacheKey) {
        return false;
    }

    const cache = group.get(action);
    return cache && cache.has(cacheKey) || false;
}

function groupIterator(cache, action) {
    const group = this.get(action);

    if (group) {
        cache.forEach(item => group.add(item));

    } else {
        this.set(action, cache);
    }
}

function lockIterator(checkers, action) {
    if (checkers === null) {
        this.set(action, checkers);

    } else {
        const lock = this.get(action);

        if (lock) {
            checkers.forEach(checker => lock.add(checker));

        } else {
            this.set(action, checkers);
        }
    }
}
