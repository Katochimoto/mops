const assert = require('chai').assert;
const mops = require('../src/mops');

describe('Checked', function () {

    describe('#getGroupObjects()', function () {
        it('если нет групп, возвращает полный набор', function () {
            let o1 = {};
            let o2 = {};
            let group = function () { return []; };

            let checked = new mops.Checked();
            checked.check(o1);
            checked.check(o2);

            let items = checked.getGroupObjects(group);

            assert.isOk(items.has(o1));
            assert.isOk(items.has(o2));
        });

        it('елементы, входящие в группу, отбрасываются', function () {
            let o1 = {};
            let o2 = {};
            let o3 = {};
            let group = function (item) {
                if (item === o1 || item === o2) {
                    return o3;
                }
            };

            let checked = new mops.Checked();
            checked.check(o1);
            checked.check(o2);
            checked.check(o3);

            let items = checked.getGroupObjects(group);

            assert.isNotOk(items.has(o1));
            assert.isNotOk(items.has(o2));
            assert.isOk(items.has(o3));
        });
    });
});
