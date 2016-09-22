(function () {
    var suite = new Benchmark.Suite('mops.Operation', {
        onCycle: function (event) {
            outputCycle(event);
        },

        onComplete: function () {
            outputComplete(this);
        }
    });

    var action = function () {};
    var operation = new mops.Operation();

    for (var i = 0; i < 1000; i++) {
        operation.add(action, { arg: i });
    }

    suite
    .add('mops.Operation#entries', function () {
        var iterator = operation.entries();
        var action;

        while ((action = iterator.next().value)) {
            action();
        }
    })

    .add('mops.Operation#clear', function () {
        var action = function () {};
        var operation = new mops.Operation();

        for (var i = 0; i < 1000; i++) {
            operation.add(action, { arg: i });
        }

        operation.clear();
    });

    suite.run({ async: true, queued: true });
}())
