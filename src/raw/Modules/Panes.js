/**Copyright (c) 2025 Richard H Stannard
 * 
This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

/**Module for containing a generic, lazy-loaded, EventStream powered UI component that sits on top of other components rather than being injected into the document flow.
@module*/
EVUI.Modules.Panes = {};

EVUI.Modules.Panes.Constants = {};

/**Function for selecting a PaneEntry object. Return true to select the PaneEntry parameter as part of the result set.
@param {EVUI.Modules.Panes.Pane} pane The PaneEntry providing metadata about a Pane object.
@returns {Boolean}*/
EVUI.Modules.Panes.Constants.Fn_PaneSelector = function (pane) { return true; }

/**Function for reporting whether or not a Pane was successfully Loaded.
@param {Boolean} success Whether or not the load operation completed successfully.*/
EVUI.Modules.Panes.Constants.Fn_LoadCallback = function (success) { };

/**Function for reporting whether or not an operation Pane was successful.
@param {Boolean} success Whether or not the operation completed successfully.*/
EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback = function (success) { };

/**Function definition for the event handlers attached to Panes and the PaneManager.
@param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The Pane's event args.*/
EVUI.Modules.Panes.Constants.Fn_PaneEventHandler = function (paneEventArgs) { };

EVUI.Modules.Panes.Constants.CSS_Pane_Style = "evui-pane-style";
EVUI.Modules.Panes.Constants.CSS_Position = "evui-pane-position";
EVUI.Modules.Panes.Constants.CSS_ClippedX = "evui-pane-clipped-x";
EVUI.Modules.Panes.Constants.CSS_ClippedY = "evui-pane-clipped-y";
EVUI.Modules.Panes.Constants.CSS_ScrollX = "evui-pane-scroll-x";
EVUI.Modules.Panes.Constants.CSS_ScrollY = "evui-pane-scroll-y"
EVUI.Modules.Panes.Constants.CSS_Flipped = "evui-pane-flipped";
EVUI.Modules.Panes.Constants.CSS_Moved = "evui-pane-moved";
EVUI.Modules.Panes.Constants.CSS_Resized = "evui-pane-resized";
EVUI.Modules.Panes.Constants.CSS_Backdrop = "evui-pane-backdrop";
EVUI.Modules.Panes.Constants.CSS_Transition_Show = "evui-pane-transition-show";
EVUI.Modules.Panes.Constants.CSS_Transition_Hide = "evui-pane-transition-hide";
EVUI.Modules.Panes.Constants.CSS_Transition_Move = "evui-pane-transition-move";
EVUI.Modules.Panes.Constants.CSS_Transition_Resize = "evui-pane-transition-resize";

/**String. The name of the "template" attribute for the Pane, used to define the initial behavior for a Pane if it is being created and shown from markup.
@type {String}*/
EVUI.Modules.Panes.Constants.Attribute_Template = "evui-pane-template";

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

/**Determines the algorithm used to display a Pane from markup. Must be one of the values from PaneShowMode, optionally followed by {} with the arguments from the corresponding position object populated via JSON. 
Any missing data will be inferred from the Event being used to show the Pane.

For example, relativePosition {orientation: 'bottom', alignment: 'left'} would position the Pane relative to the calling element.
@type {String}*/
EVUI.Modules.Panes.Constants.Attribute_ShowArgs = "evui-pane-show";

EVUI.Modules.Panes.Constants.Event_OnShow = "show";
EVUI.Modules.Panes.Constants.Event_OnHide = "hide";
EVUI.Modules.Panes.Constants.Event_OnUnload = "unload";
EVUI.Modules.Panes.Constants.Event_OnLoad = "load";
EVUI.Modules.Panes.Constants.Event_OnMove = "move";
EVUI.Modules.Panes.Constants.Event_OnResize = "resize";

EVUI.Modules.Panes.Constants.Event_OnShown = "shown";
EVUI.Modules.Panes.Constants.Event_OnHidden = "hidden";
EVUI.Modules.Panes.Constants.Event_OnLoaded = "loaded";
EVUI.Modules.Panes.Constants.Event_OnUnloaded = "unloaded";
EVUI.Modules.Panes.Constants.Event_OnMoved = "moved";
EVUI.Modules.Panes.Constants.Event_OnResized = "resized";

EVUI.Modules.Panes.Constants.Event_OnInitialize = "init";
EVUI.Modules.Panes.Constants.Event_OnPosition = "position";

EVUI.Modules.Panes.Constants.Job_Complete = "job.complete";
EVUI.Modules.Panes.Constants.Job_Preload = "job.preload";
EVUI.Modules.Panes.Constants.Job_Load = "job.load";
EVUI.Modules.Panes.Constants.Job_Initialize = "job.init";
EVUI.Modules.Panes.Constants.Job_Hide = "job.hide";
EVUI.Modules.Panes.Constants.Job_InitialPosition = "job.initialposition";
EVUI.Modules.Panes.Constants.Job_FinalPosition = "job.finalposition";
EVUI.Modules.Panes.Constants.Job_Unload = "job.unload";
EVUI.Modules.Panes.Constants.Job_Move = "job.move";
EVUI.Modules.Panes.Constants.Job_Resize = "job.resize";

EVUI.Modules.Panes.Constants.CssPrefix = "evui-pane";
EVUI.Modules.Panes.Constants.StepPrefix = "evui.pane";

/**The global Z-index reference for all objects that use the pane manager to determine their z-index.
@type {Number}*/
EVUI.Modules.Panes.Constants.GlobalZIndex = null;

/**Special symbol used to make sure the correct object has been passed into the Pane constructor.*/
EVUI.Modules.Panes[Symbol.for("evui-panes")] = null;

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
    Core: Object.freeze({ required: true }),
    EventStream: Object.freeze({ required: true }),
    Styles: Object.freeze({ required: true }),
    Dom: Object.freeze({ required: true }),
    Observers: Object.freeze({ required: true}),
    HtmlLoader: Object.freeze({ required: false }),
    Http: Object.freeze({ required: false })
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

/**Class for managing Pane objects.
@param {EVUI.Modules.Panes.PaneManagerServices} paneManagerServices Controllers for accessing other parts of the EventUI API.
@class*/
EVUI.Modules.Panes.PaneManager = function (paneManagerServices)
{
    if (EVUI.Modules.Core == null) throw Error("Dependency missing: EVUI.Modules.Core is required.");
    EVUI.Modules.Core.Utils.requireAll(EVUI.Modules.Panes.Dependencies);

    //set up the global z-index counter that ensures show operations move the pane to the front of all other panes
    if (EVUI.Modules.Panes.Constants.GlobalZIndex == null)
    {
        var minZIndex = EVUI.Modules.Core.Settings.defaultMinimumZIndex;
        if (typeof minZIndex !== "number") minZIndex = 100;

        EVUI.Modules.Panes.Constants.GlobalZIndex = minZIndex;
    }

    //set up a Symbol that we can use to make sure newly constructed Panes fail if the dependency injected into them is NOT a PaneEntry.
    if (EVUI.Modules.Panes[Symbol.for("evui-panes")] == null)
    {
        EVUI.Modules.Panes[Symbol.for("evui-panes")] = EVUI.Modules.Core.Utils.makeGuid();
    }

    var _self = this; //self reference for closures

    /**Number used to organize the sequence of callbacks when it is otherwise ambiguous.
    @type {Number}*/
    var _callbackCounter = 0;

    /**Array. Internal list for all Widows.
    @type {InternalPaneEntry[]}*/
    var _entries = [];

    /**Object. Special settings for the PaneManager to use.
    @type {PaneSettings}*/
    var _settings = null;

    /**Object. The DIV that all Panes will be placed in to be absolutely positioned on the screen.
    @type {HTMLElement}*/
    var _placementDiv = null;

    /**Object. The DIV that all Panes will be injected into when they are first loaded and will be placed in once they are hidden.
    @type {HTMLElement}*/
    var _loadDiv = null;

    /**Object. The DIV that all Panes will be injected into when they are measured so that their position can be calculated.
    @type {HTMLElement}*/
    var _measureDiv = null;

    /**Array. The order in which position arguments are chosen to be used to set the position of a Pane when it is being shown.
    @type {String[]}*/
    var _showArgsFilter = ["positionClass", "abosolutePosition", "relativePosition", "anchors", "documentFlow", "fullscreen", "centered", "context", "hideTransition", "showTransition", "clipSettings", "backdropSettings"]

    /**Array. The order in which load arguments are chosen to load the Pane that is being shown.
    @type {String[]}*/
    var _loadArgsFilter = ["element", "selector", "contextElement", "httpArgs", "placeholderArgs", "context"];

    /**Array. The order in which hide arguments are chosen to load the Pane that is being shown.
    @type {String[]}*/
    var _hideArgumentFilter = ["context"];

    /**Array. The order in which unload arguments are chosen to load the Pane that is being shown.
    @type {String[]}*/
    var _unloadArgumentFilter = ["context"];

    /**Manager for adding additional events to this controller.
    @type {EVUI.Modules.EventStream.BubblingEventManager}*/
    var _bubblingEvents = new EVUI.Modules.EventStream.BubblingEventManager();

    /**Settings object for dependencies used by this Pane manager.
    @class*/
    var PaneSettings = function ()
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

        /**Object. The backdrop manager used by this PaneManager.
        @type {BackdropManager}*/
        this.backdropManager = null;
    };

    /**Special object injected into the public facing Pane that contains the hooks and dependencies to make sure the Pane object functions properly.
    @class*/
    var PaneLink = function ()
    {
        /**Object. The Pane being managed.
        @type {EVUI.Modules.Panes.Pane}*/
        this.pane = null;

        /**String. A unique identifier for the pane instance used for the positioning CSS class name.
        @type {String}*/
        this.paneCSSName = null;

        /**Object. The EventStream doing the work of the operations for the Pane.
        @type {EVUI.Modules.EventStream.EventStream}*/
        this.eventStream = null;

        /**Object. The bubbling event manager for this Pane.
        @type {EVUI.Modules.EventStream.BubblingEventManager}*/
        this.bubblingEvents = new EVUI.Modules.EventStream.BubblingEventManager();

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

        /**Object. A queue of all the callbacks that have been issued during the current operation.
        @type {CallbackStack[]}*/
        this.callbackStack = [];

        /**Object. The last calculated position of the Pane.
        @type {EVUI.Modules.Panes.PanePosition}*/
        this.lastCalculatedPosition = null;

        /**Object. The last set of ShowSettings used to position the Pane.
        @type {EVUI.Modules.Panes.PaneShowArgs}*/
        this.lastResolvedShowArgs = null;

        /**Object. The last set of load settings used to load the Pane.
        @type {EVUI.Modules.Panes.PaneLoadArgs}*/
        this.lastResolvedLoadArgs = null;

        /**Object. The last used set of resize settings used to position the Pane.
        @type {EVUI.Modules.Panes.PaneResizeArgs}*/
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

        /**Object. The actively running PaneOperationSession for this Pane.
        @type {PaneOperationSession}*/
        this.currentOperation = null;

        /**Object. Whether or not the Pane was removed from it's manager.
        @type {Boolean}*/
        this.removed = false;

        /**String. The rules of the style tag that were inlined on the root element on the Pane.
        @type {String}*/
        this.inlinedStyle = null;
    };


    /**Internal record for keeping track of Panes.
    @class*/
    var InternalPaneEntry = function ()
    {
        /**String. The case-normalized unique ID of the pane.
        @type {String}*/
        this.lowerPaneId = null;

        /**String. The unique ID of the pane.
        @type {String}*/
        this.paneId = null;

        /**Object. The internal read-write source of data for the public facing PaneEntry record.
        @type {PaneLink}*/
        this.link = null;
    };

    InternalPaneEntry[Symbol.for("evui-panes")] = EVUI.Modules.Panes[Symbol.for("evui-panes")];

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

        /**String. The algorithm used to position and insert the Pane into the DOM.
        @type {String}*/
        this.showMode = EVUI.Modules.Panes.PaneShowMode.None;

        /**The user's arguments being used to show/load the Pane
        @type {EVUI.Modules.Panes.PaneShowArgs} */
        this.userShowArgs = null;

        /**The user's arguments being used to load the Pane
        @type {EVUI.Modules.Panes.PaneLoadArgs} */
        this.userLoadArgs = null;

        /**The user's arguments being used to hide the Pane.
        @type {EVUI.Modules.Panes.PaneHideArgs}*/
        this.userHideArgs = null;

        /**The user's arguments being used to hide the Pane.
        @type {EVUI.Modules.Panes.PaneUnloadArgs}*/
        this.userUnloadArgs = null;

        /**The user's arguments being used to move the Pane.
        @type {EVUI.Modules.Panes.PaneMoveArgs}*/
        this.userMoveArgs = null;

        /**The user's arguments being used to resize the Pane.
        @type {EVUI.Modules.Panes.PaneResizeArgs}*/
        this.userResizeArgs = null;

        /**The arguments being used to show/load the Pane
        @type {EVUI.Modules.Panes.PaneShowArgs} */
        this.resolvedShowArgs = null;

        /**The arguments being used to load the Pane
        @type {EVUI.Modules.Panes.PaneLoadArgs} */
        this.resolvedLoadArgs = null;

        /**The arguments being used to hide the Pane.
        @type {EVUI.Modules.Panes.PaneHideArgs}*/
        this.resolvedHideArgs = null;

        /**The arguments being used to hide the Pane.
        @type {EVUI.Modules.Panes.PaneUnloadArgs}*/
        this.resolvedUnloadArgs = null;

        /**The arguments being used to move the Pane.
        @type {EVUI.Modules.Panes.PaneMoveArgs}*/
        this.resolvedMoveArgs = null;

        /**The arguments being used to resize the Pane.
        @type {EVUI.Modules.Panes.PaneResizeArgs}*/
        this.resolvedResizeArgs = null;

        /**Boolean. Whether or not the EventStream should be canceled then restarted with a new chain of events.
        @type {Boolean}*/
        this.cancel = false;

        /**Boolean. Whether or not the EventStream should have a callback added to the current action's callback stack due to multiple calls that are part of the same process. (i.e. a load then a show, the show would continue the load.)
        @type {Boolean}*/
        this.continue = false;

        /**Boolean. Whether or not this event was canceled sometime between when it was queued to run and when it actually ran.
        @type {Boolean}*/
        this.wasCanceled = false;

        /**The step that this step continued on to if there was a continuation.
        @type {PaneOperationSession}*/
        this.continuedTo = null;

        /**Number. The sort order in which this operation's callback will be called.
        @type {Number}*/
        this.callbackOrdinal = _callbackCounter++;

        /**Any. The user's contextual information about the operation.
        @type {Any}*/
        this.context = null;

        /**Object. The PaneOperationSession that was queued to run after this one.
        @type {PaneOperationSession}*/
        this.queuedOpSession = null;

        /**Whether or not this is a queued operation that is chaining off of a prior operation.
        @type {Boolean}*/
        this.isQueued = false;
    };

    var PaneEventArgsIntepretationResult = function ()
    {
        this.entry = null;
        this.userShowArgs = null;
        this.userLoadArgs = null;
        this.userHideArgs = null;
        this.userUnloadArgs = null;
        this.context = null;
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
        QueueCallback: "queuecallback",
        /**Signals that the move steps should be added.*/
        Move: "move",
        /**Signals that the resize steps should be added.*/
        Resize: "resize",
        /**Signals that the operation should be chained to start when the current operation ends.*/
        Queue: "queue"
    };

    /**Object for managing the backdrop used by Panes.
    @class*/
    var BackdropManager = function ()
    {
        var _self = this;

        /**Object representing a pairing of an object's class name to its Z-Index.
        @class*/
        var ZIndexEntry = function (paneId, zIndex)
        {
            /**String. The name of the object in its PaneManager.
            @type {String}*/
            this.paneId = paneId;

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
        var _backdropPaneCssName = null;

        /**String. The name of the CSS style sheet that the backdrop styles go into.
        @type {String}*/
        var _backdropCSSSheetName = EVUI.Modules.Styles.Constants.DefaultStyleSheetName;

        /**All of the Z-Index entries of the elements that have a stack of backdrops.
        @type {ZIndexEntry[]}*/
        var _zIndexStack = [];

        /**Shows a backdrop for a Pane at the given z-index.
        @param {String} paneCSSName The class name of the Pane that needs a backdrop.
        @param {EVUI.Modules.Panes.PaneBackdropSettings} backdropSettings The settings for controlling the style of the backdrop and its transition effect.
        @param {EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} callback A callback function that is fired once the show transition is complete.*/
        this.showBackdrop = function (paneCSSName, zIndex, backdropSettings, callback)
        {
            if (typeof callback !== "function") callback = function (success) { };
            if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(paneCSSName) === true || typeof zIndex !== "number") return callback(false);

            //first, cancel any transition that was in progress
            this.cancelTransition();

            //add or update the z-index entry
            var existingEntry = getZIndexEntry(paneCSSName);
            if (existingEntry == null)
            {
                _zIndexStack.push(new ZIndexEntry(paneCSSName, zIndex))
            }
            else
            {
                existingEntry.zIndex = zIndex;
            }

            //set the backdrop
            _backdropPaneCssName = paneCSSName;
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
            var current = getZIndexEntry(_backdropPaneCssName);

            var next = getNextHighestZIndex(current);
            if (next == null) return;

            _settings.stylesheetManager.removeRules(_backdropCSSSheetName, getDefaultCssSelector(current.paneId));
            _settings.stylesheetManager.setRules(_backdropCSSSheetName, getDefaultCssSelector(_backdropPaneCssName), { zIndex: next.zIndex });
        };

        /**Hides the backdrop.
        @param {String} paneCSSName The class name of the Pane the backdrop is being hidden for.
        @param {EVUI.Modules.Panes.PaneBackdropSettings} backdropSettings The settings for how to hide the backdrop.
        @param {EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} callback A callback that is fired once the hide transition is complete.*/
        this.hideBackdrop = function (paneCSSName, backdropSettings, callback)
        {
            if (typeof callback !== "function") callback = function (success) { };
            if (backdropSettings == null) return callback(false);

            //cancel any transition that is currently happening
            this.cancelTransition();

            _backdropPaneCssName = paneCSSName;

            //apply the removal transition, then actually remove the backdrop. The Pane is "racing" (the PaneManager waits for both to complete before continuing) the transition and is being hidden at the same time as the transition is being applied.
            applyTransition(backdropSettings.backdropHideTransition, EVUI.Modules.Panes.Constants.CSS_Transition_Hide, function (success)
            {
                //remove the z-index entry
                var entry = getZIndexEntry(paneCSSName);
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
        @param {String} paneId The name of the object to get.
        @returns {ZIndexEntry}*/
        var getZIndexEntry = function (paneId)
        {
            var numEntries = _zIndexStack.length;
            for (var x = 0; x < numEntries; x++)
            {
                var curEntry = _zIndexStack[x];
                if (curEntry.paneId === paneId) return curEntry;
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

            //make sure our style sheet is there
            _settings.stylesheetManager.ensureSheet(_backdropCSSSheetName, { lock: true });

            //make sure the backdrop div hasn't been removed
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

            _settings.stylesheetManager.setRules(_backdropCSSSheetName, getDefaultCssSelector(_backdropPaneCssName), defaultSettings);
            _backdropHelper.addClass([EVUI.Modules.Panes.Constants.CSS_Backdrop, _backdropPaneCssName]);

            if (backdropSettings.backdropCSS == null) return;
            var defaultSelector = getDefaultCssSelector(_backdropPaneCssName);

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
            //make sure both the backdrop and our style sheet are both still there
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

            var defaultSelector = getDefaultCssSelector(_backdropPaneCssName);

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

            if (_backdropHelper == null) ensureBackdropDiv();

            //the selector that will apply the transition to the backdrop
            var defaultSelector = getDefaultCssSelector(_backdropPaneCssName) + "." + selector;

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
                    _backdropHelper.addClass([selector, _backdropPaneCssName]);
                }
                else
                {
                    selector = transition.css;
                    _backdropHelper.addClass([transition.css, _backdropPaneCssName]);
                }
            }
            else //otherwise we probably have an object, apply that as well
            {
                _settings.stylesheetManager.setRules(_backdropCSSSheetName, defaultSelector, transition.css);
                _backdropHelper.addClass([selector, _backdropPaneCssName]);
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

    /**Adds a Pane to the PaneManager. If the Pane has already been added, the existing  Pane is returned unmodified.
    @param {EVUI.Modules.Panes.Pane} pane A YOLO object representing a Pane object. This object is copied onto a real Pane object and is then discarded.
    @returns {EVUI.Modules.Panes.Pane}*/
    this.addPane = function (pane)
    {
        if (pane == null) throw Error("Object expected.");
        var entry = makeOrGetPane(pane);

        return entry.link.pane;
    };

    /**Removes a Pane from the PaneManager. Does not unload the Pane's element from the DOM.
    @param {String} paneId The ID of the Pane to remove from the PaneManager.
    @returns {Boolean}*/
    this.removePane = function (paneId)
    {
        if (typeof paneId !== "string") return false;

        var existing = getInternalPaneEntry(paneId);
        if (existing != null)
        {
            var index = _entries.indexOf(existing);
            if (index !== -1) _entries.splice(index, 1);

            existing.link.removed = true;

            return true;
        }

        return false;
    };

    /**Gets a Pane object based on its ID or a predicate function.
    @param {EVUI.Modules.Panes.Constants.Fn_PaneSelector|String} paneIDOrSelector The ID of a Pane or a selector function to select multiple Panes.
    @param {Boolean} returnFirstMatch Whether or not to return the first successful match of the Pane selector function. False by default.
    @returns {EVUI.Modules.Panes.Pane|EVUI.Modules.Panes.Pane[]} */
    this.getPane = function (paneIDOrSelector, returnFirstMatch)
    {
        if (typeof paneIDOrSelector === "string")
        {
            var existing = getInternalPaneEntry(paneIDOrSelector);
            if (existing != null)
            {
                return existing.link.pane;
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
                if (paneIDOrSelector(curEntry.link.pane) === true)
                {
                    if (returnFirstMatch !== true)
                    {
                        results.push(curEntry.link.pane);
                    }
                    else
                    {
                        return curEntry.link.pane;
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

    /**Indicates whether or not a Pane has been shown and is visible in the DOM.
    @param {String} paneId
    @returns {Boolean}*/
    this.isPaneVisible = function (paneId)
    {
        var pane = this.getPane(paneId);
        if (pane == null) return false;

        return pane.isVisible;
    };

    /**Gets an array of all the Panes that are currently shown and are visible in the DOM.
    @returns {EVUI.Modules.Panes.Pane[]}*/
    this.getVisiblePanes = function ()
    {
        return this.getPane(function (pane) { return pane.isVisible; })
    };

    /**Gets all the active Panes registered with this controller.
    @returns {EVUI.Modules.Panes.Pane[]}*/
    this.getPanes = function ()
    {
        return this.getPane(function () { return true });
    };

    /**Returns the z-index of what would be the highest necessary z-index for a Pane to appear on top all other Panes.
    @returns {Number}*/
    this.getTopZIndex = function ()
    {
        return getNextZIndex();
    };

    /**Shows a Pane asynchronously. Provides a callback that is called once the Pane operation has completed successfully or otherwise.
    @param {String|EVUI.Modules.Panes.Pane} paneID Either a Pane object graph to make into a new Pane, a real Pane reference, or the string ID of the Pane to show.
    @param {EVUI.Modules.Panes.PaneShowArgs|EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} paneShowArgs Optional. A PaneShowArgs object graph or the callback. If omitted or passed a function, the Pane's existing show/load settings are used instead.
    @param {EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} callback Optional. A callback that is called once the operation completes.*/
    this.showPane = function (paneID, paneShowArgs, callback)
    {
        var paneEntry = null;

        if (typeof paneID === "string") //showing based on ID
        {
            paneEntry = getInternalPaneEntry(paneID);
            if (paneEntry == null) throw Error("No pane exists with an id of \"" + paneID + "\"");
        }
        else if (paneID instanceof Event) //showing based on an event invocation
        {
            var interpetResult = getPaneFromEventArgs(paneID);
            paneEntry = interpetResult.entry;

            var hadShowArgs = false;

            if (EVUI.Modules.Core.Utils.isObject(paneShowArgs) === false) //user didn't pass in any explicit show args, so we use the ones we found on the event's currentTarget
            {
                if (typeof paneShowArgs === "function") //pane show args is the callback
                {
                    callback = paneShowArgs;
                    paneShowArgs = null;
                }

                paneShowArgs = interpetResult.userShowArgs; //use the show hards taken from the event's currentTarget
                if (EVUI.Modules.Core.Utils.isObject(paneShowArgs) === true)
                {
                    hadShowArgs = true;
                    paneShowArgs.context = interpetResult.context;
                }

                if (EVUI.Modules.Core.Utils.isObject(interpetResult.userLoadArgs) === true) //use the load args also taken from the event's 
                {
                    if (hadShowArgs === true)
                    {
                        paneShowArgs.loadArgs = interpetResult.userLoadArgs;
                    }
                    else //has load args, but no show args, so make a show args to stick the load args onto
                    {
                        paneShowArgs = new EVUI.Modules.Panes.PaneShowArgs();
                        paneShowArgs.loadArgs = interpetResult.userLoadArgs;
                        paneShowArgs.context = interpetResult.context;
                    }

                    paneShowArgs.loadArgs.context = interpetResult.context;
                }
            }
        }
        else if (EVUI.Modules.Core.Utils.isObject(paneID) === true) //we have either a new pane to add or a reference to an existing pane
        {
            paneEntry = makeOrGetPane(paneID);
        }
        else
        {
            throw Error("String or object expected.")
        }

        if (paneEntry == null) throw Error("No pane with an ID of " + paneID + " exists.");

        if (typeof paneShowArgs === "function")
        {
            callback = paneShowArgs;
            paneShowArgs = null;
        }

        if (paneShowArgs == null) //if we had no show args, make blank ones
        {
            paneShowArgs = new EVUI.Modules.Panes.PaneShowArgs();
            paneShowArgs.loadArgs = new EVUI.Modules.Panes.PaneLoadArgs();
        }

        var opSession = new PaneOperationSession();
        opSession.entry = paneEntry;
        opSession.action = EVUI.Modules.Panes.PaneAction.Show;
        opSession.currentAction = EVUI.Modules.Panes.PaneAction.Show;
        opSession.callback = (typeof callback === "function") ? callback : function (success) { };
        opSession.userShowArgs = paneShowArgs;
        opSession.userLoadArgs = paneShowArgs.loadArgs;
        opSession.resolvedShowArgs = resolvePaneShowArgs(paneEntry, paneShowArgs);
        opSession.resolvedLoadArgs = opSession.resolvedShowArgs.loadArgs;
        performOperation(opSession);
    };

    /**Awaitable. Shows a Pane asynchronously.
    @param {String|EVUI.Modules.Panes.Pane} paneID Either a Pane object graph to make into a new Pane, a real Pane reference, or the string ID of the Pane to show.
    @param {EVUI.Modules.Panes.PaneShowArgs} paneShowArgs Optional. A PaneShowArgs object graph. If omitted the Pane's existing show/load settings are used instead.
    @returns {Promise<Boolean>}*/
    this.showPaneAsync = function (paneID, paneShowArgs)
    {
        return new Promise(function (resolve, reject)
        {
            _self.showPane(paneID, paneShowArgs, function (success)
            {
                resolve(success);
            });
        });
    };

    /**Hides a Pane asynchronously. Provides a callback that is called once the Pane operation has completed successfully or otherwise.
    @param {String|EVUI.Modules.Panes.Pane} paneID Either the ID of the Pane to hide or the Pane to hide.
    @param {EVUI.Modules.Panes.PaneHideArgs|EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} paneHideArgs Optional. A PaneHideArgs object graph or a callback function. If omitted or passed a function, the Pane's existing hide/unload settings are used instead.
    @param {EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} callback Optional. A callback that is called once the operation completes.*/
    this.hidePane = function (paneID, paneHideArgs, callback)
    {
        var paneEntry = null;
        if (typeof paneID === "string") //being hidden based on ID
        {
            paneEntry = getPaneEntry(paneID, false);
        }
        else if (paneID instanceof Event) //being hidden by an event
        {
            var interpetResult = getPaneFromEventArgs(paneID, true);

            paneEntry = interpetResult.entry;
            if (EVUI.Modules.Core.Utils.isObject(paneHideArgs) === false) //no hide args passed in, use hide args from event's currentTarget
            {
                if (typeof paneHideArgs === "function") //hide args were the callback
                {
                    callback = paneHideArgs;
                    paneHideArgs = null;
                }

                paneHideArgs = interpetResult.userHideArgs;
                if (EVUI.Modules.Core.Utils.isObject(paneHideArgs) === true)
                {
                    paneHideArgs.context = interpetResult.context;
                }
            }
        }
        else if (EVUI.Modules.Core.Utils.isObject(paneID) === true) //handed an actual pane to look up
        {
            paneEntry = getPaneEntry(paneID.id, false);
        }
        
        if (paneEntry == null) throw Error("No pane with an ID of " + paneID + " exists.");

        if (typeof paneHideArgs === "function") //args were the callback
        {
            callback = paneHideArgs;
            paneHideArgs = null;
        }

        if (paneHideArgs == null) //no args, make dummy ones
        {
            paneHideArgs = new EVUI.Modules.Panes.PaneHideArgs();
            paneHideArgs.unloadArgs = new EVUI.Modules.Panes.PaneUnloadArgs();
        }

        var opSession = new PaneOperationSession();
        opSession.entry = paneEntry;
        opSession.action = EVUI.Modules.Panes.PaneAction.Hide;
        opSession.currentAction = EVUI.Modules.Panes.PaneAction.Hide;
        opSession.callback = (typeof callback === "function") ? callback : function (success) { };
        opSession.userHideArgs = paneHideArgs;
        opSession.userUnloadArgs = (paneHideArgs != null) ? paneHideArgs.unloadArgs : null;
        opSession.resolvedHideArgs = resolvePaneHideArgs(paneEntry, paneHideArgs);
        opSession.resolvedUnloadArgs = opSession.resolvedHideArgs.unloadArgs;

        performOperation(opSession);
    };

    /**Awaitable. Hides a Pane asynchronously.
    @param {String|EVUI.Modules.Panes.Pane} paneID Either the ID of the Pane to hide or the Pane to hide.
    @param {EVUI.Modules.Panes.PaneHideArgs} paneHideArgs Optional. A PaneHideArgs object graph or a callback function. If omitted, the Pane's existing hide/unload settings are used instead.
    @returns {Promise<Boolean>}*/
    this.hidePaneAsync = function (paneID, paneHideArgs)
    {
        return new Promise(function (resolve, reject)
        {
            _self.hidePane(paneID, paneHideArgs, function (success)
            {
                resolve(success);
            });
        });
    };

    /**Asynchronously loads a Pane. Provides a callback that is called after the operation has completed successfully or otherwise.
    @param {EVUI.Modules.Panes.Pane|String} paneID Either a Pane object graph to make into a new Pane, an existing Pane, or the string ID of the Pane to load.
    @param {EVUI.Modules.Panes.PaneLoadArgs|EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} paneLoadArgs Optional. A PaneLoadArgs object graph or a callback. If omitted or passed a function, the Pane's existing load settings are used instead.
    @param {EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} callback Optional. A callback to call once the operation completes.*/
    this.loadPane = function (paneID, paneLoadArgs, callback)
    {
        var paneEntry = null;

        if (typeof paneID === "string") //loading based on ID
        {
            paneEntry = getInternalPaneEntry(paneID);
            if (paneEntry == null) throw Error("No pane exists with an id of \"" + paneID + "\"");
        }
        else if (paneID instanceof Event) //loading from an event
        {
            var interpetResult = getPaneFromEventArgs(paneID);
            paneEntry = interpetResult.entry;

            if (EVUI.Modules.Core.Utils.isObject(paneLoadArgs) === false) //not passed any load args, use the load args from the interpreted event
            {
                if (typeof paneLoadArgs === "function") //load args were the callback
                {
                    callback = paneLoadArgs;
                    paneLoadArgs = null;
                }

                paneLoadArgs = interpetResult.userLoadArgs;
                if (paneLoadArgs != null) paneLoadArgs.context = interpetResult.context;
            }            
        }
        else if (EVUI.Modules.Core.Utils.isObject(paneID) === true) //if we were passed an object, we can make or find the pane
        {
            paneEntry = makeOrGetPane(paneID);
        }
        else
        {
            throw Error("String or object expected.")
        }

        if (paneEntry == null) throw Error("No pane with an ID of " + paneID + " exists.");

        if (typeof paneLoadArgs === "function") //load args were the callback
        {
            callback = paneLoadArgs;
            paneLoadArgs = null;
        }        

        if (paneLoadArgs == null) //no load args - make a dummy
        {
            paneLoadArgs = new EVUI.Modules.Panes.PaneLoadArgs();           
        }

        var opSession = new PaneOperationSession();
        opSession.entry = paneEntry;
        opSession.action = EVUI.Modules.Panes.PaneAction.Load;
        opSession.currentAction = EVUI.Modules.Panes.PaneAction.Load;
        opSession.callback = (typeof callback === "function") ? callback : function (success) { };
        opSession.userLoadArgs = paneLoadArgs;
        opSession.resolvedLoadArgs = resolvePaneLoadArgs(paneEntry.link.pane.loadSettings, paneLoadArgs);

        performOperation(opSession);
    };

    /**Awaitable. Asynchronously loads a Pane.
    @param {EVUI.Modules.Panes.Pane|String} paneID Either a Pane object graph to make into a new Pane, an existing Pane, or the string ID of the Pane to load.
    @param {EVUI.Modules.Panes.PaneLoadArgs} paneLoadArgs Optional. A PaneLoadArgs object graph or a callback. If omitted or passed a function, the Pane's existing load settings are used instead.
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
    @param {EVUI.Modules.Panes.Pane|String} paneID Either the string ID or the Pane reference of the Pane to unload.
    @param {EVUI.Modules.Panes.PaneUnloadArgs|EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} paneUnloadArgs Optional. A PaneUnloadArgs object graph representing arguments for unloading a Pane or a callback. If omitted or passed a function, the Pane's existing unload settings are used instead.
    @param {EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} callback Optional. A callback to call once the operation completes.*/
    this.unloadPane = function (paneID, paneUnloadArgs, callback)
    {
        var paneEntry = null;
        if (typeof paneID === "string")
        {
            paneEntry = getInternalPaneEntry(paneID);
        }
        else if (paneID instanceof Event)
        {
            var interpretResult = getPaneFromEventArgs(paneID, true);
            paneEntry = interpretResult.entry;

            if (EVUI.Modules.Core.Utils.isObject(paneUnloadArgs) === false)
            {
                if (typeof paneUnloadArgs === "function")
                {
                    callback = paneUnloadArgs;
                    paneUnloadArgs = null;
                }

                paneUnloadArgs = interpretResult.userUnloadArgs;
                if (paneUnloadArgs != null)
                {
                    paneUnloadArgs.context = interpretResult.context;
                }
            }
        }
        else if (EVUI.Modules.Core.Utils.isObject(paneID) === true)
        {
            paneID = paneID.id;
            paneEntry = getPaneEntry(paneID, false);
        }

        if (paneEntry == null) throw Error("No pane with an ID of " + paneID + " exists.");

        if (typeof paneUnloadArgs === "function")
        {
            callback = paneUnloadArgs;
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
        opSession.userUnloadArgs = paneUnloadArgs;
        opSession.resolvedUnloadArgs = resolvePaneUnloadArgs(paneEntry, paneUnloadArgs);

        performOperation(opSession);
    };

    /**Awaitable. Asynchronously unloads a Pane, which disconnects the Pane's element and removes it from the DOM if it was loaded remotely.
    @param {EVUI.Modules.Panes.Pane|String} paneID Either the string ID or the Pane reference of the Pane to unload.
    @param {EVUI.Modules.Panes.PaneUnloadArgs} paneUnloadArgs Optional. A PaneUnloadArgs object graph or a callback. If omitted or passed a function, the Pane's existing unload settings are used instead.
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

    /**Asynchronously moves a currently visible pane to a new location.
    @param {EVUI.Modules.Panes.Pane|String} paneID  Either the string ID or the Pane reference of the Pane to move.
    @param {EVUI.Modules.Panes.PaneMoveArgs} paneMoveArgs A PaneMoveArgs object graph representing arguments for moving a Pane.
    @param {EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} callback Optional. A callback to call once the operation completes.*/
    this.movePane = function (paneID, paneMoveArgs, callback)
    {
        var paneEntry = null;

        if (EVUI.Modules.Core.Utils.isObject(paneMoveArgs) === false)
        {
            throw Error("No move destination set.");
        }
        else
        {
            var hasTop = (typeof paneMoveArgs.top === "number");
            var hasLeft = (typeof paneMoveArgs.left === "number");

            if (hasTop === false && hasLeft === false) throw Error("Invalid move destination.");
        }

        if (typeof paneID === "string") //showing based on ID
        {
            paneEntry = getInternalPaneEntry(paneID);
            if (paneEntry == null) throw Error("No pane exists with an id of \"" + paneID + "\"");
        }       
        else if (EVUI.Modules.Core.Utils.isObject(paneID) === true) //we have either a new pane to add or a reference to an existing pane
        {
            paneEntry = makeOrGetPane(paneID);
        }
        else
        {
            throw Error("String or object expected.")
        }

        if (paneEntry == null) throw Error("No pane with an ID of " + paneID + " exists.");
        if (paneEntry.link.pane.isVisible === false) throw Error("Pane must be visible to be moved.");
        if (paneEntry.link.currentOperation != null)
        {
            if (paneEntry.link.currentOperation.action === EVUI.Modules.Panes.PaneAction.Unload || paneEntry.link.currentOperation.action === EVUI.Modules.Panes.PaneAction.Hide)
            {
                throw Error("Pane is currently being hidden or unloaded and cannot be moved.");
            }
        }

        var opSession = new PaneOperationSession();
        opSession.entry = paneEntry;
        opSession.action = EVUI.Modules.Panes.PaneAction.Move;
        opSession.currentAction = EVUI.Modules.Panes.PaneAction.Move;
        opSession.callback = (typeof callback === "function") ? callback : function (success) { };
        opSession.userMoveArgs = paneMoveArgs;
        opSession.resolvedMoveArgs = resolvePaneMoveArgs(paneEntry, paneMoveArgs);
        performOperation(opSession);
    };

    /**Awaitable. Asynchronously moves a currently visible pane to a new location.
    @param {EVUI.Modules.Panes.Pane|String} paneID  Either the string ID or the Pane reference of the Pane to move.
    @param {EVUI.Modules.Panes.PaneMoveArgs} paneMoveArgs A PaneMoveArgs object graph representing arguments for moving a Pane.
    @returns {Promise<Boolean>}*/
    this.movePaneAsync = function (paneID, paneMoveArgs)
    {
        return new Promise(function (resolve)
        {
            _self.movePane(paneID, paneMoveArgs, function (success)
            {
                resolve(success);
            });
        });
    };

    /**Asynchronously resizes a currently visible pane.
    @param {EVUI.Modules.Panes.Pane|String} paneID  Either the string ID or the Pane reference of the Pane to resize.
    @param {EVUI.Modules.Panes.PaneResizeArgs} paneResizeArgs A PaneResizeArgs object graph representing arguments for resizing a Pane.
    @param {EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} callback Optional. A callback to call once the operation completes.*/
    this.resizePane = function (paneID, paneResizeArgs, callback)
    {
        var paneEntry = null;

        if (EVUI.Modules.Core.Utils.isObject(paneResizeArgs) === false)
        {
            throw Error("Object expected - no resize dimensions set.");
        }
        else
        {
            var hasTop = (typeof paneResizeArgs.top === "number");
            var hasLeft = (typeof paneResizeArgs.left === "number");
            var hasBottom = typeof paneResizeArgs.bottom === "number";
            var hasRight = typeof paneResizeArgs.right === "number";

            if (hasTop === false && hasLeft === false && hasBottom === false && hasRight === false) throw Error("Invalid resize dimensions.");
        }

        if (typeof paneID === "string") //showing based on ID
        {
            paneEntry = getInternalPaneEntry(paneID);
            if (paneEntry == null) throw Error("No pane exists with an id of \"" + paneID + "\"");
        }
        else if (EVUI.Modules.Core.Utils.isObject(paneID) === true) //we have either a new pane to add or a reference to an existing pane
        {
            paneEntry = makeOrGetPane(paneID);
        }
        else
        {
            throw Error("String or object expected.")
        }

        if (paneEntry == null) throw Error("No pane with an ID of " + paneID + " exists.");
        if (paneEntry.link.pane.isVisible === false) throw Error("Pane must be visible to be resized.");
        if (paneEntry.link.currentOperation != null)
        {
            if (paneEntry.link.currentOperation.action === EVUI.Modules.Panes.PaneAction.Unload || paneEntry.link.currentOperation.action === EVUI.Modules.Panes.PaneAction.Hide)
            {
                throw Error("Pane is currently being hidden or unloaded and cannot be resized.");
            }
        }

        if (paneResizeArgs == null) //if we had no show args, make blank ones
        {
            paneResizeArgs = new EVUI.Modules.Panes.PaneMoveArgs();
        }

        var opSession = new PaneOperationSession();
        opSession.entry = paneEntry;
        opSession.action = EVUI.Modules.Panes.PaneAction.Resize;
        opSession.currentAction = EVUI.Modules.Panes.PaneAction.Resize;
        opSession.callback = (typeof callback === "function") ? callback : function (success) { };
        opSession.userResizeArgs = paneResizeArgs;
        opSession.resolvedResizeArgs = resolvePaneResizeArgs(paneEntry, paneResizeArgs);
        performOperation(opSession);
    };

    /**Awaitable. Asynchronously resizes a currently visible pane.
    @param {EVUI.Modules.Panes.Pane|String} paneID  Either the string ID or the Pane reference of the Pane to resize.
    @param {EVUI.Modules.Panes.PaneResizeArgs} paneResizeArgs A PaneResizeArgs object graph representing arguments for resizing a Pane.*/
    this.resizePaneAsync = function (paneID, paneResizeArgs)
    {
        return new Promise(function (resolve)
        {
            _self.resizePane(paneID, paneResizeArgs, function (success)
            {
                resolve(success);
            });
        });
    };

    /**Add an event listener to fire after an event with the same key has been executed.
    @param {String} eventkey The key of the event in the EventStream to execute after.
    @param {EVUI.Modules.Panes.Constants.Fn_PaneEventHandler} handler The function to fire.
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

    /**************************************************************************************EVENTS*************************************************************************************************************/

    /**Global event that fires before the load operation begins for any Pane and is not yet in the DOM and cannot be manipulated in this stage.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation.*/
    this.onLoad = function (paneEventArgs)
    {

    };

    /**Global event that fires after the load operation has completed for any Pane and is now in the DOM and can be manipulated in this stage. From this point on the Pane's element property cannot be reset.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation.*/
    this.onLoaded = function (paneEventArgs)
    {

    };

    /**Global event that fires the first time any Pane is shown after being loaded into the DOM, but is not yet visible. After it has fired once, it will not fire again unless the PaneShowArgs.reInitialize property is set to true.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation.*/
    this.onInitialize = function (paneEventArgs)
    {

    };

    /**Global event that fires at the beginning of the show process and before the calculations for any Pane's location are made. The Pane is still hidden, but is present in the DOM and can be manipulated.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation.*/
    this.onShow = function (paneEventArgs)
    {

    };

    /**Global event that fires after the position of any Pane has been calculated and is available to be manipulated through the calculatedPosition property of the PaneEventArgs.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation.*/
    this.onPosition = function (paneEventArgs)
    {

    };

    /**Global event that fires once any Pane has been positioned, shown, and had its optional show transition applied and completed. Marks the end of the show process.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation.*/
    this.onShown = function (paneEventArgs)
    {

    };

    /**Global event that fires before any Pane has been moved from its current location and hidden.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation.*/
    this.onHide = function (paneEventArgs)
    {

    };

    /**Global event that fires after any Pane has been moved from its current location and is now hidden and the hide transition has completed.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation.*/
    this.onHidden = function (paneEventArgs)
    {

    };

    /**Global event that fires before any Pane has been (potentially) removed from the DOM and had its element property reset to null.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation.*/
    this.onUnload = function (paneEventArgs)
    {
    };

    /**Global event that fires after any Pane has been (potentially) removed from the DOM and had its element property reset to null. From this point on the Pane's element property is now settable to a new Element.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation.*/
    this.onUnloaded = function (paneEventArgs)
    {

    };

    /**Global event that fires before any Pane is moved in response to a DOM event or user invocation.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation.*/
    this.onMove = function (paneEventArgs)
    {

    };

    /**Global event that fires after any Pane has been moved in response to a DOM event or user invocation.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation.*/
    this.onMoved = function (paneEventArgs)
    {

    };

    /**Global event that fires before any Pane is resized in response to a DOM event or user invocation.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation.*/
    this.onResize = function (paneEventArgs)
    {

    };

    /**Global event that fires after any Pane has been resized in response to a DOM event or user invocation.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation.*/
    this.onResized = function (paneEventArgs)
    {

    };

    /**************************************************************************************SETUP*************************************************************************************************************/

    /**Joins the values from the Pane definition with the PaneShowArgs graph that was provided by the user into a set of arguments usable by the PaneManager.
    @param {InternalPaneEntry} paneEntry The pane to resolve the settings for.
    @param {EVUI.Modules.Panes.PaneShowArgs} userShowArgs The graph of show arguments provided by the user.
    @returns {EVUI.Modules.Panes.PaneShowArgs}*/
    var resolvePaneShowArgs = function (paneEntry, userShowArgs)
    {
        var finalArgs = new EVUI.Modules.Panes.PaneShowArgs();

        //extend everything BUT the load order properties
        EVUI.Modules.Core.Utils.shallowExtend(finalArgs, paneEntry.link.pane.showSettings, _showArgsFilter);
        EVUI.Modules.Core.Utils.shallowExtend(finalArgs, userShowArgs, _showArgsFilter);

        //use the user's context if one was provided
        if (userShowArgs != null && userShowArgs.context !== undefined)
        {
            finalArgs.context = userShowArgs.context;
        }

        //make the load args if any were provided
        if (EVUI.Modules.Core.Utils.isObject(userShowArgs.loadArgs) === true)
        {
            finalArgs.loadArgs = resolvePaneLoadArgs(paneEntry.link.pane.loadSettings, userShowArgs.loadArgs);

            //use the show args context if it was omitted from the load args graph
            if (userShowArgs.loadArgs.hasOwnProperty("context") === false)
            {
                finalArgs.loadArgs.context = userShowArgs.context;
            }
        }

        var defaultShowSettings = paneEntry.link.pane.showSettings == null ? {} : paneEntry.link.pane.showSettings;

        finalArgs.showTransition = resolvePaneTransition(defaultShowSettings.showTransition, userShowArgs.showTransition);
        finalArgs.clipSettings = resolvePaneClipSettings(defaultShowSettings.clipSettings, userShowArgs.clipSettings);
        finalArgs.backdropSettings = resolveBackdropSettings(defaultShowSettings.backdropSettings, userShowArgs.backdropSettings)


        //figure out what the default position mode is and what the user's position mode is
        var argsMode = getPositionMode(userShowArgs);
        var defaultMode = getPositionMode(paneEntry.link.pane.showSettings);

        var mode = null;

        //figure out which value to set to set the display mode appropriately - the mode is determined by what is populated so we only populate the values specific to the detected mode
        if (argsMode === EVUI.Modules.Panes.PaneShowMode.None && defaultMode !== EVUI.Modules.Panes.PaneShowMode.None) //args had no show args, but the default does. Use the default over the arguments.
        {
            mode = defaultMode;
        }
        else if (argsMode !== EVUI.Modules.Panes.PaneShowMode.None) //use the arguments to show the pane
        {
            mode = argsMode;
        }
        else //neither was valid
        {
            return finalArgs;
        }
       
        switch (mode)
        {
            case EVUI.Modules.Panes.PaneShowMode.AbsolutePosition:
                finalArgs.absolutePosition = resolveAbsolutePosition(defaultShowSettings.absolutePosition, userShowArgs.absolutePosition);
                break;

            case EVUI.Modules.Panes.PaneShowMode.Anchored:
                finalArgs.anchors = resolveAnchors(defaultShowSettings.anchors, userShowArgs.anchors);
                break;

            case EVUI.Modules.Panes.PaneShowMode.Centered:

                var center = defaultShowSettings.center;
                if (typeof userShowArgs.center === "boolean") center = userShowArgs.center;

                finalArgs.center = center;
                break;

            case EVUI.Modules.Panes.PaneShowMode.DocumentFlow:
                finalArgs.documentFlow = resolveDocumentFlow(defaultShowSettings.documentFlow, userShowArgs.documentFlow);
                break;

            case EVUI.Modules.Panes.PaneShowMode.Fullscreen:
                var fullscreen = defaultShowSettings.fullscreen;
                if (typeof userShowArgs.fullscreen === "boolean") fullscreen = userShowArgs.fullscreen;

                finalArgs.fullscreen = fullscreen;
                break;

            case EVUI.Modules.Panes.PaneShowMode.PositionClass:
                var positionClasses = {};

                if (EVUI.Modules.Core.Utils.isArray(defaultShowSettings.positionClass) === true)
                {
                    var numClasses = defaultShowSettings.positionClass.length;
                    for (var x = 0; x < numClasses; x++)
                    {
                        positionClasses[defaultShowSettings.positionClass[x]] = true;
                    }
                }
                else if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(defaultShowSettings.positionClass) === false)
                {
                    positionClasses[defaultShowSettings.positionClass] = true;
                }

                if (EVUI.Modules.Core.Utils.isArray(userShowArgs.positionClass) === true)
                {
                    var numClasses = userShowArgs.positionClass.length;
                    for (var x = 0; x < numClasses; x++)
                    {
                        positionClasses[userShowArgs.positionClass[x]] = true;
                    }
                }
                else if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(userShowArgs.positionClass) === false)
                {
                    positionClasses[userShowArgs.positionClass] = true;
                }

                finalArgs.positionClass = Object.keys(positionClasses);

                break;

            case EVUI.Modules.Panes.PaneShowMode.RelativePosition:
                finalArgs.relativePosition = resolveRelativePosition(defaultShowSettings.relativePosition, userShowArgs.relativePosition);
                break;
        }

        return finalArgs;
    };

    /**Creates PaneAbsolutePosition based on the Pane's default absolutePosition and the user-provided absolutePosition to resolve a usable PaneAbsolutePosition object.
    @param {EVUI.Modules.Panes.PaneAbsolutePosition} defaultAbsolutePosition The showSettings.absolutePosition of a Pane
    @param {EVUI.Modules.Panes.PaneAbsolutePosition} userAbsolutePosition The user's absolute position args.
    @returns {EVUI.Modules.Panes.PaneAbsolutePosition}*/
    var resolveAbsolutePosition = function (defaultAbsolutePosition, userAbsolutePosition)
    {
        var finalAbsolutePosition = new EVUI.Modules.Panes.PaneAbsolutePosition();
        var extendFilter = function (propName, sourceObj, targetObj)
        {
            if ((propName === "top" || propName === "left") && (targetObj === finalAbsolutePosition))
            {
                if (typeof sourceObj[propName] !== "number") return false; //don't write non-numbers onto the final arguments top and left coordinates.
            }

            return true;
        }

        EVUI.Modules.Core.Utils.shallowExtend(finalAbsolutePosition, defaultAbsolutePosition, extendFilter);
        EVUI.Modules.Core.Utils.shallowExtend(finalAbsolutePosition, userAbsolutePosition, extendFilter);

        return finalAbsolutePosition;
    };

    /**Resolves anchor positioning by joining the showSettings.anchors from the Pane and the user provided anchors graph to produce a valid PaneAnchors object.
    @param {EVUI.Modules.Panes.PaneAnchors} defaultAnchors The Pane's showSettings.anchors object.
    @param {EVUI.Modules.Panes.PaneAnchors} userAnchors The user's PaneAnchors graph.
    @returns {EVUI.Modules.Panes.PaneAnchors}*/
    var resolveAnchors = function (defaultAnchors, userAnchors)
    {
        var finalAnchors = new EVUI.Modules.Panes.PaneAnchors();
        EVUI.Modules.Core.Utils.shallowExtend(finalAnchors, defaultAnchors);
        EVUI.Modules.Core.Utils.shallowExtend(finalAnchors, userAnchors);

        //we 'resolve' the elements because they could be: a valid element, a CSS selector, a jQuery object, or a DomHelper object. We want a valid Element reference.
        finalAnchors.top = resolveElement(finalAnchors.top);
        finalAnchors.left = resolveElement(finalAnchors.left);
        finalAnchors.bottom = resolveElement(finalAnchors.bottom);
        finalAnchors.right = resolveElement(finalAnchors.right);

        return finalAnchors;
    };

    /**Joins the showSettings.documentFlow object with the user's graph of a PaneDocumentFlow object to produce a usable PaneDocumentFlow object.
    @param {EVUI.Modules.Panes.PaneDocumentFlow} defaultDocFlow
    @param {EVUI.Modules.Panes.PaneDocumentFlow} userDocFlow
    @returns {EVUI.Modules.Panes.PaneDocumentFlow}*/
    var resolveDocumentFlow = function (defaultDocFlow, userDocFlow)
    {
        var finalFlow = new EVUI.Modules.Panes.PaneDocumentFlow();
        EVUI.Modules.Core.Utils.shallowExtend(finalFlow, defaultDocFlow);
        EVUI.Modules.Core.Utils.shallowExtend(finalFlow, userDocFlow);

        finalFlow.relativeElement = resolveElement(finalFlow.relativeElement);

        return finalFlow;
    };

    /**Joins the showettings.relativePosition object of the Pane with the user-provided graph of PaneRelativePosition.
    @param {EVUI.Modules.Panes.PaneRelativePosition} defaultPosistion The showSettings.relatviePosition of the Pane object.
    @param {EVUI.Modules.Panes.PaneRelativePosition} userPosition The PaneRelativePosition object made by the user.
    @returns {EVUI.Modules.Panes.PaneRelativePosition}*/
    var resolveRelativePosition = function (defaultPosistion, userPosition)
    {
        var finalPosition = new EVUI.Modules.Panes.PaneRelativePosition();
        EVUI.Modules.Core.Utils.shallowExtend(finalPosition, defaultPosistion);
        EVUI.Modules.Core.Utils.shallowExtend(finalPosition, userPosition);

        finalPosition.relativeElement = resolveElement(finalPosition.relativeElement);

        return finalPosition;
    };

    /**Creates a useable PaneLoadArgs object from the Pane's loadSettings and the user-provided PaneLoadArgs.
    @param {EVUI.Modules.Panes.PaneLoadSettings} defaultLoadSettings The Pane's loadSettings.
    @param {EVUI.Modules.Panes.PaneLoadArgs} userLoadArgs The user's PaneLoadArgs.
    @returns {EVUI.Modules.Panes.PaneLoadArgs} */
    var resolvePaneLoadArgs = function (defaultLoadSettings, userLoadArgs)
    {
        var finalArgs = new EVUI.Modules.Panes.PaneLoadArgs();
        EVUI.Modules.Core.Utils.shallowExtend(finalArgs, defaultLoadSettings, _loadArgsFilter);
        EVUI.Modules.Core.Utils.shallowExtend(finalArgs, userLoadArgs, _loadArgsFilter);

        var existingLoadMode = getLoadMode(defaultLoadSettings);
        var argsLoadMode = getLoadMode(userLoadArgs);

        //use the user's context if one was provided
        if (userLoadArgs != null && userLoadArgs.context !== undefined)
        {
            finalArgs.context = userLoadArgs.context;
        }

        //figure out which mode to use to load the pane and only populate that specific mode in the final object.
        var mode = null;
        var source = null;
        if (argsLoadMode === EVUI.Modules.Panes.PaneLoadMode.None && existingLoadMode !== EVUI.Modules.Panes.PaneLoadMode.None)
        {
            mode = existingLoadMode;
            source = defaultLoadSettings;
        }
        else if (argsLoadMode !== EVUI.Modules.Panes.PaneLoadMode.None)
        {
            mode = argsLoadMode;
            source = userLoadArgs;
        }
        else
        {
            return finalArgs;
        }

        switch (mode)
        {
            case EVUI.Modules.Panes.PaneLoadMode.ExistingElement:
                finalArgs.element = resolveElement(source.element);
                break;

            case EVUI.Modules.Panes.PaneLoadMode.CSSSelector:
                finalArgs.contextElement = resolveElement(source.contextElement);
                finalArgs.selector = source.selector;
                break;

            case EVUI.Modules.Panes.PaneLoadMode.HTTP:
                var defaultHttp = EVUI.Modules.Core.Utils.isObject(defaultLoadSettings) ? defaultLoadSettings.httpLoadArgs : null;
                var userHttp = EVUI.Modules.Core.Utils.isObject(userLoadArgs) ? userLoadArgs.httpLoadArgs : null;

                finalArgs.httpLoadArgs = resolveHttpArgs(defaultHttp, userHttp);
                break;

            case EVUI.Modules.Panes.PaneLoadMode.Placeholder:
                var defaultPlaceholder = EVUI.Modules.Core.Utils.isObject(defaultLoadSettings) ? defaultLoadSettings.placeholderLoadArgs : null;
                var userPlaceholder = EVUI.Modules.Core.Utils.isObject(userLoadArgs) ? userLoadArgs.placeholderLoadArgs : null;

                finalArgs.placeholderLoadArgs = resolvePlaceholderArgs(defaultPlaceholder, userPlaceholder);
                break;
        }

        return finalArgs;
    };

    /**Creates a usable HttpRequestArgs from the Pane's loadSettings and the user's HttpRequestArgs.
    @param {EVUI.Modules.Http.HttpRequestArgs} defaultHttpArgs The Pane's loadSettings.httpArgs.
    @param {EVUI.Modules.Http.HttpRequestArgs} userHttpArgs The user's httpArgs.
    @returns {EVUI.Modules.Http.HttpRequestArgs}*/
    var resolveHttpArgs = function (defaultHttpArgs, userHttpArgs)
    {
        var finalArgs = new EVUI.Modules.Http.HttpRequestArgs();
        EVUI.Modules.Core.Utils.shallowExtend(finalArgs, defaultHttpArgs, ["headers"]);
        EVUI.Modules.Core.Utils.shallowExtend(finalArgs, userHttpArgs, ["headers"]);

        var finalHeaders = [];
        var headerDic = {};

        //make a union of all headers in both the default settings and user args
        if (EVUI.Modules.Core.Utils.isObject(defaultHttpArgs) === true)
        {
            if (EVUI.Modules.Core.Utils.isArray(defaultHttpArgs.headers) === true)
            {
                var numHeaders = defaultHttpArgs.headers.length;
                for (var x = 0; x < numHeaders; x++)
                {
                    headerDic[defaultHttpArgs.headers[x].key] = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Http.HttpRequestHeader(), defaultHttpArgs.headers[x]);
                }
            }
        }

        if (EVUI.Modules.Core.Utils.isObject(userHttpArgs) === true)
        {
            if (EVUI.Modules.Core.Utils.isArray(userHttpArgs.headers) === true)
            {
                var numHeaders = userHttpArgs.headers.length;
                for (var x = 0; x < numHeaders; x++)
                {
                    headerDic[userHttpArgs.headers[x].key] = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Http.HttpRequestHeader(), userHttpArgs.headers[x]);
                }
            }
        }

        for (var header in headerDic)
        {
            finalHeaders.push(headerDic[header]);
        }

        finalArgs.headers = finalHeaders;
        return finalArgs;
    };

    /**Resolves the Pane's loadSettings.placeholderLoadArgs with the user's placeholderLoadArgs to create the full placeholderLoadArgs.
    @param {EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadArgs} defaultPlaceholderArgs
    @param {EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadArgs} userPlaceholderArgs
    @returns {EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadArgs}*/
    var resolvePlaceholderArgs = function (defaultPlaceholderArgs, userPlaceholderArgs)
    {
        var finalArgs = new EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadArgs();
        EVUI.Modules.Core.Utils.shallowExtend(finalArgs, defaultPlaceholderArgs);
        EVUI.Modules.Core.Utils.shallowExtend(finalArgs, userPlaceholderArgs);

        var defaultHttp = EVUI.Modules.Core.Utils.isObject(defaultPlaceholderArgs) ? defaultPlaceholderArgs.httpArgs : null;
        var userHttp = EVUI.Modules.Core.Utils.isObject(userPlaceholderArgs) ? userPlaceholderArgs.httpArgs : null;

        finalArgs.httpArgs = resolveHttpArgs(defaultHttp, userHttp);
        finalArgs.contextElement = resolveElement(finalArgs.contextElement);

        return finalArgs;
    };

    /**Joins the pane's hide settings with the PaneHideArgs object provided by the user.
    @param {InternalPaneEntry} paneEntry The internal entry that the PaneHideArgs are being calculated for.
    @param {EVUI.Modules.Panes.PaneHideArgs} userHideArgs The user's PaneHideArgs.
    @returns {EVUI.Modules.Panes.PaneHideArgs}*/
    var resolvePaneHideArgs = function (paneEntry, userHideArgs)
    {
        var finalArgs = new EVUI.Modules.Panes.PaneHideArgs();
        finalArgs.unload = paneEntry.link.pane.unloadOnHide;

        if (EVUI.Modules.Core.Utils.isObject(userHideArgs) === false) userHideArgs = {};

        EVUI.Modules.Core.Utils.deepExtend(finalArgs, userHideArgs, { filter: _hideArgumentFilter });

        //use the user's context if one was provided
        if (userHideArgs != null && userHideArgs.context !== undefined)
        {
            finalArgs.context = userHideArgs.context;
        }

        finalArgs.hideTransition = resolvePaneTransition(paneEntry.link.pane.showSettings != null ? paneEntry.link.pane.showSettings.hideTransition : {}, userHideArgs.hideTransition);
        finalArgs.unloadArgs = resolvePaneUnloadArgs(paneEntry, (userHideArgs == null) ? null : userHideArgs.unloadArgs);
        return finalArgs;
    };

    /**Makes a fresh PaneUnloadArgs based on the user's PaneUnloadArgs.
    @param {InternalPaneEntry} paneEntry The internal Pane entry whose unload settings are being calculated for.
    @param {EVUI.Modules.Panes.PaneUnloadArgs} userUnloadArgs The user's PaneUnloadArgs*/
    var resolvePaneUnloadArgs = function (paneEntry, userUnloadArgs)
    {
        var finalArgs = EVUI.Modules.Core.Utils.deepExtend(new EVUI.Modules.Panes.PaneUnloadArgs(), userUnloadArgs);

        return finalArgs;
    }

    /**Joins the user's move args with the Pane's move settings to create a usable PaneMoveArgs object.
    @param {InternalPaneEntry} paneEntry
    @param {EVUI.Modules.Panes.PaneMoveArgs} userMoveArgs
    @returns {EVUI.Panes.Pane.PaneMoveArgs}*/
    var resolvePaneMoveArgs = function (paneEntry, userMoveArgs)
    {
        var finalArgs = new EVUI.Modules.Panes.PaneMoveArgs();
        EVUI.Modules.Core.Utils.shallowExtend(finalArgs, userMoveArgs);

        var resizeMoveSettings = paneEntry.link.pane.resizeMoveSettings == null ? {} : paneEntry.link.pane.resizeMoveSettings;
        finalArgs.transition = resolvePaneTransition(resizeMoveSettings.moveTransition, userMoveArgs.transition);

        var noTop = typeof finalArgs.top !== "number";
        var noLeft = typeof finalArgs.left !== "number";    

        if (noTop || noLeft)
        {
            var position = paneEntry.link.pane.getCurrentPosition();

            if (noTop) finalArgs.top = position.top;
            if (noLeft) finalArgs.left = position.left;
        }

        return finalArgs;
    };

    /**Joins the user's Resize args with the Pane's Resize settings to create a usable PaneResizeArgs object.
    @param {InternalPaneEntry} paneEntry
    @param {EVUI.Modules.Panes.PaneResizeArgs} userResizeArgs
    @returns {EVUI.Panes.Pane.PaneResizeArgs}*/
    var resolvePaneResizeArgs = function (paneEntry, userResizeArgs)
    {
        var finalArgs = new EVUI.Modules.Panes.PaneResizeArgs();
        EVUI.Modules.Core.Utils.shallowExtend(finalArgs, userResizeArgs);

        var resizeMoveSettings = paneEntry.link.pane.resizeMoveSettings == null ? {} : paneEntry.link.pane.resizeMoveSettings;
        finalArgs.transition = resolvePaneTransition(resizeMoveSettings.resizeTransition, userResizeArgs.transition);

        var noTop = typeof finalArgs.top !== "number";
        var noLeft = typeof finalArgs.left !== "number";  
        var noBottom = typeof finalArgs.bottom !== "number";
        var noRight = typeof finalArgs.right !== "number";

        if (noTop || noLeft || noBottom || noRight)
        {
            var position = paneEntry.link.pane.getCurrentPosition();

            if (noBottom) finalArgs.bottom = position.bottom;
            if (noRight) finalArgs.right = position.right;
            if (noTop) finalArgs.top = position.top;
            if (noLeft) finalArgs.left = position.left;
        }

        return finalArgs;
    };

    /**Resolves a transition from a graph found in the Pane object and one provided by the user.
    @param {EVUI.Modules.Panes.PaneTransition} defaultTransition The transition's default settings.
    @param {EVUI.Modules.Panes.PaneTransition} userArgsTransition The user provided arugments for the transition.
    @returns {EVUI.Modules.Panes.PaneTransition}*/
    var resolvePaneTransition = function (defaultTransition, userArgsTransition)
    {
        var finalTransition = new EVUI.Modules.Panes.PaneTransition();

        if (EVUI.Modules.Core.Utils.isObject(defaultTransition) === true)
        {
            EVUI.Modules.Core.Utils.shallowExtend(finalTransition, defaultTransition);
            if (EVUI.Modules.Core.Utils.isObject(defaultTransition.css) === true)
            {
                finalTransition.css = EVUI.Modules.Core.Utils.deepExtend({}, defaultTransition.css);
            }
        }

        if (EVUI.Modules.Core.Utils.isObject(userArgsTransition) === true)
        {
            EVUI.Modules.Core.Utils.shallowExtend(finalTransition, userArgsTransition);
            if (EVUI.Modules.Core.Utils.isObject(userArgsTransition.css) === true)
            {
                finalTransition.css = EVUI.Modules.Core.Utils.deepExtend(EVUI.Modules.Core.Utils.isObject(finalTransition.css) ? finalTransition.css : {}, userArgsTransition.css);
            }
        }

        return finalTransition;
    };

    /**Resolves the PaneClipSettings by combining the Pane's clipSettings with the user provided clipSettings.
    @param {EVUI.Modules.Panes.PaneClipSettings} defaultClipSettings
    @param {EVUI.Modules.Panes.PaneClipSettings} userClipSettings
    @returns {EVUI.Modules.Panes.PaneClipSettings}*/
    var resolvePaneClipSettings = function (defaultClipSettings, userClipSettings)
    {
        var finalClipSettings = new EVUI.Modules.Panes.PaneClipSettings();
        if (EVUI.Modules.Core.Utils.isObject(defaultClipSettings) === true)
        {
            EVUI.Modules.Core.Utils.shallowExtend(finalClipSettings, defaultClipSettings);
            if (EVUI.Modules.Core.Utils.isObject(defaultClipSettings.clipBounds) === true)
            {
                var resolved = resolveElement(defaultClipSettings.clipBounds);
                if (resolved == null)
                {
                    finalClipSettings.clipBounds = EVUI.Modules.Core.Utils.shallowExtend({}, defaultClipSettings.clipBounds);
                }
                else
                {
                    finalClipSettings.clipBounds = resolved;
                }
            }
        }

        if (EVUI.Modules.Core.Utils.isObject(userClipSettings) === true)
        {
            EVUI.Modules.Core.Utils.shallowExtend(finalClipSettings, userClipSettings);
            if (EVUI.Modules.Core.Utils.isObject(userClipSettings.clipBounds) === true)
            {
                var resolved = resolveElement(userClipSettings.clipBounds);
                if (resolved == null)
                {
                    finalClipSettings.clipBounds = EVUI.Modules.Core.Utils.shallowExtend({}, userClipSettings.clipBounds);
                }
                else
                {
                    finalClipSettings.clipBounds = resolved;
                }
            }
        }

        return finalClipSettings;
    };

    /**Resolves the Pane's default backdrop settings with a user-provided backdrop setting.
    @param {EVUI.Modules.Panes.PaneBackdropSettings} defaultBackdrop The Pane's backdrop settings.
    @param {EVUI.Modules.Panes.PaneBackdropSettings} userBackdrop The user's backdrop settings.
    @returns {EVUI.Modules.Panes.PaneBackdropSettings}*/
    var resolveBackdropSettings = function (defaultBackdrop, userBackdrop)
    {
        var finalBackdrop = new EVUI.Modules.Panes.PaneBackdropSettings();
        EVUI.Modules.Core.Utils.shallowExtend(finalBackdrop, defaultBackdrop);
        EVUI.Modules.Core.Utils.shallowExtend(finalBackdrop, userBackdrop);

        if (EVUI.Modules.Core.Utils.isObject(userBackdrop) === false) userBackdrop = {};
        if (EVUI.Modules.Core.Utils.isObject(defaultBackdrop) === false) defaultBackdrop = {};

        finalBackdrop.backdropShowTransition = resolvePaneTransition(defaultBackdrop.backdropShowTransition, userBackdrop.backdropShowTransition);
        finalBackdrop.backdropHideTransition = resolvePaneTransition(defaultBackdrop.backdropHideTransition, userBackdrop.backdropHideTransition);

        if (EVUI.Modules.Core.Utils.isObject(finalBackdrop.css) === true)
        {
            finalBackdrop.css = EVUI.Modules.Core.Utils.deepExtend({}, finalBackdrop.css);
        }

        return finalBackdrop;
    };

    /**Resolves the Pane's auto-hide settings with the user's auto-hide settings passed in by a user.
    @param {EVUI.Modules.Panes.PaneAutoHideSettings} defaultAutoClose The Pane's auto close settings.
    @param {EVUI.Modules.Panes.PaneAutoHideSettings} userArgs The user arguments close settings.
    @returns {EVUI.Modules.Panes.PaneAutoHideSettings} */
    var resolveAutoHideSettings = function (defaultAutoClose, userArgs)
    {
        var finalArgs = new EVUI.Modules.Panes.PaneAutoHideSettings();
        EVUI.Modules.Core.Utils.shallowExtend(finalArgs, defaultAutoClose);
        EVUI.Modules.Core.Utils.shallowExtend(finalArgs, userArgs);

        if (EVUI.Modules.Core.Utils.isObject(defaultAutoClose) === true)
        {
            if (EVUI.Modules.Core.Utils.isArray(defaultAutoClose.autoHideKeys) === true)
            {
                finalArgs.autoHideKeys = defaultAutoClose.autoHideKeys.slice();
            }
        }

        if (EVUI.Modules.Core.Utils.isObject(userArgs) === true)
        {
            if (EVUI.Modules.Core.Utils.isArray(userArgs.autoHideKeys) === true)
            {
                finalArgs.autoHideKeys = userArgs.autoHideKeys.slice();
            }
        }

        return finalArgs;
    };

    /**Takes an ambiguous representation of an Element (a CSS selector, jQuery object, DomHelper object or a regular Element) and returns the corresponding Element reference.
    @param {String|jQuery|EVUI.Modules.Dom.DomHelper|Element|DocumentFragment} userElementValue
    @param {Boolean} allowFragments Whether or not DocumentFragments count as valid elements.
    @returns {Element}*/
    var resolveElement = function (userElementValue, allowFragments)
    {
        if (typeof userElementValue === "string")
        {
            return document.querySelector(userElementValue);
        }
        else
        {
            var ele = EVUI.Modules.Core.Utils.getValidElement(userElementValue);
            if (ele != null) return ele;

            if (allowFragments === true && EVUI.Modules.Core.Utils.isObject(userElementValue) && userElementValue.nodeType === Node.DOCUMENT_FRAGMENT_NODE)
            {
                return userElementValue.firstElementChild;
            }
        }

        return null;
    }; 

    /**Resolves the Pane's resize/move settings with the user's resize/move settings passed in by a user.
    @param {EVUI.Modules.Panes.PaneResizeMoveSettings} defaultAutoClose The Pane's resize/move settings.
    @param {EVUI.Modules.Panes.PaneResizeMoveSettings} userArgs The user resize/move settings.
    @returns {EVUI.Modules.Panes.PaneResizeMoveSettings} */
    var resolveResizeMoveSettings = function (defaultResizeMove, userResizeMove)
    {
        var finalArgs = new EVUI.Modules.Panes.PaneResizeMoveSettings();
        EVUI.Modules.Core.Utils.shallowExtend(finalArgs, defaultResizeMove);
        EVUI.Modules.Core.Utils.shallowExtend(finalArgs, userResizeMove);

        if (EVUI.Modules.Core.Utils.isObject(finalArgs.moveTransition) === true)
        {
            finalArgs.moveTransition = resolvePaneTransition(defaultResizeMove.moveTransition, userResizeMove.moveTransition);
        }

        if (EVUI.Modules.Core.Utils.isObject(finalArgs.resizeTransition) === true)
        {
            finalArgs.moveTransition = resolvePaneTransition(defaultResizeMove.resizeTransition, userResizeMove.resizeTransition);
        }

        return finalArgs;
    };

    /**Creates a graph of all the properties we can determine about a Pane based on the currentTarget's attributes.
    @param {Event} event The event arguments used to trigger the action of showing or hiding the pane.
    @returns {PaneEventArgsIntepretationResult} */
    var getPaneFromEventArgs = function (event, throwIfMissing)
    {
        var paneSettings = {};
        var result = new PaneEventArgsIntepretationResult();

        var objectAttrs = EVUI.Modules.Core.Utils.getElementAttributes(event.currentTarget);

        var id = objectAttrs.getValue(getAttributeName(EVUI.Modules.Panes.Constants.Attribute_ID)); //first, make sure we have an ID. If we don't we have to attempt to find all other instances that will involve the same Pane and tag them all with the same ID.
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(id) === true) 
        {
            id = fixPanesWithNoID(event, objectAttrs); //go find everything that has a load option in common with this pane and tag them all with the same ID.
            if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(id) === true) throw Error("Ambiguous Pane event invocation - no " + EVUI.Modules.Panes.Constants.Attribute_ID + ", " + EVUI.Modules.Panes.Constants.Attribute_PlaceholderID + ", " + EVUI.Modules.Panes.Constants.Attribute_Selector + ", or " + EVUI.Modules.Panes.Constants.Attribute_SourceURL + " attribute present on calling element.");
        }

        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(id) === true) throw Error("Ambiguous Pane event invocation - no " + EVUI.Modules.Panes.Constants.Attribute_ID + " attribute present on calling element.");

        paneSettings.id = id;

        var templateType = objectAttrs.getValue(getAttributeName(EVUI.Modules.Panes.Constants.Attribute_Template)); //see if there's a default behavior set template to use when creating a new pane.
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(templateType) === false)
        {
            paneSettings.template = templateType;
        }

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
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(context) === false) result.context = context;

        var selector = objectAttrs.getValue(getAttributeName(EVUI.Modules.Panes.Constants.Attribute_Selector)); //if we have a CSS selector, we will use that to "load" this pane.
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(selector) === false)
        {
            if (paneSettings.loadSettings == null) paneSettings.loadSettings = {};
            paneSettings.loadSettings.selector = selector;
        }

        var unloadOnHide = objectAttrs.getValue(getAttributeName(EVUI.Modules.Panes.Constants.Attribute_UnloadOnHide)); //only set this value if it is a valid boolean value (so it doesn't override the default by accident if it is not found)
        if (unloadOnHide === "true") paneSettings.unloadOnHide = true;
        if (unloadOnHide === "false") paneSettings.unloadOnHide = false;

        var parsedShowArgs = null;
        var showArgs = objectAttrs.getValue(EVUI.Modules.Panes.Constants.Attribute_ShowArgs);
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(showArgs) === false)
        {
            parsedShowArgs = getShowModeArgsFromAttribute(showArgs, event);
        }

        var internalEntry = getInternalPaneEntry(id);
        if (internalEntry == null)
        {
            if (throwIfMissing === true)
            {
                throw Error("No pane with an id of " + id + " exists.");
            }

            internalEntry = makeOrGetPane(paneSettings);
        }

        if (parsedShowArgs != null)
        {
            if (paneSettings.showSettings == null) paneSettings.showSettings = {};
            EVUI.Modules.Core.Utils.deepExtend(paneSettings.showSettings, parsedShowArgs);
        }

        result.entry = internalEntry;
        result.userShowArgs = paneSettings.showSettings;
        result.userLoadArgs = paneSettings.loadSettings;
        result.userHideArgs = { unloadOnHide: unloadOnHide };

        return result;
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
            allWithSame = document.querySelectorAll("[" + urlAttributeName + "=\"" + url +"\"]");
            sameAttr = urlAttributeName;
            same = url;
        }
        else if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(placeholderID) === false)
        {
            allWithSame = document.querySelectorAll("[" + placeholderAttributeName + "=\"" + placeholderId +"\"]");
            sameAttr = placeholderAttributeName;
            same = placeholderID;
        }
        else if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(selector) === false)
        {
            var selectedElements = document.querySelectorAll(selector); //if the selector hits more than one element, we're not going to use it.
            if (selectedElements.length == 1)
            {
                allWithSame = document.querySelectorAll("[" + selectorAttributeName + "=\""+ selector +"\" ]");
                sameAttr = selectorAttributeName;
                same = selector;
            }
        }

        if (same == null || sameAttr === null) return null;

        var existingPane = null;
        var numPanes = _entries.length;
        var allNeedingID = [event.currentTarget];

        same = same.toLocaleLowerCase();
        var checkedSame = false;
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
            if (value.toLocaleLowerCase() !== same) continue;

            if (id == null && EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(curID) === false) //found an ID, we tag them all with the ID we just found
            {
                id = curID;
                continue;
            }
            else if (id == null) //if we have no id, do an expensive check based on existing panes to see if we know which pane we should be showing
            {
                for (var y = 0; y < numPanes; y++)
                {
                    var curEntry = _entries[y];
                    if (curEntry.link.pane.element === curSame) //first check based on an element equality
                    {
                        id = curEntry.paneId;
                        break;
                    }
                    else if (curEntry.link.pane.loadSettings != null && curEntry.link.pane.loadSettings.selector === same) //if not, look at the load settings to see if we can't find the element
                    {
                        if (curEntry.link.pane.loadSettings.contextElement instanceof Node === false)
                        {
                            var ele = document.querySelector(curEntry.link.pane.loadSettings.selector);
                            if (ele != null && ele !== curSame) continue;

                            id = curEntry.paneId;
                            break;
                        }
                        else
                        {
                            var ele = curEntry.link.pane.loadSettings.contextElement.querySelector(curEntry.link.pane.loadSettings.selector);
                            if (ele === curSame)
                            {
                                id = curEntry.paneId;
                                break;
                            }
                        }
                    }
                    else if (checkedSame === false && curEntry.link.pane.loadSettings != null) //no element match, check load settings
                    {
                        var compareVal = null;

                        if (curEntry.link.pane.loadSettings.placeholderLoadArgs != null)
                        {
                            compareVal = curEntry.link.pane.loadSettings.placeholderLoadArgs.placeholderID;
                        }
                        else if (curEntry.link.pane.loadSettings.element === curSame)
                        {
                            id = curEntry.paneId;
                            break;
                        }
                        else if (curEntry.link.pane.loadSettings.httpLoadArgs != null)
                        {
                            compareVal = curEntry.link.pane.loadSettings.httpLoadArgs.url;
                        }


                        if (typeof compareVal === "string") compareVal = compareVal.toLowerCase();
                        if (compareVal === same)
                        {
                            id = curEntry.paneId;
                            break;
                        }                        
                    }                    
                }

                checkedSame = true;
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
        //var lowerName = attribute.toLowerCase();
        //if (lowerName.startsWith(EVUI.Modules.Panes.Constants.Default_AttributePrefix) === true)
        //{
        //    return _settings.attributePrefix + attribute.substring(EVUI.Modules.Panes.Constants.Default_AttributePrefix.length);
        //}

        return attribute;
    };

    /**Parses JSON from an attribute value.
    @param {String} attrValue The value of an attribute on an Element.
    @returns {{}}*/
    var parseAttributeJSON = function (attrValue)
    {
        if (typeof attrValue !== "string") return {};

        var firstBracket = attrValue.indexOf("{");
        var lastBracket = attrValue.lastIndexOf("}");

        if (firstBracket === -1 || lastBracket === -1) return {};

        var attrJson = attrValue.substring(firstBracket, lastBracket + 1);

        try
        {
            return JSON.parse(attrJson);
        }
        catch (ex)
        {
            throw Error("Error parsing attribute JSON (" + attrValue + "): " + ex.message);
        }
    };

    /**Gets the PaneShowArguments from a string of JSON attached to an Element.
    @param {String} attrValue The value of an attribute on an Element.
    @param {Event} event The event that was raised to invoke the Pane action.
    @returns {EVUI.Modules.Panes.PaneShowArgs}*/
    var getShowModeArgsFromAttribute = function (attrValue, event)
    {
        //separate the "showMode" (PaneShowMode) from the JSON arguemnts corresponding to that mode.
        var showMode = null;
        var firstBracket = attrValue.indexOf("{");
        if (firstBracket === -1)
        {
            showMode = attrValue.trim().toLowerCase()
        }
        else
        {
            showMode = attrValue.substring(0, firstBracket).trim().toLowerCase();
        }

        var showArgs = {};
        
        var parsedSettings = parseAttributeJSON(attrValue);

        if (showMode === EVUI.Modules.Panes.PaneShowMode.AbsolutePosition) //absolute position - use what the user provided and fall back to the mouse coordinates if possible
        {
            var top = parsedSettings.top;
            var left = parsedSettings.left;

            if (event instanceof MouseEvent)
            {
                if (typeof top !== "number") top = event.clientY;
                if (typeof left !== "number") left = event.clientX;
            }
            else
            {
                if (typeof top !== "number") top = 0;
                if (typeof left !== "number") left = 0;
            }

            showArgs.absolutePosition = {
                top: top,
                left: left
            };
        }
        else if (showMode === EVUI.Modules.Panes.PaneShowMode.RelativePosition) //relative position - positioning relative to another Element
        {
            var relativeElement = null;
            var top = parsedSettings.top;
            var left = parsedSettings.left;
            var useCursor = parsedSettings.useCursor;
            var alignment = parsedSettings.alignment;
            var orientation = parsedSettings.orientation;

            if (useCursor === true && event instanceof MouseEvent) //if we've been told to use the cursor position, just blindly use it
            {
                if (typeof top !== "number") top = event.clientY;
                if (typeof left !== "number") left = event.clientX;
            }
            else //otherwise figure out the "right" coordinates for the Pane to appear at
            {
                relativeElement = resolveElement(parsedSettings.relativeElement);
                if (EVUI.Modules.Core.Utils.isElement(relativeElement) === false) //no relative element - see if it's a right click, where we almost always want to have the Pane appear relative to the mouse
                {
                    if (event.type === "contextmenu")
                    {
                        if (typeof top !== "number") top = event.clientY;
                        if (typeof left !== "number") left = event.clientX;
                    }
                    else
                    {
                        relativeElement = event.currentTarget;
                    }
                }
            }

            if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(alignment))
            {
                orientation = EVUI.Modules.Panes.RelativePositionOrientation.Bottom + " " + EVUI.Modules.Panes.RelativePositionOrientation.Right;
            }

            if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(orientation))
            {
                alignment = EVUI.Modules.Panes.RelativePositionAlignment.None;
            }

            showArgs.relativePosition = {
                relativeElement: relativeElement,
                useCursor: useCursor,
                top: top,
                left: left,
                orientation: orientation,
                alignment: alignment
            }

            //if we summoned a context menu, odds are the user doesn't want the browser's right click menu to pop up
            if (event.type === "contextmenu") event.preventDefault();
        }
        else if (showMode === EVUI.Modules.Panes.PaneShowMode.Centered)
        {
            showArgs.center = true;
        }
        else if (showMode === EVUI.Modules.Panes.PaneShowMode.Anchored) //if we have an anchored posotion from JSON, all the elements should be CSS selectors
        {
            showSettings.anchors = {
                top: resolveElement(parsedSettings.top),
                left: resolveElement(parsedSettings.left),
                bottom: resolveElement(parsedSettings.bottom),
                right: resolveElement(parsedSettings.right),
                alignX: (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(parsedSettings.alignX) === true) ? EVUI.Modules.Panes.AnchorAlignment.Elastic : parsedSettings.alignX,
                alignY: (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(parsedSettings.alignY) === true) ? EVUI.Modules.Panes.AnchorAlignment.Elastic : parsedSettings.alignY
            };
        }
        else if (showMode === EVUI.Modules.Panes.PaneShowMode.Fullscreen)
        {
            showArgs.fullscreen = true;
        }
        else if (showMode === EVUI.Modules.Panes.PaneShowMode.DocumentFlow)
        {
            var relativeElement = null;
            var mode = EVUI.Modules.Panes.PaneDocumentFlowMode.Append;
            if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(parsedSettings.relativeElement) === true)
            {
                relativeElement = event.currentTarget;
            }

            if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(parsedSettings.mode) === true)
            {
                mode = parsedSettings.mode;
            }

            showArgs.documentFlow = {
                relativeElement: relativeElement,
                mode: mode
            }
        }
        else if (showMode === EVUI.Modules.Panes.PaneShowMode.PositionClass)
        {
            showArgs.positionClass = parsedSettings.positionClass;
        }

        return showArgs;
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
            if (curEntry.lowerPaneId === paneID) return curEntry;
        }

        return null;
    };

    /**Gets the CSS class name for the Pane.
    @param {InternalPaneEntry} entry The entry containing the pane to get the CSS class name of.
    @returns {String}*/
    var getClassName = function (paneID)
    {
        //remove all whitespace and add the prefix
        var noWhitespaceRegex = new RegExp(/\s+/g);
        var className = EVUI.Modules.Panes.Constants.CssPrefix + "-" + paneID;
        className = className.replace(noWhitespaceRegex, "");

        return className;
    };

    /**Takes a pane object passed in by the user and either creates a new pane object or extends its properties onto an existing pane.
    @param {EVUI.Modules.Panes.Pane} yoloPane The YOLO object passed in by the user into one of the entry point functions.
    @returns {InternalPaneEntry}*/
    var makeOrGetPane = function (yoloPane)
    {
        if (yoloPane == null) throw Error("Object expected");

        //first make sure we weren't handed an actual Pane object that is already registered with the controller - if so, there's no work to do.
        if (EVUI.Modules.Core.Utils.instanceOf(yoloPane, EVUI.Modules.Panes.Pane) === true)
        {
            var internalEntry = getInternalPaneEntry(yoloPane.id);

            //if we had an old pane with the same ID as a new pane, we're trying to invoke an operation on a removed pane
            if (internalEntry.link.pane !== yoloPane) throw Error("PaneID mismatch.");

            if (internalEntry != null) return internalEntry;

            //if there wasn't an internal pane entry with a matching ID, we have a unregistered pane that was likely constructed by a user and won't work.
            throw Error("Pane instance unknown.");
        }

        //if we have no ID, we can't register the pane.
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(yoloPane.id) === true) throw Error("Pane must have an id that is a non-whitespace string.");

        var id = yoloPane.id;
        var existing = getInternalPaneEntry(id);

        //found an existing pane, return it and we're done.
        if (existing != null) return existing;

        //we don't have an existing pane - make one based on the yolo passed in
        var internalEntry = new InternalPaneEntry();
        internalEntry.paneId = id;
        internalEntry.lowerPaneId = id.toLowerCase();
        internalEntry.link = new PaneLink();
        internalEntry.link.manager = _self;
        internalEntry.link.paneCSSName = getClassName(id);
        internalEntry.link.template = yoloPane.template;

        var paneToExtend = new EVUI.Modules.Panes.Pane(internalEntry);
        internalEntry.link.pane = paneToExtend;        

        //add the pane to the internal list of panes so it can be used later
        _entries.push(internalEntry); 

        var deepExtendOptions = new EVUI.Modules.Core.DeepExtenderOptions();
        deepExtendOptions.recursionFilter = function (context)
        {
            //don't recursively extend things that aren't part of the main graph
            var parentTarget = context.getTargetParent();
            if (parentTarget != null && parentTarget.hasOwnProperty(context.propertyName) === false)
            {
                return false;
            }
            else
            {
                return true;
            }
        };

        deepExtendOptions.filter = function (context)
        {
            //filter out all the read-only properties or any of the properties that rely on a closure to work
            if (context.target === paneToExtend)
            {
                if (context.propertyName === "id" ||
                    context.propertyName === "isVisible" ||
                    context.propertyName === "isLoaded" ||
                    context.propertyName === "isInitialized" ||
                    context.propertyName === "template" ||
                    context.propertyName === "show" ||
                    context.propertyName === "showAsync" ||
                    context.propertyName === "hide" ||
                    context.propertyName === "hideAsync" ||
                    context.propertyName === "load" ||
                    context.propertyName === "loadAsync" ||
                    context.propertyName === "unload" ||
                    context.propertyName === "unloadAsync" ||
                    context.propertyName === "getCurrentPosition" ||
                    context.propertyName === "getCurrentZIndex")
                {
                    return false;
                }
            }

            return true;
        };

        //get the graph of the default settings for a Pane based on the "template" property of the yolo
        var defaultPane = getDefaultPane(yoloPane.template, internalEntry);
        EVUI.Modules.Core.Utils.deepExtend(paneToExtend, defaultPane);
        
        //copy the properties of the safe copy of the yolo onto the real Pane
        EVUI.Modules.Core.Utils.deepExtend(paneToExtend, yoloPane, deepExtendOptions);
        
        return internalEntry;
    };

    /**Creates an object graph with the default settings for the given template type.
    @param {String} templateType A value from PaneTemplateType.
    @returns {{}}*/
    var getDefaultPane = function (templateType)
    {
        if (templateType === EVUI.Modules.Panes.PaneTemplateType.Dialog)
        {            
            return {
                autoHideSettings:
                {
                    hideMode: EVUI.Modules.Panes.PaneHideMode.Explicit,
                    autoHideKeys: ["Escape", "Enter"],
                },
                showSettings:
                {
                    center: true,
                    clipSettings:
                    {
                        clipMode: EVUI.Modules.Panes.PaneClipMode.Shift,
                        clipBounds: document.documentElement
                    },
                },
                resizeMoveSettings:
                {
                    canDragMove: true,
                    canResizeBottom: true,
                    canResizeLeft: true,
                    canResizeRight: true,
                    canResizeTop: true,
                    dragHanldeMargin: 20
                }
            };
        }
        else if (templateType === EVUI.Modules.Panes.PaneTemplateType.Dropdown)
        {
            return {
                autoHideSettings:
                {
                    hideMode: EVUI.Modules.Panes.PaneHideMode.GlobalClick,
                    autoHideKeys: ["Escape"],
                    allowChaining: true
                },
                showSettings:
                {
                    relativePosition:
                    {
                        orientation: EVUI.Modules.Panes.RelativePositionOrientation.Bottom + " " + EVUI.Modules.Panes.RelativePositionOrientation.Right,
                        alignment: EVUI.Modules.Panes.RelativePositionAlignment.None,
                    },
                    clipSettings:
                    {
                        mode: EVUI.Modules.Panes.PaneClipMode.Shift,
                        clipBounds: document.documentElement
                    }
                }
            };
        }
        else if (templateType === EVUI.Modules.Panes.PaneTemplateType.Modal)
        {
            return {
                autoHideSettings:
                {
                    hideMode: EVUI.Modules.Panes.PaneHideMode.Explicit,
                    autoHideKeys: ["Escape", "Enter"],
                },
                showSettings:
                {
                    center: true,
                    backdropSettings:
                    {
                        showBackdrop: true
                    },
                },
                clipSettings:
                {
                    clipMode: EVUI.Modules.Panes.PaneClipMode.Clip,
                    clipBounds: document.documentElement
                }
            };
        }
        else
        {
            return {};
        }
    };

   /**Determines whether or not any of the AutoClose triggers attached to the Pane should trigger a hide operation on the Pane. Every Pane has their own listener, so this function fires once per visible Pane.
   @param {EVUI.Modules.Panes.PaneAutoTriggerContext} autoCloseArgs The auto-close arguments from the Pane's auto-close handlers.
   @returns {Boolean} */
    var shouldAutoHideChainedPane = function (autoCloseArgs)
    {
        if (autoCloseArgs == null) return true;
        if (autoCloseArgs.triggerType === EVUI.Modules.Panes.PaneAutoTriggerType.Click ||
            autoCloseArgs.triggerType === EVUI.Modules.Panes.PaneAutoTriggerType.ExteriorClick ||
            autoCloseArgs.triggerType === EVUI.Modules.Panes.PaneAutoTriggerType.GlobalClick)
        {
            return shouldAutoHideChainedPaneFromClick(autoCloseArgs);
        }
        else if (autoCloseArgs.triggerType === EVUI.Modules.Panes.PaneAutoTriggerType.KeyDown)
        {
            return shouldAutoHideChainedPaneOnKeydown(autoCloseArgs);
        }

        return true;
    };

    /**Determines if a mouse event should trigger an auto-close of the Pane. Every Pane has their own listener, so this function fires once per visible Pane.
    @param {EVUI.Modules.Panes.PaneAutoTriggerContext} autoCloseArgs The auto-close arguments generated by the Pane's auto-close handlers.
    @returns {Boolean}*/
    var shouldAutoHideChainedPaneFromClick = function (autoCloseArgs)
    {
        var autoCloseEntry = getInternalPaneEntry(autoCloseArgs.pane.id);
        var autoHideSettings = autoCloseArgs.pane.autoHideSettings == null ? {} : autoCloseArgs.pane.autoHideSettings;

        //if the auto hide settings doesn't allow for "chain showing" of Panes, the logic below doesn't apply
        if (autoCloseEntry.link.pane.autoHideSettings == null || autoCloseEntry.link.pane.autoHideSettings.allowChaining !== true) return true;

        var visiblePanes = []; //all the Panes currently showing
        var inMidShow = []; //all the Panes that are actively being shown

        var numEntries = _entries.length;
        for (var x = 0; x < numEntries; x++)
        {
            var curEntry = _entries[x];
            if (curEntry.link.pane.isVisible === true) visiblePanes.push(curEntry)
            if (curEntry.link.paneAction === EVUI.Modules.Panes.PaneAction.Show) inMidShow.push(curEntry);
        }

        var numVisible = visiblePanes.length;
        var numInMidShow = inMidShow.length;

        if (numInMidShow > 0) //no point in doing the loop below if nothing is being shown - not a "chain" operation
        {
            for (var x = 0; x < numVisible; x++)
            {
                var curEntry = visiblePanes[x];

                //see if any of the panes being shown was invoked from a chained pane
                for (var y = 0; y < numInMidShow; y++)
                {
                    var curInMidShow = inMidShow[y];
                    if (curInMidShow.link.currentOperation != null && curInMidShow.link.currentOperation.resolvedShowArgs != null && curInMidShow.link.currentOperation.resolvedShowArgs.relativePosition != null)
                    {
                        if (curEntry.link.pane.element.contains(curInMidShow.link.currentOperation.resolvedShowArgs.relativePosition.relativeElement)) return false;
                    }
                }
            }
        }

        return true;
    };

    /**Makes it so Panes close in descending order of Z-Index when the keydown auto-close command is issued. Every Pane has their own listener, so this function fires once per visible Pane.
    @param {EVUI.Modules.Panes.PaneAutoTriggerContext} autoCloseArgs The auto-close args generated by the handler.
    @returns {Boolean} */
    var shouldAutoHideChainedPaneOnKeydown = function (autoCloseArgs)
    {
        //if we have no auto-close keys, this doesn't apply
        if (autoCloseArgs.pane.autoHideSettings == null && EVUI.Modules.Core.Utils.isArray(autoCloseArgs.pane.autoHideSettings.autoHideKeys) === false || autoCloseArgs.pane.autoHideSettings.autoHideKeys.indexOf(autoCloseArgs.event.key) < 0) return false;

        var visiblePanes = getPaneEntry(function (entry) { return entry.link.pane.isVisible === true }, true);
        if (visiblePanes == null) return true;

        var currentZIndex = autoCloseArgs.pane.getCurrentZIndex();

        //only close the highest z-index pane
        var numPanes = visiblePanes.length;
        for (var x = 0; x < numPanes; x++)
        {
            var curPane = visiblePanes[x];
            if (curPane.link.pane.getCurrentZIndex() > currentZIndex)
            {
                return false;
            }
        }

        autoCloseArgs.event.stopPropagation();
        autoCloseArgs.event.preventDefault();
        return true;
    };

    /** Gets a PaneEntry object based on its ID or a selector function.
    @param {EVUI.Modules.Panes.Constants.Fn_PaneEntrySelector|String} paneIDOrSelector A selector function to select a PaneEntry object (or multiple PaneEntry objects) or the ID of the Pane to get the PaneEntry for.
    @param {Boolean} getAllMatches If a selector function is provided, all the PaneEntries that satisfy the selector are included. Otherwise a single PaneEntry object is returned. False by default.
    @returns {InternalPaneEntry|InternalPaneEntry[]} */
    var getPaneEntry = function (paneIDOrSelector, getAllMatches)
    {
        if (typeof paneIDOrSelector === "string")
        {
            var existing = getInternalPaneEntry(paneIDOrSelector);
            if (existing != null)
            {
                return existing;
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
                if (paneIDOrSelector(curEntry) === true)
                {
                    if (getAllMatches === true)
                    {
                        results.push(curEntry);
                    }
                    else
                    {
                        return curEntry;
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
    @param {PaneOperationSession} opSession The operation session to execute on.*/
    var performOperation = function (opSession)
    {
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
        else if (actionSequence[0] === ActionSequence.QueueCallback) //queue the callback for a duplicate operation without setting up a new event stream
        {
            return;
        }
        else if (actionSequence[0] === ActionSequence.Queue && opSession.isQueued === false)
        {
            var lastInSequence = callbackStack.opSessions[0];
            while (lastInSequence != null)
            {
                if (lastInSequence.queuedOpSession != null)
                {
                    lastInSequence = lastInSequence.queuedOpSession;
                }
                else
                {
                    lastInSequence.queuedOpSession = opSession;
                    opSession.isQueued = true;
                    break;
                }
            }

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
                            if (callbackStack.opSessions.filter(function (session) { return session === opSession && session.wasCanceled === true; }).length === 0)
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
        var completeStep = opSession.entry.link.eventStream.getStep(EVUI.Modules.Panes.Constants.Job_Complete);
        completeStep.handler = function (jobArgs) { jobArgs.resolve(); }

        //then get the same step, but in the new event stream and overwrite its handler to call BOTH callback stacks. We must the last one first and the first one last - this  because of some kind of race condition that predictably inverts the sequence, so we call them backwards 
        var realCompleteStep = eventStream.getStep(EVUI.Modules.Panes.Constants.Job_Complete);
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
                if (callbackStack.opSessions.filter(function (session) { return session === opSession && session.wasCanceled === true; }).length === 0)
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
        opSession.entry.link.currentOperation = opSession;

        setTimeout(function () //we set a timeout so synchronous calls cancel each other out and this ensures that the event stream only begins once the current stack frame has cleared.
        {
            var callbackStack = getCallbackStack(opSession.entry.link, opSession.action) //make sure the callbacks haven't already been called or the step wasn't canceled (either way it means the stream shouldn't do anything).
            if (callbackStack != null)
            {
                if (callbackStack.opSessions.filter(function (session) { return session === opSession && session.wasCanceled === true; }).length === 0)
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
                curSession.wasCanceled = true;
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
        eventStream.context = opSession.entry.link.pane;

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
            else if (curStep === ActionSequence.Move)
            {
                addMoveSteps(eventStream, opSession);
            }
            else if (curStep === ActionSequence.Resize)
            {
                addResizeSteps(eventStream, opSession);
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
        eventStream.bubblingEvents = [opSession.entry.link.bubblingEvents, _bubblingEvents];

        var curArgs = null;

        eventStream.processInjectedEventArgs = function (eventStreamArgs)
        {
            var paneArgs = new EVUI.Modules.Panes.PaneEventArgs(opSession.entry);
            paneArgs.cancel = eventStreamArgs.cancel;
            paneArgs.eventType = eventStreamArgs.key;
            paneArgs.eventName = eventStreamArgs.name;
            paneArgs.pause = eventStreamArgs.pause;
            paneArgs.resume = eventStreamArgs.resume;
            paneArgs.cancel = eventStreamArgs.cancel;
            paneArgs.stopPropagation = eventStreamArgs.stopPropagation;

            if (opSession.context == null)
            {
                if (opSession.action === EVUI.Modules.Panes.PaneAction.Show)
                {
                    if (opSession.resolvedShowArgs != null) opSession.context = opSession.resolvedShowArgs.context;
                }
                else if (opSession.action === EVUI.Modules.Panes.PaneAction.Load)
                {
                    if (opSession.resolvedLoadArgs != null) opSession.context = opSession.resolvedLoadArgs.context;
                }
                else if (opSession.action === EVUI.Modules.Panes.PaneAction.Hide)
                {
                    if (opSession.resolvedHideArgs != null) opSession.context = opSession.resolvedHideArgs.context;
                }
                else if (opSession.action === EVUI.Modules.Panes.PaneAction.Unload)
                {
                    if (opSession.resolvedUnloadArgs != null) opSession.context = opSession.resolvedUnloadArgs.context;
                }
                else if (opSession.action === EVUI.Modules.Panes.PaneAction.Move)
                {
                    if (opSession.resolvedMoveArgs != null) opSession.context = opSession.resolvedMoveArgs.context;
                }
                else if (opSession.action === EVUI.Modules.Panes.PaneAction.Resize)
                {
                    if (opSession.resolvedResizeArgs != null) opSession.context = opSession.resolvedResizeArgs.context;
                }
            }


            paneArgs.context = opSession.context;
            paneArgs.hideArgs = opSession.userHideArgs;
            paneArgs.loadArgs = opSession.userLoadArgs;
            paneArgs.showArgs = opSession.userShowArgs;
            paneArgs.unloadArgs = opSession.unloadArgs;
            paneArgs.moveArgs = opSession.userMoveArgs;
            paneArgs.resizeArgs = opSession.userResizeArgs;
            paneArgs.action = opSession.action;
            paneArgs.currentAction = opSession.currentAction;
            paneArgs.paneShowMode = opSession.showMode;
            paneArgs.calculatedPosition = EVUI.Modules.Core.Utils.deepExtend({}, opSession.entry.link.lastCalculatedPosition);

            return paneArgs;
        };

        eventStream.processReturnedEventArgs = function (eventStreamArgs)
        {
            //copy the values potentially made by the user back onto the op session
            opSession.context = eventStreamArgs.context;
            opSession.userHideArgs = eventStreamArgs.hideArgs;
            opSession.userLoadArgs = eventStreamArgs.loadArgs;
            opSession.userShowArgs = eventStreamArgs.showArgs;
            opSession.userUnloadArgs = eventStreamArgs.unloadArgs;
            opSession.userResizeArgs = eventStreamArgs.resizeArgs;
            opSession.userMoveArgs = eventStreamArgs.moveArgs;
        };

        eventStream.onCancel = function ()
        {
            eventStream.seek(EVUI.Modules.Panes.Constants.Job_Complete);
        };

        eventStream.onError = function (args, error)
        {
            eventStream.seek(EVUI.Modules.Panes.Constants.Job_Complete);
        }
    };    

    /**Adds the load sequence steps to the EventStream.
    @param {EVUI.Modules.EventStream.EventStream} eventStream The event stream to receive the events.
    @param {PaneOperationSession} opSession The operation session driving the events.*/
    var addLoadSteps = function (eventStream, opSession)
    {
        var skipLoad = false;

        eventStream.addStep({
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Job_Preload,
            key: EVUI.Modules.Panes.Constants.Job_Preload,
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
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Event_OnLoad,
            key: EVUI.Modules.Panes.Constants.Event_OnLoad,
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
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Event_OnLoad,
            key: EVUI.Modules.Panes.Constants.Event_OnLoad,
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            handler: function (eventArgs)
            {
                if (EVUI.Modules.Core.Utils.hasFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Loaded) === true) return;

                if (typeof _self.onLoad === "function")
                {
                    return _self.onLoad.call(_self, eventArgs)
                }
            }
        });

        eventStream.addStep({
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Job_Load,
            key: EVUI.Modules.Panes.Constants.Job_Load,
            type: EVUI.Modules.EventStream.EventStreamStepType.Job,
            handler: function (jobArgs)
            {
                opSession.resolvedLoadArgs = resolvePaneLoadArgs(opSession.entry.link.pane.loadSettings, opSession.userLoadArgs);
                if (EVUI.Modules.Core.Utils.hasFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Loaded) === true && opSession.resolvedLoadArgs.reload === false) return jobArgs.resolve();

                if (EVUI.Modules.Core.Utils.isElement(opSession.entry.link.pane.element) === true)
                {
                    opSession.entry.link.paneStateFlags |= EVUI.Modules.Panes.PaneStateFlags.Loaded;
                    return jobArgs.resolve();
                }
                else if (opSession.entry.link.pane.element != null)
                {
                    opSession.entry.link.pane.element = resolveElement(opSession.entry.link.pane.element);
                    if (EVUI.Modules.Core.Utils.isElement(opSession.entry.link.pane.element) === true)
                    {
                        opSession.entry.link.paneStateFlags |= EVUI.Modules.Panes.PaneStateFlags.Loaded;
                        return jobArgs.resolve();
                    }
                }

                opSession.resolvedLoadArgs = resolvePaneLoadArgs(opSession.entry.link.pane.loadSettings, opSession.userLoadArgs);

                if (opSession.resolvedLoadArgs.reload === true)
                {
                    opSession.entry.link.paneStateFlags = EVUI.Modules.Core.Utils.removeFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Loaded);
                    unloadRootElement(opSession.entry);
                }

                if (EVUI.Modules.Core.Utils.hasFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Loaded))
                {
                    return jobArgs.resolve();
                }

                loadRootElement(opSession.entry, opSession.resolvedLoadArgs, function (success)
                {
                    if (success === true)
                    {
                        if (opSession.entry.link.pane.element != null)
                        {
                            if (opSession.entry.link.pane.element.isConnected === false) moveToLoadDiv(opSession.entry);
                        }

                        opSession.entry.link.paneStateFlags |= EVUI.Modules.Panes.PaneStateFlags.Loaded;
                        opSession.entry.link.lastResolvedLoadArgs = opSession.resolvedLoadArgs;
                        jobArgs.resolve();
                    }
                    else
                    {
                        jobArgs.reject("Failed to load Pane root element.")
                    }
                });
            }
        });

        eventStream.addStep({
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Event_OnLoaded,
            key: EVUI.Modules.Panes.Constants.Event_OnLoaded,
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
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Event_OnLoaded,
            key: EVUI.Modules.Panes.Constants.Event_OnLoaded,
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            handler: function (eventArgs)
            {
                if (skipLoad === true) return;

                if (typeof _self.onLoaded === "function")
                {
                    return _self.onLoaded.call(_self, eventArgs)
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
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Event_OnInitialize,
            key: EVUI.Modules.Panes.Constants.Event_OnInitialize,
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
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Event_OnInitialize,
            key: EVUI.Modules.Panes.Constants.Event_OnInitialize,
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            handler: function (eventArgs)
            {
                if (EVUI.Modules.Core.Utils.hasFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Initialized) === true) return;

                if (typeof _self.onInitialize === "function")
                {
                    return _self.onInitialize.call(_self, eventArgs);
                }
            }
        });

        eventStream.addStep({
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Job_Initialize,
            key: EVUI.Modules.Panes.Constants.Job_Initialize,
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
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Event_OnShow,
            key: EVUI.Modules.Panes.Constants.Event_OnShow,
            type: EVUI.Modules.EventStream.EventStreamStepType.Event,
            handler: function (eventArgs)
            {
                opSession.currentAction = EVUI.Modules.Panes.PaneAction.Show;
                
                if (typeof opSession.entry.link.pane.onShow === "function")
                {
                    opSession.resolvedShowArgs = resolvePaneShowArgs(opSession.entry, opSession.userShowArgs);

                    var position = getPosition(opSession.entry, opSession.resolvedShowArgs);
                    opSession.entry.link.lastCalculatedPosition = position;

                    return opSession.entry.link.pane.onShow.call(this, eventArgs)
                }
            }
        });

        eventStream.addStep({
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Event_OnShow,
            key: EVUI.Modules.Panes.Constants.Event_OnShow,
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            handler: function (eventArgs)
            {
                if (typeof _self.onShow === "function")
                {
                    opSession.resolvedShowArgs = resolvePaneShowArgs(opSession.entry, opSession.userShowArgs);

                    var position = getPosition(opSession.entry, opSession.resolvedShowArgs);
                    opSession.entry.link.lastCalculatedPosition = position;

                    return _self.onShow.call(_self, eventArgs)
                }
            }
        });

        addPositionSteps(eventStream, opSession);

        eventStream.addStep({
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Event_OnShown,
            key: EVUI.Modules.Panes.Constants.Event_OnShown,
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
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Event_OnShown,
            key: EVUI.Modules.Panes.Constants.Event_OnShown,
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            handler: function (eventArgs)
            {
                if (typeof _self.onShown === "function")
                {
                    return _self.onShown.call(_self, eventArgs)
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
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Event_OnHide,
            key: EVUI.Modules.Panes.Constants.Event_OnHide,
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
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Event_OnHide,
            key: EVUI.Modules.Panes.Constants.Event_OnHide,
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            handler: function (eventArgs)
            {
                if (EVUI.Modules.Core.Utils.hasFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Visible) === false) return;

                if (typeof _self.onHide === "function")
                {
                    return _self.onHide.call(_self, eventArgs);
                }
            }
        });

        eventStream.addStep({
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Job_Hide,
            key: EVUI.Modules.Panes.Constants.Job_Hide,
            type: EVUI.Modules.EventStream.EventStreamStepType.Job,
            handler: function (jobArgs)
            {
                if (EVUI.Modules.Core.Utils.hasFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Visible) === false) return jobArgs.resolve();

                opSession.resolvedHideArgs = resolvePaneHideArgs(opSession.entry, opSession.userHideArgs);

                var rootHidden = false;
                var transitionApplied = false;
                var commonCallback = function ()
                {
                    if (rootHidden === false || transitionApplied === false) return;

                    opSession.entry.link.paneStateFlags = EVUI.Modules.Core.Utils.removeFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Visible);
                    opSession.entry.link.paneStateFlags = EVUI.Modules.Core.Utils.removeFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Positioned);

                    var resizeMoveSettings = resolveResizeMoveSettings(opSession.entry);
                    if (resizeMoveSettings.restoreDefaultOnHide === true)
                    {
                        toggleInlinedStyle(opSession.entry, true);
                    }

                    jobArgs.resolve();                    
                }

                hideRootElement(opSession.entry, opSession.entry.link.lastResolvedShowArgs, opSession.resolvedHideArgs.hideTransition, function ()
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
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Event_OnHidden,
            key: EVUI.Modules.Panes.Constants.Event_OnHidden,
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
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Event_OnHidden,
            key: EVUI.Modules.Panes.Constants.Event_OnHidden,
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            handler: function (eventArgs)
            {
                if (skip === true) return;

                if (typeof _self.onShown === "function")
                {
                    return _self.onShown.call(_self, eventArgs)
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
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Job_InitialPosition,
            key: EVUI.Modules.Panes.Constants.Job_InitialPosition,
            type: EVUI.Modules.EventStream.EventStreamStepType.Job,
            handler: function (jobArgs)
            {
                opSession.action = EVUI.Modules.Panes.PaneAction.Show;
                opSession.resolvedShowArgs = resolvePaneShowArgs(opSession.entry, opSession.userShowArgs);

                var position = getPosition(opSession.entry, opSession.resolvedShowArgs);
                opSession.entry.link.lastCalculatedPosition = position;

                jobArgs.resolve();
            }
        });

        eventStream.addStep({
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Event_OnPosition,
            key: EVUI.Modules.Panes.Constants.Event_OnPosition,
            type: EVUI.Modules.EventStream.EventStreamStepType.Event,
            handler: function (eventArgs)
            {
                if (typeof opSession.entry.link.pane.onPosition === "function")
                {
                    opSession.resolvedShowArgs = resolvePaneShowArgs(opSession.entry, opSession.userShowArgs);

                    var position = getPosition(opSession.entry, opSession.resolvedShowArgs);
                    opSession.entry.link.lastCalculatedPosition = position;

                    return opSession.entry.link.pane.onPosition.call(this, eventArgs)
                }
            }
        });

        eventStream.addStep({
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Event_OnPosition,
            key: EVUI.Modules.Panes.Constants.Event_OnPosition,
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            handler: function (eventArgs)
            {
                if (typeof _self.onPosition === "function")
                {
                    opSession.resolvedShowArgs = resolvePaneShowArgs(opSession.entry, opSession.userShowArgs);

                    var position = getPosition(opSession.entry, opSession.resolvedShowArgs);
                    opSession.entry.link.lastCalculatedPosition = position;

                    return _self.onPosition.call(_self, eventArgs)
                }
            }
        });

        eventStream.addStep({
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Job_FinalPosition,
            key: EVUI.Modules.Panes.Constants.Job_FinalPosition,
            type: EVUI.Modules.EventStream.EventStreamStepType.Job,
            handler: function (jobArgs)
            {
                var transitionApplied = false;
                var positioned = false;

                opSession.resolvedShowArgs = resolvePaneShowArgs(opSession.entry, opSession.userShowArgs);

                var position = getPosition(opSession.entry, opSession.resolvedShowArgs);
                opSession.entry.link.lastCalculatedPosition = position;

                var callback = function ()
                {
                    if (transitionApplied === false || positioned === false) return;

                    opSession.entry.link.paneStateFlags |= EVUI.Modules.Panes.PaneStateFlags.Positioned;
                    opSession.entry.link.paneStateFlags |= EVUI.Modules.Panes.PaneStateFlags.Visible;
                    opSession.entry.link.lastResolvedShowArgs = opSession.resolvedShowArgs;
                    jobArgs.resolve();
                };

                if (opSession.resolvedShowArgs.backdropSettings != null && opSession.resolvedShowArgs.backdropSettings.showBackdrop === true)
                {
                    EVUI.Modules.Panes.Constants.GlobalZIndex++;
                    opSession.entry.link.lastCalculatedPosition.zIndex = EVUI.Modules.Panes.Constants.GlobalZIndex;

                    _settings.backdropManager.showBackdrop(opSession.entry.link.paneCSSName, opSession.entry.link.lastCalculatedPosition.zIndex - 1, opSession.resolvedShowArgs.backdropSettings, function ()
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

                positionPane(opSession.entry, opSession.resolvedShowArgs, opSession.entry.link.lastCalculatedPosition, function (success)
                {
                    positioned = true;
                    callback();
                });               
            }
        });
    };

    /**Adds the initialize sequence steps to the EventStream.
    @param {EVUI.Modules.EventStream.EventStream} eventStream The event stream to receive the events.
    @param {PaneOperationSession} opSession The operation session driving the events.*/
    var addMoveSteps = function (eventStream, opSession)
    {
            eventStream.addStep({
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Event_OnMove,
            key: EVUI.Modules.Panes.Constants.Event_OnMove,
            type: EVUI.Modules.EventStream.EventStreamStepType.Event,
            handler: function (eventArgs)
            {
                if (opSession.wasCanceled === true) return;
                opSession.currentAction = EVUI.Modules.Panes.PaneAction.Move;

                if (EVUI.Modules.Core.Utils.hasFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Visible) === false) return;
                if (typeof opSession.entry.link.pane.onMove === "function")
                {
                    return opSession.entry.link.pane.onMove.call(this, eventArgs);
                }
            }
        });

        eventStream.addStep({
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Event_OnMove,
            key: EVUI.Modules.Panes.Constants.Event_OnMove,
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            handler: function (eventArgs)
            {
                if (opSession.wasCanceled === true) return;
                if (EVUI.Modules.Core.Utils.hasFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Visible) === false) return;

                if (typeof _self.onMove === "function")
                {
                    return _self.onMove.call(_self, eventArgs);
                }
            }
        });

        eventStream.addStep({
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Job_Move,
            key: EVUI.Modules.Panes.Constants.Job_Move,
            type: EVUI.Modules.EventStream.EventStreamStepType.Job,
            handler: function (jobArgs)
            {
                if (opSession.wasCanceled === true) return;
                var bounds = (opSession.entry.link.lastResolvedShowArgs.clipSettings != null && opSession.entry.link.lastResolvedShowArgs.clipSettings.mode === EVUI.Modules.Panes.PaneClipMode.Shift) ? getClipBounds(opSession.entry.link.lastResolvedShowArgs.clipSettings) : null;
                var helper = new EVUI.Modules.Dom.DomHelper(opSession.entry.link.pane.element);

                movePane(opSession.entry, opSession.userMoveArgs, helper, null, bounds, function ()
                {
                    jobArgs.resolve();
                });
            }
        });

        eventStream.addStep({
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Event_OnMoved,
            key: EVUI.Modules.Panes.Constants.Event_OnMoved,
            type: EVUI.Modules.EventStream.EventStreamStepType.Event,
            handler: function (eventArgs)
            {
                if (opSession.wasCanceled === true) return;
                opSession.currentAction = EVUI.Modules.Panes.PaneAction.Moved;

                if (EVUI.Modules.Core.Utils.hasFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Visible) === false) return;
                if (typeof opSession.entry.link.pane.onMoved === "function")
                {
                    return opSession.entry.link.pane.onMoved.call(this, eventArgs);
                }
            }
        });

        eventStream.addStep({
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Event_OnMoved,
            key: EVUI.Modules.Panes.Constants.Event_OnMoved,
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            handler: function (eventArgs)
            {
                if (opSession.wasCanceled === true) return;
                if (EVUI.Modules.Core.Utils.hasFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Visible) === false) return;

                if (typeof _self.onMoved === "function")
                {
                    return _self.onMoved.call(_self, eventArgs);
                }
            }
        });
    };

    /**Adds the initialize sequence steps to the EventStream.
@param {EVUI.Modules.EventStream.EventStream} eventStream The event stream to receive the events.
@param {PaneOperationSession} opSession The operation session driving the events.*/
    var addResizeSteps = function (eventStream, opSession)
    {
        eventStream.addStep({
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Event_OnResize,
            key: EVUI.Modules.Panes.Constants.Event_OnResize,
            type: EVUI.Modules.EventStream.EventStreamStepType.Event,
            handler: function (eventArgs)
            {
                if (opSession.wasCanceled === true) return;
                opSession.currentAction = EVUI.Modules.Panes.PaneAction.Resize;

                if (EVUI.Modules.Core.Utils.hasFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Visible) === false) return;
                if (typeof opSession.entry.link.pane.onResize === "function")
                {
                    return opSession.entry.link.pane.onResize.call(this, eventArgs);
                }
            }
        });

        eventStream.addStep({
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Event_OnResize,
            key: EVUI.Modules.Panes.Constants.Event_OnResize,
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            handler: function (eventArgs)
            {
                if (opSession.wasCanceled === true) return;
                if (EVUI.Modules.Core.Utils.hasFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Visible) === false) return;

                if (typeof _self.onResize === "function")
                {
                    return _self.onResize.call(_self, eventArgs);
                }
            }
        });

        eventStream.addStep({
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Job_Resize,
            key: EVUI.Modules.Panes.Constants.Job_Resize,
            type: EVUI.Modules.EventStream.EventStreamStepType.Job,
            handler: function (jobArgs)
            {
                if (opSession.wasCanceled === true) return;
                var bounds = (opSession.entry.link.lastResolvedShowArgs.clipSettings != null && opSession.entry.link.lastResolvedShowArgs.clipSettings.mode === EVUI.Modules.Panes.PaneClipMode.Shift) ? getClipBounds(opSession.entry.link.lastResolvedShowArgs.clipSettings) : null;
                var helper = new EVUI.Modules.Dom.DomHelper(opSession.entry.link.pane.element);

                resizePane(opSession.entry, opSession.userResizeArgs, helper, null, bounds, function ()
                {
                    jobArgs.resolve();
                });
            }
        });

        eventStream.addStep({
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Event_OnResized,
            key: EVUI.Modules.Panes.Constants.Event_OnResized,
            type: EVUI.Modules.EventStream.EventStreamStepType.Event,
            handler: function (eventArgs)
            {
                if (opSession.wasCanceled === true) return;
                opSession.currentAction = EVUI.Modules.Panes.PaneAction.Resized;

                if (EVUI.Modules.Core.Utils.hasFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Visible) === false) return;
                if (typeof opSession.entry.link.pane.onResized === "function")
                {
                    return opSession.entry.link.pane.onResized.call(this, eventArgs);
                }
            }
        });

        eventStream.addStep({
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Event_OnResized,
            key: EVUI.Modules.Panes.Constants.Event_OnResized,
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            handler: function (eventArgs)
            {
                if (opSession.wasCanceled === true) return;
                if (EVUI.Modules.Core.Utils.hasFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Visible) === false) return;

                if (typeof _self.onResized === "function")
                {
                    return _self.onResized.call(_self, eventArgs);
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

            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Job_Complete,
            key: EVUI.Modules.Panes.Constants.Job_Complete,
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
                    if (opSession.resolvedUnloadArgs != null && opSession.resolvedUnloadArgs.remove === true) _self.removePane(opSession.entry.paneId);
                    opSession.entry.link.paneAction = EVUI.Modules.Panes.PaneAction.None;
                    opSession.entry.link.lastCalculatedPosition = null;
                    opSession.entry.link.currentOperation = null;

                    if (opSession.queuedOpSession != null) //if we have a queued action waiting on this one to finish, we start it after all the previous callbacks have been invoked
                    {
                        performOperation(opSession.queuedOpSession);
                        opSession.queuedOpSession.isQueued = false;
                    }

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
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Event_OnUnload,
            key: EVUI.Modules.Panes.Constants.Event_OnUnload,
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
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Event_OnUnload,
            key: EVUI.Modules.Panes.Constants.Event_OnUnload,
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            handler: function (eventArgs)
            {
                if (skip === true || EVUI.Modules.Core.Utils.hasFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Loaded) === false) return;

                if (typeof _self.onUnload === "function")
                {
                    return _self.onUnload.call(_self, eventArgs);
                }
            }
        });

        eventStream.addStep({
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Job_Unload,
            key: EVUI.Modules.Panes.Constants.Job_Unload,
            type: EVUI.Modules.EventStream.EventStreamStepType.Job,
            handler: function (jobArgs)
            {
                opSession.entry.link.paneStateFlags = EVUI.Modules.Core.Utils.removeFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Loaded);

                if (skip === true) return jobArgs.resolve();
                
                try
                {
                    opSession.resolvedUnloadArgs = resolvePaneUnloadArgs(opSession.entry, opSession.userUnloadArgs);                    
                    unloadRootElement(opSession.entry, opSession.entry.link.lastResolvedShowArgs);                    
                }
                catch (ex)
                {
                    opSession.entry.link.paneStateFlags = EVUI.Modules.Core.Utils.addFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Loaded);
                    return jobArgs.resolve();
                }

                jobArgs.resolve();
            }
        });

        eventStream.addStep({
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Event_OnUnloaded,
            key: EVUI.Modules.Panes.Constants.Event_OnUnloaded,
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
            name: EVUI.Modules.Panes.Constants.StepPrefix + "." + EVUI.Modules.Panes.Constants.Event_OnUnloaded,
            key: EVUI.Modules.Panes.Constants.Event_OnUnloaded,
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            handler: function (eventArgs)
            {
                if (skip === true) return;

                if (typeof _self.onUnloaded === "function")
                {
                    return _self.onUnloaded.call(_self, eventArgs)
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
            opSession.resolvedLoadArgs = resolvePaneLoadArgs(opSession.entry.link.pane.loadSettings, opSession.userLoadArgs);
            if (opSession.resolvedLoadArgs.reload === true)
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
                    return [ActionSequence.QueueCallback];
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
                return [ActionSequence.QueueCallback];
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
                if (opAction === EVUI.Modules.Panes.PaneAction.Move || opAction === EVUI.Modules.Panes.PaneAction.Resize)
                {
                    return actionSequence;
                }
                
                return [ActionSequence.QueueCallback];
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
        else if (opSession.action === EVUI.Modules.Panes.PaneAction.Move)
        {
            sequence = getMoveSequence(opSession);
        }
        else if (opSession.action === EVUI.Modules.Panes.PaneAction.Resize)
        {
            sequence = getResizeSequence(opSession);
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

        if (opSession.resolvedShowArgs == null) opSession.resolvedShowArgs = resolvePaneShowArgs(opSession.entry, opSession.userShowArgs);

        if (EVUI.Modules.Core.Utils.hasFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Initialized) === false || opSession.resolvedShowArgs.reInitialize === true) //whether or not the init function has been called - only called on the first show after it has been loaded. 
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
            if (opSession.resolvedLoadArgs == null) opSession.resolvedLoadArgs = resolvePaneLoadArgs(opSession.entry.link.pane.loadSettings, opSession.userLoadArgs);
            if (opSession.resolvedLoadArgs.reload === true) //forcing a reload
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

        if (opSession.entry.link.paneAction === EVUI.Modules.Panes.PaneAction.Load ||
            opSession.entry.link.paneAction === EVUI.Modules.Panes.PaneAction.Show ||
            opSession.entry.link.paneAction === EVUI.Modules.Panes.PaneAction.Unload ||
            opSession.entry.link.paneAction === EVUI.Modules.Panes.PaneAction.Move ||
            opSession.entry.link.paneAction === EVUI.Modules.Panes.PaneAction.Resize) //if it's being loaded or shown (which also loads it), cancel that operation
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

        if (opSession.entry.link.paneAction === EVUI.Modules.Panes.PaneAction.Load ||
            opSession.entry.link.paneAction === EVUI.Modules.Panes.PaneAction.Show ||
            opSession.entry.link.paneAction === EVUI.Modules.Panes.PaneAction.Hide ||
            opSession.entry.link.paneAction === EVUI.Modules.Panes.PaneAction.Move ||
            opSession.entry.link.paneAction === EVUI.Modules.Panes.PaneAction.Resize) //cancel if anything is happening already
        {
            sequence.push(ActionSequence.CancelCurrent);
        }

        if (EVUI.Modules.Core.Utils.hasFlag(opSession.entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Loaded) === true)
        {
            sequence.push(ActionSequence.Unload);
        }

        return sequence;
    };

    /**
     * 
     * @param {PaneOperationSession} opSession
     */
    var getMoveSequence = function (opSession)
    {
        var sequence = [];

        if (opSession.entry.link.paneAction === EVUI.Modules.Panes.PaneAction.Move || opSession.entry.link.paneAction === EVUI.Modules.Panes.PaneAction.Resize)
        {
            sequence.push(ActionSequence.Queue);
        }

        sequence.push(ActionSequence.Move);

        return sequence;
    }

    /**
     * 
     * @param {PaneOperationSession} opSession
     */
    var getResizeSequence = function (opSession)
    {
        var sequence = [];

        if (opSession.entry.link.paneAction === EVUI.Modules.Panes.PaneAction.Move || opSession.entry.link.paneAction === EVUI.Modules.Panes.PaneAction.Resize)
        {
            sequence.push(ActionSequence.Queue);
        }

        sequence.push(ActionSequence.Resize);

        return sequence;
    }

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

            if (curSession.isQueued === true) continue;
            if (curSession.continuedTo != null) //we have a link
            {
                var linkedCallbackStack = getCallbackStack(link, curSession.continuedTo.action);
                if (linkedCallbackStack != null && hasLink === false) //we haven't already merged the two together
                {
                    hasLink = true;

                    var canceledSessions = linkedCallbackStack.opSessions.filter(function (op) { return op.wasCanceled; }); //get all the canceled ones
                    if (canceledSessions.length === linkedCallbackStack.opSessions.length) //if they all were canceled, remove the entry from the list
                    {
                        var index = link.callbackStack.indexOf(linkedCallbackStack);
                        if (index !== -1) link.callbackStack.splice(index, 1);
                    }
                    else //otherwise keep the ones that weren't canceled in the list to be called later
                    {
                        linkedCallbackStack.opSessions = linkedCallbackStack.opSessions.filter(function (op) { return op.wasCanceled === false; });
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
    @param {EVUI.Modules.Panes.PaneShowArgs} resolvedShowArgs Either a PaneShowSettings or a PanePosition object.
    @param {EVUI.Modules.Panes.PanePosition} position Optional. The position to place the pane at, if populated will be used instead of the resolvedShowArgs for the final position of the pane.
    @param {Function} callback A callback function to call once the Pane has been positioned. */
    var positionPane = function (entry, resolvedShowArgs, position, callback)
    {
        _settings.stylesheetManager.ensureSheet(EVUI.Modules.Styles.Constants.DefaultStyleSheetName, { lock: true });

        if (position != null && (position instanceof EVUI.Modules.Panes.PanePosition || (typeof position.top === "number" && position.left === "number" && typeof position.mode === "string")))
        {
            position = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Panes.PanePosition(position.mode), position, ["mode"]);
        }   

        setPosition(entry, resolvedShowArgs, position, callback);
    };

    /**Sets the Position of a Pane.
    @param {InternalPaneEntry} entry The entry representing the Pane to display.
    @param {EVUI.Modules.Panes.PaneShowArgs} resolvedShowArgs The current settings dictating how the Pane will be positioned and displayed.
    @param {Function} callback A callback function to call once the Pane has been positioned and has had its transition effect removed (if there was one).*/
    var setPosition = function (entry, resolvedShowArgs, position, callback)
    {
        if (typeof callback !== "function") callback = function () { };

        toggleInlinedStyle(entry, false); //remove the inlined style so we can calculate the position correctly

        if (position == null)
        {
            entry.link.lastResolvedShowArgs = resolvedShowArgs
            position = getPosition(entry, resolvedShowArgs); //calculate the position 
        }

        entry.link.lastCalculatedPosition = position;
        
        removePaneCSS(entry, true); //remove the CSS from the stylesheet
        removePaneClasses(entry, true); //remove all the existing classes from the Pane

        if (position == null)
        {
            moveToLoadDiv(entry);
            return callback(false);
        }

        generatePaneCSS(entry, resolvedShowArgs, position); //build the CSS and apply all the classes
        displayPane(entry, resolvedShowArgs, position, false, function (success)
        {
            callback(success);
        });
    };

    /**Gets the position of a Pane without disturbing its current position or state.
    @param {InternalPaneEntry} entry The entry representing the Pane to get the position of.
    @param {EVUI.Modules.Panes.PaneShowArgs} resolvedShowArgs The settings for how to display the Pane.
    @returns {EVUI.Modules.Panes.PanePosition}*/
    var getPosition = function (entry, resolvedShowArgs)
    {
        if (entry == null || entry.link.pane.element == null) return null; //no element, no position
        if (EVUI.Modules.Core.Utils.hasFlag(entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Loaded) === false) return null; //not loaded, can't position it

        //first, remove all the classes we have added that are positioning the element
        var removedClasses = removePaneClasses(entry);

        var ele = new EVUI.Modules.Dom.DomHelper(entry.link.pane.element);
        var position = null;
        var mode = getPositionMode(resolvedShowArgs);

        if (mode !== EVUI.Modules.Panes.PaneShowMode.DocumentFlow && EVUI.Modules.Core.Utils.hasFlag(entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Visible) === false) //not visible, we can't measure it right now and therefore can't place it
        {
            moveToMeasureDiv(entry); //move it to a special div where it has no height or width, but has invisible overflow. This allows us to measure the element as if it were visible without actually displaying it
            position = calculatePosition(entry, resolvedShowArgs, mode);
            moveToLoadDiv(entry); //move it out of the special div and put it back in the hidden div
        }
        else //visible, we can measure it as it is.
        {
            position = calculatePosition(entry, resolvedShowArgs, mode);
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

        if (position.mode === EVUI.Modules.Panes.PaneShowMode.AbsolutePosition ||
            position.mode === EVUI.Modules.Panes.PaneShowMode.Anchored ||
            position.mode === EVUI.Modules.Panes.PaneShowMode.RelativePosition ||
            position.mode === EVUI.Modules.Panes.PaneShowMode.Centered ||
            position.mode === EVUI.Modules.Panes.PaneShowMode.None)
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

            _settings.stylesheetManager.setRules(EVUI.Modules.Styles.Constants.DefaultStyleSheetName, positionSelector, rules);
        }
        else if (position.mode === EVUI.Modules.Panes.PaneShowMode.Fullscreen)
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

            _settings.stylesheetManager.setRules(EVUI.Modules.Styles.Constants.DefaultStyleSheetName, positionSelector, rules);
        }
        else if (position.mode === EVUI.Modules.Panes.PaneShowMode.PositionClass)
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
                _settings.stylesheetManager.setRules(EVUI.Modules.Styles.Constants.DefaultStyleSheetName, positionSelector, rules);
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
        if (position.mode === EVUI.Modules.Panes.PaneShowMode.Anchored)
        {
            if (showSettings.anchors.alignX === EVUI.Modules.Panes.AnchorAlignment.Elastic) setDims.setWidth = true;
            if (showSettings.anchors.alignY === EVUI.Modules.Panes.AnchorAlignment.Elastic) setDims.setHeight = true;
            if (showSettings.anchors.left != null && showSettings.anchors.right != null) setDims.setWidth = true;
            if (showSettings.anchors.top != null && showSettings.anchors.bottom != null) setDims.setHeight = true;
        }

        return setDims;
    };

    /**Removes or adds the in-lined style of the Pane's root element.
    @param {InternalPaneEntry} entry The entry being manipulated.
    @param {Boolean} remove Whether or not to remove the inlined style classes and restore the inlined style tag.*/
    var toggleInlinedStyle = function (entry, remove)
    {
        var selector = getSelector(entry, EVUI.Modules.Panes.Constants.CSS_Pane_Style);

        if (remove === true)
        {
            if (restoreInlinedStyle(entry) === true)
            {
                _settings.stylesheetManager.removeRules(EVUI.Modules.Styles.Constants.DefaultStyleSheetName, selector);
                entry.link.pane.element.classList.remove(EVUI.Modules.Panes.Constants.CSS_Pane_Style);
            }
        }
        else
        {
            if (removeInlinedStyle(entry) === true)
            {
                _settings.stylesheetManager.setRules(EVUI.Modules.Styles.Constants.DefaultStyleSheetName, selector, entry.link.inlinedStyle);
                entry.link.pane.element.classList.add(EVUI.Modules.Panes.Constants.CSS_Pane_Style);
            }
        }
    };

    /**Removes the in-lined style from the Pane and stores it in the PaneLink.
    @param {InternalPaneEntry} entry The entry to strip the in-lined style from.
    @returns {Boolean}*/
    var removeInlinedStyle = function (entry)
    {
        var ele = new EVUI.Modules.Dom.DomHelper(entry.link.pane.element);
        var style = ele.attr("style");

        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(style) === true || style === "display: inline-block;") return false;

        entry.link.inlinedStyle = style;
        ele.attr("style", "");

        return true;
    };

    /**Restores the in-lined style to the Pane from the PaneLink.
    @param {InternalPaneEntry} entry The entry to restore the in-lined style to.
    @returns {Boolean}*/
    var restoreInlinedStyle = function (entry)
    {
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(entry.link.inlinedStyle) === true) return false;

        var ele = new EVUI.Modules.Dom.DomHelper(entry.link.pane.element);

        var style = ele.attr("style");
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(style) === false && style !== "display: inline-block;" && style !== entry.link.inlinedStyle) return true;

        var style = ele.attr("style", entry.link.inlinedStyle);

        return true;
    }

    /**Removes all the CSS rules from the managed sheet that pertain to a particular Pane.
    @param {InternalPaneEntry} entry The entry representing the Pane to remove the CSS of.
    @param {Boolean} keepInlinedDefaultStyle Whether or not to remove the inlined style extracted from the element.*/
    var removePaneCSS = function (entry, keepInlinedDefaultStyle)
    {
        var allClasses = getAllClassNames();
        var numClasses = allClasses.length;

        for (var x = 0; x < numClasses; x++)
        {
            if (keepInlinedDefaultStyle === true && allClasses[x] === EVUI.Modules.Panes.Constants.CSS_Pane_Style) continue; //don't remove the default style

            var selector = getSelector(entry, allClasses[x]);
            if (selector == null) continue;

            _settings.stylesheetManager.removeRules(EVUI.Modules.Styles.Constants.DefaultStyleSheetName, selector);
        }
    };

    /**Removes all the auto-generated CSS classes from the Pane without removing the rules from the sheet.
    @param {InternalPaneEntry} entry The entry representing the BantmWindo to remove the classes from.
    @param {Boolean} keepInlinedDefaultStyle Whether or not to remove the inlined style extracted from the element.*/
    var removePaneClasses = function (entry, keepInlinedDefaultStyle)
    {
        var allClasses = getAllClassNames();
        var numClasses = allClasses.length;
        var existingClasses = [];

        var eh = new EVUI.Modules.Dom.DomHelper(entry.link.pane.element);
        for (var x = 0; x < numClasses; x++)
        {
            if (keepInlinedDefaultStyle === true && allClasses[x] === EVUI.Modules.Panes.Constants.CSS_Pane_Style) continue; //don't remove the default style

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
            [EVUI.Modules.Panes.Constants.CSS_Pane_Style,
            EVUI.Modules.Panes.Constants.CSS_Position,
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

        return allBaseClasses;
    };

    /**Performs the final step in displaying a Pane by applying the show transition or by setting the display property of the root element of the BantPane to any visible mode.
    @param {InternalPaneEntry} entry The entry representing the Pane being shown.
    @param {EVUI.Modules.Panes.PaneShowArgs} resolvedShowArgs The settings used to display the Pane.
    @param {EVUI.Modules.Panes.PanePosition} position The calculated position of the Pane using the resolvedShowArgs.
    @param {Function} callback A callback function to call once the Pane positioning is complete.*/
    var displayPane = function (entry, resolvedShowArgs, position, adjusting, callback)
    {
        if (typeof callback !== "function") callback = function () { };
        if (position.mode === EVUI.Modules.Panes.PaneShowMode.DocumentFlow) //if the pane is in the document flow, just position it
        {
            insertIntoDocumentFlow(entry, resolvedShowArgs, position);
        }
        else //otherwise put it in the placement div where it will become visible.
        {
            moveToPlacementDiv(entry);
        }

        //set up a dummy show settings object so we don't have to null check below (handling the case where user nulled out showSettings)
        var showSettings = entry.link.pane.showSettings == null ? {} : entry.link.pane.showSettings;

        var selector = null;
        var transition = null;
        if (adjusting === true)
        {
            if (showSettings.reclacSettings != null && showSettings.reclacSettings.recalcTransition != null) transition = showSettings.reclacSettings.recalcTransition
            selector = EVUI.Modules.Panes.Constants.CSS_Transition_Adjust;
        }
        else
        {
            if (resolvedShowArgs.showTransition != null) transition = resolvedShowArgs.showTransition;
            selector = EVUI.Modules.Panes.Constants.CSS_Transition_Show;
        }

        var element = new EVUI.Modules.Dom.DomHelper(entry.link.pane.element);
        hookUpEvents(entry, resolvedShowArgs);

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
            if (entry.link.pane.element.parentNode !== _placementDiv)
            {
                entry.link.pane.element.remove();
                _placementDiv.appendChild(entry.link.pane.element);
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
            if (entry.link.pane.element.parentNode !== _measureDiv)
            {
                entry.link.pane.element.remove();
                _measureDiv.appendChild(entry.link.pane.element);
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
            _loadDiv.appendChild(entry.link.pane.element);
        }
    };

    /**Ensures that the div used for positioning the Pane is present in the DOM with the correct in-line style properties to work correctly.*/
    var ensurePlacehmentDiv = function ()
    {
        if (_placementDiv == null)
        {
            _placementDiv = document.createElement("div");
            document.body.appendChild(_placementDiv);
        }
        else
        {
            if (_placementDiv.parentElement != document.body)
            {
                _placementDiv.remove();
                document.body.appendChild(_placementDiv)
            }            
        }

        _placementDiv.style.height = "0px";
        _placementDiv.style.width = "0px";
        _placementDiv.style.overflow = "visible";
        _placementDiv.style.display = "block";
    };

    /**Ensures that the div used to keep Panes when they are not being measured or displayed is present in the DOM. */
    var ensureLoadDiv = function ()
    {
        if (_loadDiv == null)
        {
            _loadDiv = document.createElement("div");
            document.body.appendChild(_loadDiv);
        }
        else
        {
            if (_loadDiv.parentElement != document.body)
            {
                _loadDiv.remove();
                document.body.appendChild(_loadDiv);
            }            
        }

        _loadDiv.style.display = "none";
    };

    /**Ensures that the div used to measure the Pane so it can be positioned correctly is in the DOM and has the correct in-line styling.*/
    var ensureMeasureDiv = function ()
    {
        if (_measureDiv == null)
        {
            _measureDiv = document.createElement("div");
            document.body.appendChild( _measureDiv);
        }
        else
        {
            if (_measureDiv.parentElement != document.body)
            {
                _measureDiv.remove();
                document.body.appendChild(_measureDiv)
            }            
        }

         _measureDiv.style.height = "0px";
         _measureDiv.style.width = "0px";
         _measureDiv.style.overflow = "hidden"; //this is the magic that makes it all work, hidden overflow is still able to be measured.
         _measureDiv.style.display = "inline-block";
    };

    /**Entry point to the position calculating logic.
     @param {InternalPaneEntry} entry The Pane being positioned.
     @param {EVUI.Modules.Panes.PaneShowArgs} resolvedShowArgs The settings being used to position the Pane.
     @param {String} mode A value from the EVUI.Modules.Pane.PanePositionMode enum indicating which method to use to calculate the position of the Pane.
     @returns {EVUI.Modules.Panes.PanePosition}*/
    var calculatePosition = function (entry, resolvedShowArgs, mode)
    {
        if (entry.link.pane.element == null) throw Error("Cannot calculate position of a Pane without an element.");
        if (entry.link.pane.element.isConnected === false) throw Error("Cannot calculate position of a Pane that is not yet part of the DOM.");

        var position = new EVUI.Modules.Panes.PanePosition(mode);
        var ele = new EVUI.Modules.Dom.DomHelper(entry.link.pane.element);

        //get the position of the pane based on the detected display mode
        if (mode === EVUI.Modules.Panes.PaneShowMode.AbsolutePosition)
        {
            position = getAbsolutePosition(entry, ele, resolvedShowArgs.absolutePosition);
        }
        else if (mode === EVUI.Modules.Panes.PaneShowMode.Anchored)
        {
            position = getAnchoredPosition(entry, ele, resolvedShowArgs.anchors);
        }
        else if (mode === EVUI.Modules.Panes.PaneShowMode.RelativePosition)
        {
            position = getRelativePosition(entry, ele, resolvedShowArgs.relativePosition);
        }
        else if (mode === EVUI.Modules.Panes.PaneShowMode.Fullscreen)
        {
            position = getFullscreenPosition();
        }
        else if (mode === EVUI.Modules.Panes.PaneShowMode.PositionClass)
        {
            position = getAddClassPosition(resolvedShowArgs, ele);
        }
        else if (mode === EVUI.Modules.Panes.PaneShowMode.Centered)
        {
            position = getCenteredPosition(ele);
        }
        else if (mode === EVUI.Modules.Panes.PaneShowMode.DocumentFlow)
        {
            return position;
        }

        //after getting the position, apply the clipping settings to the pane.
        position = applyClipSettings(entry, position, resolvedShowArgs.clipSettings, resolvedShowArgs);
        if (position == null) return null;

        position.classNames.push(EVUI.Modules.Panes.Constants.CSS_Position);
        position.classNames.push(entry.link.paneCSSName);

        position.zIndex = getNextZIndex(entry);
        EVUI.Modules.Panes.Constants.GlobalZIndex = position.zIndex;

        return position;
    };

    /**Gets the next highest z-index so that the newly placed Pane appears on top of all the others.
    @param {InternalPaneEntry} entry
    @returns {Number}*/
    var getNextZIndex = function (entry)
    {
        var highestZIndex = EVUI.Modules.Panes.Constants.GlobalZIndex;
        var entryZIndex = (entry != null) ? entry.link.pane.getCurrentZIndex() : -1;

        var numEntries = _entries.length;
        for (var x = 0; x < numEntries; x++)
        {
            var curEntry = _entries[x];
            var curZIndex = curEntry.link.pane.getCurrentZIndex();

            if (curZIndex > highestZIndex) highestZIndex = curZIndex;
        }

        if (highestZIndex === entryZIndex) return entryZIndex;
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
        var position = new EVUI.Modules.Panes.PanePosition(EVUI.Modules.Panes.PaneShowMode.AbsolutePosition);

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
        var position = new EVUI.Modules.Panes.PanePosition(EVUI.Modules.Panes.PaneShowMode.Anchored);

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
                position.top = Math.max(yBounds.top, leftBounds.top);
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
                position.top = Math.max(yBounds.top, rightBounds.top);
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
                    position.top = Math.max(currentBounds.top, Math.min(rightBounds.top, leftBounds.top));
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
        var relativeBounds = new EVUI.Modules.Panes.PanePosition(EVUI.Modules.Panes.PaneShowMode.RelativePosition);
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
            positionBounds.left = relativeSettings.left;
            positionBounds.top = relativeSettings.top;
            positionBounds.right = relativeSettings.left;
            positionBounds.bottom = relativeSettings.top;
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
        var position = new EVUI.Modules.Panes.PanePosition(EVUI.Modules.Panes.PaneShowMode.Fullscreen);

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

        var position = new EVUI.Modules.Panes.PanePosition(EVUI.Modules.Panes.PaneShowMode.PositionClass);
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

        var position = new EVUI.Modules.Panes.PanePosition(EVUI.Modules.Panes.PaneShowMode.Centered);
        position.left = winCenterWidth - centerWidth;
        position.right = winCenterWidth + centerWidth;
        position.top = winCenterHeight - centerHeight;
        position.bottom = winCenterHeight + centerWidth;

        return position;
    };

    /**Walks through all the options in the show settings and comes up with the mode to use to position the element. Goes in the following order: 
    position classes > absolute position > relative position > anchored position > document flow > full screen > centered.
    @param {EVUI.Modules.Panes.PaneShowArgs} resolvedShowArgs The settings to use to calculate the position.
    @returns {String} */
    var getPositionMode = function (resolvedShowArgs)
    {
        if (resolvedShowArgs == null) return EVUI.Modules.Panes.PaneShowMode.None;

        if (resolvedShowArgs.positionClass != null) //we have a value for position classes
        {
            if (typeof resolvedShowArgs.positionClass === "string" && EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(resolvedShowArgs.positionClass) === false)
            {
                return EVUI.Modules.Panes.PaneShowMode.PositionClass; //its a string that will be applied as a class name
            }
            else if (EVUI.Modules.Core.Utils.isArray(resolvedShowArgs.positionClass) === true)
            {
                if (resolvedShowArgs.positionClass.filter(function (css) { return typeof css === "string" }).length > 0)
                {
                    return EVUI.Modules.Panes.PaneShowMode.PositionClass; //it is an array of class names
                }
            }
        }

        if (resolvedShowArgs.absolutePosition != null) //we have a value for absolute position
        {
            if (resolvedShowArgs.absolutePosition.left !== 0 || resolvedShowArgs.absolutePosition.top !== 0) //at least one of the x or y values must be non-zero for this mode to apply
            {
                return EVUI.Modules.Panes.PaneShowMode.AbsolutePosition;
            }
        }

        if (resolvedShowArgs.relativePosition != null) //we have a value for relative position
        {
            if (resolvedShowArgs.relativePosition.relativeElement != null && resolvedShowArgs.relativePosition.relativeElement.isConnected === true) 
            {
                return EVUI.Modules.Panes.PaneShowMode.RelativePosition; //the relative element must be part of the DOM to be a valid target to orient around (so we can get its position)
            }
            else if (resolvedShowArgs.relativePosition.left !== 0 || resolvedShowArgs.relativePosition.top !== 0)
            {
                return EVUI.Modules.Panes.PaneShowMode.RelativePosition; //if one of the coordinates is non zero value it can be a target for orientation
            }
        }

        if (resolvedShowArgs.anchors != null) //we have a value for anchors
        {
            if ((resolvedShowArgs.anchors.bottom != null && (resolvedShowArgs.anchors.bottom.isConnected === true || resolvedShowArgs.anchors.bottom === window))
                || (resolvedShowArgs.anchors.left != null && (resolvedShowArgs.anchors.left.isConnected === true || resolvedShowArgs.anchors.left === window))
                || (resolvedShowArgs.anchors.right != null && (resolvedShowArgs.anchors.right.isConnected === true || resolvedShowArgs.anchors.right === window))
                || (resolvedShowArgs.anchors.top != null && (resolvedShowArgs.anchors.top.isConnected === true || resolvedShowArgs.anchors.top === window)))
            {
                return EVUI.Modules.Panes.PaneShowMode.Anchored; //at least one anchor must be non-null and connected to the DOM to be a valid target (so we can get its position)
            }
        }

        if (resolvedShowArgs.documentFlow != null) //we have a value for document flow
        {
            if (resolvedShowArgs.documentFlow.relativeElement != null) //the relative element must not be null in order to use document flow mode. It doesn't have to be connected yet.
            {
                return EVUI.Modules.Panes.PaneShowMode.DocumentFlow;
            }
        }

        //full screen mode was set
        if (resolvedShowArgs.fullscreen === true) return EVUI.Modules.Panes.PaneShowMode.Fullscreen;

        //center mode was set
        if (resolvedShowArgs.center === true) return EVUI.Modules.Panes.PaneShowMode.Centered;

        //northing worked, not going to do anything with the position other than stick it in the top-left of the view port.
        return EVUI.Modules.Panes.PaneShowMode.None;
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
    @param {EVUI.Modules.Panes.PaneShowArgs} resolvedShowArgs The resolved arguments for positioning a Pane.
    @param {EVUI.Modules.Panes.PaneClipSettings[]} previousClipSettings All of the previous clip settings objects that have been applied (prevents stack overflows).
    @returns {EVUI.Modules.Panes.PanePosition}*/
    var applyClipSettings = function (entry, position, clipSettings, resolvedShowArgs, previousClipSettings)
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
            return shiftToBounds(entry, position, bounds, clipSettings, resolvedShowArgs, previousClipSettings);
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
                        _settings.stylesheetManager.setRules(EVUI.Modules.Styles.Constants.DefaultStyleSheetName, scrollXSelector, {
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
                    _settings.stylesheetManager.setRules(EVUI.Modules.Styles.Constants.DefaultStyleSheetName, scrollYSelector, {
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
    @param {EVUI.Modules.Panes.PaneShowArgs} resolvedShowArgs The original settings used to display the Pane.
    @param {EVUI.Modules.Panes.PaneClipSettings[]} previousClipSettings The list of previously used clip settings in clipping this element. Used to prevent stack overflows.
    @returns {EVUI.Modules.Panes.PanePosition} */
    var shiftToBounds = function (entry, position, bounds, clipSettings, resolvedShowArgs, previousClipSettings)
    {
        var shiftedX = false;
        var shiftedY = false;
        var delta = 0;
        var relativePositioned = position.mode === EVUI.Modules.Panes.PaneShowMode.RelativePosition;

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
                return flipRelativePosition(entry, positionCopy, bounds, clipSettings, resolvedShowArgs, previousClipSettings);
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
                    return flipRelativePosition(entry, positionCopy, bounds, clipSettings, resolvedShowArgs, previousClipSettings);
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
                return flipRelativePosition(entry, positionCopy, bounds, clipSettings, resolvedShowArgs, previousClipSettings);
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
                    return flipRelativePosition(entry, positionCopy, bounds, clipSettings, resolvedShowArgs, previousClipSettings);
                }
            }
        }

        if (position.mode === EVUI.Modules.Panes.PaneShowMode.Fullscreen && (shiftedX === true || shiftedY === true))
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
    @param {EVUI.Modules.Panes.PaneShowArgs} resolvedShowArgs The original show settings used to display the pane.
    @param {EVUI.Modules.Panes.PaneClipSettings[]} previousClipSettings The list of previously used clip settings in clipping this element. Used to prevent stack overflows.
    @param {Number} flags The FlipFlaps indicating the previous flip operations that have been performed on the pane.
    @returns {EVUI.Modules.Panes.PanePosition}*/
    var flipRelativePosition = function (entry, position, bounds, clipSettings, resolvedShowArgs, previousClipSettings, flags)
    {
        if (flags == null) flags = 0;
        var flippedX = false;
        var flippedY = false;  
        var alignmentAxes = getOrientationAlignment(resolvedShowArgs.relativePosition);
        var flippedAlignX = null;
        var flippedAlignY = null;
        var alignX = alignmentAxes.xOrientation;
        var alignY = alignmentAxes.yOrientation;
        var flippedOutOfBounds = false;

        var eleBounds = null;
        if (resolvedShowArgs.relativePosition.relativeElement != null)
        {
            var ele = new EVUI.Modules.Dom.DomHelper(resolvedShowArgs.relativePosition.relativeElement);
            if (ele.elements.length === 0 || ele.elements[0].isConnected === false) return null;

            eleBounds = ele.offset();
        }
        else
        {
            eleBounds = new EVUI.Modules.Dom.ElementBounds();
            eleBounds.top = resolvedShowArgs.relativePosition.top;
            eleBounds.left = resolvedShowArgs.relativePosition.left;
            eleBounds.right = resolvedShowArgs.relativePosition.top;
            eleBounds.bottom = resolvedShowArgs.relativePosition.left;
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

            resolvedShowArgs.relativePosition.orientation = orientation;

            position = getRelativePosition(entry, new EVUI.Modules.Dom.DomHelper(entry.link.pane.element), resolvedShowArgs.relativePosition, bounds);
            if (position == null) return null;

            return flipRelativePosition(entry, position, bounds, clipSettings, resolvedShowArgs, previousClipSettings, flags);
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
                    resolvedShowArgs.relativePosition.orientation = EVUI.Modules.Panes.RelativePositionOrientation.Bottom + " " + ((leftGap >= rightGap) ? EVUI.Modules.Panes.RelativePositionOrientation.Left : EVUI.Modules.Panes.RelativePositionAlignment.Right);
                    resolvedShowArgs.relativePosition.alignment = (leftGap >= rightGap) ? EVUI.Modules.Panes.RelativePositionAlignment.Rignt : EVUI.Modules.Panes.RelativePositionAlignment.Left;
                }
                else
                {
                    resolvedShowArgs.relativePosition.orientation = EVUI.Modules.Panes.RelativePositionOrientation.Top + " " + ((leftGap >= rightGap) ? EVUI.Modules.Panes.RelativePositionOrientation.Left : EVUI.Modules.Panes.RelativePositionAlignment.Right);
                    resolvedShowArgs.relativePosition.alignment = (leftGap >= rightGap) ? EVUI.Modules.Panes.RelativePositionAlignment.Right : EVUI.Modules.Panes.RelativePositionAlignment.Left;
                }
            }
            else if ((leftGap > topGap && leftGap > bottomGap) || (rightGap > topGap && rightGap > bottomGap)) //if it's shorter than it was to start with, we'll move it to be to the left or right of the relative element (whichever has more space)
            {
                if (leftGap >= rightGap)
                {
                    resolvedShowArgs.relativePosition.orientation = ((topGap >= bottomGap) ? EVUI.Modules.Panes.RelativePositionOrientation.Top : EVUI.Modules.Panes.RelativePositionAlignment.Bottom) + " " + EVUI.Modules.Panes.RelativePositionOrientation.Left;
                    resolvedShowArgs.relativePosition.alignment = (topGap >= bottomGap) ? EVUI.Modules.Panes.RelativePositionAlignment.Bottom : EVUI.Modules.Panes.RelativePositionAlignment.Top;
                }
                else
                {
                    resolvedShowArgs.relativePosition.orientation = ((topGap >= bottomGap) ? EVUI.Modules.Panes.RelativePositionOrientation.Top : EVUI.Modules.Panes.RelativePositionAlignment.Bottom) + " " + EVUI.Modules.Panes.RelativePositionOrientation.Right;
                    resolvedShowArgs.relativePosition.alignment = (topGap >= bottomGap) ? EVUI.Modules.Panes.RelativePositionAlignment.Bottom : EVUI.Modules.Panes.RelativePositionAlignment.Top;
                }
            }
            else
            {
                return applyClipSettings(entry, position, clipSettings.fallbackClipSettings, resolvedShowArgs, previousClipSettings);
            }

            flags |= FlipFlags.ReAligned;

            position = getRelativePosition(entry, new EVUI.Modules.Dom.DomHelper(entry.link.pane.element), resolvedShowArgs.relativePosition, bounds);
            if (position == null) return null;

            position = flipRelativePosition(entry, position, bounds, clipSettings, resolvedShowArgs, previousClipSettings, flags);
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
    @param {EVUI.Modules.Panes.PaneResizeArgs} resizeArgs The arguments about how it will be resized.
    @param {EVUI.Modules.Dom.DomHelper} helper An DomHelper wrapping the Pane being manipulated.
    @param {DragHandles} dragHandles If the pane was resized, these are the details of the trigger for the resizing via a drag operation.
    @param {EVUI.Modules.Dom.ElementBounds} clipBounds The clipping bounds for the move or resize operation.*/
    var resizePane = function (entry, resizeArgs, helper, dragHandles, clipBounds, callback)
    {
        if (typeof callback !== "function") callback = function () { };

        resizeArgs = resolvePaneResizeArgs(entry, resizeArgs);

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
            //position.bottom = resizeArgs.top + resizeArgs.height;
            position.bottom = resizeArgs.bottom;
            position.left = resizeArgs.left;
            //position.right = resizeArgs.left + resizeArgs.width;
            position.right = resizeArgs.right;
            position.top = resizeArgs.top;

            if (isOutOfBounds(position, clipBounds, "left") === true)
            {
                resizeArgs.left = clipBounds.left;
                //resizeArgs.width = position.right - clipBounds.left;
            }

            if (isOutOfBounds(position, clipBounds, "right") === true)
            {
                //resizeArgs.width = clipBounds.right - position.left;
                resizeArgs.right = clipBounds.right;
            }

            if (isOutOfBounds(position, clipBounds, "top") === true)
            {
                resizeArgs.top = clipBounds.top;
                //resizeArgs.height = position.bottom - clipBounds.top;
            }

            if (isOutOfBounds(position, clipBounds, "bottom") === true)
            {
                resizeArgs.bottom = clipBounds.bottom;
                //resizeArgs.height = clipBounds.bottom - position.top;
            }
        }

        var height = resizeArgs.getResizedHeight();
        var width = resizeArgs.getResizedWidth();

        //ensure that we don't shrink beyond the minimum allowable size. If there's one in CSS we use that, if not we use 2.5 times the drag buffer zone so that the drag zones for all sized never overlap.
        //there is an issue here where it can cause a jittering effect on the bottom or right side, we have code below to correct that issue. The problem is the mouse is moving so fast that it gets into
        //a bad state where neither the left nor the width is correct.
        if (minHeight > height || minWidth > width)
        {
            if (entry.link.lastResizeArgs != null)
            {
                if (minHeight > height)
                {
                    //resizeArgs.height = minHeight;                    
                    resizeArgs.top = (dragHandles != null) ? dragHandles.originalBounds.top : entry.link.lastResizeArgs.top;
                    resizeArgs.bottom = resizeArgs.top + minHeight;
                    shrankY = true;
                }

                if (minWidth > width)
                {
                    //resizeArgs.width = minWidth;
                    resizeArgs.left = (dragHandles != null) ? dragHandles.originalBounds.left : entry.link.lastResizeArgs.left;
                    resizeArgs.right = resizeArgs.left + minWidth;
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
                var right = resizeArgs.right; //resizeArgs.left + resizeArgs.width;
                var oldRight = entry.link.lastResizeArgs.right; //entry.link.lastResizeArgs.left + entry.link.lastResizeArgs.width;

                if (right != oldRight) //see if the right shifted either direction to the right or left. If so, restore it to the original position. The left is in flux, but the right must stay the same.
                {
                    resizeArgs.left = dragHandles.originalBounds.left;
                    resizeArgs.right = dragHandles.originalBounds.right;
                    //resizeArgs.width = dragHandles.originalBounds.right - dragHandles.originalBounds.left;

                    if (shrankX === true) //if it shrank back to the minimum size, don't reset the width
                    {
                        //resizeArgs.width = minWidth;                        
                        resizeArgs.left = dragHandles.originalBounds.right - minWidth;
                        resizeArgs.right = resizeArgs.left + minWidth;
                    }
                }
            }

            if (dragHandles.growY === "top") 
            {
                var bottom = resizeArgs.bottom; //resizeArgs.top + resizeArgs.height;
                var oldBottom = entry.link.lastResizeArgs.bottom; //entry.link.lastResizeArgs.top + entry.link.lastResizeArgs.height;

                if (bottom != oldBottom) //see if the bottom shifted up or down. If so, restore it to its original position. The top is in flux, but the bottom should never move.
                {
                    resizeArgs.top = dragHandles.originalBounds.top;
                    resizeArgs.bottom = dragHandles.originalBounds.bottom;
                    //resizeArgs.height = dragHandles.originalBounds.top - dragHandles.originalBounds.bottom;

                    if (shrankY === true)  //if it shrank back to the minimum size, don't reset the height
                    {
                        //resizeArgs.height = minHeight;                        
                        resizeArgs.top = dragHandles.originalBounds.bottom - minHeight;
                        resizeArgs.bottom = resizeArgs.top + minHeight;
                    }
                }
            }
        }

        var rules = {};

        rules.position = "absolute";
        rules.height = resizeArgs.getResizedHeight() + "px";
        rules.width = resizeArgs.getResizedWidth() + "px";
        rules.top = resizeArgs.top + "px";
        rules.left = resizeArgs.left + "px";

        _settings.stylesheetManager.removeRules(EVUI.Modules.Styles.Constants.DefaultStyleSheetName, resizedSelector);
        _settings.stylesheetManager.setRules(EVUI.Modules.Styles.Constants.DefaultStyleSheetName, resizedSelector, rules);
        helper.addClass(EVUI.Modules.Panes.Constants.CSS_Resized);

        entry.link.lastResizeArgs = resolvePaneResizeArgs(entry, resizeArgs);
        applyTransition(entry, resizeArgs.transition, EVUI.Modules.Panes.Constants.CSS_Transition_Resize, helper, function ()
        {
            callback();
        });
    };

    /**Moves the pane by adding new CSS classes to it that override the default positioning CSS classes.
    @param {InternalPaneEntry} entry The Pane being resized or moved.
    @param {EVUI.Modules.Panes.PaneMoveArgs} moveArgs The arguments about how it will be resized.
    @param {EVUI.Modules.Dom.DomHelper} helper An DomHelper wrapping the Pane being manipulated.
    @param {DragHandles} dragHandles If the pane was resized, these are the details of the trigger for the resizing via a drag operation.
    @param {EVUI.Modules.Dom.ElementBounds} clipBounds The clipping bounds for the move or resize operation.*/
    var movePane = function (entry, moveArgs, helper, dragHandles, clipBounds, callback)
    {
        if (typeof callback !== "function") callback = function () { };
        moveArgs = resolvePaneMoveArgs(entry, moveArgs);    

        if (clipBounds != null) //if we're clipping, make sure we shift it back into bounds before actually applying the move CSS
        {
            var clippedBounds = shiftMovedPaneToBounds(entry, moveArgs, clipBounds);
            if (clippedBounds != null)
            {
                if (clippedBounds.left === moveArgs.left && clippedBounds.top === moveArgs.top) return;

                moveArgs.left = clippedBounds.left;
                moveArgs.top = clippedBounds.top;
            }
        }

        var movedSelector = getSelector(entry, EVUI.Modules.Panes.Constants.CSS_Moved);

        var rules =
        {
            position: "absolute",
            top: moveArgs.top + "px",
            left: moveArgs.left + "px"
        }

        _settings.stylesheetManager.removeRules(EVUI.Modules.Styles.Constants.DefaultStyleSheetName, movedSelector);
        _settings.stylesheetManager.setRules(EVUI.Modules.Styles.Constants.DefaultStyleSheetName, movedSelector, rules);
        helper.addClass(EVUI.Modules.Panes.Constants.CSS_Moved);      

        applyTransition(entry, moveArgs.transition, EVUI.Modules.Panes.Constants.CSS_Transition_Move, helper, function ()
        {
            callback();
        });
    };

    var shiftMovedPaneToBounds = function (entry, resizeArgs, clipBounds)
    {
        var currentPosition = new EVUI.Modules.Panes.PanePosition(EVUI.Modules.Panes.PaneShowMode.AbsolutePosition);
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
    @param {InternalPaneEntry} entry The Pane having its events hooked up.
    @param {EVUI.Modules.Panes.PaneShowArgs} resolvedShowArgs The final show args for the operation.*/
    var hookUpEvents = function (entry, resolvedShowArgs)
    {
        if (entry.link.pane.element == null) return;

        clearEvents(entry);

        hookUpExplicitCloseZones(entry, resolvedShowArgs);
        hookUpAutoCloseMode(entry, resolvedShowArgs);
        hookUpKeydownClose(entry, resolvedShowArgs);
        hookUpSetHighestZOrder(entry, resolvedShowArgs);

        var resolvedResizeMoveSettings = resolveResizeMoveSettings(entry.link.pane.resizeMoveSettings);
        hookUpDrag(entry, resolvedResizeMoveSettings);
        hookUpResize(entry, resolvedResizeMoveSettings);
    };

    /**Hooks up any child elements of the Pane with the appropriate attribute on them to be auto-close zones for the Pane.
    @param {InternalPaneEntry} entry The Pane having its close zones attached.*/
    var hookUpExplicitCloseZones = function (entry, resolvedShowArgs)
    {
        if (entry.link.pane.element == null) return;

        var attributeName = getAttributeName(EVUI.Modules.Panes.Constants.Attribute_Close);

        var closeZones = new EVUI.Modules.Dom.DomHelper("[" + attributeName + "]", entry.link.pane.element);
        var numZones = closeZones.elements.length;
        for (var x = 0; x < numZones; x++)
        {
            var handler = new EVUI.Modules.Panes.PaneEventBinding(attributeName, "click", closeZones.elements[x], function (event)
            {
                if (entry.link.pane.autoHideSettings == null || (typeof entry.link.pane.autoHideSettings.autoHideFilter === "function" && entry.link.pane.autoHideSettings.autoHideFilter(context) === false)) return;

                var context = new EVUI.Modules.Panes.PaneAutoTriggerContext();
                context.triggerType = EVUI.Modules.Panes.PaneAutoTriggerType.Click;
                context.event = event;
                context.pane = entry.link.pane;

                _self.hidePane(entry.paneId, {
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
    var hookUpAutoCloseMode = function (entry, resolvedShowArgs)
    {
        if (entry.link.pane.element == null || entry.link.pane.autoHideSettings == null) return;
        var autoHideSettings = resolveAutoHideSettings(entry.link.pane.autoHideSettings);

        if (autoHideSettings.hideMode === EVUI.Modules.Panes.PaneHideMode.Click) //a click anywhere will close the Pane
        {
            var handler = new EVUI.Modules.Panes.PaneEventBinding(EVUI.Modules.Panes.PaneHideMode.Click, "click contextmenu", document, function (event)
            {
                var context = new EVUI.Modules.Panes.PaneAutoTriggerContext();
                context.triggerType = EVUI.Modules.Panes.PaneAutoTriggerType.Click;
                context.event = event;
                context.pane = entry.link.pane;

                handler.detach();
                shouldAutoClose(context, entry, autoHideSettings, function (shouldClose)
                {
                    if (shouldClose === true)
                    {
                        _self.hidePane(entry.paneId, {
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
        else if (autoHideSettings.hideMode === EVUI.Modules.Panes.PaneHideMode.ExteriorClick) //only a click outside the Pane's root element will close the Pane
        {
            var handler = new EVUI.Modules.Panes.PaneEventBinding(EVUI.Modules.Panes.PaneHideMode.ExteriorClick, "click contextmenu", document, function (event)
            {
                var context = new EVUI.Modules.Panes.PaneAutoTriggerContext();
                context.triggerType = EVUI.Modules.Panes.PaneAutoTriggerType.ExteriorClick;
                context.event = event;
                context.pane = entry.link.pane;

                //make sure the click comes from outside the Pane
                if ((typeof entry.link.pane.autoHideSettings.autoHideFilter === "function" && entry.link.pane.autoHideSettings.autoHideFilter(context) === true) || //if the filter says it shouldn't be closed, don't hide it
                    EVUI.Modules.Core.Utils.containsElement(event.target, entry.link.pane.element) === true || //or if the element target is contained by the element, don't hide it
                    event.target === entry.link.pane.element) return; //or if the element target is the Pane itself, don't hide it

                handler.detach();
                shouldAutoClose(context, entry, autoHideSettings, function (shouldClose)
                {
                    if (shouldClose === true)
                    {
                        _self.hidePane(entry.paneId, {
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
        else if (autoHideSettings.hideMode === EVUI.Modules.Panes.PaneHideMode.GlobalClick) //only a click outside the Pane's root element will close the Pane
        {
            var handler = new EVUI.Modules.Panes.PaneEventBinding(EVUI.Modules.Panes.PaneHideMode.GlobalClick, "click contextmenu", document, function (event)
            {
                var context = new EVUI.Modules.Panes.PaneAutoTriggerContext();
                context.triggerType = EVUI.Modules.Panes.PaneAutoTriggerType.GlobalClick;
                context.event = event;
                context.pane = entry.link.pane;

                handler.detach();
                shouldAutoClose(context, entry, autoHideSettings, function (shouldClose)
                {
                    if (shouldClose === true)
                    {
                        _self.hidePane(entry.paneId, {
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
    }

    /**Hooks up an event listener on the document level listening for a keystroke that will close the Pane. 
    @param {InternalPaneEntry} entry The Pane that will be closed.*/
    var hookUpKeydownClose = function (entry)
    {
        if (entry.link.pane.element == null || entry.link.pane.autoHideSettings == null) return;
        var autoHideSettings = resolveAutoHideSettings(entry.link.pane.autoHideSettings);

        if (autoHideSettings.autoHideKeys == null || EVUI.Modules.Core.Utils.isArray(autoHideSettings.autoHideKeys) === false) return;

        var handler = new EVUI.Modules.Panes.PaneEventBinding("autoHideKey", "keydown", document, function (event)
        {
            if (autoHideSettings.autoHideKeys == null || EVUI.Modules.Core.Utils.isArray(autoHideSettings.autoHideKeys) === false) return;
            if (autoHideSettings.autoHideKeys.indexOf(event.key) === -1) return;

            var context = new EVUI.Modules.Panes.PaneAutoTriggerContext();
            context.triggerType = EVUI.Modules.Panes.PaneAutoTriggerType.KeyDown;
            context.event = event;
            context.eventBinding = handler;
            context.pane = entry.link.pane;

            handler.detach();
            shouldAutoClose(context, entry, autoHideSettings, function (shouldClose)
            {
                if (shouldClose === true)
                {
                    _self.hidePane(entry.paneId, {
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
    var shouldAutoClose = function (context, entry, resolvedAutoHideSettings, callback)
    {
        if (resolvedAutoHideSettings.allowChaining === true)
        {
            if (shouldAutoHideChainedPane(context) === false)
            {
                return callback(false);
            }
        }

        if (typeof resolvedAutoHideSettings.autoHideFilter !== "function") return callback(true);

        var value = resolvedAutoHideSettings.autoHideFilter(context);
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
    @param {InternalPaneEntry} entry The entry representing the Pane that is having its drag handlers attached.
    @param {EVUI.Modules.Panes.PaneResizeMoveSettings} resolveResizeMoveSettings The settings for resizing or moving the pane.*/
    var hookUpDrag = function (entry, resolveResizeMoveSettings)
    {
        if (entry.link.pane.element == null || (resolveResizeMoveSettings.canDragMove !== true)) return;
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
                _settings.stylesheetManager.ensureSheet(EVUI.Modules.Styles.Constants.DefaultStyleSheetName, { lock: true });
                var startPos = entry.link.pane.getCurrentPosition();
                if (getDragHandles(entry, startPos, downEvent) != null) return;
                entry.link.lastResizeArgs = null;

                var startX = downEvent.clientX;
                var startY = downEvent.clientY;

                var bounds = (entry.link.lastResolvedShowArgs.clipSettings != null && entry.link.lastResolvedShowArgs.clipSettings.mode === EVUI.Modules.Panes.PaneClipMode.Shift) ? getClipBounds(entry.link.lastResolvedShowArgs.clipSettings) : null;

                downEvent.preventDefault();
                downEvent.stopPropagation();

                var dragHandler = function (dragEvent)
                {
                    dragEvent.preventDefault();
                    dragEvent.stopPropagation();

                    var xDelta = dragEvent.clientX - startX;
                    var yDelta = dragEvent.clientY - startY;

                    var moveArgs = new EVUI.Modules.Panes.PaneMoveArgs();
                    moveArgs.top = startPos.top + yDelta;
                    moveArgs.left = startPos.left + xDelta;
                    moveArgs.transition = (entry.link.pane.resizeMoveSettings != null) ? entry.link.pane.resizeMoveSettings.moveTransition : null;

                    _self.movePane(entry.link.pane, moveArgs);
                    //movePane(entry, resizeArgs, paneRoot, null, bounds);
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

    /**Adds additional event handlers to the Dialog.
    @param {InternalPaneEntry} paneEntry The pane to add the event to.*/
    var hookUpSetHighestZOrder = function (paneEntry, resolvedShowSettings)
    {
        var handler = new EVUI.Modules.Panes.PaneEventBinding(null, "mousedown", paneEntry.link.pane.element, function (eventArgs)
        {
            if (resolvedShowSettings != null && resolvedShowSettings.alwaysOnTop !== true) return;

            var curZIndex = paneEntry.link.pane.getCurrentZIndex();
            if (curZIndex >= EVUI.Modules.Panes.Constants.GlobalZIndex) return;

            EVUI.Modules.Panes.Constants.GlobalZIndex++;

            curZIndex = EVUI.Modules.Panes.Constants.GlobalZIndex;
            var selector = "." + paneEntry.link.paneCSSName + "." + EVUI.Modules.Panes.Constants.CSS_Position;

            EVUI.Modules.Styles.Manager.ensureSheet(EVUI.Modules.Styles.Constants.DefaultStyleSheetName, { lock: true });
            EVUI.Modules.Styles.Manager.setRules(EVUI.Modules.Styles.Constants.DefaultStyleSheetName, selector, { zIndex: curZIndex });
        });

        handler.attach();
        paneEntry.link.eventBindings.push(handler);
    };

    /**Hooks up the resize event handler to the root Pane element.
    @param {InternalPaneEntry} entry The Pane having its grow handler hooked up. */
    var hookUpResize = function (entry)
    {
        if (entry.link.pane.element == null) return;
        var paneRoot = new EVUI.Modules.Dom.DomHelper(entry.link.pane.element);

        var handler = new EVUI.Modules.Panes.PaneEventBinding("dragResize", "mousedown", entry.link.pane.element, function (downEvent)
        {
            _settings.stylesheetManager.ensureSheet(EVUI.Modules.Styles.Constants.DefaultStyleSheetName, { locked: true });
            startPos = entry.link.pane.getCurrentPosition();
            var dragHandles = getDragHandles(entry, startPos, downEvent);
            if (dragHandles == null) return; //see if we were in the grow zone with the mouse event. If not, do nothing.

            var startX = downEvent.clientX;
            var startY = downEvent.clientY;
            entry.link.lastResizeArgs = null;           

            var bounds = (entry.link.lastResolvedShowArgs.clipSettings != null && entry.link.lastResolvedShowArgs.clipSettings.mode === EVUI.Modules.Panes.PaneClipMode.Shift) ? getClipBounds(entry.link.lastResolvedShowArgs.clipSettings) : null;

            downEvent.preventDefault();
            downEvent.stopPropagation();

            var dragHandler = function (dragEvent) //handler for handling mouse move events after the drag event has begun.
            {
                dragEvent.preventDefault();
                dragEvent.stopPropagation();

                var xDelta = dragEvent.clientX - startX;
                var yDelta = dragEvent.clientY - startY;

                var resizeArgs = new EVUI.Modules.Panes.PaneResizeArgs();
                //resizeArgs.height = (startPos.bottom - startPos.top);
                //resizeArgs.width = (startPos.right - startPos.left);
                resizeArgs.right = startPos.right;
                resizeArgs.bottom = startPos.bottom;
                resizeArgs.top = startPos.top;
                resizeArgs.left = startPos.left;
                resizeArgs.transition = (entry.link.pane.resizeMoveSettings != null) ? entry.link.pane.resizeMoveSettings.resizeTransition : null;

                if (dragHandles.growX === "right")
                {
                    //resizeArgs.width += xDelta;
                    resizeArgs.right += xDelta;
                }
                else if (dragHandles.growX === "left")
                {
                    //resizeArgs.width -= xDelta;
                    resizeArgs.left += xDelta;
                }

                if (dragHandles.growY === "bottom")
                {
                    //resizeArgs.height += yDelta;
                    resizeArgs.bottom += yDelta;
                }
                else if (dragHandles.growY === "top")
                {
                    //resizeArgs.height -= yDelta; 
                    resizeArgs.top += yDelta;
                }

                _self.resizePane(entry.link.pane, resizeArgs);
                //resizePane(entry, resizeArgs, paneRoot, dragHandles, bounds);
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
                _settings.stylesheetManager.setRules(EVUI.Modules.Styles.Constants.DefaultStyleSheetName, transition.keyframes);
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
                _settings.stylesheetManager.setRules(EVUI.Modules.Styles.Constants.DefaultStyleSheetName, getSelector(entry, selector), transition.css);
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
    @param {EVUI.Modules.Panes.PaneLoadArgs} resolvedArgs The settings dictating how to load the element.
    @param {EVUI.Modules.Panes.Constants.Fn_LoadCallback} callback The callback to fire once the element has been loaded.*/
    var loadRootElement = function (entry, resolvedArgs, callback)
    {
        if (typeof callback !== "function") callback = function (success) { };
        if (entry == null || resolvedArgs == null) return callback(false);

        var mode = getLoadMode(resolvedArgs);
        if (mode === EVUI.Modules.Panes.PaneLoadMode.None) throw Error("No load mode detected, cannot load root element of Pane.");

        if (mode === EVUI.Modules.Panes.PaneLoadMode.ExistingElement)
        {
            entry.link.pane.element = resolveElement(resolvedArgs.element, true);
            return callback(true);
        }
        else if (mode === EVUI.Modules.Panes.PaneLoadMode.CSSSelector)
        {
            var ele = new EVUI.Modules.Dom.DomHelper(resolvedArgs.selector, resolveElement(resolvedArgs.contextElement));
            if (ele.elements.length === 0) return callback(false);

            entry.link.pane.element = ele.elements[0];
            return callback(true);
        }
        else if (mode === EVUI.Modules.Panes.PaneLoadMode.HTTP)
        {
            return getElementViaHttp(entry, resolvedArgs, callback)
        }
        else if (mode === EVUI.Modules.Panes.PaneLoadMode.Placeholder)
        {
            return getElementViaPlaceholder(entry, resolvedArgs, callback);
        }
    };

    /**Determines the mode by which the Pane will be loaded.
    @param {EVUI.Modules.Panes.PaneLoadSettings} loadSettings The settings dictating how to load the element.
    @returns {String}*/
    var getLoadMode = function (loadSettings)
    {
        if (EVUI.Modules.Core.Utils.isObject(loadSettings) === false) return EVUI.Modules.Panes.PaneLoadMode.None;

        if (loadSettings.element != null) return EVUI.Modules.Panes.PaneLoadMode.ExistingElement;

        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(loadSettings.selector) === false) return EVUI.Modules.Panes.PaneLoadMode.CSSSelector;

        if (loadSettings.httpLoadArgs != null) return EVUI.Modules.Panes.PaneLoadMode.HTTP;

        if (loadSettings.placeholderLoadArgs != null) return EVUI.Modules.Panes.PaneLoadMode.Placeholder;

        return EVUI.Modules.Panes.PaneLoadMode.None;
    };

    /**Loads the element by making a single HTTP request.
    @param {InternalPaneEntry} entry The entry representing the pane being loaded.
    @param {EVUI.Modules.Panes.PaneLoadArgs} resolvedLoadArgs The settings dictating how to load the element.
    @param {EVUI.Modules.Panes.Constants.Fn_LoadCallback} callback The callback to fire once the element has been loaded.*/
    var getElementViaHttp = function (entry, resolvedLoadArgs, callback)
    {
        var htmlRequestArgs = new EVUI.Modules.HtmlLoader.HtmlRequestArgs();
        htmlRequestArgs.httpArgs = resolvedLoadArgs.httpLoadArgs;

        _settings.htmlLoader.loadHtml(htmlRequestArgs, function (html)
        {
            if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(html) === true)
            {
                return callback(false);
            }

            var contents = new EVUI.Modules.Dom.DomHelper(html);
            if (contents.elements.length === 0) //no element
            {
                return callback(false);
            }
            else if (contents.elements.length > 1) //too many elements, must be exactly one
            {
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
    @param {EVUI.Modules.Panes.PaneLoadArgs} resolvedLoadArgs The settings dictating how to load the element.
    @param {EVUI.Modules.Panes.Constants.Fn_LoadCallback} callback The callback to fire once the element has been loaded.*/
    var getElementViaPlaceholder = function (entry, resolvedLoadArgs, callback)
    {
        _settings.htmlLoader.loadPlaceholder(resolvedLoadArgs.placeholderLoadArgs, function (placeholderLoadResult)
        {
            if (placeholderLoadResult.loadedContent == null || placeholderLoadResult.loadedContent.length === 0) //no elements
            {
                return callback(false);
            }
            else if (placeholderLoadResult.loadedContent.length > 1) //too many elements
            {
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

        var loadMode = getLoadMode(entry.link.lastResolvedLoadArgs);
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
            var placeholderElement = new EVUI.Modules.Dom.DomHelper("[" + EVUI.Modules.HtmlLoader.Constants.Attr_PlaceholderID + "=" + entry.link.lastResolvedLoadArgs.placeholderLoadArgs.placeholderID + "]");
            placeholderElement.attr(EVUI.Modules.HtmlLoader.Constants.Attr_ContentLoadState, EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadState.OnDemand);
            placeholderElement.empty();
            entry.link.pane.element = null;
        }

        return true;
    };

    /******************************************************************************HIDING**************************************************************************************************/

    /**Hides the root element of a Pane so that it is no longer visible.
    @param {InternalPaneEntry} entry The entry representing the Pane to be hidden.
    @param {EVUI.Modules.Panes.PaneShowArgs} resolvedShowArgs The ShowSettings that were last used to show the Pane.
    @param {EVUI.Modules.Panes.PaneTransition} hideTransition The hide transition to apply to the Pane as it disappears.
    @param {Function} callback A callback function that is called once the hide operation is complete.*/
    var hideRootElement = function (entry, resolvedShowArgs, hideTransition, callback)
    {
        var ele = new EVUI.Modules.Dom.DomHelper(entry.link.pane.element);
        var selector = null;

        applyTransition(entry, hideTransition, EVUI.Modules.Panes.Constants.CSS_Transition_Hide, ele, function ()
        {
            clearEvents(entry);
            removePaneClasses(entry);
            removePaneCSS(entry);
            ele.removeClass(entry.link.transitionSelector);

            var mode = getPositionMode(resolvedShowArgs);
            if (mode === EVUI.Modules.Panes.PaneShowMode.DocumentFlow)
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
            return paneEntry.link.pane != entry.link.pane &&
                paneEntry.link.pane.showSettings != null &&
                paneEntry.link.pane.showSettings.backdropSettings != null &&
                paneEntry.link.pane.showSettings.backdropSettings.showBackdrop === true
        }, true); 

        if (panesWithBackdrop != null && panesWithBackdrop.length > 0)
        {
            var panesBeingShown = panesWithBackdrop.filter(function (paneEntry) //if any of the panes with a backdrop is in the process of being shown, 
            {
                return (paneEntry.link.currentPaneAction === EVUI.Modules.Panes.PaneAction.Show || paneEntry.link.currentPaneAction === EVUI.Modules.Panes.PaneAction.Load)
            }, true);
            
            var panesStillVisible = panesWithBackdrop.filter(function (paneEntry)
            {
                return EVUI.Modules.Core.Utils.hasFlag(paneEntry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Visible);
            }, true);

            anyBeingShown = panesBeingShown != null && panesBeingShown.length > 0;
            anyStillVisible = panesStillVisible != null && panesStillVisible.length > 0;
        }

        if (anyBeingShown === false && anyStillVisible === false)
        {
             _settings.backdropManager.hideBackdrop(entry.link.paneCSSName, entry.link.lastResolvedShowArgs.backdropSettings, function (success)
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
    var normalizeSettings = function (paneManagerSettings)
    {
        if (paneManagerSettings == null || typeof paneManagerSettings !== "object")
        {
            _settings = new PaneSettings();
        }
        else
        {
            _settings = EVUI.Modules.Core.Utils.shallowExtend(paneManagerSettings, new PaneSettings());
        }

        _settings.backdropManager = new BackdropManager();

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

        //if (_settings.manager == null) _settings.manager = _self;
    };

    /**Attaches all global references to the PaneManagerSettings object so that they can be shared by instances 
    @param {EVUI.Modules.Panes.PaneManagerSettings} paneSettings The settings to attach all the global variables to. */
    var attachGlobals = function (paneSettings)
    {
        ensureLoadDiv();
        ensureMeasureDiv();
        ensurePlacehmentDiv();

        paneSettings.backdropManager = _settings.backdropManager;
        //paneSettings.loadDiv = _settings.loadDiv;
        //paneSettings.measureDiv = _settings.measureDiv;
        //paneSettings.placementDiv = _settings.placementDiv;     
    };

    normalizeSettings(paneManagerServices); //normalize the settings
    _settings.stylesheetManager.ensureSheet(EVUI.Modules.Styles.Constants.DefaultStyleSheetName, { lock: true }); //add a locked sheet to the style sheet manager
};

/**Represents a configurable UI element that can be loaded, placed, stretched, and moved arbitrarily.
 
 Note: This object can not be instantiated normally, it is injected with an internal object made by the PaneManager. Without this dependency, the Pane object will not function.
@class*/
EVUI.Modules.Panes.Pane = function (entry)
{
    //make sure we have a valid InternalPaneEntry object passed in - passing in anything else will cause the Pane object to not work.
    if (entry == null || entry.constructor[Symbol.for("evui-panes")] !== EVUI.Modules.Panes[Symbol.for("evui-panes")]) throw Error("Invalid constructor invocation.");

    var _entry = entry;
    var _element = null;
    var _self = this;

    /**String. The unique ID of this Pane. ID's are case-insensitive.
    @type {String}*/
    this.id = null;
    Object.defineProperty(this, "id",
    {
        get: function () { return _entry.paneId; },
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
            if (EVUI.Modules.Core.Utils.hasFlag(_entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Loaded)) throw Error("Failed to set element for pane \"" + _entry.paneId + "\": Pane has been loaded. Unload it to reset its element.");

            _element = value;
        },
        configurable: false,
        enumerable: true
    });

    /**String. A value from PaneTemplateType indicating what the initial default behavior of the Pane should be when it is first created.
    @type {String}*/
    this.template = EVUI.Modules.Panes.PaneTemplateType.None;
    Object.defineProperty(this, "template", {
        get: function ()
        {
            return _entry.link.template;
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

    /**Object. Settings for controlling how the Pane can be resized in response to user action.
    @type {EVUI.Modules.Panes.PaneResizeMoveSettings}*/
    this.resizeMoveSettings = new EVUI.Modules.Panes.PaneResizeMoveSettings();

    /**Object. Settings for controlling how the Pane can be automatically hidden.
    @type {EVUI.Modules.Panes.PaneAutoHideSettings}*/
    this.autoHideSettings = new EVUI.Modules.Panes.PaneAutoHideSettings();

    /**Boolean. Whether or not to unload the Pane from the DOM when it is hidden (only applies to elements that were loaded via HTTP). False by default.
    @type {Boolean}*/
    this.unloadOnHide = false;

    /**Boolean. Whether or not the internal state of the Pane thinks it is visible or not. This will be true after the show process has completed and false after an unload or hide operation has been completed.
    @type {Boolean}*/
    this.isVisible = false;
    Object.defineProperty(this, "isVisible", {
        get: function () { return EVUI.Modules.Core.Utils.hasFlag(_entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Visible) },
        configurable: false,
        enumerable: true
    });

    /**Boolean. Whether or not the internal state of the Pane thinks it is loaded or not. This will be true after the load process has completed, even if the element was set directly before the first load operation.
    @type {Boolean}*/
    this.isLoaded = false;
    Object.defineProperty(this, "isLoaded", {
        get: function () { return EVUI.Modules.Core.Utils.hasFlag(_entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Loaded) },
        configurable: false,
        enumerable: true
    });

    /**Boolean. Whether or not the internal state of the Pane thinks it has been initialized or not. This will be true after the onInitialized events fire. */
    this.isInitialized = false;
    Object.defineProperty(this, "isInitialized", {
        get: function () { return EVUI.Modules.Core.Utils.hasFlag(_entry.link.paneStateFlags, EVUI.Modules.Panes.PaneStateFlags.Initialized) },
        configurable: false,
        enumerable: true
    });

    /**Event that fires before the load operation begins for the Pane and is not yet in the DOM and cannot be manipulated in this stage.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation.*/
    this.onLoad = function (paneEventArgs)
    {

    };

    /**Event that fires after the load operation has completed for the Pane and is now in the DOM and can be manipulated in this stage. From this point on the Pane's element property cannot be reset.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation.*/
    this.onLoaded = function (paneEventArgs)
    {

    };

    /**Event that fires the first time the Pane is shown after being loaded into the DOM, but is not yet visible. After it has fired once, it will not fire again unless the PaneShowArgs.reInitialize property is set to true.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation.*/
    this.onInitialize = function (paneEventArgs)
    {

    };

    /**Event that fires at the beginning of the show process and before the calculations for the Pane's location are made. The Pane is still hidden, but is present in the DOM and can be manipulated. In order for the positioning calculations in the next step to be accurate, all HTML manipulation should occur in this event.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation.*/
    this.onShow = function (paneEventArgs)
    {

    };

    /**Event that fires after the position of the Pane has been calculated and is available to be manipulated through the calculatedPosition property of the PaneEventArgs.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation.*/
    this.onPosition = function (paneEventArgs)
    {

    };

    /**Event that fires once the Pane has been positioned, shown, and had its optional show transition applied and completed. Marks the end of the show process.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation.*/
    this.onShown = function (paneEventArgs)
    {

    };

    /**Event that fires before the Pane has been moved from its current location and hidden. Gives the opportunity to change the hideTransition property of the PaneHideArgs and optionally trigger an unload once the Pane has been hidden.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation.*/
    this.onHide = function (paneEventArgs)
    {

    };

    /**Event that fires after the Pane has been moved from its current location and is now hidden and the hide transition has completed.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation.*/
    this.onHidden = function (paneEventArgs)
    {

    };

    /**Event that fires before the Pane has been (potentially) removed from the DOM and had its element property reset to null.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation.*/
    this.onUnload = function (paneEventArgs)
    {
    };

    /**Event that fires after the Pane has been (potentially) removed from the DOM and had its element property reset to null. From this point on the Pane's element property is now settable to a new Element.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation.*/
    this.onUnloaded = function (paneEventArgs)
    {

    };

    /**Event that fires before any Pane is moved in response to a DOM event or user invocation.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation.*/
    this.onMove = function (paneEventArgs)
    {

    };

    /**Event that fires after any Pane has been moved in response to a DOM event or user invocation.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation.*/
    this.onMoved = function (paneEventArgs)
    {

    };

    /**Event that fires before any Pane is resized in response to a DOM event or user invocation.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation.*/
    this.onResize = function (paneEventArgs)
    {

    };

    /**Event that fires after any Pane has been resized in response to a DOM event or user invocation.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The event arguments for the Pane operation.*/
    this.onResized = function (paneEventArgs)
    {

    };

    /**Shows a Pane asynchronously. Provides a callback that is called once the Pane operation has completed successfully or otherwise.
    @param {EVUI.Modules.Panes.PaneShowArgs|EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} showArgs Optional. A PaneShowArgs object graph or the callback. If omitted or passed a function, the Pane's existing show/load settings are used instead.
    @param {EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} callback Optional. A callback that is called once the operation completes.*/
    this.show = function (showArgs, callback)
    {
        if (_entry.link.removed === true) throw Error("Pane was removed from its PaneManager and cannot perform operations.");
        return _entry.link.manager.showPane(_entry.paneId, showArgs, callback);
    };

    /**Awaitable. Shows a Pane asynchronously.
    @param {EVUI.Modules.Panes.PaneShowArgs|EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} showArgs Optional. A PaneShowArgs object graph. If omitted, the Pane's existing show/load settings are used instead.
    @returns {Promise<Boolean>}*/
    this.showAsync = function (showArgs)
    {
        if (_entry.link.removed === true) throw Error("Pane was removed from its PaneManager and cannot perform operations.");
        return _entry.link.manager.showPaneAsync(_entry.paneId, showArgs);
    };

    /**Hides a Pane asynchronously. Provides a callback that is called once the Pane operation has completed successfully or otherwise.
    @param {EVUI.Modules.Panes.PaneHideArgs|EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} hideArgs Optional. A PaneHideArgs object graph or a callback function. If omitted or passed a function, the Pane's existing hide/unload settings are used instead.
    @param {EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} callback Optional. A callback that is called once the operation completes.*/
    this.hide = function (hideArgs, callback)
    {
        if (_entry.link.removed === true) throw Error("Pane was removed from its PaneManager and cannot perform operations.");
        return _entry.link.manager.hidePane(_entry.paneId, hideArgs, callback);
    };

    /**Awaitable. Hides a Pane asynchronously. 
    @param {EVUI.Modules.Panes.PaneHideArgs|EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} hideArgs Optional. A PaneHideArgs object graph. If omitted, the Pane's existing hide/unload settings are used instead.
    @returns {Promise<Boolean>}*/
    this.hideAsync = function (hideArgs)
    {
        if (_entry.link.removed === true) throw Error("Pane was removed from its PaneManager and cannot perform operations.");
        return _entry.link.manager.hidePaneAsync(_entry.paneId, hideArgs);
    };

    /**Asynchronously loads a Pane. Provides a callback that is called after the operation has completed successfully or otherwise.
    @param {EVUI.Modules.Panes.PaneLoadArgs|EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} loadArgs Optional. A PaneLoadArgs object graph or a callback. If omitted or passed a function, the Pane's existing load settings are used instead.
    @param {EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} callback Optional. A callback to call once the operation completes.*/
    this.load = function (loadArgs, callback)
    {
        if (_entry.link.removed === true) throw Error("Pane was removed from its PaneManager and cannot perform operations.");
        return options.link.manager.loadPane(_entry.paneId, loadArgs, callback);
    };

    /**Awaitable. Asynchronously loads a Pane. 
    @param {EVUI.Modules.Panes.PaneLoadArgs} loadArgs Optional. A PaneLoadArgs object graph. If omitted, the Pane's existing load settings are used instead.
    @param {EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} callback Optional. A callback to call once the operation completes.
    @returns {Promise<Boolean>}*/
    this.loadAsync = function (loadArgs)
    {
        if (_entry.link.removed === true) throw Error("Pane was removed from its PaneManager and cannot perform operations.");
        return options.link.manager.loadPaneAsync(_entry.paneId, loadArgs);
    }

    /**Asynchronously unloads a Pane, which disconnects the Pane's element and removes it from the DOM if it was loaded remotely. Provides a callback that is called after the operation has completed successfully or otherwise.
    @param {EVUI.Modules.Panes.PaneUnloadArgs|EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} paneUnloadArgs Optional. A PaneUnloadArgs object graph representing arguments for unloading a Pane or a callback. If omitted or passed a function, the Pane's existing unload settings are used instead.
    @param {EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} callback Optional. A callback to call once the operation completes.*/
    this.unload = function (unloadArgs, callback)
    {
        if (_entry.link.removed === true) throw Error("Pane was removed from its PaneManager and cannot perform operations.");
        return options.link.manager.unloadPane(_entry.paneId, unloadArgs, callback);
    };

    /**Awaitable. Asynchronously unloads a Pane, which disconnects the Pane's element and removes it from the DOM if it was loaded remotely.
    @param {EVUI.Modules.Panes.PaneUnloadArgs|EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} paneUnloadArgs Optional. A PaneUnloadArgs object graph representing arguments for unloading a Pane. If omitted, the Pane's existing unload settings are used instead.
    @returns {Promise<Boolean>}*/
    this.unloadAsync = function (unloadArgs)
    {
        if (_entry.link.removed === true) throw Error("Pane was removed from its PaneManager and cannot perform operations.");
        return options.link.manager.unloadPaneAsync(_entry.paneId, unloadArgs);
    };

    /**Asynchronously moves a currently visible pane to a new location.
    @param {EVUI.Modules.Panes.PaneMoveArgs} paneMoveArgs A PaneMoveArgs object graph representing arguments for moving a Pane.
    @param {EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} callback Optional. A callback to call once the operation completes.*/
    this.movePane = function (paneMoveArgs, callback)
    {
        if (_entry.link.removed === true) throw Error("Pane was removed from its PaneManager and cannot perform operations.");
        return options.link.manager.movePane(_entry.paneId, paneMoveArgs, callback);
    };

    /**Awaitable. Asynchronously moves a currently visible pane to a new location.
    @param {EVUI.Modules.Panes.PaneMoveArgs} paneMoveArgs A PaneMoveArgs object graph representing arguments for moving a Pane.
    @returns {Promise<Boolean>}*/
    this.movePaneAsync = function (paneMoveArgs)
    {
        if (_entry.link.removed === true) throw Error("Pane was removed from its PaneManager and cannot perform operations.");
        return options.link.manager.movePaneAsync(_entry.paneId, paneMoveArgs);
    };

    /**Asynchronously resizes a currently visible pane.
    @param {EVUI.Modules.Panes.PaneResizeArgs} paneResizeArgs A PaneResizeArgs object graph representing arguments for resizing a Pane.
    @param {EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} callback Optional. A callback to call once the operation completes.*/
    this.resizePane = function (paneResizeArgs, callback)
    {
        if (_entry.link.removed === true) throw Error("Pane was removed from its PaneManager and cannot perform operations.");
        return options.link.manager.resizePane(_entry.paneId, paneResizeArgs, callback);
    };

    /**Awaitable. Asynchronously resizes a currently visible pane.
    @param {EVUI.Modules.Panes.PaneResizeArgs} paneResizeArgs A PaneResizeArgs object graph representing arguments for resizing a Pane.*/
    this.resizePaneAsync = function (paneResizeArgs)
    {
        if (_entry.link.removed === true) throw Error("Pane was removed from its PaneManager and cannot perform operations.");
        return options.link.manager.resizePaneAsync(_entry.paneId, paneResizeArgs, callback);
    };

    /**Calculates and gets the absolute position of the Pane.
    @returns {EVUI.Modules.Dom.ElementBounds}*/
    this.getCurrentPosition = function ()
    {
        if (EVUI.Modules.Core.Utils.isElement(_element) === false) return new EVUI.Modules.Dom.ElementBounds();
        return new EVUI.Modules.Dom.DomHelper(_element).offset()
    };

    /**Gets the current Z-Index of the Pane.
    @returns {Number}*/
    this.getCurrentZIndex = function ()
    {
        if (EVUI.Modules.Core.Utils.isElement(_element) === false)
        {
            return -1
        }
        else
        {
            var zIndex = parseInt(getComputedStyle(_element).zIndex);
            if (isNaN(zIndex) === true) return -1;
            return zIndex;
        }
    };

    /**Add an event listener to fire after an event with the same key has been executed.
    @param {String} eventkey The key of the event in the EventStream to execute after.
    @param {EVUI.Modules.Panes.Constants.Fn_PaneEventHandler} handler The function to fire.
    @param {EVUI.Modules.EventStream.EventStreamEventListenerOptions} options Options for configuring the event.
    @returns {EVUI.Modules.EventStream.EventStreamEventListener}*/
    this.addEventListener = function (eventkey, handler, options)
    {
        if (EVUI.Modules.Core.Utils.isObject(options) === false) options = new EVUI.Modules.EventStream.EventStreamEventListenerOptions();
        options.eventType = EVUI.Modules.EventStream.EventStreamEventType.Event;

        return _entry.link.bubblingEvents.addEventListener(eventkey, handler, options);
    };

    /**Removes an event listener based on its event key, its id, or its handling function.
    @param {String} eventkeyOrId The key or ID of the event to remove.
    @param {Function} handler The handling function of the event to remove.
    @returns {Boolean}*/
    this.removeEventListener = function (eventkeyOrId, handler)
    {
        return _entry.link.bubblingEvents.removeEventListener(eventkeyOrId, handler);
    };
};

/**Settings for controlling how the Pane will automatically hide itself in response to user events.
@class*/
EVUI.Modules.Panes.PaneAutoHideSettings = function ()
{
    /**String. The trigger for what should hide the Pane. Must be a value from PaneHideMode.
    @type {String}*/
    this.hideMode = EVUI.Modules.Panes.PaneHideMode.Explicit;

    /**Array. An array of characters/key names ("a", "b", "Escape", "Enter", etc.) that will automatically trigger the Pane to be hidden when pressed. Corresponds to the KeyboardEvent.key property.
    @type {String[]}*/
    this.autoHideKeys = [];

    /**Boolean. Controls whether or not a click-based hideMode will hide the Pane that invoked show on the current Pane.
    @type {Boolean}*/
    this.allowChaining = false;

    /**An optional function to use to determine if an auto-hide event should hide the Pane. Return false to prevent the Pane from being hidden.
    @param {EVUI.Modules.Panes.PaneAutoTriggerContext} autoTriggerContext The context object generated by the event handler.
    @returns {Boolean}*/
    this.autoHideFilter = null;
};

/**Enum for describing the way the Pane should automatically hide itself.
@enum*/
EVUI.Modules.Panes.PaneHideMode =
{
    /**The Pane should hide on the next click.*/
    GlobalClick: "globalclick",
    /**The Pane should hide on any click outside its bounds.*/
    ExteriorClick: "exteriorclick",
    /**The pane should only hide when explicitly closed.*/
    Explicit: "explicit"
};

Object.freeze(EVUI.Modules.Panes.PaneHideMode);

/**Object for containing mutually exclusive options for how to load the Pane. A Element reference takes precedent over a CSS selector (where only the first result will be used), which takes precedent over a set of Http load arguments which takes precedence over placeholder load arguments.
@class*/
EVUI.Modules.Panes.PaneLoadSettings = function ()
{
    /**Object. The Element to show as the Pane.
    @type {Element}*/
    this.element = null;

    /**String. A CSS selector that is used to go find the Element to show as the Pane. Only the first result is used.
    @type {String}*/
    this.selector = null;

    /**Object. If using a CSS selector to find the root element of a Pane, this is the context limiting element to search inside of.
    @type {Element}*/
    this.contextElement = null;    

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

/**Arguments for loading a Pane.
@class*/
EVUI.Modules.Panes.PaneLoadArgs = function ()
{
    /**Any. Any contextual information to pass into the Pane load logic.
    @type {Any}*/
    this.context = null;

    /**Object. The Element to show as the Pane.
    @type {Element}*/
    this.element = null;

    /**String. A CSS selector that is used to go find the Element to show as the Pane. Only the first result is used.
    @type {String}*/
    this.selector = null;

    /**Object. If using a CSS selector to find the root element of a Pane, this is the context limiting element to search inside of.
    @type {Element}*/
    this.contextElement = null;

    /**Object. HttpRequestArgs for making a Http request to go get the Pane's HTML.
    @type {EVUI.Modules.Http.HttpRequestArgs}*/
    this.httpLoadArgs = null;

    /**Object. PlaceholderLoadArgs for making a series of Http requests to load the Pane as an existing placeholder.
    @type {EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadArgs}*/
    this.placeholderLoadArgs = null;

    /**Boolean. Whether or not to re-load the Pane.
    @type {Boolean}*/
    this.reload = false;
};

/**Object for containing a set of mutually exclusive directives for describing how to display and position the Pane. Goes in the following order: position class > absolute position > relative position > anchored position > document flow > full screen > centered.
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

    /**Boolean. Whether or not to increment the z-index of the pane to be the highest visible pane when the Pane's element gets a mousedown event.
    @type {Boolean}*/
    this.alwaysOnTop = true;
};

/**Arguments for showing a Pane. Contains a set of mutually exclusive directives for describing how to display and position the Pane.Goes in the following order: position class > absolute position > relative position > anchored position > document flow > full screen > centered.
@class */
EVUI.Modules.Panes.PaneShowArgs = function ()
{
    /**Any. Any contextual information to pass into the Pane show logic.
    @type {Any}*/
    this.context = undefined;

    /**String. The name of a CSS class (or an array of CSS classes, or a space-separated CSS classes) that are used to position the Pane.
    @type {String|String[]}*/
    this.positionClass = undefined;

    /**Object. An absolute position for the Pane to be placed at relative to the current view port.
    @type {EVUI.Modules.Panes.PaneAbsolutePosition}*/
    this.absolutePosition = undefined;

    /**Object. A description for how to position the Pane relative to a x,y point or relative to the edges of another Element.
    @type {EVUI.Modules.Panes.PaneRelativePosition}*/
    this.relativePosition = undefined;

    /**Object. A description of other elements to anchor the Pane to and stretch it between its top/bottom or left/right bounding elements.
    @type {EVUI.Modules.Panes.PaneAnchors}*/
    this.anchors = undefined;

    /**Object. A description of how to insert the Pane into the DOM relative to another element.
    @type {EVUI.Modules.Panes.PaneDocumentFlow}*/
    this.documentFlow = undefined;

    /**Object. Rules for describing the bounds and overflow behavior of the Pane.
    @type {EVUI.Modules.Panes.PaneClipSettings}*/
    this.clipSettings = undefined;

    /**Boolean. Whether or not to full screen the Pane to cover the entire current view port.
    @type {Boolean}*/
    this.fullscreen = undefined;

    /**Whether or not to explicitly position the Pane so that it is centered on the screen's current view port.
    @type {Boolean}*/
    this.center = undefined;

    /**Object. Contains the details of the CSS transition to use to show the Pane (if a transition is desired). If omitted, the Pane is positioned then shown by manipulating the display property directly.
    @type {EVUI.Modules.Panes.PaneTransition}*/
    this.showTransition = undefined;

    /**Boolean. Whether or not to include the height and width when positioning the element (when it is not clipped).
    @type {Boolean}*/
    this.setExplicitDimensions = undefined;

    /**Object. The settings for a backdrop to appear when the Pane is being displayed.
    @type {EVUI.Modules.Panes.PaneBackdropSettings}*/
    this.backdropSettings = undefined;

    /**Boolean. Whether or not to increment the z-index of the pane to be the highest visible pane when the Pane's element gets a mousedown event.
    @type {Boolean}*/
    this.alwaysOnTop = undefined;

    /**Boolean. Whether or not to re-initialize the Pane upon showing it.
    @type {Boolean}*/
    this.reInitialize = undefined;

    /**Object. Optional arguments for loading the Pane's element if it has not yet been loaded (or is being re-loaded).
    @type {EVUI.Modules.Panes.PaneLoadArgs}*/
    this.loadArgs = undefined;
};

/**Object for describing how the Pane should be inserted into the document flow relative to another element.
@class*/
EVUI.Modules.Panes.PaneDocumentFlow = function ()
{
    var _relativeElement = null;

    /**Object. The Element (or CSS selector of the Element) that the Pane will be inserted into the document flow relative to.
    @type {Element|String}*/
    this.relativeElement = null;

    /**String. A value from EVUI.Modules.Pane.PaneDocumentFlowMode indicating whether or not to append, prepend, or insert before/after the relative element. Appends the Pane as a child to the reference element by default.
    @type {String}*/
    this.mode = EVUI.Modules.Panes.PaneDocumentFlowMode.Append;
};

/**Object for describing the dimensions that the Pane should fit inside of and what to do when it overflows those bounds.
@class*/
EVUI.Modules.Panes.PaneClipSettings = function ()
{
    /**String. A value from the EVUI.Modules.Pane.PaneClipMode enum indicating the behavior when the Pane spills outside of the clipBounds. Defaults to "overflow".
    @type {String}*/
    this.mode = EVUI.Modules.Panes.PaneClipMode.Overflow;

    /**Object. An Element (or CSS selector of an Element) or an ElementBounds object describing the bounds to which the pane will attempt to fit inside. If omitted, the pane's current view port is used.
    @type {Element|EVUI.Modules.Dom.ElementBounds|String}*/
    this.clipBounds = null;

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
    /**Number. The Y-Coordinate of the top edge of the Pane.
    @type {Number}*/
    this.top = 0;

    /**Number. The X-Coordinate of the left edge of the Pane.
    @type {Number}*/
    this.left = 0;
};

/**Object for containing the relative location of the Pane relative to a given point or reference Element.
@class*/
EVUI.Modules.Panes.PaneRelativePosition = function ()
{
    /**Number. The X-Coordinate to align the Pane to if it is not being aligned with an Element.
    @type {Number}*/
    this.left = 0;

    /**Number. The Y-Coordinate to align the Pane to if it is not being aligned with an Element.
    @type {Number}*/
    this.top = 0;

    /**String. The orientation of the Pane relative to the point or element. "bottom right" by default. If only "left" or "right" is specified, "bottom" is implied; if only "bottom" or "top" is specified, "right" is implied..
    @type {String}*/
    this.orientation = EVUI.Modules.Panes.RelativePositionOrientation.Bottom + " " + EVUI.Modules.Panes.RelativePositionOrientation.Right;

    /**String. The alignment of the Pane relative to the side of the point or element.
    @type {String}*/
    this.alignment = EVUI.Modules.Panes.RelativePositionAlignment.None;

    /**Object. An Element (or CSS selector of an Element) to be used as a point or reference for the Pane to be placed next to. Defers to an x,y point specification.
    @type {Element|String}*/
    this.relativeElement = null;

    /**Boolean. Whether or not the cursor should be used as the relative point to position the Pane at if being called from an MouseEvent event handler.
    @type {Boolean} */
    this.useCursor = false;
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
    /**Object. The Element (or CSS selector of the Element) above the Pane whose bottom edge will be the boundary of the top of the Pane.
    @type {Element|String}*/
    this.top = null;

    /**Object. The Element (or CSS selector of the Element) to the Left of the Pane whose right edge will be the boundary of the left side of the Pane.
    @type {Element|String}*/
    this.left = null;    

    /**Object. The Element (or CSS selector of the Element) below the Pane whose top edge will be the boundary for the bottom side of the Pane.
    @type {Element|String}*/
    this.bottom = null;    

    /**Object. The Element (or CSS selector of the Element) to the right of the Pane whose left edge will be the boundary for the right side of the Pane.
    @type {Element|String}*/
    this.right = null;   

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
    this.triggerType = EVUI.Modules.Panes.PaneAutoTriggerType.None;

    /**Object. The browser's event arguments.
    @type {Event}*/
    this.event = null;

    /**Object. The Pane that is the target of the event.
    @type {EVUI.Modules.Panes.Pane}*/
    this.pane = null;

    /**Object. If this auto-trigger is being triggered by another Pane, this is that Pane.
    @type {EVUI.Modules.Panes.Pane}*/
    this.sourcePane = null;
};

/**Enum for describing the type of auto-close method that is being used to automatically close the Pane.
@enum*/
EVUI.Modules.Panes.PaneAutoTriggerType =
{
    /**Default. No trigger type.*/
    None: "none",
    /**The BantPane is being hidden due to a click event anywhere in the document.*/
    GlobalClick: "click-global",
    /**The BantPane is being hidden due to a click inside the Pane's element.*/
    Click: "click",
    /**The Pane is being hidden due to a click outside of itself somewhere in the document.*/
    ExteriorClick: "click-exterior",
    /**The Pane is being hidden due to a keydown event.*/
    KeyDown: "keydown",
    /**The Pane is being hidden due to one of its close handles being clicked on.*/
    Explicit: "explicit",
    /**The Pane is being hidden as the result of a cascading close of another Pane.*/
    Cascade: "cascade"
};
Object.freeze(EVUI.Modules.Panes.PaneAutoTriggerType);

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

    /**Object. The CSS transition that will be used when the pane is resized.
    @type {EVUI.Modules.Panes.PaneTransition}*/
    this.resizeTransition = null;

    /**Object. The CSS transition that will be used when the pane is resmovedized.
    @type {EVUI.Modules.Panes.PaneTransition}*/
    this.moveTransition = null;
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

/**Enum for describing the initial default behavior of a Pane.
@enum */
EVUI.Modules.Panes.PaneTemplateType =
{
    /**Default. No template.*/
    None: "none",
    /**Defaults to dropdown-like behavior (relative positioning, closes on exterior click, cascade closes other Panes with the same casecadeCloseGroupKey.)*/
    Dropdown: "dropdown",
    /**Defaults to modal-like behavior (centered on screen with a backdrop).*/
    Modal: "modal",
    /**Defaults to dialog-like behavior (arbitrary position, can be moved or resized, focus brings the dialog's z-index to be above all other panes).*/
    Dialog: "dialog"
};
Object.freeze(EVUI.Modules.Panes.PaneTemplateType);

/**Event arguments for all of the Pane events.
@class */
EVUI.Modules.Panes.PaneEventArgs = function (entry)
{
    if (entry == null) throw Error("Invalid arguments.")

    /**Object. The metadata about the state of the Pane.
    @type {InnerPaneEntry}*/
    var _entry = entry;

    /**The Pane that is having an action performed on it.
    @type {EVUI.Modules.Panes.Pane}*/
    this.pane = null;
    Object.defineProperty(this, "pane",
    {
        get: function () { return _entry.link.pane; },
        configurable: false,
        enumerable: true
    });

    /**String. The full name of the event.
    @type {String}*/
    this.eventName = null;

    /**String. The type of event being raised.
    @type {String}*/
    this.eventType = null;

    /**Pauses the Pane's action, preventing the next step from executing until resume is called.*/
    this.pause = function () { };

    /**Resumes the Pane's action, allowing it to continue to the next step.*/
    this.resume = function () { };

    /**Cancels the Pane's action and aborts the execution of the operation.*/
    this.cancel = function () { }

    /**Stops the Pane from calling any other event handlers with the same eventType.*/
    this.stopPropagation = function () { };

    /**Object. Read only. The position of the Pane that has been calculated in using the Pane's PaneShowSettings and the PaneShowArgs being used to show the Pane.
    @type {EVUI.Modules.Panes.PanePosition}*/
    this.calculatedPosition = null;

    /**Object. Any state value to carry between events.
    @type {Object}*/
    this.context = {};

    /**String. The original action that was issued. Must be a value from the PaneAction enum.
    @type {String}*/
    this.action = null;

    /**String. The current action being performed. Must be a value from the PaneAction enum.
    @type {String}*/
    this.currentAction = null;

    /**String. Read only. A value from PaneShowMode indicating the way in which the Pane will be shown (relative to an element, full screen, etc).
    @type {String}*/
    this.paneShowMode = EVUI.Modules.Panes.PaneShowMode.None;

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

    /**Object. The arguments being used to move this pane.
    @type {EVUI.Modules.Panes.PaneMoveArgs}*/
    this.moveArgs = null;

    /**Object. The arguments being used to resize this pane.
    @type {EVUI.Modules.Panes.PaneResizeArgs}*/
    this.resizeArgs = null;
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
    Unload: "unload",
    /**The Pane is in the process of being moved.*/
    Move: "move",
    /**The pane is in the process of being resized.*/
    Resize: "resize"
};
Object.freeze(EVUI.Modules.Panes.PaneAction);

/**Describes the calculated position of a Pane in absolute coordinates. 
@class*/
EVUI.Modules.Panes.PanePosition = function (mode)
{
    var _mode = mode;

    /**String. A value from EVUI.Modules.Pane.PanePositionMode indicating the method used to calculate the coordinates of the Pane's root element.
    @type {String}*/
    this.mode = EVUI.Modules.Panes.PaneShowMode.None;
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
EVUI.Modules.Panes.PaneShowMode =
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
Object.freeze(EVUI.Modules.Panes.PaneShowMode);

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

/**Arguments for hiding a Pane. 
@class*/
EVUI.Modules.Panes.PaneHideArgs = function ()
{
    /**Any. Any contextual information to pass into the Pane hide logic.
    @type {Any}*/
    this.context = undefined;

    /**Object. The hide transition to use to hide the Pane.
    @type {EVUI.Modules.Panes.PaneTransition}*/
    this.hideTransition = undefined;

    /**Boolean. Whether or not to remove the Pane from the DOM once it has been unloaded.
    @type {Boolean}*/
    this.unload = undefined;

    /**Object. The PaneUnloadArgs to use if unloading this Pane upon being hidden.
    @type {EVUI.Modules.Panes.PaneUnloadArgs}*/
    this.unloadArgs = undefined;
};

/**Arguments for unloading a Pane.
@class*/
EVUI.Modules.Panes.PaneUnloadArgs = function ()
{
    /**Any. Any contextual information to pass into the Pane hide logic.
    @type {Any}*/
    this.context = undefined;

    /**Boolean. Whether or not to remove the Pane from the PaneManager once it has been unloaded.
    @type {Boolean}*/
    this.remove = undefined;
};

/**Arguments for resizing or moving a Pane.
@class*/
EVUI.Modules.Panes.PaneResizeArgs = function ()
{
    /**Any. Any contextual information to pass into the Pane resize logic.
    @type {Any}*/
    this.context = undefined;

    /**Number. The distance to grow the top of the Pane, in pixels.
    @type {Number}*/
    this.top = undefined;

    /**Number. The distance to grow the left of the Pane, in pixels.
    @type {Number}*/
    this.left = undefined;

    /**Number. The distance to grow the right of the Pane, in pixels. 
    @type {Number}*/
    this.right = undefined;

    /**Number. The distance to grow the bottom of the Pane, in pixels.
    @type {Number}*/
    this.bottom = undefined;

    /**Number. The transition to apply to the Pane when it is resized.
    @type {EVUI.Modules.Panes.PaneTransition}*/
    this.transition = undefined;
};

/**Gets the height of the resized Pane.
@returns {Number}*/
EVUI.Modules.Panes.PaneResizeArgs.prototype.getResizedHeight = function ()
{
    return this.bottom - this.top;
};

/**Gets the width of the resized Pane.
@returns {Number}*/
EVUI.Modules.Panes.PaneResizeArgs.prototype.getResizedWidth = function ()
{
    return this.right - this.left;
};

/**Arguments for moving a Pane.
@class*/
EVUI.Modules.Panes.PaneMoveArgs = function ()
{
    /**Any. Any contextual information to pass into the Pane move logic.
    @type {Any}*/
    this.context = undefined;

    /**Number. The new top position of the Pane.
    @type {Number}*/
    this.top = undefined;

    /**Number. The new left position of the Pane.
    @type {Number}*/
    this.left = undefined;

    /**Number. The transition to apply to the Pane when it is moved.
    @type {EVUI.Modules.Panes.PaneTransition}*/
    this.transition = undefined;
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
    Move: "move",
    /**Arguments are PaneMoveResizeArgs.*/
    Resize: "resize"
};
Object.freeze(EVUI.Modules.Panes.PaneArgumentType);

/**Dependencies used by the PaneManager.
@class */
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

/**Constructor reference for the PaneManager.*/
EVUI.Constructors.Panes = EVUI.Modules.Panes.PaneManager;

 /**Gets a Pane object based on its ID or a selector function.
@param {EVUI.Modules.Panes.Constants.Fn_PaneSelector|String} paneIDOrSelector A selector function to select a PaneEntry object (or multiple PaneEntry objects) or the ID of the Pane to get the PaneEntry for.
@param {Boolean} returnFirstMatch Whether or not to return the first matching pane of the selector function. False by default.
@returns {EVUI.Modules.Panes.Pane|EVUI.Modules.Panes.Pane[]} */
$evui.getPane = function (paneIDOrSelector, returnFirstMatch)
{
    return $evui.panes.getPane(paneIDOrSelector, returnFirstMatch);
};

/**Adds a Pane to the PaneManager. If the Pane has already been added, the existing  Pane is returned unmodified.
@param {EVUI.Modules.Panes.Pane} pane A Pane object graph representing a new Pane to add. This object is copied onto a real Pane object is then discarded.
@returns {EVUI.Modules.Panes.Pane}*/
$evui.addPane = function (pane)
{
    return $evui.panes.addPane(pane);
};

/**Shows a Pane asynchronously. Provides a callback that is called once the Pane operation has completed successfully or otherwise.
@param {String|EVUI.Modules.Panes.Pane} paneID Either a Pane object graph to make into a new Pane, a real Pane reference, or the string ID of the Pane to show.
@param {EVUI.Modules.Panes.PaneShowArgs|EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} paneShowArgs Optional. A PaneShowArgs object graph or the callback. If omitted or passed a function, the Pane's existing show/load settings are used instead.
@param {EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} callback Optional. A callback that is called once the operation completes.*/
$evui.showPane = function (paneID, paneShowArgs, callback)
{
    return $evui.panes.showPane(paneID, paneShowArgs, callback);
};

/**Awaitable. Shows a Pane asynchronously.
@param {String|EVUI.Modules.Panes.Pane} paneID Either a Pane object graph to make into a new Pane, a real Pane reference, or the string ID of the Pane to show.
@param {EVUI.Modules.Panes.PaneShowArgs} paneShowArgs Optional. A PaneShowArgs object graph. If omitted the Pane's existing show/load settings are used instead.
@returns {Promise<Boolean>}*/
$evui.showPaneAsync = function (paneID, paneShowArgs)
{
    return $evui.panes.showPaneAsync(paneID, paneShowArgs);
};

/**Hides a Pane asynchronously. Provides a callback that is called once the Pane operation has completed successfully or otherwise.
@param {String|EVUI.Modules.Panes.Pane} paneID Either the ID of the Pane to hide or the Pane to hide.
@param {EVUI.Modules.Panes.PaneHideArgs|EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} paneHideArgs Optional. A PaneHideArgs object graph or a callback function. If omitted or passed a function, the Pane's existing hide/unload settings are used instead.
@param {EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} callback Optional. A callback that is called once the operation completes.*/
$evui.hidePane = function (paneID, paneHideArgs, callback)
{
    return $evui.panes.hidePane(paneID, paneHideArgs, callback);
};

/**Awaitable. Hides a Pane asynchronously.
@param {String|EVUI.Modules.Panes.Pane} paneID Either the ID of the Pane to hide or the Pane to hide.
@param {EVUI.Modules.Panes.PaneHideArgs} paneHideArgs Optional. A PaneHideArgs object graph or a callback function. If omitted, the Pane's existing hide/unload settings are used instead.
@returns {Promise<Boolean>}*/
$evui.hidePaneAsync = function (paneID, paneHideArgs)
{
    return $evui.panes.hidePaneAsync(paneID, paneHideArgs);
};

Object.freeze(EVUI.Modules.Panes);