var assert = require('assert'),
	comparer = require('../../lib/comparators/inComparator.js');

describe('inComparator', function() {
	it('should return true for matching values', function(done) {
		//Arrange
		var actualValue = 2;
		var expectedValue = [1,2,3];

		//Act
		var result = comparer(actualValue, expectedValue);

		//Assert
		assert(result);
		done();
	});

	it('should return false for non-matching values', function(done) {
		//Arrange
		var actualValue = 4;
		var expectedValue = [1,2,3];

		//Act
		var result = comparer(actualValue, expectedValue);

		//Assert
		assert(!result);
		done();
	});
}); 
