/**
 * This is a set of Javascript wrappers around the XPCOM nsIStreamConverterService component
 * that provides native implementation of gzip convert function.
 *
 * @public
 * @name GREUtils.Gzip
 * @namespace GREUtils.Gzip
 */
GREUtils.define('GREUtils.Gzip');


/**
 * Deflate a string
 *
 * This function compress the given string using the DEFLATE  data format.
 *
 * @public
 * @static
 * @function
 * @param {String} data         The data to compress
 * @return {String}             The compressed string or FALSE if an error occurred. 
 */
GREUtils.Gzip.deflate = function(data) {

    try {

        var encodedData = encodeURIComponent(data);

        // Store data in an input stream
        var inputStream = Components.classes["@mozilla.org/io/string-input-stream;1"].createInstance(Components.interfaces.nsIStringInputStream);
        inputStream.setData(encodedData, encodedData.length);

        // Load input stream onto a pump
        var inputPump = Components.classes["@mozilla.org/network/input-stream-pump;1"].createInstance(Components.interfaces.nsIInputStreamPump);
        inputPump.init(inputStream, -1, -1, 0, 0, true);

        // Create a generic stream converter service
        var streamConv = Components.classes["@mozilla.org/streamConverters;1"].createInstance(Components.interfaces.nsIStreamConverterService);

        // Create a stream listener to accept gunzip'ed data
        var gzipListener = {
            first: true,
            data: null,

            onStartRequest: function(request, context){
            //alert("gzip onStartRequest() called");
            },

            onDataAvailable: function(request, context, inputStream, offset, count){

                var binInputStream = Components.classes["@mozilla.org/binaryinputstream;1"].createInstance(Components.interfaces.nsIBinaryInputStream);
                binInputStream.setInputStream(inputStream);
                if(this.first) {
                    this.data = binInputStream.readBytes(count);
                    this.first = false;
                }else {
                    this.data += binInputStream.readBytes(count);
                }
                binInputStream.close();

            },

            onStopRequest: function(request, context, statusCode){
            // alert("gzip onStopRequest() called with status " + statusCode); alert("Data is '" + this.data + "'");
            }

        };

        // Create a specific gunzipper with my listener
        var converter = streamConv.asyncConvertData("uncompressed", "deflate", gzipListener, null);

        // Set stream converter to read from input pump
        //inputPump.asyncRead(converter,null);

        // sync compress like PHP
        converter.onStartRequest(inputPump, null);
        converter.onDataAvailable(inputPump, null, inputStream, 0, inputStream.available() );
        converter.onStopRequest(inputPump, null, 0);
        
        return gzipListener.data;

    }catch(e) {
        return false;
    }
    return false;

};

/**
 * Inflate a deflated string
 *
 *  This function inflate a deflated string. 
 *
 * @public
 * @static
 * @function
 * @param {String} data         The data compressed
 * @return {String}             The original uncompressed data or FALSE if an error occurred.
 */
GREUtils.Gzip.inflate = function(data) {

    try {

        // Store data in an input stream
        var inputStream = Components.classes["@mozilla.org/io/string-input-stream;1"].createInstance(Components.interfaces.nsIStringInputStream);
        inputStream.setData(data, data.length);

        // Load input stream onto a pump
        var inputPump = Components.classes["@mozilla.org/network/input-stream-pump;1"].createInstance(Components.interfaces.nsIInputStreamPump);
        inputPump.init(inputStream, -1, -1, 0, 0, true);

        // Create a generic stream converter service
        var streamConv = Components.classes["@mozilla.org/streamConverters;1"].createInstance(Components.interfaces.nsIStreamConverterService);

        // Create a stream listener to accept gunzip'ed data
        var gzipListener = {
            first: true,
            data: null,

            onStartRequest: function(request, context){
            //alert("gzip onStartRequest() called");
            },

            onDataAvailable: function(request, context, inputStream, offset, count){

                var binInputStream = Components.classes["@mozilla.org/binaryinputstream;1"].createInstance(Components.interfaces.nsIBinaryInputStream);
                binInputStream.setInputStream(inputStream);
                if(this.first) {
                    this.data = binInputStream.readBytes(count);
                    this.first = false;
                }else {
                    this.data += binInputStream.readBytes(count);
                }
                binInputStream.close();

            },

            onStopRequest: function(request, context, statusCode){
            // alert("gzip onStopRequest() called with status " + statusCode); alert("Data is '" + this.data + "'");
            }

        };



        // Create a specific gunzipper with my listener
        var converter = streamConv.asyncConvertData("deflate", "uncompressed", gzipListener, null);

        // Set stream converter to read from input pump
        //inputPump.asyncRead(converter,null);

        // sync compress like PHP
        converter.onStartRequest(inputPump, null);
        converter.onDataAvailable(inputPump, null, inputStream, 0, inputStream.available() );
        converter.onStopRequest(inputPump, null, 0);

        var decodedData = decodeURIComponent(gzipListener.data);

        return decodedData;

    }catch(e) {
        alert(e);
        return false;
    }


};
