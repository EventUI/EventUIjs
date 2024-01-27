$evui.testAsync({
    name: "DomTree - string to Node hierarchy",
    testArgs: DomTreeTest.stringToDomNodeArgs,
    test: function (hostArgs, htmlString, message)
    {
        hostArgs.outputWriter.logInfo("Testing: " + message);

        //parse using EVUI parser
        var actual = $evui.parseHtml(htmlString);

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

        $evui.assert(expected).isEquivalentTo(actual);
    }
});

$evui.testAsync({
    name: "DomTree - string to Node hierarchy with omitted elements",
    testArgs: DomTreeTest.stringToDomNodeOmitElementArgs,
    test: function (hostArgs, htmlString, message, omittedElements)
    {
        hostArgs.outputWriter.logInfo("Testing: " + message);
        hostArgs.outputWriter.logInfo("Omitting the following tags " + JSON.stringify(omittedElements) + " for the html string of " + htmlString);

        var actual = $evui.parseHtml(htmlString, {
            omittedElements: omittedElements            
        });

        var expected = document.createDocumentFragment();

        var parser = new DOMParser();
        var parsedDoc = parser.parseFromString(htmlString, "text/html");

        //snip all the omitted elements out of the parsed document
        var numOmitted = omittedElements.length;
        for (var x = 0; x < numOmitted; x++)
        {
            var eles = parsedDoc.querySelectorAll(omittedElements[x]);
            if (eles == null) continue;

            var numEle = eles.length;
            for (var y = 0; y < numEle; y++)
            {
                eles[y].remove();
            }
        }

        //copy the document into a document fragment so it matches the structure of the DomTeee's parser.
        var numNodes = parsedDoc.body.childNodes.length;
        while (numNodes > 0)
        {
            expected.appendChild(parsedDoc.body.childNodes[0]);
            numNodes--;
        }

        $evui.assert(expected).isEquivalentTo(actual);
    }
});

$evui.testAsync({
    name: "DomTree - string to Node hierarchy with omitted attributes",
    testArgs: DomTreeTest.stringToDomNodeArgsOmitAttributes,
    test: function (hostArgs, htmlString, message, omittedAttributes)
    {
        hostArgs.outputWriter.logInfo("Testing: " + message);
        hostArgs.outputWriter.logInfo("Omitting the following attributes " + JSON.stringify(omittedAttributes) + " for the html string of " + htmlString);

        var actual = $evui.parseHtml(htmlString, {
            omittedAttributes: omittedAttributes
        });

        var expected = document.createDocumentFragment();

        var parser = new DOMParser();
        var parsedDoc = parser.parseFromString(htmlString, "text/html");

        //snip all the omitted attributes out of the parsed document
        var numOmitted = omittedAttributes.length;
        for (var x = 0; x < numOmitted; x++)
        {
            var attrName = omittedAttributes[x];
            var eles = parsedDoc.querySelectorAll(`[${attrName}]`);
            if (eles == null) continue;

            var numEle = eles.length;
            for (var y = 0; y < numEle; y++)
            {
                eles[y].removeAttribute(attrName);
            }
        }

        //copy the document into a document fragment so it matches the structure of the DomTeee's parser.
        var numNodes = parsedDoc.body.childNodes.length;
        while (numNodes > 0)
        {
            expected.appendChild(parsedDoc.body.childNodes[0]);
            numNodes--;
        }

        $evui.assert(expected).isEquivalentTo(actual);
    }
});