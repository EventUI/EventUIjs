$evui.testAsync({
    name: "DomTree - string to Node hierarchy",
    testArgs: DomTreeTest.stringToDomNodeArgs,
    test: function (hostArgs, htmlString, message)
    {
        hostArgs.outputWriter.logInfo("Testing: " + message);

        var actual = $evui.parseHtml(htmlString);
        var expected = document.createDocumentFragment();

        var parser = new DOMParser();
        var parsedDoc = parser.parseFromString(htmlString, "text/html");
        var numNodes = parsedDoc.body.childNodes.length;
        while (numNodes > 0)
        {
            expected.appendChild(parsedDoc.body.childNodes[0]);
            numNodes--;
        }

        $evui.assert(expected).isEquivalentTo(actual);
    }
});