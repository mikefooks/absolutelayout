define('cell', ['jquery'], function($) {

    var Cell = function() {
        /* The Plot object which corresponds to the topLeft values above */
        this.positionPlot = {};

        /** 
        * The location(top, left) and dimensions of the cell
        * expressed in columns and rows.
        */
        this.cellInfo = {
            location: {},
            dimensions: {}
        };

        /* The layout object of which this cell is a part. */
        this.layout = {};

        /** 
        * The location(top, left) and dimensions of the cell
        * expressed as % or px.
        */
        this.cssProps = {};

        /* The unique id which will become the cell html's id attribute. */
        this.idName = '';

        /* Class names which will become the cell html class attributes. */
        this.classNames = [];

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
        initConfig: function(params, layout) {
            var topLeft = params.topLeft,
                dimensionsIn = params.dimensionsIn,
                positionPlot = layout.Plots[topLeft[0] + '-' +topLeft[1]],
                /* There's some tight coupling going on here. Rethink. */
                dimensionsProperty = layout.cellDimensions(dimensionsIn[0], dimensionsIn[1]),
                locationProperty = {
                    top: positionPlot.cssProps.top,
                    left: positionPlot.cssProps.left
                };

            this.positionPlot = positionPlot;
            this.cellInfo = {
                location: topLeft,
                dimensions: dimensionsIn
            };
            this.layout = layout;
            this.cssProps = $.extend({}, dimensionsProperty, locationProperty);
            this.idName = params.idName;

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
                .html('<p>' + this.idName + '</p>');
        }
    };

    return Cell;

});