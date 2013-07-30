define('controller', [], function() {

    var Controller = function() {
        this.layout = {};
    };

    Controller.prototype = {

        init: function(layout) {
            this.layout = layout;
        }

    }

    return Controller;

});