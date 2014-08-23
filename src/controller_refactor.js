"use strict";

function Controls() {}

Controls.prototype = {
    constructor: Controls,
    /**
     * Kick things off.
     */
    init: function (layout) {
        this.layout = layout;
        this.events = {};
        this.dragCache = {};

        // Store the drag's origin in the control's dragCache object.
        this._listen("dragStart", function (evt) {
            this.dragCache.origin = [ evt.layerX, evt.layerY ];
        }, this);

        // Use all the necessary layer methods and information about the origin
        // that we just stored in order to create a new cell on the layer object.
        this._listen("dragEnd", function (evt) {
            var findPlot = this.layout._findPlotByCoords.bind(this.layout),
                origin = this.dragCache.origin,
                originPlot = findPlot(origin[0], origin[1]),
                destPlot = findPlot(evt.layerX, evt.layerY),
                newCellProperties = this.layout._cellProperties(originPlot, destPlot);

            this.layout.addCell.apply(this.layout, newCellProperties);
        }, this);

        // this.layout.container.addEventListener("mousedown", function (evt) {
        //     evt.preventDefault();
        // });

        layout.container.addEventListener("mousedown", (function (evt) {;
            this._fire("dragStart", evt);
            evt.preventDefault();
        }).bind(this), false);

        layout.container.addEventListener("mouseup", (function (evt) {
            if (!evt.target.classList.contains(layout.cellClass)) {
                this._fire("dragEnd", evt);               
            }
        }).bind(this), false);

        return this;

    },
    /**
     * Binds a function to a particular channel, such that when
     * the channel is triggered, the named function is among those
     * assigned to listen to that channel.
     */
    _listen: function (channel, fn, ctx) {
        ctx = ctx || this;

        if (!this.events[channel]) {
            this.events[channel] = [];
        }

        this.events[channel].push({ fn: fn, ctx: ctx });
    },
    /**
     * Fires all the functions listening to a particular event
     * channel.
     */
    _fire: function (channel) {
        var args = [].slice.call(arguments, 1);

        this.events[channel].forEach(function (obj) {
            obj.fn.apply(obj.ctx, args);
        });
    }
};