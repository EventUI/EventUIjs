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
];

var SomeObj = function ()
{
    this.a = 1;
    this.b = 2;

    this.someFunction = function ()
    {
        console.log("asdf");
    }
};

var functionCompareTypeArgs = function* ()
{
    var baseObj = new SomeObj();
    var otherObj = new SomeObj();

    yield [baseObj, otherObj, EVUITest.FunctionCompareType.Ignore, true];
    yield [baseObj, otherObj, EVUITest.FunctionCompareType.Reference, false];
    yield [baseObj, otherObj, EVUITest.FunctionCompareType.Value, true];
    yield [baseObj, { ...baseObj }, EVUITest.FunctionCompareType.Reference, true];
    yield [baseObj, { ...baseObj, someFunction: function () { } }, EVUITest.FunctionCompareType.Value, false];
    yield [baseObj, { ...baseObj, someFunction: function () { } }, EVUITest.FunctionCompareType.Reference, false];
    yield [baseObj, { ...baseObj, someFunction: function () { } }, EVUITest.FunctionCompareType.Ignore, true];
}

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
    name: "Assertion - isNot - ArgArray",
    testArgs: argArray,
    test: function (testArgs, a, b, valuesMatch)
    {
        testArgs.options.shouldFail = valuesMatch;
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
    name: "Assertion - isNot - ArgGenerator",
    testArgs: argGenerator,
    test: function (testArgs, a, b, valuesMatch)
    {
        testArgs.options.shouldFail = valuesMatch;
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
    name: "Assertion - isNot - ArgFunction",
    testArgs: argFn,
    test: function (testArgs, a, b, valuesMatch)
    {
        testArgs.options.shouldFail = valuesMatch;
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
    testArgs: argArray,
    test: function (testArgs, a, b, valuesMatch)
    {
        testArgs.options.shouldFail = !valuesMatch;
        var result = null;

        try
        {
            result = $evui.assert(a).is(b);
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
    name: "Assertion - functionCompareType",
    testArgs: functionCompareTypeArgs,
    test: function (testArgs, a, b, compareType, valuesMatch)
    {
        testArgs.options.shouldFail = !valuesMatch;
        var result = null;

        try
        {
            result = $evui.assert(a, { functionCompareType: compareType }).isEquivalentTo(b);
            testArgs.outputWriter.logInfo(result.message);
        }
        catch (ex)
        {
            testArgs.outputWriter.logInfo(ex.message);
            throw ex;
        }
    }
});