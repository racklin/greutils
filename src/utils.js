/*
 * Useful Functions
 */
GREUtils._data = {};


/**
 * Returns the XPCOM service that implements the nsIXULAppInfo interface.
 *
 * For more information, please see nsIXULAppInfo Interface.
 *
 * @public
 * @static
 * @function
 * @return {Object}                   An nsIXULAppInfo service instance
 */
GREUtils.getAppInfo = function () {
    return GREUtils.XPCOM.getUsefulService("app-info");
};


/**
 * Returns the XPCOM service that implements the nsIXULRuntime interface.
 *
 * For more information, please see nsIXULRuntime Interface.
 *
 * @public
 * @static
 * @function
 * @return {Object}                   An nsIXULRuntime service instance
 */
GREUtils.getRuntimeInfo = function() {
    return GREUtils.XPCOM.getUsefulService("runtime-info");
};


/**
 * Returns the tag identifying the current operating system.
 *
 * For more information, please see nsIXULRuntime Interface.
 *
 * @public
 * @static
 * @function
 * @return {String}                   A string tag identifying the current operating system
 */
GREUtils.getOSInfo = function() {
    return GREUtils.getRuntimeInfo().OS;
    
};

 
/**
 * Checks if the current operating system is Linux-based.
 *
 * @public
 * @static
 * @function 
 * @return {Boolean}                  "true" if current operating system is Linux-based; "false" otherwise
 */
GREUtils.isLinux = function(){
    return (GREUtils.getOSInfo().match(/Linux/,"i").length > 0);
};


/**
 * Checks if the current operating system is Windows-based.
 *
 * @public
 * @static
 * @function 
 * @return {Boolean}                  "true" if current operating system is Windows-based; "false" otherwise
 */
GREUtils.isWindow = function() {
    return (GREUtils.getOSInfo().match(/Win/,"i").length > 0);
};


/**
 * Checks if the current operating system is MacOS-based.
 *
 * @public
 * @static
 * @function 
 * @return {Boolean}                  "true" if current operating system is MacOS-based; "false" otherwise
 */
GREUtils.isMac =function() {
    return (GREUtils.getOSInfo().match(/Mac|Darwin/,"i").length > 0);
};


/**
 * Synchronously loads and executes the script from the specified URL in a given
 * scope.
 * 
 * The default scope is the GREUtils.global. 
 *
 * If the script is executed successfully, this method returns the NS_OK result code;
 * otherwise NS_ERROR_INVALID_ARG is returned.
 * 
 * @public
 * @static
 * @function 
 * @param {String} scriptSrc          This is a URL specifying the location of the script
 * @param {Object} scope              This is the scope in which to execute the script
 * @return {Object}                   a NSResult return code
 */
GREUtils.include = function (scriptSrc, scope) {

    var objScope = scope || GREUtils.global;

    if (scriptSrc.indexOf('://') == -1) {
        scriptSrc = document.location.href.substring(0, document.location.href.lastIndexOf('/') +1) + scriptSrc;
    }

    var rv;
    try {
        if(!GREUtils.XPCOM._EnablePrivilege) netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        GREUtils.XPCOM.getUsefulService("jssubscript-loader").loadSubScript(scriptSrc, objScope);
        rv = GREUtils.XPCOM.Cr().NS_OK;
    } catch (e) {
		GREUtils.log('[Error] GREUtils.include: '+e.message + "("+scriptSrc+")");
        rv = - GREUtils.XPCOM.Cr().NS_ERROR_INVALID_ARG;
    }
    return rv;
};


/**
 * Synchronously loads and executes the script from the specified URL in a given
 * scope. The default scope is the GREUtils.global. 
 *
 * If the script is executed successfully, this method returns the NS_OK result code;
 * otherwise NS_ERROR_INVALID_ARG is returned. Once thes cript has been successfully
 * executed, this method will not execute the script again on subsequent calls; it will
 * simply return NS_OK.   
 *
 * @public
 * @static
 * @function 
 * @param {String} scriptSrc          This is the URL specifying the location of the script
 * @param {Object} scope              This is the the scope in which to execute the script
 * @return {Object}                   An NSResult return code  
 */
GREUtils.include_once = function(scriptSrc, scope) {

    var scriptJS = scriptSrc.substring( scriptSrc.lastIndexOf('/') + 1, scriptSrc.length );
    var scriptJS_loaded = encodeURIComponent(scriptJS)+"_LOADED";
    if(scriptJS_loaded in this._data) {
        return GREUtils.XPCOM.Cr().NS_OK;
    } else {
		var rv ;
        rv = this.include(scriptSrc, scope);
        if(rv == GREUtils.XPCOM.Cr().NS_OK) {
            this._data[scriptJS_loaded] = rv;
        }
        return rv;
    }
};


/**
 * Loads a script from the specified URL into a specific scope. The URL must be
 * either a file: or resource: URL pointing to a file on the disk. chrome: URLs
 * are not valid. 
 * 
 * Note that the script is cached when loaded and subsequent imports do not reload
 * a new version of the module, but instead use the previously cached version.
 * This means that a given module will be shared when imported multiple times.
 * Any modifications to data, objects or functions will be available in any scope
 * that has imported the module. For example, if the simple module were imported
 * into two different JavaScript scopes, changes in one scope can be observed in
 * the other scope. This provides an efficient and simple means of sharing code
 * between different scopes. 
 *
 * Default scope is the global object.
 * 
 * If the script is executed successfully, this method returns the NS_OK result code;
 * otherwise NS_ERROR_INVALID_ARG is returned. Once thescript has been successfully
 * executed, this method will not execute the script again on subsequent calls; it will
 * simply return NS_OK.   
 *
 * @public
 * @static
 * @name GREUtils.import
 * @function 
 * @param {String} url                This is the URL of the script to be loaded; The URL must be either a file: or resource: URL, pointing to a file on the disk. In particular, chrome: URLs are not valid
 * @param {Object} scope              This is the scope into which to import; defaults to the global object
 */
GREUtils.import_ = function(url, scope) {

	if(arguments.length == 1) {
		Components.utils['import']( url );		
	}else if(arguments.length == 2) {
		Components.utils['import']( url, scope );
	}
};

GREUtils['import'] = GREUtils.import_;

/**
 * Parses a string containing XUL code into an DOM object.
 * 
 * This method returns the document element from the DOM tree. In the case where
 * the document element has a single child node, that child node is returned
 * instead.
 * 
 * If parsing fails, null is returned.
 *        
 * @public
 * @static
 * @function 
 * @param {String} urlString      This is the string containing XUL
 * @param {Object} xmlns          This is the XUL namespace; defaults to the standard XUL namespace
 * @return {Object}               An nsIDOMElement|nsIDOMNodeDOM object
 */
GREUtils.domXULString = function (xulString, xmlns) {

    var xmlns = xmlns || "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
	
    // try with box container and namespace for easy use.
    var xulString2 = '<box xmlns="'+xmlns+'">'+xulString+'</box>';

    var parser=new DOMParser();
    var resultDoc=parser.parseFromString(xulString2,"text/xml");

    if (resultDoc.documentElement.tagName == "parsererror") {
        return null;
    } else {
        if (resultDoc.documentElement.childNodes.length == 1) {
            return resultDoc.documentElement.firstChild;
        }
        else {
            return resultDoc.documentElement;
        }
    }
};


/**
 * Parses a string containing XHTML into an DOM object.
 * 
 * This method returns the document element from the DOM tree. In the case where
 * the document element has a single child node, that child node is returned
 * instead.
 * 
 * If parsing fails, null is returned.      
 *  
 * @public
 * @static
 * @function 
 * @param {String} urlString          This is the string containing XUL
 * @param {Object} xmlns              This is the XUL namespace; defaults to the standard XHTML namespace
 * @return {Object}                   An nsIDOMElement|nsIDOMNode DOM object
 */
GREUtils.domHTMLString = function (htmlString, xmlns) {

    var xmlns = xmlns || "http://www.w3.org/1999/xhtml";
	
    // try with div container and namespace for easy use.
    var htmlString2 = '<div xmlns="'+xmlns+'">'+htmlString+'</div>';

    var parser=new DOMParser();
    var resultDoc=parser.parseFromString(htmlString2,"text/xml");
	
    if (resultDoc.documentElement.tagName == "parsererror") {
		return null;
	} else {
		if (resultDoc.documentElement.childNodes.length == 1) 
			return resultDoc.documentElement.firstChild;
		else 
			return resultDoc.documentElement;
	}

};


/**
 * Exits the event loop, and shut down the application.
 * 
 * This method takes an optional mode parameter which modifies how the application
 * is shutdown. For more details, please refer to the XPCOM nsIAppStartup interface. 
 *
 * For more information, please see nsIAppStartup
 *
 * @public
 * @static
 *  
 * @function 
 * @param {Integer} mode              This is the application shutdown mode; defaults to eAttemptQuit
 */
GREUtils.quitApplication = function() {
    var mode = arguments[0] || Components.interfaces.nsIAppStartup.eAttemptQuit;
    GREUtils.XPCOM.getUsefulService("app-startup").quit(mode);
};


/**
 * Restarts the application after quitting.
 * 
 * This method attempts to shut down and then restart the application. The application
 * will be restarted with the same profile and an empty command line. 
 * 
 * For more information, please see nsIAppStartup
 *
 * @public
 * @static
 * @function 
 */
GREUtils.restartApplication = function() {
    GREUtils.quitApplication((Components.interfaces.nsIAppStartup.eRestart | Components.interfaces.nsIAppStartup.eAttemptQuit));
};


/**
 * Attempts to reclaim memory by shrinking the heap.
 * 
 * This memory notifies registered observers of the "memory-pressure" topic of a 
 * "heap-minimize" condition. The pressure observers should subsequently schedule
 * a memory flush. 
 *
 * @public
 * @static
 * @function 
 */
GREUtils.ramback = function() {
    var observerService = GREUtils.XPCOM.getUsefulService("observer-service"); 
    
    // since we don't know the order of how things are going to go, fire these multiple times
    observerService.notifyObservers(null, "memory-pressure", "heap-minimize");
    observerService.notifyObservers(null, "memory-pressure", "heap-minimize");
    observerService.notifyObservers(null, "memory-pressure", "heap-minimize");

};

    
/**
 * Logs a message to the JavaScript console.
 * 
 * @public
 * @static
 * @function 
 * @param {String} sMsg               This is the message to log. 
 */
GREUtils.log = function (sMsg) {
    GREUtils.XPCOM.getUsefulService("consoleservice").logStringMessage(sMsg);
};


/**
 * Generates a globally unique ID.
 * 
 * @public
 * @static
 * @function 
 * @return {String}                   A globally unique ID
 */
GREUtils.uuid  = function () {
	var uuid = GREUtils.XPCOM.getService("@mozilla.org/uuid-generator;1","nsIUUIDGenerator").generateUUID().number;
	uuid = uuid.replace(/^{|}$/g, '');	    
    return uuid;
};


/**
 * Returns the amount of time in milliseconds that has passed since the last user
 * activity (i.e. mouse clicks or key presses).
 * 
 * @public
 * @static
 * @function 
 * @return {Integer}                  The user idle time
 */
GREUtils.getIdleTime = function() {
    return GREUtils.XPCOM.getUsefulService("idleservice").idleTime;
};


/**
 * Constructs an idleObserver object.
 * 
 * This method constructs an idle observer with the given function and idle time.
 * The idle observer implements the nsIObserver interface, and is activated through
 * the register() call. When registered, an idle notification will be generated and
 * passed to the given function by the XPCOM nsIIdleService when the user has been
 * idle for the given amount of time. When idle notifications are no longer needed,
 * the idle observer can be deactivated by calling unregister(). 
 * 
 * For details on the idle service, please refer to the XPCOM nsIIdleService interface.
 *   
 * Firefox3 and XULrunner 1.9 above only.
 * 
 * @public
 * @static
 * @function 
 * @param {Function} func             This is the function that is invoked when there is an idle notification
 * @param {Integer} time              This is the idle time  
 * @return {Object}                   The idle observer object
 */
GREUtils.getIdleObserver = function(func, time) {
	
	var idleObserver = {
		time: time,
		
        observe: function(subject, topic, data){
			try {
			 func(subject, topic, data);
			}catch(e) {
				
			}
		},
		
		unregister: function() {
			GREUtils.XPCOM.getUsefulService("idleservice").removeIdleObserver(this, this.time);
		},
		
		register: function() {
			GREUtils.XPCOM.getUsefulService("idleservice").addIdleObserver(this, this.time);
		}
    };

    return idleObserver;
};


/**
 * Generates a base-64 encoding of a string.
 * 
 * @public
 * @static
 * @function 
 * @param {String} str                This is the string to encode
 * @return {String}                   The base-64 encoded ASCII string
 */
GREUtils.base64Encode = function(str){
	return btoa(str);
};

/**
 * Decodes a string of data which has been encoded using base-64 encoding.
 * 
 * @public
 * @static
 * @param {String} str                This is the base-64 encoded string to decode
 * @return {String}                   The decoded string
 */
GREUtils.base64Decode = function(str){
	return atob(str);
};

/** 
 * Converts the first character of each word in a string to upper case.
 *
 * @public
 * @static
 * @function 
 * @param {String} word               This is the string of words
 * @return {String}                   The string with first character of each word converted to upper case
 */
GREUtils.ucwords = function(word) {
    return word.replace(/^(.)|\s(.)/g, function ( $1 ) { return $1.toUpperCase ( ); } );
};


/**
 * Converts the first character of a string to upper case.
 *
 * @public
 * @static
 * @function 
 * @param {String} word               This is the string
 * @return {String}                   The string with the first character converted to upper case
 */
GREUtils.ucfirst = function(word) {
    var f = word.charAt(0).toUpperCase();
    return f + word.substr(1, word.length-1);
};
