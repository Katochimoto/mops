const castArray = require('lodash/castArray');
const flattenDeep = require('lodash/flattenDeep');
const Set = require('es6-set');
const Map = require('es6-map');
const mopsSymbol = require('./symbol');

module.exports = Checked;

/**
 * @class
 */
function Checked() {
    Object.defineProperty(this, mopsSymbol.CHECKED, { value: new Set(flattenDeep(arguments)) });
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

Checked.prototype.reset = function () {
    this[ mopsSymbol.CHECKED ].clear();
};

/**
 * @returns {number}
 */
Checked.prototype.size = function () {
    return this[ mopsSymbol.CHECKED ].size;
};

/**
 * @returns {Set}
 */
Checked.prototype.getObjects = function () {
    return new Set(this[ mopsSymbol.CHECKED ]);
};

/**
 * @param {function} getItemGroups
 * @returns {Set}
 */
Checked.prototype.getGroupsObjects = function (getItemGroups) {
    const checked = new Set(this[ mopsSymbol.CHECKED ]);
    const groups = new Map();

    checked.forEach(function checkedIterator(item) {
        const sgroup = groups.get(item);

        if (sgroup && sgroup.length) {
            sgroup.forEach(clearFromGroup, checked);
            groups.set(item, null);
        }

        const itemGroups = castArray(getItemGroups(item) || []);

        if (itemGroups.length) {
            const inGroup = itemGroups.some(checkInGroup, groups);

            if (inGroup) {
                checked.delete(item);

            } else {
                itemGroups
                    .map(getSgroup, groups)
                    .forEach(addInSgroup, item);
            }
        }
    });

    groups.clear();
    return checked;
};

/**
 * @param {function} getItemGroups
 * @returns {Map}
 */
Checked.prototype.getGroups = function (getItemGroups) {
    const groups = new Map();

    this[ mopsSymbol.CHECKED ].forEach(function checkedIterator(item) {
        const itemGroups = castArray(getItemGroups(item) || []);

        if (itemGroups.length) {
            itemGroups
                .map(getSgroup, groups)
                .forEach(addInSgroup, item);
        }
    });

    return groups;
};

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

function checkInGroup(group) {
    return this.get(group) === null;
}

function clearFromGroup(item) {
    this.delete(item);
}
