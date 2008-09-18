/**
 * This is a set of Javascript wrappers around the XPCOM nsiCryptoHash component
 * that provides native implementation of cryptographic hash function.
 * 
 * This can be used, for example, to calculate the MD5 hash of a file to
 * determine if it contains the data you think it does.
 *
 * The hash algorithms supported are MD2, MD5, SHA-1, SHA-256, SHA-384, and SHA-512.
 *
 * @public
 * @name GREUtils.CryptoHash
 * @namespace GREUtils.CryptoHash
 */
GREUtils.define('GREUtils.CryptoHash');


/**
 * Computes the hash of a string.
 *
 * This method takes a UTF-8 string and computes its hash using the specified
 * algorithm.
 *
 * @public
 * @static
 * @function
 * @param {String} str          This is the UTF-8 string to compute the hash for
 * @param {String} algorithm    This is the hash algorithm to use
 * @return {String}             The resulting hash as a hex string
 */
GREUtils.CryptoHash.crypt = function(str, algorithm) {

	var converter =	GREUtils.XPCOM.getUsefulService('unicodeconverter');
	var cryptohash = GREUtils.XPCOM.getUsefulService('hash');

	converter.charset = "UTF-8";
	var result = {};
	// data is an array of bytes
	var data = converter.convertToByteArray(str, result);

	// init algorithm
	cryptohash.init(cryptohash[algorithm]);

	cryptohash.update(data, data.length);

	var hash = cryptohash.finish(false);

	// convert the binary hash data to a hex string.
	return GREUtils.CryptoHash.arrayToHexString(hash);

};

/**
 * Computes the hash of a file.
 *
 * This method reads data from a file and computes its hash using the specified
 * algorithm. The file can be specified as a string containing the file path or
 * as an nsIFile object.
 *
 * @public
 * @static
 * @function
 * @param {String|nsIFile} file   This is the file given as a file path or an nsIFile object
 * @param {String} algorithm      This is the hash algorithm to use
 * @return {String}               The resulting hash as a hex string; an empty string is returned if the file is empty or cannot be read
 */
GREUtils.CryptoHash.cryptFromStream = function(aFile, algorithm) {

	var cryptohash = GREUtils.XPCOM.getUsefulService('hash');

	var istream = GREUtils.File.getInputStream(aFile);

	if(GREUtils.isNull(istream)) return "";

	// init algorithm
	cryptohash.init(cryptohash[algorithm]);

	// this tells updateFromStream to read the entire file
	const PR_UINT32_MAX = 0xffffffff;
	cryptohash.updateFromStream(istream, PR_UINT32_MAX);

	// pass false here to get binary data back
	var hash = cryptohash.finish(false);

	// convert the binary hash data to a hex string.
	return GREUtils.CryptoHash.arrayToHexString(hash);

};


/**
 * Computes the MD5 hash of a string.
 *
 * This method takes a UTF-8 string and computes its hash using the MD5 algorithm.
 *
 * @public
 * @static
 * @function
 * @param {String} str              This is the UTF-8 string to compute the hash for
 * @return {String}                 The resulting hash as a hex string
 */
GREUtils.CryptoHash.md5 = function(str) {

	return GREUtils.CryptoHash.crypt(str, "MD5");
};

/**
 * Computes the MD5 hash of a file.
 *
 * This method reads data from a file and computes its hash using the MD5
 * algorithm. The file can be specified as a string containing the file path or
 * as an nsIFile object.
 *
 * @public
 * @static
 * @function
 * @param {String|nsIFile} aFile  This is the file given as a file path or an nsIFile object
 * @return {String}               The resulting hash as a hex string; an empty string is returned if the file is empty or cannot be read
 */
GREUtils.CryptoHash.md5FromFile = function(aFile){

	return GREUtils.CryptoHash.cryptFromStream(aFile, "MD5");
};

/**
 * Computes the MD5 hash of a file.
 *
 * This method reads data from a file and computes its hash using the MD5
 * algorithm. The file can be specified as a string containing the file path or
 * as an nsIFile object.
 *
 * @public
 * @static
 * @function
 * @param {String|nsIFile} aFile  This is the file given as a file path or an nsIFile object
 * @return {String}               The resulting hash as a hex string; an empty string is returned if the file is empty or cannot be read
 */
GREUtils.CryptoHash.md5sum = GREUtils.CryptoHash.md5FromFile;


/**
 * Computes the SHA-1 hash of a string.
 *
 * This method takes a UTF-8 string and computes its hash using the SHA-1 algorithm.
 *
 * @public
 * @static
 * @function
 * @param {String} str          This is the UTF-8 string to compute the hash for
 * @return {String}             The resulting hash as a hex string
 */
GREUtils.CryptoHash.sha1 = function(str) {

	return GREUtils.CryptoHash.crypt(str, "SHA1");
};


/**
 * Computes the SHA-256 hash of a string.
 *
 * This method takes a UTF-8 string and computes its hash using the SHA-256 algorithm.
 *
 * @public
 * @static
 * @function
 * @param {String} str          This is the UTF-8 string to compute the hash for
 * @return {String}             The resulting hash as a hex string
 */
GREUtils.CryptoHash.sha256 = function(str) {

	return GREUtils.CryptoHash.crypt(str, "SHA256");
};

/**
 * Returns the two-digit hexadecimal representation of a byte value.
 *
 * @public
 * @static
 * @function
 * @param {String} charCode     This is the byte value
 * @return {String}             The two-digit hexadecimal representation of the byte value
 */
GREUtils.CryptoHash.toHexString = function(charCode) {
  return ("0" + charCode.toString(16)).slice(-2);
};

/**
 * Returns the hexadecimal representation of an array of byte values.
 *
 * This method takes an array of byte values and returns a string containing the
 * hexadecimal representation of each of the byte values in the array. Each byte
 * value will be represented as a two-digit hexadecimal value.
 *
 * @public
 * @static
 * @function
 * @param {Array} data        This is the array of byte values
 * @return {String}           The hexadecimal representation of the array of byte values
 */
GREUtils.CryptoHash.arrayToHexString = function(data) {

  	// convert the binary hash data to a hex string.
	var s = [];
	for(var i in data) {
		s.push(GREUtils.CryptoHash.toHexString(data.charCodeAt(i)));
	}
	return s.join("");

};
