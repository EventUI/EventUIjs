$evui.testHost.runAsync(function (pass, fail)
{
    $evui.assert("1").doesNotEqual("2");
    pass(); //will never be hit, the assertion above will blow up
});