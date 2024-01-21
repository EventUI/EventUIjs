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