/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

/*#INCLUDES#*/

/*#BEGINWRAP(EVUI.Modules.Modal|Modal)#*/
/*#REPLACE(EVUI.Modules.Modal|Modal)#*/

/**Core module containing the Initialization and Utility functionality that is shared by all other modules.
@module*/
EVUI.Modules.Modals = {};

/*#MODULEDEF(Modal|"1.0";|"Modal")#*/
/*#VERSIONCHECK(EVUI.Modules.Modal|Modal)#*/

EVUI.Modules.Modals.Dependencies =
{
    Core: Object.freeze({ version: "1.0", required: true }),
    Panes: Object.freeze({ version: "1.0", required: true })
};

(function ()
{
    var checked = false;

    Object.defineProperty(EVUI.Modules.Modals.Dependencies, "checked",
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

Object.freeze(EVUI.Modules.Modals.Dependencies);

EVUI.Modules.Modals.Constants = {};

/**Function for selecting a PaneEntry object. Return true to select the PaneEntry parameter as part of the result set.
@param {EVUI.Modules.Modals.Modal} modal The PaneEntry providing metadata about a Modal object.
@returns {Boolean}*/
EVUI.Modules.Modals.Constants.Fn_ModalSelector = function (modal) { return true; }

/**Function for reporting whether or not a Modal was successfully Loaded.
@param {Boolean} success Whether or not the load operation completed successfully.*/
EVUI.Modules.Modals.Constants.Fn_LoadCallback = function (success) { };

/**Function for reporting whether or not an operation Modal was successful.
@param {Boolean} success Whether or not the operation completed successfully.*/
EVUI.Modules.Modals.Constants.Fn_ModalOperationCallback = function (success) { };

EVUI.Modules.Modals.Constants.CSS_Position = "evui-position";
EVUI.Modules.Modals.Constants.CSS_ClippedX = "evui-clipped-x";
EVUI.Modules.Modals.Constants.CSS_ClippedY = "evui-clipped-y";
EVUI.Modules.Modals.Constants.CSS_ScrollX = "evui-scroll-x";
EVUI.Modules.Modals.Constants.CSS_ScrollY = "evui-scroll-y"
EVUI.Modules.Modals.Constants.CSS_Transition_Show = "evui-transition-show";
EVUI.Modules.Modals.Constants.CSS_Transition_Hide = "evui-transition-hide";

/**String. The name of the ID attribute for the Modal, used to look up a definition of a Modal.
@type {String}*/
EVUI.Modules.Modals.Constants.Attribute_ID = "evui-m-id";

/**String. The name of the attribute that signifies which element should receive initial focus when the Modal is displayed.
@type {String}*/
EVUI.Modules.Modals.Constants.Attribute_Focus = "evui-m-focus";

/**String. The name of the attribute that signifies that a click event on the Element should close the Modal.
@type {String}*/
EVUI.Modules.Modals.Constants.Attribute_Close = "evui-m-close";

/**String. The name of the attribute on an element that triggers the showing of a Modal what the URL to get the Modal's HTML from is (Requires EVUI.Modules.Http).
@type {String}*/
EVUI.Modules.Modals.Constants.Attribute_SourceURL = "evui-m-src";

/**String. The name of the attribute on an element that triggers the showing of a Modal of what placeholder to load for the Modal's HTML (Requires EVUI.Modules.HtmlLoaderController).
@type {String}*/
EVUI.Modules.Modals.Constants.Attribute_PlaceholderID = "evui-m-placeholder-id";

/**String. The name of the attribute on an element that triggers the showing or hiding of a Modal whether or not the Modal should be unloaded when it is hidden.
@type {String}*/
EVUI.Modules.Modals.Constants.Attribute_UnloadOnHide = "evui-m-unload";

/**String. The name of the attribute on an element that triggers the showing or hiding of a Modal that is used to indicate special behavior as defined by a consumer of the Modal.
@type {String}*/
EVUI.Modules.Modals.Constants.Attribute_Context = "evui-m-cxt";

/**String. The name of the attribute on an element that triggers the showing of a Modal what CSS selector to use to find the element to show as the Modal. Only the first result will be used.
@type {String}*/
EVUI.Modules.Modals.Constants.Attribute_Selector = "evui-m-selector";

/**String. The name of the attribute on an element that triggers the showing of a Modal whether or not to center the modal on the screen.
@type {String}*/
EVUI.Modules.Modals.Constants.Attribute_Center = "evui-m-center";

/**String. The name of the attribute on an element that triggers the showing of a Modal whether or not to take up the entire screen.
@type {String}*/
EVUI.Modules.Modals.Constants.Attribute_Fullscreen = "evui-m-fullscreen";

/**String. The name of the attribute on an element that triggers the showing of a Modal whether or not to show a backdrop
@type {String}*/
EVUI.Modules.Modals.Constants.Attribute_Backdrop = "evui-m-show-backdrop";

EVUI.Modules.Modals.Constants.Default_ObjectName = "Modal";
EVUI.Modules.Modals.Constants.Default_ManagerName = "ModalManager";
EVUI.Modules.Modals.Constants.Default_CssPrefix = "evui-m";
EVUI.Modules.Modals.Constants.Default_EventNamePrefix = "evui.m";
EVUI.Modules.Modals.Constants.Default_AttributePrefix = "evui-m";

Object.freeze(EVUI.Modules.Modals.Constants);

/**Class for managing Modal object.
@class*/
EVUI.Modules.Modals.ModalManager = function (services)
{
    if (EVUI.Modules.Core == null) throw Error("Dependency missing: EVUI.Modules.Core is required.");
    EVUI.Modules.Core.Utils.requireAll(EVUI.Modules.Modals.Dependencies);

    var _self = this; //self-reference for closures

    /**The internal PaneManager of the ModalManager.
    @type {EVUI.Modules.Panes.PaneManager}*/
    var _manager = null;

    /**The settings overrides for the ModalManager.
    @type {EVUI.Modules.Panes.PaneManagerSettings}*/
    var _settings = null;

    /**Adds a Modal to the WidowManager.
    @param {EVUI.Modules.Modals.Modal} modal A YOLO object representing a Modal object. This object is copied onto a real Modal object is then discarded.
    @returns {EVUI.Modules.Modals.Modal}*/
    this.addModal = function (modal)
    {
        if (modal == null) throw Error(_settings.objectName + " cannot be null.");
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(modal.id) === true) throw Error(_settings.objectName + "must have an id that is a non-whitespace string.");

        var existing = _settings.getPaneEntry(modal.id);
        if (existing != null) throw Error("A " + _settings.objectName + " with an id of \"" + modal.id + "\" already exists.");

        _manager.addPane(getDefaultPane(modal));

        existing = _settings.getPaneEntry(modal.id);
        return existing.wrapper;
    };

    /**Removes a Modal from the ModalManager. Does not unload the Modal's element from the DOM.
    @param {EVUI.Modules.Modals.Modal|String} modalOrID
    @returns {Boolean}*/
    this.removeModal = function (modalOrID)
    {
        return _manager.removePane(modalOrID);
    };

    /**Gets a ModalEntry object based on its ID or a selector function.
    @param {EVUI.Modules.Modals.Constants.Fn_ModalSelector|String} modalIDOrSelector A selector function to select a Modal object (or multiple ModalEntry objects) or the ID of the Modal to get the ModalEntry for.
    @param {Boolean} getAllMatches If a selector function is provided, all the ModalEntries that satisfy the selector are included. Otherwise a single ModalEntry object is returned. False by default.
    @returns {EVUI.Modules.Modals.Modal|EVUI.Modules.Modals.Modal[]} */
    this.getModal = function (modalIDOrSelector, getAllMatches)
    {
        var entries = null;

        if (typeof modalIDOrSelector === "function")
        {
            entries = _settings.getPaneEntry(function () { return true; }, true).map(function (entry) { return entry.wrapper; }).filter(modalIDOrSelector);
            if (getAllMatches !== true && entries != null) return entries[0];
            return entries;
        }
        else
        {
            entries = _settings.getPaneEntry(modalIDOrSelector, getAllMatches);
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

    /**Shows (and loads, if necessary or if a reload is requested) a Modal asynchronously. Provides a callback that is called once the Modal operation has completed successfully or otherwise.
    @param {EVUI.Modules.Modals.Modal|String} modalOrID Either a YOLO Modal object to extend into the existing Modal, the real Modal reference, or the string ID of the Modal to show.
    @param {EVUI.Modules.Modals.ModalShowArgs|EVUI.Modules.Modals.Constants.Fn_ModalOperationCallback} modalShowArgs Optional.  The arguments for showing the Modal, or the callback. If omitted or passed as a function, the Modal's existing show/load settings are used instead.
    @param {EVUI.Modules.Modals.Constants.Fn_ModalOperationCallback} callback Optional. A callback that is called once the operation completes.*/
    this.showModal = function (modalOrID, modalShowArgs, callback)
    {
        var entry = getModalAmbiguously(modalOrID, true);

        var paneShowArgs = new EVUI.Modules.Panes.PaneShowArgs();
        paneShowArgs.showSettings = _settings.cloneShowSettings(entry.pane.showSettings);
        paneShowArgs.loadArgs = new EVUI.Modules.Panes.PaneLoadArgs();
        paneShowArgs.loadArgs.loadSettings = _settings.cloneLoadSettings(entry.pane.loadSettings);

        if (typeof modalShowArgs === "function")
        {
            callback = modalShowArgs;
            modalShowArgs = null;
        }
        else if (modalShowArgs != null && typeof modalShowArgs === "object")
        {
            modalShowArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Modals.ModalShowArgs(paneShowArgs), modalShowArgs, ["type"]);
            if (modalShowArgs.showSettings != null)
            {
                modalShowArgs.showSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Modals.ModalShowSettings(paneShowArgs.showSettings), modalShowArgs.showSettings);
            }
            else
            {
                modalShowArgs.showSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Modals.ModalShowSettings(paneShowArgs.showSettings), entry.wrapper.showSettings);
            }


            if (modalShowArgs.loadArgs != null && modalShowArgs.loadArgs.loadSettings != null)
            {
                modalShowArgs.loadArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Modals.ModalLoadArgs(paneShowArgs.loadArgs), modalShowArgs.loadArgs, ["type"]);
                modalShowArgs.loadArgs.loadSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Modals.ModalLoadSettings(paneShowArgs.loadArgs.loadSettings), modalShowArgs.loadArgs.loadSettings);
            }
            else
            {
                modalShowArgs.loadArgs = new EVUI.Modules.Modals.ModalLoadArgs(paneShowArgs.loadArgs);
                modalShowArgs.loadArgs.loadSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Modals.ModalLoadSettings(paneShowArgs.loadArgs.loadSettings), entry.wrapper.loadSettings, ["type"]);;
            }
        }
        else
        {
            modalShowArgs = null;
        }

        if (modalShowArgs == null)
        {
            modalShowArgs = new EVUI.Modules.Modals.ModalShowArgs(paneShowArgs);
            modalShowArgs.showSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Modals.ModalShowSettings(paneShowArgs.showSettings), entry.wrapper.showSettings);
            modalShowArgs.loadArgs = new EVUI.Modules.Modals.ModalLoadArgs(paneShowArgs.loadArgs);
            modalShowArgs.loadArgs.loadSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Modals.ModalLoadSettings(paneShowArgs.loadArgs.loadSettings), entry.wrapper.loadSettings);
        }

        _settings.currentActionArgs = makeCurrentActionArgs(modalShowArgs);

        _manager.showPane(entry.pane.id, paneShowArgs, callback);
    };

    /**Awaitable. (and loads, if necessary or if a reload is requested) a Modal asynchronously.
    @param {EVUI.Modules.Modals.Modal|String} modalOrID Either a YOLO Modal object to extend into the existing Modal, the real Modal reference, or the string ID of the Modal to show.
    @param {EVUI.Modules.Modals.ModalShowArgs} modalShowArgs Optional.  A YOLO object representing the arguments for showing the Modal. If omitted, the Modal's existing show/load settings are used instead.
    @returns {Promise<Boolean>}*/
    this.showModalAsync = function (modalOrID, modalShowArgs)
    {
        return new Promise(function (resolve)
        {
            _self.showModal(modalOrID, modalShowArgs, function (success)
            {
                resolve(success);
            });
        });
    };

    /**Hides (and unloads if requested) a Modal asynchronously. Provides a callback that is called call once the Modal operation has completed successfully or otherwise.
    @param {EVUI.Modules.Modals.Modal|String} modalOrID Either a YOLO Modal object to extend into the existing Modal, the real Modal reference, or the string ID of the Modal to hide.
    @param {EVUI.Modules.Modals.ModalHideArgs|EVUI.Modules.Modals.Constants.Fn_ModalOperationCallback} modalHideArgs Optional. A YOLO object representing arguments for hiding a Modal or a callback. If omitted or passed as a function, the Modal's existing hide/unload settings are used instead.
    @param {EVUI.Modules.Modals.Constants.Fn_ModalOperationCallback} callback Optional. A callback that is called once the operation completes.*/
    this.hideModal = function (modalOrID, modalHideArgs, callback)
    {
        var entry = getModalAmbiguously(modalOrID);

        var paneHideArgs = new EVUI.Modules.Panes.PaneHideArgs();
        paneHideArgs.unloadArgs = new EVUI.Modules.Panes.PaneUnloadArgs();

        if (typeof modalHideArgs === "function")
        {
            callback = modalHideArgs;
            modalHideArgs = null;
        }
        else if (modalHideArgs != null && typeof modalHideArgs === "object")
        {
            modalHideArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Modals.ModalHideArgs(paneHideArgs), modalHideArgs, ["type"]);
            modalHideArgs.unloadArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Modals.ModalUnloadArgs(paneHideArgs.unloadArgs, modalHideArgs.unloadArgs));
        }
        else
        {
            modalHideArgs = null;
        }


        if (modalHideArgs == null)
        {
            modalHideArgs = new EVUI.Modules.Modals.ModalHideArgs(paneHideArgs);
            modalHideArgs.unloadArgs = new EVUI.Modules.Modals.ModalUnloadArgs(paneHideArgs.unloadArgs);
        }

        _settings.currentActionArgs = makeCurrentActionArgs(modalHideArgs);
        _manager.hidePane(entry.pane.id, paneHideArgs, callback);
    };

    /**Awaitable. Hides (and unloads if requested) a Modal asynchronously.
    @param {EVUI.Modules.Modals.Modal|String} modalOrID Either a YOLO Modal object to extend into the existing Modal, the real Modal reference, or the string ID of the Modal to hide.
    @param {EVUI.Modules.Modals.ModalHideArgs} modalHideArgs Optional. A YOLO object representing the arguments for hiding a Modal. If omitted, the Modal's existing hide/unload settings are used instead.
    @returns {Promise<Boolean>}*/
    this.hideModalAsync = function (modalOrID, modalHideArgs)
    {
        return new Promise(function (resolve)
        {
            _self.hideModal(modalOrID, modalHideArgs, function (success)
            {
                resolve(success);
            });
        });
    };

    /**Hides all visible Modals asynchronously. Provides a callback function that is called once all the visible Modals have been hidden.
    @param {EVUI.Modules.Panes.ModalHideArgs} modalHideArgs Optional. A YOLO object representing the arguments for hiding a Modal. If omitted, the Modal's existing hide/unload settings are used instead.
    @param {EVUI.Modules.Panes.Constants.Fn_PaneOperationCallback} callback The callback that is called once all the Modal's hide operations have completed.*/
    this.hideAllModals = function (modalHideArgs, callback)
    {
        if (typeof callback !== "function") callback = function () { };
        var allVisible = this.getModal(function (dd) { return dd.isVisible; });
        var numVisible = allVisible.length;
        var numHidden = 0;

        if (numVisible === 0) return callback(true);

        for (var x = 0; x < numVisible; x++)
        {
            this.hideModal(allVisible[x], modalHideArgs, function ()
            {
                numHidden++;
                if (numHidden === numVisible)
                {
                    return callback(true);
                }
            });
        }
    };

    /**Awaitable. Hides all Modals asynchronously.
    @param {EVUI.Modules.Panes.PaneHideArgs} paneHideArgs Optional. A YOLO object representing the arguments for hiding a Modal. If omitted, the Modal's existing hide/unload settings are used instead.
    @returns {Promise<Boolean>} */
    this.hideAllModalsAsync = function (paneHideArgs)
    {
        return new Promise(function (resolve)
        {
            _self.hideAllModals(paneHideArgs, function (success)
            {
                resolve(success);
            });
        });
    };

    /**Asynchronously loads a Modal. Provides a callback that is called after the operation has completed successfully or otherwise.
    @param {EVUI.Modules.Modals.Modal|String} modalOrID Either a YOLO Modal object to extend into the existing Modal, the real Modal reference, or the string ID of the Modal to load.
    @param {EVUI.Modules.Modals.ModalLoadArgs|EVUI.Modules.Modals.Constants.Fn_ModalOperationCallback} modalLoadArgs Optional. A YOLO object representing arguments for loading a Modal or a callback. If omitted or passed as a function, the Modal's existing load settings are used instead.
    @param {EVUI.Modules.Modals.Constants.Fn_ModalOperationCallback} callback Optional. A callback to call once the operation completes.*/
    this.loadModal = function (modalOrID, modalLoadArgs, callback)
    {
        var entry = getModalAmbiguously(modalOrID, false);

        var paneLoadArgs = new EVUI.Modules.Panes.PaneLoadArgs();
        paneLoadArgs.loadSettings = _settings.cloneLoadSettings(entry.pane.loadSettings);

        if (typeof modalLoadArgs === "function")
        {
            callback = modalLoadArgs;
            modalLoadArgs = null;
        }
        else if (modalLoadArgs != null && typeof modalLoadArgs === "object")
        {
            modalLoadArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Modals.ModalLoadArgs(paneLoadArgs), modalLoadArgs, ["type"]);
            if (modalLoadArgs.loadSettings != null)
            {
                modalLoadArgs.loadSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Modals.ModalLoadSettings(paneLoadArgs.loadSettings), modalLoadArgs.loadSettings);
            }
            else
            {
                modalLoadArgs.loadSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Modals.ModalLoadSettings(paneLoadArgs.loadSettings), entry.wrapper.loadSettings);
            }
        }
        else
        {
            modalLoadArgs = null;
        }

        if (modalLoadArgs == null)
        {
            modalLoadArgs = new EVUI.Modules.Modals.ModalLoadArgs(paneLoadArgs);
            modalLoadArgs.loadSettings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Modals.ModalLoadSettings(paneLoadArgs.loadSettings), entry.wrapper.loadSettings);
        }

        _settings.currentActionArgs = makeCurrentActionArgs(modalLoadArgs);
        _manager.loadPane(entry.pane.id, paneLoadArgs, callback);
    };

    /**Awaitable. Asynchronously loads a Modal.
    @param {EVUI.Modules.Modals.Modal|String} modalOrID Either a YOLO Modal object to extend into the existing Modal, the real Modal reference, or the string ID of the Modal to load.
    @param {EVUI.Modules.Modals.ModalLoadArgs} modalLoadArgs Optional. A YOLO object representing arguments for loading a Modal.
    @returns {Promise<Boolean>}*/
    this.loadModalAsync = function (modalOrID, modalLoadArgs)
    {
        return new Promise(function (resolve)
        {
            _self.loadModal(modalOrID, modalLoadArgs, function (success)
            {
                resolve(success);
            });
        });
    };

    /**Asynchronously unloads a Modal, which disconnects the Modal's element and removes it from the DOM if it was loaded remotely. Provides a callback that is called after the operation has completed successfully or otherwise.
    @param {EVUI.Modules.Modals.Modal|String} modalOrID Either a YOLO Modal object to extend into the existing Modal, the real Modal reference, or the string ID of the Modal to unload.
    @param {EVUI.Modules.Modals.ModalUnloadArgs|EVUI.Modules.Modals.Constants.Fn_ModalOperationCallback} modalUnloadArgs Optional. A YOLO object representing arguments for unloading a Modal or a callback. If omitted or passed as a function, the Modal's existing unload settings are used instead.
    @param {EVUI.Modules.Modals.Constants.Fn_ModalOperationCallback} callback Optional. A callback to call once the operation completes.*/
    this.unloadModal = function (modalOrID, modalUnloadArgs, callback)
    {
        var entry = getModalAmbiguously(modalOrID);
        var paneUnloadArgs = new EVUI.Modules.Panes.PaneUnloadArgs();

        if (typeof modalUnloadArgs === "function")
        {
            callback = modalUnloadArgs;
            modalUnloadArgs = null;
        }
        else if (modalUnloadArgs != null && typeof modalUnloadArgs === "object")
        {
            modalUnloadArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Modals.ModalUnloadArgs(paneUnloadArgs), modalUnloadArgs);
        }
        else
        {
            modalUnloadArgs = null;
        }

        if (modalUnloadArgs == null)
        {
            modalUnloadArgs = new EVUI.Modules.Modals.ModalUnloadArgs(paneUnloadArgs);
        }

        _settings.currentActionArgs = makeCurrentActionArgs(modalUnloadArgs);
        _manager.unloadPane(entry.pane.id, paneUnloadArgs, callback);
    };

    /**Awaitable. Asynchronously unloads a Modal, which disconnects the Modal's element and removes it from the DOM if it was loaded remotely.
    @param {EVUI.Modules.Modals.Modal|String} modalOrID Either a YOLO Modal object to extend into the existing Modal, the real Modal reference, or the string ID of the Modal to unload.
    @param {EVUI.Modules.Modals.ModalUnloadArgs} modalUnloadArgs Optional. A YOLO object representing arguments for unloading a Modal. If omitted the Modal's existing unload settings are used instead.
    @returns {Promise<Boolean>}*/
    this.unloadModalAsync = function (modalOrID, modalUnloadArgs)
    {
        return new Promise(function (resolve)
        {
            _self.unloadModal(modalOrID, modalUnloadArgs, function (success)
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
        var modal = createResult.pane.modal;
        delete createResult.pane.modal;

        return makeOrExtendModal(modal, createResult.pane, createResult.exists);
    };

    /**Builds the ModalEventArgs to use in the EventStream.
    @param {EVUI.Modules.Panes.PaneArgsPackage} argsPackage The argument data from the PaneManager about the current state of the Modal.
    @param {EVUI.Modules.Panes.PaneEventArgs} paneEventArgs The PaneEventArgs that were created for the event.
    @returns {EVUI.Modules.Modals.ModalEventArgs} */
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

        var modalEventArgs = new EVUI.Modules.Modals.ModalEventArgs(argsPackage, args);
        modalEventArgs.cancel = paneEventArgs.cancel;
        modalEventArgs.key = paneEventArgs.key;
        modalEventArgs.pause = paneEventArgs.pause;
        modalEventArgs.resume = paneEventArgs.resume;
        modalEventArgs.stopPropagation = paneEventArgs.stopPropagation;
        modalEventArgs.context = paneEventArgs.context;

        return modalEventArgs;
    };

    /**Makes the foreign arguments for injecting into a ModalEventArgs object from the PaneManager.
    @param {EVUI.Modules.Modals.ModalShowArgs|EVUI.Modules.Modals.ModalHideArgs|EVUI.Modules.Modals.ModalLoadArgs|EVUI.Modules.Modals.ModalUnloadArgs} modalArgs
    @returns {EVUI.Modules.Panes.PaneArgsPackage}.*/
    var makeCurrentActionArgs = function (modalArgs)
    {
        var currentActionArgs = new EVUI.Modules.Panes.PaneArgsPackage();
        if (modalArgs.type === EVUI.Modules.Modals.ModalArgumentType.Hide)
        {
            currentActionArgs.hideArgs = modalArgs;
            currentActionArgs.unloadArgs = modalArgs.unloadArgs;
        }
        else if (modalArgs.type === EVUI.Modules.Modals.ModalArgumentType.Show)
        {
            currentActionArgs.showArgs = modalArgs;
            currentActionArgs.loadArgs = modalArgs.loadArgs;
        }
        else if (modalArgs.type === EVUI.Modules.Modals.ModalArgumentType.Load)
        {
            currentActionArgs.loadArgs = modalArgs;
        }
        else if (modalArgs.type === EVUI.Modules.Modals.ModalArgumentType.Unload)
        {
            currentActionArgs.unloadArgs = modalArgs;
        }

        return currentActionArgs;
    };

    /**Makes the "foreign" arguments for the PaneManager if it does not have them already.
    @param {EVUI.Modules.Panes.PaneArgsPackage} argsPackage The state of the Modal as reported by the Panemanager.
    @returns {EVUI.Modules.Panes.WidowArgsPackage}*/
    var createForeignArgs = function (argsPackage)
    {
        var foreignArgs = new EVUI.Modules.Panes.PaneArgsPackage();
        if (argsPackage.hideArgs != null)
        {
            foreignArgs.hideArgs = new EVUI.Modules.Modals.ModalHideArgs(argsPackage.hideArgs);
            foreignArgs.hideArgs.unloadArgs = new EVUI.Modules.Modals.ModalUnloadArgs(argsPackage.hideArgs.unloadArgs);
        }

        if (argsPackage.showArgs != null)
        {
            foreignArgs.showArgs = new EVUI.Modules.Modals.ModalShowArgs(argsPackage.showArgs);
            foreignArgs.showArgs.showSettings = new EVUI.Modules.Modals.ModalShowSettings(argsPackage.showArgs.showSettings);
            foreignArgs.showArgs.loadArgs = new EVUI.Modules.Modals.ModalLoadArgs(argsPackage.showArgs.loadArgs);
            foreignArgs.showArgs.loadArgs.loadSettings = new EVUI.Modules.Modals.ModalLoadSettings(argsPackage.showArgs.loadArgs.loadSettings);
        }

        if (argsPackage.loadArgs != null)
        {
            foreignArgs.loadArgs = new EVUI.Modules.Modals.ModalLoadArgs(argsPackage.loadArgs);
            foreignArgs.loadArgs.loadSettings = new EVUI.Modules.Modals.ModalLoadSettings(argsPackage.loadArgs.loadSettings);
        }

        if (argsPackage.unloadArgs != null)
        {
            foreignArgs.unloadArgs = new EVUI.Modules.Modals.ModalUnloadArgs(argsPackage.unloadArgs);
        }

        return foreignArgs;
    };

    /**Makes or extends a Modal object. Preserves all object references between runs and extends new properties onto the existing objects if they exist. 
    @param {EVUI.Modules.Modals.Modal} yoloModal A YOLO object representing a Modal.
    @returns {EVUI.Modules.Modals.Modal} */
    var makeOrExtendModal = function (yoloModal, pane, exists)
    {
        var modalToExtend = null;
        if (exists === true)
        {
            var preExisting = _settings.getPaneEntry(yoloModal.id);
            modalToExtend = preExisting.wrapper;
        }
        else
        {
            modalToExtend = new EVUI.Modules.Modals.Modal(pane);
        }

        var safeCopy = EVUI.Modules.Core.Utils.shallowExtend({}, yoloModal);
        delete safeCopy.id;
        if (exists === true && yoloModal.element === pane.element) delete safeCopy.element; //if the modal already exists and this is the same reference, don't set it again. Otherwise, let it blow up.
        delete safeCopy.currentPosition;
        delete safeCopy.currentZIndex;
        delete safeCopy.isVisible;
        delete safeCopy.isInitialized;
        delete safeCopy.isLoaded;

        EVUI.Modules.Core.Utils.shallowExtend(modalToExtend, safeCopy, ["showSettings", "loadSettings", "autoCloseSettings"]);
        modalToExtend.showSettings = EVUI.Modules.Core.Utils.makeOrExtendObject(new EVUI.Modules.Modals.ModalShowSettings(pane.showSettings), modalToExtend.showSettings, yoloModal.showSettings);
        modalToExtend.loadSettings = EVUI.Modules.Core.Utils.makeOrExtendObject(new EVUI.Modules.Modals.ModalLoadSettings(pane.loadSettings), modalToExtend.loadSettings, yoloModal.loadSettings);
        modalToExtend.autoCloseSettings = EVUI.Modules.Core.Utils.makeOrExtendObject(new EVUI.Modules.Modals.ModalAutoCloseSettings(pane.autoCloseSettings), modalToExtend.autoCloseSettings, yoloModal.autoCloseSettings);
        return modalToExtend;
    };

    /**Gets a Modal object from ambiguous input.
    @param {EVUI.Modules.Modals.Modal|String|Event} modalOrID Either a YOLO object representing a Modal object, a string ID of a Modal, or browser Event args triggering a Modal action.
    @param {Boolean} addIfMissing Whether or not to add the Modal record if it is not already present.
    @returns {EVUI.Modules.Panes.PaneEntry} */
    var getModalAmbiguously = function (modalOrID, addIfMissing)
    {
        if (modalOrID == null || (typeof modalOrID !== "string" && typeof modalOrID !== "object")) throw Error("Invalid input: " + _settings.objectName + " or string id expected.");

        if (modalOrID instanceof Event)
        {
            var entry = _settings.getPaneEntryAmbiguously(modalOrID, addIfMissing);
            return entry;
        }

        var fakePane = {};
        if (typeof modalOrID === "string")
        {
            fakePane = getDefaultPane({ id: modalOrID });
        }
        else
        {
            fakePane.id = modalOrID.id;
            fakePane.modal = modalOrID;
        }

        return _settings.getPaneEntryAmbiguously(fakePane, addIfMissing);
    };

    /**Gets a YOLO Pane object with all the default properties for a Modal's backing Pane.
    @param {EVUI.Modules.Modals.Modal} modal The modal to use as a wrapper for the Pane.
    @returns {EVUI.Modules.Panes.Pane}*/
    var getDefaultPane = function (modal)
    {
        if (typeof modal.id === "string")
        {
            var existing = _settings.getPaneEntry(modal.id);
            if (existing != null && existing.pane != null)
            {
                var fake = EVUI.Modules.Core.Utils.shallowExtend({}, existing.pane);

                fake.modal = modal;
                return fake;
            }
        }

        var pane =
        {
            id: modal.id,
            autoCloseSettings:
            {
                closeMode: EVUI.Modules.Panes.PaneCloseMode.Explicit,
                autoCloseKeys: ["Escape", "Enter"],
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
                clipMode: EVUI.Modules.Modals.ModalClipMode.Clip,
                clipBounds: document.documentElement
            },
            modal: modal
        };

        return pane;
    };

    /**Interprets a browser event for a Modal operation.
    @param {EVUI.Modules.Panes.Pane} pane The YOLO Pane being created to extend onto a real record.
    @param {Event} browserEvent The event from the browser.
    @returns {EVUI.Modules.Panes.Pane}*/
    var interpretBrowserEvent = function (pane, browserEvent)
    {
        EVUI.Modules.Core.Utils.shallowExtend(pane, getDefaultPane({ id: pane.id }));

        if (pane.showSettings == null) pane.showSettings = {};
        if (pane.showSettings.backdropSettings == null) pane.showSettings.backdropSettings = {};

        var attributes = EVUI.Modules.Core.Utils.getElementAttributes(browserEvent.currentTarget);

        var backdrop = attributes.getValue(EVUI.Modules.Modals.Constants.Attribute_Backdrop);
        var center = attributes.getValue(EVUI.Modules.Modals.Constants.Attribute_Center);
        var fullscreen = attributes.getValue(EVUI.Modules.Modals.Constants.Attribute_Fullscreen);

        if (typeof backdrop === "string")
        {
            backdrop = backdrop.toLowerCase();

            if (backdrop === "false")
            {
                pane.showSettings.backdropSettings.showBackdrop = false;
            }
            else if (backdrop === "true")
            {
                pane.showSettings.backdropSettings.showBackdrop = true;
            }
        }

        if (typeof fullscreen === "string")
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

        if (typeof center === "string")
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

        return true;
    };

    _settings = new EVUI.Modules.Panes.PaneManagerSettings();
    _settings.attributePrefix = EVUI.Modules.Modals.Constants.Default_AttributePrefix;
    _settings.cssPrefix = EVUI.Modules.Modals.Constants.Default_CssPrefix;
    _settings.cssSheetName = EVUI.Modules.Styles.Constants.DefaultStyleSheetName;
    _settings.eventNamePrefix = EVUI.Modules.Modals.Constants.Default_EventNamePrefix;
    _settings.managerName = EVUI.Modules.Modals.Constants.Default_ManagerName;
    _settings.objectName = EVUI.Modules.Modals.Constants.Default_ObjectName;
    _settings.makeOrExtendObject = makeOrExtendObject;
    _settings.buildEventArgs = buildEventArgs;
    _settings.interpretBrowserEvent = interpretBrowserEvent;

    if (services == null || typeof services !== "object") services = new EVUI.Modules.Modals.ModalControllerServices();
    if (services.paneManager == null || typeof services.paneManager !== "object")
    {
        services.paneManager = EVUI.Modules.Panes.Manager;
    }

    _settings.httpManager = services.httpManager;
    _settings.stylesheetManager = services.stylesheetManager;
    _settings.htmlLoader = services.htmlLoader;

    _manager = new services.paneManager.createNewPaneManager(_settings);

    /**Global event that fires before the load operation begins for any Modal and is not yet in the DOM and cannot be manipulated in this stage, however the currentActionArgs.loadSettings can be manipulated to change the way the Modal's root element will be loaded.
    @param {EVUI.Modules.Modals.ModalEventArgs} paneEventArgs The event arguments for the Modal operation. The currentActionArgs property will be an instance of ModalLoadArgs.*/
    this.onLoad = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onLoad", targetPath: "onLoad" });

    /**Global even that fires after the load operation has completed for any Modal and is now in the DOM and can be manipulated in this stage. From this point on the Modal's element property cannot be reset..
    @param {EVUI.Modules.Modals.ModalEventArgs} paneEventArgs The event arguments for the Modal operation. The currentActionArgs property will be an instance of ModalLoadArgs.*/
    this.onLoaded = function (paneEventArgs) { };;
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onLoaded", targetPath: "onLoaded" });

    /**Global event that fires the first time any Modal is shown after being loaded into the DOM, but is not yet visible. After it has fired once, it will not fire again unless the ModalShowArgs.reInitialize property is set to true.
    @param {EVUI.Modules.Modals.ModalEventArgs} paneEventArgs The event arguments for the Modal operation. The currentActionArgs property will be an instance of ModalShowArgs.*/
    this.onInitialize = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onInitialize", targetPath: "onInitialize" });

    /**Global event that fires at the beginning of the show process and before the calculations for any Modal's location are made. The Modal is still hidden, but is present in the DOM and can be manipulated. In order for the positioning calculations in the next step to be accurate, all HTML manipulation should occur in this event.
    @param {EVUI.Modules.Modals.ModalEventArgs} paneEventArgs The event arguments for the Modal operation. The currentActionArgs property will be an instance of ModalShowArgs.*/
    this.onShow = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onShow", targetPath: "onShow" });

    /**Global event that fires after the position of any Modal has been calculated and is available to be manipulated through the calculatedPosition property of the ModalEventArgs. If the calculatedPosition or the showSettings are manipulated, the position will be recalculated (the changes made directly to the position take priority over changes made to the showSettings).
    @param {EVUI.Modules.Modals.ModalEventArgs} paneEventArgs The event arguments for the Modal operation. The currentActionArgs property will be an instance of ModalShowArgs.*/
    this.onPosition = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onPosition", targetPath: "onPosition" });

    /**Global event that fires once any Modal has been positioned, shown, and had its optional show transition applied and completed. Marks the end of the show process.
    @param {EVUI.Modules.Modals.ModalEventArgs} paneEventArgs The event arguments for the Modal operation. The currentActionArgs property will be an instance of ModalShowArgs.*/
    this.onShown = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onShown", targetPath: "onShown" });

    /**Global event that fires before any Modal has been moved from its current location and hidden. Gives the opportunity to change the hideTransition property of the ModalHideArgs and optionally trigger an unload once the Modal has been hidden.
    @param {EVUI.Modules.Modals.ModalEventArgs} paneEventArgs The event arguments for the Modal operation. The currentActionArgs property will be an instance of ModalHideArgs.*/
    this.onHide = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onHide", targetPath: "onHide" });

    /**Global event that fires after any Modal has been moved from its current location and is now hidden and the hide transition has completed.
    @param {EVUI.Modules.Modals.ModalEventArgs} paneEventArgs The event arguments for the Modal operation. The currentActionArgs property will be an instance of ModalHideArgs.*/
    this.onHidden = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onHidden", targetPath: "onHidden" });

    /**Global event that fires before any Modal has been (potentially) removed from the DOM and had its element property reset to null.
    @param {EVUI.Modules.Modals.ModalEventArgs} paneEventArgs The event arguments for the Modal operation. The currentActionArgs property will be an instance of ModalUnloadArgs.*/
    this.onUnload = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onUnload", targetPath: "onUnload" });

    /**Global event that fires after any Modal has been (potentially) removed from the DOM and had its element property reset to null. From this point on the Modal's element property is now settable to a new Element.
    @param {EVUI.Modules.Modals.ModalEventArgs} paneEventArgs The event arguments for the Modal operation. The currentActionArgs property will be an instance of ModalUnloadArgs.*/
    this.onUnloaded = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _manager, { sourcePath: "onUnloaded", targetPath: "onUnloaded" });
}

/**Represents a UI component that behaves like a standard, centered modal dialog with an optional backdrop by default.
 @class*/
EVUI.Modules.Modals.Modal = function (pane)
{
    if (pane == null) throw Error("Invalid input. Must wrap a Pane.");

    /**Object. The Modal being wrapped by the Modal.
    @type {EVUI.Modules.Panes.Pane}*/
    var _pane = pane;

    /**String. The unique ID of this Modal. ID's are case-insensitive.
    @type {String}*/
    this.id = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "id", targetPath: "id", settings: { set: false } });

    /**Object. The root Element of the Modal. Cannot be reset once it has been assigned to via initialization or a load operation, unload the Modal to reset it.
    @type {Element}*/
    this.element = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "element", targetPath: "element" });

    /**Boolean. Whether or not to unload the Modal from the DOM when it is hidden (only applies to elements that were loaded via HTTP). False by default.
    @type {Boolean}*/
    this.unloadOnHide = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "unloadOnHide", targetPath: "unloadOnHide" });

    /**Object. Calculates and gets the absolute position of the Modal.
    @type {EVUI.Modules.Dom.ElementBounds}*/
    this.currentPosition = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "currentPosition", targetPath: "currentPosition", settings: { set: false } });

    /**Number. Calculates and gets the Z-Index of the Modal.
    @type {Number}*/
    this.currentZIndex = -1;
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "currentZIndex", targetPath: "currentZIndex", settings: { set: false } });

    /**Boolean. Whether or not the internal state of the Modal thinks it is visible or not. This will be true after the show process has completed and false after an unload or hide operation has been completed.
    @type {Boolean}*/
    this.isVisible = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "isVisible", targetPath: "isVisible", settings: { set: false } });

    /**Boolean. Whether or not the internal state of the Modal thinks it is visible or not. This will be true after the load process has completed, even if the element was set directly before the first load operation.
    @type {Boolean}*/
    this.isLoaded = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "isLoaded", targetPath: "isLoaded", settings: { set: false } });

    /**Boolean. Whether or not the internal state of the Modal thinks it has been initialized or not. This will be true after the onInitialized events fire. */
    this.isInitialized = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "isInitialized", targetPath: "isInitialized", settings: { set: false } });

    /**Object. Show settings for the Modal.
    @type {EVUI.Modules.Modals.ModalShowSettings}*/
    this.showSettings = null;

    /**Object. Settings for loading the Modal.
    @type {EVUI.Modules.Modals.ModalLoadSettings}*/
    this.loadSettings = null;

    /**Object. Settings for controlling what should automatically close the Modal.
    @type {EVUI.Modules.Modals.ModalAutoCloseSettings}*/
    this.autoCloseSettings = null;

    /**Any. Any contextual information to attach to the Modal object.
    @type {Any}*/
    this.context = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "context", targetPath: "context" });

    /**Event that fires before the load operation begins for the Modal and is not yet in the DOM and cannot be manipulated in this stage, however the currentActionArgs.loadSettings can be manipulated to change the way the Modal's root element will be loaded.
    @param {EVUI.Modules.Modals.ModalEventArgs} paneEventArgs The event arguments for the Modal operation. The currentActionArgs property will be an instance of ModalLoadArgs.*/
    this.onLoad = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "onLoad", targetPath: "onLoad" });

    /**Event that fires after the load operation has completed for the Modal and is now in the DOM and can be manipulated in this stage. From this point on the Modal's element property cannot be reset..
    @param {EVUI.Modules.Modals.ModalEventArgs} paneEventArgs The event arguments for the Modal operation. The currentActionArgs property will be an instance of ModalLoadArgs.*/
    this.onLoaded = function (paneEventArgs) { };;
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "onLoaded", targetPath: "onLoaded" });

    /**Event that fires the first time the Modal is shown after being loaded into the DOM, but is not yet visible. After it has fired once, it will not fire again unless the ModalShowArgs.reInitialize property is set to true.
    @param {EVUI.Modules.Modals.ModalEventArgs} paneEventArgs The event arguments for the Modal operation. The currentActionArgs property will be an instance of ModalShowArgs.*/
    this.onInitialize = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "onInitialize", targetPath: "onInitialize" });

    /**Event that fires at the beginning of the show process and before the calculations for the Modal's location are made. The Modal is still hidden, but is present in the DOM and can be manipulated. In order for the positioning calculations in the next step to be accurate, all HTML manipulation should occur in this event.
    @param {EVUI.Modules.Modals.ModalEventArgs} paneEventArgs The event arguments for the Modal operation. The currentActionArgs property will be an instance of ModalShowArgs.*/
    this.onShow = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "onShow", targetPath: "onShow" });

    /**Event that fires after the position of the Modal has been calculated and is available to be manipulated through the calculatedPosition property of the ModalEventArgs. If the calculatedPosition or the showSettings are manipulated, the position will be recalculated (the changes made directly to the position take priority over changes made to the showSettings).
    @param {EVUI.Modules.Modals.ModalEventArgs} paneEventArgs The event arguments for the Modal operation. The currentActionArgs property will be an instance of ModalShowArgs.*/
    this.onPosition = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "onPosition", targetPath: "onPosition" });

    /**Event that fires once the Modal has been positioned, shown, and had its optional show transition applied and completed. Marks the end of the show process.
    @param {EVUI.Modules.Modals.ModalEventArgs} paneEventArgs The event arguments for the Modal operation. The currentActionArgs property will be an instance of ModalShowArgs.*/
    this.onShown = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "onShown", targetPath: "onShown" });

    /**Event that fires before the Modal has been moved from its current location and hidden. Gives the opportunity to change the hideTransition property of the ModalHideArgs and optionally trigger an unload once the Modal has been hidden.
    @param {EVUI.Modules.Modals.ModalEventArgs} paneEventArgs The event arguments for the Modal operation. The currentActionArgs property will be an instance of ModalHideArgs.*/
    this.onHide = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "onHide", targetPath: "onHide" });

    /**Event that fires after the Modal has been moved from its current location and is now hidden and the hide transition has completed.
    @param {EVUI.Modules.Modals.ModalEventArgs} paneEventArgs The event arguments for the Modal operation. The currentActionArgs property will be an instance of ModalHideArgs.*/
    this.onHidden = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "onHidden", targetPath: "onHidden" });

    /**Event that fires before the Modal has been (potentially) removed from the DOM and had its element property reset to null.
    @param {EVUI.Modules.Modals.ModalEventArgs} paneEventArgs The event arguments for the Modal operation. The currentActionArgs property will be an instance of ModalUnloadArgs.*/
    this.onUnload = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "onUnload", targetPath: "onUnload" });

    /**Event that fires after the Modal has been (potentially) removed from the DOM and had its element property reset to null. From this point on the Modal's element property is now settable to a new Element.
    @param {EVUI.Modules.Modals.ModalEventArgs} paneEventArgs The event arguments for the Modal operation. The currentActionArgs property will be an instance of ModalUnloadArgs.*/
    this.onUnloaded = function (paneEventArgs) { };
    EVUI.Modules.Core.Utils.wrapProperties(this, _pane, { sourcePath: "onUnloaded", targetPath: "onUnloaded" });

    /**Returns a copy of the internal eventBindings array.
    @returns {EVUI.Modules.Panes.PaneEventBinding[]}*/
    this.getEventBindings = function ()
    {
        return _pane.getEventBindings();
    };

    /**Adds an event response to a standard browser event to a child element of the Modal element.
    @param {Element} element The child element of the root pane element to attach an event handler to.
    @param {EVUI.Modules.Dom.Constants.Fn_BrowserEventHandler} handler An event handler to be called when the specified events are triggered.
    @param {String|String[]} event Either a single event name, or an array of event names, or a space delineated string of event names to add.*/
    this.addEventBinding = function (element, event, handler)
    {
        return _pane.addEventBinding(element, event, handler);
    };
};

/**The settings and options for showing a Modal.
@class*/
EVUI.Modules.Modals.ModalShowSettings = function (showSettings)
{
    /**The show settings being set by the ModalShowSettings.
    @type {EVUI.Modules.Panes.PaneShowSettings}*/
    var _showSettings = (showSettings == null || typeof showSettings !== "object") ? new EVUI.Modules.Panes.PaneShowSettings() : showSettings;
    if (_showSettings.backdropSettings == null) _showSettings.backdropSettings = new EVUI.Modules.Panes.PaneBackdropSettings();
    if (_showSettings.clipSettings == null) _showSettings.clipSettings = new EVUI.Modules.Panes.PaneClipSettings();

    /**Boolean. Whether or not to full screen the Modal to cover the entire current view port. False by default.
    @type {Boolean}*/
    this.fullscreen = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "fullscreen", targetPath: "fullscreen" });

    /**Whether or not to explicitly position the Modal so that it is centered on the screen's current view port. True by default.
    @type {Boolean}*/
    this.center = true;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "center", targetPath: "center" });

    /**Boolean. Whether or not to show a backdrop. True by default.
    @type {Boolean}*/
    this.showBackdrop = true;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "showBackdrop", targetPath: "backdropSettings.showBackdrop" });

    /**Object or String. Either class names, a string of CSS rules (without a selector), or an object of key-value pairs of CSS properties to generate a runtime CSS class for.
    @type {Object|String}*/
    this.backdropCSS = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "backdropCSS", targetPath: "backdropSettings.backdropCSS" });

    /**Object. The transition effect to apply when showing the backdrop.
    @type {EVUI.Modules.Modals.ModalTransition}*/
    this.backdropShowTransition = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "backdropShowTransition", targetPath: "backdropSettings.backdropShowTransition" });

    /**Object. The transition effect to apply when showing the backdrop.
    @type {EVUI.Modules.Modals.ModalTransition}*/
    this.backdropHideTransition = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "backdropHideTransition", targetPath: "backdropSettings.backdropHideTransition" });

    /**Number. The opacity of the backdrop. 75% by default.
    @type {Number}*/
    this.backdropOpacity = 0.75;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "backdropOpacity", targetPath: "backdropSettings.backdropOpacity" });

    /**String. The color of the backdrop. #000000 by default.
    @type {Number}*/
    this.backdropColor = "#000000";
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "backdropColor", targetPath: "backdropSettings.backdropColor" });
   
    /**Object. Contains the details of the CSS transition to use to show the Modal (if a transition is desired). If omitted, the Modal is positioned then shown by manipulating the display property directly.
    @type {EVUI.Modules.Modals.ModalTransition}*/
    this.showTransition = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "showTransition", targetPath: "showTransition" })

    /**Object. Contains the details of the CSS transition to use to hide the Modal (if a transition is desired). If omitted, the Modal is positioned then shown by manipulating the display property directly.
    @type {EVUI.Modules.Modals.ModalTransition}*/
    this.hideTransition = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "hideTransition", targetPath: "hideTransition" })

    /**Object. An Element (or CSS selector of an Element) or an ElementBounds object describing the bounds to which the Modal will attempt to fit inside. If omitted, the Modal's current view port is used.
    @type {Element|EVUI.Modules.Dom.ElementBounds|String}*/
    this.clipBounds = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "clipBounds", targetPath: "clipSettings.clipBounds" })

    /**Boolean. Whether or not scrollbars should appear on the X-axis when the Modal has been clipped.
    @type {Boolean}*/
    this.scrollXWhenClipped = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "scrollXWhenClipped", targetPath: "clipSettings.scrollXWhenClipped" })

    /**Boolean. Whether or not scrollbars should appear on the Y-axis when the Modal has been clipped.
    @type {Boolean}*/
    this.scrollYWhenClipped = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "scrollYWhenClipped", targetPath: "clipSettings.scrollYWhenClipped" })

    /**Boolean. Whether or not to include the height and width when positioning the element (when it is not clipped).
    @type {Boolean}*/
    this.setExplicitDimensions = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _showSettings, { sourcePath: "setExplicitDimensions", targetPath: "setExplicitDimensions" })
};

/**Event arguments for the events exposed when hiding, showing, loading, or unloading a Modal.
@class*/
EVUI.Modules.Modals.ModalEventArgs = function (argsPackage, currentArgs)
{
    if (argsPackage == null || currentArgs == null) throw Error("Invalid arguments.")

    /**Object. The metadata about the state of the Modal.
    @type {EVUI.Modules.Panes.PaneArgsPackage}*/
    var _argsPackage = argsPackage;

    /**The current event args for the operation.
    @type {Any}*/
    var _currentArgs = currentArgs;

    /**The Modal that is having an action performed on it.
    @type {EVUI.Modules.Modals.Modal}*/
    this.modal = null;
    Object.defineProperty(this, "modal",
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

    /**Function. Cancels the EventStream and aborts the execution of the Modal operation.*/
    this.cancel = function () { }

    /**Function. Stops the EventStream from calling any other event handlers with the same key.*/
    this.stopPropagation = function () { };

    /**Object. The position of the Modal that has been calculated in using the currentShowSettings.
    @type {EVUI.Modules.Panes.PanePosition}*/
    this.calculatedPosition = null;
    Object.defineProperty(this, "calculatedPosition",
        {
            get: function () { return _argsPackage.lastCalculatedPosition; },
            configurable: false,
            enumerable: true
        });

    /**Object. The PaneHide/Show/Load/Unload Arguments being used for the operation.
    @type {EVUI.Modules.Modals.ModalShowArgs|EVUI.Modules.Modals.ModalHideArgs|EVUI.Modules.Modals.ModalLoadArgs|EVUI.Modules.Modals.ModalUnloadArgs}*/
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

/**Arguments for loading a Modal.
 @class*/
EVUI.Modules.Modals.ModalLoadArgs = function (paneLoadArgs)
{
    /**The internal PaneLoadArgs being manipulated.
    @type {EVUI.Modules.Panes.PaneLoadArgs}*/
    var _loadArgs = (paneLoadArgs == null || typeof paneLoadArgs !== "object") ? new EVUI.Modules.Panes.PaneLoadArgs() : paneLoadArgs;

    /**String. The type of arguments contained within the object.
    @type {String}*/
    this.type = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _loadArgs, [{ sourcePath: "type", targetPath: "type" }]);

    /**Any. Any contextual information to pass into the Modal load logic.
    @type {Any}*/
    this.context = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _loadArgs, [{ sourcePath: "context", targetPath: "context" }]);

    /**Object. The PaneLoadSettings to use if the Modal has not already been loaded.
    @type {EVUI.Modules.Modals.ModalLoadSettings}*/
    this.loadSettings = null;

    /**Boolean. Whether or not to re-load the Modal.
    @type {Boolean}*/
    this.reload = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _loadArgs, [{ sourcePath: "reload", targetPath: "reload" }]);
};

/**Arguments for showing a Modal.
@class*/
EVUI.Modules.Modals.ModalShowArgs = function (paneShowArgs)
{
    /**The internal settings being set by the wrapper object.
    @type {EVUI.Modules.Panes.PaneShowArgs}*/
    var _paneShowArgs = (paneShowArgs == null || typeof paneShowArgs !== "object") ? new EVUI.Modules.Panes.PaneShowArgs() : paneShowArgs;

    /**String. The type of arguments contained within the object.
    @type {String}*/
    this.type = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneShowArgs, { sourcePath: "type", targetPath: "type", settings: { set: false } });

    /**Any. Any contextual information to pass into the Modal show logic.
    @type {Any}*/
    this.context = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneShowArgs, { sourcePath: "context", targetPath: "context" });

    /**Object. The show settings for the Modal.
    @type {EVUI.Modules.Modals.ModalShowSettings}*/
    this.showSettings = null;

    /**Object. The load arguments for loading the Modal if it has not already been loaded.
    @type {EVUI.Modules.Modals.ModalLoadArgs}*/
    this.loadArgs = null;

    /**Whether or not to re-initialize the Modal upon showing it.
    @type {Boolean}*/
    this.reInitialize = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneShowArgs, { sourcePath: "reInitialize", targetPath: "reInitialize" });
};

/**Arguments for hiding a Modal.
@class*/
EVUI.Modules.Modals.ModalHideArgs = function (paneHideArgs)
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
    this.modalHideTransition = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneHideArgs, { sourcePath: "modalHideTransition", targetPath: "paneHideTransition" });

    this.unloadArgs = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneHideArgs, { sourcePath: "unloadArgs", targetPath: "unloadArgs" });
};

/**Arguments for unloading a Modal.
@class*/
EVUI.Modules.Modals.ModalUnloadArgs = function (paneUnloadArgs)
{
    /**The internal settings being set by the wrapper object.
    @type {EVUI.Modules.Panes.PaneUnloadArgs}*/
    var _paneUnloadArgs = (paneUnloadArgs == null || typeof paneUnloadArgs !== "object") ? new EVUI.Modules.Panes.PaneUnloadArgs() : paneUnloadArgs;

    /**String. The type of arguments contained within the object.
    @type {String}*/
    this.type = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneUnloadArgs, { sourcePath: "type", targetPath: "type", settings: { set: false } });

    /**Any. Any contextual information to pass into the Modal hide logic.
    @type {Any}*/
    this.context = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneUnloadArgs, { sourcePath: "context", targetPath: "context" });

    /**Boolean. Whether or not to remove the Modal from the DOM once it has been unloaded.
    @type {Boolean}*/
    this.remove = false;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneUnloadArgs, { sourcePath: "remove", targetPath: "remove" });
};

/**Represents a transition effect that can be applied to a Modal when its position or size changes.
@class*/
EVUI.Modules.Modals.ModalTransition = function ()
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

/**Settings and options for loading a Modal.
@class */
EVUI.Modules.Modals.ModalLoadSettings = function (paneLoadSettings)
{
    var _paneLoadSettings = (paneLoadSettings == null || typeof paneLoadSettings !== "object") ? new EVUI.Modules.Panes.PaneLoadSettings() : paneLoadSettings;

    /**Object. The Element to show as the Modal.
    @type {Element}*/
    this.element = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneLoadSettings, { sourcePath: "element", targetPath: "element" });

    /**String. A CSS selector that is used to go find the Element to show as the Modal. Only the first result is used.
    @type {String}*/
    this.selector = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneLoadSettings, { sourcePath: "selector", targetPath: "selector" });

    /**Object. If using a CSS selector to find the root element of a Modal, this is the context limiting element to search inside of.
    @type {Element}*/
    this.contextElement = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneLoadSettings, { sourcePath: "contextElement", targetPath: "contextElement" });

    /**Object. HttpRequestArgs for making a Http request to go get the Modal's HTML.
    @type {EVUI.Modules.Http.HttpRequestArgs}*/
    this.httpLoadArgs = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneLoadSettings, { sourcePath: "httpLoadArgs", targetPath: "httpLoadArgs" });

    /**Object. PlaceholderLoadArgs for making a series of Http requests to load the Modal as an existing placeholder.
    @type {EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadArgs}*/
    this.placeholderLoadArgs = null;
    EVUI.Modules.Core.Utils.wrapProperties(this, _paneLoadSettings, { sourcePath: "placeholderLoadArgs", targetPath: "placeholderLoadArgs" });
};

/**Settings for controlling how the Modal will automatically close itself in response to user events.
@class*/
EVUI.Modules.Modals.ModalAutoCloseSettings = function ()
{
    /**Array. An array of characters/key names ("a", "b", "Escape", "Enter" etc) that will automatically trigger the Modal to be hidden when pressed. Corresponds to the KeyboardEvent.key property.
    @type {String[]}*/
    this.autoCloseKeys = [];

    /**An optional function to use to determine if an auto-close event should hide the Modal. Return false to prevent the Modal from being hidden.
    @param {EVUI.Modules.Panes.PaneAutoTriggerContext} autoTriggerContext The context object generated by the event handler.
    @returns {Boolean}*/
    this.autoCloseFilter = function (autoTriggerContext)
    {
        return true;
    };
};

/**Enum for indicating what type of arguments object the ModalEventArgs.currentArguments property is.
@enum*/
EVUI.Modules.Modals.ModalArgumentType =
{
    /**Arguments are ModalShowArgs.*/
    Show: "show",
    /**Arguments are ModalHideArgs.*/
    Hide: "hide",
    /**Arguments are ModalLoadArgs.*/
    Load: "load",
    /**Arguments are ModalUnloadArgs.*/
    Unload: "unload",
    /**Arguments are ModalMoveResizeArgs.*/
    MoveResize: "moveResize"
};
Object.freeze(EVUI.Modules.Modals.ModalArgumentType);

/**Enum for indicating the behavior of the Modal when it overflows its clipBounds.
@enum*/
EVUI.Modules.Modals.ModalClipMode =
{
    /**When the calculated position of the Modal overflows the clipBounds, it will not be cropped to stay within the clipBounds and will overflow to the outside of the clip bounds.*/
    Overflow: "overflow",
    /**When the calculated position of the Modal overflows the clipBounds, it will be clipped to the maximum dimensions of the clipBounds on the overflowing axes.*/
    Clip: "clip",
    /**When the calculated position of the Modal overflows the clipBounds, it will be shifted in the opposite directions as the overflow to fit within the clipBounds.*/
    Shift: "shift",
};
Object.freeze(EVUI.Modules.Modals.ModalClipMode);

/**Object to inject the standard dependencies used by the ModalController into it via its constructor.
@class*/
EVUI.Modules.Modals.ModalControllerServices = function ()
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

/**Global instance of the ModalManager, used for creating and using simple modals that are positioned relative to a point or another element.
@type {EVUI.Modules.Modals.ModalManager}*/
EVUI.Modules.Modals.Manager = null;
(function ()
{
    var ctor = EVUI.Modules.Modals.ModalManager;
    var manager = null;

    Object.defineProperty(EVUI.Modules.Modals, "Manager", {
        get: function ()
        {
            if (manager == null) manager = new ctor();
            return manager;
        },
        enumerable: true,
        configurable: false
    });
})();

Object.freeze(EVUI.Modules.Modals);

delete $evui.modals;

/**Global instance of the ModalManager, used for creating and using simple modals that are positioned relative to a point or another element.
@type {EVUI.Modules.Modals.ModalManager}*/
$evui.modals = null;
Object.defineProperty($evui, "modals", {
    get: function () { return EVUI.Modules.Modals.Manager; },
    enumerable: true
});

/**Adds a Modal to the WidowManager.
@param {EVUI.Modules.Modals.Modal} yoloModal A YOLO object representing a Modal object. This object is copied onto a real Modal object is then discarded.
@returns {EVUI.Modules.Modals.Modal}*/
$evui.addModal = function (yoloModal)
{
    return EVUI.Modules.Modals.Manager.addModal(yoloModal);
};

/**Shows (and loads, if necessary or if a reload is requested) a Modal asynchronously. Provides a callback that is called call once the Modal operation has completed successfully or otherwise.
@param {EVUI.Modules.Modals.Modal|String} modalOrID Either a YOLO Modal object to extend into the existing Modal, the real Modal reference, or the string ID of the Modal to show.
@param {EVUI.Modules.Modals.ModalShowArgs|EVUI.Modules.Modals.Constants.Fn_ModalOperationCallback} modalShowArgs Optional. A YOLO object representing the arguments for showing the Modal, or the callback. If omitted or passed as a function, the Modal's existing show/load settings are used instead.
@param {EVUI.Modules.Modals.Constants.Fn_ModalOperationCallback} callback Optional. A callback that is called once the operation completes.*/
$evui.showModal = function (modalOrID, modalShowArgs, callback)
{
    return EVUI.Modules.Modals.Manager.showModal(modalOrID, modalShowArgs, callback);
};

/**Awaitable. (and loads, if necessary or if a reload is requested) a Modal asynchronously.
@param {EVUI.Modules.Modals.Modal|String} modalOrID Either a YOLO Modal object to extend into the existing Modal, the real Modal reference, or the string ID of the Modal to show.
@param {EVUI.Modules.Modals.ModalShowArgs} modalShowArgs Optional.  A YOLO object representing the arguments for showing the Modal. If omitted, the Modal's existing show/load settings are used instead.
@returns {Promise<Boolean>}*/
$evui.showModalAsync = function (modalOrID, modalShowArgs)
{
    return EVUI.Modules.Modals.Manager.showModalAsync(modalOrID, modalShowArgs);
};

/**Hides (and unloads if requested) a Modal asynchronously. Provides a callback that is called call once the Modal operation has completed successfully or otherwise.
@param {EVUI.Modules.Modals.Modal|String} modalOrID Either a YOLO Modal object to extend into the existing Modal, the real Modal reference, or the string ID of the Modal to hide.
@param {EVUI.Modules.Modals.ModalHideArgs|EVUI.Modules.Modals.Constants.Fn_ModalOperationCallback} modalHideArgs Optional.  A YOLO object representing the arguments for hiding a Modal or the callback. If omitted or passed as a function, the Modal's existing hide/unload settings are used instead.
@param {EVUI.Modules.Modals.Constants.Fn_ModalOperationCallback} callback Optional. A callback that is called once the operation completes.*/
$evui.hideModal = function (modalOrID, modalHideArgs, callback)
{
    return EVUI.Modules.Modals.Manager.hideModal(modalOrID, modalHideArgs, callback);
};

/**Awaitable. Hides (and unloads if requested) a Modal asynchronously. Provides a callback that is called call once the Modal operation has completed successfully or otherwise.
@param {EVUI.Modules.Modals.Modal|String} modalOrID Either a YOLO Modal object to extend into the existing Modal, the real Modal reference, or the string ID of the Modal to hide.
@param {EVUI.Modules.Modals.ModalHideArgs} modalHideArgs Optional.  A YOLO object representing the arguments for hiding a Modal. If omitted, the Modal's existing hide/unload settings are used instead.
@returns {Promise<Boolean>}*/
$evui.hideModalAsync = function (modalOrID, modalHideArgs)
{
    return EVUI.Modules.Modals.Manager.hideModalAsync(modalOrID, modalHideArgs);
};

/*#ENDWRAP(Modal)#*/