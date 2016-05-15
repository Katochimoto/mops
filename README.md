https://github.com/Katochimoto/mops/raw/master/pic.jpg

The operation queue.

[![Build Status][build]][build-link] [![NPM version][version]][version-link] [![Dependency Status][dependency]][dependency-link] [![devDependency Status][dev-dependency]][dev-dependency-link] [![Code Climate][climate]][climate-link] [![Test Coverage][coverage]][coverage-link] [![Inline docs][inch]][inch-link]

```js
mops.define('action1', function () {}, /* priority */ 100);

mops.define('action2', function() {
    return mops
        .action1()
        .action2()
        .action3();
});

mops.define('action3', function() {
    return new Promise(function(resolve) {
        resolve(
            mops.action1()
                .action2()
                .action3()
                .start()
        );
    });
});

mops.define({
    action1: function() {},
    action2: function() {}
});

var queue = mops
    .action()
    .action1()
    .action2(param1, param2)
    .then('action3', 'action4')
    .catch('action5')
    .then(function() {}, function() {})
    .catch(function() {})
    .then(function() {
        return mops
            .action1()
            .action2();
    })
    .cond(
        /* condition: boolean, function */ function() {},
        /* optional onFulfilled */ function() {},
        /* optional onRejected */ function() {}
    )
    .cond(true, 'action1', 'action2')
    .start();


mops.queue()
    .then(function() {})
    .start();


var customMops = mops.clone();
customMops.define('action1', function() {});
customMops.action1().start();
```

[build]: https://travis-ci.org/Katochimoto/mops.svg?branch=master
[build-link]: https://travis-ci.org/Katochimoto/mops
[version]: https://badge.fury.io/js/mops.svg
[version-link]: http://badge.fury.io/js/mops
[dependency]: https://david-dm.org/Katochimoto/mops.svg
[dependency-link]: https://david-dm.org/Katochimoto/mops
[dev-dependency]: https://david-dm.org/Katochimoto/mops/dev-status.svg
[dev-dependency-link]: https://david-dm.org/Katochimoto/mops#info=devDependencies
[climate]: https://codeclimate.com/github/Katochimoto/mops/badges/gpa.svg
[climate-link]: https://codeclimate.com/github/Katochimoto/mops
[coverage]: https://codeclimate.com/github/Katochimoto/mops/badges/coverage.svg
[coverage-link]: https://codeclimate.com/github/Katochimoto/mops
[inch]: https://inch-ci.org/github/Katochimoto/mops.svg?branch=master
[inch-link]: https://inch-ci.org/github/Katochimoto/mops
