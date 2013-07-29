define(['layout', 'plot'], function(Layout, Plot) {

    describe('Plot object form and instantiation', function() {
        var testLayout,
            fakeConfig,
            testPlot_1;

        beforeEach(function() {
            fakeConfig = {
                fluid: true,
                container: 'div.test',
                rows: 7,
                columns: 7
            };

            testLayout = new Layout();
            testLayout.initConfig(fakeConfig);

            testPlot_1 = new Plot({
                row: 3,
                column: 3
            }, testLayout);
        });

        afterEach(function() {
            testLayout = fakeConfig = testPlot_1 = testPlot_2 = null;
        });

        it('Plot has been imported correctly', function() {
            expect(typeof Plot).toBe('function');
        });

        it('plot has the correct object structure', function() {
            expect(typeof testPlot_1).toBe('object');
            expect(Object.keys(testPlot_1).length).toBe(3);
        });

        it('should have the proper values for location', function() {
            expect(testPlot_1.location.row).toBe(3),
            expect(testPlot_1.location.column).toBe(3);
        });

        it('should have the proper values for row and column width', function() {
            /* 42.85714285714286% is 3 / 7 */
            expect(testPlot_1.cssProps.left).toBe('42.85714285714286%');
            expect(testPlot_1.cssProps.top).toBe('42.85714285714286%');
        });

        it('should have the proper value for occupied', function() {
            expect(testPlot_1.occupied).toBe(false);
        });

    });

});