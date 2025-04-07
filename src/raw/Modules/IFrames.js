/**Copyright (c) 2025 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

/**Module containing utilities for managing cross-window communication with child iframes and/or when running as a child to another window.
@module*/
EVUI.Modules.IFrames = {};

EVUI.Modules.IFrames.Dependencies =
{
    Core: Object.freeze({ required: true }),
    EventStream: Object.freeze({ required: true }),
    Dom: Object.freeze({version: "1.0", required: true})
};

(function ()
{
    var checked = false;

    Object.defineProperty(EVUI.Modules.IFrames.Dependencies, "checked",
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

Object.freeze(EVUI.Modules.IFrames.Dependencies);

/**Constants table for the IFrames module.*/
EVUI.Modules.IFrames.Constants = {};

/**Selector function for getting a a child IFrame from the internal IFrame list. Return true to select the IFrame.
@param {EVUI.Modules.IFrames.IFrame} childIFrame The current IFrame.
@returns {Boolean}*/
EVUI.Modules.IFrames.Constants.Fn_IFrameSelector = function (childIFrame) { };

/**Callback method that will execute when an ask operation completes or times out.
@param {Any} message The data property of the message that was returned from the target window.*/
EVUI.Modules.IFrames.Constants.Fn_AskCallback = function (messageData) { };

/**Handler function for all iframe events.
@param {EVUI.Modules.IFrames.IFrameEventArgs} iframeEventArgs The event arguments describing the incoming or outgoing cross-window message.*/
EVUI.Modules.IFrames.Constants.Fn_IFrameEventHandler = function (iframeEventArgs) { };

/**ContextID for any dynamically created IFrame object being used in an IFrameEventArgs object that has not been added to the IFrameManager yet.
@type {String}*/
EVUI.Modules.IFrames.Constants.PlaceholderIFrameContextID = "evui.iframe.placeholder";

/**Event key for the event that fires when a message arrives in this Window.
@type {String}*/
EVUI.Modules.IFrames.Constants.Event_OnMessage = "message";

/**Event key for the event that fires when a message arrives in this Window and is handled by a named IFrameMessageListener.
@type {String}*/
EVUI.Modules.IFrames.Constants.Event_OnHandle = "handle";

/**Event key for the event that fires when a message arrives in this Window in response to an ask operation.
@type {String}*/
EVUI.Modules.IFrames.Constants.Event_OnAsk = "ask"

/**Event key for the event that fires when a message is sent from this Window to another.
@type {String}*/
EVUI.Modules.IFrames.Constants.Event_OnSend = "send";

EVUI.Modules.IFrames.Constants.Job_Send = "job.send";

EVUI.Modules.IFrames.Constants.Job_Ask = "job.ask";

EVUI.Modules.IFrames.Constants.StepPrefix = "evui.iframes";

Object.freeze(EVUI.Modules.IFrames.Constants);

/**Manager for IFrame elements that coordinates the receiving and sending of messages between parent and child Windows.
@class*/
EVUI.Modules.IFrames.IFrameManager = function ()
{
    if (EVUI.Modules.Core == null) throw Error("Dependency missing: EVUI.Modules.Core is required.");
    EVUI.Modules.Core.Utils.requireAll(EVUI.Modules.IFrames.Dependencies);

    var _self = this; //self reference for closures

    var _signature = "evui.iframe.message"; //internal signature to help the manager recognize messages sent to or from itself in another window

    /**Object. The IFrameEntry of the parent Window that is hosting this Window.
    @type {IFrameEntry}*/
    var _parent = null;

    /**Boolean. Whether or not the messaging handler has been attached.
    @type {Boolean}*/
    var _handlerAttached = false;

    /**Array. The array of child IFrameEntries being managed by this one.
    @type {IFrameEntry[]}*/
    var _children = [];

    /**Number. The amount of time to wait before automatically calling the callback for an ask operation.
    @type {Number}*/
    var _defaultAskTimeout = 5000;

    /**Object. Manager for adding additional bubbling events.
    @type {EVUI.Modules.EventStream.BubblingEventManager}*/
    var _bubblingEvents = new EVUI.Modules.EventStream.BubblingEventManager();

    /**Represents the union of all the objects required for the IFrameManager to manage parent and child Windows.
    @class*/
    var IFrameEntry = function ()
    {
        /**Object. The publicly visible IFrame object for the user to use.
        @type {EVUI.Modules.IFrames.IFrame}*/
        this.iFrame = null;

        /**Object. The internal container of functionality that the public IFrame object wraps.
        @type {IFrameHandle}*/
        this.handle = null;

        /**Array. Internal array of unresolved message sessions that are pending ask operations.
        @type {IFrameMessageSession[]}*/
        this.messageSessions = [];
    };

    /**The internal container of functionality that is injected into the publicly facing IFrame objects. Contains the state and entry points to all the functionality required to manage an IFrame.
    @class*/
    var IFrameHandle = function ()
    {
        var _self = this;
        var _url = null;
        var _origin = null;

        /**The type of Window that the IFrameHandle is associated with.
        @type {String}*/
        this.windowType = EVUI.Modules.IFrames.WindowType.None;

        /**A unique identifier for this Handle.
        @type {String}*/
        this.contextID = null;

        /**Either the parent Window or an iframe element.
        @type {Window|Element}*/
        this.element = null;

        /**An array of the message listeners attached to this IFrame.
        @type {EVUI.Modules.IFrames.IFrameMessageListener[]}*/
        this.messageHandlers = [];

        /**The bubbling event manager used to add additional events to an Iframe.
        @type {EVUI.Modules.EventStream.BubblingEventManager}*/
        this.bubblingEvents = new EVUI.Modules.EventStream.BubblingEventManager();

        /**The origin of the URL associated with either the parent window or the iframe.
        @type {String}*/
        this.origin = null;
        Object.defineProperty(this, "origin",
        {
            get: function ()
            {
                if (_self.windowType === EVUI.Modules.IFrames.WindowType.Child)
                {
                    if (_origin == null || (_self.element != null && _self.element.src !== _url))
                    {
                        _origin = getOrigin(_self.element.src);
                        _url = _self.element.src;
                    }
                }

                return _origin;                
            },
            set: function (value)
            {
                _origin = value;
            }
        });

        /**The URL associated with either the parent window or the iframe.
        @type {String}*/
        this.url = null;
        Object.defineProperty(this, "url", {
            get: function ()
            {
                if (_self.windowType === EVUI.Modules.IFrames.WindowType.Child)
                {
                    if (_self.element != null && _self.element.src !== _url)
                    {
                        _origin = getOrigin(_self.element.src);
                        _url = _self.element.src;
                    }
                }

                return _url;
            },
            set: function (value)
            {
                _url = value;
            }
        });

        /**Event handler for when a message is sent to this child iframe or parent window.
        @param {EVUI.Modules.IFrames.IFrameEventArgs} iframeEventArgs The event arguments for the event.*/
        this.onSend = function (iframeEventArgs)
        {

        };

        /**Event handler for when a message is received by the current window from the child iframe or parent window.
        @param {EVUI.Modules.IFrames.IFrameEventArgs} iframeEventArgs The event arguments for the event.*/
        this.onMessage = function (iframeEventArgs)
        {

        };

        /**Sends a message to the child iframe or parent window associated with this handle.
        @param {Any} data Any information to send to the other window.
        @param {String|EVUI.Modules.IFrames.SendMessageArgs} messageCodeOrArgs Either the string identifier for the IFrameMessageListener in the other window to invoke, or a yolo object of a SendMessageArgs.
        @param {String} senderName The name of the sender, used for tracing purposes.
        @param {String} askSessionID If the operation is a response to an ask operation, this is the ID of the ask operation.*/
        this.send = function (data, messageCodeOrArgs, senderName, askSessionID)
        {
            send(this, data, messageCodeOrArgs, senderName, askSessionID);
        };

        /**Adds an IFrameMessageListener to the Handle that is invoked when an incoming message arrives with the matching message code.
        @param {String} messageCode The identifier to listen for.
        @param {EVUI.Modules.IFrames.Constants.Fn_IFrameEventHandler} handler The function to call when a message with the given message code arrives.*/
        this.addMessageHandler = function (messageCode, handler)
        {
            if (this.contextID === EVUI.Modules.IFrames.Constants.PlaceholderIFrameContextID) throw Error("Cannot add or remove message handlers to a placeholder IFrame entry.");
            addMessageHandler(this, messageCode, handler);
        };

        /**Removes an IFrameMessageListener from the Handle.
        @param {String} messageCode The identifier of the IFrameMessageListener to remove.
        @returns {Boolean}*/
        this.removeMessageHandler = function (messageCode)
        {
            if (this.contextID === EVUI.Modules.IFrames.Constants.PlaceholderIFrameContextID) throw Error("Cannot add or remove message handlers to a placeholder IFrame entry.");
            return removeMessageHandler(this, messageCode);
        };

        /**Sends a message to the child iframe or parent window that can be responded to directly that bypasses the normal message handlers and instead directly invokes the provided callback with whatever value the other window responded with.
        @param {Any} data Any information to send to the other window.
        @param {String|EVUI.Modules.IFrames.AskArgs} messageCodeOrArgs Either the string identifier for the IFrameMessageListener in the other window to invoke, or a yolo object of a AskArgs.
        @param {String} senderName The name of the sender, used for tracing purposes.
        @param {EVUI.Modules.IFrames.Constants.Fn_AskCallback} callback A callback to call once the other window responds.*/
        this.ask = function (data, messageCodeOrArgs, senderName, callback)
        {
            if (this.contextID === EVUI.Modules.IFrames.Constants.PlaceholderIFrameContextID) throw Error("Cannot ask from a placeholder IFrame entry.");
            ask(this, data, messageCodeOrArgs, senderName, callback);
        };

        /**Awaitable. Sends a message to the child iframe or parent window that can be responded to directly that bypasses the normal message handlers and instead directly invokes the provided callback with whatever value the other window responded with.
        @param {Any} data Any information to send to the other window.
        @param {String|EVUI.Modules.IFrames.AskArgs} messageCodeOrArgs Either the string identifier for the IFrameMessageListener in the other window to invoke, or a yolo object of a AskArgs.
        @param {String} senderName The name of the sender, used for tracing purposes.
        @returns {Promise<Any>}*/
        this.askAsync = function (data, messageCodeOrArgs, senderName)
        {
            if (this.contextID === EVUI.Modules.IFrames.Constants.PlaceholderIFrameContextID) throw Error("Cannot ask from a placeholder IFrame entry.");
            return askAsync(this, data, messageCodeOrArgs, senderName);
        };

        /**Removes the Handle from the IFrameManager.
        @returns {Boolean}*/
        this.remove = function ()
        {
            return remove(this);
        };
    };

    /**Represents a session of a message being sent to or received from another window.
    @class*/
    var IFrameMessageSession = function ()
    {
        /**String. The unique ID of this session.
        @type {String}*/
        this.sessionID = null;

        /**Object. The wrapper that will actually be sent across windows that contains the message and its metadata.
        @type {MessageWrapper}*/
        this.messageWapper = null;

        /**Object. The IFrameEntry that contains information about the window or iframe that is either sending or receiving the message.
        @type {IFrameEntry}*/
        this.entry = null;

        /**Object The EventStream that is executing the send or receive operation.
        @type {EVUI.Modules.EventStream.EventStream}*/
        this.eventStream = null;

        /**Object. If the operation is an ask operation, this is the arguments that was passed in with the ask operation.
        @type {EVUI.Modules.IFrames.AskArgs}*/
        this.askArgs = null;

        /**Function. The callback function associated with the ask operation.
        @type {EVUI.Modules.IFrames.Constants.Fn_AskCallback}*/
        this.askCallback = null;

        /**Boolean. Whether or not the ask callback has been fired.
        @type {Boolean}*/
        this.askCallbackFired = false;
    };

    /**The object that is actually sent to/received from another window, contains the metadata about the message as well as the payload of data sent by the user.
    @class*/
    var MessageWrapper = function ()
    {
        /**Object. Metadata about the message being sent.
        @type {MessageMetadata}*/
        this.metadata = null;

        /**Any. The data sent by the user.
        @type {Any}*/
        this.data = null;
    };

    /**Simple metadata about the message sent to/received from another window. 
    @class*/
    var MessageMetadata = function ()
    {
        /**String. A special signature property to help identify the message being received as a message sent by the IFrame manager and not by an exterior source.
        @type {String}*/
        this.signature = _signature;

        /**String. The unique ID of the message session that sent the message.
        @type {String}*/
        this.sessionID = null;

        /**String. The unique ID of the ask session to respond to if this message is part of an ask operation.
        @type {String}*/
        this.askSessionID = null;

        /**String. The message code of the handler to invoke upon receiving a message.
        @type {String}*/
        this.messageCode = null;

        /**String. The name of the sending entity to be used for tracing purposes.
        @type {String}*/
        this.senderName = null;
    };


    /**Object.If this window is the child of another window, this is the IFrame interface through which it can be interacted with - otherwise it is null.
    @type {EVUI.Modules.IFrames.IFrame}*/
    this.parentWindow = null;
    Object.defineProperty(this, "parentWindow", {
        get: function ()
        {
            if (_parent == null) return null;
            return _parent.iFrame;
        },
        enumerable: true,
        configurable: false
    });

    /**Number. The number of milliseconds to wait before automatically failing and calling the callback for an ask operation. Defaults to 5000.
    @type {Number}*/
    this.defaultAskTimeout = 5000;
    Object.defineProperty(this, "defaultAskTimeout", {
        get: function () { return _defaultAskTimeout; },
        set: function (value)
        {
            if (typeof value !== "number" || value < 0) throw Error("defaultAskTimeout must be a positive number.");
            _defaultAskTimeout = value
        },
        configurable: false,
        enumerable: true
    });

    /**Gets a child IFrame reference based off its contextID or match from a selector function.
    @param {String|EVUI.Modules.IFrames.Constants.Fn_IFrameSelector} contextIDOrSelector Either the contextID of the child IFrame or a selector function to return the first matching child IFrame.
    @returns {EVUI.Modules.IFrames.IFrame}*/
    this.getChild = function (contextIDOrSelector)
    {
        if (typeof contextIDOrSelector === "string")
        {
            var child = getChildIFrame(contextIDOrSelector);
            if (child == null) return null;

            return child;
        }
        else if (typeof contextIDOrSelector === "function")
        {
            var numChildren = _children.length;
            for (var x = 0; x < numChildren; x++)
            {
                var curChild = _children[x];
                if (contextIDOrSelector(curChild.iFrame) === true)
                {
                    return curChild.iFrame;
                } 
            }

            return null;
        }
        else
        {
            throw Error("Invalid input, string or function expected.");
        }
    };

    /**Gets a child IFrame reference based off of a selector function.
    @param {EVUI.Modules.IFrames.Constants.Fn_IFrameSelector} selector Either the contextID of the child IFrame or a selector function to return the first matching child IFrame.
    @returns {EVUI.Modules.IFrames.IFrame[]}*/
    this.getChildren = function (selector)
    {
        if (typeof selector === "function")
        {
            var children = [];
            var numChildren = _children.length;
            for (var x = 0; x < numChildren; x++)
            {
                var curChild = _children[x];
                if (selector(curChild.iFrame) === true)
                {
                    children.push(curChild.iFrame);
                }
            }

            return children;
        }
        else
        {
            return _children.map(function (c) { return c.iFrame; });
        }
    };

    /**Global event handler that fires any time the IFrameManager receives a message from another window. Only executes when the incoming message was sent from an origin known to the IFrameManager and was sent from another window's IFrameManager. Is not executed on Ask operations.
    @param {EVUI.Modules.IFrames.IFrameEventArgs} iframeEventArgs The event arguments for the iframe event.*/
    this.onMessage = function (iframeEventArgs)
    {

    };

    /**Global event handler that fires any time any message is sent to another window via one of the IFrameManager's managed IFrame entries.
    @param {EVUI.Modules.IFrames.IFrameEventArgs} iframeEventArgs The event arguments for the iframe event.*/
    this.onSend = function (iframeEventArgs)
    {

    };

    /**Adds a child iframe to the IFrameManager or registers the parent's URL/origin with the IFrameManager.
    @param {Element|String|EVUI.Modules.IFrames.ParentWindowAddRequest|EVUI.Modules.IFrames.IFrameAddRequest} addRequestOrIFrame Either an iframe Element, a CSS selector selecting iframe elements, a yolo ParentWindowAddRequest object, or a yolo IFrameAddRequest object.
    @returns {EVUI.Modules.IFrames.IFrame}*/
    this.addIFrame = function (addRequestOrIFrame)
    {
        var addRequest = new EVUI.Modules.IFrames.IFrameAddRequest();        

        if (isIframe(addRequestOrIFrame) === true) //registering a parent window or child iframe reference
        {
            addRequest.element = addRequestOrIFrame;
            addRequest.iframeType = EVUI.Modules.IFrames.WindowType.Child;
            addRequest.url = addRequestOrIFrame.src;
        }
        else //otherwise we have an object to extend into the add request
        {
            addRequest = EVUI.Modules.Core.Utils.shallowExtend(addRequest, addRequestOrIFrame);
        }

        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(addRequest.url) === false && _parent != null)
        {
            if (_parent.handle.url == null)
            {
                _parent.handle.url = addRequest.url;
                _parent.handle.origin = getOrigin(addRequest.url);
            }

            overwriteEvents(addRequest, _parent.iFrame);

            return _parent.iFrame;            
        }

        if (typeof addRequest.element === "string") //we have what is potentially a CSS selector 
        {
            var eh = new EVUI.Modules.Dom.DomHelper(addRequest.element);
            var iframes = eh.elements.filter(function (ele) { return isIframe(ele); });

            var numIframes = iframes.length;
            if (numIframes === 0) throw Error("Invalid arguments - no url or valid iframe element selector provided, no way to establish cross-window communication.");

            var returnValues = [];
            for (var x = 0; x < numIframes; x++)
            {
                var added = _self.addIFrame(iframes[x]);
                if (added != null) returnValues.push(added);
            }

            return returnValues;
        }
        else if (isIframe(addRequest.element) === false) //we didn't have a string or element, fail the operation
        {
            throw Error("Invalid arguments - no parent window or iframe element provided, no way to establish cross-window communication.");
        }

        //we have an element, see if we havent registered the element already 
        var existing = null;
        var numExisting = _children.length;
        for (var x = 0; x < numExisting; x++)
        {
            var curExisting = _children[x];
            if (curExisting.handle.element === addRequest.element)
            {
                existing = curExisting;
                break;
            }
        }

        if (existing != null) //we already have a handler for that element, just update the record with the provided events and return it
        {
            overwriteEvents(addRequest, existing.iFrame);
            return existing.iFrame;
        }

        //make, register, and return the new entry's IFrame
        var entry = new IFrameEntry();
        entry.handle = buildIFrameHandle(addRequest, EVUI.Modules.IFrames.WindowType.Child);
        entry.iFrame = new EVUI.Modules.IFrames.IFrame(entry.handle);

        overwriteEvents(addRequest, entry.iFrame);

        _children.push(entry);
        return entry.iFrame;
    };

    /**Add an event listener to fire after an event with the same key has been executed.
    @param {String} eventkey The key of the event in the EventStream to execute after.
    @param {EVUI.Modules.IFrames.Constants.Fn_IFrameEventHandler} handler The function to fire.
    @param {EVUI.Modules.EventStream.EventStreamEventListenerOptions} options Options for configuring the event.
    @returns {EVUI.Modules.EventStream.EventStreamEventListener}*/
    this.addEventListener = function (eventkey, handler, options)
    {
        if (EVUI.Modules.Core.Utils.isObject(options) === false) options = new EVUI.Modules.EventStream.EventStreamEventListenerOptions();
        options.eventType = EVUI.Modules.EventStream.EventStreamEventType.GlobalEvent;

        return _bubblingEvents.addEventListener(eventkey, handler, options);
    };

    /**Removes an event listener based on its event key, its id, or its handling function.
    @param {String} eventkeyOrId The key or ID of the event to remove.
    @param {Function} handler The handling function of the event to remove.
    @returns {Boolean}*/
    this.removeEventListener = function (eventkeyOrId, handler)
    {
        return _bubblingEvents.removeEventListener(eventkeyOrId, handler);
    };

    /**Creates an IFrameHandle that contains the injectable functionality for the IFrame object.
    @param {EVUI.Modules.IFrames.IFrameAddRequest} addRequest The IFrameAddRequest used as the basis for the handle.
    @returns {IFrameHandle}*/
    var buildIFrameHandle = function (addRequest, iframeType)
    {
        var handle = new IFrameHandle();
        handle.contextID = EVUI.Modules.Core.Utils.makeGuid();
        handle.element = addRequest.element;
        handle.url = isIframe(addRequest.element) === true ? addRequest.element.src : null;
        handle.windowType = iframeType;

        return handle;
    };

    /**Sends a message to another window.
    @param {IFrameHandle} handle The IFrameHandle of the window that will receive the message.
    @param {Any} data The data the user provided to send to the other window.
    @param {String|EVUI.Modules.IFrames.SendMessageArgs} messageCodeOrArgs Either the code of the handler to receive the message or the SendMessageArgs containing information about the send operation.
    @param {String} senderName The name of the sender to use for tracing purposes.
    @param {String} askSessionID If this is a response to an ask session, this is the ID of the ask to fulfill.*/
    var send = function (handle, data, messageCodeOrArgs, senderName, askSessionID)
    {
        var entry = getEntryFromHandle(handle);
        if (entry == null) makePlaceholderEntry(handle.element); //if we didn't find an entry for the iframe, we're sending from a placeholder, so we need to go make a new placeholder to complete the event arguments.

        var sendArgs = new EVUI.Modules.IFrames.SendMessageArgs();
        if (typeof messageCodeOrArgs === "object")
        {
            sendArgs = EVUI.Modules.Core.Utils.shallowExtend(sendArgs, messageCodeOrArgs);
        }
        else if (typeof messageCodeOrArgs === "string")
        {
            sendArgs.messageCode = messageCodeOrArgs;
        }

        sendArgs.senderName = senderName;

        //make the internal record of the send session that will be used to create the event stream to manage the lifetime of the send process
        var messageSession = new IFrameMessageSession();
        messageSession.sessionID = EVUI.Modules.Core.Utils.makeGuid();
        messageSession.entry = entry;
        messageSession.messageWapper = new MessageWrapper();
        messageSession.messageWapper.data = data;
        messageSession.messageWapper.metadata = new MessageMetadata();
        messageSession.messageWapper.metadata.askSessionID = askSessionID;
        messageSession.messageWapper.metadata.messageCode = sendArgs.messageCode;
        messageSession.messageWapper.metadata.sessionID = messageSession.sessionID;
        messageSession.messageWapper.metadata.senderName = sendArgs.senderName;

        handleOutgoingMessage(messageSession);
    };

    /**Adds a listener to call when a message arrives in this window with a specific message code.
    @param {IFrameHandle} handle The handle that will respond to the message code.
    @param {String} messageCode The string identifier that will be checked when a message arrives and used to match the message up with the proper handler.
    @param {EVUI.Modules.IFrames.Constants.Fn_IFrameEventHandler} handler The function to invoke when a message with the given messageCode arrives.*/
    var addMessageHandler = function (handle, messageCode, handler)
    {
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(messageCode) === true) throw Error("MessageCode must be a non-whitespace string.");
        if (typeof handler !== "function" && handler != null) throw Error("Handler must be a function.");

        var messageHandler = getMessageHandler(handle, messageCode);
        if (messageHandler != null) throw Error("IFrame already has a message handler for \"" + messageCode + "\".");

        var messageHandler = new EVUI.Modules.IFrames.IFrameMessageListener(messageCode, handler);
        handle.messageHandlers.push(messageHandler);
    };


    /**Removes a listener from the IFrameHandle.
    @param {IFrameHandle} handle The IFrameHandle to remove the listener from.
    @param {String} messageCode The message code of the listener to remove.
    @returns {Boolean}*/
    var removeMessageHandler = function (handle, messageCode)
    {
        var messageHandler = getMessageHandler(handle, messageCode);
        if (messageHandler == null) return false;

        var index = handle.messageHandlers.indexOf(messageHandler);
        if (index !== -1) handle.messageHandlers.splice(index, 1);

        true;
    };

    /**Sends a message to another window which has the option of responding to the call site of the ask directly.
    @param {IFrameHandle} handle The IFrameHandle of the window that will receive the message.
    @param {Any} data The data the user provided to send to the other window.
    @param {String|EVUI.Modules.IFrames.SendMessageArgs} messageCodeOrArgs Either the code of the handler to receive the message or the AskArgs containing information about the send operation.
    @param {String} senderName The name of the sender to use for tracing purposes.
    @param {EVUI.Modules.IFrames.Constants.Fn_AskCallback} callback The callback function to call when the ask operation returns from the other window.*/
    var ask = function (handle, data, messageCodeOrArgs, senderName, callback)
    {
        if (typeof callback !== "function")
        {
            if (typeof messageCodeOrArgs === "function") callback = messageCodeOrArgs;
            if (typeof senderName === "function") callback = senderName;
        }

        if (typeof callback !== "function") throw Error("Ask operation must have a callback.");

        var entry = getEntryFromHandle(handle);
        if (entry == null) throw Error("Cannot ask from unregistered iframe.");

        var askArgs = new EVUI.Modules.IFrames.AskArgs();
        if (typeof messageCodeOrArgs === "object")
        {
            askArgs = EVUI.Modules.Core.Utils.shallowExtend(askArgs, messageCodeOrArgs);
        }
        else if (typeof messageCodeOrArgs === "string")
        {
            askArgs.messageCode = messageCodeOrArgs;
        }

        askArgs.senderName = senderName;
        if (typeof askArgs.responseTimeout !== "number" || askArgs.responseTimeout < 0) askArgs.responseTimeout = _defaultAskTimeout;

        var messageSession = new IFrameMessageSession();
        messageSession.sessionID = EVUI.Modules.Core.Utils.makeGuid();
        messageSession.entry = entry;
        messageSession.askArgs = askArgs;
        messageSession.askCallback = callback;
        messageSession.messageWapper = new MessageWrapper();
        messageSession.messageWapper.data = data;
        messageSession.messageWapper.metadata = new MessageMetadata();
        messageSession.messageWapper.metadata.askSessionID = EVUI.Modules.Core.Utils.makeGuid();
        messageSession.messageWapper.metadata.messageCode = askArgs.messageCode;
        messageSession.messageWapper.metadata.sessionID = messageSession.sessionID;
        messageSession.messageWapper.metadata.senderName = askArgs.senderName;

        handleOutgoingMessage(messageSession);
    };

    /**Sends a message to another window which has the option of responding to the call site of the ask directly.
    @param {IFrameHandle} handle The IFrameHandle of the window that will receive the message.
    @param {Any} data The data the user provided to send to the other window.
    @param {String|EVUI.Modules.IFrames.SendMessageArgs} messageCodeOrArgs Either the code of the handler to receive the message or the AskArgs containing information about the send operation.
    @param {String} senderName The name of the sender to use for tracing purposes.
    @returns {Promise<Any>}*/
    var askAsync = function (handle, data, messageCodeOrArgs, senderName)
    {
        return new Promise(function (resolve, reject)
        {
            ask(handle, data, messageCodeOrArgs, senderName, function (answer)
            {
                resolve(answer);
            });
        });
    };

    /**Removes an IFrame from the manager.
    @param {IFrameHandle} handle
    @returns {Boolean}*/
    var remove = function (handle)
    {
        var numChildren = _children.length;
        for (var x = 0; x < numChildren; x++)
        {
            var curChild = _children[x];
            if (curChild.handle === handle)
            {
                _children.splice(x, 1);
                return true;
            }
        }

        return false;
    };

    /**Overwrites the event handlers on the IFrame.
    @param {EVUI.Modules.IFrame.IFrameAddRequest} addRequest The request to add (or in this case, modify) the IFrame record.
    @param {IFrameHandle} iFrame The handle of the IFrame whose events are being overwritten.*/
    var overwriteEvents = function (addRequest, iFrame)
    {
        if (typeof addRequest.onMessage === "function") iFrame.onMessage = addRequest.onMessage;
        if (typeof addRequest.onSend === "function") iFrame.onSend = addRequest.onSend;
    };

    /**Gets a child IFrameEntry based on its contextID.
    @param {String} contextID The ID of the child IFrame to get.
    @returns {IFrameEntry} */
    var getChildIFrame = function (contextID)
    {
        var numChildren = _children.length;
        for (var x = 0; x < numChildren; x++)
        {
            var curChild = _children[x];
            if (curChild.contextID === contextID) return curChild;
        }

        return null;
    };

    /**Gets the origin of an arbitrary URL. 
    @param {String} url The URL to get the origin from.
    @returns {String}*/
    var getOrigin = function (url)
    {
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(url) === true) return null;

        try
        {
            var aTag = document.createElement("a");
            aTag.href = url;

            return aTag.origin;
        }
        catch (ex)
        {
            return null;
        }
    };

    /**Hooks up the message handler for the IFrameManager to listen for incoming messages from other windows.
    @param {EVUI.Modules.IFrames} iframeModule The current iframe module, used to validate that this module has not been overwritten (in which case it won't fire).*/
    var hookUpMessageHandler = function (iframeModule)
    {
        if (_handlerAttached === true) return;
        _handlerAttached = true;

        if (parent !== window)
        {
            var addRequest = new EVUI.Modules.IFrames.IFrameAddRequest();
            addRequest.element = parent;
            addRequest.iframeType = EVUI.Modules.IFrames.WindowType.Parent;

            _parent = new IFrameEntry();
            _parent.handle = buildIFrameHandle(addRequest, EVUI.Modules.IFrames.WindowType.Parent);
            _parent.iFrame = new EVUI.Modules.IFrames.IFrame(_parent.handle);
        }

        //hook into the window's message event
        addEventListener("message", function (messageEvent)
        {
            if (messageEvent.origin == null || iframeModule.versionState === "overwritten") return; //first make sure we have an origin and that the module is still valid

            var incomingOrigin = messageEvent.origin;
            if (isOriginRegistered(incomingOrigin) === false) return; //not a whitelisted origin, don't process

            if (messageEvent.data == null || messageEvent.data.metadata == null || messageEvent.data.metadata.signature !== _signature) return; //not a eventui message, don't process

            var entry = getEntryFromContentWindow(messageEvent.source); //figure out which entry to use based on the WindowProxy object in the event args
            if (entry == null) //not a managed iframe
            {
                var incomingIFrame = getIFrameFromContentWindow(messageEvent.source); //go find the iframe element on the page that sent the message
                if (incomingIFrame == null) return; //couldn't find it, bail

                if (entry == null) //if we STILL don't have an entry, make a dummy one just so the event arguments object we make later has everything it needs to work properly
                {
                    entry = makePlaceholderEntry(incomingIFrame);
                }
            }         

            //finally, build and launch an event stream to manage the receive process.
            handleIncomingMessageSession(messageEvent, entry);
        });
    };

    /**Handles an incoming message and build the EventStream related functionality.
    @param {MessageEvent} messageEvent The browser's event args for the message event.
    @param {IFrameEntry} iframeEntry The IFrame entry that sent the message.*/
    var handleIncomingMessageSession = function (messageEvent, iframeEntry)
    {
        var wrapper = new MessageWrapper();
        wrapper.metadata = new MessageMetadata();
        wrapper.metadata.sessionID = messageEvent.data.metadata.sessionID;
        wrapper.metadata.messageCode = messageEvent.data.metadata.messageCode;
        wrapper.metadata.askSessionID = messageEvent.data.metadata.askSessionID;
        wrapper.data = messageEvent.data.data;

        var messageSession = new IFrameMessageSession();
        messageSession.entry = iframeEntry;
        messageSession.sessionID = EVUI.Modules.Core.Utils.makeGuid();
        messageSession.messageWapper = wrapper;

        configureEventStream(messageSession, true);

        var es = messageSession.eventStream;

        var askSession = getAskSession(messageSession.entry, messageSession.messageWapper.metadata.askSessionID);
        if (askSession != null && askSession.askArgs != null && typeof askSession.askCallback === "function" && messageSession.askCallbackFired === false) //if we have an "unanswered" ask session, fire its callback and do nothing else.
        {
            askSession.askCallbackFired = true;

            es.addStep({
                type: EVUI.Modules.EventStream.EventStreamStepType.Event,
                key: EVUI.Modules.IFrames.Constants.Event_OnAsk,
                name: EVUI.Modules.IFrames.Constants.StepPrefix + "." + EVUI.Modules.IFrames.Constants.Event_OnAsk,
                handler: function (eventArgs)
                {
                    return askSession.askCallback(eventArgs.message.data);
                }
            });
        }
        else //otherwise, use the normal even procession.
        {
            es.addStep({
                type: EVUI.Modules.EventStream.EventStreamStepType.Event,
                key: EVUI.Modules.IFrames.Constants.Event_OnMessage,

                name: EVUI.Modules.IFrames.Constants.StepPrefix + "." + EVUI.Modules.IFrames.Constants.Event_OnMessage,
                handler: function (eventArgs)
                {
                    if (typeof iframeEntry.handle.onMessage === "function")
                    {
                        return iframeEntry.handle.onMessage.call(this, eventArgs);
                    }
                }
            });

            es.addStep({
                type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
                key: EVUI.Modules.IFrames.Constants.Event_OnMessage,
                name: EVUI.Modules.IFrames.Constants.StepPrefix + "." + EVUI.Modules.IFrames.Constants.Event_OnMessage,
                handler: function (eventArgs)
                {
                    if (typeof _self.onMessage === "function")
                    {
                        return _self.onMessage.call(_self, eventArgs);
                    }
                }
            });

            es.addStep({
                type: EVUI.Modules.EventStream.EventStreamStepType.Event,
                key: EVUI.Modules.IFrames.Constants.Event_OnHandle,
                name: EVUI.Modules.IFrames.Constants.StepPrefix + "." + EVUI.Modules.IFrames.Constants.Event_OnHandle,
                handler: function (eventArgs)
                {
                    var handler = getMessageHandler(messageSession.entry.handle, messageSession.messageWapper.metadata.messageCode);
                    if (handler != null && typeof handler.handler === "function")
                    {
                        return handler.handler(eventArgs);
                    }
                }
            });
        }

        //kick off the process
        es.execute();
    };

    /**Creates the EventStream related functionality for sending a message to another window.
    @param {IFrameMessageSession} messageSession All the data we know about the message being sent.*/
    var handleOutgoingMessage = function (messageSession)
    {
        configureEventStream(messageSession);

        var es = messageSession.eventStream;

        es.addStep({
            key: EVUI.Modules.IFrames.Constants.Event_OnSend,
            type: EVUI.Modules.EventStream.EventStreamStepType.Event,
            name: EVUI.Modules.IFrames.Constants.StepPrefix + "." + EVUI.Modules.IFrames.Constants.Event_OnSend,
            handler: function (eventArgs)
            {
                if (typeof messageSession.entry.handle.onSend === "function")
                {
                    return messageSession.entry.handle.onSend(eventArgs);
                }
            }
        });

        es.addStep({
            key: EVUI.Modules.IFrames.Constants.Event_OnSend,
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            name: EVUI.Modules.IFrames.Constants.StepPrefix + "." + EVUI.Modules.IFrames.Constants.Event_OnSend,
            handler: function (eventArgs)
            {
                if (typeof _self.onSend === "function")
                {
                    return _self.onSend.call(_self, eventArgs);
                }
            }
        });

        es.addStep({
            key: EVUI.Modules.IFrames.Constants.Job_Send,
            type: EVUI.Modules.EventStream.EventStreamStepType.Job,
            name: EVUI.Modules.IFrames.Constants.StepPrefix + "." + EVUI.Modules.IFrames.Constants.Job_Send,
            handler: function (jobArgs)
            {
                var target = null;

                if (messageSession.entry === _parent)
                {
                    if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(_parent.handle.origin) === true) return jobArgs.reject("Parent window origin unset.");
                    target = parent;
                }
                else
                {
                    if (messageSession.entry.handle.element.contentWindow != null) target = messageSession.entry.handle.element.contentWindow;
                }

                if (target != null)
                {
                    target.postMessage(messageSession.messageWapper, messageSession.entry.handle.origin);
                }
                else
                {
                    return jobArgs.reject("Could not resolve message target.");
                }

                jobArgs.resolve();
            }
        });

        if (messageSession.askArgs != null) //if we have an ask session, add a job that completes the callback on the timeout.
        {
            messageSession.entry.messageSessions.push(messageSession);

            es.addStep({
                key: EVUI.Modules.IFrames.Constants.Job_Ask,
                type: EVUI.Modules.EventStream.EventStreamStepType.Job,
                name: EVUI.Modules.IFrames.Constants.StepPrefix + "." + EVUI.Modules.IFrames.Constants.Job_Ask,
                handler: function (jobArgs)
                {
                    var finish = function (value)
                    {
                        var index = messageSession.entry.messageSessions.indexOf(messageSession);
                        if (index !== -1) messageSession.entry.messageSessions.splice(index, 1);

                        return (value instanceof Error) ? jobArgs.reject("Ask callback crashed.", value) : jobArgs.resolve(value);
                    };

                    setTimeout(function () //set the failsafe timeout
                    {
                        if (messageSession.askCallbackFired === false) //only if the callback has not yet fired
                        {
                            messageSession.askCallbackFired = true;

                            try
                            {
                                var result = messageSession.askCallback(undefined); //call the callback
                                if (EVUI.Modules.Core.Utils.isPromise(result) === true) //if it's a promise, handle the "then" and "catch" parts of the promise so the event stream finishes.
                                {
                                    result.then(function (value)
                                    {
                                        finish(value);
                                    }).catch(function (ex)
                                    {
                                        finish(ex);
                                    });
                                }
                                else //otherwise just finish
                                {
                                    finish(result);
                                }
                            }
                            catch (ex) //handler crashed, finish with the exception
                            {
                                finish(ex);
                            }
                        }
                        else //handler already fired, remove the message session from the callback stack
                        {
                            finish()
                        }

                    }, messageSession.askArgs.responseTimeout);
                }
            });
        }

        es.execute();
    };

    var traceOutgoingMessage = function (messageSession)
    {

    };

    var traceIncomingMessage = function (messageSession)
    {

    };


    /**Sets up the common properties of the EventStream for both sending and receiving messages.
    @param {IFrameMessageSession} messageSession Everything that is known about the incoming or outgoing message.
    @param {Boolean} receiving Whether or not we are receiving a message.*/
    var configureEventStream = function (messageSession, receiving)
    {
        var es = new EVUI.Modules.EventStream.EventStream();
        es.context = messageSession.entry.iFrame;
        es.bubblingEvents = [messageSession.entry.handle.bubblingEvents, _bubblingEvents];

        es.processInjectedEventArgs = function (eventArgs)
        {
            var message = makeMessageFromWrapper(messageSession.messageWapper, messageSession.entry.handle.windowType);
            var iframeArgs = new EVUI.Modules.IFrames.IFrameEventArgs(messageSession.entry.iFrame, message);
            iframeArgs.cancel = eventArgs.cancel;
            iframeArgs.context = es.eventState;
            iframeArgs.eventType = eventArgs.key;
            iframeArgs.eventName = eventArgs.name;
            iframeArgs.pause = eventArgs.pause;
            iframeArgs.resume = eventArgs.resume;
            iframeArgs.stopPropagation = eventArgs.stopPropagation;
            iframeArgs.respond = function (data, messageCodeOrArgs, senderName)
            {
                if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(messageSession.messageWapper.metadata.askSessionID) === false)
                {
                    messageSession.entry.handle.send(data, messageCodeOrArgs, senderName, messageSession.messageWapper.metadata.askSessionID);
                }
                else
                {
                    messageSession.entry.handle.send(data, messageCodeOrArgs, senderName);
                }
            };

            if (receiving !== true) delete iframeArgs.respond;

            return iframeArgs;
        };

        es.processReturnedEventArgs = function (iframeArgs)
        {
            es.eventState = iframeArgs.state;
        };

        es.canSeek = false;
        messageSession.eventStream = es;
    };

    /**Makes an IFrameMessage from an incoming MessageWrapper.
    @param {MessageWrapper} messageWrapper The incoming wrapper for the message.
    @param {String} senderType A value from the WindowType enum indicating if this message came from a child or a parent.
    @returns {EVUI.Modules.IFrames.IFrameMessage} */
    var makeMessageFromWrapper = function (messageWrapper, senderType)
    {
        var message = new EVUI.Modules.IFrames.IFrameMessage();
        message.messageSenderType = senderType;
        message.messageCode = messageWrapper.metadata.messageCode;
        message.data = messageWrapper.data;

        return message;
    };


    /**Determines whether an origin is registered with the IFrameManager or not.
    @param {String} origin The origin of the incoming iframe message.
    @returns {Boolean} */
    var isOriginRegistered = function (origin)
    {
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(origin) === true) return false;

        var lowerOrigin = origin.toLowerCase();
        if (lowerOrigin === location.origin.toLowerCase()) return true; //same origin, allow

        if (_parent != null)
        {
            if (_parent.handle.origin === lowerOrigin) return true; //parent origin, allow
        }

        var numChildren = _children.length;
        for (var x = 0; x < numChildren; x++)
        {
            if (_children[x].handle.origin === lowerOrigin) return true; //one of the registered child origins, allow
        }

        return false; //otherwise, don't allow
    };

    /**Walks the list of child iframes (and the parent window) to figure out which IFrameEntry has the matching WindowProxy for the given source.
    @param {Window|WindowProxy} messageSource The "source" property of the browser's message event args.
    @returns {iFrameEntry} */
    var getEntryFromContentWindow = function (messageSource)
    {
        if (_parent != null)
        {
            if (parent !== window && parent === messageSource) return _parent;
        }

        var numChildren = _children.length;
        for (var x = 0; x < numChildren; x++)
        {
            var curChild = _children[x];
            if (curChild.handle.element.contentWindow === messageSource) return curChild;
        }

        return null;
    };

    /**Gets all the iframe elements on the page and finds the one with the matching WindowProxy as the contentWindow.
    @param {WindowProxy} contentWindow
    @returns {Element} */
    var getIFrameFromContentWindow = function (contentWindow)
    {
        var iframes = new EVUI.Modules.Dom.DomHelper("iframe");
        var targetIframe = null;

        var numIframes = iframes.elements.length;
        for (var x = 0; x < numIframes; x++)
        {
            var curIFrame = iframes.elements[x];
            if (curIFrame.contentWindow === contentWindow)
            {
                targetIframe = curIFrame;
                break;
            }
        }

        return targetIframe;
    }

    /**Makes a dummy entry that has all the properties of a regular IFrameEntry, except it is not part of the managed collection of this IFrameManager.
    @param {Element} iframeElement The iframe element that the placeholder entry is being created for.
    @returns {IFrameEntry} */
    var makePlaceholderEntry = function (iframeElement)
    {
        var addRequest = new EVUI.Modules.IFrames.IFrameAddRequest();
        addRequest.element = iframeElement;

        var handler = buildIFrameHandle(addRequest, EVUI.Modules.IFrames.WindowType.Child);
        handler.contextID = EVUI.Modules.IFrames.Constants.PlaceholderIFrameContextID;

        var iframe = new EVUI.Modules.IFrames.IFrame(handler);
        var entry = new IFrameEntry();
        entry.handle = handler;
        entry.iFrame = iframe;

        return entry;
    };

    /**Determines whether or not an object is an iframe element.
    @param {Element} element The element to check.
    @returns {Boolean}*/
    var isIframe = function (element)
    {
        return (EVUI.Modules.Core.Utils.isElement(element) === true && element.tagName.toLowerCase() === "iframe");
    };

    /**Determines whether or not an object is this window's parent window.
    @param {Any} element The object to check.
    @returns {Boolean}*/
    var isParentWindow = function (element)
    {
        return (element instanceof Window && element === parent && parent !== window);
    };

    /**Gets the ask session with the matching ID.
    @param {IFrameEntry} entry The IFrameEntry that is receiving the message.
    @param {String} askSessionID The ID of the ask session.
    @returns {IFrameMessageSession} */
    var getAskSession = function (entry, askSessionID)
    {
        var numSessions = entry.messageSessions.length;
        for (var x = 0; x < numSessions; x++)
        {
            var curEntry = entry.messageSessions[x];
            if (curEntry.messageWapper.metadata.askSessionID === askSessionID) return curEntry;
        }

        return null;
    }

    /**Gets the message handler that matches the given message code.
    @param {IFrameHandle} handler The IFrameHandle that could contain the message handler to get.
    @param {String} messageCode The code of the message handler to get.
    @returns {EVUI.Modules.IFrames.IFrameMessageListener}*/
    var getMessageHandler = function (handler, messageCode)
    {
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(messageCode) === true) return null;

        var numHandlers = handler.messageHandlers.length;
        for (var x = 0; x < numHandlers; x++)
        {
            var curHandler = handler.messageHandlers[x];
            if (curHandler.messageCode === messageCode) return curHandler;
        }

        return null;
    };

    /**Gets an IFrameEntry based on the IFrameHandle passed in.
    @param {IFrameHandle} handle The IFrameHandle to get the matching entry for.
    @returns {IFrameEntry} */
    var getEntryFromHandle = function (handle)
    {
        if (handle === _parent.handle) return _parent;

        var numChildren = _children.length;
        for (var x = 0; x < numChildren; x++)
        {
            var curChild = _children[x];
            if (curChild.handle === handle) return curChild;
        }

        return null;
    };

    //hook up the message handler upon initialization
    hookUpMessageHandler(EVUI.Modules.IFrames);
};

/**Object containing data sent from another window.
@class*/
EVUI.Modules.IFrames.IFrameMessage = function ()
{
    this.messageSenderType = EVUI.Modules.IFrames.WindowType.None;
    this.messageCode = null;
    this.data = null;
};

/**Enum for tracking the type of window sent or received a message, or what type of window an IFrame object represents.*/
EVUI.Modules.IFrames.WindowType =
{
    None: "none",
    Parent: "parent",
    Child: "child"
};
Object.freeze(EVUI.Modules.IFrames.WindowType);

/**Object that represents either a parent or child window that is managed by the IFrameManager.
@class*/
EVUI.Modules.IFrames.IFrame = function (iframeHandle)
{
    if (iframeHandle == null) throw Error("Invalid Arguments: Missing IFrameHandle.");
    if (iframeHandle.element !== parent && (EVUI.Modules.Core.Utils.isElement(iframeHandle.element) === false && iframeHandle.element.tagName.toLowerCase() !== "iframe")) throw Error("Invalid Arguments: Invalid IFrameHandle.");

    var _handle = iframeHandle;

    /**String. Read only. A value from WindowType indicating the type of window this IFrame represents.
    @type {String}*/
    this.windowType = EVUI.Modules.IFrames.WindowType.None;
    Object.defineProperty(this, "windowType", {
        get: function ()
        {
            return _handle.windowType;
        },
        configurable: false,
        enumerable: true
    });

    /**String. Read only. The unique identifier for the iframe or parent window this object represents.
    @type {String}*/
    this.contextID = null;
    Object.defineProperty(this, "contextID", {
        get: function ()
        {
            return _handle.contextID;
        },
        configurable: false,
        enumerable: true
    });

    /**String. Read only. The origin of the iframe or parent window.
    @type {String}*/
    this.origin = null;
    Object.defineProperty(this, "origin", {
        get: function ()
        {
            return _handle.origin;
        },
        configurable: false,
        enumerable: true
    });

    /**Object. Read only. The iframe Element or the parent window of the current window.
    @type {Element|WindowProxy}*/
    this.element = null;
    Object.defineProperty(this, "element", {
        get: function ()
        {
            return _handle.element;
        },
        configurable: false,
        enumerable: true
    });

    /**String. Read only. The URL of the iframe or parent window.
    @type {String}*/
    this.url = null;
    Object.defineProperty(this, "url", {
        get: function ()
        {
            return _handle.url;
        },
        configurable: false,
        enumerable: true
    });

    /**Event handler that fires every time a message was sent from this iframe or parent window.
    @type {EVUI.Modules.IFrames.Constants.Fn_IFrameEventHandler}*/
    this.onMessage = null;
    Object.defineProperty(this, "onMessage", {
        get: function ()
        {
            return _handle.onMessage;
        },
        set: function (value)
        {
            _handle.onMessage = value;
        },
        configurable: false,
        enumerable: true
    });

    /**Event handler that fires every time a message is sent to this iframe or parent window.
    @type {EVUI.Modules.IFrames.Constants.Fn_IFrameEventHandler}*/
    this.onSend = null;
    Object.defineProperty(this, "onSend", {
        get: function ()
        {
            return _handle.onSend;
        },
        set: function (value)
        {
            _handle.onSend = value;
        },
        configurable: false,
        enumerable: true
    });

    /**Sends a message to the iframe or parent window.
    @param {Any} data Any data to send to the other window.
    @param {String|EVUI.Modules.IFrames.SendMessageArgs} messageCodeOrArgs Optional. Either a string indicating which message handler to call in the other window or a yolo SendMessageArgs object.
    @param {String} senderName Optional. A name to give the sender of the message. Used for tracing purposes.*/
    this.send = function (data, messageCodeOrArgs, senderName)
    {
        _handle.send(data, messageCodeOrArgs, senderName);
    };

    /**Adds a message handler to this IFrame that will be triggered when a message arrives with the matching messageCode.
    @param {String} messageCode The message code to listen for on an incoming message.
    @param {EVUI.Modules.IFrames.Constants.Fn_IFrameEventHandler} handler The function to call when a message is received with the matching message code.*/
    this.addMessageHandler = function (messageCode, handler)
    {
        _handle.addMessageHandler(messageCode, handler);
    };

    /**Removes a message handler with the matching messageCode.
    @param {String} messageCode The message code to remove the handler for.
    @returns {Boolean}*/
    this.removeMessageHandler = function (messageCode)
    {
        return _handle.removeMessageHandler(messageCode);
    };

    /**Gets the message handler with the given messageCode.
    @param {String} messageCode The message code of the handler to get.
    @returns {EVUI.Modules.IFrames.IFrameMessageListener} */
    this.getMessageHandler = function (messageCode)
    {
        var numHandlers = _handle.messageHandlers.length;
        for (var x = 0; x < numHandlers; x++)
        {
            var curHandler = _handle.messageHandlers[x];
            if (curHandler.messageCode === messageCode) return curHandler;
        }

        return null;
    };

    /**Gets a copy of the internal array of message handlers associated with this IFrame.
    @returns {[EVUI.Modules.IFrames.IFrameMessageListener]}*/
    this.getMessageHandlers = function ()
    {
        return _handle.messageHandlers.slice();
    };

    /**Sends a message to the iframe or parent window that can be responded to directly. The response will bypass the normal handling events and will be passed directly into the callback.
    @param {Any} data The data to send to the other window.
    @param {String|EVUI.Modules.IFrames.AskArgs} messageCodeOrArgs Optional. Either a string indicating which message handler to call in the other window or a yolo AskArgs object.
    @param {String} senderName Optional. A name to give the sender of the message. Used for tracing purposes.
    @param {EVUI.Modules.IFrames.Constants.Fn_AskCallback} callback A callback function to fire when the other window responds.*/
    this.ask = function (data, messageCodeOrArgs, senderName, callback)
    {
        _handle.ask(data, messageCodeOrArgs, senderName, callback);
    };

    /**Awaitable. Sends a message to the iframe or parent window that can be responded to directly. The response will bypass the normal handling events and will be passed directly into the callback.
    @param {Any} data The data to send to the other window.
    @param {String|EVUI.Modules.IFrames.AskArgs} messageCodeOrArgs Optional. Either a string indicating which message handler to call in the other window or a yolo AskArgs object.
    @param {String} senderName Optional. A name to give the sender of the message. Used for tracing purposes.
    @returns {Promise<Any>}*/
    this.askAsync = function (data, messageCodeOrArgs, senderName)
    {
        return _handle.askAsync(data, messageCodeOrArgs, senderName);
    };

    /**Removes the IFrame from the IFrameManager.
    @returns {Boolean}*/
    this.remove = function ()
    {
        return _handle.remove();
    };

    /**Add an event listener to fire after an event with the same key has been executed.
    @param {String} eventkey The key of the event in the EventStream to execute after.
    @param {EVUI.Modules.IFrames.Constants.Fn_IFrameEventHandler} handler The function to fire.
    @param {EVUI.Modules.EventStream.EventStreamEventListenerOptions} options Options for configuring the event.
    @returns {EVUI.Modules.EventStream.EventStreamEventListener}*/
    this.addEventListener = function (eventkey, handler, options)
    {
        if (EVUI.Modules.Core.Utils.isObject(options) === false) options = new EVUI.Modules.EventStream.EventStreamEventListenerOptions();
        options.eventType = EVUI.Modules.EventStream.EventStreamEventType.Event;

        return _handle.bubblingEvents.addEventListener(eventkey, handler, options);
    };

    /**Removes an event listener based on its event key, its id, or its handling function.
    @param {String} eventkeyOrId The key or ID of the event to remove.
    @param {Function} handler The handling function of the event to remove.
    @returns {Boolean}*/
    this.removeEventListener = function (eventkeyOrId, handler)
    {
        return _handle.bubblingEvents.removeEventListener(eventkeyOrId, handler);
    };
};

/**The event arguments for when a message is sent or received.
@class*/
EVUI.Modules.IFrames.IFrameEventArgs = function (iframe, message)
{
    var _iframe = iframe;
    var _message = message;

    /**Object. The window that sent the message.
    @type {EVUI.Modules.IFrames.IFrame}*/
    this.sendingIFrame = null;
    Object.defineProperty(this, "sendingIFrame", {
        get: function () { return _iframe },
        enumerable: true,
        configurable: false
    });

    /**Object. The message sent from another window.
    @type {EVUI.Modules.IFrames.IFrameMessage}*/
    this.message = null;
    Object.defineProperty(this, "message", {
        get: function () { return _message; },
        enumerable: true,
        configurable: false
    });

    /**String. The full name of the event.
    @type {String}*/
    this.eventName = null;

    /**String. The type of event being raised.
    @type {String}*/
    this.eventType = null;

    /**Pauses the IFrame's action, preventing the next step from executing until resume is called.*/
    this.pause = function () { };

    /**Resumes the IFrame's action, allowing it to continue to the next step.*/
    this.resume = function () { };

    /**Cancels the IFrame's action and aborts the execution of the operation.*/
    this.cancel = function () { }

    /**Stops the IFrame from calling any other event handlers with the same eventType.*/
    this.stopPropagation = function () { };

    /**Object. Any state value to carry between events.
    @type {Object}*/
    this.context = {};
};

/**Arguments for adding an iframe or parent window to the iframe manager.
@class*/
EVUI.Modules.IFrames.IFrameAddRequest = function ()
{
    /**Element. The iframe element, parent window, or CSS selector of an iframe to add to the iframe manager.
    @type {Element|Window|String}*/
    this.element = null;

    /**Function. The event handler to call when a message arrives from the provided element or parent window.
    @type {EVUI.Modules.IFrames.Constants.Fn_IFrameEventHandler}*/
    this.onMessage = null;

    /**Function. The event handler to call when a message is sent to the provided element or parent window.
    @type {EVUI.Modules.IFrames.Constants.Fn_IFrameEventHandler}*/
    this.onSend = null;
};

/**Arguments for registering the parent window's domain to the iframe manager.
@class*/
EVUI.Modules.IFrames.ParentWindowAddRequest = function ()
{
    /**String. The URL of the parent window or iframe (if it does not have a valid src property set yet).
    @type {String}*/
    this.url = null;

    /**Function. The event handler to call when a message arrives from the provided element or parent window.
    @type {EVUI.Modules.IFrames.Constants.Fn_IFrameEventHandler}*/
    this.onMessage = null;

    /**Function. The event handler to call when a message is sent to the provided element or parent window.
    @type {EVUI.Modules.IFrames.Constants.Fn_IFrameEventHandler}*/
    this.onSend = null;
};

/**Additional arguments for sending a message to another window.
@class*/
EVUI.Modules.IFrames.SendMessageArgs = function ()
{
    /**String. The name of the event to trigger.
    @type {String}*/
    this.messageCode = null;

    /**String. An identifier to give the sender for tracing purposes.
    @type {String}*/
    this.senderName = null;
};

/**Additional arguments for sending a message to another window and waiting for a response.
@class*/
EVUI.Modules.IFrames.AskArgs = function ()
{
    /**String. The name of the event to trigger.
    @type {String}*/
    this.messageCode = null;

    /**String. An identifier to give the sender for tracing purposes.
    @type {String}*/
    this.senderName = null;

    /**Number. The number of milliseconds to wait before automatically failing the ask operation.
    @type {Number}*/
    this.responseTimeout = -1;
};

/**Represents an event listener that will be called when a message with the matching message code is received. 
@param {String} messageCode The message code to listen for.
@param {EVUI.Modules.IFrames.Constants.Fn_IFrameEventHandler} handler The function to fire when a message with the matching message code is received.
@class*/
EVUI.Modules.IFrames.IFrameMessageListener = function (messageCode, handler)
{
    var _messageCode = messageCode;
    var _handler = handler;

    /**String. The message code to listen for.
    @type {String}*/
    this.messageCode = null;
    Object.defineProperty(this, "messageCode", {
        get: function ()
        {
            return _messageCode;
        },
        configurable: false,
        enumerable: true
    });

    /**Function. The function to fire when a message with the matching message code is received.
    @type {EVUI.Modules.IFrames.Constants.Fn_IFrameEventHandler}*/
    this.handler = null;
    Object.defineProperty(this, "handler", {
        get: function ()
        {
            return _handler;
        },
        set: function (value)
        {
            if (value == null || typeof handler === "function")
            {
                _handler = value;
            }
            else
            {
                throw Error("Function expected.");
            }
        },
        enumerable: true,
        configurable: false
    });
};

/**Global instance of the IFrameManager.
@type {EVUI.Modules.IFrames.IFrameManager}*/
EVUI.Modules.IFrames.Manager = null;
(function ()
{
    var manager = null;
    Object.defineProperty(EVUI.Modules.IFrames, "Manager", {
        get: function ()
        {
            if (manager == null) manager = new EVUI.Modules.IFrames.IFrameManager();
            return manager;
        },
        configurable: false,
        enumerable: true
    });
})();

/**Constructor reference for the DropdownManager.*/
EVUI.Constructors.IFrames = EVUI.Modules.IFrames.IFrameManager

delete $evui.iframes;

/**Global instance of the IFrameManager.
@type {EVUI.Modules.IFrames.IFrameManager}*/
$evui.iframes = null;
Object.defineProperty($evui, "iframes", {
    get: function () { return EVUI.Modules.IFrames.Manager; },
    enumerable: true
});

/**Adds a child iframe to the IFrameManager or registers the parent's URL/origin with the IFrameManager.
@param {Element|String|EVUI.Modules.IFrames.ParentWindowAddRequest|EVUI.Modules.IFrames.IFrameAddRequest} addRequestOrIFrame Either an iframe Element, a CSS selector selecting iframe elements, a yolo ParentWindowAddRequest object, or a yolo IFrameAddRequest object.
@returns {EVUI.Modules.IFrames.IFrame}*/
$evui.addIFrame = function (addRequestOrIFrame)
{
    return $evui.iframes.addIFrame(addRequestOrIFrame);
};

Object.freeze(EVUI.Modules.IFrames);