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

Checked.prototype.check = function (obj) {
    this[ mopsSymbol.CHECKED ].add(obj);
};

Checked.prototype.uncheck = function (obj) {
    this[ mopsSymbol.CHECKED ].delete(obj);
};

Checked.prototype.getObjects = function () {
    return new Set(this[ mopsSymbol.CHECKED ]);
};

Checked.prototype.getGroupObjects = function (getGroups) {
    const checked = new Set(this[ mopsSymbol.CHECKED ]);
    const groups = new Map();

    checked.forEach(function (item) {
        const sgroup = groups.get(item);

        if (sgroup && sgroup.length) {
            sgroup.forEach(clearFromGroup, checked);
            groups.set(item, null);
        }

        const itemGroups = castArray(getGroups(item) || []);

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
