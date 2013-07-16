![Harvey](https://github.com/tschwecke/harvey/blob/master/resources/Harvey_logo.png?raw=true)
----------
Harvey is an Http Endpoint Result Validation Engine, or HERVE. Hervé is a common French name, but since nobody would know how to pronounce it I went with the English equivalent, Harvey. While originally intended to make testing REST service endpoints easier, Harvey can be used to validate any Http endpoint.

Principles
----------
- You should be able to test simple Http endpoints without writing code. You can write tests for java code in java, you can write tests for C# in C#, so you should be able to write tests for Http endpoints just with knowledge of http and no other programming language.
- All tests should be isolated and not rely on the side effects from a previous test to execute correctly.
- Tests should not rely on data setup that happens external to the tests.
- Tests should be able to be run in parallel.

Installation
------------
Install with npm:
    
    $ npm install -g harvey

[![NPM](https://nodei.co/npm/harvey.png?downloads=true&stars=true)](https://nodei.co/npm/harvey/)

Authoring
---------
Harvey expects tests to be written in json, and the details are given below.  If you would prefer a UI for authoring your tests, check out the [Harvey Chrome App](https://github.com/tschwecke/harvey-chrome-app) which can be installed into Chrome from [here](https://chrome.google.com/webstore/detail/harvey/feajdnjnjfdjlmohkkemlanohcelmbga).

What a Test Looks Like
----------------------

Tests are represented in json.  Here is what a very simple test looks like:

	{
		"id": "google_index_page",
		"request": {
			"method": "GET",
			"protocol": "http",
			"host": "www.google.com",
			"resource": "/index.html"
		},
		"expectedResponse": {
			"statusCode": 200
		}
	}


Request and Response Templates
------------------------------

Harvey supports the use of templates in order to achieve reusability across tests. A template can specify parts of a request or response and can be used across multiple tests.  For example, if we define the following request template:

	{
		"id": "standard_google_get",
		"method": "GET",
		"protocol": "http",
		"host": "www.google.com"
	}
	
then we can rewrite our original sample test to make use of the template:

	{
		"id": "google_index_page",
		"request": {
			"templates": ["standard_google_get"],
			"resource": "/index.html"
		},
		"expectedResponse": {
			"statusCode": 200
		}
	}
	
Multiple templates can be listed for each test.  When this is done, if two templates set the same property, the second one will overwrite the first one.  Likewise, any properties set by the test itself will overwrite the same properties set by the templates being used.

Request and Response Headers
---------------
Headers can easily be included in the request, or listed as expectations in the response.  Here is our example modified to explicitly request html from the server, and also to verify that that is what we got back:


	{
		"id": "google_index_page",
		"request": {
			"method": "GET",
			"protocol": "http",
			"host": "www.google.com",
			"resource": "/index.html"
			"headers: {
				"Content-Type": "text/html"
			}
		},
		"expectedResponse": {
			"statusCode": 200,
			"headers": {
				"Content-Type": "text/html"
			}
		}
	}

Request Body
------------
The values of most fields are used as-is in the request that is made.  However, to make tests a little easier to write, Harvey allows you to take a few shortcuts when it comes to the request body.  If the request has a Content-Type header with a value of application/x-www-form-urlencoded, instead of going to the trouble of constructing the url-encoded string itself you can set the body to a json object and it will properly encode the values for you.  If content type is set to application/json you can set the body directly to a json object.  For all other content types a string should be provided.  Here is an example of a request passing form data:

	{
		"id": "auth_token",
		"request": {
			"method": "POST",
			"protocol": "http",
			"host": "m-api.ecollege.com",
			"resource": "/token",
			"headers": {
				"content-type": "application/x-www-form-urlencoded"
			},
			"body": {
				"grant_type": "password",
				"client_id": "abcdef12-7c9e-4166-a6da-36c4ff53fc4c",
				"username": "myuser",
				"password": "mypassword"
			}
		},
		"expectedResponse": {
			"statusCode": 200
		}
	}

Testing the Response
--------------------
In order to test that the request was successful, you set expectations on what the response should look like.  This includes the status code, the response headers, the response body, and the overall response time.  If the response doesn't match the expectations then the test fails. As with the request body, if there is a Content-Type header on the response with a value of application/json, then the response body is automatically parsed into a json object for you and can be treated as such in the expectation you set.  Here is an example validating the response of a request to get a specific book:

	{
		"id": "item_get",
		"request": {
			"method": "GET",
			"protocol": "http",
			"host": "www.harveybooks.com",
			"resource": "/books/123.json"
		},
		"expectedResponse": {
			"statusCode": 200,
			"headers": {
				"Content-Type": "application/json"
			},
			"body": {
				"id": 123,
				"title": "Harvey for Dummies",
				"author": {
					"firstName": "Harvey",
					"lastName": "Rabbit"
				}
			}
		}
	}

This works great for exact matches, but not so great otherwise.  What if a status code of 200 or 201 is acceptable?  What if you don't care what the title is, just that it exists?  To allow for flexibility in specifying matching criteria in the response, Harvey follows MongoDB's lead by making use of some of the Mongo Query Operators.  Here is our example rewritten:

	{
		"id": "item_get",
		"request": {
			"method": "GET",
			"protocol": "http",
			"host": "www.harveybooks.com",
			"resource": "/books/123.json"
		},
		"expectedResponse": {
			"statusCode": { "$in": [200, 201] },
			"headers": {
				"Content-Type": "application/json"
			},
			"body": {
				"id": 123,
				"title": { "$exists": true },
				"author": {
					"firstName": "Harvey",
					"lastName": "Rabbit"
				}
			},
			"responseTime": { "$lte": 100 }
		}
	}
	
Right now only a handful of the operators are supported but more will be added in the future.

Setups and Teardowns
--------------------
Harvey supports the common concepts of setups and teardowns that are run before and after your test, respectively. They look almost identical to tests in that they specify a request to make and expectations around the response so that you know if it succeeded or not.  A test can make use of a setup or teardown by including it in the setup or teardown array of the test.  The setups, test, and teardowns are all processed sequentially, and in Harvey nomenclature they are collectively known as the test steps.  Here is our example modified to call a setup that creates some test data and a teardown that removes it:

	{
		"id": "google_index_page",
		"setup": ["data_setup"],
		"request": {
			"method": "GET",
			"protocol": "http",
			"host": "www.google.com",
			"resource": "/index.html"
		},
		"expectedResponse": {
			"statusCode": 200
		},
		"teardown": ["data_removal"]
	}

Suite Setups and Teardowns
--------------------------
Harvey also supports setups and teardowns that are run only once. The suite setups are run before any test is run and the suite teardowns are run after all the tests have completed.

Variables
---------
A common scenario is to use a setup to obtain an authentication token that is needed for your test. The mechanism that Harvey provides for getting that token from the setup to your test is in a variable.  Variables are only scoped to the test parts of a single test, and are the only way to pass data between the test parts.  All values are parsed for variable substitution before being used, so using a variable is as easy as placing '${variable_name}' wherever the value needs to go.  Here is our example again, adding an authentication header with the token coming from a variable.

	{
		"id": "google_index_page",
		"setup": ["data_setup"],
		"request": {
			"method": "GET",
			"protocol": "http",
			"host": "www.google.com",
			"resource": "/index.html"
			"headers": {
				"X-Authorization": "Access_Token access_token=${myAccessToken}"
			}
		},
		"expectedResponse": {
			"statusCode": 200
		},
		"teardown": ["data_removal"]
	}

Actions
-------
The previous section on variables showed you how to use variables, but it didn't show you how to set them.  This is where actions come in.  Actions allow you to perform, well, an "action" on the results of a test step.  The curently available actions are:

* `$set`
* `$extract`
* `$replace`
* `$random`
* `$crypto`
* `$now`

And more may be added in the future.  See the README.md under the ./lib/actions directory for more detailed information about each action. Here is an example of setting a token variable:

	{
		"id": "auth_token",
		"request": {
			"method": "POST",
			"protocol": "http",
			"host": "m-api.ecollege.com",
			"resource": "/token",
			"headers": {
				"content-type": "application/x-www-form-urlencoded"
			},
			"body": {
				"grant_type": "password",
				"client_id": "abcdef12-7c9e-4166-a6da-36c4ff53fc4c",
				"username": "myuser",
				"password": "mypassword"
			}
		},
		"expectedResponse": {
			"statusCode": 200
		},
		"actions": [{
			"$set": {
				"myAccessToken": {
					"$extract": "body.access_token"
				},
				"expirationDate": {
					"$replace": {
						"value": {
							"$extract": body.access_token"
						},
						"regex": "^.*|(\\d{4}-\\d{2}\\d-\\d{2}).*$",
						"replacement": "$1"
					}
				}
			}
		}]
	}

As you can see from this example, different parts of the response can be accessed using dot notation via the extract action. More info on actions can be found [here](https://github.com/tschwecke/harvey/blob/master/lib/actions/README.md).

Test Configuration
------------------
Often you will want to configure your tests to behave differently without having to rewrite them. Harvey supports this through test configuration. When you execute the tests you tell Harvey which config to load. Once the config is loaded, all the properties can be accessed exactly like any other variable. Here is as example where ```google_hostname``` is defined in the config file:

	{
		"id": "google_index_page",
		"request": {
			"method": "GET",
			"protocol": "http",
			"host": "${google_hostname}",
			"resource": "/index.html"
		},
		"expectedResponse": {
			"statusCode": 200
		}
	}

Putting it all Together
-----------------------
Currently Harvey expects to receive a single json document that specifies everything it needs (except config): templates, setups, teardowns, and tests.  So far we've covered how to specify each of the individual pieces.  Here is how you put it all together:

	{
		"requestTemplates": [
			<< json for request templates goes here >>
		],
		"responseTemplates": [
			<< json for response templates goes here >>
		],
		"setupAndTeardowns":[
			<< json for setups and teardowns goes here >>
		],
		"suiteSetup": [
			<< json for suite setups goes here >>
		],
		"suiteTeardown": [
			<< json for suite teardowns goes here >>
		],
		"tests": [
			<< json for the tests goes here >>
		]
	}

Config should be stored in a separate json document.  Here is an example:

	{
		"m-api_hostname": "m-api.ecollege.com",
		"activitystreams_hostname": "activitystreams-api.ecollege.net"
	}

Running the Tests
-----------------
In order to run the tests you just need to execute `harvey` from the command line.  By default it will look for a tests.json file in the same directory and will not load any config.  The exit code from the process equals the number of tests that failed, so it will exit with 0 if all tests passed. For a more detailed output of the results see the Reporters section below. 

Command Line Options
--------------------
A few command line options are supported.  Using --help will get you the following list:

	$ harvey --help

	Usage: harvey [options]

	Options:

		-h, --help                          output usage information
	    -t, --testFile <path>               The path to the file containing the tests
	    -c, --configFile <path>             The path to the config file
	    -r, --reporter <console|json|none>  Which reporter to use for displaying the results

Reporters
---------
Which reporter you use will determine how the output from the tests are formatted.  If you don't specify one then the test results aren't displayed at all and the process exit code is the only indication of whether or not the tests passed.  Specifying 'console' will print the test results to the console in an easy to read format.  Specifying json will output a json document with the details from the tests.

License
=======
The MIT License (MIT) Copyright (c) 2013 Tim Schwecke

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
