var assert = require('assert'),
	_ = require('underscore'),
	util = require('../../lib/util/util.js'),
	removeAction = require('../../lib/actions/removeAction.js');

describe('removeAction', function() {

	it('should return undefined', function(done) {
		//Arrange
		var variables = {};
		var parseValueFn = function(a) { return a; };

		//Act
		var returnedValue = removeAction({}, variables, parseValueFn);

		//Assert
		assert(_.isUndefined(returnedValue));
		done();
	});

});

 
