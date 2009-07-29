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

    var parent = aParent || window ||  null;
    var windowName = aName || "_blank";
    var args = aArguments || null;
    var features = aFeatures || "chrome,centerscreen";

    var parseFeature = function (str) {
        var obj = {};
        var arStr = str.split(',');
        arStr.forEach(function(v){
           var arVal = v.split('=');
           obj[arVal[0]] = arVal[1] || '';
        });
        return obj;
    };

    var featureObj = parseFeature(features);

    try {
        // using window.openDialog
        if (parent && parent.openDialog) {

            var args = [];
            for (var i=4; i<arguments.length; i++) {
                args.push(arguments[i]);
            }
            
            //dump(parent.screen.width + ',,,' + parent.screen.height + ',,,' + parent.document.documentElement.boxObject.screenX + '\n');

            if (parent.document.documentElement.boxObject.screenX <=0) {
                
                if ( typeof featureObj['centerscreen'] != 'undefined') {

                    // calc left , top
                    if(typeof featureObj['centerscreen'] != 'undefined') delete featureObj['centerscreen'];
                    if(typeof featureObj['dependent'] != 'undefined') delete featureObj['dependent'];

                    featureObj['left'] = parseInt( (parent.screen.width-featureObj['width'])/2);
                    featureObj['top'] = parseInt( (parent.screen.height-featureObj['height'])/2);

//                    dump(parent.screen.width + ',,,' + parent.screen.height + '\n');
                    
                }
            }

            var newFeatures = [];
            for (var k in featureObj) {
                if (featureObj[k]) newFeatures.push(k + '=' + featureObj[k]);
                else newFeatures.push(k);
            }

            features = newFeatures.join(',');

            //dump('openDialog: ' + features  + '\n');
            return parent.openDialog.apply(parent, [aUrl, windowName, features].concat(args));

        }else {

            // wraped js to xpcom object, only js primitive types support
            var array = Components.classes["@mozilla.org/array;1"]
                                  .createInstance(Components.interfaces.nsIMutableArray);
            for (var i=4; i<arguments.length; i++)
            {

                if (typeof arguments[i] == 'object') {
                    arguments[i].wrappedJSObject = arguments[i];
                    array.appendElement(arguments[i], false)
                }else {
                    var variant = Components.classes["@mozilla.org/variant;1"]
                                            .createInstance(Components.interfaces.nsIWritableVariant);
                    variant.setFromVariant(arguments[i]);
                    array.appendElement(variant, false);
                }

            }

            var ww = GREUtils.XPCOM.getUsefulService("window-watcher");
            //dump('openWindow: ' + features  + ' [ ' + parent + ' ] \n');
            return  ww.openWindow(parent, aUrl, windowName, features, array);

        }
    }catch (e) {
        // ignore type check
    }

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
