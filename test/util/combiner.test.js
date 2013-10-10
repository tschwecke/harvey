var assert = require('assert'),
	//_ = require('underscore'),
	Combiner = require('../../lib/util/combiner.js');


var testFull = {
	"requestTemplates": [{
		"id": "t1.req1"

	}, {
		"id": "t1.req2",
		"what": "ever"
	}],
	"responseTemplates": [{
		"id": "t1.res1"
	}],
	"setupAndTeardowns": [{
		"id": "t1.updown1"
	}],
	"suiteSetup": [{
		"id": "t1.suiteup1"
	}],
	"suiteTeardown": [{
		"id": "t1.suitedown1"
	}],
	"tests": [{
		"id": "t1.test1"
	}]
};

var testFull2 = {
	"requestTemplates": [{
		"id": "t2.req1"
	}],
	"responseTemplates": [{
		"id": "t2.res1"
	}],
	"setupAndTeardowns": [{
		"id": "t2.updown1"
	}],
	"suiteSetup": [{
		"id": "t2.suiteup1"
	}],
	"suiteTeardown": [{
		"id": "t2.suitedown1"
	}],
	"tests": [{
		"id": "t2.test1"
	}, {
		"id": "t2.test2",
		"blah": "asdf"
	}]
};

var testFull3 = {
	"requestTemplates": [{
		"id": "t3.req1",
		"asdf": "asdf"
	}]
};


var combinedData = {
	requestTemplates: [{
		id: 't1.req1'
	}, {
		id: 't1.req2',
		what: 'ever'
	}, {
		id: 't2.req1'
	}, {
		id: 't3.req1',
		asdf: 'asdf'
	}],
	responseTemplates: [{
		id: 't1.res1'
	}, {
		id: 't2.res1'
	}],
	setupAndTeardowns: [{
		id: 't1.updown1'
	}, {
		id: 't2.updown1'
	}],
	suiteSetup: [{
		id: 't1.suiteup1'
	}, {
		id: 't2.suiteup1'
	}],
	suiteTeardown: [{
		id: 't1.suitedown1'
	}, {
		id: 't2.suitedown1'
	}],
	tests: [{
		id: 't1.test1'
	}, {
		id: 't2.test1'
	}, {
		id: 't2.test2',
		blah: 'asdf'
	}]
};

describe('combiner', function() {
	describe('combineDatas()', function() {
		it('should return an object with combined data of all inputs', function(done) {
			var combiner = new Combiner();
			//Act
			var data = combiner.combineDatas(testFull, testFull2, testFull3);
			//Assert
			assert.deepEqual(data, combinedData)
			done();
		});


		it('should combine an array of strings', function() {
			var combiner = new Combiner();
			var emptyTestData = {};
			var nonEmptyTestData = { suiteSetup: [ 'apple', 'baloney', 'catdog' ] };
			var product = combiner.combineDatas(emptyTestData, nonEmptyTestData);
			assert.deepEqual(product.suiteSetup, nonEmptyTestData.suiteSetup);
		});
	});
});
