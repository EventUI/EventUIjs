$evui.init(function ()
{
    var a =
    {
        as: 12,
        df:
        {
            a: 1,
            b: 2
        },
        arr: [1, 2, {c: 3, d: 4}]
    };

    a.a = a;

    var b =
    {
        asd: 123,
        as: 12,
        df:  a.df,
        arr:[1, 2, a.df]
    };

    b.b = b;
    a.b = b;


    var diffResult = $evui.diff(a, b, { compareValuesOnly: true });
    for (var x = 0; x < diffResult.allComparisons.length; x++)
    {
        console.log(diffResult.allComparisons[x].getPath());
    }

    var numProps = 1001;
    var obj1 = [];
    var obj2 = [];

    for (var x = 1; x < numProps; x++)
    {
        obj1.push({ prop1: x, prop2: "asdf" });
        obj2.push({ prop1: x * 2, prop2: "asdf" });
    }

    var now = Date.now();
    var diff = $evui.diff(obj1, obj2, { compareValuesOnly: true, lazyHashEvaluation: true });
    console.log(Date.now() - now);

    console.log(diff);
});

