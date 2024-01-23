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