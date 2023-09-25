/*Copyright 2022 Richard H Stannard

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.*/

/*#INCLUDES#*/

/*#BEGINWRAP(EVUI.Modules.PopIn|PopIn)#*/
/*#REPLACE(EVUI.Modules.PopIn|PopIn)#*/

/**Core module containing the Initialization and Utility functionality that is shared by all other modules.
@module*/
EVUI.Modules.PopIns = {};

/*#MODULEDEF(PopIn|"1.0";|"PopIn")#*/
/*#VERSIONCHECK(EVUI.Modules.PopIn|PopIn)#*/

EVUI.Modules.PopIns.Dependencies =
{
    Core: Object.freeze({ version: "1.0", required: true }),
    Panes: Object.freeze({ version: "1.0", required: true })
};

(function ()
{
    var checked = false;

    Object.defineProperty(EVUI.Modules.PopIns.Dependencies, "checked",
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

Object.freeze(EVUI.Modules.PopIns.Dependencies);

EVUI.Modules.PopIns.Constants = {};

/**Function for selecting a PaneEntry object. Return true to select the PaneEntry parameter as part of the result set.
@param {EVUI.Modules.PopIns.PopIn} popIn The PaneEntry providing metadata about a PopIn object.
@returns {Boolean}*/
EVUI.Modules.PopIns.Constants.Fn_PopInSelector = function (popIn) { return true; }

/**Function for reporting whether or not a PopIn was successfully Loaded.
@param {Boolean} success Whether or not the load operation completed successfully.*/
EVUI.Modules.PopIns.Constants.Fn_LoadCallback = function (success) { };

/**Function for reporting whether or not an operation PopIn was successful.
@param {Boolean} success Whether or not the operation completed successfully.*/
EVUI.Modules.PopIns.Constants.Fn_PopInOperationCallback = function (success) { };

EVUI.Modules.PopIns.Constants.CSS_Position = "evui-position";
EVUI.Modules.PopIns.Constants.CSS_ClippedX = "evui-clipped-x";
EVUI.Modules.PopIns.Constants.CSS_ClippedY = "evui-clipped-y";
EVUI.Modules.PopIns.Constants.CSS_ScrollX = "evui-scroll-x";
EVUI.Modules.PopIns.Constants.CSS_ScrollY = "evui-scroll-y"
EVUI.Modules.PopIns.Constants.CSS_Flipped = "evui-flipped";
EVUI.Modules.PopIns.Constants.CSS_Moved = "evui-moved";
EVUI.Modules.PopIns.Constants.CSS_Resized = "evui-resized";
EVUI.Modules.PopIns.Constants.CSS_Transition_Show = "evui-transition-show";
EVUI.Modules.PopIns.Constants.CSS_Transition_Hide = "evui-transition-hide";

/**String. The name of the ID attribute for the PopIn, used to look up a definition of a PopIn.
@type {String}*/
EVUI.Modules.PopIns.Constants.Attribute_ID = "evui-pop-id";

/**String. The name of the attribute that signifies which element should receive initial focus when the PopIn is displayed.
@type {String}*/
EVUI.Modules.PopIns.Constants.Attribute_Focus = "evui-pop-focus";

/**String. The name of the attribute that signifies that a click event on the Element should close the PopIn.
@type {String}*/
EVUI.Modules.PopIns.Constants.Attribute_Close = "evui-pop-close";

/**String. The name of the attribute on an element that triggers the showing of a PopIn what the URL to get the PopIn's HTML from is (Requires EVUI.Modules.Http).
@type {String}*/
EVUI.Modules.PopIns.Constants.Attribute_SourceURL = "evui-pop-src";

/**String. The name of the attribute on an element that triggers the showing of a PopIn of what placeholder to load for the PopIn's HTML (Requires EVUI.Modules.HtmlLoaderController).
@type {String}*/
EVUI.Modules.PopIns.Constants.Attribute_PlaceholderID = "evui-pop-placeholder-id";

/**String. The name of the attribute on an element that triggers the showing or hiding of a PopIn whether or not the PopIn should be unloaded when it is hidden.
@type {String}*/
EVUI.Modules.PopIns.Constants.Attribute_UnloadOnHide = "evui-pop-unload";

/**String. The name of the attribute on an element that triggers the showing or hiding of a PopIn that is used to indicate special behavior as defined by a consumer of the PopIn.
@type {String}*/
EVUI.Modules.PopIns.Constants.Attribute_Context = "evui-pop-cxt";

/**String. The name of the attribute on an element that triggers the showing of a PopIn what CSS selector to use to find the element to show as the PopIn. Only the first result will be used.
@type {String}*/
EVUI.Modules.PopIns.Constants.Attribute_Selector = "evui-pop-selector";

/**String. The name of the attribute that specifies which sides of the PopIn can be used to resize the PopIn. Specify any combination of "left", "right", "top", or "bottom". Only sides which are not anchored can be resized.
@type {String}*/
EVUI.Modules.PopIns.Constants.Attribute_ResizeHandles = "evui-pop-resize-handles";

/**String. The name of the attribute which specifies how wide the handle should be on the edges of the PopIn should be to start a resize operation in pixels.
@type {String}*/
EVUI.Modules.PopIns.Constants.Attribute_ResizeHandleWidth = "evui-pop-resize-handle-width"

EVUI.Modules.PopIns.Constants.Attribute_LeftAnchor = "evui-pop-anchor-left";

EVUI.Modules.PopIns.Constants.Attribute_RightLeftAnchor = "evui-pop-anchor-right";

EVUI.Modules.PopIns.Constants.Attribute_TopAnchor = "evui-pop-anchor-top";

EVUI.Modules.PopIns.Constants.Attribute_BottomAnchor = "evui-pop-anchor-bottom";

EVUI.Modules.PopIns.Constants.Default_ObjectName = "PopIn";
EVUI.Modules.PopIns.Constants.Default_ManagerName = "PopInManager";
EVUI.Modules.PopIns.Constants.Default_CssPrefix = "evui-pop";
EVUI.Modules.PopIns.Constants.Default_EventNamePrefix = "evui.pop";
EVUI.Modules.PopIns.Constants.Default_AttributePrefix = "evui-pop";

Object.freeze(EVUI.Modules.PopIns.Constants);

/**Class for managing PopIn object.
@class*/
EVUI.Modules.PopIns.PopInManager = function (services)
{
    if (EVUI.Modules.Core == null) throw Error("Dependency missing: EVUI.Modules.Core is required.");
    EVUI.Modules.Core.Utils.requireAll(EVUI.Modules.PopIns.Dependencies);

    var _self = this; //self-reference for closures

    /**The internal PaneManager of the PopInManager.
    @type {EVUI.Modules.Panes.PaneManager}*/
    var _manager = null;

    /**The settings overrides for the PopInManager.
    @type {EVUI.Modules.Panes.PaneManagerSettings}*/
    var _settings = null;

    /**Adds a PopIn to the WidowManager.
    @param {EVUI.Modules.PopIns.PopIn} popIn A YOLO object representing a PopIn object. This object is copied onto a real PopIn object is then discarded.
    @returns {EVUI.Modules.PopIns.PopIn}*/
    this.addPopIn = function (popIn)
    {
        if (popIn == null) throw Error(_settings.objectName + " cannot be null.");
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(popIn.id) === true) throw Error(_settings.objectName + "must have an id that is a non-whitespace string.");

        var existing = _settings.getPaneEntry(popIn.id);
        if (existing != null) throw Error("A " + _settings.objectName + " with an id of \"" + popIn.id + "\" already exists.");

        _manager.addPane(getDefaultPane(popIn));

        existing = _settings.getPaneEntry(popIn.id);
        return existing.wrapper;
    };

    /**Removes a PopIn from the PopInManager. Does not unload the PopIn's element from the DOM.
    @param {EVUI.Modules.PopIns.PopIn|String} popInOrID
    @returns {Boolean}*/
    this.removePopIn = function (popInOrID)
    {
        return _manager.removePane(popInOrID);
    };

    /**Gets a PopInEntry object based on its ID or a selector function.
    @param {EVUI.Modules.PopIns.Constants.Fn_PopInSelector|String} popInIDOrSelector A selector function to select a PopIn object (or multiple PopInEntry objects) or the ID of the PopIn to get the PopInEntry for.
    @param {Boolean} getAllMatches If a selector function is provided, all the PopInEntries that satisfy the selector are included. Otherwise a single PopInEntry object is returned. False by default.
    @returns {EVUI.Modules.PopIns.PopIn|EVUI.Modules.PopIns.PopIn[]} */
    this.getPopIn = function (popInIDOrSelector, getAllMatches)
    {
        var entries = null;

        if (typeof popInIDOrSelector === "function")
        {
            entries = _settings.getPaneEntry(function () { return true; }, true).map(function (entry) { return entry.wrapper; }).filter(popInIDOrSelector);
            if (getAllMatches !== true && entries != null) return entries[0];
            return entries;
        }
        else
        {
            entries = _settings.getPaneEntry(popInIDOrSelector, getAllMatches);
        }

        if (entries == null) return null;

        if (EVUI.Modules.Core.Utils.isArray(entries) === false)
        {
            return entries.wrapper;
        }
        else
        {
            return entries.map(function (entry) { return entry.wrapper; })
        }
    };

    /**Shows (and loads, if necessary or if a reload is requested) a PopIn asynchronously. Provides a callback that is called once the PopIn operation has completed successfully or otherwise.
    @param {EVUI.Modules.PopIns.PopIn|String} popInOrID Either a YOLO PopIn object to extend into the existing PopIn, the real PopIn reference, or the string ID of the PopIn to show.
    @param {EVUI.Modules.PopIns.PopInShowArgs|EVUI.Modules.PopIns.Constants.Fn_PopInOperationCallback} popInShowArgs Optional.  The arguments for showing the PopIn, or the callback. If omitted or passed as a function, the PopIn's existing show/load settings are used instead.
    @param {EVUI.Modules.PopIns.Constants.Fn_PopInOperationCallback} callback Optional. A callback that is called once the operation completes.*/
    this.showPopIn = function (popInOrID, popInShowArgs, callback)
    {
        var entry = getPopInAmbiguously(popInOrID, true);

        var windowShowArgs = new EVUI.Modules.Panes.PaneShowArgs();
        windowShowArgs.showSettings = _settings.cloneShowSettings(entry.window.showSettings);
        windowShowArgs.loadArgs = new EVUI.Modules.Panes.PaneLoadArgs();
        windowShowArgs.loadArgs.loadSettings = _settings.cloneLoadSettings(entry.window.loadSettings);

        if (typeof popInShowArgs === "function")
        {
            callback = popInShowArgs;
            popInShowArgs = null;
        }
        else if (popInShowArgs != null && typeof popInShowArgs === "object")
        {
            popInShowArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.PopIns.PopInShowArgs(windowShowArgs), popInShowArgs, ["type"]);
            if (popInShowArgs.showSettings != null)
            {
                popInShowArgs.showSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.PopIns.PopInShowSettings(windowShowArgs.showSettings), popInShowArgs.showSettings);
            }
            else
            {
                popInShowArgs.showSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.PopIns.PopInShowSettings(windowShowArgs.showSettings), entry.wrapper.showSettings);
            }


            if (popInShowArgs.loadArgs != null && popInShowArgs.loadArgs.loadSettings != null)
            {
                popInShowArgs.loadArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.PopIns.PopInLoadArgs(windowShowArgs.loadArgs), popInShowArgs.loadArgs, ["type"]);
                popInShowArgs.loadArgs.loadSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.PopIns.PopInLoadSettings(windowShowArgs.loadArgs.loadSettings), popInShowArgs.loadArgs.loadSettings);
            }
            else
            {
                popInShowArgs.loadArgs = new EVUI.Modules.PopIns.PopInLoadArgs(windowShowArgs.loadArgs);
                popInShowArgs.loadArgs.loadSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.PopIns.PopInLoadSettings(windowShowArgs.loadArgs.loadSettings), entry.wrapper.loadSettings, ["type"]);;
            }
        }
        else
        {
            popInShowArgs = null;
        }

        if (popInShowArgs == null)
        {
            popInShowArgs = new EVUI.Modules.PopIns.PopInShowArgs(windowShowArgs);
            popInShowArgs.showSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.PopIns.PopInShowSettings(windowShowArgs.showSettings), entry.wrapper.showSettings);
            popInShowArgs.loadArgs = new EVUI.Modules.PopIns.PopInLoadArgs(windowShowArgs.loadArgs);
            popInShowArgs.loadArgs.loadSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.PopIns.PopInLoadSettings(windowShowArgs.loadArgs.loadSettings), entry.wrapper.loadSettings);
        }

        _settings.currentActionArgs = makeCurrentActionArgs(popInShowArgs);

        _manager.showPane(entry.window.id, windowShowArgs, callback);
    };

    /**Awaitable. (and loads, if necessary or if a reload is requested) a PopIn asynchronously.
    @param {EVUI.Modules.PopIns.PopIn|String} popInOrID Either a YOLO PopIn object to extend into the existing PopIn, the real PopIn reference, or the string ID of the PopIn to show.
    @param {EVUI.Modules.PopIns.PopInShowArgs} popInShowArgs Optional.  A YOLO object representing the arguments for showing the PopIn. If omitted, the PopIn's existing show/load settings are used instead.
    @returns {Promise<Boolean>}*/
    this.showPopInAsync = function (popInOrID, popInShowArgs)
    {
        return new Promise(function (resolve)
        {
            _self.showPopIn(popInOrID, popInShowArgs, function (success)
            {
                resolve(success);
            });
        });
    };

    /**Hides (and unloads if requested) a PopIn asynchronously. Provides a callback that is called call once the PopIn operation has completed successfully or otherwise.
    @param {EVUI.Modules.PopIns.PopIn|String} popInOrID Either a YOLO PopIn object to extend into the existing PopIn, the real PopIn reference, or the string ID of the PopIn to hide.
    @param {EVUI.Modules.PopIns.PopInHideArgs|EVUI.Modules.PopIns.Constants.Fn_PopInOperationCallback} popInHideArgs Optional. A YOLO object representing arguments for hiding a PopIn or a callback. If omitted or passed as a function, the PopIn's existing hide/unload settings are used instead.
    @param {EVUI.Modules.PopIns.Constants.Fn_PopInOperationCallback} callback Optional. A callback that is called once the operation completes.*/
    this.hidePopIn = function (popInOrID, popInHideArgs, callback)
    {
        var entry = getPopInAmbiguously(popInOrID);

        var windowHideArgs = new EVUI.Modules.Panes.PaneHideArgs();
        windowHideArgs.unloadArgs = new EVUI.Modules.Panes.PaneUnloadArgs();

        if (typeof popInHideArgs === "function")
        {
            callback = popInHideArgs;
            popInHideArgs = null;
        }
        else if (popInHideArgs != null && typeof popInHideArgs === "object")
        {
            popInHideArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.PopIns.PopInHideArgs(windowHideArgs), popInHideArgs, ["type"]);
            popInHideArgs.unloadArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.PopIns.PopInUnloadArgs(windowHideArgs.unloadArgs, popInHideArgs.unloadArgs));
        }
        else
        {
            popInHideArgs = null;
        }


        if (popInHideArgs == null)
        {
            popInHideArgs = new EVUI.Modules.PopIns.PopInHideArgs(windowHideArgs);
            popInHideArgs.unloadArgs = new EVUI.Modules.PopInUnloadArgs(windowHideArgs.unloadArgs);
        }

        _settings.currentActionArgs = makeCurrentActionArgs(popInHideArgs);
        _manager.hidePane(entry.window.id, windowHideArgs, callback);
    };

    /**Awaitable. Hides (and unloads if requested) a PopIn asynchronously.
    @param {EVUI.Modules.PopIns.PopIn|String} popInOrID Either a YOLO PopIn object to extend into the existing PopIn, the real PopIn reference, or the string ID of the PopIn to hide.
    @param {EVUI.Modules.PopIns.PopInHideArgs} popInHideArgs Optional. A YOLO object representing the arguments for hiding a PopIn. If omitted, the PopIn's existing hide/unload settings are used instead.
    @returns {Promise<Boolean>}*/
    this.hidePopInAsync = function (popInOrID, popInHideArgs)
    {
        return new Promise(function (resolve)
        {
            _self.hidePopIn(popInOrID, popInHideArgs, function (success)
            {
                resolve(success);
            });
        });
    };

    /**Hides all visible PopIns asynchronously. Provides a callback function that is called once all the visible PopIns have been hidden.
    @param {EVUI.Modules.PopIns.PopInHideArgs} popInHideArgs Optional. A YOLO object representing the arguments for hiding a PopIn. If omitted, the PopIn's existing hide/unload settings are used instead.
    @param {EVUI.Modules.PopIns.Constants.Fn_PopInOperationCallback} callback The callback that is called once all the PopIn's hide operations have completed.*/
    this.hideAllPopIns = function (popInHideArgs, callback)
    {
        if (typeof callback !== "function") callback = function () { };
        var allVisible = this.getPopIn(function (dd) { return dd.isVisible; });
        var numVisible = allVisible.length;
        var numHidden = 0;

        if (numVisible === 0) return callback(true);

        for (var x = 0; x < numVisible; x++)
        {
            this.hidePopIn(allVisible[x], popInHideArgs, function ()
            {
                numHidden++;
                if (numHidden === numVisible)
                {
                    return callback(true);
                }
            });
        }
    };

    /**Awaitable. Hides all PopIns asynchronously.
    @param {EVUI.Modules.PopIns.PopInHideArgs} windowHideArgs Optional. A YOLO object representing the arguments for hiding a PopIn. If omitted, the PopIn's existing hide/unload settings are used instead.
    @returns {Promise<Boolean>} */
    this.hideAllPopInsAsync = function (windowHideArgs)
    {
        return new Promise(function (resolve)
        {
            _self.hideAllPopIns(windowHideArgs, function (success)
            {
                resolve(success);
            });
        });
    };

    /**Asynchronously loads a PopIn. Provides a callback that is called after the operation has completed successfully or otherwise.
    @param {EVUI.Modules.PopIns.PopIn|String} popInOrID Either a YOLO PopIn object to extend into the existing PopIn, the real PopIn reference, or the string ID of the PopIn to load.
    @param {EVUI.Modules.PopIns.PopInLoadArgs|EVUI.Modules.PopIns.Constants.Fn_PopInOperationCallback} popInLoadArgs Optional. A YOLO object representing arguments for loading a PopIn or a callback. If omitted or passed as a function, the PopIn's existing load settings are used instead.
    @param {EVUI.Modules.PopIns.Constants.Fn_PopInOperationCallback} callback Optional. A callback to call once the operation completes.*/
    this.loadPopIn = function (popInOrID, popInLoadArgs, callback)
    {
        var entry = getPopInAmbiguously(popInOrID, false);

        var windowLoadArgs = new EVUI.Modules.Panes.PaneLoadArgs();
        windowLoadArgs.loadSettings = _settings.cloneLoadSettings(entry.window.loadSettings);

        if (typeof popInLoadArgs === "function")
        {
            callback = popInLoadArgs;
            popInLoadArgs = null;
        }
        else if (popInLoadArgs != null && typeof popInLoadArgs === "object")
        {
            popInLoadArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.PopIns.PopInLoadArgs(windowLoadArgs), popInLoadArgs, ["type"]);
            if (popInLoadArgs.loadSettings != null)
            {
                popInLoadArgs.loadSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.PopIns.PopInLoadSettings(windowLoadArgs.loadSettings), popInLoadArgs.loadSettings);
            }
            else
            {
                popInLoadArgs.loadSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.PopIns.PopInLoadSettings(windowLoadArgs.loadSettings), entry.wrapper.loadSettings);
            }
        }
        else
        {
            popInLoadArgs = null;
        }

        if (popInLoadArgs == null)
        {
            popInLoadArgs = new EVUI.Modules.PopIns.PopInLoadArgs(windowLoadArgs);
            popInLoadArgs.loadSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.PopIns.PopInLoadSettings(windowLoadArgs.loadSettings), entry.wrapper.loadSettings);
        }

        _settings.currentActionArgs = makeCurrentActionArgs(popInLoadArgs);
        _manager.loadPane(entry.window.id, windowLoadArgs, callback);
    };

    /**Awaitable. Asynchronously loads a PopIn.
    @param {EVUI.Modules.PopIns.PopIn|String} popInOrID Either a YOLO PopIn object to extend into the existing PopIn, the real PopIn reference, or the string ID of the PopIn to load.
    @param {EVUI.Modules.PopIns.PopInLoadArgs} popInLoadArgs Optional. A YOLO object representing arguments for loading a PopIn.
    @returns {Promise<Boolean>}*/
    this.loadPopInAsync = function (popInOrID, popInLoadArgs)
    {
        return new Promise(function (resolve)
        {
            _self.loadPopIn(popInOrID, popInLoadArgs, function (success)
            {
                resolve(success);
            });
        });
    };

    /**Asynchronously unloads a PopIn, which disconnects the PopIn's element and removes it from the DOM if it was loaded remotely. Provides a callback that is called after the operation has completed successfully or otherwise.
    @param {EVUI.Modules.PopIns.PopIn|String} popInOrID Either a YOLO PopIn object to extend into the existing PopIn, the real PopIn reference, or the string ID of the PopIn to unload.
    @param {EVUI.Modules.PopIns.PopInUnloadArgs|EVUI.Modules.PopIns.Constants.Fn_PopInOperationCallback} popInUnloadArgs Optional. A YOLO object representing arguments for unloading a PopIn or a callback. If omitted or passed as a function, the PopIn's existing unload settings are used instead.
    @param {EVUI.Modules.PopIns.Constants.Fn_PopInOperationCallback} callback Optional. A callback to call once the operation completes.*/
    this.unloadPopIn = function (popInOrID, popInUnloadArgs, callback)
    {
        var entry = getPopInAmbiguously(popInOrID);
        var windowUnloadArgs = new EVUI.Modules.Panes.PaneUnloadArgs();

        if (typeof popInUnloadArgs === "function")
        {
            callback = popInUnloadArgs;
            popInUnloadArgs = null;
        }
        else if (popInUnloadArgs != null && typeof popInUnloadArgs === "object")
        {
            popInUnloadArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.PopIns.PopInUnloadArgs(windowUnloadArgs), popInUnloadArgs);
        }
        else
        {
            popInUnloadArgs = null;
        }

        if (popInUnloadArgs == null)
        {
            popInUnloadArgs = new EVUI.Modules.PopIns.PopInUnloadArgs(windowUnloadArgs);
        }

        _settings.currentActionArgs = makeCurrentActionArgs(popInUnloadArgs);
        _manager.unloadPane(entry.window.id, windowUnloadArgs, callback);
    };

    /**Awaitable. Asynchronously unloads a PopIn, which disconnects the PopIn's element and removes it from the DOM if it was loaded remotely.
    @param {EVUI.Modules.PopIns.PopIn|String} popInOrID Either a YOLO PopIn object to extend into the existing PopIn, the real PopIn reference, or the string ID of the PopIn to unload.
    @param {EVUI.Modules.PopIns.PopInUnloadArgs} popInUnloadArgs Optional. A YOLO object representing arguments for unloading a PopIn. If omitted the PopIn's existing unload settings are used instead.
    @returns {Promise<Boolean>}*/
    this.unloadPopInAsync = function (popInOrID, popInUnloadArgs)
    {
        return new Promise(function (resolve)
        {
            _self.unloadPopIn(popInOrID, popInUnloadArgs, function (success)
            {
                resolve(success);
            });
        });
    };

    /**Makes or extends an object at the end of the PaneManager's function for applying the changes made to the Pane.
   @param {PaneCreationResult} windowCreateResult The result of creating the window.
   @returns {EVUI.Modules.Panes.Pane}*/
    var makeOrExtendObject = function (createResult)
    {
        var popIn = createResult.window.popIn;
        delete createResult.window.popIn;

        return makeOrExtendPopIn(popIn, createResult.window, createResult.exists);
    };

    /**Builds the PopInEventArgs to use in the EventStream.
    @param {EVUI.Modules.Panes.PaneArgsPackage} argsPackage The argument data from the PaneManager about the current state of the PopIn.
    @param {EVUI.Modules.Panes.PaneEventArgs} windowEventArgs The PaneEventArgs that were created for the event.
    @returns {EVUI.Modules.PopIns.PopInEventArgs} */
    var buildEventArgs = function (argsPackage, windowEventArgs)
    {
        if (argsPackage.foreignArgs == null)
        {
            argsPackage.foreignArgs = createForeignArgs(argsPackage);
        }

        var args = null;
        if (windowEventArgs.currentActionArgs.type === EVUI.Modules.Panes.PaneArgumentType.Hide)
        {
            args = argsPackage.foreignArgs.hideArgs;
        }
        else if (windowEventArgs.currentActionArgs.type === EVUI.Modules.Panes.PaneArgumentType.Load)
        {
            args = argsPackage.foreignArgs.loadArgs;
        }
        else if (windowEventArgs.currentActionArgs.type === EVUI.Modules.Panes.PaneArgumentType.Show)
        {
            args = argsPackage.foreignArgs.showArgs;
        }
        else if (windowEventArgs.currentActionArgs.type === EVUI.Modules.Panes.PaneArgumentType.Unload)
        {
            args = argsPackage.foreignArgs.unloadArgs;
        }

        var popInEventArgs = new EVUI.Modules.PopIns.PopInEventArgs(argsPackage, args);
        popInEventArgs.cancel = windowEventArgs.cancel;
        popInEventArgs.key = windowEventArgs.key;
        popInEventArgs.pause = windowEventArgs.pause;
        popInEventArgs.resume = windowEventArgs.resume;
        popInEventArgs.stopPropagation = windowEventArgs.stopPropagation;
        popInEventArgs.context = windowEventArgs.context;

        return popInEventArgs;
    };

    /**Makes the foreign arguments for injecting into a PopInEventArgs object from the PaneManager.
    @param {EVUI.Modules.PopIns.PopInShowArgs|EVUI.Modules.PopIns.PopInHideArgs|EVUI.Modules.PopIns.PopInLoadArgs|EVUI.Modules.PopIns.PopInUnloadArgs} popInArgs
    @returns {EVUI.Modules.Panes.PaneArgsPackage}.*/
    var makeCurrentActionArgs = function (popInArgs)
    {
        var currentActionArgs = new EVUI.Modules.Panes.PaneArgsPackage();
        if (popInArgs.type === EVUI.Modules.PopIns.PopInArgumentType.Hide)
        {
            currentActionArgs.hideArgs = popInArgs;
            currentActionArgs.unloadArgs = popInArgs.unloadArgs;
        }
        else if (popInArgs.type === EVUI.Modules.PopIns.PopInArgumentType.Show)
        {
            currentActionArgs.showArgs = popInArgs;
            currentActionArgs.loadArgs = popInArgs.loadArgs;
        }
        else if (popInArgs.type === EVUI.Modules.PopIns.PopInArgumentType.Load)
        {
            currentActionArgs.loadArgs = popInArgs;
        }
        else if (popInArgs.type === EVUI.Modules.PopIns.PopInArgumentType.Unload)
        {
            currentActionArgs.unloadArgs = popInArgs;
        }

        return currentActionArgs;
    };

    /**Makes the "foreign" arguments for the PaneManager if it does not have them already.
    @param {EVUI.Modules.Panes.PaneArgsPackage} argsPackage The state of the PopIn as reported by the Panemanager.
    @returns {EVUI.Modules.Panes.WidowArgsPackage}*/
    var createForeignArgs = function (argsPackage)
    {
        var foreignArgs = new EVUI.Modules.Panes.PaneArgsPackage();
        if (argsPackage.hideArgs != null)
        {
            foreignArgs.hideArgs = new EVUI.Modules.PopIns.PopInHideArgs(argsPackage.hideArgs);
            foreignArgs.hideArgs.unloadArgs = new EVUI.Modules.PopIns.PopInUnloadArgs(argsPackage.hideArgs.unloadArgs);
        }

        if (argsPackage.showArgs != null)
        {
            foreignArgs.showArgs = new EVUI.Modules.PopIns.PopInShowArgs(argsPackage.showArgs);
            foreignArgs.showArgs.showSettings = new EVUI.Modules.PopIns.PopInShowSettings(argsPackage.showArgs.showSettings);
            foreignArgs.showArgs.loadArgs = new EVUI.Modules.PopIns.PopInLoadArgs(argsPackage.showArgs.loadArgs);
            foreignArgs.showArgs.loadArgs.loadSettings = new EVUI.Modules.PopIns.PopInLoadSettings(argsPackage.showArgs.loadArgs.loadSettings);
        }

        if (argsPackage.loadArgs != null)
        {
            foreignArgs.loadArgs = new EVUI.Modules.PopIns.PopInLoadArgs(argsPackage.loadArgs);
            foreignArgs.loadArgs.loadSettings = new EVUI.Modules.PopIns.PopInLoadSettings(argsPackage.loadArgs.loadSettings);
        }

        if (argsPackage.unloadArgs != null)
        {
            foreignArgs.unloadArgs = new EVUI.Modules.PopIns.PopInUnloadArgs(argsPackage.unloadArgs);
        }

        return foreignArgs;
    };

    /**Makes or extends a PopIn object. Preserves all object references between runs and extends new properties onto the existing objects if they exist. 
    @param {EVUI.Modules.PopIns.PopIn} yoloPopIn A YOLO object representing a PopIn.
    @returns {EVUI.Modules.PopIns.PopIn} */
    var makeOrExtendPopIn = function (yoloPopIn, pane, exists)
    {
        var popInToExtend = null;
        if (exists === true)
        {
            var preExisting = _settings.getPaneEntry(yoloPopIn.id);
            popInToExtend = preExisting.wrapper;
        }
        else
        {
            popInToExtend = new EVUI.Modules.PopIns.PopIn(pane);
        }

        var safeCopy = EVUI.Modules.Core.Utils.shallowExtend({}, yoloPopIn);
        delete safeCopy.id;
        if (exists === true && yoloPopIn.element === pane.element) delete safeCopy.element; //if the popIn already exists and this is the same reference, don't set it again. Otherwise, let it blow up.
        delete safeCopy.currentPosition;
        delete safeCopy.currentZIndex;
        delete safeCopy.isVisible;
        delete safeCopy.isInitialized;
        delete safeCopy.isLoaded;

        EVUI.Modules.Core.Utils.shallowExtend(popInToExtend, safeCopy, ["showSettings", "loadSettings", "autoCloseSettings", "resizeMoveSettings"]);
        popInToExtend.showSettings = EVUI.Modules.Core.Utils.makeOrExtendObject(new EVUI.Modules.PopIns.PopInShowSettings(pane.showSettings), popInToExtend.showSettings, yoloPopIn.showSettings);
        popInToExtend.loadSettings = EVUI.Modules.Core.Utils.makeOrExtendObject(new EVUI.Modules.PopIns.PopInLoadSettings(pane.loadSettings), popInToExtend.loadSettings, yoloPopIn.loadSettings);
        popInToExtend.autoCloseSettings = EVUI.Modules.Core.Utils.makeOrExtendObject(new EVUI.Modules.PopIns.PopInAutoCloseSettings(pane.autoCloseSettings), popInToExtend.autoCloseSettings, yoloPopIn.autoCloseSettings);
        popInToExtend.resizeMoveSettings = EVUI.Modules.Core.Utils.makeOrExtendObject(new EVUI.Modules.PopIns.PopInResizeMoveSettings(pane.resizeMoveSettings), popInToExtend.resizeMoveSettings, yoloPopIn.resizeMoveSettings)
        return popInToExtend;
    };

    /**Gets a PopIn object from ambiguous input.
    @param {EVUI.Modules.PopIns.PopIn|String|Event} popInOrID Either a YOLO object representing a PopIn object, a string ID of a PopIn, or browser Event args triggering a PopIn action.
    @param {Boolean} addIfMissing Whether or not to add the PopIn record if it is not already present.
    @returns {EVUI.Modules.Panes.PaneEntry} */
    var getPopInAmbiguously = function (popInOrID, addIfMissing)
    {
        if (popInOrID == null || (typeof popInOrID !== "string" && typeof popInOrID !== "object")) throw Error("Invalid input: " + _settings.objectName + " or string id expected.");

        if (popInOrID instanceof Event)
        {
            var entry = _settings.getPaneEntryAmbiguously(popInOrID, addIfMissing);
            return entry;
        }

        var fakePane = {};
        if (typeof popInOrID === "string")
        {
            fakePane = getDefaultPane({ id: popInOrID });
        }
        else
        {
            fakePane.id = popInOrID.id;
            fakePane.popIn = popInOrID;
        }

        return _settings.getPaneEntryAmbiguously(fakePane, addIfMissing);
    };

    /**Gets a YOLO Pane object with all the default properties for a PopIn's backing Pane.
    @param {EVUI.Modules.PopIns.PopIn} popIn The popIn to use as a wrapper for the Pane.
    @returns {EVUI.Modules.Panes.Pane}*/
    var getDefaultPane = function (popIn)
    {
        if (typeof popIn.id === "string")
        {
            var existing = _settings.getPaneEntry(popIn.id);
            if (existing != null && existing.window != null)
            {
                var fake = EVUI.Modules.Core.Utils.shallowExtend({}, existing.window);

                fake.popIn = popIn;
                return fake;
            }
        }

        var window =
        {
            id: popIn.id,
            autoCloseSettings:
            {
                closeMode: EVUI.Modules.Panes.PaneCloseMode.Explicit,
            },
            clipSettings:
            {
                clipMode: EVUI.Modules.PopIns.PopInClipMode.Overflow,
            },            
            popIn: popIn
        };

        return window;
    };

    /**Interprets a browser event for a PopIn operation.
    @param {EVUI.Modules.Panes.Pane} pane The YOLO Pane being created to extend onto a real record.
    @param {Event} browserEvent The event from the browser.
    @returns {EVUI.Modules.Panes.Pane}*/
    var interpretBrowserEvent = function (pane, browserEvent)
    {
        EVUI.Modules.Core.Utils.shallowExtend(pane, getDefaultPane({ id: pane.id }));
        if (pane.showSettings == null) pane.showSettings = {};
        if (pane.resizeMoveSettings == null) pane.resizeMoveSettings = {};

        var attributes = EVUI.Modules.Core.Utils.getElementAttributes(browserEvent.currentTarget);

        var center = attributes.getValue(EVUI.Modules.PopIns.Constants.Attribute_Center);
        var fullscreen = attributes.getValue(EVUI.Modules.PopIns.Constants.Attribute_Fullscreen);
        var drag = attributes.getValue(EVUI.Modules.PopIns.Constants.Attribute_Drag);
        var resizeHandles = attributes.getValue(EVUI.Modules.PopIns.Constants.Attribute_ResizeHandles);
        var resizeHadleWidth = attributes.getValue(EVUI.Modules.PopIns.Constants.Attribute_ResizeHandleWidth);
        var top = attributes.getValue(EVUI.Modules.PopIns.Constants.Attribute_Top);
        var left = attributes.getValue(EVUI.Modules.PopIns.Constants.Attribute_Left);
        var classes = attributes.getValue(EVUI.Modules.PopIns.Constants.Attribute_Classes);

        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(fullscreen) === false)
        {
            fullscreen = fullscreen.toLowerCase();

            if (fullscreen === "false")
            {
                pane.showSettings.fullscreen = false;
            }
            else if (fullscreen === "true")
            {
                pane.showSettings.fullscreen = true;
            }
        }

        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(center) === false)
        {
            center = center.toLowerCase();

            if (center === "false")
            {
                pane.showSettings.center = false;
            }
            else if (center === "true")
            {
                pane.showSettings.center = true;
            }
        }

        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(left) === false)
        {
            if (pane.showSettings.absolutePosition == null) pane.showSettings.absolutePosition = {};
            left = parseFloat(left, left.toLowerCase().replace("px", ""));
            if (isNaN(left) === false) pane.showSettings.absolutePosition.left = left;
        }

        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(top) === false)
        {
            if (pane.showSettings.absolutePosition == null) pane.showSettings.absolutePosition = {};
            top = parseFloat(top, top.toLowerCase().replace("px", ""));
            if (isNaN(left) === false) pane.showSettings.absolutePosition.top = top;
        }

        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(classes) === false)
        {
            pane.showSettings.positionClass = classes;
        }

        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(drag) === false)
        {
            drag = drag.toLowerCase();

            if (drag === "true")
            {
                pane.resizeMoveSettings.canDragMove = true;
            }
            else if (drag === "false")
            {
                pane.resizeMoveSettings.canDragMove = false;
            }
        }

        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(resizeHandles) === false)
        {
            resizeHandles = resizeHandles.toLowerCase();

            pane.resizeMoveSettings.canResizeLeft = false;
            pane.resizeMoveSettings.canResizeRight = false;
            pane.resizeMoveSettings.canResizeTop = false;
            pane.resizeMoveSettings.canResizeBottom = false;

            if (resizeHandles.indexOf("left") !== -1) pane.resizeMoveSettings.canResizeLeft = true;
            if (resizeHandles.indexOf("right") !== -1) pane.resizeMoveSettings.canResizeRight = true;
            if (resizeHandles.indexOf("top") !== -1) pane.resizeMoveSettings.canResizeTop = true;
            if (resizeHandles.indexOf("bottom") !== -1) pane.resizeMoveSettings.canResizeBottom = true;
        }

        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(resizeHadleWidth) === false)
        {
            resizeHadleWidth = parseFloat(resizeHadleWidth, resizeHadleWidth.toLowerCase().replace("px", ""));
            if (isNaN(resizeHadleWidth) === false && resizeHadleWidth >= 0) pane.resizeMoveSettings.resizeHadleWidth = resizeHadleWidth;
        }

        return true;
    };

    /**Adds additional event handlers to the PopIn.
    @param {EVUI.Modules.Panes.PaneEntry} windowEntry The window to add the event to.*/
    var hookUpEventHandlers = function (windowEntry)
    {
        setHighestZOrder(windowEntry);
    };

    /**Adds additional event handlers to the PopIn.
    @param {EVUI.Modules.Panes.PaneEntry} windowEntry The window to add the event to.*/
    var setHighestZOrder = function (windowEntry)
    {
        windowEntry.window.addEventBinding(windowEntry.window.element, "mousedown", function (eventArgs)
        {
            var curZIndex = windowEntry.window.currentZIndex;
            if (curZIndex >= EVUI.Modules.Panes.Constants.GlobalZIndex) return;

            EVUI.Modules.Panes.Constants.GlobalZIndex++;

            curZIndex = EVUI.Modules.Panes.Constants.GlobalZIndex;
            var selector = "." + windowEntry.windowCSSName + "." + EVUI.Modules.PopIns.Constants.CSS_Position;

            EVUI.Modules.Styles.Manager.ensureSheet(_settings.cssSheetName, { lock: true });
            EVUI.Modules.Styles.Manager.setRules(_settings.cssSheetName, selector, { zIndex: curZIndex });
        });
    };

    _settings = new EVUI.Modules.Panes.PaneManagerSettings();
    _settings.attributePrefix = EVUI.Modules.PopIns.Constants.Default_AttributePrefix;
    _settings.cssPrefix = EVUI.Modules.PopIns.Constants.Default_CssPrefix;
    _settings.cssSheetName = EVUI.Modules.Styles.Constants.DefaultStyleSheetName;
    _settings.eventNamePrefix = EVUI.Modules.PopIns.Constants.Default_EventNamePrefix;
    _settings.managerName = EVUI.Modules.PopIns.Constants.Default_ManagerName;
    _settings.objectName = EVUI.Modules.PopIns.Constants.Default_ObjectName;
    _settings.makeOrExtendObject = makeOrExtendObject;
    _settings.buildEventArgs = buildEventArgs;
    _settings.interpretBrowserEvent = interpretBrowserEvent;
    _settings.hookUpEventHandlers = hookUpEventHandlers

    if (services == null || typeof services !== "object") services = new EVUI.Modules.PopIns.PopInControllerServices();
    if (services.paneManager == null || typeof services.paneManager !== "object")
    {
        services.paneManager = EVUI.Modules.Panes.Manager;
    }

    _settings.httpManager = services.httpManager;
    _settings.stylesheetManager = services.stylesheetManager;
    _settings.htmlLoader = services.htmlLoader;

    _manager = new services.paneManager.createNewPaneManager(_settings);

    /**Global event that fires before the load operation begins for any PopIn and is not yet in the DOM and cannot be manipulated in this stage, however the currentActionArgs.loadSettings can be manipulated to change the way the PopIn's root element will be loaded.
    @param {EVUI.Modules.PopIns.PopInEventArgs} windowEventArgs The event arguments for the PopIn operation. The currentActionArgs property will be an instance of PopInLoadArgs.*/
    this.onLoad = function (windowEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onLoad", targetPath: "onLoad" });

    /**Global even that fires after the load operation has completed for any PopIn and is now in the DOM and can be manipulated in this stage. From this point on the PopIn's element property cannot be reset..
    @param {EVUI.Modules.PopIns.PopInEventArgs} windowEventArgs The event arguments for the PopIn operation. The currentActionArgs property will be an instance of PopInLoadArgs.*/
    this.onLoaded = function (windowEventArgs) { };;
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onLoaded", targetPath: "onLoaded" });

    /**Global event that fires the first time any PopIn is shown after being loaded into the DOM, but is not yet visible. After it has fired once, it will not fire again unless the PopInShowArgs.reInitialize property is set to true.
    @param {EVUI.Modules.PopIns.PopInEventArgs} windowEventArgs The event arguments for the PopIn operation. The currentActionArgs property will be an instance of PopInShowArgs.*/
    this.onInitialize = function (windowEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onInitialize", targetPath: "onInitialize" });

    /**Global event that fires at the beginning of the show process and before the calculations for any PopIn's location are made. The PopIn is still hidden, but is present in the DOM and can be manipulated. In order for the positioning calculations in the next step to be accurate, all HTML manipulation should occur in this event.
    @param {EVUI.Modules.PopIns.PopInEventArgs} windowEventArgs The event arguments for the PopIn operation. The currentActionArgs property will be an instance of PopInShowArgs.*/
    this.onShow = function (windowEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onShow", targetPath: "onShow" });

    /**Global event that fires after the position of any PopIn has been calculated and is available to be manipulated through the calculatedPosition property of the PopInEventArgs. If the calculatedPosition or the showSettings are manipulated, the position will be recalculated (the changes made directly to the position take priority over changes made to the showSettings).
    @param {EVUI.Modules.PopIns.PopInEventArgs} windowEventArgs The event arguments for the PopIn operation. The currentActionArgs property will be an instance of PopInShowArgs.*/
    this.onPosition = function (windowEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onPosition", targetPath: "onPosition" });

    /**Global event that fires once any PopIn has been positioned, shown, and had its optional show transition applied and completed. Marks the end of the show process.
    @param {EVUI.Modules.PopIns.PopInEventArgs} windowEventArgs The event arguments for the PopIn operation. The currentActionArgs property will be an instance of PopInShowArgs.*/
    this.onShown = function (windowEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onShown", targetPath: "onShown" });

    /**Global event that fires before any PopIn has been moved from its current location and hidden. Gives the opportunity to change the hideTransition property of the PopInHideArgs and optionally trigger an unload once the PopIn has been hidden.
    @param {EVUI.Modules.PopIns.PopInEventArgs} windowEventArgs The event arguments for the PopIn operation. The currentActionArgs property will be an instance of PopInHideArgs.*/
    this.onHide = function (windowEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onHide", targetPath: "onHide" });

    /**Global event that fires after any PopIn has been moved from its current location and is now hidden and the hide transition has completed.
    @param {EVUI.Modules.PopIns.PopInEventArgs} windowEventArgs The event arguments for the PopIn operation. The currentActionArgs property will be an instance of PopInHideArgs.*/
    this.onHidden = function (windowEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onHidden", targetPath: "onHidden" });

    /**Global event that fires before any PopIn has been (potentially) removed from the DOM and had its element property reset to null.
    @param {EVUI.Modules.PopIns.PopInEventArgs} windowEventArgs The event arguments for the PopIn operation. The currentActionArgs property will be an instance of PopInUnloadArgs.*/
    this.onUnload = function (windowEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onUnload", targetPath: "onUnload" });

    /**Global event that fires after any PopIn has been (potentially) removed from the DOM and had its element property reset to null. From this point on the PopIn's element property is now settable to a new Element.
    @param {EVUI.Modules.PopIns.PopInEventArgs} windowEventArgs The event arguments for the PopIn operation. The currentActionArgs property will be an instance of PopInUnloadArgs.*/
    this.onUnloaded = function (windowEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onUnloaded", targetPath: "onUnloaded" });
}

/**Represents a UI component that behaves like a standard, centered popIn popIn with an optional backdrop by default.
 @class*/
EVUI.Modules.PopIns.PopIn = function (pane)
{
    if (pane == null) throw Error("Invalid input. Must wrap a Pane.");

    /**Object. The PopIn being wrapped by the PopIn.
    @type {EVUI.Modules.Panes.Pane}*/
    var _window = pane;

    /**String. The unique ID of this PopIn. ID's are case-insensitive.
    @type {String}*/
    this.id = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _window, { sourcePath: "id", targetPath: "id", settings: { set: false } });

    /**Object. The root Element of the PopIn. Cannot be reset once it has been assigned to via initialization or a load operation, unload the PopIn to reset it.
    @type {Element}*/
    this.element = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _window, { sourcePath: "element", targetPath: "element" });

    /**Boolean. Whether or not to unload the PopIn from the DOM when it is hidden (only applies to elements that were loaded via HTTP). False by default.
    @type {Boolean}*/
    this.unloadOnHide = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _window, { sourcePath: "unloadOnHide", targetPath: "unloadOnHide" });

    /**Object. Calculates and gets the absolute position of the PopIn.
    @type {EVUI.Modules.Dom.ElementBounds}*/
    this.currentPosition = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _window, { sourcePath: "currentPosition", targetPath: "currentPosition", settings: { set: false } });

    /**Number. Calculates and gets the Z-Index of the PopIn.
    @type {Number}*/
    this.currentZIndex = -1;
    EVUI.Modules.Core.Utils.wrapProperties(this, _window, { sourcePath: "currentZIndex", targetPath: "currentZIndex", settings: { set: false } });

    /**Boolean. Whether or not the internal state of the PopIn thinks it is visible or not. This will be true after the show process has completed and false after an unload or hide operation has been completed.
    @type {Boolean}*/
    this.isVisible = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _window, { sourcePath: "isVisible", targetPath: "isVisible", settings: { set: false } });

    /**Boolean. Whether or not the internal state of the PopIn thinks it is visible or not. This will be true after the load process has completed, even if the element was set directly before the first load operation.
    @type {Boolean}*/
    this.isLoaded = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _window, { sourcePath: "isLoaded", targetPath: "isLoaded", settings: { set: false } });

    /**Boolean. Whether or not the internal state of the PopIn thinks it has been initialized or not. This will be true after the onInitialized events fire. */
    this.isInitialized = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _window, { sourcePath: "isInitialized", targetPath: "isInitialized", settings: { set: false } });

    /**Object. Show settings for the PopIn.
    @type {EVUI.Modules.PopIns.PopInShowSettings}*/
    this.showSettings = null;

    /**Object. Settings for loading the PopIn.
    @type {EVUI.Modules.PopIns.PopInLoadSettings}*/
    this.loadSettings = null;

    /**Object. Settings for controlling what should automatically close the PopIn.
    @type {EVUI.Modules.PopIns.PopInAutoCloseSettings}*/
    this.autoCloseSettings = null;

    /**Object. Settings for controller how the PopIn should resize and move itself.
    @type {EVUI.Modules.PopIns.PopInResizeMoveSettings}*/
    this.resizeMoveSettings = null;

    /**Any. Any contextual information to attach to the PopIn object.
    @type {Any}*/
    this.context = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _window, { sourcePath: "context", targetPath: "context" });

    /**Event that fires before the load operation begins for the PopIn and is not yet in the DOM and cannot be manipulated in this stage, however the currentActionArgs.loadSettings can be manipulated to change the way the PopIn's root element will be loaded.
    @param {EVUI.Modules.PopIns.PopInEventArgs} windowEventArgs The event arguments for the PopIn operation. The currentActionArgs property will be an instance of PopInLoadArgs.*/
    this.onLoad = function (windowEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _window, { sourcePath: "onLoad", targetPath: "onLoad" });

    /**Event that fires after the load operation has completed for the PopIn and is now in the DOM and can be manipulated in this stage. From this point on the PopIn's element property cannot be reset..
    @param {EVUI.Modules.PopIns.PopInEventArgs} windowEventArgs The event arguments for the PopIn operation. The currentActionArgs property will be an instance of PopInLoadArgs.*/
    this.onLoaded = function (windowEventArgs) { };;
    EVUI.Modules.Core.Utils.wrapProperties(this, _window, { sourcePath: "onLoaded", targetPath: "onLoaded" });

    /**Event that fires the first time the PopIn is shown after being loaded into the DOM, but is not yet visible. After it has fired once, it will not fire again unless the PopInShowArgs.reInitialize property is set to true.
    @param {EVUI.Modules.PopIns.PopInEventArgs} windowEventArgs The event arguments for the PopIn operation. The currentActionArgs property will be an instance of PopInShowArgs.*/
    this.onInitialize = function (windowEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _window, { sourcePath: "onInitialize", targetPath: "onInitialize" });

    /**Event that fires at the beginning of the show process and before the calculations for the PopIn's location are made. The PopIn is still hidden, but is present in the DOM and can be manipulated. In order for the positioning calculations in the next step to be accurate, all HTML manipulation should occur in this event.
    @param {EVUI.Modules.PopIns.PopInEventArgs} windowEventArgs The event arguments for the PopIn operation. The currentActionArgs property will be an instance of PopInShowArgs.*/
    this.onShow = function (windowEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _window, { sourcePath: "onShow", targetPath: "onShow" });

    /**Event that fires after the position of the PopIn has been calculated and is available to be manipulated through the calculatedPosition property of the PopInEventArgs. If the calculatedPosition or the showSettings are manipulated, the position will be recalculated (the changes made directly to the position take priority over changes made to the showSettings).
    @param {EVUI.Modules.PopIns.PopInEventArgs} windowEventArgs The event arguments for the PopIn operation. The currentActionArgs property will be an instance of PopInShowArgs.*/
    this.onPosition = function (windowEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _window, { sourcePath: "onPosition", targetPath: "onPosition" });

    /**Event that fires once the PopIn has been positioned, shown, and had its optional show transition applied and completed. Marks the end of the show process.
    @param {EVUI.Modules.PopIns.PopInEventArgs} windowEventArgs The event arguments for the PopIn operation. The currentActionArgs property will be an instance of PopInShowArgs.*/
    this.onShown = function (windowEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _window, { sourcePath: "onShown", targetPath: "onShown" });

    /**Event that fires before the PopIn has been moved from its current location and hidden. Gives the opportunity to change the hideTransition property of the PopInHideArgs and optionally trigger an unload once the PopIn has been hidden.
    @param {EVUI.Modules.PopIns.PopInEventArgs} windowEventArgs The event arguments for the PopIn operation. The currentActionArgs property will be an instance of PopInHideArgs.*/
    this.onHide = function (windowEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _window, { sourcePath: "onHide", targetPath: "onHide" });

    /**Event that fires after the PopIn has been moved from its current location and is now hidden and the hide transition has completed.
    @param {EVUI.Modules.PopIns.PopInEventArgs} windowEventArgs The event arguments for the PopIn operation. The currentActionArgs property will be an instance of PopInHideArgs.*/
    this.onHidden = function (windowEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _window, { sourcePath: "onHidden", targetPath: "onHidden" });

    /**Event that fires before the PopIn has been (potentially) removed from the DOM and had its element property reset to null.
    @param {EVUI.Modules.PopIns.PopInEventArgs} windowEventArgs The event arguments for the PopIn operation. The currentActionArgs property will be an instance of PopInUnloadArgs.*/
    this.onUnload = function (windowEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _window, { sourcePath: "onUnload", targetPath: "onUnload" });

    /**Event that fires after the PopIn has been (potentially) removed from the DOM and had its element property reset to null. From this point on the PopIn's element property is now settable to a new Element.
    @param {EVUI.Modules.PopIns.PopInEventArgs} windowEventArgs The event arguments for the PopIn operation. The currentActionArgs property will be an instance of PopInUnloadArgs.*/
    this.onUnloaded = function (windowEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _window, { sourcePath: "onUnloaded", targetPath: "onUnloaded" });

    /**Returns a copy of the internal eventBindings array.
    @returns {EVUI.Modules.Panes.PaneEventBinding[]}*/
    this.getEventBindings = function ()
    {
        return _window.getEventBindings();
    };

    /**Adds an event response to a standard browser event to a child element of the PopIn element.
    @param {Element} element The child element of the root pane element to attach an event handler to.
    @param {EVUI.Modules.Dom.Constants.Fn_BrowserEventHandler} handler An event handler to be called when the specified events are triggered.
    @param {String|String[]} event Either a single event name, or an array of event names, or a space delineated string of event names to add.*/
    this.addEventBinding = function (element, event, handler)
    {
        return _window.addEventBinding(element, event, handler);
    };
};

/**The settings and options for showing a PopIn.
@class*/
EVUI.Modules.PopIns.PopInShowSettings = function (showSettings)
{
    /**The show settings being set by the PopInShowSettings.
    @type {EVUI.Modules.Panes.PaneShowSettings}*/
    var _showSettings = (showSettings == null || typeof showSettings !== "object") ? new EVUI.Modules.Panes.PaneShowSettings() : showSettings;
    if (_showSettings.clipSettings == null) _showSettings.clipSettings = new EVUI.Modules.Panes.PaneClipSettings();
    if (_showSettings.anchors == null) _showSettings.anchors = new EVUI.Modules.Panes.PaneAnchors();

    /**Object. The Element (or CSS selector of the Element) above the Pane whose bottom edge will be the boundary of the top of the Pane.
    @type {Element|String}*/
    this.topAnchor = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings.anchors, { sourcePath: "topAnchor", targetPath: "top" });

    /**Object. The Element (or CSS selector of the Element) to the Left of the Pane whose right edge will be the boundary of the left side of the Pane.
    @type {Element|String}*/
    this.leftAnchor = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings.anchors, { sourcePath: "leftAnchor", targetPath: "left" });

    /**Object. The Element (or CSS selector of the Element) below the Pane whose top edge will be the boundary for the bottom side of the Pane.
    @type {Element|String}*/
    this.bottomAnchor = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings.anchors, { sourcePath: "bottomAnchor", targetPath: "bottom" });

    /**Object. The Element (or CSS selector of the Element) to the right of the Pane whose left edge will be the boundary for the right side of the Pane.
    @type {Element|String}*/
    this.rightAnchor = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings.anchors, { sourcePath: "rightAnchor", targetPath: "right" });

    /**The alignment to give the X axis when it is not anchored explicitly to a left or right element. Must be a value from EVUI.Modules.Pane.PopInAnchorAlignment.
    @type {String}*/
    this.anchorAlignX = EVUI.Modules.PopIns.PopInAnchorAlignment.Elastic;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings.anchors, { sourcePath: "anchorAlignX", targetPath: "alignX" });

    /**The alignment to give the Y axis when it is not anchored explicitly to a top or bottom element. Must be a value from EVUI.Modules.Pane.PopInAnchorAlignment.
    @type {String}*/
    this.anchorAlignY = EVUI.Modules.PopIns.PopInAnchorAlignment.Elastic;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings.anchors, { sourcePath: "anchorAlignY", targetPath: "alignY" });

    /**Object. Contains the details of the CSS transition to use to show the PopIn (if a transition is desired). If omitted, the PopIn is positioned then shown by manipulating the display property directly.
    @type {EVUI.Modules.PopIns.PopInTransition}*/
    this.showTransition = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings.anchors, { sourcePath: "showTransition", targetPath: "showTransition" })

    /**Object. Contains the details of the CSS transition to use to hide the PopIn (if a transition is desired). If omitted, the PopIn is positioned then shown by manipulating the display property directly.
    @type {EVUI.Modules.PopIns.PopInTransition}*/
    this.hideTransition = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "hideTransition", targetPath: "hideTransition" })

    /**Object. An Element (or CSS selector of an Element) or an ElementBounds object describing the bounds to which the PopIn will attempt to fit inside. If omitted, the PopIn's current view port is used.
    @type {Element|EVUI.Modules.Dom.ElementBounds|String}*/
    this.clipBounds = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "clipBounds", targetPath: "clipSettings.clipBounds" })

    this.clipMode = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "clipMode", targetPath: "clipSettings.clipMode" });

    /**Boolean. Whether or not to include the height and width when positioning the element (when it is not clipped).
    @type {Boolean}*/
    this.setExplicitDimensions = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "setExplicitDimensions", targetPath: "setExplicitDimensions" })
};

/**Event arguments for the events exposed when hiding, showing, loading, or unloading a PopIn.
@class*/
EVUI.Modules.PopIns.PopInEventArgs = function (argsPackage, currentArgs)
{
    if (argsPackage == null || currentArgs == null) throw Error("Invalid arguments.")

    /**Object. The metadata about the state of the PopIn.
    @type {EVUI.Modules.Panes.PaneArgsPackage}*/
    var _argsPackage = argsPackage;

    /**The current event args for the operation.
    @type {Any}*/
    var _currentArgs = currentArgs;

    /**The PopIn that is having an action performed on it.
    @type {EVUI.Modules.Panes.PopIn}*/
    this.popIn = null;
    Object.defineProperty(this, "popIn",
        {
            get: function () { return _argsPackage.wrapper; },
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

    /**Function. Cancels the EventStream and aborts the execution of the PopIn operation.*/
    this.cancel = function () { }

    /**Function. Stops the EventStream from calling any other event handlers with the same key.*/
    this.stopPropagation = function () { };

    /**Object. The position of the PopIn that has been calculated in using the currentShowSettings.
    @type {EVUI.Modules.Panes.PanePosition}*/
    this.calculatedPosition = null;
    Object.defineProperty(this, "calculatedPosition",
        {
            get: function () { return _argsPackage.lastCalculatedPosition; },
            configurable: false,
            enumerable: true
        });

    /**Object. The PaneHide/Show/Load/Unload Arguments being used for the operation.
    @type {EVUI.Modules.PopIns.PopInShowArgs|EVUI.Modules.PopIns.PopInHideArgs|EVUI.Modules.PopIns.PopInLoadArgs|EVUI.Modules.PopIns.PopInUnloadArgs}*/
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

/**Arguments for loading a PopIn.
 @class*/
EVUI.Modules.PopIns.PopInLoadArgs = function (windowLoadArgs)
{
    /**The internal PaneLoadArgs being manipulated.
    @type {EVUI.Modules.Panes.PaneLoadArgs}*/
    var _loadArgs = (windowLoadArgs == null || typeof windowLoadArgs !== "object") ? new EVUI.Modules.Panes.PaneLoadArgs() : windowLoadArgs;

    /**String. The type of arguments contained within the object.
    @type {String}*/
    this.type = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _loadArgs, [{ sourcePath: "type", targetPath: "type" }]);

    /**Any. Any contextual information to pass into the PopIn load logic.
    @type {Any}*/
    this.context = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _loadArgs, [{ sourcePath: "context", targetPath: "context" }]);

    /**Object. The PaneLoadSettings to use if the PopIn has not already been loaded.
    @type {EVUI.Modules.PopIns.PopInLoadSettings}*/
    this.loadSettings = null;

    /**Boolean. Whether or not to re-load the PopIn.
    @type {Boolean}*/
    this.reload = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _loadArgs, [{ sourcePath: "reload", targetPath: "reload" }]);
};

/**Arguments for showing a PopIn.
@class*/
EVUI.Modules.PopIns.PopInShowArgs = function (windowShowArgs)
{
    /**The internal settings being set by the wrapper object.
    @type {EVUI.Modules.Panes.PaneShowArgs}*/
    var _windowShowArgs = (windowShowArgs == null || typeof windowShowArgs !== "object") ? new EVUI.Modules.Panes.PaneShowArgs() : windowShowArgs;

    /**String. The type of arguments contained within the object.
    @type {String}*/
    this.type = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _windowShowArgs, { sourcePath: "type", targetPath: "type", settings: { set: false } });

    /**Any. Any contextual information to pass into the PopIn show logic.
    @type {Any}*/
    this.context = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _windowShowArgs, { sourcePath: "context", targetPath: "context" });

    /**Object. The show settings for the PopIn.
    @type {EVUI.Modules.PopIns.PopInShowSettings}*/
    this.showSettings = null;

    /**Object. The load arguments for loading the PopIn if it has not already been loaded.
    @type {EVUI.Modules.PopIns.PopInLoadArgs}*/
    this.loadArgs = null;

    /**Whether or not to re-initialize the PopIn upon showing it.
    @type {Boolean}*/
    this.reInitialize = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _windowShowArgs, { sourcePath: "reInitialize", targetPath: "reInitialize" });
};

/**Arguments for hiding a PopIn.
@class*/
EVUI.Modules.PopIns.PopInHideArgs = function (windowHideArgs)
{
    /**The internal settings being set by the wrapper object.
    @type {EVUI.Modules.Panes.PaneHideArgs}*/
    var _windowHideArgs = (windowHideArgs == null || typeof windowHideArgs !== "object") ? new EVUI.Modules.Panes.PaneHideArgs() : windowHideArgs;

    /**String. The type of arguments contained within the object.
    @type {String}*/
    this.type = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _windowHideArgs, { sourcePath: "type", targetPath: "type", settings: { set: false } });

    this.context = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _windowHideArgs, { sourcePath: "context", targetPath: "context" });

    /** */
    this.popInHideTransition = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _windowHideArgs, { sourcePath: "popInHideTransition", targetPath: "windowHideTransition" });

    this.unloadArgs = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _windowHideArgs, { sourcePath: "unloadArgs", targetPath: "unloadArgs" });
};

/**Arguments for unloading a PopIn.
@class*/
EVUI.Modules.PopIns.PopInUnloadArgs = function (windowUnloadArgs)
{
    /**The internal settings being set by the wrapper object.
    @type {EVUI.Modules.Panes.PaneUnloadArgs}*/
    var _windowUnloadArgs = (windowUnloadArgs == null || typeof windowUnloadArgs !== "object") ? new EVUI.Modules.Panes.PaneUnloadArgs() : windowUnloadArgs;

    /**String. The type of arguments contained within the object.
    @type {String}*/
    this.type = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _windowUnloadArgs, { sourcePath: "type", targetPath: "type", settings: { set: false } });

    /**Any. Any contextual information to pass into the PopIn hide logic.
    @type {Any}*/
    this.context = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _windowUnloadArgs, { sourcePath: "context", targetPath: "context" });

    /**Boolean. Whether or not to remove the PopIn from the DOM once it has been unloaded.
    @type {Boolean}*/
    this.remove = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _windowUnloadArgs, { sourcePath: "remove", targetPath: "remove" });
};

/**Represents a transition effect that can be applied to a PopIn when its position or size changes.
@class*/
EVUI.Modules.PopIns.PopInTransition = function ()
{
    /**Object or String. Either class names, a string of CSS rules (without a selector), or an object of key-value pairs of CSS properties to generate a runtime CSS class for.
    @type {Object|String}*/
    this.css = null;

    /**String. CSS definition for a keyframe animation to apply. Note that the keyframe animation's name must appear in the PaneTransition.css property in order to be applied.
    @type {String|Object}*/
    this.keyframes = null;

    /**The duration (in milliseconds) of the transition so that the OnShown/OnHidden events are only fired once the transition is complete.
    @type {Number}*/
    this.duration = 0;
};

/**Settings and options for loading a PopIn.
@class */
EVUI.Modules.PopIns.PopInLoadSettings = function (windowLoadSettings)
{
    var _windowLoadSettings = (windowLoadSettings == null || typeof windowLoadSettings !== "object") ? new EVUI.Modules.Panes.PaneLoadSettings() : windowLoadSettings;

    /**Object. The Element to show as the PopIn.
    @type {Element}*/
    this.element = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _windowLoadSettings, { sourcePath: "element", targetPath: "element" });

    /**String. A CSS selector that is used to go find the Element to show as the PopIn. Only the first result is used.
    @type {String}*/
    this.selector = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _windowLoadSettings, { sourcePath: "selector", targetPath: "selector" });

    /**Object. If using a CSS selector to find the root element of a PopIn, this is the context limiting element to search inside of.
    @type {Element}*/
    this.contextElement = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _windowLoadSettings, { sourcePath: "contextElement", targetPath: "contextElement" });

    /**Object. HttpRequestArgs for making a Http request to go get the PopIn's HTML.
    @type {EVUI.Modules.Http.HttpRequestArgs}*/
    this.httpLoadArgs = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _windowLoadSettings, { sourcePath: "httpLoadArgs", targetPath: "httpLoadArgs" });

    /**Object. PlaceholderLoadArgs for making a series of Http requests to load the PopIn as an existing placeholder.
    @type {EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadArgs}*/
    this.placeholderLoadArgs = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _windowLoadSettings, { sourcePath: "placeholderLoadArgs", targetPath: "placeholderLoadArgs" });
};


/**Object for containing information about how the Pane can be resized in response to user action.
@class*/
EVUI.Modules.PopIns.PopInResizeMoveSettings = function (resizeMoveSettings)
{
    var _resizeMoveSettings = (resizeMoveSettings == null || typeof resizeMoveSettings !== "object") ? new EVUI.Modules.Panes.PaneResizeMoveSettings() : resizeMoveSettings;

    /**Boolean. Whether or not the top portion of the Y axis can be resized. True by default.
    @type {Boolean}*/
    this.canResizeTop = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _resizeMoveSettings, { sourcePath: "canResizeTop", targetPath: "canResizeTop" });

    /**Boolean. Whether or not the bottom portion of the Y axis can be resized. True by default.
    @type {Boolean}*/
    this.canResizeBottom = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _resizeMoveSettings, { sourcePath: "canResizeBottom", targetPath: "canResizeBottom" });

    /**Boolean. Whether or not the left portion of the X axis can be resized. True by default.
    @type {Boolean}*/
    this.canResizeLeft = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _resizeMoveSettings, { sourcePath: "canResizeLeft", targetPath: "canResizeLeft" });

    /**Boolean. Whether or not the right portion of the X axis can be resized. True by default.
    @type {Boolean}*/
    this.canResizeRight = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _resizeMoveSettings, { sourcePath: "canResizeRight", targetPath: "canResizeRight" });

    /**Number. The width in pixels of the margin around the edges of the Pane's root element that will be the clickable zone for triggering a resize operation (in pixels). 15 by default.
    @type {Numner}*/
    this.dragHanldeMargin = 15;
    EVUI.Modules.Core.Utils.wrapProperties(this, _resizeMoveSettings, { sourcePath: "dragHanldeMargin", targetPath: "dragHanldeMargin" });

    /**Boolean. Whether or not the dimensions of any resized elements in a Pane will be restored to their original size when the Pane is hidden. True by default.
    @type {Boolean}*/
    this.restoreDefaultOnHide = true;
    EVUI.Modules.Core.Utils.wrapProperties(this, _resizeMoveSettings, { sourcePath: "restoreDefaultOnHide", targetPath: "restoreDefaultOnHide" });
};


/**Controls the alignment along the X or Y axis when it would otherwise be ambiguous when only anchored to elements on the opposite axis.
@enum*/
EVUI.Modules.PopIns.PopInAnchorAlignment =
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
Object.freeze(EVUI.Modules.PopIns.PopInAnchorAlignment);

/**Enum for indicating what type of arguments object the PopInEventArgs.currentArguments property is.
@enum*/
EVUI.Modules.PopIns.PopInArgumentType =
{
    /**Arguments are PopInShowArgs.*/
    Show: "show",
    /**Arguments are PopInHideArgs.*/
    Hide: "hide",
    /**Arguments are PopInLoadArgs.*/
    Load: "load",
    /**Arguments are PopInUnloadArgs.*/
    Unload: "unload",
    /**Arguments are PopInMoveResizeArgs.*/
    MoveResize: "moveResize"
};
Object.freeze(EVUI.Modules.PopIns.PopInArgumentType);

/**Enum for indicating the behavior of the PopIn when it overflows its clipBounds.
@enum*/
EVUI.Modules.PopIns.PopInClipMode =
{
    /**When the calculated position of the PopIn overflows the clipBounds, it will not be cropped to stay within the clipBounds and will overflow to the outside of the clip bounds.*/
    Overflow: "overflow",
    /**When the calculated position of the PopIn overflows the clipBounds, it will be clipped to the maximum dimensions of the clipBounds on the overflowing axes.*/
    Clip: "clip",
    /**When the calculated position of the PopIn overflows the clipBounds, it will be shifted in the opposite directions as the overflow to fit within the clipBounds.*/
    Shift: "shift",
};
Object.freeze(EVUI.Modules.PopIns.PopInClipMode);

/**Object to inject the standard dependencies used by the PopInController into it via its constructor.
@class*/
EVUI.Modules.PopIns.PopInControllerServices = function ()
{
    /**Object. An instance of Http module's HttpManager object.
    @type {EVUI.Modules.Http.HttpManager}*/
    this.httpManager = null;

    /**Object. An instance of the HtmlLoaderController module's HtmlLoaderController object.
    @type {EVUI.Modules.HtmlLoader.HtmlLoaderController}*/
    this.htmlLoader = null;

    /**Object. An instance of the Styles module's StylesheetManager object.
    @type {EVUI.Modules.Styles.StyleSheetManager}*/
    this.stylesheetManager = null;

    /**Object. An instance of the Panes module's PaneManager object.
    @type {EVUI.Modules.Panes.PaneManager}*/
    this.panesManager = null;
};

/**Global instance of the PopInManager, used for creating and using simple popIns that are positioned relative to a point or another element.
@type {EVUI.Modules.PopIns.PopInManager}*/
EVUI.Modules.PopIns.Manager = null;
(function ()
{
    var ctor = EVUI.Modules.PopIns.PopInManager;
    var manager = null;

    Object.defineProperty(EVUI.Modules.PopIns, "Manager", {
        get: function ()
        {
            if (manager == null) manager = new ctor();
            return manager;
        },
        enumerable: true,
        configurable: false
    });
})();

Object.freeze(EVUI.Modules.PopIns);

delete $evui.popIns;

/**Global instance of the PopInManager, used for creating and using simple popIns that are positioned relative to a point or another element.
@type {EVUI.Modules.PopIns.PopInManager}*/
$evui.popIns = null;
Object.defineProperty($evui, "popIns", {
    get: function () { return EVUI.Modules.PopIns.Manager; },
    enumerable: true
});

/**Adds a PopIn to the WidowManager.
@param {EVUI.Modules.PopIns.PopIn} yoloPopIn A YOLO object representing a PopIn object. This object is copied onto a real PopIn object is then discarded.
@returns {EVUI.Modules.PopIns.PopIn}*/
$evui.addPopIn = function (yoloPopIn)
{
    return $evui.popIns.addPopIn(yoloPopIn);
};

/**Shows (and loads, if necessary or if a reload is requested) a PopIn asynchronously. Provides a callback that is called call once the PopIn operation has completed successfully or otherwise.
@param {EVUI.Modules.PopIns.PopIn|String} popInOrID Either a YOLO PopIn object to extend into the existing PopIn, the real PopIn reference, or the string ID of the PopIn to show.
@param {EVUI.Modules.PopIns.PopInShowArgs|EVUI.Modules.PopIns.Constants.Fn_PopInOperationCallback} popInShowArgs Optional. A YOLO object representing the arguments for showing the PopIn, or the callback. If omitted or passed as a function, the PopIn's existing show/load settings are used instead.
@param {EVUI.Modules.PopIns.Constants.Fn_PopInOperationCallback} callback Optional. A callback that is called once the operation completes.*/
$evui.showPopIn = function (popInOrID, popInShowArgs, callback)
{
    return $evui.popIns.showPopIn(popInOrID, popInShowArgs, callback);
};

/**Awaitable. (and loads, if necessary or if a reload is requested) a PopIn asynchronously.
@param {EVUI.Modules.PopIns.PopIn|String} popInOrID Either a YOLO PopIn object to extend into the existing PopIn, the real PopIn reference, or the string ID of the PopIn to show.
@param {EVUI.Modules.PopIns.PopInShowArgs} popInShowArgs Optional.  A YOLO object representing the arguments for showing the PopIn. If omitted, the PopIn's existing show/load settings are used instead.
@returns {Promise<Boolean>}*/
$evui.showPopInAsync = function (popInOrID, popInShowArgs)
{
    return $evui.popIns.showPopInAsync(popInOrID, popInShowArgs);
};

/**Hides (and unloads if requested) a PopIn asynchronously. Provides a callback that is called call once the PopIn operation has completed successfully or otherwise.
@param {EVUI.Modules.PopIns.PopIn|String} popInOrID Either a YOLO PopIn object to extend into the existing PopIn, the real PopIn reference, or the string ID of the PopIn to hide.
@param {EVUI.Modules.PopIns.PopInHideArgs|EVUI.Modules.PopIns.Constants.Fn_PopInOperationCallback} popInHideArgs Optional.  A YOLO object representing the arguments for hiding a PopIn or the callback. If omitted or passed as a function, the PopIn's existing hide/unload settings are used instead.
@param {EVUI.Modules.PopIns.Constants.Fn_PopInOperationCallback} callback Optional. A callback that is called once the operation completes.*/
$evui.hidePopIn = function (popInOrID, popInHideArgs, callback)
{
    return $evui.popIns.hidePopIn(popInOrID, popInHideArgs, callback);
};

/**Awaitable. Hides (and unloads if requested) a PopIn asynchronously. Provides a callback that is called call once the PopIn operation has completed successfully or otherwise.
@param {EVUI.Modules.PopIns.PopIn|String} popInOrID Either a YOLO PopIn object to extend into the existing PopIn, the real PopIn reference, or the string ID of the PopIn to hide.
@param {EVUI.Modules.PopIns.PopInHideArgs} popInHideArgs Optional.  A YOLO object representing the arguments for hiding a PopIn. If omitted, the PopIn's existing hide/unload settings are used instead.
@returns {Promise<Boolean>}*/
$evui.hidePopInAsync = function (popInOrID, popInHideArgs)
{
    return $evui.popIns.hidePopInAsync(popInOrID, popInHideArgs);
};

/*#ENDWRAP(PopIn)#*/