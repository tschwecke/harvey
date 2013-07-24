 
 var assert = require('assert'),
	_ = require('underscore'),
	comparer = require('../../lib/util/comparer.js');
 
describe('comparer', function() {

	describe('areEqual()', function() {

		describe('string comparisons', function() {

			it('should return true for equal values', function(done) {
				//Arrange
				var actualValue = "testString";
				var expectedValue = "testString";

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				assert(result);
				done();
			});

			it('should return false for different values', function(done) {
				//Arrange
				var actualValue = "testString";
				var expectedValue = "differentString";

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				assert(!result);
				done();
			});
			
			it('should perform variable substitution before comparing values', function(done) {
				//Arrange
				var actualValue = "testString";
				var expectedValue = "${var}String";
				var variables = { "var": "test" };
				
				//Act
				var result = comparer.areEqual(actualValue, expectedValue, variables);

				//Assert
				assert(result);
				done();
			});

		});

		describe('number comparisons', function() {
			
			it('should return true for equal values', function(done) {
				//Arrange
				var actualValue = 1;
				var expectedValue = 1;
				
				//Act
				var result = comparer.areEqual(actualValue, expectedValue);
				
				//Assert
				assert(result);
				done();
			});
			
			it('should return false for different values', function(done) {
				//Arrange
				var actualValue = 1;
				var expectedValue = 2;
				
				//Act
				var result = comparer.areEqual(actualValue, expectedValue);
				
				//Assert
				assert(!result);
				done();
			});
		});

		describe('array comparisons', function() {

			it('should return true for two empty arrays', function(done) {
				//Arrange
				var actualValue = [];
				var expectedValue = [];

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				assert(result);
				done();
			});

			it('should return true for two same integer arrays', function(done) {
				//Arrange
				var actualValue = [1,2,3];
				var expectedValue = [1,2,3];

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				assert(result);
				done();
			});

			it('should return true for two same integer arrays with different ordering', function(done) {
				//Arrange
				var actualValue = [1,2,3];
				var expectedValue = [3,1,2];

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				assert(result);
				done();
			});

			it('should return false for two different integer arrays', function(done) {
				//Arrange
				var actualValue = [1,2,3];
				var expectedValue = [1,9,3];

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				assert(!result);
				done();
			});

			it('should return false for two integer arrays of different lengths', function(done) {
				//Arrange
				var actualValue = [1,2,3];
				var expectedValue = [1,2,3,4];

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				assert(!result);
				done();
			});

			it('should return false when comparing an array to an object', function(done) {
				//Arrange
				var actualValue = {};
				var expectedValue = [];

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				assert(!result);
				done();
			});

			it('should return true for two same object arrays', function(done) {
				//Arrange
				var actualValue = [{"prop1": "val1"}, {"prop2": "val2"}];
				var expectedValue = [{"prop1": "val1"}, {"prop2": "val2"}];

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				assert(result);
				done();
			});

			
			it('should return false for two different object arrays', function(done) {
				//Arrange
				var actualValue = [{"prop1": "val1"}, {"prop2": "val2"}];
				var expectedValue = [{"prop3": "val3"}, {"prop4": "val4"}];

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				assert(!result);
				done();
			});

			it('should return true for two same object arrays with different ordering', function(done) {
				//Arrange
				var actualValue = [{"prop1": "val1"}, {"prop2": "val2"}];
				var expectedValue = [{"prop2": "val2"}, {"prop1": "val1"}];

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				assert(result);
				done();
			});


		});

		describe('object comparisons', function() {

			it('should return true if all values are equal', function(done) {
				//Arrange
				var actualValue = {
					"prop1": "val1",
					"prop2": "val2"
				};
				var expectedValue = {
					"prop1": "val1",
					"prop2": "val2"
				};

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				assert(result);
				done();
			});

			it('should return true if all values are equal but actual has additional properties', function(done) {
				//Arrange
				var actualValue = {
					"prop1": "val1",
					"prop2": "val2",
					"prop3": "val3"
				};
				var expectedValue = {
					"prop1": "val1",
					"prop2": "val2"
				};

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				assert(result);
				done();
			});

			it('should return false if one value is not equal', function(done) {
				//Arrange
				var actualValue = {
					"prop1": "val1",
					"prop2": "val3"
				};
				var expectedValue = {
					"prop1": "val1",
					"prop2": "val2"
				};

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				assert(!result);
				done();
			});

		});

		describe('multiple operator comparisons', function() {
			it('should return true if all values are equal', function(done) {
				//Arrange
				var actualValue = {
					"prop1": 5,
					"prop2": 5
				};
				var expectedValue = {
					"prop1": {"$gt": 4},
					"prop2": {"$lt": 6}
				};

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				assert(result);
				done();
			});

			it('should return false if one value is not equal', function(done) {
				//Arrange
				var actualValue = {
					"prop1": 5,
					"prop2": 5
				};
				var expectedValue = {
					"prop1": {"$gt": 6},
					"prop2": {"$lt": 6}
				};

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				assert(!result);
				done();
			});

		});
		
		
	});

	
});
 