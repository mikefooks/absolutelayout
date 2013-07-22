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
        * Contains the names of the plot objects occupied by the Cell - 
        * is only populated upon rendering to the layout. 
        */
        this.occupiedPlots = [];

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
            this.occupiedPlots = this.layout.getPlots(
                this.cellInfo.top,
                this.cellInfo.left,
                this.cellInfo.height,
                this.cellInfo.width
            );
            this.container.append(this.$obj);
        },
        /**
        * Repositions a cell on the layout.
        */
        reposition: function(top, left) {
            var that = this,
                newPlots = this.layout.getPlots(top, left, this.cellInfo.height, this.cellInfo.width),
                adjustedPlots;

            /**
            * Creates an array of new occupied plots, minus the ones which intersect from
            * the cell's previous position, to avoid conflicts with the render flag. So, 
            * 
            */
            adjustedPlots = newPlots.filter(function(obj, idx) {
                if (that.occupiedPlots.indexOf(obj) === -1) {
                    return obj;
                }
            });

            if (this.layout.checkPosition(adjustedPlots)) {
                this.cellInfo.top = top;
                this.cellInfo.left = left;
                this.positionPlot = this.layout.Plots[top + '-' + left];

                this.modify(newPlots);

            } else {

                console.log("renderFlag returned false. something is in the way");
            }
        },
        /** 
        * Resizes a cell. So far only expand and contracts along the bottom and
        * right edges of the cell.
        */
        resize: function(height, width) {
            var that = this,
                newPlots = this.layout.getPlots(this.cellInfo.top, this.cellInfo.left, height, width),
                adjustedPlots;

            adjustedPlots = newPlots.filter(function(obj, idx) {
                if (that.occupiedPlots.indexOf(obj) === -1) {
                    return obj;
                }
            });

            if (this.layout.checkPosition(adjustedPlots)) {
                this.cellInfo.height = height;
                this.cellInfo.width = width;

                this.modify(newPlots);

            } else {

                console.log("renderFlag returned false. something is in the way");
            }
        },
        /**
        * If the reposition or resize checks out, modify actually makes the
        * internal changes necessary to refresh the cell's attributes.
        */
        modify: function(newPlots) {
            var that = this;
            this.occupiedPlots.forEach(function(plot) {
                that.layout.Plots[plot].occupied = false;
            });

            newPlots.forEach(function(plot) {
                that.layout.Plots[plot].occupied = true;
            });

            this.occupiedPlots = newPlots;
            this.cssProps = $.extend({},
                this.layout.cellDimensions(this.cellInfo.height, this.cellInfo.width),
                {
                    top: this.positionPlot.cssProps.top,
                    left: this.positionPlot.cssProps.left
                }
            );

            this.$obj.css(this.cssProps);

        }
    };

    return {
        Cell: Cell,
        CellInfo: CellInfo
    };

});