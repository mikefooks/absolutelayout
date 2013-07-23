define(['layout',
        'cell',
        'text!spec/fixtures/wrapper_fixture.html'],
        function(Layout, Cell, Wrapper) {

    describe('Cell - instantiation and object structure', function() {
        var testCell,
            testCellKeys;

        beforeEach(function() {
            testCell = new Cell.Cell();
            testCellKeys = Object.keys(testCell);
        });

        afterEach(function() {
            testCell = testCellKeys = null;
        });

        it('testCell should be a bonefide object', function() {
            expect(typeof testCell).toBe('object');
        });

        it('should have the right number of properties', function() {
            expect(testCellKeys.length).toBe(7);
        });

        it('should have all the correct properties', function() {
            expect(testCellKeys[0]).toBe('positionPlot');
            expect(testCellKeys[2]).toBe('cellInfo');
            expect(testCellKeys[5]).toBe('container');
        });

    });

    describe('Cell.initConfig - Cell configuration', function() {
        var testCell,
            testLayout = new Layout();

            testLayout.initConfig({
                fluid: true,
                container: 'div.layout',
                columns: 10,
                rows: 10
            }).refresh();

        beforeEach(function() {
            testCell = new Cell.Cell();
            testCell.initConfig(
                new Cell.CellInfo(3, 4, 2, 3, 'test-cell', 'test-a-roo'),
                testLayout
            );
        });

        afterEach(function() {
            testCell = null;
        });

        it('should have cellInfo attributes correctly assigned', function() {
            expect(testCell.cellInfo.top).toBe(3);
            expect(testCell.cellInfo.left).toBe(4);
            expect(testCell.cellInfo.height).toBe(2);
            expect(testCell.cellInfo.width).toBe(3);
        });

        it('should have cssProps attribute correctly assigned', function() {
            expect(testCell.cssProps.top).toBe('30%');
            expect(testCell.cssProps.left).toBe('40%');
            expect(testCell.cssProps.height).toBe('20%');
            expect(testCell.cssProps.width).toBe('30%');
        });

        it('$obj property should look good', function() {
            expect(testCell.$obj).toHaveClass('test-a-roo');
        });
    });

    describe('Cell.render', function() {
        var testLayout,
            testCell,
            layoutContainer;

        beforeEach(function() {
            testLayout = new Layout();
            testLayout.initConfig({
                fluid: true,
                columns: 15,
                rows: 15
            }).refresh();
            testLayout.config.container = $(Wrapper).find('div.layout');

            testCell = new Cell.Cell();
            testCell.initConfig(
                new Cell.CellInfo(2, 2, 8, 8, 'test-cell', 'neat-o'),
                testLayout
            );

            testCell.render();

            layoutContainer = testLayout.config.container;
        });

        afterEach(function() {
            testLayout = testCell = null;
        });

        it('html fixture should be properly loaded', function() {
            expect(layoutContainer).toBe('div.layout');
            expect(layoutContainer).toHaveClass('layout');
        });

        it('cell should have layout container configured properly', function() {
            expect(testCell.container).toBe(testLayout.config.container);
        });

        it('cell should have been appended to fake dom', function() {
            expect(layoutContainer).toContain('div#test-cell');
        });

        it('rendered cell has correct style attributes', function() {
            expect($(layoutContainer).find('div#test-cell')).toHaveCss({height: '53.333333333333336%'});
        });

        it('rendered cell has right class names', function() {
            expect($(layoutContainer).find('div#test-cell')).toHaveClass('neat-o');
        });
    });

    describe('Cell.reposition', function() {
        var testLayout,
            testCell,
            layoutContainer;

        beforeEach(function() {
            testLayout = new Layout();
            testLayout.initConfig({
                fluid: true,
                container: 'div.layout',
                rows: 10,
                columns: 10
            }).refresh();

            testLayout.config.container = $(Wrapper).find('div.layout');
            testLayout.addCell(0, 0, 2, 2, 'testCell', 'classHere');
            testCell = testLayout.Cells.testCell;

            layoutContainer = testLayout.config.container;
        });

        afterEach(function() {
            testCell = testLayout = null;
        });

        it('layout.getOccupied should work correctly', function() {
            expect(testLayout.getOccupied()[0]).toBe('0-0');
            expect(testLayout.getOccupied().length).toBe(4);
            testCell.reposition(1, 1);
            expect(testLayout.getOccupied()[0]).toBe('1-1');
            expect(testLayout.getOccupied().length).toBe(4);
        });

        it('new cell attributes should reflect change in position', function() {
            expect(testCell.cellInfo.top).toBe(0);
            expect(testCell.cellInfo.left).toBe(0);
            expect(testCell.cellInfo.height).toBe(2);
            expect(testCell.cellInfo.width).toBe(2);
            testCell.reposition(4, 4);
            expect(testCell.cellInfo.top).toBe(4);
            expect(testCell.cellInfo.left).toBe(4);
        });

        it('occupiedPlots attribute updated correctly', function() {
            expect(testCell.occupiedPlots[0]).toBe('0-0');
            expect(testCell.occupiedPlots.length).toBe(4);
            testCell.reposition(3, 3);
            expect(testCell.occupiedPlots[0]).toBe('3-3');
            expect(testCell.occupiedPlots.length).toBe(4);
        });

        it('cssProps updated correctly', function() {
            expect(testCell.cssProps.top).toBe('0%');
            expect(testCell.cssProps.left).toBe('0%');
            testCell.reposition(3, 3);
            expect(testCell.cssProps.top).toBe('30%');
            expect(testCell.cssProps.left).toBe('30%');
        });

        it('fake dom should be updated accordingly', function() {
            expect(layoutContainer).toContain('div#testCell');
            expect($(layoutContainer).find('div#testCell'))
                .toHaveAttr('style', 'width: 20%; height: 20%; top: 0%; left: 0%; ');
            testCell.reposition(2, 2);
            expect($(layoutContainer).find('div#testCell'))
                .toHaveAttr('style', 'width: 20%; height: 20%; top: 20%; left: 20%; ');
        });

        it('positionPlot updated correctly', function() {
            expect(testCell.positionPlot.location.row).toBe(0);
            testCell.reposition(3, 3);
            expect(testCell.positionPlot.location.row).toBe(3);
        });

        it('should call to checkPosition', function() {
            spyOn(testLayout, 'checkPosition').andCallThrough();
            testCell.reposition(3, 3);
            expect(testLayout.checkPosition).toHaveBeenCalled();
        });

        it('should call to Cell.modify method', function() {
            spyOn(testCell, 'modify').andCallThrough();
            testCell.reposition(3, 3);
            expect(testCell.modify).toHaveBeenCalled();
            expect(testCell.modify).toHaveBeenCalledWith(['3-3', '3-4', '4-3', '4-4']);
        });

    });

    describe('Cell.resize', function() {
        var testLayout,
            testCell,
            layoutContainer;

        beforeEach(function() {
            testLayout = new Layout();
            testLayout.initConfig({
                fluid: true,
                container: 'div.layout',
                rows: 12,
                columns: 12
            }).refresh();

            testLayout.config.container = $(Wrapper).find('div.layout');
            layoutContainer = testLayout.config.container;

            testLayout.addCell(4, 4, 4, 4, 'testCell', 'testCellClass');

            testCell = testLayout.Cells.testCell;

        });

        afterEach(function() {
            testLayout = testCell = layoutContainer = null;
        });

        it('cell moved should be reflected in cellInfo', function() {
            expect(testCell.cellInfo.width).toBe(4);
            expect(testCell.cellInfo.height).toBe(4);
            testCell.resize(6, 6);
            expect(testCell.cellInfo.width).toBe(6);
            expect(testCell.cellInfo.height).toBe(6);
        });

        it('cell moved should be reflected in cssProps', function() {
            expect(testCell.cssProps.width).toBe('33.333333333333336%');
            expect(testCell.cssProps.height).toBe('33.333333333333336%');
            testCell.resize(6, 6);
            expect(testCell.cssProps.width).toBe('50%');
            expect(testCell.cssProps.height).toBe('50%');
        });

        it('should have been resized on the fake dom', function() {
            expect($(layoutContainer).find('div#testCell'))
                .toHaveAttr('style', 'width: 33.333333333333336%; height: 33.333333333333336%; top: 33.333333333333336%; left: 33.333333333333336%; ');
            testCell.resize(6, 6);
            expect($(layoutContainer).find('div#testCell'))
                .toHaveAttr('style', 'width: 50%; height: 50%; top: 33.333333333333336%; left: 33.333333333333336%; ');
        });

        it('should call to checkPosition', function() {
            spyOn(testLayout, 'checkPosition').andCallThrough();
            testCell.resize(6, 6);
            expect(testLayout.checkPosition).toHaveBeenCalled();
        });

        it('should call to Cell.modify method', function() {
            spyOn(testCell, 'modify').andCallThrough();
            testCell.resize(6, 6);
            expect(testCell.modify).toHaveBeenCalled();
        });

    });
});