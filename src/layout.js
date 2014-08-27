"use strict";

function Layout(columns, rows, container) {
    this.columns = columns;
    this.rows = rows;
    this.el = document.querySelector(container);
    this.cellClass = "testCell";
}

Layout.prototype = {
    constructor: Layout,

    /**
     * Creates all the necessary plots, based on the 
     * Layout's configuration. A plot is just an imaginary cell, an
     * unrealized cell, sort of. A plot is basically an abstraction
     * whose purpose is to hold information about positioning and 
     * occupancy so that cells can be placed correctly.
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
     * builds a cell based on the provided parameters and, if it passes the
     * _checkPosition test, it gets registered with the Layout.cells object
     * and is appended to Layout.container.
     */
    addCell: function (bbox) {
        var topRow = this._findRowByCoord(bbox.top),
            bottomRow = this._findRowByCoord(bbox.bottom) + 1,
            leftCol = this._findColumnByCoord(bbox.left),
            rightCol = this._findColumnByCoord(bbox.right) + 1,
            columns = rightCol - leftCol,
            rows = bottomRow - topRow,
            plotKeys = this._getPlots(topRow, leftCol, rows, columns),
            firstPlot =  this.plots[topRow + "-" + leftCol],
            isClear = this._checkPosition(plotKeys),
            dimensions = this._cellDimensions(rows, columns),
            cells = this.cells || (this.cells = []),
            newCell, i;

        if (Array.isArray(plotKeys) && isClear) {
            for (i = 0; i < plotKeys.length; i++) {
                this.plots[plotKeys[i]].occupied = true;
            }

            newCell = {
                id: this._idCounter(),
                plots: plotKeys,
                attrs: {
                    class: this.cellClass
                },
                style: {
                    left: firstPlot.css.left,
                    top: firstPlot.css.top,
                    width: dimensions.width,
                    height: dimensions.height
                },
                rows: rows,
                columns: columns,
            };

            cells.push(newCell);
        }

        return newCell;
    },

    /**
     * Reads off the position and id properties of each cell and returns
     * a string of useable CSS.
     */
    getCss: function () {
        var cellStyles = this.cells.map(function (cell) {
            return cell.el.getAttribute("style");
        });

        return cellStyles.join("\n");
    },

    /**
     * A little counter so we can give each of our new cell elements 
     * a unique data-id value.
     */
    _idCounter: (function () {
        var count = 0;

        return function () {
            return count++;
        };
    })(),

    /**
     * find which row a given y-axis pixel coordinate is on.
     */
    _findRowByCoord: function (y) {
        return Math.floor(y / this.el.clientHeight * this.rows);
    },

    /**
     * find which row a given x-axis pixel coordinate is on.
     */
    _findColumnByCoord: function (x) {
        return Math.floor(x / this.el.clientWidth * this.columns);
    },

    /**
     * Finds the dimensions in % from dimensions given in rows and columns.
     */
    _cellDimensions: function (rows, columns) {
        return {
            width: ((100 / this.columns) * columns) + '%',
            height: ((100 / this.rows) * rows) + '%'
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
    },

    /**
     * takes the position and dimension values for a possible cell, and
     * returns the key names of the plots that such a cell would occupy. 
     */
    _getPlots: function(top, left, rows, columns) {
        var plots = [],
            onePlot;

        for (var i = 0 ; i < rows; i += 1) {
            for (var j = 0 ; j < columns; j += 1) {
                onePlot = (top + i) + "-" + (left + j);
                plots.push(onePlot);
            }
        }

        return plots;
    },
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

    context = context || this;

    for (i = 0; i < keys.length; i++) {
        callback.call(context, obj[keys[i]], keys[i]);
    }
}