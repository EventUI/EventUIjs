$evui.testAsync({
    name: "Get Property Name Array from Path",
    testArgs: CoreTest.makeGetPathSegmentsArgs,
    test: function (hostArgs, name, path, result)
    {
        hostArgs.outputWriter.logDebug(name);
        if (path == null) hostArgs.options.shouldFail = true;

        var segments = $evui.getPathSegments(path);

        $evui.assert(segments).isEquivalentTo(result);
    }
});