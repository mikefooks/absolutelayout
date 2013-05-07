define(['cell_plot'], function(Layout) {
    
    var Mediator = {
        Models: {
            Layout: Layout.Layout,
            Cell: Layout.Cell,
            Plot: Layout.Plot
        },
        events: {},
        addEvent: function(channel, fn) {
            if (!this.events[channel]) {
                this.events[channel] = [];
            }
            this.events[channel].push(fn);
        },
        removeEvent: function(channel) {

        },
        trigger: function(channel, data, context) {
            this.events[channel].forEach(function(fn) {
                fn.call(context, data);
            });
        }
    };

    return Mediator;

});