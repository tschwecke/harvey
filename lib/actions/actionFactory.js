 
module.exports = {

	getAction: function(actionName, actionDetails) {
		//Strip out any dollar sign from the name of the action
		actionName = actionName.replace('$', '');
		var Action = require('./' + actionName + 'Action.js');

		return new Action(actionDetails);
	}

};