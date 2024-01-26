await $evui.testAsync({
    name: "DomTree - string to DomTreeElement hierarchy",
    testArgs: DomTreeTest.stringToDomTreeArgs,
    test: function (hostArgs, htmlString, expected, message)
    {
        hostArgs.outputWriter.logInfo("Testing: " + message);

        var actual = $evui.parseHtmlToDomTree(htmlString);

        $evui.assert(expected).isEquivalentTo(actual);
    }
});

await $evui.testAsync({
    name: "DomTree - string to DomTreeElement hierarchy with omitted elements",
    testArgs: DomTreeTest.stringToDomTreeOmitElementArgs,
    test: function (hostArgs, htmlString, expected, message, omittedElements)
    {
        hostArgs.outputWriter.logInfo("Testing: " + message);
        hostArgs.outputWriter.logInfo("Omitting the following tags " + JSON.stringify(omittedElements) + " for the html string of " + htmlString);

        var actual = $evui.parseHtmlToDomTree(htmlString, { omittedElements: omittedElements });

        $evui.assert(expected).isEquivalentTo(actual);
    }
});
