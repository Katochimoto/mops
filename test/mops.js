const assert = require('chai').assert;
const mops = require('../src/mops');

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
    });
});
