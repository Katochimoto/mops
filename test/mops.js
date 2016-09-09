const assert = require('chai').assert;
const mops = require('../src/mops');
const symbol = require('../src/symbol');
const MopsError = require('../src/error');

describe('mops', function () {
    beforeEach(function () {
        this.mops = mops.clone();
    });

    afterEach(function () {
        delete this.mops;
    });

    describe('#define()', function () {
        it('должен создать метод с указанным именем', function () {
            this.mops.define('action1', function () {});
            assert.isFunction(this.mops.action1);
        });

        it('должен вернуть объект mops', function () {
            let result = this.mops.define('action1', function () {});
            assert.equal(result, this.mops);
        });

        it('должен вызвать исключение, если название метода не строка', function () {
            assert.throws(() => {
                this.mops.define(123, function () {});
            });
        });

        it('должен вызвать исключение, если значение метода не функция', function () {
            assert.throws(() => {
                this.mops.define('action1', 'function');
            });
        });

        it('должен создать методы по объекту вида {ключ: значение}', function () {
            this.mops.define({
                action1: function () {},
                action2: function () {}
            });

            assert.isFunction(this.mops.action1);
            assert.isFunction(this.mops.action2);
        });

        it('созданный метод имеет свойство SUPER с оригинальным значением функции', function () {
            let action = function () {};
            let weight = 999;

            this.mops.define('action1', action, weight);

            assert.property(this.mops.action1, symbol.SUPER);
            assert.deepEqual(this.mops.action1[ symbol.SUPER ], { action, weight });
        });
    });

    describe('#clone()', function () {
        it('должен создать новый объект mops с наследованием методов текущего', function () {
            this.mops.define('action1', function () {});
            let newMops = this.mops.clone();
            assert.isFunction(newMops.action1);
        });

        it('новые методы не должны попадать в предка', function () {
            let newMops = this.mops.clone();
            newMops.define('action1', function () {});
            assert.isUndefined(this.mops.action1);
        });

        it('новые методы предка попадают во всех потомков', function () {
            let newMops = this.mops.clone();
            this.mops.define('action1', function () {});
            assert.isFunction(newMops.action1);
        });
    });
});
