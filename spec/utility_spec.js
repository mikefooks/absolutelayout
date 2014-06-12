"use strict";

describe("utility functions", function () {

    describe("appendTo", function () {
        var parentDiv,
            childDiv;

        beforeEach(function () {
            parentDiv = document.querySelector("div.layoutBox");
            childDiv = document.createElement("div");
            childDiv.classList.add("testDiv");
        });

        afterEach(function () {
            parentDiv.removeChild(childDiv);
            parentDiv = childDiv = null;
        });

        it("should append the test child div to the parent div.", function () {
            appendTo(parentDiv, childDiv);

            expect(parentDiv.children.length).toBe(1);
            expect(parentDiv.lastChild.classList[0]).toBe("testDiv");
        });
    });


    describe("forIn, shallowCopy, objFilter", function () {
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