const DomTreeTest = {};

DomTreeTest.makeDomTreeDocFragment = function (content)
{
    var domTreeFrag = new EVUI.Modules.DomTree.DomTreeElement();
    domTreeFrag.type = EVUI.Modules.DomTree.DomTreeElementType.DocumentFragment;
    domTreeFrag.flags |= EVUI.Modules.DomTree.DomTreeElementFlags.HTML;
    domTreeFrag.content = Array.isArray(content) === true ? content : [];

    return domTreeFrag;
};

DomTreeTest.makeDomTreeElement = function (tagName, content, attrs, type, flags)
{
    var domType = EVUI.Modules.DomTree.DomTreeElementType.Element;
    if (typeof type === "number")
    {
        domType = type;
    }
    else
    {
        domType = (typeof content === "string") ? EVUI.Modules.DomTree.DomTreeElementType.Text : EVUI.Modules.DomTree.DomTreeElementType.Element
    }

    var domFlags = EVUI.Modules.DomTree.DomTreeElementFlags.HTML;
    if (typeof flags === "number")
    {
        domFlags = flags;
    }

    var childContent = undefined;
    if (content === undefined)
    {
        if (typeof content === "string")
        {
            childContent = content;
        }
        else
        {
            childContent = [];
        }
    }
    else
    {
        childContent = content;
    }

    var domTreeEle = new EVUI.Modules.DomTree.DomTreeElement();
    domTreeEle.tagName = tagName;
    domTreeEle.content = childContent;
    domTreeEle.attrs = attrs;
    domTreeEle.flags = domFlags;
    domTreeEle.type = domType;

    return domTreeEle;
};

DomTreeTest.makeAttribute = function (key, value)
{
    var attr = new EVUI.Modules.DomTree.DomTreeElementAttribute();
    attr.key = key;
    attr.val = value;

    return attr;
};

DomTreeTest.stringToDomTreeArgs = function* ()
{
    var message = "Create single element";
    var htmlString = "<div></div>";
    var result = DomTreeTest.makeDomTreeDocFragment();
    result.content = [
        DomTreeTest.makeDomTreeElement("DIV")
    ];  

    yield [htmlString, result, message];

    var message = "Single element with attribute";
    var htmlString = "<div class='something'></div>";
    var result = DomTreeTest.makeDomTreeDocFragment();
    result.content = [
        DomTreeTest.makeDomTreeElement("DIV", [], [
            DomTreeTest.makeAttribute("class", "something")
        ])
    ];

    yield [htmlString, result, message];

    var message = "Single element with attribute - uppercase";
    var htmlString = "<div CLASS='something'></div>";
    var result = DomTreeTest.makeDomTreeDocFragment();
    result.content = [
        DomTreeTest.makeDomTreeElement("DIV", [], [
            DomTreeTest.makeAttribute("class", "something")
        ])
    ];

    yield [htmlString, result, message];

    var message = "Single element with attribute with spaces";
    var htmlString = "<div class = 'something'></div>";
    var result = DomTreeTest.makeDomTreeDocFragment();
    result.content = [
        DomTreeTest.makeDomTreeElement("DIV", [], [
            DomTreeTest.makeAttribute("class", "something")
        ])
    ];

    yield [htmlString, result, message];

    var message = "Single element with child element";
    var htmlString = "<div><span></span></div>";
    var result = DomTreeTest.makeDomTreeDocFragment();
    result.content = [
        DomTreeTest.makeDomTreeElement("DIV", [
            DomTreeTest.makeDomTreeElement("SPAN")
        ])
    ];

    yield [htmlString, result, message];

    var message = "Peer Elements"
    var htmlString = "<div></div><div></div><div></div>";

    var result = DomTreeTest.makeDomTreeDocFragment();
    result.content = [
        DomTreeTest.makeDomTreeElement("DIV"),
        DomTreeTest.makeDomTreeElement("DIV"),
        DomTreeTest.makeDomTreeElement("DIV")
    ];

    yield [htmlString, result, message];

    var message = "Child elements";
    var htmlString = "<div><div><div></div></div></div>"
    var result = DomTreeTest.makeDomTreeDocFragment();
    result.content = [
        DomTreeTest.makeDomTreeElement("DIV", [
            DomTreeTest.makeDomTreeElement("DIV", [
                DomTreeTest.makeDomTreeElement("DIV")
            ])
        ])
    ];

    yield [htmlString, result, message];

    var message = "Single element with child element with text";
    var htmlString = "<div><span>hello world</span></div>";
    var result = DomTreeTest.makeDomTreeDocFragment();
    result.content = [
        DomTreeTest.makeDomTreeElement("DIV", [
            DomTreeTest.makeDomTreeElement("SPAN", [
                DomTreeTest.makeDomTreeElement("#text", "hello world")])
        ])
    ];

    yield [htmlString, result, message];

    var message = "Single element with child element with text";
    var htmlString = "<div>more text<span>hello world</span></div>";
    var result = DomTreeTest.makeDomTreeDocFragment();
    result.content = [
        DomTreeTest.makeDomTreeElement("DIV", [
            DomTreeTest.makeDomTreeElement("#text", "more text"),
            DomTreeTest.makeDomTreeElement("SPAN", [
                DomTreeTest.makeDomTreeElement("#text", "hello world")])
        ])
    ];

    yield [htmlString, result, message];

    var message = "Edge case: no HTML tags";
    var htmlString = "some text";

    var result = DomTreeTest.makeDomTreeDocFragment();
    result.content = [
        DomTreeTest.makeDomTreeElement("#text", "some text")
    ];

    yield [htmlString, result, message];

    var message = "Edge case: malformed tags.";
    var htmlString = "<div>><div><><<>></div>";
    var result = DomTreeTest.makeDomTreeDocFragment();
    result.content = [
        DomTreeTest.makeDomTreeElement("DIV", [
            DomTreeTest.makeDomTreeElement("#text", ">"),
            DomTreeTest.makeDomTreeElement("DIV", [
                DomTreeTest.makeDomTreeElement("#text", "<><<>>")])            
        ])];

    yield [htmlString, result, message];
}

DomTreeTest.stringToDomNodeArgs = function* ()
{
    var message = "Create single element";
    var htmlString = "<div></div>";

    yield [htmlString, message];

    message = "Single element with attribute";
    htmlString = "<div class='something'></div>";

    yield [htmlString, message];

    var message = "Single element with attribute - uppercase";
    var htmlString = "<div CLASS='something'></div>";

    yield [htmlString, message];

    var message = "Single element with attribute with spaces";
    var htmlString = "<div class = 'something'></div>";

    yield [htmlString, message];

    message = "Peer Elements"
    htmlString = `<div></div><div></div><div></div>`;

    yield [htmlString, message];

    message = "Child elements";
    htmlString = "<div><div><div></div></div></div>"

    yield [htmlString, message];

    message = "Single element with child element";
    htmlString = "<div><span></span></div>";

    yield [htmlString, message];

    message = "Single element with child element with text";
    htmlString = "<div><span>hello world</span></div>";

    yield [htmlString, message];

    message = "Single element with child element with text";
    htmlString = "<div>more text<span>hello world</span></div>";

    yield [htmlString, message];

    message = "Edge case: no HTML tags";
    htmlString = "some text";

    yield [htmlString, message];

    message = "Edge case: malformed tags.";
    htmlString = "<div>><div><><<>></div>";

    yield [htmlString, message];
};

DomTreeTest.stringToDomNodeOmitElementArgs = function* ()
{
    var message = "Create single element";
    var htmlString = "<div></div>";
    var omittedElements = ["div"];

    yield [htmlString, message, omittedElements];

    message = "Single element with attribute - omit DEV";
    htmlString = "<div class='something'></div>";
    omittedElements = ["DiV"];

    yield [htmlString, message, omittedElements];

    message = "Peer Elements - omit SPAN"
    htmlString = `<div></div><span></span><div></div>`;
    omittedElements = ["span"];

    yield [htmlString, message, omittedElements];

    message = "Child elements - omit DIV";
    htmlString = "<div><span><div></div></span></div>"
    omittedElements = ["div"];

    yield [htmlString, message, omittedElements];

    message = "Single element with child element - omit SPAN";
    htmlString = "<div><span></span></div>";
    omittedElements = ["SPAN"];

    yield [htmlString, message, omittedElements];

    message = "Single element with child element with text - omit LABEL";
    htmlString = "<div><span><label>hello world</label></span></div>";
    omittedElements = ["label"];

    yield [htmlString, message, omittedElements];

    message = "Single element with child element with text";
    htmlString = "<div>more text<span>hello world</span></div>";
    omittedElements = ["SpAn"];

    yield [htmlString, message, omittedElements];

    message = "Edge case: no HTML tags";
    htmlString = "some text";
    omittedElements = ["h1"];

    yield [htmlString, message, omittedElements];

    message = "Edge case: malformed tags.";
    htmlString = "<div>><div><><<>></div>";
    omittedElements = ["DIV"];

    yield [htmlString, message, omittedElements];
};

DomTreeTest.stringToDomTreeOmitElementArgs = function* ()
{
    var message = "Create single element";
    var htmlString = "<div></div>";
    var omittedElements = ["div"];
    var expected = DomTreeTest.makeDomTreeDocFragment([]);

    yield [htmlString, expected, message, omittedElements];

    message = "Single element with attribute - omit DEV";
    htmlString = "<div class='something'></div>";
    omittedElements = ["div"];
    expected = DomTreeTest.makeDomTreeDocFragment([]);

    yield [htmlString, expected, message, omittedElements];

    message = "Peer Elements - omit SPAN"
    htmlString = `<div></div><span></span><div></div>`;
    omittedElements = ["span"];
    expected = DomTreeTest.makeDomTreeDocFragment([
        DomTreeTest.makeDomTreeElement("DIV"),
        DomTreeTest.makeDomTreeElement("DIV")]);

    yield [htmlString, expected, message, omittedElements];

    message = "Child elements - omit DIV";
    htmlString = "<div><span><div></div></span></div>"
    omittedElements = ["div"];
    expected = DomTreeTest.makeDomTreeDocFragment([]);

    yield [htmlString, expected, message, omittedElements];

    message = "Single element with child element - omit SPAN";
    htmlString = "<div><span></span></div>";
    omittedElements = ["span"];
    expected = DomTreeTest.makeDomTreeDocFragment([
        DomTreeTest.makeDomTreeElement("DIV")]);

    yield [htmlString, expected, message, omittedElements];

    message = "Single element with child element with text - omit #text";
    htmlString = "<div><span>hello world</span></div>";
    omittedElements = ["SPAN"];
    expected = DomTreeTest.makeDomTreeDocFragment([
        DomTreeTest.makeDomTreeElement("DIV")]);

    yield [htmlString, expected, message, omittedElements];

    message = "Single element with child element with text";
    htmlString = "<div>more text<span>hello world</span></div>";
    omittedElements = ["SPAN"];
    expected = DomTreeTest.makeDomTreeDocFragment([
        DomTreeTest.makeDomTreeElement("DIV", [
            DomTreeTest.makeDomTreeElement("#text", "more text")
        ])]);

    yield [htmlString, expected, message, omittedElements];

    message = "Edge case: no HTML tags";
    htmlString = "some text";
    omittedElements = ["h1"];
    expected = DomTreeTest.makeDomTreeDocFragment([
        DomTreeTest.makeDomTreeElement("#text", "some text")]);

    yield [htmlString, expected, message, omittedElements];

    message = "Edge case: malformed tags.";
    htmlString = "<div>><div><><<>></div>";
    omittedElements = ["DIV"];
    expected = DomTreeTest.makeDomTreeDocFragment([]);

    yield [htmlString, expected, message, omittedElements];
};

DomTreeTest.stringToDomNodeArgsOmitAttributes = function* ()
{
    var message = "Omit single attribute on single tag.";
    var htmlString = "<div attr1='value'></div>";
    var omittedAttributes = ["attr1"];

    yield [htmlString, message, omittedAttributes];

    message = "Omit single attribute on single tag - case mismatch (omission).";
    htmlString = "<div attr1='value'></div>";
    omittedAttributes = ["ATTR1"];

    yield [htmlString, message, omittedAttributes];

    message = "Omit single attribute on single tag - case mismatch (markup).";
    htmlString = "<div ATTR1='value'></div>";
    omittedAttributes = ["attr1"];

    yield [htmlString, message, omittedAttributes];

    message = "Omit single attribute on multiple tags.";
    htmlString = "<div attr1='value'><span attr1='again'>Hello World</span></div>";
    omittedAttributes = ["attr1"];

    yield [htmlString, message, omittedAttributes];

    message = "Omit two different attributes on same tag.";
    htmlString = "<div attr1='value' style='background-color: red;'><span>Hello World</span></div>";
    omittedAttributes = ["attr1", "style"];

    yield [htmlString, message, omittedAttributes];

    message = "Omit two different attributes on two tags.";
    htmlString = "<div attr1='value'style='background-color: red;'><span style='background-color: red;'>Hello World</span></div>";
    omittedAttributes = ["attr1", "style"];

    yield [htmlString, message, omittedAttributes];
}