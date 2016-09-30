const assert = require('chai').assert;
const sinon = require('sinon');
const mops = require('../src/mops');

describe('Operation', function () {

    beforeEach(function () {
        this.sinon = sinon.sandbox.create();
    });

    afterEach(function () {
        this.sinon.restore();
        delete this.sinon;
    });

    describe('#add', function () {
        it('должен добавить действие', function () {
            let action = function () {};
            let operations = new mops.Operation();

            operations.add(action);

            assert.equal(operations.size(action), 1);
        });

        it('одно и то же действие при добавлении создает две операции', function () {
            let action = function () {};
            let operations = new mops.Operation();

            operations.add(action);
            operations.add(action);

            assert.equal(operations.size(action), 2);
        });
    });

    describe('#has', function () {
        it('должно вернуть true, если действие есть в операциях', function () {
            let action = function () {};
            let operations = new mops.Operation();

            operations.add(action);

            assert.isOk(operations.has(action));
        });

        it('должно вернуть false, если действия нет в операциях', function () {
            let action = function () {};
            let otherAction = function () {};
            let operations = new mops.Operation();

            operations.add(action);

            assert.isNotOk(operations.has(otherAction));
        });
    });

    describe('#size', function () {
        it('должно вернуть размер очереди операций', function () {
            let action = function () {};
            let otherAction = function () {};
            let operations = new mops.Operation();

            operations.add(action);
            operations.add(otherAction);

            assert.equal(operations.size(), 2);
        });

        it('если указано действие, должно вернуть количество операций с указанным действием', function () {
            let action = function () {};
            let otherAction = function () {};
            let operations = new mops.Operation();

            operations.add(action);
            operations.add(otherAction);

            assert.equal(operations.size(otherAction), 1);
        });
    });

    describe('#clear', function () {
        it('должно очистить очередь операций', function () {
            let action = function () {};
            let otherAction = function () {};
            let operations = new mops.Operation();

            operations.add(action);
            operations.add(otherAction);
            operations.clear();

            assert.equal(operations.size(), 0);
        });

        it('должно очистить локи', function () {
            let action = function () {};
            let operations = new mops.Operation();

            operations.lock(action);
            operations.clear();

            assert.isNotOk(operations.isLock(action));
        });
    });

    describe('#lock', function () {
        it('должно добавить действие в лок', function () {
            let action = function () {};
            let operations = new mops.Operation();

            operations.lock(action);

            assert.isOk(operations.isLock(action));
        });

        it('заблокированное действие нельзя добавить', function () {
            let action = function () {};
            let operations = new mops.Operation();

            operations.lock(action);
            operations.add(action);

            assert.equal(operations.size(action), 0);
        });

        it('ранее добавленное заблокированное действие должно быть удалено', function () {
            let action = function () {};
            let operations = new mops.Operation();

            operations.add(action);
            operations.lock(action);

            assert.equal(operations.size(action), 0);
        });

        it('действия, не попавшие в лок, сохраняются', function () {
            let action1 = function () {};
            let action2 = function () {};
            let operations = new mops.Operation();

            operations.add(action2);
            operations.add(action1);
            operations.lock(action1);

            assert.equal(operations.size(action1), 0);
            assert.equal(operations.size(action2), 1);
        });

        it('повторное добавление метода в лок не вызывает чистку очереди', function () {
            let action = function () {};
            let operations = new mops.Operation();

            operations.add(action);
            operations.lock(action);
            operations.add(action);
            operations.lock(action);

            assert.equal(operations.size(action), 0);
        });

        it('действие можно заблокировать по определенному правилу', function () {
            let action = function () {};
            let checker = function (param) { return param === 1; };
            let operations = new mops.Operation();

            operations.lock(action, checker);
            operations.add(action);
            operations.add(action, 1);

            assert.equal(operations.size(action), 1);
        });

        it('при добавлении правила блокировки, оно применяется к текущему списку', function () {
            let action = function () {};
            let checker = function (param) { return param === 1; };
            let operations = new mops.Operation();

            operations.add(action, 1);
            operations.add(action, 2);
            operations.add(action, 3);
            operations.lock(action, checker);

            assert.equal(operations.size(action), 2);
        });

        it('правила блокировки группируются по действию', function () {
            let action = function () {};
            let checker1 = function (param) { return param === 1; };
            let checker2 = function (param) { return param === 2; };
            let operations = new mops.Operation();

            operations.lock(action, checker1);
            operations.lock(action, checker2);
            operations.add(action, 1);
            operations.add(action, 2);
            operations.add(action, 3);

            assert.equal(operations.size(action), 1);
        });
    });

    describe('#unlock', function () {
        it('должно убрать лок с действия', function () {
            let action = function () {};
            let operations = new mops.Operation();

            operations.lock(action);
            operations.unlock(action);

            assert.isNotOk(operations.isLock(action));
        });

        it('если передано правило, должно убрать правило блокировки для действия', function () {
            let action = function () {};
            let checker = function () {};
            let operations = new mops.Operation();

            operations.lock(action, checker);
            operations.unlock(action, checker);

            assert.isNotOk(operations.isLock(action, checker));
        });
    });

    describe('#isLock', function () {
        it('должно вернуть true, если действие заблокировано', function () {
            let action = function () {};
            let operations = new mops.Operation();

            operations.lock(action);

            assert.isOk(operations.isLock(action));
        });

        it('должно вернуть false, если действие не заблокировано', function () {
            let action = function () {};
            let operations = new mops.Operation();

            assert.isNotOk(operations.isLock(action));
        });
    });

    describe('#merge', function () {
        it('должно объединить блокироваки действий', function () {
            let action1 = function () {};
            let action2 = function () {};
            let operations1 = new mops.Operation();
            let operations2 = new mops.Operation();

            operations1.lock(action1);
            operations2.lock(action2);
            operations2.merge(operations1);

            assert.isOk(operations2.isLock(action1));
            assert.isOk(operations2.isLock(action2));
        });

        it('должно объединить правила блокировки одного действия', function () {
            let action = function () {};
            let checker1 = function() {};
            let checker2 = function() {};
            let operations1 = new mops.Operation();
            let operations2 = new mops.Operation();

            operations1.lock(action, checker1);
            operations2.lock(action, checker2);
            operations2.merge(operations1);

            assert.isOk(operations2.isLock(action, checker1));
            assert.isOk(operations2.isLock(action, checker2));
        });

        it('должно перенести правила блокировки других действий', function () {
            let action1 = function () {};
            let checker1 = function() {};
            let action2 = function () {};
            let checker2 = function() {};
            let operations1 = new mops.Operation();
            let operations2 = new mops.Operation();

            operations1.lock(action1, checker1);
            operations2.lock(action2, checker2);
            operations2.merge(operations1);

            assert.isOk(operations2.isLock(action1, checker1));
            assert.isOk(operations2.isLock(action2, checker2));
        });

        it('должно объединить очереди', function () {
            let action1 = function () {};
            let operations1 = new mops.Operation();
            let action2 = function () {};
            let operations2 = new mops.Operation();

            operations1.add(action1);
            operations2.add(action2);
            operations2.merge(operations1);

            assert.equal(operations2.size(action1), 1);
        });

        it('объединенная очередь не должна содержить действий из набора блокировок приемника', function () {
            let action1 = function () {};
            let operations1 = new mops.Operation();
            let operations2 = new mops.Operation();

            operations1.add(action1);
            operations2.lock(action1);
            operations2.merge(operations1);

            assert.equal(operations2.size(action1), 0);
        });

        it('объединенная очередь не должна содержить действий, удовл. правилам из набора блокировок приемника', function () {
            let action1 = function () {};
            let checker1 = function(param) { return param === 1; };
            let operations1 = new mops.Operation();
            let operations2 = new mops.Operation();

            operations1.add(action1, 1);
            operations2.lock(action1, checker1);
            operations2.merge(operations1);

            assert.equal(operations2.size(action1), 0);
        });

        it('объединенная очередь не должна содержить действий из набора блокировок источника', function () {
            let action1 = function () {};
            let action2 = function () {};
            let action3 = function () {};
            let operations1 = new mops.Operation();
            let operations2 = new mops.Operation();

            operations1.lock(action1);
            operations1.add(action2);
            operations1.add(action3);

            operations2.lock(action2);
            operations2.add(action1);
            operations2.add(action3);

            operations2.merge(operations1);

            assert.equal(operations2.size(action1), 0);
            assert.equal(operations2.size(action2), 0);
            assert.equal(operations2.size(action3), 2);
        });

        it('объединенная очередь не должна содержить ВСЕХ действий из набора блокировок источника', function () {
            let action1 = function () {};
            let action2 = function () {};
            let operations1 = new mops.Operation();
            let operations2 = new mops.Operation();

            operations1.lock(action1);
            operations2.add(action1);
            operations2.add(action1);
            operations2.add(action2);
            operations2.merge(operations1);

            assert.equal(operations2.size(action1), 0);
            assert.equal(operations2.size(action2), 1);
        });

        it('объединенная очередь не должна содержить действий удовл. правилам из набора блокировок источника', function () {
            let action1 = function () {};
            let checker1 = function(param) { return param === 1; };
            let action2 = function () {};
            let checker2 = function(param) { return param === 2; };
            let action3 = function () {};
            let operations1 = new mops.Operation();
            let operations2 = new mops.Operation();

            operations1.lock(action1, checker1);
            operations1.add(action2, 2);
            operations1.add(action3);

            operations2.lock(action2, checker2);
            operations2.add(action1, 1);
            operations2.add(action3);

            operations2.merge(operations1);

            assert.equal(operations2.size(action1), 0);
            assert.equal(operations2.size(action2), 0);
            assert.equal(operations2.size(action3), 2);
        });

        it('должно вернуть false при попытке объединить не очередь', function () {
            let fakeOperations = function () {};
            let operations = new mops.Operation();

            assert.isNotOk(operations.merge(fakeOperations));
        });

        it('должно вернуть true при успешном объединении', function () {
            let operations1 = new mops.Operation();
            let operations2 = new mops.Operation();

            assert.isOk(operations2.merge(operations1));
        });
    });

    describe('#entries', function () {
        it('действие вызываются в порядке добавления', function () {
            let operations = new mops.Operation();
            let action1 = this.sinon.spy();
            let action2 = this.sinon.spy();

            operations.add(action1);
            operations.add(action2);

            let iter = operations.entries();
            let action;
            while ((action = iter.next().value)) {
                action();
            }

            assert(action2.calledAfter(action1));
        });

        it('действие вызывается с аргументами, указанными при добавлении', function () {
            let operations = new mops.Operation();
            let action1 = this.sinon.spy();

            operations.add(action1, 1, 2, 3);

            let iter = operations.entries();
            let action;
            while ((action = iter.next().value)) {
                action();
            }

            assert(action1.calledWith(1, 2, 3));
        });

        it('аргументы в момент вызова добавляются после указанных при добавлении', function () {
            let operations = new mops.Operation();
            let action1 = this.sinon.spy();

            operations.add(action1, 1, 2, 3);

            let iter = operations.entries();
            let action;
            while ((action = iter.next().value)) {
                action(4, 5, 6);
            }

            assert(action1.calledWith(1, 2, 3, 4, 5, 6));
        });
    });

    describe('#filter', function () {
        it('возвращает итератор операций по указанному действию', function () {
            let operations = new mops.Operation();
            let action1 = this.sinon.spy();
            let action2 = this.sinon.spy();

            operations.add(action1);
            operations.add(action1);
            operations.add(action2);

            let iter = operations.filter(action1);
            let action;
            while ((action = iter.next().value)) {
                action();
            }

            assert.strictEqual(action1.callCount, 2);
            assert.strictEqual(action2.callCount, 0);
        });
    });
});
