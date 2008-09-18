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
