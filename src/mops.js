import isPlainObject from 'lodash/isPlainObject';
import forOwn from 'lodash/forOwn';
import rearg from 'lodash/rearg';
import isString from 'lodash/isString';
import isFunction from 'lodash/isFunction';
import wrap from 'lodash/wrap';
import partial from 'lodash/partial';
import create from 'lodash/create';

const defaultWeight = 100;

const actions = Symbol('mops-actions');

const queue = Symbol('mops-wrap-queue');

const mops = function (data) {
    return mops.wrap(new MopsOperation(data));
};

mops[ actions ] = {};

mops.wrap = function(data) {
    return (this instanceof MopsWrapper) ? this : new MopsWrapper(data);
};

mops.define = function (actionName, action, weight) {
    if (isPlainObject(actionName)) {
        forOwn(actionName, rearg(define, 1, 0));

    } else if (isString(actionName) && isFunction(action)) {

        mops[ actions ][ actionName ] = [ wrap(action, wrapAction), weight ];

        Object.defineProperty(mops, actionName, {
            value: function () {
                return this.wrap().append(...mops[ actions ][ actionName ]);
            }
        });
    }

    return mops;
};

mops.inherit = function () {

};

export default mops;



function MopsWrapper() {
    this[ queue ] = [];
}

MopsWrapper.prototype = create(mops, {
    'constructor': MopsWrapper,

    append(action, weight) {
        this[ queue ].push([ action, weight ])
        return this;
    },

    then() {
        return this;
    },

    catch() {
        return this;
    },

    cond() {
        return this;
    },

    start() {

    }
});

function MopsOperation() {

}

function wrapAction(func, ...args) {
    return new Promise(partial(func, ...args));
}
