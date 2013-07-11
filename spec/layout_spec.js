define(['layout', 'jquery', 'text!spec/fixtures/wrapper_fixture.html'], function(Layout, $, Wrapper) {

    "use strict";

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
            expect(Object.keys(testLayout).length).toBe(4);
            expect(Object.keys(testLayout)[2]).toBe('Cells');
        });
    });

    describe('Layout.initConfig', function() {
        var fakeConfigObj,
            testLayout;

        beforeEach(function() {
            fakeConfigObj = {
                fluid: true,
                container: 'div.layout',
                columns: 10,
                rows: 10
            },
            testLayout = new Layout.Layout();

            testLayout.initConfig(fakeConfigObj);
        });

        afterEach(function() {
            fakeConfigObj = testLayout = null;
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
        var fakeDom = $(Wrapper),
            fakeConfigObj,
            testLayout;

        beforeEach(function() {
            fakeConfigObj = {
                fluid: true,
                container: 'div.layout',
                columns: 10,
                rows: 10
            },
            testLayout = new Layout.Layout();
            testLayout.initConfig(fakeConfigObj);
            testLayout.refresh();
        });

        afterEach(function() {
            fakeDom = fakeConfigObj = testLayout = null;
        });

        it('should register new plots in the Layout object', function() {
            expect(Object.keys(testLayout.Plots).length).toBe(100);
        });

    });
});