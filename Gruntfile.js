module.exports = function (grunt) {

    grunt.initConfig({
        jasmine: {
            src: "src/refactor.js",
            options: {
                specs: "spec/refactor_spec.js",
                helpers: "spec/helpers/*.js"
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-jasmine");

    grunt.registerTask("test", ["jasmine"]);

};