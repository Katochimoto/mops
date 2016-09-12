const assert = require('chai').assert;
const mops = require('../src/mops');

describe('Context', function () {

    describe('#constructor()', function () {
        it('контекст фризится', function () {
            let operation = new mops.Context()

            assert.isOk(Object.isFrozen(operation));
        });

        it('данные клонируются', function () {
            let data = { test: true };
            let operation = new mops.Context(data)

            assert.notStrictEqual(operation.data, data);
        });
    });
});
