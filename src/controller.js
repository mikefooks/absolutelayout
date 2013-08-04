define('controller', ['jquery'], function($) {

    var Controller = function() {
        this.layout = {};
        this.events = {};
        this.activeCell = '';
    };

    Controller.prototype = {

        init: function(layout) {
            var cellKeys = Object.keys(layout.Cells),
                that = this;

            this.layout = layout;

            if (cellKeys.length > 0) {
                this.activeCell = cellKeys[0];
            }

            $(document).on('keyup', function(evt) {
                switch (evt.which) {
                    case 37:
                        (evt.ctrlKey) ? that.contractHoriz() : that.nudgeLeft();
                        break;
                    case 38:
                        (evt.ctrlKey) ? that.contractVert() : that.nudgeUp();
                        break;
                    case 39:
                        (evt.ctrlKey) ? that.expandHoriz() : that.nudgeRight();
                        break;
                    case 40:
                        (evt.ctrlKey) ? that.expandVert() : that.nudgeDown();
                        break;
                    default:
                        console.log('command not recognized.');
                        break;
                }
            });
        },

        nudgeLeft: function() {
            var targetCell = this.layout.Cells[this.activeCell],
                location = targetCell.occupiedPlots[0].split('-'),
                newTop = parseInt(location[0], 10),
                newLeft = parseInt(location[1], 10) - 1;

            targetCell.reposition(newTop, newLeft);
        },

        nudgeRight: function() {
            var targetCell = this.layout.Cells[this.activeCell],
                location = targetCell.occupiedPlots[0].split('-'),
                newTop = parseInt(location[0], 10),
                newLeft = parseInt(location[1], 10) + 1;

            targetCell.reposition(newTop, newLeft);
        },

        nudgeUp: function() {
            var targetCell = this.layout.Cells[this.activeCell],
                location = targetCell.occupiedPlots[0].split('-'),
                newTop = parseInt(location[0], 10) - 1,
                newLeft = parseInt(location[1], 10);

            targetCell.reposition(newTop, newLeft);
        },

        nudgeDown: function() {
            var targetCell = this.layout.Cells[this.activeCell],
                location = targetCell.occupiedPlots[0].split('-'),
                newTop = parseInt(location[0], 10) + 1,
                newLeft = parseInt(location[1], 10);

            targetCell.reposition(newTop, newLeft);
        },

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