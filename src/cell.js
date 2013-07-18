define('cell', ['jquery'], function($) {

    /** 
    * Contains most basic cell information. Parameters expressed
    * in rows and columns.
    */
    var CellInfo = function(top, left, height, width, idName, classNames) {
        /* number of rows from the topmost edge of the layout */
        this.top = top;
        /* number of columns from the leftmost edge of the layout */
        this.left = left;
        /* height in rows */
        this.height = height;
        /* width in columns */
        this.width = width;
        this.idName = idName;
        this.classNames = classNames;
    };

    var Cell = function() {
        /* The Plot object which corresponds to the topLeft values above */
        this.positionPlot = {};

        /** 
        * The location(top, left) and dimensions of the cell
        * expressed in columns and rows.
        */
        this.cellInfo = {};

        /* The layout object of which this cell is a part. */
        this.layout = {};

        /** 
        * The location(top, left) and dimensions of the cell
        * expressed as % or px.
        */
        this.cssProps = {};

        /* The html container/wrapper with which the cell's layout
        * object is associated. */
        this.container = {};

        /** 
        * A jquery object representing the cell, for appending and
        * manipulating and such.
        */
        this.$obj = {};
    };

    Cell.prototype = {
        /**
        * Takes a config object and sets up the cell.
        */
        initConfig: function(cellInfoObj, layout) {
            var positionPlot = layout.Plots[cellInfoObj.top + '-' + cellInfoObj.left],
                dimensions = layout.cellDimensions(cellInfoObj.height, cellInfoObj.width),
                location = {
                    top: positionPlot.cssProps.top,
                    left: positionPlot.cssProps.left
                };

            this.positionPlot = positionPlot;
            this.cellInfo = cellInfoObj;
            this.layout = layout;
            this.cssProps = $.extend({}, dimensions, location);

            this.container = layout.config.container;
            this.$obj = $('<div></div>')
                .attr('id', this.cellInfo.idName)
                .addClass(this.cellInfo.classNames)
                .css(this.cssProps)
                .html('<p>' + this.cellInfo.idName + '</p>');
        },
        /**
        * Takes the $obj and actually appends it to the layout's configured
        * container.
        */
        render: function() {
            this.container.append(this.$obj);
        },
        /**
        * Repositions a cell on the layout, and adjusts all of its internal 
        * attributes to reflect that.
        */
        reposition: function(newPosition) {
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
    }
    };

    return {
        Cell: Cell,
        CellInfo: CellInfo
    };

});