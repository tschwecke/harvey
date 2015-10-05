var assert = require('assert'),
	rewire = require('rewire'),
	sinon = require('sinon'),
	color = require('cli-color'),
	cliUtils = rewire('../../lib/util/cli.js'),
	errorStub = sinon.stub(),
	exitStub = sinon.stub(),
	globSyncStub = sinon.stub();

cliUtils.__set__({
	console: {
		error: errorStub
	},
	process: {
		exit: exitStub
	},
	glob: {
		sync: globSyncStub
	}
});

describe('cli', function() {

	afterEach(function() {
		errorStub.reset();
		exitStub.reset();
		globSyncStub.reset();
	});

	describe('fail()', function() {
		
		it('should log a message to the console and exit the process with an error code', function() {
			//Arrange
			var errorMsg = 'test message';

			//Act
			cliUtils.fail(errorMsg);

			//Assert
			assert(errorStub.calledWithExactly(color.red(errorMsg)));
			assert(exitStub.calledWithExactly(1));
		});

		it('should log a stack trace to the console if debug parameter is true and exit the process with an error code', function() {
			//Arrange
			var errorMsg = 'test message';

			//Act
			cliUtils.fail(errorMsg, true);

			//Assert
			assert(errorStub.calledWithMatch(new RegExp('Error: ' + errorMsg + '\n +?at ')));
			assert(exitStub.calledWithExactly(1));
		});

	});

	describe('parseTimeout()', function() {
		
		it('should parse a valid number string in to a number', function() {
			//Arrange
			var timeoutStr = '100';
			var expectedValue = 100;

			//Act
			var actualValue = cliUtils.parseTimeout(timeoutStr);

			//Assert
			assert.strictEqual(actualValue, expectedValue);
		});

		it('should return undefined if the string is empty', function() {
			//Arrange
			var timeoutStr = '';
			var expectedValue = undefined;

			//Act
			var actualValue = cliUtils.parseTimeout(timeoutStr);

			//Assert
			assert.strictEqual(actualValue, expectedValue);
		});

		it('should log an error message and exit the process if the string is not a valid number', function() {
			//Arrange
			var timeoutStr = 'fnord';
			var expectedErrorMessage = 'Invalid request timeout value "'+ timeoutStr + '".'

			//Act
			var actualValue = cliUtils.parseTimeout(timeoutStr);

			//Assert
			assert(errorStub.calledWithExactly(color.red(expectedErrorMessage)));
			assert(exitStub.calledWithExactly(1));
		});
		
	});

	describe('getTestSuiteFiles()', function() {
		
		it('should return a list of files found', function() {
			//Arrange
			var foundFiles = ['someFile.json'];
			globSyncStub = sinon.stub().returns(foundFiles);
			cliUtils.__set__({
				glob: {
					sync: globSyncStub
				}
			});

			//Act
			var files = cliUtils.getTestSuiteFiles(['*']);

			//Assert
			assert.deepEqual(files, foundFiles);
			assert(globSyncStub.calledOnce);
		});

		it('should log an error and exit the process if a non-json file is found', function() {
			//Arrange
			var foundFiles = ['someFile.txt'];
			var expectedErrorMessage = 'Invalid test suite file "' + foundFiles[0] + '". Test suites must be defined in a JSON file.';
			globSyncStub = sinon.stub().returns(foundFiles);
			cliUtils.__set__({
				glob: {
					sync: globSyncStub
				}
			});

			//Act
			var files = cliUtils.getTestSuiteFiles(['*']);

			//Assert
			assert(errorStub.calledWithExactly(color.red(expectedErrorMessage)));
			assert(exitStub.calledWithExactly(1));
		});

		it('should log an error and exit the process if no files are passed in', function() {
			//Arrange
			var expectedErrorMessage = 'No test suite files were specified';

			//Act
			var files = cliUtils.getTestSuiteFiles([]);

			//Assert
			assert(errorStub.calledWithExactly(color.red(expectedErrorMessage)));
			assert(exitStub.calledWithExactly(1));
		});

		it('should log an error and exit the process if no filed are found', function() {
			//Arrange
			var foundFiles = [];
			var expectedErrorMessage = 'No test suite files found';
			globSyncStub = sinon.stub().returns(foundFiles);
			cliUtils.__set__({
				glob: {
					sync: globSyncStub
				}
			});

			//Act
			var files = cliUtils.getTestSuiteFiles(['*']);

			//Assert
			assert(errorStub.calledWithExactly(color.red(expectedErrorMessage)));
			assert(exitStub.calledWithExactly(1));
		});

	});

	describe('parseActionPaths()', function() {
		
		it('should return a list of objects containing the name and location of the actions found', function() {
			//Arrange
			var expectedValue = [{ name: 'some', location: 'someAction.js' }, { name: 'someOther', location: 'a/path/to/someOtherAction.js' }];
			globSyncStub = sinon.stub().returns(['a/path/to/someOtherAction.js']);
			cliUtils.__set__({
				glob: {
					sync: globSyncStub
				}
			});

			//Act
			var files = cliUtils.parseActionPaths('someAction.js,a/path/to/actions/');

			//Assert
			assert.deepEqual(files, expectedValue);
			assert(globSyncStub.calledOnce);
		});

	});

});
