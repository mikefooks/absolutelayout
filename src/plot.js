define('plot', [], function() {

    var Plot = function(params, layout) {
        var plotDimensions = layout.cellDimensions(params.row, params.column);

        this.location = {
            row: params.row,
            column: params.column
        };
        this.cssProps = {
            position: 'absolute',
            left: plotDimensions.width,
            top: plotDimensions.height
        };

        this.occupied = false;
    };

    return Plot;

});