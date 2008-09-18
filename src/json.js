/**
 * This is a set of utility functions to encode and decode JSON strings.
 *
 * The functions are based on XPCOM Native JSON Services and are much faster
 * than JavaScript implemention.
 *
 * @public
 * @name GREUtils.JSON
 * @namespace GREUtils.JSON
 */
GREUtils.define('GREUtils.JSON');

GREUtils.JSON = {
	_native: false,
	_jsonService: null
};

/**
 * Returns the XPCOM service that implements the nsIJSON interface
 *
 * @public
 * @static
 * @function
 * @return {nsIJSON}                       The nsIJSON service
 */
GREUtils.JSON.getJSONService = function() {

	if (this._jsonService == null) {
		var jsonService = GREUtils.XPCOM.getUsefulService("json");
		if (jsonService) {
			this._native = true;
			this._jsonService = jsonService;
		}else {
			// use json javascript code
			this._native = false;
		}
	}
 	return this._jsonService;
};


/**
 * Decodes a JSON string and returns the JavaScript object it represents.
 *
 * @public
 * @static
 * @function
 * @param {String} aJSONString            This is the JSON string
 * @return {Object}                       The JavaScript object represented by the JSON string
 */
GREUtils.JSON.decode = function(aJSONString) {
 	return GREUtils.JSON.getJSONService().decode(aJSONString);
};


/**
 * Encodes a JavaScript object into a JSON string.
 *
 * @public
 * @static
 * @function
 * @param {Object} aJSObject              This is the JavaScript object to encode
 * @return {String}                       The JSON representation of the JavaScript object
 */
GREUtils.JSON.encode = function(aJSObject) {
	return GREUtils.JSON.getJSONService().encode(aJSObject);
};


/**
 * Decodes a JSON string read from an input stream and returns the JavaScript object it represents.
 *
 * @public
 * @static
 * @function
 * @param {nsIInputStream} stream         This is the input stream from which to read the JSON string
 * @param {Number} contentLength          This is the length of the JSON string to read from the input stream
 * @return {Object}                       The JavaScript object represented by the JSON string
 */
GREUtils.JSON.decodeFromStream = function(stream, contentLength) {
	return GREUtils.JSON.getJSONService().decodeFromStream(stream, contentLength);
};


/**
 * Encodes a JavaScript object into JSON format and writes it to a stream.
 *
 * If byte-order mark (BOM) is desired, set writeBOM to true; otherwise set writeBOM to false.
 *
 * @public
 * @static
 * @function
 * @param {nsIOutputStream} stream        Thisis the output stream to which to write the JSON string
 * @param {Object} value                  This is the JavaScript object to encode
 * @param {String} charset                This is the character set encoding to use on the JSON string; defaults to "UTF-8"
 * @param {Boolean} writeBOM              This flag indicates whether to write a byte-order mark (BOM) into the stream; defaults to "false"
 */
GREUtils.JSON.encodeToStream = function(stream, value, charset, writeBOM) {
	charset = charset || 'UTF-8';
	writeBOM = writeBOM || false;

	GREUtils.JSON.getJSONService().encodeToStream(stream, charset, writeBOM, value);
};


/**
 * Decodes a JSON string read from a file and returns the JavaScript object it represents.
 *
 * If the file cannot be read, null is returned.
 *
 * @public
 * @static
 * @function
 * @param {String} filename               This is the file path from which to read the JSON string
 * @return {Object}                       The JavaScript object represented by the JSON string
 */
GREUtils.JSON.decodeFromFile = function(filename) {
    var fileInputStream = GREUtils.File.getInputStream(filename, "rb");
	if(fileInputStream == null) return null;

	// return GREUtils.JSON.decodeFromStream(fileInputStream, fileInputStream.available());

    // native json decodeFromStream buggy?
    // try to write self
    var aJSONString = GREUtils.File.readAllBytes(filename);
	aJSONString = GREUtils.Charset.convertToUnicode(aJSONString);
    return GREUtils.JSON.decode(aJSONString);

};


/**
 * Encodes a JavaScript object into JSON format and writes it to a file.
 *
 * The JSON string will first be encoded in "UTF-8" before being written to the file.
 *
 * @public
 * @static
 * @function
 * @param {nsIOutputStream} filename      This is the output file to which to write the JSON string
 * @param {Object} value                  This is the JavaScript object to encode
 */
GREUtils.JSON.encodeToFile = function(filename, value) {

    var fileOutputStream = GREUtils.File.getOutputStream(filename, "w");
    if(fileOutputStream == null) return ;

    // GREUtils.JSON.encodeToStream(fileOutputStream, value);
    // native json decodeFromStream buggy?
    // try to write self
    var aJSONString = GREUtils.JSON.encode(value);
	aJSONString = GREUtils.Charset.convertFromUnicode(aJSONString, "UTF-8");
	GREUtils.File.writeAllBytes(filename, aJSONString);
    return;
};
