$evui.init(function ()
{
    var paramPairs = [];

    paramPairs.push({ a: 1, b: 1 });
    paramPairs.push({ a: 1, b: "1", settings: { strictEquals: false } });
    paramPairs.push({ a: "one", b: "ONE" });
    paramPairs.push({ a: "one", b: "ONE", settings: { ignoreCase: true } });
    paramPairs.push({ a: "asd", b: 123 });
    paramPairs.push({ a: 1n, b: 1 });
    paramPairs.push({ a: 1n, b: 1, settings: { strictEquals: false } });
    paramPairs.push({ a: true, b: true });
    paramPairs.push({ a: true, b: "1", settings: { strictEquals: false } });
    paramPairs.push({ a: 1, b: 1 });
    paramPairs.push({ a: false, b: "1", settings: { strictEquals: false } });
    paramPairs.push({ a: { a: "one" }, b: { a: "one" }, settings: { strictEquals: false, ignoreReferences: true } });
    paramPairs.push({ a: { a: "one" }, b: { a: "one", two: "two" }, settings: { strictEquals: false, ignoreReferences: true } });
    paramPairs.push({ a: { a: "one", two: "three" }, b: { a: "one", two: "two" }, settings: { strictEquals: false, ignoreReferences: true } });

    var numParams = paramPairs.length;
    for (var x = 0; x < numParams; x++)
    {
        try
        {
            var curPair = paramPairs[x];
            $evui.assert(curPair.a).equals(curPair.b, curPair.settings);
        }
        catch (ex)
        {
            console.log(ex);
        }
    }

    $evui.assert("AbC").isRoughly("abc");
});