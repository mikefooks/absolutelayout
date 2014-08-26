"use strict";

function Controls() {}

Controls.prototype = {
    constructor: Controls,
    /**
     * Kick things off.
     */
    init: function (layout) {
        var _this = this;
        this.selectorClass = "selector";
        this.resizerClass = "resizer";
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
        var selectStart = function (evt) {
            var coords = getLayerCoordinates.call(this, evt),
                el = document.createElement("div");

            this.selectorDrag.origin = coords;
            
            el.className = this.selectorClass;
            el.style.left = coords.x + "px";
            el.style.top = coords.y + "px";
            el.style.width = "0px";
            el.style.height = "0px";

            this.selectorDrag.isDragging = true;
            this.selectorDrag.el = el;
            this.layout.el.appendChild(el);
        };

        var selectOver = function (evt) {
            var coords = getLayerCoordinates.call(this, evt),
                d = this.selectorDrag,
                xMove = coords.x > d.origin.x ? "right" : "left",
                yMove = coords.y > d.origin.y ? "down" : "up";

            if (xMove == "right") {
                d.el.style.width = coords.x- d.origin.x + "px";
            }
            if (xMove == "left") {
                d.el.style.left = coords.x + "px";
                d.el.style.width = -(coords.x - d.origin.x) + "px";
            }
            if (yMove == "down") {
                d.el.style.height = coords.y - d.origin.y + "px";        
            }
            if (yMove == "up") {
                d.el.style.top = coords.y + "px";
                d.el.style.height = -(coords.y - d.origin.y) + "px";
            }
        };

        var selectEnd = function (evt) {
            this.layout.el.removeChild(this.selectorDrag.el);
            this.selectorDrag.isDragging = false;
            this.selectorDrag.el = null;            
        };

        /**
         * Whereas the previous three handlers merely show and mutate
         * the selection box, this function employs the necessary layout
         * methods to actually construct and append the cell.
         */    
        var createCell = function (evt) {
            var coords = getLayerCoordinates.call(this, evt),
                findPlot = this.layout._findPlotByCoords.bind(this.layout),
                origin = this.selectorDrag.origin,
                originPlot = findPlot(origin.x, origin.y),
                destPlot = findPlot(coords.x, coords.y),
                newCellProperties = this.layout._cellProperties(originPlot, destPlot),
                newCell;

            this.layout.addCell.apply(this.layout, newCellProperties);
        };

        /**
         * events which pertain to the resizing of a cell using the resizeX, 
         * resizeY and resizeXY bars on the sides of the cell.
         */
        var resizeStart = function (evt, dir) {
            var coords = getLayerCoordinates.call(this, evt),
                activeCell = this.layout.cells.filter(function (cell) {
                    return cell.el == evt.target.parentNode;
                })[0],
                el = document.createElement("div"),

                cellBottom = parseInt(activeCell.el.style.height, 10) +
                    parseInt(activeCell.el.style.top, 10) + "%",
                cellRight = parseInt(activeCell.el.style.width, 10) +
                    parseInt(activeCell.el.style.left, 10) + "%";
            
            el.className = this.resizerClass;

            if (dir == "north" || dir == "south") {
                el.style.width = activeCell.el.style.width;
                el.style.left = activeCell.el.style.left;
                
                if (dir == "south") {
                    el.style.top = cellBottom;
                }

                if (dir == "north") {
                    el.style.top = activeCell.el.style.top;
                }
            }

            if (dir == "west" || dir == "east") {
                el.style.height = activeCell.el.style.height;
                el.style.top = activeCell.el.style.top;

                if (dir == "east") {
                    el.style.left = cellRight;
                }

                if (dir == "west") {
                    el.style.left = activeCell.el.style.left;
                }
            }

            this.resizeDrag.el = el;
            this.resizeDrag.origin = coords;
            this.resizeDrag.isDragging = true;
            this.resizeDrag.dir = dir;
            this.resizeDrag.activeCell = activeCell;
            this.resizeDrag.cellOffset = getCellOffset(activeCell.el);

            this.layout.el.appendChild(el);
        };

        var resizeOver = function (evt) {
            var coords = getLayerCoordinates.call(this, evt),
                origin = this.resizeDrag.origin,
                el = this.resizeDrag.el,
                dir = this.resizeDrag.dir,
                offset = this.resizeDrag.cellOffset,
                distance = {
                    x: coords.x - origin.x,
                    y: coords.y - origin.y
                };

            if (dir == "south") {
                el.style.height = distance.y + "px";
            }

            if (dir == "east") {
                el.style.width = distance.x + "px";
            }

            if (dir == "north") {
                el.style.top = offset.y - (-distance.y) + "px";
                el.style.height = -distance.y + "px";
            }

            if (dir == "west") {
                el.style.left = offset.x - (-distance.x) + "px";
                el.style.width = -distance.x + "px";
            }
        };

        var resizeEnd = function (evt) {
            this.layout.el.removeChild(this.resizeDrag.el);
            this.resizeDrag = {};
        };

        /**
         * The mouse event bindings which actually trigger our events.
         */
        layout.el.addEventListener("mousedown", (function (evt) {
            matchTarget(/^layoutBox/, selectStart).call(this, evt);
            matchTarget(/^resize_([a-z]+)$/, resizeStart).call(this, evt);
        }).bind(this), false);

        layout.el.addEventListener("mousemove", (function (evt) {
            if (this.selectorDrag.isDragging) {
                selectOver.call(this, evt);
            }
            if (this.resizeDrag.isDragging) {
                resizeOver.call(this, evt);
            }
        }).bind(this), false);

        document.addEventListener("mouseup", (function (evt) {
            if (this.selectorDrag.isDragging) {
                selectEnd.call(this, evt);
                createCell.call(this, evt);
            }
            if (this.resizeDrag.isDragging) {
                resizeEnd.call(this, evt);
            }
        }).bind(this), false);

        /**
         * Decorates an event handler in order to filter behavior on the basis
         * of the className of the target element.
         * Takes a RegExp as its first argument and will pass any captured values
         * along to the event handler as arguments. 
         * Also does evt.preventDefault() as a little bonus.
         */
        function matchTarget(targetRe, handler) {
            return function (evt) {
                var reTest = targetRe.exec(evt.target.className),
                    args = [ evt ];

                if (reTest) {
                    args = reTest.length > 1 ? args.concat(reTest.slice(1)) : args;
                    handler.apply(this, args);
                }

                evt.preventDefault();
            };
        }

        /**
         * Just a helper function for finding a mouse event's location on the
         * main layout regardless of which specific element is actually being
         * interacted with.
         */
        function getLayerCoordinates(evt) {
            return {
                x: evt.pageX - _this.layoutOffset.x,
                y: evt.pageY - _this.layoutOffset.y
            };
        }

        function getCellOffset(el) {
            return {
                x: el.offsetLeft,
                y: el.offsetTop
            };
        }

        return this;
    }
};