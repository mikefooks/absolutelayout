define('plot', [], function() {

    /* if you're going to want gutters, this is the place to add the functionality */
    function cellDimensions(row, column, layout) {
        /**
        * A helper method for finding the top/left of a given plot based on 
        * the input layout.
        */
        var dimensions = layout.containerDimensions,
            config = layout.config;

        if (layout.config.fluid === true) {
            return {
                width: ((100 / config.columns) * column) + '%',
                height: ((100 / config.rows) * row) + '%'
            };
        } else {
            return {
                width: (dimensions.width / config.column) * columns,
                height: (dimensions.height / config.row) * rows
            };
        }
    }

    var Plot = function(params, layout) {
        var plotDimensions = cellDimensions(params.row, params.column, layout);

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