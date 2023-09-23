$evui.init(function ()
{
    EVUI.Modules.Assertions.Settings.logOnSuccess = false;

    var testRunner = EVUITest.TestRunnerFactory.createTestRunner("basic tests");
    var firstTest = testRunner.addTest({
        name: "first test",
        test: function (testArgs, a)
        {
            $evui.assert("1").equals(a);
            testArgs.pass();
        }
    });

    firstTest.args.addArgs("1", "testing one");
    firstTest.args.addArgs("2", "testing two");

    var secondTest = testRunner.addTest({
        name: "async callback Test",
        args: [[true], [false]],
        test: function (testArgs, boolean)
        {
            setTimeout(function ()
            {
                if (boolean === false)
                {
                    //testArgs.fail("param was false.");
                }

                testArgs.pass();
            });
        }
    });

    var thirdTest = testRunner.addTest({
        name: "await test",
        args: [[true], [false]],
        test: async function (testArgs, boolean)
        {
            await $evui.waitAsync((boolean === true) ? 0 : 250);
            testArgs.pass();
        }
    });

    secondTest.run(function (results)
    {
        $evui.log("second");
        $evui.log(results);
    });

    thirdTest.run(function (results)
    {
        $evui.log("thrid");
        $evui.log(results);
    });

    firstTest.run(function (results)
    {
        $evui.log("first");
        $evui.log(results);
    });
});