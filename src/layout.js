define('layout', ['jquery', 'plot', 'cell'], function($, Plot, Cell) {

    /**
    * The Layout Constructor!
    */
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
        /**
        * Takes a config object and sets things up.
        */
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

            return this;
        },
        /**
        * Creates all the plots, based on the config object's
        * rows and columns
        */
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
        /**
        * Finds the dimensions for a new plot or cell based on given dimensions
        * in rows and columns.
        */
        cellDimensions: function(row, column) {
            var dimensions = this.containerDimensions,
                config = this.config;

            if (this.config.fluid === true) {
                return {
                    width: ((100 / config.columns) * column) + '%',
                    height: ((100 / config.rows) * row) + '%'
                };
            } else {
                return {
                    width: (dimensions.width / config.column) * columns,
                    height: (dimensions.height / config.row) * rows
                };
            }
        },
        /**
        * Returns an array of all the plots that have the occupied
        * attribute set to true, on account of their being occupied
        * by a Cell.
        */
        getOccupied: function() {
            var that = this,
                occupied = $.grep(Object.keys(this.Plots), function(obj, idx) {
                if (that.Plots[obj].occupied === true) {
                    return obj;
                }
            });

            return occupied;
        },
        /**
        * Prior to the rendering or repositioning of a cell, this method,
        * takes an array of the names of the plots involved and checks to see if any are 
        * currently occupied. Returns true if the specific plots are all
        * unoccupied and it's fine to put a new cell in or move an existing
        * cell to that location. 
        */
        checkPosition: function(plots) {
            var that = this,
                renderFlag = true,
                currentOccupied = this.getOccupied();

            plots.forEach(function(obj, idx) {
                if (!that.Plots.hasOwnProperty(obj)) {
                    /** 
                    * Need better user feedback than logging things to the
                    * console. 
                    */
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