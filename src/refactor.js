"use strict";

function Layout(columns, rows, container) {
    this.columns = columns;
    this.rows = rows;
    this.container = getElement(container);
    this.cellClass = "testCell";

    this.container.setAttribute("draggable", true);

    this._bindDragEvents();
}

Layout.prototype = {

    constructor: Layout,

    _bindDragEvents: function () {
        this.container.addEventListener("dragstart", (function (evt) {
            var origin = [evt.layerX, evt.layerY];
            evt.dataTransfer.origin = origin;
            evt.dataTransfer.originPlot = this._findPlot.apply(this, origin);
        }).bind(this));

        this.container.addEventListener("dragend", (function (evt) {
            var destination = [ evt.layerX, evt.layerY ],
                destinationPlot = this._findPlot.apply(this, destination),
                originPlot = evt.dataTransfer.originPlot,
                lowRow = Math.min(destinationPlot[1], originPlot[1]),
                highRow = Math.max(destinationPlot[1], originPlot[1]),
                lowColumn = Math.min(destinationPlot[0], originPlot[0]),
                highColumn = Math.max(destinationPlot[0], originPlot[0]);

            console.log({
                lowRow: lowRow,
                highRow: highRow,
                lowCol: lowColumn,
                highCol: highColumn,
                totalColumns: highColumn - lowColumn,
                totalRows: highRow - lowRow
            });

            if (lowRow < highRow && lowColumn < highColumn) {
                this.addCell(lowRow, lowColumn, highRow - lowRow + 1, highColumn - lowColumn + 1);
            }
        }).bind(this));  
    },

    /**
     * Returns the plot corresponding to given x and y coordinates
     * within the layout element.
     */
    _findPlot: function (x, y) {
        return [
            Math.floor(x / this.container.clientWidth * this.columns),
            Math.floor(y / this.container.clientHeight * this.rows)
        ];
    },

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


    /**
     * builds a cell based on the provided parameters and, if it passes the
     * _checkPosition test, it gets registered with the Layout.cells object
     * and is appended to Layout.container.
     */
    addCell: function (top, left, rows, columns) {
        var params = Array.prototype.slice.call(arguments, 0),
            plots = this._getPlots.apply(null, params),
            positionCheck = this._checkPosition(plots),
            cells = this.cells || (this.cells = []),
            newCell, i;

        console.log(top, left, rows, columns)

        // TODO if position check fails, there should be a custom error
        // of some kind.

        if (Array.isArray(plots) && positionCheck) {
            for (i = 0; i < plots.length; i++) {
                this.plots[plots[i]].occupied = true;
            }

            cells.push(new Cell(params, plots, this));

            return this;

        } else {
            if (!positionCheck) {
                console.log("positionCheck failed.");
            }
            return this;
        }
    }
};

function Cell(dimensions, plots, layout) {
    var cellDimensions = layout._cellDimensions(dimensions[2], dimensions[3]),
        
        // TODO: Need better way to assign cellClass to layout.
        newEl = createEl("div", { class: layout.cellClass }),
        elStyles;

    this.plots = plots.map(function (id) {
        return layout.plots[id];
    });

    // combines the first plot's css object, which contains top and left values,
    // with the just-obtained width and height values from the layout's
    // _cellDimensions method.
    elStyles = combine(this.plots[0].css, {
        width: cellDimensions.width,
        height: cellDimensions.height
    });

    this.parentLayout = layout;

    this.el = setStyles(newEl, elStyles);

    appendTo(this.parentLayout.container, this.el);

}

Cell.prototype = {

    constructor: Cell

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
 * Sets style attributes of a given HTMLelement. Takes either
 * two strings as arguments for a single attribute change or
 * an object with multiple changes.
 */
function setStyles(el) {
    var styleParams = Array.prototype.slice.call(arguments, 1),
        keys, i;

    // if using two strings to set a single style property.
    if (styleParams.length === 2 && styleParams.every(function (param) {
        return typeof param === "string";
    })) {
        el.style[styleParams[0]] = styleParams[1];

    // if using an object literal to set multiple style properties.
    } else if (styleParams.length === 1 && typeof styleParams === "object") {
        keys = Object.keys(styleParams[0]);

        for (i = 0; i < keys.length; i++) {
            el.style[keys[i]] = styleParams[0][keys[i]];
        }

    }

    return el;
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

/**
 * Takes a bunch of objects and mushes their properties together
 * into a new combined object.
 */
function combine() {
    var objects = Array.prototype.slice.call(arguments, 0),
        temp = {},
        i, keys;

    if (objects.every(function (obj) { return typeof obj == "object" })) {
        for (i = 0; i < objects.length; i++) {
            forIn(objects[i], function (val, key) {
                temp[key] = val;
            });
        }

        return temp;
    }
}