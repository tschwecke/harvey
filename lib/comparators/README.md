# Comparators

Comparators are used to compare the actual value in a response to an expected value in the test.  If the check in the comparator fails then the test will fail as well. The following comparators are available:

* ```contains``` - check for the existence of a supplied value in an array or string
* ```exists``` - check for the existence or absence of any value
* ```gt``` - check that the actual value is greater than a supplied value
* ```gte``` - check that the actual value is greater than or equal to a supplied value
* ```in``` - check that the actual value is one of several different expected values
* ```lt``` - check that the actual value is less than a supplied value
* ```lte``` - check that the actual value is less than or equal to a supplied value
* ```ne``` - check that the actual value is not equal to a supplied value
* ```regex``` - check that the actual value matches a supplied regular expression

You might notice that there is no equals comparator. That is because harvey checks for equality be default and no comparator is needed.

## Usage

### Contains Comparator

The contains comparator is used to test whether or not a supplied value is contained in an array or string in the response.  

Sample Test:

	{
		"id": ...
		"request": ...
		"expectedResponse": {
			"body": {
				"childIds": { "$contains": 9012 }
			}
		}
	}

Passing Response Body:

	{
		"id": 1234,
		"childIds: [5678, 9012, 3456]
	}

Failing Response Body:

	{
		"id": 1234,
		"childIds: [5678, 3456]
	}

### Exists Comparator

The exists comparator is used to test if a property exists in the response.  You can use it to assert that the property exists or that it does not exist.  The following test has an example of each. It asserts that the response body has a firstName property but does NOT have an age property.

Example Test:
	{
		"id": ...
		"request": ...
		"expectedResponse": {
			"body": {
				"firstName": { "$exists": true },
				"age": { "$exists": false}
			}
		}
	}

Passing Response Body:

	{
		"id": 1234,
		"firstName": "Harvey",
		"lastName": "Rocks"
	}

Failing Response Body:

	{
		"id": 1234,
		"firstName": "Harvey",
		"lastName": "Rocks",
		"age": 2
	}


### Greater-Than Comparator

The gt comparator simply checks that the actual value is greater than the supplied value.

Example Test:

	{
		"id": ...
		"request": ...
		"expectedResponse": {
			"body": {
				"quantity": { "$gt": 10 }
			}
		}
	}

Passing Response Body:

	{
		"id": 123,
		"productName": "laptop"
		"quantity": 12
	}

Failing Response Body:

	{
		"id": 123,
		"productName": "laptop"
		"quantity": 7
	}

### Greater-Than-Or-Equals Comparator

The gte comparator simply checks that the actual value is greater than or equal to the supplied value. 

Example Test:

	{
		"id": ...
		"request": ...
		"expectedResponse": {
			"body": {
				"quantity": { "$gte": 10 }
			}
		}
	}

Passing Response Body:

	{
		"id": 123,
		"productName": "laptop",
		"quantity": 10
	}

Failing Response Body:

	{
		"id": 123,
		"productName": "laptop",
		"quantity": 3
	}

### In Comparator

The in comparator simply checks that the actual value is one of several different supplied values. 

Example Test:

	{
		"id": ...
		"request": ...
		"expectedResponse": {
			"body": {
				"status": { "$in": ['in tranist', 'delivered'] }
			}
		}
	}

Passing Response Body:

	{
		"orderNumber": 123,
		"status": "delivered"
	}

Failing Response Body:

	{
		"orderNumber": 123,
		"status": "being packaged"
	}


### Less-Than Comparator

The lt comparator simply checks that the actual value is less than the supplied value. 

Example Test:

	{
		"id": ...
		"request": ...
		"expectedResponse": {
			"body": {
				"quantity": { "$lt": 15 }
			}
		}
	}

Passing Response Body:

	{
		"id": 123,
		"productName": "laptop"
		"quantity": 20
	}


Failing Response Body:

	{
		"id": 123,
		"productName": "laptop"
		"quantity": 15
	}

### Less-Than-Or-Equals Comparator

The lte comparator simply checks that the actual value is less than or equal to the supplied value. 

Example Test:

	{
		"id": ...
		"request": ...
		"expectedResponse": {
			"body": {
				"quantity": { "$lte": 15 }
			}
		}
	}

Passing Response Body:

	{
		"id": 123,
		"productName": "laptop"
		"quantity": 15
	}

Failing Response Body:

	{
		"id": 123,
		"productName": "laptop"
		"quantity": 23
	}

### Not-Equal Comparator

The ne comparator checks that the actual value is not equal to the supplied value. 

Example Test:

	{
		"id": ...
		"request": ...
		"expectedResponse": {
			"body": {
				"quantity": { "$ne": 15 }
			}
		}
	}

Passing Response Body:

	{
		"id": 123,
		"productName": "laptop"
		"quantity": 10
	}

Failing Response Body:

	{
		"id": 123,
		"productName": "laptop"
		"quantity": 15
	}


### Regular Expression Comparator

The regex comparator checks that the actual value matches a supplied regular expression. 

Example Test:

	{
		"id": ...
		"request": ...
		"expectedResponse": {
			"body": {
				"ssn": { "$regex": \d{3}-\d{2}-\d{4}" }
			}
		}
	}

Passing Response Body:

	{
		"id": 123,
		"firstName": "Harvey",
		"lastName": "Rocks",
		"ssn": "123-45-6789"
	}

Failing Response Body:

	{
		"id": 123,
		"firstName": "Harvey",
		"lastName": "Rocks",
		"ssn": "123456789"
	}
