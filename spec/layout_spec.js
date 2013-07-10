define(['layout', 'jquery'], function(Layout, $) {

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

        beforeEach(function() {
            fakeContainer = $('<div></div>')
                .addClass('wrapper')
                .css({
                    'width' : '1000px',
                    'height' : '1000px'
                });
            fakeConfigObj = {
                fluid: false,
                container: 'div.wrapper',
                columns: 10,
                rows: 10
            };
            testLayout = new Layout.Layout();
            testLayout.initConfig(fakeConfigObj);
        });

        afterEach(function() {
            fakeContainer = null;
            fakeConfigObj = null;
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