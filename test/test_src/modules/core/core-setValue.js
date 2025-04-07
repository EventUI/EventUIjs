$evui.testAsync({
    name: "Set Value at Path",
    testArgs: CoreTest.makeSetValueArgs,
    test: function (hostArgs, name, source, path, value, getter)
    {
        hostArgs.outputWriter.logDebug(name);

        var originalValue = getter(source);

        hostArgs.outputWriter.logInfo(`Replacing ${originalValue} with ${value} at path ${path}`);

        $evui.assert(originalValue).isNot(value);

        $evui.set(path, source, value);
        var newValue = getter(source);

        $evui.assert(value).isEquivalentTo(newValue);
    }
});

$evui.testAsync({
    name: "Set Value at Path with Missing Objects",
    testArgs: CoreTest.makeSetValueArgsAppendGaps,
    test: function (hostArgs, name, target, path, value, getter)
    {
        hostArgs.outputWriter.logDebug(name);
        if (target == null) hostArgs.options.shouldFail = true;

        var originalValue = getter(target);

        hostArgs.outputWriter.logInfo(`Replacing ${originalValue} with ${value} at path ${path}`);

        $evui.assert(originalValue).isNot(value);

        $evui.set(path, target, value, true);
        var newValue = getter(target);

        $evui.assert(value).isEquivalentTo(newValue);
    }
});