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
        }, this);

        this.Cells[newCell.idName] = newCell;

        for (var i = 0; i < dimensionsIn[0]; i++) {
            for (var j = 0; j < dimensionsIn[1]; j++) {
                occupiedPlot = (topLeft[0] + i) + '-' + (topLeft[1] + j);
                occupiedPlots.push(occupiedPlot);
            }
        }

        occupiedPlots.forEach(function(obj, idx) {
            if (that.Plots[obj].occupied === true) {
                renderFlag = false;
            }
        });

        if (renderFlag) {
            occupiedPlots.forEach(function(obj, idx) {
                that.Plots[obj].occupied = true;
            });

            newCell.occupiedPlots = occupiedPlots;

            newCell.render();

        } else {
            console.log('cannot render a new cell on an occupied plot!');
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

    Layout.prototype.clearAllCells = function() {
        for (var prop in this.Cells) {
            if (this.Cells.hasOwnProperty(prop)) {
                this.Cells[prop].$obj.remove();
            }
        }

        this.Cells = {};
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
            .css(this.cssProps);
    };

    // Repositions a cell and updates internal properties.

    Cell.prototype.reposition = function(newPosition) {
        var that = this,
            occupiedPlot,
            renderOkay = true,
            backupAttrs = {
                buCellInfo: this.cellInfo,
                buOccupiedPlots: this.occupiedPlots,
                buLayoutPlots: this.layout.Plots
            };

        function restoreBackup() {
            that.cellInfo = backupAttrs.buCellInfo;
            that.occupiedPlots = backupAttrs.buOccupiedPlots;
            backupAttrs.buOccupiedPlots.forEach(function(plot) {
                that.layout.Plots[plot].occupied = true;
            });
        }

        this.cellInfo = {
            loc: newPosition,
            dim: this.cellInfo.dim
        };

        console.log(this.cellInfo);

        this.occupiedPlots.forEach(function(plot) {
            that.layout.Plots[plot].occupied = false;
        });

        this.occupiedPlots = [];

        for (var i = 0; i < this.cellInfo.dim[0]; i++) {
            for (var j = 0; j < this.cellInfo.dim[1]; j++) {
                occupiedPlot = (this.cellInfo.loc[0] + i) + '-' + (this.cellInfo.loc[1] + j);
                if (this.layout.Plots[occupiedPlot].occupied === false) {
                    this.occupiedPlots.push(occupiedPlot);
                    console.log('this worked!');
                } else {
                    restoreBackup();
                    console.log('cannot move there! restoring backup...');
                    return;
                }
            }
        }

        this.occupiedPlots.forEach(function(prop) {
            that.layout.Plots[prop].occupied = true;
        });

        this.positionPlot = this.layout.Plots[newPosition[0] + '-' + newPosition[1]];

        this.cssProps = $.extend({},
            this.layout.cellDimensions(this.cellInfo.dim[0], this.cellInfo.dim[1]),
            {
                top: this.positionPlot.cssProps.top,
                left: this.positionPlot.cssProps.left
            }
        );

        this.$obj.css(this.cssProps);
    };

    Cell.prototype.render = function() {
        this.container.append(this.$obj);
    };

    // A plot is an unoccupied space on the layout grid. The layout object
    // contains col * rows plots. A plot's only purpose is to contain positioning
    // information to be used by cells.

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