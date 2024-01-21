await $evui.testAsync({
    name: "DomTree - basic string to DomTreeElement",
    test: function (testArgs)
    {
        var html = "<div></div>";

        var wrapper = DomTreeTest.makeDomTreeDocFragment();
        wrapper.content.push(DomTreeTest.makeDomTreeElement("DIV"));

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

        var wrapper = DomTreeTest.makeDomTreeDocFragment();
        wrapper.content = [
            DomTreeTest.makeDomTreeElement("DIV"),
            DomTreeTest.makeDomTreeElement("DIV"),
            DomTreeTest.makeDomTreeElement("DIV")
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

        var wrapper = DomTreeTest.makeDomTreeDocFragment();
        wrapper.content = [
            DomTreeTest.makeDomTreeElement("DIV", [
                DomTreeTest.makeDomTreeElement("DIV", [
                    DomTreeTest.makeDomTreeElement("DIV")
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

        var wrapper = DomTreeTest.makeDomTreeDocFragment();
        wrapper.content = [
            DomTreeTest.makeDomTreeElement("DIV", [], [
                DomTreeTest.makeAttribute("attr1", "asdf"),
                DomTreeTest.makeAttribute("attr2", "1234")])];

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

        var wrapper = DomTreeTest.makeDomTreeDocFragment();
        wrapper.content = [
            DomTreeTest.makeDomTreeElement("SPAN", [
                DomTreeTest.makeDomTreeElement("#text", "some text")
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

        var wrapper = DomTreeTest.makeDomTreeDocFragment();
        wrapper.content = [
            DomTreeTest.makeDomTreeElement("#text", "some text")
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

        var wrapper = DomTreeTest.makeDomTreeDocFragment();
        wrapper.content = [
            DomTreeTest.makeDomTreeElement("DIV", [
                DomTreeTest.makeDomTreeElement("#text", "><><><<>>")
            ])];

        var result = $evui.parseHtmlToDomTree(html);

        $evui.assert(wrapper).isEquivalentTo(result);
    }
});