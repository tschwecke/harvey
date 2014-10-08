var _ = require('underscore'),
	path = require('path'),
	glob = require('glob'),
	loadJson = require('./util/loadJson.js'),
	deepExtend = require('deep-extend');

module.exports = function() {

	var importTestSuites = function(testSuiteData) {
		if(testSuiteData.hasOwnProperty('imports')) {
			var importFiles = [];
			testSuiteData.imports.forEach(function(fileObj) {
				if (!_.isObject(fileObj) || !fileObj.file) {
					throw new Error('the "imports" collection should contain objects with a "file" property.');
				}
				var importLoc = fileObj.file;
				// if the "file" property exists, then let's resolve the imports relative to that file,
				// otherwise resolve the imports relative to where harvey is running from
				if(testSuiteData.file) {
					importLoc = path.resolve(path.dirname(testSuiteData.file), importLoc);
				}
				glob.sync(importLoc).forEach(function(file) {
					if (path.extname(file) !== '.json') {
						throw new Error('Invalid import file "' + file + '". Imports must be defined in a JSON file.');
					}
					var importedData = _.clone(loadJson(file), false);
					var findConflictingId = function(arr1, arr2) {
						arr1.forEach(function(item1) {
							arr2.forEach(function(item2) {
								if (item1.id === item2.id) {
									return item1.id;
								}
							});
						});
						return null;
					};
					if(importedData) {
						if(importedData.requestTemplates) {
							testSuiteData.requestTemplates = testSuiteData.requestTemplates || [];
							var conflictingId = findConflictingId(testSuiteData.requestTemplates, importedData.requestTemplates);
							if(conflictingId) {
								throw new Error('While importing "' + file + '", a request template was found to have the same ID as an existing request template: ' + conflictingId + '. Please resolve this conflict.')
							}
							else {
								testSuiteData.requestTemplates = testSuiteData.requestTemplates.concat(importedData.requestTemplates);
							}
						}
						if(importedData.responseTemplates) {
							testSuiteData.responseTemplates = testSuiteData.responseTemplates || [];
							conflictingId = findConflictingId(testSuiteData.responseTemplates, importedData.responseTemplates);
							if(conflictingId) {
								throw new Error('While importing "' + file + '", a response template was found to have the same ID as an existing response template: ' + conflictingId + '. Please resolve this conflict.')
							}
							else {
								testSuiteData.responseTemplates = testSuiteData.responseTemplates.concat(importedData.responseTemplates);
							}
						}
						if(importedData.setupAndTeardowns) {
							testSuiteData.setupAndTeardowns = testSuiteData.setupAndTeardowns || [];
							conflictingId = findConflictingId(testSuiteData.setupAndTeardowns, importedData.setupAndTeardowns);
							if(conflictingId) {
								throw new Error('While importing "' + file + '", a setup or teardown was found to have the same ID as an existing setup or teardown template: ' + conflictingId + '. Please resolve this conflict.')
							}
							else {
								testSuiteData.setupAndTeardowns = testSuiteData.setupAndTeardowns.concat(importedData.setupAndTeardowns);
							}
						}
						if(importedData.config) {
							testSuiteData.config = testSuiteData.config || {};
							deepExtend(testSuiteData.config, importedData.config);
						}
					}
				});
			});
		}
	};


	this.import = function(fileNames) {
		if(!_.isArray(fileNames) || fileNames.length < 1) {
			throw new Error('Missing or invalid parameters: ' + fileNames);
		}

		var data = [],
			suiteIds = [];

		fileNames.forEach(function(fileName) {
			var absFileName = path.resolve(fileName),
				suite = loadJson(absFileName);

			if(suite) {
				suite.id = suite.id || fileName;
				suite.file = fileName;
				suite.name = suite.name || path.basename(fileName, '.json');

				if(suiteIds.indexOf(suite.id) >= 0) {
					var ex = new Error('More than one test suite has an ID of "' + suite.id + '". Test suite ID\'s must be unique');
					ex.fileName = fileName;
					throw ex;
				}

				// modify existing suite to include the "imports"
				try {
					importTestSuites(suite);
				} catch(ex) {
					ex.fileName = fileName;
					throw ex;
				}

				suiteIds.push(suite.id);
				data.push(suite);
			}
		});

		return data;

	};
}