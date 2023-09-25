/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

/*#INCLUDES#*/

/*#BEGINWRAP(EVUI.Modules.Events|Event)#*/
/*#REPLACE(EVUI.Modules.Events|Event)#*/

/**Module for custom events that are not attached to the DOM.
@module*/
EVUI.Modules.Events = {};

/*#MODULEDEF(Event|"1.0";|"Events")#*/
/*#VERSIONCHECK(EVUI.Modules.Events|Event)#*/

EVUI.Modules.Events.Dependencies =
{
    Core: Object.freeze({ version: "1.0", required: true }),
    EventStream: Object.freeze({ version: "1.0", required: true }),
};

(function ()
{
    var checked = false;

    Object.defineProperty(EVUI.Modules.Events.Dependencies, "checked",
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


Object.freeze(EVUI.Modules.Events.Dependencies);

/**Constants table relating to the EventManager. */
EVUI.Modules.Events.Constants = {};

/**The handler that will be fired for each event.
@param {EVUI.Modules.Events.EventManagerEventArgs} eventHandlerArgs An instance of EventManagerEventArgs.*/
EVUI.Modules.Events.Constants.Fn_Handler = function (eventHandlerArgs) { };

/**The callback that will be fired once the ask operation is complete.
@param {EVUI.Modules.Events.AskResult[]} answers An array of AskResponses representing the response from each EventListener that was asked to respond.*/
EVUI.Modules.Events.Constants.Fn_AskResultCallback = function (answers) { };

Object.freeze(EVUI.Modules.Events.Constants);

/**Utility for managing sending signals between areas of code without being bound to DOM elements.
@class*/
EVUI.Modules.Events.EventManager = function ()
{
    if (EVUI.Modules.Core == null) throw Error("Dependency missing: EVUI.Modules.Core is required.");
    EVUI.Modules.Core.Utils.requireAll(EVUI.Modules.Events.Dependencies);

    var _self = this;

    /**We keep an internal list of listeners composed of InternalEventListener objects to make the HandlerID immutable.
    @type {InternalEventListener[]}*/
    var _listeners = [];

    /**Represents the internal metadata about an event.
    @class*/
    var InternalEventListener = function ()
    {
        /**The EventListener object being managed.
        @type {EVUI.Modules.Events.EventListener}*/
        this.eventListener = null;

        /**The order in which the listener was registered relative to other listeners with the same name.
        @type {Number}*/
        this.ordinal = null;

        /**The mode of operation for the EventListener. Must be a value from EventListenerMode.
        @type {Number}*/
        this.mode = EventListenerMode.None;
    };

    /**Enum for keeping track of how an EventListner should be treated.
    @enum*/
    var EventListenerMode =
    {
        None: -1,
        FireUntilRemoved: 0,
        FireOnce: 1,
        Removed: 2
    };

    /**Enum for determining the behavior of the EventSession being executed.
    @enum*/
    var SessionMode =
    {
        None: -1,
        Trigger: 0,
        Ask: 1
    };

    /**Represents the internal data aggregated for a list of events that will be executed.
    @class*/
    var EventSession = function ()
    {
        /**String. The unique identifier for the session.
        @type {String}*/
        this.sessionID = EVUI.Modules.Core.Utils.makeGuid();

        /**Object. The arguments used to trigger the event.
        @type {EVUI.Modules.Events.EventTriggerArgs}*/
        this.triggerArgs = null;

        /**Array. The array of InternalEventListeners that are going to be executed.
        @type {InternalEventListener[]}*/
        this.listeners = [];

        /**Function. If the mode is "Ask", this is the callback that will return the AskResponses to the caller.
        @type {EVUI.Modules.Events.Constants.Fn_AskResultCallback}*/
        this.callback = null;

        /**Number. The mode of operation for this EventSession. Must be a value from the SessionMode enum.
        @type {Number}*/
        this.mode = SessionMode.None;

        /**Array. The array of results that were returned from each EventListener that responded to an ask operation.
        @type {EVUI.Modules.Events.AskResult[]}*/
        this.askResults = [];

        /**Object. The EventStream managing the flow of the events.
        @type {EVUI.Modules.EventStream.EventStream}*/
        this.eventStream = null;
    };

    /**Adds a listener to the EventManager to be executed whenever trigger is called on an event with the same name.
    @param {EVUI.Modules.Events.EventListenerAddRequest|String} eventListenerOrEventName Either a YOLO EventListener object or the name of the event to listen for,
    @param {EVUI.Modules.Events.Constants.Fn_Handler} handler The function that will be executed when this event is triggered.
    @param {Number} priority The priority of this event relative to the other events with the same name to determine the execution order of event handlers.
    @param {String} handlerName An identifier to give the handler for tracing purposes.
    @returns {EVUI.Modules.Events.EventListener}*/
    this.on = function (eventListenerOrEventName, handler, priority, handlerName)
    {
        return addListener(eventListenerOrEventName, handler, priority, handlerName, EventListenerMode.FireUntilRemoved);
    };

    /**Adds a listener to the EventManager to be executed whenever trigger is called on an event with the same name and then is removed.
    @param {EVUI.Modules.Events.EventListenerAddRequest|String} eventListenerOrEventName Either a YOLO EventListener object or the name of the event to listen for,
    @param {EVUI.Modules.Events.Constants.Fn_Handler} handler The function that will be executed when this event is triggered.
    @param {Number} priority The priority of this event relative to the other events with the same name to determine the execution order of event handlers.
    @param {String} handlerName An identifier to give the handler for tracing purposes.
    @returns {EVUI.Modules.Events.EventListener}*/
    this.once = function (eventListenerOrEventName, handler, priority, handlerName)
    {
        return addListener(eventListenerOrEventName, handler, priority, handlerName, EventListenerMode.FireOnce);
    };

    /**Removes all the EventListeners with the given event name, callback function and/or exeuctingContext.
    @param {String} eventNameOrIDOrHandler The name or ID of the event to remove.
    @param {EVUI.Modules.Events.Constants.Fn_Handler} handler The function that gets called when the event is invoked.*/
    this.off = function (eventNameOrId, handler)
    {
        var listenersToRemove = [];

        var numListeners = _listeners.length;
        for (var x = 0; x < numListeners; x++)
        {
            var curListener = _listeners[x];

            if (curListener.eventListener.handlerId === eventNameOrId || curListener.eventListener.eventName === eventNameOrId)
            {
                if (typeof handler === "function")
                {
                    if (curListener.eventListener.handler === handler) listenersToRemove.push(curListener);
                }
                else
                {
                    listenersToRemove.push(curListener);
                }
            }
        }

        var numToRemove = listenersToRemove.length;
        for (var x = 0; x < numToRemove; x++)
        {
            var index = _listeners.indexOf(listenersToRemove[x]);
            if (index !== -1) _listeners.splice(index, 1);
        }
    };

    /**Calls all the event listeners with the given name.
    @param {EVUI.Modules.Events.EventTriggerArgs|String} eventNameOrTriggerArgs Either a YOLO EventTriggerArgs object or the name of the event to trigger.
    @param {Any} data Any data to pass to the events being triggered.
    @param {String} triggerName The name to give the trigger for tracing purposes.*/
    this.trigger = function (eventNameOrTriggerArgs, data, triggerName)
    {
        var triggerArgs = toTriggerArgs(eventNameOrTriggerArgs, data, triggerName);

        var session = buildEventSession(triggerArgs, SessionMode.Trigger);
        if (session == null) return;

        launchEvent(session);
    };

    /**Calls all the event listeners with the given name and collects their responses and passes them into the callback function.
    @param {EVUI.Modules.Events.EventTriggerArgs|String} eventNameOrTriggerArgs Either a YOLO EventTriggerArgs object or the name of the event to trigger.
    @param {Any} data Any data to pass to the events being triggered.
    @param {String} triggerName The name to give the trigger for tracing purposes.
    @param {EVUI.Modules.Events.Constants.Fn_AskResultCallback} callback The callback function that will be passed the responses to the ask operation from each handler.*/
    this.ask = function (eventNameOrTriggerArgs, data, triggerName, callback)
    {
        if (typeof callback !== "function") callback = function (askResults) { };

        var triggerArgs = toTriggerArgs(eventNameOrTriggerArgs, data, triggerName);

        var session = buildEventSession(triggerArgs, SessionMode.Ask, callback);
        if (session == null) return callback([]);

        launchEvent(session);
    };

    /**Awaitable. Calls all the event listeners with the given name and collects their responses and returns them as the promise resolution value.
    @param {EVUI.Modules.Events.EventTriggerArgs|String} eventNameOrTriggerArgs Either a YOLO EventTriggerArgs object or the name of the event to trigger.
    @param {Any} data Any data to pass to the events being triggered.
    @param {String} triggerName The name to give the trigger for tracing purposes.
    @returns {Promise<EVUI.Modules.Events.AskResult[]>}*/
    this.askAsync = function (eventNameOrTriggerArgs, data, triggerName)
    {
        return new Promise(function (resolve)
        {
            _self.ask(eventNameOrTriggerArgs, data, triggerName, function (askResponses)
            {
                resolve(askResponses);
            });
        });
    };

    /**Gets all the event listeners with the given event name, callback function and/or exeuctingContext. 
    @param {String} eventName: The name of the event to get.
    @returns {EVUI.Modules.Events.EventListener[]}*/
    this.getEventListeners = function (eventName)
    {
        return getListeners(eventName).map(function (listener) { return listener.eventListener });
    };

    /**Gets an event listener based on its HandlerID.
    @param {String} handlerID: The ID of the event listener handle to get.
    @returns {EVUI.Modules.Events.EventListener}*/
    this.getEventListener = function (handlerID)
    {
        var listener = getListener(handlerID);
        if (listener == null) return null;

        return listener.eventListener;
    };

    /**Adds a listener to the EventManager to be executed whenever trigger is called on an event with the same name and then is removed.
    @param {EVUI.Modules.Events.EventListener|String} eventListenerOrEventName Either a YOLO EventListener object or the name of the event to listen for,
    @param {EVUI.Modules.Events.Constants.Fn_Handler} handler The function that will be executed when this event is triggered.
    @param {Number} priority The priority of this event relative to the other events with the same name to determine the execution order of event handlers.
    @param {String} handlerName An identifier to give the handler for tracing purposes.
    @param {Number} mode The mode in which the event handler will be managed.
    @returns {EVUI.Modules.Events.EventListener}*/
    var addListener = function (eventListenerOrEventName, handler, priority, handlerName, mode)
    {
        if (eventListenerOrEventName == null) return null;
        var eventListener = null;

        //they gave us a list of parameters and not just an object
        if (typeof eventListenerOrEventName === "string")
        {
            if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(eventListenerOrEventName) === true) throw Error("Event name must be a non-whitespace string.");
            if (typeof handler !== "function") throw Error("Event handler must be a function.");

            eventListener = new EVUI.Modules.Events.EventListener(eventListenerOrEventName, handler, priority, handlerName);
        }
        else if (typeof eventListenerOrEventName === "object") //they gave us an object, make it into one of our objects.
        {
            if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(eventListenerOrEventName.eventName) === true) throw Error("Event name must be a non-whitespace string.");
            if (typeof eventListenerOrEventName.handler !== "function") throw Error("Event handler must be a function.");

            eventListener = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Events.EventListener(eventListenerOrEventName.eventName, eventListenerOrEventName.handler, eventListenerOrEventName.priority, eventListenerOrEventName.handlerName), eventListenerOrEventName, ["eventName", "handler", "priority", "handlerName", "handlerId"])
        }
        else
        {
            throw Error("Invalid parameters. First parameter must be either a YOLO EventListener object or a non-whitespace string event name.");
        }

        var maxOrdinal = 0;
        var numEntries = _listeners.length;
        for (var x = 0; x < numEntries; x++)
        {
            var curEntry = _listeners[x];
            if (curEntry.eventListener.eventName === eventListener.eventName)
            {
                if (curEntry.ordinal >= maxOrdinal) maxOrdinal = curEntry.ordinal + 1;
            }
        }

        var internalListener = new InternalEventListener();
        internalListener.eventListener = eventListener;
        internalListener.mode = mode;
        internalListener.ordinal = maxOrdinal;

        //add it to our internal index of handlers
        _listeners.push(internalListener);

        //return the handlerId, like how setTimeout and setInterval do
        return eventListener;
    }

    /**Translates the arguments from the trigger and ask functions into a EventTriggerArgs object.
    @param {EVUI.Modules.Events.EventTriggerArgs|String} eventNameOrTriggerArgs Either a YOLO EventTriggerArgs object or the name of the event to trigger.
    @param {Any} data Any data to pass to the events being triggered.
    @param {String} triggerName The name to give the trigger for tracing purposes.
    @returns {EVUI.Modules.Events.EventTriggerArgs}*/
    var toTriggerArgs = function (eventNameOrTriggerArgs, data, triggerName)
    {
        var triggerArgs = new EVUI.Modules.Events.EventTriggerArgs();
        if (typeof eventNameOrTriggerArgs === "string" && EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(eventNameOrTriggerArgs) === false)
        {
            triggerArgs.eventName = eventNameOrTriggerArgs;
            triggerArgs.data = data;
            triggerArgs.triggerName = triggerName;
        }
        else if (typeof eventNameOrTriggerArgs === "object")
        {
            EVUI.Modules.Core.Utils.shallowExtend(triggerArgs, eventNameOrTriggerArgs);
            if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(triggerArgs.eventName) === true) throw Error("Event name must be a non-whitespace string.");
        }
        else
        {
            throw Error("Invalid parameters. Parameter must be a YOLO EventTriggerArgs object or a non-whitespace string.")
        }

        return triggerArgs;
    };

    /**Builds an EventSession by collecting all the EventListeners that will be executed and building the EventStream that will manage their execution.
    @param {EVUI.Modules.Events.EventTriggerArgs} triggerArgs The arguments used for triggering the event.
    @param {Number} mode The mode of the EventSession, must be a value from EventSessionMode.
    @param {EVUI.Modules.Events.Constants.Fn_AskResultCallback} callback The ask result callback if the EventSession is an ask operation.
    @returns {EventSession}*/
    var buildEventSession = function (triggerArgs, mode, callback)
    {
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(triggerArgs.eventName) === true) return null;

        var session = new EventSession();
        session.triggerArgs = triggerArgs;
        session.mode = mode;
        session.callback = callback;

        var listeners = getListeners(triggerArgs.eventName);
        if (listeners == null || listeners.length === 0) return null;

        listeners = listeners.sort(function (listener1, listener2)
        {
            if (listener1.eventListener.priority === listener2.eventListener.priority)
            {
                return listener1.orindal - listener2.ordinal;
            }
            else
            {
                return listener2.eventListener.priority - listener1.eventListener.priority;
            }
        });

        session.listeners = listeners;
        session.eventStream = buildEventStream(session);

        return session;
    };

    /**Logs a tracing message about the triggering and handling of an event.
    @param {EVUI.Modules.Events.EventTriggerArgs} triggerArgs The arguments used to trigger the event.
    @param {InternalEventListener} eventListener An instance of InternalEventListener.*/
    var trace = function (triggerArgs, eventListener)
    {
        if (EVUI.Modules.Core.Utils.isSettingTrue("traceEvents") === false) return;

        var handlerName = EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(eventListener.handlerName) ? "unknown" : eventListener.handlerName;
        var triggerName = EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(triggerArgs.triggerName) ? "unknown" : triggerArgs.triggerName;

        var traceMessage = "BTMTRACE: Event \"" + triggerArgs.eventName + "\": (\"" + triggerName + "\") => \"" + handlerName + "\"";

        EVUI.Modules.Core.Utils.log(traceMessage);
    };

    /**Queues the EventSession and dispatches a new event to trigger the new EventStream.
    @param {EventSession} session The session to execute.*/
    var launchEvent = function (session)
    {
        window.setTimeout(function () //set a timeout so the steps in multiple concurrent queued EventStreams go in order instead of in parallel
        {
            session.eventStream.execute();
        });
    };

    /**Builds the EventStream that will execute all of the queued events sequentially.
    @param {EventSession} session The session containing all the data to use in building the EventStream.
    @returns {EVUI.Modules.EventStream.EventStream}*/
    var buildEventStream = function (session)
    {
        var index = 0;
        var numEvents = session.listeners.length;

        var es = new EVUI.Modules.EventStream.EventStream();

        es.processInjectedEventArgs = function (eventStreamArgs)
        {
            var eventManagerArgs = new EVUI.Modules.Events.EventManagerEventArgs(getNextListener(session, index), index + 1);
            eventManagerArgs.data = session.triggerArgs.data;
            eventManagerArgs.totalSteps = numEvents;
            eventManagerArgs.pause = eventStreamArgs.pause;
            eventManagerArgs.resume = eventStreamArgs.resume;
            eventManagerArgs.stopPropagation = eventStreamArgs.stopPropagation;

            if (session.mode === SessionMode.Ask)
            {
                eventManagerArgs.resume = function (answer)
                {
                    if (eventStreamArgs.resume() === true)
                    {
                        registerAnswer(session, eventManagerArgs.listener, answer, true);
                    }
                    
                };
            }

            if (eventStreamArgs.error == null) index++;

            return eventManagerArgs;
        };

        es.processReturnedEventArgs = function (eventManagerArgs, handlerResult)
        {
            if (eventManagerArgs instanceof EVUI.Modules.Events.EventManagerEventArgs) session.triggerArgs.data = eventManagerArgs.data;
            if (session.mode === SessionMode.Ask)
            {
                registerAnswer(session, eventManagerArgs.listener, handlerResult);
            }
        };

        es.endExecutionOnEventHandlerCrash = false;

        var numListeners = session.listeners.length;
        for (var x = 0; x < numListeners; x++)
        {
            addEvent(es, session, x);
        }

        if (session.mode === SessionMode.Ask)
        {
            es.addStep({
                key: "complete",
                name: "onComplete",
                type: EVUI.Modules.EventStream.EventStreamStepType.Job,
                handler: function (args)
                {
                    if (typeof session.callback === "function")
                    {
                        var exeArgs = new EVUI.Modules.Core.AsyncSequenceExecutionArgs();
                        exeArgs.functions = session.callback;
                        exeArgs.parameter = session.askResults;

                        EVUI.Modules.Core.AsyncSequenceExecutor.execute(exeArgs, function (error)
                        {
                            if (error != null)
                            {
                                throw error;
                            }

                            args.resolve();
                        });
                    }
                }
            });
        }

        return es;
    };

    /**Adds an event to the EventStream.
    @param {EVUI.Modules.EventStream.EventStream} es The EventStream to add the listener to.
    @param {EventSession} session The EventSession being executed.
    @param {Number} listenerIndex The index of the current event that is being added to the EventStream.*/
    var addEvent = function (es, session, listenerIndex)
    {
        if (es == null || session == null || session.listeners.length < listenerIndex) return;

        var curListener = session.listeners[listenerIndex];
        if (curListener.mode === EventListenerMode.Removed) return;
        

        es.addStep({
            name: curListener.eventListener.eventName + "-(" + session.sessionID + ")" + "-" + listenerIndex,
            key: curListener.eventListener.eventName,
            type: EVUI.Modules.EventStream.EventStreamStepType.Event,
            handler: function (eventManagerArgs)
            {
                if (typeof curListener.eventListener.handler !== "function" || curListener.mode === EventListenerMode.Removed) return;
                trace(session.triggerArgs, eventManagerArgs.listener);

                return eventManagerArgs.listener.handler(eventManagerArgs);
            }
        });

        //if we're in a fire-once scenario, add an extra step after the previous step has completed to remove the event from future lists and to flag it as having been removed.
        if (curListener.mode === EventListenerMode.FireOnce)
        {
            es.addStep({
                name: "removeFireOnce" + curListener.eventListener.eventName + "-(" + session.sessionID + ")" + "-" + listenerIndex,
                key: "remove:" + curListener.eventListener.eventName + "-" + listenerIndex,
                type: EVUI.Modules.EventStream.EventStreamStepType.Job,
                handler: function (jobArgs)
                {
                    curListener.mode = EventListenerMode.Removed;

                    var index = _listeners.indexOf(curListener);
                    if (index !== -1) _listeners.splice(index, 1);

                    jobArgs.resolve();
                }
            });
        }
    };

    /**Gets the next EventListener from the session with the given index.
    @param {EventSession} session The session that contains the listeners to get.
    @param {Number} index The index of the listener to get.
    @returns {EVUI.Modules.Events.EventListener} */
    var getNextListener = function (session, index)
    {
        var internalListener = session.listeners[index];
        if (internalListener == null) return null;

        return internalListener.eventListener;
    };

    /**If the operation is an ask operation, this registers the returned value from the event handler and ties it to the EventListener that was executed.
    @param {EventSession} session The session being executed.
    @param {EVUI.Modules} listener The listener that was completed.
    @param {Any} answer The answer that was returned.*/
    var registerAnswer = function (session, listener, answer, overwrite)
    {
        //make sure we're not filling in an answer for an event listener that was already flagged as being removed in a subsequent step or previous EventStream execution.
        var numListeners = session.listeners.length;
        for (var x = 0; x < numListeners; x++)
        {
            var curListener = session.listeners[x];
            if (curListener.eventListener === listener && curListener.mode === EventListenerMode.Removed) return;
        }

        //find the existing answer and get the existing answer so we can see if it can be overwritten with the new answer.
        var existingAnswer = null;
        var numAnswers = session.askResults.length;
        for (var x = 0; x < numAnswers; x++)
        {
            var curAnswer = session.askResults[x];
            if (curAnswer.eventListner === listener)
            {
                existingAnswer = curAnswer;
                break;
            }
        }

        if (existingAnswer != null) //if the answer's previous value was null and we now have a non-null value for it, overwrite it
        {
            if ((overwrite === true || existingAnswer.response === undefined) && answer !== undefined) existingAnswer.response = answer;
        }
        else //otherwise make a new answer response
        {
            var response = new EVUI.Modules.Events.AskResult();
            response.eventListner = listener;
            response.response = answer;

            session.askResults.push(response);
        }
    };

    /**Gets all the event listeners with the given event name, callback function and/or exeuctingContext. 
    @param {String} eventName: The name of the event to get.
    @returns {InternalEventListener[]}*/
    var getListeners = function (eventName)
    {
        var listeners = [];

        var numEventListeners = _listeners.length;
        for (var x = 0; x < numEventListeners; x++)
        {
            var curListener = _listeners[x];
            if (curListener.eventListener.eventName === eventName) listeners.push(curListener);
        }

        return listeners;
    };

    /**Gets an event listener based on its HandlerID.
    @param {String} handlerID: The ID of the event listener handle to get.
    @returns {InternalEventListener}*/
    var getListener = function (handlerID)
    {
        var numEventListeners = _listeners.length;
        for (var x = 0; x < numEventListeners; x++)
        {
            var curEventListener = _listeners[x];

            if (curEventListener.eventListener.handlerId === handlerID)
            {
                return curEventListener;
            }
        }
    };
};

/**An object that ties together an event name, its callback, its executing context, its priority (if there are other events with the same name) and the unique ID of it's handle.
@param {String} eventName The name of the event.
@param {EVUI.Constants.EventManager.Fn_Handler} handler The function to call when the event is invoked.
@param {Number} priority The priority of this event relative to other events with the same name.
@param {String} handlerName An identifier to give this listener, used for event tracing purposes.
@class*/
EVUI.Modules.Events.EventListener = function (eventName, handler, priority, handlerName)
{
    if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(eventName) === true) throw Error("event name must be a non-whitespace string.");
    if (typeof handler !== "function") throw Error("handler must be a function.");

    var _handlerId = EVUI.Modules.Core.Utils.makeGuid();
    var _priority = typeof priority === "number" ? priority : 0;
    var _eventName = eventName;
    var _handler = handler;
    var _handlerName = typeof handlerName === "string" ? handlerName : null;

    /**String. Read-only. The name of the event.
    @type {String}*/
    this.eventName = null;
    Object.defineProperty(this, "eventName", {    
        get: function () { return _eventName; },
        enumerable: true,
        configurable: false
    });

    /**Function. The function to call when this event is invoked.
    @type {EVUI.Modules.Events.Constants.Fn_Handler}*/
    this.handler = null;
    Object.defineProperty(this, "handler", {    
        get: function () { return _handler },
        set: function (value)
        {
            if (value != null && typeof value !== "function") throw Error("handler must be a function.")
            _handler = value;
        },
        enumerable: true,
        configurable: false
    });

    /**Number. The priority of this event relative to other events with the same name.
    @type {Number}*/
    this.priority = 0;
    Object.defineProperty(this, "priority", {
        get: function () { return _priority; },
        set: function (value)
        {
            if (typeof value !== "number") throw Error("priority must be a number.");
            _priority = value;
        },
        enumerable: true,
        configurable: false
    });

    /**String. Read-only. The unique ID of this event listener.
    @type {String}*/
    this.handlerId = _handlerId;
    Object.defineProperty(this, "handlerId", {
        get: function () { return _handlerId; },
        enumerable: true,
        configurable: false
    });

    /**An identifier to give the handler for tracing purposes.
    @type {String}*/
    this.handlerName = null;
    Object.defineProperty(this, "handlerName", {
        get: function () { return _handlerName; },
        set: function (value)
        {
            if (typeof value !== "string") throw Error("handlerName must be a string.");
            _handlerName = value;
        },
        configurable: false,
        enumerable: true
    });
};

/**Parameter object for creating an EventListener.
@class*/
EVUI.Modules.Events.EventListenerAddRequest = function ()
{
    /**String. The name of the event.
    @type {String}*/
    this.eventName = null;

    /**Function. The function to call when this event is invoked.
    @type {EVUI.Modules.Events.Constants.Fn_Handler}*/
    this.handler = null;

    /**Number. The priority of this event relative to other events with the same name.
    @type {Number}*/
    this.priority = null;

    /**An identifier to give the handler for tracing purposes.
    @type {String}*/
    this.handlerName = null;
};

/**The object that is injected into each handler as the arguments for the event being executed. Contains the user's custom event data as well as the functionality of the async event chain.
@class*/
EVUI.Modules.Events.EventManagerEventArgs = function (listener, currentStepIndex)
{
    var _listener = listener;
    var _currentStep = currentStepIndex;

    /**Object. The EventListener that is currently being executed.
    @type {EVUI.Modules.Events.EventListener}*/
    this.listener = null;
    Object.defineProperty(this, "listener", {
        get: function () { return _listener; },
        configurable: false,
        enumerable: true
    });

    /**Any. The user provided event argument data.
    @type {Any}*/
    this.data = null;

    /**Number. The index of the current step in the sequence of events.
    @type {Number}*/
    this.currentStep = -1;
    Object.defineProperty(this, "currentStep", {
        get: function () { return _currentStep; },
        configurable: false,
        enumerable: true
    });

    /**Number. The total number of events in the event sequence.
    @type {Number}*/
    this.totalSteps = -1;

    /**Function. Pauses the EventStream, preventing the next step from executing until resume is called.*/
    this.pause = function () { };

    /**Function. Resumes the EventStream, allowing it to continue to the next step.*/
    this.resume = function () { };

    /**Function. Stops the EventStream from calling any other event handlers with the same key.*/
    this.stopPropagation = function () { };
};

/**Optional arguments for triggering an event.
@class*/
EVUI.Modules.Events.EventTriggerArgs = function ()
{
    /**String. The name of the event to trigger.
    @type {String}*/
    this.eventName = null;

    /**Any. Any arguments to pass along into the triggering function.
    @type {Any}*/
    this.data = null;

    /**String. An identifier to give the trigger for tracing purposes.
    @type {String}*/
    this.triggerName = null;
};

/**Object representing the answer to an ask request.
@class*/
EVUI.Modules.Events.AskResult = function ()
{
    /**Object. The EventListener that was executed.
    @type {EVUI.Modules.Events.EventListener}*/
    this.eventListner = null;

    /**The value returned from the event handler.
    @type {Any}*/
    this.response = null;
};

/**Global instance of the EventManager, used for consuming and emitting custom events without binding them to the DOM.
@type {EVUI.Modules.Events.EventManager}*/
EVUI.Modules.Events.Manager = null;
(function ()
{
    var manager = null;
    var ctor = EVUI.Modules.Events.EventManager;

    Object.defineProperty(EVUI.Modules.Events, "Manager", {
        get: function ()
        {
            if (manager == null) manager = new ctor();
            return manager;
        },
        configurable: false,
        enumerable: true
    });
})();

delete $evui.events;

/**Global instance of the EventManager, used for consuming and emitting custom events without binding them to the DOM.
@type {EVUI.Modules.Events.EventManager}*/
$evui.events = null;
Object.defineProperty($evui, "events", {
    get: function ()
    {
        return EVUI.Modules.Events.Manager;
    },
    enumerable: true
});

/**Adds a listener to the EventManager to be executed whenever trigger is called on an event with the same name.
@param {EVUI.Modules.Events.EventListenerAddRequest|String} eventListenerOrName Either a YOLO EventListener object or the name of the event to listen for,
@param {EVUI.Modules.Events.Constants.Fn_Handler} handler The function that will be executed when this event is triggered.
@param {Number} priority The priority of this event relative to the other events with the same name to determine the execution order of event handlers.
@param {String} handlerName An identifier to give the handler for tracing purposes.
@returns {EVUI.Modules.Events.EventListener}*/
$evui.on = function (eventListenerOrName, handler, priority, handlerName)
{
    return $evui.events.on(eventListenerOrName, handler, priority, handlerName);
};

/**Adds a listener to the EventManager to be executed whenever trigger is called on an event with the same name and then is removed.
@param {EVUI.Modules.Events.EventListenerAddRequest|String} eventListenerOrName Either a YOLO EventListener object or the name of the event to listen for,
@param {EVUI.Modules.Events.Constants.Fn_Handler} handler The function that will be executed when this event is triggered.
@param {Number} priority The priority of this event relative to the other events with the same name to determine the execution order of event handlers.
@param {String} handlerName An identifier to give the handler for tracing purposes.
@returns {EVUI.Modules.Events.EventListener}*/
$evui.once = function (eventListenerOrName, handler, priority, handlerName)
{
    return $evui.events.once(eventListenerOrName, handler, priority, handlerName);
};

/**Removes all the EventListeners with the given event name, callback function and/or exeuctingContext.
@param {String} eventNameOrIDOrHandler The name or ID of the event to remove.
@param {EVUI.Modules.Events.Constants.Fn_Handler} handler The function that gets called when the event is invoked.*/
$evui.off = function (eventNameOrID, handler)
{
    return $evui.events.off(eventNameOrID, handler);
};

/**Calls all the event listeners with the given name.
@param {EVUI.Modules.Events.EventTriggerArgs|String} eventNameOrTriggerArgs Either a YOLO EventTriggerArgs object or the name of the event to trigger.
@param {Any} data Any data to pass to the events being triggered.
@param {String} triggerName The name to give the trigger for tracing purposes.*/
$evui.trigger = function (eventNameOrTriggerArgs, data, triggerName)
{
    return $evui.events.trigger(eventNameOrTriggerArgs, data, triggerName);
}

/**Calls all the event listeners with the given name and collects their responses and passes them into the callback function.
@param {EVUI.Modules.Events.EventTriggerArgs|String} eventNameOrTriggerArgs Either a YOLO EventTriggerArgs object or the name of the event to trigger.
@param {Any} data Any data to pass to the events being triggered.
@param {String} triggerName The name to give the trigger for tracing purposes.
@param {EVUI.Modules.Events.Constants.Fn_AskResultCallback} callback The callback function that will be passed the responses to the ask operation from each handler.*/
$evui.ask = function (eventNameOrTriggerArgs, data, triggerName, callback)
{
    return $evui.events.ask(eventNameOrTriggerArgs, data, triggerName, callback)
};

/**Awaitable. Calls all the event listeners with the given name and collects their responses and returns them as the promise resolution value.
@param {EVUI.Modules.Events.EventTriggerArgs|String} eventNameOrTriggerArgs Either a YOLO EventTriggerArgs object or the name of the event to trigger.
@param {Any} data Any data to pass to the events being triggered.
@param {String} triggerName The name to give the trigger for tracing purposes.
@returns {Promise<EVUI.Modules.Events.AskResult[]>}*/
$evui.askAsync = function (eventNameOrTriggerArgs, data, triggerName)
{
    return $evui.events.askAsync(eventNameOrTriggerArgs, data, triggerName)
};

/*#ENDWRAP(Event)#*/