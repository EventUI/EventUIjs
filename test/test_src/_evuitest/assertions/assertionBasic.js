$evui.testHost.runAsync(function (testArgs)
{
    $evui.assert("1").doesNotEqual("2");
    testArgs.pass(); //will never be hit, the assertion above will blow up
});