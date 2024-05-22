var mappings = [
    { keys: ["dialog", "dialogs", "DiaLog", "DIALOGS"], controller: EVUI.Modules.Dialogs.DialogManager },
    { keys: ["diff", "diffs", "DiFF", "dIFFS"], controller: EVUI.Modules.Diff.DiffController },
    { keys: ["domtree", "domtrees", "DOMTree", "domTrees"], controller: EVUI.Modules.DomTree.DomTreeConverter },
    { keys: ["dropdown", "dropdowns", "DroPDOWn", "DROPdowns"], controller: EVUI.Modules.Dropdowns.DropdownManager },
    { keys: ["enum", "enums", "ENUM", "ENUMs"], controller: EVUI.Modules.Enums.EnumValueGetter },
    { keys: ["event", "events", "EVeNT", "eveNTS"], controller: EVUI.Modules.Events.EventManager },
    { keys: ["eventstream", "eventstreams", "EVENTstream", "eventSTREAM"], controller: EVUI.Modules.EventStream.EventStream },
    { keys: ["htmlloader", "htmlloaders", "htmlLOADER", "HTMLloaderS"], controller: EVUI.Modules.HtmlLoader.HtmlLoaderController },
    { keys: ["http", "HTTP", "htTP", "HTtps"], controller: EVUI.Modules.Http.HttpManager },
    { keys: ["iframe", "iframes", "IFrame", "IFRaMEs"], controller: EVUI.Modules.IFrames.IFrameManager },
    { keys: ["modal", "modals", "MoDAL", "MOdalS"], controller: EVUI.Modules.Modals.ModalManager },
    { keys: ["pane", "panes", "PANE", "paNES"], controller: EVUI.Modules.Panes.PaneManager },
    { keys: ["popin", "popins", "POPin", "PoPINS"], controller: EVUI.Modules.PopIns.PopInManager },
    { keys: ["style", "styles", "STYle", "styLEs"], controller: EVUI.Modules.Styles.StyleSheetManager },
    { keys: ["treeview", "treeviews", "TREEview", "treeVIEWs"], controller: EVUI.Modules.TreeView.TreeViewController },
    { keys: ["null", "ddsfs", "BsdsddsS"], controller: null },
    { keys: ["", null, 1, {}], controller: null, shouldFail: true },
];

var getControllerName = function (ctor)
{
    for (var controllerName in EVUI.Constructors)
    {
        if (ctor === EVUI.Constructors[controllerName])
        {
            return controllerName;
        }
    }

    return "Unknown Controller";
}

await $evui.testAsync({
    name: "Multi-case EVUI.Modules.Utils.createController test.",
    testArgs: mappings,
    test: function (args, mapping)
    {
        if (mapping == null) args.fail("Missing arguments.");

        var numNames = mapping.keys.length;
        for (var x = 0; x < numNames; x++)
        {
            try
            {
                var controller = $evui.createController(mapping.keys[x]);
                if (controller == null)
                {
                    if (mapping.controller != null)
                    {
                        args.fail(`${mapping.keys[x]} failed to produce a controller. Intended controller was ${getControllerName(mapping.controller)}`)
                    }
                }
                else
                {
                    if (mapping.controller != null)
                    {
                        if (controller instanceof mapping.controller === false)
                        {
                            args.fail(`${mapping.keys[x]} failed to produce a controller of the correct type. Intended controller was ${getControllerName(mapping.controller)}, actual controller was ${getControllerName(controller.constructor)}.`)
                        }
                    }
                    else
                    {
                        args.fail(`${mapping.keys[x]} created a ${getControllerName(controller.constructor)} when it should have created nothing.`)
                    }
                }
            }
            catch (ex)
            {
                if (mapping.shouldFail !== true)
                {
                    fail(ex);
                }
            }

            if (mapping.controller == null)
            {
                args.outputWriter.writeOutput(`Key ${mapping.keys[x]} correctly produced no controller!`);
            }
            else
            {
                args.outputWriter.writeOutput(`Key ${mapping.keys[x]} correctly produced a ${getControllerName(controller.constructor)} controller!`);
            }

        }
    }
});