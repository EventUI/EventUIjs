/*#TEST_File("TestHost_Basic_UnAwaited")#*/

/*#TEST_START("Un-awaited Sequence Test")#*/
(function()
{
    var now = performance.now();
    var test1 = { testNumber: 1, doneAt: -1 };
    var test2 = { testNumber: 2, doneAt: -1 };
    var test3 = { testNumber: 3, doneAt: -1 };

    $evui.testAsync("un-awaited 1", function (pass, fail)
    {
        test1.doneAt = performance.now();
        $evui.testHost.writeOutput("Test 1 complete:" + test1Done);

        pass();
    });

    $evui.testAsync("un-awaited 2", function (pass, fail)
    {
        test2.doneAt= performance.now();
        $evui.testHost.writeOutput("Test 2 complete:" + test2Done);

        pass();
    });

    $evui.testAsync("un-awaited 3", function (pass, fail)
    {
        test3.doneAt = performance.now();
        $evui.testHost.writeOutput("Test 3 complete:" + test3Done);

        pass();
    });

    var checkResults = function ()
    {
        if (test1Done === -1 || test2Done === -1 || test3Done === -1)
        {
            if (performance.now() - now < 1)
            {
                return setTimeout(checkResults);
            }
            else
            {
                if (test1Done === -1)
                {
                    $evui.testHost.writeOutput("Test 1 never completed.");
                }

                if (test2Done === -1)
                {
                    $evui.testHost.writeOutput("Test 2 never completed.");
                }

                if (test3Done === -1)
                {
                    $evui.testHost.writeOutput("Test 3 never completed.");
                }
            }
        }
    };
})();