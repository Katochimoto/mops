const assert = require('chai').assert;
const sinon = require('sinon');
const Promise = require('es6-promise').Promise;

const MopsError = require('../src/error');
const Action = require('../src/action');
const Queue = require('../src/queue');

describe('queue', function () {
    beforeEach(function () {
        this.sinon = sinon.sandbox.create();
    });

    afterEach(function () {
        this.sinon.restore();
        delete this.sinon;
    });

    describe('#then()', function () {

        it('должен вызвать метод onFulfilled при успешном резолве очереди', function () {
            let action = this.sinon.spy();
            let queue = new Queue();

            return queue
                .then(action)
                .start()
                .then(function () {
                    assert(action.calledOnce);
                });
        });

        it('должен вызвать метод onRejected при неудачном резолве очереди', function () {
            let action = this.sinon.spy();
            let queue = new Queue();

            return queue
                .then(() => Promise.reject())
                .then(null, action)
                .start()
                .then(function () {
                    assert(action.calledOnce);
                });
        });

        it('должен передать аргументы в функцию onFulfilled', function () {
            let queue = new Queue();
            let arg1 = 'test1';
            let arg2 = 'test2';

            return queue
                .then(function (a1, a2) {
                    assert.equal(a1, arg1);
                    assert.equal(a2, arg2);
                }, arg1, arg2)
                .start();
        });

        it('должен передать аргументы в функцию onRejected', function () {
            let queue = new Queue();
            let arg1 = 'test1';
            let arg2 = 'test2';

            return queue
                .then(() => Promise.reject())
                .then(null, function (error, a1, a2) {
                    assert.equal(a1, arg1);
                    assert.equal(a2, arg2);
                }, arg1, arg2)
                .start();
        });

        it('объект ошибки должен быть передан первым аргументом функции onRejected', function () {
            let queue = new Queue();
            let arg1 = 'test1';
            let arg2 = 'test2';
            let err = new Error('undefined error');

            return queue
                .then(() => Promise.reject(err))
                .then(null, function (error, a1, a2) {
                    assert.equal(error, err);
                    assert.equal(a1, arg1);
                    assert.equal(a2, arg2);
                }, arg1, arg2)
                .start();
        });
    });

    describe('#catch()', function () {
        it('должен вызвать метод onRejected при неудачном резолве очереди', function () {
            let action = this.sinon.spy();
            let queue = new Queue();

            return queue
                .then(() => Promise.reject())
                .catch(action)
                .start()
                .then(function () {
                    assert(action.calledOnce);
                });
        });

        it('должен пробросить ошибку в следующий обработчик', function () {
            let queue = new Queue();
            let err = new Error('undefined error');

            return queue
                .then(function () {
                    throw err;
                })
                .catch(error => error)
                .start()
                .catch(function (error) {
                    assert.equal(error, err);
                });
        });

        it('должен передать аргументы в функции очереди', function () {
            let queue = new Queue();

            return queue
                .then(() => Promise.reject())
                .catch(function (error, a1, a2) {
                    assert.equal(a1, 'test1');
                    assert.equal(a2, 'test2');
                }, 'test1', 'test2')
                .start();
        });

        it('объект ошибки должен быть передан первым аргументом функции onRejected', function () {
            let queue = new Queue();
            let err = new Error('undefined error');

            return queue
                .then(function () {
                    throw err;
                })
                .catch(function (error, a1, a2) {
                    assert.equal(a1, 'test1');
                    assert.equal(a2, 'test2');
                    assert.equal(error, err);
                }, 'test1', 'test2')
                .start();
        });
    });

    describe('#always()', function () {
        it('должен вызвать метод при успешном резолве очереди', function () {
            let action = this.sinon.spy();
            let queue = new Queue();

            return queue
                .always(action)
                .start()
                .then(function () {
                    assert(action.calledOnce);
                });
        });

        it('должен вызвать метод при неудачном резолве очереди', function () {
            let action = this.sinon.spy();
            let queue = new Queue();

            return queue
                .then(() => Promise.reject())
                .always(action)
                .start()
                .then(function () {
                    assert(action.calledOnce);
                });
        });

        it('должен передать аргументы в функции очереди', function () {
            let queue = new Queue();

            return queue
                .always(function (error, a1, a2) {
                    assert.equal(a1, 'test1');
                    assert.equal(a2, 'test2');
                }, 'test1', 'test2')
                .start();
        });

        it('объект ошибки должен быть передан первым аргументом функции onRejected', function () {
            let queue = new Queue();
            let err = new Error('undefined error');

            return queue
                .then(() => Promise.reject(err))
                .always(function (error, a1, a2) {
                    assert.equal(error, err);
                    assert.equal(a1, 'test1');
                    assert.equal(a2, 'test2');
                }, 'test1', 'test2')
                .start();
        });
    });

    describe('#start()', function () {
        it('должен вызвать метод', function () {
            let action = this.sinon.spy();
            let queue = new Queue();

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
            let queue = new Queue();

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
            let queue = new Queue();

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
            let queue = new Queue();

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
            let queue = new Queue();

            return queue
                .then(() => (new Queue()).then(action1))
                .then(action2)
                .start()
                .then(() => {
                    assert(action1.calledOnce);
                    assert(action2.calledOnce);
                    assert(action2.calledAfter(action1));
                });
        });

        it('контекст вызова сохраняется при внутреннем вызове start', function () {
            let context;
            let action = this.sinon.spy();
            let queue = new Queue(context);

            return queue
                .then(function () {
                    context = this;
                    return (new Queue(this)).then(action);
                })
                .start()
                .then(function () {
                    assert.isOk(action.calledOn(context));
                });
        });
    });
});
