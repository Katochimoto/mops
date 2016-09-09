const assert = require('chai').assert;
const sinon = require('sinon');
const Promise = require('es6-promise').Promise;
const mops = require('../src/mops');
const symbol = require('../src/symbol');
const MopsOperation = require('../src/operation');
const MopsError = require('../src/error');

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

        it('должен передать аргументы в функции очереди 1', function () {
            let queue = this.mops.queue();

            return queue
                .cond(true, function (a1, a2) {
                    assert.equal(a1, 1);
                    assert.equal(a2, 2);
                }, 1, 2)
                .start();
        });

        it('должен передать аргументы в функции очереди 2', function () {
            let queue = this.mops.queue();

            return queue
                .then(() => Promise.reject())
                .cond(true, null, function (a1, a2) {
                    assert.equal(a1, 'test1');
                    assert.equal(a2, 'test2');
                }, 'test1', 'test2')
                .start();
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

        it('должен передать аргументы в функции очереди 1', function () {
            let queue = this.mops.queue();

            return queue
                .then(function (a1, a2) {
                    assert.equal(a1, 1);
                    assert.equal(a2, 2);
                }, 1, 2)
                .start();
        });

        it('должен передать аргументы в функции очереди 2', function () {
            let queue = this.mops.queue();

            return queue
                .then(() => Promise.reject())
                .then(null, function (a1, a2) {
                    assert.equal(a1, 'test1');
                    assert.equal(a2, 'test2');
                }, 'test1', 'test2')
                .start();
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

        it('должен пробросить ошибку в следующий обработчик', function () {
            let queue = this.mops.queue();
            let messageError = 'test error 1';

            return queue
                .then(function () {
                    throw new Error(messageError);
                })
                .catch(error => error)
                .start()
                .catch(function (error) {
                    assert.instanceOf(error, Error, 'error is an instance of Error');
                    assert.equal(error.message, messageError);
                });
        });

        it('должен передать аргументы в функции очереди', function () {
            let queue = this.mops.queue();

            return queue
                .then(() => Promise.reject())
                .catch(function (a1, a2) {
                    assert.equal(a1, 'test1');
                    assert.equal(a2, 'test2');
                }, 'test1', 'test2')
                .start();
        });

        it('должен передать аргументы в функции очереди', function () {
            let queue = this.mops.queue();

            return queue
                .then(function () {
                    throw this.error('test error');
                })
                .catch(function (a1, a2, error) {
                    assert.equal(a1, 'test1');
                    assert.equal(a2, 'test2');
                    assert.instanceOf(error, MopsError, 'error is an instance of MopsError');
                }, 'test1', 'test2')
                .start();
        });
    });

    describe('#always()', function () {
        it('должен добавить методы onFulfilled и onRejected', function () {
            let onAlways = function () {};
            let queue = this.mops.queue();

            queue.always(onAlways);

            let task0 = queue[ symbol.QUEUE ][0];
            assert.equal(task0.action, onAlways);
            assert.equal(task0.condition, null);
            assert.isNotOk(task0.rejected);

            let task1 = queue[ symbol.QUEUE ][1];
            assert.equal(task1.action, onAlways);
            assert.equal(task1.condition, null);
            assert.isOk(task1.rejected);
        });

        it('должен добавить метод onFulfilled и onRejected строкой, если он определен', function () {
            let action = function () {};
            let queue = this.mops.queue();

            this.mops.define('action', action);
            queue.always('action');

            let task0 = queue[ symbol.QUEUE ][0];
            assert.equal(task0.action, action);
            assert.equal(task0.condition, null);
            assert.isNotOk(task0.rejected);

            let task1 = queue[ symbol.QUEUE ][1];
            assert.equal(task1.action, action);
            assert.equal(task1.condition, null);
            assert.isOk(task1.rejected);
        });

        it('должен передать аргументы в функции очереди 1', function () {
            let queue = this.mops.queue();

            return queue
                .always(function (a1, a2) {
                    assert.equal(a1, 'test1');
                    assert.equal(a2, 'test2');
                }, 'test1', 'test2')
                .start();
        });

        it('должен передать аргументы в функции очереди 2', function () {
            let queue = this.mops.queue();

            return queue
                .then(() => Promise.reject())
                .always(function (a1, a2) {
                    assert.equal(a1, 'test1');
                    assert.equal(a2, 'test2');
                }, 'test1', 'test2')
                .start();
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

        it('методы могут возвращать другие цепочки', function () {
            let action1 = this.sinon.spy();
            let action2 = this.sinon.spy();
            let queue = this.mops.queue();

            this.mops.define('action1', action1);
            this.mops.define('action2', action2);

            return queue
                .then(() => this.mops.action1())
                .action2()
                .start()
                .then(() => {
                    assert(action1.calledOnce);
                    assert(action2.calledOnce);
                    assert(action2.calledAfter(action1));
                });
        });

        it('контекст вызова сохраняется при внутреннем вызове start', function () {
            let that = this;
            let queue = this.mops.queue();

            return queue
                .then(function () {
                    let context = this;
                    return that.mops
                        .queue()
                        .then(function () {
                            assert.strictEqual(this, context);
                        })
                        .start(context);
                })
                .start();
        });
    });

    describe('вызов метода', function () {
        it('должен сохранить аргументы вызова', function () {
            this.mops.define('qaction1', function (a1, a2) {
                assert.equal(a1, 'test1');
                assert.equal(a2, 'test2');
            });

            let queue = this.mops.queue();

            return queue
                .qaction1('test1', 'test2')
                .start();
        });

        it('контекст вызова должен быть MopsOperation', function () {
            this.mops.define('qaction2', function () {
                assert.instanceOf(this, MopsOperation, 'this is an instance of MopsOperation');
            });

            let queue = this.mops.queue();

            return queue
                .qaction2()
                .start();
        });

        it('методы вызываются в порядке объявления веса от меньшего к большему', function () {
            let action1 = this.sinon.spy();
            let action2 = this.sinon.spy();
            let action3 = this.sinon.spy();
            let queue = this.mops.queue();

            this.mops.define('action1', action1, 100);
            this.mops.define('action2', action2, 50);
            this.mops.define('action3', action3, 75);

            return queue
                .action1()
                .action2()
                .action3()
                .start()
                .then(() => {
                    assert(action3.calledAfter(action2));
                    assert(action1.calledAfter(action3));
                });
        });
    });
});
