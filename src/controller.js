define('controller', ['jquery'], function($) {

    var Controller = function() {
        this.layout = {};
        this.events = {};
        this.activeCell = '';
    };

    Controller.prototype = {

        /**
        * initialize controller, bind keyboard events
        */

        init: function(layout) {
            var cellKeys = Object.keys(layout.Cells),
                that = this;

            this.layout = layout;

            if (cellKeys.length > 0) {
                this.activeCell = cellKeys[0];
            }

            this.layout.config.container.on('keyup', function(evt) {
                switch (evt.which) {
                    case 37:
                        (evt.ctrlKey) ? that.contractHoriz() : that.nudge('left');
                        break;
                    case 38:
                        (evt.ctrlKey) ? that.contractVert() : that.nudge('up');
                        break;
                    case 39:
                        (evt.ctrlKey) ? that.expandHoriz() : that.nudge('right');
                        break;
                    case 40:
                        (evt.ctrlKey) ? that.expandVert() : that.nudge('down');
                        break;
                    default:
                        console.log('command not recognized.');
                        break;
                }
            });
        },

        /**
        * Nudge the activeCell one row or column in a given direction.
        */
        nudge: function(dir) {
            var targetCell = this.layout.Cells[this.activeCell],
                location = targetCell.occupiedPlots[0].split('-'),
                newTop,
                newLeft;

            switch (dir) {
                case 'left':
                    newTop = parseInt(location[0], 10);
                    newLeft = parseInt(location[1], 10) - 1;
                    targetCell.reposition(newTop, newLeft);
                    break;
                case 'right':
                    newTop = parseInt(location[0], 10);
                    newLeft = parseInt(location[1], 10) + 1;
                    targetCell.reposition(newTop, newLeft);
                    break;
                case 'up':
                    newTop = parseInt(location[0], 10) - 1;
                    newLeft = parseInt(location[1], 10);
                    targetCell.reposition(newTop, newLeft);
                    break;
                case 'down':
                    newTop = parseInt(location[0], 10) + 1;
                    newLeft = parseInt(location[1], 10);
                    targetCell.reposition(newTop, newLeft);
                    break;
                default:
                    console.log('did not recognize direction argument.');
                    break;
            }
        },

        /* 
        * Expand or contract the activeCell by one row or column.
        */
        expandHoriz: function() {
            var targetCell = this.layout.Cells[this.activeCell],
                newWidth = targetCell.cellInfo.width + 1,
                height = targetCell.cellInfo.height;

            targetCell.resize(height, newWidth);
        },

        contractHoriz: function() {
            var targetCell = this.layout.Cells[this.activeCell],
                newWidth = targetCell.cellInfo.width - 1,
                height = targetCell.cellInfo.height;

            targetCell.resize(height, newWidth);
        },

        expandVert: function() {
            var targetCell = this.layout.Cells[this.activeCell],
                newHeight = targetCell.cellInfo.height + 1,
                width = targetCell.cellInfo.width;

            targetCell.resize(newHeight, width);
        },

        contractVert: function() {
            var targetCell = this.layout.Cells[this.activeCell],
                newHeight = targetCell.cellInfo.height - 1,
                width = targetCell.cellInfo.width;

            targetCell.resize(newHeight, width);
        }

    };

    return Controller;

});