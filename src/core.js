/**
 * GREUtils - A set of convenience packages and functions useful for developing applications for
 * the Gecko Runtime Environment (XULRunner / FireFox).
 * 
 * @public
 * @name GREUtils
 * @namespace GREUtils
 */
var GREUtils = GREUtils  ||  {version: "1.1"};

GREUtils.context = this;

GREUtils.global = (typeof window != 'undefined') ? window : this;


/**
 * Extends an object by merging properties from other objects.
 * 
 * Properties in the target object (the object being extended) are overridden by
 * properties from the objects used for extending the target object.  
 *
 * @public
 * @static
 * @function
 * @param {Object} target                     This is the object being extended
 * @param {Object} source                     This is the object used to extend the target
 * @param {Object} extras                     This object, if provided, is also used to extend the target
 * @return {Object}                           The original but modified object
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
 *  Extends any object or function with a getInstance() method to support the
 *  Singleton pattern. Invoking the getInstance() method on the extended
 *  target will always return the same instance of the target.
 *  
 *  The intent of the Singleton pattern as defined in Design Patterns is to
 *  "ensure a class has only one instance, and provide a global point of access to it".
 *
 * @public
 * @static
 * @function
 * @param {Object|Function} target            This is the object or function to extend to support Singleton pattern
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
 * inheritance has been established, instance of the child class can use
 * this._super to call parent methods.
 * 
 * @public
 * @static
 * @function
 * @param {Function} childFunc                This is the child class.
 * @param {Function} parentFunc               This is the parent class.
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
 * Creates a namespace, optionally associating a context with the namespace.
 * 
 * @public
 * @static
 * @function
 * @param {Function} name                     This is the name of the namespace
 * @param {Function} context                  This is the namespace context; defaults to the global context
 */
GREUtils.define = function(name, context) {

  GREUtils.createNamespace(name, {}, context);

};


/**
 * Using a namespace, optionally associating a context with the namespace.
 * 
 * @public
 * @static
 * @function
 * @param {Function} name                     This is the name of the namespace
 * @param {Function} context                  This is the namespace context; defaults to the global context
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
 * @function
 * @static
 * @param {string} name 			Name of the object that this file defines.
 * @param {Object} object 			Object to expose at the end of the path.
 * @param {Object} context			Create Namespace in context.
 */
GREUtils.createNamespace = function(name, object, context) {
  var parts = name.split('.');
  var cur = context || GREUtils.global;
  var part;

  while ((part = parts.shift())) {
    if (!parts.length && GREUtils.isDefined(object)) {
      // last part and we have an object; use it
      cur[part] = object;
      
      // add to GREUtils jsm context
      GREUtils.context[name] = object;

    } else if (cur[part]) {
      cur = cur[part];
    } else {
      cur = cur[part] = {};
    }
  }

};

/**
 * Returns an object based on its fully qualified name (by GREUtils.createNamespace)
 *
 * @param {Object} name  The fully qualified name.
 * @param {Object} context
 * @return {Object?} The object or, if not found, null. 
 */
GREUtils.getObjectByNamespace = function(name, context){
	
  var parts = name.split('.');
  var cur = context || GREUtils.global;
  
  for (var part; part = parts.shift(); ) {
    if (cur[part]) {
      cur = cur[part];
    } else {
      cur = null;
    }
  }
  
  if (cur == null) {
      // try to get from greutils.context
      cur = GREUtils.context[name] || null;
  }

  return cur;

};


/**
 * Checks if the type is defined
 * 
 * @public
 * @static
 * @function
 * @param {String} type           			This is the value to check
 * @return {Boolean}            			"true" if parameter is defined; "false" otherwise
 */
GREUtils.isDefined = function(type) {
    return typeof type != 'undefined';
};


/**
 * Checks if the type is function.
 * 
 * @public
 * @static
 * @function
 * @param {Object|Function} type			This is the value to check
 * @return {Boolean}						"true" if the value is a function; "false" otherwise
 */
GREUtils.isFunction = function(type) {
  return typeof type == "function";
};


/**
 * Checks if the value is null.
 * 
 * @public
 * @static
 * @function
 * @param {Object} type           This is the value to check
 * @return {Boolean}              "true" if the value is null; "false" otherwise
 */
GREUtils.isNull = function(type) {
  return type === null;
};


/**
 * Checks if the value is defined and not null.
 * 
 * @public
 * @static
 * @function
 * @param {Object} type			          This is the value to check
 * @return {Boolean}                      "true" if the value is defined and not null; "false" otherwise
 */
GREUtils.isDefineAndNotNull = function(type) {
  return GREUtils.isDefined(type) && !GREUtils.isNull(type);
};


/**
 * Checks if the value is an array.
 * 
 * @public
 * @static
 * @function
 * @param {Object} type           This is the value to check
 * @return {Boolean}              "true" if the value is an array; "false" otherwise
 */
GREUtils.isArray = function(type) {
  return typeof type == 'array';
};

/**
 * Checks if the value is a string.
 * 
 * @public
 * @static
 * @function
 * @param {Object} type           This is the value to check
 * @return {Boolean}              "true" if the value is a string; "false" otherwise
 */
GREUtils.isString = function(type) {
  return typeof type == 'string';
};


/**
 * Checks if the value is a boolean.
 * 
 * @public
 * @static
 * @function
 * @param {Object} type           This is the value to check
 * @return {Boolean}              "true" if the value is a boolean; "false" otherwise
 */
GREUtils.isBoolean = function(type) {
  return typeof type == 'boolean';
};


/**
 * Checks if the value is a number.
 * 
 * @public
 * @static
 * @function
 * @param {String} type           This is the value to check
 * @return {Boolean}              "true" if the value is a number; "false" otherwise
 */
GREUtils.isNumber = function(type) {
  return typeof type == 'number';
};


/**
 * Checks if the value is an object (including functions and arrays).
 * 
 * @public
 * @static
 * @function
 * @param {String} type           This is the value to check
 * @return {Boolean}              "true" if the value is an object; "false" otherwise
 */
GREUtils.isObject = function(type) {
  var type = typeof type;
  return type == 'object' || type == 'array' || type == 'function';
};

/**
 * Gets the current time.
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
