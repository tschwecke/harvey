# Actions

Actions are property names that begin with "$", and can be used within any part of the test life cycle. The following actions are available:

* ```set``` - sets a variable to the specified value
* ```replace``` - does a string regex replacement on a specified value
* ```extract``` - extracts a value from the response object using dot notation
* ```random``` - generates a random number between values

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
						"replacement": "$1"
					}
				}
			}
		}]
	}

The above example is equivalent to executing the following JavaScript code:

```javascript
var userId = 'users/12345'.replace(new RegExp('^users/(.*)$'), '$1');
```

The ```value``` field could also reference a variable or another action.

### Extract Action

The extract action can be used to parse out values from the response headers or body using dot notation. For example:

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

The random action can be used to generate a random number between two numbers. For example:

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

This can be useful for generating random data to be passed to an end point.