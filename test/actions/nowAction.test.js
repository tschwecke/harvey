var assert = require('assert'),
	_ = require('underscore'),
	NowAction = require('../../lib/actions/nowAction.js');

describe('dateAction', function() {

	describe('constructor()', function() {

		it('should return an object with a perform method', function(done) {

			//Act
			var action = new NowAction();

			//Assert
			assert(action);
			assert(_.isFunction(action.perform));

			done();
		});
	});

	describe('perform()', function() {

		it('should generate a timestamp for now', function(done) {
			//Arrange
			var nowInfo = {};

			var action = new NowAction(nowInfo);

			//Act
			var date = action.perform();
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

			var action = new NowAction(nowInfo);

			//Act
			var date = action.perform();
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

			var action = new NowAction(nowInfo);

			//Act
			var date = action.perform();
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

			var action = new NowAction(nowInfo);

			//Act
			var date = action.perform();
			//Assert
			assert(_.isString(date));
			assert(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/.test(date));
			done();
		});

	});

});
 
