/*#TEST_File("TestHost_Basic_UnAwaited")#*/

/*#TEST_START("Un-awaited Sequence Test")#*/
(function()
{
    var now = Date.now();
    var test1 = { testNumber: 1, doneAt: -1 };
    var test2 = { testNumber: 2, doneAt: -1 };
    var test3 = { testNumber: 3, doneAt: -1 };

    $evui.testAsync("un-awaited 1", function (pass, fail)
    {
        test1.doneAt = Date.now();
        $evui.testHost.writeOutput("Test 1 complete:" + test1.doneAt);

        pass();
    });

    $evui.testAsync("un-awaited 2", function (pass, fail)
    {
        test2.doneAt = Date.now();
        $evui.testHost.writeOutput("Test 2 complete:" + test2.doneAt);

        pass();
    });

    $evui.testAsync("un-awaited 3", function (pass, fail)
    {
        test3.doneAt = Date.now();
        $evui.testHost.writeOutput("Test 3 complete:" + test3.doneAt);

        pass();
    });

    var checkResults = function ()
    {
        if (test1.doneAt === -1 || test2.doneAt === -1 || test3.doneAt === -1)
        {
            if (Date.now() - now < 10000)
            {
                return setTimeout(checkResults);
            }
            else
            {
                if (test1.doneAt === -1)
                {
                    throw Error("Test 1 never completed.");
                }

                if (test2.doneAt === -1)
                {
                    throw Error("Test 2 never completed.");
                }

                if (test3.doneAt === -1)
                {
                    throw Error("Test 3 never completed.");
                }

                return;
            }
        }

        var allDone = [test1, test2, test3].sort(function (a, b) { return a.doneAt - b.doneAt });

        if (allDone[0] !== test1 || allDone[1] !== test2 || allDone[2] !== test3)
        {
            throw Error("Tests completed out of order: " + JSON.stringify(allDone));
        }
        else
        {
            $evui.testHost.writeOutput("Un-awaited sequence test completed in the correct order.");
        }
    };

    checkResults();
})();