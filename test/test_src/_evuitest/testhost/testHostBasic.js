/*#TEST_FILE("TestHost_Basic_Awaited")#*/

/*#TEST_START("Passing test")#*/
await $evui.testHost.runAsync({
    name: "Basic test: passing",
    test: function (testArgs)
    {
        $evui.testHost.writeOutput("passing");
        testArgs.pass();
    }
});

/*#TEST_START("Timeout test")#*/
await $evui.testHost.runAsync({
    name: "Basic test: timeout",
    test: function (testArgs)
    {
        $evui.testHost.writeOutput("timing out");
    },
    options: {
        shouldFail: true,
        implicitSuccess: false
    }
});

/*#TEST_START("Failing test")#*/
await $evui.testHost.runAsync({
    name: "Basic test: manual fail",
    test: function (testArgs)
    {
        testArgs.outputWriter.writeOutput("failing");
        testArgs.fail("manual", true);
    }
});

/*#TEST_START("Multiple parameters passing")#*/
await $evui.testAsync({
    name: "Basic test: multiple parameters passing",
    testArgs: [1, 2, 3],
    test: function (testArgs, number)
    {
        if (typeof number !== "number") testArgs.fail("No parameter provided.")
        testArgs.outputWriter.writeOutput("Parameter: " + number);
        testArgs.pass();
    }
});

/*#TEST_START("Multiple parameters timing out")#*/
await $evui.testAsync({
    name: "Basic test: multiple parameters timeout",
    testArgs: [1, 2, 3],
    test: function (testArgs, number)
    {
        if (typeof number !== "number") testArgs.fail("No parameter provided.")
        testArgs.outputWriter.writeOutput("Parameter: " + number);
    },
    options: {
        shouldFail: true,
        implicitSuccess: false
    }
});

/*#TEST_START("Multiple parameters failing")#*/
await $evui.testAsync({
    name: "Basic test: multiple parameters failing",
    testArgs: [1, 2, 3],
    test: function (testArgs, number)
    {
        if (typeof number !== "number") testArgs.fail("No parameter provided.")
        testArgs.outputWriter.writeOutput("Parameter: " + number);
        testArgs.fail("manual", true);
    }
});

/*#TEST_START("Multiple parameters selective fail.")#*/
await $evui.testAsync({
    name: "Basic test: fail conditionally",
    testArgs: [1, 2, 3, 4],
    test: function (testArgs, number)
    {
        if (typeof number !== "number") testArgs.fail("No parameter provided.")
        testArgs.outputWriter.writeOutput("Parameter: " + number);
        if (number % 2 === 0)
        {
            testArgs.pass();
        }
        else
        {
            testArgs.fail(number + " is not divisible by 2.", true);
        }
    }
});