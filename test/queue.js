const assert = require('chai').assert;
const sinon = require('sinon');
const Promise = require('es6-promise').Promise;
const mops = require('../src/mops');
const symbol = require('../src/symbol');

describe('queue', function () {
    beforeEach(function () {
        this.sinon = sinon.sandbox.create();
        this.mops = mops.clone();
    });

    afterEach(function () {
        this.sinon.restore();
        delete this.mops;
        delete this.sinon;
    });

    describe('#create()', function () {
        it('должен создать объект очередь MopsQueue', function () {
            let queue = this.mops.queue();
            assert.isArray(queue[ symbol.QUEUE ]);
            assert.propertyVal(queue, 'operation', null);
        });

        it('объект очереди MopsQueue должен быть наследником mops', function () {
            let queue = this.mops.queue();
            assert.isOk(this.mops.isPrototypeOf(queue));
        });
    });

    describe('#define()', function () {
        it('должен вызвать исключение при попытке объявить метод', function () {
            assert.throws(() => {
                this.mops.queue().define('action', function () {});
            });
        });
    });

    describe('#clone()', function () {
        it('должен вызвать исключение при попытке склонировать очередь', function () {
            assert.throws(() => {
                this.mops.queue().clone();
            });
        });
    });

    describe('#queue()', function () {
        it('метод queue должен вернуть текущий объект очереди', function () {
            let queue = this.mops.queue();
            assert.strictEqual(queue.queue(), queue);
        });
    });

    describe('#cond()', function () {
        it('должен добавить метод onFulfilled с указаным условием', function () {
            let onFulfilled = function () {};
            let queue = this.mops.queue();

            queue.cond(true, onFulfilled);

            let task = queue[ symbol.QUEUE ][0];
            assert.equal(task.action, onFulfilled);
            assert.equal(task.condition, true);
            assert.isNotOk(task.rejected);
        });

        it('должен добавить метод onRejected с указаным условием', function () {
            let onRejected = function () {};
            let queue = this.mops.queue();

            queue.cond(true, null, onRejected);

            let task = queue[ symbol.QUEUE ][0];
            assert.equal(task.action, onRejected);
            assert.equal(task.condition, true);
            assert.isOk(task.rejected);
        });

        it('должен добавить методы onFulfilled и onRejected с указаным условием', function () {
            let onFulfilled = function () {};
            let onRejected = function () {};
            let queue = this.mops.queue();

            queue.cond(true, onFulfilled, onRejected);

            let task0 = queue[ symbol.QUEUE ][0];
            assert.equal(task0.action, onFulfilled);
            assert.equal(task0.condition, true);
            assert.isNotOk(task0.rejected);

            let task1 = queue[ symbol.QUEUE ][1];
            assert.equal(task1.action, onRejected);
            assert.equal(task1.condition, true);
            assert.isOk(task1.rejected);
        });

        it('условие может быть функцией', function () {
            let onFulfilled = function () {};
            let condition = function () {};
            let queue = this.mops.queue();

            queue.cond(condition, onFulfilled);

            let task = queue[ symbol.QUEUE ][0];
            assert.equal(task.condition, condition);
        });

        it('условие может быть промисом', function () {
            let onFulfilled = function () {};
            let condition = new Promise(function () {});
            let queue = this.mops.queue();

            queue.cond(condition, onFulfilled);

            let task = queue[ symbol.QUEUE ][0];
            assert.equal(task.condition, condition);
        });

        it('должен добавить метод onFulfilled строкой, если он определен', function () {
            let action = function () {};
            let queue = this.mops.queue();

            this.mops.define('action', action);
            queue.cond(true, 'action');

            let task = queue[ symbol.QUEUE ][0];
            assert.equal(task.action, action);
        });

        it('должен добавить метод onRejected строкой, если он определен', function () {
            let action = function () {};
            let queue = this.mops.queue();

            this.mops.define('action', action);
            queue.cond(true, null, 'action');

            let task = queue[ symbol.QUEUE ][0];
            assert.equal(task.action, action);
        });
    });

    describe('#then()', function () {
        it('должен добавить метод onFulfilled', function () {
            let onFulfilled = function () {};
            let queue = this.mops.queue();

            queue.then(onFulfilled);

            let task = queue[ symbol.QUEUE ][0];
            assert.equal(task.action, onFulfilled);
            assert.equal(task.condition, null);
            assert.isNotOk(task.rejected);
        });

        it('должен добавить метод onRejected', function () {
            let onRejected = function () {};
            let queue = this.mops.queue();

            queue.then(null, onRejected);

            let task = queue[ symbol.QUEUE ][0];
            assert.equal(task.action, onRejected);
            assert.equal(task.condition, null);
            assert.isOk(task.rejected);
        });

        it('должен добавить методы onFulfilled и onRejected', function () {
            let onFulfilled = function () {};
            let onRejected = function () {};
            let queue = this.mops.queue();

            queue.then(onFulfilled, onRejected);

            let task0 = queue[ symbol.QUEUE ][0];
            assert.equal(task0.action, onFulfilled);
            assert.equal(task0.condition, null);
            assert.isNotOk(task0.rejected);

            let task1 = queue[ symbol.QUEUE ][1];
            assert.equal(task1.action, onRejected);
            assert.equal(task1.condition, null);
            assert.isOk(task1.rejected);
        });

        it('должен добавить метод onFulfilled строкой, если он определен', function () {
            let action = function () {};
            let queue = this.mops.queue();

            this.mops.define('action', action);
            queue.then('action');

            let task = queue[ symbol.QUEUE ][0];
            assert.equal(task.action, action);
        });

        it('должен добавить метод onRejected строкой, если он определен', function () {
            let action = function () {};
            let queue = this.mops.queue();

            this.mops.define('action', action);
            queue.then(null, 'action');

            let task = queue[ symbol.QUEUE ][0];
            assert.equal(task.action, action);
        });
    });

    describe('#catch()', function () {
        it('должен добавить метод onRejected', function () {
            let onRejected = function () {};
            let queue = this.mops.queue();

            queue.catch(onRejected);

            let task = queue[ symbol.QUEUE ][0];
            assert.equal(task.action, onRejected);
            assert.equal(task.condition, null);
            assert.isOk(task.rejected);
        });

        it('должен добавить метод onRejected строкой, если он определен', function () {
            let action = function () {};
            let queue = this.mops.queue();

            this.mops.define('action', action);
            queue.catch('action');

            let task = queue[ symbol.QUEUE ][0];
            assert.equal(task.action, action);
        });
    });

    describe('#start()', function () {
        it('должен вызвать метод', function () {
            let action = this.sinon.spy();
            let queue = this.mops.queue();

            return queue
                .then(action)
                .start()
                .then(() => {
                    assert(action.calledOnce);
                });
        });

        it('должен вызвать цепочку методов', function () {
            let action1 = this.sinon.spy();
            let action2 = this.sinon.spy();
            let queue = this.mops.queue();

            return queue
                .then(action1)
                .then(action2)
                .start()
                .then(() => {
                    assert(action1.calledOnce);
                    assert(action2.calledOnce);
                    assert(action2.calledAfter(action1));
                });
        });

        it('методы могут возвращать промис', function () {
            let action1 = this.sinon.spy(() => Promise.resolve());
            let action2 = this.sinon.spy(() => Promise.resolve());
            let queue = this.mops.queue();

            return queue
                .then(action1)
                .then(action2)
                .start()
                .then(() => {
                    assert(action1.calledOnce);
                    assert(action2.calledOnce);
                    assert(action2.calledAfter(action1));
                });
        });

        it('если предыдущий метод вернул reject, то вызывается обработчик onRejected', function () {
            let action1 = this.sinon.spy(() => Promise.reject());
            let action2 = this.sinon.spy(() => Promise.resolve());
            let action3 = this.sinon.spy(() => Promise.resolve());
            let action4 = this.sinon.spy(() => Promise.resolve());
            let queue = this.mops.queue();

            return queue
                .then(action1)
                .then(action2, action3)
                .then(action4)
                .start()
                .then(() => {
                    assert(action1.calledOnce);
                    assert.strictEqual(action2.callCount, 0);
                    assert(action3.calledOnce);
                    assert(action3.calledAfter(action1));
                    assert(action4.calledOnce);
                    assert(action4.calledAfter(action3));
                });
        });
    });
});
