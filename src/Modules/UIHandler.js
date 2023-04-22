/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

/*#INCLUDES#*/

/*#BEGINWRAP(EVUI.Modules.UIHandler|UI)#*/
/*#REPLACE(EVUI.Modules.UIHandler|UI)#*/

/**Module for responding directly to UI events via in-lined event handlers.
@module*/
EVUI.Modules.UIHandler = {};

/*#MODULEDEF(UI|"1.0";|"UI")#*/
/*#VERSIONCHECK(EVUI.Modules.UIHandler|UI)#*/

EVUI.Modules.UIHandler.Dependencies =
{
    Core: Object.freeze({ version: "1.0", required: true }),
};

(function ()
{
    var checked = false;

    Object.defineProperty(EVUI.Modules.UIHandler.Dependencies, "checked",
        {
            get: function () { return checked; },
            set: function (value)
            {
                if (typeof value === "boolean") checked = value;
            },
            configurable: false,
            enumberable: true
        });
})();


Object.freeze(EVUI.Modules.UIHandler.Dependencies);

EVUI.Modules.UIHandler.Constants = {};

/**Callback function for handling a UI event.
@param {EVUI.Modules.UIHandler.UIHandlerEventArgs} args An instance of EVUI.Resources.UIHandlerEventArgs*/
EVUI.Modules.UIHandler.Constants.Fn_Handle = function (args) { };

Object.freeze(EVUI.Modules.UIHandler.Constants);

/**Object for managing UIHandles and their invocation.
@class*/
EVUI.Modules.UIHandler.UIHandlerManager = function ()
{
    if (EVUI.Modules.Core == null) throw Error("Dependency missing: EVUI.Modules.Core is required.");
    EVUI.Modules.Core.Utils.requireAll(EVUI.Modules.UIHandler.Dependencies);

    var _self = this;

    /**Array. The list of internal UIHandlers.
    @type {EVUI.Modules.UIHandler.UIHandle[]}*/
    var _handlers = {};

    /**Adds a UIHandler to the manager.
    @param {String|EVUI.Modules.UIHandler.UIHandle} keyOrHandle Either the string key of the handler, or a YOLO UIHandle object.
    @param {EVUI.Modules.UIHandler.UIHandler.Fn_Handle} handler The handling function that will be invoked with handle is called with the given key.*/
    this.addHandler = function (keyOrHandle, handler)
    {
        var handle = null;
        if (keyOrHandle == null) throw Error("Invalid input, object or string expected.");

        if (typeof keyOrHandle === "object")
        {
            handle = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.UIHandler.UIHandle(keyOrHandle.key, keyOrHandle.handle), keyOrHandle, ["key", "handle"]);
        }
        else if (typeof keyOrHandle === "string" && EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(keyOrHandle) === false)
        {
            handle = new EVUI.Modules.UIHandler.UIHandle(keyOrHandle, handler);
        }
        else
        {
            throw Error("Invalid input, object or string expected.");
        }

        var existing = this.getHandler(handle.key);
        if (existing != null) throw Error("A UIHandle with the name \"" + handle.key + "\" already exists.");

        _handlers[handle.key] = handle;
    };

    /**Removes a UIHandler from the manager.
    @param {String} key The key of the UIHandler to remove.
    @returns {Boolean}*/
    this.removeHandler = function (key)
    {
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(key) === true) return false;
        var existing = this.getHandler(key);

        if (existing == null) return false;

        var index = _handlers.indexOf(existing);
        if (index !== -1) _handlers.splice(index, 1);

        return true;
    };

    /**Event that fires ever time an event is routed through the manager. Can prevent that UIHandle's handler from being called via calling cancel on the event args.
    @param {EVUI.Modules.UIHandler.UIHandlerEventArgs} uiHandlerEventArgs The event arguments for the event.*/
    this.onHandle = function (uiHandlerEventArgs)
    {

    };

    /**Handles a UI event by calling the UIHandler with the matching key.
    @param {String} key The key of the UIHandler to call.
    @param {Event|Any} eventArgsOrData Either the browser's event arguments or custom data to pass into the UIHandler's handle.
    @param {Any} data Custom data to pass into the UIHandler's handle.*/
    this.handle = function (key, eventArgsOrData, data)
    {
        var uiEvent = null;
        var handlerName = null;
        var handlerData = null;

        if (typeof key !== "string" || EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(key) === true)  throw Error("Invalid input, no handler name provided.");
        
        handlerName = key;
        if (eventArgsOrData != null)
        {
            if (eventArgsOrData instanceof Event)
            {
                uiEvent = eventArgsOrData;
                if (data != null) handlerData = data;   
            }
            else
            {
                handlerData = eventArgsOrData;
            }         
        }
        else
        {
            if (data != null) handlerData = data;
        }           

        var handler = this.getHandler(handlerName);
        if (handler == null) throw Error("No handler present for event \"" + key + "\"");

        var canceled = false;
        var args = new EVUI.Modules.UIHandler.UIHandlerEventArgs(handlerName, uiEvent);
        args.data = handlerData;
        args.cancel = function ()
        {
            canceled = true;
        };

        var onHandleWrapper = function (uiManagerArgs)
        {
            if (typeof _self.onHandle === "function")
            {
                return _self.onHandle(uiManagerArgs);
            }
        };

        var eventHandlerWrapper = function (uiManagerArgs)
        {
            if (typeof handler.handler === "function" && canceled === false)
            {
                return handler.handler(uiManagerArgs);
            }
        };

        var exeArgs = new EVUI.Modules.Core.AsyncSequenceExecutionArgs();
        exeArgs.functions = [onHandleWrapper, eventHandlerWrapper];
        exeArgs.parameter = args;

        EVUI.Modules.Core.AsyncSequenceExecutor.execute(exeArgs, function (error)
        {
            if (error instanceof Error) throw error;
        });
    };

    /**Gets a UIHandler based on its key.
    @param {String} key The key of the UIHandler to get.
    @returns {EVUI.Modules.UIHandler.UIHandle}*/
    this.getHandler = function (key)
    {
        return _handlers[key];
    };
};


/**Object representing a key-value pair of an event handler to a key name, as well as an executing context.
@class*/
EVUI.Modules.UIHandler.UIHandle = function (key, handler)
{
    if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(key) === true) throw new Error("key must be a valid string with at least one non-whitespace character.");
    if (handler != null && typeof handler !== "function") throw new Error("handler must be a function.")

    var _key = key;
    var _handler = (typeof handler === "function") ? handler : null;

    /**String. Read-only. The key by which this event is referenced.
    @type {String}*/
    this.key = null;
    Object.defineProperty(this, "key",
    {
        get: function () { return _key; },
        configurable: false,
        enumerable: true
    });

    /**Function. The function that will fire when this command is called from the UI.
    @type {EVUI.Modules.UIHandler.UIHandler.Fn_Handle}*/
    this.handler = null;
    Object.defineProperty(this, "handler",
    {
        get: function () { return _handler; },
        set: function (value) { if (value != null && typeof value !== "function") throw Error("handler must be a function."); },
        configurable: false,
        enumerable: true
    });
};

/**Object representing the event arguments that the handler will receive.
@class*/
EVUI.Modules.UIHandler.UIHandlerEventArgs = function (key, eventArgs)
{
    var _key = key;
    var _eventArgs = eventArgs;
    var _currentTargetAttributes = null;
    var _targetAttributes = null;    

    /**Object. An instance of EVUI.Resources.UIHandler representing the event handler being called.
    @type {String}*/
    this.key = null;
    Object.defineProperty(this, "key",
    {
        get: function () { return _key; },
        configurable: false,
        enumerable: true
    });

    /**Object. The browser's event arguments.
    @type {Event}*/
    this.eventArgs = null;
    Object.defineProperty(this, "eventArgs",
    {
        get: function () { return _eventArgs; },
        configurable: false,
        enumerable: true
    });

    /**Any. Any data passed into the handle function that is to be used in processing the event.
    @type {Any}*/
    this.data = null;

    /**Object. An object containing all the attributes that were attached to the currentTarget property of the eventArgs.
    @type {EVUI.Modules.Core.CaseInsensitiveObject}*/
    this.currentTargetAttributes = null;
    Object.defineProperty(this, "currentTargetAttributes", {
        get: function ()
        {
            if (_currentTargetAttributes == null)
            {
                if (_eventArgs.currentTarget != null) _currentTargetAttributes = EVUI.Modules.Core.Utils.getElementAttributes(_eventArgs.currentTarget);
            }

            return _currentTargetAttributes;
        },
        enumerable: true,
        configurable: false
    });

    /**Object. An object containing all the attributes that were attached to the target property of the eventArgs.
    @type {EVUI.Modules.Core.CaseInsensitiveObject}*/
    this.targetAttributes = null;
    Object.defineProperty(this, "targetAttributes", {
        get: function ()
        {
            if (_targetAttributes == null)
            {
                if (_eventArgs.target != null) _targetAttributes = EVUI.Modules.Core.Utils.getElementAttributes(_eventArgs.target);
            }

            return _targetAttributes;
        },
        enumerable: true,
        configurable: false
    });

    /**If called in the global onHandle event, this prevents the UIHandler's handle from firing.*/
    this.cancel = function ()
    {

    };
};

/**Global instance of the UIHandler, used for routing all UI events through the same codepath.
@type {EVUI.Modules.UIHandler.UIHandlerManager}*/
EVUI.Modules.UIHandler.Manager = null;
(function ()
{
    var ctor = EVUI.Modules.UIHandler.UIHandlerManager;
    var manager = null;

    Object.defineProperty(EVUI.Modules.UIHandler, "Manager", {
        get: function ()
        {
            if (manager == null) manager = new ctor();
            return manager;
        },
        configurable: false,
        enumberable: true
    });
})();

delete $evui.uiHandler;

/**Global instance of the UIHandler.
@type {EVUI.Modules.UIHandler.UIHandlerManager}*/
$evui.uiHandler = null;
Object.defineProperty($evui, "uiHandler", {
    get: function ()
    {
        return EVUI.Modules.UIHandler.Manager;
    },
    enumerable: true
});

/**Handles a UI event by calling the UIHandler with the matching key.
@param {String} key The key of the UIHandler to call.
@param {Event|Any} eventArgsOrData Either the browser's event arguments or custom data to pass into the UIHandler's handle.
@param {Any} data Custom data to pass into the UIHandler's handle.*/
$evui.handle = function (key, eventArgsOrData, data)
{
    return EVUI.Modules.UIHandler.Manager.handle(key, eventArgsOrData, data);
};

/**Adds a UIHandler to the manager.
@param {String|EVUI.Modules.UIHandler.UIHandle} keyOrHandle Either the string key of the handler, or a YOLO UIHandle object.
@param {EVUI.Modules.UIHandler.Constants.Fn_Handle} handler The handling function that will be invoked with handle is called with the given key.*/
$evui.addUIHandler = function (keyOrHandle, handler)
{
    return EVUI.Modules.UIHandler.Manager.addHandler(keyOrHandle, handler);
};

/**Removes a UIHandler from the manager.
@param {String} key The key of the UIHandler to remove.
@returns {Boolean}*/
$evui.removeUIHandler = function (key)
{
    return EVUI.Modules.UIHandler.Manager.removeHandler(key);
};

Object.freeze(EVUI.Modules.UIHandler);

/*#ENDWRAP(UI)#*/