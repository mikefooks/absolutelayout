"use strict";

function Layout(columns, rows, container) {
    this.columns = columns;
    this.rows = rows;
    this.container = document.querySelector(container);

    this.height = this.container.clientHeight;
    this.width = this.container.clientWidth;
}

Layout.prototype = {

    constructor: Layout,

    /**
     * Creates all the necessary Plot instances, based on the 
     * Layout's configuration.
     */
    refresh: function () {
        var plots = this.plots || (this.plots = {}),
            i, j, dimensions;

        for (i = 0; i < this.rows; i++) {
            for (j = 0; j < this.columns; j++) {
                // We use _cellDimensions here to get left and
                // top values for the plot's location.
                dimensions = this._cellDimensions(i, j);

                plots[i + "-" + j] = {
                    row: i,
                    column: j,
                    occupied: false,
                    css: {
                        position: "absolute",
                        top: dimensions.height,
                        left: dimensions.width
                    }
                };
            }
        }

        return this;
    },

    /**
     * Finds the dimensions for a new plot or cell based on given
     * dimensions in rows and columns.
     */
    _cellDimensions: function (row, column) {
        return {
            width: ((100 / this.columns) * column) + '%',
            height: ((100 / this.rows) * row) + '%'
        };
    },

    /**
     * Returns an object containing all the plots which have their occupied
     * property set to true on account of their being occupied
     * by a Cell.
     */
    _getOccupied: function () {
        return objFilter(this.plots, function (plot) {
            return plot.occupied;
        });
    },

    /**
     * Opposite of above. Return an object containing the unoccupied
     * plots.
     */
    _getUnoccupied: function () {
        return objFilter(this.plots, function (plot) {
            return !plot.occupied;
        });
    },

    /**
     * takes an array of plot ids and checks to see if any are either
     * out of bounds or currently occupied. Gets called before a 
     * cell is rendered, repositioned or resized.
     */
    _checkPosition: function (plotsToCheck) {
        var allPlotKeys = Object.keys(this.plots),
            occupiedPlotKeys = Object.keys(this._getOccupied()),
            i, outOfBounds, isOccupied;

        for (i = 0; i < plotsToCheck.length; i++) {
            outOfBounds = allPlotKeys.indexOf(plotsToCheck[i]) < 0;
            isOccupied = occupiedPlotKeys.indexOf(plotsToCheck[i]) >= 0;

            if (outOfBounds || isOccupied) {
                return false;
            }
        }

        return true;
    }
};

/**
 * filters objects based on a callback comparator.
 */
function objFilter(obj, callback, context) {
    var ret = {};

    forIn(obj, function (value, key) {
        if (callback(value)) {
            ret[key] = value;
        }
    }, context);

    return ret;
}

/**
 * For looping through objects and applying a callback. Context
 * is optional.
 */
function forIn(obj, callback, context) {
    var keys = Object.keys(obj),
        i;

    if (!context) { context = this; }

    for (i = 0; i < keys.length; i++) {
        callback.call(context, obj[keys[i]], keys[i]);
    }
}

var layout = new Layout(10, 10, "div.layoutBox").refresh();

["1-4", "1-5", "1-6", "7-6"].forEach(function (id) {
    layout.plots[id].occupied = true;
});