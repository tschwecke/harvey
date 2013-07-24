 
module.exports = {

	getAction: function(actionName, actionDetails) {
		//Strip out any dollar sign from the name of the action
		actionName = actionName.replace('$', '');

		try {
			var Action = require('./' + actionName + 'Action.js');
		}
		catch(error) {
			throw new Error('Unable to find an implementation for action \'' + actionName + '\'');
		}
		
		return new Action(actionDetails);
	}

};