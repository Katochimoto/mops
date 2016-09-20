const toArray = require('lodash/toArray');
const Map = require('es6-map');
const mopsSymbol = require('./symbol');

module.exports = Operation;

/**
 * @class
 */
function Operation() {
    Object.defineProperty(this, mopsSymbol.OPERATION, {
        value: new Map()
    });
}

Operation.prototype.set = function (object, action) {
    const objects = this[ mopsSymbol.OPERATION ];
    const actions = objects.get(object);

    if (actions) {
        let count = actions.get(action) || 0;
        actions.set(action, ++count);

    } else {
        objects.set(object, new Map([ [ action, 1 ] ]));
    }
};

Operation.prototype.delete = function (object, action) {
    const actions = this[ mopsSymbol.OPERATION ].get(object);

    if (!actions) {
        return;
    }

    let count = actions.get(action) || 0;
    count--;

    if (count > 0) {
        actions.set(action, count);

    } else {
        actions.delete(action);
    }
};

Operation.prototype.has = function (object, action) {
    const objects = this[ mopsSymbol.OPERATION ];

    if (action) {
        const actions = objects.get(object);
        return Boolean(actions && actions.has(action));

    } else {
        return objects.has(object);
    }
};

Operation.prototype.clear = function (object, action) {
    const objects = this[ mopsSymbol.OPERATION ];

    if (action) {
        const actions = objects.get(object);

        if (actions) {
            actions.delete(action);
        }

    } else if (object) {
        objects.delete(object);

    } else {
        objects.clear();
    }
};

/**
 * @returns {number}
 */
Operation.prototype.size = function () {
    return this[ mopsSymbol.OPERATION ].size;
};

/**
 * @returns {array}
 */
Operation.prototype.toArray = function () {
    const objects = [];

    this[ mopsSymbol.OPERATION ].forEach(function operationIterator(actions, object) {
        objects.push([ object, toArray(actions) ]);
    });

    return objects;
};

/**
 * @param {function} action
 * @returns {array} [[ object1, count1 ], [ object2, count2 ], [ object3, count3 ], ...]
 */
Operation.prototype.getObjectsByAction = function (action) {
    const objects = [];

    this[ mopsSymbol.OPERATION ].forEach(function operationIterator(actions, object) {
        const count = actions.get(action);
        if (count > 0) {
            objects.push([ object, count ]);
        }
    });

    return objects;
};
