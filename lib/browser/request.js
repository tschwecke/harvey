
module.exports = function(options, callback) {

	var response = {
		"statusCode": null,
		"headers": {},
		"body": null
	};

	var onReadyStateChange = function() {
		if (xmlhttp.readyState==4 && xmlhttp.status > 0)
		{
			response.statusCode = xmlhttp.status + '';
			response.body = xmlhttp.response;
			var headers = xmlhttp.getAllResponseHeaders().split('\n');

			for(var i=0; i<headers.length; i++) {
				var headerParts = headers[i].split(': ');
				response.headers[headerParts[0]] = headerParts[1];
			}

			callback(null, response, response.body);
		}
	};

	try {
		var xmlhttp=new XMLHttpRequest();

		xmlhttp.onreadystatechange = onReadyStateChange;

		if(options.headers) {
			for(var headerName in options.headers) {
				xmlhttp.setRequestHeader(headerName, options.headers[headerName]);
			}
		}

		xmlhttp.open(options.method, options.uri, true);
		xmlhttp.send();
	}
	catch(error) {
		callback(error);
	}

}; 
