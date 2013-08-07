var _ = require('underscore');
var actionPlugins = [];

module.exports = {

	addAction: function(name, location) {
		actionPlugins.push({
			"name": name,
			"location": location
		});
	},

	getAction: function(actionName, actionDetails, parseValue) {
		var actionLocation;

		//Strip out any dollar sign from the name of the action
		actionName = actionName.replace('$', '');

		//See if this action was supplied via a plugin
		var actionPlugin = _.findWhere(actionPlugins, {"name": actionName});
		if(actionPlugin) {
			actionLocation = actionPlugin.location;
		}
		else {
			//If the action wasn't provided in a plugin, assume that it is a built-in plugin
			actionLocation = './' + actionName + 'Action.js';
		}

		try {
			var Action = require(actionLocation);
		}
		catch(error) {
			throw new Error('Unable to find an implementation for action \'' + actionName + '\'. Tried looking at \'' + actionLocation + '\'');
		}
		
		return new Action(actionDetails, parseValue);
	}

};