var assert = require('assert'),
	_ = require('underscore'),
	extractorFactory = require('../../lib/extractors/extractorFactory.js'),
	path = require('path');

describe('extractorFactory', function() {

	describe('require()', function() {

		it('should return an object with the appropriate methods', function(done) {

			//Assert
			assert(extractorFactory);
			assert(_.isFunction(extractorFactory.getExtractorFunction));

			done();
		});
	});

	describe('getExtractorFunction()', function() {

		it('should return the appropriate extractor', function(done) {

			//Act
			var extractor = extractorFactory.getExtractorFunction('length');

			//Assert
			assert(extractor);

			done();
		});

		it('should return null for an unknown extractor', function(done) {

			//Act
			var extractor = extractorFactory.getExtractorFunction('foo');

			//Assert
			assert(extractor === null);

			done();
		});


	});

});