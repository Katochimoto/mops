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
    });
});
