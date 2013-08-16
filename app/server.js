console.log('loading server');

var Hapi = require('hapi');
var crypto = require('crypto');
var uuid = require('node-uuid');
var bookController = require('./bookController.js');
var port = process.env.PORT || "8080";
var server = new Hapi.Server('0.0.0.0', parseInt(port));


server.route({
	method: 'POST', 
	path: '/authToken',
	config: { payload: "parse"},
	handler: function(req, resp) {
		if(req.payload.password != 'abc123') {
			this.reply(Hapi.error.badRequest('Wrong username or password'));
			return;
		}

		var shasum = crypto.createHash('sha1');
		shasum.update(req.payload.userName);
		var token = shasum.digest('hex');

		this.reply({"token": token})
	}
});

bookController.addRoutes(server);

server.start(function() {
	console.log('Server started');
});

