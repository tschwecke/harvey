

Creating a custom action for Harvey is relatively straightforward. As an example, here is the source for the stringify action, which simply converts an object into a JSON string:

```
#stringifyAction.js

module.exports = function(actionInfo, variables, parseValueFn, testStep) {
	var parsedActionInfo = parseValueFn(actionInfo);

	return JSON.stringify(parsedActionInfo);
};
```

The first thing to note is that the module just exports a function that performs the desired action.  Three arguments are passed in:
- actionInfo - The data that was assigned to the action in the json file.
- variables - A collection of all of the variables and their values.  Any changes made to the variables will carry through to the remaining test parts.
- parseValueFn - A function that will replace any variable references in a string or object with their actual values.
- testStep - The test step that is currently executing

An action may or may not return a value depending on it's purpose. If the purpose is to create a new variable, or modify the value of an existing variable, then typically the action function doesn't return anything.  If the purpose is to calculate a value, then that value is returned from the function.

To use your own custom action in Harvey, simply export your action function in a node module.  The file must be named after your action, e.g. the code for action 'foo' should be in a file named 'fooAction.js. When running Harvey, simply include the path to that file on the command line. For example, to tell Harvey to use the 'foo' action which lives in the 'bar' directory, invoke Harvey like this:

```
harvey --actions bar/fooAction.js myTests.json
```