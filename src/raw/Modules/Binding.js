/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

/*#INCLUDES#*/

/*#BEGINWRAP(EVUI.Modules.Binding|Binding)#*/
/*#REPLACE(EVUI.Modules.Binding|Binding)#*/

/**Module for data binding an object hierarchy to a set of DOM nodes.
@module*/
EVUI.Modules.Binding = {};

/*#MODULEDEF(Binding|"1.0"|"Binding")#*/
/*#VERSIONCHECK(EVUI.Modules.Binding|Binding)#*/

EVUI.Modules.Binding.Dependencies =
{
    Core: Object.freeze({ version: "1.0", required: true }),
    DomTree: Object.freeze({ version: "1.0", required: true }),
    Diff: Object.freeze({ version: "1.0", required: true }),
    EventStream: Object.freeze({ version: "1.0", required: true }),
    Dom: Object.freeze({ version: "1.0", required: true }),
    Observers: Object.freeze({ version: "1.0", required: true }),
    Http: Object.freeze({ version: "1.0", required: false })
};

(function ()
{
    var checked = false;

    Object.defineProperty(EVUI.Modules.Binding.Dependencies, "checked",
        {
            get: function () { return checked; },
            set: function (value)
            {
                if (typeof value === "boolean") checked = value;
            },
            configurable: false,
            enumerable: true
        });
})();

Object.freeze(EVUI.Modules.Binding.Dependencies);

EVUI.Modules.Binding.Constants = {};
EVUI.Modules.Binding.Constants.Attr_HtmlContentKey = "evui-binder-html-key";
EVUI.Modules.Binding.Constants.Attr_HtmlContentUrl = "evui-binder-html-src";
EVUI.Modules.Binding.Constants.Attr_BoundObj = "evui-binder-source";
EVUI.Modules.Binding.Constants.Attr_Mode = "evui-binder-mode";
EVUI.Modules.Binding.Constants.Attr_BindingTemplateName = "evui-binder-template-name";

EVUI.Modules.Binding.Constants.Event_OnBind = "evui.binder.bind";
EVUI.Modules.Binding.Constants.Event_OnSetHtmlContent = "evui.binder.get.htmlContent";
EVUI.Modules.Binding.Constants.Event_OnSetBindings = "evui.binder.get.bindings";
EVUI.Modules.Binding.Constants.Event_OnBindHtmlContent = "evui.binder.bind.htmlContent";
EVUI.Modules.Binding.Constants.Event_OnBindChildren = "evui.binder.bind.children";
EVUI.Modules.Binding.Constants.Event_OnBoundChildren = "evui.binder.bound.children";
EVUI.Modules.Binding.Constants.Event_OnBound = "evui.binder.bound";

/**Callback function definition for when a Binding has completed its work or was canceled.
@param {EVUI.Modules.Binding.Binding} binding The Binding that was created or re-bound.*/
EVUI.Modules.Binding.Constants.Fn_BindingCallback = function (binding) { };

/**Predicate function used to select Bindings underneath a given Binding. Return true to include in result set.
@param {EVUI.Modules.Binding.Binding} binding The Binding to test for a positive search result.
@returns {Boolean}*/
EVUI.Modules.Binding.Constants.Fn_SearchBindings = function (binding) { };

/**Predicate function used to select instances of BindingHtmlContent. Return true to include in result set.
@param {EVUI.Modules.Binding.BindingHtmlContent} bindingHtmlContent The BindingHtmlContent to test for a positive search result.
@returns {Boolean}*/
EVUI.Modules.Binding.Constants.Fn_SearchHtmlContent = function (bindingHtmlContent) { };

/**Predicate function used to select instances of BindingTemplate. Return true to include in result set.
@param {EVUI.Modules.Binding.BindingTemplate} bindingTemplate The Binding to test for a positive search result.
@returns {Boolean}*/
EVUI.Modules.Binding.Constants.Fn_SearchBindingTemplates = function (bindingTemplate) { };

/**Function that acts as an event handler for any of the events that can occur on a Binding or the BindingController.
@param {EVUI.Modules.Binding.BinderEventArgs} bindingEventArgs The event arguments for the binding process.*/
EVUI.Modules.Binding.Constants.Fn_BindingEventHandler = function (bindingEventArgs) { };

Object.freeze(EVUI.Modules.Binding.Constants);

/**Data-binding controller used for recursively binding object to DOM Nodes.
@class*/
EVUI.Modules.Binding.BindingController = function (services) 
{
    if (EVUI.Modules.Core == null) throw Error("Dependency missing: EVUI.Modules.Core is required.");
    EVUI.Modules.Core.Utils.requireAll(EVUI.Modules.Binding.Dependencies);

    var _self = this; //self-reference for closures
    var _callbackCounter = 0; //counter to identify and sort callbacks in order of addition
    var _escapeRegexRegex = /[+^?.*$(){}|\[\]\\]/g; //RegExp to replace RegExp characters in property names when merging property values into html content
    var _bindingIDCounter = 0; //the ID counter for BindingHandle objects.
    var _bindingStateIDCounter = 0; //the ID counter for BindingHandleState objects.
    var _sessionIDCounter = 0; //the ID counter for BindingSession objects.
    var _dispatchIDCounter = 0; //the ID counter for BindingDispatchHandles
    var _batchIDCounter = 0; //the ID counter for BindingSessionBatches
    var _escapedPathCahce = {}; //dictionary of BoundProperty names to their RegExp escaped names (so we don't have to run the RegExp over every property every time)
    var _maxBatch = 25; //the maximum number of sessions that can be executed at a time in a single batch.
    var _salt = "@eventui&" + EVUI.Modules.Core.Utils.makeGuid() + "&"; //the hash salt used to make the hash codes for BindingDispatchHandle keys unique across application sessions.
    var _hashMarker = EVUI.Modules.Core.Utils.getHashCode(EVUI.Modules.Core.Utils.makeGuid()).toString(36).replace(".", ""); //a hidden hash value that is used to look up information about objects or nodes that will never occur in a user's code.
    var _hashMarkerLength = _hashMarker.length; //the cached length of the hashMarker so it doesn't need to be recalculated over and over
    var _bubblingEvents = new EVUI.Modules.EventStream.BubblingEventManager();
    var _batches =
    {
        numBatches: 0,
        batchIds: [],
        finalBatchTimeoutId: -1
    };

    /**Additional information about all the htmlContent that has been bound.
    @type {HtmlContentMetadata[]}*/
    var _htmlContentMetadata = [];

    /**All of the BindingHtmlContentEntries that have been loaded into the BindingController.
    @type {BindingHtmlContentEntry[]}*/
    var _bindingHtmlContentEntries = [];

    /**Array. All of the BindingTemplates that have been loaded into the BindingController.
    @type {EVUI.Modules.Binding.BindingTemplate[]}*/
    var _bindingTemplates = [];

    /**Array. All of the queued BindingSessions that are either in progress or going to be batched and executed.
    @type {BindingSession[]}*/
    var _bindingSessions = [];

    /**Object. A dictionary mapping hash codes to a particular event handler for a bound element.
    @type {Object}*/
    var _invocationDictionary = {};

    /**Object. Injected services into this controller to use custom 
    @type {EVUI.Modules.Binding.BindingControllerServices}*/
    var _services = services;

    /**Gets a BindingHtmlContent from the controller's internal store of BindingHtmlContents.
    @param {String|EVUI.Modules.Binding.Constants.Fn_SearchHtmlContent} keyOrSelector The string key or selector predicate to select the set of BindingHtmlContent to return.
    @param {Boolean} returnFirstMatch Whether or not to return the first successful match as soon as it is found. False by default.
    @returns {EVUI.Modules.Binding.BindingHtmlContent[]|EVUI.Modules.Binding.BindingHtmlContent} */
    this.getHtmlContent = function (keyOrSelector, returnFirstMatch)
    {
        var selectorType = typeof keyOrSelector;
        if (selectorType !== "string" && selectorType !== "function") throw Error("String or function expected.");

        var numItems = _bindingHtmlContentEntries.length;
        var copyList = _bindingHtmlContentEntries.slice();
        var matches = [];

        for (var x = 0; x < numItems; x++)
        {
            var curContentEntry = copyList[x];
            if (selectorType === "string")
            {
                if (curContentEntry.item.key === keyOrSelector) return curContentEntry.item;
            }
            else
            {
                if (keyOrSelector(curContentEntry.item) === true)
                {
                    if (returnFirstMatch === true)
                    {
                        return curContentEntry.item;
                    }
                    else
                    {
                        matches.push(curContentEntry.item);
                    }
                }
            }
        }

        if (selectorType === "function" && returnFirstMatch !== true) return matches;

        return null;
    };

    /**Adds Html to the internal store of BindingHtmlContents that can be referenced in Bindings.
    @param {String|EVUI.Modules.Binding.BindingHtmlContent} key Either a unique string key of content to add or a YOLO BindingHtmlContent object.
    @param {String} htmlContent The Html content to associate with the string key.
    @param {String} url A URL to get the Html content from if it is going to be loaded remotely.
    @returns {EVUI.Modules.Binding.BindingHtmlContent}*/
    this.addHtmlContent = function (key, htmlContent, url)
    {
        var entry = addCachedHtmlContent(key, htmlContent, url);
        return entry.item;
    };

    /**Removes a BindingHtmlContent entry from the controller's internal store of BindingHtmlContents.
    @param {String} key The key of the BindingHtmlContent entry to remove.
    @returns {Boolean}*/
    this.removeHtmlContent = function (key)
    {
        if (typeof key === "object") key = key.key;
        return removeCachedHtmlContent(key);
    };

    /**Binds an object to the DOM using some Html content that is inserted relative to a target element.
    @param {EVUI.Modules.Binding.Binding|EVUI.Modules.Binding.BindArgs|EVUI.Modules.Binding.BindingTemplate|String} bindingOrArgs Either: A YOLO Binding object, a YOLO BindArgs object, a YOLO BindingTemplate object, or the name of the BindingTemplate to use.
    @param {EVUI.Modules.Binding.BindArgs} bindArgsOrSource Either a YOLO BindArgs object or the source object to base the Binding off of.
    @param {EVUI.Modules.Binding.Constants.Fn_BindingCallback} callback A callback function that is fired when the Binding process completes.*/
    this.bind = function (bindingOrArgs, bindArgsOrSource, callback)
    {
        if (bindingOrArgs == null) throw Error("String or Object expected.");
        if (typeof bindArgsOrSource === "function" && typeof callback !== "function")
        {
            callback = bindArgsOrSource;
            bindArgsOrSource = null;
        }

        if (typeof callback !== "function") callback = function (binding) { };

        var bindingHandle = getBindingHandleAmbiguously(bindingOrArgs);
        if (bindingHandle == null)
        {
            throw Error("Failed to resolve binding.");
        }

        if (bindArgsOrSource == null) bindArgsOrSource = bindingOrArgs;
        triggerBind(bindingHandle, bindArgsOrSource, null, callback);
    };

    /**Awaitable. Binds an object to the DOM using some Html content that is inserted relative to a target element.
    @param {EVUI.Modules.Binding.Binding|EVUI.Modules.Binding.BindArgs|EVUI.Modules.Binding.BindingTemplate|String} bindingOrArgs Either: A YOLO Binding object, a YOLO BindArgs object, a YOLO BindingTemplate object, or the name of the BindingTemplate to use.
    @param {EVUI.Modules.Binding.BindArgs} bindArgsOrSource Either a YOLO BindArgs object or the source object to base the Binding off of.
    @returns {Promise<EVUI.Modules.Binding.Binding>}*/
    this.bindAsync = function (bindingOrArgs, bindArgsOrSource)
    {
        return new Promise(function (resolve)
        {
            _self.bind(bindingOrArgs, bindArgsOrSource, function (binding)
            {
                resolve(binding);
            });
        });
    };

    /**Adds a set of pre-configured options for Bindings to use that can be referenced by name.
    @param {EVUI.Modules.Binding.BindingTemplate} bindingTemplate A YOLO BindingTemplate object.
    @returns {EVUI.Modules.Binding.BindingTemplate}*/
    this.addBindingTemplate = function (bindingTemplate)
    {
        if (bindingTemplate == null || typeof bindingTemplate !== "object") throw Error("Object expected.");
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(bindingTemplate.templateName) === true) throw Error("BindingTemplate name must be a non-whitespace string.");

        var existing = getBindingTemplate(bindingTemplate.templateName);
        if (existing != null) throw Error("A BindingTemplate with the name \"" + bindingTemplate.templateName + "\" already exists.");

        var bindingTemplateEntry = new BindingTemplateEntry();
        bindingTemplateEntry.templateName = bindingTemplate.templateName;

        var bindingTemplate = makeBindingTemplate(bindingTemplate, null, bindingTemplateEntry);
        _bindingTemplates.push(bindingTemplate);

        return bindingTemplate;
    };

    /**Removes a BindingTemplate from the controller.
    @param {String} bindingTemplateName The name of the BindingTemplate to remove.
    @returns {Boolean} */
    this.removeBindingTemplate = function (bindingTemplateName)
    {
        if (bindingTemplateName == null) return false;
        if (typeof bindingTemplateName === "object") bindingTemplateName = bindingTemplateName.templateName;

        var existing = getBindingTemplate(bindingTemplateName);
        if (existing != null)
        {
            var index = _bindingTemplates.indexOf(existing);
            if (index !== -1)
            {
                _bindingTemplates.splice(x, 1);
                return true;
            }
        }

        return false;
    };

    /**Gets a BindingTemplate from the controller's internal store of BindingTemplates.
    @param {String|EVUI.Modules.Binding.Constants.Fn_SearchBindingTemplates} bindingNameOrSelector The string key or selector predicate to select the set of BindingHtmlContent to return.
    @param {Boolean} returnFirstMatch Whether or not to return the first successful match as soon as it is found. False by default.
    @returns {EVUI.Modules.Binding.BindingTemplate[]|EVUI.Modules.Binding.BindingTemplate} */
    this.getBindingTemplate = function (bindingNameOrSelector, returnFirstMatch)
    {
        var selectorType = typeof bindingNameOrSelector;
        if (selectorType !== "string" && selectorType !== "function") throw Error("String or function expected.");

        var numItems = _bindingTemplates.length;
        var listCopy = _bindingTemplates.slice();
        var matches = [];

        for (var x = 0; x < numItems; x++)
        {
            var curTemplate = listCopy[x];
            if (selectorType === "string")
            {
                if (curTemplate.templateName === bindingNameOrSelector) return curTemplate;
            }
            else
            {
                if (bindingNameOrSelector(curTemplate) === true)
                {
                    if (returnFirstMatch === true)
                    {
                        return curTemplate;
                    }
                    else
                    {
                        matches.push(curTemplate);
                    }
                }
            }
        }

        if (selectorType === "function" && returnFirstMatch !== true) return matches;

        return null;
    };

    /**Add an event listener to fire after an event with the same name has been executed.
    @param {String} eventName The name of the event in the EventStream to execute after.
    @param {EVUI.Modules.Binding.Constants.Fn_BindingEventHandler} handler The function to fire.
    @param {EVUI.Modules.EventStream.EventStreamEventListenerOptions} options Options for configuring the event.
    @returns {EVUI.Modules.EventStream.EventStreamEventListener}*/
    this.addEventListener = function (eventName, handler, options)
    {
        return _bubblingEvents.addEventListener(eventName, handler, options);
    };

    /**Removes an EventStreamEventListener based on its event name, its id, or its handling function.
    @param {String} eventNameOrId The name or ID of the event to remove.
    @param {Function} handler The handling function of the event to remove.
    @returns {Boolean}*/
    this.removeEventListener = function (eventNameOrId, handler)
    {
        return _bubblingEvents.removeEventListener(eventNameOrId, handler);
    };

    /**Event that fires immediately before the binding process begins.
    @type {EVUI.Modules.Binding.Constants.Fn_BindingEventHandler}*/
    this.onBind = null;

    /**Event that fires when the htmlContent for the binding has been obtained.
    @type {EVUI.Modules.Binding.Constants.Fn_BindingEventHandler}*/
    this.onSetHtmlContent = null;

    /**Event that fires when the htmlContent has been finalized and the bindings in the htmlContent
    @type {EVUI.Modules.Binding.Constants.Fn_BindingEventHandler}*/
    this.onSetBindings = null;

    /**Event that fires when the htmlContent has been populated with the values from the bound object.
    @type {EVUI.Modules.Binding.Constants.Fn_BindingEventHandler}*/
    this.onBindHtmlContent = null;

    /**Event that fires when the child bindings of the current binding have been found and are about to be bound.
    @type {EVUI.Modules.Binding.Constants.Fn_BindingEventHandler}*/
    this.onBindChildren = null;

    /**Event that fires when the htmlContent has been populated with the values from the bound object and has had all of its child bindings injected into it.
    @type {EVUI.Modules.Binding.Constants.Fn_BindingEventHandler}*/
    this.onChildrenBound = null;

    /**Event that fires when the binding operation is complete and the complete content and all its children has been injected.
    @type {EVUI.Modules.Binding.Constants.Fn_BindingEventHandler}*/
    this.onBound = null;

    /**Ensures that the required service dependencies from other modules are present for the Binder to do its job.*/
    var ensureServices = function ()
    {
        if (_services == null || typeof _services !== "object")
        {
            _services = new EVUI.Modules.Binding.BindingControllerServices();
        }

        if (_services.diffController == null || typeof _services.diffController !== "object")
        {
            _services.diffController = EVUI.Modules.Diff.Comparer;
        }

        if (_services.domTreeConverter == null || typeof _services.domTreeConverter !== "object")
        {
            _services.domTreeConverter = EVUI.Modules.DomTree.Converter;
        }

        if (_services.httpManager == null || typeof _services.httpManager !== "object") //because this is an optional dependency we make a special getter that is effectively a "lazy" load that won't crash if the dependency is missing
        {
            Object.defineProperty(_services, "httpManager", {
                get: function ()
                {
                    return EVUI.Modules.Http.Http;
                },
                configurable: false,
                enumerable: true
            })
        }
    };

    /********************************************************************BINDING EXECUTION*************************************************************************/

    /**Triggers the Binding disposal logic for the given BindingHandle and all its children.
    @param {BindingHandle} bindingHandle The BindingHandle to remove from the DOM and from it's parent Binding.
    @returns {Boolean}*/
    var triggerDispose = function (bindingHandle)
    {
        if (bindingHandle.disposing === true) return false;
        bindingHandle.disposing = true;
        bindingHandle.completionState = EVUI.Modules.Binding.BindingCompletionState.Disposed;

        //dispose of its children before disposing of it itself
        var numChildren = bindingHandle.currentState.childBindingHandles.length;
        var offset = 0;
        while (numChildren > 0)
        {
            var curChild = bindingHandle.currentState.childBindingHandles[offset];
            if (curChild.disposing === true || triggerDispose(curChild) === true) //the child removed itself from the parent list, so don't increment the index and reduce the child count
            {
                numChildren--;
                if (curChild.disposing === true) offset++;
            }
        }

        //only dispose if the binding isn't in the middle of doing something.
        if (bindingHandle.progressState === EVUI.Modules.Binding.BindingProgressStateFlags.Idle)
        {
            disposeBinding(bindingHandle);
            return true;
        }
        else
        {
            return false;
        }
    };

    /**Disposes of a single BindingHandle; removes its DOM Nodes from the DOM, removes its states and event handlers, removes it from it's parent's binding list, and effectively resets the binding to a blank state.
    @param {BindingHandle} bindingHandle The BindingHandle to dispose of.*/
    var disposeBinding = function (bindingHandle)
    {
        //don't re-dispose if already disposing
        if (bindingHandle.disposing === false) return;

        //flush old states
        bindingHandle.oldState = null;
        bindingHandle.pendingState = null;

        //remove all existing content that's attached to the DOM
        var numBoundContent = (bindingHandle.currentState.boundContent != null) ? bindingHandle.currentState.boundContent.length : 0;
        for (var x = 0; x < numBoundContent; x++)
        {
            var curContent = bindingHandle.currentState.boundContent[x];
            if (curContent.isConnected === true)
            {
                curContent.remove();
            }
        }

        //disconnect and remove from parent if it has a parent binding handle
        if (bindingHandle.currentState.parentBindingHandle != null)
        {
            var parentIndex = bindingHandle.currentState.parentBindingHandle.currentState.childBindingHandles.indexOf(bindingHandle);
            if (parentIndex !== -1)
            {
                bindingHandle.currentState.parentBindingHandle.currentState.childBindingHandles.splice(parentIndex, 1);
            }

            //if we had an array, the element is always the previous element's last bound content in the array, so we never want to remove it.
            if (EVUI.Modules.Core.Utils.isArray(bindingHandle.currentState.parentBindingHandle.currentState.source) === false)
            {
                //if it was a child of a parent, the element would have been contained by the parent and should be removed.
                bindingHandle.currentState.element.remove();
            }
        }

        //remove all of the events associated with this binding, otherwise a memory leak is created
        disposeBindingDispatchHandles(bindingHandle);

        bindingHandle.dispatchHandles = [];

        //reset all bindingHandle properties
        bindingHandle.newStateBound = false;
        bindingHandle.oldStateBound = false;
        bindingHandle.progressState = EVUI.Modules.Binding.BindingProgressStateFlags.Idle;
        bindingHandle.templateName = null;

        //make a new state
        bindingHandle.currentState = new BindingHandleState();

        //unset the disposing flag
        bindingHandle.disposing = false;
    };

    /**Disposes of all the BindingDispatchHandles associated with a BindingHandle.
    @param {BindingHandle} bindingHandle The BindingHandle to purge the BindingDispatchHandles from*/
    var disposeBindingDispatchHandles = function (bindingHandle)
    {
        var numEventBindings = bindingHandle.dispatchHandles.length;
        for (var x = 0; x < numEventBindings; x++)
        {
            bindingHandle.dispatchHandles[x].dispose();
        }
    };

    /**Triggers the full binding process for a BindingHandle and all of its children, forcing the entire hierarchy to be re-evaluated.
    @param {BindingHandle} bindingHandle The BindingHandle to execute.
    @param {EVUI.Modules.Binding.BindArgs} bindArgsOrSource Either the BindArgs or source object passed in from the bind or bindAsync calls.
    @param {BindingSession} parentSession The parent BindingSession to this BindingSession.
    @param {EVUI.Modules.Binding.Constants.Fn_BindingCallback} callback A callback function to call once the binding process is complete.*/
    var triggerBind = function (bindingHandle, bindArgsOrSource, parentSession, callback)
    {
        var bindArgsType = typeof bindArgsOrSource;
        var callbackType = typeof callback;
        var bindArgs = new EVUI.Modules.Binding.BindArgs();

        var elementBindingState = bindingHandle.currentState;
        var sourceBindingState = bindingHandle.currentState;

        if (bindArgsType === "function") //we have no bind args
        {
            if (typeof callback !== "function") callback = bindArgsOrSource;
        }
        else if (bindArgsType === "object" && bindArgsOrSource != null)
        {
            if (EVUI.Modules.Core.Utils.instanceOf(bindArgsOrSource, EVUI.Modules.Binding.BindArgs) === false)
            {
                var bindingSource = (bindArgsOrSource.source != null) ? bindArgsOrSource.source : bindArgsOrSource.bindingSource;
                var ele = (bindArgsOrSource.element != null) ? bindArgsOrSource.element : bindArgsOrSource.bindingTarget;
                var context = bindArgsOrSource.bindingContext;

                if (ele === undefined && bindingSource === undefined && context === undefined) //did not have any property, use it as the source object by itself
                {
                    bindArgs.bindingSource = bindArgsOrSource;
                }
                else //had at least one property
                {
                    if (bindingSource !== undefined) bindArgs.bindingSource = bindingSource; //we have a binding source

                    var extracted = getValidElement(ele);
                    if (extracted != null) bindArgs.bindingTarget = extracted; //we have a target
                    if (context !== undefined) bindArgs.bindingContext = context;
                }

                bindArgs.bindingContext = bindArgsOrSource.bindingContext;
            }
            else //was already an instance, just clone it
            {
                bindArgs = EVUI.Modules.Core.Utils.shallowExtend(bindArgs, bindArgsOrSource);
            }
        }

        if (bindingHandle.pendingState != null && bindingHandle.pendingState.elementSet === true) elementBindingState = bindingHandle.pendingState; //if we set the pending state for the element, use them
        if (bindingHandle.pendingState != null && bindingHandle.pendingState.sourceSet === true) sourceBindingState = bindingHandle.pendingState; //if we set the pending state for the source, use them

        if (bindArgs.bindingTarget == null) //target was not set, fall back to the old state if it was valid
        {
            if (elementBindingState === bindingHandle.currentState && elementBindingState.element == null && elementBindingState.elementSet === false)
            {
                if (bindingHandle.oldState != null && bindingHandle.oldState.elementSet === true) bindArgs.bindingTarget = bindingHandle.oldState.element;
            }
            else //if it's not the current state, it was the pending state
            {
                bindArgs.bindingTarget = elementBindingState.element;
            }
        }

        if (bindArgs.bindingSource == null) //source was not set, fall back to the old state if it was valid
        {
            if (sourceBindingState === bindingHandle.currentState && elementBindingState.source == null && elementBindingState.sourceSet === false)
            {
                if (bindingHandle.oldState != null && bindingHandle.oldState.sourceSet === true) bindArgs.bindingSource = bindingHandle.oldState.source;
            }
            else  //if it's not the current state, it was the pending state
            {
                bindArgs.bindingSource = sourceBindingState.source;
            }
        }

        if (callbackType !== "function") callback = function (binding) { };

        var session = new BindingSession(); //make the new session to hold all the info about the Binding operation
        session.bindingArgs = bindArgs;
        session.bindingHandle = bindingHandle;
        session.parentSession = parentSession;
        session.sessionMode = BindingSessionMode.Bind;

        if (parentSession != null) //if we have a parent session, register this as a child session of that parent.
        {
            parentSession.childSessions.push(session);
            if (parentSession.bindingHandle.oldStateBound === false) session.maintainCurrentState = true;

            if (parentSession.context != null) //apply the context rules if needed
            {
                if (parentSession.bindingHandle.binding.options.shareContextMode === EVUI.Modules.Binding.ShareContextMode.Clone)
                {
                    if (typeof parentSession.context === "object")
                    {
                        session.context = EVUI.Modules.Core.Utils.shallowExtend(session.context, parentSession.context);
                    }
                    else
                    {
                        session.context = parentSession.context;
                    }
                }
                else if (parentSession.bindingHandle.binding.options.shareContextMode === EVUI.Modules.Binding.ShareContextMode.ShareReference)
                {
                    session.context = parentSession.context;
                }
            }
        }
        else
        {
            session.context = session.bindingArgs.bindingContext;
        }

        //make a container to hold this binding's callback to ensure it gets called eventually by this or another (subsequent) binding
        var callbackEntry = new BindingCallbackEntry();
        callbackEntry.session = session;
        callbackEntry.callback = callback;
        callbackEntry.id = _callbackCounter++;

        session.callbacks.push(callbackEntry);

        //build all the events/jobs for the event stream
        buildEventStream(session);

        //register session with the controller
        var sessionIndex = _bindingSessions.push(session);

        //and add the job to the batching logic
        batchJobs(session, null, sessionIndex - 1);
    };

    /**Triggers the update process for a BindingHandle and all of its changed children, which only requires what has changed to re-evaluate itself.
    @param {BindingHandle} bindingHandle The BindingHandle to trigger the update process on.
    @param {EVUI.Modules.Binding.UpdateArgs} updateArgs The arguments passed into the update operation.
    @param {BindingSession} parentSession The parent BindingSession to this BindingSession.
    @param {EVUI.Modules.Binding.Constants.Fn_BindingCallback} callback  A callback function to call once the update process is complete.*/
    var triggerUpdate = function (bindingHandle, updateArgs, parentSession, callback)
    {
        if (typeof updateArgs === "function" && callback == null)
        {
            callback = updateArgs;
            updateArgs = null;
        }

        if (typeof callback !== "function") callback = function (session) { };

        //make a new binding session for the update session
        var session = new BindingSession();

        //make some dummy "bind args" to hold any new information about the binding to be updated.
        session.bindingArgs = new EVUI.Modules.Binding.BindArgs();
        session.bindingArgs.bindingSource = (bindingHandle.pendingState != null && bindingHandle.pendingState.sourceSet === true) ? bindingHandle.pendingState.source : bindingHandle.currentState.source;
        session.bindingArgs.bindingTarget = (bindingHandle.pendingState != null && bindingHandle.pendingState.elementSet === true) ? bindingHandle.pendingState.element : bindingHandle.currentState.element;

        if (updateArgs != null && typeof updateArgs === "object") //if we have a update args object, see if it has any properties we can use
        {
            if (updateArgs.bindingSource === undefined && updateArgs.bindingContext === undefined) //it does not, so it can be used as the source object
            {
                session.bindingArgs.bindingSource = updateArgs;
            }
            else //it does - use the properties
            {
                if (updateArgs.bindingSource !== undefined) session.bindingArgs.bindingSource = updateArgs.bindingSource;
                if (updateArgs.bindingContext !== undefined) session.bindingArgs.bindingContext = updateArgs.bindingContext;
            }
        }

        session.bindingHandle = bindingHandle;
        session.parentSession = parentSession;
        session.sessionMode = BindingSessionMode.Update;

        //if we were canceled after calculating the differences between the two objects, force a re-bind instead of doing the update logic. This will be slower, but it will get things back in sync with whatever changed.
        if (session.bindingHandle.canceledDuringReBind === true) session.sessionMode = BindingSessionMode.Bind;

        if (parentSession != null) //if we have a parent session, register this as a child session of that parent.
        {
            parentSession.childSessions.push(session);
            if (parentSession.bindingHandle.oldStateBound === false) session.maintainCurrentState = true;

            if (parentSession.context != null)  //apply the context rules if needed
            {
                if (parentSession.bindingHandle.binding.options.shareContextMode === EVUI.Modules.Binding.ShareContextMode.Clone)
                {
                    if (typeof parentSession.context === "object")
                    {
                        session.context = EVUI.Modules.Core.Utils.shallowExtend(session.context, parentSession.context);
                    }
                    else
                    {
                        session.context = parentSession.context;
                    }
                }
                else if (parentSession.bindingHandle.binding.options.shareContextMode === EVUI.Modules.Binding.ShareContextMode.ShareReference)
                {
                    session.context = parentSession.context;
                }
            }
        }
        else
        {
            session.context = session.bindingArgs.bindingContext;
        }

        //make a container to hold this binding's callback to ensure it gets called eventually by this or another (subsequent) binding
        var callbackEntry = new BindingCallbackEntry();
        callbackEntry.session = session;
        callbackEntry.callback = callback;
        callbackEntry.id = _callbackCounter++;

        session.callbacks.push(callbackEntry);

        //build all the events/jobs for the event stream
        buildEventStream(session);

        //register session with the controller
        var sessionIndex = _bindingSessions.push(session);

        //and add the job to the batching logic
        batchJobs(session, null, sessionIndex - 1);
    };
   

    /**Batches jobs so that the checks to ensure that no race conditions occur only operate on a small array and not a gigantic one.
    @param {BindingSession} session The session to either execute or queue to be batched.
    @param {BindingSessionBatch} parentBatch The batch that is the parent of this current batch.*/
    var batchJobs = function (session, parentBatch, sessionsIndex, recursiveCall)
    {
        /**This function is solving the hellish problem of batching recursive bindings. The idea behind the batches was that we make sure only a certain set can go at a time so the cross-check 
         * that prevents the same binding from being executed twice/the same element having two bindings fight over it. The bigger the batch is, the slower that cross check becomes, so we break
         * it up into little chunks that go one at a time. The problem is that the batches go as sets of racing async processes that advance to the next batch only when all have completed their
         * jobs - but since bindings can have children or grandchildren, it's possible for a child to wind up in a subsequent batch to its parent - the parent binding will wait for the child to  
         * finish before it marks itself as finished, but the child is never launched because it's batch isn't up for execution - this causes a deadlock and the entire Binder freezes forever. So,
         * to fix this problem, we recursively launch child batches when the session has a parent session that run in "parallel" - when the parent pauses to wait for its child (i.e. enters the deadlock), 
         * that opens up a gap on the page's thread where the child batch can execute. The child eventually finishes, which lets the parent finish. However, a parent can have multiple child batches, 
         * each of which can have its own children, so we wind up with a "saw-tooth" like pattern where we have horizontal queues stemming from vertical recursion stacks, all going at the same time, with each 
         * deadlock opening a gap for another batch to slide in. Sometimes in very, very deep recusion for a huge set of bindings it STILL breaks sometimes - se we add a failsafe timeout to poke
         * the batching mechanism and force it to keep going if we get deep into that recursion scenario, but that mechanism has a flaw where its possible for the batch closed over in the timeout
         * in to have more child batches that might get missed. We don't need to worry about cross-chcecking for collisions between parent and child batches - any collision is a bug in the Binder
         * and not user input spam - we still check the child batches against themselves but the odds of a collision are extremely low.
         * 
         * 
         * 
         * Honestly, this should be redone (again) to be less zany - but this works for now.*/

        //get our list of sessions from either the global list or the parent batch
        var sessions = null;
        if (parentBatch == null)
        {
            sessions = _bindingSessions;
        }
        else
        {
            sessions = parentBatch.childSessionQueue;
        }

        var numSessions = sessions.length;

        //callback to keep getting batches until we run out of sessions
        var executeBatchCallback = function (finishedBatch)
        {
            //this batch is done, remove it from global tracker
            delete _batches[finishedBatch.id];
            _batches.numBatches--;

            //get the next batch from the finished batch's list of children
            var nextBatch = finishedBatch.getNextChildBatch();
            if (nextBatch == null || nextBatch.sessions.length === 0) //did not get a child batch. A parent batch could be waiting on the child to finish, so walk backwards up the hierarchy until we can get a valid batch
            {
                var curBatch = finishedBatch;
                while (curBatch.parentBatch != null)
                {
                    curBatch = curBatch.parentBatch;
                    nextBatch = curBatch.getNextChildBatch();
                    if (nextBatch != null && nextBatch.numSessions > 0) break;  //found a waiting batch in the parent, execute it.
                }

                if (nextBatch == null || nextBatch.numSessions === 0) nextBatch = getNextBatch(); //if we didn't get a batch from any of the parent, get one from the global list
                if (nextBatch == null || nextBatch.numSessions === 0) return; //no batch from global list either, we are done.
            }

            //register and execute next batch
            _batches[nextBatch.id] = nextBatch;
            _batches.numBatches++;

            nextBatch.execute(executeBatchCallback);
        }

        //if we have more sessions than the maximum batch size in the sessions list and we are either recursing with a parent batch or on the top level with no batches executing, make and launch a new batch
        if (numSessions > _maxBatch && (parentBatch != null || _batches.numBatches === 0)) 
        {
            var batch = null;
            if (parentBatch == null) //no parent, working with global sessions list
            {
                //remove all the current sessions (which are already queued and/or in progress) from the sessions list
                sessions.splice(0, _maxBatch);
                batch = getNextBatch();
            }
            else //getting a list of sessions from the parent batch
            {
                batch = parentBatch.getNextChildBatch();
            }

            //add the batch to our global batch tracker
            _batches[batch.id] = batch;
            _batches.numBatches++;

            if (_batches.finalBatchTimeoutId !== -1) clearTimeout(_batches.finalBatchTimeoutId);

            //kick off the batched binding process            
            return batch.execute(executeBatchCallback);

        }
        else //we have no batch or are under the batch threshold, we have to do some special logic here to keep recursive bindings from deadlocking - otherwise we just launch the batch as normal
        {
            //if we have a current batch going, make sure the child isn't waiting on the parent batch to complete before it starts (this is the deadlock source)
            if (_batches.numBatches > 0)
            {
                if (session.parentSession != null) //we have a parent session, the deadlock scenario is possible
                {
                    var curParentBatch = _batches[session.parentSession.batchId];
                    if (curParentBatch != null) //the child is waiting on the parent's batch, this will deadlock without setting up a parallel execution session
                    {
                        if (typeof sessionsIndex === "number" && recursiveCall !== true) _bindingSessions.splice(sessionsIndex, 1); //remove from global list if it was in there, this prevents it from getting grabbed by two batches at the same time
                        if (session.batchId === -1 && recursiveCall !== true) //if we already have this in the queue, don't add it again. Otherwise add it and check the parent's batch to see if it's ready for execution
                        {
                            var sessionIndex = curParentBatch.childSessionQueue.push(session);

                            //add a "failsafe" to poke the batching logic - its possible in a deep recursion batching scenario that straggling bind orders get queued but never executed, which also results in a deadlock
                            if (_batches.finalBatchTimeoutId === -1) 
                            {
                                _batches.finalBatchTimeoutId = setTimeout(function ()
                                {
                                    _batches.finalBatchTimeoutId = -1;

                                    executeBatchCallback(curParentBatch); //we basically tell it to launch another parallel batch from the recursion stack if possible - the parent batch will recursively poke its parents all the way up to the global list, which is enough of a poke to keep the binder from deadlocking
                                });
                            }

                            return batchJobs(session, curParentBatch, sessionIndex - 1, true); //trigger the batching logic for the parent batch
                        }
                        else //either we are a recursive batch call (in which case it sits in the queue) or the session is already batched, in which case it also just sits in the queue
                        {
                            return;
                        }
                    }
                    else //if we have a parent session, but that session has no batch, then it came from the global list (which this session is already in) so we can let it sit in the queue to be picked up by the batch finishing
                    {
                        return; 
                    }
                }
                else //a batch is running, but we have no parent so a recursion deadlock isnt possible AND we are under the batch threshold, so execute away
                {
                    return executeSession(session);
                }
            }
            else //zero batches executing and we are under the batch threshold, execute away
            {
                return executeSession(session);
            }
        }
    };

    /**Gets the next BindingSessionBatch of BindingSessions.
    @returns {BindingSessionBatch}*/
    var getNextBatch = function ()
    {
        //make a new batch and take up to the maximum amount of children to process.
        var batch = new BindingSessionBatch();
        batch.sessions = _bindingSessions.splice(0, _maxBatch);
        batch.numSessions = batch.sessions.length;

        return batch;
    };

    /**Gets all the sessions that are operating with either the same binding or on the same reference element. Helps detect race conditions and enforces the rule that only one binding can execute on an element at a time.
    @param {BindingSession} newSession The new BindingSession to check against the existing binding sessions that are being executed.
    @returns {BindingSessionMatch[]} */
    var getMatchingSessions = function (newSession)
    {
        var matches = [];

        var sessionArray = newSession.batchId < 0 ? _bindingSessions : _batches[newSession.batchId].sessions;
        var numSessions = sessionArray.length;
        for (var x = 0; x < numSessions; x++)
        {
            var curSession = sessionArray[x];

            if (curSession.sessionId !== newSession.sessionId)
            {
                var match = compareSessions(newSession, curSession);
                if (match != null)
                {
                    matches.push(match);
                }
            }
        }

        return matches;
    };

    /**Compares two sessions to determine if they could possibly cause a race condition if executed in the same batch.
    @param {BindingSession} currentSesison The current BindingSession that is about to be executed.
    @param {BindingSession} otherSession A different executing or queued BindingSession to compare against.
    @returns {BindingSessionMatch}*/
    var compareSessions = function (currentSession, otherSession)
    {
        var match = null;
        var flags = BindingSessionMatchTypeFlags.None;

        if (otherSession.bindingHandle.id === currentSession.bindingHandle.id) //same binding in different sessions, only one can go at a time
        {
            flags |= BindingSessionMatchTypeFlags.SameBinding;
        }

        if (currentSession.bindingArgs.bindingTarget != null && currentSession.bindingArgs.bindingTarget === otherSession.bindingArgs.bindingTarget) //same element used by two different bindings, only one can use the same element at a time
        {
            if (isFirstArrayElementOf(currentSession, otherSession) === false && isFirstArrayElementOf(otherSession, currentSession) === false) //test against the edge case where the first element in an array has the same element as its parent Binding
            {
                flags |= BindingSessionMatchTypeFlags.SameElement;
            }
        }

        if (flags > 0) //if either case was true, return a match
        {
            var match = new BindingSessionMatch();
            match.session = otherSession;
            match.flags = flags;

            return match;
        }

        return null;
    };

    /**Determines if the two sessions meet the criteria for the edge case where the first element of a bound array matches the element of its parent binding. Only applies to arrays that are being bound for the second time.
    @param {BindingSession} session1 A BindingSession to check.
    @param {BindingSession} session2 The other BindingSession to check.
    @returns {Boolean}*/
    var isFirstArrayElementOf = function (session1, session2)
    {
        if (session1.parentSession != null) //check the case where session1 is the parent of session2 and session2 is the first child of session1.
        {
            if (session1.parentSession.isArray === false) return false;
            if (session1.parentSession.bindingHandle.oldStateBound === false) return false;
            if (session1.parentSession.bindingHandle.oldState.childBindingHandles.length === 0) return false;
            if (session1.parentSession.bindingHandle.oldState.childBindingHandles[0].id === session2.bindingHandle.id)
            {
                return true;
            }
        }
        else if (session1.isArray === true) //check the case where session2 is the first child of session 1's bound array
        {
            if (session1.bindingHandle.oldStateBound === false) return false;
            if (session1.bindingHandle.oldState.childBindingHandles.length === 0) return false;
            if (session1.bindingHandle.oldState.childBindingHandles[0].id === session2.bindingHandle.id)
            {
                return true;
            }
        }

        return false;
    };

    /**First step in the binding process. Stores the current (soon to be old) state and makes a new state to hold the information about the binding in progress.
    @param {BindingSession} session The BindingSession that is in the process of being bound.*/
    var swapStates = function (session)
    {
        if (session.maintainCurrentState === true) //this is binding is a new child binding of a parent session who has not yet been bound
        {
            session.isArray = EVUI.Modules.Core.Utils.isArray(session.bindingHandle.currentState.source);
            session.maintainCurrentState = false;
            return;
        }

        var newState = new BindingHandleState();

        if (session.bindingHandle.pendingState != null) //if we have a pending state, apply it to the current state
        {
            var pending = session.bindingHandle.pendingState;
            if (pending.normalizedPath != null) newState.normalizedPath = pending.normalizedPath;
            if (pending.parentBindingHandle != null) newState.parentBindingHandle = pending.parentBindingHandle;
            if (pending.parentBindingKey != null) newState.parentBindingKey = pending.parentBindingKey;
            if (pending.parentBindingPath != null) newState.parentBindingPath = pending.parentBindingPath;
        }
        else if (session.bindingHandle.currentState != null && session.bindingHandle.newStateBound === true) //if we don't have a pending state, but are re-binding, maintain the link between the parent and child bindings
        {
            EVUI.Modules.Core.Utils.shallowExtend(newState, session.bindingHandle.currentState, ["stateId", "boundContent", "boundProperties", "childBindingHandles", "sourceSet", "htmlContentSet", "elementSet", "sourceObserver", "element"]);
            if (session.bindingHandle.currentState.boundContent != null) newState.boundContent = session.bindingHandle.currentState.boundContent.slice();
            if (session.bindingHandle.currentState.boundProperties != null) newState.boundProperties = session.bindingHandle.currentState.boundProperties.slice();
        }

        //the bindingArgs have been normalized up to this point and are guaranteed to have the actual values to use when we get to this step regardless if the user used a binding args object or not.
        newState.element = session.bindingArgs.bindingTarget;
        newState.source = session.bindingArgs.bindingSource;

        //get the correct html content for the new state from wherever it was set last.
        if (session.bindingHandle.pendingState != null && session.bindingHandle.pendingState.htmlContentSet === true)
        {
            newState.htmlContent = session.bindingHandle.pendingState.htmlContent;
        }
        else if (session.bindingHandle.currentState.htmlContentSet === true)
        {
            newState.htmlContent = session.bindingHandle.currentState.htmlContent;
        }
        else if (session.bindingHandle.oldState != null && session.bindingHandle.oldState.htmlContentSet === true)
        {
            newState.htmlContent = session.bindingHandle.oldState.htmlContent;
        }
        else
        {
            newState.htmlContent = session.bindingHandle.currentState.htmlContent;
        }

        //remember the old state to use to roll back to in the event of a cancel operation.
        session.rollbackState = session.bindingHandle.oldState;
        session.rollbackPendingState = session.bindingHandle.pendingState;
        session.rollbackStateBound = session.bindingHandle.oldStateBound;

        //swap the states and set the flags for whether or not the current and old states have been bound
        session.bindingHandle.oldState = session.bindingHandle.currentState;
        session.bindingHandle.currentState = newState;
        session.bindingHandle.pendingState = null;
        session.bindingHandle.oldStateBound = session.bindingHandle.newStateBound;
        session.bindingHandle.newStateBound = false;
        session.isArray = EVUI.Modules.Core.Utils.isArray(newState.source);

        //assign the parent if there was one
        if (session.parentSession != null)
        {
            session.bindingHandle.currentState.parentBindingHandle = session.parentSession.bindingHandle;
        }

        session.bindingHandle.completionState = EVUI.Modules.Binding.BindingCompletionState.Executing;
    };

    /**In the event that a binding operation was canceled, this reverts the BindingHandle back to its previous state so that the same operation can be tried again without corrupting the state.
    @param {BindingSession} session The session that was canceled.*/
    var rollBackStates = function (session)
    {
        if (EVUI.Modules.Core.Utils.hasFlag(session.bindingHandle.progressState, EVUI.Modules.Binding.BindingProgressStateFlags.Injected) === true) return; //can't roll back states after the binding operation is complete

        if (session.bindingHandle.oldState != null)
        {
            //restore the current state to be the old state
            session.bindingHandle.currentState = session.bindingHandle.oldState;
            session.bindingHandle.newStateBound = session.bindingHandle.oldStateBound;
        }

        //if there was an old state prior to the operation beginning, restore it as well
        if (session.rollbackState != null)
        {
            session.bindingHandle.oldState = session.rollbackState;
            session.bindingHandle.oldStateBound = true;
        }

        //if there was a pending state, restore that as well
        session.bindingHandle.pendingState = session.rollbackPendingState;

        //if we have passed the "got htmlContent" step, we have calculated the diffs for a re-bind and may not be able to detect those same diffs again.
        if (EVUI.Modules.Core.Utils.hasFlag(session.bindingHandle.progressState, EVUI.Modules.Binding.BindingProgressStateFlags.GotHtmlContent) === true && session.shouldReBind === true)
        {
            session.bindingHandle.canceledDuringReBind = true;
        }

        //the htmlContent was bound, which means we set the dispatch handles to their new values, so we need to restore them back to their original values.
        if (EVUI.Modules.Core.Utils.hasFlag(session.bindingHandle.progressState, EVUI.Modules.Binding.BindingProgressStateFlags.GotBoundProperties) === true)
        {
            var numCurHandles = session.bindingHandle.dispatchHandles.length;
            var numRollbackHandles = session.rollbackDispatchHandles.length;
            for (var x = 0; x < numRollbackHandles; x++)
            {
                var curHandle = session.rollbackDispatchHandles[x];

                //re-set the reference in the invocation dictionary so the old handler is called
                _invocationDictionary[curHandle.hashKey] = curHandle;

                //then go re-set the reference in the dispatch handles array
                for (var y = 0; y < numCurHandles; y++)
                {
                    var curExisting = session.bindingHandle.dispatchHandles[y];
                    if (curExisting.hashKey === curHandle.hashKey)
                    {
                        session.bindingHandle.dispatchHandles[y] = curHandle;
                        break;
                    }
                }
            }
        }
    };

    /**Executes the event stream backing the BindingSession, thus beginning the binding process.
    @param {BindingSession} session The BindingSession to execute. */
    var executeSession = function (session)
    {
        session.bindingHandle.progressState = EVUI.Modules.Binding.BindingProgressStateFlags.Queued; //set the status from idle to queued (the binding starts asynchronously)
        session.bindingHandle.completionState = EVUI.Modules.Binding.BindingCompletionState.Queued;

        session.bindingArgs.bindingTarget = getValidElement(session.bindingArgs.bindingTarget); //make sure we have a valid element to work with
        if (typeof session.bindingArgs.bindingTarget === "string") //if we have a CSS selector go find the element it's referring to.
        {
            var eh = null;
            if (session.bindingHandle.binding.parentBinding != null && session.bindingHandle.options.scopedCSSSelectors !== false) //if we're a child binding and are using scoped selectors, look inside the parent for the element
            {
                eh = new EVUI.Modules.Dom.DomHelper(session.bindingArgs.bindingTarget, session.bindingHandle.binding.parentBinding.boundContentFragment);
            }
            else //otherwise look in the whole document.
            {
                eh = new EVUI.Modules.Dom.DomHelper(session.bindingArgs.bindingTarget);
            }

            session.bindingArgs.bindingTarget = eh.elements[0];
        }

        //if we have no element to act as the binding target, set it to be a document fragment as a placeholder.
        //if (session.bindingArgs.bindingTarget == null) session.bindingArgs.bindingTarget = document.createDocumentFragment();

        //figure out if any sessions will race with this one to update the same binding or element
        var matchingSessions = getMatchingSessions(session);

        //cancel every existing session and move it's callback stack into the current binding (i.e. "last touch wins" rule, the last binding to use an element is the one that gets to go and the previous ones get canceled)
        var numMatches = matchingSessions.length;
        for (var x = 0; x < numMatches; x++)
        {
            var curMatch = matchingSessions[x];
            if (curMatch.session.cancel === false)
            {
                //move the callbacks from the old session into the new one which ensures that the bindings won't complete until the one that actually executes completes.
                session.callbacks = curMatch.session.callbacks.concat(session.callbacks);

                //flag the match as canceled (the next step will cancel it - we can't just cancel the event streams because it may have not started yet)
                curMatch.session.cancel = true;

                //remove the old callback stack
                curMatch.session.callbacks = [];
            }
        }

        //kick off the binding process
        session.eventStream.execute();
    };

    /**Builds the EventStream that will execute the BindingProcess
    @param {BindingSession} session The BindingSession to build the EventStream for.*/
    var buildEventStream = function (session)
    {
        session.eventStream = new EVUI.Modules.EventStream.EventStream();
        session.eventStream.eventState = session.context;
        session.eventStream.bubblingEvents = _bubblingEvents;
        session.eventStream.context = session.bindingHandle.binding;

        //set up the factory to create the biding event args
        session.eventStream.processInjectedEventArgs = function (eventStreamArgs)
        {
            var bindingArgs = new EVUI.Modules.Binding.BinderEventArgs(session);
            bindingArgs.cancel = eventStreamArgs.cancel;
            bindingArgs.context = eventStreamArgs.state;
            bindingArgs.key = eventStreamArgs.key;
            bindingArgs.pause = eventStreamArgs.pause;
            bindingArgs.resume = eventStreamArgs.resume;
            bindingArgs.stopPropagation = eventStreamArgs.stopPropagation;

            return bindingArgs;
        };

        //set up the handler that will ensure that any state set in the event args carries over between events
        session.eventStream.processReturnedEventArgs = function (eventStreamArgs)
        {
            session.eventStream.eventState = eventStreamArgs.context;
        };

        //make sure both cancel and error cancel all children if a parent fails and then fast-forward to the final callback execution/clean up step
        session.eventStream.onCancel = function (eventStreamArgs)
        {
            session.bindingHandle.completionState = EVUI.Modules.Binding.BindingCompletionState.Canceled;
            rollBackStates(session); //roll back to the previous completed state
            cancelAllChildren(session); //tell all children to cancel themselves on their next step
            session.eventStream.seek("finishBinding");
        };

        session.eventStream.onError = function (eventStreamArgs, ex)
        {
            session.bindingHandle.completionState = EVUI.Modules.Binding.BindingCompletionState.Failed;
            rollBackStates(session); //roll back to the previous completed state
            cancelAllChildren(session); //tell all children to cancel themselves on their next step
            session.eventStream.seek("finishBinding");
        };

        //add all the steps for the event stream to function
        addOnBindSteps(session);
        addOnSetHtmlContentSteps(session);
        addonSetBindingsSteps(session);
        addOnBindHtmlContentSteps(session);
        addOnBindChildrenSteps(session);
        addProcessChildrenSteps(session);
        addOnChildrenBoundSteps(session);
        addInjectMergeSteps(session);
        addFinalStep(session);
    };

    /**Triggers the onBind events and then performs the state swap that begins the binding process.
    @param {BindingSession} session The BindingSession being executed.*/
    var addOnBindSteps = function (session)
    {
        if (session.bindingHandle.currentState.parentBindingHandle != null && session.bindingHandle.currentState.parentBindingHandle.options.suppressChildEvents === true) //no child events, just fire the onBindJob step
        {
            session.eventStream.addJob(EVUI.Modules.Binding.Constants.Event_OnBind, "bindBegin", function (jobArgs)
            {
                onBindJob(session, jobArgs);
            });            
        }
        else
        {
            session.eventStream.addJob(EVUI.Modules.Binding.Constants.Event_OnBind, "bindBegin", function (jobArgs)
            {
                onBindJob(session, jobArgs);
            });

            //otherwise we do the first two events before modifying anything and the once those have passed we modify the state into 
            session.eventStream.addEvent(EVUI.Modules.Binding.Constants.Event_OnBind, "onBind", function (eventArgs)
            {
                if (validateSession(session, eventArgs) === false) return;
                if (typeof session.bindingHandle.binding.onBind === "function")
                {
                    eventArgs.reBinding = session.bindingHandle.newStateBound; //we haven't swapped the states yet, so we set these to the values they would be after the swap.
                    if (eventArgs.reBinding === true)
                    {
                        eventArgs.originalContent = (session.bindingHandle.currentState != null && session.bindingHandle.currentState.boundContent != null) ? session.bindingHandle.currentState.boundContent.slice() : null;
                        eventArgs.originalSource = (session.bindingHandle.currentState != null) ? session.bindingHandle.currentState.source : null;
                    }

                    return session.bindingHandle.binding.onBind(eventArgs);
                }
            });

            session.eventStream.addEvent(EVUI.Modules.Binding.Constants.Event_OnBind, "onBind", function (eventArgs)
            {
                if (validateSession(session, eventArgs) === false) return;

                if (typeof _self.onBind === "function")
                {
                    eventArgs.reBinding = session.bindingHandle.newStateBound; //we haven't swapped the states yet, so we set these to the values they would be after the swap.
                    if (eventArgs.reBinding === true)
                    {
                        eventArgs.originalContent = (session.bindingHandle.currentState != null && session.bindingHandle.currentState.boundContent != null) ? session.bindingHandle.currentState.boundContent.slice() : null;
                        eventArgs.originalSource = (session.bindingHandle.currentState != null) ? session.bindingHandle.currentState.source : null;
                    }

                    return _self.onBind(eventArgs);
                }
            });        


        }
    };

    /**Job that executes after the onBind events have been executed. Swaps out the current state and turns it into the old state while generating a new state to hold the data for the binding process going forward.
    @param {BindingSession} session The BindingSession being executed.
    @param {EVUI.Modules.EventStream.EventStreamJobArgs} jobArgs The JobArgs for the operation.*/
    var onBindJob = function (session, jobArgs)
    {
        if (session.cancel === true || session.bindingHandle.disposing === true) return jobArgs.cancel();

        //flip the states so that we have a new state to populate and that the current state becomes the old state.
        swapStates(session);

        if (validateSession(session, jobArgs) == false) return jobArgs.resolve();
        if (session.bindingHandle.currentState.source == null)
        {
            var parentPath = "Parent object path: " + ((EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(session.bindingHandle.currentState.parentBindingPath) === true) ? "root." : "root." + session.bindingHandle.currentState.parentBindingPath + ".");
            triggerDispose(session.bindingHandle);            

            return jobArgs.reject("Cannot bind a null reference. " + parentPath);
        }

        jobArgs.resolve();
    };

    /**Adds the steps that resolve the htmlContent used to perform the data binding operation.
    @param {BindingSession} session The BindingSession being executed.*/
    var addOnSetHtmlContentSteps = function (session)
    {
        //get the htmlContent so that it can be edited in the next steps
        session.eventStream.addJob(EVUI.Modules.Binding.Constants.Event_OnSetHtmlContent, "getHtmlContent", function (jobArgs)
        {
            onGetHtmlContent(session, jobArgs);
        });

        if (session.bindingHandle.currentState.parentBindingHandle != null && session.bindingHandle.currentState.parentBindingHandle.options.suppressChildEvents === true) return;

        session.eventStream.addEvent(EVUI.Modules.Binding.Constants.Event_OnSetHtmlContent, "onSetHtmlContent", function (eventArgs)
        {
            if (validateSession(session, eventArgs) === false) return;
            if (typeof session.bindingHandle.binding.onSetHtmlContent === "function")
            {
                return session.bindingHandle.binding.onSetHtmlContent(eventArgs);
            }
        });

        session.eventStream.addEvent(EVUI.Modules.Binding.Constants.Event_OnSetHtmlContent, "onSetHtmlContent", function (eventArgs)
        {
            if (validateSession(session, eventArgs) === false) return;

            if (typeof _self.onSetHtmlContent === "function")
            {
                return _self.onSetHtmlContent(eventArgs);
            }
        });        
    };

    /**Job that resolves ambiguous input into usable htmlContent that can be used for data binding.
    @param {BindingSession} session The BindingSession being executed.
    @param {EVUI.Modules.EventStream.EventStreamJobArgs} jobArgs The job arguments from the EventStream for this step.*/
    var onGetHtmlContent = function (session, jobArgs)
    {
        if (validateSession(session, jobArgs) == false) return jobArgs.resolve();

        //go get the htmlContent. This may be asynchronous if it involves a http call.
        getHtmlContent(session, function (htmlContent)
        {
            if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(htmlContent) === false) //we may not have a htmlContent yet, the user has the next two events to set the htmlContent before we fail due to the lack of a htmlContent
            {
                session.bindingHandle.currentState.htmlContent = htmlContent;
            }

            jobArgs.resolve();
        });
    }

    /**Adds the steps that execute once the html content has been obtained, these steps pull out the binding points from the html content and pair them to their values in the source object.
    @param {BindingSession} session The BindingSession being executed.*/
    var addonSetBindingsSteps = function (session)
    {
        session.eventStream.addJob(EVUI.Modules.Binding.Constants.Event_OnSetBindings, "getBindings", function (jobArgs)
        {
            onGetBindingsJob(session, jobArgs);
        });

        if (session.bindingHandle.currentState.parentBindingHandle != null && session.bindingHandle.currentState.parentBindingHandle.options.suppressChildEvents === true) return;

        session.eventStream.addEvent(EVUI.Modules.Binding.Constants.Event_OnSetBindings, "onSetBindings", function (eventArgs)
        {
            if (validateSession(session, eventArgs) === false) return;
            if (typeof session.bindingHandle.binding.onSetBindings === "function")
            {
                return session.bindingHandle.binding.onSetBindings(eventArgs);
            }
        });

        session.eventStream.addEvent(EVUI.Modules.Binding.Constants.Event_OnSetHtmlContent, "onSetBindings", function (eventArgs)
        {
            if (validateSession(session, eventArgs) === false) return;

            if (typeof _self.onSetBindings === "function")
            {
                return _self.onSetBindings(eventArgs);
            }
        });        
    };

    /**Optionally get the html content again if it was changed in the previous events, then checks to see if the Binding needs to be re-bound if this is not the first time it has been bound, then gets the bound tokens from the htmlContent and pairs them with their values from the source object if the Binding needs to be rebound.
    @param {BindingSession} session The BindingSession being executed.
    @param {EVUI.Modules.EventStream.EventStreamJobArgs} jobArgs The arguments for this job.*/
    var onGetBindingsJob = function (session, jobArgs)
    {
        if (validateSession(session, jobArgs) == false) return jobArgs.resolve();
        session.bindingHandle.progressState |= EVUI.Modules.Binding.BindingProgressStateFlags.GotHtmlContent;

        //if this is not the first time this Binding has been bound, go see if it has any changes that would necessitate doing the binding process over again.
        if (session.bindingHandle.oldStateBound === true)
        {
            session.shouldReBind = shouldReBind(session);
            if (session.shouldReBind === false) //not re-binding
            {
                //no old state, but the source objects match so we need to make a new ObjectObserver for the currentState
                if (session.bindingHandle.oldState.source === session.bindingHandle.currentState.source && session.bindingHandle.oldStateBound === false)
                {
                    session.bindingHandle.currentState.sourceObserver = getCurrentSourceObjectObserver(session); //new EVUI.Modules.Observers.ObjectObserver(session.bindingHandle.currentState.source);
                }
                else
                {
                    if (session.bindingHandle.oldState.source === session.bindingHandle.currentState.source)
                    {
                        session.bindingHandle.currentState.sourceObserver = session.bindingHandle.oldState.sourceObserver; //re-use the old observer if possible
                    }
                    else
                    {
                        session.bindingHandle.currentState.sourceObserver = getCurrentSourceObjectObserver(session); //new EVUI.Modules.Observers.ObjectObserver(session.bindingHandle.currentState.source); //otherwise make a new one for the new source
                    }
                }

                //make a copy of the bound properties since we're not calculating them again if we can
                if (session.bindingHandle.oldState.boundProperties != null)
                {
                    session.bindingHandle.currentState.boundProperties = session.bindingHandle.oldState.boundProperties.map(function (prop) { var newProp = new EVUI.Modules.Binding.BoundProperty(prop.path); newProp.value = prop.value; return newProp; });
                    session.originalBoundProps = session.bindingHandle.oldState.boundProperties;
                }

                return jobArgs.resolve();
            }
        }

        getBoundProperties(session, function (boundProps)
        {
            if (boundProps == null)
            {
                jobArgs.reject("Failed to get boundProperties due to a failure to get valid htmlContent.");
            }
            else
            {
                session.originalBoundProps = boundProps;

                //make a copy of the bound properties to attach that can be publicly edited by the user in the events that follow this one without disturbing the ones we just pulled out of the htmlContent and source
                session.bindingHandle.currentState.boundProperties = boundProps.map(function (boundProp)
                {
                    var prop = new EVUI.Modules.Binding.BoundProperty(boundProp.path);
                    prop.value = boundProp.value;

                    return prop;
                });

                jobArgs.resolve();
            }
        });
    };

    /**Adds the steps that full in the gaps in the htmlContent with values from the source object.
    @param {BindingSession} session The BindingSession being executed. */
    var addOnBindHtmlContentSteps = function (session)
    {
        session.eventStream.addJob(EVUI.Modules.Binding.Constants.Event_OnBindHtmlContent, "bindHtmlContent", function (jobArgs)
        {
            onBindHtmlContentJob(session, jobArgs);
        });

        if (session.bindingHandle.currentState.parentBindingHandle != null && session.bindingHandle.currentState.parentBindingHandle.options.suppressChildEvents === true) return;

        session.eventStream.addEvent(EVUI.Modules.Binding.Constants.Event_OnBindHtmlContent, "onBindHtmlContent", function (eventArgs)
        {
            if (validateSession(session, eventArgs) === false) return;
            if (typeof session.bindingHandle.binding.onBindHtmlContent === "function")
            {
                return session.bindingHandle.binding.onBindHtmlContent(eventArgs);
            }
        });

        session.eventStream.addEvent(EVUI.Modules.Binding.Constants.Event_OnBindHtmlContent, "onBindHtmlContent", function (eventArgs)
        {
            if (validateSession(session, eventArgs) === false) return;

            if (typeof _self.onBindHtmlContent === "function")
            {
                return _self.onBindHtmlContent(eventArgs);
            }
        });
    };

    /**Performs the mail-merge of the htmlContent with the boundProperties to produce the final mergedTemplate that will eventually be merged with the existing DOM content.
    @param {BindingSession} session The BindingSession being executed.
    @param {EVUI.Modules.EventStream.EventStreamJobArgs} jobArgs The job arguments for this step.*/
    var onBindHtmlContentJob = function (session, jobArgs)
    {
        if (validateSession(session, jobArgs) == false) return jobArgs.resolve();
        session.bindingHandle.progressState |= EVUI.Modules.Binding.BindingProgressStateFlags.GotBoundProperties;

        var isArray = isArrayMode(session);

        //check to see if the bound properties were changed in the previous events and then sync them with the bound object. IS THIS NEEDED? PROBABLY NOT
        //var propsChanged = areBoundPropsChanged(session.originalBoundProps, session.bindingHandle.binding.boundProperties);

        //if the object the properties are referencing changed, go get the new property values
        session.bindingHandle.currentState.boundProperties = syncBoundProperties2(session, isArray);

        if (isArray === false)
        {
            if (session.bindingHandle.oldStateBound === true /*&& propsChanged === false*/ && session.shouldReBind === false) //if not an array and we're not rebinding, just use the old content from the last run
            {
                session.bindingHandle.currentState.mergedHtmlContent = session.bindingHandle.oldState.mergedHtmlContent;
                session.bindingHandle.currentState.boundContentTree = session.bindingHandle.oldState.boundContentTree;
            }
            else //otherwise, go re-generate the merged template and make a DomTree out of it
            {
                var htmlContent = session.bindingHandle.htmlContent;
                if (htmlContent == null) htmlContent = session.bindingHandle.currentState.htmlContent;

                var contentMetadata = getHtmlContentMetadata(htmlContent);

                var mergedHtmlContent = duplicateHtmlContent(session, session.bindingHandle.currentState.htmlContent, session.bindingHandle.currentState.boundProperties, contentMetadata);
                session.bindingHandle.currentState.mergedHtmlContent = mergedHtmlContent;
                session.bindingHandle.currentState.boundContentTree = stringToDomTree(session, mergedHtmlContent, contentMetadata);
            }
        }
        else //if it is an array, we have less work to do, we don't do any actual merging for the top parent of the array.
        {
            if (session.bindingHandle.oldStateBound === true && session.shouldReBind === false) //if we aren't rebinding, just take the old state's content as the merged template and use its dummy tree as well
            {
                session.bindingHandle.currentState.mergedHtmlContent = session.bindingHandle.oldState.htmlContent;
                session.bindingHandle.currentState.boundContentTree = session.bindingHandle.oldState.boundContentTree;
            }
            else //otherwise we have no actual work to do, we just use the htmlContent as the merged htmlContent and we make a dummy tree out of a document fragment as a placeholder
            {
                session.bindingHandle.currentState.mergedHtmlContent = session.bindingHandle.currentState.htmlContent;
                session.bindingHandle.currentState.boundContentTree = _services.domTreeConverter.toDomTreeElement(document.createDocumentFragment());
            }
        }

        jobArgs.resolve();
    };

    /**Adds the steps that calculate which children to bind and generates a list of potential child bindings to create that the user then has a chance to edit.
    @param {BindingSession} session The BindingSession being executed.*/
    var addOnBindChildrenSteps = function (session)
    {
        session.eventStream.addJob(EVUI.Modules.Binding.Constants.Event_OnBindChildren, "bindChildren", function (jobArgs)
        {
            onBindChildrenJob(session, jobArgs);
        });

        if ((session.bindingHandle.currentState.parentBindingHandle != null && session.bindingHandle.currentState.parentBindingHandle.options.suppressChildEvents === true) || session.bindingHandle.options.recursive !== true) return;

        session.eventStream.addEvent(EVUI.Modules.Binding.Constants.Event_OnBindChildren, "onBindChildren", function (eventArgs)
        {
            if (validateSession(session, eventArgs) === false) return;
            if (typeof session.bindingHandle.binding.onBindChildren === "function")
            {
                return session.bindingHandle.binding.onBindChildren(eventArgs);
            }
        });

        session.eventStream.addEvent(EVUI.Modules.Binding.Constants.Event_OnBindChildren, "onBindChildren", function (eventArgs)
        {
            if (validateSession(session, eventArgs) === false) return;
            if (typeof _self.onBindChildren === "function")
            {
                return _self.onBindChildren(eventArgs);
            }
        });
    };

    /**Gets all the potential children that will be bound as child Bindings of the current Binding.
    @param {BindingSession} session The BindingSession being executed.
    @param {EVUI.Modules.EventStream.EventStreamJobArgs} jobArgs The job args for the step.*/
    var onBindChildrenJob = function (session, jobArgs)
    {
        if (validateSession(session, jobArgs) == false) return jobArgs.resolve();

        session.bindingHandle.progressState |= EVUI.Modules.Binding.BindingProgressStateFlags.BoundHtmlContent;

        //if we're not doing recursive bindings, don't execute the logic below
        if (session.bindingHandle.options.recursive !== true) return jobArgs.resolve();

        var arrayMode = isArrayMode(session);
        if (session.bindingHandle.oldStateBound === true && arrayMode === false) //if we're re-binding an object that is not an array, go recalculate the existing children with the new children from the boundContentTree or boundDocumentFragment.
        {
            reMapBoundChildren(session);
        }
        else
        {
            if (arrayMode === true)
            {
                if (session.bindingHandle.oldStateBound === false) //if we're binding a new array, go make a bindingHandle for each child entry
                {
                    session.bindingHandle.currentState.childBindingHandles = makeArrayChildren(session);
                }
                else //otherwise re-map the existing children onto new indexes if things were moved around or add new children to the end if the array grew
                {
                    reMapArrayChildren(session);
                }
            }
            else //otherwise it is a non-array thats has not been bound before, go look for any child bindings in the boundContentTree or boundDocumentFragment.
            {
                var boundChildren = getBoundChildren(session);
                session.bindingHandle.currentState.childBindingHandles = makeChildBindings(session, boundChildren);
            }
        }

        jobArgs.resolve();
    };

    /**Adds the step that takes the list of bound children from the previous job and events and then finalizes the list into the true list of childBindingHandles to evaluate.
    @param {BindingSession} session The BindingSession being executed.*/
    var addProcessChildrenSteps = function (session)
    {
        session.eventStream.addJob("evui.binder.process.children", "processChildren", function (jobArgs)
        {
            onProcessChildrenJob(session, jobArgs);
        });
    };

    /**The job where the child bindings made in the previous steps are finalized into childBindingHandles and are triggered to be updated or bound, depending on the BindingSession's sessionMode. 
    @param {BindingSession} session The session being executed.
    @param {EVUI.Modules.EventStream.EventStreamJobArgs} jobArgs The job args for this step.*/
    var onProcessChildrenJob = function (session, jobArgs)
    {
        if (validateSession(session, jobArgs) == false) return jobArgs.resolve();

        session.bindingHandle.progressState |= EVUI.Modules.Binding.BindingProgressStateFlags.GotChildren | EVUI.Modules.Binding.BindingProgressStateFlags.BindingChildren;

        //turn all of the entries made in the previous job and those modified/added/removed by the user into the true list of all child bindings for this binding
        var validChildren = validateChildBindings(session);
        var numValidChildren = validChildren.length;

        session.bindingHandle.currentState.childBindingHandles = validChildren;
        if (numValidChildren === 0) //no children, nothing to do, just return
        {
            return jobArgs.resolve();
        }

        if (session.sessionMode === BindingSessionMode.Update) //if updating, calculate which children changed and only trigger the binding process on those children.
        {
            var changedChildren = getChangedChildBindings(session);

            var numChanged = changedChildren.length;
            if (numChanged === 0) return jobArgs.resolve(); //no children were changed, nothing to do, just return.

            var childrenFinished = [];
            var commonCallback = function (session)
            {
                var numDone = childrenFinished.push(session);
                if (numDone === numChanged)
                {
                    return jobArgs.resolve();
                }
            };

            for (var x = 0; x < numChanged; x++) //trigger a job for each child and advance to the next step once they all have completed
            {
                triggerUpdate(changedChildren[x], null, session, function (childSession)
                {
                    commonCallback(childSession);
                });
            }
        }
        else //if we're not updating only the changed children, we're going to re-evaluate all the children
        {
            var childrenFinished = [];
            var commonCallback = function (session)
            {
                var numDone = childrenFinished.push(session);
                if (numDone === numValidChildren)
                {
                    return jobArgs.resolve();
                }
            };

            var numChildren = session.bindingHandle.currentState.childBindingHandles.length;
            for (var x = 0; x < numChildren; x++) //trigger a binding job for each child and continue to the next step once they have all completed.
            {
                triggerBind(session.bindingHandle.currentState.childBindingHandles[x], null, session, function (childSession)
                {
                    commonCallback(childSession);
                });
            }
        }
    };

    /**Events that fire once all child Bindings of this Binding are complete.
    @param {BindingSession} session The BindingSession being executed. */
    var addOnChildrenBoundSteps = function (session)
    {
        session.eventStream.addEvent(EVUI.Modules.Binding.Constants.Event_OnBindChildren, "onChildrenBound", function (eventArgs)
        {
            session.bindingHandle.progressState |= EVUI.Modules.Binding.BindingProgressStateFlags.BoundChildren;
            if (validateSession(session, eventArgs) === false) return;
            if (session.bindingHandle.currentState.childBindingHandles.length === 0) return;
            if ((session.bindingHandle.currentState.parentBindingHandle != null && session.bindingHandle.currentState.parentBindingHandle.options.suppressChildEvents === true) || session.bindingHandle.options.recursive !== true) return;

            if (typeof session.bindingHandle.binding.onChildrenBound === "function")
            {
                return session.bindingHandle.binding.onChildrenBound(eventArgs);
            }
        });

        if ((session.bindingHandle.currentState.parentBindingHandle != null && session.bindingHandle.currentState.parentBindingHandle.options.suppressChildEvents === true) || session.bindingHandle.options.recursive !== true) return;

        session.eventStream.addEvent(EVUI.Modules.Binding.Constants.Event_OnBindChildren, "onChildrenBound", function (eventArgs)
        {
            if (validateSession(session, eventArgs) === false) return;
            if (session.bindingHandle.currentState.childBindingHandles.length === 0) return;

            if (typeof _self.onChildrenBound === "function")
            {
                return _self.onChildrenBound(eventArgs);
            }
        });
    };

    /**Adds the steps that do the actual DOM Node manipulation to get the DOM in sync with the source's bound properties while doing as little DOM Node creation and manipulation possible.
    @param {BindingSession} session The BindingSession being executed.*/
    var addInjectMergeSteps = function (session)
    {
        session.eventStream.addJob(EVUI.Modules.Binding.Constants.Event_OnBound, "inject", function (jobArgs)
        {
            onInjectJob(session, jobArgs);
        });

        if (session.bindingHandle.currentState.parentBindingHandle != null && session.bindingHandle.currentState.parentBindingHandle.options.suppressChildEvents === true) return;

        session.eventStream.addEvent(EVUI.Modules.Binding.Constants.Event_OnBound, "onBound", function (eventArgs)
        {
            if (session.cancel === true || session.bindingHandle.disposing === true) return eventArgs.cancel();
            if (typeof session.bindingHandle.binding.onBound === "function")
            {
                return session.bindingHandle.binding.onBound(eventArgs);
            }
        });

        session.eventStream.addEvent(EVUI.Modules.Binding.Constants.Event_OnBound, "onBound", function (eventArgs)
        {
            if (session.cancel === true || session.bindingHandle.disposing === true) return eventArgs.cancel();

            if (typeof _self.onBound === "function")
            {
                return _self.onBound(eventArgs);
            }
        });
    }

    /**The job that does the actual DOM manipulation required to make the required changes needed to get the DOM in sync with the source object.
    @param {BindingSession} session The BindingSession being executed.*/
    var onInjectJob = function (session, jobArgs)
    {
        if (validateSession(session, jobArgs) == false) return jobArgs.resolve();

        //DOM manipulation entry point
        injectContent(session);

        //make sure the boundContentTree's node references are removed since some of the nodes are now in the DOM and some are not.
        purgeDomTreeNodes(session.bindingHandle.currentState.boundContentTree);

        session.bindingHandle.progressState |= EVUI.Modules.Binding.BindingProgressStateFlags.Injected;
        session.bindingHandle.newStateBound = true;

        jobArgs.resolve();
    };

    /**Adds the final step in the process that calls all the related callbacks, sets the state back to idle, and cleans up any unneeded resources.
    @param {BindingSession} session The BindingSession being executed.*/
    var addFinalStep = function (session)
    {
        session.eventStream.addJob("finishBinding", "finishBinding", function (jobArgs)
        {
            onFinishBindingJob(session, jobArgs);
        });
    };

    /**Job that finishes the binding process by calling its callbacks and cleaning up whatever resources are no longer needed.
    @param {BindingSession} session The BindingSession being executed.
    @param {EVUI.Modules.EventStream.EventStreamJobArgs} jobArgs The job args for the step.*/
    var onFinishBindingJob = function (session, jobArgs)
    {
        var callbacks = [];

        //factory function that makes a callback function that calls the REAL callback function with the correct parameters (because the AsyncFunctionExecutor can only use one parameter when we will need a different parameter for each function).
        var addCallback = function (item)
        {
            var cb = function ()
            {
                //if the session is in the _bindingSessions array, remove it.
                var index = (item.session.batchId === -1) ? _bindingSessions.indexOf(item.session) : -1;
                if (index !== -1) _bindingSessions.splice(index, 1);

                //set it back to idle and dispose of it if it is flagged as needing to be disposed.
                item.session.bindingHandle.progressState = EVUI.Modules.Binding.BindingProgressStateFlags.Idle;
                if (item.session.bindingHandle.completionState === EVUI.Modules.Binding.BindingCompletionState.Executing) item.session.bindingHandle.completionState = EVUI.Modules.Binding.BindingCompletionState.Success;
                if (item.session.bindingHandle.disposing === true) disposeBinding(item.session.bindingHandle);

                //finally, call it's callback
                return item.callback(item.session.bindingHandle.binding);
            }

            callbacks.push(cb);
        };

        //sort the callbacks so that they are called in order of quevuing
        session.callbacks.sort(function (a, b) { return a.id - b.id; });

        //make the modified wrapper function callbacks to use
        var numCallbacks = session.callbacks.length;
        for (var x = 0; x < numCallbacks; x++)
        {
            addCallback(session.callbacks[x]);
        }

        //if we had no callbacks, do the same cleanup for the current session as is in the callbacks. Sometimes a binding can get canceled twice and wind up in a state where it's progress flags don't reset.
        if (callbacks.length === 0)
        {
            var index = (session.batchId === -1) ? _bindingSessions.indexOf(session) : -1;
            if (index !== -1) _bindingSessions.splice(index, 1);

            session.bindingHandle.progressState = EVUI.Modules.Binding.BindingProgressStateFlags.Idle;
            if (session.bindingHandle.completionState === EVUI.Modules.Binding.BindingCompletionState.Executing) session.bindingHandle.completionState = EVUI.Modules.Binding.BindingCompletionState.Success;
            if (session.bindingHandle.disposing === true) disposeBinding(session.bindingHandle);

            postBindCleanUp(session);
            return jobArgs.resolve();
        }

        //execute all the callbacks in order.
        var exeArgs = new EVUI.Modules.Core.AsyncSequenceExecutionArgs();
        exeArgs.forceCompletion = true;
        exeArgs.functions = callbacks;

        EVUI.Modules.Core.AsyncSequenceExecutor.execute(exeArgs, function (error)
        {
            postBindCleanUp(session);
            jobArgs.resolve();
        });
    };

    /**Validates that the session has not been canceled or disposed of during its execution process.
    @param {BindingSession} session The BindingSession being executed.
    @returns {Boolean} */
    var validateSession = function (session, jobOrEventArgs)
    {
        var isWorking = session.eventStream.isWorking();
        if (session.cancel === true || session.bindingHandle.disposing === true)
        {
            if (session.bindingHandle.disposing === true) session.cancel = true;
            if (isWorking === true)
            {
                if (jobOrEventArgs != null)
                {
                    jobOrEventArgs.cancel();
                }
                else
                {
                    session.eventStream.cancel();
                }
            }

            return false;
        }

        //check the two failure cases that will either tank the browser (a circular reference) or cause erratic output (child moved from under parent)
        if (session.bindingHandle.currentState.parentBindingHandle != null)
        {
            if (isCircularChildReference(session) && isWorking === true)
            {
                throw Error("Child Binding's source was a circular reference to one of its parent Binding's sources.");
            }
            //else if (isChildElementUnderParent(session) === false && isWorking === true) //caused more problems than it solved
            //{
            //    throw Error("Child Binding's element was no longer contained by the root parent's boundContentFragment.")
            //}
        }

        return true;
    };

    /**Recursively sets the canceled flag on all of a BindingSession's child BindingSessions.
    @param {BindingSession} session The BindingSession being executed.*/
    var cancelAllChildren = function (session)
    {
        var numChildren = session.childSessions;
        for (var x = 0; x < numChildren; x++)
        {
            var curChild = session.childSessions[x];
            curChild.cancel = true;

            if (curChild.childSessions.length > 0)
            {
                cancelAllChildren(curChild);
            }
        }
    };

    /**Clean up of old resources that are no longer needed after the current state has been bound.
    @param {BindingSession} session The BindingSession that has finished executing.*/
    var postBindCleanUp = function (session)
    {
        //don't clear anything if the session was canceled - it will roll back to the previous good state and the data below will still be needed if present.
        if (session.cancel === true) return;

        //clear the old and pending states as they are never used again
        session.bindingHandle.oldState = null;
        session.bindingHandle.pendingState = null;

        //null out the boundContentFragment as it is now empty. If this doesn't happen, the empty version is re-used and re-bindings don't work.
        session.bindingHandle.currentState.boundContentFragment = null;
    };

    /*****************************************************************************************INJECTION***************************************************************************/

    /**Injects or merges new content into the DOM.
    @param {BindingSession} session The BindingSesion being executed.*/
    var injectContent = function (session)
    {
        var insertionMode = session.bindingHandle.binding.insertionMode;
        var bindingMode = session.bindingHandle.binding.bindingMode;

        if (bindingMode === EVUI.Modules.Binding.BindingMode.Merge) //if merging content, we will attempt to preserve any DOM nodes possible
        {
            if (session.bindingHandle.oldStateBound === true) //old state is already in the DOM, so we may need to update what's already there
            {
                if (session.shouldReBind === true) //we do need to update what's already there - merge the new content into the old and keep the old content's element reference.
                {
                    mergeContent(session);

                    if (EVUI.Modules.Core.Utils.isOrphanedNode(session.bindingHandle.oldState.element) === false)
                    {
                        session.bindingHandle.currentState.element = session.bindingHandle.oldState.element;
                    }
                }
                else //we don't need to update anything
                {
                    if (session.bindingHandle.currentState.childBindingHandles.length === 0) //no children to update, which means nothing changed. Just use the old references for content
                    {
                        session.bindingHandle.currentState.boundContent = session.bindingHandle.oldState.boundContent.slice();
                    }
                    else
                    {
                        if (session.isArray === true) //go make sure that if any of the array children beneath this one changed that this Binding's boundContent list includes all the children and make sure that the children correctly refer to each other in a linked-list fashion
                        {
                            session.bindingHandle.currentState.boundContent = reAssignArrayElementReferences2(session);
                        }
                        else //re-use the old boundContent as nothing changed on this level.
                        {
                            session.bindingHandle.currentState.boundContent = session.bindingHandle.oldState.boundContent.slice();
                        }
                    }

                    if (EVUI.Modules.Core.Utils.isOrphanedNode(session.bindingHandle.oldState.element) === false)
                    {
                        //always point it back at the old element as the "new" reference point as it was not changed.
                        session.bindingHandle.currentState.element = session.bindingHandle.oldState.element;
                    }
                }
            }
            else //old state was not bound, inserting new content and blowing away any old content if it's there
            {
                if (session.isArray === true) //arrays never are injected directly but are rather a wrapper for their children, so we have nothing to do for the actual array. Just make sure its boundContent list is correct and the children's relationships to each other is correct.
                {
                    session.bindingHandle.currentState.boundContent = reAssignArrayElementReferences2(session);
                }
                else //we have an object to inject that is not an array, add it's contents to the DOM.
                {
                    //if the bound htmlContent fragment has never been created, we need to make it now to inject the whole set of DOM nodes at once.
                    if (session.bindingHandle.currentState.boundContentFragment == null) session.bindingHandle.currentState.boundContentFragment = toDomNode(session.bindingHandle.currentState.boundContentTree); //session.bindingHandle.currentState.boundContentTree.toNode();

                    //grab the child node references BEFORE insertion since the document fragment will be empty once its children are in the DOM.
                    var nodeChildren = getNodeListFromFragment(session.bindingHandle.currentState.boundContentFragment);

                    //if we have no element reference (this is usually the case with a child binding that is an array member), insert the child into the content tree and give it a reference element.
                    if (session.bindingHandle.currentState.element == null)
                    {
                        insertMissingNode2(session, session.bindingHandle.currentState.boundContentFragment);
                    }
                    else //otherwise, just inject the content as it would be normall.y
                    {
                        injectNode(session, insertionMode, session.bindingHandle.currentState.element, session.bindingHandle.currentState.boundContentFragment);
                    }

                    session.bindingHandle.currentState.boundContent = nodeChildren;
                }
            }
        }
        else if (bindingMode === EVUI.Modules.Binding.BindingMode.Overwrite) //overwriting existing content. Since this is a recursive setting, the children will have taken care of updating their own nodes and we just have to worry about the parent nodes.
        {
            if (session.isArray === true) //arrays never are injected directly but are rather a wrapper for their children, so we have nothing to do for the actual array. Just make sure its boundContent list is correct and the children's relationships to each other is correct.
            {
                session.bindingHandle.currentState.boundContent = reAssignArrayElementReferences2(session);
            }
            else //we have an object to inject that is not an array, add it's contents to the DOM.
            {
                //if the old state was bound and we have children, we need to do another merge - this is because the children are already merged into the DOM and simply removing the old content and inserting the current content will disconnect all the children.
                if (session.bindingHandle.oldStateBound === true && session.bindingHandle.currentState.childBindingHandles.length > 0)
                {
                    mergeContent(session);
                }
                else
                {
                    //if the bound htmlContent fragment has never been created, we need to make it now to inject the whole set of DOM nodes at once.
                    if (session.bindingHandle.currentState.boundContentFragment == null) session.bindingHandle.currentState.boundContentFragment = session.bindingHandle.currentState.boundContentTree.toNode();

                    //grab the child node references BEFORE insertion since the document fragment will be empty once its children are in the DOM.
                    var nodeChildren = getNodeListFromFragment(session.bindingHandle.currentState.boundContentFragment);

                    //if we have no element reference (this is usually the case with a child binding that is an array member), insert the child into the content tree and give it a reference element.
                    if (session.bindingHandle.currentState.element == null)
                    {
                        insertMissingNode2(session, session.bindingHandle.currentState.boundContentFragment);
                    }
                    else //otherwise, just inject the content as it would be normall.y
                    {
                        injectNode(session, insertionMode, session.bindingHandle.currentState.element, session.bindingHandle.currentState.boundContentFragment);
                    }

                    session.bindingHandle.currentState.boundContent = nodeChildren;
                }
            }
        }
        else //garbage input, crash.
        {
            throw Error("Unrecognized bindingMode: \"" + bindingMode + "\".");
        }

        //finally after all the content changes have been made, clean up everything that no longer should be there.
        cleanUpOldNodes2(session);
    };

    /**Injects a Node relative to another Node.
    @param {BindingSession} session The BindingSession being executed.
    @param {String} insertionMode A value from the EVUI.Modules.Binding.BindingInsertionMode enum indicating how to insert the Node relative to its other node.
    @param {Node} referenceEle The reference element to insert the node relative to.
    @param {Node} node The node to inject.*/
    var injectNode = function (session, insertionMode, referenceEle, node)
    {
        var lastNode = (node.childNodes.length > 0) ? node.lastChild : node;
        session.lastInsertedNode = lastNode;

        switch (insertionMode)
        {
            case EVUI.Modules.Binding.BindingInsertionMode.Append:
            case EVUI.Modules.Binding.BindingInsertionMode.Default:
                referenceEle.append(node);
                break;

            case EVUI.Modules.Binding.BindingInsertionMode.Prepend:
                referenceEle.prepend(node);
                break;

            case EVUI.Modules.Binding.BindingInsertionMode.Fragment:
                referenceEle.append(node);
                return;

            case EVUI.Modules.Binding.BindingInsertionMode.InsertAfter:
                referenceEle.after(node);
                break;

            case EVUI.Modules.Binding.BindingInsertionMode.InsertBefore:
                referenceEle.before(node);
                break;

            case EVUI.Modules.Binding.BindingInsertionMode.ReplaceChildren:
                referenceEle.innerHTML = null;
                referenceEle.append(node);
                break;

            case EVUI.Modules.Binding.BindingInsertionMode.Shadow:
                var shadow = sparentNode.shadowRoot;
                if (shadow == null) shadow = sparentNode.attachShadow({ mode: "open" });
                shadow.append(node);
                break;

            default:
                throw Error("Invalid insertionMode: \"" + insertionMode + "\"");
        }
    };

    /**Merges an old set of Nodes with a new set of Nodes to update the DOM to be in sync with the latest changes made to the Html derived from the source object and the htmlContent of the Binding.
    @param {BindingSession} session The session being executed.*/
    var mergeContent = function (session)
    {
        if (session.isArray === false) //if the session is not an array, merge all the contents with the existing contents.
        {
            var newContentTrees = null;

            //if we have a document fragment it means the user accessed the boundContentFragment from the Binding and caused it to be generated based on the boundContentTree. In this case we need to go scoop up whatever they changed and re-create the trees instead of using the DomTrees we already made.
            if (session.bindingHandle.currentState.boundContentFragment != null) 
            {
                var numChildren = session.bindingHandle.currentState.boundContentFragment.childNodes.length;
                newContentTrees = [];

                for (var x = 0; x < numChildren; x++)
                {
                    newContentTrees.push(_services.domTreeConverter.toDomTreeElement(session.bindingHandle.currentState.boundContentFragment.childNodes[x], { includeNodeReferences: true }));
                }
            }
            else //otherwise we just use the pre-existing trees.
            {
                newContentTrees = session.bindingHandle.currentState.boundContentTree.content.slice();
            }

            //merging content only applies to content that has been changed rather than has been replaced with a new object
            var existingContentTrees = [];
            if (session.bindingHandle.oldState != null && session.bindingHandle.oldState.boundContent != null && session.bindingHandle.oldState.source === session.bindingHandle.currentState.source)
            {
                var numCurContent = session.bindingHandle.oldState.boundContent.length;
                for (var x = 0; x < numCurContent; x++)
                {
                    var curContent = session.bindingHandle.oldState.boundContent[x];
                    if (EVUI.Modules.Core.Utils.isOrphanedNode(curContent) === true) continue;

                    existingContentTrees.push(_services.domTreeConverter.toDomTreeElement(curContent, { includeNodeReferences: true }));
                }

                if (session.bindingHandle.oldState.childBindingHandles.length > 0)
                {
                    removeOldChildTrees(session, existingContentTrees, newContentTrees);
                }
            }

            var numNewContent = newContentTrees.length;
            var dummyEle = new EVUI.Modules.DomTree.DomTreeElement();
            EVUI.Modules.Core.Utils.cacheProperties(dummyEle, Object.keys(dummyEle));
            EVUI.Modules.Core.Utils.cacheProperties(new EVUI.Modules.DomTree.DomTreeElementAttribute());

            //diff the existing content with the new content to get the list of everything that is different in the markup of the two trees.
            var diff = _services.diffController.compare(existingContentTrees, newContentTrees, { compareValuesOnly: true });

            EVUI.Modules.Core.Utils.uncacheProperties(new EVUI.Modules.DomTree.DomTreeElement());
            EVUI.Modules.Core.Utils.uncacheProperties(new EVUI.Modules.DomTree.DomTreeElementAttribute());

            //process the diff and make any required changes to the DOM to bring things back in sync
            processDiffs(session, diff);

            var final = [];
            //once that is done, we walk all the child comparisons of the root comparison (which will be the top-level nodes that were changed) and assign the nodes that are there and attached to the final bound content list. We may not know which tree's nodes were used as they were merged together, so we check for both. 
            for (var x = 0; x < numNewContent; x++)
            {
                var contentDiff = diff.rootComparison.childComparisons[x];
                if (contentDiff.a != null && contentDiff.a.node != null && contentDiff.a.node.isConnected === true)
                {
                    final.push(contentDiff.a.node);
                }
                else if (contentDiff.b != null && contentDiff.b.node != null && (contentDiff.b.node.isConnected === true || contentDiff.a == null))
                {
                    final.push(contentDiff.b.node);
                }
            }

            session.bindingHandle.currentState.boundContent = final;
        }
        else //if the session was an array we never do any actual merging for the real array, we just roll up the nodes that were made instead and make sure the "linked list" of Binding-to-element relationships are correct.
        {
            session.bindingHandle.currentState.boundContent = reAssignArrayElementReferences2(session);
        }
    };

    /**Removes any sub-trees from the DomTreeElement trees used for doing the main diff comparison in the context of a multi-level recursive binding scenario.
    @param {BindingSession} session
    @param {EVUI.Modules.DomTree.DomTreeElement[]} existingContentTrees
    @param {EVUI.Modules.DomTree.DomTreeElement[]} newContentTrees*/
    var removeOldChildTrees = function (session, existingContentTrees, newContentTrees)
    {
        var aggregateOldTree = new EVUI.Modules.DomTree.DomTreeElement();
        aggregateOldTree.content = existingContentTrees;

        var aggregateNewTree = new EVUI.Modules.DomTree.DomTreeElement();
        aggregateNewTree.content = newContentTrees;

        var oldParentPaths = [];
        var newParentPaths = [];
        var contentRemoverPathDic = {};
        var contentRemovers = [];

        //go make a list of all the trees that had their content added outside of their element reference, they will need to have their boundContent removed explicitly. Otherwise we can just replace the contents of the element with its current contents to get it in sync with this hierarchical level of the binding.
        var numChildren = session.bindingHandle.oldState.childBindingHandles.length;
        for (var x = 0; x < numChildren; x++)
        {
            var childHandle = session.bindingHandle.oldState.childBindingHandles[x];
            oldParentPaths.push(childHandle.currentState.parentBindingPath);

            if (childHandle.binding.insertionMode === EVUI.Modules.Binding.BindingInsertionMode.InsertAfter ||
                childHandle.binding.insertionMode === EVUI.Modules.Binding.BindingInsertionMode.InsertBefore)
            {
                if (childHandle.oldState != null)
                {
                    contentRemoverPathDic[childHandle.currentState.parentBindingPath] = true;
                    contentRemovers.push(childHandle);
                }
            }
        }

        //also, for both, make a list of all the parent binding paths so we can go find their respective DomTrees
        var numChildren = session.bindingHandle.currentState.childBindingHandles.length;
        for (var x = 0; x < numChildren; x++)
        {
            var childHandle = session.bindingHandle.currentState.childBindingHandles[x];
            newParentPaths.push(childHandle.currentState.parentBindingPath);
        }

        //find the trees that serve as the reference elements for both the old and new content sets
        var matchingOldTrees = getMatchingChildTreesByPath(session, aggregateOldTree, oldParentPaths);
        var matchingNewTrees = getMatchingChildTreesByPath(session, aggregateNewTree, newParentPaths);

        var numRemovers = contentRemovers.length;
        var numOld = matchingOldTrees.length;
        var numNew = matchingNewTrees.length;

        //since we need to amend the old content tree, we walk the list of all the old content and edit each part needing changing
        for (var x = 0; x < numOld; x++)
        {
            var curOld = matchingOldTrees[x];
            var remover = contentRemoverPathDic[curOld.path];
            if (remover === true) //we have an "insert after" or "insert before" style binding, so we need to remove its content from the old content tree for it to match the new one
            {
                var matchingBinding = null;
                for (var y = 0; y < numRemovers; y++)
                {
                    var curRemover = contentRemovers[y];
                    if (curRemover.oldState.parentBindingPath === curOld.path)
                    {
                        matchingBinding = curRemover;
                        contentRemovers.splice(y, 1);
                        numRemovers--;
                        break;
                    }
                }

                //either no binding or no content, continue to the next
                if (matchingBinding == null || matchingBinding.oldState.boundContent == null) continue;
                var numContent = matchingBinding.oldState.boundContent.length;

                //for every piece of content, go find the parent of it's node reference and remove the whole node from the content list
                for (var y = 0; y < numContent; y++)
                {
                    var curBoundContent = matchingBinding.oldState.boundContent[y];
                    aggregateOldTree.search(function (ele)
                    {
                        if (EVUI.Modules.Core.Utils.isArray(ele.content) === true)
                        {
                            var numContent = ele.content;
                            for (var z = 0; z < numContent; z++)
                            {
                                var curContent = ele.content[z];
                                if (curContent.node === curBoundContent)
                                {
                                    ele.content.splice(z, 1);
                                    return true;
                                }
                            }
                        }
                    }, true);
                }
            }
            else //otherwise it was a piece of content that was inserted as children to another element, so we clone the matching element and simply swap out the content with the clone to get things in sync
            {
                for (var y = 0; y < numNew; y++)
                {
                    var curNew = matchingNewTrees[y];
                    if (curNew.path === curOld.path)
                    {
                        found = true;
                        var newClone = curNew.tree.clone();
                        curOld.tree.content = newClone.content;
                        curOld.tree.shadow = newClone.shadow;

                        matchingNewTrees.splice(y, 1);
                        numNew--;

                        break;
                    }
                }
            }
        }
    };

    /**
     * 
     * @param {BindingSession} session
     * @param {EVUI.Modules.DomTree.DomTreeElement} aggregateTree
     * @param {String[]} parentPaths
     */
    var getMatchingChildTreesByPath = function (session, aggregateTree, parentPaths)
    {
        var treeKeyPairs = [];

        var results = aggregateTree.search(function (elementTree)
        {
            if (elementTree.attrs == null) return;
            var numAttrs = elementTree.attrs.length;

            for (var x = 0; x < numAttrs; x++)
            {
                var curAttr = elementTree.attrs[x];
                if (curAttr.key !== EVUI.Modules.Binding.Constants.Attr_BoundObj) continue;

                if (parentPaths.indexOf(curAttr.val) !== -1)
                {
                    treeKeyPairs.push({ path: curAttr.val, tree: elementTree });
                    return true;
                }
                else
                {
                    return false;
                }
            }
        });

        return treeKeyPairs;
    };

    /**Re-assigns all of the boundContent of the array's parent to be the combined content of all of its child Bindings and ensures that each array child's element references the last piece of content from the array child that comes directly before it, except for the first node which always references the parent Binding's element as its own element.
    @param {BindingSession} session The BindingSession being executed.
    @returns {Node[]} */
    var reAssignArrayElementReferences2 = function (session)
    {
        var final = [];

        //some wacky cleanup for arrays. When the array list is re-assigned, all the elements get set to null, so we need to go re-assign each binding's element to the last content in the previous binding's bound content list.
        var previousNoEle = false;
        var previousHandle = null;
        var lastContent = null;
        var numChildren = session.bindingHandle.currentState.childBindingHandles.length;
        for (var x = 0; x < numChildren; x++)
        {
            var curHandle = session.bindingHandle.currentState.childBindingHandles[x];

            var noEle = curHandle.currentState.element == null || curHandle.currentState.element.isConnected === false || curHandle.currentState.element === session.bindingHandle.currentState.element; //if it's null, disconnected, or the parent's element (which it can be if the sequence of children went out of order due to async delays)

            if (x === 0 && noEle === true) //if we're the first element in the array, the reference element is always the parent session's element.
            {
                curHandle.currentState.element = session.bindingHandle.currentState.element;
                noEle = false;
            }
            else if (previousNoEle === true && previousHandle != null) //if the previous handle had no element, assign it to the last content of the current element's bound content list.
            {
                previousHandle.currentState.element = lastContent;
            }
            else if (noEle === false && x > 0)
            {
                var previous = session.bindingHandle.currentState.childBindingHandles[x - 1];
                if (curHandle.currentState.element !== previous.currentState.boundContent[previous.currentState.boundContent.length - 1]) //if the element does not reference the previous binding's last content as its content, it needs to be reset.
                {
                    noEle = true;
                }
            }

            if (curHandle.currentState.boundContent != null)
            {
                var numContent = curHandle.currentState.boundContent.length;
                for (var y = 0; y < numContent; y++)
                {
                    var curContent = curHandle.currentState.boundContent[y];
                    final.push(curContent);
                }

                lastContent = curContent;
            }

            if (x === numChildren - 1 && noEle === true) //if we're the last child in the array, we need to reference the last content from the last binding as the reference element as the loop above won't assign it.
            {
                curHandle.element = lastContent;
            }

            previousNoEle = noEle;
            previousHandle = curHandle;
        }

        return final;
    };


    /**Gets an array of Nodes from a DocumentFragment. Exists because Array.from is mysteriously slower than the for loop equivalent.
    @param {DocumentFragment} documentFragment
    @returns {Node[]} */
    var getNodeListFromFragment = function (documentFragment)
    {
        var nodeList = [];
        if (documentFragment == null) return nodeList;

        var numNodes = documentFragment.childNodes.length;
        for (var x = 0; x < numNodes; x++)
        {
            nodeList.push(documentFragment.childNodes[x]);
        }

        return nodeList;
    };

    /**Cleans up all existing Bindings that have been removed from their parent Binding and disposes of them. Both clears the DOM and prevents memory leaks.
    @param {BindingSession} session The BindingSession being executed.*/
    var cleanUpOldNodes = function (session)
    {
        if (session.bindingHandle.oldStateBound === false) return; //no old state to clean up

        var oldChildBindings = session.bindingHandle.oldState.childBindingHandles.slice();
        var numOldBindings = oldChildBindings.length;

        if (session.observedDifferences == null) return; //no detected differences between old and new states, so there is nothing that changed and needs to be removed

        if (EVUI.Modules.Core.Utils.isArray(session.observedDifferences) === true) //the diff is an array of ObservedChangedProperty, walk each one and find all the bindings that were removed and dispose of them.
        {
            if (numOldBindings === 0) return; //no bindings to remove

            var numObservedDiffs = session.observedDifferences.length;
            for (var x = 0; x < numObservedDiffs; x++)
            {
                var curDiff = session.observedDifferences[x];
                if (curDiff.type !== EVUI.Modules.Observers.ObservedObjectChangeType.Removed) continue;

                for (var y = 0; y < numOldBindings; y++)
                {
                    var curOldBinding = oldChildBindings[y];
                    if (curOldBinding.currentState.source !== curDiff.originalValue) continue;
                    if (curOldBinding.currentState.parentBindingKey !== curDiff.name) continue;

                    oldChildBindings.splice(y, 1);
                    numOldBindings--;

                    triggerDispose(curOldBinding);
                    break;
                }
            }
        }
        else //otherwise we diff two different objects from each other
        {
            var numDiffs = session.observedDifferences.rootComparison.differences.length;

            if (numOldBindings === 0) //if we had no old bindings but compared two different objects there is some potential clean up to be done
            {
                var inBoth = false;

                for (var x = 0; x < numDiffs; x++) //walk all the differences and see if there are any properties that are in one object and not the other
                {
                    var curDiff = session.observedDifferences.rootComparison.differences[x];
                    if (EVUI.Modules.Core.Utils.hasFlag(curDiff.flags, EVUI.Modules.Diff.DiffFlags.AOnly) === false && EVUI.Modules.Core.Utils.hasFlag(curDiff.flags, EVUI.Modules.Diff.DiffFlags.BOnly) === false)
                    {
                        inBoth = true;
                        break;
                    }
                }

                if (inBoth === false) //if there was nothing in common between the two objects, we can safely remove the old content - but NOT dispose of it because that would kill the current binding.
                {
                    var numOldBoundContent = session.bindingHandle.oldState.boundContent.length;
                    for (var x = 0; x < numOldBoundContent; x++)
                    {
                        var curContent = session.bindingHandle.oldState.boundContent[x];
                        curContent.remove();
                    }
                }

                return;
            }


            for (var x = 0; x < numDiffs; x++)
            {
                var curDiff = session.observedDifferences.rootComparison.differences[x];
                if (curDiff.a == null && curDiff.b != null && typeof curDiff.b !== "object") continue;
                if (EVUI.Modules.Core.Utils.hasFlag(curDiff.flags, EVUI.Modules.Diff.DiffFlags.AOnly) === true) continue; //anything that's in A gets to stay, things that are only in B get removed.

                for (var y = 0; y < numOldBindings; y++)
                {
                    var curOldBinding = oldChildBindings[y];
                    if (curOldBinding.currentState.source !== curDiff.b) continue;
                    oldChildBindings.splice(y, 1);
                    numOldBindings--;

                    triggerDispose(curOldBinding);
                    break;
                }
            }
        }
    }

    /**Cleans up all existing Bindings that have been removed from their parent Binding and disposes of them. Both clears the DOM and prevents memory leaks.
    @param {BindingSession} session The BindingSession being executed.*/
    var cleanUpOldNodes2 = function (session)
    {
        //no old state, no references to nodes to clean up
        if (session.bindingHandle.oldState == null) return;

        if (session.bindingHandle.oldStateBound === false) //if we have an old state that wasn't bound, this means we have a new binding at the same path as an old binding, but with a different source object, so we need to remove the old nodes
        {
            if (session.bindingHandle.oldState.source !== session.bindingHandle.currentState.source && session.bindingHandle.oldState.boundContent != null)
            {
                var numOld = session.bindingHandle.oldState.boundContent.length;
                for (var x = 0; x < numOld; x++)
                {
                    session.bindingHandle.oldState.boundContent[x].remove();
                }
            }

            return;
        }

        //otherwise, we have a re-bound object who potentially has two sets of nodes
        var oldHandles = session.bindingHandle.oldState.childBindingHandles.slice();
        var newHandleDic = makeChangeDictionary(session, session.bindingHandle.currentState.childBindingHandles);

        var numOldChildren = session.bindingHandle.oldState.childBindingHandles.length;

        for (var x = 0; x < numOldChildren; x++)
        {
            var curOldHandle = oldHandles[x];
            var matchingBinding = newHandleDic[curOldHandle.currentState.normalizedPath];

            if (matchingBinding == null)
            {
                triggerDispose(curOldHandle);
                continue;
            }
        }

        if (session.bindingHandle.currentState.source === session.bindingHandle.oldState.source) return;

        var numDiffs = session.observedDifferences.rootComparison.differences.length;
        if (numOldChildren === 0) //if we had no old bindings but had two different objects there is some clean up to be done as the new object's nodes replaced the old object's nodes
        {

            var numOldBoundContent = session.bindingHandle.oldState.boundContent.length;
            for (var x = 0; x < numOldBoundContent; x++)
            {
                var curContent = session.bindingHandle.oldState.boundContent[x];
                curContent.remove();
            }

            return;
        }
    };

    /**Processes the diff result between the old and new DomTreeElement hierarchies.
    @param {BindingSession} session The BindingSession being executed.
    @param {EVUI.Modules.Diff.CompareResult} diff The diff result between the two tree hierarchies.*/
    var processDiffs = function (session, diff)
    {
        var numDifferences = diff.rootComparison.differences.length;
        for (var x = 0; x < numDifferences; x++)
        {
            var curDiff = diff.rootComparison.differences[x];
            var aIsTree = isDomTreeElement(curDiff.a);
            var bIsTree = isDomTreeElement(curDiff.b);
            var aIsArray = (aIsTree === false) ? EVUI.Modules.Core.Utils.isArray(curDiff.a) : false;
            var bIsArray = (bIsTree === false) ? EVUI.Modules.Core.Utils.isArray(curDiff.b) : false;
            if (aIsTree === false && bIsTree === false && aIsArray === false && bIsArray === false) continue; //we only care about arrays and trees (an array can be an array of attributes or trees)

            if (aIsTree === true || bIsTree === true)
            {
                processTreeDiff(session, diff, curDiff);
            }
            else if (aIsArray === true || bIsArray === true)
            {
                processArrayDiff(session, diff, curDiff, 0);
            }
        }
    };

    /**Either gets a new ObjectObserver or extracts one from the parentBindingHandle's ObjectObserver.
    @param {BindingSession} session The BindingSession being executed.
    @returns {EVUI.Modules.Observers.ObjectObserver} */
    var getCurrentSourceObjectObserver = function (session)
    {
        if (session.bindingHandle.currentState.parentBindingHandle != null && session.bindingHandle.currentState.parentBindingHandle.currentState.sourceObserver != null)
        {
            var child = session.bindingHandle.currentState.parentBindingHandle.currentState.sourceObserver.getChildObserver(session.bindingHandle.currentState.parentBindingKey, true);
            if (child != null) return child;
        }

        return new EVUI.Modules.Observers.ObjectObserver(session.bindingHandle.currentState.source);
    };

    /**Processes a diff that is a diff between two arrays of DomTreeElements.
    @param {BindingSession} session The BindingSession being executed.
    @param {EVUI.Modules.Diff.CompareResult} diffResult The diff result from comparing the two DomTreeElement hierarchies.
    @param {EVUI.Modules.Diff.Comparison} arrayDiff The current diff that contains the arrays to compare.*/
    var processArrayDiff = function (session, diffResult, arrayDiff)
    {
        var numArrayDiffs = arrayDiff.differences.length;
        for (var x = 0; x < numArrayDiffs; x++)
        {
            var curDiff = arrayDiff.differences[x];
            if (curDiff.diffType !== EVUI.Modules.Diff.DiffType.String && curDiff.parentComparison != null && curDiff.parentComparison.propName !== "content") continue;
            processTreeDiff(session, diffResult, curDiff);
        }
    }

    /**Processes a diff that is between two DomTreeElements. Lazily merges and creates nodes as they are needed and always attempts to re-use whatever nodes can be reused.
    @param {BindingSession} session The BindingSession being executed.
    @param {EVUI.Modules.Diff.CompareResult} diffResult The diff result from comparing the two DomTreeElement hierarchies.
    @param {EVUI.Modules.Diff.Comparison} treeDiff The current diff that contains the DomTreeElements */
    var processTreeDiff = function (session, diffResult, treeDiff)
    {
        var numTreeDiffs = treeDiff.differences.length;
        var tagDiff = null;
        var contentDiff = null;
        var attributeDiff = null;
        var shadowDiff = null;

        var diffA = treeDiff.a;
        var diffB = treeDiff.b;

        var aType = (diffA == null) ? null : typeof diffA;
        var bType = (diffB == null) ? null : typeof diffB;

        if (aType === "string" && bType === "string") //replacing string contents
        {
            var parentNode = getParentNodeDiff(session, treeDiff);

            if (session.bindingHandle.binding.bindingMode === EVUI.Modules.Binding.BindingMode.Overwrite) //overwriting, replace the text node
            {
                parent.a.node.replaceWith(toDomNode(parentNode.b)); //parentNode.b.toNode());
            }
            else //otherwise just update it's text content
            {
                parentNode.a.node.textContent = parentNode.b.content;
            }
        }
        else if (aType === "string" || bType === "string") //either replacing a string node with an element or vice-versa
        {
            var parentNode = getParentNodeDiff(session, treeDiff);
            var aTarget = parentNode.a.node;
            var bTarget = parentNode.b.node;

            if (aType === "string") //current is a string
            {
                if (bType === "object") //new is a node
                {
                    if (bTarget == null) bTarget = toDomNode(parentNode.b); //parentNode.b.toNode(); //lazily create the node
                    if (isDomTreeElement(diffB) === true)
                    {
                        aTarget.replaceWith(bTarget);
                    }
                    else
                    {
                        bTarget.replaceWith(aTarget);
                    }
                }
                else if (bType == null)
                {
                    aTarget.remove();
                }
            }
            else if (bType === "string") //new is a string
            {
                if (aType === "object") //old is a node
                {
                    if (bTarget == null) bTarget = toDomNode(parentNode.b); //parentNode.b.toNode(); //lazily create the node
                    if (isDomTreeElement(diffA) === true)
                    {
                        bTarget.replaceWith(aTarget);
                    }
                    else
                    {
                        aTarget.replaceWith(bTarget);
                    }
                }
                else if (aType == null)
                {
                    if (bTarget != null) bTarget.remove(); //if be was made, remove it
                }
            }
        }
        else if ((aType === "object" || bType === "object") && aType !== bType) //one is an object, the other is not.
        {
            var parentNode = getParentNodeDiff(session, treeDiff);
            if (parentNode == null) //there is no parent node, so we go look at the next highest comparison (which is a contents list)
            {
                var parentNode = treeDiff.parentComparison;
                var longer = Math.max(parentNode.a.length, parentNode.b.length);
                for (var x = 0; x < longer; x++) //walk the array and replace/remove nodes as necessary
                {
                    var aTree = parentNode.a[x];
                    var bTree = parentNode.b[x];

                    if (aTree != null && bTree != null) //both are nodes, swap them
                    {
                        toDomNode(bTree); //bTree.toNode();
                        aTree.node.replaceWith(bTree.node);
                    }
                    else if (bTree == null) //b is not there, remove existing
                    {
                        aTree.node.remove();
                    }
                    else if (aTree == null) //existing is not there, add the missing b node
                    {
                        toDomNode(bTree); //bTree.toNode();
                        insertMissingNode2(session, bTree.node);
                    }
                }
            }
            else //we have a parent
            {
                var aTarget = parentNode.a.node;
                var bTarget = toDomNode(parentNode.b); //parentNode.b.toNode();

                if (aType === "object") //parent existing was there, but there is no new matching node
                {                   
                    //aTarget.remove();
                    treeDiff.a.node.remove();
                }
                else if (bType === "object") 
                {
                    

                    if (aTarget.lastChild == null)
                    {
                        aTarget.replaceWith(bTarget);
                    }
                    else
                    {
                        injectNode(session, EVUI.Modules.Binding.BindingInsertionMode.InsertAfter, aTarget.lastChild, toDomNode(treeDiff.b)); //.toNode());
                    }
                }
            }
        }
        else if (aType === "object" && bType === "object") //both are nodes, do a contents comparison
        {
            for (var y = 0; y < numTreeDiffs; y++)
            {
                var curTreeDiff = treeDiff.differences[y];
                if (curTreeDiff.propName === "tagName")
                {
                    tagDiff = curTreeDiff;
                }
                else if (curTreeDiff.propName === "content")
                {
                    contentDiff = curTreeDiff;
                }
                else if (curTreeDiff.propName === "attrs")
                {
                    attributeDiff = curTreeDiff;
                }
                else if (curTreeDiff.propName === "shadow")
                {
                    shadowDiff = curTreeDiff;
                }

                if (tagDiff != null && contentDiff != null && attributeDiff != null && shadowDiff != null) break;
            }

            if (tagDiff != null || session.bindingHandle.binding.insertionMode === EVUI.Modules.Binding.BindingMode.Overwrite) //tags are different, they have to be different elements or we are overwriting the old content with new content explicitly
            {
                var aTarget = treeDiff.a.node;
                var bTarget = toDomNode(treeDiff.b); //.toNode();
                aTarget.replaceWith(bTarget);

                if (session.bindingHandle.binding.insertionMode === EVUI.Modules.Binding.BindingMode.Overwrite && contentDiff != null && session.bindingHandle.currentState.childBindingHandles.length > 0) //if we're overwriting it's possible to have children that were already merged, so attempt to merge in the existing content under this one
                {
                    if (contentDiff.differences.length === 0 || contentDiff.diffType === EVUI.Modules.Diff.DiffType.String)
                    {
                        processTreeDiff(session, diffResult, contentDiff, 0);
                    }
                    else
                    {
                        processArrayDiff(session, diffResult, contentDiff, 0);
                    }
                }
            }
            else //tags the same, we just update the child contents.
            {
                if (contentDiff != null)
                {
                    if (contentDiff.differences.length === 0 || contentDiff.diffType === EVUI.Modules.Diff.DiffType.String)
                    {
                        processTreeDiff(session, diffResult, contentDiff, 0);
                    }
                    else
                    {
                        processArrayDiff(session, diffResult, contentDiff, 0);
                    }
                }

                if (attributeDiff != null)
                {
                    processAttributeDiff(session, diffResult, attributeDiff, treeDiff.a.node);
                }
            }
        }
    };

    /**Processes the result of a difference in attributes on an element.
     * 
     * @param {BindingSession} session
     * @param {EVUI.Modules.Diff.CompareResult} diffResult
     * @param {EVUI.Modules.Diff.Comparison} attrDiff
     * @param {Node} targetNode
     */
    var processAttributeDiff = function (session, diffResult, attrDiff, targetNode)
    {
        var attributeData = buildAttributeDictionary(attrDiff);
        var currentMeta = getElementMetadata(attrDiff.parentComparison.a.node);
        var newMeta = getElementMetadata(toDomNode(attrDiff.parentComparison.b));

        var numKeys = attributeData.keys.length;
        for (var x = 0; x < numKeys; x++)
        {
            var curKey = attributeData.keys[x];
            var values = attributeData.dictionary[curKey];

            var newAttrMeta = getNewAttributeMetadata(session, curKey, values.currentValue, values.newValue, currentMeta, newMeta);
            currentMeta.attributes[curKey] = newAttrMeta;

            if (newMeta == null || newAttrMeta.value === values.currentValue) continue;

            targetNode.setAttribute(curKey, newAttrMeta.value);
        }
    };

    /**
     * 
     * @param {EVUI.Modules.Diff.Comparison} attrDiff
     */
    var buildAttributeDictionary = function (attrDiff)
    {
        var attributeDic = {};
        var keys = [];

        var numAttrDiffs = attrDiff.differences.length;
        for (var x = 0; x < numAttrDiffs; x++)
        {
            var curDiff = attrDiff.differences[x];
            if (curDiff.a != null)
            {
                var entry = attributeDic[curDiff.a.key];
                if (entry == null)
                {
                    entry = {};
                    attributeDic[curDiff.a.key] = entry;
                    keys.push(curDiff.a.key);
                }

                entry.currentValue = curDiff.a.val;
            }

            if (curDiff.b != null)
            {
                var entry = attributeDic[curDiff.b.key];
                if (entry == null)
                {
                    entry = {};
                    attributeDic[curDiff.b.key] = entry;
                    keys.push(curDiff.b.key);
                }

                entry.newValue = curDiff.b.val;
            }
        }

        return { dictionary: attributeDic, keys: keys };
    }

    /**
     * 
     * @param {BindingSession} session
     * @param {String} currentValue
     * @param {String} newValue
     * @param {ElementMetadata} currentMeta The data attached to the element that is already in the DOM.
     * @param {ElementMetadata} newMeta The data that is attached to the element that could be injected into the DOM.
     */
    var getNewAttributeMetadata = function (session, attrName, currentValue, newValue, currentMeta, newMeta)
    {
        var original = currentValue;
        var currentAttrMeta = (currentMeta != null) ? currentMeta.getAttributeMetadata(attrName) : null;
        var newAttrMeta = (newMeta != null) ? newMeta.getAttributeMetadata(attrName) : null;

        //if we have no metadata about what was set or bound to the attributes, we have no way of knowing what is really supposed to be there if the two are different, 
        //so the safest thing to do is just take what's already in the DOM. This case can occur if an attribute was added to the DOM that is not in the merged htmlContent or if a node was made outside of the binder
        if (currentAttrMeta == null || newAttrMeta == null) return currentAttrMeta;

        if (currentValue === newValue) return currentAttrMeta; //exactly the same, do nothing

        //normalize the strings whitespace
        currentValue = (currentValue != null) ? currentValue.replace(/\s+/g, " ").trim() : "";
        newValue = (newValue != null) ? newValue.replace(/\s+/g, " ").trim() : "";

        //normalized strings match
        if (currentValue === newValue) return currentAttrMeta;

        var unchanged = (currentValue === currentAttrMeta.value);
        if (unchanged === true) //if the attribute wasn't changed since it was last bound, but the new and current values are different, take the new value
        {
            return newAttrMeta;
        }

        var replacmentMeta = new AttributeMetadata();
        replacmentMeta.name = attrName;

        //if we get here, the attribute was changed at runtime and we have to figure out what is the "correct" new value for the attribute given a change in the backing data source.
        var changes = getAttributeChanges(currentValue, currentAttrMeta.value, newValue);
        var valueMappings = mapReBoundAttributeValues(currentAttrMeta, newAttrMeta);
        var numKeys = changes.keys.length;

        var currentValues = EVUI.Modules.Core.Utils.toDictionary(currentAttrMeta.values, function (valueMeta)
        {
            return valueMeta.value;
        });

        var newValues = EVUI.Modules.Core.Utils.toDictionary(newAttrMeta.values, function (valueMeta)
        {
            return valueMeta.value;
        });

        var finalValue = "";
        var tokenizedValue = "";
        var processedAttrs = {};

        for (var x = 0; x < numKeys; x++)
        {
            var curAttrValue = changes.keys[x];

            if (processedAttrs[curAttrValue] === true) continue;
            processedAttrs[curAttrValue] = true;

            var curChange = changes.dictionary[curAttrValue];
            var inCurrent = EVUI.Modules.Core.Utils.hasFlag(curChange.flags, AttributeDifferenceFlags.InCurrent);
            var inOld = EVUI.Modules.Core.Utils.hasFlag(curChange.flags, AttributeDifferenceFlags.InOld);
            var inNew = EVUI.Modules.Core.Utils.hasFlag(curChange.flags, AttributeDifferenceFlags.InNew);
            var valueToAdd = null;
            var tokenToAdd = null;
            var valueMeta = null;

            if (inCurrent === true && inOld === true && inNew === true) //same value was present in all three sources, keep it
            {
                valueToAdd = curAttrValue;
                valueMeta = newValues[curAttrValue];
            }
            else if (inCurrent === true && inOld === true && inNew === false) //same value was in the current and old, but not the new, so check and see if it was one of our bound values
            {
                var mappedValue = valueMappings[curAttrValue]; //if we have a mapping, use the new mapped value. If we don't omit the attribute value.
                if (mappedValue != null)
                {
                    replacmentMeta.containsBoundValues = true;
                    valueToAdd = mappedValue.value;
                    valueMeta = newValues[mappedValue.value];

                    processedAttrs[mappedValue.value] = true;
                }
                else
                {
                    continue;
                }
            }
            else if (inCurrent === true && inOld === false && inNew === true) //a value that is present in the current and new attribute, but not the old - this means it was probably added at runtime and was picked up in a re-bind
            {
                valueToAdd = curAttrValue;
                valueMeta = newValues[curAttrValue];
            }
            else if (inCurrent === true && inOld === false && inNew === false) //a value that's in the current but nowhere else, it's either a rebind or something added at runtime
            {
                var mappedValue = valueMappings[curAttrValue];
                if (mappedValue != null) //it was a rebind, use the rebind
                {
                    replacmentMeta.containsBoundValues = true;
                    valueToAdd = mappedValue.value;
                    valueMeta = newValues[mappedValue.value];

                    processedAttrs[mappedValue.value] = true;
                }
                else //it was added at runtime
                {
                    valueToAdd = curAttrValue;
                    valueMeta = currentValues[curAttrValue];

                    if (valueMeta == null)
                    {
                        valueMeta = new AttributeValueMetadata();
                        valueMeta.tokenizedString = valueToAdd;
                        valueMeta.value = valueToAdd;
                        valueMeta.wasBound = false;
                    }
                }
            }
            else if (inCurrent === false && inOld === true && inNew === true) //a value that was there and is in the rebind, but was likely removed at runtime. Don't include.
            {
                continue;
            }
            else if (inCurrent === false && inOld === true & inNew === false) //a value that was there on the previous bind, but is not there on the new or current rebinds, it was probably removed at runtime. Don't include
            {
                continue;
            }
            else if (inCurrent === false && inOld === false && inNew === true) //a value that was never on the attribute but is in the re-bind list, add it
            {
                var mappedValue = valueMappings[curAttrValue];
                if (mappedValue != null && EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(mappedValue.value) === false) //it was a rebind, use the rebind
                {
                    replacmentMeta.containsBoundValues = true;
                    valueToAdd = mappedValue.value;
                    valueMeta = newValues[mappedValue.value];

                    processedAttrs[mappedValue.value] = true;
                }
            }
            else //if it was in nothing, this block is hit, which shouldn't be possible. It's here for debug purposes.
            {
                continue;
            }

            if (valueToAdd != null) finalValue += valueToAdd + " ";
            if (valueMeta != null)
            {
                tokenizedValue += valueMeta.tokenizedString + " ";
                valueMeta = cloneAttributeValueMetadata(valueMeta);
                replacmentMeta.values.push(valueMeta);
            }
        }

        replacmentMeta.tokenizedValue = tokenizedValue.trim();
        replacmentMeta.value = finalValue.trim();

        return replacmentMeta;
    };

    /**
     * 
     * @param {AttributeValueMetadata} valueMeta
     */
    var cloneAttributeValueMetadata = function (valueMeta)
    {
        var newMeta = new AttributeValueMetadata();
        newMeta.tokenizedString = valueMeta.tokenizedString;
        newMeta.value = valueMeta.value;
        newMeta.wasBound = valueMeta.wasBound;

        var numBindings = valueMeta.boundValues.length;
        for (var x = 0; x < numBindings; x++)
        {
            var curBinding = valueMeta.boundValues[x];
            var newBinding = new BoundAttributeValueMetadata();
            newBinding.boundContent = curBinding.boundContent;
            newBinding.boundPath = curBinding.boundPath;

            newMeta.boundValues.push(newBinding);
        }

        return newMeta;
    };

    var getAttributeChanges = function (currentValue, oldValue, newValue)
    {
        var currentValues = currentValue.split(/\s+/);
        var oldValues = oldValue.split(/\s+/);
        var newValues = newValue.split(/\s+/);

        var valueDic = {};
        var allKeys = [];

        var numCurrent = currentValues.length;
        for (var x = 0; x < numCurrent; x++)
        {
            var attrVal = currentValues[x];
            var difference = valueDic[attrVal];
            if (difference == null)
            {
                difference = new AttributeDifference();
                allKeys.push(attrVal);

                valueDic[attrVal] = difference;
            }

            difference.flags |= AttributeDifferenceFlags.InCurrent;
        }

        var numOld = oldValues.length;
        for (var x = 0; x < numOld; x++)
        {
            var attrVal = oldValues[x];
            var difference = valueDic[attrVal];
            if (difference == null)
            {
                difference = new AttributeDifference();
                allKeys.push(attrVal);

                valueDic[attrVal] = difference;
            }

            difference.flags |= AttributeDifferenceFlags.InOld;
        }

        var numNew = newValues.length;
        for (var x = 0; x < numNew; x++)
        {
            var attrVal = newValues[x];
            var difference = valueDic[attrVal];
            if (difference == null)
            {
                difference = new AttributeDifference();
                allKeys.push(attrVal);

                valueDic[attrVal] = difference;
            }

            difference.flags |= AttributeDifferenceFlags.InNew;
        }

        return { dictionary: valueDic, keys: allKeys };
    };


    /**
     * 
     * @param {AttributeMetadata} currentMeta
     * @param {AttributeMetadata} newMeta
     */
    var mapReBoundAttributeValues = function (currentMeta, newMeta)
    {
        var mappings = {};
        if (currentMeta.containsBoundValues === false || newMeta.containsBoundValues === false) return mappings;

        var currentTokenDic = EVUI.Modules.Core.Utils.toDictionary(currentMeta.values, function (valueMeta)
        {
            if (valueMeta.wasBound === false) return;
            return valueMeta.tokenizedString;
        });

        var newTokenDic = EVUI.Modules.Core.Utils.toDictionary(newMeta.values, function (valueMeta)
        {
            if (valueMeta.wasBound === false) return;
            return valueMeta.tokenizedString;
        });

        var numCurVals = currentMeta.values.length;
        for (var x = 0; x < numCurVals; x++)
        {
            var curVal = currentMeta.values[x];
            if (curVal.wasBound === false) continue;

            var existingBoundVal = currentTokenDic[curVal.tokenizedString];
            if (existingBoundVal == null) continue;
            if (mappings[existingBoundVal.value] != null) continue;

            var newBoundVal = newTokenDic[curVal.tokenizedString];
            mappings[existingBoundVal.value] = newBoundVal;
        }

        var numNewVals = newMeta.values.length;
        for (var x = 0; x < numNewVals; x++)
        {
            var curVal = newMeta.values[x];
            if (curVal.wasBound === false) continue;

            var existingBoundVal = newTokenDic[curVal.tokenizedString];
            if (existingBoundVal == null) continue;
            if (mappings[existingBoundVal.value] != null) continue;

            var newBoundVal = currentTokenDic[curVal.tokenizedString];
            mappings[existingBoundVal.value] = newBoundVal;
        }

        return mappings;
    };

    var AttributeDifference = function ()
    {
        this.flags = AttributeDifferenceFlags.None;
    };

    var AttributeDifferenceFlags =
    {
        None: 0,
        InCurrent: 1,
        InOld: 2,
        InNew: 4
    }

    /**Inserts a Node that is not yet in the DOM and does not have an equivalent replacement node.
    @param {BindingSession} session The BindingSession being executed.
    @param {Node} node The node to insert.*/
    var insertMissingNode = function (session, node)
    {
        //get the target element to insert the node relative to.
        var targetEle = session.bindingHandle.currentState.element;
        if (targetEle != null && targetEle.isConnected === false)
        {
            if (session.bindingHandle.oldState != null) //if the node is not connected, fall back to the old state's node
            {
                targetEle = session.bindingHandle.oldState.element;
            }
        }

        //if we have no target element or it is not connected, but we do have a parent session we could get a reference node out of
        if ((targetEle == null || targetEle.isConnected === false) && session.parentSession != null)
        {
            var numPeers = session.parentSession.bindingHandle.currentState.childBindingHandles.length;
            if (numPeers > 0) //we have "peer" nodes we can insert the node relative to
            {
                if (targetEle != null) //we have a disconnected node, inject the target node relative to the parent's element, then inject the node relative to the target node
                {
                    injectNode(session, session.parentSession.bindingHandle.binding.insertionMode, session.parentSession.bindingHandle.currentState.element, targetEle);
                    injectNode(session, session.bindingHandle.binding.insertionMode, targetEle, node);
                }
                else //we have no node. Go find the nearest piece of content and insert relative to that.
                {
                    var lastBoundContent = null;
                    var childIndex = (session.parentSession.isArray) ? parseInt(session.bindingHandle.currentState.parentBindingKey) - 1 : numPeers - 1; //start at the end, or if the parent is an array, start at the index of the child in the array
                    var lastChild = null;

                    //walk backwards from the starting point to look for some content to inject relative to
                    while (lastBoundContent == null && childIndex >= 0)
                    {
                        lastChild = session.parentSession.bindingHandle.currentState.childBindingHandles[childIndex];
                        lastBoundContent = (lastChild.currentState.boundContent == null) ? null : lastChild.currentState.boundContent[lastChild.currentState.boundContent.length - 1];
                        childIndex--;
                    }

                    if (lastBoundContent != null) //found some content. Because the location of where the content belongs is ambiguous, we just stick it after the last piece of content that has already been inserted
                    {
                        lastBoundContent.after(node);
                        if (session.bindingHandle.currentState.element == null || session.bindingHandle.currentState.element.isConnected === false) session.bindingHandle.currentState.element = lastBoundContent;
                    }
                    else //didn't find any content. The element reference becomes the parent element's reference and we insert the content relative to that
                    {
                        session.bindingHandle.currentState.element = session.parentSession.bindingHandle.currentState.element;
                        injectNode(session, session.bindingHandle.binding.insertionMode, session.bindingHandle.currentState.element, node);
                    }
                }
            }
            else //no peers, insert reference element relative to the parent's element, then insert node relative to reference node
            {
                if (targetEle != null) 
                {
                    injectNode(session, session.parentSession.bindingHandle.binding.insertionMode, session.parentSession.bindingHandle.currentState.element, targetEle);
                }
                else //had no element, set it to be the parent's element
                {
                    session.bindingHandle.currentState.element = session.parentSession.bindingHandle.currentState.element;
                }

                injectNode(session, session.bindingHandle.binding.insertionMode, targetEle, node);
            }
        }
        else
        {
            if (session.lastInsertedNode != null && node.contains(session.lastInsertedNode)) return;

            if (session.bindingHandle.binding.insertionMode === EVUI.Modules.Binding.BindingInsertionMode.InsertAfter || session.bindingHandle.binding.insertionMode === EVUI.Modules.Binding.BindingInsertionMode.InsertBefore)
            {
                injectNode(session, session.bindingHandle.binding.insertionMode, (session.lastInsertedNode == null ? session.bindingHandle.currentState.element : session.lastInsertedNode), node);
            }
            else if (session.bindingHandle.binding.insertionMode === EVUI.Modules.Binding.BindingInsertionMode.ReplaceChildren || session.bindingHandle.binding.insertionMode === EVUI.Modules.Binding.BindingInsertionMode.Shadow)
            {
                if (session.lastInsertedNode != null)
                {
                    injectNode(session, session.bindingHandle.binding.insertionMode, targetEle, node);
                }
                else
                {
                    if (session.bindingHandle.binding.insertionMode === EVUI.Modules.Binding.BindingInsertionMode.Shadow)
                    {
                        injectNode(session, EVUI.Modules.Binding.BindingInsertionMode.Append, targetEle.shadowRoot, node);
                    }
                    else
                    {
                        injectNode(session, EVUI.Modules.Binding.BindingInsertionMode.Append, targetEle, node);
                    }
                }
            }
            else
            {
                injectNode(session, session.bindingHandle.binding.insertionMode, targetEle, node);
            }
        }
    };

    /**Inserts a Node that is not yet in the DOM and does not have an equivalent replacement node.
    @param {BindingSession} session The BindingSession being executed.
    @param {Node} node The node to insert.*/
    var insertMissingNode2 = function (session, node)
    {
        //get the target element to insert the node relative to.
        var targetEle = session.bindingHandle.currentState.element;

        if (targetEle == null) //no element
        {
            if (session.bindingHandle.currentState.parentBindingHandle != null)
            {
                var parentHandle = session.bindingHandle.currentState.parentBindingHandle;
                var numPeers = parentHandle.currentState.childBindingHandles.length;
                if (numPeers > 0) //no target, but we have peers to use to find the nearest element to insert it relative to
                {
                    var lastBoundContent = null;
                    var childIndex = (EVUI.Modules.Core.Utils.isArray(parentHandle.currentState.source) === true) ? parseInt(session.bindingHandle.currentState.parentBindingKey) - 1 : numPeers - 1; //start at the end, or if the parent is an array, start at the index of the child in the array
                    var lastChild = null;

                    //walk backwards from the starting point to look for some content to inject relative to
                    while (lastBoundContent == null && childIndex >= 0)
                    {
                        lastChild = parentHandle.currentState.childBindingHandles[childIndex];
                        lastBoundContent = (lastChild.currentState.boundContent == null) ? null : lastChild.currentState.boundContent[lastChild.currentState.boundContent.length - 1];
                        childIndex--;
                    }

                    if (lastBoundContent != null) //found some content. Because the location of where the content belongs is ambiguous, we just stick it after the last piece of content that has already been inserted
                    {
                        lastBoundContent.after(node);
                        if (session.bindingHandle.currentState.element == null || session.bindingHandle.currentState.element.isConnected === false) session.bindingHandle.currentState.element = lastBoundContent;
                    }
                    else //didn't find any content. The element reference becomes the parent element's reference and we insert the content relative to that
                    {
                        var parentTarget = parentHandle.currentState.element;
                        if (parentTarget == null)
                        {
                            if (session.parentSession != null)
                            {
                                if (session.parentSession.bindingHandle.currentState.boundContentFragment == null) session.parentSession.bindingHandle.currentState.boundContentFragment = toDomNode(session.parentSession.bindingHandle.currentState.boundContentTree); // toNode();
                                insertMissingNode2(session.parentSession, session.parentSession.bindingHandle.currentState.boundContentFragment);
                            }
                            else
                            {
                                throw Error("Unresolvable parent element target in binding " + session.bindingHandle.id + ".");
                            }
                        }
                        else if (parentTarget.isConnected === false && parentHandle.oldStateBound === true && parentHandle.oldState.element != null && parentHandle.oldState.element.isConnected === true)
                        {
                            session.bindingHandle.currentState.element = parentHandle.oldState.element;
                        }
                        else
                        {
                            session.bindingHandle.currentState.element = parentHandle.currentState.element;
                        }

                        if (session.bindingHandle.currentState.element != null)
                        {
                            injectNode(session, session.bindingHandle.binding.insertionMode, session.bindingHandle.currentState.element, node);
                        }
                    }
                }
                else //we have no node and no other peers in the handle to insert relative to.
                {
                    if (session.lastInsertedNode != null) //we've inserted a node so far, insert after that node as the next most logical place to put the content.
                    {
                        session.bindingHandle.currentState.element = session.lastInsertedNode;
                        injectNode(session, session.bindingHandle.binding.insertionMode, session.bindingHandle.currentState.element, node);
                    }
                    else //we have no reference where to put the node, put it under the parent
                    {
                        var numParentContent = parentHandle.currentState.boundContent.length;
                        if (numParentContent > 0)
                        {
                            session.bindingHandle.currentState.element = parentHandle.currentState.boundContent[numParentContent - 1];
                            injectNode(session, EVUI.Modules.Binding.BindingInsertionMode.InsertAfter, session.bindingHandle.currentState.element, node);
                        }
                        else
                        {
                            session.bindingHandle.currentState.element = parentHandle.currentState.element;
                            injectNode(session, parentHandle.binding.insertionMode, session.bindingHandle.currentState.element, node);
                        }
                    }
                }
            }
            else
            {
                if (session.lastInsertedNode != null) //we've inserted a node so far, insert after that node as the next most logical place to put the content.
                {
                    session.bindingHandle.currentState.element = session.lastInsertedNode;
                    injectNode(session, session.bindingHandle.binding.insertionMode, session.bindingHandle.currentState.element, node);
                }
                else //we have no reference where to put the node, put it under the parent
                {
                    var parentHandle = session.bindingHandle.currentState.parentBindingHandle;
                    if (parentHandle != null)
                    {
                        var numParentContent = session.bindingHandle.currentState.boundContent.length;
                        if (numParentContent > 0)
                        {
                            session.bindingHandle.currentState.element = parentHandle.currentState.boundContent[numParentContent - 1];
                            injectNode(session, EVUI.Modules.Binding.BindingInsertionMode.InsertAfter, session.bindingHandle.currentState.element, node);
                        }
                        else
                        {
                            session.bindingHandle.currentState.element = parentHandle.currentState.element;
                            injectNode(session, parentHandle.binding.insertionMode, session.bindingHandle.currentState.element, node);
                        }
                    }
                    else
                    {
                        injectNode(session, session.bindingHandle.binding.insertionMode, session.bindingHandle.currentState.element, node);
                    }
                }
            }
        }
        else //connected element
        {
            injectNode(session, session.bindingHandle.binding.insertionMode, session.bindingHandle.currentState.element, node);
        }
    };

    /**Determines whether or not a value is actually a DomTreeElement based on duck-typing.
    @param {Object} value The value to test.
    @returns {Boolean}*/
    var isDomTreeElement = function (value)
    {
        if (value != null && typeof value.type === "number" && typeof value.tagName === "string")
        {
            return true;
        }

        return false;
    };

    /**Gets the parentComparison of a given diff that contains the parentNode of the nodes in the original diff.
    @param {BinidngSession} session The BindingSession being executed.
    @param {EVUI.Modules.Diff.Comparison} diff The comparison of DomTree's to get the parent DomTrees or node of.
    @returns {EVUI.Modules.Diff.Comparison}*/
    var getParentNodeDiff = function (session, diff)
    {
        if (isDomTreeElement(diff.a) === true || isDomTreeElement(diff.b) === true)
        {
            var parentComp = diff.parentComparison; //will always be an array
            if (parentComp.parentComparison == null)
            {
                return null;
            }
            else
            {
                return parentComp.parentComparison;
            }

        }
        else //comp is an array, parent is always an element
        {
            return diff.parentComparison;
        }
    };

    var toDomNode = function (domTreeEle)
    {
        var node = domTreeEle.toNode();
        assignElementMetadata(domTreeEle);

        return node;
    };

    /********************************************************************************BINDING HTML PROCESSING***************************************************************************/

    /**Turns a string of Html into a DomTreeElement representing a DocumentFragment containing the parsed Html.
    @param {BindingSession} session The BindingSession being executed.
    @param {String} htmlStr The string of Html to turn into a DomTreeElement.
    @param {HtmlContentMetadata}  htmlContentMetadata The metadata that describes the special properties of the html content.
    @returns {EVUI.Modules.DomTree.DomTreeElement}*/
    var stringToDomTree = function (session, htmlStr, htmlContentMetadata)
    {
        var tree = _services.domTreeConverter.htmlToDomTree(htmlStr);
        if (tree == null)
        {
            tree = _services.domTreeConverter.toDomTreeElement(document.createTextNode(""));
        }

        session.boundPropertyDictionary = {};
        var numProps = session.bindingHandle.currentState.boundProperties.length;
        for (var x = 0; x < numProps; x++)
        {
            var curProp = session.bindingHandle.currentState.boundProperties[x];

            if (typeof curProp.value === "function")
            {
                session.boundPropertyDictionary[curProp.path] = { value: "$evui.dispatch(event, '" + getInvocationHash(session, curProp) + "'" };
            }
            else
            {
                session.boundPropertyDictionary[curProp.path] = { value: curProp.value };
            }
        }

        tree.search(function (ele)
        {
            var metadata = buildElementMetadata(session, ele);
            if (metadata != null) ele[_hashMarker] = metadata;
        });

        return tree;
    };

    /**Removes all of the Node references from a DomTreeElement.
    @param {BindingSession} session The BindingSession being executed.
    @param {EVUI.Modules.DomTree.DomTreeElement} domTree The DomTreeElement hierarchy to purge node references from.*/
    var purgeDomTreeNodes = function (domTree)
    {
        if (domTree == null) return;

        domTree.node = undefined;
        if (domTree.content == null || typeof domTree.content === "string") return;

        var numChildren = domTree.content.length;
        for (var x = 0; x < numChildren; x++)
        {
            purgeDomTreeNodes(domTree.content[x]);
        }
    };

    var assignElementMetadata = function (domTree)
    {
        if (domTree == null) return;

        var node = domTree.node;
        if (node == null) return;

        var metadata = domTree[_hashMarker];
        if (metadata == null) return;

        node[_hashMarker] = metadata;

        if (domTree.content == null || typeof domTree.content === "string") return;

        var numChildren = domTree.content.length;
        for (var x = 0; x < numChildren; x++)
        {
            assignElementMetadata(domTree.content[x]);
        }
    };

    /**Gets the htmlContent to use in a binding.
    @param {BindingSession} session The BindingSession being executed.
    @param {Function} callback A callback function that is called when the htmlContent is resolved. Takes the htmlContent as a parameter.*/
    var getHtmlContent = function (session, callback)
    {
        if (typeof callback !== "function") callback = function (htmlContent) { };

        //if it's an object, treat it like it's a BindingHtmlContent, or possibly an element.
        if (typeof session.bindingHandle.currentState.htmlContent === "object" && session.bindingHandle.currentState.htmlContent != null)
        {
            if (EVUI.Modules.Core.Utils.isElement(session.bindingHandle.currentState.htmlContent) === true)
            {
                return callback(session.bindingHandle.currentState.htmlContent.outerHTML);
            }
            else
            {
                return gethtmlContentFromBindingHtmlContent(session, session.bindingHandle.currentState.htmlContent, function (result)
                {
                    callback(result);
                });
            }
        }
        else if (typeof session.bindingHandle.currentState.htmlContent === "string" && EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(session.bindingHandle.currentState.htmlContent) === false)
        {
            //if we have a string of htmlContent, it's either an actual piece of htmlContent or is the name of some pre-loaded html.
            var htmlContentEntry = getHtmlContentEntry(session.bindingHandle.currentState.htmlContent);
            if (htmlContentEntry != null) //it was the name of a content entry, use it's html
            {
                session.bindingHandle.htmlContent = htmlContentEntry;
                if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(htmlContentEntry.content) === true && EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(htmlContentEntry.url) === false) //if the content is empty but the URL is not, we need to make a HTTP request to go get the content.
                {
                    return getHtmlContentViaHttp(session, htmlContentEntry, function (content)
                    {
                        return callback(content);
                    });
                }
                else //otherwise just return the html content
                {
                    return callback(session.bindingHandle.htmlContent.content);
                }
            }
            else //was not the name of a content entry, use it by itself as the html content
            {
                return callback(session.bindingHandle.currentState.htmlContent);
            }
        }
        else //invalid input
        {
            return callback(null);
        }
    };

    /**Gets the boundProperties for a a given piece of htmlContent and the source object being used to populate it with.
    @param {BindingSession} session The bindingSession being executed.
    @param {Function} callback A callback function to call once the bindings are resolved. Takes an array of BoundProperty as a parameter.*/
    var getBoundProperties = function (session, callback)
    {
        //the html content was set in the events, go get it again
        if (session.bindingHandle.currentState.htmlContentSet === true)
        {
            getHtmlContent(session, function (htmlContent)
            {
                if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(htmlContent) === true) //get content failed, this will fail the binding operation
                {
                    return callback(null);
                }
                else
                {
                    session.bindingHandle.currentState.htmlContent = htmlContent;

                    var bindings = getTokenMappings(session);

                    //if the source observer hasn't been set yet, go get it either from the old state if we're re-binding the same object, or make a new one/get part of the parent's observer.
                    if (session.bindingHandle.currentState.sourceObserver == null)
                    {
                        if (session.bindingHandle.oldStateBound === true && session.bindingHandle.currentState.source === session.bindingHandle.oldState.source && session.bindingHandle.oldState.sourceObserver != null)
                        {
                            session.bindingHandle.currentState.sourceObserver = session.bindingHandle.oldState.sourceObserver;
                        }
                        else
                        {
                            session.bindingHandle.currentState.sourceObserver = getCurrentSourceObjectObserver(session); //new EVUI.Modules.Observers.ObjectObserver(session.bindingHandle.currentState.source);
                        }
                    }

                    //finally, get the values for the bindings from the source object.
                    callback(getBoundPropertyValues(session, bindings));
                }
            });
        }
        else //the html content was unchanged
        {
            //if the htmlContent is an entry, get it's actual html string content
            if (session.bindingHandle.currentState.htmlContent != null && typeof session.bindingHandle.currentState.htmlContent === "object") session.bindingHandle.currentState.htmlContent = session.bindingHandle.currentState.htmlContent.content;

            //we have no html content. Fail.
            if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(session.bindingHandle.currentState.htmlContent) === true) return callback(null);

            //if the source observer hasn't been set yet, go get it either from the old state if we're re-binding the same object, or make a new one/get part of the parent's observer.
            if (session.bindingHandle.currentState.sourceObserver == null)
            {
                if (session.bindingHandle.oldStateBound === true && session.bindingHandle.currentState.source === session.bindingHandle.oldState.source && session.bindingHandle.oldState.sourceObserver != null)
                {
                    session.bindingHandle.currentState.sourceObserver = session.bindingHandle.oldState.sourceObserver;
                }
                else
                {
                    session.bindingHandle.currentState.sourceObserver = getCurrentSourceObjectObserver(session); // new EVUI.Modules.Observers.ObjectObserver(session.bindingHandle.currentState.source);
                }
            }

            var bindings = null;
            if (session.parentSession != null && session.parentSession.isArray === true && session.parentSession.bindingHandle.currentState.boundProperties != null && session.parentSession.bindingHandle.currentState.htmlContent === session.bindingHandle.currentState.htmlContent) //arrays always have the same bindings for their children, so make a copy of them rather than going and getting them again.
            {
                return callback(session.parentSession.bindingHandle.currentState.boundProperties.map(function (bp) { return new EVUI.Modules.Binding.BoundProperty(bp.path); }));
            }
            else
            {
                bindings = getTokenMappings(session);
            }

            //finally, get the values for the bindings from the source object.
            return callback(getBoundPropertyValues(session, bindings));
        }
    };

    /**Determines if there was a change in any of the bound properties from their original values.
    @param {EVUI.Modules.Binding.BoundProperty[]} oldProps The original properties that were calculated for the Binding.
    @param {EVUI.Modules.Binding.BoundProperty[]} newProps The properties that the user had access to and could have changed.
    @returns {Boolean} */
    var areBoundPropsChanged = function (oldProps, newProps)
    {
        newProps = newProps.slice();
        var numOld = oldProps.length;
        var numNew = newProps.length;

        if (numOld !== numNew) return true;

        for (var x = 0; x < numOld; x++)
        {
            var curOld = oldProps[x];
            for (var y = 0; y < numNew; y++)
            {
                var curNew = newProps[y];
                if (curNew.path === curOld.path && curNew.value === curOld.value)
                {
                    numNew--;
                    newProps.splice(y, 1);
                    break;
                }
            }
        }

        if (numNew > 0) return true;
        return false;
    };

    /**Determines whether or not a Binding should re-bind itself in response to changes made to its source object. Only changes made directly to the source object dictate if it should be re-bound or not, child object changes are ignored.
    @param {BindingSession} session The BindingSession being executed.
    @returns {Boolean}*/
    var shouldReBind = function (session)
    {
        //if (session.bindingHandle.oldState.htmlContent === session.bindingHandle.currentState.htmlContent) //can only re-bind if the html content is still the same
        //{
        if (session.bindingHandle.oldState.source === session.bindingHandle.currentState.source) //re-binding the same object
        {
            if (session.bindingHandle.currentState.sourceObserver == null)
            {
                if (session.bindingHandle.oldStateBound === true && session.bindingHandle.oldState.sourceObserver != null)
                {
                    session.bindingHandle.currentState.sourceObserver = session.bindingHandle.oldState.sourceObserver;
                }
                else
                {
                    session.bindingHandle.currentState.sourceObserver = getCurrentSourceObjectObserver(session); //new EVUI.Modules.Observers.ObjectObserver(session.bindingHandle.currentState.source);
                }
            }

            //if we have child handles, go get the current state of the object before updating it in the object observer
            if (session.bindingHandle.oldState.childBindingHandles.length > 0)
            {
                session.oldStateDictionary = session.bindingHandle.currentState.sourceObserver.getObservedProperties();
            }
            else if (session.parentSession != null && session.parentSession.oldStateDictionary != null) //if we have a parent, we need to go get our copy of the oldStateDictionary because getting all the changes from the sourceObserver makes the child observers not detect any changes.
            {
                session.oldStateDictionary = session.parentSession.oldStateDictionary.getChild(session.bindingHandle.currentState.parentBindingKey);
            }

            session.observedDifferences = (session.observedDifferences != null) ? session.observedDifferences : session.bindingHandle.currentState.sourceObserver.getChanges(true);
            if (session.bindingHandle.canceledDuringReBind === true)
            {
                session.bindingHandle.canceledDuringReBind = false;
                return true;
            }

            //if we're a child with a parent, use the oldStateDictionary to determine if we changed or not.
            if (session.oldStateDictionary != null && session.parentSession != null)
            {
                if (session.oldStateDictionary.haveChildrenChanged() === true) return true;
            }

            if (session.bindingHandle.oldState.htmlContent !== session.bindingHandle.currentState.htmlContent) return true;

            var numDiffs = session.observedDifferences.length;
            if (numDiffs === 0)
            {
                return false;
            }
            else
            {
                var changed = false;
                for (var x = 0; x < numDiffs; x++)
                {
                    var curDiff = session.observedDifferences[x];
                    if (curDiff.hostObject === session.bindingHandle.currentState.source)
                    {
                        changed = true;
                        break;
                    }
                }


                if (changed === false) return false;
            }
        }
        else //binding a new object
        {
            if (session.bindingHandle.currentState.sourceObserver == null)
            {
                session.bindingHandle.currentState.sourceObserver = getCurrentSourceObjectObserver(session);

                if (session.bindingHandle.oldState.childBindingHandles.length > 0)
                {
                    session.oldStateDictionary = session.bindingHandle.currentState.sourceObserver.getObservedProperties();
                }
                else if (session.parentSession != null && session.parentSession.oldStateDictionary != null)
                {
                    session.oldStateDictionary = session.parentSession.oldStateDictionary.getChild(session.bindingHandle.currentState.parentBindingKey);
                }
            }

            //get the differences including any new object references if we're binding a new object
            session.observedDifferences = (session.observedDifferences != null) ? session.observedDifferences : _services.diffController.compare(session.bindingHandle.currentState.source, session.bindingHandle.oldState.source);
            if (session.bindingHandle.canceledDuringReBind === true)
            {
                session.bindingHandle.canceledDuringReBind = false;
                return true;
            }


            return true; //we always re-bind new objects.

            //if (session.bindingHandle.oldState.htmlContent !== session.bindingHandle.currentState.htmlContent) return true;

            //see if any of the root comparisons was an actual change to this object
            //var changed = false;
            //var numDiffs = session.observedDifferences.rootComparison.differences.length;
            //for (var x = 0; x < numDiffs; x++)
            //{
            //    var curDiff = session.observedDifferences.rootComparison.differences[x];
            //    if (curDiff.flags != EVUI.Modules.Diff.DiffFlags.Children)
            //    {
            //        changed = true;
            //        break;
            //    }
            //}

            if (changed === false) return false;
        }
        //}

        session.bindingHandle.canceledDuringReBind = false;
        return true;
    };

    /**Determines whether or not the current session will use special behavior when using an array.
    @param {BindingSession} session The BindingSession being executed.
    @returns {Boolean}*/
    var isArrayMode = function (session)
    {
        if (session.bindingHandle.options.enumerateArrays === true && session.isArray === true)
        {
            return true;
        }

        return false;
    }

    /**Makes sure that the value of a bound property is updated to be the value of the path in the source object if the value was not explicitly changed by the user in an event.
    @param {BindingSession} session The BindingSession being executed.
    @returns {EVUI.Modules.Binding.BoundProperty[]} */
    var syncBoundProperties2 = function (session)
    {
        var originals = session.originalBoundProps;
        var numOriginals = originals.length;
        var originalDic = {};
        var newProps = session.bindingHandle.binding.getBoundProperties(); //session.bindingHandle.binding.boundProperties;
        var numNew = newProps.length;
        var finals = [];
        var finalDic = {};

        for (var x = 0; x < numOriginals; x++)
        {
            var curOrig = originals[x];
            originalDic[curOrig.path] = curOrig;
        }


        for (var x = 0; x < numNew; x++)
        {
            var curNew = newProps[x];
            if (curNew == null || EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(curNew.path)) continue;

            var original = originalDic[curNew.path];
            var final = finalDic[curNew.path];
            var finalExisted = final == null;

            if (final == null) final = new EVUI.Modules.Binding.BoundProperty(curNew.path);

            final.value = curNew.value;

            if (original != null) 
            {
                if (curNew.value === original.value && session.isArray === false) //the value was never set, update the final property record. If the value was set to anything else, we use that instead.
                {
                    var curValue = (session.isArray === true) ? null : EVUI.Modules.Core.Utils.getValue(curNew.path, session.bindingHandle.currentState.source);
                    if (curNew.value !== curValue) //value is different than what is in the object
                    {
                        final.value = curValue;
                    }
                }
            }

            if (finalExisted === true)
            {
                finalDic[curNew.path] = final;
                finals.push(final);
            }
        }

        return finals;
    };


    /**Gets the names of the bound properties that were found in the htmlContent. Gets them either directly from the htmlContent or from the HtmlContentEntry's list of cached tokenMappings.
    @param {BindingSession} session The BindingSession being executed.
    @returns {TokenMapping[]} */
    var getTokenMappings = function (session)
    {
        var mappings = [];
        if (session.bindingHandle.htmlContent != null && session.bindingHandle.htmlContent.content === session.bindingHandle.currentState.htmlContent)
        {
            if (session.bindingHandle.htmlContent.needsRecalcuation === false && session.bindingHandle.htmlContent.tokenMappings != null) //if we have a HtmlContentEntry with existing token mappings, use them
            {
                mappings = session.bindingHandle.htmlContent.tokenMappings;
            }
            else //otherwise go get them and assign them to the entry
            {
                mappings = getTokenMappingsFromHtmlContent(session.bindingHandle.htmlContent.content);
                session.bindingHandle.htmlContent.needsRecalcuation = false;
                session.bindingHandle.htmlContent.tokenMappings = mappings;
            }
        }
        else
        {
            mappings = getTokenMappingsFromHtmlContent(session.bindingHandle.currentState.htmlContent);
        }

        return mappings;
    };


    /**Gets all the values from the source object that match the properties at the given paths.
    @param {BindingSession} session The BindingSession being executed.
    @param {TokenMapping[]} mappings The token mappings of the bound properties that were found in the htmlContent.
    @returns {EVUI.Modules.Binding.BoundProperty[]} */
    var getBoundPropertyValues = function (session, mappings)
    {
        var boundProps = [];
        var isArray = isArrayMode(session);
        var numMappings = mappings.length;
        for (var x = 0; x < numMappings; x++)
        {
            var curToken = mappings[x];
            var boundProp = new EVUI.Modules.Binding.BoundProperty(curToken.path);

            if (isArray === false || (session.bindingHandle.currentState.parentBinding != null && curToken.value !== undefined))
            {
                try
                {
                    boundProp.value = EVUI.Modules.Core.Utils.getValue(curToken.path, session.bindingHandle.currentState.source);
                }
                catch (ex)
                {
                    EVUI.Modules.Core.Utils.log(ex);
                }
            }

            boundProps.push(boundProp);
        }

        return boundProps;
    };

    /**Gets the actual HTML content from a BindingHtmlContent object.
    @param {BindingSession} session The BindingSession being executed.
    @param {EVUI.Modules.Binding.BindingHtmlContent} contentEntry The container for the Html content.
    @param {Function} callback A callback function to call to pass the raw Html into.*/
    var gethtmlContentFromBindingHtmlContent = function (session, contentEntry, callback)
    {
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(contentEntry.content) === false) //we have a valid htmlContent, use it
        {
            session.bindingHandle.htmlContent = getHtmlContentEntry(contentEntry.key);
            return callback(contentEntry.content);
        }
        else //we do not have a valid htmlContent, go get it
        {
            var freshEntry = false;
            var entry = null;
            if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(contentEntry.key) === false) //lookup by key to see if we have a match
            {
                entry = getHtmlContentEntry(contentEntry.key);
            }
            else if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(contentEntry.url) === false) //lookup by URL to see if we have a match
            {
                var numEntries = _bindingHtmlContentEntries.length;
                for (var x = 0; x < numEntries; x++)
                {
                    var curEntry = _bindingHtmlContentEntries[x];
                    if (curEntry.url === contentEntry.url && curEntry.ignoreUrl === false)
                    {
                        entry = curEntry;
                        break;
                    }
                }
            }

            if (entry == null) //both lookups failed, make a new entry
            {
                entry = new BindingHtmlContentEntry();
                entry.key = contentEntry.key;
                entry.url = contentEntry.url;

                freshEntry = true;
            }

            if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(entry.content) === false) return callback(entry.content); //lookup found an existing valid htmlContent
            if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(entry.url) === false) //no htmlContent yet, but we have a URL
            {
                if (freshEntry === true && session.bindingHandle.options.addMissingHtmlContent !== false)
                {
                    if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(entry.key) === true) entry.key = EVUI.Modules.Core.Utils.makeGuid();
                    _bindingHtmlContentEntries.push(entry);

                    session.bindingHandle.htmlContent = entry;
                }

                return getHtmlContentViaHttp(session, entry, function (result)
                {
                    callback(result);
                });
            }
            else //no htmlContent match and no url means no htmlContent can be found
            {
                return callback(null);
            }
        }
    };

    /**********************************************************************************BINDING CHILD SESSIONS******************************************************************************* */

    /**Gets all the children of the current Binding based on the presence of the "evui-binder-obj" attribute on a child node of the current Binding's boundContentFragment or boundContentTree.
    @param {BindingSession} session The BindingSession being executed.
    @returns {BoundChild[]} */
    var getBoundChildren = function (session)
    {
        var boundChildren = [];
        if (session.bindingHandle.currentState.boundContentFragment != null) //if we have a fragment, search it for bound children - this will be true if the user accessed the bound content fragment from the binding object.
        {
            var elements = new EVUI.Modules.Dom.DomHelper("[" + EVUI.Modules.Binding.Constants.Attr_BoundObj + "]", session.bindingHandle.currentState.boundContentFragment);
            var numEles = elements.elements.length;
            for (var x = 0; x < numEles; x++)
            {
                var curEle = elements.elements[x];
                var path = curEle.getAttribute(EVUI.Modules.Binding.Constants.Attr_BoundObj);
                if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(path) === true) continue;

                var boundChild = new BoundChild();
                boundChild.element = curEle;
                boundChild.path = path;
                boundChild.source = EVUI.Modules.Core.Utils.getValue(path, session.bindingHandle.currentState.source);

                boundChildren.push(boundChild);
            }
        }
        else if (session.bindingHandle.currentState.boundContentTree != null && session.bindingHandle.currentState.mergedHtmlContent.indexOf(EVUI.Modules.Binding.Constants.Attr_BoundObj) !== -1) //otherwise, search the DomElementTree for nodes with the matching attribute name on them (but only if the merged content actually has the attribute name in it)
        {
            var boundParents = session.bindingHandle.currentState.boundContentTree.search(function (domTree)
            {
                if (domTree.attrs == null) return false;
                var numAttrs = domTree.attrs.length;
                for (var x = 0; x < numAttrs; x++)
                {
                    var curAttr = domTree.attrs[x];
                    if (curAttr.key === EVUI.Modules.Binding.Constants.Attr_BoundObj)
                    {
                        return true;
                    }
                }
            }, true);

            if (boundParents != null && boundParents.length > 0) //we found some elements that have the correct attribute, turn the whole tree into a document fragment and go get the bound children out of it like normal.
            {
                session.bindingHandle.currentState.boundContentFragment = toDomNode(session.bindingHandle.currentState.boundContentTree); //session.bindingHandle.currentState.boundContentTree.toNode();
                if (session.bindingHandle.currentState.boundContentFragment != null) return getBoundChildren(session);
            }
        }

        return boundChildren;
    };

    /**Makes a BindingHandle for each child of a Binding who's source is an array of objects.
    @param {BindingSession} session The BindingSession being executed.
    @returns {BindingHandle[]}*/
    var makeArrayChildren = function (session)
    {
        //arrays of arrays without some sort of anchor or wrapping object or anchoring element don't work correctly, so we just ignore them.
        if (session.parentSession != null && session.parentSession.isArray === true && session.bindingHandle.currentState.element == null) return [];

        var boundChildren = [];
        var numChildren = session.bindingHandle.currentState.source.length;

        for (var x = 0; x < numChildren; x++)
        {
            var path = x.toString();
            var partialBinding = new EVUI.Modules.Binding.BindArgs();

            var insertionMode = session.bindingHandle.binding.insertionMode;
            if (insertionMode === EVUI.Modules.Binding.BindingInsertionMode.Default)
            {
                if (x === 0) //first element is always appended beneath the parent element if it was set to default, otherwise it's an "insert after" insertion
                {
                    insertionMode = EVUI.Modules.Binding.BindingInsertionMode.Default;
                }
                else
                {
                    insertionMode = EVUI.Modules.Binding.BindingInsertionMode.InsertAfter;
                }
            }

            partialBinding.bindingSource = session.bindingHandle.currentState.source[x];
            partialBinding.templateName = session.bindingHandle.templateName;
            partialBinding.htmlContent = (session.bindingHandle.htmlContent != null) ? session.bindingHandle.htmlContent.key : session.bindingHandle.currentState.htmlContent;
            partialBinding.bindingMode = session.bindingHandle.binding.bindingMode;
            partialBinding.insertionMode = insertionMode;

            var bindingHandle = getBindingHandleAmbiguously(partialBinding, session.bindingHandle);
            if (bindingHandle == null) continue;

            bindingHandle.currentState.parentBindingHandle = session.bindingHandle;
            bindingHandle.currentState.parentBindingPath = path;
            bindingHandle.currentState.parentBindingKey = path;
            bindingHandle.currentState.boundProperties = session.bindingHandle.currentState.boundProperties.map(function (prop) { var newProp = new EVUI.Modules.Binding.BoundProperty(prop.path); newProp.value = prop.value; return newProp });

            boundChildren.push(bindingHandle);
        }

        return boundChildren;
    }

    /**Recalculates the child bindings of the Binding and re-maps the existing ones to new property names if their property names changed and adds new children if new children were added.
    @param {BindingSession} session The BindingSession being executed.*/
    var reMapBoundChildren = function (session)
    {
        //get all the bound children from the markup
        var boundChildren = getBoundChildren(session);
        var numBoundChildren = boundChildren.length;
        if (numBoundChildren === 0) return;

        var pathDic = makeChangeDictionary(session, session.bindingHandle.oldState.childBindingHandles);
        var unfoundPathDic = makeChangeDictionary(session, session.bindingHandle.oldState.childBindingHandles);

        var numChildren = session.bindingHandle.oldState.childBindingHandles.length;
        var childBindings = session.bindingHandle.oldState.childBindingHandles.slice();
        var remainingIndexes = {};
        var hashes = makeChangeHashDictionary(session, session.bindingHandle.oldState.childBindingHandles);

        //make a dictionary of all the children based on their paths from the Binding's source to the object being bound and a dictionary of all the indexes to search (which is all of them, but elements are removed form that dictionary as they are found later on)
        for (var x = 0; x < numChildren; x++)
        {
            //var curChild = childBindings[x];
            //pathDic[curChild.currentState.parentBindingPath] = { binding: curChild, index: x }; //get the binding and the index paired together since things are likely out of order when listed in the childBinindgs list vs the bouncChildren 
            remainingIndexes[x] = x;
        }

        //make a temporary object to hold the state for the re-mapping process
        var mappingSession = {};
        mappingSession.pathDic = pathDic; //dictionary of all paths to bindings
        mappingSession.unfoundPathDic = unfoundPathDic;
        mappingSession.numChildren = numChildren; //the number children in the old list
        mappingSession.childBindings = childBindings; //the old child bindings
        mappingSession.numOldChildren = numChildren; //the total number of remaining old children to loop through (is decreased every time an old binding is located)
        mappingSession.remainingIndexes = remainingIndexes; //dictionary of all the indexes left to search
        mappingSession.indexKeys = Object.keys(remainingIndexes); //the keys in the dictionary of indexes left to search (so we only have to get it once)
        mappingSession.numKeys = mappingSession.indexKeys.length; //the number of keys (so we only have to look it up once)
        mappingSession.makeNewKeys = false; //flag indicating whether or not the keys of remainingIndexes needs to be calculated again
        mappingSession.hashDic = hashes;

        //re-map each bound child that was found in the final boundContentFragment
        for (var x = 0; x < numBoundChildren; x++)
        {
            var curBoundChild = boundChildren[x];
            var path = curBoundChild.path;
            var source = curBoundChild.source;
            var ele = curBoundChild.element;

            reMapChild(session, mappingSession, path, source, ele);
        }

        removeObjectHashes(session, session.bindingHandle.oldState.childBindingHandles);
        removeObjectHashes(session, session.bindingHandle.currentState.childBindingHandles);
    };

    /**Walks the list of new children of an array and re-maps the existing children into new locations if they were moved within the array or creates binding handles for new children who were previously not in the array.
    @param {BindingSession} session The BindingSession being executed.*/
    var reMapArrayChildren = function (session)
    {
        var pathDic = makeChangeDictionary(session, session.bindingHandle.oldState.childBindingHandles);
        var unfoundPathDic = makeChangeDictionary(session, session.bindingHandle.oldState.childBindingHandles);
        var arrayLength = session.bindingHandle.currentState.source.length;
        var numChildren = session.bindingHandle.oldState.childBindingHandles.length;
        var childBindings = session.bindingHandle.oldState.childBindingHandles.slice();
        var remainingIndexes = {}; //[];
        var hashes = makeChangeHashDictionary(session, session.bindingHandle.oldState.childBindingHandles);

         //make a dictionary of all the children based on their paths from the Binding's source to the object being bound and a dictionary of all the indexes to search (which is all of them, but elements are removed form that dictionary as they are found later on)
        for (var x = 0; x < numChildren; x++)
        {
            //var curChild = childBindings[x];
            //pathDic[curChild.currentState.parentBindingPath] = { binding: curChild, index: x };
            remainingIndexes[x] = x;
        }

        //make a temporary object to hold the state for the re-mapping process
        var mappingSession = {};
        mappingSession.pathDic = pathDic; //dictionary of all paths to bindings
        mappingSession.unfoundPathDic = unfoundPathDic;
        mappingSession.numChildren = numChildren; //the number children in the old list
        mappingSession.childBindings = childBindings; //the old child bindings
        mappingSession.numOldChildren = numChildren; //the total number of remaining old children to loop through (is decreased every time an old binding is located)
        mappingSession.remainingIndexes = remainingIndexes; //dictionary of all the indexes left to search
        mappingSession.indexKeys = Object.keys(remainingIndexes); //the keys in the dictionary of indexes left to search (so we only have to get it once)
        mappingSession.numKeys = mappingSession.indexKeys.length;  //the number of keys (so we only have to look it up once)
        mappingSession.makeNewKeys = false;  //flag indicating whether or not the keys of remainingIndexes needs to be calculated again
        mappingSession.hashDic = hashes;

        //each object in the array is a child and needs to be re mapped
        for (var x = 0; x < arrayLength; x++)
        {
            var path = x.toString();
            var curObj = session.bindingHandle.currentState.source[x];

            reMapChild(session, mappingSession, path, curObj);
        }

        removeObjectHashes(session, session.bindingHandle.oldState.childBindingHandles);
        removeObjectHashes(session, session.bindingHandle.currentState.childBindingHandles);
    };

    /**Re-maps a child binding into a new or the same location when re-binding a Binding with child mappings.
    @param {BindingSession} session The parent BindingSession of the objects being bound.
    @param {Object} mappingSession All of the state variables used to re-map all the children of the parent BindingSession being executed.
    @param {String} path The path from the BindingSession's current source to the object being bound.
    @param {Object} curObj The object found at the path.
    @param {Element} ele The element that pointed at the object found at the path.*/
    var reMapChild = function (session, mappingSession, path, curObj, ele)
    {
        var found = false;

        var existing = getBindingContentList(mappingSession.pathDic, getNormalizedPath(path));
        var unprocessed = (existing != null) ? existing.getNextUnprocessedBinding() : null;
        if (unprocessed != null) unprocessed.processed = true;

        if (unprocessed == null || (unprocessed.binding.currentState.source !== curObj && session.bindingHandle.currentState.source === session.bindingHandle.oldState.source)) //same source object, but missing binding or different child objects found
        {
            if (curObj != null)
            {
                var objHash = curObj[_hashMarker];
                if (objHash != null)
                {
                    existing = mappingSession.hashDic[objHash];
                    if (existing != null)
                    {
                        for (var x = 0; x < existing.numBindings; x++)
                        {
                            var curUnprocessed = existing.bindings[x];
                            if (curUnprocessed.processed === true) continue;
                            if (curUnprocessed.binding.currentState.source === curObj)
                            {
                                curUnprocessed.processed = true;
                                unprocessed = curUnprocessed.binding;
                                found = true;
                                break;
                            }
                        }
                    }
                }
            }
        }
        else if (unprocessed == null || (unprocessed.binding.currentState.source !== curObj && session.bindingHandle.currentState.source !== session.bindingHandle.oldState.source)) //different source objects, but missing binding or different child objects found
        {
            //NOTE: duplicated code, but separating the two cases made debugging easier (and originally they had different logic)

            if (curObj != null)
            {
                var objHash = curObj[_hashMarker];
                if (objHash != null)
                {
                    existing = mappingSession.hashDic[objHash];
                    if (existing != null)
                    {
                        for (var x = 0; x < existing.numBindings; x++)
                        {
                            var curUnprocessed = existing.bindings[x];
                            if (curUnprocessed.processed === true) continue;
                            if (curUnprocessed.binding.currentState.source === curObj)
                            {
                                curUnprocessed.processed = true;
                                unprocessed = curUnprocessed.binding;
                                found = true;
                                break;
                            }
                        }
                    }
                }
            }
        }
        else if (unprocessed != null && unprocessed.binding.currentState.source === curObj)
        {
            found = true;
        }

        if (found === true && unprocessed != null && unprocessed.index !== undefined) //we found an unprocessed one and it wasn't from the secondary search
        {
            //delete mappingSession.remainingIndexes[unprocessed.index];
            //mappingSession.makeNewKeys = true;

            unprocessed = unprocessed.binding;            
        }

        if (found === true) //&& unprocessed != null && unprocessed.progressState === EVUI.Modules.Binding.BindingProgressStateFlags.Idle) //we found the match and it's not currently doing anything
        {
            //we set the pending state so when it comes back into swapStates we get a fresh state with the correct information instead of corrupting the current state.
            if (unprocessed.pendingState == null) unprocessed.pendingState = new BindingHandleState();
            unprocessed.pendingState.parentBindingPath = path;
            unprocessed.pendingState.parentBindingKey = path;
            unprocessed.pendingState.parentBindingHandle = unprocessed.currentState.parentBindingHandle;
            unprocessed.pendingState.normalizedPath = unprocessed.pendingState.getNormalizedPath();

            unprocessed.pendingState.htmlContent = (session.bindingHandle.htmlContent != null && session.bindingHandle.htmlContent.content === unprocessed.currentState.htmlContent) ? session.bindingHandle.htmlContent.key : unprocessed.currentState.htmlContent;
            unprocessed.pendingState.htmlContentSet = true;

            unprocessed.pendingState.source = curObj;
            unprocessed.pendingState.sourceSet = true;

            if (ele != null)
            {
                unprocessed.pendingState.element = ele;
                unprocessed.pendingState.elementSet = true;
            }

            //found = true;
            session.bindingHandle.currentState.childBindingHandles.push(unprocessed);
        }

        if (found === false) //we did not find a match, make a new child binding handle
        {
            var partialBinding = new EVUI.Modules.Binding.BindArgs();
            partialBinding.bindingSource = curObj;
            partialBinding.bindingTarget = ele;
            partialBinding.templateName = session.bindingHandle.templateName;

            var bindingHandle = getBindingHandleAmbiguously(partialBinding, session.bindingHandle);
            if (bindingHandle != null)
            {
                //we set both the current state and the pending states so if it gets rebound our old state and new state are correctly populated so that the child diffing function works properly
                bindingHandle.currentState.parentBindingKey = path;
                bindingHandle.currentState.parentBindingPath = path;
                bindingHandle.currentState.parentBindingHandle = session.bindingHandle;
                bindingHandle.currentState.normalizedPath = bindingHandle.currentState.getNormalizedPath();

                if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(bindingHandle.currentState.htmlContent) === true)
                {
                    bindingHandle.currentState.htmlContent = (session.bindingHandle.htmlContent != null && session.bindingHandle.htmlContent.content === session.bindingHandle.currentState.htmlContent) ?session.bindingHandle.htmlContent.key : session.bindingHandle.currentState.htmlContent;
                    bindingHandle.currentState.htmlContentSet = true;
                }

                if (bindingHandle.pendingState == null) bindingHandle.pendingState = new BindingHandleState();
                bindingHandle.pendingState.parentBindingPath = path;
                bindingHandle.pendingState.parentBindingKey = path;
                bindingHandle.pendingState.parentBindingHandle = bindingHandle.currentState.parentBindingHandle;
                bindingHandle.pendingState.normalizedPath = bindingHandle.pendingState.getNormalizedPath();

                if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(bindingHandle.currentState.htmlContent) === true)
                {
                    bindingHandle.pendingState.htmlContent = (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(bindingHandle.currentState.htmlContent) === true && session.bindingHandle.htmlContent != null && session.bindingHandle.htmlContent.content === bindingHandle.currentState.htmlContent) ? session.bindingHandle.htmlContent.key : bindingHandle.currentState.htmlContent;
                    bindingHandle.pendingState.htmlContentSet = true;
                }

                bindingHandle.pendingState.source = curObj;
                bindingHandle.pendingState.sourceSet = true;

                if (ele == null || bindingHandle.binding.insertionMode === EVUI.Modules.Binding.BindingInsertionMode.Default)
                {
                    if (bindingHandle.currentState.parentBindingHandle != null && bindingHandle.currentState.parentBindingHandle.binding.insertionMode !== EVUI.Modules.Binding.BindingInsertionMode.Default)
                    {
                        bindingHandle.binding.insertionMode = bindingHandle.currentState.parentBindingHandle.binding.insertionMode;
                    }
                    else
                    {
                        bindingHandle.binding.insertionMode = EVUI.Modules.Binding.BindingInsertionMode.Default;
                    }
                }

                //check to see if there already is a binding with a different object at the same path. If these is, we are technically rebinding that same handle, so we need to carry over some information for things to work properly
                var existingAtPath = getBindingContentList(mappingSession.unfoundPathDic, getNormalizedPath(path));
                if (existingAtPath != null)
                {
                    var nextUnprocessed = existingAtPath.getNextUnprocessedBinding();
                    if (nextUnprocessed != null)
                    {
                        //all of these values get moved into the "oldState" when this bindingHandle goes through its own binding process starting in swapStates()
                        nextUnprocessed.processed = true;
                        bindingHandle.currentState.boundContent = nextUnprocessed.binding.currentState.boundContent.slice(); //we need to remember the content to remove
                        bindingHandle.currentState.source = nextUnprocessed.binding.currentState.source; // we need the source object for diff comparisons
                        bindingHandle.currentState.childBindingHandles = nextUnprocessed.binding.currentState.childBindingHandles.slice(); //we need the child handles so the diffing works correctly                        
                        bindingHandle.newStateBound = nextUnprocessed.binding.newStateBound; //we need to flag it as having been bound
                        disposeBindingDispatchHandles(nextUnprocessed.binding); //clean up the old dispatch handles so we don't get a memory leak
                    }
                }

                session.bindingHandle.currentState.childBindingHandles.push(bindingHandle);
            }
        }
    };

    /**Makes a BindingHandle for each ChildBinding that was pulled out of the merged html content.
    @param {BindingSession} session The BindingSession being executed.
    @param {BoundChild[]} boundChildren The array of BoundChildren pulled out of the merged html content.
    @returns {BindingHandle[]} */
    var makeChildBindings = function (session, boundChildren)
    {
        var bindings = [];
        var numChildren = boundChildren.length;
        var isArray = isArrayMode(session);

        for (var x = 0; x < numChildren; x++)
        {
            var curChild = boundChildren[x];

            var partialBinding = new EVUI.Modules.Binding.BindArgs();
            partialBinding.bindingSource = curChild.source;
            partialBinding.bindingTarget = curChild.element;

            var bindingHandle = getBindingHandleAmbiguously(partialBinding, session.bindingHandle);
            if (bindingHandle == null) continue;

            bindingHandle.currentState.parentBindingHandle = session.bindingHandle;
            bindingHandle.currentState.parentBindingPath = curChild.path;

            var segments = EVUI.Modules.Core.Utils.getValuePathSegments(curChild.path);
            if (segments.length === 0)
            {
                bindingHandle.currentState.parentBindingKey = curChild.path;
            }
            else
            {
                bindingHandle.currentState.parentBindingKey = segments[segments.length - 1];
            }

            if (isArray === true) bindingHandle.currentState.boundProperties = session.bindingHandle.currentState.boundProperties.map(function (prop) { var newProp = new EVUI.Modules.Binding.BoundProperty(prop.path); newProp.value = prop.value; return newProp });
            bindings.push(bindingHandle);
        }

        return bindings;
    };

    /**Takes the list of ChildBindings that have been produced by the internal logic and the ones that could have possibly been added by a user and merges them into a single list of final, validated BindingHandles.
    @param {BindingSession} session The BindingSession being executed.
    @returns {BindingHandle[]}*/
    var validateChildBindings = function (session)
    {
        var newHandles = [];
        var childBindings = session.bindingHandle.binding.getChildBindings(); //session.bindingHandle.binding.childBindings;
        var numBindings = childBindings.length;
        var existingBindings = session.bindingHandle.currentState.childBindingHandles;
        var numExisting = existingBindings.length;

        //make a dictionary keyed by binding handle ID to bindingHandle to serve as a look up of childBindings to existingBindings
        var bindingDic = {};
        for (var x = 0; x < numExisting; x++)
        {
            var curExisting = existingBindings[x];
            bindingDic[curExisting.id] = curExisting;
        }

        for (var x = 0; x < numBindings; x++)
        {
            var curChild = childBindings[x];
            var handle = null;

            var curExisting = bindingDic[curChild.id];
            if (curExisting != null) handle = curExisting;

            if (handle == null)
            {
                var newHandle = getBindingHandleAmbiguously(curChild, session.bindingHandle);
                if (newHandle != null) handle = newHandle;
            }

            if (handle != null) newHandles.push(handle);
        }

        return newHandles;
    };

    /**A somewhat hacky method that checks to see if the events between the creating of the merged html content and the child list calculation have been overridden to anything that isn't an empty function.
    @param {BindingSession} session The BindingSession being executed.
    @returns {Boolean} */
    var areOnHtmlContentBoundEventsOverridden = function (session)
    {
        var local = session.bindingHandle.binding.onBindHtmlContent;
        var global = _self.onBindHtmlContent;

        var localType = typeof local;
        var globalType = typeof global;

        //if neither is a function, they were not overridden
        if (localType !== "function" && globalType !== "function") return false;

        //if suppressing child events, neither will fire
        if (session.parentSession != null && session.parentSession.bindingHandle.options.suppressChildEvents === true) return false;
        
        return (localType === "function" || globalType === "function");
    };

    /**Gets all of the changed or new child Bindings of the current Binding in the event of an update rebind. Also does DOM manipulation based on certain kinds of changes that are detected in the child list (removals, swaps, and shifts). 
    @param {BindingSession} session The BindingSession being executed.
    @returns {BindingHandle[]}*/
    var getChangedChildBindings = function (session)
    {
        var reBind = session.shouldReBind;
        if (reBind === false && session.bindingHandle.currentState.childBindingHandles.length === 0/*isArrayMode(session) === false*/) return []; //if it's an array, we calculate the Bindings of its children even if the parent array isn't being rebound
        if (session.bindingHandle.oldState == null) return session.bindingHandle.currentState.childBindingHandles; //we have no old state there is no way to figure out what changed, so just assume they all have

        //calculate all the changes that have been made to all the children
        var childDifferences = makeChildDifferencePackage(session);
        
        var changedKeys = Object.keys(childDifferences.modifiedPaths);
        var numChanges = changedKeys.length;
        if (numChanges === 0) return [];

        var orderedChanges = [];
        for (var x = 0; x < numChanges; x++)
        {
            var curChange = childDifferences.modifiedPaths[changedKeys[x]];
            var numCurChanges = curChange.length;
            for (var y = 0; y < numCurChanges; y++)
            {
                orderedChanges.push(curChange[y]);
            }
        }

        var toDispose = [];

        //put all the changes in order based on their index in the childBiningHandles array so that the changes are not processed out of order
        orderedChanges.sort(function (a, b) { return a.index - b.index });
        var numTotalChanges = orderedChanges.length;
        var changedBindings = [];

        for (var x = 0; x < numTotalChanges; x++)
        {
            var curChange = orderedChanges[x];
            if (curChange.applied === true) continue;

            if (curChange.bindingStructureChangeType === BindingStructureChangeType.Added) //item was added to the list of bindingChildren, add it to the process list. The processing will add it like normal.
            {
                changedBindings.push(curChange.binding);
                curChange.applied = true;
                continue;
            }
            else if (curChange.bindingStructureChangeType === BindingStructureChangeType.Moved) //item was moved from one key to another. Pick up and move the DOM nodes from their current location to the location of the key that it was moved to
            {
                var matchingChange = childDifferences.modifiedPaths[curChange.binding.oldState.normalizedPath][0]; //the matching change is the binding where this binding was moved to

                var ele = matchingChange.binding.currentState.element;
                var target = matchingChange.binding.currentState.boundContent[0];

                if (matchingChange.bindingStructureChangeType === BindingStructureChangeType.Removed)
                {
                    matchingChange.binding.currentState.element = document.createElement("div"); //put a dummy in the old element's place so that when it gets disposed it doesn't remove the current binding's element.
                    matchingChange.applied = true;

                    toDispose.push(matchingChange);
                }

                //put a placeholder where the first piece of content in the destination is
                var placeholder = document.createElement("div");
                target.after(placeholder);

                //load the content from the binding to move into a document fragment
                var tempContent = document.createDocumentFragment();
                var numContent = curChange.binding.currentState.boundContent.length;
                for (var y = 0; y < numContent; y++)
                {
                    var curContent = curChange.binding.currentState.boundContent[y];
                    if (y === 0) curContent.before(placeholder);

                    tempContent.append(curContent);
                }

                //replace the placeholder with the document fragment to move all the content into its new location
                placeholder.replaceWith(tempContent);

                //re-assign the current content to be relative to the target's element
                curChange.binding.currentState.element = ele;
                curChange.applied = true;

                //add it to the process list
                changedBindings.push(curChange.binding);
            }
            else if (curChange.bindingStructureChangeType === BindingStructureChangeType.Removed) //item was removed, add it to the list of items to dispose (if we dispose of it now it can upset the current state of the child binding list, we wait until the end to get rid of it)
            {
                toDispose.push(curChange);
                curChange.applied = true;
                continue;
            }
            else if (curChange.bindingStructureChangeType === BindingStructureChangeType.Shifted) //don't actually do anything for a shift if there was no update
            {
                if (curChange.contentsModified === true) changedBindings.push(curChange.binding);
                curChange.applied = true;
                continue;
            }
            else if (curChange.bindingStructureChangeType === BindingStructureChangeType.Swapped) //swap means that two bindings changed places within their parent binding
            {
                var matchingState = curChange.moveSwapTarget.currentState;

                var matchingChange = childDifferences.modifiedPaths[matchingState.normalizedPath][0]; //the other change that was swapped with the current state

                var placeholder = document.createElement("div");
                var placeholder2 = document.createElement("div");

                var tempContent = document.createDocumentFragment();
                var tempContent2 = document.createDocumentFragment();

                //if we have any content, load it into the document fragment after putting one of the placeholders in the place of the first piece of content
                if (curChange.binding.currentState.boundContent != null)
                {
                    var numContent = curChange.binding.currentState.boundContent.length;
                    for (var y = 0; y < numContent; y++)
                    {
                        var curContent = curChange.binding.currentState.boundContent[y];
                        if (y === 0) curContent.before(placeholder);

                        tempContent.append(curContent);
                    }
                }

                //if the matching change has any content, load it into the other document fragment after putting the other placeholder in the place of the first piece of the other binding's content
                if (matchingChange != null && matchingChange.binding.currentState.boundContent != null)
                {
                    numContent = curChange.moveSwapTarget.currentState.boundContent.length;
                    for (var y = 0; y < numContent; y++)
                    {
                        var curContent = matchingChange.binding.currentState.boundContent[y];
                        if (y === 0) curContent.before(placeholder2);

                        tempContent2.append(curContent);
                    }
                }

                //replace the placeholders with the opposite set of content
                placeholder.replaceWith(tempContent2);
                placeholder2.replaceWith(tempContent);

                if (matchingChange != null)
                {
                    matchingChange.applied = true;
                    changedBindings.push(matchingChange.binding);
                }

                changedBindings.push(curChange.binding);
                curChange.applied = true;

                continue;
            }
            else
            {
                if (curChange.contentsModified === true) changedBindings.push(curChange.binding);
                curChange.applied = true;
            }
        }

        //we need to "swap" the states of every unchanged binding to synthesize the swapStates step that occurs when doing a re-bind evaluation since this method serves to filter out which bindings get re evaluated
        //if we don't swap the states things start getting out of sync and more special handing is required, so this treats the unchanged bindings as if they had been though the initial stages of rebinding.
        var numToSwapStates = childDifferences.unchangedBindings.length;
        for (var x = 0; x < numToSwapStates; x++)
        {
            var curUnchangedBinding = childDifferences.unchangedBindings[x];//.binding;
            var newState = new BindingHandleState();

            newState.boundContent = curUnchangedBinding.currentState.boundContent;
            newState.boundProperties = curUnchangedBinding.currentState.boundProperties;
            newState.boundContentFragment = curUnchangedBinding.currentState.boundContentFragment;
            newState.boundTemplateContentClone = curUnchangedBinding.currentState.boundTemplateContentClone;
            newState.boundContentTree = curUnchangedBinding.currentState.boundContentTree;
            newState.childBindingHandles = curUnchangedBinding.currentState.childBindingHandles;

            var tempState = curUnchangedBinding.pendingState;
            //if (tempState == null) tempState = curUnchangedBinding.currentState;

            newState.element = tempState.element;
            newState.normalizedPath = tempState.normalizedPath;
            newState.htmlContent = tempState.htmlContent;
            newState.mergedHtmlContent = curUnchangedBinding.currentState.mergedHtmlContent;
            newState.parentBindingHandle = tempState.parentBindingHandle;
            newState.parentBindingKey = tempState.parentBindingKey;
            newState.parentBindingPath = tempState.parentBindingPath;
            newState.source = tempState.source;

            newState.sourceObserver = curUnchangedBinding.currentState.sourceObserver;
           
            curUnchangedBinding.oldState = session.bindingHandle.currentState;
            curUnchangedBinding.currentState = newState;
            curUnchangedBinding.pendingState = null;
            curUnchangedBinding.oldStateBound = session.bindingHandle.oldStateBound;
            curUnchangedBinding.newStateBound = true; //session.bindingHandle.newStateBound;
        }

        //now that all the changes have been processed in sequence, we can safely dispose of all the bindings that are flagged to be removed.
        var numToDispose = toDispose.length;
        for (var x = 0; x < numToDispose; x++)
        {
            triggerDispose(toDispose[x].binding);
        }

        return changedBindings;       
    };

    /**
     * 
     * @param {any} dictionary
     * @param {any} objectPath
     * @returns {BindingContentList}
     */
    var getBindingContentList = function (dictionary, objectPath)
    {
        var contentList = dictionary[objectPath];
        while (contentList == null)
        {
            var lastSeg = objectPath.lastIndexOf(".");
            if (lastSeg !== -1)
            {
                objectPath = objectPath.substring(0, lastSeg);
            }
            else
            {
                break;
            }

            contentList = dictionary[objectPath];
        }

        return contentList;
    };

    /**
     * 
     * @param {any} session
     * @param {any} childBindingHandles
     */
    var makeChangeDictionary = function (session, childBindingHandles)
    {
        var dic = {};

        var numChildren = childBindingHandles.length;
        for (var x = 0; x < numChildren; x++)
        {
            var curChild = childBindingHandles[x];
            var stateToCheck = curChild.currentState;

            if (stateToCheck.normalizedPath == null) stateToCheck.normalizedPath = stateToCheck.getNormalizedPath();

            var bindingContentList = dic[stateToCheck.normalizedPath];
            if (bindingContentList == null)
            {
                bindingContentList = new BindingContentList(stateToCheck.normalizedPath);
                dic[stateToCheck.normalizedPath] = bindingContentList;
            }

            var listItem = bindingContentList.addBinding(curChild, x);
            listItem.stateToCheck = stateToCheck;
        }

        return dic;
    };

    /**
 * 
 * @param {any} session
 * @param {any} childBindingHandles
 */
    var makeChangeHashDictionary = function (session, childBindingHandles)
    {
        var dic = {};

        var numChildren = childBindingHandles.length;
        for (var x = 0; x < numChildren; x++)
        {
            var curChild = childBindingHandles[x];
            var hash = (curChild.currentState.source != null) ? curChild.currentState.source[_hashMarker] : null;

            if (hash == null)
            {
                hash = Math.random(); //_services.diffController.getValueHashCode(curChild.currentState.source);
                if (curChild.currentState.source != null) curChild.currentState.source[_hashMarker] = hash;
            }

            var bindingContentList = dic[hash];
            if (bindingContentList == null)
            {
                bindingContentList = new BindingContentList(hash);
                dic[hash] = bindingContentList;
            }

            var listItem = bindingContentList.addBinding(curChild, x);
            listItem.stateToCheck = curChild.currentState;
        }

        return dic;
    };

    var removeObjectHashes = function (session, childBindingHandles)
    {
        var numChildren = childBindingHandles.length;
        for (var x = 0; x < numChildren; x++)
        {
            var curChild = childBindingHandles[x];
            if (curChild.currentState.source != null) delete curChild.currentState.source[_hashMarker];
        }
    }

    /**Creates a digest package describing the changes to make to all the new and existing children of the Binding.
    @param {BindingSession} session The BindingSession being executed.
    @returns {ChildDifferencePackage} */
    var makeChildDifferencePackage = function (session)
    {
        var childDiffs = new ChildDifferencePackage();
        childDiffs.isArray = session.isArray;

        var modifiedPaths = childDiffs.modifiedPaths;
        var allBindings = makeChangeDictionary(session, session.bindingHandle.currentState.childBindingHandles);
        var allOldBindings = makeChangeDictionary(session, session.bindingHandle.oldState.childBindingHandles);

        //process any diff that may have occurred since the last run or during this session.
        var sessionDiffs = (areOnHtmlContentBoundEventsOverridden(session) === true) ? session.bindingHandle.currentState.sourceObserver.getChanges() : [];
        var diffs = (EVUI.Modules.Core.Utils.isArray(session.observedDifferences) === true) ? session.observedDifferences.concat(sessionDiffs) : sessionDiffs;

        var numDiffs = diffs.length;
        for (var x = 0; x < numDiffs; x++)
        {
            var curDiff = diffs[x];

            if (curDiff.type === EVUI.Modules.Observers.ObservedObjectChangeType.Added || curDiff.type === EVUI.Modules.Observers.ObservedObjectChangeType.Changed || curDiff.type === EVUI.Modules.Observers.ObservedObjectChangeType.Removed)
            {
                var objectPath = curDiff.path;
                if (objectPath == null) continue;

                //first see if the unmodified path is a match
                var curBinding = getBindingContentList(allBindings, objectPath);
                if (curDiff.type === EVUI.Modules.Observers.ObservedObjectChangeType.Added) //object was added
                {
                    //if we still don't have a match the changed object, continue on to the next change
                    if (curBinding == null) continue;

                    if (modifiedPaths[curBinding.normalizedPath] == null) //if the binding isn't in our change dictionary, add it
                    {
                        modifiedPaths[curBinding.normalizedPath] = curBinding.makeChangeArray(BindingStructureChangeType.Added);
                    }
                }
                else if (curDiff.type === EVUI.Modules.Observers.ObservedObjectChangeType.Changed || curDiff.type === EVUI.Modules.Observers.ObservedObjectChangeType.Removed) //the binding was changed. This could mean a content change, a swap, or a shift, or a change in addition or any one of those types of changes
                {
                    var lookInOld = false;
                    if (curBinding == null)
                    {
                        lookInOld = true;
                        curBinding = getBindingContentList(allOldBindings, objectPath);
                    }

                    //if it was in the old one, but not the new one, and it no longer has a value, it was removed.
                    if (curBinding != null && lookInOld === true && modifiedPaths[curBinding.normalizedPath] == null)
                    {
                        modifiedPaths[curBinding.normalizedPath] = curBinding.makeChangeArray(BindingStructureChangeType.Removed);
                        continue;
                    }

                    //if we still don't have a match the changed object, continue on to the next change
                    if (curBinding == null) continue;

                    var existingChange = modifiedPaths[curBinding.normalizedPath];
                    if (existingChange != null) //we already processed this binding, but it may not have been flagged as a change yet, so make sure it's changed.
                    {
                        var numExisting = existingChange.length;
                        for (var y = 0; y < numExisting; y++)
                        {
                            var curExisting = existingChange[y];

                            if (curExisting.contentsModified === false &&
                               (curExisting.bindingStructureChangeType !== BindingStructureChangeType.Shifted &&
                                curExisting.bindingStructureChangeType !== BindingStructureChangeType.Removed &&
                                curExisting.bindingStructureChangeType !== BindingStructureChangeType.Swapped)) curExisting.contentsModified = true;
                        }

                        continue;
                    }

                    //if (curDiff.type === EVUI.Modules.Observers.ObservedObjectChangeType.Removed)
                    //{
                    //    modifiedPaths[curBinding.normalizedPath] = curBinding.makeChangeArray(BindingStructureChangeType.Removed);
                    //}
                    //else
                    //{
                        modifiedPaths[curBinding.normalizedPath] = curBinding.makeChangeArray(function (change)
                        {
                            getSpecialChangeType(session, change, allBindings, allOldBindings);
                            return change.bindingStructureChangeType;
                        });
                    //}
                }
            }
        }

        //if the object changed, process the difference between the new and the old and add it to the current dictionary of changes.
        if (session.bindingHandle.oldState != null && session.bindingHandle.currentState.source != session.bindingHandle.oldState.source)
        {
            if (session.observedDifferences == null)
            {
                session.observedDifferences = _services.diffController.compare(session.bindingHandle.currentState.source, session.bindingHandle.oldState.source);
            }

            /**
            @type {EVUI.Modules.Diff.Comparison[]}*/
            var allChanges = session.observedDifferences.rootComparison.differences; 
            var numChanges = allChanges.length;

            for (var x = 0; x < numChanges; x++)
            {
                var curChange = allChanges[x];
                var objectPath = curChange.getPath();
                if (objectPath == null) continue;

                //first see if the unmodified path is a match
                var curBinding = getBindingContentList(allBindings, objectPath);

                //if we don't have a match the changed object, continue on to the next change
                if (curBinding == null)
                {
                    curBinding = getBindingContentList(allOldBindings, objectPath);
                    if (curBinding == null) continue;
                }

                var aType = (curChange.a == null) ? "object" : typeof curChange.a;
                var bType = (curChange.b == null) ? "object" : typeof curChange.b;

                if (curChange.a != null && curChange.b != null && aType === "object" && bType === "object") //changed
                {
                    var existingChange = modifiedPaths[objectPath];
                    if (existingChange != null) //we already processed this binding, but it may not have been flagged as a change yet, so make sure it's changed.
                    {
                        var numChanges = existingChange.length;
                        for (var y = 0; y < numChanges; y++)
                        {
                            existingChange[y].contentsModified = true;
                        }
                        continue;
                    }

                    modifiedPaths[objectPath] = curBinding.makeChangeArray(function (change)
                    {
                        getSpecialChangeType(session, change, allBindings, allOldBindings);
                        return change.bindingStructureChangeType;
                    });
                }
                else if (bType === "object" && curChange.a == null && curChange.b != null) //removed
                {
                    //if we don't have a match the changed object, continue on to the next change
                    if (curBinding == null) continue;

                    if (modifiedPaths[objectPath] == null) //if the binding isn't in our change dictionary, add it
                    {
                        modifiedPaths[objectPath] = curBinding.makeChangeArray(BindingStructureChangeType.Removed);
                    }
                }
                else if (aType === "object" && curChange.a != null && curChange.b == null) //added
                {
                    //if we still don't have a match the changed object, continue on to the next change
                    if (curBinding == null) continue;

                    if (modifiedPaths[objectPath] == null) //if the binding isn't in our change dictionary, add it
                    {
                        modifiedPaths[objectPath] = curBinding.makeChangeArray(BindingStructureChangeType.Added);
                    }
                }
            }
        }

        //finally, create a list of all the bindings that were not changed so that can have their states swapped as if they were changed 
        var newBindingKeys = Object.keys(allBindings);
        var numKeys = newBindingKeys.length;
        for (var x = 0; x < numKeys; x++)
        {
            var curKey = newBindingKeys[x];
            var modified = modifiedPaths[curKey];

            if (modified === undefined)
            {
                var curBindings = getBindingContentList(allBindings, curKey);                
                for (var y = 0; y < curBindings.numBindings; y++)
                {
                    childDiffs.unchangedBindings.push(curBindings.bindings[y].binding);
                }
            }
            else
            {
                var numModified = modified.length;
                for (var y = 0; y < numModified; y++)
                {
                    var curModified = modified[y];
                    if (curModified.contentsModified === false && curModified.bindingStructureChangeType === BindingStructureChangeType.Shifted)
                    {
                        childDiffs.unchangedBindings.push(curModified.binding);

                        //remove it from our modified paths array
                        modified.splice(y, 1);
                        y--;
                        numModified--;

                        if (numModified === 0) delete modifiedPaths[curKey];
                    }
                }
            }
        }

        return childDiffs;
    };

    /**Gets a special change type for a ChildDifference object.
    @param {BindingSession} session The BindingSession being executed.
    @param {ChildDifference} change The change being checked for a special case.
    @param {Object} allBindings A dictionary containing the keys of all current bindings paired to the corresponding binding.
    @param {Object} allOldBindings  A dictionary containing the keys of all old bindings paired to the corresponding old binding.*/
    var getSpecialChangeType = function (session, change, allBindings, allOldBindings)
    {
        var otherState = change.binding.pendingState != null ? change.binding.pendingState : change.binding.oldState;
        if (otherState == null || otherState.parentBindingKey === change.binding.currentState.parentBindingKey) //if there was no old state or the keys match, the object was changed in place.
        {
            change.contentsModified = true;
            return;
        }

        if (otherState.parentBindingKey !== change.binding.currentState.parentBindingKey) //the key of the binding changed
        {
            if (otherState.source !== change.binding.currentState.source) //..and the object did too. It's a normal change.
            {
                change.contentsModified = true;
                return;
            }

            //the objects match and the keys are different. It's either a swap or a shift.
            var otherBinding = getBindingContentList(allBindings, otherState.normalizedPath);
            if (otherBinding == null) otherBinding = getBindingContentList(allOldBindings, otherState.normalizedPath);
            if (otherBinding != null)
            {
                var unprocessedOtherBinding = otherBinding.getNextUnprocessedBinding();
                if (unprocessedOtherBinding == null)
                {
                    if (change.contentsModified === false)
                    {
                        var childChange = session.oldStateDictionary.getChild(change.binding.currentState.parentBindingKey);
                        change.contentsModified = childChange.haveChildrenChanged();
                    }

                    return;
                }

                unprocessedOtherBinding.processed = true;

                change.moveSwapTarget = unprocessedOtherBinding.binding;
                var otherBindingState = unprocessedOtherBinding.binding.pendingState != null ? unprocessedOtherBinding.binding.pendingState : unprocessedOtherBinding.binding.oldState;
                if (otherBindingState == null) otherBindingState = unprocessedOtherBinding.stateToCheck;
                if (unprocessedOtherBinding.stateToCheck.parentBindingKey === otherState.parentBindingKey && change.binding.currentState.parentBindingKey === otherBindingState.parentBindingKey) //new key of the old binding is the old key of the new binding. It's a swap.
                {
                    change.bindingStructureChangeType = BindingStructureChangeType.Swapped;
                }
                else
                {
                    if (session.isArray === false) //if we're not dealing with an array, the change is a move.
                    {
                        change.bindingStructureChangeType = BindingStructureChangeType.Moved;
                    }
                    else
                    {
                        change.bindingStructureChangeType = BindingStructureChangeType.Shifted;
                    }

                    if (change.contentsModified === false)
                    {
                        var childChange = session.oldStateDictionary.getChild(change.binding.currentState.parentBindingKey);
                        change.contentsModified = childChange.haveChildrenChanged();
                    }
                }

                return;
            }
        }

        //something other than a special case happened, just flag it as changed.
        change.contentsModified = true;
    };


    /**Makes sure that any child Binding's element is a child node of it's parent Binding's element. Having child bindings outside the hierarchy of nodes can lead to unpredictable results.
    @param {BindingSession} session The BindingSession being executed.
    @returns {Boolean}*/
    var isChildElementUnderParent = function (session)
    {
        if (session.parentSession != null)
        {
            if (session.parentSession.isArray === false && session.bindingHandle.currentState.element != null)
            {
                return session.parentSession.bindingHandle.currentState.boundContentFragment.contains(session.bindingHandle.currentState.element); //the bound content fragment should always be there if this is a non-array child
            }
        }

        return true;
    };

    /**Makes sure that a child Binding's source element is not a child of itself. A circular binding will freeze the browser.
    @param {BindingSession} bindingSession The BindingSession being executed.
    @returns {Boolean} */
    var isCircularChildReference = function (bindingSession)
    {
        var curParent = bindingSession.bindingHandle.currentState.parentBindingHandle;
        var parentSources = [];

        while (curParent != null)
        {
            if (parentSources.indexOf(curParent.currentState.source) !== -1) return true;

            parentSources.push(curParent.currentState.source);
            curParent = curParent.currentState.parentBindingHandle;
        }

        if (parentSources.indexOf(bindingSession.bindingHandle.currentState.source) !== -1)
        {
            return true;
        }

        return false;
    };

    /*******************************************************************************BINDING HTML CONTENT MANAGEMENT**************************************************************************/

    /**Gets htmlContent via HTTP if the content entry had a URL but no actual content. All other sessions using the same contentEntry wait for the first one to go get it, then they all continue.
    @param {BindingSession} session The BindingSession being executed.
    @param {BindingHtmlContentEntry} contentEntry The htmlContent container that has the URL to request the content from.
    @param {Function} callback A callback function that takes the string of HTML as a parameter that is called once the request completes. */
    var getHtmlContentViaHttp = function (session, contentEntry, callback)
    {
        if (contentEntry.failed === true) return callback(null); //request was ran and failed. just return null
        if (contentEntry.pending === false) //request is NOT in progress
        {
            var commonCallback = function (result)
            {
                contentEntry.pending = false;
                if (contentEntry.failed === false && EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(result) === false)
                {
                    contentEntry.content = result;
                }
                else
                {
                    contentEntry.failed = true;
                }

                //call all the callbacks that were queued for this piece of html content in order of arrival
                callback(result);
                while (contentEntry.pendingCallbacks.length > 0)
                {
                    var curCallback = contentEntry.pendingCallbacks.shift();
                    curCallback(result);
                }
            };

            EVUI.Modules.Core.Utils.require("Http", EVUI.Modules.Binding.Dependencies.Http.version);

            var httpOptions = null;
            if (session.bindingHandle.binding.contentLoadSettings != null)
            {
                httpOptions = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Http.HttpRequestArgs(), session.bindingHandle.binding.contentLoadSettings.httpRequestArgs);
                httpOptions.url = contentEntry.url;
                if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(httpOptions.method) === true) httpOptions.method = "GET";
            }
            else
            {
                httpOptions = new EVUI.Modules.Http.HttpRequestArgs();
                httpOptions.url = contentEntry.url;
                httpOptions.method = "GET";
            }

            contentEntry.pending = true;

            //run the request and return the response into a string.
            _services.httpManager.executeRequest(httpOptions, function (completedRequest)
            {
                contentEntry.pending = false;
                if (completedRequest == null)
                {
                    contentEntry.failed = true;
                    return commonCallback(null);
                }
                else
                {
                    if (completedRequest.success === true) //turn whatever the server returned into a string if possible
                    {
                        var result = completedRequest.response;

                        if (result == null) return commonCallback(null);
                        if (typeof result === "string" && completedRequest.xmlHttpRequest.responseType !== "json") return commonCallback(result);

                        if (completedRequest.xmlHttpRequest.responseType === "json") //must be a JSON encoded string, not an object.
                        {
                            try
                            {
                                result = JSON.parse(result);
                            }
                            catch (ex)
                            {
                                result = null;
                                EVUI.Modules.Core.Utils.log(ex);
                            }

                            if (typeof result === "string") return commonCallback(result);
                            return commonCallback(null);
                        }
                        else if (EVUI.Modules.Core.Utils.instanceOf(result, Blob) === true)
                        {
                            contentEntry.pending = true;
                            EVUI.Modules.Core.Utils.blobToTextAsync(result).then(function (strContent)
                            {
                                contentEntry.pending = false;
                                commonCallback(strContent);

                            }).catch(function (ex)
                            {
                                contentEntry.pending = false;
                                EVUI.Modules.Core.Utils.log(ex);
                                commonCallback(null);
                            });
                        }
                        else if (EVUI.Modules.Core.Utils.instanceOf(result, ArrayBuffer) === true)
                        {
                            var str = null;
                            try
                            {
                                str = new TextDecoder().decode(result);
                            }
                            catch (ex)
                            {
                                EVUI.Modules.Core.Utils.log(ex);
                            }

                            commonCallback(str);
                        }
                        else if (EVUI.Modules.Core.Utils.instanceOf(result, Node) === true)
                        {
                            if (EVUI.Modules.Core.Utils.isElement(result) === true)
                            {
                                return commonCallback(result.outerHTML);
                            }
                            else if (EVUI.Modules.Core.Utils.instanceOf(result, Document) === true)
                            {
                                return commonCallback(result.body.innerHtml);
                            }
                            else
                            {
                                return commonCallback(result.textContent);
                            }
                        }
                        else
                        {
                            return commonCallback(null);
                        }
                    }
                    else
                    {
                        if (completedRequest.error != null && completedRequest.error.exception != null) EVUI.Modules.Core.Utils.log(completedRequest.error.exception);
                        return commonCallback(null);
                    }
                }
            });
        }
        else //if the request is pending, add the callback to the entry's list of callbacks to execute once the request completes.
        {
            contentEntry.pendingCallbacks.push(callback);
        }
    };

    /**Adds a BindingHtmlContentEntry to the cache of stored htmlContents to reference later.
    @param {String|EVUI.Modules.Binding.BindingHtmlContent} key Either the full entry or the string key to store a new entry by.
    @param {String} content The raw html to use.
    @param {String} url The URL where the raw html can be found.
    @returns {BindingHtmlContentEntry} */
    var addCachedHtmlContent = function (key, content, url)
    {
        var tempEntry = {};
        if (key != null && typeof key === "object")
        {
            tempEntry = key;
        }
        else
        {
            tempEntry.key = key;
            tempEntry.content = content;
            tempEntry.url = url;
        }

        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(tempEntry.key) === true) throw Error("BindingHtmlContent must have a non-whitespace string key.");
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(tempEntry.content) === true && EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(tempEntry.url) === true) throw Error("BindingHtmlContent must have either content or a url.");

        var existing = getHtmlContentEntry(tempEntry.key);
        if (existing != null)
        {
            throw Error("BindingHtmlContent entry with the key \"" + tempEntry.key + "\" already exists.");
        }
        else
        {
            var entry = new BindingHtmlContentEntry();
            entry.key = tempEntry.key;
            entry.content = tempEntry.content;
            entry.url = tempEntry.url;
            entry.item = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Binding.BindingHtmlContent(entry), tempEntry, ["key", "content", "url"]);

            _bindingHtmlContentEntries.push(entry);

            return entry;
        }
    };

    /**Removes a BindingHtmlContentEntry from the cache.
    @param {String} key The key of the BindingHtmlContentEntry to remove.
    @returns {Boolean} */
    var removeCachedHtmlContent = function (key)
    {
        var numEntries = _bindingHtmlContentEntries.length;
        for (var x = 0; x < numEntries; x++)
        {
            var curEntry = _bindingHtmlContentEntries[x];
            if (curEntry.item.key === key)
            {
                _bindingHtmlContentEntries.splice(x, 1);
                return true;
            }
        }

        return false;
    };

    /**Gets a BindingHtmlContentEntry by its key.
    @param {String} key The Key of the entry to get.
    @returns {BindingHtmlContentEntry}*/
    var getHtmlContentEntry = function (key)
    {
        var numEntries = _bindingHtmlContentEntries.length;
        for (var x = 0; x < numEntries; x++)
        {
            var curEntry = _bindingHtmlContentEntries[x];
            if (curEntry.item.key === key)
            {                
                return curEntry;
            }
        }

        return null;
    };

    /********************************************************************************BINDING TEMPLATE MANAGEMENT*************************************************************************** */

    /**Gets a BindingTemplate based on its name.
    @param {String} name The name of the BindingTemplate to get.
    @returns {EVUI.Modules.Binding.BindingTemplate} */
    var getBindingTemplate = function (name)
    {
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(name) === true) return null;
        var numNamed = _bindingTemplates.length;
        for (var x = 0; x < numNamed; x++)
        {
            var curNamed = _bindingTemplates[x];
            if (curNamed.templateName === name) return curNamed;
        }

        return null;
    };

    /**Makes a BindingTemplate given ambiguous input.
    @param {EVUI.Modules.Binding.Binding} bindingorArgs Either a full binding or parts of a full binding to turn into a BindingTemplate.
    @param {BindingHandle} parentHandle The parent BindingHandle if this Binding is the child of another Binding.
    @returns {EVUI.Modules.Binding.BindingTemplate} */
    var makeBindingTemplate = function (bindingorArgs, parentHandle, bindingEntry)
    {
        var useSameOptions = parentHandle != null && bindingorArgs.options == null && parentHandle.options.shareOptions !== false;
        var useSameLoadSettings = parentHandle != null && bindingorArgs.contentLoadSettings == null && parentHandle.options.shareContentLoadSettings !== false;
        var addTemplateArgs = null;
        var copyTemplateFilter = [
            "id", "source", "context", "bindProgressState", "bindingSource", "bindingTarget", "bindingPath", "element",
            "getBoundProperties", "boundContentFragment", "parentBinding", "parentBindingKey", "getChildBindings",
            "bind", "bindAsync", "dispose", "getBoundContent", "removeChildBinding", "changeBoundPropertyValue"
        ];

        if (bindingEntry == null)
        {
            addTemplateArgs = new EVUI.Modules.Binding.BindingTemplate();
        }
        else
        {
            addTemplateArgs = new EVUI.Modules.Binding.BindingTemplate(bindingEntry);
            copyTemplateFilter.push("templateName");
        }

        addTemplateArgs = EVUI.Modules.Core.Utils.shallowExtend(addTemplateArgs, bindingorArgs, copyTemplateFilter);

        if (useSameOptions === true)
        {
            addTemplateArgs.options = parentHandle.options;
        }
        else
        {
            addTemplateArgs.options = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Binding.BindOptions(), addTemplateArgs.options);
        }

        if (useSameLoadSettings === true)
        {
            addTemplateArgs.contentLoadSettings = parentHandle.binding.contentLoadSettings;
        }
        else
        {
            addTemplateArgs.contentLoadSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Binding.BindingContentLoadSettings(), addTemplateArgs.contentLoadSettings);
            if (addTemplateArgs.contentLoadSettings.httpRequestArgs != null)
            {
                addTemplateArgs.contentLoadSettings.httpRequestArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Http.HttpRequestArgs(), addTemplateArgs.contentLoadSettings.httpRequestArgs);
                if (addTemplateArgs.contentLoadSettings.httpRequestArgs.headers != null) addTemplateArgs.contentLoadSettings.httpRequestArgs.headers = addTemplateArgs.contentLoadSettings.httpRequestArgs.headers.map(function (header)
                {
                    return new EVUI.Modules.Http.HttpRequestHeader(header.key, header.value);
                });
            }
        }

        return addTemplateArgs;
    };

    /**Makes a BindingTemplate mock object based on the attribute values of an element.
    @param {Element} ele The element to base the template properties off of.
    @param {BindingHandle} parentHandle The parent BindingHandle if this Binding is the child of another Binding.*/
    var makeTemplateFromElement = function (ele, parentHandle)
    {
        if (EVUI.Modules.Core.Utils.isElement(ele) === false) return null;
        var attributes = getBindingAttributes(ele);
        var attributeTemplate = {};

        var path = attributes.sourcePath;
        var mode = attributes.mode;
        var key = attributes.key;
        var name = attributes.templateName;
        var src = attributes.src;

        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(path) === false)
        {
            attributeTemplate.bindingPath = path;
        }

        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(mode) === false)
        {
            var mode = mode.toLowerCase();
            var insertionModes = EVUI.Modules.Binding.BindingInsertionMode;

            var validModes = [
                insertionModes.Append, insertionModes.Fragment, insertionModes.InsertAfter,
                insertionModes.InsertBefore, insertionModes.Prepend,
                insertionModes.ReplaceChildren, insertionModes.Shadow];

            var numModes = validModes.length;
            for (var x = 0; x < numModes; x++)
            {
                var curMode = validModes[x];
                if (mode.indexOf(curMode) !== -1)
                {
                    attributeTemplate.insertionMode = curMode;
                    break;
                }
            }

            if (mode.indexOf(EVUI.Modules.Binding.BindingMode.Merge) !== -1)
            {
                attributeTemplate.bindingMode = EVUI.Modules.Binding.BindingMode.Merge;
            }
            else if (mode.indexOf(EVUI.Modules.Binding.BindingMode.Overwrite) !== -1)
            {
                attributeTemplate.bindingMode = EVUI.Modules.Binding.BindingMode.Overwrite;
            }
        }

        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(key) === false)
        {
            attributeTemplate.htmlContent = key;
        }

        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(name) === false)
        {
            attributeTemplate.templateName = name;
        }

        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(src) === false)
        {
            if (typeof attributeTemplate.htmlContent === "string")
            {
                attributeTemplate.htmlContent = {};
                attributeTemplate.htmlContent.key = key;
            }
            else
            {
                attributeTemplate.htmlContent = {};
            }

            attributeTemplate.htmlContent.url = src;
        }

        return attributeTemplate;
    };

    /**Gets all the attribute values needed to make a child binding based off of the markup of an Element's attributes.
    @param {Element} element The element to extract the elements from.
    @returns {BindingElementAttributes} */
    var getBindingAttributes = function (element)
    {
        if (element == null) return null;
        var attrs = EVUI.Modules.Core.Utils.getElementAttributes(element);
        var bindingAttributes = new BindingElementAttributes();
        bindingAttributes.key = attrs.getValue(EVUI.Modules.Binding.Constants.Attr_HtmlContentKey);
        bindingAttributes.mode = attrs.getValue(EVUI.Modules.Binding.Constants.Attr_Mode);
        bindingAttributes.templateName = attrs.getValue(EVUI.Modules.Binding.Constants.Attr_BindingTemplateName);
        bindingAttributes.sourcePath = attrs.getValue(EVUI.Modules.Binding.Constants.Attr_BoundObj);
        bindingAttributes.src = attrs.getValue(EVUI.Modules.Binding.Constants.Attr_HtmlContentUrl);

        return bindingAttributes;
    };

    /*******************************************************************************CONTENT METADATA MANAGEMENT****************************************************************************************** */

    /**
     * 
     * @param {String|BindingHtmlContentEntry} htmlOrEntry
     * @returns {HtmlContentMetadata}
     */
    var getHtmlContentMetadata = function (htmlOrEntry)
    {
        if (typeof htmlOrEntry === "object")
        {
            if (htmlOrEntry.needsRecalcuation === true || htmlOrEntry.contentMetata == null)
            {
                htmlOrEntry.contentMetata = makeHtmlContentMetadata(htmlOrEntry.content);
            }

            return htmlOrEntry.contentMetata;
        }
        else
        {
            var numMetadata = _htmlContentMetadata.length;
            for (var x = 0; x < numMetadata; x++)
            {
                var curMetadata = _htmlContentMetadata[x];
                if (curMetadata.html === htmlOrEntry) return curMetadata;
            }

            var newMetadata = makeHtmlContentMetadata(htmlOrEntry);
            _htmlContentMetadata.push(newMetadata);

            return newMetadata;
        }
    };

    /**
     * 
     * @param {String} html
     * @returns {HtmlContentMetadata}
     */
    var makeHtmlContentMetadata = function (html)
    {
        var metadata = new HtmlContentMetadata();
        metadata.html = html;

        var templateTree = _services.domTreeConverter.htmlToDomTree(html);
        templateTree.search(function (ele)
        {
            if (ele.attrs == null) return;
            
            var numAttrs = ele.attrs.length;
            for (var x = 0; x < numAttrs; x++)
            {
                var curAttr = ele.attrs[x];
                if (curAttr.val.indexOf("{{") === -1) continue;
                
                var tokens = getTokenMappingsFromHtmlContent(curAttr.val);
                var numTokens = tokens.length;
                for (var y = 0; y < numTokens; y++)
                {
                    var curToken = tokens[y];
                    if (metadata.attributePaths[curToken.path] == null)
                    {
                        metadata.attributePaths[curToken.path] =  _hashMarker + curToken.path + _hashMarker;
                    }
                }                
            }            
        });

        return metadata;
    };

    /**
     * 
     * @param {BindingSession} session
     * @param {EVUI.Modules.DomTree.DomTreeElement} domTreeElement
     */
    var buildElementMetadata = function (session, domTreeElement)
    {
        if (typeof domTreeElement.content === "string")
        {
            var cleaned = removeHtmlContentTagMarkers(domTreeElement.content);
            domTreeElement.content = cleaned.content;
        }

        var metadata = new ElementMetadata();

        if (domTreeElement.attrs == null) return metadata;
        var numAttrs = domTreeElement.attrs.length;

        //walk all the attributes on the element and see if they were a data-bound attributes
        for (var x = 0; x < numAttrs; x++)
        {
            var curAttr = domTreeElement.attrs[x];
            var attributeMetadata = new AttributeMetadata();
            attributeMetadata.name = curAttr.key;

            var values = curAttr.val.split(/\s+/);
            var lowerKey = curAttr.key.toLowerCase();

            //if (EVUI.Modules.Core.Utils.stringStartsWith("on", lowerKey) === true && HTMLElement.prototype.hasOwnProperty(lowerKey) === true)
            //{
            //    values.push(curAttr.val);
            //}
            //else
            //{
            //    values = curAttr.val.split(/\s+/);
            //}


            var numValues = values.length;
            var attrString = "";
            var attrTokenizedString = "";

            for (var y = 0; y < numValues; y++)
            {
                var attribtueValueMetadata = new AttributeValueMetadata();
                attributeMetadata.values.push(attribtueValueMetadata);

                //get the list of all the paths that were bound to the attribute value and the cleaned content that no longer includes the hash markers.
                var cleanData = removeHtmlContentTagMarkers(values[y]);

                attrString += " " + cleanData.content;
                attribtueValueMetadata.value = cleanData.content;

                var tokenizedString = cleanData.content;
                var numBound = cleanData.paths.length;
                for (var z = 0; z < numBound; z++)
                {
                    attributeMetadata.containsBoundValues = true;
                    attribtueValueMetadata.wasBound = true;

                    var curBound = cleanData.paths[z];
                    var matchingProp = session.boundPropertyDictionary[curBound];

                    var boundMetadata = new BoundAttributeValueMetadata();
                    boundMetadata.boundContent = (matchingProp == null) ? "" : matchingProp.value;
                    boundMetadata.boundPath = curBound;

                    tokenizedString = tokenizedString.replace(matchingProp.value, "{{" + curBound + "}}");
                    attribtueValueMetadata.boundValues.push(boundMetadata);
                }

                attribtueValueMetadata.tokenizedString = tokenizedString;
                attrTokenizedString += " " + tokenizedString;
            }

            //assign the cleaned attribute value so what gets injected into the DOM is correct and what the user intended to be injected
            attrString = attrString.trim();
            curAttr.val = attrString;
            attributeMetadata.value = attrString;
            attributeMetadata.tokenizedValue = attrTokenizedString.trim(); //tokenizedString.trim();

            metadata.attributes[curAttr.key] = attributeMetadata;
        }

        return metadata;
    };

    /**
     * 
     * @param {String} str
     */
    var removeHtmlContentTagMarkers = function (str)
    {
        if (typeof str !== "string" || str.length === 0) return {paths: [], content: str};

        var tokenPaths = [];

        var hashMarkerIndex = str.indexOf(_hashMarker);
        while (hashMarkerIndex !== -1)
        {
            var nextMarker = str.indexOf(_hashMarker, hashMarkerIndex + 1);
            if (nextMarker === -1) break;

            var token = str.substring(hashMarkerIndex, nextMarker + _hashMarkerLength);

            var existing = _escapedPathCahce[token];
            if (existing == null)
            {
                existing = new RegExp(token.replace(_escapeRegexRegex, function (val) { return "\\" + val; }), "g");
                _escapedPathCahce[token] = existing;
            }

            str = str.replace(existing, "");

            var tokenPath = token.substring(_hashMarkerLength, token.length - _hashMarkerLength);
            if (tokenPath.length > 0) tokenPaths.push(tokenPath);

            hashMarkerIndex = str.indexOf(_hashMarker);
        }

        var cleanedData = { paths: tokenPaths, content: str };
        return cleanedData;
    };

    /**
     * 
     * @param {Node} node
     * @returns {ElementMetadata}
     */
    var getElementMetadata = function (node)
    {
        return node[_hashMarker];
    };

    /*******************************************************************************BINDING HANDLE CREATION****************************************************************************************** */

    /**Creates a BindingHandle object based off of any combination of the properties of the possible inputs that can be used to make a binding handle.
    @param {EVUI.Modules.Binding.Binding|EVUI.Modules.Binding.BindingTemplate|EVUI.Modules.Binding.BindArgs|String} ambiguousInput The input that will be used to make the BindingHandle.
    @param {BindingHandle} parentHandle The parent Binding of this Binding if it is the child of another Binding.
    @returns {BindingHandle}*/
    var getBindingHandleAmbiguously = function (ambiguousInput, parentHandle)
    {
        if (ambiguousInput == null) return null;

        var bindingHandle = new BindingHandle(makeControllerWrapper());
        var bindingArgs = null;
        var bindingTemplateFound = false;

        var inputType = typeof ambiguousInput;
        if (inputType === "string") //first see if we got a string - this can either be the name of a pre-built named binding or the ID of an existing binding
        {
            var bindingTemplate = getBindingTemplate(ambiguousInput); //try getting the named binding first
            if (bindingTemplate != null)
            {
                bindingArgs = makeBindingTemplate(bindingTemplate, parentHandle);
                bindingTemplateFound = true;
            }
            else
            {
                return null; //couldn't resolve the named binding, return nothing.
            }
        }

        if (inputType !== "object" && bindingArgs == null) return null; //if we got something other than an object or a string, also return nothing.

        if (EVUI.Modules.Core.Utils.instanceOf(ambiguousInput, EVUI.Modules.Binding.Binding) === true) //see if we were handed an existing binding
        {
            if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(ambiguousInput.templateName) === false) //see if it has a name, if it does try and load the named binding
            {
                var bindingTemplate = getBindingTemplate(ambiguousInput.templateName);
                if (bindingTemplate != null) //use the named binding
                {
                    bindingTemplate = EVUI.Modules.Core.Utils.shallowExtend({}, bindingTemplate); //copy the binding onto a blank object
                    bindingTemplate = EVUI.Modules.Core.Utils.shallowExtend(bindingTemplate, ambiguousInput); //copy our input object onto the new clone of the binding template
                    bindingArgs = makeBindingTemplate(bindingTemplate, parentHandle); //then make the final args from the union
                }
                else //no named binding, but a valid name. Add it.
                {
                    bindingArgs = _self.addBindingTemplate(ambiguousInput);
                }

                bindingTemplateFound = true;
            }
            else //no valid name, just make the binding object into a AddBindingArgs object.
            {
                bindingArgs = makeBindingTemplate(ambiguousInput, parentHandle);
            }            
        }

        //see if we were handed a valid element we can extract attributes from
        var ele = null;
        if (EVUI.Modules.Core.Utils.isElement(ambiguousInput.element))
        {
            ele = ambiguousInput.element;
        }
        else if (EVUI.Modules.Core.Utils.isElement(ambiguousInput.bindingTarget))
        {
            ele = ambiguousInput.bindingTarget;
        }

        var bindingAttributeTemplate = makeTemplateFromElement(ele, parentHandle); //pull off the settings from the element that is being used to make the binding
        if (bindingAttributeTemplate != null && EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(bindingAttributeTemplate.templateName) === false)
        {
            ambiguousInput.templateName = bindingAttributeTemplate.templateName;
        }

        if (bindingTemplateFound === false && EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(ambiguousInput.templateName) === false) //no named binding found, and it was not a Binding object
        {
            var bindingTemplate = getBindingTemplate(ambiguousInput.templateName); //see if we can get a named binding
            if (bindingTemplate == null) //no named binding, go add one
            {
                bindingArgs = _self.addBindingTemplate(ambiguousInput);
            }
            else //use the named binding
            {
                bindingTemplate = EVUI.Modules.Core.Utils.shallowExtend({}, bindingTemplate); //copy the binding onto a blank object
                bindingTemplate = EVUI.Modules.Core.Utils.shallowExtend(bindingTemplate, ambiguousInput); //copy our input object onto the new clone of the binding template
                bindingArgs = makeBindingTemplate(bindingTemplate, parentHandle); //then make the final args from the union

                bindingTemplateFound = true;
            }
        }

        if (bindingAttributeTemplate != null) //if we had element settings, apply them last so that they always override the template's settings (if it was made at all)
        {
            if (bindingArgs != null)
            {
                bindingArgs = EVUI.Modules.Core.Utils.shallowExtend(bindingArgs, bindingAttributeTemplate, function (propName, sourceObj) { if (sourceObj[propName] == null) return true; });
            }
            else
            {
                ambiguousInput = EVUI.Modules.Core.Utils.shallowExtend(ambiguousInput, bindingAttributeTemplate);
            }
        }

        //if we still don't have binding args, make a set of them from the input
        if (bindingArgs == null) bindingArgs = makeBindingTemplate(ambiguousInput, parentHandle);

        //set the recursive events if no template was found and we have a parent binding handle
        if (bindingTemplateFound === false && parentHandle != null)
        {
            var bindingTemplate = getBindingTemplate(parentHandle.templateName); //see if we can get a named binding
            if (bindingTemplate != null) //no named binding, go add one
            {
                bindingTemplate = EVUI.Modules.Core.Utils.shallowExtend({}, bindingTemplate); //copy the binding onto a blank object
                bindingArgs = makeBindingTemplate(bindingTemplate, parentHandle); //then make the final args from the union
            }
            else
            {
                if (parentHandle.htmlContent != null && bindingArgs.htmlContent == null)
                {
                    bindingArgs.htmlContent = parentHandle.htmlContent.item;
                }
            }

            if (parentHandle.options.recursiveEvents === true)
            {
                bindingArgs.onBind = parentHandle.binding.onBind;
                bindingArgs.onBindChildren = parentHandle.binding.onBindChildren;
                bindingArgs.onBindHtmlContent = parentHandle.binding.onBindHtmlContent;
                bindingArgs.onBound = parentHandle.binding.onBound;
                bindingArgs.onChildrenBound = parentHandle.binding.onChildrenBound;
                bindingArgs.onSetBindings = parentHandle.binding.onSetBindings;
                bindingArgs.onSetHtmlContent = parentHandle.binding.onSetHtmlContent;
            }
        }
       
        bindingHandle.id = _bindingIDCounter++;
        bindingHandle.currentState = new BindingHandleState();
        bindingHandle.binding = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Binding.Binding(bindingHandle), bindingArgs, ["templateName"]);
        bindingHandle.progressState = EVUI.Modules.Binding.BindingProgressStateFlags.Idle;
        bindingHandle.templateName = bindingArgs.templateName;
        bindingHandle.htmlContent = (typeof bindingArgs.htmlContent === "object") ? bindingArgs.htmlContent : null;

        var ele = (ambiguousInput.bindingTarget == null) ? ambiguousInput.element : ambiguousInput.bindingTarget;
        var source = (ambiguousInput.bindingSource == null) ? ambiguousInput.source : ambiguousInput.bindingSource;

        //if we were handed a BindingArgs (rather than a Binding or AddBindingArgs object)
        if (ele != null && bindingHandle.currentState.element == null) bindingHandle.currentState.element = getValidElement(ele);
        if (source != null && bindingHandle.binding.source == null && typeof source === "object")
        {
            bindingHandle.binding.source = source;
        }
        else if (bindingAttributeTemplate != null && bindingAttributeTemplate.bindingPath != null)
        {
            var value = null;
            if (parentHandle != null)
            {
                value = EVUI.Modules.Core.Utils.getValue(bindingAttributeTemplate.bindingPath, parentHandle.currentState.source);
            }
            else
            {
                value = EVUI.Modules.Core.Utils.getValue(bindingAttributeTemplate.bindingPath, window);
            }

            if (value != null) bindingHandle.binding.source = value;
        }

        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(bindingArgs.htmlContent) === false) bindingHandle.currentState.htmlContent = bindingArgs.htmlContent;


        return bindingHandle;
    };

    /**Makes the controller wrapper that is injected into a Binding object so that it can access select parts of the controller from outside the controller.
    @returns {BindingControllerWrapper}*/
    var makeControllerWrapper = function ()
    {
        var wrapper = new BindingControllerWrapper();
        wrapper.controller = _self;
        wrapper.triggerDispose = triggerDispose;
        wrapper.triggerBind = triggerBind;
        wrapper.validateElement = validateElement;
        wrapper.getValidElement = getValidElement;
        wrapper.triggerUpdate = triggerUpdate;
        wrapper.toDomNode = toDomNode;

        return wrapper;
    };

    /**********************************************************************************ELEMENT HANDLING*******************************************************************************************/

    /**Validates that there is a theoretically valid value for a Binding's element assigned.
    @param {String|DocumentFragment|Element} value The value to check.
    @returns {Boolean}*/
    var validateElement = function (value)
    {
        if (value == null)
        {
            return true;
        }
        else if (typeof value === "string" && EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(value) === false)
        {
            return true;
        }
        else
        {
            if (value instanceof DocumentFragment)
            {
                return true;
            }
            else
            {
                if (EVUI.Modules.Core.Utils.isElement(value) === true)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
        }
    };

    /**Gets a valid element value out of the current (potentially invalid) value of an element.
    @param {String|DocumentFragment|Element} value The value to extract the valid value from.
    @param {Boolean} mustBeElement Whether or not the value must already be an element.
    @returns {String|Element} */
    var getValidElement = function (value, mustBeElement)
    {
        if (value instanceof DocumentFragment) return value;
        if (mustBeElement !== true && typeof value === "string" && EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(value) === false) return value;
        if (EVUI.Modules.Core.Utils.isElement(value) === true) return value;

        var extracted = EVUI.Modules.Core.Utils.getValidElement(value);
        if (extracted != null) return extracted;

        if (value instanceof EVUI.Modules.Dom.DomHelper) return value.elements[0];

        return null;
    };

    /**********************************************************************************HTML CONTENT DUPLICATION*******************************************************************************************/

    /**Walks the html content and pulls out anything surrounded by {{ and }}.
    @method getTokenMappings
    @param {String} htmlContent The htmlContent to pull token values out of.
    @returns {TokenMapping[]}*/
    var getTokenMappingsFromHtmlContent = function (htmlContent)
    {
        if (typeof htmlContent !== "string") return [];
        

        var props = [];
        var htmlLength = htmlContent.length;
        var curIndex = 0;

        while (curIndex < htmlLength)
        {
            var firstDoubleCurly = htmlContent.indexOf("{{", curIndex);
            if (firstDoubleCurly == -1) break;

            var secondDoubleCurly = htmlContent.indexOf("}}", firstDoubleCurly);
            if (secondDoubleCurly == -1) break;

            curIndex = secondDoubleCurly;

            var boundProp = htmlContent.substring(firstDoubleCurly + 2, secondDoubleCurly);
            if (props.indexOf(boundProp) !== -1) continue; //don't include any properties that already exist in the bound properties list

            props.push(boundProp);
        }

        //make the array of return objects (they're objects in case we need to extend this later, although its unneeded at the moment)
        return props.map(function (prop)
        {
            var mapping = new TokenMapping();
            mapping.path = prop;
            return mapping;
        });
    };

    /**Duplicates a Html content based on the properties of the object passed in along with the Html content.
    @param {Object} obj The object that contains the properties to populate the Html content with.
    @param {String} htmlContent The Html content to populate with values from the object.
    @param {EVUI.Modules.Binding.BoundProperty[]} mappings An array of TokenMapping representing the tokens to replace in the htmlContent.
    @param {HtmlContentMetadata} contentMetadata The metadata describing the special properties of the htmlContent.
    @returns {String}*/
    var duplicateHtmlContent = function (session, htmlContent, mappings, contentMetadata)
    {
        if (mappings == null || mappings.length === 0) return htmlContent;
        if (typeof htmlContent !== "string") return null;

        var result = htmlContent;
        var numMappings = mappings.length;

        for (var x = 0; x < numMappings; x++)
        {
            var curProperty = mappings[x];
            if (curProperty.value === undefined) continue;

            var replacementValue = null;
            if (typeof curProperty.value === "function")
            {
                replacementValue = addInvocationHandle(session, curProperty);
            }
            else
            {
                replacementValue = curProperty.value;
            }

            if (replacementValue == null) replacementValue = "";
            var boundItemMarker = contentMetadata.attributePaths[curProperty.path];

            if (boundItemMarker != null) replacementValue += boundItemMarker;

            try
            {
                var existing = _escapedPathCahce[curProperty.path];
                if (existing == null)
                {
                    existing = new RegExp("{{" + curProperty.path.replace(_escapeRegexRegex, function (val) { return "\\" + val; }) + "}}", "g");;
                    _escapedPathCahce[curProperty.path] = existing;
                }

                result = result.replace(existing, replacementValue);
            }
            catch (ex)
            {
                EVUI.Modules.Core.Utils.log(ex);
            }
        }

        return result;
    };

    var getNormalizedPath = function (path)
    {
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(path) === true) return path;
        var path = path.replace(/\.|\[|\]\.|\]/g, ".");

        if (EVUI.Modules.Core.Utils.stringEndsWith(".", path) === true) path = path.substring(0, path.length - 1);
        return path;
    };

    /****************************************************************************EVENT DISPATCH HANDLING******************************************************************************************** */


    var getInvocationHash = function (session, boundProperty)
    {
        return EVUI.Modules.Core.Utils.getHashCode(_salt + session.bindingHandle.id + ":" + boundProperty.path).toString(36);
    }

    /**Makes a public event handler to invoke a function that is being data-bound to html content, the handler is attached to the $evui.dispatch global object by a key based on the hash code of the property name and binding handle ID.
    @param {BindingSession} session The BindingSession being executed.
    @param {EVUI.Modules.Binding.BoundProperty} boundProperty The property that is binding a function to the Html.
    @returns {String} */
    var addInvocationHandle = function (session, boundProperty)
    {
        if (typeof boundProperty.value !== "function") return null;

        var fn = boundProperty.value;
        var hashKey = getInvocationHash(session, boundProperty);
        var replacementValue = "$evui.dispatch(event, '" + hashKey + "')";

        //look to see if we don't have the same handler there already
        var existing = _invocationDictionary[hashKey];
        if (existing != null)
        {
            if (existing.handler === fn)
            {
                return replacementValue;
            }
            else
            {
                session.rollbackDispatchHandles.push(existing);
                existing.dispose();
            }
        }     
        
        //we did not, make a new handler to put there
        var handle = new BindingDispatchHandle();
        handle.handler = fn;
        handle.id = _dispatchIDCounter;
        handle.binding = session.bindingHandle;
        handle.path = boundProperty.path;
        handle.hashKey = hashKey;
        handle.invocationHandle = function (eventArgs)
        {
            var invocationSite = getInvocationSite(handle, eventArgs);
            if (invocationSite == null)
            {
                invocationSite = new BindingDispatchInvocationSite();
                invocationSite.currentTarget = eventArgs.currentTarget;
                invocationSite.eventName = eventArgs.type;

                handle.invocationSites.push(invocationSite);
            }

            if (handle.binding.options.eventContextMode === EVUI.Modules.Binding.BoundEventContextMode.ParentObject)
            {
                //get the parent object to invoke the handler with
                var normalized = getNormalizedPath(handle.path);
                var lastDotIndex = normalized.lastIndexOf(".");
                var owningObject = null;

                if (lastDotIndex === -1)
                {
                    owningObject = handle.binding.currentState.source;
                }
                else
                {
                    var objPath = normalized.substring(0, lastDotIndex);
                    owningObject = EVUI.Modules.Core.Utils.getValue(objPath, handle.binding.currentState.source);
                }

                //couldn't find the object, fall back to the window
                if (owningObject == null) owningObject = window;

                return handle.handler.call(owningObject, eventArgs, handle.binding.binding);
            }
            else if (handle.binding.options.eventContextMode === EVUI.Modules.Binding.BoundEventContextMode.Element)
            {
                return handle.handler.call(eventArgs.currentTarget, eventArgs, handle.binding.binding);
            }
            else
            {
                throw Error("Invalid eventContextMode: " + handle.binding.options.eventContextMode)
            }
        };

        _invocationDictionary[handle.hashKey] = handle;
        session.bindingHandle.dispatchHandles.push(handle);

        return replacementValue;
    };

    /**Gets an BindingDispatchInvocationSite based on the currentTarget of the event args.
    @param {BindingDispatchHandle} dispatchHandle The dispatch handle handling the event.
    @param {Event} eventArgs The event arguments for the event.
    @returns {BindingDispatchInvocationSite}  */
    var getInvocationSite = function (dispatchHandle, eventArgs)
    {
        var numSites = dispatchHandle.invocationSites.length;
        for (var x = 0; x < numSites; x++)
        {
            var curSite = dispatchHandle.invocationSites[x];
            if (curSite.eventName === eventArgs.type)
            {
                if (curSite.currentTarget === eventArgs.currentTarget) return curSite;
            }
        }

        return null;
    };

    /**Invokes the function found in the invocationDictionary based on the hash code of the handle.
    @param {Event} eventArgs The browser's event args for the event.
    @param {String} handleHash The hash code of the handle to invoke.
    @returns {Any}*/
    var invokeHandle = function (eventArgs, handleHash)
    {
        var dispatchHandle = _invocationDictionary[handleHash];
        if (dispatchHandle == null)
        {
            var logMessage = "Dispatch function for event " + eventArgs.type + " element " + getElementMoniker(eventArgs.currentTarget) + " could not be found.";
            EVUI.Modules.Core.Utils.log(logMessage);

            return;
        }

        return dispatchHandle.invocationHandle(eventArgs, dispatchHandle.binding);
    };

    //make a global object for the event handlers to call.
    Object.defineProperty($evui, "dispatch", {
        get: function ()
        {
            return invokeHandle;
        },
        enumerable: false
    });

    /**Gets an identifying name for an element to appear in a log message.
    @param {Element} element
    @returns {String}*/
    var getElementMoniker = function (element)
    {
        var moniker = element.tagName.toLowerCase();

        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(element.id) === false)
        {
            moniker += "#" + element.id;
        }

        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(element.className) === false)
        {
            moniker += "." + element.className.trim().replace(/\s/g, ".");
        }

        moniker;
    };

    var cacheObjectKeys = function ()
    {
        EVUI.Modules.Core.Utils.cacheProperties(new BindingHandleState())
    };

    /****************************************************************************OBJECT DEFINITIONS******************************************************************************************** */

    /**Object for containing the parse results of some Html Content.
    @class*/
    var TokenMapping = function ()
    {
        /**String. The name of the property from the htmlContent that was surrounded with {{ and }}. */
        this.path = null;
    };

    /**A container for a stored HTML content.
    @class*/
    var BindingHtmlContentEntry = function ()
    {
        /**Object. The public facing properties of this object.
        @type {EVUI.Modules.Binding.BindingHtmlContent}*/
        this.item = null;

        /**String. The key used to identify the content.
        @type {String}*/
        this.key = null;

        /**String. The URL where the HTNL content can be loaded from.
        @type {String}*/
        this.url = null;

        /**String. The raw HTML of the content.
        @type {String}*/
        this.content = null;

        /**Whether or not the token mappings need to be recalculated. 
        @type {Boolean}*/
        this.needsRecalcuation = true;

        /**Array. The mappings of properties found in the HTML.
        @type {TokenMapping[]}*/
        this.tokenMappings = null;

        /**Boolean. Whether or not this html content is actively being retrieved from a server.
        @type {Boolean}*/
        this.pending = false;

        /**Boolean. Whether or not the content was loaded via HTTP.
        @type {Boolean}*/
        this.loaded = false;

        /**Boolean. Whether or not the HTTP request to get this content failed.
        @type {Boolean}*/
        this.failed = false;

        /**Boolean. If the HTML was changed after it was loaded, it no longer matches it's URL.
        @type {Boolean}*/
        this.ignoreUrl = false;

        /**Array. All of the callbacks that are waiting on this partial to be loaded.
        @type {Function[]}*/
        this.pendingCallbacks = [];
    
        /**Object. The special metadata about this html content.
        @type {HtmlContentMetadata}*/
        this.contentMetata = null;
    };

    /**The container for the state differences between binding sessions for a given Binding.
    @class*/
    var BindingHandle = function (controllerWrapper)
    {
        if (controllerWrapper instanceof BindingControllerWrapper === false) throw Error("Invalid parameters.");

        /**Object. The wrapper for the controller and a few functions to expose in the binding object.
        @type {BindingControllerWrapper}*/
        this.wrapper = controllerWrapper;

        /**Number. The ID of the binding instance.
        @type {Number}*/
        this.id = null;

        /**String. The current state of the binding operation.
        @type {String}*/
        this.progressState = EVUI.Modules.Binding.BindingProgressStateFlags.Idle;

        /**String. The BindingTemplate that this binding is based off of.
        @type {String}*/
        this.templateName = null;

        /**Object. Options object for the Binding.
        @type {EVUI.Modules.Binding.BindOptions}*/
        this.options = null;

        /**Object. The public Binding object that is exposed to the outside.
        @type {EVUI.Modules.Binding.Binding}*/
        this.binding = null;

        /**Object. The current state of the binding operation.
        @type {BindingHandleState}*/
        this.currentState = null;

        /**Object. The previous state of the binding operation.
        @type {BindingHandleState}*/
        this.oldState = null;

        /**Object. The current in-progress state of the binding operation.
        @type {BindingHandleState}*/
        this.pendingState = null;

        /**Boolean. Whether or not to flush the Binding once it has been bound.
        @type {Boolean}*/
        this.disposing = false;

        /**Boolean. Whether or not the current state of the object has already been bound.
        @type {Boolean}*/
        this.newStateBound = false;

        /**Boolean. Whether or not the old state of the object has already been bound.
        @type {Boolean}*/
        this.oldStateBound = false;

        /**Array. An array of event handlers that are bound to this Binding.
        @type {BindingDispatchHandle[]}*/
        this.dispatchHandles = [];

        /**Boolean. Whether or not this binding was canceled after it's "shouldReBind" flag had been set, which means that any observed differences in the source object have been calculated and the ObjectObserver has had it's state set to the new state, which will prevent those changes from being detected when re-run post cancellation. If this flag is set, a re-bind operation is forced.
        @type {Boolean}*/
        this.canceledDuringReBind = false;

        /**Object. The BindingHtmlContentEntry used for this Binding.
        @type {BindingHtmlContentEntry}*/
        this.htmlContent = null;

        /**String. The state in which the Binding is in after its execution ends.
        @type {String}*/
        this.completionState = EVUI.Modules.Binding.BindingCompletionState.None;
    };

    /**The container for the state of the binding at a moment in time.
    @class*/
    var BindingHandleState = function ()
    {
        /**String. The ID of this state.
        @type {String}*/
        this.stateId = _bindingStateIDCounter++;

        /**String. The htmlContent used to generate the final DOM nodes of the binding.
        @type {String|Element|EVUI.Modules.Binding.BindingHtmlContent}*/
        this.htmlContent = null;

        /**Object. The BindingHandle that triggered the creation of this one.
        @type {BindingHandle}*/
        this.parentBindingHandle = null;

        /**Object|String. The element that the binding will be bound to.
        @type {Element|String}*/
        this.element = null;

        /**String. The property name of the parent binding's source object that triggered the creation of this child binding.
        @type {String}*/
        this.parentBindingKey = null;

        /**String. The "path" from the parent Binding's source object to this Binding's source object.
        @type {String}*/
        this.parentBindingPath = null;

        /**Array. The collection of child bindings that this binding triggered the creation of.
        @type {BindingHandle[]}*/
        this.childBindingHandles = [];

        /**Object. The source object used as the source of the values used to merge into the htmlContent.
        @type {Object}*/
        this.source = null;

        /**String. The value hash code of the source object when it was originally assigned.
        @type {String}*/
        this.sourceHashCode = null;

        /**Object. The ObjectObserver watching the source object to keep track of its changes.
        @type {EVUI.Modules.Observers.ObjectObserver}*/
        this.sourceObserver = null;

        /**Array. All of the bound properties of that were found in the source object.
        @type {EVUI.Modules.Binding.BoundProperty[]}*/
        this.boundProperties = null;

        /**String. The final merged htmlContent before it is turned into a DOM element.
        @type {String}*/
        this.mergedHtmlContent = null;

        /**Object. The DocumentFragment holding the result of the htmlContent merging operation.
        @type {DocumentFragment}*/
        this.boundContentFragment = null;

        /**A DomTreeElement hierarchy parsed from the bound HTML htmlContent that will lazily be turned into actual DOM nodes upon request.
        @type {EVUI.Modules.DomTree.DomTreeElement}*/
        this.boundContentTree = null;

        /**Object. The root elements of the final HTML htmlContent after it has been injected into the DOM.
        @type {Node[]}*/
        this.boundContent = null;

        /**Boolean. Whether or not the element was set.
        @type {Boolean}*/
        this.elementSet = false;

        /**Boolean. Whether or not the element was set.
        @type {Boolean}*/
        this.sourceSet = false;

        /**Boolean. Whether or not the htmlContent was set.
        @type {Boolean}*/
        this.htmlContentSet = false;

        /**Object. A clone of the freshly made boundContentFragment that is used for re-binding the Binding on subsequent runs.
        @type {DocumentFragment}*/
        this.boundTemplateContentClone = null;

        /**String. The full path to the Binding starting at their highest parent's path.
        @type {String}*/
        this.normalizedPath = null;
    };

    /**Gets the full path of a BindingHandle's state given the current parents above it.
    @returns {String}*/
    BindingHandleState.prototype.getNormalizedPath = function ()
    {
        return getNormalizedPath(this.parentBindingPath);

        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(this.parentBindingPath) === true) return this.parentBindingPath;
        var path = this.parentBindingPath.replace(/\.|\[|\]\.|\]/g, ".");

        if (EVUI.Modules.Core.Utils.stringEndsWith(".", path) === true) path = path.substring(0, path.length - 1);
        return path;
    }

    /**Wrapper object for injecting into a Binding so that it can use parts of the controller from outside the controller.
    @class*/
    var BindingControllerWrapper = function ()
    {
        /**Reference to the BindingController.
        @type {EVUI.Modules.Binding.BindingController}*/
        this.controller = null;

        /**Reference to the function that kicks off the full bind process.
        @type {triggerBind}*/
        this.triggerBind = null;

        /**Reference to the function that disposes of a Binding.
        @type {triggerDispose}*/
        this.triggerDispose = null;

        /**Reference to the function that kicks off the "smart" update function.
        @type {triggerUpdate}*/
        this.triggerUpdate = null;

        /**Reference to the function that validates element input.
        @type {validateElement}*/
        this.validateElement = null;

        this.toDomNode = null;
    };

    /**Container for all things related to an active Binding in progress.
    @class*/
    var BindingSession = function ()
    {
        /**String. The ID of the binding session.
        @type {Number}*/
        this.sessionId = _sessionIDCounter++;

        /**Object. The binding handle of the binding being bound.
        @type {BindingHandle}*/
        this.bindingHandle = null;

        /**Object. The binding arguments for what will be bound.
        @type {EVUI.Modules.Binding.BindArgs}*/
        this.bindingArgs = null;

        /**Object. The event stream executing the binding operation.
        @type {EVUI.Modules.EventStream.EventStream}*/
        this.eventStream = null;

        /**Array. The array of callbacks to call once this operation completes.
        @type {BindingCallbackEntry[]}*/
        this.callbacks = [];

        /**Whether or not another session came along and canceled this one to prevent a race condition.
        @type {Boolean}*/
        this.cancel = false;

        /**Array. The original set of BoundProperties that was pulled out of the source object.
        @type {EVUI.Modules.Binding.BoundProperty[]} */
        this.originalBoundProps = [];

        /**Array. All of the child BindingSessions that were spawned by this session.
        @type {BindingSession[]}*/
        this.childSessions = [];

        /**Object. Any contextual information to carry around for the binding operation.
        @type {Object}*/
        this.context = {};

        /**Boolean. Whether or not to maintain the currentState of the Binding when the binding process begins.
        @type {Boolean}*/
        this.maintainCurrentState = false;

        /**Object|Array. The differences between the old source object and the new source object.
        @type {EVUI.Modules.Observers.ObservedChangedProperty[]|EVUI.Modules.Diff.CompareResult}*/
        this.observedDifferences = null;

        /**Object. The ObservedProperties that are in the ObjectObserver prior to its new changes being calculated and its state updated.
        @type {EVUI.Modules.Observers.ObservedProperty}*/
        this.oldStateDictionary = null;

        /**Boolean. Whether or not the binding logic should fire again and make a fresh document fragment for this session's Binding.
        @type {Boolean}*/
        this.shouldReBind = true;

        /**Object. The session that spawned this one.
        @type {BindingSession}*/
        this.parentSession = null;

        /**Object. The last inserted node from any child in the session.
        @type {Node}*/
        this.lastInsertedNode = null;

        /**Boolean. Whether or not the source object for this session is an array.
        @type {Boolean}*/
        this.isArray = false;

        /**Number. The ID of the BindingSessionBatch that this BindingSession is being processed in.
        @type {Number}*/
        this.batchId = -1;

        /**Number. The type of action the session is performing. Must be a value from BindingSessionMode.
        @type {Number}*/
        this.sessionMode = BindingSessionMode.None;

        /**Object.The bindingHandle's oldState that is used to roll back to the previous state in the event of a cancel operation.
        @type {BindingHandleState}*/
        this.rollbackState = null;

        /**Object. The pending state that was applied to the current state. Is used in the event of a rollback.
        @type {BinindgHandleState}*/
        this.rollbackPendingState = null;

        /**Array. An array of BindingDispatchHandles to re-attach in the event of a cancellation.
        @type {BindingDispatchHandle[]}*/
        this.rollbackDispatchHandles = [];

        /**Object. A dictionary of all the bound properties and their values that were used in the binding process.
        @type {{}}*/
        this.boundPropertyDictionary = {};
    };

    /**Represents a matching of a binding session as referring to the same Binding, Element, or Source object as another session.
    @class*/
    var BindingSessionMatch = function ()
    {
        /**Object. The binding session that was a match to another session.
        @type {BindingSession}*/
        this.session = null;

        /**Number. The BindingSessionMatchTypeFlags value indicating what matched the other session.
        @type {Number}*/
        this.flags = BindingSessionMatchTypeFlags.None;
    };

    /**Flags for describing what matched in a comparison of two BindingSessions.
    @class*/
    var BindingSessionMatchTypeFlags =
    {
        None: 0,
        SameBinding: 1,
        SameElement: 2,
        SameSource: 4
    };

    /**Entry for associating a callback function passed into the bind or update functions to a given session that is called once the session completes.
    @class*/
    var BindingCallbackEntry = function ()
    {
        /**Number. The sequential ID of the callback, used to ensure that they are called in order when more than one will be called at the end of a binding process (i.e. if one session matched another the callbacks are merged into the newer session). 
        @type {Number}*/
        this.id = -1;

        /**Function. The callback to call.
        @type {EVUI.Modules.Binding.Constants.Fn_BindingCallback}*/
        this.callback = null;

        /**Object. The BindingSession that is tied to the callback.
        @type {BindingSession}*/
        this.session = null;
    };

    /**Object that is populated with the special attribute values that are present on an Element.
    @class*/
    var BindingElementAttributes = function ()
    {
        /**String. The name of the BindingTemplate to use.
        @type {String}*/
        this.templateName = null;

        /**String. The key of any existing htmlContent to use.
        @type {String}*/
        this.key = null;

        /**String. The path from the current parent Binding's source (or from the Window if there is no parent Binding) to the child Binding's source object.
        @type {String}*/
        this.sourcePath = null;

        /**String. The URL of the htmlContent to use.
        @type {String}*/
        this.src = null;

        /**String. A combination of BindingMode and Insertion mode to give the Binding.
        @type {String}*/
        this.mode = null;
    };

    /**Represents the bare minimum amount of information needed to make a child Binding.
    @class*/
    var BoundChild = function ()
    {
        /**Object. The Element the source will be bound relative to.
        @type {Element}*/
        this.element = null;

        /**Object. The source object with the properties to merge into the htmlContent
        @type {Object}*/
        this.source = null;

        /**String. The path from the parent Binding's source object to this child Binding's source object.
        @type {String}*/
        this.path = null;
    };


    /**Represents a batch of BindingSessions that are being executed together as a group.
    @class*/
    var BindingSessionBatch = function ()
    {
        /**Number. The sequential ID of the batch.
        @type {Number}*/
        this.id = _batchIDCounter++;

        /**Array. All of the BindingSessions being run by this batch.
        @type {BindingSession[]}*/
        this.sessions = [];

        /**Number. The number of sessions being run.
        @type {Number}*/
        this.numSessions = 0;

        /**Array. All of the BindingSessions that are a children of any of the sessions in the sesions list.
        @type {BindingSession[]}*/
        this.childSessionQueue = [];

        /**Object. The batch that is a child of this batch.
        @type {BindingSessionBatch}*/
        this.childBatches = [];

        /**Object. The batch that is the parent of this batch.
        @type {BindingSessionBatch}*/
        this.parentBatch = null;

        /**Boolean. Whether or not the batch is executing.
        @type {Boolean}*/
        this.executing = false;
    };

    /**Gets the next batch of child sessions to run as a parallel child batch to its parent.
    @returns {BindingSessionBatch}*/
    BindingSessionBatch.prototype.getNextChildBatch = function ()
    {
        if (this.childSessionQueue.length === 0) return null;

        var nextBatch = new BindingSessionBatch();
        nextBatch.sessions = this.childSessionQueue.splice(0, _maxBatch);
        nextBatch.numSessions = nextBatch.sessions.length;
        nextBatch.parentBatch = this;

        this.childBatches.push(nextBatch);

        return nextBatch;
    };

    /**Executes the batch and calls the callback once all members of the batch have completed.
    @param {Function} callback A callback function to call that takes this BindingSessionBatch as a parameter.*/
    BindingSessionBatch.prototype.execute = function (callback)
    {
        var self = this;
        var numSessions = this.sessions.length;
        if (numSessions === 0) return callback(self);

        this.executing = true;
        var numComplete = 0;

        var commonCallback = function ()
        {
            numComplete++;
            if (numSessions === numComplete)
            {
                self.executing = false;
                callback(self);
            }
        };

        for (var x = 0; x < numSessions; x++)
        {
            var curSession = this.sessions[x];
            curSession.batchId = this.id;

            curSession.eventStream.onComplete = function ()
            {
                commonCallback();
            };

            executeSession(curSession);
        }
    };

    /**The various modes that a BindingSession can execute itself in.
    @enum*/
    var BindingSessionMode =
    {
        /**Default.*/
        None: 0,
        /**Full binding procedure, all children will be re-evaluated.*/
        Bind: 1,
        /**Partial binding procedure, only changed children will be re-evaluated. (Changed at the time from when the "update" function is invoked).*/
        Update: 2
    }

    /**Wrapper for an event handler that is bound to a Binding and a function on that Binding's source.
    @class*/
    var BindingDispatchHandle = function ()
    {
        /**String. The hash code key of this dispatch handle. Made from the path of the bound property and the index of the BindingHandle.
        @type {String}*/
        this.hashKey = null;

        /**String. The path from the BoundProperty.
        @type {String}*/
        this.path = null;

        /**Object. The Binding that this handle is associated with. Passed into the handler as a parameter.
        @type {EVUI.Modules.Binding.Binding}*/
        this.binding = null;

        /**Function. The handling function for the event.
        @type {Function}*/
        this.handler = null;

        /**The array of all the locations in the markup where this handle has been invoked from. Used to remove the BindingDispatchHandle from memory at disposal time.
        @type {BindingDispatchInvocationSite[]}*/
        this.invocationSites = [];

        /**Actual invocation function used to invoke the user's function with the browser's event args and the associated Binding as parameters.
        @param {Event} eventArgs The browser's event arguments.
        @returns {Any} */
        this.invocationHandle = function (eventArgs) { };
    };

    /**Disposes of the BindingDispatchHandle, thus removing it from the DOM and from memory.*/
    BindingDispatchHandle.prototype.dispose = function ()
    {
        var numInvocationSites = this.invocationSites.length;
        for (var x = 0; x < numInvocationSites; x++)
        {
            var curInvocationSite = this.invocationSites[x];

            var attrName = "on" + curInvocationSite.eventName;
            var val = curInvocationSite.currentTarget[attrName];
            if (val != null && val.toString().indexOf(this.hashKey) !== -1)
            {
                curInvocationSite.currentTarget[attrName] = null;
                curInvocationSite.currentTarget.removeAttribute(attrName);
            }
        }

        this.invocationSites = [];

        if (_invocationDictionary[this.hashKey] === this) delete _invocationDictionary[this.hashKey];
    };

    /**Represents a location in markup where a BindingDispatchHandle was invoked from.
    @class*/
    var BindingDispatchInvocationSite = function ()
    {
        /**String. The name of the event that dispatched the event.
        @type {String}*/
        this.eventName = null;

        /**Object. The element that dispatched the event.
        @type {Element}*/
        this.currentTarget = null;
    };

    /**The type of structural change a child binding underwent in the list of its parentBinding's childBinding's list.
    @enum*/
    var BindingStructureChangeType =
    {
        /**No structural change - either no change or a content change to the child Binding.*/
        None: 0,
        /**Binding was added to the new set of childBindings.*/
        Added: 1,
        /**Binding was removed from the new set of childBindings. */
        Removed: 2,
        /**Binding was swapped with another binding, meaning their contents should switch places in the DOM.*/
        Swapped: 3,
        /**Binding was a member of an array and has had its index change in response to the source array having elements spliced into or out of it.*/
        Shifted: 4,
        /**Binding was not a member of an array, but had it's content moved to a new key in the source object.*/
        Moved: 5
    };

    /**A container describing all of the changes made between an old set of childBindings and a new set of childBindings.
    @class*/
    var ChildDifferencePackage = function ()
    {
        /**Boolean. Whether or not the session being changed is an array.
        @type {Boolean}*/
        this.isArray = false;

        /**Object. Dictionary of all paths that have been modified when the old and new lists were compared against each other. Object values are ChildDifferences.
        @type {Object}*/
        this.modifiedPaths = {};

        /**Array. The array of all the bindings that were not changed.
        @type {ChildDifference[]}*/
        this.unchangedBindings = [];
    };

    /**Represents a difference in one of the children of a Binding when it is being re-bound. 
    @class*/
    var ChildDifference = function ()
    {
        /**Number. The index of the Binding in the list of parent Bindings.
        @type {Number}*/
        this.index = -1;

        /**Object. The BindingHandle that was processed.
        @type {BindingHandle}*/
        this.binding = null;

        /**Object. Whether or not the contents of the child Binding's source object have been modified.
        @type {Boolean}*/
        this.contentsModified = false;

        /**Number. The type of structural change the difference represents if the change involved changing the assignment of a binding to a new, changed, or removed key.
        @type {Number}*/
        this.bindingStructureChangeType = BindingStructureChangeType.None;

        /**Object. If the Binding is being moved to a new key or swapped with an existing one, this is the other Binding involved in the move or switch.
        @type {BindingHandle}*/
        this.moveSwapTarget = null;

        /**Boolean. Whether or not the change has been applied by the change processor.
        @type {Boolean}*/
        this.applied = false;
    };

    var BindingContentList = function (path)
    {
        this.normalizedPath = path;

        /**
        @type {BindingContentListItem[]}*/
        this.bindings = [];
        this.numBindings = 0;
    };

    BindingContentList.prototype.addBinding = function (bindingHandle, index)
    {
        var listItem = new BindingContentListItem(bindingHandle);
        listItem.index = index;

        this.numBindings = this.bindings.push(listItem);

        return listItem;
    };

    BindingContentList.prototype.getNextUnprocessedBinding = function ()
    {
        for (var x = 0; x < this.numBindings; x++)
        {
            var curBindingItem = this.bindings[x];
            if (curBindingItem.processed === false) return curBindingItem;
        }

        return null;
    };

    BindingContentList.prototype.makeChangeArray = function (changeType)
    {
        var changes = [];
        for (var x = 0; x < this.numBindings; x++)
        {
            var curBinding = this.bindings[x];

            var curChange = new ChildDifference();
            curChange.binding = curBinding.binding;
            curChange.index = curBinding.index;
            curChange.bindingStructureChangeType = (typeof changeType === "function") ? changeType(curChange) : changeType;

            changes.push(curChange);
        }

        return changes;
    }

    var BindingContentListItem = function (bindingHandle)
    {
        /**
        @type {BindingHandle}*/
        this.binding = bindingHandle;
        this.index = -1;
        this.processed = false;

        /**
        @type {BindingHandleState}*/
        this.stateToCheck = null;
    };

    var HtmlContentMetadata = function ()
    {
        this.html = null;
        this.attributePaths = {};
    };

    var ElementMetadata = function ()
    {
        this.attributes = {};
    };

    /**
     * 
     * @param {any} attrName
     * @returns {AttributeMetadata}
     */
    ElementMetadata.prototype.getAttributeMetadata = function (attrName)
    {
        return this.attributes[attrName];
    };

    var AttributeMetadata = function ()
    {
        this.name = null;
        this.containsBoundValues = false;

        this.value = null;

        this.tokenizedValue = null;

        /**
        @type {AttributeValueMetadata[]}*/
        this.values = [];
    };

    var AttributeValueMetadata = function ()
    {
        this.value = null;
        this.wasBound = false;
        this.tokenizedString = null;

        /**
        @type {BoundAttributeValueMetadata[]}*/
        this.boundValues = [];
    };

    var BoundAttributeValueMetadata = function ()
    {
        this.boundContent = null;
        this.boundPath = null;
    };

    var BindingTemplateEntry = function ()
    {
        this.templateName = null;
    };

    cacheObjectKeys();
    ensureServices();
};

/**A container for Html content that is stored in the BindingController that can be referenced by its key in Bindings so that the same Html can be re-used and referenced in multiple places.
@class*/
EVUI.Modules.Binding.BindingHtmlContent = function (entry)
{
    if (entry == null || typeof entry.key !== "string") throw Error("Invalid constructor arguments.");
    var _entry = entry;

    /**String. The key used to reference the Html content by.
    @type {String}*/
    this.key = null;
    Object.defineProperty(this, "key", {
        get: function () { return _entry.key; },
        configurable: false,
        enumerable: true
    });

    /**String. The URL of where the Html content can be found if it is being loaded remotely.
    @type {String}*/
    this.url = null;
    Object.defineProperty(this, "url", {
        get: function () { return _entry.url; },
        configurable: false,
        enumerable: true
    });

    /**String. The raw Html to use in the Binding process.
    @type {String}*/
    this.content = null;
    Object.defineProperty(this, "content", {
        get: function () { return _entry.content; },
        set: function (value)
        {
            if (typeof value !== "string" && value != null) throw Error("content must be a string.");
            if (_entry.content !== value)
            {
                _entry.needsRecalcuation = true;
                if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(value) === false && _entry.loaded === true)
                {
                    _entry.ignoreUrl = true; //the htmlContent is now different than what was returned from the server, so if we get just the URL again re-load the result in a new entry.
                }

                if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(value) == true)
                {
                    _entry.ignoreUrl = false;
                    _entry.loaded = false;
                }

                _entry.content = value;
            }
        },
        configurable: false,
        enumerable: true
    });
};

/**The central object of the binding mechanism, contains all the settings and overrides for performing a binding operation and is obtained via invoking the bind or bindAsync commands.
@class*/
EVUI.Modules.Binding.Binding = function (handle)
{
    if (handle == null || handle.wrapper == null) throw Error("Invalid constructor arguments");

    var _handle = handle;
    var _self = this;

    /**String. The ID of the binding.
    @type {Number}*/
    this.id = null;
    Object.defineProperty(this, "id", {
        get: function ()
        {
            return _handle.id;
        },
        configurable: false,
        enumerable: true
    });

    /**String. The name of the BindingTemplate that this Binding was created from.
    @type {String}*/
    this.templateName = null;
    Object.defineProperty(this, "templateName", {
        get: function () { return _handle.templateName; },
        configurable: false,
        enumerable: true
    });

    /**Element. The Element in the DOM that the htmlContent will be inserted relative to. Cannot be changed while a Binding operation is in progress. If this Binding is the child of another Binding, the element must be a child element of the boundContent of the parent Binding.
    @type {Element}*/
    this.element = null;
    Object.defineProperty(this, "element", {
        get: function ()
        {
            return (_handle.pendingState != null && _handle.pendingState.elementSet === true) ? _handle.pendingState.element : _handle.currentState.element;
        },
        set: function (value)
        {
            if (value === _handle.currentState.element) return;
            if (_handle.progressState != EVUI.Modules.Binding.BindingProgressStateFlags.Idle) throw Error("Cannot change the element of a Binding that is queued or in progress.");
            if (_handle.wrapper.validateElement(value) === false) throw Error("Failed to set element - must be null, a non-whitespace string, a DocumentFragment, or an Element.");

            if (_handle.newStateBound === true || _handle.pendingState != null)
            {
                if (_handle.pendingState == null) _handle.pendingState = {};
                _handle.pendingState.elementSet = true;
                _handle.pendingState.element = value;
            }
            else
            {
                _handle.currentState.element = value;
                _handle.currentState.elementSet = true;
            }
        },
        configurable: false,
        enumerable: true
    });

    /**Number. Flags indicating the current state of the bind operation on this Binding.
    @type {Number}*/
    this.bindingProgressState = EVUI.Modules.Binding.BindingProgressStateFlags.Idle;
    Object.defineProperty(this, "bindingProgressState", {
        get: function () { return _handle.progressState; },
        configurable: false,
        enumerable: true
    });

    /**String. Status value indicating whether or not the Binding was bound successfully, or if it ended due to a cancellation or error.
    @type {String}*/
    this.bindingCompletionState = EVUI.Modules.Binding.BindingCompletionState.None;
    Object.defineProperty(this, "bindingCompletionState", {
        get: function () { return _handle.completionState; },
        configurable: false,
        enumerable: true
    });

    /**Object. The source object that the values for the Binding and any child Bindings will be pulled from. Cannot be re-assigned during a binding in progress.
    @type {Object}*/
    this.source = null;
    Object.defineProperty(this, "source", {
        get: function () { return (_handle.pendingState != null && _handle.pendingState.sourceSet === true) ? _handle.pendingState.source : _handle.currentState.source; },
        set: function (value)
        {
            if (value != null && typeof value !== "object") throw Error("source must be an object.");
            if (value === _handle.currentState.source) return;
            if (_handle.progressState != EVUI.Modules.Binding.BindingProgressStateFlags.Idle) throw Error("Cannot change the source object reference of a Binding that is queued or in progress.");

            if (_handle.newStateBound === true || _handle.pendingState != null)
            {
                if (_handle.pendingState == null) _handle.pendingState = {};
                _handle.pendingState.source = value;
                _handle.pendingState.sourceSet = true;
            }
            else
            {
                _handle.currentState.source = value;
                _handle.currentState.sourceSet = true;
            }
        },
        configurable: false,
        enumerable: true
    });

    /**String. The Html content (or Element that the Html will be pulled from) that will be populated with values from the source object. Cannot be changed during a Binding in progress after the onSetBinding events fire.
    @type {String|Element|EVUI.Modules.Binding.BindingHtmlContent}*/
    this.htmlContent = null;
    Object.defineProperty(this, "htmlContent", {
        get: function ()
        {
            return  (_handle.pendingState != null && _handle.pendingState.htmlContentSet === true) ? _handle.pendingState.htmlContent: _handle.currentState.htmlContent;
        },
        set: function (value)
        {
            if (value === _handle.currentState.htmlContent) return;
            if (EVUI.Modules.Core.Utils.hasFlag(_handle.progressState, EVUI.Modules.Binding.BindingProgressStateFlags.GotHtmlContent)) throw Error("Cannot change the htmlContent of a Binding that has already been Bound.");

            var stateToSet = null;

            if (_handle.newStateBound === true || _handle.pendingState != null)
            {
                if (_handle.pendingState == null) _handle.pendingState = {};
                stateToSet = _handle.pendingState;
            }
            else
            {
                stateToSet = _handle.currentState;
            }

            if (value != null && typeof value !== "string")
            {
                if (value instanceof EVUI.Modules.Binding.BindingHtmlContent)
                {
                    stateToSet.htmlContent = value;
                    stateToSet.htmlContentSet = true;
                }
                else if (EVUI.Modules.Core.Utils.isElement(value) === true)
                {
                    stateToSet.htmlContent= value;
                    stateToSet.htmlContentSet = true;
                }
                else
                {
                    throw Error("template must be a string, Element, or BindingTemplateCaheItem.")
                }
            }
            else
            {
                stateToSet.htmlContent= value;
                stateToSet.htmlContentSet = true;
            }
        }
    });

    /**Object. The options for controlling how the binding is inserted and processed. Cannot be null.
    @type {EVUI.Modules.Binding.BindOptions}*/
    this.options = null;
    Object.defineProperty(this, "options", {
        get: function ()
        {
            return _handle.options;
        },
        set: function (value)
        {
            if (typeof value === "object")
            {
                if (value == null)
                {
                    throw Error("options must be an object.");
                }
                else
                {
                    _handle.options = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Binding.BindOptions(), value);
                }
            }
            else
            {
                throw Error("options must be an object.");
            }
        }
    });

    /**Object. The settings for loading the binding's htmlContent from a remote source.
    @type {EVUI.Modules.Binding.BindingContentLoadSettings}*/
    this.contentLoadSettings = null;

    /**String. The way in which the binding will be inserted into the DOM. Must be a value from the BindingMode enum. BindingMode.Merge by default.
    @type {String}*/
    this.bindingMode = EVUI.Modules.Binding.BindingMode.Merge;

    /**String. The way in which the final product of the binding operation will be inserted relative to the Binding's element. Must be a value from the BindingInsertionMode enum. BindingInsertionMode.Append by default.
    @type {String}*/
    this.insertionMode = EVUI.Modules.Binding.BindingInsertionMode.Default;

    /**Gets a cloned copy of the internal boundProperties list that maps a path to a property in the source object to the value found at that path in the source object.
    @returns {EVUI.Modules.Binding.BoundProperty[]}*/
    this.getBoundProperties = function ()
    {
        var numBound = (_handle.currentState != null && _handle.currentState.boundProperties != null) ? _handle.currentState.boundProperties.length : 0;

        var boundProps = [];

        for (var x = 0; x < numBound; x++)
        {
            var curProp = _handle.currentState.boundProperties[x];
            var newProp = new EVUI.Modules.Binding.BoundProperty(curProp.path);
            newProp.value = curProp.value;

            boundProps.push(newProp);
        }

        return boundProps;
    };

    /**Changes the value of a boundProperty in the Binding. Returns true if successful, false otherwise.
    @param {String} path The path of the boundProperty to change.
    @param {Any} value The value to set the boundProperty to.
    @returns {Boolean}*/
    this.changeBoundPropertyValue = function (path, value)
    {
        if (typeof path !== "string") throw Error("String expected.");

        var numBound = (_handle.currentState != null && _handle.currentState.boundProperties != null) ? _handle.currentState.boundProperties.length : 0;

        for (var x = 0; x < numBound; x++)
        {
            var curProp = _handle.currentState.boundProperties[x];
            if (curProp.path === path)
            {
                curProp.value = value;
                return true;
            }
        }

        return false;
    };

    /**Object. The DocumentFragment containing the DOM Nodes made from the merged Html content.
    @type {DocumentFragment}*/
    this.boundContentFragment = null;
    Object.defineProperty(this, "boundContentFragment", {
        get: function ()
        {
            if (_handle.currentState.boundTemplateFragment != null) return _handle.currentState.boundTemplateFragment;

            if (_handle.currentState.boundContentTree != null && _handle.newStateBound === false)
            {
                _handle.currentState.boundTemplateFragment = _handle.wrapper.toDomNode(_handle.currentState.boundContentTree); //_handle.currentState.boundContentTree.toNode();
            }

            return _handle.currentState.boundTemplateFragment;
        },
        configurable: false,
        enumerable: true
    });

    /**Object. The Binding that triggered the creation of this binding.
    @type {EVUI.Modules.Binding.Binding}*/
    this.parentBinding = null;
    Object.defineProperty(this, "parentBinding", {
        get: function ()
        {
            return (_handle.currentState.parentBindingHandle != null) ? _handle.currentState.parentBindingHandle.binding : null;
        },
        configurable: false,
        enumerable: true
    });

    /**String. The property name in the parent binding that selected the source object for this Binding.
    @type {String}*/
    this.parentBindingKey = null;
    Object.defineProperty(this, "parentBindingKey", {
        get: function ()
        {
            return _handle.currentState.parentBindingKey;
        },
        configurable: false,
        enumerable: true
    });

    /**Gets a copy of the list of childBindings that are direct children to this binding.
    @returns {EVUI.Modules.Binding.Binding[]}*/
    this.getChildBindings = function ()
    {
        var childBindings = [];
        var numChildren = (_handle.currentState != null && _handle.currentState.childBindingHandles != null) ? _handle.currentState.childBindingHandles.length : 0;
        for (var x = 0; x < numChildren; x++)
        {
            childBindings.push(_handle.currentState.childBindingHandles[x].binding);
        }

        return childBindings;
    };

    /**Removes a child Binding from the Binding by invoking its dispose function. Returns true if successful, false otherwise.
    @param {EVUI.Modules.Binding.Binding} childBinding The child Binding to remove from its parent.
    @returns {Boolean} */
    this.removeChildBinding = function (childBinding)
    {
        if (childBinding == null) return false;

        var found = false;

        var numBindings = (_handle.currentState != null && _handle.currentState.childBindingHandles != null) ? _handle.currentState.childBindingHandles.length : 0;
        for (var x = 0; x < numBindings; x++)
        {
            var curChildBinding = _handle.currentState.childBindingHandles[x].binding;
            if (childBinding.id === binding.id && curChildBinding === childBinding)
            {
                found = true;
                break;
            }
        }

        if (found === false) return false;
        childBinding.dispose();

        return true;
    };

    /**Gets a copy of the internal boundContent list that contains all the Nodes produced by binding this Binidng to the DOM.
    @returns {Node[]}*/
    this.getBoundContent = function ()
    {
        var boundContent = [];
        var numBoundContent = _handle.currentState.boundContent.length;
        for (var x = 0; x < numBoundContent; x++)
        {
            boundContent.push(_handle.currentState.boundContent[x]);
        }

        return boundContent;
    };

    /**Executes the binding process and recalculates itself and all child bindings.
    @param {EVUI.Modules.Binding.BindArgs} bindArgs Optional. Either a source object reference to base the bind on, or a YOLO BindArgs object to pass into the bind logic.
    @param {EVUI.Modules.Binding.Constants.Fn_BindingCallback} callback A callback function to call once the binding process is complete.*/
    this.bind = function (bindArgs, callback)
    {
        if (typeof bindArgs === "function" && callback == null) callback = bindArgs;

        if (bindArgs == null || typeof bindArgs === "function")
        {
            bindArgs = new EVUI.Modules.Binding.BindArgs();
            bindArgs.bindingTarget = this.element;
            bindArgs.bindingSource = this.source;
        }

        _handle.wrapper.triggerBind(_handle, bindArgs, null, callback);
    };

    /**Awaitable. Executes the binding process and recalculates itself and all child bindings.
    @param {EVUI.Modules.Binding.BindArgs} bindArgs Optional. Either a source object reference to base the bind on, or a YOLO BindArgs object to pass into the bind logic.
    @returns {Promise<EVUI.Modules.Binding.Binding>}*/
    this.bindAsync = function (bindArgs)
    {
        return new Promise(function (resolve)
        {
            _self.bind(bindArgs, function ()
            {
                resolve(_self);
            });
        });
    };

    /**Executes the binding process for itself and any of its children that have changed, unchanged children are not re-evaluated.
    @param {EVUI.Modules.Binding.UpdateArgs} updateArgs Optional. Either a source object reference to base the update on, or a YOLO UpdateArgs object to pass into the update logic.
    @param {EVUI.Modules.Binding.Constants.Fn_BindingCallback} callback A callback function to call once the update is complete.*/
    this.update = function (updateArgs, callback)
    {
        _handle.wrapper.triggerUpdate(_handle, updateArgs, null, callback);
    };

    /**Executes the binding process for itself and any of its children that have changed, unchanged children are not re-evaluated.
    @param {EVUI.Modules.Binding.UpdateArgs} updateArgs Optional. Either a source object reference to base the update on, or a YOLO UpdateArgs object to pass into the update logic.
    @param {EVUI.Modules.Binding.Constants.Fn_BindingCallback} callback A callback function to call once the update is complete.*/
    this.updateAsync = function (updateArgs)
    {
        return new Promise(function (resolve)
        {
            _self.update(updateArgs, function ()
            {
                resolve(_self);
            })
        });
    };

    /**Overwrites all the values on this Binding with those that were set on the given BindingTemplate.
    @param {String} templateName The name of the template to apply.
    @returns {Boolean}*/
    this.applyBindingTemplate = function (templateName)
    {
        if (_handle.progressState !== EVUI.Modules.Binding.BindingProgressStateFlags.Idle) throw Error("Cannot set the BindingTemplate of a Binding in progress.");

        var template = null;

        if (typeof templateName === "string")
        {
            template = EVUI.Modules.Binding.Binder.getBindingTemplate(templateName);
            if (template == null) return false;
        }
        else if (templateName != null && typeof templateName === "object")
        {
            template = templateName;
        }
        else
        {
            throw Error("String or object expected.");
        }

        EVUI.Modules.Core.Utils.shallowExtend(this, template, ["templateName"]);
        _handle.templateName = templateName;

        return true;
    };

    /**Disposes of the Binding and all of its associated resources and removes its DOM Nodes from the DOM.*/
    this.dispose = function ()
    {
        return _handle.wrapper.triggerDispose(_handle);
    };

    /**Event that fires immediately before the binding process begins.
    @type {EVUI.Modules.Binding.Constants.Fn_BindingEventHandler}*/
    this.onBind = null;

    /**Event that fires when the htmlContent for the binding has been obtained.
    @type {EVUI.Modules.Binding.Constants.Fn_BindingEventHandler}*/
    this.onSetHtmlContent = null;

    /**Event that fires when the htmlContent has been finalized and the bindings in the htmlContent
    @type {EVUI.Modules.Binding.Constants.Fn_BindingEventHandler}*/
    this.onSetBindings = null;

    /**Event that fires when the htmlContent has been populated with the values from the bound object.
    @type {EVUI.Modules.Binding.Constants.Fn_BindingEventHandler}*/
    this.onBindHtmlContent = null;

    /**Event that fires when the child bindings of the current binding have been found and are about to be bound.
    @type {EVUI.Modules.Binding.Constants.Fn_BindingEventHandler}*/
    this.onBindChildren = null;

    /**Event that fires when the htmlContent has been populated with the values from the bound object and has had all of its child bindings injected into it.
    @type {EVUI.Modules.Binding.Constants.Fn_BindingEventHandler}*/
    this.onChildrenBound = null;

    /**Event that fires when the binding operation is complete and the complete content and all its children has been injected.
    @type {EVUI.Modules.Binding.Constants.Fn_BindingEventHandler}*/
    this.onBound = null;
};

/**Searches all the children underneath this Binding using the predicate function to find a match.
@param {EVUI.Modules.Binding.Constants.Fn_SearchBindings} selector
@param {Boolean} recursive Whether or not to perform a recursive search.
@param {Boolean} returnFirst Whether or not to return the first match found (or null) instead of an array (or potentially empty array).
@returns {EVUI.Modules.Binding.Binding[]|EVUI.Modules.Binding.Binding} */
EVUI.Modules.Binding.Binding.prototype.search = function (selector, recursive, returnFirst)
{
    if (typeof selector !== "function") throw Error("Function expected.");
    if (typeof recursive !== "boolean") recursive = false;
    if (typeof returnFirst !== "boolean") returnFirst = false;
    var results = [];
    var children = this.getChildBindings();
    var numChildren = children.length;
    for (var x = 0; x < numChildren; x++)
    {
        var curChild = children[x];
        if (selector(curChild) === true)
        {
            if (returnFirst === true) return curChild;
            results.push(curChild);
        }

        if (recursive === true)
        {
            var childSearchResult = curChild.search(selector, recursive, returnFirst);
            if (childSearchResult != null)
            {
                if (returnFirst === true) return childSearchResult;
                if (childSearchResult.length > 0)
                {
                    results = results.concat(childSearchResult);
                }
            }
        }
    }

    if (returnFirst === true) return null;
    return results;
};

/**Gets the root parent binding of this binding that has no parents above it.
@returns {EVUI.Modules.Binding.Binding}*/
EVUI.Modules.Binding.Binding.prototype.getRootBinding = function ()
{
    var parent = this.parentBinding;
    while (parent != null)
    {
        var newParent = parent.parentBinding;
        if (newParent == null) return parent;

        parent = newParent;
    }

    return parent;
};



/**Represents a property that was found in the htmlContent (surrounded by {{double curly braces}}) and its value in the source object.
@class*/
EVUI.Modules.Binding.BoundProperty = function (path)
{
    /**The path from the Binding's source object to the property to inject into the htmlContent.
    @type {String}*/
    this.path = path;

    /**The value found in the Binding's source object at the given path.
    @type {Any}*/
    this.value = null;
};

/**Arguments for adding, updating, or executing a binding operation.
@class*/
EVUI.Modules.Binding.BindingTemplate = function (templateEntry)
{   
    var _templateEntry = templateEntry;

    /**String. Read only. The name of the BindingTemplate.
    @type {String}*/
    this.templateName = null;

    //only add the getters if this was made with a real TemplateEntry object, otherwise it is a throwaway object that doesn't need the overhead of the getters
    if (_templateEntry != null)
    {
        Object.defineProperty(this, "templateName", {
            get: function ()
            {
                return _templateEntry.templateName;
            },
            enumerable: true,
            configurable: false
        });
    }

    /**String. Either the htmlContent that will be populated with values from the source object, or the key of a BindingHtmlContent, or a YOLO BindingHtmlContent object, or an Element to use its outerHTML as a template.
    @type {String|EVUI.Modules.Binding.BindingHtmlContent|Element}*/
    this.htmlContent = null;

    /**Object. The options for controlling how the binding is inserted and processed.
    @type {EVUI.Modules.Binding.BindOptions}*/
    this.options = null;

    /**Object. The settings for loading the binding's htmlContent from a remote source.
    @type {EVUI.Modules.Binding.BindingContentLoadSettings}*/
    this.contentLoadSettings = null;

    /**String. The way in which the binding will be inserted into the DOM. Must be a value from the BindingMode enum. BindingMode.Merge by default.
    @type {String}*/
    this.bindingMode = EVUI.Modules.Binding.BindingMode.Merge;

    /**String. The way in which the final product of the binding operation will be inserted relative to the Binding's element. Must be a value from the BindingInsertionMode enum. BindingInsertionMode.Append by default.
    @type {String}*/
    this.insertionMode = EVUI.Modules.Binding.BindingInsertionMode.Default;

    /**Event that fires immediately before the binding process begins.
    @type {EVUI.Modules.Binding.Constants.Fn_BindingEventHandler}*/
    this.onBind = null;

    /**Event that fires when the htmlContent for the binding has been obtained.
    @type {EVUI.Modules.Binding.Constants.Fn_BindingEventHandler}*/
    this.onSetHtmlContent = null;

    /**Event that fires when the htmlContent has been finalized and the bindings in the htmlContent
    @type {EVUI.Modules.Binding.Constants.Fn_BindingEventHandler}*/
    this.onSetBindings = null;

    /**Event that fires when the htmlContent has been populated with the values from the bound object.
    @type {EVUI.Modules.Binding.Constants.Fn_BindingEventHandler}*/
    this.onBindHtmlContent = null;

    /**Event that fires when the child bindings of the current binding have been found and are about to be bound.
    @type {EVUI.Modules.Binding.Constants.Fn_BindingEventHandler}*/
    this.onBindChildren = null;

    /**Event that fires when the htmlContent has been populated with the values from the bound object and has had all of its child bindings injected into it.
    @type {EVUI.Modules.Binding.Constants.Fn_BindingEventHandler}*/
    this.onChildrenBound = null;

    /**Event that fires when the binding operation is complete and the complete content and all its children has been injected.
    @type {EVUI.Modules.Binding.Constants.Fn_BindingEventHandler}*/
    this.onBound = null;
};

/**Arguments to feed into the bind and bindAsync functions.
@class*/
EVUI.Modules.Binding.BindArgs = function ()
{
    /**Object. The Element to bind the content relative to.
    @type {Element}*/
    this.bindingTarget = null;

    /**Object. The source object for the Binding to draw values from to populate its htmlContent.
    @type {Object}*/
    this.bindingSource = null;

    /**String. The name of the BindingTemplate to use, if any.
    @type {String}*/
    this.templateName = null;

    /**Any. Any contextual information to pass into the binding.
    @type {Any}*/
    this.bindingContext = null;
};

/**Arguments to feed into the update and updateAsunc functions.
@class*/
EVUI.Modules.Binding.UpdateArgs = function ()
{
    /**Object. The source object for the Binding to draw values from to populate its htmlContent.
    @type {Object}*/
    this.bindingSource = null;

    /**Any. Any contextual information to pass into the Binding.
    @type {Any}*/
    this.bindingContext = null;
};

/**Settings for how to load remote htmlContent for the Binding.
@class*/
EVUI.Modules.Binding.BindingContentLoadSettings = function ()
{
    /**The HttpRequestArgs to use to make the web request to get the htmlContent.
    @type {EVUI.Modules.Http.HttpRequestArgs}*/
    this.httpRequestArgs = null;
};

/**Options for controlling the behavior of the Binding.
@class*/
EVUI.Modules.Binding.BindOptions = function ()
{
    /**Boolean. Whether or not to execute recursive Bindings under the current Binding if any are detected. True by default.
    @type {Boolean}*/
    this.recursive = true;

    /**Boolean. When executing recursive Bindings, this controls whether or not the child Bindings get the same event handlers as their parent if the child Binding is not based on a BindingTemplate that has its own events. True by default.
    @type {Boolean}*/
    this.recursiveEvents = true;

    /**Boolean. When executing recursive Bindings, this controls whether or not the child Bindings raise any events during their Binding process. False by default.
    @type {Boolean}*/
    this.suppressChildEvents = false;

    /**Boolean. When executing recursive Bindings, this controls whether or not the options object reference is shared by all child Bindings of the current Binding if the child Binding is not based on a BindingTemplate that has its own options, otherwise a shallow clone of the options is used instead. True by default.
    @type {Boolean}*/
    this.shareOptions = true;

    /**Boolean. When executing recursive Bindings, this controls whether or not the templateLoadSettings object reference is shared by all child Bindings of the current Binding if the child Binding is not based on a BindingTemplate that has its own templateLoadSettings, otherwise a clone of the templateLoadSettings is used instead. True by default.
    @type {Boolean}*/
    this.shareContentLoadSettings = true;

    /**Boolean. When executing recursive Bindings and using a CSS selector to find the Binding's element, this controls whether or not the parent Binding's element is used as the scope for finding the child Binding's element. True by default.
    @type {Boolean}*/
    this.scopedCSSSelectors = true;

    /**Boolean. When executing a HTTP request for Html, if this Binding does not have an associated BindingHtmlContent, add a BindingHtmlContent when the result is loaded. True by default.
    @type {Boolean}*/
    this.addMissingHtmlContent = true;

    /**Boolean. When Binding a source object that is an Array, this controls whether or not the htmlContent for the Binding will be duplicated for each item in the array. True by default.
    @type {Boolean}*/
    this.enumerateArrays = true;

    /**String. When executing recursive bindings, this controls how the binding operation's context will be shared with its children. Must be a value from ShareContextMode. By default, if the context is an object, the same reference will be used for child Bindings.
    @type {String}*/
    this.shareContextMode = EVUI.Modules.Binding.ShareContextMode.ShareReference;

    /**String. When an event handler is bound to the DOM, this control what is the "this" context for the event handler. Defaults to the calling element. Must be a value from BoundEventContextMode.
    @type {String}*/
    this.eventContextMode = EVUI.Modules.Binding.BoundEventContextMode.Element;
};

/**Event arguments for the Binding process.
@class*/
EVUI.Modules.Binding.BinderEventArgs = function (bindSession)
{
    var _bindSession = bindSession;

    /**Object. The Binding being processed.
    @type {EVUI.Modules.Binding.Binding}*/
    this.binding = _bindSession.bindingHandle.binding;

    /**Boolean. Whether or not the Binding is re-binding itself.
    @type {Boolean}*/
    this.reBinding = _bindSession.bindingHandle.oldStateBound;

    /**Array. If this Binding has been bound more than once, this is the old content that was bound before the current binding operation.
    @type {Node[]}*/
    this.originalContent = (_bindSession.bindingHandle.oldState != null && _bindSession.bindingHandle.oldState.boundContent != null) ? _bindSession.bindingHandle.oldState.boundContent.slice() : null;

    /**Object. The original source object that was bound to the Binding previously.
    @type {Object}*/
    this.originalSource = (_bindSession.bindingHandle.oldState != null) ? _bindSession.bindingHandle.oldState.source : null;

    /**String. The unique key current step in the EventStream.
    @type {String}*/
    this.key = null;

    /**Pauses the EventStream, preventing the next step from executing until resume is called.*/
    this.pause = function () { };

    /**Resumes the EventStream, allowing it to continue to the next step.*/
    this.resume = function () { };

    /**Cancels the EventStream and aborts the execution of the operation.*/
    this.cancel = function () { }

    /**Stops the EventStream from calling any other event handlers with the same name.*/
    this.stopPropagation = function () { };

    /**Object. Any state value to carry between events.
    @type {Object}*/
    this.context = {};
};

/**The way in which the binding will be inserted into the DOM.
@enum*/
EVUI.Modules.Binding.BindingMode =
{
    /**The new or changed content from the Binding will be merged with the existing DOM contents.*/
    Merge: "merge",
    /**The old content from the Binding will be removed and replaced with the new content.*/
    Overwrite: "overwrite"
};

Object.freeze(EVUI.Modules.Binding.BindingMode);

/**The way in which the final product of the binding operation will be inserted relative to the Binding's element.
@enum*/
EVUI.Modules.Binding.BindingInsertionMode =
{
    /**Unset value. Defaults to Append if left unset.*/
    Default: "default",
    /**The content will be appended as a child underneath the Binding's element.*/
    Append: "append",
    /**The content will be prepended as a child underneath the Binding's element.*/
    Prepend: "prepend",
    /**The content will be inserted as a peer before the Binding's element.*/
    InsertBefore: "before",
    /**The content will be inserted as a peer after the Binding's element.*/
    InsertAfter: "after",
    /**The content will be inserted into the Binding's element's shadow.*/
    Shadow: "shadow",
    /**The content will be returned as a DocumentFragment and not be inserted into the DOM.*/
    Fragment: "fragment",
    /**The content will be put in place of the Binding's element's children after removing the existing children from the DOM.*/
    ReplaceChildren: "replace"
};

Object.freeze(EVUI.Modules.Binding.BindingInsertionMode);

/**Enum for describing how the context property of a binding session will be shared with child Bindings.
@enum*/
EVUI.Modules.Binding.ShareContextMode =
{
    /**The context will be a new object reference for each child Binding.*/
    NewContext: "cxt-new",
    /**The context will be the same object reference or value for each child Binding.*/
    ShareReference: "cxt-ref",
    /**The context will be a shallow clone of its parent's context.*/
    Clone: "cxt-clone"
};

Object.freeze(EVUI.Modules.Binding.ShareContextMode);

/**Progress flags indicating how far into the binding process the Binding currently is.
@enum*/
EVUI.Modules.Binding.BindingProgressStateFlags =
{
    /**The Binding is at rest and can freely be modified.*/
    Idle: 0,
    /**The Binding has been queued for a bind operation or an update operation and cannot have its source object reference changed beyond this point.*/
    Queued: 1,
    /**The Binding has resolved its element reference and cannot have its element reference changed beyond this point.*/
    GotElement: 2,
    /**The Binding has resolved its htmlContent and cannot have its htmlContent changed beyond this point.*/
    GotHtmlContent: 4,
    /**The Binding has resolved its boundProperties and cannot have the boundProperty list modified beyond this point.*/
    GotBoundProperties: 8,
    /**The Binding has created its boundContentFragment.*/
    BoundHtmlContent: 16,
    /**The Binding has resolved all of its childBindings. The childBindings array cannot be changed beyond this point.*/
    GotChildren: 32,
    /**The Binding is in the process of binding or updating its childBindings.*/
    BindingChildren: 64,
    /**The Binding has completed binding its children and has finalized its boundContentFragment for injection.*/
    BoundChildren: 128,
    /**The Binding has been injected into the DOM and no further changes to the state of the Binding will be reflected until it is re-bound or updated.*/
    Injected: 256
};

Object.freeze(EVUI.Modules.Binding.BindingProgressStateFlags);

/**An enum for indicating what the "this" context should be for event handlers that are bound to the DOM by the Binder.
@enum*/
EVUI.Modules.Binding.BoundEventContextMode =
{
    /**When a bound event is dispatched, the "this" context for the function will be the Element raising the event.*/
    Element: "element",
    /**When a bound event is dispatched, the "this" context for the function will be the object that owns the function being called.*/
    ParentObject: "parent"
};

Object.freeze(EVUI.Modules.Binding.BoundEventContextMode);

/**Status enum for describing the means by which the Binding completed.
@enum*/
EVUI.Modules.Binding.BindingCompletionState =
{
    /**Default.*/
    None: "none",
    /**Binding is queued for execution.*/
    Queued: "queued",
    /**Binding is in the process of being executed.*/
    Executing: "executing",
    /**Binding process completed successfully.*/
    Success: "success",
    /**Binding process ended due to a cancellation.*/
    Canceled: "canceled",
    /**Binding process ended due to an error.*/
    Failed: "failed",
    /**Binding has been disposed.*/
    Disposed: "disposed"
};

Object.freeze(EVUI.Modules.Binding.BindingCompletionState);

/**Object to inject the standard dependencies used by the BindingController into it via its constructor.
@class*/
EVUI.Modules.Binding.BindingControllerServices = function ()
{
    /**Object. An instance of Http module's HttpManager object.
    @type {EVUI.Modules.Http.HttpManager}*/
    this.httpManager = null;

    /**Object. An instance of the DomTree module's DomTreeConverter object.
    @type {EVUI.Modules.DomTree.DomTreeConverter}*/
    this.domTreeConverter = null;

    /**Object. An instance of the Diff module's DiffController object.
    @type {EVUI.Modules.Diff.DiffController}*/
    this.diffController = null;
};

/**Global instance of the BindingController.
@type {EVUI.Modules.Binding.BindingController}*/
EVUI.Modules.Binding.Binder = null;
(function ()
{
    var binder = null;
    var ctor = EVUI.Modules.Binding.BindingController;

    Object.defineProperty(EVUI.Modules.Binding, "Binder", {
        get: function ()
        {
            if (binder == null) binder = new ctor();
            return binder;
        },
        configurable: false,
        enumerable: true
    });
})();

Object.freeze(EVUI.Modules.Binding)

delete $evui.binder;

/**Global instance of the BindingController.
@type {EVUI.Modules.Binding.BindingController}*/
$evui.binder = null;
Object.defineProperty($evui, "binder", {
    get: function ()
    {
        return EVUI.Modules.Binding.Binder;
    },
    enumerable: true
});

/**Binds an object to the DOM using some Html content that is inserted relative to a target element.
@param {EVUI.Modules.Binding.Binding|EVUI.Modules.Binding.BindArgs|EVUI.Modules.Binding.BindingTemplate|String} bindingOrArgs Either: A YOLO Binding object, a YOLO BindArgs object, a YOLO BindingTemplate object, or the name of the BindingTemplate to use.
@param {EVUI.Modules.Binding.BindArgs} bindArgsOrSource Either a YOLO BindArgs object or the source object to base the Binding off of.
@param {EVUI.Modules.Binding.Constants.Fn_BindingCallback} callback A callback function that is fired when the Binding process completes.*/
$evui.bind = function (bindingOrArgs, bindArgsOrSource, callback)
{
    return EVUI.Modules.Binding.Binder.bind(bindingOrArgs, bindArgsOrSource, callback);
};

/**Awaitable. Binds an object to the DOM using some Html content that is inserted relative to a target element.
@param {EVUI.Modules.Binding.Binding|EVUI.Modules.Binding.BindArgs|EVUI.Modules.Binding.BindingTemplate|String} bindingOrArgs Either: A YOLO Binding object, a YOLO BindArgs object, a YOLO BindingTemplate object, or the name of the BindingTemplate to use.
@param {EVUI.Modules.Binding.BindArgs} bindArgsOrSource Either a YOLO BindArgs object or the source object to base the Binding off of.
@returns {Promise<EVUI.Modules.Binding.Binding>}*/
$evui.bindAsync = function (bindingOrArgs, bindArgsOrSource)
{
    return EVUI.Modules.Binding.Binder.bindAsync(bindingOrArgs, bindArgsOrSource);
};

/**Adds a set of pre-configured options for Bindings to use that can be referenced by name.
@param {EVUI.Modules.Binding.BindingTemplate} bindingTemplate A YOLO BindingTemplate object.
@returns {EVUI.Modules.Binding.BindingTemplate}*/
$evui.addBindingTemplate = function (bindingTemplate)
{
    return EVUI.Modules.Binding.Binder.addBindingTemplate(bindingTemplate);
};

/**Adds Html to the internal store of BindingHtmlContents that can be referenced in Bindings.
@param {String|EVUI.Modules.Binding.BindingHtmlContent} key Either a unique string key of content to add or a YOLO BindingHtmlContent object.
@param {String} content The Html content to associate with the string key.
@param {String} url A URL to get the Html content from if it is going to be loaded remotely.
@returns {EVUI.Modules.Binding.BindingHtmlContent}*/
$evui.addBindingHtmlContent = function (key, content, url)
{
    return EVUI.Modules.Binding.Binder.addHtmlContent(key, content, url);
};

/**Removes a BindingTemplate from the controller.
@param {String} templateName The name of the BindingTemplate to remove.
@returns {Boolean} */
$evui.removeBindingTemplate = function (templateName)
{
    return EVUI.Modules.Binding.Binder.removeBindingTemplate(templateName);
};

/**Removes a BindingHtmlContent entry from the controller's internal store of BindingHtmlContents.
@param {String} key The key of the BindingHtmlContent entry to remove.
@returns {Boolean}*/
$evui.removeBindingHtmlContent = function (key)
{
    return EVUI.Modules.Binding.Binder.removeHtmlContent(key)
};


/*#ENDWRAP(Binding)#*/