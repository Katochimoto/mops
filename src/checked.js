const castArray = require('lodash/castArray');
const toArray = require('lodash/toArray');
const Set = require('es6-set');
const Map = require('es6-map');
const mopsSymbol = require('./symbol');

module.exports = Checked;

/**
 * @class
 * @param {array} [checked]
 */
function Checked(checked) {
    Object.defineProperty(this, mopsSymbol.CHECKED, {
        value: new Set(Array.isArray(checked) ? checked : [])
    });
}

/**
 * @param {*} obj
 */
Checked.prototype.check = function (obj) {
    this[ mopsSymbol.CHECKED ].add(obj);
};

/**
 * @param {*} obj
 */
Checked.prototype.uncheck = function (obj) {
    this[ mopsSymbol.CHECKED ].delete(obj);
};

/**
 * @param {*} obj
 * @returns {boolean}
 */
Checked.prototype.has = function (obj) {
    return this[ mopsSymbol.CHECKED ].has(obj);
};

Checked.prototype.clear = function () {
    this[ mopsSymbol.CHECKED ].clear();
};

/**
 * @returns {number}
 */
Checked.prototype.size = function () {
    return this[ mopsSymbol.CHECKED ].size;
};

/**
 * @returns {array}
 */
Checked.prototype.toArray = function () {
    return toArray(this[ mopsSymbol.CHECKED ]);
};

/**
 * @param {function} getItemGroups
 * @returns {array} [[ group1, [...] ], [ group2, [...] ], [ group3, [...] ]]
 */
Checked.prototype.getGroups = function (getItemGroups) {
    const groups = new Map();

    this[ mopsSymbol.CHECKED ].forEach(function mopsCheckedIterator(item) {
        const itemGroups = castArray(getItemGroups(item) || []);
        if (itemGroups.length) {
            itemGroups
                .map(getSgroup, groups)
                .forEach(addInSgroup, item);
        }
    });

    return toArray(groups);
};

/**
 * @param {function} getItemGroups
 * @returns {Checked}
 */
Checked.prototype.getCheckedGroups = function (getItemGroups) {
    const checked = new Set(this[ mopsSymbol.CHECKED ]);
    const groups = new Map();

    checked.forEach(function mopsCheckedIterator(item) {
        const itemGroups = castArray(getItemGroups(item) || []);
        if (itemGroups.length) {
            itemGroups
                .map(getSgroup, groups)
                .forEach(addInSgroup, item);
        }
    });

    groups.forEach(groupsIterator, checked);
    groups.clear();

    return new this.constructor(toArray(checked));
};

function groupsIterator(items, group) {
    if (this.has(group)) {
        items.forEach(clearFromGroup, this);
    }
}

function getSgroup(group) {
    let sgroup = this.get(group);

    if (!sgroup) {
        sgroup = [];
        this.set(group, sgroup);
    }

    return sgroup;
}

function addInSgroup(sgroup) {
    sgroup.push(this);
}

function clearFromGroup(item) {
    this.delete(item);
}
