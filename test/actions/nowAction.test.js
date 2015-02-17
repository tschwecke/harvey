var assert = require('assert'),
	_ = require('underscore'),
	nowAction = require('../../lib/actions/nowAction.js');

describe('dateAction', function() {

	it('should generate a timestamp for now', function(done) {
		//Arrange
		var nowInfo = {};
		var variables = {};
		var parseValueFn = function(a) { return a; };


		//Act
		var date = nowAction(nowInfo, variables, parseValueFn);
		var newDate = new Date().getTime();
		var diff = date - newDate;

		//Assert
		assert(_.isNumber(date));
		assert(diff < 100);
		done();
	});

	it('should generate a timestamp for now in UTC', function(done) {
		//Arrange
		var nowInfo = {
			inUTC: true
		};
		var variables = {};
		var parseValueFn = function(a) { return a; };

		//Act
		var date = nowAction(nowInfo, variables, parseValueFn);
		var newDate = new Date();
		newDate = new Date(newDate.getTime() - (newDate.getTimezoneOffset() * 60000)).getTime();
		var diff = date - newDate;

		//Assert
		assert(_.isNumber(date));
		assert(diff < 100);
		done();
	});

	it('should generate a timestamp for now - ISO formatted', function(done) {
		//Arrange
		var nowInfo = {
			toISOString: true
		};
		var variables = {};
		var parseValueFn = function(a) { return a; };

		//Act
		var date = nowAction(nowInfo, variables, parseValueFn);

		//Assert
		assert(_.isString(date));
		assert(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-](\d{4})?/.test(date));
		done();
	});

	it('should generate a timestamp for now in UTC - ISO formatted', function(done) {
		//Arrange
		var nowInfo = {
			toISOString: true,
			inUTC: true
		};
		var variables = {};
		var parseValueFn = function(a) { return a; };

		//Act
		var date = nowAction(nowInfo, variables, parseValueFn);

		//Assert
		assert(_.isString(date));
		assert(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/.test(date));
		done();
	});

});
 
