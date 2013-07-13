define('cell', ['jquery'], function($) {

    var Cell = function() {
        this.positionPlot = {};
        this.cellInfo = {};
        this.layout = {};
        this.cssProps = {};
        this.idName = '';
        this.classNames = [];
        this.container = {};
        this.$obj = {};
    };

    Cell.prototype = {
        initConfig: function(params, layout) {
                /* The row and column for the top and leftmost plot the cell occupies */
            var topleft = params.topLeft,
                /* The dimensions, in rows and columns, of the new cell */
                dimensionsIn = params.dimensionsIn,
                /* The Plot object which corresponds to the topLeft values above */
                positionPlot = layout.Plots[topleft[0] + '-' +topLeft[1]],
                /* The width and height, in % or px, or the new cell */
                dimensionsProperty = layout.cellDimensions(dimensionsIn[0], dimensionsIn[1]),
                /* The top left values, in % or px */
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