const assert = require('chai').assert;
const mops = require('../src/mops');

describe('Checked', function () {

    describe('#clear()', function () {
        it('должен удалить все элементы из списка', function () {
            let o1 = {};
            let o2 = {};
            let checked = new mops.Checked([ o1, o2 ]);
            checked.clear();
            let items = checked.toArray();

            assert.equal(items.length, 0);
        });
    });

    describe('#uncheck()', function () {
        it('должен удалить элемент из списка', function () {
            let o1 = {};
            let o2 = {};
            let checked = new mops.Checked([ o1, o2 ]);
            checked.uncheck(o2);
            let items = checked.toArray();

            assert.isOk(items.indexOf(o1) !== -1);
            assert.isNotOk(items.indexOf(o2) !== -1);
        });
    });

    describe('#has()', function () {
        it('должен вернуть true если объект принадлежит набору', function () {
            let o1 = {};
            let checked = new mops.Checked([ o1 ]);

            assert.isOk(checked.has(o1));
        });

        it('должен вернуть false если объект не принадлежит набору', function () {
            let o1 = {};
            let o2 = {};
            let checked = new mops.Checked([ o1 ]);

            assert.isNotOk(checked.has(o2));
        });
    });

    describe('#size()', function () {
        it('должен вернуть количество элементов в списке', function () {
            let o1 = {};
            let o2 = {};
            let checked = new mops.Checked([ o1, o2 ]);

            assert.equal(checked.size(), 2);
        });
    });

    describe('#toArray()', function () {
        it('должен вернуть список в виде массива', function () {
            let o1 = {};
            let o2 = {};
            let checked = new mops.Checked([ o1, o2 ]);
            let items = checked.toArray();

            assert.isOk(Array.isArray(items));
            assert.isOk(items.indexOf(o1) !== -1);
            assert.isOk(items.indexOf(o2) !== -1);
        });
    });

    describe('#getGroups', function () {
        it('должен вернуть пустой Map, если нет выбранных элементов', function () {
            let group = function () { return []; };
            let checked = new mops.Checked();
            let items = checked.getGroups(group);
            assert.equal(items.length, 0);
        });

        it('должен вернуть группу элементов', function () {
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

            let items = checked.getGroups(group);
            assert.deepEqual(items, [[ o3, [ o1, o2 ] ]]);
        });

        it('должен вернуть пустой Map, если у элементов нет групп', function () {
            let o1 = {};
            let o2 = {};
            let group = function () {};

            let checked = new mops.Checked();
            checked.check(o1);
            checked.check(o2);

            let items = checked.getGroups(group);
            assert.equal(items.length, 0);
        });
    });

    describe('#getCheckedGroups()', function () {
        it('если нет групп, возвращает полный набор', function () {
            let o1 = {};
            let o2 = {};
            let group = function () { return []; };

            let checked = new mops.Checked();
            checked.check(o1);
            checked.check(o2);

            let items = checked.getCheckedGroups(group);

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

            let items = checked.getCheckedGroups(group);

            assert.isNotOk(items.has(o1));
            assert.isNotOk(items.has(o2));
            assert.isOk(items.has(o3));
        });

        it('сразу исключает элемент из списка, входящий в группу из списка', function () {
            let o1 = { o: 1 };
            let o2 = { o: 2 };
            let o3 = { o: 3 }; // будет сразу исключено
            let group = function (item) {
                if (item === o1 || item === o3) {
                    return o2;
                }
            };

            let checked = new mops.Checked();
            checked.check(o1);
            checked.check(o2);
            checked.check(o3);

            let items = checked.getCheckedGroups(group);

            assert.isNotOk(items.has(o1));
            assert.isOk(items.has(o2));
        });

        it('должен вернуть объект mops.Checked', function () {
            let o1 = {};
            let o2 = {};
            let group = function () { return []; };

            let checked = new mops.Checked();
            checked.check(o1);
            checked.check(o2);

            let items = checked.getCheckedGroups(group);

            assert.instanceOf(items, mops.Checked, '#getCheckedGroups() is an instance of mops.Checked');
        });
    });
});
