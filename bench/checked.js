(function () {
    var objects = [];
    for (var i = 0; i < 1000; i++) {
        objects.push({ obj: i });
    }

    var suite = new Benchmark.Suite('mops.Checked', {
        onCycle: function (event) {
            outputCycle(event);
        },

        onComplete: function () {
            outputComplete(this);
        }
    });

    suite
    .add('mops.Checked#getGroupsObjects с произвольными группами', function() {
        var checked = new mops.Checked(objects);
        checked.getGroupsObjects(getGroups);
    })
    .add('mops.Checked#getGroupsObjects с произвольным количеством (от 0 до 5) произвольных групп', function() {
        var checked = new mops.Checked(objects);
        checked.getGroupsObjects(getGroupsRandon);
    })
    .add('mops.Checked#getGroupsObjects без групп', function() {
        var checked = new mops.Checked(objects);
        checked.getGroupsObjects(getGroupsEmpty);
    })
    .add('mops.Checked#getGroupsObjects с исходным объектом в виде группы', function() {
        var checked = new mops.Checked(objects);
        checked.getGroupsObjects(getGroupsSelf);
    })
    .add('mops.Checked#getGroupsObjects с двумя постоянно разными группами', function() {
        var checked = new mops.Checked(objects);
        checked.getGroupsObjects(getGroupsOther);
    })
    .add('mops.Checked#getGroupsObjects с одной общей группой', function() {
        var checked = new mops.Checked(objects);
        checked.getGroupsObjects(getGroupsOne);
    })

    .add('mops.Checked#getGroups с произвольными группами', function() {
        var checked = new mops.Checked(objects);
        checked.getGroups(getGroups);
    })
    .add('mops.Checked#getGroups с произвольным количеством (от 0 до 5) произвольных групп', function() {
        var checked = new mops.Checked(objects);
        checked.getGroups(getGroupsRandon);
    })
    .add('mops.Checked#getGroups без групп', function() {
        var checked = new mops.Checked(objects);
        checked.getGroups(getGroupsEmpty);
    })
    .add('mops.Checked#getGroups с исходным объектом в виде группы', function() {
        var checked = new mops.Checked(objects);
        checked.getGroups(getGroupsSelf);
    })
    .add('mops.Checked#getGroups с двумя постоянно разными группами', function() {
        var checked = new mops.Checked(objects);
        checked.getGroups(getGroupsOther);
    })
    .add('mops.Checked#getGroups с одной общей группой', function() {
        var checked = new mops.Checked(objects);
        checked.getGroups(getGroupsOne);
    })

    .add('mops.Checked#getObjects', function() {
        var checked = new mops.Checked(objects);
        checked.getObjects();
    })
    .add('mops.Checked#check', function() {
        var checked = new mops.Checked();
        checked.check({});
    })
    .add('mops.Checked#uncheck', function() {
        var checked = new mops.Checked();
        checked.uncheck({});
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
