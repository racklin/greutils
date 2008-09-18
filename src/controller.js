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
