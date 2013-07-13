define(['cell'], function(Cell) {

    describe('Cell - instantiation and object structure', function() {
        var testCell;

        beforeEach(function() {
            testCell = new Cell();
        });

        afterEach(function() {
            testCell = null;
        });

        it('should return an object', function() {
            expect(typeof testCell).toBe('object');
        });

    });

});