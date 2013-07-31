define('controller', ['jquery'], function($) {

    var Controller = function() {
        this.layout = {};
        this.events = {};
    };

    Controller.prototype = {

        init: function(layout) {
            this.layout = layout;
        }

    }

    return Controller;

});