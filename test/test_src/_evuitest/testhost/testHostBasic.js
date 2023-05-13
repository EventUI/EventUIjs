await $evui.testHost.runAsync({
    name: "basic test",
    test: function (pass, fail)
    {
        $evui.testHost.writeOutput("passing");
        pass();
    }
});

await $evui.testHost.runAsync({
    name: "basic test",
    test: function (pass, fail)
    {
        $evui.testHost.writeOutput("timing out");
    }
});

await $evui.testHost.runAsync({
    name: "basic test",
    test: function (pass, fail)
    {
        $evui.testHost.writeOutput("failing");
        fail("manual");
    }
});

