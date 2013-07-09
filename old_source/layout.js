define(['jquery'], function($) {

    "use strict";

    var Layout = function(config) {
        this.config = {
            fluid: config.fluid,
            container: $(config.container),
            columns: config.columns,
            rows: config.rows
        };

        this.Plots = {};

        this.Cells = {};

        this.refresh();
    };

    /** 
    * Checks to make sure if any of the Plots involved in the rendering or
    * repositioning of a cell are occupied or out of bounds, and returns an
    * object containing the names of the affected plots and a flag indicating
    * whether it is safe to proceed with the operation.
    */

    Layout.prototype.checkPosition = function(plots) {
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
    };


    // returns an array with the names of the plots that a theoretical cell with
    // the provided location and dimensions would occupy.
    Layout.prototype.getPlots = function(rows, columns, top, left) {
        var plots = [],
            onePlot;

        for (var i = 0 ; i < rows; i += 1) {
            for (var j = 0 ; j < columns; j += 1) {
                onePlot = (top + i) + '-' + (left + j);
                plots.push(onePlot);
            }
        }

        return plots;
    };

    // Adds a cell to the container and registers it with the Cells object.
    // dimensionsIn([number]rows, [number]columns) > number of rows and columns to span with new cell
    // topLeft([number]top, [number]left) > position of top left corner of cell.

    Layout.prototype.addCell = function(dimensionsIn, topLeft, idName, classNames) {
        var that = this,
            occupiedPlots = [],
            renderFlag = true,
            occupiedPlot,
            newCell = new Cell({
                dimensionsIn: dimensionsIn,
                topLeft: topLeft,
                idName: idName,
                classNames: classNames
            }, this),
            plots = this.getPlots(dimensionsIn[0], dimensionsIn[1], topLeft[0], topLeft[1]);

        if (!this.checkPosition(plots)) {
            console.log('cannot render a new cell on an occupied plot!');
            return;
        } else {
            plots.forEach(function(obj, idx) {
                that.Plots[obj].occupied = true;
            });

            this.Cells[newCell.idName] = newCell;

            newCell.occupiedPlots = plots;

            newCell.render();
        }
    };

    // Returns the dimensions for a new cell, given the current column and row settings
    // and layout dimensions.

    Layout.prototype.cellDimensions = function(rows, columns) {
        var dimensions = this.containerDimensions,
            config = this.config;

        if (this.config.fluid === true) {
            return {
                width: ((100 / config.columns) * columns) + '%',
                height: ((100 / config.rows) * rows) + '%'
            };
        } else {
            return {
                width: (dimensions.width / config.columns) * columns,
                height: (dimensions.height / config.rows) * rows
            };
        }
    };

    // Refreshes the layout grid points. Should be bound to load and resize events.

    Layout.prototype.refresh = function() {

        this.containerDimensions = {
            height: this.config.container.height(),
            width: this.config.container.width()
        };

        for (var i = 0; i < this.config.rows; i++) {
            for (var j = 0; j < this.config.columns; j++) {
                var newPlot = new Plot({
                    row: i,
                    col: j
                }, this);

                this.Plots[i + '-' +j] = newPlot;
            }
        }
    };

    Layout.prototype.getUnoccupied = function() {
        var that = this,
            unoccupied = $.grep(Object.keys(this.Plots), function(obj, idx) {
            if (that.Plots[obj].occupied === false) {
                return obj;
            }
        });

        return unoccupied;
    };

    Layout.prototype.getOccupied = function() {
        var that = this,
            occupied = $.grep(Object.keys(this.Plots), function(obj, idx) {
            if (that.Plots[obj].occupied === true) {
                return obj;
            }
        });

        return occupied;
    };

    Layout.prototype.clearAllCells = function() {
        for (var prop in this.Cells) {
            if (this.Cells.hasOwnProperty(prop)) {
                this.Cells[prop].$obj.remove();
            }
        }

        this.Cells = {};
    };

    Layout.prototype.cssToString = function() {
        var cssString = "",
            cellKeys = Object.keys(this.Cells),
            cellcssString;

        for (var i = 0; i < cellKeys.length; i+=1) {
            cellcssString = JSON.stringify(this.Cells[cellKeys[i]].cssProps, null, "\t").split();
            cellcssString.unshift(cellKeys[i] + " ");
            cellcssString = cellcssString.join("").replace(/[\",]/g, "");
            cellcssString = cellcssString.replace(/[0-9\.]{1,3}(%|px)/g, "$&;");
            cssString += cellcssString + "\n";
        }

        return cssString;
    };

    // Cell is an actual element meant for appending to the DOM, it occupies a point on the
    // layout determined by its associated position Plot.

    var Cell = function(params, layout) {
        var that = this,
            topLeft = params.topLeft,
            dimensionsIn = params.dimensionsIn,
            positionPlot = layout.Plots[topLeft[0] + '-' + topLeft[1]],
            dimensionsProperty = layout.cellDimensions(dimensionsIn[0], dimensionsIn[1]),
            locationProperty = {
                top: positionPlot.cssProps.top,
                left: positionPlot.cssProps.left
            };

        this.positionPlot = positionPlot;
        this.cellInfo = {
            loc: topLeft,
            dim: dimensionsIn
        };
        this.layout = layout;
        this.cssProps = $.extend({}, dimensionsProperty, locationProperty);
        this.idName = params.idName;
        this.classNames = [];

        if (typeof params.classNames === 'string') {
            this.classNames.push(params.classNames);
        } else if (Array.isArray(params.classNames)) {
            this.classNames.concat(params.classNames);
        }

        this.container = layout.config.container;

        this.$obj = $('<div></div>')
            .attr('id', this.idName)
            .addClass(this.classNames.join(' '))
            .css(this.cssProps)
            .html("<p>" + this.idName + "</p>");
    };

    // Repositions a cell and updates internal properties.

    Cell.prototype.reposition = function(newPosition) {
        var that = this,
            newPlots = this.layout.getPlots(this.cellInfo.dim[0], this.cellInfo.dim[1], newPosition[0], newPosition[1]),
            adjustedPlots;

        // Creates an array of new occupied plots, minus the ones which intersect from
        // the cell's previous position, to avoid conflicts with the render flag.
        adjustedPlots = newPlots.filter(function(obj, idx) {
            if (that.occupiedPlots.indexOf(obj) === -1) {
                return obj;
            }
        });

        if (this.layout.checkPosition(adjustedPlots)) {

            this.occupiedPlots.forEach(function(plot) {
                that.layout.Plots[plot].occupied = false;
            });

            newPlots.forEach(function(plot) {
                that.layout.Plots[plot].occupied = true;
            });

            this.occupiedPlots = newPlots;
            this.cellInfo.loc = newPosition;
            this.positionPlot = this.layout.Plots[newPosition[0] + '-' + newPosition[1]];
            this.cssProps = $.extend({},
                this.layout.cellDimensions(this.cellInfo.dim[0], this.cellInfo.dim[1]),
                {
                    top: this.positionPlot.cssProps.top,
                    left: this.positionPlot.cssProps.left
                }
            );

            this.$obj.css(this.cssProps);

        } else {

            console.log("renderFlag returned false. something is in the way");
        }
    };

    Cell.prototype.render = function() {
        this.container.append(this.$obj);
    };

    // A plot is an unoccupied space on the layout grid. The layout object
    // contains col * rows plots. A plot's only purpose is to contain positioning
    // information to be used by cells and to retain a boolean value representing
    // whether or not its grid square is occupied.

    var Plot = function(params, layout) {
        var plotDimensions = layout.cellDimensions(params.row, params.col);

        this.location = {
            row: params.row,
            column: params.col
        };
        this.cssProps = {
            left: plotDimensions.width,
            top: plotDimensions.height
        };

        this.occupied = false;
    };

    return {
        Layout: Layout,
        Cell: Cell,
        Plot: Plot
    };
});
