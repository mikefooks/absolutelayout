"use strict";

function Layout(columns, rows, container) {
    this.columns = columns;
    this.rows = rows;
    this.el = getElement(container);
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
    addCell: function (top, left, rows, columns) {
        var plots = this._getPlots.call(null, top, left, rows, columns),
            isClear = this._checkPosition(plots),
            dimensions = this._cellDimensions(rows, columns),
            cells = this.cells || (this.cells = []),
            firstPlot = this.plots[top + "-" + left],
            el, innerElClasses, i;

        if (Array.isArray(plots) && isClear) {
            for (i = 0; i < plots.length; i++) {
                this.plots[plots[i]].occupied = true;
            }

            innerElClasses = [
                "resize_east",
                "resize_south",
                "resize_west",
                "resize_north"
            ];

            el = document.createElement("div");
            el.classList.add(this.cellClass);
            el.style.position = "absolute";
            el.style.height = dimensions.height;
            el.style.width = dimensions.width;
            el.style.top = firstPlot.css.top;
            el.style.left = firstPlot.css.left;

            innerElClasses.forEach(function (name) {
                var controlEl = document.createElement("div");
                controlEl.className = name;
                el.appendChild(controlEl);
            });

            cells.push({
                id: "",
                el: el,
                plots: plots,
                rows: rows,
                columns: columns
            });

            this.el.appendChild(el);

        } else if (!isClear) {
            console.log("isClear failed.");
        }

        return el;
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
     * Takes an origin and destination plot from the drag event handler
     * and returns an array which can be used in the addCell method.
     */
    _cellProperties: function (originPlot, destinationPlot) {
        var rowDiff = destinationPlot[1] - originPlot[1],
            columnDiff = destinationPlot[0] - originPlot[0],
            lowRow = rowDiff < 0 ? destinationPlot[1] : originPlot[1],
            lowColumn = columnDiff < 0 ? destinationPlot[0] : originPlot[0],
            rows = Math.abs(rowDiff) + 1,
            columns = Math.abs(columnDiff) + 1;

        return [lowRow, lowColumn, rows, columns];
    },

    /**
     * Returns the plot corresponding to given x and y coordinates
     * within the layout element.
     */
    _findPlotByCoords: function (x, y) {
        return [
            Math.floor(x / this.el.clientWidth * this.columns),
            Math.floor(y / this.el.clientHeight * this.rows)
        ];
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
 * Creates an HTML element with the given type.
 */
function createEl(type, attrs) {
    var el = document.createElement(type);

    if (arguments.length) {
        if (arguments.length == 1) {
            return el;        
        }

        forIn(attrs, function (val, key) {
            el.setAttribute(key, val);
        });

        return el;
    }
}

/**
 * appends a child element to a dom node.
 */
function appendTo(parent, child) {
    parent.appendChild(child);
}

/**
 * Returns the first node that matches the selector.
 */
function getElement(selector) {
    return document.querySelector(selector);
}

/**
 * Returns a nodeList of all the nodes that match the selector.
 */
function getElements(selection) {
    return document.querySelectorAll(selector);
}

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