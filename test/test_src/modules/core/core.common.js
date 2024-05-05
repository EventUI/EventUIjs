const CoreTest = {};

CoreTest.makeAsyncExecutorArgs = function* ()
{
    var name = null;
    var useAwait = false;
    var args = null;
    var parameter = null;
    var expected = null;
    var willCrash = null;
    var forceCompletion = null;

    //basic tests

    name = "Basic Callback - Function Array";
    useAwait = false;
    parameter = [];
    args = [
        CoreTest.makeParameterlessExecutorFunction(0, "sync", null, null, parameter),
        CoreTest.makeParameterlessExecutorFunction(1, "async", 50, null, parameter),
        CoreTest.makeParameterlessExecutorFunction(2, "async", 25, null, parameter),
        CoreTest.makeParameterlessExecutorFunction(3, "promise", null, null, parameter)
    ];

    expected = [0, 1, 2, 3];

    yield [name, useAwait, args, parameter, expected];

    name = "Basic Await - Funuction Array";
    useAwait = true;
    parameter = [];
    args = [
        CoreTest.makeParameterlessExecutorFunction(0, "sync", null, null, parameter),
        CoreTest.makeParameterlessExecutorFunction(1, "async", 50, null, parameter),
        CoreTest.makeParameterlessExecutorFunction(2, "async", 25, null, parameter),
        CoreTest.makeParameterlessExecutorFunction(3, "promise", null, null, parameter)
    ];

    expected = [0, 1, 2, 3];

    yield [name, useAwait, args, parameter, expected];

    name = "Basic Callback - AsyncSequenceExecutionArgs";
    useAwait = false;
    args = new EVUI.Modules.Core.AsyncSequenceExecutionArgs();
    args.functions = [
        CoreTest.makeExecutorFunction(0, "sync"),
        CoreTest.makeExecutorFunction(1, "async", 50),
        CoreTest.makeExecutorFunction(2, "async", 25),
        CoreTest.makeExecutorFunction(3, "promise")
    ];
    args.parameter = [];
    parameter = args.parameter;
    expected = [0, 1, 2, 3];

    yield [name, useAwait, args, parameter, expected];

    name = "Basic Await - AsyncSequenceExecutionArgs";
    useAwait = true;
    args = new EVUI.Modules.Core.AsyncSequenceExecutionArgs();
    args.functions = [
        CoreTest.makeExecutorFunction(0, "sync"),
        CoreTest.makeExecutorFunction(1, "async", 50),
        CoreTest.makeExecutorFunction(2, "async", 25),
        CoreTest.makeExecutorFunction(3, "promise")
    ];
    args.parameter = [];
    parameter = args.parameter;
    expected = [0, 1, 2, 3];

    yield [name, useAwait, args, parameter, expected];

    //crash all tests

    name = "Crash All Callback - AsyncSequenceExecutionArgs - Completion Not Forced";
    useAwait = false;
    args = new EVUI.Modules.Core.AsyncSequenceExecutionArgs();
    args.functions = [
        CoreTest.makeExecutorFunction(0, "sync", null, true),
        CoreTest.makeExecutorFunction(1, "async", 50, true),
        CoreTest.makeExecutorFunction(2, "async", 25, true),
        CoreTest.makeExecutorFunction(3, "promise", null, true)
    ];
    args.parameter = [];
    parameter = args.parameter;
    willCrash = true;
    forceCompletion = false;
    expected = [];

    yield [name, useAwait, args, parameter, expected, willCrash, forceCompletion];

    name = "Crash All Callback - AsyncSequenceExecutionArgs - Completion Forced";
    useAwait = false;
    args = new EVUI.Modules.Core.AsyncSequenceExecutionArgs();
    args.functions = [
        CoreTest.makeExecutorFunction(0, "sync", null, true),
        CoreTest.makeExecutorFunction(1, "async", 50, true),
        CoreTest.makeExecutorFunction(2, "async", 25, true),
        CoreTest.makeExecutorFunction(3, "promise", null, true)
    ];
    args.parameter = [];
    args.forceCompletion = true;
    parameter = args.parameter;
    willCrash = true;
    forceCompletion = true;
    expected = [];

    yield [name, useAwait, args, parameter, expected, willCrash, forceCompletion];

    name = "Crash All Callback - Function Array - Completion Not Forced";
    useAwait = true;
    parameter = [];
    args = [
        CoreTest.makeParameterlessExecutorFunction(0, "sync", null, true, parameter),
        CoreTest.makeParameterlessExecutorFunction(1, "async", 50, true, parameter),
        CoreTest.makeParameterlessExecutorFunction(2, "async", 25, true, parameter),
        CoreTest.makeParameterlessExecutorFunction(3, "promise", null, true, parameter)
    ];
    willCrash = true;
    forceCompletion = false;
    expected = [];

    yield [name, useAwait, args, parameter, expected, willCrash, forceCompletion];

    //crash some functions, but not all

    name = "Crash All Callback - AsyncSequenceExecutionArgs - Completion Not Forced";
    useAwait = false;
    args = new EVUI.Modules.Core.AsyncSequenceExecutionArgs();
    args.functions = [
        CoreTest.makeExecutorFunction(0, "sync", null),
        CoreTest.makeExecutorFunction(1, "sync", null, true),
        CoreTest.makeExecutorFunction(2, "async", 50),
        CoreTest.makeExecutorFunction(3, "async", 25, true),
        CoreTest.makeExecutorFunction(4, "promise", null),
        CoreTest.makeExecutorFunction(5, "promise", null, true)
    ];
    args.parameter = [];
    parameter = args.parameter;
    willCrash = true;
    forceCompletion = false;
    expected = [0];

    yield [name, useAwait, args, parameter, expected, willCrash, forceCompletion];

    name = "Crash Some Callback - AsyncSequenceExecutionArgs - Completion Forced";
    useAwait = false;
    args = new EVUI.Modules.Core.AsyncSequenceExecutionArgs();
    args.functions = [
        CoreTest.makeExecutorFunction(0, "sync", null),
        CoreTest.makeExecutorFunction(1, "sync", null, true),
        CoreTest.makeExecutorFunction(2, "async", 50),
        CoreTest.makeExecutorFunction(3, "async", 25, true),
        CoreTest.makeExecutorFunction(4, "promise", null),
        CoreTest.makeExecutorFunction(5, "promise", null, true)
    ];
    args.parameter = [];
    args.forceCompletion = true;
    parameter = args.parameter;
    willCrash = true;
    forceCompletion = true;
    expected = [0, 2, 4];

    yield [name, useAwait, args, parameter, expected, willCrash, forceCompletion];

    name = "Crash Some Callback - Function Array - Completion Not Forced";
    useAwait = false;
    parameter = [];
    args = [
        CoreTest.makeParameterlessExecutorFunction(0, "sync", null, false, parameter),
        CoreTest.makeParameterlessExecutorFunction(1, "sync", null, true, parameter),
        CoreTest.makeParameterlessExecutorFunction(2, "async", 50, false, parameter),
        CoreTest.makeParameterlessExecutorFunction(3, "async", 25, true, parameter),
        CoreTest.makeParameterlessExecutorFunction(4, "promise", null, false, parameter),
        CoreTest.makeParameterlessExecutorFunction(5, "promise", null, true, parameter)
    ];

    willCrash = true;
    forceCompletion = false;
    expected = [0];

    yield [name, useAwait, args, parameter, expected, willCrash, forceCompletion];
}

CoreTest.makeExecutorFunction = function (valueToAdd, mode, waitDuration, crash)
{
    if (mode === "async")
    {
        if (typeof waitDuration === "number")
        {
            return async function (param)
            {
                if (crash === true) throw Error("Simulated Crash");

                await $evui.waitAsync(waitDuration);
                param.push(valueToAdd)
            }
        }
        else
        {
            return async function (param)
            {
                if (crash === true) throw Error("Simulated Crash");
                param.push(valueToAdd)
            }
        }
    }
    else if (mode === "promise")
    {
        if (typeof waitDuration === "number")
        {
            return function (param)
            {
                return new Promise(function (resolve)
                {
                    if (crash === true) throw Error("Simulated Crash");

                    setTimeout(function ()
                    {

                        param.push(valueToAdd)
                        resolve();
                    }, waitDuration)
                });
            }
        }
        else
        {
            return function (param)
            {
                return new Promise(function (resolve)
                {
                    if (crash === true) throw Error("Simulated Crash");
                    param.push(valueToAdd)
                    resolve();
                });
            }
        }
    }
    else
    {
        return function (param)
        {
            if (crash === true) throw Error("Simulated Crash");
            param.push(valueToAdd);
        }
    }
}

CoreTest.makeParameterlessExecutorFunction = function (valueToAdd, mode, waitDuration, crash, param)
{
    if (mode === "async")
    {
        if (typeof waitDuration === "number")
        {
            return async function ()
            {
                if (crash === true) throw Error("Simulated Crash");

                await $evui.waitAsync(waitDuration);
                param.push(valueToAdd)
            }
        }
        else
        {
            return async function ()
            {
                if (crash === true) throw Error("Simulated Crash");
                param.push(valueToAdd)
            }
        }
    }
    else if (mode === "promise")
    {
        if (typeof waitDuration === "number")
        {
            return function ()
            {
                return new Promise(function (resolve)
                {
                    if (crash === true) throw Error("Simulated Crash");

                    setTimeout(function ()
                    {
                        param.push(valueToAdd)
                        resolve();
                    }, waitDuration)
                });
            }
        }
        else
        {
            return function ()
            {
                return new Promise(function (resolve)
                {
                    if (crash === true) throw Error("Simulated Crash");
                    param.push(valueToAdd)
                    resolve();
                });
            }
        }
    }
    else
    {
        return function ()
        {
            if (crash === true) throw Error("Simulated Crash");
            param.push(valueToAdd);
        }
    }
}

CoreTest.makeCIOGetValueArgs = function* ()
{
    var sourceObj = null;
    var valuesToGet = null;
    var name = null;

    name = "Exact property matches";
    sourceObj = {
        a: 0,
        Aa: 1,
        AA: 2,
        aA: 3,
        aa: 4,
        b: 5,
        B: 6,
    };

    valuesToGet = {
        a: 0,
        aa: 4,
        b: 5
    };

    yield [name, sourceObj, valuesToGet];

    name = "Case-adjusted property matches";
    sourceObj = {
        Aa: 1,
        AA: 2,
        aA: 3,
        bB: 5,
        Bb: 6,
        BB: 7,
        B: 8
    };

    valuesToGet = {
        aa: 1,
        bb: 5,
        b: 8
    };

    yield [name, sourceObj, valuesToGet];
};

CoreTest.makeCIOSetValueArgs = function* ()
{
    var sourceObj = null;
    var valuesToSet = null;
    var name = null;

    name = "Exact property matches";
    sourceObj = {
        a: 0,
        Aa: 1,
        AA: 2,
        aA: 3,
        aa: 4,
        b: 5,
        B: 6,
    };

    valuesToSet = {
        a: 0,
        aa: 4,
        b: 5
    };

    yield [name, sourceObj, valuesToSet];

    name = "Case-adjusted property matches";
    sourceObj = {
        Aa: 1,
        AA: 2,
        aA: 3,
        bB: 5,
        Bb: 6,
        BB: 7,
        B: 8
    };

    valuesToSet = {
        aa: 1,
        bb: 5,
        b: 8
    };

    yield [name, sourceObj, valuesToSet];
};

CoreTest.makeDeepExtendArgs = function* ()
{
    var source = null;
    var target = null;
    var name = null;
    var result = null;
    var shouldFail = false;

    name = "Simple Merge";
    source = { C: 2 };
    target = { D: 1 };
    result = { C: 2, D: 1 };
    shouldFail = false;

    yield [name, target, source, result, shouldFail];

    name = "Recursive Merge";
    source = {
        C: 2,
        E: {
            A: 3
        }
    };
    target = {
        D: 1,
        E: {
            B: 4
        }
    };

    result = {
        C: 2,
        D: 1,
        E: {
            A: 3,
            B: 4
        }
    };

    yield [name, target, source, result, shouldFail];

    name = "Array Merge - Longer Source";
    source = [0, 1, 3];
    target = [4];
    result = [4, 1, 3];
    shouldFail = false;

    yield [name, source, target, result, shouldFail];

    name = "Array Merge - Longer Target";
    source = [0, 1, 3];
    target = [4, 5, 6, 7];
    result = [4, 5, 6, 7];
    shouldFail = false;

    yield [name, source, target, result, shouldFail];

    name = "Array Merge - Object Array";
    source = [{ A: 1 }];
    target = [{ B: 2 }];
    result = [{ A: 1, B: 2 }];
    shouldFail = false;

    yield [name, source, target, result, shouldFail];

    name = "Recursive Duplicates - Reference Hierarchy Maintained";
    var dupe = { A: "a", C: "c" };
    dupe.B = dupe;

    source = { One: dupe, Two: "2", Three: dupe };
    target = { Four: "4" };

    var resultDupe = { A: "a", C: "c" };
    resultDupe.B = resultDupe;

    result = { One: resultDupe, Two: "2", Three: resultDupe, Four: 4 };
    shouldFail = true;

    yield [name, source, target, result, shouldFail];
};

CoreTest.makeGetVaueArgs = function* ()
{
    var name = null; 
    var source = null;
    var path = null;
    var result = null;

    name = "Simple Get";
    source = { A: 1 };
    path = "A";
    result = 1;

    yield [name, source, path, result];

    name = "Deep Get";
    source = {
        A: 1,
        B: {
            C: 0
        }
    };
    path = "B.C";
    result = 0;

    yield [name, source, path, result];

    name = "Deeper Get";
    source = {
        A: 1,
        B: {
            C: 0,
            D: {
                E: -1
            }
        }
    };
    path = "B.D.E";
    result = -1;

    yield [name, source, path, result];

    name = "Deeper Get - Braket Notation 1";
    source = {
        A: 1,
        B: {
            C: 0,
            D: {
                E: -1
            }
        }
    };
    path = "B[D].E";
    result = -1;

    yield [name, source, path, result];

    name = "Deeper Get - Braket Notation 2";
    source = {
        A: 1,
        B: {
            C: 0,
            D: {
                E: -1
            }
        }
    };
    path = "[B].[D].E";
    result = -1;

    yield [name, source, path, result];

    name = "Deeper Get - Braket Notation 3";
    source = {
        A: 1,
        B: {
            C: 0,
            D: {
                E: -1
            }
        }
    };
    path = "[B].[D][E]";
    result = -1;

    yield [name, source, path, result];

    name = "Deeper Get - Braket Notation 4";
    source = {
        A: 1,
        B: {
            C: 0,
            D: {
                E: -1
            }
        }
    };
    path = "[B].D.E";
    result = -1;

    yield [name, source, path, result];

    name = "Deeper Get - Braket Notation 5";
    source = {
        A: 1,
        B: {
            C: 0,
            D: {
                E: -1
            }
        }
    };
    path = "[B].D[E]";
    result = -1;

    yield [name, source, path, result];
};

CoreTest.makeSetValueArgs = function* ()
{
    var name = null;
    var source = null;
    var path = null;
    var value = null;
    var getter = null;

    name = "Simple Set";
    source = { A: null };
    path = "A";
    value = 1;
    getter = function (obj) { return obj?.A; }

    yield [name, source, path, value, getter];

    name = "Deep Set";
    source = {
        A: 1,
        B: {
            C: "cat"
        }
    };
    path = "B.C";
    value = 0;
    getter = function (obj) { return obj.B.C; }

    yield [name, source, path, value, getter];

    name = "Deeper Set";
    source = {
        A: 1,
        B: {
            C: 0,
            D: {
                E: 5
            }
        }
    };
    path = "B.D.E";
    value = -1;
    getter = function (obj) { return obj.B.D.E; }

    yield [name, source, path, value, getter];

    name = "Deeper Set - Braket Notation 1";
    source = {
        A: 1,
        B: {
            C: 0,
            D: {
                E: 2
            }
        }
    };
    path = "B[D].E";
    value = -1;
    getter = function (obj) { return obj.B.D.E; }

    yield [name, source, path, value, getter];

    name = "Deeper Set - Braket Notation 2";
    source = {
        A: 1,
        B: {
            C: 0,
            D: {
                E: -11
            }
        }
    };
    path = "[B].[D].E";
    value = -1;
    getter = function (obj) { return obj.B.D.E; }

    yield [name, source, path, value, getter];

    name = "Deeper Set - Braket Notation 3";
    source = {
        A: 1,
        B: {
            C: 0,
            D: {
                E: 9
            }
        }
    };
    path = "[B].[D][E]";
    value = -1;
    getter = function (obj) { return obj.B.D.E; }

    yield [name, source, path, value, getter];

    name = "Deeper Set - Braket Notation 4";
    source = {
        A: 1,
        B: {
            C: 0,
            D: {
                E: "element"
            }
        }
    };
    path = "[B].D.E";
    value = -1;
    getter = function (obj) { return obj.B.D.E; }

    yield [name, source, path, value, getter];

    name = "Deeper Set - Braket Notation 5";
    source = {
        A: 1,
        B: {
            C: 0,
            D: {
                E: "F"
            }
        }
    };
    path = "[B].D[E]";
    value = -1;
    getter = function (obj) { return obj.B.D.E; }

    yield [name, source, path, value, getter];
};

CoreTest.makeSetValueArgsAppendGaps = function* ()
{
    var name = null;
    var source = null;
    var path = null;
    var value = null;
    var getter = null;

    name = "Simple Add Object - Null Source";
    source = null,
    path = "A";
    value = 1;
    getter = function (obj) { return obj?.A; }

    yield [name, source, path, value, getter];

    name = "Deep Set";
    source = {
        A: 1,
    };
    path = "B.C";
    value = 0;
    getter = function (obj) { return obj.B?.C; }

    yield [name, source, path, value, getter];

    name = "Deeper Set";
    source = {
        A: 1,
    };
    path = "B.D.E";
    value = -1;
    getter = function (obj) { return obj.B?.D?.E; }

    yield [name, source, path, value, getter];
};

CoreTest.makeGetPathSegmentsArgs = function* ()
{
    var name = null;
    var path = null;
    var result = null;

    name = "No Path";
    path = null;
    result = null;

    yield [name, path, result];

    name = "Empty Path";
    path = "";
    result = [];

    yield [name, path, result];

    name = "Simple Path";
    path = "A";
    result = ["A"]

    yield [name, path, result];

    name = "Simple Path - Brackets First";
    path = "[A]";
    result = ["A"]

    yield [name, path, result];

    name = "Simple Path - In Single-Quotes";
    path = "'A'";
    result = ["A"]

    yield [name, path, result];

    name = "Simple Path - In Double-Quotes";
    path = "\"A\"";
    result = ["A"]

    yield [name, path, result];

    name = "Simple Path - In Graves";
    path = "`A`";
    result = ["A"]

    yield [name, path, result];

    name = "Simple Path - In Single-Quotes";
    path = "'A'";
    result = ["A"]

    yield [name, path, result];

    name = "Simple Path - Dot First";
    path = ".A";
    result = ["A"]

    yield [name, path, result];

    name = "Simple Path - Null Chain Dot";
    path = "?.A";
    result = ["A"]

    yield [name, path, result];

    name = "Simple Path - Null Chain Brackets";
    path = "?[A]";
    result = ["A"]

    yield [name, path, result];

    name = "Deep Path";
    path = "A.B.C";
    result = ["A", "B", "C"]

    yield [name, path, result];

    name = "Deep Path - Brckets First";
    path = "[A].B.C";
    result = ["A", "B", "C"]

    yield [name, path, result];

    name = "Deep Path - With Literals";
    path = "[A].'B.123'.C";
    result = ["A", "B.123", "C"]

    yield [name, path, result];

    name = "Deep Path - With Literals - 2";
    path = "[A].`[B.12[3]`.C";
    result = ["A", "[B.12[3]", "C"]

    yield [name, path, result];

    name = "Deep Path - With Literals - 3";
    path = "[A].`[B.12[3]`.\"\\\"C\"";
    result = ["A", "[B.12[3]", "\\\"C"]

    yield [name, path, result];
};

CoreTest.makeGetElementAttributesArgs = function* ()
{
    var name = null;
    var attrs = null;

    name = "No Attributes";
    attrs = {};

    yield [name, attrs];

    name = "Single Attribute";
    attrs = { "a": "1" };

    yield [name, attrs];

    name = "Multiple Attributes";
    attrs = { "a": "1", B: "c", Dd: "123" };

    yield [name, attrs];
};

CoreTest.makeStringIsValidArgs = function* ()
{
    var isValid = false;
    var name = null;
    var str = null;

    name = "Null String";
    isValid = false;
    str = null;

    yield [name, str, isValid];

    name = "Not a String - Number"
    isValid = false;
    str = 123.456;

    yield [name, str, isValid];

    name = "Not a String - Object"
    isValid = false;
    str = {a: 123};

    yield [name, str, isValid];

    name = "Not a String - Function"
    isValid = false;
    str = function () { return "abc"};

    yield [name, str, isValid];

    name = "Not a String - Symbol"
    isValid = false;
    str = Symbol("abc");

    yield [name, str, isValid];

    name = "Empty String"
    isValid = false;
    str = "";

    yield [name, str, isValid];

    name = "Single Space"
    isValid = false;
    str = " ";

    yield [name, str, isValid];

    name = "Newline"
    isValid = false;
    str = "\r\n";

    yield [name, str, isValid];

    name = "Tab"
    isValid = false;
    str = "\t";

    yield [name, str, isValid];

    name = "Whitespace Mix"
    isValid = false;
    str = "  \t\r\n   \t";

    yield [name, str, isValid];

    name = "Valid - no whitespace"
    isValid = true;
    str = "abc";

    yield [name, str, isValid];

    name = "Valid - leading whitespace"
    isValid = true;
    str = " abc";

    yield [name, str, isValid];

    name = "Valid - trailing whitespace"
    isValid = true;
    str = "abc ";

    yield [name, str, isValid];

    name = "Valid - leading and trailing whitespace"
    isValid = true;
    str = " abc ";

    yield [name, str, isValid];
};

CoreTest.getFlagArgs = function* ()
{
    var name = null;
    var flagSet = null;
    var flag = null;
    var action = null;
    var result = null;

    name = "Add flag to Zero";
    flagSet = CoreTest.FlagSet.None;
    flag = CoreTest.FlagSet.FirstFlag;
    action = CoreTest.FlagAction.AddFlag;
    result = CoreTest.FlagSet.FirstFlag;

    yield [name, flag, flagSet, action, result];

    name = "Add flag to Itself";
    flagSet = CoreTest.FlagSet.FirstFlag;
    flag = CoreTest.FlagSet.FirstFlag;
    action = CoreTest.FlagAction.AddFlag;
    result = CoreTest.FlagSet.FirstFlag;

    yield [name, flag, flagSet, action, result];

    name = "Add flag to Another Flag";
    flagSet = CoreTest.FlagSet.SecondFlag;
    flag = CoreTest.FlagSet.FirstFlag;
    action = CoreTest.FlagAction.AddFlag;
    result = CoreTest.FlagSet.FirstFlag | CoreTest.FlagSet.SecondFlag

    yield [name, flag, flagSet, action, result];

    name = "Remove flag from Zero";
    flagSet = CoreTest.FlagSet.None;
    flag = CoreTest.FlagSet.FirstFlag;
    action = CoreTest.FlagAction.RemoveFlag;
    result = CoreTest.FlagSet.None;

    yield [name, flag, flagSet, action, result]

    name = "Remove flag from Itself";
    flagSet = CoreTest.FlagSet.SecondFlag;
    flag = CoreTest.FlagSet.SecondFlag;
    action = CoreTest.FlagAction.RemoveFlag;
    result = CoreTest.FlagSet.None;

    yield [name, flag, flagSet, action, result]

    name = "Remove flag from Another Flag";
    flagSet = CoreTest.FlagSet.SecondFlag | CoreTest.FlagSet.ThirdFlag;
    flag = CoreTest.FlagSet.SecondFlag;
    action = CoreTest.FlagAction.RemoveFlag;
    result = CoreTest.FlagSet.ThirdFlag;

    yield [name, flag, flagSet, action, result]

    name = "HasFlag from Zero";
    flagSet = CoreTest.FlagSet.None;
    flag = CoreTest.FlagSet.SecondFlag;
    action = CoreTest.FlagAction.HasFlag;
    result = false;

    yield [name, flag, flagSet, action, result]

    name = "HasFlag from Itself";
    flagSet = CoreTest.FlagSet.ThirdFlag;
    flag = CoreTest.FlagSet.ThirdFlag;
    action = CoreTest.FlagAction.HasFlag;
    result = true;

    yield [name, flag, flagSet, action, result]

    name = "HasFlag From Set Without Flag";
    flagSet = CoreTest.FlagSet.ThirdFlag | CoreTest.FlagSet.FourthFlag;
    flag = CoreTest.FlagSet.FirstFlag;
    action = CoreTest.FlagAction.HasFlag;
    result = false;

    yield [name, flag, flagSet, action, result]

    name = "HasFlag From Set With Flag";
    flagSet = CoreTest.FlagSet.ThirdFlag | CoreTest.FlagSet.FourthFlag;
    flag = CoreTest.FlagSet.ThirdFlag;
    action = CoreTest.FlagAction.HasFlag;
    result = true;

    yield [name, flag, flagSet, action, result]
};

CoreTest.FlagAction =
{
    None: "none",
    HasFlag: "hasFlag",
    AddFlag: "addFlag",
    RemoveFlag: "removeFlag"
};

CoreTest.FlagSet =
{
    None: 0,
    FirstFlag: 1,
    SecondFlag: 2,
    ThirdFlag: 4,
    FourthFlag: 8
};
