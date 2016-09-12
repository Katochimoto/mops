const assert = require('chai').assert;
const mops = require('../src/mops');

describe('Error', function () {

    describe('#constructor()', function () {
        it('потомок Error', function () {
            let error = new mops.Error();

            assert.instanceOf(error, Error, 'mops.Error is an instance of Error');
        });

        it('название MopsError', function () {
            let error = new mops.Error();

            assert.equal(error.name, 'MopsError');
        });

        it('ошибка в message', function () {
            let message = 'some error';
            let error = new mops.Error(message);

            assert.equal(error.message, message);
        });
    });
});
