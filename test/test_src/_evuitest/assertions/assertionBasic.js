var argArray = [
    [1, 2, false],
    [1, 1, true],
    ["a", "b", false],
    ["a", "a", true],
    [true, false, false],
    [true, true, true],
    [null, undefined, true], //by default null and undefined are considered equal
    [null, null, true],
    [undefined, undefined, true]
]


var argGenerator = function* ()
{
    var numArgs = argArray.length;
    for (var x = 0; x < numArgs; x++)
    {
        yield argArray[x];
    }

    return;
};

var argFn = function ()
{
    return argArray;
}

$evui.testHost.runAsync({
    name: "Assertion - doesNotEqual",
    testArgs: argArray,
    test: function (testArgs, a, b, shouldFail)
    {
        testArgs.options.shouldFail = shouldFail;
        var result = null;

        try
        {
            result = $evui.assert(a).isNot(b);
            testArgs.outputWriter.logInfo(result.message);
        }
        catch (ex)
        {
            testArgs.outputWriter.logInfo(ex.message);
            throw ex;
        }
    }
});

$evui.testHost.runAsync({
    name: "Assertion - isNot",
    testArgs: argGenerator,
    test: function (testArgs, a, b, shouldFail)
    {
        testArgs.options.shouldFail = shouldFail;
        var result = null;

        try
        {
            result = $evui.assert(a).isNot(b);
            testArgs.outputWriter.logInfo(result.message);
        }
        catch (ex)
        {
            testArgs.outputWriter.logInfo(ex.message);
            throw ex;
        }
    }
});

$evui.testHost.runAsync({
    name: "Assertion - isNot",
    testArgs: argFn,
    test: function (testArgs, a, b, shouldFail)
    {
        testArgs.options.shouldFail = shouldFail;
        var result = null;

        try
        {
            result = $evui.assert(a).isNot(b);
            testArgs.outputWriter.logInfo(result.message);
        }
        catch (ex)
        {
            testArgs.outputWriter.logInfo(ex.message);
            throw ex;
        }
    }
});

$evui.testHost.runAsync({
    name: "Assertion - is",
    args: [],
    test: function (testArgs, a, b)
    {
        var result = $evui.assert("1").is("1");
        testArgs.outputWriter.logInfo(result.message);
    }
});