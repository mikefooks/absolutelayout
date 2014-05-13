"use strict";

function Layout() {}

Layout.prototype = {
    constructor: Layout,
    /**
     * Takes a config object and sets up the layout object.
     */
    init: function (configObj) {
        this.container = document.querySelector(configObj.container);
        this.height = this.container.clientHeight;
        this.width = this.container.clientWidth;
        this.columns = configObj.columns;
        this.rows = configObj.rows;

        return this;
    },
    /**
     * Creates all the necessary Plot instances, based on the 
     * Layout's configuration.
     */
    refresh: function () {
        var plots = this.Plots || (this.Plots = {}),
            i, j, dimensions;

        for (i = 0; i < this.rows; i++) {
            for (j = 0; j < this.columns; j++) {
                // We use cellDimensions here to get left and
                // top values for the plot's location.
                dimensions = this.cellDimensions(i, j);

                this.Plots[i + "-" + j] = {
                    row: i,
                    column: j,
                    css: {
                        position: "absolute",
                        top: dimensions.height,
                        left: dimensions.width
                    }
                };
            }
        }
    },
    /**
     * Finds the dimensions for a new plot or cell based on given
     * dimensions in rows and columns.
     */
    cellDimensions: function (row, column) {
        return {
            width: ((100 / this.columns) * column) + '%',
            height: ((100 / this.rows) * row) + '%'
        };
    },
};