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
                plots[i + "-" + j] = {
                    row: j,
                    column: i,
                    occupied: false
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

    /**
     * Modifies all the cell object's internal properties to reflect a
     * change in the cell's size and, if the resize happens to project
     * from the top (north) or left(west) of the cell, the position
     * needs to be changed as well.
     */
    resizeCell: function (id, bbox) {
        var cell = this.cells.filter(function (cell) {
                return cell.id == id;
            })[0],
            newPlots = this._findPlotsByBBox(bbox),
            plotSetData = this._intersectPlotKeys(cell.plots, newPlots);

        return this._modifyCell(cell, newPlots, plotSetData);
    },

    /**
     * Takes the information obtained from the UI and computes the plot
     * parameters involved in moving a cell.
     */
    moveCell: function (id, bbox) {
        var cell = this.cells.filter(function (cell) {
            return cell.id == id;
        })[0],
            left = this._findColumnByCoord(bbox.left),
            top = this._findRowByCoord(bbox.top),
            rowsCols = this._rowsAndColumns(cell.plots),
            newPlots = this._getPlots(left, top, rowsCols.columns, rowsCols.rows),
            plotSetData = this._intersectPlotKeys(cell.plots, newPlots);

        return this._modifyCell(cell, newPlots, plotSetData);
    },

    /**
     * Takes the new plot data either from the resize or move method,
     * checks whether the involved plots are occupied are not and, if not
     * makes the necessary changes to the cell to reflect the resize or
     * move action.
     */
    _modifyCell: function (cell, newPlots, plotSetData) {
        var position = this._cellPosition(newPlots[0]),
            dimensions = this._cellDimensions(newPlots),
            isClear = this._checkPosition(plotSetData.entering),
            i;

        if (isClear) {
            for (i = 0; i < plotSetData.exiting.length; i++) {
                this.plots[plotSetData.exiting[i]].occupied = false;
            }

            for (i = 0; i < plotSetData.entering.length; i++) {
                this.plots[plotSetData.entering[i]].occupied = true;
            }

            cell.plots = newPlots;
            cell.style.left = position.left;
            cell.style.top = position.top;
            cell.style.width = dimensions.width;
            cell.style.height = dimensions.height;

            return cell;
        }
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
        var old = currentPlots.slice(0),
            intersecting = [],
            entering = [],
            plotIndex, i;

        for (i = 0; i < enteringPlots.length; i++) {
            plotIndex = old.indexOf(enteringPlots[i]);

            if (plotIndex >= 0) {
                intersecting.push(old.splice(plotIndex, 1)[0]);
            } else {
                entering.push(enteringPlots[i]);
            }
        }

        return {
            exiting: old,
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
            columns = rightCol - leftCol + 1,
            rows = bottomRow - topRow + 1;
            
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
        var dimensions = this._rowsAndColumns(plotKeys);

        return {
            width: ((100 / this.columns) * dimensions.columns) + '%',
            height: ((100 / this.rows) * dimensions.rows) + '%'
        };
    },


    /**
     * Takes an array of plotKeys and returns the width and height in
     * columns and rows of a cell occupying those plots.
     */
    _rowsAndColumns: function (plotKeys) {
        var leftTop = plotKeys[0].split("-"),
            rightBottom = plotKeys.slice(-1)[0].split("-"),
            columns = rightBottom[0] - leftTop[0] + 1,
            rows = rightBottom[1] - leftTop[1] + 1;

        return {
            columns: columns,
            rows: rows
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