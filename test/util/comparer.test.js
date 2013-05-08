 
 var assert = require('assert'),
	_ = require('underscore'),
	comparer = require('../../lib/util/comparer.js');
 
describe ('comparer', function() {

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

		describe('$lt comparisons', function() {
			
			it('should return true for values that are less than the expected', function(done) {
				//Arrange
				var actualValue = 1;
				var expectedValue = {
					"$lt": 2
				};
				
				//Act
				var result = comparer.areEqual(actualValue, expectedValue);
				
				//Assert
				assert(result);
				done();
			});
			
			it('should return false for values that are equal to the expected', function(done) {
				//Arrange
				var actualValue = 2;
				var expectedValue = {
					"$lt": 2
				};
				
				//Act
				var result = comparer.areEqual(actualValue, expectedValue);
				
				//Assert
				assert(!result);
				done();
			});
			
			it('should return false for values that are greater than the expected', function(done) {
				//Arrange
				var actualValue = 3;
				var expectedValue = {
					"$lt": 2
				};
				
				//Act
				var result = comparer.areEqual(actualValue, expectedValue);
				
				//Assert
				assert(!result);
				done();
			});
			
		});

		describe('$lte comparisons', function() {
			
			it('should return true for values that are less than the expected', function(done) {
				//Arrange
				var actualValue = 1;
				var expectedValue = {
					"$lte": 2
				};
				
				//Act
				var result = comparer.areEqual(actualValue, expectedValue);
				
				//Assert
				assert(result);
				done();
			});
			
			it('should return true for values that are equal to the expected', function(done) {
				//Arrange
				var actualValue = 2;
				var expectedValue = {
					"$lte": 2
				};
				
				//Act
				var result = comparer.areEqual(actualValue, expectedValue);
				
				//Assert
				assert(result);
				done();
			});
			
			it('should return false for values that are greater than the expected', function(done) {
				//Arrange
				var actualValue = 3;
				var expectedValue = {
					"$lte": 2
				};
				
				//Act
				var result = comparer.areEqual(actualValue, expectedValue);
				
				//Assert
				assert(!result);
				done();
			});
			
		});

		describe('$gt comparisons', function() {
			
			it('should return true for values that are greater than the expected', function(done) {
				//Arrange
				var actualValue = 3;
				var expectedValue = {
					"$gt": 2
				};
				
				//Act
				var result = comparer.areEqual(actualValue, expectedValue);
				
				//Assert
				assert(result);
				done();
			});
			
			it('should return false for values that are equal to the expected', function(done) {
				//Arrange
				var actualValue = 2;
				var expectedValue = {
					"$gt": 2
				};
				
				//Act
				var result = comparer.areEqual(actualValue, expectedValue);
				
				//Assert
				assert(!result);
				done();
			});
			
			it('should return false for values that are less than the expected', function(done) {
				//Arrange
				var actualValue = 1;
				var expectedValue = {
					"$gt": 2
				};
				
				//Act
				var result = comparer.areEqual(actualValue, expectedValue);
				
				//Assert
				assert(!result);
				done();
			});
			
		});
		
		describe('$gte comparisons', function() {
			
			it('should return true for values that are greater than the expected', function(done) {
				//Arrange
				var actualValue = 3;
				var expectedValue = {
					"$gte": 2
				};
				
				//Act
				var result = comparer.areEqual(actualValue, expectedValue);
				
				//Assert
				assert(result);
				done();
			});
			
			it('should return true for values that are equal to the expected', function(done) {
				//Arrange
				var actualValue = 2;
				var expectedValue = {
					"$gte": 2
				};
				
				//Act
				var result = comparer.areEqual(actualValue, expectedValue);
				
				//Assert
				assert(result);
				done();
			});
			
			it('should return false for values that are less than the expected', function(done) {
				//Arrange
				var actualValue = 1;
				var expectedValue = {
					"$gte": 2
				};
				
				//Act
				var result = comparer.areEqual(actualValue, expectedValue);
				
				//Assert
				assert(!result);
				done();
			});
			
		});

		describe('$ne comparisons', function() {
			
			it('should return true for different values', function(done) {
				//Arrange
				var actualValue = "testString";
				var expectedValue = {
					"$ne": "differentString"
				};
				
				//Act
				var result = comparer.areEqual(actualValue, expectedValue);
				
				//Assert
				assert(result);
				done();
			});
			
			it('should return false for equal values', function(done) {
				//Arrange
				var actualValue = "testString";
				var expectedValue = {
					"$ne": "testString"
				};
				
				//Act
				var result = comparer.areEqual(actualValue, expectedValue);
				
				//Assert
				assert(!result);
				done();
			});
		});

		describe('$regex comparisons', function() {
			
			it('should return true for matching values', function(done) {
				//Arrange
				var actualValue = "test123";
				var expectedValue = {
					"$regex": "^test\\d+$"
				};
				
				//Act
				var result = comparer.areEqual(actualValue, expectedValue);
				
				//Assert
				assert(result);
				done();
			});

			it('should return false for non-matching values', function(done) {
				//Arrange
				var actualValue = "test123test";
				var expectedValue = {
					"$regex": "^test\\d+$"
				};
				
				//Act
				var result = comparer.areEqual(actualValue, expectedValue);
				
				//Assert
				assert(!result);
				done();
			});
		});

		describe('$in comparisons', function() {
			
			it('should return true for matching values', function(done) {
				//Arrange
				var actualValue = 2;
				var expectedValue = {
					"$in": [1,2,3]
				};
				
				//Act
				var result = comparer.areEqual(actualValue, expectedValue);
				
				//Assert
				assert(result);
				done();
			});

			it('should return false for non-matching values', function(done) {
				//Arrange
				var actualValue = 4;
				var expectedValue = {
					"$in": [1,2,3]
				};
				
				//Act
				var result = comparer.areEqual(actualValue, expectedValue);
				
				//Assert
				assert(!result);
				done();
			});
			
		});

		
		describe('$exists comparisons', function() {
			
			it('should return true if testing for existence and the value exists', function(done) {
				//Arrange
				var actualValue = "test";
				var expectedValue = {
					"$exists": true
				};
				
				//Act
				var result = comparer.areEqual(actualValue, expectedValue);
				
				//Assert
				assert(result);
				done();
			});
			
			it('should return false if testing for existence the value doesn\'t exist', function(done) {
				//Arrange
				var actualValue = undefined;
				var expectedValue = {
					"$exists": true
				};
				
				//Act
				var result = comparer.areEqual(actualValue, expectedValue);
				
				//Assert
				assert(!result);
				done();
			});
			
			it('should return false if testing for absence and the value exists', function(done) {
				//Arrange
				var actualValue = "test";
				var expectedValue = {
					"$exists": false
				};
				
				//Act
				var result = comparer.areEqual(actualValue, expectedValue);
				
				//Assert
				assert(!result);
				done();
			});
			
			it('should return true if testing for absence the value doesn\'t exist', function(done) {
				//Arrange
				var actualValue = undefined;
				var expectedValue = {
					"$exists": false
				};
				
				//Act
				var result = comparer.areEqual(actualValue, expectedValue);
				
				//Assert
				assert(result);
				done();
			});
		});

		describe('multiple property comparisons', function() {
			
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
		});
		
	});

	
});
 