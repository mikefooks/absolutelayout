require.config({
    paths: {
        'jquery': 'lib/jquery-1.9.1.min',
        'cell_plot': 'cell_plot'
    }
});

require(['jquery', 'cell_plot'], function($, Playout) {

    "use strict";

    $(document).ready(function() {
        var layout = new Playout.Layout({
            fluid: false,
            container: 'div#container',
            columns: 8,
            rows: 8
        });

        window.layout = layout;
    });

    $('div#container').on('click', function(evt) {

        var contDimensions = layout.containerDimensions,
            plotX = Math.floor(evt.originalEvent.layerX / contDimensions.width * layout.config.columns),
            plotY = Math.floor(evt.originalEvent.layerY / contDimensions.height * layout.config.rows);

        layout.addCell([1, 1], [plotY, plotX], 'thing_' + plotY + '-' + plotX, 'content-box');

    });
});