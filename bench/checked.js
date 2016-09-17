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
    .add('mops.Checked#getGroupObjects с произвольными группами', function() {
        var checked = new mops.Checked(objects);
        checked.getGroupObjects(getGroups);
    })
    .add('mops.Checked#getGroupObjects с произвольным количеством (от 0 до 5) произвольных групп', function() {
        var checked = new mops.Checked(objects);
        checked.getGroupObjects(getGroupsRandon);
    })
    .add('mops.Checked#getGroupObjects без групп', function() {
        var checked = new mops.Checked(objects);
        checked.getGroupObjects(getGroupsEmpty);
    })
    .add('mops.Checked#getGroupObjects с исходным объектом в виде группы', function() {
        var checked = new mops.Checked(objects);
        checked.getGroupObjects(getGroupsSelf);
    })
    .add('mops.Checked#getGroupObjects с двумя постоянно разными группами', function() {
        var checked = new mops.Checked(objects);
        checked.getGroupObjects(getGroupsOther);
    })
    .add('mops.Checked#getGroupObjects с одной общей группой', function() {
        var checked = new mops.Checked(objects);
        checked.getGroupObjects(getGroupsOne);
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

    suite.run({ 'async': true });




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
