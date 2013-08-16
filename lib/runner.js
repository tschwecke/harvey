var blanket = require('blanket')({
	"pattern": "app/",
	"data-cover-flags": {
		"branchTracking": true,
		"debug": true
	}
});

blanket.options("reporter", function(coverageInfo) {
	console.log('Firing reporter');
	console.log(JSON.stringify(coverageInfo, null, '\t'));

	console.log(JSON.stringify(_$jscoverage));
	console.log('Coverage:');
	var totalLines = 0;
	var totalCoveredLines = 0;
	for(var fileName in _$jscoverage) {
		var fileCoverage = _$jscoverage[fileName];

		var lines = 0;
		var coveredLines = 0;
		for(var lineNbr=1; lineNbr<fileCoverage.length; lineNbr++) {
			if(fileCoverage[lineNbr] != null) {
				lines++;

				if(fileCoverage[lineNbr] === 1) {
					coveredLines++;
				}
			}
		}

		totalLines += lines;
		totalCoveredLines += coveredLines;

		console.log(fileName + ': ' + parseInt(coveredLines * 100 / lines) + '%');
	}

	console.log('\nTotal: ' + parseInt(totalCoveredLines * 100 / totalLines) + '%\n\n');
});

blanket.setupCoverage();
blanket.onModuleStart();
blanket.onTestStart();

require('../app/server.js');

process.on('SIGTERM', function() {
  blanket.onTestDone();
  blanket.onTestsDone();

  process.exit();
});