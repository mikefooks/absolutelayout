"use strict";

function Controls() {}

Controls.prototype = {
    constructor: Controls,
    init: function (layout) {
        var _this = this;
        this.selectorClass = "selector";
        this.resizerClass = "resizer";
        this.layout = layout;
        this.layoutOffset = {
            x: layout.el.offsetLeft,
            y: layout.el.offsetTop
        };
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
        var createCell = function (bbox) {
            var newCell = this.layout.addCell(bbox),
                attrKeys, styleKeys, innerElClasses, el;

            if (newCell) {
                attrKeys = Object.keys(newCell.attrs);
                styleKeys = Object.keys(newCell.style);
                innerElClasses = [
                    "resize_east",
                    "resize_south",
                    "resize_west",
                    "resize_north",
                    "move"
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
        };

        /**
         * resizeStart, resizeOver and resizeEnd handlers create and mutate the
         * resize selection element which provides visual feedback when
         * resizing a cell and, ultimately, provides the layout object the
         * position and dimension information it needs to modify the cell.
         */
        var resizeStart = function (evt, side) {
            var coords = getLayerCoordinates.call(this, evt),
                cellEl = evt.target.parentNode,
                el = cellEl.cloneNode(true),
                id = cellEl.dataset.id,
                cellBBox = getCellBoundingBox(cellEl),
                elBBox;

            while (el.firstChild) {
                el.removeChild(el.firstChild);
            }

            el.className = "resizer";
            el.style.left = cellBBox.left + 5 + "px";
            el.style.top = cellBBox.top + 5 + "px";
            el.style.width = cellBBox.width - 10 + "px";
            el.style.height = cellBBox.height - 10 + "px";

            this.resizeDrag.origin = coords;
            this.resizeDrag.isDragging = true;
            this.resizeDrag.side = side;
            this.resizeDrag.el = el;
            this.resizeDrag.id = id;
            this.resizeDrag.cellEl = cellEl;

            this.layout.el.appendChild(el);
            this.resizeDrag.elBBox = getCellBoundingBox(el);
        };

        var resizeOver = function (evt) {
            var coords = getLayerCoordinates.call(this, evt),
                origin = this.resizeDrag.origin,
                side = this.resizeDrag.side,
                elBBox = this.resizeDrag.elBBox,
                el = this.resizeDrag.el,
                distance = {
                    x: coords.x - origin.x,
                    y: coords.y - origin.y
                };

            this.resizeDrag.distance = distance;

            switch (side) {
                case "north":
                    el.style.top = elBBox.top + distance.y + "px";
                    el.style.height = elBBox.height - distance.y + "px";
                    break;
                case "south":
                    el.style.height = elBBox.height + distance.y + "px";
                    break;
                case "west":
                    el.style.left = elBBox.left + distance.x + "px";
                    el.style.width = elBBox.width - distance.x + "px";
                    break;
                case "east":
                    el.style.width = elBBox.width + distance.x + "px";
                    break;
            }
        };

        var resizeEnd = function (evt) {
            this.layout.el.removeChild(this.resizeDrag.el);
            this.resizeDrag = {};
        };

        /**
         * Actually modifies the cell based on the feedback gained from either
         * resize or move actions.
         */
        var resizeCell = function (id, bbox, cellEl) {
            var modifiedCell = this.layout.resizeCell(id, bbox),
                styleKeys;

            if (modifiedCell) {
                styleKeys = Object.keys(modifiedCell.style);

                styleKeys.forEach(function (key) {
                    cellEl.style[key] = modifiedCell.style[key];
                });
            }
        };

        /**
         * moveStart, moveOver and moveEnd functions move the move selector
         * over the layout, providing visual feedback as to the progress of
         * a move operation and ultimately providing the positional and
         * dimensional information necessary to modify the cell being moved.
         */
        var moveStart = function (evt) {
            var coords = getLayerCoordinates.call(this, evt),
                cellEl = evt.target.parentNode,
                el = cellEl.cloneNode(true),
                id = cellEl.dataset.id,
                cellBBox = getCellBoundingBox(cellEl),
                elBBox;

            while (el.firstChild) {
                el.removeChild(el.firstChild);
            }

            el.className = "mover";
            el.style.left = cellBBox.left + 5 + "px";
            el.style.top = cellBBox.top + 5 + "px";
            el.style.width = cellBBox.width - 10 + "px";
            el.style.height = cellBBox.height - 10 + "px";

            this.moveDrag.origin = coords;
            this.moveDrag.isDragging = true;
            this.moveDrag.el = el;
            this.moveDrag.id = id;
            this.moveDrag.cellEl = cellEl;

            this.layout.el.appendChild(el);
            this.moveDrag.elBBox = getCellBoundingBox(el);
        };

        var moveOver = function (evt) {
            var coords = getLayerCoordinates.call(this, evt),
                origin = this.moveDrag.origin,
                elBBox = this.moveDrag.elBBox,
                el = this.moveDrag.el,
                distance = {
                    x: coords.x - origin.x,
                    y: coords.y - origin.y
                };

            this.moveDrag.distance = distance;

            el.style.top = elBBox.top + distance.y + "px";
            el.style.left = elBBox.left + distance.x + "px";
        };

        var moveEnd = function (evt) {
            this.layout.el.removeChild(this.moveDrag.el);
            this.moveDrag = {};
        }

        /**
         * Takes the information acquired from the cell move mouse
         * operations and undertakes to actually modify the cell to its
         * new position.
         */
        
        var moveCell = function (id, bbox, cellEl) {
            var modifiedCell = this.layout.moveCell(id, bbox),
                styleKeys;

            if (modifiedCell) {
                styleKeys = Object.keys(modifiedCell.style);

                styleKeys.forEach(function (key) {
                    cellEl.style[key] = modifiedCell.style[key];
                });
            }
        };

        /**
         * The mouse event handlers, which actually tie our functionality
         * to triggered mouse event.
         */
        var mouseDownHandler = function (evt) {
            matchTarget(/^layoutBox/, selectStart).call(this, evt);
            matchTarget(/^resize_([a-z]+)$/, resizeStart).call(this, evt);
            matchTarget(/^move$/, moveStart).call(this, evt);
        };

        var mouseMoveHandler = function (evt) {
            if (this.selectorDrag.isDragging) {
                selectOver.call(this, evt);
            }
            if (this.resizeDrag.isDragging) {
                resizeOver.call(this, evt);
            }
            if (this.moveDrag.isDragging) {
                moveOver.call(this, evt);
            }
        };

        var mouseUpHandler = function (evt) {
            var selectorBBox,
                resizeId, resizeBBox,
                moveId, moveBBox,
                cellEl;

            if (this.selectorDrag.isDragging) {
                selectorBBox = getCellBoundingBox(this.selectorDrag.el);

                createCell.call(this, selectorBBox);
                selectEnd.call(this, evt);
            }
            if (this.resizeDrag.isDragging) {
                resizeId = this.resizeDrag.id;
                resizeBBox = getCellBoundingBox(this.resizeDrag.el);
                cellEl = this.resizeDrag.cellEl;

                resizeCell.call(this, resizeId, resizeBBox, cellEl);
                resizeEnd.call(this, evt);
            }
            if (this.moveDrag.isDragging) {
                moveId = this.moveDrag.id;
                moveBBox = getCellBoundingBox(this.moveDrag.el),
                cellEl = this.moveDrag.cellEl;

                moveCell.call(this, moveId, moveBBox, cellEl);
                moveEnd.call(this, evt);
            }
        };

        layout.el.addEventListener("mousedown", mouseDownHandler.bind(this), false);
        layout.el.addEventListener("mousemove", mouseMoveHandler.bind(this), false);
        document.body.addEventListener("mouseup", mouseUpHandler.bind(this), false);

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
                cellBBox = {
                    height: bbox.height,
                    width: bbox.width,
                    top: bbox.top + window.scrollY - _this.layoutOffset.y,
                    left: bbox.left + window.scrollX - _this.layoutOffset.x,
                    bottom: bbox.bottom + window.scrollY - _this.layoutOffset.y,
                    right: bbox.right + window.scrollX - _this.layoutOffset.x
                };

            return cellBBox;
        }

        return this;
    }
};