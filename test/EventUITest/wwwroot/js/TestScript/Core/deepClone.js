$evui.init(function ()
{
    var root =
    {
        a: 123,
        b: "abc",
        c: [1, 2],
        d: {
            sub: false
        }
    };

    var clone1 = $evui.deepExtend({}, root);
    var clone2 = EVUI.Modules.Core.Utils.deepExtend2({}, root);

    clone2.c.push(3);
    clone2.d.dupe = clone2.c;

    console.log(clone1);
    console.log(clone2);

    conole.log(EVUI.Modules.Core.Utils.deepExtend2(clone1, clone2));

    var root =
    {
        a: 123,
        b: "abc",
        c: [1, 2],
        d: {
            sub: false
        }
    };

    var now = performance.now();
    for (var x = 0; x < 1000; x++)
    {
        var clone1 = $evui.deepExtend({}, root);
    }

    console.log(performance.now() - now);

    var now = performance.now();
    for (var x = 0; x < 1000; x++)
    {
        var clone1 = EVUI.Modules.Core.Utils.deepExtend2({}, root);
    }

    console.log(performance.now() - now);


})