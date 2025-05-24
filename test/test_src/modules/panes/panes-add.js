await $evui.testAsync({
    testArgs: "Test - addPane",
    test: function (args)
    {
        var paneID = $evui.guid();
        var pane = $evui.addPane({
            id: paneID
        });

        $evui.assert(pane).is($evui.getPane(paneID));
    }
});

await $evui.testAsync({
    testArgs: "Test - removePane",
    test: function (args)
    {
        var paneID = $evui.guid();
        var pane = $evui.addPane({
            id: paneID
        });

        $evui.assert(pane).is($evui.getPane(paneID));
        $evui.panes.removePane(paneID);

        $evui.assert($evui.getPane(paneID)).is(null);
    }
});

await $evui.testAsync({
    name: "Test - addPane - custom property",
    testArgs: PaneTest.customPropertyValues,
    test: function (hostArgs, customValue)
    {
        var paneID = $evui.guid();
        var pane = $evui.addPane({
            id: paneID,
            custom: customValue
        });

        var processedPane = $evui.getPane(paneID);
        $evui.assert(processedPane.custom).is(customValue);
    }
});

await $evui.testAsync({
    name: "Test - addPane - nested custom properties",
    testArgs: PaneTest.nestedCustomPropertyValues,
    test: function (hostArgs, path, valueName, customValues)
    {
        hostArgs.outputWriter.logDebug(path);
        var fullPath = $evui.isStringValid(valueName) === true ? `${path}.${valueName}` : path;
        var customValueGenerator = customValues();

        for (var val of customValueGenerator)
        {
            let paneID = $evui.guid();
            let pane = {
                id: paneID
            };

            hostArgs.outputWriter.logDebug("Adding property:" + JSON.stringify(val));
            $evui.set(fullPath, pane, val, true);

            var realPane = $evui.addPane(pane);
            $evui.assert(val).is($evui.get(fullPath, realPane));
        }
    }
});