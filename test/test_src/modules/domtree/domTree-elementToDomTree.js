await $evui.testAsync({
    name: "Dom Nodes to DomTree objects (DocumentFragments)",
    testArgs: DomTreeTest.stringToDomTreeArgs,
    test: function (hostArgs, htmlString, result, message)
    {
        hostArgs.outputWriter.logInfo("Testing: " + message);

        //use a DOM parser to parse the HTML string
        var expected = document.createDocumentFragment();
        var parser = new DOMParser();
        var parsedDoc = parser.parseFromString(htmlString, "text/html");

        //copy the document into a document fragment so it matches the structure of the DomTeee's parser.
        var numNodes = parsedDoc.body.childNodes.length;
        while (numNodes > 0)
        {
            expected.appendChild(parsedDoc.body.childNodes[0]);
            numNodes--;
        }

        var domTree = $evui.toDomTreeElement(expected);

        $evui.assert(result).isEquivalentTo(domTree);
    }
});

await $evui.testAsync({
    name: "Dom Nodes to DomTree objects (Document)",
    testArgs: DomTreeTest.stringToDomTreeArgs,
    test: function (hostArgs, htmlString, result, message)
    {
        hostArgs.outputWriter.logInfo("Testing: " + message);

        //use a DOM parser to parse the HTML string
        var parser = new DOMParser();
        var parsedDoc = parser.parseFromString(htmlString, "text/html");

        //make the dummy document content that we get when we parse a whole document
        var docWrapper = new EVUI.Modules.DomTree.DomTreeElement();
        docWrapper.tagName = "HTML";
        docWrapper.flags |= EVUI.Modules.DomTree.DomTreeElementFlags.HTML;
        docWrapper.type = EVUI.Modules.DomTree.DomTreeElementType.Document;
        docWrapper.content = [
            DomTreeTest.makeDomTreeElement("HEAD"),
            DomTreeTest.makeDomTreeElement("BODY", result.content)
        ];

        var domTree = $evui.toDomTreeElement(parsedDoc);

        $evui.assert(docWrapper).isEquivalentTo(domTree);
    }
});

await $evui.testAsync({
    name: "Dom Nodes to DomTree objects (Element)",
    testArgs: DomTreeTest.stringToDomTreeArgs,
    test: function (hostArgs, htmlString, result, message)
    {
        hostArgs.outputWriter.logInfo("Testing: " + message);

        htmlString = "<div>" + htmlString + "</div>";

        //use a DOM parser to parse the HTML string
        var parser = new DOMParser();
        var parsedDoc = parser.parseFromString(htmlString, "text/html");

        //make the dummy document content that we get when we parse a whole document
        var divWrapper = DomTreeTest.makeDomTreeElement("DIV", result.content);

        var domTree = $evui.toDomTreeElement(parsedDoc.querySelector("div"));

        $evui.assert(divWrapper).isEquivalentTo(domTree);
    }
});

await $evui.testAsync({
    name: "Dom Nodes to DomTree objects (DocumentFragments) - Omitted Elements",
    testArgs: DomTreeTest.stringToDomTreeOmitElementArgs,
    test: function (hostArgs, htmlString, expected, message, omittedElements)
    {
        hostArgs.outputWriter.logInfo("Testing: " + message);
        hostArgs.outputWriter.logInfo("Omitting the following tags " + JSON.stringify(omittedElements) + " for the html string of " + htmlString);

        var frag = document.createDocumentFragment();

        var parser = new DOMParser();
        var parsedDoc = parser.parseFromString(htmlString, "text/html");

        //copy the document into a document fragment so it matches the structure of the DomTeee's parser.
        var numNodes = parsedDoc.body.childNodes.length;
        while (numNodes > 0)
        {
            frag.appendChild(parsedDoc.body.childNodes[0]);
            numNodes--;
        }

        var actual = $evui.toDomTreeElement(frag, { omittedElements: omittedElements });

        $evui.assert(expected).isEquivalentTo(actual);
    }
});

await $evui.testAsync({
    name: "Dom Nodes to DomTree objects (DocumentFragments) - Omitted Attributes",
    testArgs: DomTreeTest.stringToDomTreeOmitAttributesArgs,
    test: function (hostArgs, htmlString, expected, message, omittedAttributes)
    {
        hostArgs.outputWriter.logInfo("Testing: " + message);
        hostArgs.outputWriter.logInfo("Omitting the following attributes " + JSON.stringify(omittedAttributes) + " for the html string of " + htmlString);

        var frag = document.createDocumentFragment();

        var parser = new DOMParser();
        var parsedDoc = parser.parseFromString(htmlString, "text/html");

        //copy the document into a document fragment so it matches the structure of the DomTeee's parser.
        var numNodes = parsedDoc.body.childNodes.length;
        while (numNodes > 0)
        {
            frag.appendChild(parsedDoc.body.childNodes[0]);
            numNodes--;
        }

        var actual = $evui.toDomTreeElement(frag, { omittedAttributes: omittedAttributes });

        $evui.assert(expected).isEquivalentTo(actual);
    }
});