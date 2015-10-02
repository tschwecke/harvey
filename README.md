![Harvey](https://github.com/tschwecke/harvey/blob/master/resources/Harvey_logo.png?raw=true)
----------
Harvey is a HTTP integration test tool that expresses HTTP requests and the expected responses in a simple, easy to understand JSON format. This allows your integration tests to be declarative, rather than imperative. Although Harvey can be used to validate any Http endpoint, it is particularly well suited for testing REST service endpoints. Harvey was built from the ground up to run tests in parallel, so it can process hundreds of integration tests in seconds.

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
Running tests with Harvey from the command line is easy.  Here is a simple example:

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

It is pretty clear what this test is doing. It will make a GET request to http://www.google.com/index.html and validate that the status of the response is 200.

If you put that json into a file named 'myFirstTest.json' and ran it through Harvey you would get the following:

```
$ harvey myFirstTest.json
  ■ myFirstTest.json
    ✓ google_index_page

    Time elapsed: 908 ms
    1 tests complete, 0 failures.

  Overall time elapsed: 921 ms
  1 tests complete, 0 failures.
```

Pretty easy.  But you can do much more than this simple example with Harvey.

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
				"headers": {
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


Parameterized Setups and Teardowns
----------------------------------
Often you will want to use a single setup multiple times with slightly different data, such as creating multiple different test users for example. To allow for this, Harvey supports sending parameters to your setups or teardowns. In your test, instead of just supplying a string with the id of the setup or teardown, you supply an object containing the id and the parameters. So instead of this:

	setup: ["createUser"]

you use this:

	setup: [{
		"createUser": {
			"firstName": "John",
			"lastName": "Doe",
			"@returns": "user1Id"
		}
	}]

As you can see, this example also includes a return value. Here, the return value from the 'createUser' setup should be stored in the 'user1Id' variable. So how do you use the parameters and set the return value? There are two special variables you can use in the setup or teardown, '@parameters' and '@returns'.  All of the parameters are available under the '@parameters' variable, and any value set to '@returns' will be used as the return value. Here is the example from the previous section rewritten to make use of parameters and return values:

	{
		"setupAndTeardowns": [{
			"id": "data_setup",
			"request": {
				"method": "POST",
				"protocol": "http",
				"host": "www.foo.com",
				"resource": "/bar",
				"body": {
					"name": "${@parameters.name}"
				}
			},
			"expectedResponse": {
				"statusCode": 200
			},
			"postActions": [{
				"$set": {
					"@returns": "@response.body.id"
				}
			}]
		}, {
			"id": "data_removal",
			"request": {
				"method": "DELETE",
				"protocol": "http",
				"host": "www.foo.com",
				"resource": "/bar/${@parameters.id}"
			},
			"expectedResponse": {
				"statusCode": 204
			}
		}],
		"tests": [{
			"id": "bar_get",
			"setup": [{
				"data_setup": {
					"name": "testBar1",
					"@returns": "bar1Id"
				}
			}],
			"request": {
				"method": "GET",
				"protocol": "http",
				"host": "www.google.com",
				"resource": "/bar/${bar1Id}"
			},
			"expectedResponse": {
				"statusCode": 200,
				"body": {
					"name": "testBar1"
				}
			},
			"teardown": [{
				"data_removal": {
					"id": "${bar1Id}"
				}
			}]
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

Variables are typically used to interpolate values into strings, and the type of the value is automatically converted into a string.  However, sometimes you want to preserve the type of the value being held by the variable.  To achieve this, use the 'double brace' variable notation, for example: '${{variable_name}}'.  To ensure the file is still valid json it still must be placed in a string, but it must be the only contents of the string, and the string will be replaced by the value of the variable.
Here it is used to specify the status code we are expecting back, which must be an integer and not a string:

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
				"statusCode": "${{successStatusCode}}",
				"body": {
					"name": "privateBar"
				}
			},
			"teardown": ["data_removal"]
		}]
	}


Actions
-------
The previous section on variables showed you how to use variables, but it didn't show you how to set them.  This is where actions come in.  Actions allow you to perform, well, an "action", either on data before a test step runs or on the results of a test step.  The curently available actions are:

* ```set``` - sets a variable to the specified value
* ```push``` - ensures a variable to be an Array and pushes the specified value into it
* ```replace``` - does a string regex replacement on a specified value
* ```extract``` - extracts a value from the response object using dot notation
* ```random``` - generates a random number between values
* ```crypto``` - generates a cipher or hash-based MAC
* ```now``` - generates a timestamp for the current time
* ```stringify``` - converts a JSON object into a string
* ```base64``` - encodes a string to base64
* ```remove``` - returns ```undefined``` to effectively remove the property being assigned to
* ```substitute``` - replaces the value that would have been assigned to the property with one that you provide

See the [README.md](lib/actions/README.md) under the ./lib/actions directory for more detailed information about each action.  Actions can be run either before or after the test by specifying them in the 'preActions' or 'postActions' arrays, or during the test by embedding them directly in the request.  Actions run after the test have access to the 'response' variable that contains details of the previous response. Here is an example of setting a token variable:

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

Repeating Tests
---------------
Often you will want to test a service with a number of different values to ensure each gives the same result. Rather than create a new test for each, Harvey makes this easy by allowing you to create repeating tests.  You can either give the test an array of values to iterate through, or have it iterate a specified number of times. You can configure a test to repeat with the 'repeat' property:

	{
		"tests": [{
			"id": "google_index_page",
			"repeat": {
				"var": "validPage",
				"in": ["/", "/index.html"]
			},
			"request": {
				"method": "GET",
				"protocol": "http",
				"host": "www.google.com",
				"resource": "${validPage}"
			},
			"expectedResponse": {
				"statusCode": 200
			}
		}]
	}

This test will run twice, once requesting index.html and the other requesting the root of the site. By default these requests happen in parallel.  If you would like them to happen sequentially, set the 'mode' property to 'sequential':

	{
		"tests": [{
			"id": "google_index_page",
			"repeat": {
				"mode": "sequential",
				"var": "validPage",
				"in": ["/", "/index.html"]
			},
			"request": {
				"method": "GET",
				"protocol": "http",
				"host": "www.google.com",
				"resource": "${validPage}"
			},
			"expectedResponse": {
				"statusCode": 200
			}
		}]
	}

Rather than iterating on an array of values, you can also have it iterate a specified number of times.  To run a test 10 times, do this:

	{
		"tests": [{
			"id": "google_index_page",
			"repeat": {
				"var": "index",
				"from": 1,
				"to": 10
			},
			"request": {
				"method": "GET",
				"protocol": "http",
				"host": "www.google.com",
				"resource": "/index.html?requestNbr=${index}"
			},
			"expectedResponse": {
				"statusCode": 200
			}
		}]
	}

One final note, it is important to remember that all setups and teardowns for the test are run on each iteration, and have access to the iteration variable just like the test does.

Test Configuration
------------------
Often you will want to configure your tests to behave differently without having to rewrite them. Harvey supports this through test configuration. When you execute the tests you tell Harvey which config to load. Once the config is loaded, all the properties can be accessed exactly like any other variable. Here is an example where ```google_hostname``` is defined in the config file:

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
		"imports": [{
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

OAuth 1.0a Support
------------------
If your services are protected by [OAuth 1.0a](https://tools.ietf.org/html/rfc5849), you can configure your Harvey tests to authenticate against those services.

The consumer key and consumer secret can be setup in your configuration file:

	{
		"oauthConsumerKey": "exampleConsumerKey",
		"oauthConsumerSecret": "somes3cret"
	}

Then you add ```oauth``` to the request object:

	{
		"id": "api_test",
		"request": {
			"method": "GET",
			"protocol": "http",
			"host": "www.foo.com",
			"resource": "/api/bar",
			"oauth": {
				"consumerKey": "${oauthConsumerKey}",
				"consumerSecret": "${oauthConsumerSecret}"
			}
		},
		"expectedResponse": {
			"statusCode": 200
		}
	}

Harvey also implements the [OAuth Request Body Hash specification](https://oauth.googlecode.com/svn/spec/ext/body_hash/1.0/oauth-bodyhash.html), automatically adding the ```oauth_body_hash``` protocol parameter to your requests.

Harvey's OAuth implementation does not support the following parts of the OAuth 1.0a spec:
* Section 2
  * Redirection-Based Authorization (Harvey uses a pre-configured client consumer key and associated shared-secret)
  * oauth_token (resource owner authentication)
* Entity-body parameters (3.4.1.3.1)
* RSA-SHA1 (3.4.3) or PLAINTEXT (3.4.4) signature methods
* Form-Encoded Body Parameter Transmission (3.5)
* Request URI Parameter Transmission (3.5)

Command Line Options
--------------------
A few command line options are supported, all of which are optional.  Using --help will get you the following list:

	$ harvey --help

  Usage: harvey [options] <file ...>

  Options:

    -h, --help                                            output usage information
    -V, --version                                         output the version number
    -d, --debug                                           Shows stack traces when errors are received
    -c, --config-file <path>                              The path to the config file
    -r, --reporter <console|json|html|text|summary|none>  Which reporter to use for displaying the results. A path to a custom reporter can also be given here. Defaults to console.
    --test-id <testId>                                    The id of a single test to run
    --timeout <ms>                                        Connection and read timeout for requests
    --actions <actions>                                   A comma delimited list of paths to custom actions
    -p, --proxy-url <url>                                 Configure harvey to route all requests through the specified proxy

Reporters
---------
Which reporter you use will determine how the output from the tests are formatted.  If you don't specify one then Harvey will default to the 'console' reporter which will print the test results to the console in an easy to read format.  Harvey comes with several built-in reporters that you can use, although you can also specify a path to your own custom reporter if you wish.  No matter which reporter is used the process exit code is always set to the number of failing tests.

Using one of the built-in reporters:

	harvey -r html myTests.json

Using a custom reporter named fooReporter.js in the directory myReporters:

	harvey -r myReporters/fooReporter.js myTests.json

Custom reporters need to export an object with a single method, 'reportResults'. Here is the implementation of the built-in summary reporter as an example:

	module.exports = {
		reportResults: function(results, config, callback) {

			console.log('');
			console.log('Suite Results:');
			console.log('--------------');
			results.suiteResults.forEach(function(result) {
				console.log(result.suiteId + '    ' + result.testsExecuted + ' tests complete, ' + result.testsFailed + ' failures');
			});

			var elapsed = results.timeEnded.getTime() - results.timeStarted.getTime();
			console.log('');
			console.log('Summary Results:');
			console.log('----------------');
			console.log('Overall time elapsed: ' + elapsed + ' ms');

			console.log(results.testsExecuted + ' tests complete, ' + results.testsFailed + ' failures');
			console.log('');

			callback();
		}
	};

Harvey Transformer
----------
After running the test suite and outputing JSON you can take the json and run it back through the harvey-transformer to output multiple types of reports. This is especially helpful if you want to take advantage of a built-in reporter along with a custom reporter.

The harvery-transformer works as such (this message also available through --help):

	$ harvey-transformer --help

  Usage: harvey-transformer [options] <file ...>

  Options:

    -h, --help                               output usage information
    -V, --version                            output the version number
    -c, --config-file <path>                 The path to the config file
    -j, --json-results <path>                The path to the json results file, Required
    -r, --reporter <console|json|html|none>  Which reporter to use for transforming the results. Defaults to console.

Http Proxy
----------
It can be useful for debugging purposes to send your requests through tools such as Fiddler or Charles.  Harvey supports this.  Simply specify the '-p' option on the command line along with the proxy url and Harvey will route all requests through there.  If you just want to route a single test through the proxy simply add a variable to that test titled '_proxyUrl' with the proxy url.

Generating Tests with harvey-init
---------------------------------
Writing tests from scratch can be time consuming, so Harvey includes a command-line tool for generating tests called ```harvey-init```. You can pass harvey-init either a url or the path to a HAR file. When passed a url harvey-init will perform an OPTIONS request on that url and create a placeholder test for each method the OPTIONS request says it supports.  If the URL doesn't support OPTIONS then a single GET placeholder test is generated. When you pass harvey-init a path to a HAR file, it will generate a test matching each request and response in the HAR file exactly. With either option it will write the generated tests to stdout so you will need to pipe that output into a file to save the tests.

Executing Random Tests on Random Intervals
------------------------------------------
In some cases it would be useful to be able to test your endpoints multiple times over a given period of time to simulate usage or for the purpose of gathering metrics. Harvey includes a command-line tool for this called ```harvey-random```. This tool utilizes the same test files as ```harvey``` but instead will pick random ones to run at random intervals for a given duration. By default, any tests that fail their validations will be logged out to the console, but ```harvey-random``` will continue to run until the duration is reached. Run ```harvey-random -h``` for details on the options available.

Origin of the Name
------------------
Harvey is an Http Endpoint Result Validation Engine, or HERVE. Hervé is a common French name, but since nobody would know how to pronounce in America it I went with the English equivalent, Harvey.

License
=======
The MIT License (MIT) Copyright (c) 2013-2014 Tim Schwecke

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
