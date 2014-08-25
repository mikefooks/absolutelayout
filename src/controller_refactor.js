"use strict";

function Controls() {}

Controls.prototype = {
    constructor: Controls,
    /**
     * Kick things off.
     */
    init: function (layout) {
        var _this = this;
        this.reticleClass = "reticle";
        this.layout = layout;
        this.layoutOffset = {
            x: layout.el.offsetLeft,
            y: layout.el.offsetTop
        }; 
        this.events = {};
        this.newCellDrag = {};
        this.resizeDrag = {};

        /**
         * common drag events which pertain to all drag behaviors.
         */
        this._listen("selectDragStart", function (evt) {
            var layoutPositionX = evt.pageX - this.layoutOffset.x,
                layoutPositionY = evt.pageY - this.layoutOffset.y;

            this.newCellDrag.origin = [ layoutPositionX, layoutPositionY ];
            this.newCellDrag.isDragging = true;
        }, this);

        this._listen("selectDragEnd", function (evt) {
            this.newCellDrag.isDragging = false;
        }, this);

        /**
         * drag events pertaining to the new cell selection box, which gives visual
         * feedback about the cell currently being created.
         */
        this._listen("selectDragStart", function (evt) {
            var reticle = document.createElement("div"),
                layoutPositionX = evt.pageX - this.layoutOffset.x,
                layoutPositionY = evt.pageY - this.layoutOffset.y;
            
            reticle.classList.add(this.reticleClass);
            reticle.style.left = this.newCellDrag.origin[0] + "px";
            reticle.style.top = this.newCellDrag.origin[1] + "px";
            reticle.style.width = layoutPositionX - this.newCellDrag.origin[0] + "px";
            reticle.style.height = layoutPositionY - this.newCellDrag.origin[1] + "px";

            this.newCellDrag.reticle = reticle;
            this.layout.el.appendChild(reticle);
        }, this);

        this._listen("selectDragOver", function (evt) {
            var d = this.newCellDrag,
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

        this._listen("selectDragEnd", function (evt) {
            if (this.newCellDrag.reticle) {
                this.layout.el.removeChild(this.newCellDrag.reticle);
            }
            this.newCellDrag.reticle = null;
        }, this);

        /**
         * events which pertain to the resizing of a cell using the resizeX, 
         * resizeY and resizeXY bars on the sides of the cell.
         */
        
        this._listen("resizeX", injectLayerCoordinates(function (evt, coords) {
            console.log(coords.x, coords.y);
        }));

        this._listen("resizeY", function (evt) {
            console.log("resizing Y");
        }, this);


        /**
         * drag events which pertain to the construction of a
         * new cell. The selectDragStart merely stores the location of the initial
         * mousedown event. The selectDragEnd employs all the necessary layer methods
         * in order to calculate the properties and create the new cell.
         */
        this._listen("selectDragEnd", function (evt) {
            var findPlot = this.layout._findPlotByCoords.bind(this.layout),
                origin = this.newCellDrag.origin,
                layoutPositionX = evt.pageX - this.layoutOffset.x,
                layoutPositionY = evt.pageY - this.layoutOffset.y,
                originPlot = findPlot(origin[0], origin[1]),
                destPlot = findPlot(layoutPositionX, layoutPositionY),
                newCellProperties = this.layout._cellProperties(originPlot, destPlot),
                newCell;

            this.layout.addCell.apply(this.layout, newCellProperties);
        }, this);


        // The mouse event binding which actually ftrigger our events.
        layout.el.addEventListener("mousedown", matchTarget("layoutBox", function (evt) {
            this._fire("selectDragStart", evt);
        }, this), false);

        layout.el.addEventListener("mousedown", matchTarget("resizeY", function (evt) {
            this._fire("resizeY", evt);
        }, this), false);

        layout.el.addEventListener("mousedown", matchTarget("resizeX", function (evt) {
            this._fire("resizeX", evt);
        }, this), false); 

        layout.el.addEventListener("mousemove", (function (evt) {
            if (this.newCellDrag.isDragging) {
                this._fire("selectDragOver", evt);
            }  
        }).bind(this), false);

        layout.el.addEventListener("mouseup", (function (evt) {
            if (this.newCellDrag.isDragging) {
                this._fire("selectDragEnd", evt);
            }              
        }).bind(this), false);

        // Decorates an event handler in order to discriminate which elements
        // fire and are effected by which handlers. Also does evt.preventDefault()
        // as a little bonus.
        function matchTarget(targetName, handler, ctx) {
            return (function (evt) {
                if (evt.target.className == targetName) {
                    handler.call(this, evt);
                }
                evt.preventDefault();
            }).bind(ctx);
        }

        function injectLayerCoordinates(fn) {
            return (function (evt) {
                var coordinates = {
                    x: evt.pageX - this.layoutOffset.x,
                    y: evt.pageY - this.layoutOffset.y
                };

                fn.call(this, evt, coordinates);
            }).bind(_this);
        }
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