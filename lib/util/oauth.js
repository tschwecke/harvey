var generateNonce = require('nonce')();
var util = require('./util.js');

//EXPERIMENTAL - really ugly, hacky code to get something working.  Not fully OAUTH compliant
module.exports = {
	"addAuthorization": function(request, oauthParams, variables) {

		var method = request.method;
		var url = request.uri;
		var oauthConsumerKey = util.parseValue(oauthParams.consumerKey, variables);;
		var oauthNonce = util.parseValue(oauthParams.nonce, variables) || generateNonce();
		var oauthSignatureMethod = "HMAC-SHA1";
		var oauthTimestamp = util.parseValue(oauthParams.timestamp, variables) || parseInt((new Date()).getTime() / 1000);
		var oauthVersion = "1.0";
		var oauthConsumerSecret = util.parseValue(oauthParams.consumerSecret, variables);;

		var signatureString = encodeURIComponent(method) + '&' +
		                encodeURIComponent(url) + '&';

		if(method == 'POST' || method == 'PUT') {
			var sha1 = require('crypto').createHash('sha1');
			sha1.update(request.body || '');
			var oauthBodyHash = sha1.digest('base64');
			signatureString += 'oauth_body_hash' + encodeURIComponent('=' + oauthBodyHash + '&')
		}

		signatureString += 'oauth_consumer_key' + encodeURIComponent('=' + oauthConsumerKey + '&') +
		                'oauth_nonce' + encodeURIComponent('=' + oauthNonce + '&') +
		                'oauth_signature_method' + encodeURIComponent('=' + oauthSignatureMethod + '&') +
		                'oauth_timestamp' + encodeURIComponent('=' + oauthTimestamp + '&') +
		                'oauth_version' + encodeURIComponent('=' + oauthVersion);

		var hmac = require('crypto').createHmac('sha1', oauthConsumerSecret + '&');
		hmac.update(signatureString);
		var signature = hmac.digest('base64');

		var headerValue = 'OAuth realm="' + encodeURIComponent(url);
		if(method == 'POST' || method == 'PUT') {
			headerValue += '", oauth_body_hash="' + encodeURIComponent(oauthBodyHash);
		}
		headerValue +=  '", oauth_consumer_key="' + oauthConsumerKey + '", oauth_nonce="' + oauthNonce + '", oauth_signature="' + encodeURIComponent(signature) + '", oauth_signature_method="' + oauthSignatureMethod + '", oauth_timestamp="' + oauthTimestamp + '", oauth_version="' + oauthVersion + '"';

		request.headers['Authorization'] = headerValue;
	}
};