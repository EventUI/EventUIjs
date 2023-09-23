/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

/*#INCLUDES#*/

/*#BEGINWRAP(EVUI.Modules.Dialog|Dialog)#*/
/*#REPLACE(EVUI.Modules.Dialog|Dialog)#*/

/**Core module containing the Initialization and Utility functionality that is shared by all other modules.
@module*/
EVUI.Modules.Dialogs = {};

/*#MODULEDEF(Dialog|"1.0";|"Dialog")#*/
/*#VERSIONCHECK(EVUI.Modules.Dialog|Dialog)#*/

EVUI.Modules.Dialogs.Dependencies =
{
    Core: Object.freeze({ version: "1.0", required: true }),
    Panes: Object.freeze({ version: "1.0", required: true })
};

(function ()
{
    var checked = false;

    Object.defineProperty(EVUI.Modules.Dialogs.Dependencies, "checked",
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

Object.freeze(EVUI.Modules.Dialogs.Dependencies);

EVUI.Modules.Dialogs.Constants = {};

/**Function for selecting a PaneEntry object. Return true to select the PaneEntry parameter as part of the result set.
@param {EVUI.Modules.Dialogs.Dialog} dialog The PaneEntry providing metadata about a Dialog object.
@returns {Boolean}*/
EVUI.Modules.Dialogs.Constants.Fn_DialogSelector = function (dialog) { return true; }

/**Function for reporting whether or not a Dialog was successfully Loaded.
@param {Boolean} success Whether or not the load operation completed successfully.*/
EVUI.Modules.Dialogs.Constants.Fn_LoadCallback = function (success) { };

/**Function for reporting whether or not an operation Dialog was successful.
@param {Boolean} success Whether or not the operation completed successfully.*/
EVUI.Modules.Dialogs.Constants.Fn_DialogOperationCallback = function (success) { };

EVUI.Modules.Dialogs.Constants.CSS_Position = "evui-position";
EVUI.Modules.Dialogs.Constants.CSS_ClippedX = "evui-clipped-x";
EVUI.Modules.Dialogs.Constants.CSS_ClippedY = "evui-clipped-y";
EVUI.Modules.Dialogs.Constants.CSS_ScrollX = "evui-scroll-x";
EVUI.Modules.Dialogs.Constants.CSS_ScrollY = "evui-scroll-y"
EVUI.Modules.Dialogs.Constants.CSS_Flipped = "evui-flipped";
EVUI.Modules.Dialogs.Constants.CSS_Moved = "evui-moved";
EVUI.Modules.Dialogs.Constants.CSS_Resized = "evui-resized";
EVUI.Modules.Dialogs.Constants.CSS_Transition_Show = "evui-transition-show";
EVUI.Modules.Dialogs.Constants.CSS_Transition_Hide = "evui-transition-hide";

/**String. The name of the ID attribute for the Dialog, used to look up a definition of a Dialog.
@type {String}*/
EVUI.Modules.Dialogs.Constants.Attribute_ID = "evui-dlg-id";

/**String. The name of the attribute that signifies which element should receive initial focus when the Dialog is displayed.
@type {String}*/
EVUI.Modules.Dialogs.Constants.Attribute_Focus = "evui-dlg-focus";

/**String. The name of the attribute that signifies that a click event on the Element should close the Dialog.
@type {String}*/
EVUI.Modules.Dialogs.Constants.Attribute_Close = "evui-dlg-close";

/**String. The name of the attribute on an element that triggers the showing of a Dialog what the URL to get the Dialog's HTML from is (Requires EVUI.Modules.Http).
@type {String}*/
EVUI.Modules.Dialogs.Constants.Attribute_SourceURL = "evui-dlg-src";

/**String. The name of the attribute on an element that triggers the showing of a Dialog of what placeholder to load for the Dialog's HTML (Requires EVUI.Modules.HtmlLoaderController).
@type {String}*/
EVUI.Modules.Dialogs.Constants.Attribute_PlaceholderID = "evui-dlg-placeholder-id";

/**String. The name of the attribute on an element that triggers the showing or hiding of a Dialog whether or not the Dialog should be unloaded when it is hidden.
@type {String}*/
EVUI.Modules.Dialogs.Constants.Attribute_UnloadOnHide = "evui-dlg-unload";

/**String. The name of the attribute on an element that triggers the showing or hiding of a Dialog that is used to indicate special behavior as defined by a consumer of the Dialog.
@type {String}*/
EVUI.Modules.Dialogs.Constants.Attribute_Context = "evui-dlg-cxt";

/**String. The name of the attribute on an element that triggers the showing of a Dialog what CSS selector to use to find the element to show as the Dialog. Only the first result will be used.
@type {String}*/
EVUI.Modules.Dialogs.Constants.Attribute_Selector = "evui-dlg-selector";

/**String. The name of the attribute on an element that triggers the showing of a Dialog whether or not to center the dialog on the screen.
@type {String}*/
EVUI.Modules.Dialogs.Constants.Attribute_Center = "evui-dlg-center";

/**String. The name of the attribute on an element that triggers the showing of a Dialog whether or not to take up the entire screen.
@type {String}*/
EVUI.Modules.Dialogs.Constants.Attribute_Fullscreen = "evui-dlg-fullscreen";

/**String. The name of the attribute that signifies that a drag event on the Element should move the Dialog.
@type {String}*/
EVUI.Modules.Dialogs.Constants.Attribute_Drag = "evui-dlg-drag-handle";

/**String. The name of the attribute that specifies which sides of the Dialog can be used to resize the Dialog. Specify any combination of "left", "right", "top", or "bottom".
@type {String}*/
EVUI.Modules.Dialogs.Constants.Attribute_ResizeHandles = "evui-dlg-resize-handles";

/**String. The name of the attribute which specifies how wide the handle should be on the edges of the Dialog should be to start a resize operation in pixels.
@type {String}*/
EVUI.Modules.Dialogs.Constants.Attribute_ResizeHandleWidth = "evui-dlg-resize-handle-width"

/**String. The name of the attribute that will be used to absolute position the top edge of the Dialog.
@type {String}*/
EVUI.Modules.Dialogs.Constants.Attribute_Top = "evui-dlg-top";

/**String. The name of the attribute that will be used to absolute position the left edge of the Dialog.
@type {String}*/
EVUI.Modules.Dialogs.Constants.Attribute_Left = "evui-dlg-left";

/**String. The name of the attribute that will be used add positioning CSS classes to the dialog.
@type {String}*/
EVUI.Modules.Dialogs.Constants.Attribute_Classes = "evui-dlg-class";

EVUI.Modules.Dialogs.Constants.Default_ObjectName = "Dialog";
EVUI.Modules.Dialogs.Constants.Default_ManagerName = "DialogManager";
EVUI.Modules.Dialogs.Constants.Default_CssPrefix = "evui-dlg";
EVUI.Modules.Dialogs.Constants.Default_EventNamePrefix = "evui.dlg";
EVUI.Modules.Dialogs.Constants.Default_AttributePrefix = "evui-dlg";

Object.freeze(EVUI.Modules.Dialogs.Constants);

/**Class for managing Dialog object.
@class*/
EVUI.Modules.Dialogs.DialogManager = function (services)
{
    if (EVUI.Modules.Core == null) throw Error("Dependency missing: EVUI.Modules.Core is required.");
    EVUI.Modules.Core.Utils.requireAll(EVUI.Modules.Dialogs.Dependencies);

    var _self = this; //self-reference for closures

    /**The internal PaneManager of the DialogManager.
    @type {EVUI.Modules.Panes.PaneManager}*/
    var _manager = null;

    /**The settings overrides for the DialogManager.
    @type {EVUI.Modules.Panes.PaneManagerSettings}*/
    var _settings = null;

    /**Adds a Dialog to the WidowManager.
    @param {EVUI.Modules.Dialogs.Dialog} dialog A YOLO object representing a Dialog object. This object is copied onto a real Dialog object is then discarded.
    @returns {EVUI.Modules.Dialogs.Dialog}*/
    this.addDialog = function (dialog)
    {
        if (dialog == null) throw Error(_settings.objectName + " cannot be null.");
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(dialog.id) === true) throw Error(_settings.objectName + "must have an id that is a non-whitespace string.");

        var existing = _settings.getPaneEntry(dialog.id);
        if (existing != null) throw Error("A " + _settings.objectName + " with an id of \"" + dialog.id + "\" already exists.");

        _manager.addPane(getDefaultPane(dialog));

        existing = _settings.getPaneEntry(dialog.id);
        return existing.wrapper;
    };

    /**Removes a Dialog from the DialogManager. Does not unload the Dialog's element from the DOM.
    @param {EVUI.Modules.Dialogs.Dialog|String} dialogOrID
    @returns {Boolean}*/
    this.removeDialog = function (dialogOrID)
    {
        return _manager.removePane(dialogOrID);
    };

    /**Gets a DialogEntry object based on its ID or a selector function.
    @param {EVUI.Modules.Dialogs.Constants.Fn_DialogSelector|String} dialogIDOrSelector A selector function to select a Dialog object (or multiple DialogEntry objects) or the ID of the Dialog to get the DialogEntry for.
    @param {Boolean} getAllMatches If a selector function is provided, all the DialogEntries that satisfy the selector are included. Otherwise a single DialogEntry object is returned. False by default.
    @returns {EVUI.Modules.Dialogs.Dialog|EVUI.Modules.Dialogs.Dialog[]} */
    this.getDialog = function (dialogIDOrSelector, getAllMatches)
    {
        var entries = null;

        if (typeof dialogIDOrSelector === "function")
        {
            entries = _settings.getPaneEntry(function () { return true; }, true).map(function (entry) { return entry.wrapper; }).filter(dialogIDOrSelector);
            if (getAllMatches !== true && entries != null) return entries[0];
            return entries;
        }
        else
        {
            entries = _settings.getPaneEntry(dialogIDOrSelector, getAllMatches);
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

    /**Shows (and loads, if necessary or if a reload is requested) a Dialog asynchronously. Provides a callback that is called once the Dialog operation has completed successfully or otherwise.
    @param {EVUI.Modules.Dialogs.Dialog|String} dialogOrID Either a YOLO Dialog object to extend into the existing Dialog, the real Dialog reference, or the string ID of the Dialog to show.
    @param {EVUI.Modules.Dialogs.DialogShowArgs|EVUI.Modules.Dialogs.Constants.Fn_DialogOperationCallback} dialogShowArgs Optional.  The arguments for showing the Dialog, or the callback. If omitted or passed as a function, the Dialog's existing show/load settings are used instead.
    @param {EVUI.Modules.Dialogs.Constants.Fn_DialogOperationCallback} callback Optional. A callback that is called once the operation completes.*/
    this.showDialog = function (dialogOrID, dialogShowArgs, callback)
    {
        var entry = getDialogAmbiguously(dialogOrID, true);

        var paneShowArgs = new EVUI.Modules.Panes.PaneShowArgs();
        paneShowArgs.showSettings = _settings.cloneShowSettings(entry.pane.showSettings);
        paneShowArgs.loadArgs = new EVUI.Modules.Panes.PaneLoadArgs();
        paneShowArgs.loadArgs.loadSettings = _settings.cloneLoadSettings(entry.pane.loadSettings);

        if (typeof dialogShowArgs === "function")
        {
            callback = dialogShowArgs;
            dialogShowArgs = null;
        }
        else if (dialogShowArgs != null && typeof dialogShowArgs === "object")
        {
            dialogShowArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Dialogs.DialogShowArgs(paneShowArgs), dialogShowArgs, ["type"]);
            if (dialogShowArgs.showSettings != null)
            {
                dialogShowArgs.showSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Dialogs.DialogShowSettings(paneShowArgs.showSettings), dialogShowArgs.showSettings);
            }
            else
            {
                dialogShowArgs.showSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Dialogs.DialogShowSettings(paneShowArgs.showSettings), entry.wrapper.showSettings);
            }


            if (dialogShowArgs.loadArgs != null && dialogShowArgs.loadArgs.loadSettings != null)
            {
                dialogShowArgs.loadArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Dialogs.DialogLoadArgs(paneShowArgs.loadArgs), dialogShowArgs.loadArgs, ["type"]);
                dialogShowArgs.loadArgs.loadSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Dialogs.DialogLoadSettings(paneShowArgs.loadArgs.loadSettings), dialogShowArgs.loadArgs.loadSettings);
            }
            else
            {
                dialogShowArgs.loadArgs = new EVUI.Modules.Dialogs.DialogLoadArgs(paneShowArgs.loadArgs);
                dialogShowArgs.loadArgs.loadSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Dialogs.DialogLoadSettings(paneShowArgs.loadArgs.loadSettings), entry.wrapper.loadSettings, ["type"]);;
            }
        }
        else
        {
            dialogShowArgs = null;
        }

        if (dialogShowArgs == null)
        {
            dialogShowArgs = new EVUI.Modules.Dialogs.DialogShowArgs(paneShowArgs);
            dialogShowArgs.showSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Dialogs.DialogShowSettings(paneShowArgs.showSettings), entry.wrapper.showSettings);
            dialogShowArgs.loadArgs = new EVUI.Modules.Dialogs.DialogLoadArgs(paneShowArgs.loadArgs);
            dialogShowArgs.loadArgs.loadSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Dialogs.DialogLoadSettings(paneShowArgs.loadArgs.loadSettings), entry.wrapper.loadSettings);
        }

        _settings.currentActionArgs = makeCurrentActionArgs(dialogShowArgs);

        _manager.showPane(entry.pane.id, paneShowArgs, callback);
    };

    /**Awaitable. (and loads, if necessary or if a reload is requested) a Dialog asynchronously.
    @param {EVUI.Modules.Dialogs.Dialog|String} dialogOrID Either a YOLO Dialog object to extend into the existing Dialog, the real Dialog reference, or the string ID of the Dialog to show.
    @param {EVUI.Modules.Dialogs.DialogShowArgs} dialogShowArgs Optional.  A YOLO object representing the arguments for showing the Dialog. If omitted, the Dialog's existing show/load settings are used instead.
    @returns {Promise<Boolean>}*/
    this.showDialogAsync = function (dialogOrID, dialogShowArgs)
    {
        return new Promise(function (resolve)
        {
            _self.showDialog(dialogOrID, dialogShowArgs, function (success)
            {
                resolve(success);
            });
        });
    };

    /**Hides (and unloads if requested) a Dialog asynchronously. Provides a callback that is called call once the Dialog operation has completed successfully or otherwise.
    @param {EVUI.Modules.Dialogs.Dialog|String} dialogOrID Either a YOLO Dialog object to extend into the existing Dialog, the real Dialog reference, or the string ID of the Dialog to hide.
    @param {EVUI.Modules.Dialogs.DialogHideArgs|EVUI.Modules.Dialogs.Constants.Fn_DialogOperationCallback} dialogHideArgs Optional. A YOLO object representing arguments for hiding a Dialog or a callback. If omitted or passed as a function, the Dialog's existing hide/unload settings are used instead.
    @param {EVUI.Modules.Dialogs.Constants.Fn_DialogOperationCallback} callback Optional. A callback that is called once the operation completes.*/
    this.hideDialog = function (dialogOrID, dialogHideArgs, callback)
    {
        var entry = getDialogAmbiguously(dialogOrID);

        var paneHideArgs = new EVUI.Modules.Panes.PaneHideArgs();
        paneHideArgs.unloadArgs = new EVUI.Modules.Panes.PaneUnloadArgs();

        if (typeof dialogHideArgs === "function")
        {
            callback = dialogHideArgs;
            dialogHideArgs = null;
        }
        else if (dialogHideArgs != null && typeof dialogHideArgs === "object")
        {
            dialogHideArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Dialogs.DialogHideArgs(paneHideArgs), dialogHideArgs, ["type"]);
            dialogHideArgs.unloadArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Dialogs.DialogUnloadArgs(paneHideArgs.unloadArgs, dialogHideArgs.unloadArgs));
        }
        else
        {
            dialogHideArgs = null;
        }

        if (dialogHideArgs == null)
        {
            dialogHideArgs = new EVUI.Modules.Dialogs.DialogHideArgs(paneHideArgs);
            dialogHideArgs.unloadArgs = new EVUI.Modules.DialogUnloadArgs(paneHideArgs.unloadArgs);
        }

        _settings.currentActionArgs = makeCurrentActionArgs(dialogHideArgs);
        _manager.hidePane(entry.pane.id, paneHideArgs, callback);
    };

    /**Awaitable. Hides (and unloads if requested) a Dialog asynchronously.
    @param {EVUI.Modules.Dialogs.Dialog|String} dialogOrID Either a YOLO Dialog object to extend into the existing Dialog, the real Dialog reference, or the string ID of the Dialog to hide.
    @param {EVUI.Modules.Dialogs.DialogHideArgs} dialogHideArgs Optional. A YOLO object representing the arguments for hiding a Dialog. If omitted, the Dialog's existing hide/unload settings are used instead.
    @returns {Promise<Boolean>}*/
    this.hideDialogAsync = function (dialogOrID, dialogHideArgs)
    {
        return new Promise(function (resolve)
        {
            _self.hideDialog(dialogOrID, dialogHideArgs, function (success)
            {
                resolve(success);
            });
        });
    };

    /**Hides all visible Dialogs asynchronously. Provides a callback function that is called once all the visible Dialogs have been hidden.
    @param {EVUI.Modules.Panes.DialogHideArgs} dialogHideArgs Optional. A YOLO object representing the arguments for hiding a Dialog. If omitted, the Dialog's existing hide/unload settings are used instead.
    @param {EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} callback The callback that is called once all the Dialog's hide operations have completed.*/
    this.hideAllDialogs = function (dialogHideArgs, callback)
    {
        if (typeof callback !== "function") callback = function () { };
        var allVisible = this.getDialog(function (dd) { return dd.isVisible; });
        var numVisible = allVisible.length;
        var numHidden = 0;

        if (numVisible === 0) return callback(true);

        for (var x = 0; x < numVisible; x++)
        {
            this.hideDialog(allVisible[x], dialogHideArgs, function ()
            {
                numHidden++;
                if (numHidden === numVisible)
                {
                    return callback(true);
                }
            });
        }
    };

    /**Awaitable. Hides all Dialogs asynchronously.
    @param {EVUI.Modules.Panes.PaneHideArgs} paneHideArgs Optional. A YOLO object representing the arguments for hiding a Dialog. If omitted, the Dialog's existing hide/unload settings are used instead.
    @returns {Promise<Boolean>} */
    this.hideAllDialogsAsync = function (paneHideArgs)
    {
        return new Promise(function (resolve)
        {
            _self.hideAllDialogs(paneHideArgs, function (success)
            {
                resolve(success);
            });
        });
    };

    /**Asynchronously loads a Dialog. Provides a callback that is called after the operation has completed successfully or otherwise.
    @param {EVUI.Modules.Dialogs.Dialog|String} dialogOrID Either a YOLO Dialog object to extend into the existing Dialog, the real Dialog reference, or the string ID of the Dialog to load.
    @param {EVUI.Modules.Dialogs.DialogLoadArgs|EVUI.Modules.Dialogs.Constants.Fn_DialogOperationCallback} dialogLoadArgs Optional. A YOLO object representing arguments for loading a Dialog or a callback. If omitted or passed as a function, the Dialog's existing load settings are used instead.
    @param {EVUI.Modules.Dialogs.Constants.Fn_DialogOperationCallback} callback Optional. A callback to call once the operation completes.*/
    this.loadDialog = function (dialogOrID, dialogLoadArgs, callback)
    {
        var entry = getDialogAmbiguously(dialogOrID, false);

        var paneLoadArgs = new EVUI.Modules.Panes.PaneLoadArgs();
        paneLoadArgs.loadSettings = _settings.cloneLoadSettings(entry.pane.loadSettings);

        if (typeof dialogLoadArgs === "function")
        {
            callback = dialogLoadArgs;
            dialogLoadArgs = null;
        }
        else if (dialogLoadArgs != null && typeof dialogLoadArgs === "object")
        {
            dialogLoadArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Dialogs.DialogLoadArgs(paneLoadArgs), dialogLoadArgs, ["type"]);
            if (dialogLoadArgs.loadSettings != null)
            {
                dialogLoadArgs.loadSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Dialogs.DialogLoadSettings(paneLoadArgs.loadSettings), dialogLoadArgs.loadSettings);
            }
            else
            {
                dialogLoadArgs.loadSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Dialogs.DialogLoadSettings(paneLoadArgs.loadSettings), entry.wrapper.loadSettings);
            }
        }
        else
        {
            dialogLoadArgs = null;
        }

        if (dialogLoadArgs == null)
        {
            dialogLoadArgs = new EVUI.Modules.Dialogs.DialogLoadArgs(paneLoadArgs);
            dialogLoadArgs.loadSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Dialogs.DialogLoadSettings(paneLoadArgs.loadSettings), entry.wrapper.loadSettings);
        }

        _settings.currentActionArgs = makeCurrentActionArgs(dialogLoadArgs);
        _manager.loadPane(entry.pane.id, paneLoadArgs, callback);
    };

    /**Awaitable. Asynchronously loads a Dialog.
    @param {EVUI.Modules.Dialogs.Dialog|String} dialogOrID Either a YOLO Dialog object to extend into the existing Dialog, the real Dialog reference, or the string ID of the Dialog to load.
    @param {EVUI.Modules.Dialogs.DialogLoadArgs} dialogLoadArgs Optional. A YOLO object representing arguments for loading a Dialog.
    @returns {Promise<Boolean>}*/
    this.loadDialogAsync = function (dialogOrID, dialogLoadArgs)
    {
        return new Promise(function (resolve)
        {
            _self.loadDialog(dialogOrID, dialogLoadArgs, function (success)
            {
                resolve(success);
            });
        });
    };

    /**Asynchronously unloads a Dialog, which disconnects the Dialog's element and removes it from the DOM if it was loaded remotely. Provides a callback that is called after the operation has completed successfully or otherwise.
    @param {EVUI.Modules.Dialogs.Dialog|String} dialogOrID Either a YOLO Dialog object to extend into the existing Dialog, the real Dialog reference, or the string ID of the Dialog to unload.
    @param {EVUI.Modules.Dialogs.DialogUnloadArgs|EVUI.Modules.Dialogs.Constants.Fn_DialogOperationCallback} dialogUnloadArgs Optional. A YOLO object representing arguments for unloading a Dialog or a callback. If omitted or passed as a function, the Dialog's existing unload settings are used instead.
    @param {EVUI.Modules.Dialogs.Constants.Fn_DialogOperationCallback} callback Optional. A callback to call once the operation completes.*/
    this.unloadDialog = function (dialogOrID, dialogUnloadArgs, callback)
    {
        var entry = getDialogAmbiguously(dialogOrID);
        var paneUnloadArgs = new EVUI.Modules.Panes.PaneUnloadArgs();

        if (typeof dialogUnloadArgs === "function")
        {
            callback = dialogUnloadArgs;
            dialogUnloadArgs = null;
        }
        else if (dialogUnloadArgs != null && typeof dialogUnloadArgs === "object")
        {
            dialogUnloadArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Dialogs.DialogUnloadArgs(paneUnloadArgs), dialogUnloadArgs);
        }
        else
        {
            dialogUnloadArgs = null;
        }

        if (dialogUnloadArgs == null)
        {
            dialogUnloadArgs = new EVUI.Modules.Dialogs.DialogUnloadArgs(paneUnloadArgs);
        }

        _settings.currentActionArgs = makeCurrentActionArgs(dialogUnloadArgs);
        _manager.unloadPane(entry.pane.id, paneUnloadArgs, callback);
    };

    /**Awaitable. Asynchronously unloads a Dialog, which disconnects the Dialog's element and removes it from the DOM if it was loaded remotely.
    @param {EVUI.Modules.Dialogs.Dialog|String} dialogOrID Either a YOLO Dialog object to extend into the existing Dialog, the real Dialog reference, or the string ID of the Dialog to unload.
    @param {EVUI.Modules.Dialogs.DialogUnloadArgs} dialogUnloadArgs Optional. A YOLO object representing arguments for unloading a Dialog. If omitted the Dialog's existing unload settings are used instead.
    @returns {Promise<Boolean>}*/
    this.unloadDialogAsync = function (dialogOrID, dialogUnloadArgs)
    {
        return new Promise(function (resolve)
        {
            _self.unloadDialog(dialogOrID, dialogUnloadArgs, function (success)
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
        var dialog = createResult.pane.dialog;
        delete createResult.pane.dialog;

        return makeOrExtendDialog(dialog, createResult.pane, createResult.exists);
    };

    /**Builds the DialogEventArgs to use in the EventStream.
    @param {EVUI.Modules.Panes.PaneArgsPackage} argsPackage The argument data from the PaneManager about the current state of the Dialog.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The PaneEventArgs that were created for the event.
    @returns {EVUI.Modules.Dialogs.DialogEventArgs} */
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

        var dialogEventArgs = new EVUI.Modules.Dialogs.DialogEventArgs(argsPackage, args);
        dialogEventArgs.cancel = paneEventArgs.cancel;
        dialogEventArgs.key = paneEventArgs.key;
        dialogEventArgs.pause = paneEventArgs.pause;
        dialogEventArgs.resume = paneEventArgs.resume;
        dialogEventArgs.stopPropagation = paneEventArgs.stopPropagation;
        dialogEventArgs.context = paneEventArgs.context;

        return dialogEventArgs;
    };

    /**Makes the foreign arguments for injecting into a DialogEventArgs object from the PaneManager.
    @param {EVUI.Modules.Dialogs.DialogShowArgs|EVUI.Modules.Dialogs.DialogHideArgs|EVUI.Modules.Dialogs.DialogLoadArgs|EVUI.Modules.Dialogs.DialogUnloadArgs} dialogArgs
    @returns {EVUI.Modules.Panes.PaneArgsPackage}.*/
    var makeCurrentActionArgs = function (dialogArgs)
    {
        var currentActionArgs = new EVUI.Modules.Panes.PaneArgsPackage();
        if (dialogArgs.type === EVUI.Modules.Dialogs.DialogArgumentType.Hide)
        {
            currentActionArgs.hideArgs = dialogArgs;
            currentActionArgs.unloadArgs = dialogArgs.unloadArgs;
        }
        else if (dialogArgs.type === EVUI.Modules.Dialogs.DialogArgumentType.Show)
        {
            currentActionArgs.showArgs = dialogArgs;
            currentActionArgs.loadArgs = dialogArgs.loadArgs;
        }
        else if (dialogArgs.type === EVUI.Modules.Dialogs.DialogArgumentType.Load)
        {
            currentActionArgs.loadArgs = dialogArgs;
        }
        else if (dialogArgs.type === EVUI.Modules.Dialogs.DialogArgumentType.Unload)
        {
            currentActionArgs.unloadArgs = dialogArgs;
        }

        return currentActionArgs;
    };

    /**Makes the "foreign" arguments for the PaneManager if it does not have them already.
    @param {EVUI.Modules.Panes.PaneArgsPackage} argsPackage The state of the Dialog as reported by the Panemanager.
    @returns {EVUI.Modules.Panes.WidowArgsPackage}*/
    var createForeignArgs = function (argsPackage)
    {
        var foreignArgs = new EVUI.Modules.Panes.PaneArgsPackage();
        if (argsPackage.hideArgs != null)
        {
            foreignArgs.hideArgs = new EVUI.Modules.Dialogs.DialogHideArgs(argsPackage.hideArgs);
            foreignArgs.hideArgs.unloadArgs = new EVUI.Modules.Dialogs.DialogUnloadArgs(argsPackage.hideArgs.unloadArgs);
        }

        if (argsPackage.showArgs != null)
        {
            foreignArgs.showArgs = new EVUI.Modules.Dialogs.DialogShowArgs(argsPackage.showArgs);
            foreignArgs.showArgs.showSettings = new EVUI.Modules.Dialogs.DialogShowSettings(argsPackage.showArgs.showSettings);
            foreignArgs.showArgs.loadArgs = new EVUI.Modules.Dialogs.DialogLoadArgs(argsPackage.showArgs.loadArgs);
            foreignArgs.showArgs.loadArgs.loadSettings = new EVUI.Modules.Dialogs.DialogLoadSettings(argsPackage.showArgs.loadArgs.loadSettings);
        }

        if (argsPackage.loadArgs != null)
        {
            foreignArgs.loadArgs = new EVUI.Modules.Dialogs.DialogLoadArgs(argsPackage.loadArgs);
            foreignArgs.loadArgs.loadSettings = new EVUI.Modules.Dialogs.DialogLoadSettings(argsPackage.loadArgs.loadSettings);
        }

        if (argsPackage.unloadArgs != null)
        {
            foreignArgs.unloadArgs = new EVUI.Modules.Dialogs.DialogUnloadArgs(argsPackage.unloadArgs);
        }

        return foreignArgs;
    };

    /**Makes or extends a Dialog object. Preserves all object references between runs and extends new properties onto the existing objects if they exist. 
    @param {EVUI.Modules.Dialogs.Dialog} yoloDialog A YOLO object representing a Dialog.
    @returns {EVUI.Modules.Dialogs.Dialog} */
    var makeOrExtendDialog = function (yoloDialog, pane, exists)
    {
        var dialogToExtend = null;
        if (exists === true)
        {
            var preExisting = _settings.getPaneEntry(yoloDialog.id);
            dialogToExtend = preExisting.wrapper;
        }
        else
        {
            dialogToExtend = new EVUI.Modules.Dialogs.Dialog(pane);
        }

        var safeCopy = EVUI.Modules.Core.Utils.shallowExtend({}, yoloDialog);
        delete safeCopy.id;
        if (exists === true && yoloDialog.element === pane.element) delete safeCopy.element; //if the dialog already exists and this is the same reference, don't set it again. Otherwise, let it blow up.
        delete safeCopy.currentPosition;
        delete safeCopy.currentZIndex;
        delete safeCopy.isVisible;
        delete safeCopy.isInitialized;
        delete safeCopy.isLoaded;

        EVUI.Modules.Core.Utils.shallowExtend(dialogToExtend, safeCopy, ["showSettings", "loadSettings", "autoCloseSettings", "resizeMoveSettings"]);
        dialogToExtend.showSettings = EVUI.Modules.Core.Utils.makeOrExtendObject(new EVUI.Modules.Dialogs.DialogShowSettings(pane.showSettings), dialogToExtend.showSettings, yoloDialog.showSettings);
        dialogToExtend.loadSettings = EVUI.Modules.Core.Utils.makeOrExtendObject(new EVUI.Modules.Dialogs.DialogLoadSettings(pane.loadSettings), dialogToExtend.loadSettings, yoloDialog.loadSettings);
        dialogToExtend.autoCloseSettings = EVUI.Modules.Core.Utils.makeOrExtendObject(new EVUI.Modules.Dialogs.DialogAutoCloseSettings(pane.autoCloseSettings), dialogToExtend.autoCloseSettings, yoloDialog.autoCloseSettings);
        dialogToExtend.resizeMoveSettings = EVUI.Modules.Core.Utils.makeOrExtendObject(new EVUI.Modules.Dialogs.DialogResizeMoveSettings(pane.resizeMoveSettings), dialogToExtend.resizeMoveSettings, yoloDialog.resizeMoveSettings)
        return dialogToExtend;
    };

    /**Gets a Dialog object from ambiguous input.
    @param {EVUI.Modules.Dialogs.Dialog|String|Event} dialogOrID Either a YOLO object representing a Dialog object, a string ID of a Dialog, or browser Event args triggering a Dialog action.
    @param {Boolean} addIfMissing Whether or not to add the Dialog record if it is not already present.
    @returns {EVUI.Modules.Panes.PaneEntry} */
    var getDialogAmbiguously = function (dialogOrID, addIfMissing)
    {
        if (dialogOrID == null || (typeof dialogOrID !== "string" && typeof dialogOrID !== "object")) throw Error("Invalid input: " + _settings.objectName + " or string id expected.");

        if (dialogOrID instanceof Event)
        {
            var entry = _settings.getPaneEntryAmbiguously(dialogOrID, addIfMissing);
            return entry;
        }

        var fakePane = {};
        if (typeof dialogOrID === "string")
        {
            fakePane = getDefaultPane({ id: dialogOrID });
        }
        else
        {
            fakePane.id = dialogOrID.id;
            fakePane.dialog = dialogOrID;
        }

        return _settings.getPaneEntryAmbiguously(fakePane, addIfMissing);
    };

    /**Gets a YOLO Pane object with all the default properties for a Dialog's backing Pane.
    @param {EVUI.Modules.Dialogs.Dialog} dialog The dialog to use as a wrapper for the Pane.
    @returns {EVUI.Modules.Panes.Pane}*/
    var getDefaultPane = function (dialog)
    {
        if (typeof dialog.id === "string")
        {
            var existing = _settings.getPaneEntry(dialog.id);
            if (existing != null && existing.pane != null)
            {
                var fake = EVUI.Modules.Core.Utils.shallowExtend({}, existing.pane);

                fake.dialog = dialog;
                return fake;
            }
        }

        var pane =
        {
            id: dialog.id,
            autoCloseSettings:
            {
                closeMode: EVUI.Modules.Panes.PaneCloseMode.Explicit,
                autoCloseKeys: ["Escape", "Enter"],
            },
            showSettings:
            {
                center: true,
            },
            clipSettings:
            {
                clipMode: EVUI.Modules.Dialogs.DialogClipMode.Shift,
                clipBounds: document.documentElement
            },
            resizeMoveSettings:
            {
                canDragMove: true,
                canResizeBottom: true,
                canResizeLeft: true,
                canResizeRight: true,
                canResizeTop: true,
                dragHanldeMargin: 20
            },
            
            dialog: dialog
        };

        return pane;
    };

    /**Interprets a browser event for a Dialog operation.
    @param {EVUI.Modules.Panes.Pane} pane The YOLO Pane being created to extend onto a real record.
    @param {Event} browserEvent The event from the browser.
    @returns {EVUI.Modules.Panes.Pane}*/
    var interpretBrowserEvent = function (pane, browserEvent)
    {
        EVUI.Modules.Core.Utils.shallowExtend(pane, getDefaultPane({ id: pane.id }));
        if (pane.showSettings == null) pane.showSettings = {};
        if (pane.resizeMoveSettings == null) pane.resizeMoveSettings = {};

        var attributes = EVUI.Modules.Core.Utils.getElementAttributes(browserEvent.currentTarget);

        var center = attributes.getValue(EVUI.Modules.Dialogs.Constants.Attribute_Center);
        var fullscreen = attributes.getValue(EVUI.Modules.Dialogs.Constants.Attribute_Fullscreen);
        var drag = attributes.getValue(EVUI.Modules.Dialogs.Constants.Attribute_Drag);
        var resizeHandles = attributes.getValue(EVUI.Modules.Dialogs.Constants.Attribute_ResizeHandles);
        var resizeHadleWidth = attributes.getValue(EVUI.Modules.Dialogs.Constants.Attribute_ResizeHandleWidth);
        var top = attributes.getValue(EVUI.Modules.Dialogs.Constants.Attribute_Top);
        var left = attributes.getValue(EVUI.Modules.Dialogs.Constants.Attribute_Left);
        var classes = attributes.getValue(EVUI.Modules.Dialogs.Constants.Attribute_Classes);

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

    /**Adds additional event handlers to the Dialog.
    @param {EVUI.Modules.Panes.PaneEntry} paneEntry The pane to add the event to.*/
    var hookUpEventHandlers = function (paneEntry)
    {
        setHighestZOrder(paneEntry);
    };

    /**Adds additional event handlers to the Dialog.
    @param {EVUI.Modules.Panes.PaneEntry} paneEntry The pane to add the event to.*/
    var setHighestZOrder = function (paneEntry)
    {
        paneEntry.pane.addEventBinding(paneEntry.pane.element, "mousedown", function (eventArgs)
        {
            var curZIndex = paneEntry.pane.currentZIndex;
            if (curZIndex >= EVUI.Modules.Panes.Constants.GlobalZIndex) return;

            EVUI.Modules.Panes.Constants.GlobalZIndex++;

            curZIndex = EVUI.Modules.Panes.Constants.GlobalZIndex;
            var selector = "." + paneEntry.paneCSSName + "." + EVUI.Modules.Dialogs.Constants.CSS_Position;

            EVUI.Modules.Styles.Manager.ensureSheet(_settings.cssSheetName, { lock: true });
            EVUI.Modules.Styles.Manager.setRules(_settings.cssSheetName, selector, { zIndex: curZIndex });
        });
    };

    _settings = new EVUI.Modules.Panes.PaneManagerSettings();
    _settings.attributePrefix = EVUI.Modules.Dialogs.Constants.Default_AttributePrefix;
    _settings.cssPrefix = EVUI.Modules.Dialogs.Constants.Default_CssPrefix;
    _settings.cssSheetName = EVUI.Modules.Styles.Constants.DefaultStyleSheetName;
    _settings.eventNamePrefix = EVUI.Modules.Dialogs.Constants.Default_EventNamePrefix;
    _settings.managerName = EVUI.Modules.Dialogs.Constants.Default_ManagerName;
    _settings.objectName = EVUI.Modules.Dialogs.Constants.Default_ObjectName;
    _settings.makeOrExtendObject = makeOrExtendObject;
    _settings.buildEventArgs = buildEventArgs;
    _settings.interpretBrowserEvent = interpretBrowserEvent;
    _settings.hookUpEventHandlers = hookUpEventHandlers
    _settings.manager = _self;

    if (services == null || typeof services !== "object") services = new EVUI.Modules.Dialogs.DialogControllerServices();
    if (services.paneManager == null || typeof services.paneManager !== "object")
    {
        services.paneManager = EVUI.Modules.Panes.Manager;
    }

    _settings.httpManager = services.httpManager;
    _settings.stylesheetManager = services.stylesheetManager;
    _settings.htmlLoader = services.htmlLoader;

    _manager = new services.paneManager.createNewPaneManager(_settings);

    /**Global event that fires before the load operation begins for any Dialog and is not yet in the DOM and cannot be manipulated in this stage, however the currentActionArgs.loadSettings can be manipulated to change the way the Dialog's root element will be loaded.
    @param {EVUI.Modules.Dialogs.DialogEventArgs} paneEventArgs The event arguments for the Dialog operation. The currentActionArgs property will be an instance of DialogLoadArgs.*/
    this.onLoad = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onLoad", targetPath: "onLoad" });

    /**Global even that fires after the load operation has completed for any Dialog and is now in the DOM and can be manipulated in this stage. From this point on the Dialog's element property cannot be reset..
    @param {EVUI.Modules.Dialogs.DialogEventArgs} paneEventArgs The event arguments for the Dialog operation. The currentActionArgs property will be an instance of DialogLoadArgs.*/
    this.onLoaded = function (paneEventArgs) { };;
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onLoaded", targetPath: "onLoaded" });

    /**Global event that fires the first time any Dialog is shown after being loaded into the DOM, but is not yet visible. After it has fired once, it will not fire again unless the DialogShowArgs.reInitialize property is set to true.
    @param {EVUI.Modules.Dialogs.DialogEventArgs} paneEventArgs The event arguments for the Dialog operation. The currentActionArgs property will be an instance of DialogShowArgs.*/
    this.onInitialize = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onInitialize", targetPath: "onInitialize" });

    /**Global event that fires at the beginning of the show process and before the calculations for any Dialog's location are made. The Dialog is still hidden, but is present in the DOM and can be manipulated. In order for the positioning calculations in the next step to be accurate, all HTML manipulation should occur in this event.
    @param {EVUI.Modules.Dialogs.DialogEventArgs} paneEventArgs The event arguments for the Dialog operation. The currentActionArgs property will be an instance of DialogShowArgs.*/
    this.onShow = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onShow", targetPath: "onShow" });

    /**Global event that fires after the position of any Dialog has been calculated and is available to be manipulated through the calculatedPosition property of the DialogEventArgs. If the calculatedPosition or the showSettings are manipulated, the position will be recalculated (the changes made directly to the position take priority over changes made to the showSettings).
    @param {EVUI.Modules.Dialogs.DialogEventArgs} paneEventArgs The event arguments for the Dialog operation. The currentActionArgs property will be an instance of DialogShowArgs.*/
    this.onPosition = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onPosition", targetPath: "onPosition" });

    /**Global event that fires once any Dialog has been positioned, shown, and had its optional show transition applied and completed. Marks the end of the show process.
    @param {EVUI.Modules.Dialogs.DialogEventArgs} paneEventArgs The event arguments for the Dialog operation. The currentActionArgs property will be an instance of DialogShowArgs.*/
    this.onShown = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onShown", targetPath: "onShown" });

    /**Global event that fires before any Dialog has been moved from its current location and hidden. Gives the opportunity to change the hideTransition property of the DialogHideArgs and optionally trigger an unload once the Dialog has been hidden.
    @param {EVUI.Modules.Dialogs.DialogEventArgs} paneEventArgs The event arguments for the Dialog operation. The currentActionArgs property will be an instance of DialogHideArgs.*/
    this.onHide = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onHide", targetPath: "onHide" });

    /**Global event that fires after any Dialog has been moved from its current location and is now hidden and the hide transition has completed.
    @param {EVUI.Modules.Dialogs.DialogEventArgs} paneEventArgs The event arguments for the Dialog operation. The currentActionArgs property will be an instance of DialogHideArgs.*/
    this.onHidden = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onHidden", targetPath: "onHidden" });

    /**Global event that fires before any Dialog has been (potentially) removed from the DOM and had its element property reset to null.
    @param {EVUI.Modules.Dialogs.DialogEventArgs} paneEventArgs The event arguments for the Dialog operation. The currentActionArgs property will be an instance of DialogUnloadArgs.*/
    this.onUnload = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onUnload", targetPath: "onUnload" });

    /**Global event that fires after any Dialog has been (potentially) removed from the DOM and had its element property reset to null. From this point on the Dialog's element property is now settable to a new Element.
    @param {EVUI.Modules.Dialogs.DialogEventArgs} paneEventArgs The event arguments for the Dialog operation. The currentActionArgs property will be an instance of DialogUnloadArgs.*/
    this.onUnloaded = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onUnloaded", targetPath: "onUnloaded" });
}

/**Represents a UI component that behaves like a standard, centered dialog dialog with an optional backdrop by default.
 @class*/
EVUI.Modules.Dialogs.Dialog = function (pane)
{
    if (pane == null) throw Error("Invalid input. Must wrap a Pane.");

    /**Object. The Dialog being wrapped by the Dialog.
    @type {EVUI.Modules.Panes.Pane}*/
    var _pane = pane;

    /**String. The unique ID of this Dialog. ID's are case-insensitive.
    @type {String}*/
    this.id = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "id", targetPath: "id", settings: { set: false } });

    /**Object. The root Element of the Dialog. Cannot be reset once it has been assigned to via initialization or a load operation, unload the Dialog to reset it.
    @type {Element}*/
    this.element = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "element", targetPath: "element" });

    /**Boolean. Whether or not to unload the Dialog from the DOM when it is hidden (only applies to elements that were loaded via HTTP). False by default.
    @type {Boolean}*/
    this.unloadOnHide = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "unloadOnHide", targetPath: "unloadOnHide" });

    /**Object. Calculates and gets the absolute position of the Dialog.
    @type {EVUI.Modules.Dom.ElementBounds}*/
    this.currentPosition = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "currentPosition", targetPath: "currentPosition", settings: { set: false } });

    /**Number. Calculates and gets the Z-Index of the Dialog.
    @type {Number}*/
    this.currentZIndex = -1;
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "currentZIndex", targetPath: "currentZIndex", settings: { set: false } });

    /**Boolean. Whether or not the internal state of the Dialog thinks it is visible or not. This will be true after the show process has completed and false after an unload or hide operation has been completed.
    @type {Boolean}*/
    this.isVisible = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "isVisible", targetPath: "isVisible", settings: { set: false } });

    /**Boolean. Whether or not the internal state of the Dialog thinks it is visible or not. This will be true after the load process has completed, even if the element was set directly before the first load operation.
    @type {Boolean}*/
    this.isLoaded = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "isLoaded", targetPath: "isLoaded", settings: { set: false } });

    /**Boolean. Whether or not the internal state of the Dialog thinks it has been initialized or not. This will be true after the onInitialized events fire. */
    this.isInitialized = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "isInitialized", targetPath: "isInitialized", settings: { set: false } });

    /**Object. Show settings for the Dialog.
    @type {EVUI.Modules.Dialogs.DialogShowSettings}*/
    this.showSettings = null;

    /**Object. Settings for loading the Dialog.
    @type {EVUI.Modules.Dialogs.DialogLoadSettings}*/
    this.loadSettings = null;

    /**Object. Settings for controlling what should automatically close the Dialog.
    @type {EVUI.Modules.Dialogs.DialogAutoCloseSettings}*/
    this.autoCloseSettings = null;

    /**Object. Settings for controller how the Dialog should resize and move itself.
    @type {EVUI.Modules.Dialogs.DialogResizeMoveSettings}*/
    this.resizeMoveSettings = null;

    /**Any. Any contextual information to attach to the Dialog object.
    @type {Any}*/
    this.context = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "context", targetPath: "context" });

    /**Event that fires before the load operation begins for the Dialog and is not yet in the DOM and cannot be manipulated in this stage, however the currentActionArgs.loadSettings can be manipulated to change the way the Dialog's root element will be loaded.
    @param {EVUI.Modules.Dialogs.DialogEventArgs} paneEventArgs The event arguments for the Dialog operation. The currentActionArgs property will be an instance of DialogLoadArgs.*/
    this.onLoad = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "onLoad", targetPath: "onLoad" });

    /**Event that fires after the load operation has completed for the Dialog and is now in the DOM and can be manipulated in this stage. From this point on the Dialog's element property cannot be reset..
    @param {EVUI.Modules.Dialogs.DialogEventArgs} paneEventArgs The event arguments for the Dialog operation. The currentActionArgs property will be an instance of DialogLoadArgs.*/
    this.onLoaded = function (paneEventArgs) { };;
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "onLoaded", targetPath: "onLoaded" });

    /**Event that fires the first time the Dialog is shown after being loaded into the DOM, but is not yet visible. After it has fired once, it will not fire again unless the DialogShowArgs.reInitialize property is set to true.
    @param {EVUI.Modules.Dialogs.DialogEventArgs} paneEventArgs The event arguments for the Dialog operation. The currentActionArgs property will be an instance of DialogShowArgs.*/
    this.onInitialize = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "onInitialize", targetPath: "onInitialize" });

    /**Event that fires at the beginning of the show process and before the calculations for the Dialog's location are made. The Dialog is still hidden, but is present in the DOM and can be manipulated. In order for the positioning calculations in the next step to be accurate, all HTML manipulation should occur in this event.
    @param {EVUI.Modules.Dialogs.DialogEventArgs} paneEventArgs The event arguments for the Dialog operation. The currentActionArgs property will be an instance of DialogShowArgs.*/
    this.onShow = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "onShow", targetPath: "onShow" });

    /**Event that fires after the position of the Dialog has been calculated and is available to be manipulated through the calculatedPosition property of the DialogEventArgs. If the calculatedPosition or the showSettings are manipulated, the position will be recalculated (the changes made directly to the position take priority over changes made to the showSettings).
    @param {EVUI.Modules.Dialogs.DialogEventArgs} paneEventArgs The event arguments for the Dialog operation. The currentActionArgs property will be an instance of DialogShowArgs.*/
    this.onPosition = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "onPosition", targetPath: "onPosition" });

    /**Event that fires once the Dialog has been positioned, shown, and had its optional show transition applied and completed. Marks the end of the show process.
    @param {EVUI.Modules.Dialogs.DialogEventArgs} paneEventArgs The event arguments for the Dialog operation. The currentActionArgs property will be an instance of DialogShowArgs.*/
    this.onShown = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "onShown", targetPath: "onShown" });

    /**Event that fires before the Dialog has been moved from its current location and hidden. Gives the opportunity to change the hideTransition property of the DialogHideArgs and optionally trigger an unload once the Dialog has been hidden.
    @param {EVUI.Modules.Dialogs.DialogEventArgs} paneEventArgs The event arguments for the Dialog operation. The currentActionArgs property will be an instance of DialogHideArgs.*/
    this.onHide = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "onHide", targetPath: "onHide" });

    /**Event that fires after the Dialog has been moved from its current location and is now hidden and the hide transition has completed.
    @param {EVUI.Modules.Dialogs.DialogEventArgs} paneEventArgs The event arguments for the Dialog operation. The currentActionArgs property will be an instance of DialogHideArgs.*/
    this.onHidden = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "onHidden", targetPath: "onHidden" });

    /**Event that fires before the Dialog has been (potentially) removed from the DOM and had its element property reset to null.
    @param {EVUI.Modules.Dialogs.DialogEventArgs} paneEventArgs The event arguments for the Dialog operation. The currentActionArgs property will be an instance of DialogUnloadArgs.*/
    this.onUnload = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "onUnload", targetPath: "onUnload" });

    /**Event that fires after the Dialog has been (potentially) removed from the DOM and had its element property reset to null. From this point on the Dialog's element property is now settable to a new Element.
    @param {EVUI.Modules.Dialogs.DialogEventArgs} paneEventArgs The event arguments for the Dialog operation. The currentActionArgs property will be an instance of DialogUnloadArgs.*/
    this.onUnloaded = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "onUnloaded", targetPath: "onUnloaded" });

    /**Returns a copy of the internal eventBindings array.
    @returns {EVUI.Modules.Panes.PaneEventBinding[]}*/
    this.getEventBindings = function ()
    {
        return _pane.getEventBindings();
    };

    /**Adds an event response to a standard browser event to a child element of the Dialog element.
    @param {Element} element The child element of the root pane element to attach an event handler to.
    @param {EVUI.Modules.Dom.Constants.Fn_BrowserEventHandler} handler An event handler to be called when the specified events are triggered.
    @param {String|String[]} event Either a single event name, or an array of event names, or a space delineated string of event names to add.*/
    this.addEventBinding = function (element, event, handler)
    {
        return _pane.addEventBinding(element, event, handler);
    };
};

/**The settings and options for showing a Dialog.
@class*/
EVUI.Modules.Dialogs.DialogShowSettings = function (showSettings)
{
    /**The show settings being set by the DialogShowSettings.
    @type {EVUI.Modules.Panes.PaneShowSettings}*/
    var _showSettings = (showSettings == null || typeof showSettings !== "object") ? new EVUI.Modules.Panes.PaneShowSettings() : showSettings;
    if (_showSettings.clipSettings == null) _showSettings.clipSettings = new EVUI.Modules.Panes.PaneClipSettings();
    if (_showSettings.absolutePosition == null) _showSettings.absolutePosition = new EVUI.Modules.Panes.PaneAbsolutePosition();

    /**Boolean. Whether or not to full screen the Dialog to cover the entire current view port. False by default.
    @type {Boolean}*/
    this.fullscreen = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "fullscreen", targetPath: "fullscreen" });

    /**Whether or not to explicitly position the Dialog so that it is centered on the screen's current view port. True by default.
    @type {Boolean}*/
    this.center = true;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "center", targetPath: "center" });

    /**If positioning the Dialog absolutely, this is the top coordinate of the Dialog.
    @type {Number}*/
    this.top = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "top", targetPath: "absolutePosition.top" });

    /**If positioning the Dialog absolutely, this is the left coordinate of the Dialog.
    @type {Number}*/
    this.left = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "left", targetPath: "absolutePosition.left" });

    /**String. The name of a CSS class (or an array of CSS classes, or a space-separated CSS classes) that are used to position the Dialog.
    @type {String|String[]}*/
    this.positionClass = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "positionClass", targetPath: "positionClass" });

    /**Object. Contains the details of the CSS transition to use to show the Dialog (if a transition is desired). If omitted, the Dialog is positioned then shown by manipulating the display property directly.
    @type {EVUI.Modules.Dialogs.DialogTransition}*/
    this.showTransition = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "showTransition", targetPath: "showTransition" })

    /**Object. Contains the details of the CSS transition to use to hide the Dialog (if a transition is desired). If omitted, the Dialog is positioned then shown by manipulating the display property directly.
    @type {EVUI.Modules.Dialogs.DialogTransition}*/
    this.hideTransition = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "hideTransition", targetPath: "hideTransition" })

    /**Object. An Element (or CSS selector of an Element) or an ElementBounds object describing the bounds to which the Dialog will attempt to fit inside. If omitted, the Dialog's current view port is used.
    @type {Element|EVUI.Modules.Dom.ElementBounds|String}*/
    this.clipBounds = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "clipBounds", targetPath: "clipSettings.clipBounds" })

    /**String. A value from the EVUI.Modules.Dialog.DialogClipMode enum indicating the behavior when the Pane spills outside of the clipBounds. Defaults to "overflow".
    @type {String}*/
    this.clipMode = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "clipMode", targetPath: "clipSettings.mode" })

    /**Boolean. Whether or not to include the height and width when positioning the element (when it is not clipped).
    @type {Boolean}*/
    this.setExplicitDimensions = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "setExplicitDimensions", targetPath: "setExplicitDimensions" })
};

/**Event arguments for the events exposed when hiding, showing, loading, or unloading a Dialog.
@class*/
EVUI.Modules.Dialogs.DialogEventArgs = function (argsPackage, currentArgs)
{
    if (argsPackage == null || currentArgs == null) throw Error("Invalid arguments.")

    /**Object. The metadata about the state of the Dialog.
    @type {EVUI.Modules.Panes.PaneArgsPackage}*/
    var _argsPackage = argsPackage;

    /**The current event args for the operation.
    @type {Any}*/
    var _currentArgs = currentArgs;

    /**The Dialog that is having an action performed on it.
    @type {EVUI.Modules.Panes.Dialog}*/
    this.dialog = null;
    Object.defineProperty(this, "dialog",
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

    /**Function. Cancels the EventStream and aborts the execution of the Dialog operation.*/
    this.cancel = function () { }

    /**Function. Stops the EventStream from calling any other event handlers with the same key.*/
    this.stopPropagation = function () { };

    /**Object. The position of the Dialog that has been calculated in using the currentShowSettings.
    @type {EVUI.Modules.Panes.PanePosition}*/
    this.calculatedPosition = null;
    Object.defineProperty(this, "calculatedPosition",
        {
            get: function () { return _argsPackage.lastCalculatedPosition; },
            configurable: false,
            enumerable: true
        });

    /**Object. The PaneHide/Show/Load/Unload Arguments being used for the operation.
    @type {EVUI.Modules.Dialogs.DialogShowArgs|EVUI.Modules.Dialogs.DialogHideArgs|EVUI.Modules.Dialogs.DialogLoadArgs|EVUI.Modules.Dialogs.DialogUnloadArgs}*/
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

/**Arguments for loading a Dialog.
 @class*/
EVUI.Modules.Dialogs.DialogLoadArgs = function (paneLoadArgs)
{
    /**The internal PaneLoadArgs being manipulated.
    @type {EVUI.Modules.Panes.PaneLoadArgs}*/
    var _loadArgs = (paneLoadArgs == null || typeof paneLoadArgs !== "object") ? new EVUI.Modules.Panes.PaneLoadArgs() : paneLoadArgs;

    /**String. The type of arguments contained within the object.
    @type {String}*/
    this.type = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _loadArgs, [{ sourcePath: "type", targetPath: "type" }]);

    /**Any. Any contextual information to pass into the Dialog load logic.
    @type {Any}*/
    this.context = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _loadArgs, [{ sourcePath: "context", targetPath: "context" }]);

    /**Object. The PaneLoadSettings to use if the Dialog has not already been loaded.
    @type {EVUI.Modules.Dialogs.DialogLoadSettings}*/
    this.loadSettings = null;

    /**Boolean. Whether or not to re-load the Dialog.
    @type {Boolean}*/
    this.reload = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _loadArgs, [{ sourcePath: "reload", targetPath: "reload" }]);
};

/**Arguments for showing a Dialog.
@class*/
EVUI.Modules.Dialogs.DialogShowArgs = function (paneShowArgs)
{
    /**The internal settings being set by the wrapper object.
    @type {EVUI.Modules.Panes.PaneShowArgs}*/
    var _paneShowArgs = (paneShowArgs == null || typeof paneShowArgs !== "object") ? new EVUI.Modules.Panes.PaneShowArgs() : paneShowArgs;

    /**String. The type of arguments contained within the object.
    @type {String}*/
    this.type = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneShowArgs, { sourcePath: "type", targetPath: "type", settings: { set: false } });

    /**Any. Any contextual information to pass into the Dialog show logic.
    @type {Any}*/
    this.context = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneShowArgs, { sourcePath: "context", targetPath: "context" });

    /**Object. The show settings for the Dialog.
    @type {EVUI.Modules.Dialogs.DialogShowSettings}*/
    this.showSettings = null;

    /**Object. The load arguments for loading the Dialog if it has not already been loaded.
    @type {EVUI.Modules.Dialogs.DialogLoadArgs}*/
    this.loadArgs = null;

    /**Whether or not to re-initialize the Dialog upon showing it.
    @type {Boolean}*/
    this.reInitialize = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneShowArgs, { sourcePath: "reInitialize", targetPath: "reInitialize" });
};

/**Arguments for hiding a Dialog.
@class*/
EVUI.Modules.Dialogs.DialogHideArgs = function (paneHideArgs)
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
    this.dialogHideTransition = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneHideArgs, { sourcePath: "dialogHideTransition", targetPath: "paneHideTransition" });

    this.unloadArgs = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneHideArgs, { sourcePath: "unloadArgs", targetPath: "unloadArgs" });
};

/**Arguments for unloading a Dialog.
@class*/
EVUI.Modules.Dialogs.DialogUnloadArgs = function (paneUnloadArgs)
{
    /**The internal settings being set by the wrapper object.
    @type {EVUI.Modules.Panes.PaneUnloadArgs}*/
    var _paneUnloadArgs = (paneUnloadArgs == null || typeof paneUnloadArgs !== "object") ? new EVUI.Modules.Panes.PaneUnloadArgs() : paneUnloadArgs;

    /**String. The type of arguments contained within the object.
    @type {String}*/
    this.type = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneUnloadArgs, { sourcePath: "type", targetPath: "type", settings: { set: false } });

    /**Any. Any contextual information to pass into the Dialog hide logic.
    @type {Any}*/
    this.context = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneUnloadArgs, { sourcePath: "context", targetPath: "context" });

    /**Boolean. Whether or not to remove the Dialog from the DOM once it has been unloaded.
    @type {Boolean}*/
    this.remove = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneUnloadArgs, { sourcePath: "remove", targetPath: "remove" });
};

/**Represents a transition effect that can be applied to a Dialog when its position or size changes.
@class*/
EVUI.Modules.Dialogs.DialogTransition = function ()
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

/**Settings and options for loading a Dialog.
@class */
EVUI.Modules.Dialogs.DialogLoadSettings = function (paneLoadSettings)
{
    var _paneLoadSettings = (paneLoadSettings == null || typeof paneLoadSettings !== "object") ? new EVUI.Modules.Panes.PaneLoadSettings() : paneLoadSettings;

    /**Object. The Element to show as the Dialog.
    @type {Element}*/
    this.element = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneLoadSettings, { sourcePath: "element", targetPath: "element" });

    /**String. A CSS selector that is used to go find the Element to show as the Dialog. Only the first result is used.
    @type {String}*/
    this.selector = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneLoadSettings, { sourcePath: "selector", targetPath: "selector" });

    /**Object. If using a CSS selector to find the root element of a Dialog, this is the context limiting element to search inside of.
    @type {Element}*/
    this.contextElement = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneLoadSettings, { sourcePath: "contextElement", targetPath: "contextElement" });

    /**Object. HttpRequestArgs for making a Http request to go get the Dialog's HTML.
    @type {EVUI.Modules.Http.HttpRequestArgs}*/
    this.httpLoadArgs = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneLoadSettings, { sourcePath: "httpLoadArgs", targetPath: "httpLoadArgs" });

    /**Object. PlaceholderLoadArgs for making a series of Http requests to load the Dialog as an existing placeholder.
    @type {EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadArgs}*/
    this.placeholderLoadArgs = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneLoadSettings, { sourcePath: "placeholderLoadArgs", targetPath: "placeholderLoadArgs" });
};

/**Settings for controlling how the Dialog will automatically close itself in response to user events.
@class*/
EVUI.Modules.Dialogs.DialogAutoCloseSettings = function (autoCloseSettings)
{
    var _autoCloseSettings = (autoCloseSettings == null || typeof autoCloseSettings !== "object") ? EVUI.Modules.Panes.PaneAutoCloseSettings() : autoCloseSettings;

    /**Array. An array of characters/key names ("a", "b", "Escape", "Enter" etc) that will automatically trigger the Dialog to be hidden when pressed. Corresponds to the KeyboardEvent.key property.
    @type {String[]}*/
    this.autoCloseKeys = [];
    EVUI.Modules.Core.Utils.wrapProperties(this, _autoCloseSettings, { sourcePath: "autoCloseKeys", targetPath: "autoCloseKeys" });

    /**An optional function to use to determine if an auto-close event should hide the Dialog. Return false to prevent the Dialog from being hidden.
    @param {EVUI.Modules.Panes.PaneAutoTriggerContext} autoTriggerContext The context object generated by the event handler.
    @returns {Boolean}*/
    this.autoCloseFilter = function (autoTriggerContext)
    {
        return true;
    };
    EVUI.Modules.Core.Utils.wrapProperties(this, _autoCloseSettings, { sourcePath: "autoCloseFilter", targetPath: "autoCloseFilter" });
};

/**Object for containing information about how the Pane can be resized in response to user action.
@class*/
EVUI.Modules.Dialogs.DialogResizeMoveSettings = function (resizeMoveSettings)
{
    var _resizeMoveSettings = (resizeMoveSettings == null || typeof resizeMoveSettings !== "object") ? new EVUI.Modules.Panes.PaneResizeMoveSettings() : resizeMoveSettings;

    /**Boolean. Whether or not the Pane can be moved around via a click and drag operation after the addition of the evui-dlg-drag-handle attribute to an element on or inside the root element of the Pane. True by default. */
    this.canDragMove = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _resizeMoveSettings, { sourcePath: "canDragMove", targetPath: "canDragMove" });

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

/**Object to inject the standard dependencies used by the DialogController into it via its constructor.
@class*/
EVUI.Modules.Dialogs.DialogControllerServices = function ()
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

/**Enum for indicating what type of arguments object the DialogEventArgs.currentArguments property is.
@enum*/
EVUI.Modules.Dialogs.DialogArgumentType =
{
    /**Arguments are DialogShowArgs.*/
    Show: "show",
    /**Arguments are DialogHideArgs.*/
    Hide: "hide",
    /**Arguments are DialogLoadArgs.*/
    Load: "load",
    /**Arguments are DialogUnloadArgs.*/
    Unload: "unload",
    /**Arguments are DialogMoveResizeArgs.*/
    MoveResize: "moveResize"
};
Object.freeze(EVUI.Modules.Dialogs.DialogArgumentType);

/**Enum for indicating the behavior of the Dialog when it overflows its clipBounds.
@enum*/
EVUI.Modules.Dialogs.DialogClipMode =
{
    /**When the calculated position of the Dialog overflows the clipBounds, it will not be cropped to stay within the clipBounds and will overflow to the outside of the clip bounds.*/
    Overflow: "overflow",
    /**When the calculated position of the Dialog overflows the clipBounds, it will be clipped to the maximum dimensions of the clipBounds on the overflowing axes.*/
    Clip: "clip",
    /**When the calculated position of the Dialog overflows the clipBounds, it will be shifted in the opposite directions as the overflow to fit within the clipBounds.*/
    Shift: "shift",
};
Object.freeze(EVUI.Modules.Dialogs.DialogClipMode);

/**Global instance of the DialogManager, used for creating and using simple dialogs that are positioned relative to a point or another element.
@type {EVUI.Modules.Dialogs.DialogManager}*/
EVUI.Modules.Dialogs.Manager = null;
(function ()
{
    var manager = null;
    var ctor = EVUI.Modules.Dialogs.DialogManager;  

    Object.defineProperty(EVUI.Modules.Dialogs, "Manager", {
        get: function ()
        {
            if (manager == null) manager = new ctor();
            return manager;
        },
        enumerable: true,
        configurable: false
    });
})();

Object.freeze(EVUI.Modules.Dialogs);

delete $evui.dialogs;

/**Global instance of the DialogManager, used for creating and using simple dialogs that are positioned relative to a point or another element.
@type {EVUI.Modules.Dialogs.DialogManager}*/
$evui.dialogs = null;
Object.defineProperty($evui, "dialogs", {
    get: function () { return EVUI.Modules.Dialogs.Manager; },
    enumerable: true
});

/**Adds a Dialog to the WidowManager.
@param {EVUI.Modules.Dialogs.Dialog} yoloDialog A YOLO object representing a Dialog object. This object is copied onto a real Dialog object is then discarded.
@returns {EVUI.Modules.Dialogs.Dialog}*/
$evui.addDialog = function (yoloDialog)
{
    return EVUI.Modules.Dialogs.Manager.addDialog(yoloDialog);
};

/**Shows (and loads, if necessary or if a reload is requested) a Dialog asynchronously. Provides a callback that is called call once the Dialog operation has completed successfully or otherwise.
@param {EVUI.Modules.Dialogs.Dialog|String} dialogOrID Either a YOLO Dialog object to extend into the existing Dialog, the real Dialog reference, or the string ID of the Dialog to show.
@param {EVUI.Modules.Dialogs.DialogShowArgs|EVUI.Modules.Dialogs.Constants.Fn_DialogOperationCallback} dialogShowArgs Optional. A YOLO object representing the arguments for showing the Dialog, or the callback. If omitted or passed as a function, the Dialog's existing show/load settings are used instead.
@param {EVUI.Modules.Dialogs.Constants.Fn_DialogOperationCallback} callback Optional. A callback that is called once the operation completes.*/
$evui.showDialog = function (dialogOrID, dialogShowArgs, callback)
{
    return EVUI.Modules.Dialogs.Manager.showDialog(dialogOrID, dialogShowArgs, callback);
};

/**Awaitable. (and loads, if necessary or if a reload is requested) a Dialog asynchronously.
@param {EVUI.Modules.Dialogs.Dialog|String} dialogOrID Either a YOLO Dialog object to extend into the existing Dialog, the real Dialog reference, or the string ID of the Dialog to show.
@param {EVUI.Modules.Dialogs.DialogShowArgs} dialogShowArgs Optional.  A YOLO object representing the arguments for showing the Dialog. If omitted, the Dialog's existing show/load settings are used instead.
@returns {Promise<Boolean>}*/
$evui.showDialogAsync = function (dialogOrID, dialogShowArgs)
{
    return EVUI.Modules.Dialogs.Manager.showDialogAsync(dialogOrID, dialogShowArgs);
};

/**Hides (and unloads if requested) a Dialog asynchronously. Provides a callback that is called call once the Dialog operation has completed successfully or otherwise.
@param {EVUI.Modules.Dialogs.Dialog|String} dialogOrID Either a YOLO Dialog object to extend into the existing Dialog, the real Dialog reference, or the string ID of the Dialog to hide.
@param {EVUI.Modules.Dialogs.DialogHideArgs|EVUI.Modules.Dialogs.Constants.Fn_DialogOperationCallback} dialogHideArgs Optional.  A YOLO object representing the arguments for hiding a Dialog or the callback. If omitted or passed as a function, the Dialog's existing hide/unload settings are used instead.
@param {EVUI.Modules.Dialogs.Constants.Fn_DialogOperationCallback} callback Optional. A callback that is called once the operation completes.*/
$evui.hideDialog = function (dialogOrID, dialogHideArgs, callback)
{
    return EVUI.Modules.Dialogs.Manager.hideDialog(dialogOrID, dialogHideArgs, callback);
};

/**Awaitable. Hides (and unloads if requested) a Dialog asynchronously. Provides a callback that is called call once the Dialog operation has completed successfully or otherwise.
@param {EVUI.Modules.Dialogs.Dialog|String} dialogOrID Either a YOLO Dialog object to extend into the existing Dialog, the real Dialog reference, or the string ID of the Dialog to hide.
@param {EVUI.Modules.Dialogs.DialogHideArgs} dialogHideArgs Optional.  A YOLO object representing the arguments for hiding a Dialog. If omitted, the Dialog's existing hide/unload settings are used instead.
@returns {Promise<Boolean>}*/
$evui.hideDialogAsync = function (dialogOrID, dialogHideArgs)
{
    return EVUI.Modules.Dialogs.Manager.hideDialogAsync(dialogOrID, dialogHideArgs);
};

/*#ENDWRAP(Dialog)#*/