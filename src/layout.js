define('layout', ['jquery', 'lodash', 'plot'], function($, _, Plot) {

    var Layout = function() {
        this.config = {
            fluid: true,
            container: $(''),
            columns: 0,
            rows: 0
        };
        this.Plots = {};
        this.Cells = {};
        this.containerDimensions = {
            height: 0,
            width: 0
        };
    };

    Layout.prototype = {
        initConfig: function(configObj) {
            this.config = {
                fluid: configObj.fluid,
                container: $(configObj.container),
                columns: configObj.columns,
                rows: configObj.rows
            };

            this.containerDimensions = {
                height: this.config.container.height(),
                width: this.config.container.width()
            };
        },
        refresh: function() {
            for (var i = 0; i < this.config.rows; i++) {
                for (var j = 0; j < this.config.columns; j++) {
                    var newPlot = new Plot({
                        row: i,
                        column: j
                    }, this);

                    this.Plots[i + '-' +j] = newPlot;
                }
            }
        },
        getOccupied: function() {
            var that = this,
                occupied = $.grep(Object.keys(this.Plots), function(obj, idx) {
                if (that.Plots[obj].occupied === true) {
                    return obj;
                }
            });

            return occupied;
        },
        checkPosition: function(plots) {
            var that = this,
                renderFlag = true,
                currentOccupied = this.getOccupied();

            plots.forEach(function(obj, idx) {
                if (!that.Plots.hasOwnProperty(obj)) {
                    console.log('plot out of bounds');
                    renderFlag = false;
                } else if (currentOccupied.indexOf(obj) !== -1) {
                    console.log('plot currently occupied');
                    renderFlag = false;
                }
            });

            return renderFlag;

        }
    };

    return {
        Layout: Layout
    };

});