define(['important'], function(important) {

    describe('test object should work', function() {
        var test_array = [1, 2, 3, 4, 5, 6, 7],
            return_array;

        beforeEach(function() {
            return_array = important.getOdds(test_array);
        });

        afterEach(function() {
            return_array = null;
        });

        it('should have the correct number of values', function() {
            expect(return_array.length).toBe(4);
        });

        it('should be the right type', function() {
            expect(Array.isArray(return_array)).toBe(true);
        });

        it('should have the right values', function() {
            expect(return_array[1]).toBe(3);
        });

    });
});