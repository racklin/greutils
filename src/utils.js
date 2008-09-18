/*
 * Useful Functions
 */
GREUtils._data = {};


/**
 * Get Application Infomation.
 *
 * see nsIXULAppInfo Interface.
 *
 * @public
 * @static
 * @function 
 * @return {Object}
 */
GREUtils.getAppInfo = function () {
    return GREUtils.XPCOM.getUsefulService("app-info");
};


/**
 * Get Runtime Infomation.
 *
 * see nsIXULRuntime Interface.
 *
 * @public
 * @static
 * @function 
 * @return {Object}
 */
GREUtils.getRuntimeInfo = function() {
    return GREUtils.XPCOM.getUsefulService("runtime-info");
};


/**
 * Get OS Infomation.
 *
 * see nsIXULRuntime Interface.
 *
 * @public
 * @static
 * @function 
 * @return {Object}
 */
GREUtils.getOSInfo = function() {
    return GREUtils.getRuntimeInfo().OS;
    
};

 
/**
 * is Linux OS
 *
 * @public
 * @static
 * @function 
 * @return {Boolean}
 */
GREUtils.isLinux = function(){
    return (GREUtils.getOSInfo().match(/Linux/,"i").length > 0);
};


/**
 * is Window OS
 *
 * @public
 * @static
 * @function 
 * @return {Boolean}
 */
GREUtils.isWindow = function() {
    return (GREUtils.getOSInfo().match(/Win/,"i").length > 0);
};


/**
 * is Mac OS
 *
 * @public
 * @static
 * @function 
 * @return {Boolean}
 */
GREUtils.isMac =function() {
    return (GREUtils.getOSInfo().match(/Mac|Darwin/,"i").length > 0);
};


/**
 * Synchronously loads and executes the script from the specified URL.
 *
 * default scope is window.
 *
 * @public
 * @static
 * @function 
 * @param {Object} scriptSrc
 * @param {Object} scope
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
 * Synchronously loads and executes the script from the specified URL.
 *
 * Specified URL will loads and executes once.
 *
 * default scope is window.
 *
 * @public
 * @static
 * @function 
 * @param {Object} scriptSrc
 * @param {Object} scope
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
 * This method was introduced in Firefox 3.
 * Is used for sharing code between different scopes easily.
 *
 * @public
 * @static
 * @function 
 * @name GREUtils.import
 * @param {Object} url
 * @param {Object} scope
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
 * Convert XUL String to DOM Elements.
 *
 * XUL String namespace is http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul
 * You can specified your custom namespace.
 *
 * @public
 * @static
 * @function 
 * @param {String} xulString
 * @param {String} xmlns
 * @return {Object}
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
 * Convert HTML String to DOM Elements.
 *
 * HTML String namespace is http://www.w3.org/1999/xhtml
 * You can specified your custom namespace.
 *
 * @public
 * @static
 * @function 
 * @param {String} htmlString
 * @param {String} xmlns
 * @return {Object}
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
 * Quit Application
 *
 * see nsIAppStartup
 *
 * @public
 * @static
 * @function 
 * @param {Number} mode
 */
GREUtils.quitApplication = function() {
    var mode = arguments[0] || Components.interfaces.nsIAppStartup.eAttemptQuit;
    GREUtils.XPCOM.getUsefulService("app-startup").quit(mode);
};


/**
 * Restart Application
 *
 * see nsIAppStartup
 *
 * @public
 * @static
 * @function 
 */
GREUtils.restartApplication = function() {
    GREUtils.quitApplication((Components.interfaces.nsIAppStartup.eRestart | Components.interfaces.nsIAppStartup.eAttemptQuit));
};


/**
 * Ram Back  notifyObservers memory-pressure
 *
 * see memory-pressure
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
 * Use Console.logStringMessage(msg);
 *
 * @public
 * @static
 * @function
 * @param {String} log message 
 */
GREUtils.log = function (sMsg) {
    GREUtils.XPCOM.getUsefulService("consoleservice").logStringMessage(sMsg);
};


/**
 * UUID Generator -  use XPCOM base for fast uuid generate.
 * 
 * @public
 * @static
 * @function
 * @return {String} uuid string 
 */
GREUtils.uuid  = function () {
	var uuid = GREUtils.XPCOM.getService("@mozilla.org/uuid-generator;1","nsIUUIDGenerator").generateUUID().number;
	uuid = uuid.replace(/^{|}$/g, '');	    
    return uuid;
};


/**
 * Get Idle Time - 
 * The amount of time in milliseconds that has passed since the last user activity.
 * Firefox3 and XULrunner 1.9 above only.
 * 
 * @public
 * @static
 * @function 
 * @return {Number} idle time
 */
GREUtils.getIdleTime = function() {
    return GREUtils.XPCOM.getUsefulService("idleservice").idleTime;
};


/**
 * getIdleObserver Helper
 * 
 * call register for Register IdleObserver 
 * call unregister for Remove IdleObserver
 * 
 * Firefox3 and XULrunner 1.9 above only.
 * 
 * @public
 * @static
 * @function 
 * @param {Function} func
 * @param {Integer} time
 * @return {Object} idle Observer Object
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
 * base-64 encode of a string
 * 
 * @public
 * @static
 * @function 
 * @param {String} str
 * @return {String} base64 string
 */
GREUtils.base64Encode = function(str){
	return btoa(str);
};

/**
 * base-64 decode of a string
 * 
 * @public
 * @static
 * @function 
 * @param {String} str
 * @return {String}
 */
GREUtils.base64Decode = function(str){
	return atob(str);
};

/** 
 * Uppercase the first character of each word in a string
 *
 * @public
 * @static
 * @function 
 * @param {String} word
 * @return {String}
 */
GREUtils.ucwords = function(word) {
    return word.replace(/^(.)|\s(.)/g, function ( $1 ) { return $1.toUpperCase ( ); } );
};


/**
 * Make a string's first character uppercase
 *
 * @public
 * @static
 * @function 
 * @param {String} word
 * @return {String}
 */
GREUtils.ucfirst = function(word) {
    var f = word.charAt(0).toUpperCase();
    return f + word.substr(1, word.length-1);
};
