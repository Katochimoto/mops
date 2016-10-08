(function () {
    var suite = new Benchmark.Suite('mops.Queue', {
        onCycle: function (event) {
            outputCycle(event);
        },

        onComplete: function () {
            outputComplete(this);
        }
    });

    suite
    .add('mops.Queue#start', function(deferred) {
        this.queue
            .start()
            .then(function () { deferred.resolve(); });

    }, {
        defer: true,

        onStart: function() {
            this.queue = new mops.Queue();
            for (var i = 0; i < 10000; i++) {
                this.queue.then(function () {});
            }
        }
    });

    suite.run({ async: true, queued: true });
}())
