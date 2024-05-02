$evui.testAsync({
    name: "Get Element Attributes",
    testArgs: CoreTest.makeGetElementAttributesArgs,
    test: function (hostArgs, name, expectedAttributes)
    {
        hostArgs.outputWriter.logDebug(name);

        var ele = document.createElement("div");
        for (var prop in expectedAttributes)
        {
            ele.setAttribute(prop, expectedAttributes[prop]);
        }

        var extractedAttrs = $evui.getAttrs(ele);
        for (var prop in expectedAttributes)
        {
            $evui.assert(expectedAttributes[prop]).is(extractedAttrs.getValue(prop));
        }
    }
});