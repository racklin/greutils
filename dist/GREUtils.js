/*
 * GREUtils - is simple and easy use APIs libraries for GRE (Gecko Runtime Environment).
 *
 * Copyright (c) 2007 Rack Lin (racklin@gmail.com)
 *
 * $Date: 2008-08-18 10:25:28 +0800 (星期一, 18 八月 2008) $
 * $Rev: 9 $
 */
/**
 * GREUtils is a set of convenience packages and functions useful for developing
 * applications for the Gecko Runtime Environment (XULRunner/FireFox).
 * 
 * GREUtils is built as a Javascript code module, so when it it loaded into
 * different JavaScript scopes, any modifications to data, objects, or functions
 * defined in GREUtils are visible to all the scopes.   
 * 
 * @public
 * @name GREUtils
 * @namespace GREUtils
 */
var GREUtils = GREUtils  ||  {version: "1.1.0"};

GREUtils.context = this;

GREUtils.global = (typeof window != 'undefined') ? window : this;


/**
 * Extends an object by merging properties from other objects.
 * 
 * Properties in the target object (the object being extended) will be overridden
 * by properties of the same name from the objects used for extending the target
 * object.  
 *
 * @public
 * @static
 * @function 
 * @param {Object} target                     This is the object being extended
 * @param {Object} source                     This is the object used to extend the target
 * @param {Object} extras                     This object, if provided, is also used to extend the target object
 * @return {Object}                           The original, extended target object
 */
GREUtils.extend = function () {
    // copy reference to target object
    var target = arguments[0] || {};
    var source = arguments[1] || {};
    var extras = arguments[2] || {};

    // Extend the base object
    for ( var i in source ) {
        // Prevent never-ending loop
        if ( target == source[i] )
            continue;

        // Don't bring in undefined values
        if ( source[i] != undefined )
            target[i] = source[i];
    }

    // Extend the extra object
    for ( var i in extras ) {
        // Prevent never-ending loop
        if ( target == extras[i] )
            continue;

        // Don't bring in undefined values
        if ( extras[i] != undefined )
            target[i] = extras[i];
    }

    // Return the modified object
    return target;
};


/**
 *  Extends an object or a function with a getInstance() method to support the
 *  Singleton pattern. Invoking the getInstance() method on the extended
 *  object will always return the same instance of the object.
 *  
 *  The intent of the Singleton pattern as defined in Design Patterns is to
 *  "ensure that a class has only one instance, and provide a global point of access to it".
 *
 * @public
 * @static
 * @function
 * @param {Object|Function} target            This is the object or function to extend as a Singleton
 */
GREUtils.singleton = function(target) {
	
	GREUtils.extend(target, {
	    __instance__: null, //define the static property
	    
		// return single instance
	    getInstance: function getInstance(){
	    
	        if (this.__instance__ == null) {
	            this.__instance__ = new this();
	        }
	        
	        return this.__instance__;
	    }
	});
};


/**
 * Establishes an inheritance relationship between two classes.
 * 
 * The child class inherits methods and attributes from the parent class. After
 * inheritance has been established, an instance of the child class can use
 * this._super to invoke parent methods.
 * 
 * @public
 * @static
 * @function
 * @param {Function} childFunc                This is the child class
 * @param {Function} parentFunc               This is the parent class
 */
GREUtils.inherits = function(childFunc, parentFunc) {

	// The dummy class constructor
    function Class() {};
	
	// Populate our constructed prototype object
    Class.prototype = parentFunc.prototype;
	
	// Add a new ._super that is the super-class
    childFunc._super = parentFunc.prototype;
	
    childFunc.prototype = new Class();
	
	// Enforce the constructor to be what we expect
    childFunc.prototype.constructor = childFunc;
    
    // auto support singleton if parent getInstance exists
    if(typeof parentFunc.getInstance == 'function') {
        GREUtils.singleton(childFunc);
    }

};


/**
 * Creates a namespace in a context. The namespace is also declared in the
 * GREUtils global context, overriding any previously declared namespace of the
 * same name.  
 * 
 * @public
 * @static
 * @function
 * @param {String} name                    This is the name of the namespace
 * @param {Object} context                 This is the context in which to declare the namespace; defaults to the GREUtils global context
 */
GREUtils.define = function(name, context) {

  GREUtils.createNamespace(name, {}, context);

};


/**
 * Declares in current scope's global context a namespace that has been declared
 * in another scope. After this declaration, objects in the source namespace will
 * become available in the current scope. 
 * 
 * If the source namespace is not found in the specified context, an attempt will
 * be made to locate it in the GREUtils global context.  
 *      
 * @public
 * @static
 * @function
 * @param {String} name                     This is the name of the source namespace
 * @param {Object} context                  This is the context in which the source namespace has been declared
 */
GREUtils.using = function(name, context) {

  GREUtils.createNamespace(name,  GREUtils.getObjectByNamespace(name, context));

};


/**
 * Builds an object structure for the provided namespace path,
 * example:
 * "a.b.c" -> a = {};a.b={};a.b.c={};
 * Used by GREUtils.namespace
 * 
 * @private
 * @static
 * @function
 * @param {string} name 			  Name of the object that this file defines.
 * @param {Object} object 			Object to expose at the end of the path.
 * @param {Object} context			Create Namespace in context.
 */
GREUtils.createNamespace = function(name, object, context) {
  var parts = name.split('.');
  var cur = context || GREUtils.global;
  var part;

  // keep localContext
  // var curLocal = GREUtils.context;

  while ((part = parts.shift())) {
    if (!parts.length && GREUtils.isDefined(object)) {
      // last part and we have an object; use it
      cur[part] = object;
      
      // add to GREUtils jsm context
      // curLocal[part] = object;

    } else if (cur[part]) {
      cur = cur[part];
      // curLocal = curLocal[part] = cur;
    } else {
      cur = cur[part] = {};
      // curLocal = curLocal[part] = cur;
    }
  }

};

/**
 * Returns a namespace object based on its fully qualified name in the specified context.
 *  
 * @public
 * @static  
 * @function 
 * @param {String}      name          The fully qualified name of the namespace.
 * @param {Object}      context       The context in which the namespace was declared
 * @return {Object}                   The namespace object or, if not found, null.
 */
GREUtils.getObjectByNamespace = function(name, context){
	
  var parts = name.split('.');
  var cur = context || GREUtils.global;
  // var recursive = (cur == GREUtils.context);
  
  for (var part; part = parts.shift(); ) {
    if (cur[part]) {
      cur = cur[part];
    } else {
      cur = null;
      break;
    }
  }

  /*
  if (cur == null && !recursive) {
    cur = GREUtils.getObjectByNamespace(name, GREUtils.context);
  }*/

  return cur;

};

/**
 * Checks if an object is defined
 * 
 * @public
 * @static
 * @function
 * @param {Object} type               This is the object to check
 * @return {Boolean}                  "true" if the object is defined; "false" otherwise
 */
GREUtils.isDefined = function(type) {
    return typeof type != 'undefined';
};


/**
 * Checks if an object is a function.
 * 
 * @public
 * @static
 * @function
 * @param {Object} type               This is the object to check
 * @return {Boolean}                  "true" if the object is a function; "false" otherwise
 */
GREUtils.isFunction = function(type) {
  return typeof type == "function";
};


/**
 * Checks if an object is null.
 * 
 * @public
 * @static
 * @function
 * @param {Object} type               This is the object to check
 * @return {Boolean}                  "true" if the object is null; "false" otherwise
 */
GREUtils.isNull = function(type) {
  return type === null;
};


/**
 * Checks if an object is defined and not null.
 * 
 * @public
 * @static
 * @function
 * @param {Object} type			          This is the object to check
 * @return {Boolean}                  "true" if the object is defined and not null; "false" otherwise
 */
GREUtils.isDefineAndNotNull = function(type) {
  return GREUtils.isDefined(type) && !GREUtils.isNull(type);
};


/**
 * Checks if an object is an array.
 * 
 * @public
 * @static
 * @function
 * @param {Object} type               This is the object to check
 * @return {Boolean}                  "true" if the object is an array; "false" otherwise
 */
GREUtils.isArray = function(type) {
  return typeof type == 'array';
};

/**
 * Checks if an object is a string.
 * 
 * @public
 * @static
 * @function
 * @param {Object} type               This is the object to check
 * @return {Boolean}                  "true" if the object is a string; "false" otherwise
 */
GREUtils.isString = function(type) {
  return typeof type == 'string';
};


/**
 * Checks if an object is a boolean.
 * 
 * @public
 * @static
 * @function
 * @param {Object} type               This is the object to check
 * @return {Boolean}                  "true" if the object is a boolean; "false" otherwise
 */
GREUtils.isBoolean = function(type) {
  return typeof type == 'boolean';
};


/**
 * Checks if an object is a number.
 * 
 * @public
 * @static
 * @function
 * @param {String} type               This is the object to check
 * @return {Boolean}                  "true" if the object is a number; "false" otherwise
 */
GREUtils.isNumber = function(type) {
  return typeof type == 'number';
};


/**
 * Checks if the parameter is an object, a function, or an array.
 * 
 * @public
 * @static
 * @function
 * @param {Object} type               This is the parameter to check
 * @return {Boolean}                  "true" if the parameter is an object, function, or array; "false" otherwise
 */
GREUtils.isObject = function(type) {
  var type = typeof type;
  return type == 'object' || type == 'array' || type == 'function';
};

/**
 * Returns the current time.
 * 
 * This method returns the current time expressed as the number of milliseconds since
 * January 1, 1970, 00:00:00 UTC.
 * 
 * @public
 * @static
 * @function
 * @return {Number}                       The current time
 */
GREUtils.now = Date.now || (function() {
  return (new Date()).getTime();
});
/**
 * This is a set of utility functions for accessing XPCOM component interfaces
 * and services.
 *
 * @public
 * @name GREUtils.XPCOM
 * @namespace GREUtils.XPCOM
 */
GREUtils.define('GREUtils.XPCOM');

try {
    // try assign Components.classes for privilege check // shortcut by exception :D
    var _CC = Components.classes;
    GREUtils.XPCOM._EnablePrivilege = true;
}catch(ex) {
    // need Privilege and any XPCOM Operation need enablePrivilege.
    // netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
    GREUtils.XPCOM._EnablePrivilege = false;
}

/**
 * Returns the XPCOM component by class name.
 *
 * This method returns null if the component is not found (i.e. component name does
 * not exist in Components.classes[]).
 *
 * @public
 * @static
 * @function
 * @param {String} cName        This is the name of the XPCOM component
 * @return {Object}             The XPCOM component
 */
GREUtils.XPCOM.Cc = function (cName) {
    try {
        if(cName in Components.classes) return Components.classes[cName];
        return null;
    }catch(ex) {
        // netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
		GREUtils.log('[Error] GREUtils.XPCOM.Cc: '+ex.message);
        return null;
    }
};

/**
 * Returns the XPCOM interface by interface name.
 *
 * This method returns null if the interface is not found (i.e. interface name does
 * not exist in Components.interfaces[]). If an object is passed in as
 * parameter "ifaceName" then this object is returned.
 *
 * @public
 * @static
 * @function
 * @param {String} ifaceName    This is the name of the XPCOM interface
 * @return {Object}             The XPCOM interface
 */
GREUtils.XPCOM.Ci = function (ifaceName) {
    try {
        switch (typeof(ifaceName)) {
            case "object":
                return ifaceName;
                break;

            case "string":
                return Components.interfaces[ifaceName];
                break;
        }
    } catch (ex) {
		GREUtils.log('[Error] GREUtils.XPCOM.Ci: '+ex.message);
        return null;
    }
};


/**
 * Returns the Components.results array whose elements are the names of common
 * XPCOM result codes, with each value being that of the corresponding result code.
 * 
 * Elements in this array can be used to test against unknown NSResult
 * variables or can be 'thrown' to indicate failure.
 *
 * @public
 * @static
 * @function
 * @return {Array}              Common XPCOM result codes
 */
GREUtils.XPCOM.Cr = function (){
    try {
        return Components.results;
    }catch(ex) {
        GREUtils.log('[Error] GREUtils.XPCOM.Cr: '+ex.message);
        return [];
    }
};


/**
 * Returns an XPCOM service.
 *
 * This method returns the XPCOM service identified by its Component class and
 * interface name. If the service does not exist, null is returned.
 *
 * @public
 * @static
 * @function
 * @param {String} cName        This is the name of the XPCOM component
 * @param {String} iName        This is the name of the XPCOM interface; can be null
 * @return {Object}             The XPCOM service
 */
GREUtils.XPCOM.getService = function (cName, ifaceName) {
    var cls = GREUtils.XPCOM.Cc(cName);
    var iface = GREUtils.XPCOM.Ci(ifaceName);

    try {
        if (cls && iface) {
            return cls.getService(iface);
        }
        else if (cls) {
                return cls.getService();
        }
        return null;
    }
    catch (ex) {
		GREUtils.log('[Error] GREUtils.XPCOM.getService: '+ex.message);
        return null;
    }
};


/**
 * Returns an XPCOM instance.
 *
 * This method returns an instance of an XPCOM component with a given interface name.
 * If the component or the interface does not exist, or if the instantiation fails,
 * then null is returned.
 *
 * @public
 * @static
 * @function
 * @param {String} cName        This is the name of the XPCOM component
 * @param {String} iName        This is the name of the XPCOM interface
 * @return {Object}             An instance of the XPCOM component with the given interface
 */
GREUtils.XPCOM.createInstance = function (cName, ifaceName) {
    var cls = GREUtils.XPCOM.Cc(cName);
    var iface = GREUtils.XPCOM.Ci(ifaceName);

    try {
        if (cls && iface) {
            return cls.createInstance(iface);
        }
    }
    catch (ex) {
		GREUtils.log('[Error] GREUtils.XPCOM.createInstance: '+ex.message);
        return null;
    }
};


/**
 * Retrieves a specific interface of an instance of XPCOM component.
 *
 * This method gets the specified interface for an instance of an XPCOM component
 * if the interface is supported by the component. Otherwise null is returned.
 *
 * @public
 * @static
 * @function
 * @param {Object} obj          This is an instance of XPCOM component
 * @param {String} ifaceName    This is the name of the XPCOM interface
 * @return {Object}             The XPCOM component instance with the specified interface
 */
GREUtils.XPCOM.queryInterface = function (obj, ifaceName) {

    if (typeof(obj) == "object") {
        var iface = GREUtils.XPCOM.Ci(ifaceName);
		try {
		  if (iface) return obj.QueryInterface(iface);
		}catch(ex) {
			GREUtils.log('[Error] GREUtils.XPCOM.queryInterface: '+ex.message);
		  return null;
		}
    }
    return obj;

};


/**
 * Creates a JavaScript function which can be used to create or construct new instances
 * of XPCOM components.
 *
 * If an interface is specified, QueryInterface will be called on each newly-created
 * instance with this interface.
 *
 * This method can also accept an optional initializer function (passed in by name),
 * which will be called on the newly-created instance, using the arguments provided
 * to the created function when called
 *
 * If the method fails to create the constructor function, null is returned.
 *
 * This method is a wrapper for Components.Constructor().
 *
 * @public
 * @static
 * @function
 * @param {String} aCID         This is the contract ID of an XPCOM component
 * @param {String} aInterface   This is the name of the XPCOM interface
 * @param {String} aFunc        This is the name of the initializer function
 * @return {Object}             An XPCOM component constructor
 */
GREUtils.XPCOM.getConstructor = function (aCID, aInterface, aFunc) {
  try {
    if (aFunc) {
		return new Components.Constructor(aCID, aInterface, aFunc);
	}
	else {
		return new Components.Constructor(aCID, aInterface);
	}
  } catch (ex) {
      GREUtils.log('[Error] GREUtils.XPCOM.getConstructor: ' + ex.message);
  	return null;
  }
};

/**
 * Predefine useful XPCOM Service Name and Interface
 *
 * @private
 * @static
 * @field
 */
GREUtils.XPCOM._usefulServiceMap = {
    "jssubscript-loader": ["@mozilla.org/moz/jssubscript-loader;1", "mozIJSSubScriptLoader"],
    "app-info": ["@mozilla.org/xre/app-info;1", "nsIXULAppInfo"],
    "runtime-info": ["@mozilla.org/xre/app-info;1", "nsIXULRuntime"],
    "app-startup": ['@mozilla.org/toolkit/app-startup;1','nsIAppStartup'],
	"sound": ["@mozilla.org/sound;1", "nsISound"],
    "observer-service": ["@mozilla.org/observer-service;1", "nsIObserverService"],
    "consoleservice": ["@mozilla.org/consoleservice;1", "nsIConsoleService"],
	"prompt-service": ["@mozilla.org/embedcomp/prompt-service;1", "nsIPromptService"],
	"window-mediator": ["@mozilla.org/appshell/window-mediator;1","nsIWindowMediator"],
	"window-watcher": ["@mozilla.org/embedcomp/window-watcher;1","nsIWindowWatcher"],
	"thread-manager": ["@mozilla.org/thread-manager;1", "nsIThreadManager"],
	"idleservice": ["@mozilla.org/widget/idleservice;1", "nsIIdleService"],
	"json": ["@mozilla.org/dom/json;1", "nsIJSON"],
	"unicodeconverter": ["@mozilla.org/intl/scriptableunicodeconverter","nsIScriptableUnicodeConverter"],
	"hash": ["@mozilla.org/security/hash;1", "nsICryptoHash"],
	"xmlhttprequest": ["@mozilla.org/xmlextras/xmlhttprequest;1", "nsIXMLHttpRequest"]
};


/**
 * Predefine useful XPCOM Service object pool.
 *
 * @private
 * @static
 * @field
 */
GREUtils.XPCOM._usefulServicePool = {};


/**
 * Returns commonly used XPCOM services.
 *
 * This method is a shortcut for retrieving commonly used XPCOM services. Each
 * service is identified by an abbreviated name. If the service does not exist,
 * null is returned.
 *
 * The abbreviation scheme is private to GREUtils.
 *
 * @public
 * @static
 * @function
 * @param {String} serviceName  This is the abbreviated name of the XPCOM service
 * @return {Object}             The XPCOM service
 */
GREUtils.XPCOM.getUsefulService = function (serviceName) {
	if (GREUtils.XPCOM._usefulServicePool[serviceName] && GREUtils.isXPCOM(GREUtils.XPCOM._usefulServicePool[serviceName]))
		return GREUtils.XPCOM._usefulServicePool[serviceName];

	if(serviceName in GREUtils.XPCOM._usefulServiceMap) {
		var service = this.getService(GREUtils.XPCOM._usefulServiceMap[serviceName][0], GREUtils.XPCOM._usefulServiceMap[serviceName][1]);
		if (GREUtils.isXPCOM(service)) {
			GREUtils.XPCOM._usefulServicePool[serviceName] = service;
			return GREUtils.XPCOM._usefulServicePool[serviceName];
		} else {
			return null;
		}

    }
    return null;
};


/**
 * Checks if an object is an XPCOM component.
 *  
 * @public
 * @static
 * @function
 * @param {Object} val            This is the object to check
 * @return {Boolean}              "true" if the object is an XPCOM component; false otherwise
 */
GREUtils.isXPCOM = function(val) {
	var res = GREUtils.XPCOM.queryInterface(val, "nsISupports");
    return res != null && typeof res == "object";
};
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
    if (GREUtils.getOSInfo().match(/Linux|SunOS|BSD/gi)) return true;
    return false;
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
    if (GREUtils.getOSInfo().match(/Winnt/gi)) return true;
    return false;
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
    if(GREUtils.getOSInfo().match(/Mac|Darwin/gi)) return true;
    return false;
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
 * @param {Number} mode               This is the application shutdown mode; defaults to eAttemptQuit
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
GREUtils.gc = function() {
    var observerService = GREUtils.XPCOM.getUsefulService("observer-service"); 
    
    // since we don't know the order of how things are going to go, fire these multiple times
    observerService.notifyObservers(null, "memory-pressure", "heap-minimize");
    observerService.notifyObservers(null, "memory-pressure", "heap-minimize");
    observerService.notifyObservers(null, "memory-pressure", "heap-minimize");

	if(typeof window != 'undefined' ) {
		try {
		   window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
		  .getInterface(Components.interfaces.nsIDOMWindowUtils)
		  .garbageCollect();
		}catch(e) {}
		}

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
	GREUtils.gc() ;
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
 * @return {Number}                   The user idle time
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
 * @param {Number} time               This is the idle time  
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
/**
 * This is a set of functions for common file operations.
 *
 * @public
 * @name GREUtils.File
 * @namespace GREUtils.File
 */
GREUtils.define('GREUtils.File');

GREUtils.File = {

    FILE_RDONLY:       0x01,
    FILE_WRONLY:       0x02,
    FILE_RDWR:         0x04,
    FILE_CREATE_FILE:  0x08,
    FILE_APPEND:       0x10,
    FILE_TRUNCATE:     0x20,
    FILE_SYNC:         0x40,
    FILE_EXCL:         0x80,

    FILE_READ_MODE: "r",
    FILE_WRITE_MODE: "w",
    FILE_APPEND_MODE: "a",
    FILE_BINARY_MODE: "b",

    NORMAL_FILE_TYPE: 0x00,
    DIRECTORY_TYPE:   0x01,

    FILE_CHUNK: 1024, // buffer for readline => set to 1k
    FILE_DEFAULT_PERMS: 0644,
    DIR_DEFAULT_PERMS:  0755
};


/**
 * Returns a reference object to a local file location.<br/>
 * <br/>
 * This method takes a string representing the full file path and returns an nsILocalFile
 * object representing that file location.<br/>
 * <br/>
 * If "notCheckExists" is true, then the method returns the reference object
 * even if no file exists at the given path. When "notCheckExists" is false,
 * a file is created at the given path if it does not already exist and if
 * "autoCreate" is true.<br/>
 * <br/>
 * If no file exists at the location or cannot be created (if "autoCreate" is true),
 * null is returned.
 *
 * @public
 * @static
 * @function
 * @param {String} sFile          This is the full path to the file
 * @param {Boolean} autoCreate    This flag indicates whether the file should be created if it does not exist; defaults to false
 * @param {Boolean} notCheckExists This flag indicates whether the file does not exist; defaults to false
 * @return {nsILocalFile}         The file location reference
 */
GREUtils.File.getFile = function(sFile){
    
    if (sFile instanceof Components.interfaces.nsIFile ) return sFile;

    var autoCreate = arguments[1] || false;
    var notcheckExists = arguments[2] || false;
    if (/^file:/.test(sFile))
        sFile = sFile.replace("file://", "");
        
    var obj = GREUtils.XPCOM.createInstance('@mozilla.org/file/local;1', 'nsILocalFile');
    obj.initWithPath(sFile);
    
    if (obj.exists() || notcheckExists)
        return obj;
    else
    if (autoCreate) {
        try {
            obj.create(GREUtils.File.NORMAL_FILE_TYPE, GREUtils.File.FILE_DEFAULT_PERMS);
            return obj;
        }
        catch (ex) {
            return null;
        }
    }
    else {
        return null;
    }
};


/**
 * Constructs an URL reference from an URL string.
 *
 * This method takes a URL string and returns the corresponding URL object. If
 * the URL points to a file resource (i.e. protocol="file:"), this method returns
 * an nsIFileURL. Otherwise an nsIURL is returned.
 *
 * @public
 * @static
 * @function
 * @param {String} sURL           This is the URL string
 * @return {nsIURL|nsIFileURL}    An URL object
 */
GREUtils.File.getURL = function(sURL){
    var mURL = null;
    if (!/^file:/.test(sURL)) {
        mURL = GREUtils.XPCOM.createInstance("@mozilla.org/network/standard-url;1", "nsIURL");
        mURL.spec = sURL;
    }
    else {
        mURL = GREUtils.XPCOM.getService("@mozilla.org/network/io-service;1", "nsIIOService").newURI(sURL, "UTF-8", null);
        mURL = GREUtils.XPCOM.queryInterface(mURL, "nsIFileURL");
    }
    return mURL;
};


/**
 * Opens an output stream on a local file.
 *
 * This method opens an output stream on the specified file with the given mode
 * and permission. The file is specified either with a string containing its path, or
 * with a file location reference (nsILocalFile). The file is created with
 * the specified permission if it does not already exist.
 *
 * The mode flag can contain valid combinations of the following:
 *
 *  - "w" (write-only)
 *  - "a" (append)
 *  - "b" (binary)
 *
 * Normally an nsIFileOutputStream object is returned; however, if binary mode ("b") is
 * specified, this method returns an nsIBinaryOutputStream
 * object instead.
 *
 * Returns null if the local file cannot be read or if it cannot be created.
 *
 * @public
 * @static
 * @function
 * @param {Object} file           This is the file. It can be a string containing the file path or a file location reference
 * @param {String} mode           This is the mode flag
 * @param {Number} perm           This is the permission with which to create the file (if needed)
 * @return {nsIFileOutputStream|nsIBinaryOutputStream}                       A file output stream
 */
GREUtils.File.getOutputStream = function(file, mode, perm){
    var nsIFile = (typeof(file) == "string") ? this.getFile(file) : file;

    var NS_MODE = (GREUtils.File.FILE_TRUNCATE | GREUtils.File.FILE_WRONLY);
    if (typeof(mode) == "string" && mode.indexOf("w") != -1)
        NS_MODE = (GREUtils.File.FILE_TRUNCATE | GREUtils.File.FILE_WRONLY);
    if (typeof(mode) == "string" && mode.indexOf("a") != -1)
        NS_MODE = (GREUtils.File.FILE_APPEND | GREUtils.File.FILE_RDWR);

    var nsPerm = perm || GREUtils.File.FILE_DEFAULT_PERMS;

    if (nsIFile == null) {
        var nsIFile = GREUtils.XPCOM.createInstance('@mozilla.org/file/local;1', 'nsILocalFile');
        nsIFile.initWithPath(file);
        nsIFile.create(GREUtils.File.NORMAL_FILE_TYPE, nsPerm);
    }

    var fs = GREUtils.XPCOM.createInstance("@mozilla.org/network/file-output-stream;1", "nsIFileOutputStream");

    fs.init(nsIFile, NS_MODE, nsPerm, null);

    if (typeof(mode) == "string" && mode.indexOf("b") != -1) {
        var binstream = GREUtils.XPCOM.createInstance("@mozilla.org/binaryoutputstream;1", "nsIBinaryOutputStream");
        binstream.setOutputStream(fs);
        return binstream;
    }
    else
        return fs;

};

/**
 * Opens an input stream on a local file.
 *
 * This method opens an input stream on the specified file with the given mode
 * and permission. The file is specified either with a string containing its path, or
 * with a file location reference (nsILocalFile). Null is returned if the file does
 * not already exist.
 *
 * The file is opened in read-only mode.
 *
 * Normally an nsIScriptableInputStream object is returned; however, if binary mode ("b")
 * is specified (through the "mode" parameter), this method returns an nsIBinaryInputStream
 * object instead.
 *
 * @public
 * @static
 * @function
 * @param {Object} file           This is the file. It can be a string containing the file path or a file location reference
 * @param {String} mode           This is the mode flag
 * @param {Number} perm           This is the permission with which to create the file (if needed); defaults to FILE_DEFAULT_PERMS
 * @return {nsIScritableInputStream|nsIBinaryInputStream}                   A file output stream
 */
GREUtils.File.getInputStream = function(file, mode, perm){
    var nsIFile = (typeof(file) == "string") ? this.getFile(file) : file;

    if (nsIFile == null)
        return null;

    var NS_MODE = GREUtils.File.FILE_RDONLY;
    if (typeof(mode) == "string" && mode.indexOf("r") != -1)
        NS_MODE = GREUtils.File.FILE_RDONLY;

    var nsPerm = perm || GREUtils.File.FILE_DEFAULT_PERMS;

    var fs = GREUtils.XPCOM.createInstance("@mozilla.org/network/file-input-stream;1", "nsIFileInputStream");

    fs.init(nsIFile, NS_MODE, nsPerm, null);

    if (typeof(mode) == "string" && mode.indexOf("b") != -1) {
        var binstream = GREUtils.XPCOM.createInstance("@mozilla.org/binaryinputstream;1", "nsIBinaryInputStream");
        binstream.setInputStream(fs);
        return binstream;
    }
    else {
        var scriptstream = GREUtils.XPCOM.createInstance("@mozilla.org/scriptableinputstream;1", "nsIScriptableInputStream");
        scriptstream.init(fs);
        return scriptstream;
    }
};

/**
 * Opens a line input stream on a local file.
 *
 * This method opens a read-only input stream on the specified file. The file is
 * specified either with a string containing its path, or with a file location
 * reference (nsILocalFile).
 *
 * This method returns an nsILineInputStream, or null if the file cannot be opened
 * for reading.
 *
 * @public
 * @static
 * @function
 * @param {Object} file           This is the file. It can be a string containing the file path or a file location reference
 * @return {nsIScritableInputStream|nsIBinaryInputStream}                       A file output stream
 */
GREUtils.File.getLineInputStream = function(file){
    var nsIFile = (typeof(file) == "string") ? this.getFile(file) : file;
    if (nsIFile == null)
        return null;

    var fs = GREUtils.XPCOM.createInstance("@mozilla.org/network/file-input-stream;1", "nsIFileInputStream");
    fs.init(nsIFile, GREUtils.File.FILE_RDONLY, GREUtils.File.FILE_DEFAULT_PERMS, null);
    return GREUtils.XPCOM.queryInterface(fs, "nsILineInputStream");
};


/**
 * Reads in the entire content of a file as a series of lines.
 *
 * This method reads in the specified file on a line-by-line basis, where each line
 * is a possibly zero-length sequence of 8-bit characters terminated by a CR, LF, CRLF,
 * LFCR, or EOF.
 *
 * This method returns the content of the file as an array of lines, with the line
 * terminators stripped out.
 *
 * @public
 * @static
 * @function
 * @param {Object} file           This is the file. It can be a string containing the file path or a file location reference
 * @return {Array of String}      The file content as an array of lines
 */
GREUtils.File.readAllLine = function(file){
    var lineStream = this.getLineInputStream(file);
    var lines = [];
    var buf = {
        value: ""
    };

    if (!lineStream)
        return lines;

    do {
        var rv = lineStream.readLine(buf);
        lines.push(buf.value);
    }
    while (rv);

    lineStream.close();
    return lines;
};

/**
 * Reads in the entire content of a file as a series of bytes.
 *
 * This method reads in the specified file as a binary stream containing untagged,
 * big-endian binary data.
 *
 * This method returns the content of the file as a binary String.
 *
 * @public
 * @static
 * @function
 * @param {Object} file           This is the file. It can be a string containing the file path or a file location reference
 * @return {String}               The file content as a binary String
 */
GREUtils.File.readAllBytes = function(file){
    var nsIFile = (typeof(file) == "string") ? this.getFile(file) : file;
    var size = nsIFile.fileSize;
    var binStream = this.getInputStream(nsIFile, "rb", GREUtils.File.FILE_DEFAULT_PERMS);
    var binaryString = binStream.readBytes(size);
    binStream.close();
    return binaryString;

};

/**
 * Retrieves the content located at an URL.
 *
 * This method retrieves the content located at the given URL, which can reference
 * a remote location. The content is returned as a String. If the URL cannot be
 * retrieved, an empty string is returned.
 *
 * @public
 * @static
 * @function
 * @param {String} aURL           This is the URL from which to retrieve content
 * @return {String}               The URL content as a String
 */
GREUtils.File.getURLContents = function(aURL) {

    var ioService=GREUtils.XPCOM.getService("@mozilla.org/network/io-service;1", "nsIIOService");
    var scriptableStream=GREUtils.XPCOM.getService("@mozilla.org/scriptableinputstream;1", "nsIScriptableInputStream");

    var str = "";
    try {
        var channel=ioService.newChannel(aURL,null,null);
        var input=channel.open();
        scriptableStream.init(input);

        var bytes;
        while ((bytes = input.available()) > 0) {
            str += scriptableStream.read(bytes);
        }
        scriptableStream.close();
        input.close();

    }catch(e) {

    }
    return str;
};

/**
 * Writes an array of strings to a file.
 *
 * This method takes a array of strings and write each string in order to a file.
 * A newline character ('\n') is appended to each string before writing.
 *
 * @public
 * @static
 * @function
 * @param {Object} file           This is the file. It can be a string containing the file path or a file location reference
 * @param {Array} lines           This is the Array of Strings to write
 */
GREUtils.File.writeAllLine = function(file, lines){
    var outputStream = this.getOutputStream(file, "w");

    if (!outputStream)
        return;

    lines.forEach(function(buf){
        buf = "" + buf;
        outputStream.write(buf + "\n", buf.length + 1);
    });

    outputStream.close();
};

/**
 * Writes a binary data to a file.
 *
 * @public
 * @static
 * @function
 * @param {Object} file           This is the file. It can be a string containing the file path or a file location reference
 * @param {String} buf            This is the binary data to write
 */
GREUtils.File.writeAllBytes = function(file, buf){
    var outputStream = this.getOutputStream(file, "wb");

    if (!outputStream)
        return;

    outputStream.write(buf, buf.length);

    outputStream.close();
};


/**
 * Spawns a new process to run an executable file.
 *
 * This method runs an executable file in a newly spawned process. The "aArgs" parameter
 * contains a array of arguments to pass to this executable on its command line. The "blocking"
 * parameter controls whether to block until the process terminates.
 *
 * Normally the process ID of the newly spawn process is returned. A negative return
 * value indicates an error condition:
 *    -1: the file does not exist
 *    -2: the file path points to a directory
 *    -3: other exceptions
 *
 * @public
 * @static
 * @function
 * @param {Object} nsFile         This is the executable file. It can be a string containing the file path or a file location reference
 * @param {String} aArgs          This is the array of arguments to pass to the executable
 * @param {Boolean} blocking      If "true", the method blocks until the process terminates; defaults to false
 * @return {Number}               The process ID
 */
GREUtils.File.run = function(nsFile, aArgs, blocking){
    var nsIFile = (typeof(nsFile) == "string") ? this.getFile(nsFile) : nsFile;
    if (nsIFile == null)
        return -1;
    if (nsIFile.isDirectory())
        return -2;

    var blocking = blocking || false;

    try {
        var process = GREUtils.XPCOM.createInstance("@mozilla.org/process/util;1", "nsIProcess");
        // var process = GREUtils.XPCOM.getService("@mozilla.org/process/util;1", "nsIProcess");

        process.init(nsIFile);

        var len = 0;
        if (aArgs)
            len = aArgs.length;
        else
            aArgs = null;
        rv = process.run(blocking, aArgs, len);
    }
    catch (e) {
        GREUtils.log('[Error] GREUtils.File.run: '+e.message);
        rv = -3
    }
    return rv;
};

/**
 * Spawns a new process to run an executable file.
 *
 * This method runs an executable file in a newly spawned process. The "aArgs" parameter
 * contains a array of arguments to pass to this executable on its command line. The "blocking"
 * parameter controls whether to block until the process terminates.
 *
 * @public
 * @static
 * @function
 * @param {Object} nsFile         This is the executable file. It can be a string containing the file path or a file location reference
 * @param {String} aArgs          This is the array of arguments to pass to the executable
 * @param {Boolean} blocking      If "true", the method blocks until the process terminates; defaults to false
 */
GREUtils.File.exec = function(){
    GREUtils.File.run.apply(this, arguments);
}

/**
 * Resolves a Chrome URL into a loadable URL using information in the Chrome registry.
 * Returns a string representation of the loadable URL if successful; otherwise null
 * is returned.
 *
 * @public
 * @static
 * @function
 * @param {String} chromePath     This is the chrome URL
 * @return {String} url           The loadable URL
 */
GREUtils.File.chromeToURL = function(chromePath){
    
    var uri = GREUtils.File.getURL(chromePath);
    var cr = GREUtils.XPCOM.getService("@mozilla.org/chrome/chrome-registry;1", "nsIChromeRegistry");
    var rv = null;
    try {
        var result = cr.convertChromeURL(uri);
        if (!GREUtils.isString(result)) {
            rv = cr.convertChromeURL(uri).spec;
        }
        else {
            rv = result;
        }
    }
    catch (e) {
        GREUtils.log('[Error] GREUtils.File.chromeToURL: '+e.message);
        rv = null;
    }
    return rv;
};

/**
 * Resolves a Chrome URL into a file path using information in the Chrome registry.
 * Returns null if resolution fails.
 *
 * @public
 * @static
 * @function
 * @param {String} chromePath     This is the chrome URL
 * @return {String} filepath      The file path
 */
GREUtils.File.chromeToPath = function(chromePath){
    
    var uri = GREUtils.File.getURL(chromePath);
    var cr = GREUtils.XPCOM.getService("@mozilla.org/chrome/chrome-registry;1", "nsIChromeRegistry");
    var rv = null;
    try {
        var result = cr.convertChromeURL(uri);
        if (!GREUtils.isString(result)) {
            result = cr.convertChromeURL(uri).spec;
        }

        if (!/^file:/.test(result))
            result = "file://" + result;

        var fph = GREUtils.XPCOM.getService("@mozilla.org/network/protocol;1?name=file", "nsIFileProtocolHandler");
        rv = fph.getFileFromURLSpec(result).path;

    }
    catch (e) {
        GREUtils.log('[Error] GREUtils.File.chromeToPath: '+e.message);
        rv = null;
    }
    return rv;
};


/**
 * Resolves a file path into a loadable URL using local file path.<br/>
 * <br/>
 * Returns a string representation of the loadable URL if successful; otherwise
 * null is returned.
 *
 * @public
 * @static
 * @function
 * @param {String} aPath           This is the file path
 * @return {String} url            The URL
 */
GREUtils.File.pathToURL = function(aPath){
    
      if (!aPath)
        return "";
    
      var rv;
      try {
        rv =GREUtils.XPCOM.createInstance("@mozilla.org/network/protocol;1?name=file",
                                     "nsIFileProtocolHandler").getURLSpecFromFile(GREUtils.File(aPath));
      } catch (e) { rv = ""; }

      return rv;
    
};

/**
 * Resolves a URL into a file path using file path.<br/>
 * <br/>
 * Returns null if resolution fails.
 *
 * @public
 * @static
 * @function
 * @param {String} aUrl           This is the URL
 * @return {String} path          The file path
 */
GREUtils.File.urlToPath = function(aUrl){
    
      if (!aUrl || !/^file:/.test(aPath))
        return "";
    
      var rv;
      try {

        rv = GREUtils.XPCOM.createInstance("@mozilla.org/network/protocol;1?name=file",
                                     "nsIFileProtocolHandler").getFileFromURLSpec(aUrl).path;

      } catch (e) { rv = ""; }

      return rv;
    
};


/**
 * Checks if a file exists.
 *
 * @public
 * @static
 * @function
 * @param {String} aFile          This is the file path
 * @return {Boolean}              "true" if the file exists; "false" otherwise
 */
GREUtils.File.exists = function(aFile){

    if (!aFile)
        return false;

    var rv;
    try {
        if (typeof aFile == "string") {
            rv = GREUtils.File.getFile(aFile, false, true).exists();
        }else if ( typeof aFile['exists'] == 'function'){
            rv = aFile.exists();
        }else {
            rv = false;
        }
    }
    catch (e) {
        GREUtils.log('[Error] GREUtils.File.exists: '+e.message);
        rv = false;
    }

    return rv;
};

/**
 * Removes a file.
 *
 * This method removes a file if it exists. Does not remove directories. Returns
 * "true" if the file is removed, "false" otherwise.
 *
 * @public
 * @static
 * @function
 * @param {String} aFile          This is the file path
 * @return {Boolean}              "true" if the file exists; "false" otherwise
 */
GREUtils.File.remove = function(aFile){

    if (!aFile)
        return false;

    var rv;
    var file;
    try {
        file = GREUtils.File.getFile(aFile);

        if (file.isDirectory())
            return false;

        file.remove(false);
        return true;


    }
    catch (e) {
        GREUtils.log('[Error] GREUtils.File.remove: '+e.message);
        rv = false;
    }

    return rv;
};

/**
 * Copies a file to a new location.
 *
 * This method copies an existing file to a new location. If the new location is
 * a directory, that directory must already exist, and the file is copied into that
 * directory with the same file name.
 *
 * This method will not overwrite existing file; if a file already exists at the
 * new location then no copy takes place and the method returns "false".
 *
 * Returns "true" if the file is successfully copied, "false" otherwise.
 *
 * @public
 * @static
 * @function
 * @param {String} aSource        This is the file from which to copy
 * @param {String} aDest          This is the location to which to copy
 * @return {Boolean}              "true" if the copy succeeds; "false" otherwise
 */
GREUtils.File.copy = function(aSource, aDest){

    if (!aSource || !aDest)
        return false;

    if (!GREUtils.File.exists(aSource))
        return false;

    var rv;
    try {
        var fileInst = (typeof aSource == 'string') ? GREUtils.File.getFile(aSource) : aSource;
        var dir = (typeof aDest == 'string') ? GREUtils.File.getFile(aDest, false, true) : aDest ;
        var copyName = fileInst.leafName;

        if (fileInst.isDirectory())
            return false;

        if (!GREUtils.File.exists(aDest) || !dir.isDirectory()) {
            copyName = dir.leafName;
            dir = GREUtils.File.getFile(dir.path.replace(copyName, ''));

            if (!GREUtils.File.exists(dir.path))
                return false;

            if (!dir.isDirectory())
                return false;
        }

        if (GREUtils.File.exists(GREUtils.File.append(dir.path, copyName)))
            return false;

        fileInst.copyTo(dir, copyName);
        rv = true;
    }
    catch (e) {
        GREUtils.log('[Error] GREUtils.File.copy: '+e.message);
        return false;
    }

    return rv;
};

/**
 * Creates a new file path by appending a file name to a directory path and returns
 * that new file path.  Returns an empty string if the directory does not exist or
 * if the directory path given does not point to an actual directory.
 *
 * @public
 * @static
 * @function
 * @param {String} aDirPath       This is the directory path
 * @param {String} aFileName      This is the file name to append to the directory
 * @return {String} filePath      The new file path, empty if error
 */
GREUtils.File.append = function(aDirPath, aFileName){

    if (!aDirPath || !aFileName)
        return "";

    if (!GREUtils.File.exists(aDirPath))
        return "";

    var rv;
    try {
        var fileInst = GREUtils.File.getFile(aDirPath);
        if (fileInst.exists() && !fileInst.isDirectory())
            return "";

        fileInst.append(aFileName);
        rv = fileInst.path;
        delete fileInst;
    }
    catch (e) {
        GREUtils.log('[Error] GREUtils.File.append: '+e.message);
        return "";
    }

    return rv;
};


/**
 * Returns the Unix style permission bits of a file or directory. Returns 0 if the
 * file or directory does not exist.
 *
 * @public
 * @static
 * @function
 * @param {String} aPath          This is the file path
 * @return {String}               The octal representation of the Unix style permission bits
 */
GREUtils.File.permissions = function(aPath){

    if (!aPath)
        return 0;

    if (!GREUtils.File.exists(aPath))
        return 0;

    var rv;
    try {
        rv = (GREUtils.File.getFile(aPath)).permissions.toString(8);
    }
    catch (e) {
        GREUtils.log('[Error] GREUtils.File.permissions: '+e.message);
        rv = 0;
    }

    return rv;

};

/**
 * Returns the modification date of a file or directory. Returns 0 if the file or
 * directory does not exist.
 *
 * @public
 * @static
 * @function
 * @param {String} aPath          This is the file path
 * @return {String}               The modification date
 */
GREUtils.File.dateModified = function(aPath){

    if (!aPath) return null;

    if (!this.exists(aPath)) return null;

    var rv;
    try {
        rv = new Date((GREUtils.File.getFile(aPath)).lastModifiedTime).toLocaleString();
    }
    catch (e) {
        GREUtils.log('[Error] GREUtils.File.dateModified: '+e.message);
        rv = null;
    }

    return rv;
};

/**
 * Returns the size of a file. Returns -1 if the file does not exist or if the
 * file size cannot be determined.
 *
 * @public
 * @static
 * @function
 * @param {String} aPath          This is the file path
 * @return {Number}               The file size
 */
GREUtils.File.size = function(aPath){

    if (!aPath)
        return -1;

    if (!GREUtils.File.exists(aPath))
        return -1;

    var rv = 0;
    try {
        rv = (GREUtils.File.getFile(aPath)).fileSize;
    }
    catch (e) {
        GREUtils.log('[Error] GREUtils.File.size: '+e.message);
        rv = -1;
    }

    return rv;
};

/**
 * Returns the extension of a file. Returns an empty string if the file does not exist
 * or if the file extension cannot be determined.
 *
 * @public
 * @static
 * @function
 * @param {String} aPath          This is the file path
 * @return {String}               The file extension, empty if error.
 */
GREUtils.File.ext = function(aPath){

    if (!aPath)
        return "";

    if (!GREUtils.File.exists(aPath))
        return "";

    var rv;
    try {
        var leafName = (GREUtils.File.getFile(aPath)).leafName;
        var dotIndex = leafName.lastIndexOf('.');
        rv = (dotIndex >= 0) ? leafName.substring(dotIndex + 1) : "";
    }
    catch (e) {
        GREUtils.log('[Error] GREUtils.File.ext: '+e.message);
        return ""
    }

    return rv;
};

/**
 * Returns the parent path of a file path.
 *
 * If "aPath" is a file, this method returns the path of the directory containing the
 * file. If "aPath" is a directory, this method returns the path of the directory itself.
 *
 * Returns an empty string if "aPath" does not exist.
 *
 * @public
 * @static
 * @function
 * @param {String} aPath          This is the file path
 * @return {String} filePath      The parent path, empty if error
 */
GREUtils.File.parent = function(aPath){
    if (!aPath)
        return "";

    var rv;
    try {
        var fileInst = GREUtils.File.getFile(aPath);

        if (!fileInst.exists())
            return "";

        if (fileInst.isFile())
            rv = fileInst.parent.path;

        else
        if (fileInst.isDirectory())
            rv = fileInst.path;

        else
            rv = "";
    }
    catch (e) {
        GREUtils.log('[Error] GREUtils.File.parent: '+e.message);
        rv = "";
    }

    return rv;
};


/**
 * Checks if a file path points to a directory.
 *
 * @public
 * @static
 * @function
 * @param {String} aPath          This is the file path
 * @return {Boolean}              "true" if the path is a directory; "false" otherwise
 */
GREUtils.File.isDir = function(aPath){

    var rv = false;
    try {
        var fileInst = GREUtils.File.getFile(aPath);
        rv = fileInst.isDirectory();
    }
    catch (e) {
        GREUtils.log('[Error] GREUtils.File.isDir: '+e.message);
        rv = false;
    }
    return rv;
};

/**
 * Checks if a file path points to a regular file.
 *
 * @public
 * @static
 * @function
 * @param {String} aPath          This is the file path
 * @return {Boolean}              "true" if the path is a file; "false" otherwise
 */
GREUtils.File.isFile = function(aPath){

    var rv = false;
    try {
        var fileInst = GREUtils.File.getFile(aPath);
        rv = fileInst.isFile();
    }
    catch (e) {
        GREUtils.log('[Error] GREUtils.File.isFile: '+e.message);
        rv = false;
    }
    return rv;
};

/**
 * Checks if a file is executable.
 *
 * @public
 * @static
 * @function
 * @param {String} aPath          This is the file path
 * @return {Boolean}              "true" if the path is an executable file; "false" otherwise
 */
GREUtils.File.isExecutable = function(aPath){

    var rv = false;
    try {
        var fileInst = GREUtils.File.getFile(aPath);
        rv = fileInst.isExecutable();
    }
    catch (e) {
        GREUtils.log('[Error] GREUtils.File.isExecutable: '+e.message);
        rv = false;
    }
    return rv;

};


/**
 * Checks if a file path points to a symbolic link.
 *
 * @public
 * @static
 * @function
 * @param {String} aPath          This is the file path
 * @return {Boolean}              "true" if the path is a symbolic link; "false" otherwise
 */
GREUtils.File.isSymlink = function(aPath){

    var rv = false;
    try {
        var fileInst = GREUtils.File.getFile(aPath);
        rv = fileInst.isSymlink();
    }
    catch (e) {
        GREUtils.log('[Error] GREUtils.File.isSymlink: '+e.message);
        rv = false;
    }
    return rv;

};

/**
 * Checks if a file or directory is writable by the user.
 *
 * @public
 * @static
 * @function
 * @param {String} aPath          This is the file path
 * @return {Boolean}              "true" if the path is writable; "false" otherwise
 */
GREUtils.File.isWritable = function(aPath){

    var rv = false;
    try {
        var fileInst = GREUtils.File.getFile(aPath);
        rv = fileInst.isWritable();
    }
    catch (e) {
        GREUtils.log('[Error] GREUtils.File.isWritable: '+e.message);
        rv = false;
    }
    return rv;
};

/**
 * Checks if a file or directory is hidden.
 *
 * @public
 * @static
 * @function
 * @param {String} aPath          This is the file path
 * @return {Boolean}              "true" if the path is writable; "false" otherwise
 */
GREUtils.File.isHidden = function(aPath){

    var rv = false;
    try {
        var fileInst = GREUtils.File.getFile(aPath);
        rv = fileInst.isHidden();
    }
    catch (e) {
        GREUtils.log('[Error] GREUtils.File.isHidden: '+e.message);
        rv = false;
    }
    return rv;

};


/**
 * Checks if a file or directory is readable.
 *
 * @public
 * @static
 * @function
 * @param {String} aPath          This is the file path
 * @return {Boolean}              "true" if the path is readable; "false" otherwise
 */
GREUtils.File.isReadable = function(aPath){

    var rv = false;
    try {
        var fileInst = GREUtils.File.getFile(aPath);
        rv = fileInst.isReadable();
    }
    catch (e) {
        GREUtils.log('[Error] GREUtils.File.isReadable: '+e.message);
        rv = false;
    }
    return rv;

};


/**
 * Checks if a file path points to a special system file.
 *
 * @public
 * @static
 * @function
 * @param {String} aPath          This is the file path
 * @return {Boolean}              "true" if the file is special; "false" otherwise
 */
GREUtils.File.isSpecial = function(aPath){

    var rv = false;
    try {
        var fileInst = GREUtils.File.getFile(aPath);
        rv = fileInst.isSpecial();
    }
    catch (e) {
        GREUtils.log('[Error] GREUtils.File.isSpecial: '+e.message);
        rv = false;
    }
    return rv;

};

/**
 * Returns the canonical file path.
 *
 * Returns -1 if the file path does not exist or if read permission is denied for a
 * component of the path prefix.
 *
 * @public
 * @static
 * @function
 * @param {String} aPath          This is the file path to normalize
 * @return {String}               The normalized file path
 */
GREUtils.File.normalize = function(aPath){

    var rv;
    try {
        var fileInst = GREUtils.File.getFile(aPath);
        rv = fileInst.normalize();
    }
    catch (e) {
        GREUtils.log('[Error] GREUtils.File.normalize: '+e.message);
        rv = -1;
    }
    return rv;

};
/**
 * This is a set of utility functions that provide common directory operations
 * on the local file system in a platform-independent manner.
 *
 * @public
 * @name GREUtils.Dir
 * @namespace GREUtils.Dir
 */
GREUtils.define('GREUtils.Dir');


/**
 * Returns an nsILocalFile instance representing the given file.
 *
 * Bt setting autoCreate to "true", this method will attempt to create the file
 * with default permissions if the file does not already exists.
 *
 * If the file does not exist and is not/cannot be created, null will be returned.
 *
 * @public
 * @static
 * @function
 * @param {String} aPath                This is the file path
 * @param {Boolean} autoCreate          This flag indicates whether to create the file if it does not exist; false by default
 * @return {nsILocalFile}               The given file, or null if the file does not exist and is not/cannot be created
 */
GREUtils.Dir.getFile = function(aPath){

    if (aPath instanceof Components.interfaces.nsIFile ) return aPath;

    var autoCreate = arguments[1] || false;
    if (/^file:/.test(aPath))
        aPath = aPath.replace("file://", "");
    var obj = GREUtils.XPCOM.createInstance('@mozilla.org/file/local;1', 'nsILocalFile');
    obj.initWithPath(aPath);
    if (obj.exists())
        return obj;
    else
        if (autoCreate) {
            try {
                obj.create(GREUtils.File.DIRECTORY_TYPE, GREUtils.File.DIR_DEFAULT_PERMS);
                return obj;
            }
            catch (ex) {
                return null;
            }
        }
        else {
            return null;
        }
};


/**
 * Creates a new file at the given path with default permissions and returns
 * an nsILocalFile instance representing the file.
 *
 * If the file already exists, that file is returned. If the file cannot be created,
 * null is returned.
 *
 * @public
 * @static
 * @function
 * @param {String} aPath                This is the file path
 * @return {nsILocalFile}               The file, or null if the file does not exist and is not/cannot be created
 */
GREUtils.Dir.create = function(aPath){
	return GREUtils.Dir.getFile(aPath, true);
};


/**
 * Removes a directory.
 *
 * If "aRecursive" is false, then the directory must be empty before it can be deleted.
 *
 * @public
 * @static
 * @function
 * @param {String} aPath                This is the directory path
 * @param {Boolean} aRecursive          This flag indicates if directory is to be deleted if it is not empty
 * @return {Number}                    void  : directory is successfully removed
 *                                      -1    : path does not exist
 *                                      -2    : aPath is not a directory
 *                                      -3    : delete fails
 */
GREUtils.Dir.remove = function(aPath, aRecursive){
	var dir = GREUtils.Dir.getFile(aPath);
	if(dir == null) return -1;

    if(!dir.isDirectory()) return -2;

	try {
		return dir.remove(aRecursive);
	}catch (e){
		GREUtils.log('[Error] GREUtils.Dir.remove: '+e.message);
		return -3;
	}
};


/**
 * Tests whether a file is a descendant of a directory.
 *
 * This method will also return false if either file or the directory does not exist.
 *
 * @public
 * @static
 * @function
 * @param {String} aPath                This is the directory to test
 * @param {String} aFile                This is the full path of the file to test
 * @return {Boolean}                    Returns true if the file is a descendant of the directory, false otherwise
 */
GREUtils.Dir.contains = function(aPath, aFile){
	var dir = GREUtils.Dir.getFile(aPath);
	var file = GREUtils.File.getFile(aFile);

	if(dir == null || file == null) return false;

    if(!dir.isDirectory()) return false;
	
	if(!dir.isFile()) return false;

	try {
		return dir.contains(aFile, true);
	}catch (e){
		GREUtils.log('[Error] GREUtils.Dir.contains: '+e.message);
		return false;
	}
};


/**
 * Reads directory entries recursively.
 *
 * This method returns the directory entries as an array. Each array
 * element can be a string representing a file, or an array representing
 * a sub-directory. Directory entries are read recursively.
 *
 * If the given path is not a directory an empty array is returned.
 *
 * @public
 * @static
 * @function
 * @param {String} aPath                This is the directory path
 * @param {Boolean} bRecursive          Recursive directory default false
 * @return {Object}                     Returns the directory entries as an array of strings containing file paths
 */
GREUtils.Dir.readDir = function(aPath, bRecursive){

	var fileInst = GREUtils.Dir.getFile(aPath);

    bRecursive = bRecursive || false;

    var rv = [];
	if (fileInst == null) return rv;

    try {

	  if (!fileInst.exists()) return rv;

      if (!fileInst.isDirectory()) return rv;

      var files     = fileInst.directoryEntries;
      var file;

      while (files.hasMoreElements()) {
        file = files.getNext();
		file = GREUtils.XPCOM.queryInterface(file, "nsILocalFile");

		// if (file.isFile()) rv.push(file);
        
        if (file.isDirectory() && bRecursive) {
            rv.push(GREUtils.Dir.readDir(file));
        }else {
            if (file.isFile() || file.isDirectory()) rv.push(file);
        }
        
      }

    } catch(e) {
		GREUtils.log('[Error] GREUtils.Dir.readDir: '+e.message);
	}

    return rv;

};
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
/**
 * This is a set of utility functions for character set conversions.
 * 
 * @public
 * @name GREUtils.Charset
 * @namespace GREUtils.Charset
 */
GREUtils.define('GREUtils.Charset');

/**
 * Converts a string to Unicode.
 *
 * This method takes a string encoded in the character "charset", and returns the corresponding string encoded in Unicode.
 * If "charset" is not given then string is assumed to be encoded in "UTF-8". 
 *  
 * @public
 * @static
 * @function
 * @param {String} text         This is the string to convert to Unicode
 * @param {String} charset      This is the character set encoding of the string
 * @return {String}             The string encoded in Unicode if conversion succeeds; otherwise the original string is returned
 */
GREUtils.Charset.convertToUnicode = function(text, charset) {
	
    try {
        var conv = GREUtils.XPCOM.getService("@mozilla.org/intl/scriptableunicodeconverter", "nsIScriptableUnicodeConverter");
        conv.charset = charset ? charset : "UTF-8";
        return conv.ConvertToUnicode(text);
    }catch (ex) {
		GREUtils.log('[Error] GREUtils.Charset.convertToUnicode: ' + ex.message);
        return text;
    }
	
};

/**
 * Converts a Unicode string to the given character set encoding.
 *
 * This method takes a string encoded in Unicode, and returns the corresponding
 * string encoded in the given character set encoding. If a character set
 * encoding is not specified then the string will be converted to "UTF-8".
 *  
 * @public
 * @static
 * @function
 * @param {String} text         This is the Unicode string to convert
 * @param {String} charset      This is the character set encoding to convert to
 * @return {String}             The string in the given encoding if conversion succeeds; otherwise the original string is returned
 */
GREUtils.Charset.convertFromUnicode = function(text, charset) {
    try {
        var conv = GREUtils.XPCOM.getService("@mozilla.org/intl/scriptableunicodeconverter", "nsIScriptableUnicodeConverter");
        conv.charset = charset ? charset : "UTF-8";
        return conv.ConvertFromUnicode(text);
    }catch (ex) {
		GREUtils.log('[Error] GREUtils.Charset.convertFromUnicode: '+ex.message);
        return text;
    }
};


/**
 * Converts a string from one character set encoding to another.
 * 
 * This method takes a string encoded in encoding "in_charset"
 * and returns the corresponding string in encoding "out_charset".
 *
 * @public
 * @static
 * @function
 * @param {String} text         This is the string to convert
 * @param {String} in_charset   This is the character set encoding of the string
 * @param {String} out_charset  This is the character set encoding to convert the string to
 * @return {String}             A string encoded in "out_charset" if conversion succeeds; otherwise the original string is returned
 */
GREUtils.Charset.convertCharset = function (text, in_charset, out_charset) {
    return this.convertFromUnicode(this.convertToUnicode(text, in_charset), out_charset);
};
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
/**
 * This is a set of utility functions for playing sounds through XPCOM.
 *
 * @public
 * @name GREUtils.Sound
 * @namespace GREUtils.Sound
 */
GREUtils.define('GREUtils.Sound');


/**
 * Returns the XPCOM service that implements the nsISound interface.
 *
 * @public
 * @static
 * @function
 * @return {nsISound}                     The nsISound service
 */
GREUtils.Sound.getSoundService = function() {
    return GREUtils.XPCOM.getUsefulService("sound");
};


/**
 * Plays the sound file located at the given URL.
 *
 * @public
 * @static
 * @function
 * @param {String} sURL                   This is the URL pointing to the location of the sound file
 */
GREUtils.Sound.play = function(sURL) {
    mURL = GREUtils.File.getURL(sURL);
    var snd = GREUtils.Sound.getSoundService();
    snd.init();
    return snd.play(mURL);
};


/**
 * Generates the system beep sound.
 *
 * @public
 * @static
 * @function
 */
GREUtils.Sound.beep = function() {
    return GREUtils.Sound.getSoundService().beep();
};


/**
 * Plays the specified system sound.
 *
 * @public
 * @static
 * @function
 * @param {String} sURL                   This is the system sound identifier.
 */
GREUtils.Sound.playSystemSound = function(sURL) {
    mURL = GREUtils.File.getURL(sURL);
    var snd = this.getSoundService();
    snd.init();
    return snd.playSystemSound(mURL);
};
/**
 * This is set of utility functions for manipulating preferences.
 *
 * @public
 * @name GREUtils.Pref
 * @namespace GREUtils.Pref
 */
GREUtils.define('GREUtils.Pref');


/**
 * Returns the XPCom service that implements the nsIPrefBranch2 interface.
 *
 * @public
 * @static
 * @function
 * @return {nsIPrefBranch2}             The preference service
 */
GREUtils.Pref.getPrefService = function () {
    return GREUtils.XPCOM.getService("@mozilla.org/preferences-service;1", "nsIPrefService").getBranch("");
};


/**
 * Returns a preference value by key.
 *
 * This method will automatically detect the type of preference (string, int, boolean)
 * and return the preference value accordingly.
 *
 * @public
 * @static
 * @function
 * @param {String} prefName             This is the name of the preference
 * @param {Object} prefService          This is the preferences service to use; if null, the default preferences service will be used
 * @return {Object}                     The preference value
 */
GREUtils.Pref.getPref = function() {
    var prefName = arguments[0] ;
    var prefs = (arguments[1]) ? arguments[1] : GREUtils.Pref.getPrefService();
    var nsIPrefBranch = GREUtils.XPCOM.Ci("nsIPrefBranch");
    var type = prefs.getPrefType(prefName);
    
    if (type == nsIPrefBranch.PREF_STRING) {
        return prefs.getComplexValue(prefName,Components.interfaces.nsISupportsString).data;
    }else if (type == nsIPrefBranch.PREF_INT) {
        return prefs.getIntPref(prefName);
    }else if (type == nsIPrefBranch.PREF_BOOL) {
        return prefs.getBoolPref(prefName);
    }else {
        return null;
    }

};


/**
 * Sets the state of individual preferences
 *
 * This method will automatically detect the type of preference (string, number,
 * boolean) and set the preference value accordingly.
 *
 * @public
 * @static
 * @function
 * @param {String} prefName             This is the name of the preference
 * @param {Object} prefValue            This is the preference value to set
 * @param {Object} prefService          This is the preferences service to use; if null, the default preferences service will be used
 */

GREUtils.Pref.setPref = function() {
    var prefName = arguments[0] ;
    var value = arguments[1];
    var prefs = (arguments[2]) ? arguments[2] : GREUtils.Pref.getPrefService();
    var nsIPrefBranch = GREUtils.XPCOM.Ci("nsIPrefBranch");
    var type = prefs.getPrefType(prefName);

    if (type == nsIPrefBranch.PREF_STRING) {
        var str = Components.classes["@mozilla.org/supports-string;1"]
                  .createInstance(Components.interfaces.nsISupportsString);
        str.data = value;
        prefs.setComplexValue(prefName, Components.interfaces.nsISupportsString, str);
    }else if (type == nsIPrefBranch.PREF_INT) {
        prefs.setIntPref(prefName, value);
    }else if (type == nsIPrefBranch.PREF_BOOL) {
        prefs.setBoolPref(prefName, value);
    }else {
        // XXX
    }
};


/**
 * Add the state of individual preferences
 *
 * This method will automatically detect the type of value (string, number,
 * boolean) and set the preference value accordingly.
 *
 * @public
 * @static
 * @function
 * @param {String} prefName             This is the name of the preference
 * @param {Object} prefValue            This is the preference value to set
 * @param {Object} prefService          This is the preferences service to use; if null, the default preferences service will be used
 */

GREUtils.Pref.addPref = function() {
    var prefName = arguments[0] ;
    var value = arguments[1];
    var prefs = (arguments[2]) ? arguments[2] : GREUtils.Pref.getPrefService();
    var type = typeof value;

    if (type == 'string') {
        var str = Components.classes["@mozilla.org/supports-string;1"]
                  .createInstance(Components.interfaces.nsISupportsString);
        str.data = value;
        prefs.setComplexValue(prefName, Components.interfaces.nsISupportsString, str);
    }else if (type == 'number') {
        prefs.setIntPref(prefName, value);
    }else if (type == 'boolean') {
        prefs.setBoolPref(prefName, value);
    }else {
        prefs.setCharPref(prefName, GREUtils.JSON.encode(value));
    }

};
/**
 * This is a set of utility functions to render common types of dialogs and
 * windows.
 *
 * @public
 * @name GREUtils.Dialog
 * @namespace GREUtils.Dialog
 */
GREUtils.define('GREUtils.Dialog');


/**
 * Creates a new window and automatically adds it to the watch list.
 *
 * @param {nsIDOMWindow} aParent                    This is the parent window, if any, or null if no parent window
 * @param {String} aUrl                             This is the URL to open in the newly created window. The URL must be appropriately escaped, and can be null
 * @param {String} aName                            This is the name to assign to the newly created window. Defaults to "_blank" If a window with this name already exists, that window may be returned instead
 * @param {String} aFeatures                        This is the window features to apply to the new window. Defaults to "chrome,centerscreen"
 * @param {nsISupportsArray|nsIArray} aArguments    This is the list of extra argument(s) to be attached to the new window as the window.arguments property. An nsISupportsArray will be unwound into multiple arguments (but not recursively!). Can be null, in which case the window.arguments property will not be set on the new window. Can also be an nsIArray.
 * @return {nsIDOMWindow}                           The new window
 * @type                                            nsIDOMWindow
 */
GREUtils.Dialog.openWindow =  function(aParent, aUrl, aName, aFeatures, aArguments) {

    var parent = aParent || null;
    var windowName = aName || "_blank";
    var args = aArguments || null;
    var features = aFeatures || "chrome,centerscreen";

    var array = Components.classes["@mozilla.org/array;1"]
                          .createInstance(Components.interfaces.nsIMutableArray);
    for (var i=4; i<arguments.length; i++)
    {
        var variant = Components.classes["@mozilla.org/variant;1"]
                                .createInstance(Components.interfaces.nsIWritableVariant);
        variant.setFromVariant(arguments[i]);
        array.appendElement(variant, false);
    }

    var ww = GREUtils.XPCOM.getUsefulService("window-watcher");
    return  ww.openWindow(parent, aUrl, windowName, features, array);

};


/**
 * Creates a top-level Dialog window. The dialog will be screen-centered by default.
 *
 * @public
 * @static
 * @function
 * @param {nsIDOMWindow} aParent                    This is the parent window, if any, or null if no parent window
 * @param {String} aUrl                             This is the URL to open in the newly created dialog window
 * @param {String} aName                            This is the name to assign to the dialog window
 * @param {nsISupportsArray|nsIArray} aArguments    This is the list of extra argument(s) to be attached to the new dialog window as the window.arguments property. An nsISupportsArray will be unwound into multiple arguments (but not recursively!). Can be null, in which case the window.arguments property will not be set on the new dialog window. Can also be an nsIArray.
 * @param {Number} posX                             This is the X screen coordinate of the dialog window
 * @param {Number} posY                             This is the Y screen coordinate of the dialog window
 * @param {Number} width                            This is the width of the dialog window
 * @param {Number} height                           This is the height of the dialog window
 * @return {nsIDOMWindow}                           The new dialog window
 * @type                                            nsIDOMWindow
 */
GREUtils.Dialog.openDialog = function(aParent, aURL, aName, aArguments, posX, posY, width, height) {

    var parent = aParent || null;
    
    var features = "chrome,dialog,dependent=yes,resize=yes";
    if (arguments.length <= 3 ) {
        features += ",centerscreen";
    }
    else {
        if (posX)
            features += ",screenX=" + posX;
        if (posY)
            features += ",screenY=" + posY;
        if (width)
            features += ",width=" + width;
        if (height)
            features += ",height=" + height;
    }

    return GREUtils.Dialog.openWindow(parent, aURL, aName, features, aArguments);

};


/**
 * Creates a top-level modal dialog window. The dialog will be screen-centered by default.
 *
 * @public
 * @static
 * @function
 * @param {nsIDOMWindow} aParent                    This is the parent window, if any, or null if no parent window
 * @param {String} aUrl                             This is the URL to open in the newly created modal dialog
 * @param {String} aName                            This is the name to assign to the modal dialog
 * @param {nsISupportsArray|nsIArray} aArguments    This is the list of extra argument(s) to be attached to the new modal dialog as the window.arguments property. An nsISupportsArray will be unwound into multiple arguments (but not recursively!). Can be null, in which case the window.arguments property will not be set on the new modal dialog. Can also be an nsIArray.
 * @param {Number} posX                             This is the X screen coordinate of the modal dialog
 * @param {Number} posY                             This is the Y screen coordinate of the modal dialog
 * @param {Number} width                            This is the width of the modal dialog
 * @param {Number} height                           This is the height of the modal dialog
 * @return {nsIDOMWindow}                           The new modal dialog
 * @type                                            nsIDOMWindow
 */
GREUtils.Dialog.openModalDialog = function(aParent, aURL, aName, aArguments, posX, posY, width, height) {

    var parent = aParent || null;
    
    var features = "chrome,dialog,dependent=no,modal,resize=yes";
    if (arguments.length <= 3) {
        features += ",centerscreen";
    }
    else {
        if(posX) features += ",screenX="+posX;
        if(posY) features += ",screenY="+posY;
        if(width) features += ",width="+width;
        if(height) features += ",height="+height;
    }

    return GREUtils.Dialog.openWindow(parent, aURL, aName, features, aArguments);

};


/**
 * Creates a top-level, full screen window.
 *
 * @public
 * @static
 * @function
 * @param {nsIDOMWindow} aParent                    This is the parent window, if any, or null if no parent window
 * @param {String} aUrl                             This is the URL to open in the newly created modal dialog
 * @param {String} aName                            This is the name to assign to the modal dialog
 * @return {nsIDOMWindow}                           The new full-screen window
 * @type                                            nsIDOMWindow
 */
GREUtils.Dialog.openFullScreen = function (aParent, aURL, aName, aArguments) {

    var parent = aParent || null;
    
    var features = "chrome,dialog=no,resize=no,titlebar=no,fullscreen=yes";
    features += ",x=0,y=0";
    features += ",screenX="+0;
    features += ",screenY="+0;

    return GREUtils.Dialog.openWindow(parent, aURL, aName, features, aArguments);

};


/**
 * Returns the XPCOM service that implements the nsIFilePicker interface.
 *
 * @public
 * @static
 * @function
 * @return {nsIFilePicker}                          The nsIFilePicker service
 * @type                                            nsIFilePicker
 */
GREUtils.Dialog.getFilePicker = function() {
    return GREUtils.XPCOM.createInstance("@mozilla.org/filepicker;1", "nsIFilePicker");
};

/**
 * Shows a file picker dialog window to allow user to select a file.
 *
 * The directory that the file open/save dialog initially displays can be specified
 * through the "sDir" parameter. This parameter can be either a string containing the
 * directory path or a nsILocalFile object.
 *
 * @public
 * @static
 * @function
 * @param {String|nsILocalFile} sDir                This is the directory that the file open/save dialog initially displays
 * @param {String} title
 * @return {String}                                         The path of the selected file, or null if no file is selected
 * @type                                            String
 */
GREUtils.Dialog.openFilePicker = function(sDir, title){
    
    // Get filepicker component.
    try {
        const nsIFilePicker = Components.interfaces.nsIFilePicker;
        var fp = this.getFilePicker();

        fp.init(GREUtils.global, title, nsIFilePicker.modeOpen);
        fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText | nsIFilePicker.filterImages |
            nsIFilePicker.filterXML | nsIFilePicker.filterHTML);

        if(sDir) {
            if (typeof(sDir)=="object" && GREUtils.XPCOM.queryInterface(sDir, "nsIFile")) {
                fp.displayDirectory = sDir;
            }
            if (typeof(sDir)=="string") {
                fp.displayDirectory = GREUtils.File.getFile(sDir);
            }
        }

        if (fp.show() == nsIFilePicker.returnOK) return fp.fileURL.spec;
        else return null;

    } catch (ex) {
    }

};

/**
 * Displays an alert dialog.
 *
 * Shows a top-level alert dialog with an OK button, a window title, and alert text.
 *
 * @public
 * @static
 * @function
 * @param {nsIDOMWindow} aParent                    This is the parent window, if any, or null if no parent window
 * @param {String} dialogTitle                      This is the title of the alert dialog
 * @param {String} dialogText                       This is the alert text
 * @return
 * @type                                            void
 */
GREUtils.Dialog.alert = function(aParent, dialogTitle, dialogText) {
    
    var parent = aParent || null;
    
    // get a reference to the prompt service component.
    GREUtils.XPCOM.getUsefulService("prompt-service").alert(parent, dialogTitle, dialogText);

};

/**
 * Displays a dialog prompting for user confirmation.
 *
 * Shows a top-level confirm dialog with OK and Cancel buttons, a window title, and text.
 *
 * @public
 * @static
 * @function
 * @param {nsIDOMWindow} aParent                    This is the parent window, if any, or null if no parent window
 * @param {String} dialogTitle                      This is the title of the confirm dialog
 * @param {String} dialogText                       This is the confirm text
 * @return {Boolean}                                "true" if OK is clicked, and "false" if Cancel is clicked
 * @type                                            Boolean
 */
GREUtils.Dialog.confirm = function(aParent, dialogTitle, dialogText) {
    
    var parent = aParent || null;
    
    // get a reference to the prompt service component.
    return GREUtils.XPCOM.getUsefulService("prompt-service").confirm(parent, dialogTitle, dialogText);

};

/**
 * Displays a dialog prompting for text input.
 *
 * Shows a top-level prompt dialog with an edit field, OK and Cancel buttons, a window title,
 * and prompt text.
 *
 * The edit field will have an initial value taken from the "value" property of the object
 * given by the "input" parameter. If the user clicks OK, the value from the edit field
 * is stored in the "value" property of the "input" object before returning.
 *
 * @public
 * @static
 * @function
 * @param {nsIDOMWindow} aParent                    This is the parent window, if any, or null if no parent window
 * @param {String} dialogTitle                      This is the title of the prompt dialog
 * @param {String} dialogText                       This is the prompt text
 * @param {Object} input                            This object holds the value of the edit field
 * @param {String} aCheckMsg                        aCheckMsg is the text for the checkbox. If null, the checkbox will be left out.
 * @param {Object} aCheckState                      aCheckState is the initial state of the checkbox when this method is called, and the final state of the checkbox after this method returns. It is an object with its 'value' property set to a boolean (or an empty object).
 * @return {Boolean}                                "true" if OK is clicked, and "false" if Cancel is clicked
 * @type                                            Boolean
 */
GREUtils.Dialog.prompt = function(aParent, dialogTitle, dialogText, input, aCheckMsg, aCheckState) {
    
    var parent = aParent || null;
    var checkMsg = aCheckMsg || null;
    var check = aCheckState || {value: false};
    // get a reference to the prompt service component.
    return GREUtils.XPCOM.getUsefulService("prompt-service").prompt(parent, dialogTitle, dialogText, input, null, check);

};

/**
 * Displays a select dialog prompting user to make a selection.
 *
 * Shows a top-level select dialog with a list box of strings, OK and Cancel buttons,
 * a window title, and prompt text.
 *
 * If the user clicks OK, the "value" property of the "selected" object will be set
 * to the index of the the selected item before returning.
 *
 * @public
 * @static
 * @function
 * @param {nsIDOMWindow} aParent                    This is the parent window, if any, or null if no parent window
 * @param {String} dialogTitle                      This is the title of the select dialog
 * @param {String} dialogText                       This is the prompt text
 * @param {String[]} list                           This is an array of strings for selection
 * @param {Object} selected                         This object holds the index of the selected item
 * @return {Boolean}                                "true" if OK is clicked, and "false" if Cancel is clicked
 * @type                                            Boolean
 */
GREUtils.Dialog.select = function(aParent, dialogTitle, dialogText, list, selected) {
    
    var parent = aParent || null;
    
    // get a reference to the prompt service component.
    return GREUtils.XPCOM.getUsefulService("prompt-service").select(parent, dialogTitle, dialogText, list.length, list, selected);
    
};

/**
 * Returns a ChromeWindow object representing the most recent window of the
 * type given by "windowName".
 *
 * If there are no windows of the given type open, null is returned.
 *
 * @public
 * @static
 * @function
 * @param {Object} windowName                       This is the type of window to return; null for all types
 * @return {Object}                                 The most recent window of the given type, or null if no such window is open
 * @type                                            ChromeWindow
 */
GREUtils.Dialog.getMostRecentWindow = function(windowName) {
    return GREUtils.XPCOM.getUsefulService("window-mediator").getMostRecentWindow(windowName);
};

/**
 * Returns all open windows of a given type in an array of ChromeWindow objects.
 *
 * Returns an empty array if there are no windows of the given type open.
 *
 * @public
 * @static
 * @function
 * @param {Object} windowName                       This is the type of window to enumerate; null for all types
 * @return {Object}                                 An array of ChromeWindow objects
 * @type                                            ChromeWindow[]
 */
GREUtils.Dialog.getWindowArray = function(windowName) {
    var enumerator = GREUtils.XPCOM.getUsefulService("window-mediator").getEnumerator(windowName);
    var wins = [];
    while(enumerator.hasMoreElements()) {
        wins.push(enumerator.getNext());
    }
    return wins;
};
/**
 * This is a set of utility functions that applications and extensions can
 * use to easily create and manage threads within the Gecko Runtime Environment.
 *
 * Each thread is represented by an nsIThread object.
 *
 * @public
 * @name GREUtils.Thread
 * @namespace GREUtils.Thread
 */
GREUtils.define('GREUtils.Thread');

GREUtils.Thread = {

    _threadManager: null,

    _mainThread: null,

    _workerThread: null,

    reportError: function(err){
        Components.utils.reportError(err);
    }
};


/**
 * Returns the XPCOM service that implements the nsIThreadManager interface
 *
 * @public
 * @static
 * @function
 * @return {nsIThreadManager}           The nsIThreadManager service
 */
GREUtils.Thread.getThreadManager = function(){
    if (this._threadManager == null ) this._threadManager = GREUtils.XPCOM.getUsefulService("thread-manager");
    return this._threadManager;
};


/**
 * Returns the main thread.
 *
 * @public
 * @static
 * @function
 * @return {nsIThread}                  The main thread
 */
GREUtils.Thread.getMainThread = function(){
    if (this._mainThread == null) {
        this._mainThread = GREUtils.Thread.getThreadManager().mainThread;

        // extends magical method to worker thread
        // this._workerThread.dispatchMainThread = GREUtils.Thread.dispatchMainThread;
    }
    return this._mainThread;
};


/**
 * Dispatches an event to the main thread.
 *
 * The event dispatch mode defaults to DISPATCH_NORMAL, whereby the event is simply
 * queued for later processing. When this mode is specified, dispatch returns
 * immediately after the event is queued.
 *
 * If dispatch mode is set to DISPATCH_SYNC, then the event is dispatched synchronously,
 * and this method does not return until the event has been processed by the main thread.
 *
 * @public
 * @static
 * @function
 * @parameter {nsIRunnable} aRunnable   This is the event to dispatch to the main thread
 * @parameter {int} aType               This is the dispatch mode
 */
GREUtils.Thread.dispatchMainThread = function(aRunnable, aType) {
    var mainThread = GREUtils.Thread.getMainThread();
	var aType = aType || mainThread.DISPATCH_NORMAL;
    try {
	   mainThread.dispatch(aRunnable, aType);
	}catch (err) {
        GREUtils.Thread.reportError(err);
	}
};


/**
 * Dispatches an event to a worker thread.
 *
 * The event dispatch mode defaults to DISPATCH_NORMAL, whereby the event is simply
 * queued for later processing. When this mode is specified, dispatch returns
 * immediately after the event is queued.
 *
 * If dispatch mode is set to DISPATCH_SYNC, then the event is dispatched synchronously,
 * and this method does not return until the event has been processed by the worker thread.
 *
 * @public
 * @static
 * @function
 * @parameter {nsIThread} workerThread  This is the Worker thread to which to dispatch the event
 * @parameter {nsIRunnable} aRunnable   This is the event to dispatch to the Worker thread
 * @parameter {int} aType               This is the dispatch mode
 */
GREUtils.Thread.dispatchWorkerThread = function(workerThread, aRunnable, aType) {
    var aType = aType || workerThread.DISPATCH_NORMAL;
    try {
       workerThread.dispatch(aRunnable, aType);
    }catch (err) {
        GREUtils.Thread.reportError(err);
    }
};


/**
 * Creates a new thread the first time this method is invoked; this thread will be
 * returned upon subsequent getWorkerThread() calls.
 *
 * @public
 * @static
 * @function
 * @return {nsIThread}            The worker thread
 * @type                                
 */
GREUtils.Thread.getWorkerThread = function(){
    // get presist work thread
    // will not create new worker thread
    if (this._workerThread == null) {
        this._workerThread = GREUtils.Thread.getThreadManager().newThread(0);

		// extends magical method to worker thread
        // this._workerThread.dispatchMainThread = GREUtils.Thread.dispatchMainThread;
    }
    return this._workerThread;
};


/**
 * Creates a new worker thread. Unlike getWorkerThread(), a new thread is created
 * each time this method is called.
 *
 * @public
 * @static
 * @function
 * @return {nsIThread}                  The new worker thread
 */
GREUtils.Thread.createWorkerThread = function(){
    // create new worker thread
    var worker = GREUtils.Thread.getThreadManager().newThread(0);

	// extends magical method to worker thread
	//worker.dispatchMainThread = GREUtils.Thread.dispatchMainThread;

    return worker;
};


/**
 * CallbackRunnableAdapter
 *
 * @public
 * @class
 * @param {Object} func
 * @param {Object} data
 */
GREUtils.Thread.CallbackRunnableAdapter = function(func, data) {
	this._func = func;
	this._data = data;
};

GREUtils.Thread.CallbackRunnableAdapter.prototype = {

        get func() {
            return this._func;
        },

        set func(func){
            this._func = func || null;
        },

        get data() {
            return this._data;
        },

        set data(data){
            this._data = data || null;
        },

        run: function() {
			try {
                 if (this.func) {
				 	if(this.data) this.func(this.data);
					else this.func();
				 }
             } catch (err) {
                Components.utils.reportError(err);
            }
        },

        QueryInterface: function(iid) {
            if (iid.equals(Components.Interfaces.nsIRunnable) || iid.equals(Components.Interfaces.nsISupports)) {
                return this;
            }
            throw Components.results.NS_ERROR_NO_INTERFACE;
        }
};


/**
 * WorkerRunnableAdapter
 *
 * @public
 * @class
 * @param {Object} func
 * @param {Object} callback
 * @param {Object} data
 */
GREUtils.Thread.WorkerRunnableAdapter = function(func, callback, data) {
    this._func = func;
	this._callback = callback;
    this._data = data;

    if(arguments.length == 2 ) {
        this._data = callback;
		this._callback = null;
    }
};

GREUtils.Thread.WorkerRunnableAdapter.prototype = {

        get func() {
            return this._func;
        },

        set func(func){
            this._func = func || null;
        },

        get callback() {
            return this._callback;
        },

        set callback(callback){
            this._callback = callback || null;
        },

        get data() {
            return this._data;
        },

        set data(data){
            this._data = data || null;
        },

        run: function() {
            try {
				var result = null;
                 if (this.func) {
                    if(this.data) result = this.func(this.data);
                    else result = this.func();
                 }

                if (this.callback) {
					GREUtils.Thread.dispatchMainThread(new GREUtils.Thread.CallbackRunnableAdapter(this.callback, result));
				}
            } catch (err) {
                Components.utils.reportError(err);
            }

        },

        QueryInterface: function(iid) {
            if (iid.equals(Components.Interfaces.nsIRunnable) || iid.equals(Components.Interfaces.nsISupports)) {
                return this;
            }
            throw Components.results.NS_ERROR_NO_INTERFACE;
        }
};


/**
 * createWorkerThreadAdapter
 *
 * @public
 * @static
 * @function
 * @param {Object} workerFunc
 * @param {Object} callbackFunc
 * @param {Object} data
 */
GREUtils.Thread.createWorkerThreadAdapter = function(workerFunc, callbackFunc, data) {

    return new GREUtils.Thread.WorkerRunnableAdapter(workerFunc, callbackFunc, data);
};
/*
 * GREUtils - is simple and easy use APIs libraries for GRE (Gecko Runtime Environment).
 *
 * Copyright (c) 2007 Rack Lin (racklin@gmail.com)
 *
 * $Date: 2007-09-16 23:42:06 -0400 (Sun, 16 Sep 2007) $
 * $Rev: 1 $
 */
/**
 * Controller and CommandDispatcher Helper
 *  
 *@private
 * 
 */
GREUtils.ControllerHelper = GREUtils.extend({}, {

    /**
     * Append Controller to Window Controllers.
     * Then call Controller's init method
     *
     * @method
     * @id ControllerHelper.appendController
     * @alias GREUtils.ControllerHelper.appendController
     * @param {Object} controller
     */
    appendController: function(controller) {
        if(controller) window.controllers.appendController(controller);
        var app = arguments[1] || window;

        if(typeof(controller.init) == 'function') {
            controller.init(app);
        }
    },

    /**
     * Call CommandDispatcher to run Command By CommandName
     *
     * @method
     * @id ControllerHelper.doCommand
     * @alias GREUtils.ControllerHelper.doCommand
     * @param {String} sCmd
     */
    doCommand : function(sCmd) {
		try {
	        var cmdDispatcher = document.commandDispatcher || top.document.commandDispatcher || window.controllers;
	        var controller = cmdDispatcher.getControllerForCommand(sCmd);
	
	        if(controller) return controller.doCommand(sCmd);
	
	        // try window controller
	        controller = window.controllers.getControllerForCommand(sCmd);
	        if (controller && controller.isCommandEnabled(sCmd)) return controller.doCommand(sCmd);
		}catch(e){
			GREUtils.log('[Error] GREUtils.ControllerHelper.doCommand: '+e.message);
		}
    }

});

/**
 * ControllerAdapter
 *
 * @classDescription ControllerAdapter
 * @id ControllerAdapter
 * @alias GREUtils.ControllerAdapter
 * 
 * @private  
 */
GREUtils.ControllerAdapter = GREUtils.extend({}, {
    _app: null,
    _privateCommands: {'_privateCommands':1, '_app':1, 'init':1, 'supportsCommand':1, 'isCommandEnabled':1, 'doCommand':1, 'onEvent':1},

    /**
     * Controller Default Init method
     *
     * Normally don't need to override it.
     *
     * @method
     * @id ControllerHelper.init
     * @alias GREUtils.ControllerHelper.init
     * @param {Object} aApp
     */
    init : function(aApp) {
        this._app = aApp;
    },

    /**
     * Controller Support Command
     *
     * Normally not need to override it.
     *
     * @method
     * @id ControllerHelper.supportsCommand
     * @alias GREUtils.ControllerHelper.supportsCommand
     * @param {String} sCmd
     */
    supportsCommand: function(sCmd) {
        if( (!(sCmd in this._privateCommands)) && (sCmd in this) && typeof(this[sCmd]) == 'function' ) {
            return true;
        }
        return false;
    },

    /**
     * Controller isCommandEnabled
     *
     * @method
     * @id ControllerHelper.isCommandEnabled
     * @alias GREUtils.ControllerHelper.isCommandEnabled
     * @param {String} sCmd
     * @return {Boolean}
     */
    isCommandEnabled: function(sCmd) {
        return true;
    },

    /**
     * Controller doCommand
     *
     * Normally not need to override it.
     *
     * @method
     * @id ControllerHelper.doCommand
     * @alias GREUtils.ControllerHelper.doCommand
     * @param {String} sCmd
     */
    doCommand : function(sCmd) {
        if( (!(sCmd in this._privateCommands)) && (sCmd in this) && typeof(this[sCmd]) == 'function') {
            if(this.isCommandEnabled(sCmd)) return this[sCmd].call(this, arguments);
        }
    },

    /**
     * Controller onEvent
     *
     * Normally not need to override it.
     *
     * @method
     * @id ControllerHelper.onEvent
     * @alias GREUtils.ControllerHelper.onEvent
     * @param {String} sCmd
     */
    onEvent: function(sCmd) {
        if((sCmd in this) && typeof(this[sCmd]) == 'function') {
            if(this.isCommandEnabled(sCmd)) return this[sCmd].call(this, arguments);
        }
    }

});
