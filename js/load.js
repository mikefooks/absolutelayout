require.config({
    paths: {
        'jquery': 'lib/jquery-1.9.1.min',
        'cell_plot': 'cell_plot',
        'mediator': 'mediator'
    }
});

require(['jquery', 'cell_plot', 'mediator'], function($, Playout, Mediator) {

    "use strict";

    window.Playout = Playout;

    window.Mediator = Mediator;

});