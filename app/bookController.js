var Hapi = require('hapi');
var uuid = require('node-uuid');
var Cache = require('eidetic');
var options = {
    maxSize: 1000,
    canPutWhenFull: true
};
var cache = new Cache(options);

module.exports = {
	"addRoutes": function(server) {
		server.route({ 
			method: 'GET', 
			path: '/books/{id}', 
			handler: function(req, resp) {
				var id = req.params.id;

				var obj = cache.get(id);

				if(!obj) {
					this.reply(Hapi.error.notFound());
					return;
				}

				console.log('Cache returned: ' + JSON.stringify(obj));
				this.reply(obj);
			}
		});

		server.route({ 
			method: 'POST', 
			path: '/books', 
			config: { payload: "parse"},
			handler: function(req, resp) {
				var id = uuid.v4();
				var obj = req.payload;
				obj.id = id;

				cache.put(id, obj, 1800, true);

				console.log('Stored \'' + id + '\': ' + JSON.stringify(obj));
				this.reply().created('/books/' + id);
			}
		});

		server.route({ 
			method: 'PUT', 
			path: '/books/{id}', 
			config: { payload: "parse"},
			handler: function(req, resp) {
				var urlId = req.params.id;
				var obj = req.payload;
				if(obj.id !== urlId) {
					this.reply(Hapi.error.badRequest('The id specified in the resource does not match the id in the uri'));
					return;
				}

				if(!cache.get(urlId)) {
					this.reply(Hapi.error.notFound());
					return;
				}

				cache.put(urlId, obj, 1800, true);

				console.log('Stored \'' + urlId + '\': ' + JSON.stringify(obj));
				this.reply();
			}
		});

		server.route({ 
			method: 'DELETE', 
			path: '/books/{id}', 
			handler: function(req, resp) {
				var id = req.params.id;

				if(!cache.get(id)) {
					this.reply(Hapi.error.notFound());
					console.log('DELETE returning a 404');
					return;
				}

				cache.del(id);

				console.log('Deleted \'' + id);
				this.reply();
			}
		});


	}
}