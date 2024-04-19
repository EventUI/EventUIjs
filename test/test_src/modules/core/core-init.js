$evui.testAsync({
    name: "Basic Initialize",
    test: async function (args)
    {
        var went = false;
        $evui.init(function ()
        {
            went = true;
        });

        var now = Date.now();
        while (went === false)
        {
            await $evui.waitAsync(50);
            if (went === false && Date.now() - now > 1000)
            {
                args.fail("Init function never executed.")
            }
        }
    }
});


$evui.testAsync({
    name: "Multiple Initialize - Synchronous",
    test: async function ()
    {
        var went = [];

        $evui.init(function ()
        {
            went.push(0)
        });

        if (went.length > 0) throw Error("Init didn't wait after being invoked.");
        $evui.init(function ()
        {
            went.push(1)
        });

        if (went.length > 0) throw Error("Init didn't wait after being invoked.");
        $evui.init(function ()
        {
            went.push(2)
        });

        if (went.length > 0) throw Error("Init didn't wait after being invoked.");

        var now = Date.now();
        while (went.length < 3)
        {
            await $evui.waitAsync(50);
            if (went.length < 3 && Date.now() - now > 1000)
            {
                args.fail("Init function never executed.")
            }
        }

        $evui.assert(went).isEquivalentTo([0, 1, 2]);
    }
});

$evui.testAsync({
    name: "Multiple Initialize - Asynchronous",
    options:
    {
        timeout: 1000
    },
    test: async function (args)
    {
        var went = [];

        $evui.init(async function ()
        {
            await $evui.waitAsync(90);
            went.push(0)
        });


        if (went.length > 0) throw Error("Init didn't wait after being invoked.");
        $evui.init(function ()
        {
            return new Promise(function (resolve)
            {
                setTimeout(function ()
                {                    
                    went.push(1)
                    resolve();
                }, 50);
            });
        });

        if (went.length > 0) throw Error("Init didn't wait after being invoked.");
        $evui.init(async function ()
        {
            await $evui.waitAsync(10);
            went.push(2)
        });

        if (went.length > 0) throw Error("Init didn't wait after being invoked.");

        var now = Date.now();
        while (went.length < 3)
        {
            await $evui.waitAsync(50);
            if (went.length < 3 && Date.now() - now > 1000)
            {
                args.fail("Init function never executed.")
            }
        }

        $evui.assert(went).isEquivalentTo([0, 1, 2]);
    }
});

$evui.testAsync({
    name: "Multiple Initialize - Sync/Async Mix",
    options:
    {
        timeout: 1000
    },
    test: async function (args)
    {
        var went = [];

        $evui.init(async function ()
        {
            await $evui.waitAsync(90);
            went.push(0)
        });


        if (went.length > 0) throw Error("Init didn't wait after being invoked.");
        $evui.init(function ()
        {
            return new Promise(function (resolve)
            {
                setTimeout(function ()
                {
                    went.push(1)
                    resolve();
                }, 50);
            });
        });

        if (went.length > 0) throw Error("Init didn't wait after being invoked.");
        $evui.init(function ()
        {
            went.push(2)
        });

        if (went.length > 0) throw Error("Init didn't wait after being invoked.");

        var now = Date.now();
        while (went.length < 3)
        {
            await $evui.waitAsync(50);
            if (went.length < 3 && Date.now() - now > 1000)
            {
                args.fail("Init function never executed.")
            }
        }

        $evui.assert(went).isEquivalentTo([0, 1, 2]);
    }
});

$evui.testAsync({
    name: "Multiple Initialize - Awiated Sync/Async Mix",
    options:
    {
        timeout: 1000
    },
    test: async function (args)
    {
        var went = [];

        await $evui.init(async function ()
        {
            await $evui.waitAsync(90);
            went.push(0)
        });

        $evui.assert(went).isEquivalentTo([0]);
        await $evui.init(function ()
        {
            return new Promise(function (resolve)
            {
                setTimeout(function ()
                {
                    went.push(1)
                    resolve();
                }, 50);
            });
        });

        $evui.assert(went).isEquivalentTo([0, 1]);
        await $evui.init(function ()
        {
            went.push(2)
        });

        $evui.assert(went).isEquivalentTo([0, 1, 2]);
    }
});