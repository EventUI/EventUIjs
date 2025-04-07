/**Copyright (c) 2025 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

/**Module for adding event listeners to EventTargets that are designed to more gracefully handle multiple async-function listeners that go in sequence instead of racing each other.
@module*/
EVUI.Modules.DomEvents = {};

EVUI.Modules.DomEvents.Dependencies =
{
    Core: Object.freeze({ required: true }),
    EventStream: Object.freeze({ required: true }),
};

(function ()
{
    var checked = false;

    Object.defineProperty(EVUI.Modules.DomEvents.Dependencies, "checked",
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

Object.freeze(EVUI.Modules.DomEvents.Dependencies);

EVUI.Modules.DomEvents.Constants = {};

/**
 * 
 * @param {EVUI.Modules.DomEvents.AsyncDomEventArgs|Event} asyncEventArgs
 */
EVUI.Modules.DomEvents.Constants.Fn_EventHandler = function (asyncEventArgs) { };

EVUI.Modules.DomEvents.Constants.Prop_EvuiArgsName = "evuiArgs";

Object.freeze(EVUI.Modules.DomEvents.Constants);

/**Manager for manipulating asynchronous functions that are added to EventTargets via add/removeAsyncEventListener.
@class*/
EVUI.Modules.DomEvents.AsyncDomEventManager = (function ()
{
    /**The base36 string that is the property name of the AsyncDomEventer that is attached to EventTargets.
    @type {String}*/
    var _eventerKey = EVUI.Modules.Core.Utils.getHashCode(EVUI.Modules.Core.Utils.makeGuid()).toString(36).replace(".", ""); //a hidden hash value that is used to look up information about objects or nodes that will never occur in a user's code.

    /**The base36 string that is the property name of the AsyncEventMetadata attached to the Event object.
    @type {String}*/
    var _eventKey = EVUI.Modules.Core.Utils.getHashCode(EVUI.Modules.Core.Utils.makeGuid()).toString(36).replace(".", ""); //a hidden hash value that is used to look up information about objects or nodes that will never occur in a user's code.

    /**The base36 string that is the property on an artificial event that carries the callback for a manual async event dispatch.
    @type {String}*/
    var _callbackKey = EVUI.Modules.Core.Utils.getHashCode(EVUI.Modules.Core.Utils.makeGuid()).toString(36).replace(".", ""); //a hidden hash value that is used to look up information about objects or nodes that will never occur in a user's code.

    /**The GUID that is used to salt the generation of sessionID's.
    @type {String}*/
    var _sessionSalt = EVUI.Modules.Core.Utils.makeGuid();

    if (typeof (window.Symbol) !== "undefined")
    {
        _eventerKey = Symbol(_eventerKey);
        _eventKey = Symbol(_eventKey);
        _callbackKey = Symbol(_callbackKey);
    }

    /**Unique ID counter that identifies an event handler that has been bound to an EventTarget.
    @type {Number}*/
    var _handlerId = 0;

    /**Unique ID counter that identifies an EventTarget's AsyncDomEventerHandle.
    @type {Number}*/
    var _targetEventerId = 0;

    /**Unique ID counter that identifies an individual event that was triggered by the browser.
    @type {Number}*/
    var _queuedEventId = 0;

    /**Unique ID counter that identifies a bubbling sequence of events that is shared by all members of a composed path.
    @type {Number}*/
    var _eventSequenceId = 0;

    /**All of the active event sessions that are either executing or queued to be executing.
    @type {{}}*/
    var _sessions = {};

    /**Public-facing handle that is attached to an EventTarget as a property with a random name, used as the doorway into the internals of the AsyncDomEventManager.
    @class*/
    var AsyncDomEventer = function (target)
    {
        if (EVUI.Modules.Core == null) throw Error("Dependency missing: EVUI.Modules.Core is required.");
        EVUI.Modules.Core.Utils.requireAll(EVUI.Modules.DomEvents.Dependencies);

        var _self = this;
        var _target = target;
        var _handle = new AsyncDomEventerHandle(_self, _target);

        /**Adds an event listener to the stack of managed async event handlers.
        @param {String} type The type of event to listen for.
        @param {EVUI.Modules.DomEvents.Constants.Fn_EventHandler} listener The function that will handle the event.
        @param {EVUI.Modules.DomEvents.EventOptions} options The options to change the behavior of the event handler.*/
        this.addAsyncEventListener = function (type, listener, options)
        {
            if (isValidEventType(type) === false) throw Error("String expected.");
            if (typeof listener !== "function") throw Error("Function expected.");

            addEventListener(_handle, type, listener, options);
        };

        /**Removes an event listener from the stack of managed async event handlers. 
        @param {String} type The type of event that the listener is listening for.
        @param {EVUI.Modules.DomEvents.Constants.Fn_EventHandler} listener The function that was listening for the event.
        @param {EVUI.Modules.DomEvents.EventOptions} options Options used to change the behavior of the event listener.
        @returns {Boolean}*/
        this.removeAsyncEventListener = function (type, listener, options)
        {
            if (isValidEventType(type) === false) throw Error("String expected.");
            if (typeof listener !== "function") throw Error("Function expected.");

            return removeEventListener(_handle, type, listener, options);
        };

        /**Awaitable. Dispatches an event to the EventTarget using the normal browser EventTarget dispatching API. The Promise resolves once the last event handler on the last target in the composed path has been executed.
        @param {Event} dispatchArgs The browser Event object of the event to fire.
        @returns {Promise}*/
        this.dispatchAsyncEvent = function (dispatchArgs)
        {
            if (EVUI.Modules.Core.Utils.instanceOf(dispatchArgs, Event) === false) throw Error("Event object expected.");

            return new Promise(function (resolve, reject)
            {
                dispatchEvent(_handle, dispatchArgs, function ()
                {
                    resolve();
                });
            });
        };

        /**Adds this AsyncDomEventer's internal AsyncDomEventerHandle to the session with the given ID's composedPath trace.
        @param {String} sessionId The ID of the session to add the handle to.*/
        this.addToAsyncEventSession = function (sessionId)
        {
            var session = getEventSession(sessionId);
            if (session == null) return;

            var index = session.composedPath.indexOf(_target);
            if (index === -1) return;

            session.composedPathHandles[index] = _handle;
        };
    };

    /**Internal carrier of state information about the EventTarget that it is attached to - instantiated inside of a AsyncDomEventer and is passed into the internal implementation of the AsyncDomEventManager.
    @class*/
    var AsyncDomEventerHandle = function (eventer, target)
    {
        /**Number. The unique ID of the AsyncDomEventer
        @type {Number}*/
        this.eventerId = _targetEventerId++;

        /**Object.The public-facing Eventer associated with this handle.
        @type {AsyncDomEventer}*/
        this.eventer = eventer;

        /**Object. The target of the events.
        @type {EventTarget}*/
        this.target = target;

        /**Array. The array of events that have been triggered naturally but are not ready to be fired off asynchronously yet.
        @type {AsyncEvent[]}*/
        this.eventQueue = [];

        /**Object. A BubblingEventManager that contains all the events attached to this EventTarget.
        @type {EVUI.Modules.EventStream.BubblingEventManager()}*/
        this.bubbler = new EVUI.Modules.EventStream.BubblingEventManager();

        /**Object. Dictionary of all the events attached to the EventTarget that is keyed by the event's type.
        @type {{}}*/
        this.registeredEvents = {};

        /**Boolean. Flag indicating if the EventTarget is in the middle of executing an async event.
        @type {Boolean}*/
        this.executing = false;
    };

    /**Gets a RegisteredEvent with the given type from the AsyncDomEventerHandle.
    @param {String} type The type of event to get the RegisteredEvent for.
    @returns {RegisteredEvent}*/
    AsyncDomEventerHandle.prototype.getRegisteredEvent = function (type)
    {
        return this.registeredEvents[type]
    };

    /**In the event that a browser event was triggered while this event was executing and added itself to the eventQueue, this gets the next-soonest event from the eventQueue.
     * 
     * @param {any} remove
     */
    AsyncDomEventerHandle.prototype.getNextQueuedEvent = function (remove, type)
    {
        var numQueued = this.eventQueue.length;
        var nextEvent = null;
        var indexOfEvent = -1;
        var hasType = typeof type === "string";

        //walk the list of queued AsyncEvents and find the oldest EventSession that has this handle's target as the current target.
        for (var x = 0; x < numQueued; x++)
        {
            var curEvent = this.eventQueue[x];

            if (hasType === true && curEvent.type !== type) continue;
            if (nextEvent == null || curEvent.eventId < nextEvent.eventId) //the current event is older than the current nextEvent
            {
                var session = getEventSession(curEvent.sessionId);
                if (session == null) continue; //if this happens something is wrong, the event's session has already finished but it is still in queue somehow.

                if (session.currentTarget === this.target) //if the session says that it is this handle's turn to execute, set the next handle to execute
                {
                    nextEvent = curEvent;
                    indexOfEvent = x;
                }
            }
        }

        if (remove === true && indexOfEvent > -1)
        {
            this.eventQueue.splice(indexOfEvent, 1);
        }

        return nextEvent;
    };

    /**Represents all the information known about all the events attached to an EventTarget of the same type.
    @class*/
    var RegisteredEvent = function ()
    {
        /**String. The name of the event that this event is registered as.
        @type {String}*/
        this.eventType = null;

        /**Number. The number of boundHandlers associated with this type of event on the EventTarget.
        @type {Number}*/
        this.numHandlers = 0;

        /**Function. The function that was added to the EventTarget via addEventListener as the trigger that will react to actual events and trigger the custom async event behavior.
        @type {Function}*/
        this.triggeringHandler = null;

        /**Boolean. Whether or not this type of event is currently executing.
        @type {Boolean}*/
        this.executing = false;

        /**Object. Lookup dictionary of any handlers which were removed during the execution of the RegisteredEvent's bound handlers. Keyed by the BoundEventHandler's handlerId.
        @type {{}}*/
        this.pendingRemovals = {};

        /**Array. All of the events that have been bound to the EventTarget for an event type.
        @type {BoundEventHandler[]}*/
        this.boundHandlers = [];
    };

    /**Gets a BoundEventHandler based on the user's function or the handler that's been bound to the target of the event. 
    @param {Function} userHandler
    @returns {BoundEventHandler}*/
    RegisteredEvent.prototype.getBoundHandler = function (userHandler)
    {
        for (var x = 0; x < this.numHandlers; x++)
        {
            var boundHandler = this.boundHandlers[x];
            if (boundHandler.userHandler === userHandler || boundHandler.targetBoundHandler === userHandler)
            {
                return boundHandler;
            }
        }

        return null;
    };

    /**Returns whether or not a BoundHandler has been removed by a user during execution.
    @param {BoundEventHandler} boundHandler The bound handler to check against the pendingRemovals dictionary.
    @returns {Boolean}*/
    RegisteredEvent.prototype.isPendingRemoval = function (boundHandler)
    {
        return this.pendingRemovals[boundHandler.handlerId] != null;
    };

    /**Represents a lookup object that ties together the event handler provided by the user, the event handler that was bound to the "this" context of the EventTarget, the function used in the EventStream, and the options for the event handler.
    @class*/
    var BoundEventHandler = function ()
    {
        /**Number. The unique ID of this handler.
        @type {Number}*/
        this.handlerId = _handlerId++;

        /**Function. The event listener handler provided by the user.
        @type {Function}*/
        this.userHandler = null;

        /**Function. The event listener that has had its "this" context bound to its EventTarget.
        @type {Function}*/
        this.targetBoundHandler = null;

        /**Function. The function fed into the event stream.
        @type {Function}*/
        this.eventStreamHandler = null;

        /**Object. The options object passed in when the event was registered.
        @type {EVUI.Modules.DomEvents.EventOptions}*/
        this.options = null;
    };

    /**Represents an instance of an event that was triggered by the browser on an EventTarget.
    @class*/
    var AsyncEvent = function ()
    {
        /**Number. The unique identifier of this event, used to both identify the event and to know the order in which events were triggered.
        @type {Number}*/
        this.eventId = _queuedEventId++;

        /**String. The type of the event that was triggered.
        @type {String}*/
        this.type = null;

        /**Object. A plain object that is a duplicate of the actual Event object created by the browser when this event was triggered.
        @type {Event}*/
        this.clonedEventArgs = null;

        /**String. The ID of the bubbling event session that this event is a part of.
        @type {String}*/
        this.sessionId = null;
    };

    /**Represents a bubbling event session that touches all the EventTargets in the composed path.
    @class*/
    var AsyncEventSession = function ()
    {
        /**Number. The unique sequential ID of the event sequence session.
        @type {Number}*/
        this.eventSequenceId = -1;

        /**String. The unique ID of this session and key of the session in the _sessions object.
        @type {String}*/
        this.sessionId = null;

        /**String. The name of the event being handled.
        @type {String}*/
        this.eventType = null;

        /**Object. The EventTarget that triggered the creation of the event session.
        @type {EventTarget}*/
        this.target = null;

        /**Object. The EventTarget who is current executing in the stack of EventTargets impacted by this event.
        @type {EventTarget}*/
        this.currentTarget = null;

        /**Array. The array of all the AsyncDomEventerHandles associated with the elements in the composedPath.
        @type {AsyncDomEventerHandle[]}*/
        this.composedPathHandles = [];

        /**Array. The result of the composedPath() function on the initial eventArgs triggering the event.
        @type {EventTarget[]}*/
        this.composedPath = [];

        /**Object. The EventStream driving the event operation.
        @type {EVUI.Modules.EventStream.EventStream}*/
        this.eventStream = null;

        /**Boolean. Whether or not the user aborted the event.
        @type {Boolean}*/
        this.aborted = false;

        /**Function. A callback to call once the event has completed firing its last handler on the last member of the composed path.
        @type {Function}*/
        this.callback = null;
    };

    /**Container for metadata about an Event object in regards to the AsyncDomEventManager.
    @class*/
    var AsyncEventMetadata = function ()
    {
        /**Number. The unique sequential ID of the event sequence.
        @type {Number}*/
        this.eventSequenceId = -1;

        /**String. The unique ID of the session this event is associated with ans is the key of the session in the _sessions object.
        @type {String}*/
        this.sessionId = null;
    };

    /**Adds an event listener to the AsyncDomEventerHandle's collection of managed handlers.
    @param {AsyncDomEventerHandle} handle The internal state of the event target's async event stack.
    @param {String} type The type of event being listened for.
    @param {Function} listener The function to fire.
    @param {any} options The configuration options of the handler.*/
    var addEventListener = function (handle, type, listener, options)
    {
        options = getValidOptions(options);

        //get the container for all events of this type
        var existing = handle.getRegisteredEvent(type);
        if (existing == null)
        {
            existing = new RegisteredEvent();
            existing.eventType = type;
            handle.registeredEvents[type] = existing;
        }

        //if it's new or doesn't have a triggering handler, go make one and attach it to the event target.
        if (existing.triggeringHandler == null)
        {
            existing.triggeringHandler = addTriggeringHandler(handle, type, options);
        }

        var boundHandler = new BoundEventHandler();
        boundHandler.userHandler = listener;
        boundHandler.targetBoundHandler = listener.bind(handle.target);
        boundHandler.options = options;
        boundHandler.eventStreamHandler = function (asyncEventArgs)
        {
            if (existing.isPendingRemoval(boundHandler) === true) return;
            if (boundHandler.options.once === true)
            {
                removeEventListener(handle, type, boundHandler.listener, boundHandler.options);
            }

            return boundHandler.targetBoundHandler(asyncEventArgs);
        };

        existing.numHandlers = existing.boundHandlers.push(boundHandler);
        handle.bubbler.addEventListener(type, boundHandler.eventStreamHandler, EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.EventStream.EventStreamEventListenerOptions(), options));
    };

    /**Duck typing method to determine if an object is an EventTarget and can have events attached to it.
    @param {EventTarget} eventTarget The object to check to see if it implements EventTarget.
    @returns {Boolean}*/
    var isEventTarget = function (eventTarget)
    {
        if (typeof eventTarget !== "object" || eventTarget == null) return false;
        if (typeof eventTarget.addEventListener !== "function") return false;
        if (typeof eventTarget.removeEventListener !== "function") return false;
        if (typeof eventTarget.dispatchEvent !== "function") return false;

        return true;
    };

    /**Determines whether or not an event is a valid event type (i.e. a non whitespace string).
    @param {String} type The string to validate.
    @returns {Boolean}*/
    var isValidEventType = function (type)
    {
        return EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(type) === false;
    };

    var getValidOptions = function (userOptions)
    {
        if (userOptions == null || typeof userOptions !== "object")
        {
            return new EVUI.Modules.DomEvents.EventOptions();
        }

        return EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.DomEvents.EventOptions(), userOptions);
    };

    /**Adds the handler to the EventTarget that will kick off the execution of the stack of async events managed by the eventer handle.
    @param {AsyncDomEventerHandle} handle The AsyncDomEventerHandle associated with the EventTarget.
    @param {String} type The type of event being listed for.
    @param {EVUI.Modules.DomEvents.EventOptions} options Configuration options for the listener.
    @returns {Function}*/
    var addTriggeringHandler = function (handle, type, options)
    {
        var handler = function (eventArgs)
        {
            try
            {
                //check and see if any of the handlers attached for this event has autoPreventDefault to true - if one of them does, stop the default action.
                if (hasAutoPreventDefault(handle, type) === true) eventArgs.preventDefault();

                //make a copy of the event args object so we can store its current state (which changes as it bubbles)
                var composedPath = eventArgs.composedPath();
                var argsClone = EVUI.Modules.Core.Utils.shallowExtend({}, eventArgs, function (propName, source) { if (typeof source[propName] === "function") return false; });
                argsClone.composedPath = function ()
                {
                    return composedPath.slice();
                };

                argsClone.preventDefault = function ()
                {
                    eventArgs.preventDefault();
                };

                var truePath = composedPath.slice();

                if (options.capture === true)
                {
                    truePath.reverse();
                }

                var asyncEvent = new AsyncEvent();
                asyncEvent.clonedEventArgs = argsClone;
                asyncEvent.type = type;
                asyncEvent.composedPath = truePath;

                var eventMetadata = eventArgs[_eventKey];
                if (eventMetadata == null) //if the current target IS the originator for the event, we need to store some metadata in the Event object to pass to the other events in the bubbling sequence
                {
                    var sequenceId = _eventSequenceId++;
                    var sessionId = getEventSessionId(handle, sequenceId);

                    //if this was a manually dispatched event, it should have a callback to call that is resolving a promise to make the dispatchAsyncEvent await's finish
                    var callback = eventArgs[_callbackKey];
                    delete eventArgs[_callbackKey];

                    eventMetadata = new AsyncEventMetadata();
                    eventMetadata.eventSequenceId = sequenceId;
                    eventMetadata.sessionId = sessionId;

                    var session = new AsyncEventSession();
                    session.eventSequenceId = sequenceId;
                    session.currentTarget = eventArgs.currentTarget;
                    session.eventType = asyncEvent.type;
                    session.target = eventArgs.target;
                    session.sessionId = sessionId;
                    session.composedPath = truePath;
                    session.callback = callback;

                    //we store the sensitive state data internally in the _states lookup object and only expose the ID of the session to the object attached to the Event metadata.
                    _sessions[sessionId] = session;
                    eventArgs[_eventKey] = eventMetadata;

                    if (eventArgs.bubbles === false) //not bubbling, only one member of the composedPathHandles array
                    {
                        session.composedPathHandles.push(handle);
                    }
                    else //otherwise, add the handles for all the targets in the composedPath to the session.
                    {
                        getComposedPathHandles(session);
                    }
                }

                asyncEvent.sessionId = eventMetadata.sessionId;

                //kick off or queue execution of the event
                triggerExecution(handle, asyncEvent);
            }
            catch (ex)
            {
                EVUI.Modules.Core.Utils.log("DomEvents: Error triggering async handlers for event \"" + eventArgs.type + "\": " + ex.stack);
            }
        };

        handle.target.addEventListener(type, handler, options);

        return handler;
    };

    /**Checks to see if any of the boundHandlers has an options object where autoPreventDefault is true.
    @param {AsyncDomEventerHandle} handle The handle to look in.
    @param {String} type The name of the event to check.*/
    var hasAutoPreventDefault = function (handle, type)
    {
        if (isValidEventType(type) === false) return false;

        var registeredEvent = handle.getRegisteredEvent(type);
        if (registeredEvent == null) return false;

        var numHandlers = registeredEvent.boundHandlers.length;
        for (var x = 0; x < numHandlers; x++)
        {
            var curHandle = registeredEvent.boundHandlers[x];

            if (registeredEvent.isPendingRemoval(curHandle) === true) continue;
            if (curHandle.options.autoPreventDefault === true) return true;
        }

        return false;
    };

    /**Triggers or queues the execution of an event. 
    @param {AsyncDomEventerHandle} handle The handle of the event target having its event executed or queued.
    @param {AsyncEvent} asyncEvent The event to queue or trigger.*/
    var triggerExecution = function (handle, asyncEvent)
    {
        var session = getEventSession(asyncEvent.sessionId);
        if (session == null) return;

        if (handle.executing === true || session.currentTarget !== asyncEvent.clonedEventArgs.currentTarget)
        {
            handle.eventQueue.push(asyncEvent);
        }
        else 
        {
            executeEvent(handle, asyncEvent, session);
        }
    };

    /**Builds the EventStream that will execute the event handlers that belong to the EventTarget for the given event type.
    @param {AsyncDomEventerHandle} handle The handle of the event target being executed.
    @param {AsyncEvent} asyncEvent The event being executed.
    @param {AsyncEventSession} session The execution session of the event.*/
    var executeEvent = function (handle, asyncEvent, session)
    {
        var eventType = handle.getRegisteredEvent(asyncEvent.type);

        handle.executing = true;

        var es = new EVUI.Modules.EventStream.EventStream();
        es.context = asyncEvent.clonedEventArgs.currentTarget;
        es.bubblingEvents = handle.bubbler;

        es.processInjectedEventArgs = function (eventStreamArgs)
        {
            //make the event args object have all the properties of the actual event args object when it was at the same place in its bubbling path.
            var args = new EVUI.Modules.DomEvents.AsyncDomEventArgs();
            EVUI.Modules.Core.Utils.shallowExtend(args, asyncEvent.clonedEventArgs);

            args.eventSequenceId = session.eventSequenceId;
            args.cancel = eventStreamArgs.cancel;
            args.pause = eventStreamArgs.pause;
            args.resume = eventStreamArgs.resume;
            args.state = eventStreamArgs.state;
            args.stopImmediatePropagation = function () //this stops the current targets handlers from firing but does not stop bubbling
            {
                return eventStreamArgs.stopPropagation();
            }
            args.stopPropagation = function () //stops bubbling propagation.
            {
                session.aborted = true;
            };

            return args;
        };

        es.processReturnedEventArgs = function (eventStreamArgs)
        {
            es.eventState = eventStreamArgs.state;
        };

        es.addEvent(asyncEvent.type, function ()
        {

        });

        es.onComplete = function (eventArgs)
        {
            handle.executing = false;

            //remove all the events that were flagged for removal during execution.
            if (eventType != null && eventType.pendingRemovals != null)
            {
                var removals = EVUI.Modules.Core.Utils.getProperties(eventType.pendingRemovals);
                var numRemovals = removals.length;
                for (var x = 0; x < numRemovals; x++)
                {
                    var key = removals[x];
                    var toRemove = eventType.pendingRemovals[key];
                    if (toRemove != null)
                    {
                        removeEventListener(handle, eventType, toRemove);
                    }

                    delete eventType.pendingRemovals[key];
                }
            }

            //if we removed all the handlers, remove the registered event as well.
            if (eventType.numHandlers === 0 && eventType.triggeringHandler == null)
            {
                delete handle.registeredEvents[eventType.eventType];
            }

            //get the index of the current handle so we can get the index of the next highest handle 
            var nextIndex = session.composedPathHandles.indexOf(handle);
            var nextHandle = null;
            if (nextIndex !== -1)
            {
                nextIndex++;
                nextHandle = session.composedPathHandles[nextIndex];
            }

            //if we have another handle above the current one in the composed path
            if (nextHandle != null)
            {
                //set the target so the session knows whose turn it is to execute
                session.currentTarget = nextHandle.target;

                //see if this handle has another handler on itself that is ready to fire (our rule is that an element can only be handling one event at a time, so we always wait for one to finish before beginning another.)
                var nextEvent = nextHandle.getNextQueuedEvent(true, asyncEvent.type);

                //if we didn't find another event on this handle, move up the chain until we do find a handle with an event that matches our target event type and current event target
                while (nextEvent == null)
                {
                    nextIndex++;
                    nextHandle = session.composedPathHandles[nextIndex];
                    if (nextHandle == null) break;

                    session.currentTarget = nextHandle.target;
                    nextEvent = nextHandle.getNextQueuedEvent(true, asyncEvent.type);
                }

                if (nextEvent != null)
                {
                    triggerExecution(nextHandle, nextEvent)
                }
            }

            if (nextHandle == null) //the session is out of handles and is done.
            {
                delete _sessions[session.sessionId];

                if (typeof session.callback === "function")
                {
                    try
                    {
                        session.callback();
                    }
                    catch (ex)
                    {
                        EVUI.Modules.Core.Utils.log("Error invoking dispatchedEvent's callback");
                        EVUI.Modules.Core.Utils.log(ex);
                    }
                }
            }

            //now that this target has finished its event, go see if there another unrelated event on it and trigger that one as well.
            nextEvent = handle.getNextQueuedEvent(true);
            if (nextEvent != null)
            {
                triggerExecution(handle, nextEvent);
            }
        };

        es.execute();
    };

    /**Generates the sessionId for a given event sequence number and handle.
    @param {AsyncDomEventerHandle} handle The handle that is related to the event session.
    @param {Number} eventSequenceId The sequence number of the current event.
    @returns string */
    var getEventSessionId = function (handle, eventSequenceId)
    {
        return EVUI.Modules.Core.Utils.getHashCode(_sessionSalt + ":" + handle.eventerId + "-" + eventSequenceId).toString(36).replace(".", "");
    };

    /**Gets an AsyncEventSession based on its Id.
    @param {String} sessionId The Id of the session to get.
    @returns {AsyncEventSession}*/
    var getEventSession = function (sessionId)
    {
        return _sessions[sessionId];
    }

    /**Builds the session's composedPathHandles array when an event session is starting.
    @param {AsyncEventSession} session The session to populate the composedPathHandles for.*/
    var getComposedPathHandles = function (session)
    {
        if (EVUI.Modules.Core.Utils.isArray(session.composedPath) === false) return;

        var numInPath = session.composedPath.length;
        for (var x = 0; x < numInPath; x++)
        {
            var eventer = ensureEventer(session.composedPath[x]);
            if (eventer == null) continue;

            eventer.addToAsyncEventSession(session.sessionId);
        }
    };

    /**Ensures that an EventTarget has an AsyncDomEventer attached to it.
    @param {EventTarget} eventTarget The EventTarget to get or attach an AsyncDomEventer to.
    @returns {AsyncDomEventer}*/
    var ensureEventer = function (eventTarget)
    {
        if (typeof eventTarget !== "object" || eventTarget == null) return null;

        var eventer = eventTarget[_eventerKey];
        if (eventer == null)
        {
            eventer = new AsyncDomEventer(eventTarget);
            eventTarget[_eventerKey] = eventer;
        }

        return eventer;
    };

    /**Removes an event listener from the managed stack of async events.
    @param {AsyncDomEventerHandle} handle The internal state of the EventTarget
    @param {String|RegisteredEvent} type The type of event being removed.
    @param {Function|BoundEventHandler} listener The function to stop listening with.
    @param {EVUI.Modules.DomEvents.EventOptions} options The options for how the listener was set up. Only here because the signature in the DOM also takes an options object - not sure what for.
    @returns {Boolean} */
    var removeEventListener = function (handle, type, listener, options)
    {
        var eventType = null;
        var handler = null;

        if (EVUI.Modules.Core.Utils.instanceOf(type, RegisteredEvent) === true)
        {
            eventType = type;
        }
        else
        {
            eventType = handle.getRegisteredEvent(type);
        }

        if (eventType == null) return false;

        if (EVUI.Modules.Core.Utils.instanceOf(listener, BoundEventHandler) === true)
        {
            handler = listener;
        }
        else
        {
            handler = eventType.getBoundHandler(listener);
        }

        if (handler == null) return false;

        //remove the event from the event bubbler so it won't fire again
        if (handle.bubbler.removeEventListener(eventType.eventType, handler.eventStreamHandler) === false) return false;

        //if we're executing, don't remove it just yet but rather queue it to be removed when the event finishes.
        if (eventType.executing === true)
        {
            eventType.pendingRemovals[handler.handlerId] = handler;

            return true;
        }
        else //otherwise snip it out of the list
        {
            var index = eventType.boundHandlers.indexOf(handler);
            if (index !== -1)
            {
                eventType.boundHandlers.splice(index, 1);
                eventType.numHandlers--;

                if (eventType.numHandlers === 0) //if we run out of handlers for a given event type, remove that event's record from the handle and the listener thats in the DOM.
                {
                    handle.target.removeEventListener(eventType.eventType, eventType.triggeringHandler, options);
                    eventType.triggeringHandler = null;

                    delete handle.registeredEvents[eventType.eventType];
                }

                return true;
            }
        }

        return false;
    };

    /**Dispatches an event to the event target that fires engages the normal triggering mechanism.
    @param {AsyncDomEventerHandle} handle The internal state of the EventTarget.
    @param {Event} dispatchArgs The event to dispatch.
    @param {Function} callback The callback to call when the dispatched event's last bubbling handler completes.*/
    var dispatchEvent = function (handle, dispatchArgs, callback)
    {
        dispatchArgs[_callbackKey] = callback;
        handle.target.dispatchEvent(dispatchArgs);
    };

    /**Manager for attaching async event listeners to EventTargets.
    @class*/
    var AsyncDomEventManager = function ()
    {
    };

    /**Adds an event listener to the stack of managed async event handlers.
    @param {EventTarget} eventTarget The target to attach the event to.
    @param {String} type The type of event to listen for.
    @param {EVUI.Modules.DomEvents.Constants.Fn_EventHandler} listener The function that will handle the event.
    @param {EVUI.Modules.DomEvents.EventOptions} options The options to change the behavior of the event handler.*/
    AsyncDomEventManager.prototype.addAsyncEventListener = function (eventTarget, type, listener, options)
    {
        if (isEventTarget(eventTarget) === false) throw Error("EventTarget expected.");

        var eventer = ensureEventer(eventTarget);
        return eventer.addAsyncEventListener(type, listener, options);
    };

    /**Removes an event listener from the stack of managed async event handlers.
    @param {EventTarget} eventTarget The target to remove the event from.
    @param {String} type The type of event that the listener is listening for.
    @param {EVUI.Modules.DomEvents.Constants.Fn_EventHandler} listener The function that was listening for the event.
    @param {EVUI.Modules.DomEvents.EventOptions} options Options used to change the behavior of the event listener.
    @returns {Boolean}*/
    AsyncDomEventManager.prototype.removeAsyncEventListener = function (eventTarget, type, listener, options)
    {

        if (isEventTarget(eventTarget) === false) throw Error("EventTarget expected.");

        var eventer = ensureEventer(eventTarget);
        return eventer.removeAsyncEventListener(type, listener, options);
    };

    /**Awaitable. Dispatches an event to the EventTarget using the normal browser EventTarget dispatching API. The Promise resolves once the last event handler on the last target in the composed path has been executed.
    @param {EventTarget} eventTarget The target to dispatch the event from.
    @param {Event} dispatchArgs The browser Event object of the event to fire.
    @returns {Promise}*/
    AsyncDomEventManager.prototype.dispatchAsyncEvent = function (eventTarget, event)
    {

        if (isEventTarget(eventTarget) === false) throw Error("EventTarget expected.");

        var eventer = ensureEventer(eventTarget);
        return eventer.dispatchAsyncEvent(event);
    };

    /**Adds an event listener to the stack of managed async event handlers.
    @param {String} type The type of event to listen for.
    @param {EVUI.Modules.DomEvents.Constants.Fn_EventHandler} listener The function that will handle the event.
    @param {EVUI.Modules.DomEvents.EventOptions} options The options to change the behavior of the event handler.*/
    EventTarget.prototype.addAsyncEventListener = function (type, listener, options)
    {
        return EVUI.Modules.DomEvents.AsyncDomEventManager.addAsyncEventListener(this, type, listener, options);
    };

    /**Removes an event listener from the stack of managed async event handlers.
    @param {String} type The type of event that the listener is listening for.
    @param {EVUI.Modules.DomEvents.Constants.Fn_EventHandler} listener The function that was listening for the event.
    @param {EVUI.Modules.DomEvents.EventOptions} options Options used to change the behavior of the event listener.
    @returns {Boolean}*/
    EventTarget.prototype.removeAsyncEventListener = function (type, listener, options)
    {
        return EVUI.Modules.DomEvents.AsyncDomEventManager.removeAsyncEventListener(this, type, listener, options);
    };

    /**Awaitable. Dispatches an event to the EventTarget using the normal browser EventTarget dispatching API. The Promise resolves once the last event handler on the last target in the composed path has been executed.
    @param {Event} dispatchArgs The browser Event object of the event to fire.
    @returns {Promise}*/
    EventTarget.prototype.dispatchAsyncEvent = function (event)
    {
        return EVUI.Modules.DomEvents.AsyncDomEventManager.dispatchAsyncEvent(this, event);
    };

    return new AsyncDomEventManager();
})();

/**Options object for configuring the behavior of an event listener.
@class*/
EVUI.Modules.DomEvents.EventOptions = function ()
{
    /**Boolean. Whether or not the event listener will fire once and be removed.
    @type {Boolean}*/
    this.once = false;

    /**Boolean. Whether or not the order of execution of EventTargets is reversed - instead of going from the element which triggered the event to the window, this setting says to start with the window and work in to the originating element.
    @type {Boolean}*/
    this.capture = false;

    /**Boolean. Whether or not this event listener will automatically stop the browser's default action by invoking preventDefault() on the browser's Event argument. 
    If any listener for a given event type on the EventTarget has this set to true, the default action will be prevented.
    @type {Boolean}*/
    this.autoPreventDefault = false;
};

/**Event arguments for handlers that have been assigned via addAsyncEventHandler. Is a shallow clone of the browser's Event arguments for the event that was triggered with the standard EventStream functions added on.
@class*/
EVUI.Modules.DomEvents.AsyncDomEventArgs = function ()
{
    /**Number. The sequential counter that identifies this unique event session for an event on its entire composed path.
    @type {Number}*/
    this.eventSequenceId = -1;

    /**Function. Cancels the execution of the EventStream. Returns true if the execution was canceled, or false if it was not cancelable.
    @returns {Boolean}*/
    this.cancel = function () { return false; };

    /**Function. Pauses the execution of the EventStream. Returns true if the execution was paused, or false if it was not pausable.
    @returns {Boolean}*/
    this.pause = function () { return false; };

    /**Function. Resumes a paused execution of the EventStream. Returns true if the execution was resumed, or false if it was not resumable.
    @returns {Boolean}*/
    this.resume = function () { return false; };

    /**Function. Stops the propagation of the event to other handlers on the current element.
    @returns {Boolean}*/
    this.stopImmediatePropagation = function () { return false; }

    /**Function. Stops the propagation of the event to its parent.
    @returns {Boolean}*/
    this.stopPropagation = function () { return false };

    /**Object. The public event state of the EventStream.
    @type {Object}*/
    this.state = null;
};

Object.freeze(EVUI.Modules.DomEvents);