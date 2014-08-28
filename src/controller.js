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
                d.el.style.width = coords.x - d.origin.x + "px";
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
            this.selectorDrag = {};           
        };

        /**
         * Whereas the previous three handlers merely show and mutate
         * the selection box, this function retrieves the necessary checks
         * and properties with the layout object to actually construct and 
         * append the new cell.
         */    
        var createCell = function (evt, bbox) {
            var newCell = this.layout.addCell(bbox),
                attrKeys, styleKeys, innerElClasses, el;

            if (newCell) {
                attrKeys = Object.keys(newCell.attrs);
                styleKeys = Object.keys(newCell.style);
                innerElClasses = [
                    "resize_east",
                    "resize_south",
                    "resize_west",
                    "resize_north"
                ];
                el = document.createElement("div");

                el.dataset.id = newCell.id;

                attrKeys.forEach(function (key) {
                    el.setAttribute(key, newCell.attrs[key]);
                });

                styleKeys.forEach(function (key) {
                    el.style[key] = newCell.style[key];
                });

                innerElClasses.forEach(function (name) {
                    var controlEl = document.createElement("div");
                    controlEl.className = name;
                    el.appendChild(controlEl);
                });

                this.layout.el.appendChild(el);
            }
        }

        /**
         * resizeStart, resizeOver and resizeEnd handlers create and mutate the
         * resize selection element which provides visual feedback on a 
         * resizing operation.
         */
        var resizeStart = function (evt, side) {
            var coords = getLayerCoordinates.call(this, evt),
                cellEl = evt.target.parentNode,
                id = evt.target.parentNode.dataset.id,
                activeCell = this.layout.cells.filter(function (cell) {
                    return cell.id == id;
                })[0],
                cellBBox = getCellBoundingBox(cellEl);

            this.resizeDrag.origin = coords;
            this.resizeDrag.isDragging = true;
            this.resizeDrag.side = side;
            this.resizeDrag.activeCell = activeCell;
            this.resizeDrag.cellEl = cellEl;
            this.resizeDrag.cellBBox = cellBBox;
            this.resizeDrag.id = id;
        };

        var resizeOver = function (evt) {
            var coords = getLayerCoordinates.call(this, evt),
                origin = this.resizeDrag.origin,
                side = this.resizeDrag.side,
                cellBBox = this.resizeDrag.cellBBox,
                cellEl = this.resizeDrag.cellEl,
                distance = {
                    x: coords.x - origin.x,
                    y: coords.y - origin.y
                };

            this.resizeDrag.distance = distance;

            switch (side) {
                case "north":
                    cellEl.style.top = cellBBox.top + distance.y + "px";
                    cellEl.style.height = cellBBox.height - distance.y + "px";
                    break;
                case "south":
                    cellEl.style.height = cellBBox.height + distance.y + "px";
                    break;
                case "west":
                    cellEl.style.left = cellBBox.left + distance.x + "px";
                    cellEl.style.width = cellBBox.width - distance.x + "px";
                    break;
                case "east":
                    cellEl.style.width = cellBBox.width + distance.x + "px";
                    break;
            }
        };

        var resizeEnd = function (evt) {
            var cellEl = this.resizeDrag.cellEl,
                cellBBox = this.resizeDrag.cellBBox;

            cellEl.style.top = cellBBox.top + "px";
            cellEl.style.left = cellBBox.left + "px";
            cellEl.style.height = cellBBox.height + "px";
            cellEl.style.width = cellBBox.width + "px";

            this.resizeDrag = {};
        };

        /**
         * Actually modifies the cell based on the feedback gained from the
         * resize interaction.
         */
        var modifyCell = function (evt, id, distance, side) {
            this.layout.resizeCell(id, distance, side);
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

        document.body.addEventListener("mouseup", (function (evt) {
            var selectorBBox, resizeDistance, resizeSide, resizeId;

            if (this.selectorDrag.isDragging) {
                selectorBBox = getCellBoundingBox(this.selectorDrag.el);

                selectEnd.call(this, evt);
                createCell.call(this, evt, selectorBBox);
            }
            if (this.resizeDrag.isDragging) {
                resizeDistance = this.resizeDrag.distance;
                resizeSide = this.resizeDrag.side;
                resizeId = this.resizeDrag.id;

                resizeEnd.call(this, evt);
                modifyCell.call(this, evt, resizeId, resizeDistance, resizeSide);
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


        /**
         * Gets the cell's bounding box, corrected to its location relative to
         * its parent element.
         */
        function getCellBoundingBox(el) {
            var bbox = el.getBoundingClientRect(),
                offsetLeft = el.offsetLeft,
                offsetTop = el.offsetTop;

            return {
                height: bbox.height,
                width: bbox.width,
                top: bbox.top + window.scrollY - _this.layoutOffset.y,
                left: bbox.left + window.scrollX - _this.layoutOffset.x,
                bottom: bbox.bottom + window.scrollY - _this.layoutOffset.y,
                right: bbox.right + window.scrollX - _this.layoutOffset.x
            };
        }

        return this;
    }
};