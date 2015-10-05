var zSchema = require('z-schema');
var zschema = new zSchema();

module.exports = function(bodySchema, variables, testPart) {
	this.id = 'bodySchema';

	var report = zschema.validateSchema(bodySchema);
	if(!report.valid) {
		var errors = report.errors.join('; ');
		throw new Error('An invalid bodySchema was used in ' + testPart.id + ': ' + errors);
	}

	//Try to compile the schema before it is used. The schema could be used below before compileSchema calls the callback,
	//but until we make actions asynchronous this will have to do. If we do use an uncompiled schema we will just have a
	//warning written to the console.
	zschema.compileSchema(bodySchema, function (err, compiledSchema) {
		if(!err) {
			bodySchema = compiledSchema;
		}
	});

	this.validate = function(response) {

		var result = { id: 'bodySchema' };

		var report = zschema.validateWithCompiled(response.body, bodySchema);

		if(report.valid) {
			result.valid = true;
		}
		else {
			result.valid = false;

			var errors = '';
			for(var i=0; i<report.errors.length; i++) {
				errors += report.errors[i].message + '; ';
			}

			result.description = 'Body does not match the expected schema: ' + errors;
		}


		return result;
	}
} 
