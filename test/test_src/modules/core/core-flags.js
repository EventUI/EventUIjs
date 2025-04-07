$evui.testAsync({
    name: "Get/Set/Has Flag Tests",
    testArgs: CoreTest.getFlagArgs,
    test: function (hostArgs, name, flag, flagSet, action, result)
    {
        hostArgs.outputWriter.logDebug(name);

        var opResult = null;

        if (action == CoreTest.FlagAction.AddFlag)
        {
            opResult = $evui.addFlag(flagSet, flag);
        }
        else if (action == CoreTest.FlagAction.RemoveFlag)
        {
            opResult = $evui.removeFlag(flagSet, flag);
        }
        else if (action == CoreTest.FlagAction.HasFlag)
        {
            opResult = $evui.hasFlag(flagSet, flag);
        }
        else
        {
            throw Error("Invalid action - must be a value from CoreTest.FlagAction enum")
        }

        $evui.assert(result).is(opResult);
    }
})