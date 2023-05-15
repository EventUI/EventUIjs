/*#TEST_FILE("TestHost_Basic_Awaited")#*/

/*#TEST_START("Passing test.")#*/
await $evui.testHost.runAsync({
    name: "basic test",
    test: function (pass, fail)
    {
        $evui.testHost.writeOutput("passing");
        pass();
    }
});

/*#TEST_START("Timeout Test")#*/
await $evui.testHost.runAsync({
    name: "basic test",
    test: function (pass, fail)
    {
        $evui.testHost.writeOutput("timing out");
    }
});

/*#TEST_START("Failing test.")#*/
await $evui.testHost.runAsync({
    name: "basic test",
    test: function (pass, fail)
    {
        $evui.testHost.writeOutput("failing");
        fail("manual");
    }
});