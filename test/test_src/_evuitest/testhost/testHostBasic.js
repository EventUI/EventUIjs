/*#TEST_FILE("TestHost_Basic_Awaited")#*/

/*#TEST_START("Passing test")#*/
await $evui.testHost.runAsync({
    name: "Basic test: passing",
    test: function (pass, fail)
    {
        $evui.testHost.writeOutput("passing");
        pass();
    }
});

/*#TEST_START("Timeout test")#*/
await $evui.testHost.runAsync({
    name: "Basic test: timeout",
    test: function (pass, fail)
    {
        $evui.testHost.writeOutput("timing out");
    }
});

/*#TEST_START("Failing test")#*/
await $evui.testHost.runAsync({
    name: "Basic test: manual fail",
    test: function (pass, fail)
    {
        $evui.testHost.writeOutput("failing");
        fail("manual");
    }
});

/*#TEST_START("Multiple parameters passing")#*/
await $evui.testAsync({
    name: "Basic test: multiple parameters passing",
    testArgs: [1, 2, 3],
    test: function (pass, fail, number)
    {
        if (typeof number !== "number") fail("No parameter provided.")
        $evui.testHost.writeOutput("Parameter: " + number);
        pass();
    }
});

/*#TEST_START("Multiple parameters timing out")#*/
await $evui.testAsync({
    name: "Basic test: multiple parameters timeout",
    testArgs: [1, 2, 3],
    test: function (pass, fail, number)
    {
        if (typeof number !== "number") fail("No parameter provided.")
        $evui.testHost.writeOutput("Parameter: " + number);
    }
});

/*#TEST_START("Multiple parameters failing")#*/
await $evui.testAsync({
    name: "Basic test: multiple parameters failing",
    testArgs: [1, 2, 3],
    test: function (pass, fail, number)
    {
        if (typeof number !== "number") fail("No parameter provided.")
        $evui.testHost.writeOutput("Parameter: " + number);
        fail("manual");
    }
});

/*#TEST_START("Multiple parameters selective fail.")#*/
await $evui.testAsync({
    name: "Basic test: fail conditionally",
    testArgs: [1, 2, 3, 4],
    test: function (pass, fail, number)
    {
        if (typeof number !== "number") fail("No parameter provided.")
        $evui.testHost.writeOutput("Parameter: " + number);
        if (number % 2 === 0)
        {
            pass();
        }
        else
        {
            fail(number + " is not divisible by 2.");
        }
    }
});