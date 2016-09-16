const castArray = require('lodash/castArray');
const flattenDeep = require('lodash/flattenDeep');
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
        const groupSet = groups.get(item);

        if (groupSet && groupSet.size) {
            groupSet.forEach(clearFromGroup, checked);
            groupSet.clear();
            groups.set(item, null);
        }

        const itemGroups = castArray(getGroups(item));

        if (itemGroups.length) {
            const inGroup = itemGroups.some(checkInGroup, groups);

            if (inGroup) {
                checked.delete(item);

            } else {
                itemGroups
                    .map(getGroupSet, groups)
                    .forEach(addInGroupSet, item);
            }
        }
    });

    groups.clear();
    return checked;
};

function getGroupSet(group) {
    let sgroup = this.get(group);

    if (!sgroup) {
        sgroup = new Set();
        this.set(group, sgroup);
    }

    return sgroup;
}

function addInGroupSet(sgroup) {
    sgroup.add(this);
}

function checkInGroup(group) {
    return this.get(group) === null;
}

function clearFromGroup(item) {
    this.delete(item);
}
