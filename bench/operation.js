(function () {
    var suite = new Benchmark.Suite('mops.Operation', {
        onCycle: function (event) {
            outputCycle(event);
        },

        onComplete: function () {
            outputComplete(this);
        }
    });

    var actions = [];
    for (var j = 0; j < 50; j++) {
        actions.push(function () {});
    }

    var operation1 = new mops.Operation();
    for (var i = 0; i < 1000; i++) {
        operation1.add(actions[_.random(0, 49)]);
    }

    suite
    .add('mops.Operation#entries', function () {
        var iterator = operation1.entries();
        var action;

        while ((action = iterator.next().value)) {
            action();
        }
    })

    .add('mops.Operation#clear', function () {
        var action = function () {};
        var operation = new mops.Operation();

        for (var i = 0; i < 1000; i++) {
            operation.add(action);
        }

        operation.clear();
    })

    .add('mops.Operation#merge с пустым приемником', function () {
        var operation2 = new mops.Operation();
        operation2.merge(operation1);
    });

    suite.run({ async: true, queued: true });
}())
