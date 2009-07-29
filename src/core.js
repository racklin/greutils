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
  return (typeof type == 'object' && type.constructor.name == "Array");
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
  return (typeof type == 'object' || typeof type == 'function');
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
