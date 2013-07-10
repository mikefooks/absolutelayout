define('layout', ['jquery', 'lodash'], function($, _) {

    var Layout = function() {
        this.config = {};
        this.Plots = {};
        this.Cells = {};
    };

    Layout.prototype = {
        initConfig: function(configObj) {
            this.config = {
                fluid: configObj.fluid,
                container: configObj.container,
                columns: configObj.columns,
                rows: configObj.rows
            };
        }
    };

    return {
        Layout: Layout
    };

});