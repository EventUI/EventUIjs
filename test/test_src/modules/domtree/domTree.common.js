const DomTreeTest = {};

DomTreeTest.makeDomTreeDocFragment = function ()
{
    var domTreeFrag = new EVUI.Modules.DomTree.DomTreeElement();
    domTreeFrag.type = EVUI.Modules.DomTree.DomTreeElementType.DocumentFragment;
    domTreeFrag.flags |= EVUI.Modules.DomTree.DomTreeElementFlags.HTML;
    domTreeFrag.content = [];

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
    var htmlstring = "<div></div>";
    var result = DomTreeTest.makeDomTreeDocFragment();
    result.content = [
        DomTreeTest.makeDomTreeElement("DIV")
    ];  

    yield [htmlstring, result, message];

    message = "Single element with attribute";
    htmlstring = "<div class='something'></div>";
    result = DomTreeTest.makeDomTreeDocFragment();
    result.content = [
        DomTreeTest.makeDomTreeElement("DIV", [], [
            DomTreeTest.makeAttribute("class", "something")
        ])
    ];

    yield [htmlstring, result, message];

    message = "Single element with child element";
    htmlstring = "<div><span></span></div>";
    result = DomTreeTest.makeDomTreeDocFragment();
    result.content = [
        DomTreeTest.makeDomTreeElement("DIV", [
            DomTreeTest.makeDomTreeElement("SPAN")
        ])
    ];

    yield [htmlstring, result, message];

    message = "Single element with child element with text";
    htmlstring = "<div><span>hello world</span></div>";
    result = DomTreeTest.makeDomTreeDocFragment();
    result.content = [
        DomTreeTest.makeDomTreeElement("DIV", [
            DomTreeTest.makeDomTreeElement("SPAN", [
                DomTreeTest.makeDomTreeElement("#text", "hello world")])
        ])
    ];

    yield [htmlstring, result, message];

    message = "Single element with child element with text";
    htmlstring = "<div>more text<span>hello world</span></div>";
    result = DomTreeTest.makeDomTreeDocFragment();
    result.content = [
        DomTreeTest.makeDomTreeElement("DIV", [
            DomTreeTest.makeDomTreeElement("#text", "more text"),
            DomTreeTest.makeDomTreeElement("SPAN", [
                DomTreeTest.makeDomTreeElement("#text", "hello world")])
        ])
    ];

    yield [htmlstring, result, message];
}

DomTreeTest.stringToDomNodeArgs = function* ()
{
    var message = "Create single element";
    var htmlstring = "<div></div>";
    
    yield [htmlstring, message];

    message = "Single element with attribute";
    htmlstring = "<div class='something'></div>";
    
    yield [htmlstring, message];

    message = "Single element with child element";
    htmlstring = "<div><span></span></div>";

    yield [htmlstring, message];

    message = "Single element with child element with text";
    htmlstring = "<div><span>hello world</span></div>";
    
    yield [htmlstring, message];

    message = "Single element with child element with text";
    htmlstring = "<div>more text<span>hello world</span></div>";
   
    yield [htmlstring, message];
}