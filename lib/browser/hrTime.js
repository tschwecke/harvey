module.exports = function(previousTime) {

	var timeInMilliseconds = window.performance.now();
	var timeInNanoseconds = Math.floor(timeInMilliseconds * 1e6);

	if(previousTime) {
		var previousTimeInNanoseconds = previousTime[0] * 1e9 + previousTime[1];
		var timeInNanoseconds = timeInNanoseconds - previousTimeInNanoseconds;
	}

	var seconds = Math.floor(timeInNanoseconds / 1e9);
	var nanoseconds = timeInNanoseconds - (seconds * 1e9);

	return [seconds, nanoseconds];
};