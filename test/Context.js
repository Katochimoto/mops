const assert = require('chai').assert;
const Context = require('../src/Context');

describe('Context', function () {

    describe('#constructor()', function () {
        it('контекст фризится', function () {
            let operation = new Context()

            assert.isOk(Object.isFrozen(operation));
        });

        it('данные клонируются', function () {
            let data = { test: true };
            let operation = new Context(data)

            assert.notStrictEqual(operation.data, data);
        })
    });
});
