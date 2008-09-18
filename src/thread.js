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
