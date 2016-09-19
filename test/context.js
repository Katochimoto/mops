const assert = require('chai').assert;
const mops = require('../src/mops');

describe('Context', function () {

    describe('#constructor()', function () {
        it('контекст фризится', function () {
            let context = new mops.Context()

            assert.isOk(Object.isFrozen(context));
        });

        it('данные клонируются', function () {
            let data = { test: true };
            let context = new mops.Context(data)

            assert.notStrictEqual(context.data, data);
        });

        it('объект mops.Checked не клонируется', function () {
            let obj = { obj: 1 };
            let checked = new mops.Checked([ obj ]);
            let context = new mops.Context(checked);

            assert.isOk(context.data.has(obj));
        });
    });
});
