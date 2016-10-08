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

    suite
    .add('mops.Operation#add', function () {
        this.operation.add(function () {}, [ 1, 2, 3 ]);
    }, {
        onStart: function() {
            this.operation = new mops.Operation();
        },

        onComplete: function() {
            this.operation.clear();
            delete this.operation;
        }
    })

    .add('mops.Operation#addUniq', function () {
        this.operation.addUniq(function () {}, [ 1, 2, 3 ], 'group');
    }, {
        onStart: function() {
            this.operation = new mops.Operation();
        },

        onComplete: function() {
            this.operation.clear();
            delete this.operation;
        }
    })

    .add('mops.Operation#entries', function () {
        var iterator = this.operation.entries();
        var action;

        while ((action = iterator.next().value)) {
            action();
        }
    }, {
        onStart: function() {
            this.operation = new mops.Operation();
            for (var i = 0; i < 1000; i++) {
                this.operation.add(actions[_.random(0, 49)]);
            }
        },

        onComplete: function() {
            this.operation.clear();
            delete this.operation;
        }
    })

    .add('mops.Operation#clear', function () {
        this.operation.clear();
    }, {
        onStart: function() {
            var action = function () {};
            this.operation = new mops.Operation();

            for (var i = 0; i < 1000; i++) {
                this.operation.add(action);
            }
        },

        onComplete: function() {
            this.operation.clear();
            delete this.operation;
        }
    })

    .add('mops.Operation#merge с пустым приемником', function () {
        this.operation2.merge(this.operation1);
    }, {
        onStart: function() {
            this.operation1 = new mops.Operation();
            for (var i = 0; i < 1000; i++) {
                this.operation1.add(actions[_.random(0, 49)]);
            }

            this.operation2 = new mops.Operation();
            for (var i = 0; i < 1000; i++) {
                this.operation2.add(actions[_.random(0, 49)]);
            }
        },

        onComplete: function() {
            this.operation1.clear();
            this.operation2.clear();
            delete this.operation1;
            delete this.operation2;
        }
    });

    suite.run({ async: true, queued: true });
}())
