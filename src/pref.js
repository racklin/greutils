/**
 * A set of utility functions used to manipulate preference data.
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
 * @return {Object} nsIPrefBranch2      The preference service
 * @type                                nsIPrefBranch2
 */
GREUtils.Pref.getPrefService = function () {
    return GREUtils.XPCOM.getService("@mozilla.org/preferences-service;1", "nsIPrefBranch2");
};


/**
 * Returns preference value by key.
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
 * @type                                Object
 */
GREUtils.Pref.getPref = function() {
    var prefName = arguments[0] ;
    var prefs = (arguments[1]) ? arguments[1] : GREUtils.Pref.getPrefService();
    var nsIPrefBranch = GREUtils.XPCOM.Ci("nsIPrefBranch");
    var type = prefs.getPrefType(prefName);
    if (type == nsIPrefBranch.PREF_STRING)
        return prefs.getCharPref(prefName);
    else if (type == nsIPrefBranch.PREF_INT)
        return prefs.getIntPref(prefName);
    else if (type == nsIPrefBranch.PREF_BOOL)
        return prefs.getBoolPref(prefName);
};


/**
 * Sets the state of individual preferences
 *
 * This method will automatically detect the type of preference (string, int, boolean)
 * and set the preference value accordingly.
 *
 * @public
 * @static
 * @function
 * @param {String} prefName             This is the name of the preference
 * @param {Object} prefValue            This is the value to which to set the preference
 * @param {Object} prefService          This is the preferences service to use; if null, the default preferences service will be used
 * @return
 * @type                                void
 */

GREUtils.Pref.setPref = function() {
    var prefName = arguments[0] ;
    var value = arguments[1];
    var prefs = (arguments[2]) ? arguments[2] : GREUtils.Pref.getPrefService();
    var nsIPrefBranch = GREUtils.XPCOM.Ci("nsIPrefBranch");
    var type = prefs.getPrefType(prefName);
    if (type == nsIPrefBranch.PREF_STRING)
        prefs.setCharPref(prefName, value);
    else if (type == nsIPrefBranch.PREF_INT)
        prefs.setIntPref(prefName, value);
    else if (type == nsIPrefBranch.PREF_BOOL)
        prefs.setBoolPref(prefName, value);
};
