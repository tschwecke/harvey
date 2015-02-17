var assert = require('assert'),
	_ = require('underscore'),
	base64Action = require('../../lib/actions/base64Action.js'),
	util = require('../../lib/util/util.js');

describe('base64Action', function() {

	it('should base64 encode a string', function(done) {

		var encodingInfo = {
			"value": "Test"
		};
		var variables = {};
		var parseValueFn = function(a) { return a; };

		//Act
		var replacedString = base64Action(encodingInfo, variables, parseValueFn);

		//Assert
		assert.equal(replacedString, 'VGVzdA==');
		done();
	});

	it('should base64 encode a string using variables', function(done) {

		var encodingInfo = {
			"value": "${str}"
		};

		var variables = {
			"str": "Test"
		}

		//Act
		var replacedString = base64Action(encodingInfo, variables, util.getParseValueFacade(variables));

		//Assert
		assert.equal(replacedString, 'VGVzdA==');
		done();
	});


});
