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

    suite
    .add('mops.Checked#getCheckedGroups с произвольными группами', function() {
        this.checked.getCheckedGroups(getGroups);
    }, {
        onStart: function() {
            this.checked = new mops.Checked(objects);
        },
        onComplete: function() {
            this.checked.clear();
            delete this.checked;
        }
    })
    .add('mops.Checked#getCheckedGroups с произвольным количеством (от 0 до 5) произвольных групп', function() {
        this.checked.getCheckedGroups(getGroupsRandon);
    }, {
        onStart: function() {
            this.checked = new mops.Checked(objects);
        },
        onComplete: function() {
            this.checked.clear();
            delete this.checked;
        }
    })
    .add('mops.Checked#getCheckedGroups без групп', function() {
        this.checked.getCheckedGroups(getGroupsEmpty);
    }, {
        onStart: function() {
            this.checked = new mops.Checked(objects);
        },
        onComplete: function() {
            this.checked.clear();
            delete this.checked;
        }
    })
    .add('mops.Checked#getCheckedGroups с исходным объектом в виде группы', function() {
        this.checked.getCheckedGroups(getGroupsSelf);
    }, {
        onStart: function() {
            this.checked = new mops.Checked(objects);
        },
        onComplete: function() {
            this.checked.clear();
            delete this.checked;
        }
    })
    .add('mops.Checked#getCheckedGroups с двумя постоянно разными группами', function() {
        this.checked.getCheckedGroups(getGroupsOther);
    }, {
        onStart: function() {
            this.checked = new mops.Checked(objects);
        },
        onComplete: function() {
            this.checked.clear();
            delete this.checked;
        }
    })
    .add('mops.Checked#getCheckedGroups с одной общей группой', function() {
        this.checked.getCheckedGroups(getGroupsOne);
    }, {
        onStart: function() {
            this.checked = new mops.Checked(objects);
        },
        onComplete: function() {
            this.checked.clear();
            delete this.checked;
        }
    })

    .add('mops.Checked#getGroups с произвольными группами', function() {
        this.checked.getGroups(getGroups);
    }, {
        onStart: function() {
            this.checked = new mops.Checked(objects);
        },
        onComplete: function() {
            this.checked.clear();
            delete this.checked;
        }
    })
    .add('mops.Checked#getGroups с произвольным количеством (от 0 до 5) произвольных групп', function() {
        this.checked.getGroups(getGroupsRandon);
    }, {
        onStart: function() {
            this.checked = new mops.Checked(objects);
        },
        onComplete: function() {
            this.checked.clear();
            delete this.checked;
        }
    })
    .add('mops.Checked#getGroups без групп', function() {
        this.checked.getGroups(getGroupsEmpty);
    }, {
        onStart: function() {
            this.checked = new mops.Checked(objects);
        },
        onComplete: function() {
            this.checked.clear();
            delete this.checked;
        }
    })
    .add('mops.Checked#getGroups с исходным объектом в виде группы', function() {
        this.checked.getGroups(getGroupsSelf);
    }, {
        onStart: function() {
            this.checked = new mops.Checked(objects);
        },
        onComplete: function() {
            this.checked.clear();
            delete this.checked;
        }
    })
    .add('mops.Checked#getGroups с двумя постоянно разными группами', function() {
        this.checked.getGroups(getGroupsOther);
    }, {
        onStart: function() {
            this.checked = new mops.Checked(objects);
        },
        onComplete: function() {
            this.checked.clear();
            delete this.checked;
        }
    })
    .add('mops.Checked#getGroups с одной общей группой', function() {
        this.checked.getGroups(getGroupsOne);
    }, {
        onStart: function() {
            this.checked = new mops.Checked(objects);
        },
        onComplete: function() {
            this.checked.clear();
            delete this.checked;
        }
    })

    .add('mops.Checked#toArray', function() {
        this.checked.toArray();
    }, {
        onStart: function() {
            this.checked = new mops.Checked(objects);
        },
        onComplete: function() {
            this.checked.clear();
            delete this.checked;
        }
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
