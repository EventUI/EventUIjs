
var getNextCharacter = function (str, depth, chars)
{
    if (depth <= 0) return;
    if (chars == null) chars = [];

    for (var x = 32; x < 137; x++)
    {
        var curStr = str + String.fromCharCode(x);
        chars.push(curStr);

        getNextCharacter(curStr, depth - 1, chars);
    }

    return chars;
};

$evui.testAsync({
    name: "HashCollision - all 3 character alphanumeric string combinations",
    test: function (hostArgs)
    {
        var result = getNextCharacter("", 3);

        var numResult = result.length;
        var hashes = {};
        var collisions = {};

        for (var x = 0; x < numResult; x++)
        {
            var curStr = result[x];
            var curHash = $evui.getHashCode(curStr);

            var existing = hashes[curHash];
            if (existing != null)
            {
                collisions[curHash] = existing;
                existing.push(curStr);

                hostArgs.outputWriter.logWarning("Collision! " + curStr + " = " + curHash);
            }
            else
            {
                hashes[curHash] = [curStr];
            }
        }

        hostArgs.outputWriter.logInfo("Total hashes computed: " + numResult);

        if (Object.keys(collisions).length > 0)
        {
            hostArgs.fail("Hash Collisions found:" + JSON.stringify(collisions));
        }
    }
});

$evui.testAsync({
    name: "HashCollision - 1,000,000 GUIDs",
    test: function (hostArgs)
    {
        var numResult = 1000000;
        var hashes = {};
        var collisions = {};

        for (var x = 0; x < numResult; x++)
        {
            var curStr = $evui.guid();
            var curHash = $evui.getHashCode(curStr);

            var existing = hashes[curHash];
            if (existing != null)
            {
                collisions[curHash] = existing;
                existing.push(curStr);

                hostArgs.outputWriter.logWarning("Collision! " + curStr + " = " + curHash);
            }
            else
            {
                hashes[curHash] = [curStr];
            }
        }

        hostArgs.outputWriter.logInfo("Total hashes computed: " + Object.keys(hashes).length);

        if (Object.keys(collisions).length > 0)
        {
            hostArgs.fail("Hash Collisions found:" + JSON.stringify(collisions));
        }
    }
});
