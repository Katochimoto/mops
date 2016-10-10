(function () {
    var suite = new Benchmark.Suite('mops.Queue', {
        onCycle: function (event) {
            outputCycle(event);
        },

        onComplete: function () {
            outputComplete(this);
        }
    });

    var queue = new mops.Queue();
    for (var i = 0; i < 10000; i++) {
        queue.then(function () {});
    }

    suite
    .add('mops.Queue#start', function(deferred) {
        queue
            .start()
            .then(function () { deferred.resolve(); });

    }, {
        defer: true
    });

    suite.run({ async: true, queued: true });
}())
