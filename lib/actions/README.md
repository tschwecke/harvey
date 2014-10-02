# Actions

Actions are property names that begin with "$", and can be used within any part of the test life cycle. They can be run before the request by placing with the 'preActions' property, or after the response is received with the 'postActions' property. The following actions are available:

* ```set``` - sets a variable to the specified value
* ```push``` - ensures a variable to be an Array and pushes the specified value into it
* ```replace``` - does a string regex replacement on a specified value
* ```random``` - generates a random number between values
* ```crypto``` - generates a cipher or hash-based MAC
* ```now``` - generates a timestamp for the current time
* ```stringify``` - converts a JSON object into a string
* ```base64``` - encodes a string to base64
* ```remove``` - returnes ```undefined``` to effectively remove the property being assigned to
* ```substitute``` - replaces the value that would have been assigned to the property with one that you provide

## Usage

### Set Action

The set action can be used to set variables. Here's an example:

	{
		"id": ...
		"request": ...
		"expectedResponse": ...
		"postActions": [{
			"$set": {
				"token": "abcdef1234567890"
			}
		}]
	}

Multiple values can also be set at the same time:

	{
		"id": ...
		"request": ...
		"expectedResponse": ...
		"postActions": [{
			"$set": {
				"token": "abcdef1234567890",
				"userName": "myuser"
			}
		}]
	}

The set action can also be used in combination with other actions:

	{
		"id": ...
		"request": ...
		"expectedResponse": ...
		"postActions": [{
			"$set": {
				"userId": {
					"$random": {
						"min": 0,
						"max": 100
					}
				}
			}
		}]
	}

All variables set in this manner can be accessed from other parts of the test using the following syntax:

	${<VAR_NAME>}

For example:

	${userId}

### Push Action

The push action can be used to create Array variables and add data to them. If the variable was not previously set or was set as a type other than an Array, then the push action will set it to an empty array before pushing the data into it. Here's an example:

	{
		"id": ...
		"request": ...
		"expectedResponse": ...
		"postActions": [{
			"$push": {
				"tokens": "abcdef1234567890"
			}
		}]
	}

Multiple Arrays can also be pushed to at the same time:

	{
		"id": ...
		"request": ...
		"expectedResponse": ...
		"postActions": [{
			"$push": {
				"tokens": "abcdef1234567890",
				"userNames": "myuser"
			}
		}]
	}

Multiple pieces of data and be pushed into an array:

	{
		"id": ...
		"request": ...
		"expectedResponse": ...
		"postActions": [{
			"$push": {
				"tokens": "abcdef1234567890"
			}
		}, {
			"$push": {
				"tokens": "qwertyuiop"
			}
		}]
	}

The push action can also be used in combination with other actions:

	{
		"id": ...
		"request": ...
		"expectedResponse": ...
		"postActions": [{
			"$push": {
				"userIds": {
					"$random": {
						"min": 0,
						"max": 100
					}
				}
			}
		}]
	}

All variables set in this manner can be accessed from other parts of the test using the following syntax:

	${<VAR_NAME>}

For example:

	${userId}

### Replace Action

The replace action can be used to do regex replacements on string values and is usually used in conjunction with the set action. Here's an example:

	{
		"id": ...
		"request": ...
		"expectedResponse": ...
		"postActions": [{
			"$set": {
				"userId": {
					"$replace": {
						"value": "users/12345",
						"regex": "^users/(.*)$",
						"flags": "i",
						"replacement": "$1"
					}
				}
			}
		}]
	}

The above example is equivalent to executing the following JavaScript code:

```javascript
var userId = 'users/12345'.replace(new RegExp('^users/(.*)$', 'i'), '$1');
```

The ```value``` field could also reference a variable or another action.

### Random Action

The random action can be used to generate a random number between two numbers, a random string, or a random GUID string. For example:

	{
		"id": ...
		"preActions": [{
			"$set": {
				"userId": {
					"$random": {
						"type": "number",
						"min": 0,
						"max": 100
					}
				}
			}
		}],
		"request": ...
		"expectedResponse": ...
	}

or:

	{
		"id": ...
		"preActions": [{
			"$set": {
				"userId": {
					"$random": {
						"type": "string",
						"length": 10,
						"characters": "abcdefghijklmnopqrstuvwxyz"
					}
				}
			}
		}],
		"request": ...
		"expectedResponse": ...
	}

This can be useful for generating random data to be passed to an end point. Valid types are `string`, `number`, or `guid`. When choosing type of `string`, you can optionall specify the set of characters to include in the random string. The default is all alpha-numeric characters.

### Crypto Action

The crypto action can be used to generate HMACs or CMACs. For example:

	{
		"id": ...
		"preActions": [{
			"$set": {
				"token": {
					"$crypto": {
						"macType": "HMAC",
						"algorithm": "sha1",
						"data": "myclient",
						"key": "a1c1f962-bc57-4109-8d49-bee9f562b321",
						"encoding": "hex"
					}
				}
			}
		}],
		"request": ...
		"expectedResponse": ...
	}

The example above sets the result of the generation of the HMAC to the variable "token". Valid macTypes are "HMAC" and "CMAC". Valid algorithms for HMACs can be found by running the following command `openssl list-message-digest-algorithms` (examples: "sha1", "md5" and "sha256"). Valid encodings for HMACs are "hex", "binary", and "base64".  The algorithm and encoding cannot be specified for CMACs and default to AES128 and hex, respectively.


### Now Action

The now action can be used to generate a timestamp for the current time. It will either generate a number that represents the number of milliseconds since Jan. 1st 1970, or an ISO 8601 formatted date string. For example:

	{
		"id": ...
		"preActions": [{
			"$set": {
				"timestamp": {
					"$now": {
						"inUTC": true,
						"toISOString": false
					}
				}
			}
		}],
		"request": ...
		"expectedResponse": ...
	}

By default, the value returned by this action will be relative to the timezone that machine running harvey has set. To force the value to UTC, use the "inUTC" property.

### Stringify Action

The stringify action can be used to convert a JSON object into a string. For example:

	{
		"id": ...
		"request": ...
		"expectedResponse": ...
		"postActions": [{
			"$set": {
				"bodyAsString": {
					"$stringify": "${response.body}"
				}
			}
		}]
	}

### Base64 Action

The base64 action can be used to encode a string to base64. For example:

	{
		"id": ...,
		"preActions": [{
			"$set": {
				"base64.string": {
					"$base64": {
						"value": "Test"
					}
				}
			}
		}],
		"request": ...
		"expectedResponse": ...
	}

or:

	{
		"id": ...,
		"preActions": [{
			"$set": {
				"base64.string": {
					"$base64": {
						"value": {
							"$random": {
								"type": "string",
								"length": 32
							}
						}
					}
				}
			}
		}],
		"request": ...
		"expectedResponse": ...
	}

### Remove Action

The remove action can be used to remove a property that was introduced by a template that you don't want included as part of the request. For example:

	{
		"id": ...,
		"request": {
			"templates": ["RequestWithUnnecessaryProperty"],
			"body": {
				"unnecessaryProperty": { "$remove": true }
			}
		}
		"expectedResponse": ...
	}

The value provided to the remove action is not used, but one must be provided.

### Substitute Action

The substitute action can be used to replace the value of a property that was introduced by a template to the value that you provide.  This is necessary since the default behavior for overriding complex property values (objects and arrays) is to mixin the new values instead of replace them. For example:

	{
		"requestTemplates": [{
			"id": "Foo",
			"method": "POST",
			"protocol": "http",
			"host": "www.google.com",
			"resource": "/index.html",
			"body": {
				"idList": [1,2,3]
			}
		}],
		"tests": [{
			"id": "SubstitutionExample",
			"request": {
				"templates": ["Foo"],
				"body": {
					"idList": { "$substitute": [] }
				}
			},
			"expectedResponse": {
				"statusCode": 200
			}
		}]
	}
