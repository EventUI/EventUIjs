$evui.testAsync({
    name: "Get Value from Path",
    testArgs: CoreTest.makeGetVaueArgs,
    test: function (hostArgs, name, source, path, result)
    {
        hostArgs.outputWriter.logDebug(name);
        var getResult = $evui.get(path, source);

        $evui.assert(getResult).isEquivalentTo(result);
    }
});