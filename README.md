# mops

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
