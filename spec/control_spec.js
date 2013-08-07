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
    }

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
            expect(typeof testController).toBe('object');
            expect(Object.keys(testController).length).toBe(3);
            expect(Object.keys(testController.layout).length).toBe(4);
        });

    });

    /**
    * Need some helpers for testing event binding and triggering.
    */

    describe('controller event binding', function() {
        var testLayout, testController, spyKeyboard;

        beforeEach(function() {
            testLayout = getTestLayout(true, 'div.layout', 10, 10);
            testController = new Controller();

            testController.init(testLayout);
        });

        afterEach(function() {
            testLayout = testController = null;
        });

    });

    describe('Controller nudge (reposition) commands', function() {
        var testController, testLayout, testCell;

        beforeEach(function() {
            testLayout = getTestLayout(true, 'div.layout', 10, 10);
            testLayout.addCell(5, 5, 1, 1, 'testCell', 'className');
            testController = new Controller();
            testController.init(testLayout);

            testCell = testLayout.Cells.testCell;
        });

        afterEach(function() {
            testLayout = testController = testCell = null;
        });

        it('should have initialized properly', function() {
            expect(testController.activeCell).toBe('testCell');
        });

        it('cell.reposition should be called', function() {
            spyOn(testLayout.Cells.testCell, 'reposition').andCallThrough();
            testController.nudge('right');
            expect(testCell.reposition).toHaveBeenCalled();
        });

        it('should nudge things in the appropriate directions', function() {
            testController.nudge('right');
            expect(testCell.occupiedPlots[0]).toBe('5-6');
            expect(testCell.cssProps.top).toBe('50%');
            expect(testCell.cssProps.left).toBe('60%');
            testController.nudge('down');
            expect(testCell.occupiedPlots[0]).toBe('6-6');
            expect(testCell.cssProps.top).toBe('60%');
            expect(testCell.cssProps.left).toBe('60%');
            testController.nudge('left');
            expect(testCell.occupiedPlots[0]).toBe('6-5');
            expect(testCell.cssProps.top).toBe('60%');
            expect(testCell.cssProps.left).toBe('50%');
            testController.nudge('up');
            expect(testCell.occupiedPlots[0]).toBe('5-5');
            expect(testCell.cssProps.top).toBe('50%');
            expect(testCell.cssProps.left).toBe('50%');
        });

    });

    describe('Controller expand, contract (resize) commands', function() {
        var testLayout, testController, testCell;

        beforeEach(function() {
            testLayout = getTestLayout(true, 'div.layout', 10, 10);
            testLayout.addCell(5, 5, 1, 1, 'testCell', 'className');
            testController = new Controller();
            testController.init(testLayout);

            testCell = testLayout.Cells.testCell;
        });

        afterEach(function() {
            testLayout = testController = testCell = null;
        });

        it('should expand and contract horizontally.', function() {
            expect(testCell.cssProps.width).toBe('10%');
            expect(testCell.cellInfo.width).toBe(1);
            expect(testCell.occupiedPlots.length).toBe(1);
            testController.expandHoriz();
            expect(testCell.cssProps.width).toBe('20%');
            expect(testCell.cellInfo.width).toBe(2);
            expect(testCell.occupiedPlots.length).toBe(2);
            testController.contractHoriz();
            expect(testCell.cssProps.width).toBe('10%');
            expect(testCell.cellInfo.width).toBe(1);
            expect(testCell.occupiedPlots.length).toBe(1);
        });

        it('should expand and contract vertically.', function() {
            expect(testCell.cssProps.height).toBe('10%');
            expect(testCell.cellInfo.height).toBe(1);
            expect(testCell.occupiedPlots.length).toBe(1);
            testController.expandVert();
            expect(testCell.cssProps.height).toBe('20%');
            expect(testCell.cellInfo.height).toBe(2);
            expect(testCell.occupiedPlots.length).toBe(2);
            testController.contractVert();
            expect(testCell.cssProps.height).toBe('10%');
            expect(testCell.cellInfo.height).toBe(1);
            expect(testCell.occupiedPlots.length).toBe(1);
        });


    });

});