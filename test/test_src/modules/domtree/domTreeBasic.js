
var DomTree = EVUI.Modules.DomTree;

var makeDomTreeDocFragment = function ()
{
    var domTreeFrag = new DomTree.DomTreeElement();
    domTreeFrag.type = DomTree.DomTreeElementType.DocumentFragment;
    domTreeFrag.flags |= DomTree.DomTreeElementFlags.HTML;
    domTreeFrag.content = [];

    return domTreeFrag;
};

var makeDomTreeElement = function (tagName, content, attrs, type, flags)
{
    var domType = DomTree.DomTreeElementType.Element;
    if (typeof type === "number")
    {
        domType = type;
    }
    else
    {
        domType = (typeof content === "string") ? DomTree.DomTreeElementType.Text : DomTree.DomTreeElementType.Element
    }

    var domFlags = DomTree.DomTreeElementFlags.HTML;
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

    var domTreeEle = new DomTree.DomTreeElement();
    domTreeEle.tagName = tagName;
    domTreeEle.content = childContent;
    domTreeEle.attrs = attrs;
    domTreeEle.flags = domFlags;
    domTreeEle.type = domType;

    return domTreeEle;
};

var makeAttribute = function (key, value)
{
    var attr = new DomTree.DomTreeElementAttribute();
    attr.key = key;
    attr.val = value;

    return attr;
}

await $evui.testAsync({
    name: "DomTree - basic string to DomTreeElement",
    test: function (testArgs)
    {
        var html = "<div></div>";

        var wrapper = makeDomTreeDocFragment();
        wrapper.content.push(makeDomTreeElement("DIV"));

        var result = $evui.parseHtmlToDomTree(html);

        $evui.assert(wrapper).isEquivalentTo(result);
    }
});

await $evui.testAsync({
    name: "DomTree - basic string to DomTreeElement with peer DomTreeElements.",
    test: function (testArgs)
    {
        var html =
        `<div></div><div></div><div></div>`;

        var wrapper = makeDomTreeDocFragment();
        wrapper.content = [
            makeDomTreeElement("DIV"),
            makeDomTreeElement("DIV"),
            makeDomTreeElement("DIV")
        ];

        var result = $evui.parseHtmlToDomTree(html);

        $evui.assert(wrapper).isEquivalentTo(result);
    }
});

await $evui.testAsync({
    name: "DomTree - basic string to DomTreeElement with child DomTreeElements.",
    test: function (testArgs)
    {
        var html =
            `<div><div><div></div></div></div>`;

        var wrapper = makeDomTreeDocFragment();
        wrapper.content = [
            makeDomTreeElement("DIV", [
                makeDomTreeElement("DIV", [
                    makeDomTreeElement("DIV")
                ])
            ])        
        ];

        var result = $evui.parseHtmlToDomTree(html);

        $evui.assert(wrapper).isEquivalentTo(result);
    }
});

await $evui.testAsync({
    name: "DomTree - basic string to DomTreeElement with attributes.",
    test: function (testArgs)
    {
        var html =
            `<div attr1='asdf' attr2='1234'></div>`;

        var wrapper = makeDomTreeDocFragment();
        wrapper.content = [
            makeDomTreeElement("DIV", [], [
                makeAttribute("attr1", "asdf"),
                makeAttribute("attr2", "1234")])];

        var result = $evui.parseHtmlToDomTree(html);

        $evui.assert(wrapper).isEquivalentTo(result);
    }
});

await $evui.testAsync({
    name: "DomTree - basic string to DomTreeElement with text content.",
    test: function (testArgs)
    {
        var html =
            `<span>some text</span>`;

        var wrapper = makeDomTreeDocFragment();
        wrapper.content = [
            makeDomTreeElement("SPAN", [
                makeDomTreeElement("#text", "some text")
            ])];

        var result = $evui.parseHtmlToDomTree(html);

        $evui.assert(wrapper).isEquivalentTo(result);
    }
});

await $evui.testAsync({
    name: "DomTree - edge case: no tags.",
    test: function (testArgs)
    {
        var html =
            `some text`;

        var wrapper = makeDomTreeDocFragment();
        wrapper.content = [
            makeDomTreeElement("#text", "some text")
        ];

        var result = $evui.parseHtmlToDomTree(html);

        $evui.assert(wrapper).isEquivalentTo(result);
    }
});

await $evui.testAsync({
    name: "DomTree - edge case: malformed tags.",
    test: function (testArgs)
    {
        var html =
            `<div>><><><<>></div>`;

        var wrapper = makeDomTreeDocFragment();
        wrapper.content = [
            makeDomTreeElement("DIV", [
                makeDomTreeElement("#text", "><><><<>>")
            ])];

        var result = $evui.parseHtmlToDomTree(html);

        $evui.assert(wrapper).isEquivalentTo(result);
    }
});