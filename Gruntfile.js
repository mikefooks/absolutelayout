module.exports = function(grunt) {

    grunt.initConfig({
        jasmine: {
            layout : {
                src: 'src/*.js',
                options: {
                    specs: 'spec/*_spec.js',
                    helpers: 'spec/helpers/*.js',
                    keepRunner: false,
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
                                },
                                {
                                    "name": "text",
                                    "location": "src/vendor/text",
                                    "main": "text.js"
                                }
                            ]
                        }
                    }
                }
            }
        },
        watch: {
            unit_tests: {
                files: ['src/*.js', 'src/**/*.js', 'spec/*_spec.js'],
                tasks: ['test']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('test', ['jasmine:layout']);
};