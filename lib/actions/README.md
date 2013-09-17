# Actions

Actions are property names that begin with "$", and can be used within any part of the test life cycle. The following actions are available:

* ```set``` - sets a variable to the specified value
* ```replace``` - does a string regex replacement on a specified value
* ```extract``` - extracts a value from the response object using dot notation
* ```random``` - generates a random number between values
* ```crypto``` - generates a cipher or hash-based MAC
* ```now``` - generates a timestamp for the current time
* ```stringify``` - converts a JSON object into a string

## Usage

### Set Action

The set action can be used to set variables. Here's an example:

	{
		"id": ...
		"request": ...
		"expectedResponse": ...
		"actions": [{
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
		"actions": [{
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
		"actions": [{
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

### Replace Action

The replace action can be used to do regex replacements on string values and is usually used in conjunction with the set action and possibly even the extract action. Here's an example:

	{
		"id": ...
		"request": ...
		"expectedResponse": ...
		"actions": [{
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

### Extract Action

The extract action can be used to parse out values from the response headers or body using dot and array notation. For example:

	{
		"id": ...
		"request": ...
		"expectedResponse": ...
		"actions": [{
			"$set": {
				"token": {
					"$extract": "body.token"
				}
			}
		}]
	}

The test above assumes that the response body was in JSON format and contained an object that had a property called ```token```. The value of that property is then set to the variable ```token```.

### Random Action

The random action can be used to generate a random number between two numbers, a random string, or a random GUID string. For example:

	{
		"id": ...
		"request": ...
		"expectedResponse": ...
		"actions": [{
			"$set": {
				"userId": {
					"$random": {
						"type": "number",
						"min": 0,
						"max": 100
					}
				}
			}
		}]
	}

or:

	{
		"id": ...
		"request": ...
		"expectedResponse": ...
		"actions": [{
			"$set": {
				"userId": {
					"$random": {
						"type": "string",
						"length": 10
					}
				}
			}
		}]
	}

This can be useful for generating random data to be passed to an end point. Valid types are `string`, `number`, or `guid`.

### Crypto Action

The crypto action can be used to generate HMACs or CMACs. For example:

	{
		"id": ...
		"request": ...
		"expectedResponse": ...
		"actions": [{
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
		}]
	}

The example above sets the result of the generation of the HMAC to the variable "token". Valid macTypes are "HMAC" and "CMAC". Valid algorithms for HMACs can be found by running the following command `openssl list-message-digest-algorithms` (examples: "sha1", "md5" and "sha256"). Valid encodings for HMACs are "hex", "binary", and "base64".  The algorithm and encoding cannot be specified for CMACs and default to AES128 and hex, respectively.


### Now Action

The now action can be used to generate a timestamp for the current time. It will either generate a number that represents the number of milliseconds since Jan. 1st 1970, or an ISO 8601 formatted date string. For example:

	{
		"id": ...
		"request": ...
		"expectedResponse": ...
		"actions": [{
			"$set": {
				"timestamp": {
					"$now": {
						"inUTC": true,
						"toISOString": false
					}
				}
			}
		}]
	}

By default, the value returned by this action will be relative to the timezone that machine running harvey has set. To force the value to UTC, use the "inUTC" property.

### Stringify Action

The stringify action can be used to convert a JSON object into a string. For example:

	{
		"id": ...
		"request": ...
		"expectedResponse": ...
		"actions": [{
			"$set": {
				"bodyAsString": {
					"$stringify": {
						"$extract": "body"
					}
				}
			}
		}]
	}

### Base64 Action

The base64 action can be used to encode a string to base64. For example:

	{
		"id": ...,
		"request": ...
		"expectedResponse": ...
		"actions": [{
			"$set": {
				"base64.string": {
					"$base64": {
						"value": "Test"
					}
				}
			}
		}]
	}

	or:

	{
		"id": ...,
		"request": ...
		"expectedResponse": ...
		"actions": [{
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
		}]
	}








