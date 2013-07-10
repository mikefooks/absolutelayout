define(['layout', 'jquery', 'text!spec/fixtures/wrapper_fixture.html'], function(Layout, $, Wrapper) {

    jasmine.getFixtures().fixturesPath = 'fixtures/';

    describe('Layout object form and instantiation', function() {
        var testLayout;

        beforeEach(function() {
            testLayout = new Layout.Layout();
        });

        afterEach(function() {
            testLayout = null;
        });

        it('object instance should exist and be an object', function() {
            expect(testLayout).toBeTruthy();
            expect(typeof testLayout).toBe('object');
        });

        it('instance should have proper form', function() {
            expect(Object.keys(testLayout).length).toBe(3);
            expect(Object.keys(testLayout)[2]).toBe('Cells');
        });
    });

    describe('Layout.initConfig', function() {
        var fakeContainer,
            fakeConfigObj,
            testLayout;

        /**
        * Load a little HTML partial to play with.
        */

        beforeEach(function() {
            fakeContainer = $(Wrapper),
            fakeConfigObj = {
                fluid: false,
                container: 'section.main',
                columns: 10,
                rows: 10
            },
            testLayout = new Layout.Layout();

            testLayout.initConfig(fakeConfigObj);
        });

        afterEach(function() {
            fakeContainer = fakeConfigObj = testLayout = null;
        });

        it('HTML fixture should be properly loaded', function() {
            expect(fakeContainer).toContain('section.main');
        });

        it('HTML fixture should have the proper contents', function() {
            expect(fakeContainer.find('section')[0]).toHaveClass('main');
        });

        it('should accept config object', function() {
            expect(typeof testLayout).toBe('object');
            expect(Object.keys(testLayout.config).length).toBe(4);
        });

        it('should have the values properly assigned', function() {
            expect(testLayout.config.rows).toBe(10);
        });

        it('configured container should be the right type', function() {
            /* */
        });

    });
});