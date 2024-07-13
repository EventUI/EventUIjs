$evui.testAsync({
    name: "String Is Valid",
    testArgs: CoreTest.makeStringIsValidArgs,
    test: function (hostArgs, name, str, isValid)
    {
        hostArgs.outputWriter.logDebug(name);
        var testIsValid = $evui.isStringValid(str);

        $evui.assert(isValid).is(testIsValid);
    }
})