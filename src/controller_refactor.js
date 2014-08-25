"use strict";

function Controls() {}

Controls.prototype = {
    constructor: Controls,
    /**
     * Kick things off.
     */
    init: function (layout) {
        var _this = this;
        this.selectorClass = "reticle";
        this.layout = layout;
        this.layoutOffset = {
            x: layout.el.offsetLeft,
            y: layout.el.offsetTop
        }; 
        this.events = {};
        this.selectorDrag = {};
        this.resizeDrag = {};
        this.moveDrag = {};

        /**
         * drag events pertaining to the new cell selection box, which gives visual
         * feedback about the cell currently being created.
         */
        this._listen("selectStart", function (evt) {
            var coords = getLayerCoordinates.call(this, evt),
                el = document.createElement("div");

            this.selectorDrag.origin = [ coords.x, coords.y ];
            
            el.classList.add(this.selectorClass);
            el.style.left = this.selectorDrag.origin[0] + "px";
            el.style.top = this.selectorDrag.origin[1] + "px";
            el.style.width = coords.x - this.selectorDrag.origin[0] + "px";
            el.style.height = coords.y - this.selectorDrag.origin[1] + "px";

            this.selectorDrag.isDragging = true;
            this.selectorDrag.el = el;
            this.layout.el.appendChild(el);
        });

        this._listen("selectOver", function (evt) {
            var coords = getLayerCoordinates.call(this, evt),
                d = this.selectorDrag,
                xMove = coords.x > d.origin[0] ? "right" : "left",
                yMove = coords.y > d.origin[1] ? "down" : "up";

            console.log(coords);

            if (xMove == "right") {
                d.el.style.width = coords.x- d.origin[0] + "px";
            }
            if (xMove == "left") {
                d.el.style.left = coords.x + "px";
                d.el.style.width = -(coords.x - d.origin[0]) + "px";
            }
            if (yMove == "down") {
                d.el.style.height = coords.y - d.origin[1] + "px";        
            }
            if (yMove == "up") {
                d.el.style.top = coords.y + "px";
                d.el.style.height = -(coords.y - d.origin[1]) + "px";
            }
        });

        this._listen("selectEnd", function (evt) {
            this.layout.el.removeChild(this.selectorDrag.el);
            this.selectorDrag.isDragging = false;
            this.selectorDrag.el = null;
        }, this);

        /**
         * drag event which pertain to the construction of a
         * new cell. Whereas the previous three handlers merely show and mutate
         * the selection box, this function employs the necessary layout
         * methods to actually construct and append the cell.
         */
        this._listen("selectEnd", function (evt) {
            var coords = getLayerCoordinates.call(this, evt),
                findPlot = this.layout._findPlotByCoords.bind(this.layout),
                origin = this.selectorDrag.origin,
                originPlot = findPlot(origin[0], origin[1]),
                destPlot = findPlot(coords.x, coords.y),
                newCellProperties = this.layout._cellProperties(originPlot, destPlot),
                newCell;

            this.layout.addCell.apply(this.layout, newCellProperties);
        });

        /**
         * events which pertain to the resizing of a cell using the resizeX, 
         * resizeY and resizeXY bars on the sides of the cell.
         */
        this._listen("resizeStart", function (evt, dir) {
            console.log(dir);
        });

        /**
         * The mouse event bindings which actually trigger our events.
         */
        layout.el.addEventListener("mousedown", matchTarget(/layoutBox/,
            function (evt) {
                this._fire("selectStart", evt);
            }, this), false);

        layout.el.addEventListener("mousedown", matchTarget(/^resize_([a-z]+)$/,
            function (evt, dir) {
                this._fire("resizeStart", evt, dir);
            }, this), false);

        layout.el.addEventListener("mousemove", (function (evt) {
            if (this.selectorDrag.isDragging) {
                this._fire("selectOver", evt);
            }  
        }).bind(this), false);

        document.addEventListener("mouseup", (function (evt) {
            if (this.selectorDrag.isDragging) {
                this._fire("selectEnd", evt);
            }              
        }).bind(this), false);

        /**
         * Decorates an event handler in order to discriminate whether the 
         * handler should fire based on the className of the target element.
         * Takes a RegExp as its first argument and will pass any captured values
         * along to the event handler as arguments. 
         * Also does evt.preventDefault() as a little bonus.
         */
        function matchTarget(targetRe, handler, ctx) {
            return (function (evt) {
                var reTest = targetRe.exec(evt.target.className),
                    args = [ evt ];

                if (reTest) {
                    args = reTest.length > 1 ? args.concat(reTest.slice(1)) : args;
                    handler.apply(this, args);
                }

                evt.preventDefault();
            }).bind(ctx);
        }

        /**
         * Just a helper function for finding a mouse event's location on the
         * main layout regardless of which specific element is actually being
         * interacted with.
         */
        function getLayerCoordinates(evt) {
            return {
                x: evt.pageX - this.layoutOffset.x,
                y: evt.pageY - this.layoutOffset.y
            };
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