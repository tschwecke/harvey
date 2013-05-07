 
module.exports = {
	
	formatRequest: function(req) {
		var formatted = req.method + ' ' + req.uri + ' HTTP 1.1\n';
		
		for(var headerName in req.headers) {
				formatted += headerName + ': ' + req.headers[headerName] + '\n';
		}

		return formatted;
	},
	
	formatResponse: function(resp) {
		var formatted = 'HTTP/' + resp.httpVersion + ' ' + resp.statusCode + '\n';

		for(var headerName in resp.headers) {
				formatted += headerName + ': ' + resp.headers[headerName] + '\n';
		}

		return formatted;
	}
};