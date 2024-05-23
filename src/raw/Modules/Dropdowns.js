/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

/*#INCLUDES#*/

/*#BEGINWRAP(EVUI.Modules.Dropdown|Drop)#*/
/*#REPLACE(EVUI.Modules.Dropdown|Drop)#*/

/**Module that uses the Pane module to create pre-configured drop-down menus.
@module*/
EVUI.Modules.Dropdowns = {};

/*#MODULEDEF(Drop|"1.0";|"Dropdown")#*/
/*#VERSIONCHECK(EVUI.Modules.Dropdown|Drop)#*/

EVUI.Modules.Dropdowns.Dependencies =
{
    Core: Object.freeze({ version: "1.0", required: true }),
    Panes: Object.freeze({ version: "1.0", required: true })
};

(function ()
{
    var checked = false;

    Object.defineProperty(EVUI.Modules.Dropdowns.Dependencies, "checked",
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

Object.freeze(EVUI.Modules.Dropdowns.Dependencies);

EVUI.Modules.Dropdowns.Constants = {};

/**Function for selecting a PaneEntry object. Return true to select the PaneEntry parameter as part of the result set.
@param {EVUI.Modules.Dropdowns.Dropdown} dropdown The PaneEntry providing metadata about a Dropdown object.
@returns {Boolean}*/
EVUI.Modules.Dropdowns.Constants.Fn_DropdownSelector = function (dropdown) { return true; }

/**Function for reporting whether or not a Dropdown was successfully Loaded.
@param {Boolean} success Whether or not the load operation completed successfully.*/
EVUI.Modules.Dropdowns.Constants.Fn_LoadCallback = function (success) { };

/**Function for reporting whether or not an operation Dropdown was successful.
@param {Boolean} success Whether or not the operation completed successfully.*/
EVUI.Modules.Dropdowns.Constants.Fn_DropdownOperationCallback = function (success) { };

EVUI.Modules.Dropdowns.Constants.CSS_Position = "evui-position";
EVUI.Modules.Dropdowns.Constants.CSS_ClippedX = "evui-clipped-x";
EVUI.Modules.Dropdowns.Constants.CSS_ClippedY = "evui-clipped-y";
EVUI.Modules.Dropdowns.Constants.CSS_ScrollX = "evui-scroll-x";
EVUI.Modules.Dropdowns.Constants.CSS_ScrollY = "evui-scroll-y"
EVUI.Modules.Dropdowns.Constants.CSS_Flipped = "evui-flipped";
EVUI.Modules.Dropdowns.Constants.CSS_Transition_Show = "evui-transition-show";
EVUI.Modules.Dropdowns.Constants.CSS_Transition_Hide = "evui-transition-hide";

/**String. The name of the ID attribute for the Dropdown, used to look up a definition of a Dropdown.
@type {String}*/
EVUI.Modules.Dropdowns.Constants.Attribute_ID = "evui-dd-id";

/**String. The name of the attribute that signifies which element should receive initial focus when the Dropdown is displayed.
@type {String}*/
EVUI.Modules.Dropdowns.Constants.Attribute_Focus = "evui-dd-focus";

/**String. The name of the attribute that signifies that a click event on the Element should close the Dropdown.
@type {String}*/
EVUI.Modules.Dropdowns.Constants.Attribute_Close = "evui-dd-close";

/**String. The name of the attribute that signifies that a drag event on the Element should move the Dropdown.
@type {String}*/
EVUI.Modules.Dropdowns.Constants.Attribute_Drag = "evui-dd-drag-handle";

/**String. The name of the attribute on an element that triggers the showing of a Dropdown what the URL to get the Dropdown's HTML from is (Requires EVUI.Modules.Http).
@type {String}*/
EVUI.Modules.Dropdowns.Constants.Attribute_SourceURL = "evui-dd-src";

/**String. The name of the attribute on an element that triggers the showing of a Dropdown of what placeholder to load for the Dropdown's HTML (Requires EVUI.Modules.HtmlLoaderController).
@type {String}*/
EVUI.Modules.Dropdowns.Constants.Attribute_PlaceholderID = "evui-dd-placeholder-id";

/**String. The name of the attribute on an element that triggers the showing or hiding of a Dropdown whether or not the Dropdown should be unloaded when it is hidden.
@type {String}*/
EVUI.Modules.Dropdowns.Constants.Attribute_UnloadOnHide = "evui-dd-unload";

/**String. The name of the attribute on an element that triggers the showing or hiding of a Dropdown that is used to indicate special behavior as defined by a consumer of the Dropdown.
@type {String}*/
EVUI.Modules.Dropdowns.Constants.Attribute_Context = "evui-dd-cxt";

/**String. The name of the attribute on an element that triggers the showing of a Dropdown what CSS selector to use to find the element to show as the Dropdown. Only the first result will be used.
@type {String}*/
EVUI.Modules.Dropdowns.Constants.Attribute_Selector = "evui-dd-selector";

/**String. The name of the attribute that controls the orientation of the dropdown. The value must be a combination of values from the DropdownOrientation enum.
@type {String}*/
EVUI.Modules.Dropdowns.Constants.Attribute_Orientation = "evui-dd-orientation";

/**String. The name of the attribute that controls the orientation of the dropdown. The value must be a value from the DopdownAlignment enum.
@type {String}*/
EVUI.Modules.Dropdowns.Constants.Attribute_Alignment = "evui-dd-alignment"

/**String. The name of the attribute that controls what the dropdown will use to orient itself around. Must be a value from the DropdownMode enum.
@type {String}*/
EVUI.Modules.Dropdowns.Constants.Attribute_DropMode = "evui-dd-mode"

EVUI.Modules.Dropdowns.Constants.Default_ObjectName = "Dropdown";
EVUI.Modules.Dropdowns.Constants.Default_ManagerName = "DropdownManager";
EVUI.Modules.Dropdowns.Constants.Default_CssPrefix = "evui-dd";
EVUI.Modules.Dropdowns.Constants.Default_StepPrefix = "evui.dd";
EVUI.Modules.Dropdowns.Constants.Default_AttributePrefix = "evui-dd";

Object.freeze(EVUI.Modules.Dropdowns.Constants);

/**Class for managing Dropdown objects.
@param {EVUI.Modules.Dropdowns.DropdownControllerServices} services Optional service dependencies to inject into the Dropdown manager.
@class*/
EVUI.Modules.Dropdowns.DropdownManager = function (services)
{
    if (EVUI.Modules.Core == null) throw Error("Dependency missing: EVUI.Modules.Core is required.");
    EVUI.Modules.Core.Utils.requireAll(EVUI.Modules.Dropdowns.Dependencies);

    var _self = this; //self-reference for closures

    /**The internal PaneManager of the DropdownManager.
    @type {EVUI.Modules.Panes.PaneManager}*/
    var _manager = null;

    /**The settings overrides for the DropdownManager.
    @type {EVUI.Modules.Panes.PaneManagerSettings}*/
    var _settings = null;

    /**Adds a Dropdown to the WidowManager.
    @param {EVUI.Modules.Dropdowns.Dropdown} dropdown A YOLO object representing a Dropdown object. This object is copied onto a real Dropdown object is then discarded.
    @returns {EVUI.Modules.Dropdowns.Dropdown}*/
    this.addDropdown = function (dropdown)
    {
        if (dropdown == null) throw Error(_settings.objectName + " cannot be null.");
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(dropdown.id) === true) throw Error(_settings.objectName + "must have an id that is a non-whitespace string.");

        var existing = _settings.getPaneEntry(dropdown.id);
        if (existing != null) throw Error("A " + _settings.objectName + " with an id of \"" + dropdown.id + "\" already exists.");

        _manager.addPane(getDefaultPane(dropdown));

        existing = _settings.getPaneEntry(dropdown.id);
        return existing.wrapper;       
    };

    /**Removes a Dropdown from the DropdownManager. Does not unload the Dropdown's element from the DOM.
    @param {EVUI.Modules.Dropdowns.Dropdown|String} dropdownOrID
    @returns {Boolean}*/
    this.removeDropdown = function (dropdownOrID)
    {
        return _manager.removePane(dropdownOrID);
    };

    /**Gets a DropdownEntry object based on its ID or a selector function.
    @param {EVUI.Modules.Dropdowns.Constants.Fn_DropdownSelector|String} dropdownIDOrSelector A selector function to select a Dropdown object (or multiple DropdownEntry objects) or the ID of the Dropdown to get the DropdownEntry for.
    @param {Boolean} getAllMatches If a selector function is provided, all the DropdownEntries that satisfy the selector are included. Otherwise a single DropdownEntry object is returned. False by default.
    @returns {EVUI.Modules.Dropdowns.Dropdown|EVUI.Modules.Dropdowns.Dropdown[]} */
    this.getDropdown = function (dropdownIDOrSelector, getAllMatches)
    {
        var entries = null;

        if (typeof dropdownIDOrSelector === "function")
        {
            entries = _settings.getPaneEntry(function () { return true; }, true).map(function (entry) { return entry.wrapper; }).filter(dropdownIDOrSelector);
            if (getAllMatches !== true && entries != null) return entries[0];
            return entries;
        }
        else
        {
            entries = _settings.getPaneEntry(dropdownIDOrSelector, getAllMatches);
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

    /**Indicates whether or not a Dropdown has been shown and is visible in the DOM.
    @param {String} dropdownId
    @returns {Boolean}*/
    this.isDropdownActive = function (dropdownId)
    {
        var dropdown = this.getDropdown(dropdownId);
        if (dropdown == null) return false;

        return dropdown.isVisible;
    };

    /**Gets an array of all the Dropdowns that are currently shown and are visible in the DOM.
    @returns {EVUI.Modules.Dropdowns.Dropdown[]}*/
    this.getActiveDropdowns = function ()
    {
        return this.getDropdown(function (dropdown) { return dropdown.isVisible; }, true)
    };

    /**Gets all the active Dropdowns registered with this controller.
    @returns {EVUI.Modules.Dropdowns.Dropdown[]}*/
    this.getDropdowns = function ()
    {
        return this.getDropdown(function () { return true }, true);
    };

    /**Shows (and loads, if necessary or if a reload is requested) a Dropdown asynchronously. Provides a callback that is called once the Dropdown operation has completed successfully or otherwise.
    @param {EVUI.Modules.Dropdowns.Dropdown|String} dropdownOrID Either a YOLO Dropdown object to extend into the existing Dropdown, the real Dropdown reference, or the string ID of the Dropdown to show.
    @param {EVUI.Modules.Dropdowns.DropdownShowArgs|EVUI.Modules.Dropdowns.Constants.Fn_DropdownOperationCallback} dropdownShowArgs Optional.  The arguments for showing the Dropdown, or the callback. If omitted or passed as a function, the Dropdown's existing show/load settings are used instead.
    @param {EVUI.Modules.Dropdowns.Constants.Fn_DropdownOperationCallback} callback Optional. A callback that is called once the operation completes.*/
    this.showDropdown = function (dropdownOrID, dropdownShowArgs, callback)
    {
        var entry = getDropdownAmbiguously(dropdownOrID, true);

        var paneShowArgs = new EVUI.Modules.Panes.PaneShowArgs();
        paneShowArgs.showSettings = _settings.cloneShowSettings(entry.pane.showSettings);
        paneShowArgs.loadArgs = new EVUI.Modules.Panes.PaneLoadArgs();
        paneShowArgs.loadArgs.loadSettings = _settings.cloneLoadSettings(entry.pane.loadSettings);

        if (typeof dropdownShowArgs === "function")
        {
            callback = dropdownShowArgs;
            dropdownShowArgs = null;
        }
        else if (dropdownShowArgs != null && typeof dropdownShowArgs === "object")
        {
            dropdownShowArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Dropdowns.DropdownShowArgs(paneShowArgs), dropdownShowArgs, ["type"]);
            if (dropdownShowArgs.showSettings != null)
            {
                dropdownShowArgs.showSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Dropdowns.DropdownShowSettings(paneShowArgs.showSettings), dropdownShowArgs.showSettings);
            }
            else
            {
                dropdownShowArgs.showSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Dropdowns.DropdownShowSettings(paneShowArgs.showSettings), entry.wrapper.showSettings);
            }


            if (dropdownShowArgs.loadArgs != null && dropdownShowArgs.loadArgs.loadSettings != null)
            {
                dropdownShowArgs.loadArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Dropdowns.DropdownLoadArgs(paneShowArgs.loadArgs), dropdownShowArgs.loadArgs, ["type"]);
                dropdownShowArgs.loadArgs.loadSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Dropdowns.DropdownLoadSettings(paneShowArgs.loadArgs.loadSettings), dropdownShowArgs.loadArgs.loadSettings);
            }
            else
            {
                dropdownShowArgs.loadArgs = new EVUI.Modules.Dropdowns.DropdownLoadArgs(paneShowArgs.loadArgs);
                dropdownShowArgs.loadArgs.loadSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Dropdowns.DropdownLoadSettings(paneShowArgs.loadArgs.loadSettings), entry.wrapper.loadSettings, ["type"]); ;
            }
        }
        else
        {
            dropdownShowArgs = null;
        }

        if (dropdownShowArgs == null)
        {
            dropdownShowArgs = new EVUI.Modules.Dropdowns.DropdownShowArgs(paneShowArgs);
            dropdownShowArgs.showSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Dropdowns.DropdownShowSettings(paneShowArgs.showSettings), entry.wrapper.showSettings);
            dropdownShowArgs.loadArgs = new EVUI.Modules.Dropdowns.DropdownLoadArgs(paneShowArgs.loadArgs);
            dropdownShowArgs.loadArgs.loadSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Dropdowns.DropdownLoadSettings(paneShowArgs.loadArgs.loadSettings), entry.wrapper.loadSettings);
        }

        _settings.currentActionArgs = makeCurrentActionArgs(dropdownShowArgs);

        _manager.showPane(entry.pane.id, paneShowArgs, callback);
    };

    /**Awaitable. (and loads, if necessary or if a reload is requested) a Dropdown asynchronously.
    @param {EVUI.Modules.Dropdowns.Dropdown|String} dropdownOrID Either a YOLO Dropdown object to extend into the existing Dropdown, the real Dropdown reference, or the string ID of the Dropdown to show.
    @param {EVUI.Modules.Dropdowns.DropdownShowArgs} dropdownShowArgs Optional.  A YOLO object representing the arguments for showing the Dropdown. If omitted, the Dropdown's existing show/load settings are used instead.
    @returns {Promise<Boolean>}*/
    this.showDropdownAsync = function (dropdownOrID, dropdownShowArgs)
    {
        return new Promise(function (resolve)
        {
            _self.showDropdown(dropdownOrID, dropdownShowArgs, function (success)
            {
                resolve(success);
            });
        });
    };

    /**Hides (and unloads if requested) a Dropdown asynchronously. Provides a callback that is called call once the Dropdown operation has completed successfully or otherwise.
    @param {EVUI.Modules.Dropdowns.Dropdown|String} dropdownOrID Either a YOLO Dropdown object to extend into the existing Dropdown, the real Dropdown reference, or the string ID of the Dropdown to hide.
    @param {EVUI.Modules.Dropdowns.DropdownHideArgs|EVUI.Modules.Dropdowns.Constants.Fn_DropdownOperationCallback} dropdownHideArgs Optional. A YOLO object representing arguments for hiding a Dropdown or a callback. If omitted or passed as a function, the Dropdown's existing hide/unload settings are used instead.
    @param {EVUI.Modules.Dropdowns.Constants.Fn_DropdownOperationCallback} callback Optional. A callback that is called once the operation completes.*/
    this.hideDropdown = function (dropdownOrID, dropdownHideArgs, callback)
    {
        var entry = getDropdownAmbiguously(dropdownOrID);

        var paneHideArgs = new EVUI.Modules.Panes.PaneHideArgs();
        paneHideArgs.unloadArgs = new EVUI.Modules.Panes.PaneUnloadArgs();

        if (typeof dropdownHideArgs === "function")
        {
            callback = dropdownHideArgs;
            dropdownHideArgs = null;
        }
        else if (dropdownHideArgs != null && typeof dropdownHideArgs === "object")
        {
            dropdownHideArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Dropdowns.DropdownHideArgs(paneHideArgs), dropdownHideArgs, ["type"]);
            dropdownHideArgs.unloadArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Dropdowns.DropdownUnloadArgs(paneHideArgs.unloadArgs, dropdownHideArgs.unloadArgs));
        }
        else
        {
            dropdownHideArgs = null;
        }


        if (dropdownHideArgs == null)
        {
            dropdownHideArgs = new EVUI.Modules.Dropdowns.DropdownHideArgs(paneHideArgs);
            dropdownHideArgs.unloadArgs = new EVUI.Modules.DropdownUnloadArgs(paneHideArgs.unloadArgs);
        }

        _settings.currentActionArgs = makeCurrentActionArgs(dropdownHideArgs);
        _manager.hidePane(entry.pane.id, paneHideArgs, callback);
    };

    /**Awaitable. Hides (and unloads if requested) a Dropdown asynchronously.
    @param {EVUI.Modules.Dropdowns.Dropdown|String} dropdownOrID Either a YOLO Dropdown object to extend into the existing Dropdown, the real Dropdown reference, or the string ID of the Dropdown to hide.
    @param {EVUI.Modules.Dropdowns.DropdownHideArgs} dropdownHideArgs Optional. A YOLO object representing the arguments for hiding a Dropdown. If omitted, the Dropdown's existing hide/unload settings are used instead.
    @returns {Promise<Boolean>}*/
    this.hideDropdownAsync = function (dropdownOrID, dropdownHideArgs)
    {
        return new Promise(function (resolve)
        {
            _self.hideDropdown(dropdownOrID, dropdownHideArgs, function (success)
            {
                resolve(success);
            });
        });
    };

    /**Hides all visible Dropdowns asynchronously. Provides a callback function that is called once all the visible Dropdowns have been hidden.
    @param {EVUI.Modules.Panes.DropdownHideArgs} dropdownHideArgs Optional. A YOLO object representing the arguments for hiding a Dropdown. If omitted, the Dropdown's existing hide/unload settings are used instead.
    @param {EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} callback The callback that is called once all the Dropdown's hide operations have completed.*/
    this.hideAllDropdowns = function (dropdownHideArgs, callback)
    {
        if (typeof callback !== "function") callback = function () { };
        var allVisible = this.getDropdown(function (dd) { return dd.isVisible; }, true);
        var numVisible = allVisible.length;
        var numHidden = 0;

        if (numVisible === 0) return callback(true);

        for (var x = 0; x < numVisible; x++)
        {
            this.hideDropdown(allVisible[x], dropdownHideArgs, function ()
            {
                numHidden++;
                if (numHidden === numVisible)
                {
                    return callback(true);
                }
            });
        }
    };

    /**Awaitable. Hides all Dropdowns asynchronously.
    @param {EVUI.Modules.Panes.PaneHideArgs} paneHideArgs Optional. A YOLO object representing the arguments for hiding a Dropdown. If omitted, the Dropdown's existing hide/unload settings are used instead.
    @returns {Promise<Boolean>} */
    this.hideAllDropdownsAsync = function (paneHideArgs)
    {
        return new Promise(function (resolve)
        {
            _self.hideAllDropdowns(paneHideArgs, function (success)
            {
                resolve(success);
            });
        });
    };

    /**Asynchronously loads a Dropdown. Provides a callback that is called after the operation has completed successfully or otherwise.
    @param {EVUI.Modules.Dropdowns.Dropdown|String} dropdownOrID Either a YOLO Dropdown object to extend into the existing Dropdown, the real Dropdown reference, or the string ID of the Dropdown to load.
    @param {EVUI.Modules.Dropdowns.DropdownLoadArgs|EVUI.Modules.Dropdowns.Constants.Fn_DropdownOperationCallback} dropdownLoadArgs Optional. A YOLO object representing arguments for loading a Dropdown or a callback. If omitted or passed as a function, the Dropdown's existing load settings are used instead.
    @param {EVUI.Modules.Dropdowns.Constants.Fn_DropdownOperationCallback} callback Optional. A callback to call once the operation completes.*/
    this.loadDropdown = function (dropdownOrID, dropdownLoadArgs, callback)
    {
        var entry = getDropdownAmbiguously(dropdownOrID, false);

        var paneLoadArgs = new EVUI.Modules.Panes.PaneLoadArgs();
        paneLoadArgs.loadSettings = _settings.cloneLoadSettings(entry.pane.loadSettings);

        if (typeof dropdownLoadArgs === "function")
        {
            callback = dropdownLoadArgs;
            dropdownLoadArgs = null;
        }
        else if (dropdownLoadArgs != null && typeof dropdownLoadArgs === "object")
        {
            dropdownLoadArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Dropdowns.DropdownLoadArgs(paneLoadArgs), dropdownLoadArgs, ["type"]);
            if (dropdownLoadArgs.loadSettings != null)
            {
                dropdownLoadArgs.loadSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Dropdowns.DropdownLoadSettings(paneLoadArgs.loadSettings), dropdownLoadArgs.loadSettings);
            }
            else
            {
                dropdownLoadArgs.loadSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Dropdowns.DropdownLoadSettings(paneLoadArgs.loadSettings), entry.wrapper.loadSettings);
            }
        }
        else
        {
            dropdownLoadArgs = null;
        }

        if (dropdownLoadArgs == null)
        {
            dropdownLoadArgs = new EVUI.Modules.Dropdowns.DropdownLoadArgs(paneLoadArgs);
            dropdownLoadArgs.loadSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Dropdowns.DropdownLoadSettings(paneLoadArgs.loadSettings), entry.wrapper.loadSettings);
        }

        _settings.currentActionArgs = makeCurrentActionArgs(dropdownLoadArgs);
        _manager.loadPane(entry.pane.id, paneLoadArgs, callback);
    };

    /**Awaitable. Asynchronously loads a Dropdown.
    @param {EVUI.Modules.Dropdowns.Dropdown|String} dropdownOrID Either a YOLO Dropdown object to extend into the existing Dropdown, the real Dropdown reference, or the string ID of the Dropdown to load.
    @param {EVUI.Modules.Dropdowns.DropdownLoadArgs} dropdownLoadArgs Optional. A YOLO object representing arguments for loading a Dropdown.
    @returns {Promise<Boolean>}*/
    this.loadDropdownAsync = function (dropdownOrID, dropdownLoadArgs)
    {
        return new Promise(function (resolve)
        {
            _self.loadDropdown(dropdownOrID, dropdownLoadArgs, function (success)
            {
                resolve(success);
            });
        });
    };

    /**Asynchronously unloads a Dropdown, which disconnects the Dropdown's element and removes it from the DOM if it was loaded remotely. Provides a callback that is called after the operation has completed successfully or otherwise.
    @param {EVUI.Modules.Dropdowns.Dropdown|String} dropdownOrID Either a YOLO Dropdown object to extend into the existing Dropdown, the real Dropdown reference, or the string ID of the Dropdown to unload.
    @param {EVUI.Modules.Dropdowns.DropdownUnloadArgs|EVUI.Modules.Dropdowns.Constants.Fn_DropdownOperationCallback} dropdownUnloadArgs Optional. A YOLO object representing arguments for unloading a Dropdown or a callback. If omitted or passed as a function, the Dropdown's existing unload settings are used instead.
    @param {EVUI.Modules.Dropdowns.Constants.Fn_DropdownOperationCallback} callback Optional. A callback to call once the operation completes.*/
    this.unloadDropdown = function (dropdownOrID, dropdownUnloadArgs, callback)
    {
        var entry = getDropdownAmbiguously(dropdownOrID);
        var paneUnloadArgs = new EVUI.Modules.Panes.PaneUnloadArgs();

        if (typeof dropdownUnloadArgs === "function")
        {
            callback = dropdownUnloadArgs;
            dropdownUnloadArgs = null;
        }
        else if (dropdownUnloadArgs != null && typeof dropdownUnloadArgs === "object")
        {
            dropdownUnloadArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Dropdowns.DropdownUnloadArgs(paneUnloadArgs), dropdownUnloadArgs);
        }
        else
        {
            dropdownUnloadArgs = null;
        }

        if (dropdownUnloadArgs == null)
        {
            dropdownUnloadArgs = new EVUI.Modules.Dropdowns.DropdownUnloadArgs(paneUnloadArgs);
        }

        _settings.currentActionArgs = makeCurrentActionArgs(dropdownUnloadArgs);
        _manager.unloadPane(entry.pane.id, paneUnloadArgs, callback);
    };

    /**Awaitable. Asynchronously unloads a Dropdown, which disconnects the Dropdown's element and removes it from the DOM if it was loaded remotely.
    @param {EVUI.Modules.Dropdowns.Dropdown|String} dropdownOrID Either a YOLO Dropdown object to extend into the existing Dropdown, the real Dropdown reference, or the string ID of the Dropdown to unload.
    @param {EVUI.Modules.Dropdowns.DropdownUnloadArgs} dropdownUnloadArgs Optional. A YOLO object representing arguments for unloading a Dropdown. If omitted the Dropdown's existing unload settings are used instead.
    @returns {Promise<Boolean>}*/
    this.unloadDropdownAsync = function (dropdownOrID, dropdownUnloadArgs)
    {
        return new Promise(function (resolve)
        {
            _self.unloadDropdown(dropdownOrID, dropdownUnloadArgs, function (success)
            {
                resolve(success);
            });
        });
    };

    /**Makes or extends an object at the end of the PaneManager's function for applying the changes made to the Pane.
    @param {PaneCreationResult} paneCreateResult The result of creating the pane.
    @returns {EVUI.Modules.Panes.Pane}*/
    var makeOrExtendObject = function (createResult)
    {
        var dropdown = createResult.pane.dropdown;
        delete createResult.pane.dropdown;

        return makeOrExtendDropdown(dropdown, createResult.pane, createResult.exists);
    };

    /**Builds the DropdownEventArgs to use in the EventStream.
    @param {EVUI.Modules.Panes.PaneArgsPackage} argsPackage The argument data from the PaneManager about the current state of the Dropdown.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The PaneEventArgs that were created for the event.
    @returns {EVUI.Modules.Dropdowns.DropdownEventArgs} */
    var buildEventArgs = function (argsPackage, paneEventArgs)
    {
        if (argsPackage.foreignArgs == null)
        {
            argsPackage.foreignArgs = createForeignArgs(argsPackage);
        }

        var args = null;
        if (paneEventArgs.currentActionArgs.type === EVUI.Modules.Panes.PaneArgumentType.Hide)
        {
            args = argsPackage.foreignArgs.hideArgs;
        }
        else if (paneEventArgs.currentActionArgs.type === EVUI.Modules.Panes.PaneArgumentType.Load)
        {
            args = argsPackage.foreignArgs.loadArgs;
        }
        else if (paneEventArgs.currentActionArgs.type === EVUI.Modules.Panes.PaneArgumentType.Show)
        {
            args = argsPackage.foreignArgs.showArgs;
        }
        else if (paneEventArgs.currentActionArgs.type === EVUI.Modules.Panes.PaneArgumentType.Unload)
        {
            args = argsPackage.foreignArgs.unloadArgs;
        }

        var dropdownEventArgs = new EVUI.Modules.Dropdowns.DropdownEventArgs(argsPackage, args);
        dropdownEventArgs.cancel = paneEventArgs.cancel;
        dropdownEventArgs.eventType = paneEventArgs.eventType;
        dropdownEventArgs.eventName = paneEventArgs.eventName;
        dropdownEventArgs.pause = paneEventArgs.pause;
        dropdownEventArgs.resume = paneEventArgs.resume;
        dropdownEventArgs.stopPropagation = paneEventArgs.stopPropagation;
        dropdownEventArgs.context = paneEventArgs.context;

        return dropdownEventArgs;
    };

    /**Makes the foreign arguments for injecting into a DropdownEventArgs object from the PaneManager.
    @param {EVUI.Modules.Dropdowns.DropdownShowArgs|EVUI.Modules.Dropdowns.DropdownHideArgs|EVUI.Modules.Dropdowns.DropdownLoadArgs|EVUI.Modules.Dropdowns.DropdownUnloadArgs} dropdownArgs
    @returns {EVUI.Modules.Panes.PaneArgsPackage}.*/
    var makeCurrentActionArgs = function (dropdownArgs)
    {
        var currentActionArgs = new EVUI.Modules.Panes.PaneArgsPackage();
        if (dropdownArgs.type === EVUI.Modules.Dropdowns.DropdownArgumentType.Hide)
        {
            currentActionArgs.hideArgs = dropdownArgs;
            currentActionArgs.unloadArgs = dropdownArgs.unloadArgs;
        }
        else if (dropdownArgs.type === EVUI.Modules.Dropdowns.DropdownArgumentType.Show)
        {
            currentActionArgs.showArgs = dropdownArgs;
            currentActionArgs.loadArgs = dropdownArgs.loadArgs;
        }
        else if (dropdownArgs.type === EVUI.Modules.Dropdowns.DropdownArgumentType.Load)
        {
            currentActionArgs.loadArgs = dropdownArgs;
        }
        else if (dropdownArgs.type === EVUI.Modules.Dropdowns.DropdownArgumentType.Unload)
        {
            currentActionArgs.unloadArgs = dropdownArgs;
        }

        return currentActionArgs;
    };

    /**Makes the "foreign" arguments for the PaneManager if it does not have them already.
    @param {EVUI.Modules.Panes.PaneArgsPackage} argsPackage The state of the Dropdown as reported by the Panemanager.
    @returns {EVUI.Modules.Panes.WidowArgsPackage}*/
    var createForeignArgs = function (argsPackage)
    {
        var foreignArgs = new EVUI.Modules.Panes.PaneArgsPackage();
        if (argsPackage.hideArgs != null)
        {
            foreignArgs.hideArgs = new EVUI.Modules.Dropdowns.DropdownHideArgs(argsPackage.hideArgs);
            foreignArgs.hideArgs.unloadArgs = new EVUI.Modules.Dropdowns.DropdownUnloadArgs(argsPackage.hideArgs.unloadArgs);
        }

        if (argsPackage.showArgs != null)
        {
            foreignArgs.showArgs = new EVUI.Modules.Dropdowns.DropdownShowArgs(argsPackage.showArgs);
            foreignArgs.showArgs.showSettings = new EVUI.Modules.Dropdowns.DropdownShowSettings(argsPackage.showArgs.showSettings);
            foreignArgs.showArgs.loadArgs = new EVUI.Modules.Dropdowns.DropdownLoadArgs(argsPackage.showArgs.loadArgs);
            foreignArgs.showArgs.loadArgs.loadSettings = new EVUI.Modules.Dropdowns.DropdownLoadSettings(argsPackage.showArgs.loadArgs.loadSettings);
        }

        if (argsPackage.loadArgs != null)
        {
            foreignArgs.loadArgs = new EVUI.Modules.Dropdowns.DropdownLoadArgs(argsPackage.loadArgs);
            foreignArgs.loadArgs.loadSettings = new EVUI.Modules.Dropdowns.DropdownLoadSettings(argsPackage.loadArgs.loadSettings);
        }

        if (argsPackage.unloadArgs != null)
        {
            foreignArgs.unloadArgs = new EVUI.Modules.Dropdowns.DropdownUnloadArgs(argsPackage.unloadArgs);
        }

        return foreignArgs;
    };

    /**Makes or extends a Dropdown object. Preserves all object references between runs and extends new properties onto the existing objects if they exist. 
    @param {EVUI.Modules.Dropdowns.Dropdown} yoloDropdown A YOLO object representing a Dropdown.
    @returns {EVUI.Modules.Dropdowns.Dropdown} */
    var makeOrExtendDropdown = function (yoloDropdown, bantmPane, exists)
    {
        var dropdownToExtend = null;
        if (exists === true)
        {
            var preExisting = _settings.getPaneEntry(yoloDropdown.id);
            dropdownToExtend = preExisting.wrapper;
        }
        else
        {
            dropdownToExtend = new EVUI.Modules.Dropdowns.Dropdown(bantmPane);
        }

        var safeCopy = EVUI.Modules.Core.Utils.shallowExtend({}, yoloDropdown);
        delete safeCopy.id;
        if (exists === true && yoloDropdown.element === bantmPane.element) delete safeCopy.element; //if the dropdown already exists and this is the same reference, don't set it again. Otherwise, let it blow up.
        delete safeCopy.currentPosition;
        delete safeCopy.currentZIndex;
        delete safeCopy.isVisible;
        delete safeCopy.isInitialized;
        delete safeCopy.isLoaded;

        EVUI.Modules.Core.Utils.shallowExtend(dropdownToExtend, safeCopy, ["showSettings", "loadSettings"]);
        dropdownToExtend.showSettings = EVUI.Modules.Core.Utils.makeOrExtendObject(new EVUI.Modules.Dropdowns.DropdownShowSettings(bantmPane.showSettings), dropdownToExtend.showSettings, yoloDropdown.showSettings);
        dropdownToExtend.loadSettings = EVUI.Modules.Core.Utils.makeOrExtendObject(new EVUI.Modules.Dropdowns.DropdownLoadSettings(bantmPane.loadSettings), dropdownToExtend.loadSettings, yoloDropdown.loadSettings);
        return dropdownToExtend;
    };

    /**Gets a Dropdown object from ambiguous input.
    @param {EVUI.Modules.Dropdowns.Dropdown|String|Event} dropdownOrID Either a YOLO object representing a Dropdown object, a string ID of a Dropdown, or browser Event args triggering a Dropdown action.
    @param {Boolean} addIfMissing Whether or not to add the Dropdown record if it is not already present.
    @returns {EVUI.Modules.Panes.PaneEntry} */
    var getDropdownAmbiguously = function (dropdownOrID, addIfMissing)
    {
        if (dropdownOrID == null || (typeof dropdownOrID !== "string" && typeof dropdownOrID !== "object")) throw Error("Invalid input: " + _settings.objectName + " or string id expected.");

        if (dropdownOrID instanceof Event)
        {
            var entry = _settings.getPaneEntryAmbiguously(dropdownOrID, addIfMissing);
            return entry;
        }

        var fakePane = {};
        if (typeof dropdownOrID === "string")
        {
            fakePane = getDefaultPane({ id: dropdownOrID });
        }
        else
        {
            fakePane.id = dropdownOrID.id;
            fakePane.dropdown = dropdownOrID;
        }

        return _settings.getPaneEntryAmbiguously(fakePane, addIfMissing);
    };

    /**Determines whether or not any of the AutoClose triggers attached to the Dropdown should trigger a hide operation on the Dropdown. Every dropdown has their own listener, so this function fires once per visible dropdown.
    @param {EVUI.Modules.Panes.PaneAutoTriggerContext} autoCloseArgs The auto-close arguments from the Pane's auto-close handlers.
    @returns {Boolean} */
    var shouldAutoClose = function (autoCloseArgs)
    {
        if (autoCloseArgs == null) return true;
        if (autoCloseArgs.triggerType === EVUI.Modules.Panes.PaneAutoCloseTriggerType.Click)
        {
            return shouldAutoCloseOnClick(autoCloseArgs);
        }
        else if (autoCloseArgs.triggerType === EVUI.Modules.Panes.PaneAutoCloseTriggerType.KeyDown)
        {
            return shouldAutoCloseOnKeydown(autoCloseArgs);
        }

        return true;
    };

    /**Determines if a mouse event should trigger an auto-close of the Dropdown. Every dropdown has their own listener, so this function fires once per visible dropdown.
    @param {EVUI.Modules.Panes.PaneAutoTriggerContext} autoCloseArgs The auto-close arguments generated by the Pane's auto-close handlers.
    @returns {Boolean}*/
    var shouldAutoCloseOnClick = function (autoCloseArgs)
    {
        if (autoCloseArgs.browserEvent.type === "contextmenu") //if someone is showing a right-click menu, make sure the dropdown isn't already showing itself in response to the same click. If it is, don't cancel the show.
        {
            var entry = _settings.getPaneEntry(autoCloseArgs.target.id);
            if (entry.currentPaneAction === EVUI.Modules.Panes.PaneAction.Show) return false;

            autoCloseArgs.browserEvent.preventDefault(); //if it's not being shown actively, close the dropdown. 
            return true;
        }

        var visibleDropdowns = _self.getDropdown(function (dd) { return dd.isVisible }, true);
        if (visibleDropdowns == null) return true; //get any visible dropdowns

        var midShow = _settings.getPaneEntry(function (entry) { return entry.currentPaneAction === EVUI.Modules.Panes.PaneAction.Show }, true);
        var numMidShow = (midShow == null) ? 0 : midShow.length; //get any dropdowns that are in the middle of showing themselves.

        var numDropdowns = visibleDropdowns.length;
        for (var x = 0; x < numDropdowns; x++)
        {
            var curDropdown = visibleDropdowns[x];
            for (var y = 0; y < numMidShow; y++) //see if the relative element of the dropdown being shown is a child of one of the active dropdowns. If it is, don't hide anything.
            {
                var curInMidShow = midShow[y];
                if (curInMidShow.wrapper.showSettings != null && curInMidShow.wrapper.showSettings.relativeElement != null)
                {
                    if (curDropdown.element.contains(curInMidShow.wrapper.showSettings.relativeElement)) return false;
                }
            }            
        }

        return true;
    };

    /**Makes it so Dropdowns close in descending order of Z-Index when the keydown auto-close command is issued. Every dropdown has their own listener, so this function fires once per visible dropdown.
    @param {EVUI.Modules.Panes.PaneAutoTriggerContext} autoCloseArgs The auto-close args generated by the handler.
    @returns {Boolean} */
    var shouldAutoCloseOnKeydown = function (autoCloseArgs)
    {
        var visiblePanes = _settings.getPaneEntry(function (entry) { return entry.pane.isVisible === true }, true);
        if (visiblePanes == null) return true;

        var currentZIndex = autoCloseArgs.target.currentZIndex;

        if (EVUI.Modules.Core.Utils.isArray(visiblePanes) === false) visiblePanes = [visiblePanes];
        var numPanes = visiblePanes.length;
        for (var x = 0; x < numPanes; x++)
        {
            var curPane = visiblePanes[x];
            if (curPane.pane.currentZIndex > currentZIndex)
            {
                return false;
            }
        }

        autoCloseArgs.browserEvent.stopPropagation();
        autoCloseArgs.browserEvent.preventDefault();
        return true;
    };

    /**Gets a YOLO Pane object with all the default properties for a Dropdown's backing Pane.
    @param {EVUI.Modules.Dropdowns.Dropdown} dropdown The dropdown to use as a wrapper for the Pane.
    @returns {EVUI.Modules.Panes.Pane}*/
    var getDefaultPane = function (dropdown)
    {
        if (typeof dropdown.id === "string")
        {
            var existing = _settings.getPaneEntry(dropdown.id);
            if (existing != null && existing.pane != null)
            {
                var fake = EVUI.Modules.Core.Utils.shallowExtend({}, existing.pane);

                fake.dropdown = dropdown;
                return fake;
            }
        }

        var pane =
        {
            id: dropdown.id,
            autoCloseSettings:
            {
                closeMode: EVUI.Modules.Panes.PaneCloseMode.Click,
                autoCloseKeys: ["Escape"],
                autoCloseFilter: function (context)
                {
                    return shouldAutoClose(context);
                }
            },
            showSettings:
            {
                relativePosition:
                {
                    orientation: EVUI.Modules.Dropdowns.DropdownOrientation.Bottom + " " + EVUI.Modules.Dropdowns.DropdownOrientation.Right,
                    alignment: EVUI.Modules.Dropdowns.DropdownAlignment.None,
                },
                clipSettings:
                {
                    mode: EVUI.Modules.Panes.PaneClipMode.Shift
                }
            },
            dropdown: dropdown
        }

        return pane;
    };

    /**Interprets a browser event for a Dropdown operation.
    @param {EVUI.Modules.Panes.Pane} bantmPane The YOLO Pane being created to extend onto a real record.
    @param {Event} browserEvent The event from the browser.
    @returns {EVUI.Modules.Panes.Pane}*/
    var interpretBrowserEvent = function (bantmPane, browserEvent)
    {
        EVUI.Modules.Core.Utils.shallowExtend(bantmPane, getDefaultPane({ id: bantmPane.id }));

        var attributes = EVUI.Modules.Core.Utils.getElementAttributes(browserEvent.currentTarget);
        if (bantmPane.showSettings == null) bantmPane.showSettings = {};
        if (bantmPane.showSettings.relativePosition == null) bantmPane.showSettings.relativePosition = {};

        var orientation = attributes.getValue(EVUI.Modules.Dropdowns.Constants.Attribute_Orientation);
        var alignment = attributes.getValue(EVUI.Modules.Dropdowns.Constants.Attribute_Alignment);
        var mode = attributes.getValue(EVUI.Modules.Dropdowns.Constants.Attribute_DropMode);    

        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(orientation) === false)
        {
            bantmPane.showSettings.relativePosition.orientation = orientation;
        }

        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(alignment) === false)
        {
            bantmPane.showSettings.relativePosition.alignment = alignment;
        }

        if (mode === EVUI.Modules.Dropdowns.DropdownMode.Element)
        {
            bantmPane.showSettings.relativePosition.relativeElement = browserEvent.currentTarget;
        }
        else if (mode === EVUI.Modules.Dropdowns.DropdownMode.Point)
        {
            bantmPane.showSettings.relativePosition.x = browserEvent.clientX;
            bantmPane.showSettings.relativePosition.y = browserEvent.clientY;
        }
        else
        {
            if (browserEvent.type === "contextmenu")
            {
                bantmPane.showSettings.relativePosition.x = browserEvent.clientX;
                bantmPane.showSettings.relativePosition.y = browserEvent.clientY;
            }
            else
            {
                bantmPane.showSettings.relativePosition.relativeElement = browserEvent.currentTarget;
            }
        }

        if (browserEvent.type === "contextmenu") browserEvent.preventDefault();

        return true;
    };

    _settings = new EVUI.Modules.Panes.PaneManagerSettings();
    _settings.attributePrefix = EVUI.Modules.Dropdowns.Constants.Default_AttributePrefix;
    _settings.cssPrefix = EVUI.Modules.Dropdowns.Constants.Default_CssPrefix;
    _settings.cssSheetName = EVUI.Modules.Styles.Constants.DefaultStyleSheetName;
    _settings.stepPrefix = EVUI.Modules.Dropdowns.Constants.Default_StepPrefix;
    _settings.managerName = EVUI.Modules.Dropdowns.Constants.Default_ManagerName;
    _settings.objectName = EVUI.Modules.Dropdowns.Constants.Default_ObjectName;
    _settings.makeOrExtendObject = makeOrExtendObject;
    _settings.buildEventArgs = buildEventArgs;
    _settings.interpretBrowserEvent = interpretBrowserEvent;

    if (services == null || typeof services !== "object") services = new EVUI.Modules.Dropdowns.DropdownControllerServices();
    if (services.paneManager == null || typeof services.paneManager !== "object")
    {
        services.paneManager = EVUI.Modules.Panes.Manager;
    }

    _settings.httpManager = services.httpManager;
    _settings.stylesheetManager = services.stylesheetManager;
    _settings.htmlLoader = services.htmlLoader;

    _manager = new services.paneManager.createNewPaneManager(_settings);

    /**Global event that fires before the load operation begins for any Dropdown and is not yet in the DOM and cannot be manipulated in this stage, however the currentActionArgs.loadSettings can be manipulated to change the way the Dropdown's root element will be loaded.
    @param {EVUI.Modules.Dropdowns.DropdownEventArgs} paneEventArgs The event arguments for the Dropdown operation. The currentActionArgs property will be an instance of DropdownLoadArgs.*/
    this.onLoad = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onLoad", targetPath: "onLoad" });

    /**Global even that fires after the load operation has completed for any Dropdown and is now in the DOM and can be manipulated in this stage. From this point on the Dropdown's element property cannot be reset..
    @param {EVUI.Modules.Dropdowns.DropdownEventArgs} paneEventArgs The event arguments for the Dropdown operation. The currentActionArgs property will be an instance of DropdownLoadArgs.*/
    this.onLoaded = function (paneEventArgs) { };;
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onLoaded", targetPath: "onLoaded" });

    /**Global event that fires the first time any Dropdown is shown after being loaded into the DOM, but is not yet visible. After it has fired once, it will not fire again unless the DropdownShowArgs.reInitialize property is set to true.
    @param {EVUI.Modules.Dropdowns.DropdownEventArgs} paneEventArgs The event arguments for the Dropdown operation. The currentActionArgs property will be an instance of DropdownShowArgs.*/
    this.onInitialize = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onInitialize", targetPath: "onInitialize" });

    /**Global event that fires at the beginning of the show process and before the calculations for any Dropdown's location are made. The Dropdown is still hidden, but is present in the DOM and can be manipulated. In order for the positioning calculations in the next step to be accurate, all HTML manipulation should occur in this event.
    @param {EVUI.Modules.Dropdowns.DropdownEventArgs} paneEventArgs The event arguments for the Dropdown operation. The currentActionArgs property will be an instance of DropdownShowArgs.*/
    this.onShow = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onShow", targetPath: "onShow" });

    /**Global event that fires after the position of any Dropdown has been calculated and is available to be manipulated through the calculatedPosition property of the DropdownEventArgs. If the calculatedPosition or the showSettings are manipulated, the position will be recalculated (the changes made directly to the position take priority over changes made to the showSettings).
    @param {EVUI.Modules.Dropdowns.DropdownEventArgs} paneEventArgs The event arguments for the Dropdown operation. The currentActionArgs property will be an instance of DropdownShowArgs.*/
    this.onPosition = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onPosition", targetPath: "onPosition" });

    /**Global event that fires once any Dropdown has been positioned, shown, and had its optional show transition applied and completed. Marks the end of the show process.
    @param {EVUI.Modules.Dropdowns.DropdownEventArgs} paneEventArgs The event arguments for the Dropdown operation. The currentActionArgs property will be an instance of DropdownShowArgs.*/
    this.onShown = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onShown", targetPath: "onShown" });

    /**Global event that fires before any Dropdown has been moved from its current location and hidden. Gives the opportunity to change the hideTransition property of the DropdownHideArgs and optionally trigger an unload once the Dropdown has been hidden.
    @param {EVUI.Modules.Dropdowns.DropdownEventArgs} paneEventArgs The event arguments for the Dropdown operation. The currentActionArgs property will be an instance of DropdownHideArgs.*/
    this.onHide = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onHide", targetPath: "onHide" });

    /**Global event that fires after any Dropdown has been moved from its current location and is now hidden and the hide transition has completed.
    @param {EVUI.Modules.Dropdowns.DropdownEventArgs} paneEventArgs The event arguments for the Dropdown operation. The currentActionArgs property will be an instance of DropdownHideArgs.*/
    this.onHidden = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onHidden", targetPath: "onHidden" });

    /**Global event that fires before any Dropdown has been (potentially) removed from the DOM and had its element property reset to null.
    @param {EVUI.Modules.Dropdowns.DropdownEventArgs} paneEventArgs The event arguments for the Dropdown operation. The currentActionArgs property will be an instance of DropdownUnloadArgs.*/
    this.onUnload = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onUnload", targetPath: "onUnload" });

    /**Global event that fires after any Dropdown has been (potentially) removed from the DOM and had its element property reset to null. From this point on the Dropdown's element property is now settable to a new Element.
    @param {EVUI.Modules.Dropdowns.DropdownEventArgs} paneEventArgs The event arguments for the Dropdown operation. The currentActionArgs property will be an instance of DropdownUnloadArgs.*/
    this.onUnloaded = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onUnloaded", targetPath: "onUnloaded" });
};

/**Represents a UI component that behaves like a standard application dropdown menu that is positioned relative to another element or a point on the screen by default.
 @class*/
EVUI.Modules.Dropdowns.Dropdown = function (bantmPane)
{
    if (bantmPane == null) throw Error("Invalid input. Must wrap a Pane.");

    /**Object. The Dropdown being wrapped by the Dropdown.
    @type {EVUI.Modules.Panes.Pane}*/
    var _pane = bantmPane;

    /**String. The unique ID of this Dropdown. ID's are case-insensitive.
    @type {String}*/
    this.id = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "id", targetPath: "id", settings: { set: false } });

    /**Object. The root Element of the Dropdown. Cannot be reset once it has been assigned to via initialization or a load operation, unload the Dropdown to reset it.
    @type {Element}*/
    this.element = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "element", targetPath: "element" });

    /**Boolean. Whether or not to unload the Dropdown from the DOM when it is hidden (only applies to elements that were loaded via HTTP). False by default.
    @type {Boolean}*/
    this.unloadOnHide = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "unloadOnHide", targetPath: "unloadOnHide" });

    /**Object. Calculates and gets the absolute position of the Dropdown.
    @type {EVUI.Modules.Dom.ElementBounds}*/
    this.currentPosition = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "currentPosition", targetPath: "currentPosition", settings: { set: false } });

    /**Number. Calculates and gets the Z-Index of the Dropdown.
    @type {Number}*/
    this.currentZIndex = -1;
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "currentZIndex", targetPath: "currentZIndex", settings: { set: false } });

    /**Boolean. Whether or not the internal state of the Dropdown thinks it is visible or not. This will be true after the show process has completed and false after an unload or hide operation has been completed.
    @type {Boolean}*/
    this.isVisible = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "isVisible", targetPath: "isVisible", settings: { set: false } });

    /**Boolean. Whether or not the internal state of the Dropdown thinks it is visible or not. This will be true after the load process has completed, even if the element was set directly before the first load operation.
    @type {Boolean}*/
    this.isLoaded = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "isLoaded", targetPath: "isLoaded", settings: { set: false } });

    /**Boolean. Whether or not the internal state of the Dropdown thinks it has been initialized or not. This will be true after the onInitialized events fire. */
    this.isInitialized = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "isInitialized", targetPath: "isInitialized", settings: { set: false } });

    /**Object. Show settings for the Dropdown.
    @type {EVUI.Modules.Dropdowns.DropdownShowSettings}*/
    this.showSettings = null;    

    /**Object. Settings for loading the Dropdown.
    @type {EVUI.Modules.Dropdowns.DropdownLoadSettings}*/
    this.loadSettings = null;   

    /**Any. Any contextual information to attach to the Dropdown object.
    @type {Any}*/
    this.context = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "context", targetPath: "context"});

    /**Event that fires before the load operation begins for the Dropdown and is not yet in the DOM and cannot be manipulated in this stage, however the currentActionArgs.loadSettings can be manipulated to change the way the Dropdown's root element will be loaded.
    @param {EVUI.Modules.Dropdowns.DropdownEventArgs} paneEventArgs The event arguments for the Dropdown operation. The currentActionArgs property will be an instance of DropdownLoadArgs.*/
    this.onLoad = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "onLoad", targetPath: "onLoad" });

    /**Event that fires after the load operation has completed for the Dropdown and is now in the DOM and can be manipulated in this stage. From this point on the Dropdown's element property cannot be reset..
    @param {EVUI.Modules.Dropdowns.DropdownEventArgs} paneEventArgs The event arguments for the Dropdown operation. The currentActionArgs property will be an instance of DropdownLoadArgs.*/
    this.onLoaded = function (paneEventArgs) { };;
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "onLoaded", targetPath: "onLoaded" });

    /**Event that fires the first time the Dropdown is shown after being loaded into the DOM, but is not yet visible. After it has fired once, it will not fire again unless the DropdownShowArgs.reInitialize property is set to true.
    @param {EVUI.Modules.Dropdowns.DropdownEventArgs} paneEventArgs The event arguments for the Dropdown operation. The currentActionArgs property will be an instance of DropdownShowArgs.*/
    this.onInitialize = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "onInitialize", targetPath: "onInitialize" });

    /**Event that fires at the beginning of the show process and before the calculations for the Dropdown's location are made. The Dropdown is still hidden, but is present in the DOM and can be manipulated. In order for the positioning calculations in the next step to be accurate, all HTML manipulation should occur in this event.
    @param {EVUI.Modules.Dropdowns.DropdownEventArgs} paneEventArgs The event arguments for the Dropdown operation. The currentActionArgs property will be an instance of DropdownShowArgs.*/
    this.onShow = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "onShow", targetPath: "onShow" });

    /**Event that fires after the position of the Dropdown has been calculated and is available to be manipulated through the calculatedPosition property of the DropdownEventArgs. If the calculatedPosition or the showSettings are manipulated, the position will be recalculated (the changes made directly to the position take priority over changes made to the showSettings).
    @param {EVUI.Modules.Dropdowns.DropdownEventArgs} paneEventArgs The event arguments for the Dropdown operation. The currentActionArgs property will be an instance of DropdownShowArgs.*/
    this.onPosition = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "onPosition", targetPath: "onPosition" });

    /**Event that fires once the Dropdown has been positioned, shown, and had its optional show transition applied and completed. Marks the end of the show process.
    @param {EVUI.Modules.Dropdowns.DropdownEventArgs} paneEventArgs The event arguments for the Dropdown operation. The currentActionArgs property will be an instance of DropdownShowArgs.*/
    this.onShown = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "onShown", targetPath: "onShown" });

    /**Event that fires before the Dropdown has been moved from its current location and hidden. Gives the opportunity to change the hideTransition property of the DropdownHideArgs and optionally trigger an unload once the Dropdown has been hidden.
    @param {EVUI.Modules.Dropdowns.DropdownEventArgs} paneEventArgs The event arguments for the Dropdown operation. The currentActionArgs property will be an instance of DropdownHideArgs.*/
    this.onHide = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "onHide", targetPath: "onHide" });

    /**Event that fires after the Dropdown has been moved from its current location and is now hidden and the hide transition has completed.
    @param {EVUI.Modules.Dropdowns.DropdownEventArgs} paneEventArgs The event arguments for the Dropdown operation. The currentActionArgs property will be an instance of DropdownHideArgs.*/
    this.onHidden = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "onHidden", targetPath: "onHidden" });

    /**Event that fires before the Dropdown has been (potentially) removed from the DOM and had its element property reset to null.
    @param {EVUI.Modules.Dropdowns.DropdownEventArgs} paneEventArgs The event arguments for the Dropdown operation. The currentActionArgs property will be an instance of DropdownUnloadArgs.*/
    this.onUnload = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "onUnload", targetPath: "onUnload" });

    /**Event that fires after the Dropdown has been (potentially) removed from the DOM and had its element property reset to null. From this point on the Dropdown's element property is now settable to a new Element.
    @param {EVUI.Modules.Dropdowns.DropdownEventArgs} paneEventArgs The event arguments for the Dropdown operation. The currentActionArgs property will be an instance of DropdownUnloadArgs.*/
    this.onUnloaded = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "onUnloaded", targetPath: "onUnloaded" });

    /**Returns a copy of the internal eventBindings array.
    @returns {EVUI.Modules.Panes.PaneEventBinding[]}*/
    this.getEventBindings = function ()
    {
        return _pane.getEventBindings();
    };

    /**Adds an event response to a standard browser event to a child element of the Dropdown element.
    @param {Element} element The child element of the root bantmPane element to attach an event handler to.
    @param {EVUI.Modules.Dom.Constants.Fn_BrowserEventHandler} handler An event handler to be called when the specified events are triggered.
    @param {String|String[]} event Either a single event name, or an array of event names, or a space delineated string of event names to add.*/
    this.addEventBinding = function (element, event, handler)
    {
        return _pane.addEventBinding(element, event, handler);
    };
};

/**The settings and options for showing a Dropdown.
@class*/
EVUI.Modules.Dropdowns.DropdownShowSettings = function (showSettings)
{
    /**The show settings being set by the DropdownShowSettings.
    @type {EVUI.Modules.Panes.PaneShowSettings}*/
    var _showSettings = (showSettings == null || typeof showSettings !== "object") ? new EVUI.Modules.Panes.PaneShowSettings() : showSettings;
    if (_showSettings.relativePosition == null) _showSettings.relativePosition = new EVUI.Modules.Panes.PaneRelativePosition();
    if (_showSettings.clipSettings == null) _showSettings.clipSettings = new EVUI.Modules.Panes.PaneClipSettings();

    /**Number. The X-Coordinate to align the Dropdown to if it is not being aligned with an Element.
    @type {Number}*/
    this.x = 0;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "x", targetPath: "relativePosition.x" })

    /**Number. The Y-Coordinate to align the Dropdown to if it is not being aligned with an Element.
    @type {Number}*/
    this.y = 0;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "y", targetPath: "relativePosition.y" })

    /**String. The orientation of the Dropdown relative to the point or element. "bottom right" by default. If only "left" or "right" is specified, "bottom" is implied; if only "bottom" or "top" is specified, "right" is implied. Must be a value from the DropdownOrientation enum.
    @type {String}*/
    this.orientation = EVUI.Modules.Dropdowns.DropdownOrientation.Right + " " + EVUI.Modules.Dropdowns.DropdownOrientation.Bottom;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "orientation", targetPath: "relativePosition.orientation" })

    /**String. The alignment of the Dropdown relative to the side of the point or element.
    @type {String}*/
    this.alignment = EVUI.Modules.Dropdowns.DropdownAlignment.None;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "alignment", targetPath: "relativePosition.alignment" });

    /**Object. Contains the details of the CSS transition to use to show the Dropdown (if a transition is desired). If omitted, the Dropdown is positioned then shown by manipulating the display property directly.
    @type {EVUI.Modules.Dropdowns.DropdownTransition}*/
    this.showTransition = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "showTransition", targetPath: "showTransition" })

    /**Object. Contains the details of the CSS transition to use to hide the Dropdown (if a transition is desired). If omitted, the Dropdown is positioned then shown by manipulating the display property directly.
    @type {EVUI.Modules.Dropdowns.DropdownTransition}*/
    this.hideTransition = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "hideTransition", targetPath: "hideTransition" })

    /**Object. An Element (or CSS selector of an Element) to be used as a point or reference for the Dropdown to be placed next to. Defers to an x,y point specification.
    @type {Element|String}*/
    this.relativeElement = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "relativeElement", targetPath: "relativePosition.relativeElement" })

    /**Object. An Element (or CSS selector of an Element) or an ElementBounds object describing the bounds to which the Dropdown will attempt to fit inside. If omitted, the Dropdown's current view port is used.
    @type {Element|EVUI.Modules.Dom.ElementBounds|String}*/
    this.clipBounds = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "clipBounds", targetPath: "clipSettings.clipBounds" })

    /**Boolean. Whether or not scrollbars should appear on the X-axis when the Dropdown has been clipped.
    @type {Boolean}*/
    this.scrollXWhenClipped = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "scrollXWhenClipped", targetPath: "clipSettings.scrollXWhenClipped" })

    /**Boolean. Whether or not scrollbars should appear on the Y-axis when the Dropdown has been clipped.
    @type {Boolean}*/
    this.scrollYWhenClipped = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "scrollYWhenClipped", targetPath: "clipSettings.scrollYWhenClipped" })

    /**Boolean. Whether or not to include the height and width when positioning the element (when it is not clipped).
    @type {Boolean}*/
    this.setExplicitDimensions = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "setExplicitDimensions", targetPath: "setExplicitDimensions" })
};

/**Event arguments for the events exposed when hiding, showing, loading, or unloading a Dropdown.
@class*/
EVUI.Modules.Dropdowns.DropdownEventArgs = function (argsPackage, currentArgs)
{
    if (argsPackage == null || currentArgs == null) throw Error("Invalid arguments.")

    /**Object. The metadata about the state of the Dropdown.
    @type {EVUI.Modules.Panes.PaneArgsPackage}*/
    var _argsPackage = argsPackage;

    /**The current event args for the operation.
    @type {Any}*/
    var _currentArgs = currentArgs;

    /**The Dropdown that is having an action performed on it.
    @type {EVUI.Modules.Dropdowns.Dropdown}*/
    this.dropdown = null;
    Object.defineProperty(this, "dropdown",
    {
        get: function () { return _argsPackage.wrapper; },
        configurable: false,
        enumerable: true
    });

    /**String. The full name of the event.
    @type {String}*/
    this.eventName = null;

    /**String. The type of event being raised.
    @type {String}*/
    this.eventType = null;

    /**Function. Pauses the Dropdown's action, preventing the next step from executing until resume is called.*/
    this.pause = function () { };

    /**Function. Resumes the Dropdown's action, allowing it to continue to the next step.*/
    this.resume = function () { };

    /**Function. Cancels the Dropdown's action and aborts the execution of the Dropdown operation.*/
    this.cancel = function () { }

    /**Function. Stops the Dropdown from calling any other event handlers with the same eventType.*/
    this.stopPropagation = function () { };

    /**Object. The position of the Dropdown that has been calculated in using the currentShowSettings.
    @type {EVUI.Modules.Panes.PanePosition}*/
    this.calculatedPosition = null;
    Object.defineProperty(this, "calculatedPosition",
    {
        get: function () { return _argsPackage.lastCalculatedPosition; },
        configurable: false,
        enumerable: true
    });

    /**Object. The DropdownHide/Show/Load/Unload Arguments being used for the operation.
    @type {EVUI.Modules.Dropdowns.DropdownShowArgs|EVUI.Modules.Dropdowns.DropdownHideArgs|EVUI.Modules.Dropdowns.DropdownLoadArgs|EVUI.Modules.Dropdowns.DropdownUnloadArgs}*/
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

/**Arguments for loading a Dropdown.
 @class*/
EVUI.Modules.Dropdowns.DropdownLoadArgs = function (paneLoadArgs)
{
    /**The internal PaneLoadArgs being manipulated.
    @type {EVUI.Modules.Panes.PaneLoadArgs}*/
    var _loadArgs = (paneLoadArgs == null || typeof paneLoadArgs !== "object") ? new EVUI.Modules.Panes.PaneLoadArgs() : paneLoadArgs;

    /**String. The type of arguments contained within the object.
    @type {String}*/
    this.type = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _loadArgs, [{ sourcePath: "type", targetPath: "type" }]);

    /**Any. Any contextual information to pass into the Dropdown load logic.
    @type {Any}*/
    this.context = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _loadArgs, [{ sourcePath: "context", targetPath: "context" }]);

    /**Object. The PaneLoadSettings to use if the Dropdown has not already been loaded.
    @type {EVUI.Modules.Dropdowns.DropdownLoadSettings}*/
    this.loadSettings = null;

    /**Boolean. Whether or not to re-load the Dropdown.
    @type {Boolean}*/
    this.reload = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _loadArgs, [{ sourcePath: "reload", targetPath: "reload" }]);
};

/**Arguments for showing a Dropdown.
@class*/
EVUI.Modules.Dropdowns.DropdownShowArgs = function (paneShowArgs)
{
    /**The internal settings being set by the wrapper object.
    @type {EVUI.Modules.Panes.PaneShowArgs}*/
    var _paneShowArgs = (paneShowArgs == null || typeof paneShowArgs !== "object") ? new EVUI.Modules.Panes.PaneShowArgs() : paneShowArgs;

    /**String. The type of arguments contained within the object.
    @type {String}*/
    this.type = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneShowArgs, { sourcePath: "type", targetPath: "type", settings: { set: false } });

    /**Any. Any contextual information to pass into the Dropdown show logic.
    @type {Any}*/
    this.context = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneShowArgs, { sourcePath: "context", targetPath: "context" });

    /**Object. The show settings for the Dropdown.
    @type {EVUI.Modules.Dropdowns.DropdownShowSettings}*/
    this.showSettings = null;

    /**Object. The load arguments for loading the Dropdown if it has not already been loaded.
    @type {EVUI.Modules.Dropdowns.DropdownLoadArgs}*/
    this.loadArgs = null;

    /**Whether or not to re-initialize the Dropdown upon showing it.
    @type {Boolean}*/
    this.reInitialize = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneShowArgs, { sourcePath: "reInitialize", targetPath: "reInitialize" });
};

/**Arguments for hiding a Dropdown.
@class*/
EVUI.Modules.Dropdowns.DropdownHideArgs = function (paneHideArgs)
{
    /**The internal settings being set by the wrapper object.
    @type {EVUI.Modules.Panes.PaneHideArgs}*/
    var _paneHideArgs = (paneHideArgs == null || typeof paneHideArgs !== "object") ? new EVUI.Modules.Panes.PaneHideArgs() : paneHideArgs;

    /**String. The type of arguments contained within the object.
    @type {String}*/
    this.type = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneHideArgs, { sourcePath: "type", targetPath: "type", settings: { set: false } });

    this.context = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneHideArgs, { sourcePath: "context", targetPath: "context" });

    /** */
    this.dropdownHideTransition = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneHideArgs, { sourcePath: "dropdownHideTransition", targetPath: "paneHideTransition" });

    this.unloadArgs = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneHideArgs, { sourcePath: "unloadArgs", targetPath: "unloadArgs" });
};

/**Arguments for unloading a Dropdown.
@class*/
EVUI.Modules.Dropdowns.DropdownUnloadArgs = function (paneUnloadArgs)
{
    /**The internal settings being set by the wrapper object.
    @type {EVUI.Modules.Panes.PaneUnloadArgs}*/
    var _paneUnloadArgs = (paneUnloadArgs == null || typeof paneUnloadArgs !== "object") ? new EVUI.Modules.Panes.PaneUnloadArgs() : paneUnloadArgs;

    /**String. The type of arguments contained within the object.
    @type {String}*/
    this.type = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneUnloadArgs, { sourcePath: "type", targetPath: "type", settings: { set: false } });

    /**Any. Any contextual information to pass into the Dropdown hide logic.
    @type {Any}*/
    this.context = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneUnloadArgs, { sourcePath: "context", targetPath: "context" });

    /**Boolean. Whether or not to remove the Dropdown from the DOM once it has been unloaded.
    @type {Boolean}*/
    this.remove = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneUnloadArgs, { sourcePath: "remove", targetPath: "remove" });
};

/**Represents a transition effect that can be applied to a Dropdown when its position or size changes.
@class*/
EVUI.Modules.Dropdowns.DropdownTransition = function ()
{
    /**Object or String. Either class names, a string of CSS rules (without a selector), or an object of key-value pairs of CSS properties to generate a runtime CSS class for.
    @type {Object|String}*/
    this.css = null;

    /**String. CSS definition for a keyframe animation to apply. Note that the keyframe animation's name must appear in the DropdownTransition.css property in order to be applied.
    @type {String}*/
    this.keyframes = null;

    /**The duration (in milliseconds) of the transition so that the OnShown/OnHidden events are only fired once the transition is complete.
    @type {Number}*/
    this.duration = 0;
};

/**Settings and options for loading a dropdown.
@class */
EVUI.Modules.Dropdowns.DropdownLoadSettings = function (paneLoadSettings)
{
    var _paneLoadSettings = (paneLoadSettings == null || typeof paneLoadSettings !== "object") ? new EVUI.Modules.Panes.PaneLoadSettings() : paneLoadSettings;

    /**Object. The Element to show as the Dropdown.
    @type {Element}*/
    this.element = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneLoadSettings, { sourcePath: "element", targetPath: "element" });

    /**String. A CSS selector that is used to go find the Element to show as the Dropdown. Only the first result is used.
    @type {String}*/
    this.selector = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneLoadSettings, { sourcePath: "selector", targetPath: "selector" });

    /**Object. If using a CSS selector to find the root element of a Dropdown, this is the context limiting element to search inside of.
    @type {Element}*/
    this.contextElement = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneLoadSettings, { sourcePath: "contextElement", targetPath: "contextElement" });

    /**Object. HttpRequestArgs for making a Http request to go get the Dropdown's HTML.
    @type {EVUI.Modules.Http.HttpRequestArgs}*/
    this.httpLoadArgs = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneLoadSettings, { sourcePath: "httpLoadArgs", targetPath: "httpLoadArgs" });

    /**Object. PlaceholderLoadArgs for making a series of Http requests to load the Dropdown as an existing placeholder.
    @type {EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadArgs}*/
    this.placeholderLoadArgs = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneLoadSettings, { sourcePath: "placeholderLoadArgs", targetPath: "placeholderLoadArgs" });
};

/**The mode by which the Dropdown will be positioned in response to a browser event. Only applies to the "evui-dd-mode" attribute. By default all browser events but "contextmenu" are relative to the Element, "contextmenu" defaults to the location of the mouse.
@enum*/
EVUI.Modules.Dropdowns.DropdownMode =
{
    /**Override the default behavior to make the Dropdown appear relative to the location of the mouse cursor.*/
    Point: "point",
    /**Override the default behavior to make the Dropdown appear rleative to the Element with the event handler.*/
    Element: "element"
};
Object.freeze(EVUI.Modules.Dropdowns.DropdownMode);

/**Controls the alignment of the Dropdown along the X or Y axis when it is positioned relative to an Element.
@enum*/
EVUI.Modules.Dropdowns.DropdownAlignment =
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
Object.freeze(EVUI.Modules.Dropdowns.DropdownAlignment);

/**Enum set for orientations of a Dropdown relative to a point or element. Any combination of left/right and top/bottom is valid.
@enum*/
EVUI.Modules.Dropdowns.DropdownOrientation =
{
    /**The Dropdown's right edge will be against the left edge of the relative element or point.*/
    Left: "left",
    /**The Dropdown's left edge will be against the right edge of the relative element or point.*/
    Right: "right",
    /**The Dropdown's bottom edge will be against the top edge of the relative element or point.*/
    Top: "top",
    /**The Dropdown's top edge will be against the bottom edge of the relative element or point.*/
    Bottom: "bottom"
};
Object.freeze(EVUI.Modules.Dropdowns.DropdownOrientation);


/**Enum for indicating what type of arguments object the DropdownEventArgs.currentArguments property is.
@enum*/
EVUI.Modules.Dropdowns.DropdownArgumentType =
{
    /**Arguments are DropdownShowArgs.*/
    Show: "show",
    /**Arguments are DropdownHideArgs.*/
    Hide: "hide",
    /**Arguments are DropdownLoadArgs.*/
    Load: "load",
    /**Arguments are DropdownUnloadArgs.*/
    Unload: "unload",
    /**Arguments are DropdownMoveResizeArgs.*/
    MoveResize: "moveResize"
};
Object.freeze(EVUI.Modules.Dropdowns.DropdownArgumentType);

/**Enum for indicating the behavior of the Dropdown when it overflows its clipBounds.
@enum*/
EVUI.Modules.Dropdowns.DropdownClipMode =
{
    /**When the calculated position of the Dropdown overflows the clipBounds, it will not be cropped to stay within the clipBounds and will overflow to the outside of the clip bounds.*/
    Overflow: "overflow",
    /**When the calculated position of the Dropdown overflows the clipBounds, it will be clipped to the maximum dimensions of the clipBounds on the overflowing axes.*/
    Clip: "clip",
    /**When the calculated position of the Dropdown overflows the clipBounds, it will be shifted in the opposite directions as the overflow to fit within the clipBounds.*/
    Shift: "shift",
};
Object.freeze(EVUI.Modules.Dropdowns.DropdownClipMode);

/**Object to inject the standard dependencies used by the DropdownController into it via its constructor.
@class*/
EVUI.Modules.Dropdowns.DropdownControllerServices = function ()
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

/**Global instance of the DropdownManager, used for creating and using simple dropdowns that are positioned relative to a point or another element.
@type {EVUI.Modules.Dropdowns.DropdownManager}*/
EVUI.Modules.Dropdowns.Manager = null;
(function ()
{
    var manager = null;
    var ctor = EVUI.Modules.Dropdowns.DropdownManager;

    Object.defineProperty(EVUI.Modules.Dropdowns, "Manager", {
        get: function ()
        {
            if (manager == null) manager = new ctor();
            return manager;
        },
        enumerable: true,
        configurable: false
    });
})();

/**Constructor reference for the DropdownManager.*/
EVUI.Constructors.Dropdowns = EVUI.Modules.Dropdowns.DropdownManager;

Object.freeze(EVUI.Modules.Dropdowns);

delete $evui.dropdowns;

/**Global instance of the DropdownManager, used for creating and using simple dropdowns that are positioned relative to a point or another element.
@type {EVUI.Modules.Dropdowns.DropdownManager}*/
$evui.dropdowns = null;
Object.defineProperty($evui, "dropdowns", {
    get: function () { return EVUI.Modules.Dropdowns.Manager; },
    enumerable: true
});

/**Adds a Dropdown to the WidowManager.
@param {EVUI.Modules.Dropdowns.Dropdown} yoloDropdown A YOLO object representing a Dropdown object. This object is copied onto a real Dropdown object is then discarded.
@returns {EVUI.Modules.Dropdowns.Dropdown}*/
$evui.addDropdown = function (yoloDropdown)
{
    return $evui.dropdowns.addDropdown(yoloDropdown);
};

/**Shows (and loads, if necessary or if a reload is requested) a Dropdown asynchronously. Provides a callback that is called call once the Dropdown operation has completed successfully or otherwise.
@param {EVUI.Modules.Dropdowns.Dropdown|String} dropdownOrID Either a YOLO Dropdown object to extend into the existing Dropdown, the real Dropdown reference, or the string ID of the Dropdown to show.
@param {EVUI.Modules.Dropdowns.DropdownShowArgs|EVUI.Modules.Dropdowns.Constants.Fn_DropdownOperationCallback} dropdownShowArgs Optional. A YOLO object representing the arguments for showing the Dropdown, or the callback. If omitted or passed as a function, the Dropdown's existing show/load settings are used instead.
@param {EVUI.Modules.Dropdowns.Constants.Fn_DropdownOperationCallback} callback Optional. A callback that is called once the operation completes.*/
$evui.showDropdown = function (dropdownOrID, dropdownShowArgs, callback)
{
    return $evui.dropdowns.showDropdown(dropdownOrID, dropdownShowArgs, callback);
};

/**Awaitable. (and loads, if necessary or if a reload is requested) a Dropdown asynchronously.
@param {EVUI.Modules.Dropdowns.Dropdown|String} dropdownOrID Either a YOLO Dropdown object to extend into the existing Dropdown, the real Dropdown reference, or the string ID of the Dropdown to show.
@param {EVUI.Modules.Dropdowns.DropdownShowArgs} dropdownShowArgs Optional.  A YOLO object representing the arguments for showing the Dropdown. If omitted, the Dropdown's existing show/load settings are used instead.
@returns {Promise<Boolean>}*/
$evui.showDropdownAsync = function (dropdownOrID, dropdownShowArgs)
{
    return $evui.dropdowns.showDropdownAsync(dropdownOrID, dropdownShowArgs);
};

/**Hides (and unloads if requested) a Dropdown asynchronously. Provides a callback that is called call once the Dropdown operation has completed successfully or otherwise.
@param {EVUI.Modules.Dropdowns.Dropdown|String} dropdownOrID Either a YOLO Dropdown object to extend into the existing Dropdown, the real Dropdown reference, or the string ID of the Dropdown to hide.
@param {EVUI.Modules.Dropdowns.DropdownHideArgs|EVUI.Modules.Dropdowns.Constants.Fn_DropdownOperationCallback} dropdownHideArgs Optional.  A YOLO object representing the arguments for hiding a Dropdown or the callback. If omitted or passed as a function, the Dropdown's existing hide/unload settings are used instead.
@param {EVUI.Modules.Dropdowns.Constants.Fn_DropdownOperationCallback} callback Optional. A callback that is called once the operation completes.*/
$evui.hideDropdown = function (dropdownOrID, dropdownHideArgs, callback)
{
    return $evui.dropdowns.hideDropdown(dropdownOrID, dropdownHideArgs, callback);
};

/**Awaitable. Hides (and unloads if requested) a Dropdown asynchronously. Provides a callback that is called call once the Dropdown operation has completed successfully or otherwise.
@param {EVUI.Modules.Dropdowns.Dropdown|String} dropdownOrID Either a YOLO Dropdown object to extend into the existing Dropdown, the real Dropdown reference, or the string ID of the Dropdown to hide.
@param {EVUI.Modules.Dropdowns.DropdownHideArgs} dropdownHideArgs Optional.  A YOLO object representing the arguments for hiding a Dropdown. If omitted, the Dropdown's existing hide/unload settings are used instead.
@returns {Promise<Boolean>}*/
$evui.hideDropdownAsync = function (dropdownOrID, dropdownHideArgs)
{
    return $evui.dropdowns.hideDropdownAsync(dropdownOrID, dropdownHideArgs);
};

/*#ENDWRAP(Drop)#*/