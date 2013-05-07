test:
	@NODE_ENV=test ./node_modules/.bin/mocha --recursive --reporter spec --timeout 3000 test

.PHONY: test