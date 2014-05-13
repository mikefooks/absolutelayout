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
        var plots = this.plots || (this.plots = {}),
            i, j, dimensions;

        for (i = 0; i < this.rows; i++) {
            for (j = 0; j < this.columns; j++) {
                // We use cellDimensions here to get left and
                // top values for the plot's location.
                dimensions = this.cellDimensions(i, j);

                this.plots[i + "-" + j] = {
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
    /**
     * Returns an object containing all the plots which have their occupied
     * property set to true on account of their being occupied
     * by a Cell.
     */
    getOccupied: function () {
        return objFilter(this.plots, function (plot) {
            return plot.occupied;
        });
    },
    /**
     * Opposite of above. Return an object containing the unoccupied
     * plots.
     */
    getUnoccupied: function () {
        return objFilter(this.plots, function (plot) {
            return !plot.occupied;
        });
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

        context || (context = this);

    for (i = 0; i < keys.length; i++) {
        callback.call(context, obj[keys[i]], keys[i]);
    }
}