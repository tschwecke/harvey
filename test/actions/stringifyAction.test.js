var assert = require('assert'),
	_ = require('underscore'),
	util = require('../../lib/util/util.js'),
	stringifyAction = require('../../lib/actions/stringifyAction.js');

describe('stringifyAction', function() {

	it('should convert an object to a string', function(done) {
		//Arrange
		var stringifyInfo = {
			"prop1": "val1",
			"prop2": "val2"
		};
		var variables = {};
		var parseValueFn = function(a) { return a; };

		//Act
		var stringifiedValue = stringifyAction(stringifyInfo, variables, parseValueFn);

		//Assert
		assert(_.isString(stringifiedValue));
		assert.equal('{"prop1":"val1","prop2":"val2"}', stringifiedValue);
		done();
	});

});

 
