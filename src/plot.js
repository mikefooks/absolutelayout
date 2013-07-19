define('plot', [], function() {

    var Plot = function(plotInfoObj, layout) {
        var plotDimensions = layout.cellDimensions(plotInfoObj.row, plotInfoObj.column);

        this.location = plotInfoObj;

        this.cssProps = {
            position: 'absolute',
            left: plotDimensions.width,
            top: plotDimensions.height
        };

        this.occupied = false;
    };

    return Plot;

});