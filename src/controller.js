define('controller', ['jquery'], function($) {

    var Controller = function() {
        this.layout = {};
        this.activeCell = ''
    };

    Controller.prototype = {

        init: function(layout) {
            var cellKeys = Object.keys(layout.Cells);

            this.layout = layout;

            if (cellKeys.length > 0) {
                this.activeCell = cellKeys[0];
            }
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
        }

    };

    return Controller;

});