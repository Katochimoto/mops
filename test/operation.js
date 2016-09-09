const assert = require('chai').assert;
const mops = require('../src/mops');
const symbol = require('../src/symbol');
const MopsError = require('../src/error');
const MopsOperation = require('../src/operation');

describe('operation', function () {
    beforeEach(function () {
        this.mops = mops.clone();
    });

    afterEach(function () {
        delete this.mops;
    });

    describe('#constructor()', function () {
        it('контекст фризится', function () {
            let operation = new MopsOperation()

            assert.isOk(Object.isFrozen(operation));
        });

        it('данные клонируются', function () {
            let data = { test: true };
            let operation = new MopsOperation(data)

            assert.notStrictEqual(operation.data, data);
        })
    });

    describe('#error()', function () {
        it('должен вернуть объект MopsError', function () {
            let operation = new MopsOperation();
            let error = operation.error();

            assert.instanceOf(error, MopsError, 'error is an instance of MopsError');
        });

        it('объект ошибки должен содержать свойство message с текстом ошибки', function () {
            let operation = new MopsOperation();
            let msg = 'text error';
            let error = operation.error(msg);

            assert.strictEqual(error.message, msg);
        });

        it('объект ошибки должен содержать свойство name с текстом "MopsError"', function () {
            let operation = new MopsOperation();
            let error = operation.error();

            assert.strictEqual(error.name, 'MopsError');
        });
    });
});
