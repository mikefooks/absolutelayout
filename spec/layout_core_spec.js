"use strict";

describe("internal methods", function () {

    describe("_cellDimensions, _getPlots - information functions", function () {
        var testLayout,
            testDimensions,
            testPlots;

        beforeEach(function () {
            testLayout = new Layout(8, 8, "div.layoutBox");
        });

        afterEach(function () {
            testLayout = null;
        });

        it("_cellDimensions should return an object with the right form", function () {
            testDimensions = testLayout._cellDimensions(2, 2);

            expect(typeof testDimensions).toBe("object");
            ["height", "width"].forEach(function (prop) {
                expect(testDimensions.hasOwnProperty(prop)).toBe(true);
            });

            testDimensions = null;
        });

        it("_cellDimensions should return correct dimensions", function () {
            testDimensions = testLayout._cellDimensions(3, 7);

            expect(testDimensions.height).toBe("37.5%");
            expect(testDimensions.width).toBe("87.5%");

            testDimensions = null;
        });

        it("_getPlots returns an array of plot names", function () {
            testPlots = testLayout._getPlots(2, 3, 1, 3);

            expect(Array.isArray(testPlots)).toBe(true);
            expect(testPlots.length).toBe(3);
            expect(testPlots.every(function (plot) {
                return typeof plot === "string";
            })).toBe(true);

            testPlots = null;
        });

        it("_getPlots returns the correct plot names", function () {
            testPlots = testLayout._getPlots(1, 1, 2, 3);

            expect(testPlots.length).toBe(6);
            ["1-1", "1-2", "1-3", "2-1", "2-2", "2-3"].forEach(function (plot, i) {
                expect(plot === testPlots[i]).toBe(true);
            });
        });
    });

});