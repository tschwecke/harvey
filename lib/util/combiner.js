module.exports = function() {
	var harveyParts = ["requestTemplates", "responseTemplates", "setupAndTeardowns", "suiteSetup", "suiteTeardown", "tests"];

	this.combineDatas = function() {
		var main, args = [];

		for (var i = 0; i < arguments.length; i++) {
			args.push(arguments[i]);
		}
		main = args.shift();
		//callback = args.pop();

		for (var x = 0; x < harveyParts.length; x++) {
			var part = main[harveyParts[x]] || [];
			for (var y = 0; y < args.length; y++) {
				var additionalPart = args[y][harveyParts[x]] || {};
				part = merge(part, additionalPart);
			}

			//add the part back to primary
			main[harveyParts[x]] = part;
		}
		return main;
	};

	function merge(one, two) {
		if (!one) {
			return one;
		}
		if (!two) {
			return two;
		}
		var final = one;
		// merge
		for (var i = 0; i < two.length; i++) {
			var item = two[i];
			insert(item, final);
		}
		return final;
	}

	// extracts and returns an identifying value from the item
	// ``item`` may be either:
	//	- an object with an `id` attribute, or
	//	- something else which has a unique ``toString()`` output
	function getItemId (item) {
		return item.id || item.toString();
	}

	// inserts item into obj (array)
	function insert(item, obj) {
		var data = obj;
		var insertIndex = data.length;
		for (var i = 0; i < data.length; i++) {
			if (getItemId(item) === getItemId(data[i])) {
				// ignore duplicates
				console.log('Duplicate data found with id: ', getItemId(item));
				insertIndex = -1;
				break;
			} else if (item.id < data[i].id) {
				insertIndex = i;
				break;
			}
		}
		if (insertIndex === data.length) {
			data.push(item);
		} else if (insertIndex !== -1) {
			data.splice(insertIndex, 0, item);
		}
	}

};
