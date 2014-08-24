"use strict";

function Controls() {}

Controls.prototype = {
    constructor: Controls,
    /**
     * Kick things off.
     */
    init: function (layout) {
        this.reticleClass = "reticle";
        this.layout = layout;
        this.layoutOffset = {
            x: layout.container.offsetLeft,
            y: layout.container.offsetTop
        }; 
        this.events = {};
        this.dragCache = {};

        /**
         * common drag events which pertain to all drag behaviors.
         */
        this._listen("dragStart", function (evt) {
            this.dragCache.origin = [ evt.layerX, evt.layerY ];
            this.dragCache.isDragging = true;
        }, this);

        this._listen("dragEnd", function (evt) {
            this.dragCache.isDragging = false;
        }, this);

        /**
         * drag events pertaining to the reticle, which gives visual feedback
         * about the cell currently being created.
         */
        this._listen("dragStart", function (evt) {
            var reticle = document.createElement("div");
            
            reticle.classList.add(this.reticleClass);
            reticle.style.left = this.dragCache.origin[0] + "px";
            reticle.style.top = this.dragCache.origin[1] + "px";
            reticle.style.width = evt.layerX - this.dragCache.origin[0] + "px";
            reticle.style.height = evt.layerY - this.dragCache.origin[1] + "px";

            this.dragCache.reticle = reticle;
            this.layout.container.appendChild(reticle);
        }, this);

        this._listen("dragOver", function (evt) {
            var d = this.dragCache,
                layoutPositionX = evt.pageX - this.layoutOffset.x,
                layoutPositionY = evt.pageY - this.layoutOffset.y,
                xMove = layoutPositionX > d.origin[0] ? "right" : "left",
                yMove = layoutPositionY > d.origin[1] ? "down" : "up";

            if (xMove == "right") {
                d.reticle.style.width = layoutPositionX - d.origin[0] + "px";
            }

            if (xMove == "left") {
                d.reticle.style.left = layoutPositionX + "px";
                d.reticle.style.width = -(layoutPositionX - d.origin[0]) + "px";
            }

            if (yMove == "down") {
                d.reticle.style.height = layoutPositionY - d.origin[1] + "px";        
            }

            if (yMove == "up") {
                d.reticle.style.top = layoutPositionY + "px";
                d.reticle.style.height = -(layoutPositionY - d.origin[1]) + "px";
            }
        }, this);

        this._listen("dragEnd", function (evt) {
            this.layout.container.removeChild(this.dragCache.reticle);
            this.dragCache.reticle = null;
        }, this);

        /**
         * drag events which pertain to the construction of a
         * new cell. The dragStart merely stores the location of the initial
         * mousedown event. The dragEnd employs all the necessary layer methods
         * in order to calculate the properties and create the new cell.
         */
        this._listen("dragEnd", function (evt) {
            var findPlot = this.layout._findPlotByCoords.bind(this.layout),
                origin = this.dragCache.origin,
                originPlot = findPlot(origin[0], origin[1]),
                destPlot = findPlot(evt.layerX, evt.layerY),
                newCellProperties = this.layout._cellProperties(originPlot, destPlot);

            this.layout.addCell.apply(this.layout, newCellProperties);
        }, this);


        // The mouse event binding which actually ftrigger our events.
        layout.container.addEventListener("mousedown", (function (evt) {;
            this._fire("dragStart", evt);
            evt.preventDefault();
        }).bind(this), false);

        layout.container.addEventListener("mousemove", (function (evt) {
            if (this.dragCache.isDragging) {
                this._fire("dragOver", evt);                
            }   
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

        if (this.events[channel]) {
            this.events[channel].forEach(function (obj) {
                obj.fn.apply(obj.ctx, args);
            });            
        }
    }
};