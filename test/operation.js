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
    });

    describe('#unlock', function () {
        it('должно убрать лок с действия', function () {
            let action = function () {};
            let operations = new mops.Operation();

            operations.lock(action);
            operations.unlock(action);

            assert.isNotOk(operations.isLock(action));
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
            let action = function () {};
            let operations1 = new mops.Operation();
            let operations2 = new mops.Operation();

            operations1.lock(action);
            operations2.merge(operations1);

            assert.isOk(operations2.isLock(action));
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

        it('объединенная очередь не должна содержить действий из обоих наборов блокировок', function () {
            let action1 = function () {};
            let operations1 = new mops.Operation();
            let operations2 = new mops.Operation();

            operations1.add(action1);
            operations2.lock(action1);
            operations2.merge(operations1);

            assert.equal(operations2.size(action1), 0);
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
