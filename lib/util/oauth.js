var generateNonce = require('nonce')();
var util = require('./util.js');
var URL = require('url');
var _ = require('underscore');
var crypto = require('crypto');

/*
 * Partial mplementation of OAuth 1.0a https://tools.ietf.org/html/rfc5849
 * Known missing items:
 *  - Section 2 - Redirection-Based Authorization (assumes a pre-configured client consumer key and shared-secret)
 *              - oauth_token (resource owner authentication)
 *  - Entity-body parameters (3.4.1.3.1)
 *  - RSA-SHA1 (3.4.3) or PLAINTEXT (3.4.4) signature methods
 *  - 3.5 Parameter Transmission - Authorization header is supported, but form-encoded body and request URI are not
 */

module.exports = {
	addAuthorization: function(request, oauthParams, variables) {
		var method = request.method;
		var url = request.uri;
		var baseUrl = normalizeBaseUrl(url);
		var oauthProtocolParams = {
			'oauth_consumer_key': util.parseValue(oauthParams.consumerKey, variables),
			'oauth_nonce': util.parseValue(oauthParams.nonce, variables) || generateNonce(),
			'oauth_signature_method': 'HMAC-SHA1',
			'oauth_timestamp': util.parseValue(oauthParams.timestamp, variables) || parseInt((new Date()).getTime() / 1000),
			'oauth_version': '1.0'
		};

		var oauthConsumerSecret = util.parseValue(oauthParams.consumerSecret, variables);

		var collectedParams = collectParams(request, oauthProtocolParams);
		var normalizedParams = normalizeParams(collectedParams);

		var signatureString = encode(method) + '&' +
		                      encode(baseUrl) + '&' +
		                      encode(normalizedParams);

		var hmac = crypto.createHmac('sha1', oauthConsumerSecret + '&'); // no token but the '&' is still required
		hmac.update(signatureString);
		var signature = hmac.digest('base64');

		var headerValue = createAuthorizationHeader(baseUrl, collectedParams, signature)

		request.headers['Authorization'] = headerValue;
		request['_oauth'] = true;
	}
};

var normalizeBaseUrl = function(url) {
	var parsedUrl = URL.parse(url);
	var port = '';
	var baseUrl = '';

	if (parsedUrl.port) {
		if ((parsedUrl.protocol == 'http:' && parsedUrl.port != '80') ||
			(parsedUrl.protocol == 'https:' && parsedUrl.port != '443')) {
			port = ':' + parsedUrl.port;
		}
	}

	baseUrl = parsedUrl.protocol.toLowerCase() + '//' + parsedUrl.hostname.toLowerCase() + port + parsedUrl.pathname;
	return baseUrl;
};

/*
 * Gather decoded parameters (section 3.4.1.3.1)
 */
var collectParams = function(request, oauthProtocolParams) {
	// Add OAuth protocol parameters
	var collectedParams = _.clone(oauthProtocolParams);

	// Parse the url for the query string
	// Cleans out '+' as described in 3.6
	var parsedUrl = URL.parse(request.uri, true);
	var queryParams = parsedUrl.query;

	// Add url query parameters
	for (var name in queryParams) {
		value = queryParams[name];
		collectedParams[name] = value;
	}

	// Note: Entity-body parameters not implemented

	// oauth_body_hash extension
	// https://oauth.googlecode.com/svn/spec/ext/body_hash/1.0/oauth-bodyhash.html
	if (request.method == 'POST' || request.method == 'PUT') {
		var sha1 = crypto.createHash('sha1');
		sha1.update(request.body || '');
		var oauthBodyHash = sha1.digest('base64');
		collectedParams['oauth_body_hash'] = oauthBodyHash;
	}

	return collectedParams;
};

/*
 * Encode, sort, and concatenate parameters (section 3.4.1.3.2)
 */
var normalizeParams = function(params) {
	var encodedParams = [];
	var normalizedParams = '';

	// encode the names and values, and put them in an array for sorting
	for (var name in params) {
		if (params.hasOwnProperty(name)) {
			// oauth parameter encoding is a little different than uri encoding
			var reencodedName = encode(name);
			var reencodedValue = encode(params[name]);
			encodedParams.push([reencodedName, reencodedValue]);
		}
	}

	// sort the params array
	// if the keys are the same, sort by the values
	encodedParams.sort(function(a, b) {
		if (a[0] == b[0]) {
			return a[1] < b[1] ? -1 : 1;
		} else {
			return a[0] < b[0] ? -1: 1;
		}
	});

	// concatenate the params
	for (var i = 0; i < encodedParams.length; i++) {
		normalizedParams += encodedParams[i][0];
		normalizedParams += '=';
		normalizedParams += encodedParams[i][1];
		if (i < encodedParams.length - 1) {
			normalizedParams += '&';
		}
	}

	return normalizedParams;
};

/*
 * Create Authorization header (section 3.5.1)
 */
var createAuthorizationHeader = function(realm, params, signature) {
	var headerValue = 'OAuth realm="' + encode(realm);
	
	if (params['oauth_body_hash']) {
		headerValue += '", oauth_body_hash="' + encode(params['oauth_body_hash']);
	}
	headerValue +=  '", oauth_consumer_key="'     + encode(params['oauth_consumer_key']) +
	                '", oauth_nonce="'            + encode(params['oauth_nonce']) +
	                '", oauth_signature="'        + encode(signature) +
	                '", oauth_signature_method="' + encode(params['oauth_signature_method']) +
	                '", oauth_timestamp="'        + encode(params['oauth_timestamp']) +
	                '", oauth_version="'          + encode(params['oauth_version']) + '"';

	return headerValue;
}

/*
 * Encode (section 3.6)
 *
 * Mozilla recommends
 *    return encodeURIComponent(data).replace(/[!'()*]/g, function(c) {
 *        return '%' + c.charCodeAt(0).toString(16);
 *    });
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
 *
 * The implementation in this method more explicitly follows the spec.
 */
var encode = function(data) {
	if (!data) return data;
	
	return data.toString().replace(/[^A-Za-z0-9\-._~]/g, function(c) {
		return '%' + c.charCodeAt(0).toString(16).toUpperCase();
	});
};
