module.exports = function (grunt) {

    grunt.initConfig({
        jasmine: {
            src: "src/refactor.js",
            options: {
                specs: "spec/*_spec.js",
                helpers: "spec/helpers/*.js"
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-jasmine");

    grunt.registerTask("test", ["jasmine"]);

};