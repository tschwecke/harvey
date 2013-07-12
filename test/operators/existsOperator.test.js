var assert = require('assert'),
	comparer = require('../../lib/operators/existsOperator.js');

describe('existsOperator', function() {
	it('should return true if testing for existence and the value exists', function(done) {
		//Arrange
		var actualValue = "test";
		var expectedValue = true;

		//Act
		var result = comparer(actualValue, expectedValue);

		//Assert
		assert(result);
		done();
	});

	it('should return false if testing for existence the value doesn\'t exist', function(done) {
		//Arrange
		var actualValue = undefined;
		var expectedValue = true;

		//Act
		var result = comparer(actualValue, expectedValue);

		//Assert
		assert(!result);
		done();
	});

	it('should return false if testing for absence and the value exists', function(done) {
		//Arrange
		var actualValue = "test";
		var expectedValue = false;

		//Act
		var result = comparer(actualValue, expectedValue);

		//Assert
		assert(!result);
		done();
	});

	it('should return true if testing for absence the value doesn\'t exist', function(done) {
		//Arrange
		var actualValue = undefined;
		var expectedValue = false;

		//Act
		var result = comparer(actualValue, expectedValue);

		//Assert
		assert(result);
		done();
	});
}); 
