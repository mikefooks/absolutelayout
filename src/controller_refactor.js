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
            x: layout.el.offsetLeft,
            y: layout.el.offsetTop
        }; 
        this.events = {};
        this.dragCache = {};
        this.inputFormShowing = false;
        this.activeCell;

        /**
         * common drag events which pertain to all drag behaviors.
         */
        this._listen("dragStart", function (evt) {
            var layoutPositionX = evt.pageX - this.layoutOffset.x,
                layoutPositionY = evt.pageY - this.layoutOffset.y;

            this.dragCache.origin = [ layoutPositionX, layoutPositionY ];
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
            var reticle = document.createElement("div"),
                layoutPositionX = evt.pageX - this.layoutOffset.x,
                layoutPositionY = evt.pageY - this.layoutOffset.y;
            
            reticle.classList.add(this.reticleClass);
            reticle.style.left = this.dragCache.origin[0] + "px";
            reticle.style.top = this.dragCache.origin[1] + "px";
            reticle.style.width = layoutPositionX - this.dragCache.origin[0] + "px";
            reticle.style.height = layoutPositionY - this.dragCache.origin[1] + "px";

            this.dragCache.reticle = reticle;
            this.layout.el.appendChild(reticle);
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
            if (this.dragCache.reticle) {
                this.layout.el.removeChild(this.dragCache.reticle);
            }
            this.dragCache.reticle = null;
        }, this);

        /**
         * events which shows a cell's input elements, which can be
         * used to update the id and other properties.
         */
        this._listen("revealCellForm", function (evt) {
            var targetCell = this.activeCell = evt.target,
                input = targetCell.querySelector("input[type='text']");

            this.inputFormShowing = true;

            input.style.visibility = "visible";
            input.focus();
        }, this);

        this._listen("hideCellForm", function (evt) {
            var input = this.activeCell.querySelector("input[type='text']");

            this.inputFormShowing = false;
            input.style.visibility = "hidden";
        });

        /**
         * drag events which pertain to the construction of a
         * new cell. The dragStart merely stores the location of the initial
         * mousedown event. The dragEnd employs all the necessary layer methods
         * in order to calculate the properties and create the new cell.
         */
        this._listen("dragEnd", function (evt) {
            var findPlot = this.layout._findPlotByCoords.bind(this.layout),
                origin = this.dragCache.origin,
                layoutPositionX = evt.pageX - this.layoutOffset.x,
                layoutPositionY = evt.pageY - this.layoutOffset.y,
                originPlot = findPlot(origin[0], origin[1]),
                destPlot = findPlot(layoutPositionX, layoutPositionY),
                newCellProperties = this.layout._cellProperties(originPlot, destPlot),
                newCell;

            this.layout.addCell.apply(this.layout, newCellProperties);
        }, this);


        // The mouse event binding which actually ftrigger our events.
        layout.el.addEventListener("mousedown", (function (evt) {
            var target = evt.target.className,
                cell = this.layout.cellClass,
                layout = this.layout.el.className;

            if (target == layout) {
                if (this.inputFormShowing) {
                    this._fire("hideCellForm", evt);
                }
                this._fire("dragStart", evt);
            } 
            if (target == cell) {
                if (this.inputFormShowing) {
                    this._fire("hideCellForm", evt);
                } else {
                    this._fire("revealCellForm", evt);
                }
            }
            evt.preventDefault();
        }).bind(this), false);

        layout.el.addEventListener("mousemove", (function (evt) {
            if (this.dragCache.isDragging) {
                this._fire("dragOver", evt);
            }  
        }).bind(this), false);

        layout.el.addEventListener("mouseup", (function (evt) {
            if (this.dragCache.isDragging) {
                this._fire("dragEnd", evt);
            }              
        }).bind(this), false);
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