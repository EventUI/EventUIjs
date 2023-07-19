# EventUI

EventUI is a JavaScript library for creating arbitrary UI components with event lifecycles.

## Summary

The central problem that EventUI tries to address is the asynchronous nature of modern JavaScript in a browser environment's native eventing system. The fundamental problem is that the event driven nature of the DOM was never built to handle modern requirements for asynchronous applications - eventually functionality was added to greatly facilitate asynchronous logic (i.e. async/await and Promises), but some of the core elements of the DOM don't work gracefully with these modern constructs - namely event listeners. Consider the following code:

    var waitAsync = function (waitDuration)
    {
        return new Promise(function (resolve)
        {
            setTimeout(function ()
            {
                resolve();
            }, waitDuration)
        });
    };

    addEventListener("click", async function ()
    {
        console.log("Handler 1 firing!");

        var waitDuration = Math.random() * 100;
        await waitAsync(waitDuration);

        console.log("Handler 1 finished!");
    });

    addEventListener("click", async function ()
    {
        console.log("Handler 2 firing!");

        var waitDuration = Math.random() * 100;
        await waitAsync(waitDuration);

        console.log("Handler 2 finished!");
    });

    addEventListener("click", async function ()
    {
        console.log("Handler 3 firing!");

        var waitDuration = Math.random() * 100;
        await waitAsync(waitDuration);

        console.log("Handler 3 finished!");
    });

The way the DOM's event bubbling logic works will ensure that these functions fire in order of addition, but are not awaited. This means that these handlers will race each other and the order of completion is random: copy-paste this code into a browser tab, click a few times, and go look at the console. The order of completion isn't the same every time. This creates uncertainty, and uncertainty is **bad**.

The more realistic scenario where this occurs (and can cause major problems) is when multiple programmers are adding features to an application that use asynchronous logic and respond to the same event: multiple parts of an application are now racing each other, and should any part of the application depend on a certain order of completion, bugs will inevitably arise as things change over time. Fixing such bugs is rather nightmarish as they are hard to reproduce, sometimes change between development environments, and are influenced by changes to other parts of the application's "ecosystem", i.e. a performance improvement on the server can cause a race condition related bug in the client to pop up.

Now, consider EventUI's extension to the EventTarget interface to include support for asynchronous events:

    var waitAsync = function (waitDuration)
    {
        return new Promise(function (resolve)
        {
            setTimeout(function ()
            {
                resolve();
            }, waitDuration)
        });
    };

    addAsyncEventListener("click", async function ()
    {
        console.log("Handler 1 firing!");

        var waitDuration = Math.random() * 100;
        await waitAsync(waitDuration);

        console.log("Handler 1 finished!");
    });

    addAsyncEventListener("click", async function ()
    {
        console.log("Handler 2 firing!");

        var waitDuration = Math.random() * 100;
        await waitAsync(waitDuration);

        console.log("Handler 2 finished!");
    });

    addAsyncEventListener("click", async function ()
    {
        console.log("Handler 3 firing!");

        var waitDuration = Math.random() * 100;
        await waitAsync(waitDuration);

        console.log("Handler 3 finished!");
    });

This code, if executed with the correct EventUI loaded on the page, yields the same result every time: each handler fires in order after the previous handler's function's Promise has been resolved. This effectively allows for 