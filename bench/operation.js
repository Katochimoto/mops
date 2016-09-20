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
        operation.set({ obj: i }, action);
    }



    suite
    .add('mops.Operation#getObjectsByAction', function () {
        operation.getObjectsByAction(action);
    })

    .add('mops.Operation#toArray', function () {
        operation.toArray();
    });

    suite.run({ async: true, queued: true });
}())
