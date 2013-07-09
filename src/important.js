define('important', ['jquery', 'lodash'], function($, _) {

    var Module = {
        init: function() {
            console.log($);
            console.log(_);
        },
        getOdds: function(list) {
            var odds = _.filter(list, function(num) {
                return num % 2 !== 0;
            });

            return odds;
        }
    };

    return Module;

});