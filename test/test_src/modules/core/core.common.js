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