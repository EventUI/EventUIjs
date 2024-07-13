$evui.testAsync({
    name: "AsyncSequenceExecutor",
    testArgs: CoreTest.makeAsyncExecutorArgs,
    options: {
        timeout: 1000
    },
    test: async function (hostArgs, name, useAwait, args, parameter, expected, willCrash, forceCompletion)
    {
        hostArgs.outputWriter.logDebug(name);

        var exeResult = null;
        if (useAwait === true)
        {
            exeResult = await $evui.executeSequenceAsync(args);

        }
        else
        {
            exeResult = await new Promise(function (resolve)
            {
                $evui.executeSequence(args, function (errors)
                {
                    resolve(errors);
                });
            });
        }

        $evui.assert(parameter).isEquivalentTo(expected);

        if (willCrash === true)
        {
            $evui.assert(exeResult.length).isTrue(function (val) { return val > 0 });
        }
    }
});