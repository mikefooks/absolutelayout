define(['layout',
        'cell',
        'text!spec/fixtures/wrapper_fixture.html'],
        function(Layout, Cell, Wrapper) {

    describe('Cell - instantiation and object structure', function() {
        var testCell,
            testCellKeys;

        beforeEach(function() {
            testCell = new Cell();
            testCellKeys = Object.keys(testCell);
        });

        afterEach(function() {
            testCell = testCellKeys = null;
        });

        it('testCell should be a bonefide object', function() {
            expect(typeof testCell).toBe('object');
        });

        it('should have the right number of properties', function() {
            expect(testCellKeys.length).toBe(8);
        });

        it('should have all the correct properties', function() {
            expect(testCellKeys[0]).toBe('positionPlot');
            expect(testCellKeys[4]).toBe('idName');
            expect(testCellKeys[7]).toBe('$obj');
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
            testCell = new Cell();
            testCell.initConfig({
                topLeft: [3, 4],
                dimensionsIn: [2, 3],
                classNames: 'test-a-roo',
                idName: 'test-cell'
            }, testLayout);
        });

        afterEach(function() {
            testCell = null;
        });

        it('should have cellInfo attributes correctly assigned', function() {
            expect(testCell.cellInfo.location[0]).toBe(3);
            expect(testCell.cellInfo.location[1]).toBe(4);
            expect(testCell.cellInfo.dimensions[0]).toBe(2);
            expect(testCell.cellInfo.dimensions[1]).toBe(3);
        });

        it('should have cssProps attribute correctly assigned', function() {
            expect(testCell.cssProps.top).toBe('30%');
            expect(testCell.cssProps.left).toBe('40%');
            expect(testCell.cssProps.width).toBe('30%');
            expect(testCell.cssProps.height).toBe('20%');
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

            testCell = new Cell();
            testCell.initConfig({
                topLeft: [2, 2],
                dimensionsIn: [8, 8],
                idName: 'test-cell',
                classNames: 'neat-o'
            }, testLayout);

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

});