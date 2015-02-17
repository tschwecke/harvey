module.exports = function(actionInfo, variables, parseValueFn) {
	var randomValue = null;

	if(actionInfo.type === "number") {
		var min = actionInfo.min;
		var max = actionInfo.max;
		
		randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
	}
	else if(actionInfo.type === "guid") {
		randomValue = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});
	}
	else if(actionInfo.type === "string") {
		randomValue = '';
		var possible = actionInfo.characters || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for(var i = 0; i < actionInfo.length; i++) {
			randomValue += possible.charAt(Math.floor(Math.random() * possible.length));
		}
	}

	return randomValue;
};
