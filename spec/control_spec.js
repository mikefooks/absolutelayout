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
            expect(Object.keys(testController).length).toBe(2);
            expect(Object.keys(testController.layout).length).toBe(4);
        });

    });

    describe('Controller nudge (reposition) commands', function() {
        var testController, testLayout;

        beforeEach(function() {
            testLayout = getTestLayout(true, 'div.layout', 10, 10);
            testLayout.addCell(5, 5, 1, 1, 'testCell', 'className');
            testController = new Controller();

            testController.init(testLayout);
        });

        afterEach(function() {
            testLayout = testController = null;
        });

        it('should have initialized properly', function() {
            expect(testController.activeCell).toBe('testCell');
        });

        it('cell.reposition should be called', function() {
            spyOn(testLayout.Cells.testCell, 'reposition').andCallThrough();
            testController.nudgeRight();
            expect(testLayout.Cells.testCell.reposition).toHaveBeenCalled();
        });

        it('should nudge things in the appropriate directions', function() {
            testController.nudgeRight();
            expect(testLayout.Cells.testCell.occupiedPlots[0]).toBe('5-6');
            testController.nudgeDown();
            expect(testLayout.Cells.testCell.occupiedPlots[0]).toBe('6-6');
            testController.nudgeLeft();
            expect(testLayout.Cells.testCell.occupiedPlots[0]).toBe('6-5');
            testController.nudgeUp();
            expect(testLayout.Cells.testCell.occupiedPlots[0]).toBe('5-5');
        });

    });

});