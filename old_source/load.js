require.config({
    paths: {
        'jquery': 'lib/jquery-1.9.1.min',
        'layout': 'layout',
        'mediator': 'mediator'
    }
});

require(['jquery', 'layout', 'mediator'], function($, Playout, Mediator) {

    "use strict";

    var layout = new Playout.Layout({container: 'div.container', fluid: true, columns: 8, rows: 8});

    layout.addCell([4, 4], [3, 3], 'box_1', 'content-box');

    layout.addCell([2, 2], [0, 0], 'box_2', 'content-box');

    window.layout = layout;

});