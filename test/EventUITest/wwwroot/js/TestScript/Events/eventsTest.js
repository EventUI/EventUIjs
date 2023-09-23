$evui.init(function ()
{
    var singleTestButton = document.getElementById("single");
    var multipleTestButton = document.getElementById("multiple");
    var askTestButton = document.getElementById("ask");
    var onceTest = document.getElementById("once");

    var textOutput = document.getElementById("textOutput");

    var appendText = function (text, clear)
    {
        if (clear === true)
        {
            textOutput.innerText = "";
        }

        textOutput.innerText += text + "\n";
    }


    $evui.once("onceTest", function (args)
    {
        appendText("Once " + args.currentStep);
    });

    $evui.once("onceTest", async function (args)
    {
        appendText("Once2 " + args.currentStep);

        appendText("Waiting 1 second asynchronously");
        await $evui.waitAsync(1000);

        appendText("Waiting 1 second using pause");
        args.pause();
        setTimeout(function ()
        {
            args.resume();
            appendText("Resuming...");
        }, 1000);
    });

    $evui.on("onceTest", function (args)
    {
        appendText("Once3, but always.");
    });

    $evui.on({
        eventName: "single",
        handler: function (args)
        {
            appendText("Single event.");
        },
        handlerName: "singleEvent",
    });

    $evui.on({
        eventName: "single",
        handler: async function (args)
        {
            appendText("Single event with higher priority");
        },
        priority: 2
    });

    $evui.on("multiple", function (args)
    {
        appendText("multiple1:" + args.data);
    });

    $evui.on("multiple", function (args)
    {
        appendText("multiple2:" + args.data);
    });

    $evui.on("multiple", function (args)
    {
        appendText("multiple3:" + args.data);
    });

    $evui.on("ask", function (args)
    {
        appendText("asking 1");
        return "ask1";
    });

    $evui.on("ask", async function (args)
    {
        appendText("asking 2");

        appendText("Waiting 1 second asynchronously");
        await $evui.waitAsync(1000);

        return "ask2"
    });

    $evui.on("ask", function (args)
    {
        appendText("asking 3");

        args.pause();
        setTimeout(function ()
        {
            args.resume("ask3");
            appendText("Resuming...");
        }, 1000);

        return "dont ask me";
    });

    $evui.on("ask", function (args)
    {
        appendText("askError");
        throw Error("Test error.");
    });

    onceTest.onclick = function ()
    {
        $evui.trigger("onceTest");
    }

    singleTestButton.onclick = async function ()
    {
        $evui.trigger("single", { asdf: 123 }, "onceTest");
    };

    multipleTestButton.onclick = function ()
    {
        for (var x = 0; x < 25; x++)
        {
            $evui.trigger({
                eventName: "multiple",
                triggerName: x.toString(),
                data: x
            });
        }
    };

    askTestButton.onclick = async function ()
    {
        $evui.ask("ask", null, null, async function (result)
        {
            await $evui.waitAsync(1000);

            var values = result.map(function (r) { return r.response });
            appendText(JSON.stringify(values));
        });
    }
});