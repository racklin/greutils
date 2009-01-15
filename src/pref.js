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
