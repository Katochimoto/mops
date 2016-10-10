(function () {
    var suite = new Benchmark.Suite('mops.Checked', {
        onCycle: function (event) {
            outputCycle(event);
        },

        onComplete: function () {
            outputComplete(this);
        }
    });

    var objects = [];
    for (var i = 0; i < 1000; i++) {
        objects.push({ obj: i });
    }

    var checked = new mops.Checked(objects);

    suite
    .add('mops.Checked#getCheckedGroups с произвольными группами', function() {
        checked.getCheckedGroups(getGroups);
    })
    .add('mops.Checked#getCheckedGroups с произвольным количеством (от 0 до 5) произвольных групп', function() {
        checked.getCheckedGroups(getGroupsRandon);
    })
    .add('mops.Checked#getCheckedGroups без групп', function() {
        checked.getCheckedGroups(getGroupsEmpty);
    })
    .add('mops.Checked#getCheckedGroups с исходным объектом в виде группы', function() {
        checked.getCheckedGroups(getGroupsSelf);
    })
    .add('mops.Checked#getCheckedGroups с двумя постоянно разными группами', function() {
        checked.getCheckedGroups(getGroupsOther);
    })
    .add('mops.Checked#getCheckedGroups с одной общей группой', function() {
        checked.getCheckedGroups(getGroupsOne);
    })

    .add('mops.Checked#getGroups с произвольными группами', function() {
        checked.getGroups(getGroups);
    })
    .add('mops.Checked#getGroups с произвольным количеством (от 0 до 5) произвольных групп', function() {
        checked.getGroups(getGroupsRandon);
    })
    .add('mops.Checked#getGroups без групп', function() {
        checked.getGroups(getGroupsEmpty);
    })
    .add('mops.Checked#getGroups с исходным объектом в виде группы', function() {
        checked.getGroups(getGroupsSelf);
    })
    .add('mops.Checked#getGroups с двумя постоянно разными группами', function() {
        checked.getGroups(getGroupsOther);
    })
    .add('mops.Checked#getGroups с одной общей группой', function() {
        checked.getGroups(getGroupsOne);
    })

    .add('mops.Checked#toArray', function() {
        checked.toArray();
    })

    .add('mops.Checked#check', function() {
        this.checked.check({});
    }, {
        onStart: function() {
            this.checked = new mops.Checked();
        },
        onComplete: function() {
            this.checked.clear();
            delete this.checked;
        }
    })

    .add('mops.Checked#uncheck', function() {
        this.checked.uncheck({});
    }, {
        onStart: function() {
            this.checked = new mops.Checked();
        },
        onComplete: function() {
            this.checked.clear();
            delete this.checked;
        }
    });

    suite.run({ async: true, queued: true });




    function getGroups(item) {
        return _.without(_.sampleSize(objects, 2), item);
    }

    function getGroupsEmpty() {
        return [];
    }

    function getGroupsSelf(item) {
        return [ item ];
    }

    function getGroupsOther() {
        return [ { other: 1 }, { other: 2 } ];
    }

    function getGroupsOne() {
        return [ objects[ 0 ] ];
    }

    function getGroupsRandon(item) {
        return _.without(_.sampleSize(objects, _.random(0, 5)), item);
    }
}())
