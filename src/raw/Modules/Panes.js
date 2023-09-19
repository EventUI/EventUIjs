/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

/*#INCLUDES#*/

/*#BEGINWRAP(EVUI.Modules.Panes|Pane)#*/
/*#REPLACE(EVUI.Modules.Panes|Pane)#*/

/**Module for containing a generic, lazy-loaded, EventStream powered UI component that sits on top of other components rather than being injected into the document flow.
@module*/
EVUI.Modules.Panes = {};

/*#MODULEDEF(Pane|"1.0";|"Pane")#*/
/*#VERSIONCHECK(EVUI.Modules.Panes|Pane)#*/

EVUI.Modules.Panes.Constants = {};

/**Function for selecting a PaneEntry object. Return true to select the PaneEntry parameter as part of the result set.
@param {EVUI.Modules.Panes.Pane} pane The PaneEntry providing metadata about a Pane object.
@returns {Boolean}*/
EVUI.Modules.Panes.Constants.Fn_PaneSelector = function (pane) { return true; }

/**Function for selecting a PaneEntry object. Return true to select the PaneEntry parameter as part of the result set.
@param {EVUI.Modules.Panes.PaneEntry} paneEntry The PaneEntry providing metadata about a Pane object.
@returns {Boolean}*/
EVUI.Modules.Panes.Constants.Fn_PaneEntrySelector = function (paneEntry) { return true; }

/**Function for reporting whether or not a Pane was successfully Loaded.
@param {Boolean} success Whether or not the load operation completed successfully.*/
EVUI.Modules.Panes.Constants.Fn_LoadCallback = function (success) { };

/**Function for reporting whether or not an operation Pane was successful.
@param {Boolean} success Whether or not the operation completed successfully.*/
EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback = function (success) { };

EVUI.Modules.Panes.Constants.CSS_Position = "evui-position";
EVUI.Modules.Panes.Constants.CSS_ClippedX = "evui-clipped-x";
EVUI.Modules.Panes.Constants.CSS_ClippedY = "evui-clipped-y";
EVUI.Modules.Panes.Constants.CSS_ScrollX = "evui-scroll-x";
EVUI.Modules.Panes.Constants.CSS_ScrollY = "evui-scroll-y"
EVUI.Modules.Panes.Constants.CSS_Flipped = "evui-flipped";
EVUI.Modules.Panes.Constants.CSS_Moved = "evui-moved";
EVUI.Modules.Panes.Constants.CSS_Resized = "evui-resized";
EVUI.Modules.Panes.Constants.CSS_Backdrop = "evui-backdrop";
EVUI.Modules.Panes.Constants.CSS_Transition_Show = "evui-transition-show";
EVUI.Modules.Panes.Constants.CSS_Transition_Hide = "evui-transition-hide";
EVUI.Modules.Panes.Constants.CSS_Transition_Adjust = "evui-transition-adjust";

/**String. The name of the ID attribute for the Pane, used to look up a definition of a Pane.
@type {String}*/
EVUI.Modules.Panes.Constants.Attribute_ID = "evui-pane-id";

/**String. The name of the attribute that signifies which element should receive initial focus when the Pane is displayed.
@type {String}*/
EVUI.Modules.Panes.Constants.Attribute_Focus = "evui-pane-focus";

/**String. The name of the attribute that signifies that a click event on the Element should close the Pane.
@type {String}*/
EVUI.Modules.Panes.Constants.Attribute_Close = "evui-pane-close";

/**String. The name of the attribute that signifies that a drag event on the Element should move the Pane.
@type {String}*/
EVUI.Modules.Panes.Constants.Attribute_Drag = "evui-pane-drag-handle";

/**String. The name of the attribute on an element that triggers the showing of a Pane what the URL to get the Pane's HTML from is (Requires EVUI.Modules.Http).
@type {String}*/
EVUI.Modules.Panes.Constants.Attribute_SourceURL = "evui-pane-src";

/**String. The name of the attribute on an element that triggers the showing of a Pane of what placeholder to load for the Pane's HTML (Requires EVUI.Modules.HtmlLoaderController).
@type {String}*/
EVUI.Modules.Panes.Constants.Attribute_PlaceholderID = "evui-pane-placeholder-id";

/**String. The name of the attribute on an element that triggers the showing or hiding of a Pane whether or not the Pane should be unloaded when it is hidden.
@type {String}*/
EVUI.Modules.Panes.Constants.Attribute_UnloadOnHide = "evui-pane-unload";

/**String. The name of the attribute on an element that triggers the showing or hiding of a Pane that is used to indicate special behavior as defined by a consumer of the Pane.
@type {String}*/
EVUI.Modules.Panes.Constants.Attribute_Context = "evui-pane-cxt";

/**String. The name of the attribute on an element that triggers the showing of a Pane what CSS selector to use to find the element to show as the Pane. Only the first result will be used.
@type {String}*/
EVUI.Modules.Panes.Constants.Attribute_Selector = "evui-pane-selector";

/**String. The name of the attribute on an element that triggers the showing of a Pane that specifies any of the properties contained in the PaneShowSettings object. It is highly advised to define this object in actual code with the Pane definition or show arguments instead of using this attribute.

Properties must be separated with semicolons and the key-value pairs must be separated by a colon. Dot qualifiers are be used to drill into sub-objects of the PaneShowSettings object (or its child objects) and properties which take an Element reference must instead take a CSS selector. Strings must be surrounded in single-quotes. Quotes within quotes must be escaped single quotes (\').

The value that follows the colon will be parsed as JSON, i.e. "showTransition.css:{'someCssKey':'someValue'}" is valid, but "showTransition.css:{someCssKey:'someValue'}" is not.

For example, "absolutePosition.x: 123; absolutePosition.y: 456" would set the absolute position of the Pane at (123, 456) in the document. 

As another example, "relativePosition.element: '#myElement'; clipSettings.clipBounds.top: 123; clipSettings.clipBounds.left: 456; clipSettings.mode:'shift';" would position the Pane around the element that matches the #myElement selector and would be */
EVUI.Modules.Panes.Constants.Attribute_ShowSettings = "evui-pane-show-settings";

EVUI.Modules.Panes.Constants.Event_OnShow = "evui.pane.onshow";
EVUI.Modules.Panes.Constants.Event_OnHide = "evui.pane.onhide";
EVUI.Modules.Panes.Constants.Event_OnUnload = "evui.pane.onunload";
EVUI.Modules.Panes.Constants.Event_OnLoad = "evui.pane.onload";

EVUI.Modules.Panes.Constants.Event_OnShown = "evui.pane.onshown";
EVUI.Modules.Panes.Constants.Event_OnOnHidden = "evui.pane.onhidden";
EVUI.Modules.Panes.Constants.Event_OnLoaded = "evui.pane.onloaded";
EVUI.Modules.Panes.Constants.Event_OnUnloaded = "evui.pane.onunloaded";

EVUI.Modules.Panes.Constants.Event_OnInitialize = "evui.pane.oninit";
EVUI.Modules.Panes.Constants.Event_OnPosition = "evui.pane.onposition";

EVUI.Modules.Panes.Constants.Job_OnComplete = "evui.pane.oncomplete";

EVUI.Modules.Panes.Constants.Default_ObjectName = "Pane";
EVUI.Modules.Panes.Constants.Default_ManagerName = "PaneManager";
EVUI.Modules.Panes.Constants.Default_CssPrefix = "evui-pane";
EVUI.Modules.Panes.Constants.Default_EventNamePrefix = "evui.pane";
EVUI.Modules.Panes.Constants.Default_AttributePrefix = "evui-pane";

/**The global Z-index reference for all objects that use the pane manager to determine their z-index.
@type {Number}*/
EVUI.Modules.Panes.Constants.GlobalZIndex = null;

(function()
{
    var globalZIndex = null;
    Object.defineProperty(EVUI.Modules.Panes.Constants, "GlobalZIndex",
    {
        get: function () { return globalZIndex; },
        set: function (value)
        {
            if (typeof value !== "number") return;
            if (value < 0)
            {
                globalZIndex = 0
            }
            else
            {
                globalZIndex = value;
            }
        },
        configurable: false,
        enumerable: true
    });
})();

Object.freeze(EVUI.Modules.Panes.Constants);

EVUI.Modules.Panes.Dependencies =
{
    Core: Object.freeze({ version: "1.0", required: true }),
    EventStream: Object.freeze({ version: "1.0", required: true }),
    Styles: Object.freeze({ version: "1.0", required: true }),
    Dom: Object.freeze({ version: "1.0", required: true }),
    Observers: Object.freeze({ version: "1.0", required: true}),
    HtmlLoader: Object.freeze({ version: "1.0", required: false })
};

(function ()
{
    var checked = false;

    Object.defineProperty(EVUI.Modules.Panes.Dependencies, "checked",
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

Object.freeze(EVUI.Modules.Panes.Dependencies);

/**Class for managing an implementation of Pane objects.
@class*/
EVUI.Modules.Panes.PaneManager = function (paneManagerSettings)
{
    if (EVUI.Modules.Core == null) throw Error("Dependency missing: EVUI.Modules.Core is required.");
    EVUI.Modules.Core.Utils.requireAll(EVUI.Modules.Panes.Dependencies);

    if (EVUI.Modules.Panes.Constants.GlobalZIndex == null)
    {
        var minZIndex = EVUI.Modules.Core.Utils.getSetting("defaultMinimumZIndex");
        if (typeof minZIndex !== "number") minZIndex = 100;

        EVUI.Modules.Panes.Constants.GlobalZIndex = minZIndex;
    }

    var _self = this; //self reference for closures

    /**Number used to organize the sequence of callbacks when it is otherwise ambiguous.
    @type {Number}*/
    var _callbackCounter = 0;

    /**Array. Internal list for all Widows.
    @type {InternalPaneEntry[]}*/
    var _entries = [];

    /**Object. Special settings for the PaneManager to use.
    @type {EVUI.Modules.Panes.PaneManagerSettings}*/
    var _settings = paneManagerSettings;

    /**Object. The backdrop manager used by the PaneManager.
    @type {Function}*/
    var _managerConstructor = (typeof paneManagerSettings === "function") ? paneManagerSettings : EVUI.Modules.Panes.PaneManager;

    /**Special object injected into the public facing PaneEntry that contains all of the writable versions of the public version's read-only data.
    @class*/
    var PaneLink = function ()
    {
        /**Object. The Pane being managed.
        @type {EVUI.Modules.Panes.Pane}*/
        this.pane = null;

        /**Object. The wrapper object that the _settings object created for a custom implementation of the PaneManager.
        @type {Object}*/
        this.wrapper = null;

        /**String. A unique identifier for the pane instance used for the positioning CSS class name.
        @type {String}*/
        this.paneCSSName = null;

        /**Object. The EventStream doing the work of the operations for the Pane.
        @type {EVUI.Modules.EventStream.EventStream}*/
        this.eventStream = null;

        /**Number. Bit flags indicating the current state of the Pane (initialized, loaded, etc).
        @type {Number}*/
        this.paneStateFlags = EVUI.Modules.Panes.PaneStateFlags.None;

        /**String. The current operation the pane is performing (loading, unloading, hiding, showing, etc).
        @type {String}*/
        this.paneAction = EVUI.Modules.Panes.PaneAction.None;

        /**Array. The sequence of all PaneActions the Pane must perform to reach its final action.
        @type {String[]}*/
        this.paneActionSequence = [];

        /**Array. An array of all the elements and their event handlers that have been attached in response to the automatically attached event handlers.
        @type {EVUI.Modules.Panes.PaneEventBinding[]}*/
        this.eventBindings = [];

        /**The PaneManager that owns this pane.
        @type {EVUI.Modules.Panes.PaneManager}*/
        this.manager = null;

        /**String. A special token that is shared between the manager and the Pane object that allows for the setting of the pane's element property.
        @type {String}*/
        this.setSecret = EVUI.Modules.Core.Utils.makeGuid();

        /**Object. A queue of all the callbacks that have been issued during the current operation.
        @type {CallbackStack[]}*/
        this.callbackStack = [];

        /**Object. The last calculated position of the Pane.
        @type {EVUI.Modules.Panes.PanePosition}*/
        this.lastCalculatedPosition = null;

        /**Object. The last set of ShowSettings used to position the Pane.
        @type {EVUI.Modules.Panes.PaneShowSettings}*/
        this.lastShowSettings = null;

        /**Object. The last set of load settings used to load the Pane.
        @type {EVUI.Modules.Panes.PaneLoadSettings}*/
        this.lastLoadSettings = null;

        /**Object. The last used set of resize settings used to position the Pane.
        @type {EVUI.Modules.Panes.PaneResizeMoveArgs}*/
        this.lastResizeArgs = null;

        /**Number. The ID of the callback that is being used to toggle off a transition effect.
        @type {Number}*/
        this.transitionTimeoutID = -1;

        /**String. The selector used to attach to the element that caused a transition CSS action to occur.
        @type {String}*/
        this.transitionSelector = null;

        /**Function. The callback that will be called when the timeout completes or is canceled.
        @type {Function}*/
        this.transitionCallback = null;
    };

    /**Special object that is passed from a Pane object to the canSetElement function when someone attempts to set the element property on a Pane.
    @class*/
    var PaneElementSetter = function ()
    {
        /**Object. The value to set as the Pane element.
        @type {Element}*/
        this.element = null;

        /**String. The unique identifier of the Pane having its element set.
        @type {String}*/
        this.paneID = null;

        /**String. A special token that is shared between the manager and the Pane object that allows for the setting of the pane's element property.
        @type {String}*/
        this.setSecret = null;
    };

    /**Data to inject into the Pane object via its constructor to give it access to its PaneLink, PaneManager, and the private canSetElementFunction.
    @class*/
    var PaneOptions = function ()
    {
        /**Object. The private state of the Pane object that is shared between the Pane and the manager.
        @type {PaneLink}*/
        this.link = null;

        /**The function that determines whether or not a Pane can have its element reset.
        @type {Function}*/
        this.canSetElement = canSetElement;
    };

    /**Internal record for keeping track of Panes.
    @class*/
    var InternalPaneEntry = function ()
    {
        /**String. The case-normalized unique ID of the pane.
        @type {String}*/
        this.lowerPaneID = null;

        /**String. The unique ID of the pane.
        @type {String}*/
        this.paneID = null;

        /**Object. The public facing PaneEntry record.
        @type {EVUI.Modules.Panes.PaneEntry}*/
        this.publicEntry = null;

        /**Object. The internal read-write source of data for the public facing PaneEntry record.
        @type {PaneLink}*/
        this.link = null;
    };

    /**Object for keeping track of all the callbacks issued to an operation during redundant calls to that operation.
    @class*/
    var CallbackStack = function ()
    {
        /**Array. All of the operation sessions queued for the action.
        @type {PaneOperationSession[]}*/
        this.opSessions = [];


        /**String. The action that was issued to be performed.
        @type {String}*/
        this.action = EVUI.Modules.Panes.PaneAction.None;
    };

    /**The result of creating or extending a Pane object.
    @class*/
    var PaneExtensionResult = function ()
    {
        /**Boolean. Whether or not a Pane with the given ID already exists.
        @type {Boolean}*/
        this.exists = false;

        /**Object. The InternalPaneEntry for the Pane.
        @type {InternalPaneEntry}*/
        this.entry = null;

        /**Object. The Pane object that was created or extended.
        @type {EVUI.Modules.Panes.Pane}*/
        this.pane = null;
    };

    /**Represents all the data about a given operation at a moment in time.
    @class*/
    var PaneOperationSession = function ()
    {
        /**String. The unique identifier of this operation session.
        @type {String}*/
        this.sessionID = EVUI.Modules.Core.Utils.makeGuid();

        /**Object. The InternalPaneEntry of the pane.
        @type {InternalPaneEntry}*/
        this.entry = null;

        /**String. The original action that was being performed.
        @type {String}*/
        this.action = null;

        /**String. The current action that is being performed.
        @type {String}*/
        this.currentAction = null;

        /**Function. An callback to call once the operation is complete.
        @type {Function}*/
        this.callback = null;

        /**The arguments being used to show/load the Pane
        @type {EVUI.Modules.Panes.PaneShowArgs} */
        this.showArgs = null;

        /**The arguments being used to load the Pane
        @type {EVUI.Modules.Panes.PaneLoadArgs} */
        this.loadArgs = null;

        /**The arguments being used to hide the Pane.
        @type {EVUI.Modules.Panes.PaneHideArgs}*/
        this.hideArgs = null;

        /**The arguments being used to hide the Pane.
        @type {EVUI.Modules.Panes.PaneUnloadArgs}*/
        this.unloadArgs = null;

        /**Boolean. Whether or not the EventStream should be canceled then restarted with a new chain of events.
        @type {Boolean}*/
        this.cancel = false;

        /**Boolean. Whether or not the EventStream should have a callback added to the current action's callback stack due to multiple calls that are part of the same process. (i.e. a load then a show, the show would continue the load.)
        @type {Boolean}*/
        this.continue = false;

        /**Boolean. Whether or not this event was canceled sometime between when it was queued to run and when it actually ran.
        @type {Boolean}*/
        this.canceled = false;

        /**The step that this step continued on to if there was a continuation.
        @type {PaneOperationSession}*/
        this.continuedTo = null;

        /**Number. The sort order in which this operation's callback will be called.
        @type {Number}*/
        this.callbackOrdinal = _callbackCounter++;

        /**Any. The foreign event arguments passed into the PaneManager by a consumer of the PaneManager.
        @type {EVUI.Modules.Panes.PaneArgsPackage}*/
        this.foreignActionArgs = null;

        /**Makes a PaneArgsPackage to pass into the overridden functions on the PaneManagerSettings object.
        @returns {EVUI.Modules.Panes.PaneArgsPackage}*/
        this.makeArgsPackage = function (context)
        {
            var argsPackage = new EVUI.Modules.Panes.PaneArgsPackage(context);

            argsPackage.foreignArgs = this.foreignActionArgs;
            if (argsPackage.foreignArgs == null && _settings.managerName !== EVUI.Modules.Panes.Constants.Default_ManagerName) EVUI.Modules.Core.Utils.wrapProperties(argsPackage, this, { sourcePath: "foreignActionArgs", targetPath: "foreignActionArgs" });

            argsPackage.hideArgs = this.hideArgs;
            argsPackage.loadArgs = this.loadArgs;
            argsPackage.showArgs = this.showArgs;
            argsPackage.unloadArgs = this.unloadArgs;
            argsPackage.action = this.action;
            argsPackage.currentAction = this.currentAction;
            argsPackage.context = context;
            argsPackage.pane = this.entry.link.pane;
            argsPackage.wrapper = this.entry.link.wrapper;
            argsPackage.lastCalculatedPosition = this.entry.link.lastCalculatedPosition;

            return argsPackage;
        }
    };

    /**Values for determining the sequence of actions the Pane should take. Each step maps to the addition EventStream steps or to behavioral changes when starting, stopping, or continuing the execution of a Pane.
    @enum*/
    var ActionSequence =
    {
        /**Default. No action taken.*/
        None: "none",
        /**Signals that the initialize event should be added.*/
        Initialize: "init",
        /**Signals that the load steps should be added.*/
        Load: "load",
        /**Signals that the show and position steps should be added.*/
        Show: "show",
        /**Signals that the hide steps should be added */
        Hide: "hide",
        /**Signals that the unload steps should be added.*/
        Unload: "unload",
        /**Signals that the positioning step should be added (without the corresponding show steps, used for redundant shows when a Pane is already showing).*/
        Position: "position",
        /**Signals that the current EventStream should be canceled and its callbacks should be called.*/
        CancelCurrent: "cancel",
        /**Signals that a new EventStream should follow the first and have an aggregate callback sequence of both events.*/
        Continue: "continue",
        /**Signals that the callback has been queued (which is automatic) and nothing else should happen.*/
        Queue: "queue"
    };

    /**Object for managing the backdrop used by Panes.
    @class*/
    var BackdropManager = function ()
    {
        var _self = this;

        /**Object representing a pairing of an object's class name to its Z-Index.
        @class*/
        var ZIndexEntry = function (objectName, zIndex)
        {
            /**String. The name of the object in its PaneManager.
            @type {String}*/
            this.objectName = objectName;

            /**Number. The Z-Index of the object's backdrop.
            @type {Number}*/
            this.zIndex = zIndex;
        };

        /**String. The ID of the backdrop element.
        @type {Number}*/
        var _backdropID = EVUI.Modules.Core.Utils.makeGuid();

        /**Object. The div that serves as the backdrop.
        @type {HTMLElement}*/
        var _backdropDiv = null;

        /**Object. The DomHelper that wraps the backdrop div.
        @type {EVUI.Modules.Dom.DomHelper}*/
        var _backdropHelper = null;

        /**Number. The ID of the callback that is being used to toggle off a transition effect.
        @type {Number}*/
        var _transitionTimeoutID = -1;

        /**Function. The callback that will be called when the timeout completes or is canceled.
        @type {Function}*/
        var _transitionCallback = null;

        /**String. The current object that has a backdrop being displayed behind it.
        @type {String}*/
        var _backdropObjectCssName = null;

        /**String. The name of the CSS style sheet that the backdrop styles go into.
        @type {String}*/
        var _backdropCSSSheetName = EVUI.Modules.Styles.Constants.DefaultStyleSheetName;

        /**All of the Z-Index entries of the elements that have a stack of backdrops.
        @type {ZIndexEntry[]}*/
        var _zIndexStack = [];

        /**Shows a backdrop for a Pane at the given z-index.
        @param {String} objectCSSName The name of the object that needs a backdrop.
        @param {EVUI.Modules.Panes.PaneBackdropSettings} backdropSettings The settings for controlling the style of the backdrop and its transition effect.
        @param {EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} callback A callback function that is fired once the show transition is complete.*/
        this.showBackdrop = function (objectCSSName, zIndex, backdropSettings, callback)
        {
            if (typeof callback !== "function") callback = function (success) { };
            if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(objectCSSName) === true || typeof zIndex !== "number") return callback(false);

            //first, cancel any transition that was in progress
            this.cancelTransition();

            //add or update the z-index entry
            var existingEntry = getZIndexEntry(objectCSSName);
            if (existingEntry == null)
            {
                _zIndexStack.push(new ZIndexEntry(objectCSSName, zIndex))
            }
            else
            {
                existingEntry.zIndex = zIndex;
            }

            //set the backdrop
            _backdropObjectCssName = objectCSSName;
            setBackdropShowCSS(backdropSettings, zIndex);

            //apply the transition and call back once its duration is complete.
            applyTransition(backdropSettings.backdropShowTransition, EVUI.Modules.Panes.Constants.CSS_Transition_Show, function (success)
            {
                callback(success);
            });
        };

        /**Sets the Z-Index of the backdrop to be that of the second-highest item in the z-index stack. Use when an item is being hidden and the backdrop needs to be moved backwards in the z-order to allow for things it was covering to be seen again.*/
        this.setBackdropZIndex = function ()
        {
            var current = getZIndexEntry(_backdropObjectCssName);

            var next = getNextHighestZIndex(current);
            if (next == null) return;

            _settings.stylesheetManager.removeRules(_backdropCSSSheetName, getDefaultCssSelector(current.objectName));
            _settings.stylesheetManager.setRules(_backdropCSSSheetName, getDefaultCssSelector(_backdropObjectCssName), { zIndex: next.zIndex });
        };

        /**Hides the backdrop.
        @param {String} objectCSSName The name of the object the backdrop is being hidden for.
        @param {EVUI.Modules.Panes.PaneBackdropSettings} backdropSettings The settings for how to hide the backdrop.
        @param {EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} callback A callback that is fired once the hide transition is complete.*/
        this.hideBackdrop = function (objectCSSName, backdropSettings, callback)
        {
            if (typeof callback !== "function") callback = function (success) { };
            if (backdropSettings == null) return callback(false);

            //cancel any transition that is currently happening
            this.cancelTransition();

            _backdropObjectCssName = objectCSSName;

            //apply the removal transition, then actually remove the backdrop. The Pane is "racing" (the PaneManager waits for both to complete before continuing) the transition and is being hidden at the same time as the transition is being applied.
            applyTransition(backdropSettings.backdropHideTransition, EVUI.Modules.Panes.Constants.CSS_Transition_Hide, function (success)
            {
                //remove the z-index entry
                var entry = getZIndexEntry(objectCSSName);
                var index = _zIndexStack.indexOf(entry);
                if (index !== -1) _zIndexStack.splice(index, 1);

                //hide the backdrop
                setBackdropHideCSS();
                callback(success);
            });
        };

        /**Cancels any current transition by calling its callback before its timer would normally call it.*/
        this.cancelTransition = function ()
        {
            if (_transitionTimeoutID === -1) return; //no callback, nothing to do

            try
            {
                //if we have a callback, call it
                if (typeof _transitionCallback === "function") _transitionCallback();
            }
            catch (ex)
            {
                EVUI.Modules.Core.Utils.log(ex.stack);
            }
            finally
            {
                //then clear out all the data about the callback
                clearTimeout(_transitionTimeoutID);
                _transitionCallback = null;
                _transitionTimeoutID = -1;
            }
        };

        /**Gets the ZIndexEntry of an object based on its name.
        @param {String} objectName The name of the object to get.
        @returns {ZIndexEntry}*/
        var getZIndexEntry = function (objectName)
        {
            var numEntries = _zIndexStack.length;
            for (var x = 0; x < numEntries; x++)
            {
                var curEntry = _zIndexStack[x];
                if (curEntry.objectName === objectName) return curEntry;
            }

            return null;
        };

        /**Gets the next highest z-index after the current entry.
        @param {ZIndexEntry} zIndexEntry The entry to get the next highest z-index of.
        @returns {ZIndexEntry} */
        var getNextHighestZIndex = function (zIndexEntry)
        {
            var lowest = null;
            var gap = Number.MAX_VALUE;

            var numEntries = _zIndexStack.length;
            for (var x = 0; x < numEntries; x++)
            {
                var curEntry = _zIndexStack[x];
                if (curEntry === zIndexEntry) continue;

                var curGap = zIndexEntry.zIndex - curEntry.zIndex;
                if (curGap < gap)
                {
                    lowest = curEntry;
                    gap = curGap;
                }
            }

            return lowest;
        };

        /**Sets the CSS for showing a full-screen backdrop, and applies any additional user-provided CSS afterwards so it overrides the default CSS.
        @param {EVUI.Modules.Panes.PaneBackdropSettings} backdropSettings The backdrop settings containing the information to use to make the backdrop.*/
        var setBackdropShowCSS = function (backdropSettings, zIndex)
        {
            //no settings or not instructed to show a backdrop, do nothing.
            if (backdropSettings == null || backdropSettings.showBackdrop === false) return false;

            //make sure our stylesheet is there
            _settings.stylesheetManager.ensureSheet(_backdropCSSSheetName, { lock: true });

            //make sure the backdrop div hasnt been removed
            ensureBackdropDiv();

            //default settings for covering the whole view port
            var defaultSettings =
            {
                position: "fixed",
                top: "0px",
                left: "0px",
                height: "100vh",
                width: "100vw",
                backgroundColor: (typeof backdropSettings.backdropColor === "string") ? backdropSettings.backdropColor : "#000000",
                opacity: (typeof backdropSettings.backdropOpacity === "number") ? backdropSettings.backdropOpacity : 0.75,
                zIndex: zIndex
            };

            _settings.stylesheetManager.setRules(_backdropCSSSheetName, getDefaultCssSelector(_backdropObjectCssName), defaultSettings);
            _backdropHelper.addClass([EVUI.Modules.Panes.Constants.CSS_Backdrop, _backdropObjectCssName]);

            if (backdropSettings.backdropCSS == null) return;
            var defaultSelector = getDefaultCssSelector(_backdropObjectCssName);

            //add any additional CSS as overrides or separate classes if any was specified
            if (typeof backdropSettings.backdropCSS === "string")
            {
                var match = backdropSettings.backdropCSS.match(/[\;\:]/g); //if we have semi-colons or colons we have a string of CSS
                if (match != null && match.length > 0)
                {
                    _settings.stylesheetManager.setRules(_backdropCSSSheetName, defaultSelector, backdropSettings.backdropCSS);
                }
                else //otherwise it's class lists
                {
                    _backdropHelper.addClass(backdropSettings.backdropCSS);
                }
            }
            else //or we have an object of CSS properties
            {
                _settings.stylesheetManager.setRules(_backdropCSSSheetName, defaultSelector, backdropSettings.backdropCSS);
            }
        };

        /**Sets the CSS for hiding the backdrop.*/
        var setBackdropHideCSS = function ()
        {
            //make sure both the backdrop and our stylesheet are both still there
            _settings.stylesheetManager.ensureSheet(_backdropCSSSheetName, { lock: true });
            ensureBackdropDiv();

            //a 0x0 invisible square
            var defaultSettings =
            {
                position: "absolute",
                top: "0px",
                left: "0px",
                height: "0px",
                width: "0px",
            };

            //clear ALL the classes from the backdrop
            while (_backdropDiv.classList.length > 0)
            {
                var curClass = _backdropDiv.classList[0];
                _backdropDiv.classList.remove(curClass);
            }

            //add back the one class that will be used to "hide" the backdrop
            _backdropDiv.classList.add(EVUI.Modules.Panes.Constants.CSS_Backdrop);

            var defaultSelector = getDefaultCssSelector(_backdropObjectCssName);

            //remove the rules that were specific to this backdrop and the general rules for the backdrop.
            _settings.stylesheetManager.removeRules(_backdropCSSSheetName, [defaultSelector, EVUI.Modules.Panes.Constants.CSS_Backdrop]);

            //re-add the rules in their new format.
            _settings.stylesheetManager.setRules(_backdropCSSSheetName, EVUI.Modules.Panes.Constants.CSS_Backdrop, defaultSettings);
        };

        /**Applies a transition effect to the backdrop to show or hide it.
        @param {EVUI.Modules.Panes.PaneTransition} transition The transition to apply.
        @param {EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} callback A callback that is called once the transition is complete.*/
        var applyTransition = function (transition, selector, callback)
        {
            if (typeof callback !== "function") callback = function (success) { };
            if (transition == null) return callback(false);

            //the selector that will apply the transition to the backdrop
            var defaultSelector = getDefaultCssSelector(_backdropObjectCssName) + "." + selector;

            if (transition.keyframes != null)
            {
                _settings.stylesheetManager.setRules(_backdropCSSSheetName, transition.keyframes);
            }

            //once again, look to see if we have a string of raw CSS or CSS selectors. Apply them if we do
            if (typeof transition.css === "string")
            {
                var match = transition.css.match(/[\;\:]/g);
                if (match != null && match.length > 0)
                {
                    _settings.stylesheetManager.setRules(_backdropCSSSheetName, defaultSelector, transition.css);
                    _backdropHelper.addClass([selector, _backdropObjectCssName]);
                }
                else
                {
                    selector = transition.css;
                    _backdropHelper.addClass([transition.css, _backdropObjectCssName]);
                }
            }
            else //otherwise we probably have an object, apply that as well
            {
                _settings.stylesheetManager.setRules(_backdropCSSSheetName, defaultSelector, transition.css);
                _backdropHelper.addClass([selector, _backdropObjectCssName]);
            }

            //set our callback to remove the CSS and call the REAL callback to signal that we're all done
            _transitionCallback = function ()
            {
                _backdropHelper.removeClass([selector]);
                _settings.stylesheetManager.removeRules(_backdropCSSSheetName, defaultSelector);
                callback(true);
            };

            //set a timeout for the stated duration of the transition.
            _transitionTimeoutID = setTimeout(function ()
            {
                _self.cancelTransition();
            }, transition.duration);
        };

        /**Gets the default CSS selector to apply to a specific object to the backdrop.
        @param {String} objectCSSName The name of the object.
        @returns {String} */
        var getDefaultCssSelector = function (objectCSSName)
        {
            return "." + objectCSSName + "." + EVUI.Modules.Panes.Constants.CSS_Backdrop;
        };

        /**Makes sure that the backdrop DIV is actually there and available to use. */
        var ensureBackdropDiv = function ()
        {
            if (_backdropDiv == null)
            {
                _backdropDiv = document.createElement("div");
                _backdropDiv.classList.add(EVUI.Modules.Panes.Constants.CSS_Backdrop);
                _backdropDiv.id = _backdropID;

                _backdropHelper = new EVUI.Modules.Dom.DomHelper(_backdropDiv);
            }

            if (_backdropDiv.isConnected === false)
            {
                if (_backdropDiv.parentElement != null) _backdropDiv.remove();
                document.body.appendChild(_backdropDiv);
            }
        };
    };

    /**************************************************************************************PUBLIC FUNCTIONS*************************************************************************************************************/

    /**Adds a Pane to the PaneManager.
    @param {EVUI.Modules.Panes.Pane} pane A YOLO object representing a Pane object. This object is copied onto a real Pane object is then discarded.
    @returns {EVUI.Modules.Panes.Pane}*/
    this.addPane = function (pane)
    {
        if (pane == null) throw Error(_settings.objectName + " cannot be null.");

        var creationResult = makeOrExtendPane(pane, true);
        if (creationResult.exists === true) throw Error("A " + _settings.objectName + " with an id of \"" + creationResult.pane.id + "\" already exists.");

        return creationResult.entry.publicEntry.pane;
    };

    /**Removes a Pane from the PaneManager. Does not unload the Pane's element from the DOM.
    @param {EVUI.Modules.Panes.Pane|String} paneOrID
    @returns {Boolean}*/
    this.removePane = function (paneOrID)
    {
        if (paneOrID == null) return false;

        var id = null;
        if (typeof paneOrID === "string") id = paneOrID;

        id = paneOrID.id;
        if (typeof id !== "string") return false;

        var existing = getInternalPaneEntry(id);
        if (existing != null)
        {
            var index = _entries.indexOf(existing);
            if (index !== -1) _entries.splice(index, 1);
        }

        return true;
    };

    /**Gets a PaneEntry object based on its ID or a selector function.
    @param {EVUI.Modules.Panes.Constants.Fn_PaneSelector|String} paneIDOrSelector A selector function to select a PaneEntry object (or multiple PaneEntry objects) or the ID of the Pane to get the PaneEntry for.
    @param {Boolean} getAllMatches If a selector function is provided, all the PaneEntries that satisfy the selector are included. Otherwise a single PaneEntry object is returned. False by default.
    @returns {EVUI.Modules.Panes.Pane|EVUI.Modules.Panes.Pane[]} */
    this.getPane = function (paneIDOrSelector, getAllMatches)
    {
        if (typeof paneIDOrSelector === "string")
        {
            var existing = getInternalPaneEntry(paneIDOrSelector);
            if (existing != null)
            {
                return existing.publicEntry.pane;
            }
            else
            {
                return null;
            }
        }
        else if (typeof paneIDOrSelector === "function")
        {
            var results = [];
            var numPanes = _entries.length;
            for (var x = 0; x < numPanes; x++)
            {
                var curEntry = _entries[x];
                if (paneIDOrSelector(curEntry.publicEntry.pane) === true)
                {
                    if (getAllMatches === true)
                    {
                        results.push(curEntry.publicEntry.pane);
                    }
                    else
                    {
                        return curEntry.publicEntry.pane;
                    }
                }
            }

            return results;
        }
        else
        {
            return null;
        }
    };

    /**Shows (and loads, if necessary or if a reload is requested) a Pane asynchronously. Provides a callback that is called once the Pane operation has completed successfully or otherwise.
    @param {EVUI.Modules.Panes.Pane|String} paneOrID Either a YOLO Pane object to extend into the existing Pane, the real Pane reference, or the string ID of the Pane to show.
    @param {EVUI.Modules.Panes.PaneShowArgs|EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} paneShowArgs Optional.  The arguments for showing the Pane, or the callback. If omitted or passed as a function, the Pane's existing show/load settings are used instead.
    @param {EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} callback Optional. A callback that is called once the operation completes.*/
    this.showPane = function (paneOrID, paneShowArgs, callback)
    {
        var paneEntry = getPaneAmbiguously(paneOrID, true);

        if (typeof paneShowArgs === "function")
        {
            callback = paneShowSettings;
            paneShowArgs = null;
        }
        else if (paneShowArgs != null && typeof paneShowArgs === "object")
        {
            paneShowArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Panes.PaneShowArgs(), paneShowArgs, ["type"]);

            if (paneShowArgs.showSettings != null)
            {
                if (paneShowArgs.showSettings instanceof EVUI.Modules.Panes.PaneShowSettings === false) paneShowArgs.showSettings = makeOrExtendShowSettings(paneShowArgs.showSettings);
            }
            else
            {
                paneShowArgs.showSettings = makeOrExtendShowSettings(paneEntry.link.pane.showSettings);
            }

            if (paneShowArgs.loadArgs != null && paneShowArgs.loadArgs.loadSettings != null)
            {
                if (paneShowArgs.loadArgs.loadSettings instanceof EVUI.Modules.Panes.PaneLoadSettings === false) paneShowArgs.loadArgs.loadSettings = makeOrExtendLoadSettings(paneShowArgs.loadArgs.loadSettings);
            }
            else
            {
                paneShowArgs.loadArgs = new EVUI.Modules.Panes.PaneLoadArgs();
                paneShowArgs.loadArgs.loadSettings = makeOrExtendLoadSettings(paneEntry.link.pane.loadSettings);
            }
        }
        else
        {
            paneShowArgs = null;
        }

        if (paneShowArgs == null)
        {
            paneShowArgs = new EVUI.Modules.Panes.PaneShowArgs();
            paneShowArgs.showSettings = makeOrExtendShowSettings(paneEntry.link.pane.showSettings);
            paneShowArgs.loadArgs = new EVUI.Modules.Panes.PaneLoadArgs();
            paneShowArgs.loadArgs.loadSettings = makeOrExtendLoadSettings(paneEntry.link.pane.loadSettings);
        }

        var opSession = new PaneOperationSession();
        opSession.entry = paneEntry;
        opSession.action = EVUI.Modules.Panes.PaneAction.Show;
        opSession.currentAction = EVUI.Modules.Panes.PaneAction.Show;
        opSession.callback = (typeof callback === "function") ? callback : function (success) { };
        opSession.showArgs = paneShowArgs;
        opSession.loadArgs = paneShowArgs.loadArgs;

        performOperation(opSession);
    };

    /**Awaitable. (and loads, if necessary or if a reload is requested) a Pane asynchronously.
    @param {EVUI.Modules.Panes.Pane|String} paneOrID Either a YOLO Pane object to extend into the existing Pane, the real Pane reference, or the string ID of the Pane to show.
    @param {EVUI.Modules.Panes.PaneShowArgs} paneShowArgs Optional. The arguments for showing the Pane. If omitted, the Pane's existing show/load settings are used instead.
    @returns {Promise<Boolean>}*/
    this.showPaneAsync = function (paneOrID, paneShowArgs)
    {
        return new Promise(function (resolve, reject)
        {
            _self.showPane(paneOrID, paneShowArgs, function (success)
            {
                resolve(success);
            });
        });
    };

    /**Hides (and unloads if requested) a Pane asynchronously. Provides a callback that is called called once the Pane operation has completed successfully or otherwise.
    @param {EVUI.Modules.Panes.Pane|String} paneOrID Either a YOLO Pane object to extend into the existing Pane, the real Pane reference, or the string ID of the Pane to hide.
    @param {EVUI.Modules.Panes.PaneHideArgs|EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} paneHideArgs Optional. A YOLO object representing arguments for hiding a Pane or a callback. If omitted or passed as a function, the Pane's existing hide/unload settings are used instead.
    @param {EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} callback Optional. A callback that is called once the operation completes.*/
    this.hidePane = function (paneOrID, paneHideArgs, callback)
    {
        var paneEntry = getPaneAmbiguously(paneOrID, false);

        if (typeof paneHideArgs === "function")
        {
            callback = paneHideArgs;
            paneHideArgs = null;
        }
        else if (paneHideArgs != null && typeof paneHideArgs === "object")
        {
            if (paneHideArgs instanceof EVUI.Modules.Panes.PaneHideArgs === false) paneHideArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Panes.PaneHideArgs(), paneHideArgs, ["type"]);
            if (paneHideArgs.unloadArgs instanceof EVUI.Modules.Panes.PaneUnloadArgs === false) paneHideArgs.unloadArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Panes.PaneUnloadArgs(), paneHideArgs.unloadArgs);
        }
        else
        {
            paneHideArgs = null;
        }

        if (paneHideArgs == null)
        {
            paneHideArgs = new EVUI.Modules.Panes.PaneHideArgs();
            paneHideArgs.unloadArgs = new EVUI.Modules.Panes.PaneUnloadArgs();
        }

        var opSession = new PaneOperationSession();
        opSession.entry = paneEntry;
        opSession.action = EVUI.Modules.Panes.PaneAction.Hide;
        opSession.currentAction = EVUI.Modules.Panes.PaneAction.Hide;
        opSession.callback = (typeof callback === "function") ? callback : function (success) { };
        opSession.hideArgs = paneHideArgs;
        opSession.unloadArgs = paneHideArgs.unloadArgs;

        performOperation(opSession);
    };

    /**Awaitable. Hides (and unloads if requested) a Pane asynchronously.
    @param {EVUI.Modules.Panes.Pane|String} paneOrID Either a YOLO Pane object to extend into the existing Pane, the real Pane reference, or the string ID of the Pane to hide.
    @param {EVUI.Modules.Panes.PaneHideArgs} paneHideArgs Optional. The arguments for hiding a Pane. If omitted, the Pane's existing hide/unload settings are used instead.
    @returns {Promise<Boolean>}*/
    this.hidePaneAsync = function (paneOrID, paneHideArgs)
    {
        return new Promise(function (resolve, reject)
        {
            _self.hidePane(paneOrID, paneHideArgs, function (success)
            {
                resolve(success);
            });
        });
    };

    /**Hides all visible Panes asynchronously. Provides a callback function that is called once all the visible Panes have been hidden.
    @param {EVUI.Modules.Panes.PaneHideArgs} paneHideArgs Optional. The arguments for hiding a Pane. If omitted, the Pane's existing hide/unload settings are used instead.
    @param {EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} callback The callback that is called once all the Pane's hide operations have completed.*/
    this.hideAllPanes = function (paneHideArgs, callback)
    {
        if (typeof callback !== "function") callback = function () { };
        var allVisible = this.getPane(function (pane) { return pane.isVisible; });
        var numVisible = allVisible.length;
        var numHidden = 0;

        if (numVisible === 0) return callback(true);

        for (var x = 0; x < numVisible; x++)
        {
            this.hidePane(allVisible[x], paneHideArgs, function ()
            {
                numHidden++;
                if (numHidden === numVisible)
                {
                    return callback(true);
                }
            });
        }
    };

    /**Awaitable. Hides all Panes asynchronously.
    @param {EVUI.Modules.Panes.PaneHideArgs} paneHideArgs Optional. The arguments for hiding a Pane. If omitted, the Pane's existing hide/unload settings are used instead.
    @returns {Promise<Boolean>} */
    this.hideAllPanesAsync = function (paneHideArgs)
    {
        return new Promise(function (resolve)
        {
            _self.hideAllPanes(paneHideArgs, function (success)
            {
                resolve(success);
            });
        });
    };

    /**Asynchronously loads a Pane. Provides a callback that is called after the operation has completed successfully or otherwise.
    @param {EVUI.Modules.Panes.Pane|String} paneOrID Either a YOLO Pane object to extend into the existing Pane, the real Pane reference, or the string ID of the Pane to load.
    @param {EVUI.Modules.Panes.PaneLoadArgs|EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} paneLoadArgs Optional. A YOLO object representing arguments for loading a Pane or a callback. If omitted or passed as a function, the Pane's existing load settings are used instead.
    @param {EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} callback Optional.A callback to call once the operation completes.*/
    this.loadPane = function (paneOrID, paneLoadArgs, callback)
    {
        var paneEntry = getPaneAmbiguously(paneOrID, true);

        if (typeof paneLoadArgs === "function")
        {
            callback = paneLoadArgs;
            paneLoadArgs = null;
        }
        else if (paneLoadArgs != null && typeof paneLoadArgs === "object")
        {
            if (paneLoadArgs instanceof EVUI.Modules.Panes.PaneLoadArgs === false) paneLoadArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Panes.PaneLoadArgs(), paneLoadArgs, ["type"]);
            if (paneLoadArgs.loadSettings != null && paneLoadArgs.loadSettings instanceof EVUI.Modules.Panes.PaneLoadSettings === false)
            {
                paneLoadArgs.loadSettings = makeOrExtendLoadSettings(paneLoadArgs.loadSettings);
            }
        }
        else
        {
            paneLoadArgs = null;
        }

        if (paneLoadArgs == null)
        {
            paneLoadArgs = new EVUI.Modules.Panes.PaneLoadArgs();
            paneLoadArgs.loadSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Panes.PaneLoadSettings(), paneEntry.link.pane.loadSettings);
        }

        var opSession = new PaneOperationSession();
        opSession.entry = paneEntry;
        opSession.action = EVUI.Modules.Panes.PaneAction.Load;
        opSession.currentAction = EVUI.Modules.Panes.PaneAction.Load;
        opSession.callback = (typeof callback === "function") ? callback : function (success) { };
        opSession.loadArgs = paneLoadArgs;

        performOperation(opSession);
    };

    /**Awaitable. Asynchronously loads a Pane.
    @param {EVUI.Modules.Panes.Pane|String} paneOrID Either a YOLO Pane object to extend into the existing Pane, the real Pane reference, or the string ID of the Pane to load.
    @param {EVUI.Modules.Panes.PaneLoadArgs} paneLoadArgs Optional. A YOLO object representing arguments for loading a Pane.
    @returns {Promise<Boolean>}*/
    this.loadPaneAsync = function (paneOrID, paneLoadArgs)
    {
        return new Promise(function (resolve, reject)
        {
            _self.loadPane(paneOrID, paneLoadArgs, function (success)
            {
                resolve(success);
            })
        });
    };

    /**Asynchronously unloads a Pane, which disconnects the Pane's element and removes it from the DOM if it was loaded remotely. Provides a callback that is called after the operation has completed successfully or otherwise.
    @param {EVUI.Modules.Panes.Pane|String} paneOrID Either a YOLO Pane object to extend into the existing Pane, the real Pane reference, or the string ID of the Pane to unload.
    @param {EVUI.Modules.Panes.PaneUnloadArgs|EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} paneUnloadArgs Optional. A YOLO object representing arguments for unloading a Pane or a callback. If omitted or passed as a function, the Pane's existing unload settings are used instead.
    @param {EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} callback Optional. A callback to call once the operation completes.*/
    this.unloadPane = function (paneOrID, paneUnloadArgs, callback)
    {
        var paneEntry = getPaneAmbiguously(paneOrID, false);

        if (typeof paneUnloadArgs === "function")
        {
            callback = paneUnloadArgs;
            paneUnloadArgs = null;
        }
        else if (paneUnloadArgs != null && typeof paneUnloadArgs === "object")
        {
            if (unloadPaneArgs instanceof EVUI.Modules.Panes.PaneUnloadArgs === false) paneUnloadArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Panes.PaneUnloadArgs(), paneUnloadArgs, ["type"]);
        }
        else
        {
            paneUnloadArgs = null;
        }

        if (paneUnloadArgs == null)
        {
            paneUnloadArgs = new EVUI.Modules.Panes.PaneUnloadArgs();
        }

        var opSession = new PaneOperationSession();
        opSession.entry = paneEntry;
        opSession.action = EVUI.Modules.Panes.PaneAction.Unload;
        opSession.currentAction = EVUI.Modules.Panes.PaneAction.Unload;
        opSession.callback = (typeof callback === "function") ? callback : function (success) { };
        opSession.unloadArgs = paneUnloadArgs;

        performOperation(opSession);
    };

    /**Awaitable. Asynchronously unloads a Pane, which disconnects the Pane's element and removes it from the DOM if it was loaded remotely.
    @param {EVUI.Modules.Panes.Pane|String} paneOrID Either a YOLO Pane object to extend into the existing Pane, the real Pane reference, or the string ID of the Pane to unload.
    @param {EVUI.Modules.Panes.PaneUnloadArgs} paneUnloadArgs Optional. A YOLO object representing arguments for unloading a Pane. If omitted the Pane's existing unload settings are used instead.
    @returns {Promise<Boolean>}*/
    this.unloadPaneAsync = function (paneOrID, paneUnloadArgs)
    {
        return new Promise(function (resolve, reject)
        {
            _self.unloadPane(paneOrID, paneUnloadArgs, function (success)
            {
                resolve(success);
            });
        });
    };

    /**Creates a new instance of a PaneManager that will use the resources that are shared between all instances of PaneManager.
    @param {EVUI.Modules.Panes.PaneManagerSettings} paneManagerSettings A YOLO object representing the settings and overrides to use to change the behavior of the new PaneManager.
    @returns {EVUI.Modules.Panes.PaneManager} */
    this.createNewPaneManager = function (paneManagerSettings)
    {
        if (paneManagerSettings == null) paneManagerSettings = new EVUI.Modules.Panes.PaneManagerSettings();
        attachGlobals(paneManagerSettings);

        return new _managerConstructor(paneManagerSettings);
    };

    /**************************************************************************************EVENTS*************************************************************************************************************/

    /**Global event that fires before the load operation begins for any Pane and is not yet in the DOM and cannot be manipulated in this stage, however the currentActionArgs.loadSettings can be manipulated to change the way the Pane's root element will be loaded.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation. The currentActionArgs property will be an instance of PaneLoadArgs.*/
    this.onLoad = function (paneEventArgs)
    {

    };

    /**Global event that fires after the load operation has completed for any Pane and is now in the DOM and can be manipulated in this stage. From this point on the Pane's element property cannot be reset..
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation. The currentActionArgs property will be an instance of PaneLoadArgs.*/
    this.onLoaded = function (paneEventArgs)
    {

    };

    /**Global event that fires the first time any Pane is shown after being loaded into the DOM, but is not yet visible. After it has fired once, it will not fire again unless the PaneShowArgs.reInitialize property is set to true.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation. The currentActionArgs property will be an instance of PaneShowArgs.*/
    this.onInitialize = function (paneEventArgs)
    {

    };

    /**Global event that fires at the beginning of the show process and before the calculations for any Pane's location are made. The Pane is still hidden, but is present in the DOM and can be manipulated. In order for the positioning calculations in the next step to be accurate, all HTML manipulation should occur in this event.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation. The currentActionArgs property will be an instance of PaneShowArgs.*/
    this.onShow = function (paneEventArgs)
    {

    };

    /**Global event that fires after the position of any Pane has been calculated and is available to be manipulated through the calculatedPosition property of the PaneEventArgs. If the calculatedPosition or the showSettings are manipulated, the position will be recalculated (any changes made directly to the position take priority over changes made to the showSettings).
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation. The currentActionArgs property will be an instance of PaneShowArgs.*/
    this.onPosition = function (paneEventArgs)
    {

    };

    /**Global event that fires once any Pane has been positioned, shown, and had its optional show transition applied and completed. Marks the end of the show process.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation. The currentActionArgs property will be an instance of PaneShowArgs.*/
    this.onShown = function (paneEventArgs)
    {

    };

    /**Global event that fires before any Pane has been moved from its current location and hidden. Gives the opportunity to change the hideTransition property of the PaneHideArgs and optionally trigger an unload once the Pane has been hidden.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation. The currentActionArgs property will be an instance of PaneHideArgs.*/
    this.onHide = function (paneEventArgs)
    {

    };

    /**Global event that fires after any Pane has been moved from its current location and is now hidden and the hide transition has completed.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation. The currentActionArgs property will be an instance of PaneHideArgs.*/
    this.onHidden = function (paneEventArgs)
    {

    };

    /**Global event that fires before any Pane has been (potentially) removed from the DOM and had its element property reset to null.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation. The currentActionArgs property will be an instance of PaneUnloadArgs.*/
    this.onUnload = function (paneEventArgs)
    {
    };

    /**Global event that fires after any Pane has been (potentially) removed from the DOM and had its element property reset to null. From this point on the Pane's element property is now settable to a new Element.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation. The currentActionArgs property will be an instance of PaneUnloadArgs.*/
    this.onUnloaded = function (paneEventArgs)
    {

    };

    /**************************************************************************************SETUP*************************************************************************************************************/

    /**Gets a Pane's InternalPaneEntry based off of a string ID, a YOLO pane object, or a real pane object.
    @param {String|EVUI.Modules.Panes.Pane} paneOrID The string ID or Pane object to get.
    @param {Boolean} addIfMissing Whether or not to add the pane if it cannot be found.
    @returns {InternalPaneEntry} */
    var getPaneAmbiguously = function (paneOrID, addIfMissing)
    {
        if (paneOrID == null || (typeof paneOrID !== "string" && typeof paneOrID !== "object")) throw Error("Invalid input: " + _settings.objectName + " or string id expected.");

        if (paneOrID instanceof Event) //if the pane is being summoned via an event directly, figure out all we can about it based on the current target's attributes.
        {
            paneOrID = getPaneFromEventArgs(paneOrID);
        }

        var paneID = paneOrID;
        if (typeof paneOrID === "object") paneID = paneOrID.id;
        if (typeof paneID !== "string") throw Error("Invalid input: " + _settings.objectName + " missing id.")

        var paneEntry = getInternalPaneEntry(paneID);
        if (paneEntry == null)
        {
            if (typeof paneOrID === "string" || addIfMissing !== true) throw Error("No " + _settings.objectName + " with an id of \"" + paneID + "\" exists.");

            var addResult = _self.addPane(paneOrID);
            if (addResult == null) throw Error("Failed to add " + _settings.objectName + " with an id of \"" + paneOrID + "\".");

            paneEntry = getInternalPaneEntry(paneID);
        }
        else
        {
            if (typeof paneOrID === "object") makeOrExtendPane(paneOrID, addIfMissing);
        }

        return paneEntry;
    };

    /**Creates a graph of all the properties we can determine about a Pane based on the currentTarget's attributes.
    @param {Event} event The event arguments used to trigger the action of showing or hiding the pane.
    @returns {EVUI.Modules.Panes.Pane} */
    var getPaneFromEventArgs = function (event)
    {
        var paneSettings = {};
        var objectAttrs = EVUI.Modules.Core.Utils.getElementAttributes(event.currentTarget);

        var id = objectAttrs.getValue(getAttributeName(EVUI.Modules.Panes.Constants.Attribute_ID)); //first, make sure we have an ID. If we don't we have to attempt to find all other instances that will involve the same Pane and tag them all with the same ID.
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(id) === true) 
        {
            id = fixPanesWithNoID(event, objectAttrs); //go find everything that has a load option in common with this pane and tag them all with the same ID.
        }

        paneSettings.id = id;

        var src = objectAttrs.getValue(getAttributeName(EVUI.Modules.Panes.Constants.Attribute_SourceURL)); //if we have a src url, we're going to use HTTP to load this pane.
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(src) === false)
        {
            if (paneSettings.loadSettings == null) paneSettings.loadSettings = {};
            paneSettings.loadSettings.httpLoadArgs = {}
            paneSettings.loadSettings.httpLoadArgs.url = src;
            paneSettings.loadSettings.httpLoadArgs.method = "GET";
        }

        var placeholderID = objectAttrs.getValue(getAttributeName(EVUI.Modules.Panes.Constants.Attribute_PlaceholderID)); //if we have a placeholderID, we're going to use the placeholder loading logic to load this pane.
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(placeholderID) === false)
        {
            if (paneSettings.loadSettings == null) paneSettings.loadSettings = {};
            paneSettings.loadSettings.placeholderLoadArgs = new EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadArgs();
            paneSettings.loadSettings.placeholderLoadArgs.placeholderID = placeholderID;
        }

        var context = objectAttrs.getValue(getAttributeName(EVUI.Modules.Panes.Constants.Attribute_Context));
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(context) === false) paneSettings.context = context;

        var selector = objectAttrs.getValue(getAttributeName(EVUI.Modules.Panes.Constants.Attribute_Selector)); //if we have a CSS selector, we will use that to "load" this pane.
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(selector) === false)
        {
            if (paneSettings.loadSettings == null) paneSettings.loadSettings = {};
            paneSettings.loadSettings.selector = selector;
        }

        var unloadOnHide = objectAttrs.getValue(getAttributeName(EVUI.Modules.Panes.Constants.Attribute_UnloadOnHide)); //only set this value if it is a valid boolean value (so it doesn't override the default by accident if it is not found)
        if (unloadOnHide === "true") paneSettings.unloadOnHide = true;
        if (unloadOnHide === "false") paneSettings.unloadOnHide = false;

        if (_settings.interpretBrowserEvent(paneSettings, event) === false)
        {
            var showSettings = objectAttrs.getValue(getAttributeName(EVUI.Modules.Panes.Constants.Attribute_ShowSettings)); //finally, see if any show settings were attached to the element. If so, parse them into a real show settings object.
            if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(showSettings) === false)
            {
                var parsedSettings = parseSettingsString(showSettings);
                if (parsedSettings.relativePosition != null && EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(parsedSettings.relativePosition.relativeElement) === true) parsedSettings.relativePosition.relativeElement = event.currentTarget;
                if (parsedSettings != null) paneSettings.showSettings = parsedSettings;
            }
        }

        return paneSettings;
    };

    /**Attempts to find all the places where a pane is loaded using the same parameters and tags them all with the same ID so that the manager handles them correctly.
    @param {Event} event The event that triggered the pane action.
    @param {EVUI.Modules.Core.CaseInsensitiveObject} targetAttributes The attributes that are on the currentTarget.
    @returns {String} */
    var fixPanesWithNoID = function (event, targetAttributes)
    {
        var urlAttributeName = getAttributeName(EVUI.Modules.Panes.Constants.Attribute_SourceURL);
        var placeholderAttributeName = getAttributeName(EVUI.Modules.Panes.Constants.Attribute_PlaceholderID);
        var selectorAttributeName = getAttributeName(EVUI.Modules.Panes.Constants.Attribute_Selector);
        var idAttr = getAttributeName(EVUI.Modules.Panes.Constants.Attribute_ID);

        var allWithSame = [];
        var same = null;
        var sameAttr = null;
        var url = targetAttributes.getValue(urlAttributeName);
        var placeholderID = targetAttributes.getValue(placeholderAttributeName);
        var selector = targetAttributes.getValue(selectorAttributeName);

        //look for everything with the same load data. The loading data is case-insensitive, so we can't use a direct key=value selector to find them as those are case sensitive, so we just find everything tagged with the same attribute thats being used to load the pane.
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(url) === false)
        {
            allWithSame = document.querySelectorAll("[ " + urlAttributeName + " ]");
            sameAttr = urlAttributeName;
            same = url;
        }
        else if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(placeholderID) === false)
        {
            allWithSame = document.querySelectorAll("[ " + placeholderAttributeName + " ]");
            sameAttr = placeholderAttributeName;
            same = placeholderID;
        }
        else if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(selector) === false)
        {
            var selectedElements = document.querySelectorAll(selector); //if the selector hits more than one element, we're not going to use it.
            if (selectedElements.length == 1)
            {
                allWithSame = document.querySelectorAll("[ " + selectorAttributeName + " ]");
                sameAttr = selectorAttributeName;
                same = selector;
            }
        }

        var allNeedingID = [event.currentTarget];
        var same = EVUI.Modules.Core.Utils.stringNormalize(same);

        //walk every element that came back with the matching attribute and see if it's attribute value matches that of the element we're looking for equivalents to.
        var id = null;
        var numSame = allWithSame.length;
        for (var x = 0; x < numSame; x++)
        {
            var curSame = allWithSame[x];
            var value = curSame.getAttribute(sameAttr);
            var curID = curSame.getAttribute(idAttr);

            if (id != null && EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(curID) === false && curID !== id) continue;
            if (typeof value !== "string") continue;
            if (EVUI.Modules.Core.Utils.stringNormalize(value) !== same) continue;

            if (id == null && EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(curID) === false) //found an ID, we tag them all with the ID we just found
            {
                id = curID;
                continue;
            }

            allNeedingID.push(curSame);
        }

        if (id == null) id = EVUI.Modules.Core.Utils.makeGuid(); //never found an ID, just make a guid and tag them all with that
        var eh = new EVUI.Modules.Dom.DomHelper(allNeedingID);
        eh.attr(idAttr, id);

        return id;
    };

    /**Gets the name of an attribute for the specific implementation of the PaneManager.
    @param {String} attribute The full (default) attribute name from the Pane module to change to the specific case.
    @returns {String} */
    var getAttributeName = function (attribute)
    {
        var lowerName = attribute.toLowerCase();
        if (EVUI.Modules.Core.Utils.stringStartsWith(EVUI.Modules.Panes.Constants.Default_AttributePrefix, lowerName) === true)
        {
            return _settings.attributePrefix + attribute.substring(EVUI.Modules.Panes.Constants.Default_AttributePrefix.length);
        }

        return attribute;
    };

    /**Turns a string of settings into an object with those settings as properties.
    @param {String} settingsStr The string of settings to parse.
    @returns {Object} */
    var parseSettingsString = function (settingsStr)
    {
        var quoteSpans = getQuoteSpans(settingsStr);
        if (quoteSpans == null) return null;

        var settings = {};
        var properties = [];

        if (EVUI.Modules.Core.Utils.stringEndsWith(";", settingsStr) === false) settingsStr += ";";

        var lastValidSemicolon = 0;

        //we can't just split it because of escaped semi-colons, so we walk it instead.
        var index = 0;
        while (index < settingsStr.length)
        {
            var nextSemicolon = settingsStr.indexOf(";", index);
            if (nextSemicolon === -1) break;

            if (isInQuoteSpan(quoteSpans, nextSemicolon) === true)
            {
                index = nextSemicolon + 1;
                continue;
            }

            var colonIndex = settingsStr.indexOf(":", lastValidSemicolon);
            if (colonIndex === -1) break;

            var propName = settingsStr.substring(lastValidSemicolon, colonIndex);
            var propValue = settingsStr.substring(colonIndex + 1, nextSemicolon);

            properties.push({ name: propName.trim(), value: propValue.trim() });
            index = nextSemicolon + 1;
            lastValidSemicolon = nextSemicolon + 1;
        }

        var numProps = properties.length;
        for (var x = 0; x < numProps; x++)
        {
            assignSetting(settings, properties[x]);
        }

        return settings;
    };

    /**Gets the start and stop indexes of all the runs of characters that are between quotation marks.
     @param {String} settingsStr
     @returns {{start:Number, end:Number}[]}*/
    var getQuoteSpans = function (settingsStr)
    {
        var quoteType = (settingsStr.indexOf("\"") === -1) ? "'" : "\"";

        var spans = [];
        var index = 0;
        var openIndex = -1;

        while (index < settingsStr.length)
        {
            var quoteIndex = settingsStr.indexOf(quoteType, index);
            if (quoteIndex === -1) break;

            if (quoteIndex > 0 && settingsStr[quoteIndex - 1] === "\\")
            {
                index = quoteIndex + 1;
                continue;
            }

            if (openIndex === -1)
            {
                openIndex = quoteIndex;
            }
            else
            {
                spans.push({ start: openIndex, end: quoteIndex });
                openIndex = -1;
            }

            index = quoteIndex + 1;
        }

        if (openIndex !== -1) return EVUI.Modules.Core.Utils.debugReturn(_settings.managerName, "getQuoteSpans", "Invalid settings string, unclosed quote starting at position " + openIndex, null);
        return spans;
    };

    /**Determines if a character index is inside of a span of quotes.
    @param {{start:Number, end:Number}[]} quoteSpans The array of start/stop indexes of quotes.
    @param {Number} index The index to check and see if it is inside of.
    @returns {Boolean} */
    var isInQuoteSpan = function (quoteSpans, index)
    {
        var numSpans = quoteSpans.length;
        for (var x = 0; x < numSpans; x++)
        {
            var curSpan = quoteSpans[x];
            if (index > curSpan.start && index < curSpan.end) return true;
        }

        return false;
    };

    /**Assigns a setting based on a value found in the parsing of a settings string.
    @param {Object} settings The settings object to set the setting on.
    @param {{name: String, value: String}} curSetting The setting to set.*/
    var assignSetting = function (settings, curSetting)
    {
        var segments = curSetting.name.split(".");
        var numSegs = segments.length;
        var curObj = settings;

        for (var x = 0; x < numSegs - 1; x++)
        {
            var curSeg = segments[x];
            if (curObj[curSeg] == null) curObj[curSeg] = {};
            curObj = curObj[curSeg];
        }

        var escaped = curSetting.value.replace(/'|\\'/g, "\"");

        try
        {
            var value = JSON.parse(escaped);
            curObj[segments[numSegs - 1]] = value;
        }
        catch (ex)
        {
            EVUI.Modules.Core.Utils.debugReturn(_settings.managerName, "assignSetting", "Could not parse setting value \"" + escaped + "\" from JSON: " + ex.message);
        }
    };

    /**Gets an InternalPaneEntry based on a Pane's id.
    @param {String} paneID The ID of the Pane to get the PaneEntry for (case-insensitive)..
    @returns {InternalPaneEntry}*/
    var getInternalPaneEntry = function (paneID)
    {
        paneID = paneID.toLocaleLowerCase();

        var numEntries = _entries.length;
        for (var x = 0; x < numEntries; x++)
        {
            var curEntry = _entries[x];
            if (curEntry.lowerPaneID === paneID) return curEntry;
        }

        return null;
    };

    /**Determines whether or not a Pane's element can be set.
    @param {PaneElementSetter} paneElementSetter An object passed in from the Pane's element property setter.
    @returns {String} */
    var canSetElement = function (paneElementSetter)
    {
        var entry = getInternalPaneEntry(paneElementSetter.paneID);
        if (entry == null) throw Error("Failed to set element for pane \"" + paneElementSetter.paneID + "\":  No PaneEntry found for Pane with ID of \"" + paneElementSetter.paneID + "\".");

        if (EVUI.Modules.Core.Utils.hasFlag(entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Loaded)) throw Error("Failed to set element for pane \"" + paneElementSetter.paneID + "\": Pane has been loaded. Unload it before attempting to set element.");

        if (paneElementSetter.element != null)
        {
            if (EVUI.Modules.Core.Utils.isElement(paneElementSetter.element) !== true) throw Error("Failed to set element for pane \"" + paneElementSetter.paneID + "\": The provided value is invalid. Value must be an object derived from Element.");
        }

        if (entry.link.setSecret !== paneElementSetter.setSecret) Error("Failed to set element for pane \"" + paneElementSetter.paneID + "\": Permission denied, tokens do not match.");

        return entry.link.setSecret;
    };

    /**Gets the CSS class name for the Pane.
    @param {InternalPaneEntry} entry The entry containing the pane to get the CSS class name of.
    @returns {String}*/
    var getClassName = function (paneID)
    {
        //remove all whitespace and add the prefix
        var noWhitespaceRegex = new RegExp(/\s+/g);
        var className = _settings.cssPrefix + (EVUI.Modules.Core.Utils.stringEndsWith(_settings.cssPrefix.trim(), "-") ? "" : "-") + paneID;
        className = className.replace(noWhitespaceRegex, "");

        return className;
    };

    /**Takes a pane object passed in by the user and either creates a new pane object or extends its properties onto an existing pane.
    @param {EVUI.Modules.Panes.Pane} yoloPane The YOLO object passed in by the user into one of the entry point functions.
    @returns {PaneExtensionResult}*/
    var makeOrExtendPane = function (yoloPane, addIfMissing)
    {
        if (yoloPane == null) return null;
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(yoloPane.id) === true) throw Error("Pane must have an id that is a non-whitespace string.");

        var result = new PaneExtensionResult();
        var id = yoloPane.id;
        var eventStream = null;
        var paneToExtend = null;
        var existing = getInternalPaneEntry(id);
        if (existing != null)
        {
            result.exists = true;
            result.entry = existing;
            result.pane = existing.link.pane;

            eventStream = existing.link.eventStream;
            paneToExtend = existing.link.pane;
            if (yoloPane === paneToExtend) return result;
        }
        else
        {
            var link = new PaneLink();
            link.eventStream = new EVUI.Modules.EventStream.EventStream();
            eventStream = link.eventStream;

            link.manager = _self;
            link.paneCSSName = getClassName(id);

            var options = new PaneOptions();
            options.canSetElement = canSetElement;
            options.link = link;

            paneToExtend = new EVUI.Modules.Panes.Pane(id, options);

            link.pane = paneToExtend;


            var entry = new EVUI.Modules.Panes.PaneEntry(link);
            var innerEntry = new InternalPaneEntry();
            innerEntry.publicEntry = entry;
            innerEntry.link = link;
            innerEntry.paneID = id;
            innerEntry.lowerPaneID = id.toLocaleLowerCase();

            result.pane = paneToExtend;
            result.exists = false;
            result.entry = innerEntry;

            if (addIfMissing === true)
            {
                _entries.push(innerEntry);
            }
        }

        var safeCopy = EVUI.Modules.Core.Utils.shallowExtend({}, yoloPane);

        delete safeCopy.id;
        if (yoloPane.element === result.entry.link.pane.element) delete safeCopy.element; //if the pane already exists and this is the same reference, don't set it again. Otherwise, let it blow up.
        delete safeCopy.currentPosition;
        delete safeCopy.currentZIndex;
        delete safeCopy.isVisible;
        delete safeCopy.isLoaded;
        delete safeCopy.isInitialized;

        EVUI.Modules.Core.Utils.shallowExtend(paneToExtend, safeCopy, ["showSettings", "loadSettings", "resizeMoveSettings", "autoCloseSettings", "recalcSettings"]);
        paneToExtend.showSettings = makeOrExtendShowSettings(paneToExtend.showSettings, safeCopy.showSettings);
        paneToExtend.loadSettings = makeOrExtendLoadSettings(paneToExtend.loadSettings, safeCopy.loadSettings);
        paneToExtend.resizeMoveSettings = EVUI.Modules.Core.Utils.makeOrExtendObject(new EVUI.Modules.Panes.PaneResizeMoveSettings(), paneToExtend.resizeMoveSettings, safeCopy.resizeMoveSettings);
        paneToExtend.autoCloseSettings = EVUI.Modules.Core.Utils.makeOrExtendObject(new EVUI.Modules.Panes.PaneAutoCloseSettings(), paneToExtend.autoCloseSettings, safeCopy.autoCloseSettings);
        paneToExtend.autoCloseSettings.autoCloseKeys = paneToExtend.autoCloseSettings.autoCloseKeys.slice();
        paneToExtend.reclacSettings = EVUI.Modules.Core.Utils.makeOrExtendObject(new EVUI.Modules.Panes.PaneRecalcSettings(), paneToExtend.reclacSettings, safeCopy.reclacSettings);

        if (EVUI.Modules.Core.Utils.isArray(safeCopy.autoHideKeys) === true) paneToExtend.autoHideKeys = safeCopy.autoHideKeys.slice();

        if (typeof _settings.makeOrExtendObject === "function") result.entry.link.wrapper = _settings.makeOrExtendObject(result);

        return result;
    };

    /**Makes or extends a PaneShowSettings object.
    @param {EVUI.Modules.Panes.PaneShowSettings} showSettings A show settings object made by a user.
    @returns {EVUI.Modules.Panes.PaneShowSettings}*/
    var makeOrExtendShowSettings = function (showSettings, yoloSettings)
    {
        if (showSettings == null) return new EVUI.Modules.Panes.PaneShowSettings();

        var copy = EVUI.Modules.Core.Utils.makeOrExtendObject(new EVUI.Modules.Panes.PaneShowSettings(), showSettings, yoloSettings);
        if (yoloSettings == null) yoloSettings = {};

        if (copy.anchors != null) copy.anchors = EVUI.Modules.Core.Utils.makeOrExtendObject(new EVUI.Modules.Panes.PaneAnchors(), showSettings.anchors, yoloSettings.anchors);
        if (copy.absolutePosition != null) copy.absolutePosition = EVUI.Modules.Core.Utils.makeOrExtendObject(new EVUI.Modules.Panes.PaneAbsolutePosition(), showSettings.absolutePosition, yoloSettings.absolutePosition);
        if (copy.documentFlow != null) copy.documentFlow = EVUI.Modules.Core.Utils.makeOrExtendObject(new EVUI.Modules.Panes.PaneDocumentFlow(), showSettings.documentFlow, yoloSettings.documentFlow);
        if (copy.hideTransition != null) copy.hideTransition = EVUI.Modules.Core.Utils.makeOrExtendObject(new EVUI.Modules.Panes.PaneTransition(), showSettings.hideTransition, yoloSettings.hideTransition);
        if (copy.showTransition != null) copy.showTransition = EVUI.Modules.Core.Utils.makeOrExtendObject(new EVUI.Modules.Panes.PaneTransition(), showSettings.showTransition, yoloSettings.showTransition);
        if (copy.relativePosition != null) copy.relativePosition = EVUI.Modules.Core.Utils.makeOrExtendObject(new EVUI.Modules.Panes.PaneRelativePosition(), showSettings.relativePosition, yoloSettings.relativePosition);
        if (copy.clipSettings != null) copy.clipSettings = EVUI.Modules.Core.Utils.makeOrExtendObject(new EVUI.Modules.Panes.PaneClipSettings(), showSettings.clipSettings, yoloSettings.clipSettings);
        if (copy.backdropSettings != null) copy.backdropSettings = EVUI.Modules.Core.Utils.makeOrExtendObject(new EVUI.Modules.Panes.PaneBackdropSettings(), showSettings.backdropSettings, yoloSettings.backdropSettings);

        return copy;
    };

    /**Makes or extends a PaneLoadSettings object.
    @param {EVUI.Modules.Panes.PaneLoadSettings} loadSettings A PaneLoadSettings object made by a user.
    @returns {EVUI.Modules.Panes.PaneShowSettings} */
    var makeOrExtendLoadSettings = function (loadSettings, yoloLoadSettings)
    {
        if (loadSettings == null) return new EVUI.Modules.Panes.PaneLoadSettings();

        var copy = EVUI.Modules.Core.Utils.makeOrExtendObject(new EVUI.Modules.Panes.PaneLoadSettings(), loadSettings, yoloLoadSettings);
        if (yoloLoadSettings == null) yoloLoadSettings = {};

        if (loadSettings.httpLoadArgs != null || yoloLoadSettings.httpLoadArgs != null)
        {
            EVUI.Modules.Core.Utils.require("HtmlLoaderController", EVUI.Modules.Panes.Dependencies["HtmlLoader"].version, "Cannot use httpLoadArgs.");
            copy.httpLoadArgs = makeOrExtendHttpArgs(loadSettings.httpLoadArgs, yoloLoadSettings.httpLoadArgs);
        }

        if (loadSettings.placeholderLoadArgs != null || yoloLoadSettings.placeholderLoadArgs != null)
        {
            EVUI.Modules.Core.Utils.require("HtmlLoaderController", EVUI.Modules.Panes.Dependencies["HtmlLoader"].version, "Cannot use placeholderLoadArgs.");
            copy.placeholderLoadArgs = EVUI.Modules.Core.Utils.makeOrExtendObject(new EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadArgs(), loadSettings.placeholderLoadArgs, yoloLoadSettings.placeholderLoadArgs);
            copy.placeholderLoadArgs.httpArgs = makeOrExtendHttpArgs((loadSettings.placeholderLoadArgs == null) ? null : loadSettings.placeholderLoadArgs.httpArgs, (yoloLoadSettings.placeholderLoadArgs == null) ? null : loadSettings.placeholderLoadArgs.httpArgs)
        }

        return copy;
    };

    /**Makes or extends a copy of HttpRequestArgs.
    @param {any} httpArgs HttpRequestArgs made by the user.
    @returns {EVUI.Modules.Http.HttpRequestArgs}*/
    var makeOrExtendHttpArgs = function (httpArgs, yoloHttpArgs)
    {
        var copy = EVUI.Modules.Core.Utils.makeOrExtendObject(new EVUI.Modules.Http.HttpRequestArgs(), httpArgs, yoloHttpArgs);
        copy.headers = copy.headers == null ? [] : copy.headers.map(function (header) { return EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Http.HttpRequestHeader(), header); });
        return copy;
    };

    /**Makes a clone of the Pane's PaneShowSettings.
    @param {EVUI.Modules.Panes.PaneShowSettings} showSettings The show settings to clone.
    @returns {EVUI.Modules.Panes.PaneShowSettings} */
    var cloneShowSettings = function (showSettings)
    {
        var copy = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Panes.PaneShowSettings(), showSettings);

        if (showSettings.absolutePosition != null) copy.absolutePosition = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Panes.PaneAbsolutePosition(), showSettings.absolutePosition);
        if (showSettings.anchors != null) copy.anchors = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Panes.PaneAnchors(), showSettings.anchors);
        if (showSettings.documentFlow != null) copy.documentFlow = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Panes.PaneDocumentFlow(), showSettings.documentFlow);
        if (showSettings.hideTransition != null) copy.hideTransition = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Panes.PaneTransition(), showSettings.hideTransition);
        if (showSettings.showTransition != null) copy.showTransition = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Panes.PaneTransition(), showSettings.showTransition);
        if (showSettings.relativePosition != null) copy.relativePosition = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Panes.PaneRelativePosition(), showSettings.relativePosition);
        if (showSettings.clipSettings != null) copy.clipSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Panes.PaneClipSettings(), showSettings.clipSettings);
        if (showSettings.backdropSettings != null) copy.backdropSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Panes.PaneBackdropSettings(), showSettings.backdropSettings);

        return copy;
    };

    /**Makes a clone of the Pane's PaneLoadSettings.
    @param {EVUI.Modules.Panes.PaneLoadSettings} loadSettings The load settings to clone.
    @returns {EVUI.Modules.Panes.PaneLoadSettings} */
    var cloneLoadSettings = function (loadSettings)
    {
        var copy = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Panes.PaneLoadSettings(), loadSettings);

        if (loadSettings.httpLoadArgs != null) 
        {
            EVUI.Modules.Core.Utils.require("Http", EVUI.Modules.Panes.Dependencies["HtmlLoader"].version, "Cannot use httpLoadArgs.");
            copy.httpLoadArgs = cloneHttpArgs(loadSettings.httpLoadArgs);
        }

        if (loadSettings.placeholderLoadArgs != null)
        {
            EVUI.Modules.Core.Utils.require("HtmlLoaderController", EVUI.Modules.Panes.Dependencies["HtmlLoader"].version, "Cannot use placeholderLoadArgs.");
            copy.placeholderLoadArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadArgs(), loadSettings.placeholderLoadArgs);
            copy.placeholderLoadArgs.httpArgs = cloneHttpArgs(copy.placeholderLoadArgs.httpArgs);
        }

        return copy;
    };

    /**Clones a set of EVUI.Modules.Http.HttpRequestArgs.
    @param {EVUI.Modules.Http.HttpRequestArgs} httpArgs The HttpArgs to clone.
    @returns {EVUI.Modules.Http.HttpRequestArgs} */
    var cloneHttpArgs = function (httpArgs)
    {
        var copy = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Http.HttpRequestArgs(), httpArgs);
        copy.headers = httpArgs.headers == null ? [] : httpArgs.headers.map(function (header) { return EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Http.HttpRequestHeader(), header); });

        return copy;
    };

    /** Gets a PaneEntry object based on its ID or a selector function.
    @param {EVUI.Modules.Panes.Constants.Fn_PaneEntrySelector|String} paneIDOrSelector A selector function to select a PaneEntry object (or multiple PaneEntry objects) or the ID of the Pane to get the PaneEntry for.
    @param {Boolean} getAllMatches If a selector function is provided, all the PaneEntries that satisfy the selector are included. Otherwise a single PaneEntry object is returned. False by default.
    @returns {EVUI.Modules.Panes.PaneEntry|EVUI.Modules.Panes.PaneEntry[]} */
    var getPaneEntry = function (paneIDOrSelector, getAllMatches)
    {
        if (typeof paneIDOrSelector === "string")
        {
            var existing = getInternalPaneEntry(paneIDOrSelector);
            if (existing != null)
            {
                return existing.publicEntry;
            }
            else
            {
                return null;
            }
        }
        else if (typeof paneIDOrSelector === "function")
        {
            var results = [];
            var numPanes = _entries.length;
            for (var x = 0; x < numPanes; x++)
            {
                var curEntry = _entries[x];
                if (paneIDOrSelector(curEntry.publicEntry) === true)
                {
                    if (getAllMatches === true)
                    {
                        results.push(curEntry.publicEntry);
                    }
                    else
                    {
                        return curEntry.publicEntry;
                    }
                }
            }

            return results;
        }
        else
        {
            return null;
        }
    };

    /**************************************************************************************EVENT SEQUENCING*************************************************************************************************************/

    /**Performs the operation described in the PaneOperationSession. Takes into account the current state of the pane being executed and will cancel, ignore, or continue operations depending on the combination of current action and requested action. 
    All execution begins asynchronously so that multiple calls in the same stack frame behave correctly.
    @param {PaneOperationSession} opSession The operation session to execute on. */
    var performOperation = function (opSession)
    {
        opSession.foreignActionArgs = _settings.currentActionArgs;
        _settings.currentActionArgs = null;

        var callbackStack = getCallbackStack(opSession.entry.link, opSession.action); //add the callback to the stack of callbacks for the current operation.
        if (callbackStack == null)
        {
            callbackStack = new CallbackStack();
            callbackStack.action = opSession.action;
            opSession.entry.link.callbackStack.push(callbackStack);
        }

        if (callbackStack.opSessions.indexOf(opSession) === -1) callbackStack.opSessions.push(opSession);

        var actionSequence = getActionSequence(opSession); //get the steps we will perform to complete the requested action and always queue the callback even if we wind up doing nothing
        actionSequence = validateActionSequence(actionSequence, opSession); //make sure we aren't doing anything redundantly or need to modify the sequence slightly

        if (actionSequence == null || actionSequence.length === 0) //no sequence or zero length sequence means we do nothing, so just call the callbacks.
        {
            return callCallbackStack(opSession.entry.link, opSession.action, true);
        }
        else if (actionSequence[0] === ActionSequence.Queue) //queue the callback for a duplicate operation without setting up a new event stream
        {
            return;
        }

        opSession.cancel = (actionSequence[0] === ActionSequence.CancelCurrent);
        opSession.continue = (actionSequence[0] === ActionSequence.Continue);

        var eventStream = buildEventStream(actionSequence, opSession);

        if (opSession.cancel === true) //if we have a cancel directive, that means we need to stop the current execution of the old event stream and start a new one
        {
            cancelOperation(eventStream, actionSequence, opSession);
        }
        else if (opSession.continue === true) //if we are continuing one operation, record the operation we were continuing so its callback can be included in the callbacks called for this event.
        {
            continueOperation(eventStream, actionSequence, opSession);
        }
        else //not canceling anything, run the event stream like normal.
        {
            startOperation(eventStream, actionSequence, opSession);
        }
    };

    /**Cancels the current operation and begins a new operation.
    @param {EVUI.Modules.EventStream.EventStream} eventStream The new event stream to begin once the previous one ends.
    @param {String[]} actionSequence The sequence of actions that will be performed.
    @param {PaneOperationSession} opSession The metadata about the operation in progress.*/
    var cancelOperation = function (eventStream, actionSequence, opSession)
    {
        flagSessionAsCanceled(opSession.entry.link, opSession.entry.link.paneAction); //mark all the sessions for the operation as canceled - they all were pre-existing and should all be canceled now that an event has come along to overwrite them

        //if we are in the middle of a transition, bail on the transition
        try
        {
            if (opSession.entry.link.transitionTimeoutID !== -1 && typeof opSession.entry.link.transitionCallback === "function")
            {
                opSession.entry.link.transitionCallback();
                opSession.entry.link.transitionTimeoutID = -1;
                opSession.entry.link.transitionCallback = null;
                opSession.entry.link.transitionSelector = null;
            }

            _settings.backdropManager.cancelTransition();
        }
        catch (ex)
        {
            EVUI.Modules.Core.Utils.log(ex.stack);
        }

        if (opSession.entry.link.eventStream.isWorking() === true && opSession.entry.link.eventStream.getStatus() !== EVUI.Modules.EventStream.EventStreamStatus.Seeking) //if the stream is working but not seeking, cancel the operation (which will fast-forward to the cleanup step)
        {
            opSession.entry.link.eventStream.cancel();
            opSession.entry.link.paneActionSequence = actionSequence;
            opSession.entry.link.paneAction = opSession.action;

            opSession.entry.link.eventStream.onComplete = function (eventArgs) //when the previous chain finishes, launch the new one
            {
                opSession.entry.link.eventStream = eventStream;
                eventStream.execute();
            };
        }
        else //the stream is not busy and not seeking - call the callbacks
        {
            var currentStep = opSession.entry.link.eventStream.getCurrentStep();
            if (currentStep != null && currentStep.key !== "pane.oncomplete") opSession.entry.link.eventStream.seek("pane.oncomplete"); //if the streak was busy, fast forward to the cleanup step

            callCallbackStack(opSession.entry.link, opSession.entry.link.paneAction, false, function () //call all the callbacks associated with the step
            {
                opSession.entry.link.paneActionSequence = actionSequence;
                opSession.entry.link.paneAction = opSession.action;

                if (opSession.entry.link.eventStream.isWorking() === false) //if its NOT working, start it up again
                {
                    setTimeout(function () //we set a timeout so synchronous calls cancel each other out and this ensures that the event stream only begins once the current stack frame has cleared.
                    {
                        var callbackStack = getCallbackStack(opSession.entry.link, opSession.action) //make sure the callbacks haven't already been called or the step wasn't canceled (either way it means the stream shouldn't do anything).
                        if (callbackStack != null)
                        {
                            if (callbackStack.opSessions.filter(function (session) { return session === opSession && session.canceled === true; }).length === 0)
                            {
                                opSession.entry.link.eventStream = eventStream;
                                eventStream.execute();
                            }
                        }
                    });
                }
                else //otherwise wait for completion to change streams
                {
                    opSession.entry.link.eventStream.onComplete = function (eventArgs)
                    {
                        opSession.entry.link.eventStream = eventStream;
                        eventStream.execute();
                    };
                }
            });
        }
    };

    /**Triggers the continuation of one event stream after the other completes to form a single composite operation.
    @param {EVUI.Modules.EventStream.EventStream} eventStream The new event stream to begin once the previous one ends.
    @param {String[]} actionSequence The sequence of actions that will be performed.
    @param {PaneOperationSession} opSession The metadata about the operation in progress.*/
    var continueOperation = function (eventStream, actionSequence, opSession)
    {
        var firstAction = opSession.entry.link.paneAction

        //first, establish the link between the two callback stacks so that a cancel operation picks up both callback stacks
        var firstActionCallbackStack = getCallbackStack(opSession.entry.link, firstAction);
        if (firstActionCallbackStack != null && firstActionCallbackStack.opSessions.length > 0)
        {
            firstActionCallbackStack.opSessions[firstActionCallbackStack.opSessions.length - 1].continuedTo = opSession;
        }

        //then cancel the normal step that calls the callback for the previous event stream.
        var completeStep = opSession.entry.link.eventStream.getStep(_settings.eventNamePrefix + ".oncomplete");
        completeStep.handler = function (jobArgs) { jobArgs.resolve(); }

        //then get the same step, but in the new event stream and overwrite its handler to call BOTH callback stacks. We must the last one first and the first one last - this  because of some kind of race condition that predictably inverts the sequence, so we call them backwards 
        var realCompleteStep = eventStream.getStep(_settings.eventNamePrefix + ".oncomplete");
        realCompleteStep.handler = function (jobArgs)
        {
            callCallbackStack(opSession.entry.link, opSession.action, true, function ()
            {
                callCallbackStack(opSession.entry.link, firstAction, true, function ()
                {
                    jobArgs.resolve();
                });
            });
        };

        //finally, rig up the existing stream's oncomplete handler to call the new event stream once it completes.
        opSession.entry.link.eventStream.onComplete = function (eventArgs)
        {
            var callbackStack = getCallbackStack(opSession.entry.link, opSession.action) //make sure the callbacks haven't already been called or the step wasn't canceled (either way it means the stream shouldn't do anything).
            if (callbackStack != null)
            {
                if (callbackStack.opSessions.filter(function (session) { return session === opSession && session.canceled === true; }).length === 0)
                {
                    opSession.entry.link.eventStream = eventStream;
                    eventStream.execute();
                }
            }
        };
    };

    /**Triggers the beginning of an event stream. It is queued with a callback so that multiple calls in the same stack frame cancel each other out before the event stream finally goes. When it finally goes, it will either do nothing and fail out, or it will continue and execute properly.
    @param {EVUI.Modules.EventStream.EventStream} eventStream The new event stream to begin once the previous one ends.
    @param {String[]} actionSequence The sequence of actions that will be performed.
    @param {PaneOperationSession} opSession The metadata about the operation in progress.*/
    var startOperation = function (eventStream, actionSequence, opSession)
    {
        opSession.entry.link.eventStream = eventStream;
        opSession.entry.link.paneActionSequence = actionSequence;
        opSession.entry.link.paneAction = opSession.action;

        setTimeout(function () //we set a timeout so synchronous calls cancel each other out and this ensures that the event stream only begins once the current stack frame has cleared.
        {
            var callbackStack = getCallbackStack(opSession.entry.link, opSession.action) //make sure the callbacks haven't already been called or the step wasn't canceled (either way it means the stream shouldn't do anything).
            if (callbackStack != null)
            {
                if (callbackStack.opSessions.filter(function (session) { return session === opSession && session.canceled === true; }).length === 0)
                {
                    eventStream.execute();
                }
            }
        });
    };

    /**Marks all the current action's operation sessions as canceled so they can be picked up by the callCallbackStack function later. Also cancels any linked sessions.
    @param {PaneLink} link The internal link object to the pane being operated on.
    @param {String} action The action set to mark as canceled.*/
    var flagSessionAsCanceled = function (link, action)
    {
        var callbackStack = getCallbackStack(link, action)
        if (callbackStack != null)
        {
            var numSessions = callbackStack.opSessions.length;
            for (var x = 0; x < numSessions; x++)
            {
                var curSession = callbackStack.opSessions[x];
                curSession.canceled = true;
                if (curSession.continuedTo != null) flagSessionAsCanceled(link, curSession.continuedTo.action);
            }
        }
    };

    /**Constructs an event stream based on the actions in the action sequence.
    @param {String[]} actionSequence The action sequence to build the event stream for.
    @param {PaneOperationSession} opSession The metadata about the operation in progress.
    @returns {EVUI.Modules.EventStream.EventStream}*/
    var buildEventStream = function (actionSequence, opSession)
    {
        var eventStream = new EVUI.Modules.EventStream.EventStream();
        eventStream.context = opSession.entry.link.wrapper;
        if (eventStream.context == null) eventStream.context = opSession.entry.link.pane;

        configureEventStream(eventStream, opSession); //set the settings for the event stream to get it configured to behave properly

        var numSteps = actionSequence.length;
        for (var x = 0; x < numSteps; x++)
        {
            var curStep = actionSequence[x];

            if (curStep === ActionSequence.Initialize)
            {
                addInitSteps(eventStream, opSession);
            }
            else if (curStep === ActionSequence.Load)
            {
                addLoadSteps(eventStream, opSession);
            }
            else if (curStep === ActionSequence.Show)
            {
                addShowSteps(eventStream, opSession);
            }
            else if (curStep === ActionSequence.Position)
            {
                addPositionSteps(eventStream, opSession);
            }
            else if (curStep === ActionSequence.Hide)
            {
                addHideSteps(eventStream, opSession);
            }
            else if (curStep === ActionSequence.Unload)
            {
                addUnloadSteps(eventStream, opSession);
            }
        }

        //finally, add the complete step that will call the operations callbacks.
        addOnCompleteStep(eventStream, opSession);

        return eventStream;
    };


    /**Configures the EventStream so it makes the right event args, responds to changes in the event args properly, and has the correct cancel behavior.
    @param {EVUI.Modules.EventStream.EventStream} eventStream
    @param {PaneOperationSession} opSession*/
    var configureEventStream = function (eventStream, opSession)
    {
        eventStream.canSeek = true;
        eventStream.endExecutionOnEventHandlerCrash = false;
        var curArgs = null;

        eventStream.processInjectedEventArgs = function (eventStreamArgs)
        {
            curArgs = getArgsAndContext(opSession);

            var paneArgs = new EVUI.Modules.Panes.PaneEventArgs(opSession.entry, curArgs);
            paneArgs.cancel = eventStreamArgs.cancel;
            paneArgs.key = eventStreamArgs.key;
            paneArgs.pause = eventStreamArgs.pause;
            paneArgs.resume = eventStreamArgs.resume;
            paneArgs.stopPropagation = eventStreamArgs.stopPropagation;
            paneArgs.context = curArgs.context;

            //let the settings object take the pane args and produce their own special event args if so desired.
            var processedArgs = _settings.buildEventArgs(opSession.makeArgsPackage(curArgs.context), paneArgs);
            if (processedArgs != null) return processedArgs;
            return paneArgs;
        };

        eventStream.processReturnedEventArgs = function (eventStreamArgs)
        {
            curArgs.context = eventStreamArgs.context;

            _settings.processReturnedEventArgs(opSession.makeArgsPackage(curArgs.context), eventStreamArgs);
        };

        eventStream.onCancel = function ()
        {
            eventStream.seek(_settings.eventNamePrefix + ".oncomplete");
        };

        eventStream.onError = function (args, error)
        {
            eventStream.seek(_settings.eventNamePrefix + ".oncomplete");
        }
    };

    /**Gets the correct args parameter and context value for the current operation.
    @param {PaneOperationSession} opSession The operation session to get the current arguments for.
    @returns {EVUI.Modules.Panes.PaneShowArgs|EVUI.Modules.Panes.PaneHideArgs|EVUI.Modules.Panes.PaneLoadArgs|EVUI.Modules.Panes.PaneUnloadArgs} */
    var getArgsAndContext = function (opSession)
    {
        var curArgs = null;
        if (opSession.currentAction === EVUI.Modules.Panes.PaneAction.Show)
        {
            curArgs = opSession.showArgs;
        }
        else if (opSession.currentAction === EVUI.Modules.Panes.PaneAction.Hide)
        {
            curArgs = opSession.hideArgs;
        }
        else if (opSession.currentAction === EVUI.Modules.Panes.PaneAction.Load)
        {
            curArgs = opSession.loadArgs;
            if (opSession.loadArgs.context == null)
            {
                if (opSession.showArgs != null) opSession.loadArgs.context = opSession.showArgs.context;
            }
        }
        if (opSession.currentAction === EVUI.Modules.Panes.PaneAction.Unload)
        {
            curArgs = opSession.unloadArgs;
            if (opSession.unloadArgs.context == null)
            {
                if (opSession.hideArgs != null) opSession.unloadArgs.context = opSession.hideArgs.context;
            }
        }

        return curArgs;
    }

    /**Adds the load sequence steps to the EventStream.
    @param {EVUI.Modules.EventStream.EventStream} eventStream The event stream to receive the events.
    @param {PaneOperationSession} opSession The operation session driving the events.*/
    var addLoadSteps = function (eventStream, opSession)
    {
        var skipLoad = false;

        eventStream.addStep({
            name: "preload",
            key: _settings.eventNamePrefix + ".preload",
            type: EVUI.Modules.EventStream.EventStreamStepType.Job,
            handler: function (jobArgs)
            {
                opSession.currentAction = EVUI.Modules.Panes.PaneAction.Load;
                if (opSession.entry.link.pane.element != null && opSession.entry.link.pane.element.isConnected === true)
                {
                    opSession.entry.link.paneStateFlags |= EVUI.Modules.Panes.PaneStateFlags.Loaded;
                    skipLoad = true;
                }

                jobArgs.resolve();
            }
        });


        eventStream.addStep({
            name: "onLoad",
            key: _settings.eventNamePrefix + ".onload",
            type: EVUI.Modules.EventStream.EventStreamStepType.Event,
            handler: function (eventArgs)
            {
                if (EVUI.Modules.Core.Utils.hasFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Loaded) === true) return;

                if (typeof opSession.entry.link.pane.onLoad === "function")
                {
                    return opSession.entry.link.pane.onLoad.call(this, eventArgs)
                }
            }
        });

        eventStream.addStep({
            name: "onLoad",
            key: _settings.eventNamePrefix + ".onload",
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            handler: function (eventArgs)
            {
                if (EVUI.Modules.Core.Utils.hasFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Loaded) === true) return;

                if (typeof _self.onLoad === "function")
                {
                    return _self.onLoad.call(_settings.manager, eventArgs)
                }
            }
        });

        eventStream.addStep({
            name: "load",
            key: _settings.eventNamePrefix + ".load",
            type: EVUI.Modules.EventStream.EventStreamStepType.Job,
            handler: function (jobArgs)
            {
                if (EVUI.Modules.Core.Utils.hasFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Loaded) === true && opSession.loadArgs.reload === false) return jobArgs.resolve();

                if (opSession.entry.link.pane.element != null)
                {
                    opSession.entry.link.paneStateFlags |= EVUI.Modules.Panes.PaneStateFlags.Loaded;
                    return jobArgs.resolve();
                }

                if (opSession.loadArgs.reload === true)
                {
                    opSession.entry.link.paneStateFlags = EVUI.Modules.Core.Utils.removeFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Loaded);
                    unloadRootElement(opSession.entry);
                }

                loadRootElement(opSession.entry, opSession.loadArgs.loadSettings, function (success)
                {
                    if (success === true)
                    {
                        if (opSession.entry.link.pane.element != null)
                        {
                            if (opSession.entry.link.pane.element.isConnected === false) moveToLoadDiv(opSession.entry);
                        }

                        opSession.entry.link.paneStateFlags |= EVUI.Modules.Panes.PaneStateFlags.Loaded;
                        opSession.entry.link.lastLoadSettings = opSession.loadArgs.loadSettings;
                        jobArgs.resolve();
                    }
                    else
                    {
                        jobArgs.reject("Failed to load " + _settings.objectName + " root element.")
                    }
                });
            }
        });

        eventStream.addStep({
            name: "onLoaded",
            key: _settings.eventNamePrefix + ".onloaded",
            type: EVUI.Modules.EventStream.EventStreamStepType.Event,
            handler: function (eventArgs)
            {
                if (skipLoad === true) return;

                if (typeof opSession.entry.link.pane.onLoaded === "function")
                {
                    return opSession.entry.link.pane.onLoaded.call(this, eventArgs)
                }
            }
        });

        eventStream.addStep({
            name: "onLoaded",
            key: _settings.eventNamePrefix + ".onloaded",
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            handler: function (eventArgs)
            {
                if (skipLoad === true) return;

                if (typeof _self.onLoaded === "function")
                {
                    return _self.onLoaded.call(_settings.manager, eventArgs)
                }
            }
        });
    };


    /**Adds the initialize sequence steps to the EventStream.
    @param {EVUI.Modules.EventStream.EventStream} eventStream The event stream to receive the events.
    @param {PaneOperationSession} opSession The operation session driving the events.*/
    var addInitSteps = function (eventStream, opSession)
    {
        eventStream.addStep({
            name: "onInitialize",
            key: _settings.eventNamePrefix + ".oninit",
            type: EVUI.Modules.EventStream.EventStreamStepType.Event,
            handler: function (eventArgs)
            {
                opSession.currentAction = EVUI.Modules.Panes.PaneAction.Show;

                if (EVUI.Modules.Core.Utils.hasFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Initialized) === true) return;
                if (typeof opSession.entry.link.pane.onInitialize === "function")
                {
                    return opSession.entry.link.pane.onInitialize.call(this, eventArgs);
                }
            }
        });

        eventStream.addStep({
            name: "onInitialize",
            key: _settings.eventNamePrefix + ".oninit",
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            handler: function (eventArgs)
            {
                if (EVUI.Modules.Core.Utils.hasFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Initialized) === true) return;

                if (typeof _self.onInitialize === "function")
                {
                    return _self.onInitialize.call(_settings.manager, eventArgs);
                }
            }
        });

        eventStream.addStep({
            name: "initialize",
            key: _settings.eventNamePrefix + ".load",
            type: EVUI.Modules.EventStream.EventStreamStepType.Job,
            handler: function (jobArgs)
            {
                opSession.entry.link.paneStateFlags |= EVUI.Modules.Panes.PaneStateFlags.Initialized;
                jobArgs.resolve();
            }
        });
    };


    /**Adds the show sequence steps to the EventStream.
    @param {EVUI.Modules.EventStream.EventStream} eventStream The event stream to receive the events.
    @param {PaneOperationSession} opSession The operation session driving the events.*/
    var addShowSteps = function (eventStream, opSession)
    {
        eventStream.addStep({
            name: "onShow",
            key: _settings.eventNamePrefix + ".onshow",
            type: EVUI.Modules.EventStream.EventStreamStepType.Event,
            handler: function (eventArgs)
            {
                opSession.currentAction = EVUI.Modules.Panes.PaneAction.Show;
                
                if (typeof opSession.entry.link.pane.onShow === "function")
                {
                    return opSession.entry.link.pane.onShow.call(this, eventArgs)
                }
            }
        });

        eventStream.addStep({
            name: "onShow",
            key: _settings.eventNamePrefix + ".onshow",
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            handler: function (eventArgs)
            {
                if (typeof _self.onShow === "function")
                {
                    return _self.onShow.call(_settings.manager, eventArgs)
                }
            }
        });

        addPositionSteps(eventStream, opSession);

        eventStream.addStep({
            name: "onShown",
            key: _settings.eventNamePrefix + ".onshown",
            type: EVUI.Modules.EventStream.EventStreamStepType.Event,
            handler: function (eventArgs)
            {
                if (typeof opSession.entry.link.pane.onShown === "function")
                {
                    return opSession.entry.link.pane.onShown.call(this, eventArgs)
                }
            }
        });

        eventStream.addStep({
            name: "onShown",
            key: _settings.eventNamePrefix + ".onshown",
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            handler: function (eventArgs)
            {
                if (typeof _self.onShown === "function")
                {
                    return _self.onShown.call(_settings.manager, eventArgs)
                }
            }
        });
    };


    /**Adds the hide sequence steps to the EventStream.
    @param {EVUI.Modules.EventStream.EventStream} eventStream The event stream to receive the events.
    @param {PaneOperationSession} opSession The operation session driving the events.*/
    var addHideSteps = function (eventStream, opSession)
    {
        var skip = false;

        eventStream.addStep({
            name: "onHide",
            key: _settings.eventNamePrefix + ".onHide",
            type: EVUI.Modules.EventStream.EventStreamStepType.Event,
            handler: function (eventArgs)
            {
                opSession.currentAction = EVUI.Modules.Panes.PaneAction.Hide;
                if (EVUI.Modules.Core.Utils.hasFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Visible) === false)
                {
                    skip = true;
                    return;
                }

                if (typeof opSession.entry.link.pane.onHide === "function")
                {
                    return opSession.entry.link.pane.onHide.call(this, eventArgs)
                }
            }
        });

        eventStream.addStep({
            name: "onHide",
            key: _settings.eventNamePrefix + ".onHide",
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            handler: function (eventArgs)
            {
                if (EVUI.Modules.Core.Utils.hasFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Visible) === false) return;

                if (typeof _self.onHide === "function")
                {
                    return _self.onHide.call(_settings.manager, eventArgs);
                }
            }
        });

        eventStream.addStep({
            name: "hide",
            key: _settings.eventNamePrefix + "hide",
            type: EVUI.Modules.EventStream.EventStreamStepType.Job,
            handler: function (jobArgs)
            {
                if (EVUI.Modules.Core.Utils.hasFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Visible) === false) return jobArgs.resolve();

                var rootHidden = false;
                var transitionApplied = false;
                var commonCallback = function ()
                {
                    if (rootHidden === false || transitionApplied === false) return;

                    opSession.entry.link.paneStateFlags = EVUI.Modules.Core.Utils.removeFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Visible);
                    opSession.entry.link.paneStateFlags = EVUI.Modules.Core.Utils.removeFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Positioned);
                    jobArgs.resolve();
                }

                hideRootElement(opSession.entry, opSession.entry.link.lastShowSettings, opSession.hideArgs.paneHideTransition, function ()
                {
                    rootHidden = true;
                    commonCallback();
                });

                hideBackdrop(opSession.entry, function (success)
                {
                    transitionApplied = true;
                    commonCallback();
                });
            }
        });

        eventStream.addStep({
            name: "ohHidden",
            key: _settings.eventNamePrefix + ".onhidden",
            type: EVUI.Modules.EventStream.EventStreamStepType.Event,
            handler: function (eventArgs)
            {
                if (skip === true) return;

                if (typeof opSession.entry.link.pane.onHidden === "function")
                {
                    return opSession.entry.link.pane.onHidden.call(this, eventArgs)
                }
            }
        });

        eventStream.addStep({
            name: "ohHidden",
            key: _settings.eventNamePrefix + ".onhidden",
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            handler: function (eventArgs)
            {
                if (skip === true) return;

                if (typeof _self.onShown === "function")
                {
                    return _self.onShown.call(_settings.manager, eventArgs)
                }
            }
        });
    };


    /**Adds the positioning sequence steps to the EventStream.
    @param {EVUI.Modules.EventStream.EventStream} eventStream The event stream to receive the events.
    @param {PaneOperationSession} opSession The operation session driving the events.*/
    var addPositionSteps = function (eventStream, opSession)
    {
        var positionObserver = null;
        var showArgsObserver = null;

        eventStream.addStep({
            name: "initialPosition",
            key: _settings.eventNamePrefix + ".initialposition",
            type: EVUI.Modules.EventStream.EventStreamStepType.Job,
            handler: function (jobArgs)
            {
                opSession.action = EVUI.Modules.Panes.PaneAction.Show;
                var position = getPosition(opSession.entry, opSession.showArgs.showSettings);
                opSession.entry.link.lastCalculatedPosition = position;

                positionObserver = new EVUI.Modules.Observers.ObjectObserver(position);
                showArgsObserver = new EVUI.Modules.Observers.ObjectObserver(opSession.showArgs);

                jobArgs.resolve();
            }
        });

        eventStream.addStep({
            name: "onPosition",
            key: _settings.eventNamePrefix + ".onposition",
            type: EVUI.Modules.EventStream.EventStreamStepType.Event,
            handler: function (eventArgs)
            {
                if (typeof opSession.entry.link.pane.onPosition === "function")
                {
                    return opSession.entry.link.pane.onPosition.call(this, eventArgs)
                }
            }
        });

        eventStream.addStep({
            name: "onPosition",
            key: _settings.eventNamePrefix + ".onposition",
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            handler: function (eventArgs)
            {
                if (typeof _self.onPosition === "function")
                {
                    return _self.onPosition.call(_settings.manager, eventArgs)
                }
            }
        });

        eventStream.addStep({
            name: "finalPosition",
            key: _settings.eventNamePrefix + ".finalposition",
            type: EVUI.Modules.EventStream.EventStreamStepType.Job,
            handler: function (jobArgs)
            {
                var positionChanges = positionObserver.getChanges();
                var settingsChanges = showArgsObserver.getChanges().filter(function (change) { return change.path.indexOf("showSettings") !== -1 });

                var transitionApplied = false;
                var positioned = false;

                var callback = function ()
                {
                    if (transitionApplied === false || positioned === false) return;

                    opSession.entry.link.paneStateFlags |= EVUI.Modules.Panes.PaneStateFlags.Positioned;
                    opSession.entry.link.paneStateFlags |= EVUI.Modules.Panes.PaneStateFlags.Visible;
                    opSession.entry.link.lastShowSettings = opSession.showArgs.showSettings;
                    jobArgs.resolve();
                };

                if (opSession.showArgs.showSettings.backdropSettings != null && opSession.showArgs.showSettings.backdropSettings.showBackdrop === true)
                {
                    EVUI.Modules.Panes.Constants.GlobalZIndex++;
                    opSession.entry.link.lastCalculatedPosition.zIndex = EVUI.Modules.Panes.Constants.GlobalZIndex;

                     _settings.backdropManager.showBackdrop(opSession.entry.link.paneCSSName, opSession.entry.link.lastCalculatedPosition.zIndex -1 , opSession.showArgs.showSettings.backdropSettings, function ()
                    {
                        transitionApplied = true;
                        callback();
                    });
                }
                else
                {
                    transitionApplied = true;
                    callback();
                }

                if (positionChanges.length === 0 && settingsChanges.length === 0)
                {
                    positionPane(opSession.entry, opSession.showArgs.showSettings, opSession.entry.link.lastCalculatedPosition, function (success)
                    {
                        positioned = true;
                        callback();
                    });
                }
                else if (positionChanges.length > 0)
                {
                    positionPane(opSession.entry, opSession.showArgs.showSettings, opSession.entry.link.lastCalculatedPosition, function (success)
                    {
                        positioned = true;
                        callback();
                    });
                }
                else
                {
                    positionPane(opSession.entry, opSession.showArgs.showSettings, null, function (success)
                    {
                        positioned = true;
                        callback();
                    });
                }
            }
        });
    };

    /**Adds the final, onComplete step to the EventStream that calls all the callbacks for the operation.
    @param {EVUI.Modules.EventStream.EventStream} eventStream The event stream to receive the events.
    @param {PaneOperationSession} opSession The operation session driving the events.*/
    var addOnCompleteStep = function (eventStream, opSession)
    {
        eventStream.addStep({

            name: "OnComplete",
            key: _settings.eventNamePrefix + ".oncomplete",
            type: EVUI.Modules.EventStream.EventStreamStepType.Job,
            handler: function (args)
            {
                var success = true;
                if (opSession.action === EVUI.Modules.Panes.PaneAction.Hide && EVUI.Modules.Core.Utils.hasFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Visible) === true) success = false;
                if (opSession.action === EVUI.Modules.Panes.PaneAction.Load && EVUI.Modules.Core.Utils.hasFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Loaded) === false) success = false;
                if (opSession.action === EVUI.Modules.Panes.PaneAction.Show && EVUI.Modules.Core.Utils.hasFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Visible) === false) success = false;
                if (opSession.action === EVUI.Modules.Panes.PaneAction.Unload && EVUI.Modules.Core.Utils.hasFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Loaded) === true) success = false;

                callCallbackStack(opSession.entry.link, opSession.action, success, function ()
                {
                    if (opSession.unloadArgs != null && opSession.unloadArgs.remove === true) _self.removePane(opSession.entry.paneID);
                    opSession.entry.link.paneAction = EVUI.Modules.Panes.PaneAction.None;
                    opSession.entry.link.lastCalculatedPosition = null;
                    args.resolve();
                });
            }
        });
    };

    /**Adds the unload sequence steps to the EventStream.
    @param {EVUI.Modules.EventStream.EventStream} eventStream The event stream to receive the events.
    @param {PaneOperationSession} opSession The operation session driving the events.*/
    var addUnloadSteps = function (eventStream, opSession)
    {
        var skip = false;

        eventStream.addStep({
            name: "onUnload",
            key: _settings.eventNamePrefix + ".onunload",
            type: EVUI.Modules.EventStream.EventStreamStepType.Event,
            handler: function (eventArgs)
            {
                var priorAction = opSession.action;
                opSession.currentAction = EVUI.Modules.Panes.PaneAction.Unload;
                if (EVUI.Modules.Core.Utils.hasFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Loaded) === false)
                {
                    skip = true;
                    return;
                }

                if (opSession.entry.link.pane.unloadOnHide === false && priorAction === ActionSequence.Hide)
                {
                    skip = true;
                    return;
                }

                if (typeof opSession.entry.link.pane.onUnload === "function")
                {
                    return opSession.entry.link.pane.onUnload.call(this, eventArgs)
                }
            }
        });

        eventStream.addStep({
            name: "onUnload",
            key: _settings.eventNamePrefix + ".onunload",
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            handler: function (eventArgs)
            {
                if (skip === true || EVUI.Modules.Core.Utils.hasFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Loaded) === false) return;

                if (typeof _self.onUnload === "function")
                {
                    return _self.onUnload.call(_settings.manager, eventArgs);
                }
            }
        });

        eventStream.addStep({
            name: "unload",
            key: _settings.eventNamePrefix + ".unload",
            type: EVUI.Modules.EventStream.EventStreamStepType.Job,
            handler: function (jobArgs)
            {
                if (skip === true) return jobArgs.resolve();

                try
                {
                    opSession.entry.link.paneStateFlags = EVUI.Modules.Core.Utils.removeFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Loaded);
                    unloadRootElement(opSession.entry, opSession.entry.link.lastShowSettings);                    
                }
                catch (ex)
                {
                    opSession.entry.link.paneStateFlags = EVUI.Modules.Core.Utils.addFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Loaded);
                }

                opSession.entry.link.paneStateFlags = EVUI.Modules.Core.Utils.removeFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Initialized);
                jobArgs.resolve();
            }
        });

        eventStream.addStep({
            name: "onUnloaded",
            key: _settings.eventNamePrefix + ".onunloaded",
            type: EVUI.Modules.EventStream.EventStreamStepType.Event,
            handler: function (eventArgs)
            {
                if (skip === true) return;

                if (typeof opSession.entry.link.pane.onUnloaded === "function")
                {
                    return opSession.entry.link.pane.onUnloaded.call(this, eventArgs)
                }
            }
        });

        eventStream.addStep({
            name: "onUnloaded",
            key: _settings.eventNamePrefix + ".onUnloaded",
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            handler: function (eventArgs)
            {
                if (skip === true) return;

                if (typeof _self.onUnloaded === "function")
                {
                    return _self.onUnloaded.call(_settings.manager, eventArgs)
                }
            }
        });
    };

    /**Validates the action sequence by checking the current operation and modifying the action sequence to do the appropriate thing.
    @param {String[]} actionSequence The pre-generated action sequence of proposed events to occur.
    @param {PaneOperationSession} opSession Metadata about the operation in progress.
    @returns {String[]}*/
    var validateActionSequence = function (actionSequence, opSession)
    {
        var opAction = opSession.action;
        var currentAction = opSession.entry.link.paneAction;

        if (opAction === EVUI.Modules.Panes.PaneAction.Load)
        {
            if (opSession.loadArgs.reload === true)
            {
                return actionSequence;
            }
            else
            {
                if (currentAction === EVUI.Modules.Panes.PaneAction.Show)
                {
                    return [ActionSequence.Continue];
                }
                else if (currentAction === EVUI.Modules.Panes.PaneAction.Load)
                {
                    return [ActionSequence.Queue];
                }
                else if (currentAction === EVUI.Modules.Panes.PaneAction.Hide
                    || currentAction === EVUI.Modules.Panes.PaneAction.Unload
                    || currentAction === EVUI.Modules.Panes.PaneAction.None)
                {
                    return actionSequence;
                }
                else
                {
                    throw Error("Invalid action: \"" + currentAction);
                }
            }
        }
        else if (opAction === EVUI.Modules.Panes.PaneAction.Show)
        {
            if (currentAction === EVUI.Modules.Panes.PaneAction.Load)
            {
                return actionSequence;
            }
            else if (currentAction === opAction)
            {
                return [ActionSequence.Queue];
            }
            else
            {
                return actionSequence;
            }
        }
        else
        {
            if (currentAction === opAction)
            {
                return [ActionSequence.Queue];
            }
            else
            {
                return actionSequence;
            }
        }
    };

    /**Gets the sequence of actions to perform based on the operation's metadata and the current state of the pane.
    @param {PaneOperationSession} opSession Metadata about the operation in progress.
    @returns {String[]} */
    var getActionSequence = function (opSession)
    {
        var sequence = [];

        if (opSession.action === EVUI.Modules.Panes.PaneAction.Show)
        {
            sequence = getShowSequence(opSession);
        }
        else if (opSession.action === EVUI.Modules.Panes.PaneAction.Load)
        {
            sequence = getLoadSequence(opSession);
        }
        else if (opSession.action === EVUI.Modules.Panes.PaneAction.Hide)
        {
            sequence = getHideSequence(opSession);
        }
        else if (opSession.action === EVUI.Modules.Panes.PaneAction.Unload)
        {
            sequence = getUnloadSequence(opSession);
        }

        return sequence;
    };

    /**Gets the sequence of events that should occur when issued a show command.
    @param {PaneOperationSession} opSession Metadata about the operation in progress.
    @returns {String[]}*/
    var getShowSequence = function (opSession)
    {
        //showing always starts with loading
        var sequence = getLoadSequence(opSession);
        var shouldCancel = sequence.indexOf(ActionSequence.CancelCurrent) !== -1;

        if (shouldCancel === false && (opSession.entry.link.paneAction === EVUI.Modules.Panes.PaneAction.Hide || opSession.entry.link.paneAction === EVUI.Modules.Panes.PaneAction.Unload)) //if we're doing the opposite of show, stop the operation
        {
            sequence.push(ActionSequence.CancelCurrent);
        }

        if (EVUI.Modules.Core.Utils.hasFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Initialized) === false || opSession.showArgs.reInitialize === true) //whether or not the init function has been called - only called on the first show after it has been loaded. 
        {
            sequence.push(ActionSequence.Initialize);
        }

        sequence.push(ActionSequence.Show); //show includes position

        return sequence;
    };

    /**Gets the sequence of events that should occur when issued a load command.
    @param {PaneOperationSession} opSession Metadata about the operation in progress.
    @returns {String[]}*/
    var getLoadSequence = function (opSession)
    {
        var sequence = [];

        if (EVUI.Modules.Core.Utils.hasFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Loaded) === true) //if we're already loaded
        {
            if (opSession.loadArgs.reload === true) //forcing a reload
            {
                if (opSession.entry.link.paneAction !== EVUI.Modules.Panes.PaneAction.None) //if we were doing anything, we need to cancel it and begin the load again (even another load operation)
                {
                    sequence.push(ActionSequence.CancelCurrent);
                }

                sequence.push(ActionSequence.Load);
                return sequence;
            }
        }
        else //not loaded yet
        {
            if (opSession.entry.link.paneAction !== EVUI.Modules.Panes.PaneAction.None && opSession.entry.link.paneAction !== EVUI.Modules.Panes.PaneAction.Load) //if we were doing anything (other than another load operation), we need to cancel it  
            {
                sequence.push(ActionSequence.CancelCurrent);
            }

            if (opSession.entry.link.paneAction !== EVUI.Modules.Panes.PaneAction.Load) //if we're not doing a load operation, add the load step
            {
                //add the load step
                sequence.push(ActionSequence.Load);
            }
        }

        return sequence;
    };

    /**Gets the sequence of events that should occur when issued a hide command.
    @param {PaneOperationSession} opSession Metadata about the operation in progress.
    @returns {String[]}*/
    var getHideSequence = function (opSession)
    {
        var sequence = [];

        if (opSession.entry.link.paneAction === EVUI.Modules.Panes.PaneAction.Load || opSession.entry.link.paneAction === EVUI.Modules.Panes.PaneAction.Show || opSession.entry.link.paneAction === EVUI.Modules.Panes.PaneAction.Unload) //if it's being loaded or shown (which also loads it), cancel that operation
        {
            sequence.push(ActionSequence.CancelCurrent);
        }

        if (opSession.entry.link.paneAction === EVUI.Modules.Panes.PaneAction.Hide) return sequence;

        sequence.push(ActionSequence.Hide);
        if (EVUI.Modules.Core.Utils.hasFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Loaded) === true) sequence.push(ActionSequence.Unload); //unload on hide is a setting that could change over the course of hide, so we always queue those events when hiding.

        return sequence;
    };

    /**Gets the sequence of events that should occur when issued a show command.
    @param {PaneOperationSession} opSession Metadata about the operation in progress.
    @returns {String[]}*/
    var getUnloadSequence = function (opSession)
    {
        var sequence = [];

        if (opSession.entry.link.paneAction === EVUI.Modules.Panes.PaneAction.Load || opSession.entry.link.paneAction === EVUI.Modules.Panes.PaneAction.Show || opSession.entry.link.paneAction === EVUI.Modules.Panes.PaneAction.Hide) //cancel if anything is happening already
        {
            sequence.push(ActionSequence.CancelCurrent);
        }

        if (EVUI.Modules.Core.Utils.hasFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Loaded) === true)
        {
            sequence.push(ActionSequence.Unload);
        }

        return sequence;
    };

    /** Gets a CallbackStack object representing all of the queued callbacks for a given pane action.
    @param {PaneLink} link The link to the pane being executed.
    @param {String} action The type of callback stack to get.
    @returns {CallbackStack}*/
    var getCallbackStack = function (link, action)
    {
        var numStacks = link.callbackStack.length;
        for (var x = 0; x < numStacks; x++)
        {
            var curStack = link.callbackStack[x];
            if (curStack.action === action) return curStack;
        }

        return null;
    };

    /**Calls a CallbackStack, and optionally any linked callback stacks, in the order that they were queued.
    @param {PaneLink} link The link to the pane being executed.
    @param {String} action The action to execute the callbacks for.
    @param {Boolean} success Whether or not the caller has determined if the operation has successfully completed.
    @param {Function} callback A callback function to call once all the other callbacks have been called.*/
    var callCallbackStack = function (link, action, success, callback)
    {
        if (typeof callback !== "function") callback = function (executed) { };

        var callbackStack = getCallbackStack(link, action); //get the callback stack we're calling
        if (callbackStack == null) return callback(false);

        var index = link.callbackStack.indexOf(callbackStack); //remove the entire thing BEFORE we execute any of them
        if (index !== -1) link.callbackStack.splice(index, 1);

        var callbacks = [];
        var allSessions = [];
        var numSession = callbackStack.opSessions.length;
        var hasLink = false;
        for (var x = 0; x < numSession; x++) //check and see if we have any linked continued steps, we need to call both lists of callbacks in one go
        {
            var curSession = callbackStack.opSessions[x];
            if (curSession.continuedTo != null) //we have a link
            {
                var linkedCallbackStack = getCallbackStack(link, curSession.continuedTo.action);
                if (linkedCallbackStack != null && hasLink === false) //we haven't already merged the two together
                {
                    hasLink = true;

                    var canceledSessions = linkedCallbackStack.opSessions.filter(function (op) { return op.canceled; }); //get all the canceled ones
                    if (canceledSessions.length === linkedCallbackStack.opSessions.length) //if they all were canceled, remove the entry from the list
                    {
                        var index = link.callbackStack.indexOf(linkedCallbackStack);
                        if (index !== -1) link.callbackStack.splice(index, 1);
                    }
                    else //otherwise keep the ones that weren't canceled in the list to be called later
                    {
                        linkedCallbackStack.opSessions = linkedCallbackStack.opSessions.filter(function (op) { return op.canceled === false; });
                    }

                    allSessions = allSessions.concat(canceledSessions); //add any sessions that were canceled.
                }
            }

            allSessions.push(curSession);
        }

        //if we have any linked sessions, we concatenated both complete sessions (so we miss no callbacks), but they will be in the wrong order. Sort them to get the true order.
        numSession = allSessions.length;
        if (hasLink === true) allSessions = allSessions.sort(function (a, b) { return a.callbackOrdinal - b.callbackOrdinal });

        for (var x = 0; x < numSession; x++)
        {
            var curSession = allSessions[x];
            if (typeof curSession.callback === "function") callbacks.push(curSession.callback);
        }

        var exeArgs = new EVUI.Modules.Core.AsyncSequenceExecutionArgs();
        exeArgs.functions = callbacks;
        exeArgs.parameter = success;
        exeArgs.forceCompletion = true;

        EVUI.Modules.Core.AsyncSequenceExecutor.execute(exeArgs, function (ex)
        {
            if (ex != null && ex.length > 0) EVUI.Modules.Core.Utils.log(ex);
            callback(true);
        });
    };

    /**************************************************************************************POSITIONING*************************************************************************************************************/

    /**Positions the pane using either a PanePosition or PaneShowSettings.
    @param {InternalPaneEntry} entry
    @param {EVUI.Modules.Panes.PaneShowSettings} showSettings Either a PaneShowSettings or a PanePosition object.
    @param {EVUI.Modules.Panes.PanePosition} position Optional. The position to place the pane at, if populated will be used instead of the showSettings for the final position of the pane.
    @param {Function} callback A callback function to call once the Pane has been positioned. */
    var positionPane = function (entry, showSettings, position, callback)
    {
        _settings.stylesheetManager.ensureSheet(_settings.cssSheetName, { lock: true });

        if (position != null && (position instanceof EVUI.Modules.Panes.PanePosition || (typeof position.top === "number" && position.left === "number" && typeof position.mode === "string")))
        {
            position = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Panes.PanePosition(position.mode), position, ["mode"]);
        }

        showSettings = (showSettings != null) ? makeOrExtendShowSettings(showSettings) : entry.link.pane.showSettings;     

        setPosition(entry, showSettings, position, callback);
    };

    /**Sets the Position of a Pane.
    @param {InternalPaneEntry} entry The entry representing the Pane to display.
    @param {EVUI.Modules.Panes.PaneShowSettings} showSettings The current settings dictating how the Pane will be positioned and displayed.
    @param {Function} callback A callback function to call once the Pane has been positioned and has had its transition effect removed (if there was one).*/
    var setPosition = function (entry, showSettings, position, callback)
    {
        if (typeof callback !== "function") callback = function () { };

        if (position == null)
        {
            entry.link.lastShowSettings = showSettings
            position = getPosition(entry, showSettings); //calculate the position 
        }

        entry.link.lastCalculatedPosition = position;

        removePaneCSS(entry); //remove the CSS from the stylesheet
        removePaneClasses(entry); //remove all the existing classes from the Pane

        if (position == null)
        {
            moveToLoadDiv(entry);
            return callback(false);
        }

        generatePaneCSS(entry, showSettings, position); //build the CSS and apply all the classes
        displayPane(entry, showSettings, position, false, function (success)
        {
            callback(success);
        });
    };

    /**Gets the position of a Pane without disturbing its current position or state.
    @param {InternalPaneEntry} entry The entry representing the Pane to get the position of.
    @param {EVUI.Modules.Panes.PaneShowSettings} showSettings The settings for how to display the Pane.
    @returns {EVUI.Modules.Panes.PanePosition}*/
    var getPosition = function (entry, showSettings)
    {
        if (entry == null || entry.link.pane.element == null) return null; //no element, no position
        if (EVUI.Modules.Core.Utils.hasFlag(entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Loaded) === false) return null; //not loaded, can't position it

        //first, remove all the classes we have added that are positioning the element
        var removedClasses = removePaneClasses(entry);

        var ele = new EVUI.Modules.Dom.DomHelper(entry.link.pane.element);
        var position = null;
        var mode = getPositionMode(showSettings);

        if (mode !== EVUI.Modules.Panes.PanePositionMode.DocumentFlow && EVUI.Modules.Core.Utils.hasFlag(entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Visible) === false) //not visible, we can't measure it right now and therefore can't place it
        {
            moveToMeasureDiv(entry); //move it to a special div where it has no height or width, but has invisible overflow. This allows us to measure the element as if it were visible without actually displaying it
            position = calculatePosition(entry, showSettings, mode);
            moveToLoadDiv(entry); //move it out of the special div and put it back in the hidden div
        }
        else //visible, we can measure it as it is.
        {
            position = calculatePosition(entry, showSettings, mode);
        }

        //add all the classes that were removed from it back to it so we complete the operation with no disturbance in the state of the pane.
        ele.addClass(removedClasses);
        return position;
    };

    /**Generates and applies the CSS required to position a Pane.
    @param {InternalPaneEntry} entry The entry representing the Pane.
    @param {EVUI.Modules.Panes.PaneShowSettings} showSettings The settings that were used to position the Pane.
    @param {EVUI.Modules.Panes.PanePosition} position The position that was calculated using the show settings.*/
    var generatePaneCSS = function (entry, showSettings, position)
    {
        var positionSelector = getSelector(entry, EVUI.Modules.Panes.Constants.CSS_Position);
        var classesToApply = position.classNames.reverse(); //we reverse them so that they appear in the right order on the element.

        if (position.mode === EVUI.Modules.Panes.PanePositionMode.AbsolutePosition ||
            position.mode === EVUI.Modules.Panes.PanePositionMode.Anchored ||
            position.mode === EVUI.Modules.Panes.PanePositionMode.RelativePosition ||
            position.mode === EVUI.Modules.Panes.PanePositionMode.Centered ||
            position.mode === EVUI.Modules.Panes.PanePositionMode.None)
        {
            var rules = {};
            rules.display = "inline-block";
            rules.position = "absolute";
            rules.top = position.top + "px";
            rules.left = position.left + "px";

            var dimensionRules = getDimensionRules(entry, showSettings, position);
            if (dimensionRules.setHeight === true) rules.height = (position.bottom - position.top) + "px";
            if (dimensionRules.setWidth === true) rules.width = (position.right - position.left) + "px";

            rules.zIndex = position.zIndex.toString();

            _settings.stylesheetManager.setRules(_settings.cssSheetName, positionSelector, rules);
        }
        else if (position.mode === EVUI.Modules.Panes.PanePositionMode.Fullscreen)
        {
            var rules = {};
            rules.display ="inline-block";
            rules.position = "fixed";
            rules.top = "0px";
            rules.left = "0px";
            rules.height = "100vh";
            rules.width = "100vw";
            rules.margin = "0px";

            var dimensionRules = getDimensionRules(entry, showSettings, position);
            if (dimensionRules.setHeight === true)
            {
                rules.top = position.top + "px";
                rules.height = (position.bottom - position.top) + "px";
            }

            if (dimensionRules.setWidth === true)
            {
                rules.left = position.left + "px";
                rules.width = (position.right - position.left) + "px";
            }

            _settings.stylesheetManager.setRules(_settings.cssSheetName, positionSelector, rules);
        }
        else if (position.mode === EVUI.Modules.Panes.PanePositionMode.PositionClass)
        {
            var rules = null;

            var dimensionRules = getDimensionRules(entry, showSettings, position);
            if (dimensionRules.setHeight === true)
            {
                rules = {};
                rules.top = position.top + "px";
                rules.position = "absolute";
                rules.height = (position.bottom - position.top) + "px";
            }

            if (dimensionRules.setWidth === true)
            {
                if (rules == null) rules = {};
                rules.left = position.left + "px";
                rules.position = "absolute";
                rules.width = (position.right - position.left) + "px";
            }

            if (dimensionRules.setHeight === true || dimensionRules.setWidth === true)
            {
                _settings.stylesheetManager.setRules(_settings.cssSheetName, positionSelector, rules);
            }
        }

        var eh = new EVUI.Modules.Dom.DomHelper(entry.link.pane.element); //add all the classes
        eh.addClass(classesToApply);
    };

    /**Gets the rules for whether or not the height or width of a Pane should be explicitly set or not.
    @param {InternalPaneEntry} entry The entry whose height and width may be set.
    @param {EVUI.Modules.Panes.PaneShowSettings} showSettings The current show settings used to calculate the position.
    @param {EVUI.Modules.Panes.PanePosition} position The position that was calculated based on the showSettings.
    @returns {{setHeight:Number, setWidth:Number}} */
    var getDimensionRules = function (entry, showSettings, position)
    {
        var setDims = { setHeight: false, setWidth: false };

        if (showSettings.setExplicitDimensions === true) //if the setting for setting the dimensions explicitly is set, set the dimensions.
        {
            setDims.setHeight = true;
            setDims.setWidth = true;

            return setDims;
        }

        //if the pane has been clipped in either direction, we need to explicitly set whichever dimension was clipped.
        if (position.classNames.indexOf(EVUI.Modules.Panes.Constants.CSS_ClippedX) !== -1) setDims.setWidth = true;
        if (position.classNames.indexOf(EVUI.Modules.Panes.Constants.CSS_ClippedY) !== -1) setDims.setHeight = true;

        //if the pane was anchored and one of its alignments is elastic, or if it is bound between two opposite sides, we need to set the height or width explicitly
        if (position.mode === EVUI.Modules.Panes.PanePositionMode.Anchored)
        {
            if (showSettings.anchors.alignX === EVUI.Modules.Panes.AnchorAlignment.Elastic) setDims.setWidth = true;
            if (showSettings.anchors.alignY === EVUI.Modules.Panes.AnchorAlignment.Elastic) setDims.setHeight = true;
            if (showSettings.anchors.left != null && showSettings.anchors.right != null) setDims.setWidth = true;
            if (showSettings.anchors.top != null && showSettings.anchors.bottom != null) setDims.setHeight = true;
        }

        return setDims;
    };

    /**Removes all the CSS rules from the managed sheet that pertain to a particular Pane.
    @param {InternalPaneEntry} entry The entry representing the Pane to remove the CSS of.*/
    var removePaneCSS = function (entry)
    {
        var allClasses = getAllClassNames();
        var numClasses = allClasses.length;

        for (var x = 0; x < numClasses; x++)
        {
            var selector = getSelector(entry, allClasses[x]);
            if (selector == null) continue;

            _settings.stylesheetManager.removeRules(_settings.cssSheetName, selector);
        }
    };

    /**Removes all the auto-generated CSS classes from the Pane without removing the rules from the sheet.
    @param {InternalPaneEntry} entry The entry representing the BantmWindo to remove the classes from.*/
    var removePaneClasses = function (entry)
    {
        var allClasses = getAllClassNames();
        var numClasses = allClasses.length;
        var existingClasses = [];

        var eh = new EVUI.Modules.Dom.DomHelper(entry.link.pane.element);
        for (var x = 0; x < numClasses; x++)
        {
            var curClass = allClasses[x];
            if (eh.hasClass(curClass) === true)
            {
                existingClasses.push(curClass);
                eh.removeClass(curClass);
            }
        }

        return existingClasses;
    };

    /**Gets a selector based on the Pane's class name and an array of classes to join into a single selector.
    @param {InternalPaneEntry} entry The entry of the pane getting the selector for.
    @param {String|String[]} classNames Either a string class name or an array of class names to append to the pane's class name.
    @returns {String} */
    var getSelector = function (entry, classNames)
    {
        if (classNames == null || entry == null) return null;
        if (EVUI.Modules.Core.Utils.isArray(classNames) === false) classNames = [classNames];

        var classesAdded = false;
        var selector = "." + entry.link.paneCSSName;
        var numSelectors = classNames.length;
        for (var x = 0; x < numSelectors; x++)
        {
            var curClass = classNames[x];
            if (typeof curClass !== "string") continue;

            selector += "." + curClass.trim();
            classesAdded = true;
        }

        if (classesAdded === false) return null;
        return selector;
    };

    /**Gets all the possible classes that could have been appended to the Pane's root element.
    @returns {String[]}*/
    var getAllClassNames = function ()
    {
        var allBaseClasses =
            [EVUI.Modules.Panes.Constants.CSS_Position,
            EVUI.Modules.Panes.Constants.CSS_ScrollX,
            EVUI.Modules.Panes.Constants.CSS_ScrollY,
            EVUI.Modules.Panes.Constants.CSS_ClippedX,
            EVUI.Modules.Panes.Constants.CSS_ClippedY,
            EVUI.Modules.Panes.Constants.CSS_Flipped,
            EVUI.Modules.Panes.Constants.CSS_Transition_Show,
            EVUI.Modules.Panes.Constants.CSS_Transition_Hide,
            EVUI.Modules.Panes.Constants.CSS_Transition_Adjust,
            EVUI.Modules.Panes.Constants.CSS_Resized,
            EVUI.Modules.Panes.Constants.CSS_Moved];

        var additionalClasses = _settings.getAdditionalClassNames();
        if (EVUI.Modules.Core.Utils.isArray(additionalClasses) === true) return allBaseClasses.concat(additionalClasses);
        return allBaseClasses;
    };

    /**Performs the final step in displaying a Pane by applying the show transition or by setting the display property of the root element of the BantPane to any visible mode.
    @param {InternalPaneEntry} entry The entry representing the Pane being shown.
    @param {EVUI.Modules.Panes.PaneShowSettings} showSettings The settings used to display the Pane.
    @param {EVUI.Modules.Panes.PanePosition} position The calculated position of the Pane using the showSettings.
    @param {Function} callback A callback function to call once the Pane positioning is complete.*/
    var displayPane = function (entry, showSettings, position, adjusting, callback)
    {
        if (typeof callback !== "function") callback = function () { };
        if (position.mode === EVUI.Modules.Panes.PanePositionMode.DocumentFlow) //if the pane is in the document flow, just position it
        {
            insertIntoDocumentFlow(entry, showSettings, position);
        }
        else //otherwise put it in the placement div where it will become visible.
        {
            moveToPlacementDiv(entry);
        }

        var selector = null;
        var transition = null;
        if (adjusting === true)
        {
            if (showSettings.reclacSettings != null && showSettings.reclacSettings.recalcTransition != null) transition = showSettings.reclacSettings.recalcTransition
            selector = EVUI.Modules.Panes.Constants.CSS_Transition_Adjust;
        }
        else
        {
            if (showSettings.showTransition != null) transition = showSettings.showTransition;
            selector = EVUI.Modules.Panes.Constants.CSS_Transition_Show;
        }

        var element = new EVUI.Modules.Dom.DomHelper(entry.link.pane.element);
        hookUpEvents(entry);

        applyTransition(entry, transition, selector, element, function (transitionApplied)
        {
            if (transitionApplied === false)
            {
                element.show();
            }

            callback(true);
        });
    };

    /**Inserts a Pane into the DOM in the position specified by the show settings. If it is already in the correct position nothing is done.
    @param {InternalPaneEntry} entry The entry representing the Pane being shown.
    @param {EVUI.Modules.Panes.PaneShowSettings} showSettings The settings used to display the Pane.
    @param {EVUI.Modules.Panes.PanePosition} position The calculated position of the Pane using the showSettings.*/
    var insertIntoDocumentFlow = function (entry, showSettings, position)
    {
        var ele = entry.link.pane.element;
        var relativeElement = new EVUI.Modules.Dom.DomHelper(showSettings.documentFlow.relativeElement);
        if (showSettings.documentFlow.mode === EVUI.Modules.Panes.PaneDocumentFlowMode.Current) return;

        if (showSettings.documentFlow.mode === EVUI.Modules.Panes.PaneDocumentFlowMode.After)
        {
            if (ele.previousSibling !== relativeElement.elements[0])
            {
                ele.remove();
                relativeElement.insertAfter(ele);
            }
        }
        else if (showSettings.documentFlow.mode === EVUI.Modules.Panes.PaneDocumentFlowMode.Append)
        {
            if (ele.parentNode !== relativeElement.elements[0])
            {
                ele.remove();
                relativeElement.append(ele);
            }
        }
        else if (showSettings.documentFlow.mode === EVUI.Modules.Panes.PaneDocumentFlowMode.Before)
        {
            if (ele.nextSibling !== relativeElement.elements[0])
            {
                ele.remove();
                relativeElement.insertAfter(ele);
            }
        }
        else if (showSettings.documentFlow.mode === EVUI.Modules.Panes.PaneDocumentFlowMode.Prepend)
        {
            if (ele.parentNode !== relativeElement.elements[0])
            {
                ele.remove();
                relativeElement.prepend(ele);
            }
        }
        else 
        {
            if (ele.parentNode !== relativeElement.elements[0])
            {
                ele.remove();
                relativeElement.append(ele);
            }
        }
    };

    /**Moves a Pane into the special invisible div with visible overflow that is used to display the pane with absolute coordinates.
    @param {InternalPaneEntry} entry The entry representing the pane to be displayed.*/
    var moveToPlacementDiv = function (entry)
    {
        ensurePlacehmentDiv(); //make sure the placement div is there

        if (entry.link.pane.element != null)
        {
            if (entry.link.pane.element.parentNode !== _settings.placementDiv)
            {
                entry.link.pane.element.remove();
                _settings.placementDiv.appendChild(entry.link.pane.element);
            }
        }
    };

    /**Moves a Pane into a special invisible div with invisible overflow so it can be measured without being seen.
    @param {InternalPaneEntry} entry The entry representing the pane to be measured.*/
    var moveToMeasureDiv = function (entry)
    {
        ensureMeasureDiv();

        if (entry.link.pane.element != null)
        {
            if (entry.link.pane.element.parentNode !==  _settings.measureDiv)
            {
                entry.link.pane.element.remove();
                 _settings.measureDiv.appendChild(entry.link.pane.element);
            }
        }
    };

    /**Moves a Pane into the loading div where panes that are not part of the document flow sit after they are loaded and when they are not displayed.
    @param {InternalPaneEntry} entry The entry representing the pane to put into the loaded div.*/
    var moveToLoadDiv = function (entry)
    {
        ensureLoadDiv();

        if (entry.link.pane.element != null)
        {
            entry.link.pane.element.remove();
            _settings.loadDiv.appendChild(entry.link.pane.element);
        }
    };

    /**Ensures that the div used for positioning the Pane is present in the DOM with the correct in-line style properties to work correctly.*/
    var ensurePlacehmentDiv = function ()
    {
        if (_settings.placementDiv == null)
        {
            _settings.placementDiv = document.createElement("div");
            document.body.appendChild(_settings.placementDiv);
        }
        else
        {
            if (_settings.placementDiv.isConnected == false)
            {
                if (_settings.placementDiv.parentElement != null) _settings.placementDiv.remove();
                document.body.appendChild( _settings.measureDiv)
            }
        }

        _settings.placementDiv.style.height = "0px";
        _settings.placementDiv.style.width = "0px";
        _settings.placementDiv.style.overflow = "visible";
        _settings.placementDiv.style.display = "block";
    };

    /**Ensures that the div used to keep Panes when they are not being measured or displayed is present in the DOM. */
    var ensureLoadDiv = function ()
    {
        if (_settings.loadDiv == null)
        {
            _settings.loadDiv = document.createElement("div");
            document.body.appendChild(_settings.loadDiv);
        }
        else
        {
            if (_settings.loadDiv.isConnected == false)
            {
                if (_settings.loadDiv.parentElement != null) _settings.loadDiv.remove();
                document.body.appendChild(_settings.loadDiv);
            }
        }

        _settings.loadDiv.style.display = "none";
    };

    /**Ensures that the div used to measure the Pane so it can be positioned correctly is in the DOM and has the correct in-line styling.*/
    var ensureMeasureDiv = function ()
    {
        if ( _settings.measureDiv == null)
        {
             _settings.measureDiv = document.createElement("div");
            document.body.appendChild( _settings.measureDiv);
        }
        else
        {
            if ( _settings.measureDiv.isConnected == false)
            {
                if ( _settings.measureDiv.parentElement != null)  _settings.measureDiv.remove();
                document.body.appendChild( _settings.measureDiv)
            }
        }

         _settings.measureDiv.style.height = "0px";
         _settings.measureDiv.style.width = "0px";
         _settings.measureDiv.style.overflow = "hidden"; //this is the magic that makes it all work, hidden overflow is still able to be measured.
         _settings.measureDiv.style.display = "inline-block";
    };

    /**Entry point to the position calculating logic.
     @param {InternalPaneEntry} entry The Pane being positioned.
     @param {EVUI.Modules.Panes.PaneShowSettings} showSettings The settings being used to position the Pane.
     @param {String} mode A value from the EVUI.Modules.Pane.PanePositionMode enum indicating which method to use to calculate the position of the Pane.
     @returns {EVUI.Modules.Panes.PanePosition}*/
    var calculatePosition = function (entry, showSettings, mode)
    {
        if (entry.link.pane.element == null) throw Error("Cannot calculate position of a Pane without an element.");
        if (entry.link.pane.element.isConnected === false) throw Error("Cannot calculate position of a Pane that is not yet part of the DOM.");

        //make a copy of the show settings to manipulate so we don't disturb the original state of the settings
        showSettings = makeOrExtendShowSettings(showSettings);

        var position = new EVUI.Modules.Panes.PanePosition(mode);
        var ele = new EVUI.Modules.Dom.DomHelper(entry.link.pane.element);


        //get the position of the pane based on the detected display mode
        if (mode === EVUI.Modules.Panes.PanePositionMode.AbsolutePosition)
        {
            position = getAbsolutePosition(entry, ele, showSettings.absolutePosition);
        }
        else if (mode === EVUI.Modules.Panes.PanePositionMode.Anchored)
        {
            position = getAnchoredPosition(entry, ele, showSettings.anchors);
        }
        else if (mode === EVUI.Modules.Panes.PanePositionMode.RelativePosition)
        {
            position = getRelativePosition(entry, ele, showSettings.relativePosition);
        }
        else if (mode === EVUI.Modules.Panes.PanePositionMode.Fullscreen)
        {
            position = getFullscreenPosition();
        }
        else if (mode === EVUI.Modules.Panes.PanePositionMode.PositionClass)
        {
            position = getAddClassPosition(showSettings, ele);
        }
        else if (mode === EVUI.Modules.Panes.PanePositionMode.Centered)
        {
            position = getCenteredPosition(ele);
        }
        else if (mode === EVUI.Modules.Panes.PanePositionMode.DocumentFlow)
        {
            return position;
        }

        //after getting the position, apply the clipping settings to the pane.
        position = applyClipSettings(entry, position, showSettings.clipSettings, showSettings);
        if (position == null) return null;

        position.classNames.push(EVUI.Modules.Panes.Constants.CSS_Position);
        position.classNames.push(entry.link.paneCSSName);

        position.zIndex = getNextZIndex();
        EVUI.Modules.Panes.Constants.GlobalZIndex = position.zIndex;

        return position;
    };

    /**Gets the next highest z-index so that the newly placed Pane appears on top of all the others.
    @returns {Number}*/
    var getNextZIndex = function ()
    {
        var highestZIndex = EVUI.Modules.Panes.Constants.GlobalZIndex;

        var numEntries = _entries.length;
        for (var x = 0; x < numEntries; x++)
        {
            var curEntry = _entries[x];
            var curZIndex = curEntry.link.pane.currentZIndex;

            if (curZIndex > highestZIndex) highestZIndex = curZIndex;
        }

        return highestZIndex + 1;
    };

    /**Generates PanePosition based off of a PaneAbsolutePosition argument.
    @param {InternalPaneEntry} entry The pane being positioned.
    @param {EVUI.Modules.Dom.DomHelper} elementHelper The pane's root element.
    @param {EVUI.Modules.Panes.PaneAbsolutePosition} absolutePosition The absolute position of the Pane.
    @returns {EVUI.Modules.Panes.PanePosition} */
    var getAbsolutePosition = function (entry, elementHelper, absolutePosition)
    {
        var offset = elementHelper.offset();
        var position = new EVUI.Modules.Panes.PanePosition(EVUI.Modules.Panes.PanePositionMode.AbsolutePosition);

        position.left = absolutePosition.left;
        position.top = absolutePosition.top;
        position.bottom = (offset.bottom - offset.top) + position.top;
        position.right = (offset.right - offset.left) + position.left;

        return position;
    };

    /**Gets the position of the Pane when it is anchored to one or more elements.
    @param {InternalPaneEntry} entry The pane being positioned.
    @param {EVUI.Modules.Dom.DomHelper} elementHelper The root element of the pane.
    @param {EVUI.Modules.Panes.PaneAnchors} anchorSettings The instructions on how to anchor the pane to another set of elements.
    @returns {EVUI.Modules.Panes.PanePosition} */
    var getAnchoredPosition = function (entry, elementHelper, anchorSettings)
    {
        var position = new EVUI.Modules.Panes.PanePosition(EVUI.Modules.Panes.PanePositionMode.Anchored);

        var currentBounds = elementHelper.offset();
        var height = currentBounds.bottom - currentBounds.top;
        var width = currentBounds.right - currentBounds.left;

        var alignX = getAnchorAlignment(anchorSettings.alignX, "x");
        var alignY = getAnchorAlignment(anchorSettings.alignY, "y");

        var upperBounds = null;
        if (anchorSettings.top != null)
        {
            var ele = new EVUI.Modules.Dom.DomHelper(anchorSettings.top);
            if (ele.elements.length > 0 && (ele.elements[0].isConnected === true || ele.elements[0] === window))
            {
                upperBounds = ele.offset();
                if (ele.elements[0] === window || ele.elements[0] === document) //if we're anchoring to the pane, we make it have zero height so the normal positioning logic still applies correctly
                {
                    upperBounds.bottom = upperBounds.top;
                }
            }
        }

        var lowerBounds = null;
        if (anchorSettings.bottom != null)
        {
            var ele = new EVUI.Modules.Dom.DomHelper(anchorSettings.bottom);
            if (ele.elements.length > 0 && (ele.elements[0].isConnected === true || ele.elements[0] === window))
            {
                lowerBounds = ele.offset();
                if (ele.elements[0] === window || ele.elements[0] === document) //if we're anchoring to the pane, we make it have zero height so the normal positioning logic still applies correctly
                {
                    upperBounds.top = upperBounds.bottom;
                }
            }
        }

        var leftBounds = null;
        if (anchorSettings.left != null)
        {
            var ele = new EVUI.Modules.Dom.DomHelper(anchorSettings.left);
            if (ele.elements.length > 0 && (ele.elements[0].isConnected === true || ele.elements[0] === window))
            {
                leftBounds = ele.offset();
                if (ele.elements[0] === window || ele.elements[0] === document) //if we're anchoring to the pane, we make it have zero width so the normal positioning logic still applies correctly
                {
                    upperBounds.right = upperBounds.left;
                }
            }
        }

        var rightBounds = null;
        if (anchorSettings.right != null)
        {
            var ele = new EVUI.Modules.Dom.DomHelper(anchorSettings.right);
            if (ele.elements.length > 0 && (ele.elements[0].isConnected === true || ele.elements[0] === window))
            {
                rightBounds = ele.offset();
                if (ele.elements[0] === window || ele.elements[0] === document) //if we're anchoring to the pane, we make it have zero width so the normal positioning logic still applies correctly
                {
                    upperBounds.left = upperBounds.right;
                }
            }
        }

        if (upperBounds != null && lowerBounds != null)
        {
            if (upperBounds.top > lowerBounds.top) //if the top is actually lower than the bottom, flip them so the math below works correctly
            {
                var temp = lowerBounds;
                lowerBounds = upperBounds;
                upperBounds = temp;
            }
        }

        if (rightBounds != null && leftBounds != null) //if the left is actually more to the right than the right, flip them so the math below works correctly
        {
            if (leftBounds.left > rightBounds.left)
            {
                var temp = rightBounds;
                rightBounds = leftBounds;
                leftBounds = temp;
            }
        }

        //use a flag set to determine all the combinations because its easier to keep track of all the possible combinations than writing an else-if tree
        var flags = 0;
        if (upperBounds != null) flags |= 1;
        if (lowerBounds != null) flags |= 2;
        if (leftBounds != null) flags |= 4;
        if (rightBounds != null) flags |= 8;

        switch (flags)
        {
            case 0: //no boundaries, put it in the top-left

                position.top = 0;
                position.left = 0;
                position.right = width;
                position.bottom = height;
                break;

            case 1: //upper bounds only (align directly along the bottom of the top)

                position.top = upperBounds.bottom;
                position.bottom = upperBounds.bottom + height;

                var xBounds = getXAlignmentPosition(upperBounds, currentBounds, width, alignX);
                position.left = xBounds.left;
                position.right = xBounds.right;
                break;

            case 2: //bottom bounds only (align directly along the top of the bottom and as wide as the bottom)

                position.bottom = lowerBounds.top;
                position.top = lowerBounds.top - height;

                var xBounds = getXAlignmentPosition(lowerBounds, currentBounds, width, alignX);
                position.left = xBounds.left;
                position.right = xBounds.right;
                break;

            case 3: //upper and bottom bounds, stretch to fit between top and bottom, then try to apply the x alignment evenly between both top and bottom axes

                position.bottom = lowerBounds.top;
                position.top = upperBounds.bottom;

                var leftYAxisBounds = getXAlignmentPosition(upperBounds, currentBounds, width, alignX);
                var rightYAxisBounds = getXAlignmentPosition(lowerBounds, currentBounds, width, alignX);

                if (alignX === EVUI.Modules.Panes.AnchorAlignment.Left) //align with whatever is further left
                {
                    position.left = Math.min(leftYAxisBounds.left, rightYAxisBounds.left);
                    position.right = position.left + width;
                }
                else if (alignX === EVUI.Modules.Panes.AnchorAlignment.Right) //align with whatever is the most right
                {
                    position.right = Math.max(leftYAxisBounds.right, rightYAxisBounds.right);
                    position.left = position.right - width;
                }
                else if (alignX === EVUI.Modules.Panes.AnchorAlignment.Center) //get the total span between the furthest left and most right edges and get the center between them.
                {
                    var topMost = Math.min(leftYAxisBounds.left, rightYAxisBounds.left);
                    var bottomMost = Math.max(leftYAxisBounds.right, rightYAxisBounds.right);
                    var totalSpan = bottomMost - topMost;
                    var center = topMost + (totalSpan / 2);

                    position.left = center - (width / 2);
                    position.right = position.left + width;
                }
                else if (alignX === EVUI.Modules.Panes.AnchorAlignment.None)
                {
                    position.left = currentBounds.left;
                    position.right = currentBounds.right;
                }
                else //stretch between the furthest extents on both directions
                {
                    position.left = Math.min(leftYAxisBounds.left, rightYAxisBounds.left);
                    position.right = Math.max(leftYAxisBounds.right, rightYAxisBounds.right);
                }

                break;

            case 4: //left bounds only, align to the top right of the left and stretch to be as long as the left

                position.left = leftBounds.right;
                position.right = position.left + width;

                var yBounds = getYAlignmentPosition(leftBounds, currentBounds, height, alignY);
                position.top = yBounds.top;
                position.bottom = yBounds.bottom;
                break;

            case 5: //left and upper bounds, align to the bottom of the top and right of the left, and optionally stretch on either axis if configured to do so

                position.top = upperBounds.bottom;
                position.bottom = (alignY === EVUI.Modules.Panes.AnchorAlignment.Elastic) ? leftBounds.bottom : position.top + height; //if we're stretching, stretch to the bottom of the left edge. Otherwise use the normal hieght.
                position.left = leftBounds.right;
                position.right = (alignX === EVUI.Modules.Panes.AnchorAlignment.Elastic) ? upperBounds.right : position.right + width; //if we're stretching, stretch to the right of the top edge. Otherwise use the width
                break;

            case 6: //left and lower bounds, align to the top of the bottom and right of the left, and optionally stretch on either axis if configured to do so

                position.top = (alignY === EVUI.Modules.Panes.AnchorAlignment.Elastic) ? leftBounds.top : lowerBounds.top - height;
                position.bottom = leftBounds.bottom; //if we're stretching, stretch to the bottom of the left edge. Otherwise use the normal hieght.
                position.left = leftBounds.right;
                position.right = (alignX === EVUI.Modules.Panes.AnchorAlignment.Elastic) ? lowerBounds.right : position.right + width; //if we're stretching, stretch to the right of the top edge. Otherwise use the width
                break;

            case 7: //left, lower, and upper bounds. Align to the right of the left and stretch between the top and bottom.

                position.top = upperBounds.bottom;
                position.left = leftBounds.right;
                position.bottom = lowerBounds.top;
                position.right = (alignX === EVUI.Modules.Panes.AnchorAlignment.Elastic) ? Math.max(upperBounds.right, lowerBounds.right) : position.left + width; //if we're stretching, stretch to the right most edge of the top or bottom
                break;

            case 8: //right bounds only, align to the left of the right edge

                position.right = rightBounds.left;
                position.left = position.right - width;

                var yBounds = getYAlignmentPosition(rightBounds, currentBounds, height, alignY);
                position.top = yBounds.top;
                position.bottom = yBounds.bottom;

                break;
            case 9: //right and upper bounds, align to the left of the right and bottom of the top

                position.right = rightBounds.left;
                position.left = (alignX === EVUI.Modules.Panes.AnchorAlignment.Elastic) ? upperBounds.left : position.right - width;
                position.top = upperBounds.bottom;
                position.bottom = (alignY === EVUI.Modules.Panes.AnchorAlignment.Elastic) ? rightBounds.bottom : position.top + height;
                break;

            case 10: //right and lower bounds, align to the left of the right and top of the bottom

                position.right = rightBounds.left;
                position.left = (alignX === EVUI.Modules.Panes.AnchorAlignment.Elastic) ? lowerBounds.left : rightBounds.left - width;
                position.top = lowerBounds.top - height;
                position.bottom = (alignY === EVUI.Modules.Panes.AnchorAlignment.Elastic) ? position.top - height : rightBounds.bottom;
                break;

            case 11: //right, lower, and upper bounds. Stretch between upper and lower bounds and align to the right side

                position.top = upperBounds.bottom;
                position.right = rightBounds.left;
                position.bottom = lowerBounds.top;
                position.left = (alignX === EVUI.Modules.Panes.AnchorAlignment.Elastic) ? Math.min(upperBounds.left, lowerBounds.left) : rightBounds.left - width; //if we're stretching, stretch to the right most edge of the top or bottom
                break;

            case 12: //right and left bounds. Stretch between right and left and place according to alignment between 

                position.left = leftBounds.right;
                position.right = rightBounds.left;

                var leftYAxisBounds = getYAlignmentPosition(leftBounds, currentBounds, width, alignY);
                var rightYAxisBounds = getYAlignmentPosition(rightBounds, currentBounds, width, alignY);

                if (alignY === EVUI.Modules.Panes.AnchorAlignment.Top) //align with whatever is highest
                {
                    position.top = Math.min(leftYAxisBounds.top, rightYAxisBounds.top);
                    position.bottom = position.top + height;
                }
                else if (alignY === EVUI.Modules.Panes.AnchorAlignment.Bottom) //align with whatever is lowest
                {
                    position.top = Math.min(leftYAxisBounds.bottom, rightYAxisBounds.bottom) - height;
                    position.bottom = position.top - height;
                }
                else if (alignY === EVUI.Modules.Panes.AnchorAlignment.Center) //get the total span between the furthest top and bottom edges and get the center between them.
                {
                    var topMost = Math.min(leftYAxisBounds.top, rightYAxisBounds.top);
                    var bottomMost = Math.max(leftYAxisBounds.bottom, rightYAxisBounds.bottom);
                    var totalSpan = bottomMost - topMost;
                    var center = topMost + (totalSpan / 2);

                    position.top = center - (height / 2);
                    position.bottom = position.bottom + height;
                }
                else if (alignY === EVUI.Modules.Panes.AnchorAlignment.None)
                {
                    position.top = currentBounds.top;
                    position.bottom = currentBounds.bottom;
                }
                else //stretch between the furthest extents on both directions
                {
                    position.top = Math.min(leftYAxisBounds.top, rightYAxisBounds.top);
                    position.bottom = Math.max(leftYAxisBounds.bottom, rightYAxisBounds.bottom);
                }

                break;
            case 13: //right, left, and upper bounds. Stretch between right and left, and align along the bottom of the top

                position.top = upperBounds.bottom;
                position.bottom = (alignY === EVUI.Modules.Panes.AnchorAlignment.Elastic) ? Math.max(leftBounds.bottom, rightBounds.bottom) : position.top + height;
                position.left = leftBounds.right;
                position.right = rightBounds.left;
                break;

            case 14: //right, left, and lower bounds. Stretch between right and left, and align along the top of the bottom

                position.top = (alignY === EVUI.Modules.Panes.AnchorAlignment.Elastic) ? Math.min(leftBounds.top, rightBounds.top) : lowerBounds.top - height;
                position.bottom = lowerBounds.top;
                position.left = leftBounds.right;
                position.right = rightBounds.left;
                break;

            case 15: //stretch in all directions to fit in between all anchors.

                position.top = upperBounds.bottom;
                position.bottom = lowerBounds.top;
                position.left = leftBounds.right;
                position.right = rightBounds.left;

                break;
        }

        return position;

    };

    /**Gets the PopInAnchorAlignment that is appropriate for the given axis. 
    @param {String} alignment A value from the PopInAnchorAlignment enum.
    @param {String} axis Either "x" or "y" signifying the axis to get the corrected 
    @returns {String} */
    var getAnchorAlignment = function (alignment, axis)
    {
        if (typeof alignment !== "string") return (axis === "x") ? EVUI.Modules.Panes.AnchorAlignment.Left : EVUI.Modules.Panes.AnchorAlignment.Top;
        alignment = alignment.toLowerCase();

        switch (alignment)
        {
            case EVUI.Modules.Panes.AnchorAlignment.Bottom:
            case EVUI.Modules.Panes.AnchorAlignment.Top:

                if (axis === "x") //neither top nor bottom is a correct value for the x axis, so return the default.
                {
                    return EVUI.Modules.Panes.AnchorAlignment.Left;
                }
                else
                {
                    return alignment;
                }

                break;
            case EVUI.Modules.Panes.AnchorAlignment.Left:
            case EVUI.Modules.Panes.AnchorAlignment.Right:

                if (axis === "y") //neither left nor right is a correct value for the y axis, so return the default
                {
                    return EVUI.Modules.Panes.AnchorAlignment.Top;
                }
                else
                {
                    return alignment;
                }

            case EVUI.Modules.Panes.AnchorAlignment.Center:
            case EVUI.Modules.Panes.AnchorAlignment.Elastic:
            case EVUI.Modules.Panes.AnchorAlignment.None:
                return alignment; //all apply to both axes and are correct
            default: //we got a bad value, return the default for the specified axis
                return (axis === "x") ? EVUI.Modules.Panes.AnchorAlignment.Left : EVUI.Modules.Panes.AnchorAlignment.Top;
        }
    };

    /**Gets the correct dimensions to place the Pane along the X axis based on the alignment parameter. 
    @param {EVUI.Modules.Dom.ElementBounds} alignmentSideBounds The bounds of the side the pane is being aligned with.
    @param {EVUI.Modules.Dom.ElementBounds} currentBounds The current bounds of the pane.
    @param {Number} width The width of the pane.
    @param {String} alignX The value from the PopInAnchorAlignment enum for the X axis.
    @returns {EVUI.Modules.Dom.ElementBounds}*/
    var getXAlignmentPosition = function (alignmentSideBounds, currentBounds, width, alignX)
    {
        var bounds = new EVUI.Modules.Dom.ElementBounds();

        if (alignX === EVUI.Modules.Panes.AnchorAlignment.Left) //align to the left edge of the anchored side
        {
            bounds.left = alignmentSideBounds.left;
            bounds.right = alignmentSideBounds.left + width;
        }
        else if (alignX === EVUI.Modules.Panes.AnchorAlignment.Right) //align to the right edge of the anchored side
        {
            bounds.left = alignmentSideBounds.right - width;
            bounds.right = alignmentSideBounds.right;
        }
        else if (alignX === EVUI.Modules.Panes.AnchorAlignment.Center) //center the pane on the anchored side
        {
            var center = alignmentSideBounds.left + ((alignmentSideBounds.right - alignmentSideBounds.left) / 2);
            bounds.left = center - (width / 2);
            bounds.right = bounds.left + width;
        }
        else if (alignX === EVUI.Modules.Panes.AnchorAlignment.None) //don't align with the anchored side
        {
            bounds.left = currentBounds.left;
            bounds.right = currentBounds.right;
        }
        else //default to elastic, set the bounds to be the whole length of the anchored side
        {
            bounds.left = alignmentSideBounds.left;
            bounds.right = alignmentSideBounds.right;
        }

        return bounds;
    };

    /**Gets the correct dimensions to place the Pane along the Y axis based on the alignment parameter.
    @param {EVUI.Modules.Dom.ElementBounds} alignmentSideBounds The bounds of the side the pane is being aligned with.
    @param {EVUI.Modules.Dom.ElementBounds} currentBounds The current bounds of the pane.
    @param {Number} height The height of the pane.
    @param {String} alignY The value from the PopInAnchorAlignment enum for the Y axis.
    @returns {EVUI.Modules.Dom.ElementBounds}*/
    var getYAlignmentPosition = function (alignmentSideBounds, currentBounds, height, alignY)
    {
        var bounds = new EVUI.Modules.Dom.ElementBounds();

        if (alignY === EVUI.Modules.Panes.AnchorAlignment.Top) //align to the top edge of the anchored side
        {
            bounds.top = alignmentSideBounds.top;
            bounds.bottom = alignmentSideBounds.top - height;
        }
        else if (alignY === EVUI.Modules.Panes.AnchorAlignment.Bottom) //align to the bottom edge of the anchored side
        {
            bounds.top = alignmentSideBounds.bottom - height;
            bounds.bottom = alignmentSideBounds.bottom;
        }
        else if (alignY === EVUI.Modules.Panes.AnchorAlignment.Center) //center the pane on the anchored side
        {
            var center = alignmentSideBounds.bottom - ((alignmentSideBounds.bottom - alignmentSideBounds.top) / 2);
            bounds.top = center - (height / 2);
            bounds.bottom = bounds.top + height;
        }
        else if (alignY === EVUI.Modules.Panes.AnchorAlignment.None) //do not align with the anchored side
        {
            bounds.top = currentBounds.top;
            bounds.bottom = currentBounds.bottom;
        }
        else //default to elastic, stretch between the top and bottom
        {
            bounds.top = alignmentSideBounds.top;
            bounds.bottom = alignmentSideBounds.bottom;
        }

        return bounds;
    };

    /**Gets the position of a Pane relative to another element.
    @param {InternalPaneEntry} entry The Pane being positioned.
    @param {EVUI.Modules.Dom.DomHelper} elementHelper The root element of the pane.
    @param {EVUI.Modules.Panes.PaneRelativePosition} relativeSettings The instructions for the relative positioning.
    @returns {EVUI.Modules.Panes.PanePosition} */
    var getRelativePosition = function (entry, elementHelper, relativeSettings)
    {
        var relativeBounds = new EVUI.Modules.Panes.PanePosition(EVUI.Modules.Panes.PanePositionMode.RelativePosition);
        var bounds = elementHelper.offset();
        var width = bounds.right - bounds.left;
        var height = bounds.bottom - bounds.top;
        var positionBounds = null;

        //make sure we have some bounds to position around. If it just a point make a 0x0 bounds to do the same logic around.
        if (relativeSettings.relativeElement != null)
        {
            var ele = new EVUI.Modules.Dom.DomHelper(relativeSettings.relativeElement);
            if (ele.elements.length === 0 || ele.elements[0].isConnected === false) return null;

            positionBounds = ele.offset();
        }
        else
        {
            positionBounds = new EVUI.Modules.Dom.ElementBounds();
            positionBounds.left = relativeSettings.x;
            positionBounds.top = relativeSettings.y;
            positionBounds.right = relativeSettings.x;
            positionBounds.bottom = relativeSettings.y;
        }

        //parse the alignment so that the values for each axis are correct (i.e. the user can put "right top" or "top right" and we need to correctly assign "right" to the x axis and "top" to the y axis)
        var axes = getOrientationAlignment(relativeSettings);
        var xOrientation = axes.xOrientation;
        var yOrientation = axes.yOrientation;

        if (xOrientation === EVUI.Modules.Panes.RelativePositionOrientation.Right) //we are putting the left edge of the pane on the right edge of the relative reference
        {
            relativeBounds.left = positionBounds.right;
            relativeBounds.right = positionBounds.right + width;
        }
        else if (xOrientation === EVUI.Modules.Panes.RelativePositionOrientation.Left) //we are putting the right edge of the pane on the left edge of the relative reference
        {
            relativeBounds.left = positionBounds.left - width;
            relativeBounds.right = positionBounds.left;
        }

        if (yOrientation === EVUI.Modules.Panes.RelativePositionOrientation.Bottom) //we are putting the top of the pane along the bottom edge of the relative reference.
        {
            relativeBounds.top = positionBounds.bottom;
            relativeBounds.bottom = positionBounds.bottom + height;
        }
        else if (yOrientation === EVUI.Modules.Panes.RelativePositionOrientation.Top) //we are putting the bottom of the pane along the top edge of the relative reference
        {
            relativeBounds.top = positionBounds.top - height;
            relativeBounds.bottom = positionBounds.top;
        }

        relativeBounds = applyRelativePositionAlignment(positionBounds, relativeBounds, relativeSettings, xOrientation, yOrientation);

        return relativeBounds;
    };

    /**Applies an alignment to the side that the Pane is oriented towards.
    @param {EVUI.Modules.Panes.PanePosition} positionBounds The bounds of the position the pane is being oriented around.
    @param {EVUI.Modules.Dom.ElementBounds} relativeBounds The bounds of the position of the pane relative to the position it is being oriented around.
    @param {EVUI.Modules.Panes.PaneRelativePosition} relativeSettings The settings for the relative posotion.
    @param {String} xOrientation The orientation around the relative element on the x axis.
    @param {String} yOrientation The orientation around the relative element on the y axis.
    @returns {EVUI.Modules.Panes.PanePosition}*/
    var applyRelativePositionAlignment = function (positionBounds, relativeBounds, relativeSettings, xOrientation, yOrientation)
    {
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(relativeSettings.alignment) === true) return relativeBounds;

        var positionHeight = positionBounds.bottom - positionBounds.top;
        var positionWidth = positionBounds.right - positionBounds.left;

        switch (relativeSettings.alignment.toLowerCase())
        {
            case EVUI.Modules.Panes.RelativePositionAlignment.Bottom: //aligning the top of the element with the bottom of the relative element

                if (yOrientation === EVUI.Modules.Panes.RelativePositionOrientation.Top) //only applies if we are oriented to the top, if we're oriented to the bottom, there is nothing to do
                {
                    relativeBounds.top += positionHeight;
                    relativeBounds.bottom += positionHeight;
                }

                break;

            case EVUI.Modules.Panes.RelativePositionAlignment.YCenter: //aligning to the center of the Y axis

                if (yOrientation === EVUI.Modules.Panes.RelativePositionOrientation.Bottom) //move the bottom up by half the size of the relative element
                {
                    relativeBounds.top -= positionHeight / 2;
                    relativeBounds.bottom -= positionHeight / 2;
                }
                else if (yOrientation === EVUI.Modules.Panes.RelativePositionOrientation.Top) //move the top down by half the size of the relative element
                {
                    relativeBounds.top += positionHeight / 2
                    relativeBounds.bottom += positionHeight / 2;
                }

                break;

            case EVUI.Modules.Panes.RelativePositionAlignment.Top: //align the bottom of the element with the top of the relative element

                if (yOrientation === EVUI.Modules.Panes.RelativePositionOrientation.Bottom) //only applies if we are oriented at the bottom of the relative element, otherwise there is nothing to do
                {
                    relativeBounds.top -= positionHeight;
                    relativeBounds.bottom -= positionHeight;
                }

                break;

            case EVUI.Modules.Panes.RelativePositionAlignment.Left: //aligning the element on the left side of the relative element

                if (xOrientation === EVUI.Modules.Panes.RelativePositionAlignment.Right) //only applies if we are oriented to the right, otherwise we are already on the left
                {
                    relativeBounds.left -= positionWidth;
                    relativeBounds.right -= positionWidth;
                }

                break;

            case EVUI.Modules.Panes.RelativePositionAlignment.XCenter: //aligning to the center of the x axis of the relative element

                if (xOrientation === EVUI.Modules.Panes.RelativePositionAlignment.Right) //move left by half the width
                {
                    relativeBounds.left -= positionWidth / 2;
                    relativeBounds.right -= positionWidth / 2;
                }
                else if (xOrientation === EVUI.Modules.Panes.RelativePositionOrientation.Left) //move right by half the with
                {
                    relativeBounds.left += positionWidth / 2;
                    relativeBounds.right += positionWidth / 2;
                }
                break;
            case EVUI.Modules.Panes.RelativePositionAlignment.Right: //aligning to the right edge of the relative element

                if (xOrientation === EVUI.Modules.Panes.RelativePositionOrientation.Left) //only applies if we are oriented to the left of the relative element, otherwise we're already on the right
                {
                    relativeBounds.left += positionWidth;
                    relativeBounds.right += positionWidth;
                }

                break;
        }

        return relativeBounds;
    };

    /**Gets the relative orientation axis.
    @param {String} orientation A value from the EVUI.Modules.Pane.RelativePositionOrientation enum indicating which axis is being oriented towards.
    @returns {String}*/
    var getRelativeOrientationAxis = function (orientation)
    {
        if (orientation == null) return null;

        var orientation = orientation.toLowerCase();
        switch (orientation)
        {
            case EVUI.Modules.Panes.RelativePositionOrientation.Bottom:
            case EVUI.Modules.Panes.RelativePositionOrientation.Top:
                return "y";
            case EVUI.Modules.Panes.RelativePositionOrientation.Left:
            case EVUI.Modules.Panes.RelativePositionOrientation.Right:
                return "x";
        }

        return null;
    };

    /**Gets the orientation values regardless of the order they were specified in the orientation string. (i.e. "top left" vs "left top")
    @param {String} relativeSettings The settings for orientation of the pane to its relative element or point.
    @returns {{xOrientation: number, yOrientation:number}} */
    var getOrientationAlignment = function (relativeSettings)
    {
        var orientations = (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(relativeSettings.orientation) == false) ? relativeSettings.orientation.toLowerCase().trim().split(/\s+/) : ["right", "bottom"];
        var xOrientation = (getRelativeOrientationAxis(orientations[0]) === "x") ? orientations[0] : orientations[1];
        if (xOrientation == null) xOrientation = EVUI.Modules.Panes.RelativePositionOrientation.Right;

        var yOrientation = (getRelativeOrientationAxis(orientations[1]) === "y") ? orientations[1] : orientations[0];
        if (yOrientation == null) yOrientation = EVUI.Modules.Panes.RelativePositionOrientation.Bottom;

        return { xOrientation: xOrientation, yOrientation: yOrientation };
    };

    /**Gets the position for a full screen pane.
    @returns {EVUI.Modules.Panes.PanePosition}*/
    var getFullscreenPosition = function ()
    {
        var position = new EVUI.Modules.Panes.PanePosition(EVUI.Modules.Panes.PanePositionMode.Fullscreen);

        var bounds = new EVUI.Modules.Dom.DomHelper(window);
        var width = bounds.outerWidth();
        var height = bounds.outerHeight();

        position.top = window.scrollY;
        position.left = window.scrollX;
        position.bottom = position.top + height;
        position.right = position.left + width;

        return position;
    };

    /**Gets the position of an element after all the classes that will be applied to it have been applied.
    @param {EVUI.Modules.Panes.PaneShowSettings} showSettings The settings for showing the pane.
    @param {EVUI.Modules.Dom.DomHelper} ele The root element of the pane.
    @returns {EVUI.Modules.Panes.PanePosition} */
    var getAddClassPosition = function (showSettings, ele)
    {
        var addedClasses = getPositionClasses(showSettings.positionClass);
        var positionClasses = addedClasses.concat([EVUI.Modules.Panes.Constants.CSS_Position, entry.link.paneCSSName]);

        var position = new EVUI.Modules.Panes.PanePosition(EVUI.Modules.Panes.PanePositionMode.PositionClass);
        ele.addClass(positionClasses);

        var bounds = ele.offset();
        position.bottom = bounds.bottom;
        position.left = bounds.left;
        position.right = bounds.right;
        position.top = bounds.top;
        position.classNames = addedClasses;

        ele.removeClass(positionClasses);

        return position;
    };

    /**Gets the position of the element if it were centered in the pane.
    @param {EVUI.Modules.Dom.DomHelper} ele The root element of the Pane.
    @returns {EVUI.Modules.Panes.PanePosition} */
    var getCenteredPosition = function (ele)
    {
        var win = new EVUI.Modules.Dom.DomHelper(window);
        var winWidth = win.outerWidth();
        var winHeight = win.outerHeight();

        var eleOffset = ele.offset();
        var eleWidth = eleOffset.right - eleOffset.left;
        var eleHeight = eleOffset.bottom - eleOffset.top;

        var centerWidth = eleWidth / 2;
        var centerHeight = eleHeight / 2;

        var winCenterWidth = winWidth / 2;
        var winCenterHeight = winHeight / 2;

        var position = new EVUI.Modules.Panes.PanePosition(EVUI.Modules.Panes.PanePositionMode.Centered);
        position.left = winCenterWidth - centerWidth;
        position.right = winCenterWidth + centerWidth;
        position.top = winCenterHeight - centerHeight;
        position.bottom = winCenterHeight + centerWidth;

        return position;
    };

    /**Walks through all the options in the show settings and comes up with the mode to use to position the element. Goes in the following order: 
    position classes > absolute position > relative position > anchored position > document flow > full screen > centered.
    @param {EVUI.Modules.Panes.PaneShowSettings} showSettings The settings to use to calculate the position.
    @returns {String} */
    var getPositionMode = function (showSettings)
    {
        if (showSettings == null) return EVUI.Modules.Panes.PanePositionMode.None;

        if (showSettings.positionClass != null) //we have a value for position classes
        {
            if (typeof showSettings.positionClass === "string" && EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(showSettings.positionClass) === false)
            {
                return EVUI.Modules.Panes.PanePositionMode.PositionClass; //its a string that will be applied as a class name
            }
            else if (EVUI.Modules.Core.Utils.isArray(showSettings.positionClass) === true)
            {
                if (showSettings.positionClass.filter(function (css) { return typeof css === "string" }).length > 0)
                {
                    return EVUI.Modules.Panes.PanePositionMode.PositionClass; //it is an array of class names
                }
            }
        }

        if (showSettings.absolutePosition != null) //we have a value for absolute position
        {
            if (showSettings.absolutePosition.left !== 0 || showSettings.absolutePosition.top !== 0) //at least one of the x or y values must be non-zero for this mode to apply
            {
                return EVUI.Modules.Panes.PanePositionMode.AbsolutePosition;
            }
        }

        if (showSettings.relativePosition != null) //we have a value for relative position
        {
            if (showSettings.relativePosition.relativeElement != null && showSettings.relativePosition.relativeElement.isConnected === true) 
            {
                return EVUI.Modules.Panes.PanePositionMode.RelativePosition; //the relative element must be part of the DOM to be a valid target to orient around (so we can get its position)
            }
            else if (showSettings.relativePosition.x !== 0 || showSettings.relativePosition.y !== 0)
            {
                return EVUI.Modules.Panes.PanePositionMode.RelativePosition; //if one of the coordinates is non zero value it can be a target for orientation
            }
        }

        if (showSettings.anchors != null) //we have a value for anchors
        {
            if ((showSettings.anchors.bottom != null && (showSettings.anchors.bottom.isConnected === true || showSettings.anchors.bottom === window))
                || (showSettings.anchors.left != null && (showSettings.anchors.left.isConnected === true || showSettings.anchors.left === window))
                || (showSettings.anchors.right != null && (showSettings.anchors.right.isConnected === true || showSettings.anchors.right === window))
                || (showSettings.anchors.top != null && (showSettings.anchors.top.isConnected === true || showSettings.anchors.top === window)))
            {
                return EVUI.Modules.Panes.PanePositionMode.Anchored; //at least one anchor must be non-null and connected to the DOM to be a valid target (so we can get its position)
            }
        }

        if (showSettings.documentFlow != null) //we have a value for document flow
        {
            if (showSettings.documentFlow.relativeElement != null) //the relative element must not be null in order to use document flow mode. It doesn't have to be connected yet.
            {
                return EVUI.Modules.Panes.PanePositionMode.DocumentFlow;
            }
        }

        //full screen mode was set
        if (showSettings.fullscreen === true) return EVUI.Modules.Panes.PanePositionMode.Fullscreen;

        //center mode was set
        if (showSettings.center === true) return EVUI.Modules.Panes.PanePositionMode.Centered;

        //northing worked, not going to do anything with the position other than stick it in the top-left of the view port.
        return EVUI.Modules.Panes.PanePositionMode.None;
    };

    /**Takes the position classes input and makes it into an array of strings (can be a string, a string of space separated classes, or an array of either)
    @param {String|String[]} classes The classes to apply to the Pane.
    @returns {String[]} */
    var getPositionClasses = function (classes)
    {
        var classesArray = [];

        if (EVUI.Modules.Core.Utils.isArray(classes) === true)
        {
            var numClasses = classes.length;
            for (var x = 0; x < numClasses; x++)
            {
                classesArray = classesArray.concat(getPositionClasses(classes[x]));
            }
        }
        else if (typeof classes === "string")
        {
            classesArray = classes.split(/\s+/);
        }

        return classesArray;
    };

    /**Applies the clip settings that are attached to the show settings. If omitted, the default values are used instead (clips to pane.)
    @param {InternalPaneEntry} entry The pane entry being clipped.
    @param {EVUI.Modules.Panes.PanePosition} position The calculated position of where the pane will be placed.
    @param {EVUI.Modules.Panes.PaneClipSettings} clipSettings The current set of clip settings being applied.
    @param {EVUI.Modules.Panes.PaneClipSettings[]} previousClipSettings All of the previous clip settings objects that have been applied (prevents stack overflows).
    @returns {EVUI.Modules.Panes.PanePosition}*/
    var applyClipSettings = function (entry, position, clipSettings, showSettings, previousClipSettings)
    {
        if (previousClipSettings == null) previousClipSettings = [];
        previousClipSettings.push(clipSettings)

        
        var win = new EVUI.Modules.Dom.DomHelper(window)

        if (clipSettings == null) //no clip settings, make the default settings (clip to pane)
        {
            clipSettings = new EVUI.Modules.Panes.PaneClipSettings();
        }

        var bounds = getClipBounds(clipSettings);

        //set some basic clip settings for the fallback if they aren't set already - clipping is the only method that doesn't use a fallback, so this becomes the "final say" in the clip logic.
        if (clipSettings.fallbackClipSettings == null || previousClipSettings.indexOf(clipSettings.fallbackClipSettings) !== -1)
        {
            clipSettings.fallbackClipSettings = new EVUI.Modules.Panes.PaneClipSettings();
            clipSettings.fallbackClipSettings.clipBounds = null;
            clipSettings.fallbackClipSettings.mode = EVUI.Modules.Panes.PaneClipMode.Clip;
            clipSettings.fallbackClipSettings.scrollXWhenClipped = true;
            clipSettings.fallbackClipSettings.scrollYWhenClipped = true;
        }

        clipSettings.mode = getClipMode(clipSettings.mode);
        if (clipSettings.mode === EVUI.Modules.Panes.PaneClipMode.Clip)
        {
            if (isOffScreen(position) === true) return null;
            return clipToBounds(entry, position, bounds, clipSettings);
        }
        else if (clipSettings.mode === EVUI.Modules.Panes.PaneClipMode.Shift)
        {
            if (isOffScreen(bounds) === true) return null;
            return shiftToBounds(entry, position, bounds, clipSettings, showSettings, previousClipSettings);
        }
        else if (clipSettings.mode === EVUI.Modules.Panes.PaneClipMode.Overflow)
        {
            return position;
        }
    };

    /**Determines if a set of bounds lies outside another set of bounds. If the second set is omitted, the pane is used instead.
    @param {EVUI.Modules.Panes.PanePosition|EVUI.Modules.Dom.ElementBounds} position The position to check for being out of bounds.
    @param {EVUI.Modules.Panes.PanePosition|EVUI.Modules.Dom.ElementBounds} bounds Optional. Wither the pane bounds or another arbitrary set of bounds.
    @returns {Boolean} */
    var isOffScreen = function (position, bounds)
    {
        if (bounds == null) bounds = new EVUI.Modules.Dom.DomHelper(window).offset();

        return (isInsideBounds(position.left, position.top, bounds) === false
            && isInsideBounds(position.right, position.top, bounds) === false
            && isInsideBounds(position.left, position.bottom, bounds) === false
            && isInsideBounds(position.right, position.bottom, bounds) === false);
    };

    /**Determines if a point lies inside an arbitrary set of bounds.
    @param {Number} x The x-coordinate to check.
    @param {Number} y The y-coordinate to check.
    @param {EVUI.Modules.Dom.ElementBounds} bounds The bounds to check to see if the point is inside.
    @returns {Boolean} */
    var isInsideBounds = function (x, y, bounds)
    {
        if (x < bounds.left || x > bounds.right) return false;
        if (y < bounds.top || y > bounds.bottom) return false;

        return true;
    };

    /**Clips the Pane to a set of arbitrary bounds.
    @param {InternalPaneEntry} entry The entry representing the Pane to clip.
    @param {EVUI.Modules.Panes.PanePosition} position The calculated position of the Pane.
    @param {EVUI.Modules.Dom.ElementBounds} bounds The bounds to clip the Pane to.
    @param {EVUI.Modules.Panes.PaneClipSettings} clipSettings The instructions for how to clip the Pane.
    @returns {EVUI.Modules.Panes.PanePosition}*/
    var clipToBounds = function (entry, position, bounds, clipSettings)
    {
        var originalWidth = position.right - position.left;
        var originalHeight = position.bottom - position.top;

        var clipped = false;
        if (isOutOfBounds(position, bounds, "left") === true)
        {
            position.left = bounds.left;
            clipped = true;
        }

        if (isOutOfBounds(position, bounds, "right") === true)
        {
            position.right = bounds.right;
            clipped = true;
        }

        if (isOutOfBounds(position, bounds, "top") === true)
        {
            position.top = bounds.top;
            clipped = true;
        }

        if (isOutOfBounds(position, bounds, "bottom") === true)
        {
            position.bottom = bounds.bottom;
            clipped = true;
        }

        if (clipped === true) //we need to clip the height and width of the pane.
        {
            var newWidth = position.right - position.left
            var newHeight = position.bottom - position.top;

            if (newWidth !== originalWidth) //the X dimension changed, flag the entry as being clipped
            {
                position.classNames.push(EVUI.Modules.Panes.Constants.CSS_ClippedX);

                if (clipSettings.scrollXWhenClipped === true) //if the "scroll when clipped" option is set, make a selector class for adding the overflow scrollbar to the pane
                {
                    if (newWidth < originalWidth)
                    {
                        position.classNames.push(EVUI.Modules.Panes.Constants.CSS_ScrollX);

                        var scrollXSelector = getSelector(entry, EVUI.Modules.Panes.Constants.CSS_ClippedX);
                        _settings.stylesheetManager.setRules(_settings.cssSheetName, scrollXSelector, {
                            overflowX: "scroll"
                        });
                    }
                }
            }

            if (newHeight !== originalHeight) //the Y dimension changed, flag the entry as being clipped
            {
                position.classNames.push(EVUI.Modules.Panes.Constants.CSS_ClippedY);

                if (clipSettings.scrollYWhenClipped === true)  //if the "scroll when clipped" option is set, make a selector class for adding the overflow scrollbar to the pane
                {
                    if (newHeight < originalHeight) position.classNames.push(EVUI.Modules.Panes.Constants.CSS_ScrollY);

                    var scrollYSelector = getSelector(entry, EVUI.Modules.Panes.Constants.CSS_ClippedY);
                    _settings.stylesheetManager.setRules(_settings.cssSheetName, scrollYSelector, {
                        overflowY: "scroll"
                    });
                }
            }
        }

        return position;
    };

    /**Shifts a Pane along the X or Y axis so that it fits withins the clipping bounds.
    @param {InternalPaneEntry} entry The entry representing the Pane being shifted.
    @param {EVUI.Modules.Panes.PanePosition} position The calculated position of the Pane.
    @param {EVUI.Modules.Dom.ElementBounds} bounds The clipping bounds.
    @param {EVUI.Modules.Panes.PaneClipSettings} clipSettings The current clip settings being used.
    @param {EVUI.Modules.Panes.PaneShowSettings} showSettings The original settings used to display the Pane.
    @param {EVUI.Modules.Panes.PaneClipSettings[]} previousClipSettings The list of previously used clip settings in clipping this element. Used to prevent stack overflows.
    @returns {EVUI.Modules.Panes.PanePosition} */
    var shiftToBounds = function (entry, position, bounds, clipSettings, showSettings, previousClipSettings)
    {
        var shiftedX = false;
        var shiftedY = false;
        var delta = 0;
        var relativePositioned = position.mode === EVUI.Modules.Panes.PanePositionMode.RelativePosition;

        var positionCopy = EVUI.Modules.Core.Utils.shallowExtend({}, position);
        delete positionCopy.mode;
        positionCopy.classNames = position.classNames.slice();
        positionCopy = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Panes.PanePosition(position.mode), positionCopy);

        if (isOutOfBounds(position, bounds, "left") === true) //out of bounds to the left, move it to the right
        {
            delta = bounds.left - position.left;
            position.left += delta;
            position.right += delta;

            shiftedX = true;

            if (relativePositioned === true && overlaps(position, bounds) === true)
            {
                return flipRelativePosition(entry, positionCopy, bounds, clipSettings, showSettings, previousClipSettings);
            }
        }

        if (isOutOfBounds(position, bounds, "right") === true) //out of bounds to the right, move it to the left
        {
            if (shiftedX === false) 
            {
                delta = position.right - bounds.right;

                position.right -= delta;
                position.left -= delta;
                shiftedX = true;

                if (relativePositioned === true && overlaps(position, bounds) === true)
                {
                    return flipRelativePosition(entry, positionCopy, bounds, clipSettings, showSettings, previousClipSettings);
                }
            }
        }

        if (isOutOfBounds(position, bounds, "top") === true) //top is out of bounds, shift the pane down
        {
            delta = bounds.top - position.top;

            position.top += delta;
            position.bottom += delta;
            shiftedY = true;

            if (relativePositioned === true && overlaps(position, bounds) === true)
            {
                return flipRelativePosition(entry, positionCopy, bounds, clipSettings, showSettings, previousClipSettings);
            }
        }

        if (isOutOfBounds(position, bounds, "bottom") === true) //bottom is out of bounds, shift the pane up
        {
            if (shiftedY === false)
            {
                delta = position.bottom - bounds.bottom;

                position.bottom -= delta;
                position.top -= delta;
                shiftedY = true;

                if (relativePositioned === true && overlaps(position, bounds) === true)
                {
                    return flipRelativePosition(entry, positionCopy, bounds, clipSettings, showSettings, previousClipSettings);
                }
            }
        }

        if (position.mode === EVUI.Modules.Panes.PanePositionMode.Fullscreen && (shiftedX === true || shiftedY === true))
        {
            var winBounds = new EVUI.Modules.Dom.DomHelper(window).offset();
            return clipToBounds(entry, position, winBounds, clipSettings.fallbackClipSettings);
        }
        
        return position;
    };

    /**Flags for indicating which directions and adjustments have been made to the pane in attempts to get it to fit into the area that can contain it. */
    var FlipFlags =
    {
        /**Has not been flipped.*/
        None: 0,
        /**Flipped on the X-axis.*/
        FlippedX: 1,
        /**Flipped on the Y-axis*/
        FlippedY: 2,
        /**Had its alignment changed to fit into the area with the most open space.*/
        ReAligned: 4
    };

    /**In the case that we have a relatively positioned element, we will sometimes want to flip it back over the element if it overflows on one or both axes.
    @param {InnerPaneEntry} entry The Pane being flipped.
    @param {EVUI.Modules.Panes.PanePosition} position The position of the pane.
    @param {EVUI.Modules.Dom.ElementBounds} bounds The clipping bounds.
    @param {EVUI.Modules.Panes.PaneClipSettings} clipSettings The current clip settings.
    @param {EVUI.Modules.Panes.PaneShowSettings} showSettings The original show settings used to display the pane.
    @param {EVUI.Modules.Panes.PaneClipSettings[]} previousClipSettings The list of previously used clip settings in clipping this element. Used to prevent stack overflows.
    @param {Number} flags The FlipFlaps indicating the previous flip operations that have been performed on the pane.
    @returns {EVUI.Modules.Panes.PanePosition}*/
    var flipRelativePosition = function (entry, position, bounds, clipSettings, showSettings, previousClipSettings, flags)
    {
        if (flags == null) flags = 0;
        var flippedX = false;
        var flippedY = false;  
        var alignmentAxes = getOrientationAlignment(showSettings.relativePosition);
        var flippedAlignX = null;
        var flippedAlignY = null;
        var alignX = alignmentAxes.xOrientation;
        var alignY = alignmentAxes.yOrientation;
        var flippedOutOfBounds = false;

        var eleBounds = null;
        if (showSettings.relativePosition.relativeElement != null)
        {
            var ele = new EVUI.Modules.Dom.DomHelper(showSettings.relativePosition.relativeElement);
            if (ele.elements.length === 0 || ele.elements[0].isConnected === false) return null;

            eleBounds = ele.offset();
        }
        else
        {
            eleBounds = new EVUI.Modules.Dom.ElementBounds();
            eleBounds.top = showSettings.relativePosition.y;
            eleBounds.left = showSettings.relativePosition.x;
            eleBounds.right = showSettings.relativePosition.y;
            eleBounds.bottom = showSettings.relativePosition.x;
        }

        if (isOffScreen(eleBounds))
        {
            return null;
        }

        if (isOutOfBounds(position, bounds, "right") === true) //overflowing to the right
        {
            if (EVUI.Modules.Core.Utils.hasFlag(flags, FlipFlags.FlippedX) === true) //already flipped it over, we apply some special logic in this case to put the relative pane in the position with the most space
            {
                flippedOutOfBounds = true;
            }
            else
            {
                if (alignX === EVUI.Modules.Panes.RelativePositionOrientation.Left) //left side is aligned to the right side of the relative point, flip over X axis.
                {
                    flippedAlignX = EVUI.Modules.Panes.RelativePositionOrientation.Right;
                    flippedX = true;
                }
                else if (alignX === EVUI.Modules.Panes.RelativePositionOrientation.Right) //the right side is aligned to the left of the relative point, and that right side is outside the bounds. Clipping will result in a 0 width Pane, so this is an error.
                {
                    flippedAlignX = EVUI.Modules.Panes.RelativePositionOrientation.Left;
                    flippedX = true;
                }

                flags |= FlipFlags.FlippedX;
            }
        }

        if (isOutOfBounds(position, bounds, "left") === true) //overflowing to the left
        {
            if (EVUI.Modules.Core.Utils.hasFlag(flags, FlipFlags.FlippedX) === true) //already been flipped, we apply some special logic in this case to put the relative pane in the position with the most space
            {
                flippedOutOfBounds = true;
            }
            else
            {
                if (alignX === EVUI.Modules.Panes.RelativePositionOrientation.Right) //flip over x axis
                {
                    flippedAlignX = EVUI.Modules.Panes.RelativePositionOrientation.Left;
                    flippedX = true;
                }
                else if (alignX === EVUI.Modules.Panes.RelativePositionOrientation.Left) //
                {
                    flippedAlignX = EVUI.Modules.Panes.RelativePositionOrientation.Right;
                    flippedX = true;
                }

                flags |= FlipFlags.FlippedX;
            }
        }

        if (isOutOfBounds(position, bounds, "top") === true)
        {
            if (EVUI.Modules.Core.Utils.hasFlag(flags, FlipFlags.FlippedY) === true) //already been flipped, we apply some special logic in this case to put the relative pane in the position with the most space
            {
                flippedOutOfBounds = true;
            }
            else
            {
                if (alignY === EVUI.Modules.Panes.RelativePositionOrientation.Bottom)
                {
                    flippedAlignY = EVUI.Modules.Panes.RelativePositionOrientation.Top;
                    flippedY = true;
                }
                else if (alignY === EVUI.Modules.Panes.RelativePositionOrientation.Top)
                {
                    flippedAlignY = EVUI.Modules.Panes.RelativePositionOrientation.Bottom;
                    flippedY = true;
                }

                flags |= FlipFlags.FlippedY;
            }
        }

        if (isOutOfBounds(position, bounds, "bottom") === true)
        {
            if (EVUI.Modules.Core.Utils.hasFlag(flags, FlipFlags.FlippedY) === true) //already been flipped, we apply some special logic in this case to put the relative pane in the position with the most space
            {
                flippedOutOfBounds = true;
            }
            else
            {
                if (alignY === EVUI.Modules.Panes.RelativePositionOrientation.Top)
                {
                    flippedAlignY = EVUI.Modules.Panes.RelativePositionOrientation.Bottom;
                    flippedY = true;
                }
                else if (alignY === EVUI.Modules.Panes.RelativePositionOrientation.Bottom)
                {
                    flippedAlignY = EVUI.Modules.Panes.RelativePositionOrientation.Top;
                    flippedY = true;
                }

                flags |= FlipFlags.FlippedY;
            }
        }

        //if we flipped it, re-calculate the flipped position and re-run the flip overflow logic to trigger the fallback clip logic
        if (flippedX === true || flippedY === true)
        {
            var orientation = (flippedX === true) ? flippedAlignX : alignX;
            orientation += " " + ((flippedY === true) ? flippedAlignY : alignY);

            showSettings.relativePosition.orientation = orientation;

            position = getRelativePosition(entry, new EVUI.Modules.Dom.DomHelper(entry.link.pane.element), showSettings.relativePosition, bounds);
            if (position == null) return null;

            return flipRelativePosition(entry, position, bounds, clipSettings, showSettings, previousClipSettings, flags);
        }
        else if (EVUI.Modules.Core.Utils.hasFlag(flags, FlipFlags.ReAligned) === true) //already flipped and re-aligned it, just return whatever we have as its the best we'll do.
        {
            position.classNames.push(EVUI.Modules.Panes.Constants.CSS_Flipped);
            return position;
        }
        else if (flippedOutOfBounds === true) //we flipped it for a second time and its still out of bounds
        {
            var topGap = eleBounds.top - bounds.top;
            var bottomGap = bounds.bottom - eleBounds.bottom;
            var leftGap = eleBounds.left - bounds.left;
            var rightGap = bounds.right - eleBounds.right;

            var width = position.right - position.left;
            var height = position.bottom - position.top;
            var clip = (topGap < height && bottomGap < height && leftGap < width && rightGap < width)


            if ((topGap > leftGap && topGap > rightGap) || (bottomGap > leftGap && bottomGap > rightGap)) //if it's narrower than it was to start with, we'll move it to be above or below the relative element (whichever has more space)
            {
                if (bottomGap >= topGap) //if the gaps are equal, the bottom wins
                {
                    showSettings.relativePosition.orientation = EVUI.Modules.Panes.RelativePositionOrientation.Bottom + " " + ((leftGap >= rightGap) ? EVUI.Modules.Panes.RelativePositionOrientation.Left : EVUI.Modules.Panes.RelativePositionAlignment.Right);
                    showSettings.relativePosition.alignment = (leftGap >= rightGap) ? EVUI.Modules.Panes.RelativePositionAlignment.Rignt : EVUI.Modules.Panes.RelativePositionAlignment.Left;
                }
                else
                {
                    showSettings.relativePosition.orientation = EVUI.Modules.Panes.RelativePositionOrientation.Top + " " + ((leftGap >= rightGap) ? EVUI.Modules.Panes.RelativePositionOrientation.Left : EVUI.Modules.Panes.RelativePositionAlignment.Right);
                    showSettings.relativePosition.alignment = (leftGap >= rightGap) ? EVUI.Modules.Panes.RelativePositionAlignment.Right : EVUI.Modules.Panes.RelativePositionAlignment.Left;
                }
            }
            else if ((leftGap > topGap && leftGap > bottomGap) || (rightGap > topGap && rightGap > bottomGap)) //if it's shorter than it was to start with, we'll move it to be to the left or right of the relative element (whichever has more space)
            {
                if (leftGap >= rightGap)
                {
                    showSettings.relativePosition.orientation = ((topGap >= bottomGap) ? EVUI.Modules.Panes.RelativePositionOrientation.Top : EVUI.Modules.Panes.RelativePositionAlignment.Bottom) + " " + EVUI.Modules.Panes.RelativePositionOrientation.Left;
                    showSettings.relativePosition.alignment = (topGap >= bottomGap) ? EVUI.Modules.Panes.RelativePositionAlignment.Bottom : EVUI.Modules.Panes.RelativePositionAlignment.Top;
                }
                else
                {
                    showSettings.relativePosition.orientation = ((topGap >= bottomGap) ? EVUI.Modules.Panes.RelativePositionOrientation.Top : EVUI.Modules.Panes.RelativePositionAlignment.Bottom) + " " + EVUI.Modules.Panes.RelativePositionOrientation.Right;
                    showSettings.relativePosition.alignment = (topGap >= bottomGap) ? EVUI.Modules.Panes.RelativePositionAlignment.Bottom : EVUI.Modules.Panes.RelativePositionAlignment.Top;
                }
            }
            else
            {
                return applyClipSettings(entry, position, clipSettings.fallbackClipSettings, showSettings, previousClipSettings);
            }

            flags |= FlipFlags.ReAligned;

            position = getRelativePosition(entry, new EVUI.Modules.Dom.DomHelper(entry.link.pane.element), showSettings.relativePosition, bounds);
            if (position == null) return null;

            position = flipRelativePosition(entry, position, bounds, clipSettings, showSettings, previousClipSettings, flags);
            return clipToBounds(entry, position, bounds, clipSettings);
        }
        else if (EVUI.Modules.Core.Utils.hasFlag(flags, FlipFlags.FlippedX) === true || EVUI.Modules.Core.Utils.hasFlag(flags, FlipFlags.FlippedY) === true)
        {
            position.classNames.push(EVUI.Modules.Panes.Constants.CSS_Flipped);
            return position;
        }
        else
        {
            return position;
        }
    };

    /**Determines whether or not one element overlaps the other.
    @param {EVUI.Modules.Dom.ElementBounds} bounds1 The first bounds to check.
    @param {EVUI.Modules.Dom.ElementBounds} bounds2 The second bounds to check.
    @returns {Boolean}*/
    var overlaps = function (bounds1, bounds2)
    {
        if (isInsideBounds(bounds1.left, bounds1.top, bounds2) === true) return true;
        if (isInsideBounds(bounds1.left, bounds1.bottom, bounds2) === true) return true;
        if (isInsideBounds(bounds1.right, bounds1.top, bounds2) === true) return true;
        if (isInsideBounds(bounds1.right, bounds1.bottom, bounds2) === true) return true;

        return false
    };

    /**Gets a valid clip mode.
    @param {String} clipMode Any value from the EVUI.Modules.Pane.PaneClipMode enum. If an invalid value is specified, "shift" is returned.
    @returns {String} */
    var getClipMode = function (clipMode)
    {
        if (typeof clipMode !== "string") return EVUI.Modules.Panes.PaneClipMode.Shift;
        clipMode = clipMode.toLowerCase();

        switch (clipMode)
        {
            case EVUI.Modules.Panes.PaneClipMode.Clip:
            case EVUI.Modules.Panes.PaneClipMode.Overflow:
            case EVUI.Modules.Panes.PaneClipMode.Shift:
                return clipMode;
            default:
                return EVUI.Modules.Panes.PaneClipMode.Shift;
        }
    };

    /**Determines if a side of the position is outside the bounds of the clip bounds.
    @param {EVUI.Modules.Panes.PanePosition} position The calculated position of the Pane.
    @param {EVUI.Modules.Dom.ElementBounds} bounds The clip bounds.
    @param {String} side The side being checked.
    @returns {Boolean} */
    var isOutOfBounds = function (position, bounds, side)
    {
        if (side === "top")
        {
            if (position.top < bounds.top) return true;
        }
        else if (side === "bottom")
        {
            if (position.bottom > bounds.bottom) return true;
        }
        else if (side === "left")
        {
            if (position.left < bounds.left) return true;
        }
        else if (side === "right")
        {
            if (position.right > bounds.right) return true;
        }

        return false;
    };

    var getClipBounds = function (clipSettings)
    {
        if (clipSettings == null) return null;

        var win = new EVUI.Modules.Dom.DomHelper(window);

        var bounds = new EVUI.Modules.Dom.ElementBounds();;
        if (clipSettings.clipBounds == null) //if we have no clip bounds, clip to the pane's current view port
        {
            bounds.left = window.scrollX;
            bounds.right = scrollX + win.outerWidth();
            bounds.top = window.scrollY;
            bounds.bottom = window.scrollY + win.outerHeight();
        }
        else if (EVUI.Modules.Core.Utils.isElement(clipSettings.clipBounds) === true || typeof clipSettings.clipBounds === "string") //if the clip bounds are an element, we get the bounds of that element.
        {
            bounds = new EVUI.Modules.Dom.DomHelper(clipSettings.clipBounds).offset();
        }
        else //otherwise, take the clip bounds that were provided and supplement values from the pane.
        {
            bounds.left = (typeof clipSettings.clipBounds.left !== "number") ? window.scrollX : clipSettings.clipBounds.left;
            bounds.right = (typeof clipSettings.clipBounds.right !== "number") ? window.scrollY : clipSettings.clipBounds.right;
            bounds.bottom = (typeof clipSettings.clipBounds.bottom !== "number") ? window.scrollY + win.outerHeight() : clipSettings.clipBounds.bottom;
            bounds.top = (typeof clipSettings.clipBounds.top !== "number") ? scrollX + win.outerWidth() : clipSettings.clipBounds.top;
        }

        return bounds;
    };

     /******************************************************************************RESIZING/POLLING**************************************************************************************************/

    /**Resizes the pane by adding new CSS classes to it that override the default positioning CSS classes.
    @param {InternalPaneEntry} entry The Pane being resized or moved.
    @param {EVUI.Modules.Panes.PaneResizeMoveArgs} resizeArgs The arguments about how it will be resized.
    @param {EVUI.Modules.Dom.DomHelper} helper An DomHelper wrapping the Pane being manipulated.
    @param {Boolean} resized Whether or not the pane was only resized.
    @param {Boolean} moved Whether or not the pane was only moved.
    @param {DragHandles} dragHandles If the pane was resized, these are the details of the trigger for the resizing via a drag operation.
    @param {EVUI.Modules.Dom.ElementBounds} clipBounds The clipping bounds for the move or resize operation.*/
    var resizePane = function (entry, resizeArgs, helper, resized, moved, dragHandles, clipBounds)
    {
        if (moved === true)
        {
            if (clipBounds != null) //if we're clipping, make sure we shift it back into bounds before actually applying the move CSS
            {
                var clippedBounds = shiftMovedPaneToBounds(entry, resizeArgs, clipBounds);
                if (clippedBounds != null)
                {
                    if (clippedBounds.left === resizeArgs.left && clippedBounds.top === resizeArgs.top) return;

                    resizeArgs.left = clippedBounds.left;
                    resizeArgs.top = clippedBounds.top;
                }
            }

            var movedSelector = getSelector(entry, EVUI.Modules.Panes.Constants.CSS_Moved);
            _settings.stylesheetManager.removeRules(_settings.cssSheetName, movedSelector);

            var rules =
            {
                position: "absolute",
                top: resizeArgs.top + "px",
                left: resizeArgs.left + "px"
            }

            _settings.stylesheetManager.setRules(_settings.cssSheetName, movedSelector, rules);
            helper.addClass(EVUI.Modules.Panes.Constants.CSS_Moved);
            entry.link.lastResizeArgs = resizeArgs;
        }

        if (resized === true)
        {
            var resizedSelector = getSelector(entry, EVUI.Modules.Panes.Constants.CSS_Resized);
            var style = getComputedStyle(entry.link.pane.element);
            var minWidth = style.minWidth;
            var minHeight = style.minHeight;

            if (minWidth != null)
            {
                minWidth = parseFloat(minWidth.replace("px", ""));
                if (isNaN(minWidth) === true) minWidth = null;
            }

            if (minHeight != null)
            {
                minHeight = parseFloat(minHeight.replace("px", ""));
                if (isNaN(minHeight) === true) minHeight = null;
            }

            var minDimension = entry.link.pane.resizeMoveSettings.dragHanldeMargin * 2.5;
            if (minWidth == null || minWidth < minDimension) minWidth = minDimension;
            if (minHeight == null || minHeight < minDimension) minHeight = minDimension;

            var shrankX = false;
            var shrankY = false;

            if (clipBounds != null) //if we're clipping, make sure the resized bounds are within the clip zone 
            {
                var position = new EVUI.Modules.Panes.PanePosition();
                position.bottom = resizeArgs.top + resizeArgs.height;
                position.left = resizeArgs.left;
                position.right = resizeArgs.left + resizeArgs.width;
                position.top = resizeArgs.top;

                if (isOutOfBounds(position, clipBounds, "left") === true)
                {
                    resizeArgs.left = clipBounds.left;
                    resizeArgs.width = position.right - clipBounds.left;
                }

                if (isOutOfBounds(position, clipBounds, "right") === true)
                {
                    resizeArgs.width = clipBounds.right - position.left;
                }

                if (isOutOfBounds(position, clipBounds, "top") === true)
                {
                    resizeArgs.top = clipBounds.top;
                    resizeArgs.height = position.bottom - clipBounds.top;
                }

                if (isOutOfBounds(position, clipBounds, "bottom") === true)
                {
                    resizeArgs.height = clipBounds.bottom - position.top;
                }
            }

            //ensure that we don't shrink beyond the minimum allowable size. If there's one in CSS we use that, if not we use 2.5 times the drag buffer zone so that the drag zones for all sized never overlap.
            //there is an issue here where it can cause a jittering effect on the bottom or right side, we have code below to correct that issue. The problem is the mouse is moving so fast that it gets into
            //a bad state where neither the left nor the width is correct.
            if (minHeight > resizeArgs.height || minWidth > resizeArgs.width)
            {
                if (entry.link.lastResizeArgs != null)
                {
                    if (minHeight > resizeArgs.height)
                    {
                        resizeArgs.height = minHeight;
                        resizeArgs.top = (dragHandles != null) ? dragHandles.originalBounds.top : entry.link.lastResizeArgs.top;
                        shrankY = true;
                    }

                    if (minWidth > resizeArgs.width)
                    {
                        resizeArgs.width = minWidth;
                        resizeArgs.left = (dragHandles != null) ? dragHandles.originalBounds.left : entry.link.lastResizeArgs.left;
                        shrankX = true;
                    }
                }
            }

            //sometimes the above logic gets it "wrong" when the mouse moves very, very fast, so we have to restore the size of the element to be its original size and position to stop the displacement jitter that happens otherwise.
            //it only happens when dragging the top or left hand side of the pane, never the right or bottom. Because this is remembered on the next iteration, it only fires when the problem scenario occurs.
            if (dragHandles != null && entry.link.lastResizeArgs != null)
            {
                if (dragHandles.growX === "left")
                {
                    var right = resizeArgs.left + resizeArgs.width;
                    var oldRight = entry.link.lastResizeArgs.left + entry.link.lastResizeArgs.width;

                    if (right != oldRight) //see if the right shifted either direction to the right or left. If so, restore it to the original position. The left is in flux, but the right must stay the same.
                    {
                        resizeArgs.left = dragHandles.originalBounds.left;
                        resizeArgs.width = dragHandles.originalBounds.right - dragHandles.originalBounds.left;

                        if (shrankX === true) //if it shrank back to the minimum size, don't reset the width
                        {
                            resizeArgs.width = minWidth;
                            resizeArgs.left = dragHandles.originalBounds.right - minWidth;
                        }
                    }
                }

                if (dragHandles.growY === "top") 
                {
                    var bottom = resizeArgs.top + resizeArgs.height;
                    var oldBottom = entry.link.lastResizeArgs.top + entry.link.lastResizeArgs.height;

                    if (bottom != oldBottom) //see if the bottom shifted up or down. If so, restore it to its original position. The top is in flux, but the bottom should never move.
                    {
                        resizeArgs.top = dragHandles.originalBounds.top;
                        resizeArgs.height = dragHandles.originalBounds.top - dragHandles.originalBounds.bottom;

                        if (shrankY === true)  //if it shrank back to the minimum size, don't reset the height
                        {
                            resizeArgs.height = minHeight;
                            resizeArgs.top = dragHandles.originalBounds.bottom - minHeight;
                        }
                    }
                }
            }          


            _settings.stylesheetManager.removeRules(_settings.cssSheetName, resizedSelector);

            var rules = {};

            rules.position = "absolute";
            rules.height = resizeArgs.height + "px";
            rules.width = resizeArgs.width + "px";
            rules.top = resizeArgs.top + "px";
            rules.left = resizeArgs.left + "px";

            _settings.stylesheetManager.setRules(_settings.cssSheetName, resizedSelector, rules);
            helper.addClass(EVUI.Modules.Panes.Constants.CSS_Resized);

            entry.link.lastResizeArgs = resizeArgs;
        }

        if (moved === false && resized === false) return false;

        applyTransition(entry, resizeArgs.resizeTransition, EVUI.Modules.Panes.Constants.CSS_Transition_Adjust, helper)

        return true;
    };

    var shiftMovedPaneToBounds = function (entry, resizeArgs, clipBounds)
    {
        var currentPosition = new EVUI.Modules.Panes.PanePosition(EVUI.Modules.Panes.PanePositionMode.AbsolutePosition);
        currentPosition.top = resizeArgs.top;
        currentPosition.left = resizeArgs.left;
        currentPosition.bottom = resizeArgs.top + resizeArgs.height;
        currentPosition.right = resizeArgs.left + resizeArgs.width;

        var observer = new EVUI.Modules.Observers.ObjectObserver(currentPosition);
        shiftToBounds(entry, currentPosition, clipBounds);
        if (observer.getChanges().length > 0) return currentPosition;        

        return null;        
    }

    /******************************************************************************EVENTS**************************************************************************************************/

    /**Clears all the hooked up events from the Pane.
    @param {InternalPaneEntry} entry The Pane having its events unhooked.*/
    var clearEvents = function (entry)
    {
        var numEvents = entry.link.eventBindings.length;
        for (var x = 0; x < numEvents; x++)
        {
            entry.link.eventBindings[x].detach();
        }

        entry.link.eventBindings = [];
    };

    /**Attaches all the automatic events to the Pane. 
    @param {InternalPaneEntry} entry The Pane having its events hooked up.*/
    var hookUpEvents = function (entry)
    {
        if (entry.link.pane.element == null) return;

        clearEvents(entry);

        hookUpExplicitCloseZones(entry);
        hookUpAutoCloseMode(entry);
        hookUpKeydownClose(entry);
        hookUpDrag(entry);
        hookUpResize(entry);
        _settings.hookUpEventHandlers(entry.publicEntry);
    };

    /**Hooks up any child elements of the Pane with the appropriate attribute on them to be auto-close zones for the Pane.
    @param {InternalPaneEntry} entry The Pane having its close zones attached.*/
    var hookUpExplicitCloseZones = function (entry)
    {
        if (entry.link.pane.element == null) return;

        var attributeName = getAttributeName(EVUI.Modules.Panes.Constants.Attribute_Close);

        var closeZones = new EVUI.Modules.Dom.DomHelper("[" + attributeName + "]", entry.link.pane.element);
        var numZones = closeZones.elements.length;
        for (var x = 0; x < numZones; x++)
        {
            var handler = new EVUI.Modules.Panes.PaneEventBinding(attributeName, "click", closeZones.elements[x], function (event)
            {
                var context = new EVUI.Modules.Panes.PaneAutoTriggerContext();
                context.triggerType = EVUI.Modules.Panes.PaneAutoCloseTriggerType.Explicit;
                context.browserEvent = event;
                context.eventBinding = handler;
                context.target = entry.link.wrapper == null ? entry.link.pane : entry.link.wrapper;

                if (typeof entry.link.pane.autoCloseSettings.autoCloseFilter === "function" && entry.link.pane.autoCloseSettings.autoCloseFilter(context) === false) return;

                _self.hidePane(entry.paneID, {
                    context: context,
                });

                event.stopPropagation();
            });

            handler.attach();
            entry.link.eventBindings.push(handler);
        }
    };

    /**Hooks up click listeners on the document that will close the Pane on the next global or exterior click.
    @param {InternalPaneEntry} entry The Pane being hooked to the close events.*/
    var hookUpAutoCloseMode = function (entry)
    {
        if (entry.link.pane.element == null || entry.link.pane.autoCloseSettings == null) return;

        if (entry.link.pane.autoCloseSettings.closeMode === EVUI.Modules.Panes.PaneCloseMode.Click) //a click anywhere will close the Pane
        {
            var handler = new EVUI.Modules.Panes.PaneEventBinding(EVUI.Modules.Panes.PaneCloseMode.Click, "click contextmenu", document, function (event)
            {
                var context = new EVUI.Modules.Panes.PaneAutoTriggerContext();
                context.triggerType = EVUI.Modules.Panes.PaneAutoCloseTriggerType.Click;
                context.browserEvent = event;
                context.eventBinding = handler;
                context.target = entry.link.wrapper == null ? entry.link.pane : entry.link.wrapper;

                handler.detach();
                shouldAutoClose(context, entry, function (shouldClose)
                {
                    if (shouldClose === true)
                    {
                        _self.hidePane(entry.paneID, {
                            context: context
                        }, function ()
                        {
                            if (EVUI.Modules.Core.Utils.hasFlag(entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Visible) === true)
                            {
                                handler.attach();
                            }
                        });
                    }
                    else
                    {
                        handler.attach();
                    }
                });
            });

            handler.attach();
            entry.link.eventBindings.push(handler);
        }
        else if (entry.link.pane.autoCloseSettings.closeMode === EVUI.Modules.Panes.PaneCloseMode.ExteriorClick) //only a click outside the Pane's root element will close the Pane
        {
            var handler = new EVUI.Modules.Panes.PaneEventBinding(EVUI.Modules.Panes.PaneCloseMode.ExteriorClick, "click contextmenu", document, function (event)
            {
                var context = new EVUI.Modules.Panes.PaneAutoTriggerContext();
                context.triggerType = EVUI.Modules.Panes.PaneAutoCloseTriggerType.ExteriorClick;
                context.browserEvent = event;
                context.eventBinding = handler;
                context.target = entry.link.wrapper == null ? entry.link.pane : entry.link.wrapper;

                //make sure the click comes from outside the Pane
                if ((typeof entry.link.pane.autoCloseSettings.autoCloseFilter === "function" && entry.link.pane.autoCloseSettings.autoCloseFilter(context) === true) || //if the filter says it shouldn't be closed, don't hide it
                    EVUI.Modules.Core.Utils.containsElement(event.target, entry.link.pane.element) === true || //or if the element target is contained by the element, don't hide it
                    event.target === entry.link.pane.element) return; //or if the element target is the Pane itself, don't hide it

                handler.detach();
                shouldAutoClose(context, entry, function (shouldClose)
                {
                    if (shouldClose === true)
                    {
                        _self.hidePane(entry.paneID, {
                            context: context
                        }, function ()
                        {
                            if (EVUI.Modules.Core.Utils.hasFlag(entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Visible) === true)
                            {
                                handler.attach();
                            }
                        });
                    }
                    else
                    {
                        handler.attach();
                    }
                });
            });

            handler.attach();
            entry.link.eventBindings.push(handler);
        }
    };

    /**Hooks up an event listener on the document level listening for a keystroke that will close the Pane. 
    @param {InternalPaneEntry} entry The Pane that will be closed.*/
    var hookUpKeydownClose = function (entry)
    {
        if (entry.link.pane.element == null || entry.link.pane.autoCloseSettings == null) return;
        if (entry.link.pane.autoCloseSettings.autoCloseKeys == null || EVUI.Modules.Core.Utils.isArray(entry.link.pane.autoCloseSettings.autoCloseKeys) === false) return;

        var handler = new EVUI.Modules.Panes.PaneEventBinding("autoCloseKey", "keydown", document, function (event)
        {
            if (entry.link.pane.autoCloseSettings.autoCloseKeys == null || EVUI.Modules.Core.Utils.isArray(entry.link.pane.autoCloseSettings.autoCloseKeys) === false) return;
            if (entry.link.pane.autoCloseSettings.autoCloseKeys.indexOf(event.key) === -1) return;

            var context = new EVUI.Modules.Panes.PaneAutoTriggerContext();
            context.triggerType = EVUI.Modules.Panes.PaneAutoCloseTriggerType.KeyDown;
            context.browserEvent = event;
            context.eventBinding = handler;
            context.target = entry.link.wrapper == null ? entry.link.pane : entry.link.wrapper;

            handler.detach();
            shouldAutoClose(context, entry, function (shouldClose)
            {
                if (shouldClose === true)
                {
                    _self.hidePane(entry.paneID, {
                        context: context
                    }, function ()
                    {
                        if (EVUI.Modules.Core.Utils.hasFlag(entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Visible) === true)
                        {
                            handler.attach();
                        }
                    });
                }
                else
                {
                    handler.attach();
                }
            });
        });

        handler.attach();
        entry.link.eventBindings.push(handler);
    };

    /**Handles the pseudo-event for determining if the Pane should auto-close given one of the auto-close triggers. Handles both an async and sync case for a handler.
    @param {EVUI.Modules.Panes.PaneAutoTriggerContext} context The context of what caused the automatic closure of the Pane.
    @param {InternalPaneEntry} entry
    @param {Function} callback */
    var shouldAutoClose = function (context, entry, callback)
    {
        if (typeof entry.link.pane.autoCloseSettings.autoCloseFilter !== "function") return callback(true);

        var value = entry.link.pane.autoCloseSettings.autoCloseFilter(context);
        if (EVUI.Modules.Core.Utils.isPromise(value) === true)
        {
            value.then(function (result)
            {
                callback(result);
            }).catch(function(ex)
            {
                EVUI.Modules.Core.Utils.log(ex.stack);
                callback(false);
            });
        }
        else
        {
            callback(value);
        }
    };

    /**Hooks up the drag event handler to a child element of the root Pane element.
    @param {InternalPaneEntry} entry The entry representing the Pane that is having its drag handlers attached.*/
    var hookUpDrag = function (entry)
    {
        if (entry.link.pane.element == null || (entry.link.pane.resizeMoveSettings != null && entry.link.pane.resizeMoveSettings.canDragMove !== true)) return;
        var attributeName = getAttributeName(EVUI.Modules.Panes.Constants.Attribute_Drag);

        var paneRoot = new EVUI.Modules.Dom.DomHelper(entry.link.pane.element);
        var eles = new EVUI.Modules.Dom.DomHelper("[" + attributeName + "]", entry.link.pane.element).elements.slice();
        if (entry.link.pane.element.matches("[" + attributeName + "]") === true)
        {
            eles.unshift(entry.link.pane.element);
        }
        var numEles = eles.length;
        if (numEles === 0) return;

        for (var x = 0; x < numEles; x++)
        {
            var curEle = eles[x];
            var handler = new EVUI.Modules.Panes.PaneEventBinding(attributeName, "mousedown", curEle, function (downEvent)
            {
                _settings.stylesheetManager.ensureSheet(_settings.cssSheetName, { lock: true });
                var startPos = entry.link.pane.currentPosition;
                if (getDragHandles(entry, startPos, downEvent) != null) return;
                entry.link.lastResizeArgs = null;

                var startX = downEvent.clientX;
                var startY = downEvent.clientY;

                var bounds = (entry.link.lastShowSettings.clipSettings != null && entry.link.lastShowSettings.clipSettings.mode === EVUI.Modules.Panes.PaneClipMode.Shift) ? getClipBounds(entry.link.lastShowSettings.clipSettings) : null;

                downEvent.preventDefault();
                downEvent.stopPropagation();

                var dragHandler = function (dragEvent)
                {
                    dragEvent.preventDefault();
                    dragEvent.stopPropagation();

                    var xDelta = dragEvent.clientX - startX;
                    var yDelta = dragEvent.clientY - startY;

                    var resizeArgs = new EVUI.Modules.Panes.PaneResizeMoveArgs();
                    resizeArgs.height = (startPos.bottom - startPos.top);
                    resizeArgs.width = (startPos.right - startPos.left);
                    resizeArgs.top = startPos.top + yDelta;
                    resizeArgs.left = startPos.left + xDelta;
                    resizeArgs.resizeTransition = (entry.link.pane.showSettings.reclacSettings != null) ? entry.link.pane.showSettings.reclacSettings.recalcTransition : null;

                    resizePane(entry, resizeArgs, paneRoot, false, true, null, bounds);
                };

                document.addEventListener("mousemove", dragHandler);
                document.addEventListener("mouseup", function (event)
                {
                    document.removeEventListener("mousemove", dragHandler);
                }, { once: true });
            });

            handler.attach();
            entry.link.eventBindings.push(handler);
        }
    };

    /**Hooks up the resize event handler to the root Pane element.
    @param {InternalPaneEntry} entry The Pane having its grow handler hooked up. */
    var hookUpResize = function (entry)
    {
        if (entry.link.pane.element == null) return;
        var paneRoot = new EVUI.Modules.Dom.DomHelper(entry.link.pane.element);

        var handler = new EVUI.Modules.Panes.PaneEventBinding("dragResize", "mousedown", entry.link.pane.element, function (downEvent)
        {
            _settings.stylesheetManager.ensureSheet(_settings.cssSheetName, { locked: true });
            startPos = entry.link.pane.currentPosition;
            var dragHandles = getDragHandles(entry, startPos, downEvent);
            if (dragHandles == null) return; //see if we were in the grow zone with the mouse event. If not, do nothing.

            var startX = downEvent.clientX;
            var startY = downEvent.clientY;
            entry.link.lastResizeArgs = null;           

            var bounds = (entry.link.lastShowSettings.clipSettings != null && entry.link.lastShowSettings.clipSettings.mode === EVUI.Modules.Panes.PaneClipMode.Shift) ? getClipBounds(entry.link.lastShowSettings.clipSettings) : null;

            downEvent.preventDefault();
            downEvent.stopPropagation();

            var dragHandler = function (dragEvent) //handler for handling mouse move events after the drag event has begun.
            {
                dragEvent.preventDefault();
                dragEvent.stopPropagation();

                var xDelta = dragEvent.clientX - startX;
                var yDelta = dragEvent.clientY - startY;

                var resizeArgs = new EVUI.Modules.Panes.PaneResizeMoveArgs();
                resizeArgs.height = (startPos.bottom - startPos.top);
                resizeArgs.width = (startPos.right - startPos.left);
                resizeArgs.top = startPos.top;
                resizeArgs.left = startPos.left;
                resizeArgs.resizeTransition = (entry.link.pane.showSettings.reclacSettings != null) ? entry.link.pane.showSettings.reclacSettings.recalcTransition : null;

                if (dragHandles.growX === "right")
                {
                    resizeArgs.width += xDelta;
                }
                else if (dragHandles.growX === "left")
                {
                    resizeArgs.width -= xDelta;
                    resizeArgs.left += xDelta;
                }

                if (dragHandles.growY === "bottom")
                {
                    resizeArgs.height += yDelta;
                }
                else if (dragHandles.growY === "top")
                {
                    resizeArgs.height -= yDelta; 
                    resizeArgs.top += yDelta;
                }

                resizePane(entry, resizeArgs, paneRoot, true, false, dragHandles, bounds);
            };

            document.addEventListener("mousemove", dragHandler); //add the drag handler to the document
            document.addEventListener("mouseup", function (event) //remove the drag handler once the mouse button comes back up
            {
                document.removeEventListener("mousemove", dragHandler);
            }, { once: true });
        });

        handler.attach();
        entry.link.eventBindings.push(handler);
    };

    /**Determines if a click was on the outside edges of the Pane and within bounds of the drag area to resize the Pane.
    @param {InternalPaneEntry} entry
    @param {EVUI.Modules.Dom.DomHelper} bounds
    @param {MouseEvent} downEvent
    @returns {DragHandles} */
    var getDragHandles = function (entry, bounds, downEvent)
    {
        //first make sure drag resizing is enabled at all
        if (entry.link.pane.resizeMoveSettings == null) return null;
        if (entry.link.pane.resizeMoveSettings.canResizeBottom === false && entry.link.pane.resizeMoveSettings.canResizeLeft === false && entry.link.pane.resizeMoveSettings.canResizeRight === false && entry.link.pane.resizeMoveSettings.canResizeTop === false) return null;

        var mouseX = downEvent.clientX;
        var mouseY = downEvent.clientY;
        var growMargin = entry.link.pane.resizeMoveSettings.dragHanldeMargin;
        var growBounds = new EVUI.Modules.Dom.ElementBounds();

        //make a new set of bounds that is the inset of the main frame that the mouse position has to be between in order to trigger a grow event.
        growBounds.bottom = bounds.bottom - growMargin;
        growBounds.left = bounds.left + growMargin;
        growBounds.right = bounds.right - growMargin;
        growBounds.top = bounds.top + growMargin;

        var growDimensionX = null;
        var growDimensionY = null;

        if (mouseX >= bounds.left && mouseX <= growBounds.left && entry.link.pane.resizeMoveSettings.canResizeLeft === true) growDimensionX = "left";
        if (mouseX >= growBounds.right && mouseX <= bounds.right && entry.link.pane.resizeMoveSettings.canResizeRight === true)
        {
            var fromLeft = mouseX - bounds.left;
            var fromRight = bounds.right - mouseX;

            if (growDimensionX != null)
            {
                if (fromRight < fromLeft) growDimensionX = "right";
            }
            else
            {
                growDimensionX = "right";
            }
        }

        if (mouseY >= bounds.top && mouseY <= growBounds.top && entry.link.pane.resizeMoveSettings.canResizeTop === true) growDimensionY = "top";
        if (mouseY >= growBounds.bottom && mouseY <= bounds.bottom && entry.link.pane.resizeMoveSettings.canResizeBottom === true)
        {
            var fromTop = mouseX - bounds.left;
            var fromBottom = bounds.right - mouseX;

            if (growDimensionY != null)
            {
                if (fromBottom < fromTop) growDimensionY = "bottom";
            }
            else
            {
                growDimensionY = "bottom";
            }
        }

        //no growing
        if (growDimensionX == null && growDimensionY == null) return null;

        var dragHandles = new DragHandles();
        dragHandles.growX = growDimensionX;
        dragHandles.growY = growDimensionY;
        dragHandles.originalBounds = bounds;

        return dragHandles;
    };

    var DragHandles = function ()
    {
        this.growX = null;
        this.growY = null;
        this.originalBounds = null;
    };

    /**Applies a transition to the Pane.
    @param {InternalPaneEntry} entry The entry representing the pane having it's transition applied.
    @param {EVUI.Modules.Panes.PaneTransition} transition The transition to apply.
    @param {String} selector The class name that will be used to add the selector.
    @param {EVUI.Modules.Dom.DomHelper} element The element helper wrapping the element to get the transition.
    @param {EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} callback A callback to call once the operation completes or the function returns without adding a transition.*/
    var applyTransition = function (entry, transition, selector, element, callback)
    {
        if (typeof callback !== "function") callback = function (appliedTransition) { };
        if (entry == null || element == null) return callback(false);

        if (transition != null && transition.css != null) //if we have a transition, apply it instead of simple removing the display property.
        {
            if (transition.keyframes != null)
            {
                _settings.stylesheetManager.setRules(_settings.cssSheetName, transition.keyframes);
            }

            if (typeof transition.css === "string") //if the css is a string, check to see if its a set of properties or selectors
            {
                var match = transition.css.match(/[\:\;]/g);
                if (match == null && match.length === 0) //if the RegEx didn't match, it's (probably) not a rule.
                {
                    selector = transition.css;
                    element.addClass(selector);
                }
            }
            else
            {
                //otherwise make a new style using the provided rules
                _settings.stylesheetManager.setRules(_settings.cssSheetName, getSelector(entry, selector), transition.css);
                element.addClass(selector);
            }

            if (entry.link.transitionTimeoutID !== -1)
            {
                element.removeClass(entry.link.transitionSelector);
                clearTimeout(entry.link.transitionTimeoutID);

                if (typeof entry.link.transitionCallback === "function")
                {
                    entry.link.transitionCallback();
                    entry.link.transitionCallback = null;
                }
            }

            entry.link.transitionCallback = function ()
            {
                entry.link.transitionCallback = null;
                entry.link.transitionTimeoutID = -1;
                entry.link.transitionSelector = null;

                element.removeClass(selector);
                callback(true);
            };

            entry.link.transitionSelector = selector;
            entry.link.transitionTimeoutID = setTimeout(function ()
            {
                if (typeof entry.link.transitionCallback === "function") entry.link.transitionCallback();
            }, transition.duration);
        }
        else //no transition, just show the element
        {
            if (entry.link.transitionTimeoutID !== -1)
            {
                element.removeClass(entry.link.transitionSelector);
                clearTimeout(entry.link.transitionTimeoutID);

                if (typeof entry.link.transitionCallback === "function")
                {
                    entry.link.transitionCallback();
                    entry.link.transitionCallback = null;
                }

                entry.link.transitionSelector = null;
                entry.link.transitionTimeoutID = -1;
            }

            callback(false);
        }
    };

    /******************************************************************************LOADING**************************************************************************************************/

    /**Loads the root element of a Pane.
    @param {InternalPaneEntry} entry The entry representing the pane being loaded.
    @param {EVUI.Modules.Panes.PaneLoadSettings} loadSettings The settings dictating how to load the element.
    @param {EVUI.Modules.Panes.Constants.Fn_LoadCallback} callback The callback to fire once the element has been loaded.*/
    var loadRootElement = function (entry, loadSettings, callback)
    {
        if (typeof callback !== "function") callback = function (success) { };
        if (entry == null || loadSettings == null) return callback(false);

        var mode = getLoadMode(loadSettings);
        if (mode === EVUI.Modules.Panes.PaneLoadMode.None) throw Error("No load mode detected, cannot load root element of " + _settings.objectName + ".");

        if (mode === EVUI.Modules.Panes.PaneLoadMode.ExistingElement)
        {
            entry.link.pane.element = loadSettings.element;
            return callback(true);
        }
        else if (mode === EVUI.Modules.Panes.PaneLoadMode.CSSSelector)
        {
            var ele = new EVUI.Modules.Dom.DomHelper(loadSettings.selector, loadSettings.contextElement);
            if (ele.elements.length === 0) return callback(false);

            entry.link.pane.element = ele.elements[0];
            return callback(true);
        }
        else if (mode === EVUI.Modules.Panes.PaneLoadMode.HTTP)
        {
            return getElementViaHttp(entry, loadSettings, callback)
        }
        else if (mode === EVUI.Modules.Panes.PaneLoadMode.Placeholder)
        {
            return getElementViaPlaceholder(entry, loadSettings, callback);
        }
    };

    /**Determines the mode by which the Pane will be loaded.
    @param {EVUI.Modules.Panes.PaneLoadSettings} loadSettings The settings dictating how to load the element.
    @returns {String}*/
    var getLoadMode = function (loadSettings)
    {
        if (loadSettings.element != null) return EVUI.Modules.Panes.PaneLoadMode.ExistingElement;

        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(loadSettings.selector) === false) return EVUI.Modules.Panes.PaneLoadMode.CSSSelector;

        if (loadSettings.httpLoadArgs != null) return EVUI.Modules.Panes.PaneLoadMode.HTTP;

        if (loadSettings.placeholderLoadArgs != null) return EVUI.Modules.Panes.PaneLoadMode.Placeholder;

        return EVUI.Modules.Panes.PaneLoadMode.None;
    };

    /**Loads the element by making a single HTTP request.
    @param {InternalPaneEntry} entry The entry representing the pane being loaded.
    @param {EVUI.Modules.Panes.PaneLoadSettings} loadSettings The settings dictating how to load the element.
    @param {EVUI.Modules.Panes.Constants.Fn_LoadCallback} callback The callback to fire once the element has been loaded.*/
    var getElementViaHttp = function (entry, loadSettings, callback)
    {
        var htmlRequestArgs = new EVUI.Modules.HtmlLoader.HtmlRequestArgs();
        htmlRequestArgs.httpArgs = loadSettings.httpLoadArgs;

        _settings.htmlLoader.loadHtml(htmlRequestArgs, function (html)
        {
            if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(html) === true)
            {
                EVUI.Modules.Core.Utils.debugReturn(_settings.managerName, "getElementViaHttp", "No HTML was returned from the server, or an error occurred in loading the HTML from the server.");
                return callback(false);
            }

            var contents = new EVUI.Modules.Dom.DomHelper(html);
            if (contents.elements.length === 0)
            {
                EVUI.Modules.Core.Utils.debugReturn(_settings.managerName, "getElementViaHttp", "Could not parse returned HTML into an HTML element.");
                return callback(false);
            }
            else if (contents.elements.length > 1)
            {
                EVUI.Modules.Core.Utils.debugReturn(_settings.managerName, "getElementViaHttp", "Too many elements returned from server, must be exactly one element.");
                return callback(false);
            }
            else
            {
                entry.link.pane.element = contents.elements[0];
                return callback(true);
            }
        });
    };

    /**Loads the element via the placeholder load logic.
    @param {InternalPaneEntry} entry The entry representing the pane being loaded.
    @param {EVUI.Modules.Panes.PaneLoadSettings} loadSettings The settings dictating how to load the element.
    @param {EVUI.Modules.Panes.Constants.Fn_LoadCallback} callback The callback to fire once the element has been loaded.*/
    var getElementViaPlaceholder = function (entry, loadSettings, callback)
    {
        _settings.htmlLoader.loadPlaceholder(loadSettings.placeholderLoadArgs, function (placeholderLoadResult)
        {
            if (placeholderLoadResult.loadedContent == null || placeholderLoadResult.loadedContent.length === 0)
            {
                EVUI.Modules.Core.Utils.debugReturn(_settings.managerName, "getElementViaPlaceholder", "Failed to inject placeholder element.");
                return callback(false);
            }
            else if (placeholderLoadResult.loadedContent.length > 1)
            {
                EVUI.Modules.Core.Utils.debugReturn(_settings.managerName, "getElementViaPlaceholder", "Too many elements returned from server, must be exactly one element.");
                return callback(false);
            }
            else
            {
                entry.link.pane.element = placeholderLoadResult.loadedContent[0];
                callback(true);
            }
        });
    };

    /******************************************************************************UNLOADING**************************************************************************************************/

    /**Unloads the root element of a Pane from the DOM if it was loaded remotely, otherwise it is simply moved and detached from the Pane.
    @param {InternalPaneEntry} entry The entry representing the Pane to have its root element unloaded.
    @returns {Boolean} */
    var unloadRootElement = function (entry)
    {
        if (entry == null) return false;

        var loadMode = getLoadMode(entry.link.lastLoadSettings);
        if (loadMode === EVUI.Modules.Panes.PaneLoadMode.CSSSelector || loadMode === EVUI.Modules.Panes.PaneLoadMode.ExistingElement || loadMode == EVUI.Modules.Panes.PaneLoadMode.None)
        {
            ensureLoadDiv();
            moveToLoadDiv(entry);
            entry.link.pane.element = null;
        }
        else if (loadMode === EVUI.Modules.Panes.PaneLoadMode.HTTP)
        {
            entry.link.pane.element.remove();
            entry.link.pane.element = null;
        }
        else if (loadMode === EVUI.Modules.Panes.PaneLoadMode.Placeholder)
        {
            var placeholderElement = new EVUI.Modules.Dom.DomHelper("[" + EVUI.Modules.HtmlLoader.Constants.Attr_PlaceholderID + "=" + entry.link.lastLoadSettings.placeholderLoadArgs.placeholderID + "]");
            placeholderElement.attr(EVUI.Modules.HtmlLoader.Constants.Attr_ContentLoadState, EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadState.OnDemand);
            placeholderElement.empty();
            entry.link.pane.element = null;
        }

        return true;
    };

    /******************************************************************************HIDING**************************************************************************************************/

    /**Hides the root element of a Pane so that it is no longer visible.
    @param {InternalPaneEntry} entry The entry representing the Pane to be hidden.
    @param {EVUI.Modules.Panes.PaneShowSettings} showSettings The ShowSettings that were last used to show the Pane.
    @param {EVUI.Modules.Panes.PaneTransition} hideTransition The hide transition to apply to the Pane as it disappears.
    @param {Function} callback A callback function that is called once the hide operation is complete.*/
    var hideRootElement = function (entry, showSettings, hideTransition, callback)
    {
        var ele = new EVUI.Modules.Dom.DomHelper(entry.link.pane.element);
        var selector = null;

        applyTransition(entry, hideTransition, EVUI.Modules.Panes.Constants.CSS_Transition_Hide, ele, function ()
        {
            clearEvents(entry);
            removePaneClasses(entry);
            removePaneCSS(entry);
            ele.removeClass(entry.link.transitionSelector);

            var mode = getPositionMode(showSettings);
            if (mode === EVUI.Modules.Panes.PanePositionMode.DocumentFlow)
            {
                ele.hide();
            }
            else
            {
                ensureLoadDiv();
                moveToLoadDiv(entry);
            }

            callback();
        });
    };


    /**Hides the backdrop or moves it back in the z-order if it should not be hidden yet.
    @param {InternalPaneEntry} entry The Pane being closed.
    @param {EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} callback The callback to call once the operation*/
    var hideBackdrop = function (entry, callback)
    {
        if (typeof callback !== "function") callback = function (success) { };

        var anyBeingShown = false;
        var anyStillVisible = false;

        var panesWithBackdrop = getPaneEntry(function (paneEntry) //get any panes that have a backdrop currently set on them
        {
            return paneEntry.pane != entry.link.pane &&
                paneEntry.pane.showSettings != null &&
                paneEntry.pane.showSettings.backdropSettings != null &&
                paneEntry.pane.showSettings.backdropSettings.showBackdrop === true
        }, true); 

        if (panesWithBackdrop != null && panesWithBackdrop.length > 0)
        {
            var panesBeingShown = panesWithBackdrop.filter(function (paneEntry) //if any of the panes with a backdrop is in the process of being shown, 
            {
                return (paneEntry.currentPaneAction === EVUI.Modules.Panes.PaneAction.Show || paneEntry.currentPaneAction === EVUI.Modules.Panes.PaneAction.Load)
            }, true);
            
            var panesStillVisible = panesWithBackdrop.filter(function (paneEntry)
            {
                return EVUI.Modules.Core.Utils.hasFlag(paneEntry.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Visible);
            }, true);

            anyBeingShown = panesBeingShown != null && panesBeingShown.length > 0;
            anyStillVisible = panesStillVisible != null && panesStillVisible.length > 0;
        }

        if (anyBeingShown === false && anyStillVisible === false)
        {
             _settings.backdropManager.hideBackdrop(entry.link.paneCSSName, entry.link.lastShowSettings.backdropSettings, function (success)
            {
                callback(success);
            });
        }
        else if (anyStillVisible === true)
        {
             _settings.backdropManager.setBackdropZIndex();
            callback(true);
        }
        else
        {
            callback(true);
        }
    };

    /******************************************************************************STARTUP**************************************************************************************************/

    /**Normalizes the PaneManagerSettings to not have any gaps in them.*/
    var normalizeSettings = function ()
    {
        if (_settings == null || typeof _settings !== "object")
        {
            _settings = new EVUI.Modules.Panes.PaneManagerSettings();
        }
        else
        {
            _settings = EVUI.Modules.Core.Utils.shallowExtend(_settings, new EVUI.Modules.Panes.PaneManagerSettings(), function (prop, source, target) { return target[prop] == null || (typeof target[prop] === "string" && EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(target[prop])) }); //guarantee that nothing in the final graph is null
        }
        
        _settings.getPaneEntry = getPaneEntry;
        _settings.getPaneEntryAmbiguously = function (paneOrID, addIfMissing)
        {
            var internalEntry = getPaneAmbiguously(paneOrID, addIfMissing);
            if (internalEntry != null) return internalEntry.publicEntry;
        };
        _settings.cloneLoadSettings = cloneLoadSettings;
        _settings.cloneShowSettings = cloneShowSettings;
        if (_settings.backdropManager == null) _settings.backdropManager = new BackdropManager();

        if (_settings.stylesheetManager == null || typeof _settings.stylesheetManager !== "object")
        {
            _settings.stylesheetManager = EVUI.Modules.Styles.Manager;
        }

         //because these are optional dependencies we make special getters that are effectively "lazy" loaders that won't crash if a dependency is missing
        if (_settings.httpManager == null || typeof _settings.httpManager !== "object")
        {
            Object.defineProperty(_settings, "httpManager", {
                get: function ()
                {
                    return EVUI.Modules.Http.Http;
                },
                configurable: false,
                enumerable: true
            });
        }

        if (_settings.htmlLoader == null || typeof _settings.htmlLoader !== "object")
        {
            Object.defineProperty(_settings, "htmlLoader", {
                get: function ()
                {
                    return EVUI.Modules.HtmlLoader.Manager;
                },
                configurable: false,
                enumerable: true
            });
        }

        if (_settings.manager == null) _settings.manager = _self;
    };

    /**Attaches all global references to the PaneManagerSettings object so that they can be shared by instances 
    @param {EVUI.Modules.Panes.PaneManagerSettings} paneSettings The settings to attach all the global variables to. */
    var attachGlobals = function (paneSettings)
    {
        ensureLoadDiv();
        ensureMeasureDiv();
        ensurePlacehmentDiv();

        paneSettings.backdropManager = _settings.backdropManager;
        paneSettings.loadDiv = _settings.loadDiv;
        paneSettings.measureDiv = _settings.measureDiv;
        paneSettings.placementDiv = _settings.placementDiv;     
    };

    normalizeSettings(); //normalize the settings
    _settings.stylesheetManager.ensureSheet(_settings.cssSheetName, { lock: true }); //add a locked sheet to the style sheet manager
};

/**Override settings for specific implementations of the Pane.
@class*/
EVUI.Modules.Panes.PaneManagerSettings = function ()
{
    /**String. The human-readable name of the object being managed.
    @type {String}*/
    this.objectName = EVUI.Modules.Panes.Constants.Default_ObjectName;

    /**String. The human readable name of the manager, used in error reporting.
    @type {String}*/
    this.managerName = EVUI.Modules.Panes.Constants.Default_ManagerName;

    /**String. The prefix to add to the beginning of all CSS classes.
    @type {String}*/
    this.cssPrefix = EVUI.Modules.Panes.Constants.Default_CssPrefix;

    /**String. The name of the CSS sheet where styles will be dynamically added.
    @type {String}*/
    this.cssSheetName = EVUI.Modules.Styles.Constants.DefaultStyleSheetName;

    /**String. The prefix for all the events that the PaneManager will raise.
    @type {String}*/
    this.eventNamePrefix = EVUI.Modules.Panes.Constants.Default_EventNamePrefix;

    /**String. The prefix for all the attributes used by the PaneManager.
    @type {String}*/
    this.attributePrefix = EVUI.Modules.Panes.Constants.Default_AttributePrefix;

    /**Object. The DIV that all Panes will be placed in to be absolutely positioned on the screen.
    @type {HTMLElement}*/
    this.placementDiv = null;

    /**Object. The DIV that all Panes will be injected into when they are first loaded and will be placed in once they are hidden.
    @type {HTMLElement}*/
    this.loadDiv = null;

    /**Object. The DIV that all Panes will be injected into when they are measured so that their position can be calculated.
    @type {HTMLElement}*/
    this.measureDiv = null;

    /**Object. The backdrop manager that controls the optional backdrop settings.
    @type {BackdropManager}*/
    this.backdropManager = null;

    /**Object. An instance of Http module's HttpManager object.
    @type {EVUI.Modules.Http.HttpManager}*/
    this.httpManager = null;

    /**Object. An instance of the HtmlLoaderController module's HtmlLoaderController object.
    @type {EVUI.Modules.HtmlLoader.HtmlLoaderController}*/
    this.htmlLoader = null;

    /**Object. An instance of the Styles module's StylesheetManager object.
    @type {EVUI.Modules.Styles.StyleSheetManager}*/
    this.stylesheetManager = null;

    /**Object. The manager of the Pane derived type being manipulated.
    @type {EVUI.Modules.Panes.PaneManager}*/
    this.manager = null;

    /**Gets the PaneEventArgs created by the PaneManager and transforms them into a more specific type of event arguments.
    @param {EVUI.Modules.Panes.PaneArgsPackage} argsPackage The object representing the Pane's current operation.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event args made for the event.
    @returns {Any}*/
    this.buildEventArgs = function (argsPackage, paneEventArgs) { return paneEventArgs; };

    /**Processes the event args after the event has handled them. 
    @param {EVUI.Modules.Panes.PaneArgsPackage} argsPackage The object representing the Pane's current operation.
    @param {Any} eventArgs The event arguments created in the buildEventArgs function.*/
    this.processReturnedEventArgs = function (argsPackage, eventArgs) { };

    /**Object. The current arguments that will be used to perform an action on a Pane implementation.
    @type {Object}*/
    this.currentActionArgs = null;

    /**Makes or extends an object at the end of the PaneManager's function for applying the changes made to the Pane.
    @param {PaneCreationResult} paneCreateResult The result of creating the pane.
    @returns {EVUI.Modules.Panes.Pane}*/
    this.makeOrExtendObject = function (paneCreateResult) { return paneCreateResult.pane; };

    /**Gets any additional class names that can be applied to the implementation of the Pane.
    @returns {String[]}*/
    this.getAdditionalClassNames = function () { return [] };

    /**Gets an PaneEntry object or an array of them.
    @param {String|EVUI.Modules.Panes.Constants.Fn_PaneEntrySelector} paneIDOrSelector Either the ID of the Pane to get or a function that will select an array of Panes.
    @param {Boolean} getAllMatches Whether or not to get all the matches if a selector function was used or to return just the first match.
    @returns {EVUI.Modules.Panes.PaneEntry|EVUI.Modules.Panes.PaneEntry[]}*/
    this.getPaneEntry = function (paneIDOrSelector, getAllMatches) { };

    /**Gets a Pane's InternalPaneEntry based off of a string ID, a YOLO pane object, or a real pane object.
     @param {String|EVUI.Modules.Panes.Pane} paneOrID The string ID or Pane object to get.
     @param {Boolean} addIfMissing Whether or not to add the pane if it cannot be found.
     @returns {EVUI.Modules.Panes.PaneEntry} */
    this.getPaneEntryAmbiguously = function (paneOrID, addIfMissing) { };

    /**Interprets an action beginning with a browser event. Return false to process normally.
    @param {EVUI.Modules.Panes.Pane} paneSettings The settings to apply onto an existing pane or be used to create a new pane.
    @param {Event} event The event arguments that started a show/hide/load/unload operation.
    @returns {Boolean}*/
    this.interpretBrowserEvent = function (paneSettings, event) { return false; };

    /**Makes a clone of the Pane's PaneLoadSettings.
    @param {EVUI.Modules.Panes.PaneLoadSettings} loadSettings The load settings to clone.
    @returns {EVUI.Modules.Panes.PaneLoadSettings} */
    this.cloneLoadSettings = function (loadSettings) { return loadSettings; }

    /**Makes a clone of the Pane's PaneShowSettings.
    @param {EVUI.Modules.Panes.PaneShowSettings} loadSettings The show settings to clone.
    @returns {EVUI.Modules.Panes.PaneShowSettings} */
    this.cloneShowSettings = function (showSettings) { return showSettings; }

    /**Attaches any additional event handlers required for an implementation of the Pane.
    @param {EVUI.Modules.Panes.PaneEntry} paneEntry The entry representing the Pane to hook an event to.*/
    this.hookUpEventHandlers = function (paneEntry) { };
};

/**Represents a configurable UI element that can be loaded, placed, stretched, and moved arbitrarily.
@class*/
EVUI.Modules.Panes.Pane = function (id, options)
{
    if (typeof id !== "string") throw Error("Invalid input. Id must be a string.");

    var _id = id;    
    var _options = options;
    var _element = null;
    var _helper = null;

    /**String. The unique ID of this Pane. ID's are case-insensitive.
    @type {String}*/
    this.id = null;
    Object.defineProperty(this, "id",
    {
        get: function () { return id; },
        configurable: false,
        enumerable: true,
    });

    /**Object. The root Element of the Pane. Cannot be reset once it has been assigned to via initialization or a load operation, unload the Pane to reset it.
    @type {Element}*/
    this.element = null;
    Object.defineProperty(this, "element",
    {
        get: function () { return _element; },
        set: function (value)
        {
            var setObject =
            {
                element: value,
                paneID: _id,
                setSecret: _options.link.setSecret
            };

            if (typeof _options == null || typeof _options.canSetElement !== "function") throw Error("Failed to set element: Permission denied. Missing internal elementSetter function.");
            if (_options.canSetElement(setObject) === _options.link.setSecret)
            {
                _element = value;

                if (value == null)
                {
                    _helper = null;
                }
                else
                {
                    _helper = new EVUI.Modules.Dom.DomHelper(_element);
                }
            }
            else
            {
                throw Error("Failed to set element: Permission denied. The provided value is invalid, the provided token is invalid, or the Pane is in an unstable state.");
            }
        },
        configurable: false,
        enumerable: true
    });

    /**Object. Settings for how the Pane's element will be loaded or assigned.
    @type {EVUI.Modules.Panes.PaneLoadSettings}*/
    this.loadSettings = new EVUI.Modules.Panes.PaneLoadSettings();

    /**Object. Settings for how the Pane's element will be positioned and displayed.
    @type {EVUI.Modules.Panes.PaneShowSettings}*/
    this.showSettings = new EVUI.Modules.Panes.PaneShowSettings();

    /**Object. Rules for controlling what will cause the Pane to recalculate its position.
    @type {EVUI.Modules.Panes.PaneRecalcSettings}*/
    this.reclacSettings = new EVUI.Modules.Panes.PaneRecalcSettings();

    /**Object. Settings for controlling how the Pane can be resized in response to user action.
    @type {EVUI.Modules.Panes.PaneResizeMoveSettings}*/
    this.resizeMoveSettings = new EVUI.Modules.Panes.PaneResizeMoveSettings();

    /**Object. Settings for controlling how the Pane can be automatically closed.
    @type {EVUI.Modules.Panes.PaneAutoCloseSettings}*/
    this.autoCloseSettings = new EVUI.Modules.Panes.PaneAutoCloseSettings();

    /**Boolean. Whether or not to unload the Pane from the DOM when it is hidden (only applies to elements that were loaded via HTTP). False by default.
    @type {Boolean}*/
    this.unloadOnHide = false;

    /**Object. Calculates and gets the absolute position of the Pane.
    @type {EVUI.Modules.Dom.ElementBounds}*/
    this.currentPosition = null;
    Object.defineProperty(this, "currentPosition",
    {
        get: function ()
        {
            return (_helper != null) ? _helper.offset() : null;
        },
        configurable: false,
        enumerable: true
    });

    /**Number. Calculates and gets the Z-Index of the Pane.
    @type {Number}*/
    this.currentZIndex = -1;
    Object.defineProperty(this, "currentZIndex",
    {
        get: function ()
        {
            if (_element == null)
            {
                return -1
            }
            else
            {
                var zIndex = parseInt(getComputedStyle(_element).zIndex);
                if (isNaN(zIndex) === true) return -1;
                return zIndex;
            }
        },
        configurable: false,
        enumerable: true
    });

    /**Boolean. Whether or not the internal state of the Pane thinks it is visible or not. This will be true after the show process has completed and false after an unload or hide operation has been completed.
    @type {Boolean}*/
    this.isVisible = false;
    Object.defineProperty(this, "isVisible", {
        get: function () { return EVUI.Modules.Core.Utils.hasFlag(options.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Visible) },
        configurable: false,
        enumerable: true
    });

    /**Boolean. Whether or not the internal state of the Pane thinks it is visible or not. This will be true after the load process has completed, even if the element was set directly before the first load operation.
    @type {Boolean}*/
    this.isLoaded = false;
    Object.defineProperty(this, "isLoaded", {
        get: function () { return EVUI.Modules.Core.Utils.hasFlag(options.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Loaded) },
        configurable: false,
        enumerable: true
    });

    /**Boolean. Whether or not the internal state of the Pane thinks it has been initialized or not. This will be true after the onInitialized events fire. */
    this.isInitialized = false;
    Object.defineProperty(this, "isInitialized", {
        get: function () { return EVUI.Modules.Core.Utils.hasFlag(options.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Initialized) },
        configurable: false,
        enumerable: true
    });

    /**Any. Any contextual information to attach to the Pane object.
    @type {Any}*/
    this.context = null;

    /**Event that fires before the load operation begins for the Pane and is not yet in the DOM and cannot be manipulated in this stage, however the currentActionArgs.loadSettings can be manipulated to change the way the Pane's root element will be loaded.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation. The currentActionArgs property will be an instance of PaneLoadArgs.*/
    this.onLoad = function (paneEventArgs)
    {

    };

    /**Event that fires after the load operation has completed for the Pane and is now in the DOM and can be manipulated in this stage. From this point on the Pane's element property cannot be reset..
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation. The currentActionArgs property will be an instance of PaneLoadArgs.*/
    this.onLoaded = function (paneEventArgs)
    {

    };

    /**Event that fires the first time the Pane is shown after being loaded into the DOM, but is not yet visible. After it has fired once, it will not fire again unless the PaneShowArgs.reInitialize property is set to true.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation. The currentActionArgs property will be an instance of PaneShowArgs.*/
    this.onInitialize = function (paneEventArgs)
    {

    };

    /**Event that fires at the beginning of the show process and before the calculations for the Pane's location are made. The Pane is still hidden, but is present in the DOM and can be manipulated. In order for the positioning calculations in the next step to be accurate, all HTML manipulation should occur in this event.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation. The currentActionArgs property will be an instance of PaneShowArgs.*/
    this.onShow = function (paneEventArgs)
    {

    };

    /**Event that fires after the position of the Pane has been calculated and is available to be manipulated through the calculatedPosition property of the PaneEventArgs. If the calculatedPosition or the showSettings are manipulated, the position will be recalculated (the changes made directly to the position take priority over changes made to the showSettings).
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation. The currentActionArgs property will be an instance of PaneShowArgs.*/
    this.onPosition = function (paneEventArgs)
    {

    };

    /**Event that fires once the Pane has been positioned, shown, and had its optional show transition applied and completed. Marks the end of the show process.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation. The currentActionArgs property will be an instance of PaneShowArgs.*/
    this.onShown = function (paneEventArgs)
    {

    };

    /**Event that fires before the Pane has been moved from its current location and hidden. Gives the opportunity to change the hideTransition property of the PaneHideArgs and optionally trigger an unload once the Pane has been hidden.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation. The currentActionArgs property will be an instance of PaneHideArgs.*/
    this.onHide = function (paneEventArgs)
    {

    };

    /**Event that fires after the Pane has been moved from its current location and is now hidden and the hide transition has completed.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation. The currentActionArgs property will be an instance of PaneHideArgs.*/
    this.onHidden = function (paneEventArgs)
    {

    };

    /**Event that fires before the Pane has been (potentially) removed from the DOM and had its element property reset to null.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation. The currentActionArgs property will be an instance of PaneUnloadArgs.*/
    this.onUnload = function (paneEventArgs)
    {
    };

    /**Event that fires after the Pane has been (potentially) removed from the DOM and had its element property reset to null. From this point on the Pane's element property is now settable to a new Element.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation. The currentActionArgs property will be an instance of PaneUnloadArgs.*/
    this.onUnloaded = function (paneEventArgs)
    {

    };

    /**Returns a copy of the internal eventBindings array.
    @returns {EVUI.Modules.Panes.PaneEventBinding[]}*/
    this.getEventBindings = function ()
    {
        return Object.freeze(_options.link.eventBindings.slice());
    };

    /**Adds an event response to a standard browser event to a child element of the Pane element.
    @param {Element} element The child element of the root pane element to attach an event handler to.
    @param {EVUI.Modules.Dom.Constants.Fn_BrowserEventHandler} handler An event handler to be called when the specified events are triggered.
    @param {String|String[]} event Either a single event name, or an array of event names, or a space delineated string of event names to add.*/
    this.addEventBinding = function (element, event, handler)
    {
        var ele = EVUI.Modules.Core.Utils.getValidElement(element);
        if (ele == null) throw Error("Invalid input. Target element must be an object derived from an Element.");
        if (EVUI.Modules.Core.Utils.containsElement(ele, _options.link.pane.element) === false) throw Error("element is not present or the provided element is not a child of the root element.");
        if (typeof handler !== "function") throw Error("Invalid input. Handler must be a function.");
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(event) === true) throw Error("Invalid input. Event must be a non-whitespace string.");
        
        var binding = new EVUI.Modules.Panes.PaneEventBinding(null, event, ele, handler);
        binding.attach();

        options.link.eventBindings.push(binding);
    };
};

/**Settings for controlling how the Pane will automatically close itself in response to user events.
@class*/
EVUI.Modules.Panes.PaneAutoCloseSettings = function ()
{
    /**String. The trigger for what should close the Pane.
    @type {String}*/
    this.closeMode = EVUI.Modules.Panes.PaneCloseMode.Explicit;

    /**Array. An array of characters/key names ("a", "b", "Escape", "Enter" etc) that will automatically trigger the Pane to be hidden when pressed. Corresponds to the KeyboardEvent.key property.
    @type {String[]}*/
    this.autoCloseKeys = [];

    /**An optional function to use to determine if an auto-close event should hide the Pane. Return false to prevent the Pane from being hidden.
    @param {EVUI.Modules.Panes.PaneAutoTriggerContext} autoTriggerContext The context object generated by the event handler.
    @returns {Boolean}*/
    this.autoCloseFilter = function (autoTriggerContext)
    {
        return true;
    };
};

/**Enum for describing the way the Pane should automatically close.
@enum*/
EVUI.Modules.Panes.PaneCloseMode =
{
    /**The Pane should close on the next click.*/
    Click: "globalClick",
    /**The Pane should close on any click outside its bounds.*/
    ExteriorClick: "exteriorClick",
    /**The pane should only close when explicitly closed.*/
    Explicit: "explicit"
};

Object.freeze(EVUI.Modules.Panes.PaneCloseMode);

/**Object for containing mutually exclusive options for how to load the Pane. A Element reference takes precedent over a CSS selector (where only the first result will be used), which takes precedent over a set of Http load arguments which takes precedence over placeholder load arguments.
@class*/
EVUI.Modules.Panes.PaneLoadSettings = function ()
{
    var _element = null;
    var _contextElement = null;

    /**Object. The Element to show as the Pane.
    @type {Element}*/
    this.element = null;
    Object.defineProperty(this, "element",
    {
        get: function ()
        {
            return _element;
        },
        set: function (value)
        {
            if (value != null)
            {
                var ele = EVUI.Modules.Core.Utils.getValidElement(value);
                if (ele == null) throw Error("Invalid input for PaneLoadSettings.element. Must be an object derived from Element.");

                _element = value;
            }
            else
            {
                _element = null;
            }
        },
        configurable: false,
        enumerable: true
    });

    /**String. A CSS selector that is used to go find the Element to show as the Pane. Only the first result is used.
    @type {String}*/
    this.selector = null;

    /**Object. If using a CSS selector to find the root element of a Pane, this is the context limiting element to search inside of.
    @type {Element}*/
    this.contextElement = null;
    Object.defineProperty(this, "contextElement",
    {
        get: function ()
        {
            return _contextElement;
        },
        set: function (value)
        {
            if (value != null)
            {
                var ele = EVUI.Modules.Core.Utils.getValidElement(value);
                if (ele == null) throw Error("Invalid input for PaneLoadSettings.element. Must be an object derived from Element.");

                _contextElement = value;
            }
            else
            {
                _contextElement = null;
            }
        },
        configurable: false,
        enumerable: true
    });

    /**Object. HttpRequestArgs for making a Http request to go get the Pane's HTML.
    @type {EVUI.Modules.Http.HttpRequestArgs}*/
    this.httpLoadArgs = null;

    /**Object. PlaceholderLoadArgs for making a series of Http requests to load the Pane as an existing placeholder.
    @type {EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadArgs}*/
    this.placeholderLoadArgs = null;
};

/**Indicates the method by which the element for the Pane will be obtained.
@enum*/
EVUI.Modules.Panes.PaneLoadMode =
{
    /**No load mode could be determined.*/
    None: "none",
    /**An existing element reference will be used instead of performing a load operation.*/
    ExistingElement: "existing",
    /**An element will be selected using a CSS selector.*/
    CSSSelector: "css",
    /**An element will be loaded via HTTP.*/
    HTTP: "http",
    /**An element will be loaded as a placeholder.*/
    Placeholder: "placeholder"
};
Object.freeze(EVUI.Modules.Panes.PaneLoadMode);

/**Object for containing a set of mutually exclusive directives for describing how to display and position the Pane. positionClass takes precedent, followed by abosolutePosition, followed by relativePosition, followed by anchors, followed by documentFlow, followed by fullscreen.
@class*/
EVUI.Modules.Panes.PaneShowSettings = function ()
{
    /**String. The name of a CSS class (or an array of CSS classes, or a space-separated CSS classes) that are used to position the Pane.
    @type {String|String[]}*/
    this.positionClass = null;

    /**Object. An absolute position for the Pane to be placed at relative to the current view port.
    @type {EVUI.Modules.Panes.PaneAbsolutePosition}*/
    this.absolutePosition = null;

    /**Object. A description for how to position the Pane relative to a x,y point or relative to the edges of another Element.
    @type {EVUI.Modules.Panes.PaneRelativePosition}*/
    this.relativePosition = null;

    /**Object. A description of other elements to anchor the Pane to and stretch it between its top/bottom or left/right bounding elements.
    @type {EVUI.Modules.Panes.PaneAnchors}*/
    this.anchors = null;

    /**Object. A description of how to insert the Pane into the DOM relative to another element.
    @type {EVUI.Modules.Panes.PaneDocumentFlow}*/
    this.documentFlow = null;

    /**Object. Rules for describing the bounds and overflow behavior of the Pane.
    @type {EVUI.Modules.Panes.PaneClipSettings}*/
    this.clipSettings = null;

    /**Boolean. Whether or not to full screen the Pane to cover the entire current view port.
    @type {Boolean}*/
    this.fullscreen = false;

    /**Whether or not to explicitly position the Pane so that it is centered on the screen's current view port.
    @type {Boolean}*/
    this.center = false;

    /**Object. Contains the details of the CSS transition to use to show the Pane (if a transition is desired). If omitted, the Pane is positioned then shown by manipulating the display property directly.
    @type {EVUI.Modules.Panes.PaneTransition}*/
    this.showTransition = null;

    /**Object. Contains the details of the CSS transition to use to hide the Pane (if a transition is desired). If omitted, the Pane is positioned then shown by manipulating the display property directly.
    @type {EVUI.Modules.Panes.PaneTransition}*/
    this.hideTransition = null;

    /**Boolean. Whether or not to include the height and width when positioning the element (when it is not clipped).
    @type {Boolean}*/
    this.setExplicitDimensions = false;

    /**Object. The settings for a backdrop to appear when the Pane is being displayed.
    @type {EVUI.Modules.Panes.PaneBackdropSettings}*/
    this.backdropSettings = null;
};

/**Object for describing how the Pane should be inserted into the document flow relative to another element.
@class*/
EVUI.Modules.Panes.PaneDocumentFlow = function ()
{
    var _relativeElement = null;

    /**Object. The Element (or CSS selector of the Element) that the Pane will be inserted into the document flow relative to.
    @type {Element|String}*/
    this.relativeElement = null;
    Object.defineProperty(this, "relativeElement",
    {
        get: function () { return _relativeElement; },
        set: function (value)
        {
            if (value != null)
            {
                if (typeof value === "string")
                {
                    _relativeElement = value;
                }
                else
                {
                    var ele = EVUI.Modules.Core.Utils.getValidElement(value);
                    if (ele == null) throw Error("Invalid input for PaneDocumentFlow.element. Must be a string or an object derived from an Element..");

                    _relativeElement = ele;
                }
            }
            else
            {
                _relativeElement = null;
            }
        },
        configurable: false,
        enumerable: true
    });

    /**String. A value from EVUI.Modules.Pane.PaneDocumentFlowMode indicating whether or not to append, prepend, or insert before/after the relative element. Appends the Pane as a child to the reference element by default.
    @type {String}*/
    this.mode = EVUI.Modules.Panes.PaneDocumentFlowMode.Append;
};

/**Object for describing the dimensions that the Pane should fit inside of and what to do when it overflows those bounds.
@class*/
EVUI.Modules.Panes.PaneClipSettings = function ()
{
    var _clipBounds = null;

    /**String. A value from the EVUI.Modules.Pane.PaneClipMode enum indicating the behavior when the Pane spills outside of the clipBounds. Defaults to "overflow".
    @type {String}*/
    this.mode = EVUI.Modules.Panes.PaneClipMode.Overflow;

    /**Object. An Element (or CSS selector of an Element) or an ElementBounds object describing the bounds to which the pane will attempt to fit inside. If omitted, the pane's current view port is used.
    @type {Element|EVUI.Modules.Dom.ElementBounds|String}*/
    this.clipBounds = null;
    Object.defineProperty(this, "clipBounds",
    {
        get: function () { return _clipBounds; },
        set: function (value)
        {
            if (value != null)
            {
                if (typeof value.top === "number" && typeof value.bottom === "number" && typeof value.left === "number" && typeof value.right === "number")
                {
                    _clipBounds = value;
                }
                else if (typeof value === "string")
                {
                    _clipBounds = value;
                }
                else
                {
                    var ele = EVUI.Modules.Core.Utils.getValidElement(value);
                    if (ele == null) throw Error("Invalid input for PaneDocumentFlow.element. Must be a string, ElementBounds, or an object derived from an Element..");

                    _clipBounds = ele;
                }
            }
            else
            {
                _clipBounds = null;
            }
        },
        configurable: false,
        enumerable: true
    });

    /**Boolean. Whether or not scrollbars should appear on the X-axis when the Pane has been clipped.
    @type {Boolean}*/
    this.scrollXWhenClipped = false;

    /**Boolean. Whether or not scrollbars should appear on the Y-axis when the Pane has been clipped.
    @type {Boolean}*/
    this.scrollYWhenClipped = false;
};

/**Enum for indicating the behavior of the Pane when it overflows its clipBounds.
@enum*/
EVUI.Modules.Panes.PaneClipMode =
{
    /**When the calculated position of the Pane overflows the clipBounds, it will not be cropped to stay within the clipBounds and will overflow to the outside of the clip bounds.*/
    Overflow: "overflow",
    /**When the calculated position of the Pane overflows the clipBounds, it will be clipped to the maximum dimensions of the clipBounds on the overflowing axes.*/
    Clip: "clip",
    /**When the calculated position of the Pane overflows the clipBounds, it will be shifted in the opposite directions as the overflow to fit within the clipBounds.*/
    Shift: "shift",
};
Object.freeze(EVUI.Modules.Panes.PaneClipMode);

/**Enum for describing the relationship between the relativeElement and Pane in a PaneDocumentFlow object.
@enum*/
EVUI.Modules.Panes.PaneDocumentFlowMode =
{
    /**The Pane is already in the correct position.*/
    Current: "current",
    /**The Pane will be appended under the relativeElment as a child element.*/
    Append: "append",
    /**The Pane will be prepended under the relativeElment as a child element.*/
    Prepend: "prepend",
    /**The Pane will be added before the relativeElment as a sibling element.*/
    Before: "before",
    /**The Pane will be added after the relativeElment as a sibling element.*/
    After: "after"
};
Object.freeze(EVUI.Modules.Panes.PaneDocumentFlowMode);

/**Object for containing the absolute location of the Pane relative to the current view port.
@class*/
EVUI.Modules.Panes.PaneAbsolutePosition = function (options)
{
    var _options = options;
    var _top = 0;
    var _left = 0;

    /**Number. The Y-Coordinate of the top edge of the Pane.*/
    this.top = 0;
    Object.defineProperty(this, "top",
    {
        get: function ()
        {
            if (_options != null)
            {
                var position = new EVUI.Modules.Dom.DomHelper(options.link.pane.element).offset();
                if (position != null) return position.top;
                return -1;
            }
            else
            {
                return _top;
            }
        },
        set: function (value)
        {
            if (_options == null)
            {
                if (typeof value !== "number") throw Error("Must be a number.");
                _top = value;
            }
        }
    });

    /**Number. The X-Coordinate of the left edge of the Pane.*/
    this.left = 0;
    Object.defineProperty(this, "left",
    {
        get: function ()
        {
            if (_options != null)
            {
                var position = new EVUI.Modules.Dom.DomHelper(options.link.pane.element).offset();
                if (position != null) return position.left;
                return -1;
            }
            else
            {
                return _left;
            }
        },
        set: function (value)
        {
            if (_options == null)
            {
                if (typeof value !== "number") throw Error("Must be a number.");
                _left = value;
            }
        }
    });
};

/**Object for containing the relative location of the Pane relative to a given point or reference Element.
@class*/
EVUI.Modules.Panes.PaneRelativePosition = function ()
{
    var _relativeElement = null;

    /**Number. The X-Coordinate to align the Pane to if it is not being aligned with an Element.
    @type {Number}*/
    this.x = 0;

    /**Number. The Y-Coordinate to align the Pane to if it is not being aligned with an Element.
    @type {Number}*/
    this.y = 0;

    /**String. The orientation of the Pane relative to the point or element. "bottom right" by default. If only "left" or "right" is specified, "bottom" is implied; if only "bottom" or "top" is specified, "right" is implied..
    @type {String}*/
    this.orientation = EVUI.Modules.Panes.RelativePositionOrientation.Bottom + " " + EVUI.Modules.Panes.RelativePositionOrientation.Right;

    /**String. The alignment of the Pane relative to the side of the point or element.
    @type {String}*/
    this.alignment = EVUI.Modules.Panes.RelativePositionAlignment.None;

    /**Object. An Element (or CSS selector of an Element) to be used as a point or reference for the Pane to be placed next to. Defers to an x,y point specification.
    @type {Element|String}*/
    this.relativeElement = null;
    Object.defineProperty(this, "relativeElement",
    {
        get: function () { return _relativeElement; },
        set: function (value)
        {
            if (value != null)
            {
                if (typeof value === "string")
                {
                    _relativeElement = value;
                }
                else
                {
                    var ele = EVUI.Modules.Core.Utils.getValidElement(value);
                    if (ele == null) throw Error("Invalid input for RelativePosition.relativeElement. Must be a string or an object derived from an Element.");

                    _relativeElement = ele;
                }
            }
            else
            {
                _relativeElement = null;
            }
        },
        configurable: false,
        enumerable: true
    });
};

/**Object for describing how the Pane will recalculate its position.
@class*/
EVUI.Modules.Panes.PaneRecalcSettings = function ()
{
    /**String. Controls how the Pane will recalculate itself in response to the browser pane resizing. Must be a value from PaneResizeResponseMode.
    @type {String}*/
    this.paneResizeResponse = EVUI.Modules.Panes.PaneResizeResponseMode.None;

    /**Boolean. Whether or not the position of the Pane should be continuously recalculated based on a set interval. Beware of performance implications when using this option.
    @type {Boolean}*/
    this.poll = false;

    /**Number. The number of milliseconds to wait between each recalculation of the Pane's position. Shorter intervals come at a higher performance penalty.
    @type {Number}*/
    this.pollInterval = 150;

    /**Object. The transition to apply when the Pane is resized or moved.
    @type {EVUI.Modules.Panes.PaneTransition}*/
    this.recalcTransition = null;
};

/**Controls how the Pane will recalculate itself in response to the browser pane resizing.
@ennum*/
EVUI.Modules.Panes.PaneResizeResponseMode =
{
    /**The Pane will not resize in response to the browser pane resizing.*/
    None: "none",
    /**The Pane will resize in response to the browser pane resizing on every triggering of the event.*/
    RealTime: "realtime",
    /**The Pane will resize in response to the browser pane resizing after a short delay once the browser has stopped resizing.*/
    OnComplete: "oncomplete"
};
Object.freeze(EVUI.Modules.Panes.PaneResizeResponseMode)

/**Enum set for orientations of a Pane relative to a point or element. Any combination of left/right and top/bottom is valid.
@enum*/
EVUI.Modules.Panes.RelativePositionOrientation =
{
    /**The Pane's right edge will be against the left edge of the relative element or point.*/
    Left: "left",
    /**The Pane's left edge will be against the right edge of the relative element or point.*/
    Right: "right",
    /**The Pane's bottom edge will be against the top edge of the relative element or point.*/
    Top: "top",
    /**The Pane's top edge will be against the bottom edge of the relative element or point.*/
    Bottom: "bottom"
};
Object.freeze(EVUI.Modules.Panes.RelativePositionOrientation);

/**Controls the alignment of the Pane along the X or Y axis when it is positioned relative to an Element.
@enum*/
EVUI.Modules.Panes.RelativePositionAlignment =
{
    /**The axis will not be aligned and will keep its calculated value.*/
    None: "none",
    /**The element will be aligned with the left side of the relative element.*/
    Left: "left",
    /**The element will be aligned with the right side of the relative element.*/
    Right: "right",
    /**The element will be aligned on the center of the x-axis of the relative element.*/
    XCenter: "xcenter",
    /**The element will be aligned on the center of the y-axis of the relative element..*/
    YCenter: "ycenter",
    /**The element will be aligned with the top side of the relative element.*/
    Top: "top",
    /**The element will be aligned with the bottom side of the relative element.*/
    Bottom: "bottom"
};
Object.freeze(EVUI.Modules.Panes.RelativePositionAlignment);

/**Object for containing the elements that a Pane can have its sides be anchored to.
@class*/
EVUI.Modules.Panes.PaneAnchors = function ()
{
    var _top = null;
    var _left = null;
    var _bottom = null;
    var _right = null;

    /**Object. The Element (or CSS selector of the Element) above the Pane whose bottom edge will be the boundary of the top of the Pane.
    @type {Element|String}*/
    this.top = null;
    Object.defineProperty(this, "top",
    {
        get: function () { return _top; },
        set: function (value)
        {
            if (value != null)
            {
                if (typeof value === "string")
                {
                    _top = value;
                }
                else if (value === document || value === window)
                {
                    _top = value;
                }
                else
                {
                    var ele = EVUI.Modules.Core.Utils.getValidElement(value);
                    if (ele == null) throw Error("Invalid input for PaneAnchors.top. Must be a string or an object derived from an Element.");

                    _top = ele;
                }
            }
            else
            {
                _top = null;
            }
        },
        configurable: false,
        enumerable: true
    });


    /**Object. The Element (or CSS selector of the Element) to the Left of the Pane whose right edge will be the boundary of the left side of the Pane.
    @type {Element|String}*/
    this.left = null;
    Object.defineProperty(this, "left",
    {
        get: function () { return _left; },
        set: function (value)
        {
            if (value != null)
            {
                if (typeof value === "string")
                {
                    _left = value;
                }
                else if (value === document || value === window)
                {
                    _left = value;
                }
                else
                {
                    var ele = EVUI.Modules.Core.Utils.getValidElement(value);
                    if (ele == null) throw Error("Invalid input for PaneAnchors.left. Must be a string or an object derived from an Element.");

                    _left = ele;
                }
            }
            else
            {
                _left = null;
            }
        },
        configurable: false,
        enumerable: true
    });

    /**Object. The Element (or CSS selector of the Element) below the Pane whose top edge will be the boundary for the bottom side of the Pane.
    @type {Element|String}*/
    this.bottom = null;
    Object.defineProperty(this, "bottom",
    {
        get: function () { return _bottom; },
        set: function (value)
        {
            if (value != null)
            {
                if (typeof value === "string")
                {
                    _bottom = value;
                }
                else if (value === document || value === window)
                {
                    _bottom = value;
                }
                else
                {
                    var ele = EVUI.Modules.Core.Utils.getValidElement(value);
                    if (ele == null) throw Error("Invalid input for PaneAnchors.bottom. Must be a string or an object derived from an Element.");

                    _bottom = ele;
                }
            }
            else
            {
                _bottom = null;
            }
        },
        configurable: false,
        enumerable: true
    });

    /**Object. The Element (or CSS selector of the Element) to the right of the Pane whose left edge will be the boundary for the right side of the Pane.
    @type {Element|String}*/
    this.right = null;
    Object.defineProperty(this, "right",
    {
        get: function () { return _right; },
        set: function (value)
        {
            if (value != null)
            {
                if (typeof value === "string")
                {
                    _right = value;
                }
                else if (value === document || value === window)
                {
                    _right = value;
                }
                else
                {
                    var ele = EVUI.Modules.Core.Utils.getValidElement(value);
                    if (ele == null) throw Error("Invalid input for PaneAnchors.right. Must be a string or an object derived from an Element.");

                    _right = ele;
                }
            }
            else
            {
                _right = null;
            }
        },
        configurable: false,
        enumerable: true
    });

    /**The alignment to give the X axis when it is not anchored explicitly to a left or right element. Must be a value from EVUI.Modules.Pane.PopInAnchorAlignment.
    @type {String}*/
    this.alignX = EVUI.Modules.Panes.AnchorAlignment.Elastic;

    /**The alignment to give the Y axis when it is not anchored explicitly to a top or bottom element. Must be a value from EVUI.Modules.Pane.PopInAnchorAlignment.
    @type {String}*/
    this.alignY = EVUI.Modules.Panes.AnchorAlignment.Elastic;
};

/**Controls the alignment along the X or Y axis when it would otherwise be ambiguous when only anchored to elements on the opposite axis.
@enum*/
EVUI.Modules.Panes.AnchorAlignment =
{
    /**The axis will not be aligned and will keep its current value.*/
    None: "none",
    /**The anchored element will stretch along the axis to either fit between two opposite anchors or along the same axis of the element it is anchored to (if only one element on the axis is an anchor point).*/
    Elastic: "elastic",
    /**The anchored element will be on the left most edge of top and bottom anchors (whichever is furthest to the left).*/
    Left: "left",
    /**The anchored element will be on the right most edge of top and bottom anchors (whichever is furthest to the right).*/
    Right: "right",
    /**The anchored element will be in the center of an anchored side, or in the "best fit" center of two non-congruent opposite sides.*/
    Center: "center",
    /**The anchored element will be on the top most edge of the left and right anchors (whichever is higher).*/
    Top: "top",
    /**The anchored element will be on the bottom most edge of the left and right anchors (whichever is lower).*/
    Bottom: "bottom"
};
Object.freeze(EVUI.Modules.Panes.AnchorAlignment);

/**A read-only look at a Pane's current state.
@class*/
EVUI.Modules.Panes.PaneEntry = function (paneLink)
{
    if (paneLink == null || typeof paneLink !== "object") throw Error("A PaneEntry cannot exist without a link to its parent PaneManager.")
    var _link = paneLink;
    var _bindingsCopy = paneLink.eventBindings.slice();

    /**Object. The Pane object being managed.
    @type {EVUI.Modules.Panes.Pane}*/
    this.pane = null;
    Object.defineProperty(this, "pane",
    {
        get: function ()
        {
            return _link.pane;
        },
        configurable: false,
        enumerable: true
    });

    /**Object. The wrapper object that the PaneManagerSettings object created for a custom implementation of the PaneManager.
    @type {Object}*/
    this.wrapper = null;
    Object.defineProperty(this, "wrapper",
        {
            get: function ()
            {
                return _link.wrapper;
            },
            configurable: false,
            enumerable: true
        });

    /**Object. The EventStream doing the work for the Pane's operations.
    @type {EVUI.Modules.EventStream.EventStream}*/
    this.eventStream = null;
    Object.defineProperty(this, "eventStream",
    {
        get: function ()
        {
            return _link.eventStream;
        },
        configurable: false,
        enumerable: true
    });


    /**Number. Bit flags indicating the current state of the Pane (initialized, loaded, etc).
    @type {Number}*/
    this.paneStateFlags = EVUI.Modules.Panes.PaneStateFlags.None;
    Object.defineProperty(this, "paneStateFlags",
    {
        get: function ()
        {
            return _link.paneStateFlags;
        },
        configurable: false,
        enumerable: true
    });

    /**String. The current operation the pane is performing (loading, unloading, hiding, showing, etc).
    @type {String}*/
    this.currentPaneAction = EVUI.Modules.Panes.PaneAction.None;
    Object.defineProperty(this, "currentPaneAction",
    {
        get: function ()
        {
            return _link.paneAction;
        },
        configurable: false,
        enumerable: true
    });


    /**Array. An array of all the elements and their event handlers that have been attached in response to the automatically attached event handlers.
    @type {EVUI.Modules.Panes.PaneEventBinding[]}*/
    this.eventBindings = [];
    Object.defineProperty(this, "eventBindings",
    {
        get: function ()
        {
            if (bindingsEqual() === false)
            {
                _bindingsCopy = _link.eventBindings.slice();
                Object.freeze(_bindingsCopy);
            }

            return _bindingsCopy
        },
        configurable: false,
        enumerable: true
    });


    /**The class name that will be added to the root element of the Pane (or other components within the Pane's root element) so it can be identified via CSS.
    @type {String}*/
    this.paneCSSName = null;
    Object.defineProperty(this, "paneCSSName",
    {
        get: function ()
        {
            return _link.paneCSSName;
        },
        configurable: false,
        enumerable: true
    });

    this.lastCalculatedPosition = null;
    Object.defineProperty(this, "lastCalcualtedPosition", {
        get: function () { return _link.lastCalculatedPosition; },
        configurable: false,
        enumerable: true       
    })

    /**Determines if the bindings collections are still the same. */
    var bindingsEqual = function ()
    {
        if (_bindingsCopy.length !== _link.eventBindings.length) return false;

        var numBindings = _bindingsCopy.length;
        for (var x = 0; x < numBindings; x++)
        {
            if (_bindingsCopy[x] !== _link.eventBindings[x]) return false;
        }

        return true;
    };
};

/**Object that represents an automatically generated event handler binding in response to a special attribute's presence on an element.
@class*/
EVUI.Modules.Panes.PaneEventBinding = function (attr, event, element, handler)
{
    var _attribute = attr;
    var _event = event;
    var _handler = handler;
    var _element = element;
    var _active = null;
    var _helper = (element != null) ? new EVUI.Modules.Dom.DomHelper(_element) : null;

    /**String. The name of the attribute the is configured to cause an event binding.
    @type {String}*/
    this.attribute = null;
    Object.defineProperty(this, "attribute",
    {
        get: function () { return _attribute; },
        configurable: false,
        enumerable: true
    });

    /**String. The name of the event that is being bound (i.e. "onclick").*/
    this.event = null;
    Object.defineProperty(this, "event",
    {
        get: function () { return _event; },
        configurable: false,
        enumerable: true
    });

    /**Function. The event handling function.
    @type {Function}*/
    this.handler = null;
    Object.defineProperty(this, "handler",
    {
        get: function () { return _handler; },
        configurable: false,
        enumerable: true
    });

    /**Object. The reference to the Element that has the event handler attached to it.
    @type {Element}*/
    this.element = null;
    Object.defineProperty(this, "element",
    {
        get: function () { return _element; },
        configurable: false,
        enumerable: true
    });

    /**Boolean. Whether or not the handler is currently attached and responding to events.
    @type {Boolean}*/
    this.active = true;
    Object.defineProperty(this, "active",
    {
        get: function () { return _active; },
        configurable: false,
        enumerable: true
    });

    /**Detaches the event handler from the element so that it is no longer executed.*/
    this.detach = function ()
    {
        if (_active === false) return;

        _helper.off(_event, _handler);
        _active = false;
    };

    /**Attaches the event handler to the element.*/
    this.attach = function ()
    {
        if (_active === true) return;

        _helper.on(_event, _handler);
        _active = true;
    };
};

/**The context argument for when an automatic event is triggered from a Pane.
@class*/
EVUI.Modules.Panes.PaneAutoTriggerContext = function ()
{
    /**The type of event that triggered the automatic closure of the Pane. Must be a value from the PaneAutoCloseTriggerType enum.
    @type {String}*/
    this.triggerType = EVUI.Modules.Panes.PaneAutoCloseTriggerType.None;

    /**Object. The event binding triggering the event.
    @type {EVUI.Modules.Panes.PaneEventBinding}*/
    this.eventBinding = null;

    /**Object. The browser's event arguments.
    @type {Event}*/
    this.browserEvent = null;

    /**Object. The Pane or Pane implementation that is the target of the event.
    @type {Object}*/
    this.target = null;
};

/**Enum for describing the type of auto-close method that is being used to automatically close the Pane.
@enum*/
EVUI.Modules.Panes.PaneAutoCloseTriggerType =
{
    /**Default. No trigger type.*/
    None: "none",
    /**The BantPane is being closed due to a click event anywhere in the document.*/
    Click: "globalClick",
    /**The Pane is being closed due to a click outside of itself somewhere in the document.*/
    ExteriorClick: "exteriorClick",
    /**The Pane is being closed due to a keydown event.*/
    KeyDown: "keydown",
    /**The Pane is being closed due to one of its close handles being clicked on.*/
    Explicit: "explicit"
};
Object.freeze(EVUI.Modules.Panes.PaneAutoCloseTriggerType);

/**Object for describing a hide/show transition for a Pane. If omitted, hide and show operations are done via a inlined display: none to be hidden and a restoration of it's previous display value to be shown. This object is used to generate a transition class at runtime that is applied to the Pane's root element after the OnShow/OnHidde events and will delay the OnShown/OnHidden events by the specified duration.
@class*/
EVUI.Modules.Panes.PaneTransition = function ()
{
    /**Object or String. Either class names, a string of CSS rules (without a selector), or an object of key-value pairs of CSS properties to generate a runtime CSS class for.
    @type {Object|String}*/
    this.css = null;

    /**String. CSS definition for a keyframe animation to apply. Note that the keyframe animation's name must appear in the PaneTransition.css property in order to be applied.
    @type {String}*/
    this.keyframes = null;

    /**The duration (in milliseconds) of the transition so that the OnShown/OnHidden events are only fired once the transition is complete.
    @type {Number}*/
    this.duration = 0;
};

/**Object for containing information about how the Pane can be resized in response to user action.
@class*/
EVUI.Modules.Panes.PaneResizeMoveSettings = function ()
{
    /**Boolean. Whether or not the Pane can be moved around via a click and drag operation after the addition of the evui-w-drag-handle attribute to an element on or inside the root element of the Pane. False by default. */
    this.canDragMove = false;

    /**Boolean. Whether or not the top portion of the Y axis can be resized. False by default.
    @type {Boolean}*/
    this.canResizeTop = false;

    /**Boolean. Whether or not the bottom portion of the Y axis can be resized. False by default.
    @type {Boolean}*/
    this.canResizeBottom = false;

    /**Boolean. Whether or not the left portion of the X axis can be resized. False by default.
    @type {Boolean}*/
    this.canResizeLeft = false;

    /**Boolean. Whether or not the right portion of the X axis can be resized. False by default.
    @type {Boolean}*/
    this.canResizeRight = false;

    /**Number. The width in pixels of the margin around the edges of the Pane's root element that will be the clickable zone for triggering a resize operation (in pixels). 15 by default.
    @type {Numner}*/
    this.dragHanldeMargin = 15;

    /**Boolean. Whether or not the dimensions of any resized elements in a Pane will be restored to their original size when the Pane is hidden. True by default.
    @type {Boolean}*/
    this.restoreDefaultOnHide = true;
};

/**Object for configuring a full-screen backdrop to be placed behind a Pane.
@class*/
EVUI.Modules.Panes.PaneBackdropSettings = function ()
{
    /**Boolean. Whether or not to show a backdrop.
    @type {Boolean}*/
    this.showBackdrop = false;

    /**Object or String. Either class names, a string of CSS rules (without a selector), or an object of key-value pairs of CSS properties to generate a runtime CSS class for.
    @type {Object|String}*/
    this.backdropCSS = null;

    /**Object. The transition effect to apply when showing the backdrop.
    @type {EVUI.Modules.Panes.PaneTransition}*/
    this.backdropShowTransition = null;

    /**Object. The transition effect to apply when showing the backdrop.
    @type {EVUI.Modules.Panes.PaneTransition}*/
    this.backdropHideTransition = null;

    /**Number. The opacity of the backdrop. 75% by default.
    @type {Number}*/
    this.backdropOpacity = 0.75;

    /**String. The color of the backdrop. #000000 by default.
    @type {Number}*/
    this.backdropColor = "#000000";
};

/**Event arguments for all of the Pane events.
@class */
EVUI.Modules.Panes.PaneEventArgs = function (entry, currentArgs)
{
    if (entry == null || currentArgs == null) throw Error("Invalid arguments.")

    /**Object. The metadata about the state of the Pane.
    @type {InnerPaneEntry}*/
    var _entry = entry;

    /**Object. The current arguments for the event.
    @type {Object}*/
    var _currentArgs = currentArgs;

    /**The Pane that is having an action performed on it.
    @type {EVUI.Modules.Panes.Pane}*/
    this.pane = null;
    Object.defineProperty(this, "pane",
    {
        get: function () { return _entry.link.pane; },
        configurable: false,
        enumerable: true
    });

    /**String. The unique key current step in the EventStream.
    @type {String}*/
    this.key = null;

    /**Function. Pauses the EventStream, preventing the next step from executing until resume is called.*/
    this.pause = function () { };

    /**Function. Resumes the EventStream, allowing it to continue to the next step.*/
    this.resume = function () { };

    /**Function. Cancels the EventStream and aborts the execution of the Pane operation.*/
    this.cancel = function () { }

    /**Function. Stops the EventStream from calling any other event handlers with the same key.*/
    this.stopPropagation = function () { };

    /**Object. The position of the Pane that has been calculated in using the currentShowSettings.
    @type {EVUI.Modules.Panes.PanePosition}*/
    this.calculatedPosition = null;
    Object.defineProperty(this, "calculatedPosition",
    {
        get: function () { return _entry.link.lastCalculatedPosition; },
        configurable: false,
        enumerable: true
    });

    /**Object. The PaneHide/Show/Load/Unload Arguments being used for the operation.
    @type {EVUI.Modules.Panes.PaneShowArgs|EVUI.Modules.Panes.PaneHideArgs|EVUI.Modules.Panes.PaneLoadArgs|EVUI.Modules.Panes.PaneUnloadArgs}*/
    this.currentActionArgs = null;
    Object.defineProperty(this, "currentActionArgs", {
        get: function () { return _currentArgs },
        configurable: false,
        enumerable: true
    });

    /**Object. Any state value to carry between events.
    @type {Object}*/
    this.context = {};
};

/**Flags for describing the current state of a Pane.
@enum*/
EVUI.Modules.Panes.PaneStateFlags =
{
    /**No flags. Pane is not initialized, loaded, or visible.*/
    None: 0,
    /**Whether or not the Pane has been initialized.*/
    Initialized: 1,
    /**Whether or not the Pane has been loaded into the DOM.*/
    Loaded: 2,
    /**Whether or not the Pane is currently visible.*/
    Visible: 4,
    /**Whether or not the Pane has had its position calculated.*/
    Positioned: 8
};
Object.freeze(EVUI.Modules.Panes.PaneStateFlags);

/**Enum for describing the current action of the Pane.
@enum*/
EVUI.Modules.Panes.PaneAction =
{
    /**Pane is at rest.*/
    None: "none",
    /**Pane is in the process of being shown.*/
    Show: "show",
    /**Pane is in the process of being hidden.*/
    Hide: "hide",
    /**Pane is in the process of being loaded.*/
    Load: "load",
    /**Pane is in the process of being unloaded.*/
    Unload: "unload"    
};
Object.freeze(EVUI.Modules.Panes.PaneAction);

/**Describes the calculated position of a Pane in absolute coordinates. 
@class*/
EVUI.Modules.Panes.PanePosition = function (mode)
{
    var _mode = mode;

    /**String. A value from EVUI.Modules.Pane.PanePositionMode indicating the method used to calculate the coordinates of the Pane's root element.
    @type {String}*/
    this.mode = EVUI.Modules.Panes.PanePositionMode.None;
    Object.defineProperty(this, "mode",
    {
        get: function () { return _mode; },
        configurable: false,
        enumerable: true
    });

    /**Array. An array of strings indicating the class names that will be applied to the Pane's root element.
    @type {String[]}*/
    this.classNames = [];

    /**Number. The top edge of the Pane's root element. Only populated if the mode is absolute, relative, or anchor. 
    @type {Number}*/
    this.top = 0;

    /**Number. The left edge of the Pane's root element. Only populated if the mode is absolute, relative, or anchor.
    @type {Number}*/
    this.left = 0;

    /**Number. The bottom edge of the Pane's root element. Only populated if the mode is absolute, relative, or anchor.
    @type {Number}*/
    this.bottom = 0;

    /**Number. The right edge of the Pane's root element. Only populated if the mode is absolute, relative, or anchor.
    @type {Number}*/
    this.right = 0;

    /**Number. The z-index of the Pane's root element.
    @type {Number}*/
    this.zIndex = 0;
};

/**The mode by which the Pane will be positioned.
@enum*/
EVUI.Modules.Panes.PanePositionMode =
{
    /**Pane has no positioning logic and will appear in the top-left corner of the view port.*/
    None: "none",
    /**Pane has had CSS classes applied to it that dictate its positioning.*/
    PositionClass: "css",
    /**Pane has been placed according to a set of absolute coordinates.*/
    AbsolutePosition: "absolute",
    /**Pane has been placed relative to a point or element.*/
    RelativePosition: "relative",
    /**Pane is anchored between other elements and will stretch to fit between them.*/
    Anchored: "anchor",
    /**Pane is part of the regular document flow.*/
    DocumentFlow: "docflow",
    /**Pane will take up the entire screen or clipping bounds.*/
    Fullscreen: "fullscreen",
    /**Pane will be centered in the middle of the view port.*/
    Centered: "centered"
};
Object.freeze(EVUI.Modules.Panes.PanePositionMode);

/**Global instance of the PaneManager, used for creating and manipulating HTML components that are dynamically inserted and removed from the DOM. Highly configurable, but has no preset default behaviors.
@type {EVUI.Modules.Panes.PaneManager}*/
EVUI.Modules.Panes.Manager = null;
(function ()
{
    var ctor = EVUI.Modules.Panes.PaneManager;
    var manager = null;

    Object.defineProperty(EVUI.Modules.Panes, "Manager", {
        get: function ()
        {
            if (manager == null) manager = new ctor(ctor);
            return manager;
        },
        enumerable: true,
        configurable: false
    });
})();

/**Arguments for showing a Pane.
@class*/
EVUI.Modules.Panes.PaneShowArgs = function ()
{
    /**String. The type of arguments contained within the object.
    @type {String}*/
    this.type = null;
    Object.defineProperty(this, "type", {
        get: function () { return EVUI.Modules.Panes.PaneArgumentType.Show; },
        configurable: false,
        enumerable: false
    });

    /**Any. Any contextual information to pass into the Pane show logic.
    @type {Any}*/
    this.context = null;

    /**Object. The PaneLoadSettings to use if the Pane has not already been loaded.
    @type {EVUI.Modules.Panes.PaneLoadArgs}*/
    this.loadArgs = null;

    /**Object. The PaneShowSettings to use to show the Pane.
    @type {EVUI.Modules.Panes.PaneShowSettings}*/
    this.showSettings = null;

    /**Whether or not to re-initialize the Pane upon showing it.
    @type {Boolean}*/
    this.reInitialize = false;
};

/**Arguments for loading a Pane.
@class*/
EVUI.Modules.Panes.PaneLoadArgs = function ()
{
    /**String. The type of arguments contained within the object.
    @type {String}*/
    this.type = null;
    Object.defineProperty(this, "type", {
        get: function () { return EVUI.Modules.Panes.PaneArgumentType.Show; },
        configurable: false,
        enumerable: false
    });

    /**Any. Any contextual information to pass into the Pane load logic.
    @type {Any}*/
    this.context = null;

    /**Object. The PaneLoadSettings to use if the Pane has not already been loaded.
    @type {EVUI.Modules.Panes.PaneLoadSettings}*/
    this.loadSettings = null;

    /**Boolean. Whether or not to re-load the Pane.
    @type {Boolean}*/
    this.reload = false;
};

/**Arguments for hiding a Pane. 
@class*/
EVUI.Modules.Panes.PaneHideArgs = function ()
{
    /**String. The type of arguments contained within the object.
    @type {String}*/
    this.type = null;
    Object.defineProperty(this, "type", {
        get: function () { return EVUI.Modules.Panes.PaneArgumentType.Hide; },
        configurable: false,
        enumerable: false
    });

    /**Any. Any contextual information to pass into the Pane hide logic.
    @type {Any}*/
    this.context = null;

    /**Object. The hide transition to use to hide the Pane.
    @type {EVUI.Modules.Panes.PaneTransition}*/
    this.paneHideTransition = null;

    /**Arguments to use to optionally unload the Pane once it is hidden.
    @type {EVUI.Modules.Panes.PaneUnloadArgs}*/
    this.unloadArgs = null;
};

/**Arguments for unloading a Pane.
@class*/
EVUI.Modules.Panes.PaneUnloadArgs = function ()
{
    /**String. The type of arguments contained within the object.
    @type {String}*/
    this.type = null;
    Object.defineProperty(this, "type", {
        get: function () { return EVUI.Modules.Panes.PaneArgumentType.Unload; },
        configurable: false,
        enumerable: false
    });

    /**Any. Any contextual information to pass into the Pane hide logic.
    @type {Any}*/
    this.context = null;

    /**Boolean. Whether or not to remove the Pane from the DOM once it has been unloaded.
    @type {Boolean}*/
    this.remove = false;
};

/**Arguments for resizing a Pane.
@class*/
EVUI.Modules.Panes.PaneResizeMoveArgs = function ()
{
    /**String. The type of arguments contained within the object.
    @type {String}*/
    this.type = null;
    Object.defineProperty(this, "type", {
        get: function () { return EVUI.Modules.Panes.PaneArgumentType.MoveResize; },
        configurable: false,
        enumerable: false
    });

    /**Number. The new height of the Pane.
    @type {Number}*/
    this.height = -1;

    /**Number. The new width of the Pane.
    @type {Number}*/
    this.width = -1;

    /**Number. The new top position of the Pane.
    @type {Number}*/
    this.top = -1;

    /**Number. The new left position of the Pane.
    @type {Number}*/
    this.left = -1;

    /**Number. The transition to apply to the Pane when it is resized.
    @type {EVUI.Modules.Panes.PaneTransition}*/
    this.resizeTransition = null;
};

/**A collection of all the possible arguments used to perform an operation on a Pane.
@class*/
EVUI.Modules.Panes.PaneArgsPackage = function (context)
{
    /**String. The original action that was issued. Must be a value from the PaneAction enum.
    @type {String}*/
    this.action = null;

    /**String. The current action being performed. Must be a value from the PaneAction enum.
    @type {String}*/
    this.currentAction = null;

    /**Object. The Pane driving the operation.
    @type {EVUI.Modules.Panes.Pane}*/
    this.pane = null;

    /**Object. The implementation of Pane that is wrapping the Pane.
    @type {Any}*/
    this.wrapper = null;

    /**Object. The arguments being used to show/load the Pane
    @type {EVUI.Modules.Panes.PaneShowArgs} */
    this.showArgs = null;

    /**Object. The arguments being used to load the Pane
    @type {EVUI.Modules.Panes.PaneLoadArgs} */
    this.loadArgs = null;

    /**Object. The arguments being used to hide the Pane.
    @type {EVUI.Modules.Panes.PaneHideArgs}*/
    this.hideArgs = null;

    /**Object. The arguments being used to hide the Pane.
    @type {EVUI.Modules.Panes.PaneUnloadArgs}*/
    this.unloadArgs = null;

    /**Object. The arguments passed into the PaneManagerSettings at the beginning of the operation.
    @type {EVUI.Modules.Panes.PaneArgsPackage}*/
    this.foreignArgs = null;

    /**Any. The contextual information provided by the user about the operation.
    @type {Any}*/
    this.context = context;

    /**Object. The last calculated position of the Pane.
    @type {EVUI.Modules.Panes.PanePosition}*/
    this.lastCalculatedPosition = null;
};

/**Enum for indicating what type of arguments object the PaneEventArgs.currentArguments property is.
@enum*/
EVUI.Modules.Panes.PaneArgumentType =
{
    /**Arguments are PaneShowArgs.*/
    Show: "show",
    /**Arguments are PaneHideArgs.*/
    Hide: "hide",
    /**Arguments are PaneLoadArgs.*/
    Load: "load",
    /**Arguments are PaneUnloadArgs.*/
    Unload: "unload",
    /**Arguments are PaneMoveResizeArgs.*/
    MoveResize: "moveResize"
};
Object.freeze(EVUI.Modules.Panes.PaneArgumentType);

EVUI.Modules.Panes.PaneManagerServices = function ()
{
    /**Object. The HttpManager used to make web requests from the PaneManager.
    @type {EVUI.Modules.Http.HttpManager}*/
    this.httpManager = null;

    /**Object. The HtmlLoaderController used by the PaneManager to load and inject HTML partials.
    @type {EVUI.Modules.HtmlLoader.HtmlLoader}*/
    this.htmlLoader = null;

    /**Object. The StylesheetManager used by the PaneManager to do runtime CSS manipulation.
    @type {EVUI.Modules.Styles.StyleSheetManager}*/
    this.stylesheetManager = null;
};

/**Global instance of the PaneManager, used for creating and manipulating HTML components that are dynamically inserted and removed from the DOM. Highly configurable, but has no preset default behaviors.
@type {EVUI.Modules.Panes.PaneManager}*/
$evui.panes = null;
Object.defineProperty($evui, "panes", {
    get: function () { return EVUI.Modules.Panes.Manager },
    enumerable: true
});

Object.freeze(EVUI.Modules.Panes);

/**Adds a Pane to the PaneManager.
@param {EVUI.Modules.Panes.Pane} yoloPane A YOLO object representing a Pane object. This object is copied onto a real Pane object is then discarded.
@returns {EVUI.Modules.Panes.Pane}*/
$evui.addPane = function (yoloPane)
{
    return EVUI.Modules.Panes.Manager.addPane(yoloPane);
};

/**Shows (and loads, if necessary or if a reload is requested) a Pane asynchronously. Provides a callback that is called call once the Pane operation has completed successfully or otherwise.
@param {EVUI.Modules.Panes.Pane|String} paneOrID Either a YOLO Pane object to extend into the existing Pane, the real Pane reference, or the string ID of the Pane to show.
@param {EVUI.Modules.Panes.PaneShowArgs|EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} paneShowArgs Optional.  The arguments for showing the Pane, or the callback. If omitted or passed as a function, the Pane's existing show/load settings are used instead.
@param {EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} callback Optional. A callback that is called once the operation completes.*/
$evui.showPane = function (paneOrID, paneShowArgs, callback)
{
    return EVUI.Modules.Panes.Manager.showPane(paneOrID, paneShowArgs, callback);
};

/**Awaitable. (and loads, if necessary or if a reload is requested) a Pane asynchronously.
@param {EVUI.Modules.Panes.Pane|String} paneOrID Either a YOLO Pane object to extend into the existing Pane, the real Pane reference, or the string ID of the Pane to show.
@param {EVUI.Modules.Panes.PaneShowArgs} paneShowArgs Optional. The arguments for showing the Pane. If omitted, the Pane's existing show/load settings are used instead.
@returns {Promise<Boolean>}*/
$evui.showPaneAsync = function (paneOrID, paneShowArgs)
{
    return EVUI.Modules.Panes.Manager.showPaneAsync(paneOrID, paneShowArgs);
};

/**Hides (and unloads if requested) a Pane asynchronously. Provides a callback that is called call once the Pane operation has completed successfully or otherwise.
@param {EVUI.Modules.Panes.Pane|String} paneOrID Either a YOLO Pane object to extend into the existing Pane, the real Pane reference, or the string ID of the Pane to hide.
@param {EVUI.Modules.Panes.PaneHideArgs|EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} paneHideArgs Optional. The arguments for hiding a Pane or the callback. If omitted or passed as a function, the Pane's existing hide/unload settings are used instead.
@param {EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} callback Optoinal. A callback that is called once the operation completes.*/
$evui.hidePane = function (paneOrID, paneHideArgs, callback)
{
    return EVUI.Modules.Panes.Manager.hidePane(paneOrID, paneHideArgs, callback);
};

/**Awaitable. Hides (and unloads if requested) a Pane asynchronously. Provides a callback that is called call once the Pane operation has completed successfully or otherwise.
@param {EVUI.Modules.Panes.Pane|String} paneOrID Either a YOLO Pane object to extend into the existing Pane, the real Pane reference, or the string ID of the Pane to hide.
@param {EVUI.Modules.Panes.PaneHideArgs} paneHideArgs Optional. The arguments for hiding a Pane. If omitted, the Pane's existing hide/unload settings are used instead. 
@returns {Promise<Boolean>}*/
$evui.hidePaneAsync = function (paneOrID, paneHideArgs)
{
    return EVUI.Modules.Panes.Manager.hidePaneAsync(paneOrID, paneHideArgs);
};

/*#ENDWRAP(Pane)#*/