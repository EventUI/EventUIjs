$evui.init(async function ()
{
    var source = [];

    for (var x = 0; x < 100; x++)
    {
        source.push({
            prop1: x,
            prop2: "\"",
            prop3: "hades",
            prop4: ".*",
            prop5: "isHungry",
            prop6: x * 2,
            prop7: "meow",
            prop8: "<br>"
        });
    }

    var now = Date.now();
    await $evui.bindAsync({ element: "#bindingContent", source: source, htmlContent: "<span><strong>{{prop1}}</strong>{{prop2}}<strong>{{prop3}}</strong>{{prop4}}<strong>{{prop5}}</strong>{{prop6}}<strong>{{prop7}}</strong>{{prop8}}</span>"});
    console.log(Date.now() - now);

    var hash = document.getElementById("hash");
    hash.onclick = function ()
    {
        var runs = [];
        for (var x = 0; x < 12; x++)
        {
            var now = Date.now();
            console.log($evui.getHashCode(document.body.innerHTML));
            var elapsed = Date.now() - now;
            runs.push(elapsed);
            console.log(elapsed);
        }

        var sum = 0;
        runs.sort(function (a, b) { return b - a });
        for (var x = 2; x < 12; x++)
        {
            sum += runs[x];
        }

        console.log("Document hash average: " + (sum / 10));
    };

    var domDiff = document.getElementById("domDiff");
    domDiff.onclick = function ()
    {
        var runs = [];
        for (var x = 0; x < 12; x++)
        {
            var tree1 = $evui.toDomTreeElement(document.body, { includeNodeReferences: true });
            document.body.children[5].innerHTML = "<div>LOLOLO<stong>LOLOLO</strong>LOLO" + $evui.guid() + "</div>";
            var tree2 = $evui.toDomTreeElement(document.body, { includeNodeReferences: true });

            var now = Date.now();
            console.log($evui.diff(tree1, tree2, { compareValuesOnly: true }));
            var elapsed = Date.now() - now;
            runs.push(elapsed);
            console.log(elapsed);
        }

        var sum = 0;
        runs.sort(function (a, b) { return b - a });
        for (var x = 2; x < 12; x++)
        {
            sum += runs[x];
        }

        console.log("Document diff average: " + (sum / 10));
    };

    var collisions = document.getElementById("hashCollision");
    collisions.onclick = function ()
    {
        var tree1 = $evui.toDomTreeElement(document.body, { includeNodeReferences: true });
        document.body.children[5].innerHTML = "<div>LOLOLO<stong>LOLOLO</strong>LOLO + " + $evui.guid() + "</div>";
        var tree2 = $evui.toDomTreeElement(document.body, { includeNodeReferences: true });

        var diff = $evui.diff(tree1, tree2, { compareValuesOnly: true });

        var duplicates = {};
        var numComparisons = diff.allComparisons.length;
        for (var x = 0; x < numComparisons; x++)
        {
            var curComparison = diff.allComparisons[x];
            if (curComparison.diffType === EVUI.Modules.Diff.DiffType.Object)
            {
                if (curComparison.a instanceof EVUI.Modules.DomTree.DomTreeElement)
                {
                    if (duplicates[curComparison.getAHashCode()] == null)
                    {
                        duplicates[curComparison.getAHashCode()] = [curComparison];
                    }
                    else
                    {
                        var arr = duplicates[curComparison.getAHashCode()];
                        var dupes = arr.filter(function (comp) { comp.a === curComparison.a });
                        if (dupes.length === 0) arr.push(curComparison);
                    }
                }

                if (curComparison.b instanceof EVUI.Modules.DomTree.DomTreeElement && curComparison.a !== curComparison.b)
                {
                    if (duplicates[curComparison.getBHashCode()] == null)
                    {
                        duplicates[curComparison.getBHashCode()] = [curComparison];
                    }
                    else
                    {
                        var arr = duplicates[curComparison.getBHashCode()];
                        var dupes = arr.filter(function (comp) { comp.b === curComparison.b });
                        if (dupes.length === 0) arr.push(curComparison);
                    }
                }
            }
        }

        for (var prop in duplicates)
        {
            var curMatch = duplicates[prop];
            if (curMatch.length > 4)
            {
                console.log("match: " + prop);
                console.log(curMatch);

                curMatch.forEach(function (match) { console.log($evui.fromDomTreeElement(match.a, null, true)) });
            }
        }
    };

    var domTree = document.getElementById("domTree");
    domTree.onclick = function ()
    {
        var runs = [];
        for (var x = 0; x < 12; x++)
        {
            var tree1 = $evui.toDomTreeElement(document.body, { includeNodeReferences: true });
            console.log(tree1);

            var now = Date.now();
            var elapsed = Date.now() - now;
            runs.push(elapsed);
            console.log(elapsed);
        }

        var sum = 0;
        runs.sort(function (a, b) { return b - a });
        for (var x = 2; x < 12; x++)
        {
            sum += runs[x];
        }

        console.log("DomTree average: " + (sum / 10));
    };
});