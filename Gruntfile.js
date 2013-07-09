module.exports = function(grunt) {

    grunt.initConfig({
        jasmine: {
            layout : {
                src: 'src/*.js',
                options: {
                    specs: 'spec/*_spec.js',
                    helpers: 'spec/helpers/*.js',
                    template: require('grunt-template-jasmine-requirejs'),
                    templateOptions: {
                        requireConfig: {
                            packages: [
                                {
                                    "name": "jquery",
                                    "location": "src/vendor/jquery",
                                    "main": "dist/jquery.js"
                                },
                                {
                                    "name": "lodash",
                                    "location": "src/vendor/lodash",
                                    "main": "./dist/lodash.compat.js"
                                }
                            ]
                        }
                    }
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jasmine');

    grunt.registerTask('test', ['jasmine:layout']);
};