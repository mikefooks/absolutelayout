define(['layout', 'cell'], function(Layout, Cell) {

    describe('Cell - instantiation and object structure', function() {
        var testCell;

        beforeEach(function() {
            testCell = new Cell();
        });

        afterEach(function() {
            testCell = null;
        });

        it('testCell should be a bonefide object', function() {
            expect(typeof testCell).toBe('object');
        });

        it('should have the right number of properties', function() {
            expect(Object.keys(testCell).length).toBe(8);
        });

    });

    describe('Cell.initConfig - Cell configuration', function() {
        var testCell,
            testLayout = new Layout.Layout(),
            layoutConfig = {
                fluid: true,
                container: 'div.layout',
                columns: 10,
                rows: 10
            },
            cellConfig = {
                topLeft: [3, 4],
                dimensionsIn: [2, 3]
            };
            testLayout.initConfig(layoutConfig);
            testLayout.refresh();

        beforeEach(function() {
            testCell = new Cell();
            testCell.initConfig(cellConfig, testLayout);
        });

        afterEach(function() {
            testCell = null;
        });
    });

});