require.config({
    paths: {
        'jquery': 'lib/jquery-1.9.1.min',
        'cell_plot': 'cell_plot',
        'mediator': 'mediator'
    }
});

require(['jquery', 'cell_plot', 'mediator'], function($, Playout, Mediator) {

    "use strict";

    var layout = new Playout.Layout({container: 'div.container', fluid: false, columns: 8, rows: 8});

    layout.addCell([4, 4], [3, 3], 'box_1', 'content-box');

    layout.addCell([2, 2], [0, 0], 'box_2', 'content-box');

    window.layout = layout;

});