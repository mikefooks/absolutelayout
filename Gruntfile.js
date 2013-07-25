module.exports = function(grunt) {

    grunt.initConfig({
        requirejs: {
            compile: {
                options: {
                    mainConfigFile: 'src/vendor/require.config.js',
                    baseUrl: 'src/',
                    name: 'layout',
                    out: 'dist/layout.min.js',
                    paths: {
                        'jquery': 'empty:http://code.jquery.com/jquery-1.9.1.min.js'
                    }
                }
            }
        },
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
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    grunt.registerTask('test', ['jasmine:layout']);
    grunt.registerTask('compile', ['requirejs:compile']);
};