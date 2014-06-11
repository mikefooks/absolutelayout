"use strict";

describe("see if fixture works", function () {
    var layoutBox;

    beforeEach(function () {
        layoutBox = document.querySelector("div.layoutBox");
    });

    afterEach(function () {
        layoutBox = null;
    });

    it("should have the right class", function () {
        expect(layoutBox.classList.length).toBe(1);
        expect(layoutBox.classList[0]).toBe("layoutBox");
    });

    it("should have the right dimensions", function () {
        expect(layoutBox.style.width).toBe("500px");
        expect(layoutBox.style.height).toBe("500px");
    });

});