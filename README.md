![Harvey](https://github.com/tschwecke/harvey/blob/master/resources/Harvey_logo.png?raw=true)
----------
Harvey is a HTTP test runner that expresses HTTP requests and the expected responses in a simple, easy to understand JSON format.  Although Harvey can be used to validate any Http endpoint, it is particularly well suited for testing REST service endpoints.

Prerequisites
-------------
Since Harvey is a node.js application you'll need to have node installed.  You can get it [here](http://nodejs.org/download/).

Installation
------------
Install with npm:

    $ npm install -g harvey

[![NPM](https://nodei.co/npm/harvey.png?downloads=true&stars=true)](https://nodei.co/npm/harvey/)

Basic Use
------------
Running tests with Harvey is easy.  Here is a simple example:

    $ harvey path/to/testFile.json


What a Test Looks Like
----------------------

Tests are represented in json.  Here is what a very simple test looks like:

	{
		"tests": [{
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
		}]
	}


Request and Response Templates
------------------------------

Harvey supports the use of templates in order to achieve reusability across tests. A template can specify parts of a request or response and can be used across multiple tests.  For example, we can rewrite our original sample request to make use of a template:

	{
		"requestTemplates": [{
			"id": "standard_google_get",
			"method": "GET",
			"protocol": "http",
			"host": "www.google.com"
		}],
		"tests": [{
			"id": "google_index_page",
			"request": {
				"templates": ["standard_google_get"],
				"resource": "/index.html"
			},
			"expectedResponse": {
				"statusCode": 200
			}
		}]
	}


Multiple templates can be listed for each test.  When this is done, if two templates set the same property, the second one will overwrite the first one.  Likewise, any properties set by the test itself will overwrite the same properties set by the templates being used.  Templates can also be re-used across test files as well.  See the "Splitting Tests into Multiple Files" section below for more details.

Request and Response Headers
---------------
Headers can easily be included in the request, or listed as expectations in the response.  Here is our example modified to explicitly request html from the server, and also to verify that that is what we got back:


	{
		"tests": [{
			"id": "google_index_page",
			"request": {
				"method": "GET",
				"protocol": "http",
				"host": "www.google.com",
				"resource": "/index.html"
				"headers: {
					"Accept": "text/html"
				}
			},
			"expectedResponse": {
				"statusCode": 200,
				"headers": {
					"Content-Type": "text/html"
				}
			}
		}]
	}

Request Body
------------
The values of most fields are used as-is in the request that is made.  However, to make tests a little easier to write, Harvey allows you to take a few shortcuts when it comes to the request body.  If the request has a Content-Type header with a value of application/x-www-form-urlencoded, instead of going to the trouble of constructing the url-encoded string itself you can set the body to a json object and it will properly encode the values for you.  If content type is set to application/json you can set the body directly to a json object.  For all other content types a string should be provided.  Here is an example of a request passing form data:

	{
		"tests": [{
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
		}]
	}

Testing the Response
--------------------
In order to test that the request was successful, you set expectations on what the response should look like.  This includes the status code, the response headers, the response body, and the overall response time.  If the response doesn't match the expectations then the test fails. As with the request body, if there is a Content-Type header on the response with a value of application/json, then the response body is automatically parsed into a json object for you and can be treated as such in the expectation you set.  Here is an example validating the response of a request to get a specific book:

	{
		"tests": [{
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
		}]
	}

This works great for exact matches, but not so great otherwise.  What if a status code of 200 or 201 is acceptable?  What if you don't care what the title is, just that it exists?  To allow for flexibility in specifying matching criteria in the response, Harvey follows MongoDB's lead by making use of some of the Mongo Query Operators.  Here is our example rewritten:

	{
		"tests": [{
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
				}
			}
		}]
	}

The following operators are currently supported: $exists, $gt, $gte, $in, $contains, $length, $lt, $lte, $ne, and $regex.    You can see specific example for each of them [here](lib/comparators/README.md).

Harvey also supports the use of [JSONSchema](http://json-schema.org/) to validate that the response body conforms to the proper schema.  You simply specify the shema in the exptectedResponse.bodySchema property and the test will fail if the actual response body does not match the schema.  Here is an example:

	{
		"tests": [{
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
				"bodySchema": {
					"type": "object",
					"properties": {
						"id": {
							"type": "integer"
						},
						"title": {
							"type": "string"
						},
						"author": {
							"type": "object",
							"properties": {
								"firstName": {
									"type": "string"
								},
								"lastName": {
									"type": "string"
								}
							}
						}
					},
					"required": ["id", "title"]
				}
			}
		}]
	}


Setups and Teardowns
--------------------
Harvey supports the common concepts of setups and teardowns that are run before and after your test, respectively. They look almost identical to tests in that they specify a request to make and expectations around the response so that you know if it succeeded or not.  A test can make use of a setup or teardown by including it in the setup or teardown array of the test.  The setups, test, and teardowns are all processed sequentially, and in Harvey nomenclature they are collectively known as the test steps.  Here is our example modified to call a setup that creates some test data and a teardown that removes it:

	{
		"setupAndTeardowns": [{
			"id": "data_setup",
			"request": {
				"method": "PUT",
				"protocol": "http",
				"host": "www.foo.com",
				"resource": "/bar",
				"body": {
					"name": "testBar"
				}
			},
			"expectedResponse": {
				"statusCode": 200
			}
		}, {
			"id": "data_removal",
			"request": {
				"method": "DELETE",
				"protocol": "http",
				"host": "www.foo.com",
				"resource": "/bar"
			},
			"expectedResponse": {
				"statusCode": 204
			}
		}],
		"tests": [{
			"id": "bar_get",
			"setup": ["data_setup"],
			"request": {
				"method": "GET",
				"protocol": "http",
				"host": "www.google.com",
				"resource": "/bar"
			},
			"expectedResponse": {
				"statusCode": 200,
				"body": {
					"name": "testBar"
				}
			},
			"teardown": ["data_removal"]
		}]
	}

Setups are often used to create data for the test and teardowns are often used to remove that data.  Since the two often go hand in hand Harvey allows you to associate a teardown to a setup so that the setup is ever run then the teardown is automatically run as well.  This is done with the 'teardown' property on the setup.  Here is the previous example rewritten to make use of this feature:

	{
		"setupAndTeardowns": [{
			"id": "data_setup",
			"teardown": "data_removal"
			"request": {
				"method": "PUT",
				"protocol": "http",
				"host": "www.foo.com",
				"resource": "/bar",
				"body": {
					"name": "testBar"
				}
			},
			"expectedResponse": {
				"statusCode": 200
			}
		}, {
			"id": "data_removal",
			"request": {
				"method": "DELETE",
				"protocol": "http",
				"host": "www.foo.com",
				"resource": "/bar"
			},
			"expectedResponse": {
				"statusCode": 204
			}
		}],
		"tests": [{
			"id": "bar_get",
			"setup": ["data_setup"],
			"request": {
				"method": "GET",
				"protocol": "http",
				"host": "www.google.com",
				"resource": "/bar"
			},
			"expectedResponse": {
				"statusCode": 200,
				"body": {
					"name": "testBar"
				}
			}
		}]
	}


Suite Setups and Teardowns
--------------------------
Harvey also supports setups and teardowns that are run only once. The suite setups are run before any test is run and the suite teardowns are run after all the tests have completed.

Variables
---------
A common scenario is to use a setup to obtain an authentication token that is needed for your test. The mechanism that Harvey provides for getting that token from the setup to your test is in a variable.  Variables are only scoped to the test parts of a single test, and are the only way to pass data between the test parts.  All values are parsed for variable substitution before being used, so using a variable is as easy as placing '${variable_name}' wherever the value needs to go.  Here is our example again, adding an authentication header with the token coming from a variable.

	{
		"tests": [{
			"id": "private_bar_get",
			"setup": ["get_access_token"],
			"request": {
				"method": "GET",
				"protocol": "http",
				"host": "www.foo.com",
				"resource": "/privateBar",
				"headers": {
					"X-Authorization": "${myAccessToken}"
				}
			},
			"expectedResponse": {
				"statusCode": 200,
				"body": {
					"name": "privateBar"
				}
			},
			"teardown": ["data_removal"]
		}]
	}

Actions
-------
The previous section on variables showed you how to use variables, but it didn't show you how to set them.  This is where actions come in.  Actions allow you to perform, well, an "action" on the results of a test step.  The curently available actions are:

* ```set``` - sets a variable to the specified value
* ```push``` - ensures a variable to be an Array and pushes the specified value into it
* ```replace``` - does a string regex replacement on a specified value
* ```extract``` - extracts a value from the response object using dot notation
* ```random``` - generates a random number between values
* ```crypto``` - generates a cipher or hash-based MAC
* ```now``` - generates a timestamp for the current time
* ```stringify``` - converts a JSON object into a string
* ```base64``` - encodes a string to base64

And more may be added in the future.  See the README.md under the ./lib/actions directory for more detailed information about each action.  Actions can be run either before or after the test by specifying them in the 'preActions' or 'postActions' arrays.  Actions run after the test have access to the 'response' variable that contains details of the previous response. Here is an example of setting a token variable:

	{
		"setupAndTeardowns": [{
			"id": "get_access_token",
			"request": {
				"method": "POST",
				"protocol": "http",
				"host": "www.foo.com",
				"resource": "/token",
				"body": {
					"username": "foo",
					"password": "bar"
				}
			},
			"expectedResponse": {
				"statusCode": 200
			},
			"postActions": [{
				"$set": {
					"myAccessToken": "${response.body.access_token}",
					"expirationDate": {
						"$replace": {
							"value": "${response.body.access_token}",
							"regex": "^.*|(\\d{4}-\\d{2}\\d-\\d{2}).*$",
							"replacement": "$1"
						}
					}
				}
			}]
		}],
		"tests": [{
			"id": "private_bar_get",
			"setup": ["get_access_token"],
			"request": {
				"method": "GET",
				"protocol": "http",
				"host": "www.foo.com",
				"resource": "/privateBar",
				"headers": {
					"X-Authorization": "${myAccessToken}"
				}
			},
			"expectedResponse": {
				"statusCode": 200,
				"body": {
					"name": "privateBar"
				}
			},
			"teardown": ["data_removal"]
		}]
	}

As you can see from this example, different parts of the response can be accessed using JsonPath expression. It is also possible to create your own custom action and use it on your test.  More info on actions can be found [here](lib/actions/README.md).

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

And this is what the corresponding config file would look like:

	{
		"google_hostname": "www.google.com"
	}

You can specify the config file to use when you run the tests by using the -c argument:

	$ harvey -c config.json tests.json

Putting it all Together
-----------------------
So far we've covered how to specify each of the individual pieces.  Here is how you put it all together:

	{
		"id": "<<optional name for the test suite>>",
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
			<< list of setup ids to run goes here >>
		],
		"suiteTeardown": [
			<< list of teardown ids to run goes here >>
		],
		"tests": [
			<< json for the tests goes here >>
		]
	}



Splitting Tests into Multiple Files
-----------------------------------
Tests can be split into multiple files but still run together.  Each file is considered a separate test suite, and the reporters will display the results of each suite as well as the overall results.  To run multiple test files together, simply list each file on the command line:

	$ harvey fooTests.json barTests.json

You can also use wildcard characters in the path to pull in all matching files:

	$ harvey *Tests.json

Importing Setups, Teardowns, and Templates
------------------------------------------
You can re-use setups, teardowns, and templates across test files by placing them in a file of their own, using the same format as if they were in the test file, and importing them into the test file. Here is our earlier template example broken into two files:

myTests.json

	{
		"import": [{
			"file": "myTemplates.json"
		}],
		"tests": [{
			"id": "google_index_page",
			"request": {
				"templates": ["standard_google_get"],
				"resource": "/index.html"
			},
			"expectedResponse": {
				"statusCode": 200
			}
		}]
	}

myTemplates.json

	{
		"requestTemplates": [{
			"id": "standard_google_get",
			"method": "GET",
			"protocol": "http",
			"host": "www.google.com"
		}]
	}



Command Line Options
--------------------
A few command line options are supported, all of which are optional.  Using --help will get you the following list:

	$ harvey --help

  Usage: harvey [options] <file ...>

  Options:

    -h, --help                               output usage information
    -V, --version                            output the version number
    -d, --debug                              Shows stack traces when errors are received
    -c, --config-file <path>                 The path to the config file
    -r, --reporter <console|json|html|none>  Which reporter to use for displaying the results. Defaults to console.
    --test-id <testId>                       The id of a single test to run
    --actions <actions>                      A comma delimited list of paths to custom actions
    -p, --proxy-url <url>                    Configure harvey to route all requests through the specified proxy

Reporters
---------
Which reporter you use will determine how the output from the tests are formatted.  If you don't specify one then Harvey will default to the 'console' reporter which will print the test results to the console in an easy to read format.  Specifying 'json' will output a json document with the details from the tests which is useful for debugging.  No matter which reporter is used the process exit code is always set to the number of failing tests. 

Http Proxy
----------
It can be useful for debugging purposes to send your requests through tools such as Fiddler or Charles.  Harvey supports this.  Simply specify the '-p' option on the command line along with the proxy url and Harvey will route all requests through there.  If you just want to route a single test through the proxy simply add a variable to that test titled '_proxyUrl' with the proxy url.

Generating Tests with harvey-init
---------------------------------
Writing tests from scratch can be time consuming, so Harvey includes a command-line tool for generating tests called ```harvey-init```. You can pass harvey-init either a url or the path to a HAR file. When passed a url harvey-init will perform an OPTIONS request on that url and create a placeholder test for each method the OPTIONS request says it supports.  If the URL doesn't support OPTIONS then a single GET placeholder test is generated. When you pass harvey-init a path to a HAR file, it will generate a test matching each request and response in the HAR file exactly. With either option it will write the generated tests to stdout so you will need to pipe that output into a file to save the tests.

Executing Random Tests on Random Intervals
------------------------------------------
In some cases it would be useful to be able to test your endpoints multiple times over a given period of time to simulate usage or for the purpose of gathering metrics. Harvey includes a command-line tool for this called ```harveyz```. This tool utilizes the same test files as ```harvey``` but instead will pick random ones to run at random intervals for a given duration. By default, any tests that fail their validations will be logged out to the console, but ```harveyz``` will continue to run until the duration is reached. Run ```harveyz -h``` for details on the options available.
 
Origin of the Name
------------------
Harvey is an Http Endpoint Result Validation Engine, or HERVE. Hervé is a common French name, but since nobody would know how to pronounce in America it I went with the English equivalent, Harvey.

License
=======
The MIT License (MIT) Copyright (c) 2013-2014 Tim Schwecke

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
