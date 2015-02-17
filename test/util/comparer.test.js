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
				var expectedResult = { match: true };

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				assert(_.isEqual(expectedResult, result), "Expected result does not match, got " + JSON.stringify(result));
				done();
			});

			it('should return false for different values', function(done) {
				//Arrange
				var actualValue = "testString";
				var expectedValue = "differentString";
				var expectedResult = {
					match: false,
					diffs: [{
						expected: "differentString",
						actual: "testString"
					}]
				};

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				assert(_.isEqual(expectedResult, result), "Expected result does not match, got " + JSON.stringify(result));
				done();
			});

			it('should perform variable substitution before comparing values', function(done) {
				//Arrange
				var actualValue = "testString";
				var expectedValue = "${var}String";
				var variables = { "var": "test" };
				var expectedResult = { match: true };

				//Act
				var result = comparer.areEqual(actualValue, expectedValue, variables);

				//Assert
				assert(_.isEqual(expectedResult, result), "Expected result does not match, got " + JSON.stringify(result));
				done();
			});

		});

		describe('number comparisons', function() {

			it('should return true for equal values', function(done) {
				//Arrange
				var actualValue = 1;
				var expectedValue = 1;
				var expectedResult = { match: true };

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				assert(_.isEqual(expectedResult, result), "Expected result does not match, got " + JSON.stringify(result));
				done();
			});

			it('should return false for different values', function(done) {
				//Arrange
				var actualValue = 1;
				var expectedValue = 2;
				var expectedResult = {
					match: false,
					diffs: [{
						expected: 2,
						actual: 1
					}]
				};

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				assert(_.isEqual(expectedResult, result), "Expected result does not match, got " + JSON.stringify(result));
				done();
			});
		});

		describe('array comparisons', function() {

			it('should return true for two empty arrays', function(done) {
				//Arrange
				var actualValue = [];
				var expectedValue = [];
				var expectedResult = { match: true };

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				assert(_.isEqual(expectedResult, result), "Expected result does not match, got " + JSON.stringify(result));
				done();
			});

			it('should return true for two same integer arrays', function(done) {
				//Arrange
				var actualValue = [1,2,3];
				var expectedValue = [1,2,3];
				var expectedResult = { match: true };

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				assert(_.isEqual(expectedResult, result), "Expected result does not match, got " + JSON.stringify(result));
				done();
			});

			it('should return true for two same integer arrays with different ordering', function(done) {
				//Arrange
				var actualValue = [1,2,3];
				var expectedValue = [3,1,2];
				var expectedResult = { match: true };

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				assert(_.isEqual(expectedResult, result), "Expected result does not match, got " + JSON.stringify(result));
				done();
			});

			it('should return false for two different integer arrays', function(done) {
				//Arrange
				var actualValue = [1,2,3];
				var expectedValue = [1,9,3];
				var expectedResult = {
					match: false,
					diffs: [{
						property: "Array no-match",
						indicies: [1]
					}]
				};

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				// console.log(JSON.stringify(result));
				assert(_.isEqual(expectedResult, result), "Expected result does not match, got " + JSON.stringify(result));
				done();
			});

			it('should return false for two integer arrays of different lengths', function(done) {
				//Arrange
				var actualValue = [1,2,3];
				var expectedValue = [1,2,3,4];
				var expectedResult = {
					match: false,
					diffs: [{
						property: "Array length",
						actual: 3,
						expected: 4
					}]
				};

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				// console.log(JSON.stringify(result));
				assert(_.isEqual(expectedResult, result), "Expected result does not match, got " + JSON.stringify(result));
				done();
			});

			it('should return false when comparing an array to an object', function(done) {
				//Arrange
				var actualValue = {};
				var expectedValue = [];
				var expectedResult = {
					match: false,
					diffs: [{
						property: "Object Type",
						actual: "[object Object]",
						expected: "[object Array]"
					}]
				};

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				assert(_.isEqual(expectedResult, result), "Expected result does not match, got " + JSON.stringify(result));
				done();
			});

			it('should return true for two same object arrays', function(done) {
				//Arrange
				var actualValue = [{"prop1": "val1"}, {"prop2": "val2"}];
				var expectedValue = [{"prop1": "val1"}, {"prop2": "val2"}];
				var expectedResult = { match: true };

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				assert(_.isEqual(expectedResult, result), "Expected result does not match, got " + JSON.stringify(result));
				done();
			});


			it('should return false for two different object arrays', function(done) {
				//Arrange
				var actualValue = [{"prop1": "val1"}, {"prop2": "val2"}];
				var expectedValue = [{"prop3": "val3"}, {"prop4": "val4"}];
				var expectedResult = {
					match: false,
					diffs: [{
						property: "Array no-match",
						indicies: [0,1]
					}]
				}

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				assert(_.isEqual(expectedResult, result), "Expected result does not match, got " + JSON.stringify(result));
				done();
			});

			it('should return true for two same object arrays with different ordering', function(done) {
				//Arrange
				var actualValue = [{"prop1": "val1"}, {"prop2": "val2"}];
				var expectedValue = [{"prop2": "val2"}, {"prop1": "val1"}];
				var expectedResult = { match: true };

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				assert(_.isEqual(expectedResult, result), "Expected result does not match, got " + JSON.stringify(result));
				done();
			});

			it('should return false and the unmatched indicies when an element does not match', function(done) {
				//Arrange
				var actualValue = [{"prop1": "val1"}, {"prop2": "val2"}, {"prop3": "val3"}];
				var expectedValue = [{"prop1": "val1"}, {"prop4": "val4"}, {"prop7": "val7"}];
				var expectedResult = {
					match:false,
					diffs:[{
						property: "Array no-match",
						indicies: [1,2]
					}]
				};

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				assert(_.isEqual(result, expectedResult), "Results do not match, got " + JSON.stringify(result));
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
				var expectedResult = { match: true };

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				assert(_.isEqual(result, expectedResult), "Results do not match, got " + JSON.stringify(result));
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
				var expectedResult = { match: true };

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				assert(_.isEqual(result, expectedResult), "Results do not match, got " + JSON.stringify(result));
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
				var expectedResult = {
					match: false,
					diffs: [{
						property: "prop2",
						expected: "val2",
						actual: "val3"
					}]
				};

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				assert(_.isEqual(result, expectedResult), "Results do not match, got " + JSON.stringify(result));
				done();
			});

			it('should return false if one value in an embedded object is not equal', function(done) {
				//Arrange
				var actualValue = {
					"prop1": {
						"name": "test"
					},
					"prop2": "val3"
				};
				var expectedValue = {
					"prop1": {
						"name": "test2"
					},
					"prop2": "val2"
				};
				var expectedResult = {
					"match":false,
					"diffs":[{
						"actual":"test",
						"expected":"test2",
						"property":"prop1/name"
					}]
				};

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				assert(_.isEqual(expectedResult, result), "Result does not match expected, got " + JSON.stringify(result));
				done();
			});

			it('should return false if one value in an object does not exist in result', function(done) {
				//Arrange
				var actualValue = {
					"prop1": {
						"name1": "test"
					},
					"prop2": "val3"
				};
				var expectedValue = {
					"prop1": {
						"name2": "test"
					},
					"prop2": "val2"
				};
				var expectedResult = {
					"match":false,
					"diffs":[{
						"expected": "test",
						"actual": undefined,
						"property": "prop1/name2"
					}]
				};

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				assert(_.isEqual(expectedResult, result), "Result does not match expected, got " + JSON.stringify(result));
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
				var expectedResult = { match: true };

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				assert(_.isEqual(expectedResult, result), "Result does not match expected, got " + JSON.stringify(result));
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
				var expectedResult = {
					match: false,
  					diffs: [{
  						property: 'prop1/$gt',
  						actual: 5,
  						expected: 6
  					}]
  				};

				//Act
				var result = comparer.areEqual(actualValue, expectedValue);

				//Assert
				assert(_.isEqual(expectedResult, result), "Result does not match expected, got " + JSON.stringify(result));
				done();
			});

			it('should throw an error if it cannot find an embedded comparator', function(done) {
				//Arrange
				var actualValue = {
					"prop1": 5,
					"prop2": 5
				};
				var expectedValue = {
					"prop1": {"$missingComparator": 6},
					"prop2": {"$lt": 6}
				};
				var expectedResult = {
					match: false,
  					diffs: [{
  						property: 'prop1/$gt',
  						actual: 5,
  						expected: 6
  					}]
  				};

				var errMsg = '';

				//Act and Assert
				try {
					comparer.areEqual(actualValue, expectedValue);
				}
				catch(err) {
					errMsg = err.message
				}

				assert.equal(errMsg, "Unable to find a comparator or extractor implementation for '$missingComparator'");
				done();
			});

		});


	});


});
