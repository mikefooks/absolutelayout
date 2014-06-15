"use strict";

describe("utility functions", function () {

    describe("DOM utilities: createEl, appendTo, setStyles", function () {
        var parentDiv,
            childDiv,
            newDiv;

        beforeEach(function () {
            parentDiv = document.querySelector("div.layoutBox");
            childDiv = document.createElement("div");
            childDiv.classList.add("testDiv");
        });

        afterEach(function () {
            parentDiv = childDiv = newDiv = null;
        });

        it("createEl should create a new element", function () {
            newDiv = createEl("div");

            expect(newDiv instanceof HTMLElement).toBe(true);
            expect(newDiv.nodeName).toBe("DIV");

        });

        it("createEl should create a new element with optional attributes", function () {
            newDiv = createEl("div", { id: "newdiv", style: "width: 500px;" });

            expect(newDiv instanceof HTMLElement).toBe(true);
            expect(newDiv.nodeName).toBe("DIV");
            expect(newDiv.id).toBe("newdiv");
            expect(newDiv.style.width).toBe("500px");

        });

        it("setStyles sets one style using two strings as arguments", function () {
            newDiv = createEl("div");
            setStyles(newDiv, "width", "500px");

            expect(newDiv.style.width).toBe("500px");
        });

        it("setStyles sets multiple styles using an object as the second argument", function () {
            newDiv = createEl("div");
            setStyles(newDiv, { width: "500px", marginTop: "10px" });

            expect(newDiv.style.width).toBe("500px");
            expect(newDiv.style.marginTop).toBe("10px");
        });

        it("appendTo should append the test child div to the parent div.", function () {
            appendTo(parentDiv, childDiv);

            expect(parentDiv.children.length).toBe(1);
            expect(parentDiv.lastChild.classList[0]).toBe("testDiv");

            parentDiv.removeChild(childDiv);
        });

    });


    describe("Low-level utilities: forIn, combine, objFilter", function () {
        var testObj1,
            testObj2,
            testObj3,
            combinedObj,
            filteredObj,
            arr;

        beforeEach(function () {
            testObj1 = {
                one: "one",
                two: 2,
                three: ["objects", "are", "neat"]
            };
            testObj2 = {
                four: "four",
                five: 5,
                six: ["pretty", "cool"]
            };
        });

        afterEach(function () {
            testObj1 = testObj2 = null;
        });

        it("forIn executes a function for each obj property", function () {
            arr = [];

            forIn(testObj1, function(val, key) {
                arr.push(val);
            });

            expect(typeof arr[0]).toBe("string");
            expect(typeof arr[1]).toBe("number");
            expect(Array.isArray(arr[2])).toBe(true);

            arr = null;
        });

        it("combine combines objects", function () {
            testObj3 = { hey: "there" };

            combinedObj = combine(testObj1, testObj2, testObj3);

            expect(Object.keys(combinedObj).length).toBe(7);
            expect(combinedObj.hasOwnProperty("hey")).toBe(true);

            combinedObj = null;
        });

        it("objFilter filters object properties", function () {
            filteredObj = objFilter(testObj1, function (prop) {
                return typeof prop === "string";
            });

            expect(Object.keys(filteredObj).length).toBe(1);
            expect(filteredObj.one).toBe("one");

            filteredObj = null;
        });
    });
});