define(['controller', 'layout'], function(Controller, Layout) {

    "use strict";

    function getTestLayout(fluid, container, rows, columns) {
        var testLayout = new Layout();

        testLayout.initConfig({
            fluid: fluid,
            container: container,
            rows: rows,
            columns: columns
        }).refresh();

        return testLayout;
    };

    describe('controls instantiation', function() {
        var testController, testLayout;

        beforeEach(function() {
            testLayout = getTestLayout(true, 'div.layout', 10, 10);
            testController = new Controller();

            testController.init(testLayout);
        });

        afterEach(function() {
            testLayout = testController = null;
        });

        it('should instantiate properly and have the correct attributes', function() {
            expect(typeof testController).toBe('object')
            expect(Object.keys(testController.layout.config).length).toBe(4);
            expect(Object.keys(testController.layout.config)[0]).toBe('fluid');
            expect(Object.keys(testController.layout.config)[2]).toBe('columns');
        });

    });

});