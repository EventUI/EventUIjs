$evui.init(async function ()
{
    var source = {
        name: "root",
        items: []
    };

    for (var x = 0; x < 133; x++)
    {
        var item =
        {
            name: x.toString(),
            items: []
        }

        source.items.push(item);
        if (x % 3 === 0)
        {
            for (var y = 0; y < 3; y++)
            {
                var innerItem =
                {
                    name: x.toString() + "." + y.toString(),
                    items: []
                }

                item.items.push(innerItem);
            }
        }
    };

    var tree = $evui.addTreeView({
        id: "test",
        bindingTemplate:
        {
            htmlContent: "<div>{{name}}</div>",
        },
        childListName: "items",
        source: source,
        element: document.getElementById("treeRoot"),
        options: {
            noTopNode: true,
            lazy: true
        },
        onExpanded: function ()
        {
            console.log("Expanded");
            console.log(tree);
        },
        onBuilt: function ()
        {
            console.log("Built");
            console.log(tree);
        }
    });

    tree.addEventListener("built", function (args)
    {
        console.log("Bubbling Built");
    });

    tree.addEventListener("built", function (args)
    {
        console.log("Bubbling Built2");
    });

    await tree.buildAsync();

    console.log(tree);

    document.getElementById("swap").onclick = function ()
    {
        var temp = tree.source.items[0];
        tree.source.items[0] = tree.source.items[1];
        tree.source.items[1] = temp;

        tree.build();
    };

    document.getElementById("cancelExpand").onclick = function ()
    {
        var nodes = tree.getNodes();


        nodes[0].expand(function () { $evui.log("Expand 1") });
        nodes[0].collapse(function () { $evui.log("Collapse 1") });
        nodes[0].expand(function () { $evui.log("Expand 2") });
    };

    document.getElementById("cancelCollapse").onclick = function ()
    {
        var nodes = tree.getNodes();

        nodes[0].collapse(function () { $evui.log("Collapse 1") });
        nodes[0].expand(function () { $evui.log("Expand 1") });
        nodes[0].collapse(function () { $evui.log("Collapse 2") });
    };

    document.getElementById("continueBuild").onclick = function ()
    {
        var nodes = tree.getNodes();

        nodes[0].build(function () { $evui.log("Build 1") });
        nodes[0].expand(function () { $evui.log("Expand 1") });
        nodes[0].build(function () { $evui.log("Build 2") });
    };

    document.getElementById("skip").onclick = function ()
    {
        var nodes = tree.getNodes();

        nodes[0].expand(function () { $evui.log("Expand 1") });
        nodes[0].expand(function () { $evui.log("Expand 2") });
    };
});