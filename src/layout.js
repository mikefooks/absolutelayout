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
            i, j, position;

        for (i = 0; i < this.columns; i++) {
            for (j = 0; j < this.rows; j++) {
                position = this._cellPosition(i + "-" + j);

                plots[i + "-" + j] = {
                    row: j,
                    column: i,
                    occupied: false,
                    css: {
                        position: "absolute",
                        left: position.left,
                        top: position.top
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
        var plotKeys = this._findPlotsByBBox(bbox),
            isClear = this._checkPosition(plotKeys),
            dimensions = this._cellDimensions(plotKeys),
            position = this._cellPosition(plotKeys[0]),
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
                    left: position.left,
                    top: position.top,
                    width: dimensions.width,
                    height: dimensions.height
                }
            };

            cells.push(newCell);
        }

        return newCell;
    },

    resizeCell: function (id, distance, dir) {
        var rowWidth = this.el.offsetHeight / this.rows,
            colWidth = this.el.offsetWidth / this.columns,
            cell = this.cells.filter(function (cell) {
                return cell.id == id;
            })[0];

        console.log(cell);
        console.log(distance);
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
     * Takes two arrays of plots and returns an object containing three
     * properties: an array of those plots exclusive to the first, an
     * array of those plots which are intersected by both the first and
     * second, and an array of those plots exclusive to the second.
     */
    _intersectPlotKeys: function (currentPlots, enteringPlots) {
        var intersecting = [],
            entering = [],
            plotIndex, i;

        for (i = 0; i < enteringPlots.length; i++) {
            plotIndex = currentPlots.indexOf(enteringPlots[i]);

            if (plotIndex >= 0) {
                intersecting.push(currentPlots.splice(plotIndex, 1)[0]);
            } else {
                entering.push(enteringPlots[i]);
            }
        }

        return {
            old: currentPlots,
            intersecting: intersecting,
            entering: entering
        };
    },

    /**
     * Takes an object containing numeric top, left, right and bottom
     * properties and returns a list of the plots corresponding to that
     * bounding box.
     */
    _findPlotsByBBox: function (bbox) {
        var leftCol = this._findColumnByCoord(bbox.left),
            rightCol = this._findColumnByCoord(bbox.right),
            topRow = this._findRowByCoord(bbox.top),
            bottomRow = this._findRowByCoord(bbox.bottom),
            columns = rightCol - leftCol,
            rows = bottomRow - topRow;

        return this._getPlots(leftCol, topRow, columns, rows);
    },

    /**
     * find which row a given y-axis pixel coordinate is on.
     */
    _findRowByCoord: function (y) {
        return Math.floor(y / this.el.offsetHeight * this.rows);
    },

    /**
     * find which row a given x-axis pixel coordinate is on.
     */
    _findColumnByCoord: function (x) {
        return Math.floor(x / this.el.offsetWidth * this.columns);
    },

    /**
     * Provides the left and top values for a given plot.
     */
    _cellPosition: function (plot) {
        var leftTop = plot.split("-"),
            left = leftTop[0],
            top = leftTop[1];

        return {
            left: ((100 / this.columns) * left) + '%',
            top: ((100 / this.rows) * top) + '%'
        };
    },

    /**
     * Finds the dimensions in % given an array of plotKeys.
     */
    _cellDimensions: function (plotKeys) {
        var leftTop = plotKeys[0].split("-"),
            rightBottom = plotKeys.slice(-1)[0].split("-"),
            columns = rightBottom[0] - leftTop[0],
            rows = rightBottom[1] - leftTop[1];

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
    _getPlots: function(left, top, columns, rows) {
        var plots = [],
            onePlot;

        for (var i = 0 ; i < columns; i += 1) {
            for (var j = 0 ; j < rows; j += 1) {
                onePlot = (left + i) + "-" + (top + j);
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