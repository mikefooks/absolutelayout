define(['layout',
        'jquery',
        'text!spec/fixtures/wrapper_fixture.html'],
        function(Layout, $, Wrapper) {

    "use strict";

    /**
    * Just a little config object class so I don't have to be
    * constantly declaring literals.
    */
    var ConfigObject = function(fluid, container, columns, rows) {
        this.fluid = fluid;
        this.container = container;
        this.columns = columns;
        this.rows = rows;
    };

    describe('Layout object form and instantiation', function() {
        var testLayout;

        beforeEach(function() {
            testLayout = new Layout();
        });

        afterEach(function() {
            testLayout = null;
        });

        it('object instance should exist and be an object', function() {
            expect(testLayout).toBeTruthy();
            expect(typeof testLayout).toBe('object');
        });

        it('instance should have proper form', function() {
            expect(Object.keys(testLayout).length).toBe(4);
            expect(Object.keys(testLayout)[2]).toBe('Cells');
        });
    });

    describe('Layout.initConfig', function() {
        var testLayout;

        beforeEach(function() {
            testLayout = new Layout();
            testLayout.initConfig(
                new ConfigObject(true, 'div.layout', 10, 10)
            );
        });

        afterEach(function() {
            testLayout = null;
        });

        it('should accept config object', function() {
            expect(typeof testLayout.config).toBe('object');
            expect(Object.keys(testLayout.config).length).toBe(4);
        });

        it('should have the values properly assigned', function() {
            expect(testLayout.config.fluid).toBe(true);
            /* Keep an eye on this. It might be important */
            expect(typeof testLayout.config.container).toBe(typeof $({}));
            expect(testLayout.config.container.selector).toBe('div.layout');
            expect(testLayout.config.columns).toBe(10);
            expect(testLayout.config.rows).toBe(10);
        });

    });

    describe('Layout.refresh', function() {
        var testLayout;

        beforeEach(function() {
            testLayout = new Layout();
            testLayout.initConfig(
                new ConfigObject(true, 'div.layout', 8, 8)
            /* Is chaining necessary or useful? Pros? Cons? */
            ).refresh();
        });

        afterEach(function() {
            testLayout = null;
        });

        it('should register new plots in the Layout object', function() {
            expect(Object.keys(testLayout.Plots).length).toBe(64);
        });

        it('plot key names should be right', function() {
            expect(Object.keys(testLayout.Plots)[35]).toBe('4-3');
        });

        it('plots should have correct location information', function() {
            expect(typeof testLayout.Plots['4-5'].location).toBe('object');
            expect(testLayout.Plots['4-5'].cssProps.top).toBe('50%');
            expect(testLayout.Plots['4-5'].cssProps.left).toBe('62.5%');
        });

    });

    describe('Layout.cellDimensions', function() {
        var testLayout,
            testPlotDimensions;

        beforeEach(function() {
            testLayout = new Layout();
            testLayout.initConfig(
                new ConfigObject(true, 'div.layout', 8, 8)
            ).refresh();
            testPlotDimensions = testLayout.cellDimensions(2, 3, testLayout);
        });

        afterEach(function() {
            testPlotDimensions = null;
        });

        it('should be inthe proper format', function() {
            expect(typeof testPlotDimensions).toBe('object');
        });

        it('should have the expected dimensions', function() {
            expect(testPlotDimensions.width).toBe('37.5%');
            expect(testPlotDimensions.height).toBe('25%');
        });
    });

    describe('Layout.getOccupied', function() {

        var testLayout,
            occupiedPlots;

        beforeEach(function() {
            testLayout = new Layout();
            testLayout.initConfig(
                new ConfigObject(true, 'div.layout', 5, 5)
            ).refresh();

            ['1-1', '1-2', '2-1', '2-2'].forEach(function(obj) {
                testLayout.Plots[obj].occupied = true;
            });

            occupiedPlots = testLayout.getOccupied();
        });

        afterEach(function() {
            testLayout = occupiedPlots = null;
        });

        it('should return the correct number of plots', function() {
            expect(occupiedPlots.length).toBe(4);
        });

        it('returned object is an array', function() {
            expect(Array.isArray(occupiedPlots)).toBe(true);
        });

        it('returns the correct key names', function() {
            expect(occupiedPlots[0]).toBe('1-1');
            expect(occupiedPlots[1]).toBe('1-2');
            expect(occupiedPlots[2]).toBe('2-1');
            expect(occupiedPlots[3]).toBe('2-2');
        });
    });

    describe('Layout.getUnoccupied', function() {
        var testLayout,
            unoccupiedPlots,
            fakeOccupiedPlots;

        beforeEach(function() {
            testLayout = new Layout();
            testLayout.initConfig(
                new ConfigObject(true, 'div.layout', 15, 15)
            ).refresh();

            fakeOccupiedPlots = Object.keys(testLayout.Plots).slice(5, 12);

            fakeOccupiedPlots.forEach(function(plotName) {
                testLayout.Plots[plotName].occupied = true;
            });

            unoccupiedPlots = testLayout.getUnoccupied();
        });

        afterEach(function() {
            testLayout = unoccupiedPlots = fakeOccupiedPlots = null;
        });

        it('test structures working properly', function() {
            expect(fakeOccupiedPlots.length).toBe(7);
        });

        it('should show all the plot unoccupied', function() {
            expect(unoccupiedPlots.length).toBe(218);
        });

        it('missing cells are the ones you would expect', function() {
            expect(unoccupiedPlots[4]).toBe('0-4');
            expect(unoccupiedPlots[5]).toBe('0-12');
        });

    });

    describe('Layout.checkPosition', function() {
        var testLayout;

        beforeEach(function() {
            testLayout = new Layout(),

            testLayout.initConfig({
                fluid: true,
                container: 'div.layout',
                columns: 5,
                rows: 5
            }).refresh();

            ['3-3', '3-4', '4-3', '4-4'].forEach(function(obj) {
                testLayout.Plots[obj].occupied = true;
            });
        });

        afterEach(function() {
            testLayout = null;
        });

        it('should return false when one or more specified plots is occupied', function() {
            expect(testLayout.checkPosition(['3-2', '3-3'])).toBe(false);
        });

        it('should return true when no specified plots are occupied', function() {
            expect(testLayout.checkPosition(['1-2', '2-2'])).toBe(true);
        });
    });

    describe('Layout.getPlots', function() {
        var testLayout,
            outputPlots;

        beforeEach(function() {
            testLayout = new Layout();
            testLayout.initConfig(
                new ConfigObject(true, 'div.layout', 8, 8)
            ).refresh();

            outputPlots = testLayout.getPlots(2, 2, 3, 2);
        });

        afterEach(function() {
            testLayout = outputPlots = null;
        });

        it('should have the correct values', function() {
            expect(outputPlots[0]).toBe('3-2');
            expect(outputPlots[1]).toBe('3-3');
        });

        it('returned object should contain the right number of plots', function() {
            expect(outputPlots.length).toBe(4);
        });
    });

    describe('Layout.addCell', function() {
        var testLayout,
            cellKeys;

        beforeEach(function() {
            testLayout = new Layout();
            testLayout.initConfig(
                new ConfigObject(true, 'div.layout', 10, 10)
            ).refresh();
            testLayout.config.container = $(Wrapper).find('div.layout');
        });

        afterEach(function() {
            testLayout = cellKeys = null;
        });

        it('getPlots should be called from the addCell method', function() {
            spyOn(testLayout, 'getPlots').andCallThrough();
            testLayout.addCell([2, 2], [2, 3], 'testCell', 'className-here');
            expect(testLayout.getPlots).toHaveBeenCalled();
        });

        it('new cell should be registered with the layout Cells object', function() {
            testLayout.addCell([2, 3], [3, 4], 'testCell', 'className-here');
            cellKeys = Object.keys(testLayout.Cells);
            expect(cellKeys.length).toBe(1);
            expect(cellKeys[0]).toBe('testCell');
        });

        it('new cell should have been rendered to the fake dom.', function() {
            testLayout.addCell([2, 2], [2, 3], 'testCell', 'className-here');
            expect(testLayout.config.container).toContain('div#testCell');
            expect($(testLayout.config.container).find('div#testCell')).toHaveClass('className-here');
            expect($(testLayout.config.container).find('div#testCell')).toHaveCss({height: '20%'});
        });

    });
});